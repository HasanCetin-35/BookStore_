using Microsoft.EntityFrameworkCore;
using MyProject.Dto;
using MyProject.Models;

namespace MyProject.Services
{
    public class UsersService
    {
        private readonly AppDbContext _dbContext; // DbContext
        private readonly CommentsService _commentsService;

        // Constructor
        public UsersService(AppDbContext dbContext, CommentsService commentsService)
        {
            _dbContext = dbContext;
            _commentsService = commentsService;
        }

        public async Task<List<User>> GetAsync()
        {
            return await (from user in _dbContext.Users
                          select user).ToListAsync();
        }

        public async Task<User?> GetUserByEmailAsync(UserDto userDto)
        {
            return await (from user in _dbContext.Users
                          where user.Email == userDto.Email
                          select user).FirstOrDefaultAsync();
        }

        public async Task<User?> GetByEmailAsync(string email)
        {
            return await (from user in _dbContext.Users
                          where user.Email == email
                          select user).FirstOrDefaultAsync();
        }

        public async Task CreateAsync(User newUser)
        {
            await _dbContext.Users.AddAsync(newUser);
            await _dbContext.SaveChangesAsync();
        }

        public async Task<User?> GetUserByIdAsync(Guid userId)
        {
            return await (from user in _dbContext.Users
                          where user.Id == userId
                          select user).FirstOrDefaultAsync();
        }

        public async Task UpdateUserAsync(Guid userId, User updatedUser)
        {
            var existingUser = await (from user in _dbContext.Users
                                      where user.Id == userId
                                      select user).FirstOrDefaultAsync();

            if (existingUser != null)
            {
                existingUser.Username = updatedUser.Username;
                existingUser.Email = updatedUser.Email;
                existingUser.Password = updatedUser.Password;
                existingUser.Role = updatedUser.Role;

                await _dbContext.SaveChangesAsync();
            }
        }

        public async Task UpdateUserRoleAsync(Guid userId, string role)
        {
            var existingUser = await (from user in _dbContext.Users
                                      where user.Id == userId
                                      select user).FirstOrDefaultAsync();

            if (existingUser != null)
            {
                if (!existingUser.Role.Contains(role))
                {
                    existingUser.Role.Add(role);
                }

                await _dbContext.SaveChangesAsync();
            }
        }

        public async Task RemoveUserRoleAsync(Guid userId, string role)
        {
            var existingUser = await (from user in _dbContext.Users
                                      where user.Id == userId
                                      select user).FirstOrDefaultAsync();

            if (existingUser != null)
            {
                if (existingUser.Role.Contains(role))
                {
                    existingUser.Role.Remove(role);
                }

                await _dbContext.SaveChangesAsync();
            }
        }

        public async Task<bool> DeleteUserAsync(Guid userId)
        {
            var user = await (from u in _dbContext.Users
                              where u.Id == userId
                              select u)
                          .Include(u => u.CommentIds)
                          .FirstOrDefaultAsync();

            if (user == null)
            {
                return false;
            }

            _dbContext.Comments.RemoveRange(user.CommentIds);
            _dbContext.Users.Remove(user);

            await _dbContext.SaveChangesAsync();
            return true;
        }
    }


    // //Kullanıcıya ait yorumları getir
    //  public async Task<List<Comment>> GetUserCommentsAsync(Guid userId)
    // {
    //     var user = await GetUserByIdAsync(userId);

    //     if (user == null || user.CommentIds == null || user.CommentIds.Count == 0)
    //     {
    //         return new List<Comment>(); // Eğer kullanıcı yoksa veya yorum yapmamışsa boş liste döner
    //     }

    //     var userComments = new List<Comment>();

    //     // Kullanıcının yorumlarını almak için her bir yorum ID'sini sorgula
    //     foreach (var commentId in user.CommentIds)
    //     {
    //         var comment = await _commentsService.GetCommentByIdAsync(commentId); // commentId burada Guid olmalı
    //         if (comment != null)
    //         {
    //             userComments.Add(comment);
    //         }
    //     }

    //     return userComments;
    // }
}
