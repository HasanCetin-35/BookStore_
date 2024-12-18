namespace MyProject.Models
{
    public class RolePermission
    {
        public Guid RoleId { get; set; } // Rol ID
        public Guid PermissionId { get; set; } // Permission ID

        // İlişkiler
        public Role? Role { get; set; } = null!; // Rol ile ilişki
        public Permission? Permission { get; set; } = null!; // Permission ile ilişki
    }
}
