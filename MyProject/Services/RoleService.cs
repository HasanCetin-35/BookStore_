using MyProject.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace MyProject.Services
{
    public class RoleService
    {
        private readonly AppDbContext _context;

        // Constructor: AppDbContext'i enjekte ediyoruz
        public RoleService(AppDbContext context)
        {
            _context = context;
        }


        public async Task<Role?> GetRoleByNameAsync(string rolename) => await _context.Roles
                                 .Where(r => r.RoleName == rolename)
                                 .FirstOrDefaultAsync();

     
        public async Task AddRoleAsync(Role role)
        {
            if (await _context.Roles.AnyAsync(r => r.RoleName == role.RoleName))
            {
                throw new InvalidOperationException("Role already exists.");
            }

            _context.Roles.Add(role);
            await _context.SaveChangesAsync();
        }

      
        public async Task RemoveRoleAsync(Guid roleId)
        {
            var role = await _context.Roles.FindAsync(roleId);

            if (role == null)
            {
                throw new InvalidOperationException("Role not found.");
            }

            _context.Roles.Remove(role);
            await _context.SaveChangesAsync();
        }

        
    }
}
