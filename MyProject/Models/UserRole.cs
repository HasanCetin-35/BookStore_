namespace MyProject.Models
{
    public class UserRole
{
    public Guid UserId { get; set; }
    public Guid RoleId { get; set; }

    //iliskiler
    public User? User { get; set; }= null!; // Kullanıcı
    public Role? Role { get; set; } = null!;// Rol
}

}