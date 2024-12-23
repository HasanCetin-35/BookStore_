namespace MyProject.DTOs
{
    public class CreateRoleDto
    {
        public string RoleName  { get; set; } = null!;
        public List<Guid>? PermissionIds { get; set; } = new List<Guid>();
    }
}
