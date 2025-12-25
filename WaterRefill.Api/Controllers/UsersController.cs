using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;
using WaterRefill.Api.Data;
using WaterRefill.Api.Models;

namespace WaterRefill.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly WaterRefillContext _context;
        private readonly ILogger<UsersController> _logger;

        public UsersController(WaterRefillContext context, ILogger<UsersController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/users
        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserDto>>> GetUsers()
        {
            try
            {
                var users = await _context.Users.ToListAsync();
                var userDtos = users.Select(u => new UserDto
                {
                    UserId = u.UserId,
                    FullName = u.FullName,
                    Username = u.Username,
                    Role = u.Role,
                    IsActive = u.IsActive
                }).ToList();

                return Ok(userDtos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving users");
                return StatusCode(500, new { message = "Error retrieving users", error = ex.Message });
            }
        }

        // GET: api/users/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<UserDto>> GetUser(int id)
        {
            try
            {
                var user = await _context.Users.FindAsync(id);
                if (user == null)
                {
                    return NotFound(new { message = $"User with ID {id} not found" });
                }

                var userDto = new UserDto
                {
                    UserId = user.UserId,
                    FullName = user.FullName,
                    Username = user.Username,
                    Role = user.Role,
                    IsActive = user.IsActive
                };

                return Ok(userDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error retrieving user with ID {id}");
                return StatusCode(500, new { message = "Error retrieving user", error = ex.Message });
            }
        }

        // POST: api/users
        [HttpPost]
        public async Task<ActionResult<UserDto>> CreateUser([FromBody] CreateUserDto createUserDto)
        {
            // Input validation
            if (createUserDto == null)
            {
                return BadRequest(new { message = "User data is required" });
            }

            if (string.IsNullOrWhiteSpace(createUserDto.FullName))
            {
                return BadRequest(new { message = "FullName is required" });
            }

            if (string.IsNullOrWhiteSpace(createUserDto.Username))
            {
                return BadRequest(new { message = "Username is required" });
            }

            if (string.IsNullOrWhiteSpace(createUserDto.Password))
            {
                return BadRequest(new { message = "Password is required" });
            }

            if (string.IsNullOrWhiteSpace(createUserDto.Role))
            {
                return BadRequest(new { message = "Role is required" });
            }

            // Check if username already exists
            if (await _context.Users.AnyAsync(u => u.Username == createUserDto.Username))
            {
                return Conflict(new { message = "Username already exists" });
            }

            try
            {
                var user = new User
                {
                    FullName = createUserDto.FullName.Trim(),
                    Username = createUserDto.Username.Trim(),
                    PasswordHash = HashPassword(createUserDto.Password),
                    Role = createUserDto.Role.Trim(),
                    IsActive = true
                };

                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                var userDto = new UserDto
                {
                    UserId = user.UserId,
                    FullName = user.FullName,
                    Username = user.Username,
                    Role = user.Role,
                    IsActive = user.IsActive
                };

                return CreatedAtAction(nameof(GetUser), new { id = user.UserId }, userDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating user");
                return StatusCode(500, new { message = "Error creating user", error = ex.Message });
            }
        }

        // PUT: api/users/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(int id, [FromBody] UpdateUserDto updateUserDto)
        {
            // Input validation
            if (updateUserDto == null)
            {
                return BadRequest(new { message = "User data is required" });
            }

            if (string.IsNullOrWhiteSpace(updateUserDto.FullName) &&
                string.IsNullOrWhiteSpace(updateUserDto.Username) &&
                string.IsNullOrWhiteSpace(updateUserDto.Password) &&
                string.IsNullOrWhiteSpace(updateUserDto.Role) &&
                updateUserDto.IsActive == null)
            {
                return BadRequest(new { message = "At least one field must be provided for update" });
            }

            try
            {
                var user = await _context.Users.FindAsync(id);
                if (user == null)
                {
                    return NotFound(new { message = $"User with ID {id} not found" });
                }

                // Check if new username is already taken by another user
                if (!string.IsNullOrWhiteSpace(updateUserDto.Username) && updateUserDto.Username.Trim() != user.Username)
                {
                    if (await _context.Users.AnyAsync(u => u.Username == updateUserDto.Username.Trim() && u.UserId != id))
                    {
                        return Conflict(new { message = "Username already exists" });
                    }
                }

                // Update fields if provided
                if (!string.IsNullOrWhiteSpace(updateUserDto.FullName))
                {
                    user.FullName = updateUserDto.FullName.Trim();
                }

                if (!string.IsNullOrWhiteSpace(updateUserDto.Username))
                {
                    user.Username = updateUserDto.Username.Trim();
                }

                if (!string.IsNullOrWhiteSpace(updateUserDto.Password))
                {
                    user.PasswordHash = HashPassword(updateUserDto.Password);
                }

                if (!string.IsNullOrWhiteSpace(updateUserDto.Role))
                {
                    user.Role = updateUserDto.Role.Trim();
                }

                if (updateUserDto.IsActive.HasValue)
                {
                    user.IsActive = updateUserDto.IsActive.Value;
                }

                _context.Users.Update(user);
                await _context.SaveChangesAsync();

                return Ok(new { message = "User updated successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error updating user with ID {id}");
                return StatusCode(500, new { message = "Error updating user", error = ex.Message });
            }
        }

        // DELETE: api/users/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            try
            {
                var user = await _context.Users.FindAsync(id);
                if (user == null)
                {
                    return NotFound(new { message = $"User with ID {id} not found" });
                }

                _context.Users.Remove(user);
                await _context.SaveChangesAsync();

                return Ok(new { message = "User deleted successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error deleting user with ID {id}");
                return StatusCode(500, new { message = "Error deleting user", error = ex.Message });
            }
        }

        // Helper method to hash password
        private string HashPassword(string password)
        {
            using (var sha256 = SHA256.Create())
            {
                var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
                return Convert.ToBase64String(hashedBytes);
            }
        }
    }

    // DTOs for request/response
    public class UserDto
    {
        public int UserId { get; set; }
        public string FullName { get; set; }
        public string Username { get; set; }
        public string Role { get; set; }
        public bool IsActive { get; set; }
    }

    public class CreateUserDto
    {
        public string FullName { get; set; }
        public string Username { get; set; }
        public string Password { get; set; }
        public string Role { get; set; }
    }

    public class UpdateUserDto
    {
        public string FullName { get; set; }
        public string Username { get; set; }
        public string Password { get; set; }
        public string Role { get; set; }
        public bool? IsActive { get; set; }
    }
}
