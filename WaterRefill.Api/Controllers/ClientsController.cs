using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WaterRefill.Api.Data;
using WaterRefill.Api.Models;

namespace WaterRefill.Api.Controllers
{
    [Authorize(Roles = "Admin")]
    [ApiController]
    [Route("api/[controller]")]
    public class ClientsController : ControllerBase
    {
        private readonly WaterRefillContext _context;
        private readonly ILogger<ClientsController> _logger;

        public ClientsController(WaterRefillContext context, ILogger<ClientsController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/clients
        // Optional filtering by name or email: /api/clients?name=John&email=john@ex.com
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ClientDto>>> GetClients([FromQuery] string? name, [FromQuery] string? email)
        {
            try
            {
                IQueryable<Client> query = _context.Clients.AsQueryable();

                if (!string.IsNullOrWhiteSpace(name))
                {
                    var n = name.Trim();
                    query = query.Where(c => c.Name.Contains(n));
                }

                if (!string.IsNullOrWhiteSpace(email))
                {
                    var e = email.Trim();
                    query = query.Where(c => c.Email.Contains(e));
                }

                var clients = await query.ToListAsync();
                var dtos = clients.Select(c => new ClientDto
                {
                    Id = c.Id,
                    Name = c.Name,
                    Email = c.Email,
                    Phone = c.Phone,
                    Address = c.Address,
                    IsActive = c.IsActive
                }).ToList();

                return Ok(dtos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving clients");
                return StatusCode(500, new { message = "Error retrieving clients", error = ex.Message });
            }
        }

        // GET: api/clients/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<ClientDto>> GetClient(int id)
        {
            try
            {
                var client = await _context.Clients.FindAsync(id);
                if (client == null)
                {
                    return NotFound(new { message = $"Client with ID {id} not found" });
                }

                var dto = new ClientDto
                {
                    Id = client.Id,
                    Name = client.Name,
                    Email = client.Email,
                    Phone = client.Phone,
                    Address = client.Address,
                    IsActive = client.IsActive
                };

                return Ok(dto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error retrieving client with ID {id}");
                return StatusCode(500, new { message = "Error retrieving client", error = ex.Message });
            }
        }

        // POST: api/clients
        [HttpPost]
        public async Task<ActionResult<ClientDto>> CreateClient([FromBody] CreateClientDto dto)
        {
            if (dto == null)
            {
                return BadRequest(new { message = "Client data is required" });
            }

            // Required fields
            var errors = new List<string>();
            if (string.IsNullOrWhiteSpace(dto.Name)) errors.Add("Name is required");
            if (string.IsNullOrWhiteSpace(dto.Email)) errors.Add("Email is required");
            if (string.IsNullOrWhiteSpace(dto.Phone)) errors.Add("Phone is required");

            if (errors.Count > 0)
            {
                return BadRequest(new { message = "Validation failed", errors });
            }

            // Simple email format check (optional)
            if (!IsValidEmail(dto.Email!))
            {
                return BadRequest(new { message = "Invalid email format" });
            }

            // Optional: prevent duplicate email
            if (await _context.Clients.AnyAsync(c => c.Email == dto.Email!.Trim()))
            {
                return Conflict(new { message = "Email already exists" });
            }

            try
            {
                var client = new Client
                {
                    Name = dto.Name!.Trim(),
                    Email = dto.Email!.Trim(),
                    Phone = dto.Phone!.Trim(),
                    Address = dto.Address?.Trim() ?? string.Empty,
                    IsActive = true
                };

                _context.Clients.Add(client);
                await _context.SaveChangesAsync();

                var result = new ClientDto
                {
                    Id = client.Id,
                    Name = client.Name,
                    Email = client.Email,
                    Phone = client.Phone,
                    Address = client.Address
                };

                return CreatedAtAction(nameof(GetClient), new { id = client.Id }, result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating client");
                return StatusCode(500, new { message = "Error creating client", error = ex.Message });
            }
        }

        // PUT: api/clients/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateClient(int id, [FromBody] UpdateClientDto dto)
        {
            if (dto == null)
            {
                return BadRequest(new { message = "Client data is required" });
            }

            if (string.IsNullOrWhiteSpace(dto.Name) && string.IsNullOrWhiteSpace(dto.Email) && string.IsNullOrWhiteSpace(dto.Phone) && dto.Address == null)
            {
                return BadRequest(new { message = "At least one field must be provided for update" });
            }

            try
            {
                var client = await _context.Clients.FindAsync(id);
                if (client == null)
                {
                    return NotFound(new { message = $"Client with ID {id} not found" });
                }

                // If changing email, validate and enforce uniqueness
                if (!string.IsNullOrWhiteSpace(dto.Email))
                {
                    var emailTrim = dto.Email.Trim();
                    if (!IsValidEmail(emailTrim))
                    {
                        return BadRequest(new { message = "Invalid email format" });
                    }

                    if (emailTrim != client.Email && await _context.Clients.AnyAsync(c => c.Email == emailTrim && c.Id != id))
                    {
                        return Conflict(new { message = "Email already exists" });
                    }

                    client.Email = emailTrim;
                }

                if (!string.IsNullOrWhiteSpace(dto.Name))
                {
                    client.Name = dto.Name.Trim();
                }

                if (!string.IsNullOrWhiteSpace(dto.Phone))
                {
                    client.Phone = dto.Phone.Trim();
                }

                if (dto.Address != null)
                {
                    client.Address = dto.Address.Trim();
                }

                _context.Clients.Update(client);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Client updated successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error updating client with ID {id}");
                return StatusCode(500, new { message = "Error updating client", error = ex.Message });
            }
        }

        // DELETE: api/clients/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteClient(int id)
        {
            try
            {
                // Prevent deletion of Walk-in Customer (ID: 1)
                if (id == 1)
                {
                    return BadRequest(new { message = "Cannot delete Walk-in Customer. This is a default system client." });
                }

                var client = await _context.Clients.FindAsync(id);
                if (client == null)
                {
                    return NotFound(new { message = $"Client with ID {id} not found" });
                }

                client.IsActive = false;
                _context.Clients.Update(client);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Client deactivated successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error deleting client with ID {id}");
                return StatusCode(500, new { message = "Error deleting client", error = ex.Message });
            }
        }

        // POST: api/clients/bulk-delete
        // Bulk soft delete: set IsActive = false for multiple clients
        [HttpPost("bulk-delete")]
        public async Task<IActionResult> BulkDeleteClients([FromBody] BulkDeleteDto dto)
        {
            if (dto == null || dto.Ids == null || dto.Ids.Count == 0)
            {
                return BadRequest(new { message = "Client IDs are required" });
            }

            try
            {
                // Filter out Walk-in Customer (ID: 1) from deletion
                var validIds = dto.Ids.Where(id => id != 1).ToList();
                var skippedWalkIn = dto.Ids.Contains(1);

                if (validIds.Count == 0)
                {
                    return BadRequest(new { message = "Cannot delete Walk-in Customer. This is a default system client." });
                }

                var clients = await _context.Clients
                    .Where(c => validIds.Contains(c.Id))
                    .ToListAsync();

                if (clients.Count == 0)
                {
                    return NotFound(new { message = "No clients found with the provided IDs" });
                }

                foreach (var client in clients)
                {
                    client.IsActive = false;
                }

                _context.Clients.UpdateRange(clients);
                await _context.SaveChangesAsync();

                var message = skippedWalkIn
                    ? $"{clients.Count} client(s) deactivated successfully. Walk-in Customer was skipped (cannot be deleted)."
                    : $"{clients.Count} client(s) deactivated successfully";

                return Ok(new { message, deletedCount = clients.Count, skippedWalkIn });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error bulk deleting clients");
                return StatusCode(500, new { message = "Error bulk deleting clients", error = ex.Message });
            }
        }

        // POST: api/clients/{clientId}/prices
        [HttpPost("{clientId}/prices")]
        public async Task<IActionResult> SetClientProductPrice(int clientId, [FromBody] ClientPriceOverrideDto dto)
        {
            if (dto == null)
            {
                return BadRequest(new { message = "Payload is required" });
            }

            if (dto.ProductId <= 0)
            {
                return BadRequest(new { message = "ProductId is required" });
            }

            if (dto.Price <= 0)
            {
                return BadRequest(new { message = "Price must be greater than zero" });
            }

            try
            {
                var client = await _context.Clients.FindAsync(clientId);
                if (client == null)
                {
                    return NotFound(new { message = $"Client with ID {clientId} not found" });
                }
                if (!client.IsActive)
                {
                    return Conflict(new { message = "Client is inactive" });
                }

                var product = await _context.Products.FindAsync(dto.ProductId);
                if (product == null)
                {
                    return NotFound(new { message = $"Product with ID {dto.ProductId} not found" });
                }
                if (!product.IsActive)
                {
                    return Conflict(new { message = "Product is inactive" });
                }

                var existing = await _context.ClientProductPrices
                    .FirstOrDefaultAsync(x => x.ClientId == clientId && x.ProductId == dto.ProductId);

                if (existing == null)
                {
                    var cpp = new ClientProductPrice
                    {
                        ClientId = clientId,
                        ProductId = dto.ProductId,
                        Price = dto.Price,
                        IsActive = true
                    };
                    _context.ClientProductPrices.Add(cpp);
                }
                else
                {
                    existing.Price = dto.Price;
                    existing.IsActive = true;
                    _context.ClientProductPrices.Update(existing);
                }

                await _context.SaveChangesAsync();
                return Ok(new { message = "Override price set successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error setting override price for client {clientId}");
                return StatusCode(500, new { message = "Error setting override price", error = ex.Message });
            }
        }

        // DELETE: api/clients/{clientId}/prices/{productId}
        [HttpDelete("{clientId}/prices/{productId}")]
        public async Task<IActionResult> RemoveClientProductPrice(int clientId, int productId)
        {
            try
            {
                var existing = await _context.ClientProductPrices
                    .FirstOrDefaultAsync(x => x.ClientId == clientId && x.ProductId == productId);

                if (existing == null)
                {
                    return NotFound(new { message = "Override price not found" });
                }

                existing.IsActive = false;
                _context.ClientProductPrices.Update(existing);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Override price removed successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error removing override price for client {clientId}, product {productId}");
                return StatusCode(500, new { message = "Error removing override price", error = ex.Message });
            }
        }

        private static bool IsValidEmail(string email)
        {
            try
            {
                var addr = new System.Net.Mail.MailAddress(email);
                return addr.Address == email;
            }
            catch
            {
                return false;
            }
        }
    }

    // DTOs
    public class ClientDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public bool IsActive { get; set; }
    }

    public class CreateClientDto
    {
        public string? Name { get; set; }
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public string? Address { get; set; }
    }

    public class UpdateClientDto
    {
        public string? Name { get; set; }
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public string? Address { get; set; }
    }

    public class ClientPriceOverrideDto
    {
        public int ProductId { get; set; }
        public decimal Price { get; set; }
    }

    public class BulkDeleteDto
    {
        public List<int> Ids { get; set; } = new();
    }
}
