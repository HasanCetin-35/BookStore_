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

        
        public async Task AddRoleToUserAsync(Guid userId, string roleName)
        {
           
            var user = await _dbContext.Users.FindAsync(userId);
            var role = await _dbContext.Roles.FirstOrDefaultAsync(r => r.RoleName == roleName);

            if (user == null || role == null)
            {
                throw new Exception("User or role not found");
            }

            
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

        
        public async Task RemoveRoleFromUserAsync(Guid userId, string roleName)

        {
            
            var user = await _dbContext.Users.FindAsync(userId);
            var role = await _dbContext.Roles.FirstOrDefaultAsync(r => r.RoleName == roleName);

            if (user == null || role == null)
            {
                throw new Exception("User or role not found");
            }

            
            var userRole = await _dbContext.UserRoles
                .Where(ur => ur.UserId == userId && ur.RoleId == role.Id)
                .FirstOrDefaultAsync();

            if (userRole != null)
            {
               
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
