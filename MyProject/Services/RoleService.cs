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

        // Belirli bir rolü isme göre getir
        public async Task<Role?> GetRoleByNameAsync(string rolename)
        {
            return await _context.Roles
                .Where(r => r.RoleName == rolename)
                .FirstOrDefaultAsync();
        }

        // Yeni bir rol ekleyin
        public async Task AddRoleAsync(Role role)
        {
            if (await _context.Roles.AnyAsync(r => r.RoleName == role.RoleName))
            {
                throw new InvalidOperationException("Role already exists.");
            }

            _context.Roles.Add(role);
            await _context.SaveChangesAsync();
        }

        // Bir rolü sil
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

        // Yeni bir rol ekleyip, ona belirtilen izinleri ilişkilendir
        public async Task<Role> CreateRoleAsync(string RoleName)
        {
            // Aynı isimde bir rol var mı kontrol et
            if (await _context.Roles.AnyAsync(r => r.RoleName == RoleName))
            {
                throw new InvalidOperationException("Role with the same name already exists.");
            }

            // Yeni rol oluştur
            var role = new Role
            {
                Id = Guid.NewGuid(),
                RoleName = RoleName
            };

            // Veritabanına kaydet
            _context.Roles.Add(role);
            await _context.SaveChangesAsync();

            return role; // Oluşturulan rolü döndür
        }

        public async Task<bool> AssignPermissionsToRoleAsync(Guid roleId, List<Guid> permissionIds)
        {
            // Geçersiz izin kontrolü
            var validPermissionIds = await _context.Permission
                .Where(p => permissionIds.Contains(p.Id))
                .Select(p => p.Id)
                .ToListAsync();

            if (validPermissionIds.Count != permissionIds.Count)
            {
                throw new InvalidOperationException("One or more permission IDs are invalid.");
            }

            // İzinlerle ilişkilendir
            var rolePermissions = permissionIds.Select(permissionId => new RolePermission
            {
                RoleId = roleId,
                PermissionId = permissionId
            }).ToList();

            // Veritabanına kaydet
            _context.RolePermission.AddRange(rolePermissions);

            try
            {
                var result = await _context.SaveChangesAsync(); // RolePermissions kaydedilir
                return result > 0;
            }
            catch (Exception ex)
            {
                // Hata mesajını günlüğe kaydedebiliriz
                Console.WriteLine($"An error occurred while saving the changes: {ex.Message}");
                return false;
            }
        }

        public async Task<bool> AssignRoleToUserAsync(Guid userId, Guid roleId)
        {
            // Kullanıcının mevcut olup olmadığını kontrol et
            var userExists = await _context.Users.AnyAsync(u => u.Id == userId);
            if (!userExists)
            {
                throw new InvalidOperationException("User not found.");
            }

            // Rolün mevcut olup olmadığını kontrol et
            var roleExists = await _context.Roles.AnyAsync(r => r.Id == roleId);
            if (!roleExists)
            {
                throw new InvalidOperationException("Role not found.");
            }

            // Kullanıcıya rol ataması yap
            var userRole = new UserRole
            {
                UserId = userId,
                RoleId = roleId
            };

            // UserRoles tablosuna ekle
            _context.UserRoles.Add(userRole);

            // Değişiklikleri kaydet
            var result = await _context.SaveChangesAsync();

            return result > 0;  // Eğer kaydetme başarılıysa true döner
        }

        public async Task<List<UserRoleDto>> GetUserRolesWithPermissionsAsync(Guid userId)
        {
            // Kullanıcı ve rollerin bilgilerini getir
            var userRoles = await _context.UserRoles
                .Where(ur => ur.UserId == userId)
                .Include(ur => ur.Role)  // Rol bilgilerini dahil et
                .ToListAsync();

            if (!userRoles.Any())
            {
                throw new InvalidOperationException("User has no roles assigned.");
            }

            // Her rolün izin bilgilerini getir
            var userRolesWithPermissions = new List<UserRoleDto>();

            foreach (var userRole in userRoles)
            {
                var rolePermissions = await _context.RolePermission
                    .Where(rp => rp.RoleId == userRole.RoleId)
                    .Include(rp => rp.Permission)  // İzin bilgilerini dahil et
                    .ToListAsync();

                var roleDto = new UserRoleDto
                {
                    RoleName = userRole.Role.RoleName,
                    Permissions = rolePermissions.Select(rp => rp.Permission.PermissionName).ToList()
                };

                userRolesWithPermissions.Add(roleDto);
            }

            return userRolesWithPermissions;
        }

    }
}
