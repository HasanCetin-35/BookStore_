namespace MyProject.Models
{
    public class Permission
    {
        public Guid Id { get; set; } // Primary Key
        public string PermissionName { get; set; } = string.Empty; // İzin adı
        public string? Description { get; set; } // Açıklama

        // İlişkiler
        public ICollection<RolePermission>? RolePermissions { get; set; }  // Role ile ilişki
    }
}
