public class UserRoleDto
{
    public Guid RoleId { get; set; }
    public required string RoleName { get; set; }
    public  List<string>? Permissions { get; set; }
}
