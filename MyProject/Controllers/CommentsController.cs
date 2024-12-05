using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using MyProject.Models;
using MyProject.Services;
using MyProject.Decorators;
using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;

namespace MyProject.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CommentsController : ControllerBase
    {
        private readonly CommentsService _commentsService;
        private readonly UsersService _userService;
        private readonly BooksService _bookService;
        private readonly AppDbContext _context;
        public CommentsController(CommentsService commentsService, UsersService userService, BooksService bookService, AppDbContext context)
        {
            _context = context;
            _commentsService = commentsService;
            _userService = userService;
            _bookService = bookService;
        }


        [HttpGet("user/{userId}/comments")]
        public async Task<IActionResult> GetCommentsByUser(Guid userId)
        {
            // Kullanıcıyı kontrol et
            var user = await _userService.GetUserByIdAsync(userId);
            if (user == null)
            {
                return NotFound("Kullanıcı bulunamadı.");
            }

            // Kullanıcıya ait tüm yorumları al
            var comments = await _commentsService.GetCommentsByUserIdAsync(userId);
            if (comments == null || comments.Count == 0)
            {
                return NotFound("Kullanıcının hiç yorumu yok.");
            }

            // Her yoruma ait kitabı getir
            //select ile birden fazla işlem yapılabilir birden fazla yorumu var ise her bir BookId göre select çalışacak.
            var commentDetails = comments.Select(async comment =>
            {
                var book = await _bookService.GetAsync(comment.BookId);
                return new
                {
                    CommentId = comment.Id,
                    CommentText = comment.Text,
                    BookId = book?.Id,
                    Approved=comment.IsApproved,
                    BookName = book?.BookName,
                    BookAuthor = book?.Author,
                    BookCategory = book?.Category
                };
            }).ToList();
            //async şekl,nde çalıştığı için bu şekilde yapılıyor
            var resolvedCommentDetails = await Task.WhenAll(commentDetails);

            return Ok(resolvedCommentDetails);
        }
        [HttpGet("user/comments")]
        public async Task<IActionResult> GetUserComments()
        {
            //JWT içinden userId'yi alıyoruz
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(userIdClaim))
            {
                return Unauthorized("Kullanıcı kimliği doğrulanamadı.");
            }

            //UserId'yi Guid'e dönüştürme
            var userId = Guid.Parse(userIdClaim);

            //Kullanıcının yorumlarını almak için Comment tablosunda sorgu
            var userComments = await _context.Comments
                .Where(c => c.UserId == userId) // Kullanıcının ID'siyle eşleşen yorumlar
                .Include(c => c.Book)  //Kitap bilgilerini dahil et
                .ToListAsync();

            //Eğer yorum yoksa
            if (userComments.Count == 0)
            {
                return NotFound("Kullanıcının hiç yorumu yok.");
            }

            //Yorumları geri döndürüyoruz
            var commentDetails = userComments.Select(comment => new
            {
                CommentId = comment.Id,
                CommentText = comment.Text,
                BookId = comment.BookId,
                Approved=comment.IsApproved,
                BookName = comment.Book.BookName,
                BookAuthor = comment.Book.Author,
                BookCategory = comment.Book.Category
            });

            return Ok(commentDetails);
        }
        [HttpPost("books/{bookId}/comments")]  //bookId'yi URL'den alıyoruz
        [Authorize]
        public async Task<IActionResult> AddComment(Guid bookId, [FromBody] Comment comment)
        {
            var autHeader = Request.Headers.Authorization.ToString();
            if (string.IsNullOrEmpty(autHeader) || !autHeader.StartsWith("Bearer "))
            {
                return Unauthorized("Geçersiz veya eksik yetki bilgisi");
            }
            var token = autHeader.Split(' ')[1];

            var handler = new JwtSecurityTokenHandler();
            var jwtToken = handler.ReadJwtToken(token);

            var userId = jwtToken.Claims.FirstOrDefault(c => c.Type == "nameid")?.Value;
            if (comment == null)
            {
                return BadRequest("Yorum verisi geçersiz.");
            }

            // Kullanıcının kimliğini JWT üzerinden alıyoruz


            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized("Kullanıcı doğrulaması yapılmadı.");
            }

            if (!Guid.TryParse(userId, out Guid GuiduserId))
            {
                return BadRequest("Geçersiz kullanıcı kimliği.");
            }

            // Kullanıcının mevcut olduğunun doğrulanması
            var user = await _userService.GetUserByIdAsync(GuiduserId);
            if (user == null)
            {
                return NotFound("Kullanıcı bulunamadı.");
            }

            // Kitap ID kontrolü
            var book = await _bookService.GetAsync(bookId);
            if (book == null)
            {
                return NotFound("Kitap bulunamadı.");
            }

            // Yorum nesnesini kullanıcı ile ilişkilendiriyoruz
            comment.UserId = GuiduserId;
            comment.BookId = bookId;
            comment.IsApproved = "Pending";

            try
            {
                // Yorum ekleniyor
                await _commentsService.AddCommentAsync(comment);

                // Yorum ekledikten sonra, ilişkili User ve Book bilgilerini de döndürüyoruz
                var createdComment = new
                {
                    comment.Id,
                    comment.Text,
                    comment.IsApproved,
                    User = new { user.Id, user.Email },
                    Book = new { book.Id, book.BookName }
                };

                return CreatedAtAction(nameof(AddComment), new { id = comment.Id }, createdComment);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Bir hata oluştu: {ex.Message}");
            }
        }
        [HttpGet("all-comments")]
        public async Task<IActionResult> GetAllComments()
        {
            var comments = await _commentsService.GetAllCommentsAsync();

            if (comments.Count == 0)
            {
                return NotFound("Sistemde hiç yorum bulunamadı.");
            }

            // Yorumları detaylı şekilde döndürmek için bir model oluşturabiliriz
            var commentDetails = comments.Select(c => new
            {
                c.Id,
                c.Text,
                c.IsApproved,
                User = new
                {
                    c.User.Id,
                    c.User.Username,
                    c.User.Email
                },
                Book = new
                {
                    c.Book.Id,
                    c.Book.BookName,
                    c.Book.Author,
                    c.Book.Category
                },
            });

            return Ok(commentDetails);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteComment(Guid id)
        {
            try
            {
                var result = await _commentsService.DeleteComment(id);
                if (!result)
                {
                    return NotFound("Yorum Bulunamadı");
                }
                return Ok(new { message = "Yorum başarıyla silindi." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Kullanıcı silinirken bir hata oluştu.", error = ex.Message });

            }
        }

        [HttpPut("{commentId}/approve")]
        public async Task<IActionResult> ApproveComment(Guid commentId)
        {
            var comment = await _commentsService.GetCommentByIdAsync(commentId);

            if (comment == null)
            {
                return NotFound("Yorum bulunamadı.");
            }

            // Yorumun onay durumunu değiştir
            comment.IsApproved = "Approved"; // İsterseniz false yaparak onayı iptal edebilirsiniz.
            await _commentsService.UpdateCommentAsync(comment);

            return  Ok(new { message = "Yorum onaylandı." });
        }
        [HttpPut("{commentId}/reject")]
        public async Task<IActionResult> RejectComment(Guid commentId)
        {
            var comment = await _commentsService.GetCommentByIdAsync(commentId);

            if (comment == null)
            {
                return NotFound("Yorum bulunamadı.");
            }

            // Yorumun onay durumunu değiştir
            comment.IsApproved = "Rejected"; // İsterseniz false yaparak onayı iptal edebilirsiniz.
            await _commentsService.UpdateCommentAsync(comment);

            return  Ok(new { message = "Yorum reddedildi." });
        }

        // [HttpGet("user-comments")]
        // [CurrentUser]
        // public IActionResult GetUserComments(string userId)
        // {
        //     // JWT içinden userId'yi alıyoruz
        //     if (string.IsNullOrEmpty(userId))
        //     {
        //         return Unauthorized("Kullanıcı kimliği doğrulanamadı.");
        //     }

        //     // Sadece userId'nin çıktısını döndürmek
        //     return Ok(new { UserId = userId });
        // }
        // [HttpGet("current")]
        // [CurrentUser]
        // public IActionResult GetCurrentUser(string userId)
        // {

        //     return Ok(new { UserId = userId });
        // }
    }
}
