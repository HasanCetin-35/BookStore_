using Microsoft.EntityFrameworkCore;
using MyProject.Models;

namespace MyProject.Services
{
    public class PermissionService
    {
        private readonly AppDbContext _dbContext;

        public PermissionService(AppDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        // Get All Permissions
        public async Task<List<Permission>> GetAllPermissionsAsync()
        {
            return await _dbContext.Permission.ToListAsync();
        }

        // Get Permission By ID
        public async Task<Permission?> GetPermissionByIdAsync(Guid id)
        {
            return await _dbContext.Permission.FirstOrDefaultAsync(p => p.Id == id);
        }

    }
}
