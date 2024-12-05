using Microsoft.EntityFrameworkCore;
using MyProject.Models;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;

namespace MyProject.Services
{
    public class BooksService
    {
        private readonly AppDbContext _dbContext;

        // Constructor
        public BooksService(AppDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        // Tüm kitapları getir
        public async Task<List<Book>> GetAsync()
        {
            return await _dbContext.Books.ToListAsync();
        }

        // ID'ye göre bir kitabı getir
        public async Task<Book?> GetAsync(Guid id)
        {
            return await _dbContext.Books
                .Where(x => x.Id == id)
                .FirstOrDefaultAsync();
        }

        // Yeni kitap ekle
        public async Task CreateAsync(Book newBook)
        {
            await _dbContext.Books.AddAsync(newBook);
            await _dbContext.SaveChangesAsync();
        }

        // Kitap güncelle
        public async Task UpdateAsync(Guid id, Book updatedBook)
        {
            var existingBook = await _dbContext.Books
                .Where(x => x.Id == id)
                .FirstOrDefaultAsync();

            if (existingBook != null)
            {
                existingBook.Author = updatedBook.Author;
                existingBook.Category = updatedBook.Category;
                await _dbContext.SaveChangesAsync();
            }
        }

        // Kitap güncelleme (alternatif metod)
        public async Task UpdateBookAsync(Book book)
        {
            _dbContext.Books.Update(book);
            await _dbContext.SaveChangesAsync();
        }

        // Kitap sil
        public async Task RemoveAsync(Guid id)
        {
            var book = await _dbContext.Books
                .Where(b => b.Id == id)
                .FirstOrDefaultAsync();

            if (book != null)
            {
                _dbContext.Books.Remove(book);
                await _dbContext.SaveChangesAsync();
            }
        }
    }
}
