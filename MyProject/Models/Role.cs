
namespace MyProject.Models
{
    public class Role
    {
        public Guid Id { get; set; }
        public string? RoleName { get; set; }

        // İlişki
        public ICollection<UserRole>? UserRoles { get; set; } // UserRoles ile ilişki
        public ICollection<RolePermission>? RolePermissions { get; set; } // İzinler ile ilişki
    }

}
