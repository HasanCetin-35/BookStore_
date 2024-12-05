using Microsoft.EntityFrameworkCore;
using MyProject.Models;

namespace MyProject.Services
{
   public class UserRoleService
{
    private readonly AppDbContext _context;

    public UserRoleService(AppDbContext context)
    {
        _context = context;
    }

    public async Task CreateAsync(UserRole userRole)
    {
        // Kullanıcının bu rolü zaten var mı kontrol et
        var existingUserRole = await _context.UserRoles
            .Where(ur => ur.UserId == userRole.UserId && ur.RoleId == userRole.RoleId)
            .FirstOrDefaultAsync();

        // Eğer kullanıcı rolü yoksa, yeni rolü ekle
        if (existingUserRole == null)
        {
            _context.UserRoles.Add(userRole);
            await _context.SaveChangesAsync();
        }
    }
}


}