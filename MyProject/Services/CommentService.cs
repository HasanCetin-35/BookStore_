using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using MyProject.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MyProject.Services
{
    public class CommentsService
    {
        private readonly AppDbContext _dbContext;

        public CommentsService(AppDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        // Yorum ekleme fonksiyonu
        public async Task AddCommentAsync(Comment comment)
        {
            await _dbContext.Comments.AddAsync(comment);
            await _dbContext.SaveChangesAsync();
        }

        // Belirli bir kullanıcıya ait yorumları getirme fonksiyonu
        public async Task<List<Comment>> GetCommentsByUserIdAsync(Guid userId)
        {
            return await _dbContext.Comments
                .Where(c => c.UserId == userId)
                .ToListAsync();
        }

        public async Task<bool> DeleteComment(Guid commentId)
        {
            var comment = await _dbContext.Comments.FirstOrDefaultAsync(u => u.Id == commentId);
            if (comment == null)
            {
                return false;
            }
            _dbContext.Comments.Remove(comment);
            await _dbContext.SaveChangesAsync();
            return true;

        }

        // Yorumları ID'ye göre getirme fonksiyonu
        public async Task<Comment?> GetCommentByIdAsync(Guid commentId)
        {
            return await _dbContext.Comments
                .FirstOrDefaultAsync(c => c.Id == commentId);
        }
        public async Task<List<Comment>> GetCommentsByBookIdsAsync(List<Guid> bookIds)
        {
            // Yorumları alırken, kitap ID'lerine göre filtreleme yapıyoruz
            return await _dbContext.Comments
                                 .Where(c => bookIds.Contains(c.BookId))
                                 .ToListAsync();
        }
        public async Task<List<Comment>> GetCommentsByBookIdAsync(Guid bookId) =>
           await _dbContext.Comments
               .Where(c => c.BookId == bookId)
               .ToListAsync();
        public async Task<List<Comment>> GetAllCommentsAsync()
        {
            return await _dbContext.Comments
                .Include(c => c.Book) // Kitap bilgilerini dahil et
                .Include(c => c.User) // Kullanıcı bilgilerini dahil et
                .ToListAsync();
        }
        public async Task UpdateCommentAsync(Comment comment)
        {
            _dbContext.Comments.Update(comment);
            await _dbContext.SaveChangesAsync();
        }
    }


}
