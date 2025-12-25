using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WaterRefill.Api.Data;
using WaterRefill.Api.Models;

namespace WaterRefill.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class ProductsController : ControllerBase
    {
        private readonly WaterRefillContext _context;
        private readonly ILogger<ProductsController> _logger;

        public ProductsController(WaterRefillContext context, ILogger<ProductsController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: /api/products?name=filter&includeInactive=true
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ProductDto>>> GetProducts([FromQuery] string? name, [FromQuery] bool includeInactive = false)
        {
            try
            {
                IQueryable<Product> query = _context.Products.AsQueryable();

                if (!includeInactive)
                {
                    query = query.Where(p => p.IsActive);
                }

                if (!string.IsNullOrWhiteSpace(name))
                {
                    var n = name.Trim();
                    query = query.Where(p => p.Name.Contains(n));
                }

                var products = await query.ToListAsync();
                var dtos = products.Select(p => new ProductDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    Description = p.Description,
                    Price = p.Price,
                    Quantity = p.Quantity,
                    IsActive = p.IsActive
                }).ToList();

                return Ok(dtos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving products");
                return StatusCode(500, new { message = "Error retrieving products", error = ex.Message });
            }
        }

        // GET: /api/products/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<ProductDto>> GetProduct(int id)
        {
            try
            {
                var product = await _context.Products.FindAsync(id);
                if (product == null || !product.IsActive)
                {
                    return NotFound(new { message = $"Product with ID {id} not found" });
                }

                var dto = new ProductDto
                {
                    Id = product.Id,
                    Name = product.Name,
                    Description = product.Description,
                    Price = product.Price,
                    Quantity = product.Quantity,
                    IsActive = product.IsActive
                };

                return Ok(dto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error retrieving product with ID {id}");
                return StatusCode(500, new { message = "Error retrieving product", error = ex.Message });
            }
        }

        // POST: /api/products
        [HttpPost]
        public async Task<ActionResult<ProductDto>> CreateProduct([FromBody] CreateProductDto dto)
        {
            if (dto == null)
            {
                return BadRequest(new { message = "Product data is required" });
            }

            var errors = new List<string>();
            if (string.IsNullOrWhiteSpace(dto.Name)) errors.Add("Name is required");
            if (dto.Price is null) errors.Add("Price is required");
            if (dto.Price is not null && dto.Price < 0) errors.Add("Price must be greater than or equal to 0");
            if (dto.Quantity is not null && dto.Quantity < 0) errors.Add("Quantity must be greater than or equal to 0");

            if (errors.Count > 0)
            {
                return BadRequest(new { message = "Validation failed", errors });
            }

            try
            {
                var product = new Product
                {
                    Name = dto.Name!.Trim(),
                    Description = dto.Description?.Trim() ?? string.Empty,
                    Price = dto.Price!.Value,
                    Quantity = dto.Quantity ?? 0,
                    IsActive = true
                };

                _context.Products.Add(product);
                await _context.SaveChangesAsync();

                var result = new ProductDto
                {
                    Id = product.Id,
                    Name = product.Name,
                    Description = product.Description,
                    Price = product.Price,
                    Quantity = product.Quantity,
                    IsActive = product.IsActive
                };

                return CreatedAtAction(nameof(GetProduct), new { id = product.Id }, result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating product");
                return StatusCode(500, new { message = "Error creating product", error = ex.Message });
            }
        }

        // PUT: /api/products/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProduct(int id, [FromBody] UpdateProductDto dto)
        {
            if (dto == null)
            {
                return BadRequest(new { message = "Product data is required" });
            }

            if (string.IsNullOrWhiteSpace(dto.Name) && dto.Description == null && dto.Price is null && dto.Quantity is null && dto.IsActive is null)
            {
                return BadRequest(new { message = "At least one field must be provided for update" });
            }

            if (dto.Price is not null && dto.Price < 0)
            {
                return BadRequest(new { message = "Price must be greater than or equal to 0" });
            }

            if (dto.Quantity is not null && dto.Quantity < 0)
            {
                return BadRequest(new { message = "Quantity must be greater than or equal to 0" });
            }

            try
            {
                var product = await _context.Products.FindAsync(id);
                if (product == null)
                {
                    return NotFound(new { message = $"Product with ID {id} not found" });
                }

                if (!string.IsNullOrWhiteSpace(dto.Name))
                {
                    product.Name = dto.Name.Trim();
                }

                if (dto.Description != null)
                {
                    product.Description = dto.Description.Trim();
                }

                if (dto.Price is not null)
                {
                    product.Price = dto.Price.Value;
                }

                if (dto.Quantity is not null)
                {
                    product.Quantity = dto.Quantity.Value;
                }

                if (dto.IsActive is not null)
                {
                    product.IsActive = dto.IsActive.Value;
                }

                _context.Products.Update(product);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Product updated successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error updating product with ID {id}");
                return StatusCode(500, new { message = "Error updating product", error = ex.Message });
            }
        }

        // DELETE: /api/products/{id}
        // Soft delete: set IsActive = false
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            try
            {
                var product = await _context.Products.FindAsync(id);
                if (product == null)
                {
                    return NotFound(new { message = $"Product with ID {id} not found" });
                }

                product.IsActive = false;
                _context.Products.Update(product);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Product deleted successfully (soft delete)" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error deleting product with ID {id}");
                return StatusCode(500, new { message = "Error deleting product", error = ex.Message });
            }
        }
    }

    // DTOs
    public class ProductDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public int Quantity { get; set; }
        public bool IsActive { get; set; }
    }

    public class CreateProductDto
    {
        public string? Name { get; set; }
        public string? Description { get; set; }
        public decimal? Price { get; set; }
        public int? Quantity { get; set; }
    }

    public class UpdateProductDto
    {
        public string? Name { get; set; }
        public string? Description { get; set; }
        public decimal? Price { get; set; }
        public int? Quantity { get; set; }
        public bool? IsActive { get; set; }
    }
}
