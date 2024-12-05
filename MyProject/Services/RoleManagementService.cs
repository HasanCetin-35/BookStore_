using Microsoft.EntityFrameworkCore;
using MyProject.Models;

namespace MyProject.Services
{
    public class RoleManagementService
    {
        private readonly AppDbContext _dbContext;

        public RoleManagementService(AppDbContext context)
        {
            _dbContext = context;
        }

        // Kullanıcıya rol ekleme
        public async Task AddRoleToUserAsync(Guid userId, string roleName)
        {
            // Kullanıcıyı ve rolü bul
            var user = await _dbContext.Users.FindAsync(userId);
            var role = await _dbContext.Roles.FirstOrDefaultAsync(r => r.RoleName == roleName);

            if (user == null || role == null)
            {
                throw new Exception("User or role not found");
            }

            // Kullanıcının zaten bu role sahip olup olmadığını kontrol et
            var existingUserRole = await _dbContext.UserRoles
                .Where(ur => ur.UserId == userId && ur.RoleId == role.Id)
                .FirstOrDefaultAsync();

            if (existingUserRole == null)
            {
                // Yeni UserRole ekle
                var userRole = new UserRole
                {
                    UserId = userId,
                    RoleId = role.Id
                };
                _dbContext.UserRoles.Add(userRole);
                await _dbContext.SaveChangesAsync();
            }
        }

        // Kullanıcının rolünü kaldırma
        public async Task RemoveRoleFromUserAsync(Guid userId, string roleName)

        {
            // Kullanıcıyı ve rolü bul
            var user = await _dbContext.Users.FindAsync(userId);
            var role = await _dbContext.Roles.FirstOrDefaultAsync(r => r.RoleName == roleName);

            if (user == null || role == null)
            {
                throw new Exception("User or role not found");
            }

            // Kullanıcının bu role sahip olup olmadığını kontrol et
            var userRole = await _dbContext.UserRoles
                .Where(ur => ur.UserId == userId && ur.RoleId == role.Id)
                .FirstOrDefaultAsync();

            if (userRole != null)
            {
                // UserRole'u kaldır
                _dbContext.UserRoles.Remove(userRole);
                await _dbContext.SaveChangesAsync();
            }
        }
        public async Task<List<string?>> GetUserRolesAsync(Guid userId)
        {
            var userRoles = await _dbContext.UserRoles
                .Where(ur => ur.UserId == userId)
                .Include(ur => ur.Role)  // Role ilişkisini dahil ediyoruz
                .Select(ur => ur.Role.RoleName)  // RoleName bilgisini döndürüyoruz
                .ToListAsync();

            return userRoles;
        }
    }
}
