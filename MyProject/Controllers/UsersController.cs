using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using MyProject.Dto;
using MyProject.Models;
using MyProject.Services;

namespace MyProject.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly UsersService _usersService;
        private readonly RoleService _roleService;

        private readonly RoleManagementService _roleManagementService;

        private readonly UserRoleService _userRoleService;
        private readonly IConfiguration _configuration;

        public UsersController(UsersService usersService,
         UserRoleService userRoleService,
          RoleService roleService,
          RoleManagementService roleManagementService,
           IConfiguration configuration)
        {
            _usersService = usersService;
            _userRoleService = userRoleService;
            _roleService = roleService;
            _roleManagementService = roleManagementService;
            _configuration = configuration;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _usersService.GetAsync();

            if (users == null || users.Count == 0)
            {
                return NotFound("Sistemde kayıtlı kullanıcı bulunamadı.");
            }

            return Ok(users);
        }
        // POST: api/Users/SignUp
        [HttpPost("SignUp")]
        public async Task<IActionResult> SignUp(UserDto userDto)
        {
            // Kullanıcı email adresine göre kontrol edilir
            var existingUser = await _usersService.GetUserByEmailAsync(userDto);

            if (existingUser != null)
            {
                return BadRequest("This email is already registered.");
            }

            // Yeni kullanıcı oluşturma
            var newUser = new User
            {
                Id = Guid.NewGuid(),
                Username = userDto.Username,
                Email = userDto.Email,
                Password = BCrypt.Net.BCrypt.HashPassword(userDto.Password)
            };

            // Yeni kullanıcıyı veritabanına kaydet
            await _usersService.CreateAsync(newUser);

            // "user" rolünü al
            var userRole = await _roleService.GetRoleByNameAsync("user");

            // Kullanıcıya "user" rolünü eklemek için UserRoleService kullanarak işlem yap
            await _userRoleService.CreateAsync(new UserRole
            {
                UserId = newUser.Id,
                RoleId = userRole.Id
            });

            return Ok(new { message = "User registered successfully." });
        }



        // [HttpGet("Login")]

        // public async Task<IActionResult> Login(UserLoginDto userDto)
        // {
        //     if (userDto is null)
        //     {
        //         throw new ArgumentNullException(nameof(userDto));
        //     }

        // }
        [HttpPost("login")]
        public async Task<IActionResult> Login(UserLoginDto userLoginDto)
        {
            var user = await _usersService.GetByEmailAsync(userLoginDto.Email);

            if (user == null || !BCrypt.Net.BCrypt.Verify(userLoginDto.Password, user.Password))
            {
                return Unauthorized("Invalid credentials.");
            }

            var token = GenerateJwtToken(user);
            return Ok(new { token });
        }

        private string GenerateJwtToken(User user)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes(_configuration["JwtSettings:SecretKey"]);

            var claims = new List<Claim>
    {
        new("nameid", user.Id.ToString()), // sub claim olarak da olabilir.
        new(ClaimTypes.Email, user.Email), // kullanıcı e-posta bilgisi
    };

            // Eğer birden fazla role varsa, her bir role için ayrı bir claim ekliyoruz
            if (user.Role != null)
            {
                foreach (var role in user.Role)
                {
                    claims.Add(new Claim(ClaimTypes.Role, role));
                }
            }

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddHours(1), // token süresi 1 saat
                Issuer = _configuration["JwtSettings:Issuer"], // Token sağlayıcı
                Audience = _configuration["JwtSettings:Audience"], // Token doğrulanacak hedef
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature) // Şifreleme yöntemi
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token); // Token'ı string olarak döndür
        }
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(Guid id)
        {
            try
            {
                // Kullanıcıyı sil
                var result = await _usersService.DeleteUserAsync(id);

                if (!result)
                {
                    return NotFound("Kullanıcı bulunamadı.");
                }

                return Ok(new { message = "Kullanıcı başarıyla silindi." });
            }
            catch (Exception ex)
            {
                // Hata yönetimi
                return StatusCode(500, new { message = "Kullanıcı silinirken bir hata oluştu.", error = ex.Message });
            }
        }
        // [HttpPost("update-role")]
        // public async Task<IActionResult> UpdateRole([FromBody] UpdateRoleDto updateRoleDto)
        // {
        //     var user = await _usersService.GetUserByIdAsync(updateRoleDto.UserId);

        //     if (user == null)
        //     {
        //         return NotFound("Kullanıcı bulunamadı.");
        //     }

        //     if (updateRoleDto.Action == "add")
        //     {
        //         if (!user.Role.Contains(updateRoleDto.Role))
        //         {
        //             user.Role.Add(updateRoleDto.Role);
        //         }
        //         else
        //         {
        //             return BadRequest("Bu rol zaten kullanıcıda mevcut.");
        //         }
        //     }
        //     else if (updateRoleDto.Action == "remove")
        //     {
        //         if (user.Role.Contains(updateRoleDto.Role))
        //         {
        //             user.Role.Remove(updateRoleDto.Role);
        //         }
        //         else
        //         {
        //             return BadRequest("Bu rol kullanıcıda bulunmuyor.");
        //         }
        //     }
        //     else
        //     {
        //         return BadRequest("Geçersiz işlem türü.");
        //     }

        //     await _usersService.UpdateUserAsync(user.Id, user);
        //     return Ok("Kullanıcı rolü başarıyla güncellendi.");
        // }

        [HttpPost("add-role")]
        public async Task<IActionResult> AddRoleToUser([FromBody] UpdateRoleDto updateRoleDto)
        {
            try
            {
                await _roleManagementService.AddRoleToUserAsync(updateRoleDto.UserId, updateRoleDto.RoleName);
                return Ok(new { message = "Role added to user successfully." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("remove-role")]
        public async Task<IActionResult> RemoveRoleFromUser([FromBody] UpdateRoleDto updateRoleDto)
        {
            try
            {
                await _roleManagementService.RemoveRoleFromUserAsync(updateRoleDto.UserId, updateRoleDto.RoleName);
                return Ok(new { message = "Role removed from user successfully." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
        [HttpGet("{userId}/roles")]
        public async Task<IActionResult> GetUserRoles(Guid userId)
        {
            var userRoles = await _roleManagementService.GetUserRolesAsync(userId);

            if (userRoles == null || userRoles.Count == 0)
            {
                return NotFound(new { message = "User has no roles." });
            }

            return Ok(new { roles = userRoles }); // 'roles' sarmalayıcı nesnesi ile döndürülüyor
        }






        [HttpGet("get-user-by-token")]
        [Authorize]
        public async Task<IActionResult> GetUserByToken()
        {
            var autHeader = Request.Headers.Authorization.ToString();
            if (string.IsNullOrEmpty(autHeader) || !autHeader.StartsWith("Bearer "))
            {
                return Unauthorized("Geçersiz veya eksik yetki bilgisi");
            }
            var token = autHeader.Split(' ')[1];

            try
            {
                var handler = new JwtSecurityTokenHandler();
                var jwtToken = handler.ReadJwtToken(token);

                var userID = jwtToken.Claims.FirstOrDefault(c => c.Type == "nameid")?.Value;
                if (userID == null)
                {
                    return Unauthorized("Token geçersiz.");
                }
                if (!Guid.TryParse(userID, out var userGuid))
                {
                    return Unauthorized("Token'daki kullanıcı ID'si geçersiz.");
                }

                var user = await _usersService.GetUserByIdAsync(userGuid);

                if (user == null)
                {
                    return NotFound("Kullanıcı bulunamadı.");
                }

                return Ok(user);

            }
            catch
            {
                return Unauthorized("Token çözümlemesi sırasında bir hata oluştu.");
            }

        }



    }
}