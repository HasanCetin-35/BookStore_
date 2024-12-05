using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MyProject.Models;
using MyProject.Services;

namespace BookStoreApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BooksController : ControllerBase
    {
        private readonly BooksService _booksService;
        private readonly CommentsService _commentsService;

        public BooksController(BooksService booksService, CommentsService commentsService)
        {
            _booksService = booksService;
            _commentsService = commentsService;
        }

        // Tüm kitapları getir
        [HttpGet]
        public async Task<List<Book>> Get() =>
            await _booksService.GetAsync();

        // Kitaplarla birlikte yorumları getir
        [HttpGet("books-with-comments")]
public async Task<ActionResult> GetBooksWithComments()
{
    // Tüm kitapları ve her kitap için yorumları birlikte almak
    var books = await _booksService.GetAsync(); // Kitapları al
    var bookIds = books.Select(b => b.Id).ToList(); // Kitap ID'lerini al

    // Yorumları tüm kitaplar için bir kerede al
    var allComments = await _commentsService.GetCommentsByBookIdsAsync(bookIds); // Kitapların ID'lerine göre yorumları al

    // Kitaplar ve yorumları birleştiriyoruz
    var booksWithComments = books.Select(book => new
    {
        BookId = book.Id,
        BookName = book.BookName,
        Author = book.Author,
        Category = book.Category,
        Comments = allComments.Where(c => c.BookId == book.Id)
            .Select(comment => new
            {
                CommentId = comment.Id,
                CommentText = comment.Text,
                CommentIsApproved= comment.IsApproved,
                UserId = comment.UserId
            })
    }).ToList();

    return Ok(booksWithComments);
}

        // ID'ye göre kitap getir
        [HttpGet("{id}")]
        public async Task<ActionResult<Book>> Get(Guid id)
        {
            var book = await _booksService.GetAsync(id);

            if (book is null)
            {
                return NotFound();
            }

            return book;
        }

        // Yeni kitap ekle
        [HttpPost]
        public async Task<IActionResult> Post(Book newBook)
        {
            await _booksService.CreateAsync(newBook);

            return CreatedAtAction(nameof(Get), new { id = newBook.Id }, newBook);
        }

        // Kitap güncelle
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, Book updatedBook)
        {
            var book = await _booksService.GetAsync(id);

            if (book is null)
            {
                return NotFound();
            }

            updatedBook.Id = book.Id;

            await _booksService.UpdateAsync(id, updatedBook);

            return NoContent();
        }

        // Kitap sil
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var book = await _booksService.GetAsync(id);

            if (book is null)
            {
                return NotFound();
            }

            await _booksService.RemoveAsync(id);

            return NoContent();
        }
    }
}
