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
        [HttpPost("assign-role/{userId}")]
        public async Task<IActionResult> AssignRoleToUser([FromRoute] Guid userId, [FromBody] Guid roleId)
        {
            try
            {
                // Kullanıcıya rol ataması yapılıyor
                var result = await _roleService.AssignRoleToUserAsync(userId, roleId);

                if (result)
                {
                    return Ok("Role assigned successfully.");
                }

                return BadRequest("Failed to assign role.");
            }
            catch (Exception ex)
            {
                return BadRequest($"Error occurred while assigning role: {ex.Message}");
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
        [HttpPut("{roleId:guid}/permissions")]
        public async Task<IActionResult> UpdateRolePermissions(Guid roleId, [FromBody] UpdateRolePermissionsDto updateDto)
        {
            try
            {
                var isUpdated = await _roleService.UpdateRolePermissionsAsync(roleId, updateDto.PermissionIds);

                if (!isUpdated)
                {
                    return BadRequest(new { Message = "Failed to update role permissions." });
                }

                return Ok(new { Message = "Role permissions updated successfully." });
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(new { Message = ex.Message });
            }
            catch (Exception ex)
            {
                // Genel hata durumunda
                return StatusCode(500, new { Message = "An error occurred while updating role permissions.", Details = ex.Message });
            }
        }
        [HttpGet("{roleId:guid}/permissions")]
        public async Task<IActionResult> GetPermissionsByRoleId(Guid roleId)
        {
            try
            {
                var permissions = await _roleService.GetPermissionsByRoleIdAsync(roleId);
                return Ok(permissions);
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(new { Message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "An unexpected error occurred.", Details = ex.Message });
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


    }

}