using System.ComponentModel.DataAnnotations;

namespace MyProject.Models
{
    public class User
    {
        // Id için GUID kullanmayı tercih edebilirsiniz, ancak PostgreSQL'le uyumlu olması için int ya da string kullanabilirsiniz.
        public Guid Id { get; set; }

        [Required(ErrorMessage = "The username is required")]
        [StringLength(50)]
        public string Username { get; set; } = null!;

        [Display(Name = "Email address")]
        [Required(ErrorMessage = "The email address is required")]
        [EmailAddress(ErrorMessage = "Invalid Email Address")]
        public string Email { get; set; } = null!;


        public List<Comment> CommentIds { get; set; } = [];

        public List<string> Role { get; set; } = []; // Liste olarak başlatma


        [Required(ErrorMessage = "The password is required")]
        public string Password { get; set; } = null!;

        public  ICollection<UserRole?> UserRoles { get; set; }= [];
    }
}
