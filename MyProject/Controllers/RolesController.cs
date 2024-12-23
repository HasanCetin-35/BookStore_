using Microsoft.AspNetCore.Mvc;
using MyProject.DTOs;
using MyProject.Models;
using MyProject.Services;

namespace MyProject.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RolesController : ControllerBase
    {
        private readonly RoleService _roleService;
        private object _RoleService;

        public RolesController(RoleService roleService)
        {
            _roleService = roleService;
        }

        [HttpGet("get-all-roles")]
        public async Task<IActionResult> GetAllRoles()
        {
            try
            {
                var roles = await _roleService.GetAllRolesAsync();
                return Ok(roles); // Rolleri döndür
            }
            catch (Exception ex)
            {
                return BadRequest($"Error occurred while fetching roles: {ex.Message}");
            }
        }

        [HttpPost("create")]
        public async Task<IActionResult> CreateRole([FromBody] CreateRoleDto roleDto)
        {
            try
            {
                // Rol oluşturuluyor
                var role = await _roleService.CreateRoleAsync(roleDto.RoleName);
                return CreatedAtAction(nameof(GetRoleById), new { id = role.Id }, role);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error occurred while creating role: {ex.Message}");
            }
        }

        private object GetRoleById()
        {
            throw new NotImplementedException();
        }

        // 2. Endpoint: Rolün ID'sine göre izinler ekler
        [HttpPost("assign-permissions/{roleId}")]
        public async Task<IActionResult> AssignPermissionsToRole([FromRoute] Guid roleId, [FromBody] List<Guid> permissionIds)

        {
            try
            {
                // İzinleri ilişkilendir
                var result = await _roleService.AssignPermissionsToRoleAsync(roleId, permissionIds);

                if (result)
                {
                    return Ok(new { message = "Permissions assigned successfully." });
                }

                return BadRequest("Failed to assign permissions.");
            }
            catch (Exception ex)
            {
                return BadRequest($"Error occurred while assigning permissions: {ex.Message}");
            }
        }

        [HttpGet("get-user-roles/{userId}")]
        public async Task<IActionResult> GetUserRolesWithPermissions([FromRoute] Guid userId)
        {
            try
            {
                var userRolesWithPermissions = await _roleService.GetUserRolesWithPermissionsAsync(userId);
                return Ok(userRolesWithPermissions);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error occurred while getting user roles: {ex.Message}");
            }
        }
        [HttpPost("{roleId}/permissions/add")]
        public async Task<IActionResult> AddPermissionsToRole(Guid roleId, [FromBody] List<Guid> permissionIds)
        {
            try
            {
                var result = await _roleService.AddPermissionsToRoleAsync(roleId, permissionIds);
                if (result)
                {
                    return Ok(new { message = "Permissions added successfully." });
                }
                return BadRequest(new { message = "Failed to add permissions." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred.", error = ex.Message });
            }
        }

        // İzinleri kaldırmak için endpoint
        [HttpPost("{roleId}/permissions/remove")]
        public async Task<IActionResult> RemovePermissionsFromRole(Guid roleId, [FromBody] List<Guid> permissionIds)
        {
            try
            {
                var result = await _roleService.RemovePermissionsFromRoleAsync(roleId, permissionIds);
                if (result)
                {
                    return Ok(new { message = "Permissions removed successfully." });
                }
                return BadRequest(new { message = "Failed to remove permissions." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred.", error = ex.Message });
            }
        }
        
        [HttpDelete("{roleId}")]
        public async Task<IActionResult> RemoveRole(Guid roleId)
        {
            try
            {
                // Rolü silme işlemi
                await _roleService.RemoveRoleAsync(roleId);

                // Başarılı işlem
                return Ok(new { message = "Role successfully deleted." });
            }
            catch (InvalidOperationException ex)
            {
                // Rol bulunamadığında hata döndür
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                // Diğer hatalar için genel hata mesajı döndür
                return StatusCode(500, new { message = "An error occurred while deleting the role.", details = ex.Message });
            }
        }


    }

}