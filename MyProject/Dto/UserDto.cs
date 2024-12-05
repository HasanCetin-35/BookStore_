using System.ComponentModel.DataAnnotations;

namespace MyProject.Dto
{
    public class UserDto
    {
        public string Username { get; set; } = null!;
        [Display(Name = "Email address")]
        [Required(ErrorMessage = "The email address is required")]
        [EmailAddress(ErrorMessage = "Invalid Email Address")]
        public string Email { get; set; } = null!;
        public string Password { get; set; } = null!;
    }

}