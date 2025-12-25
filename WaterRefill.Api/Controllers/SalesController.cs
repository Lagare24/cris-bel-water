using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WaterRefill.Api.Data;
using WaterRefill.Api.Models;

namespace WaterRefill.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SalesController : ControllerBase
    {
        private readonly WaterRefillContext _context;
        private readonly ILogger<SalesController> _logger;

        public SalesController(WaterRefillContext context, ILogger<SalesController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: /api/sales?startDate=2025-01-01&endDate=2025-01-31&clientId=1
        [HttpGet]
        public async Task<ActionResult<IEnumerable<SaleDto>>> GetSales(
            [FromQuery] DateTime? startDate,
            [FromQuery] DateTime? endDate,
            [FromQuery] int? clientId)
        {
            try
            {
                IQueryable<Sale> query = _context.Sales
                    .Include(s => s.Client)
                    .Include(s => s.SaleItems)
                        .ThenInclude(si => si.Product);

                if (startDate.HasValue)
                {
                    query = query.Where(s => s.SaleDate >= startDate.Value);
                }
                if (endDate.HasValue)
                {
                    query = query.Where(s => s.SaleDate <= endDate.Value);
                }
                if (clientId.HasValue)
                {
                    query = query.Where(s => s.ClientId == clientId.Value);
                }

                var sales = await query
                    .OrderByDescending(s => s.SaleDate)
                    .ToListAsync();

                var dtos = sales.Select(MapSaleToDto).ToList();
                return Ok(dtos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving sales");
                return StatusCode(500, new { message = "Error retrieving sales", error = ex.Message });
            }
        }

        // GET: /api/sales/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<SaleDto>> GetSale(int id)
        {
            try
            {
                var sale = await _context.Sales
                    .Include(s => s.Client)
                    .Include(s => s.SaleItems)
                        .ThenInclude(si => si.Product)
                    .FirstOrDefaultAsync(s => s.Id == id);

                if (sale == null)
                {
                    return NotFound(new { message = $"Sale with ID {id} not found" });
                }

                return Ok(MapSaleToDto(sale));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error retrieving sale with ID {id}");
                return StatusCode(500, new { message = "Error retrieving sale", error = ex.Message });
            }
        }

        // POST: /api/sales
        [HttpPost]
        public async Task<ActionResult<SaleDto>> CreateSale([FromBody] CreateSaleDto dto)
        {
            if (dto == null || dto.Items == null || dto.Items.Count == 0)
            {
                return BadRequest(new { message = "Sale items are required" });
            }

            // Basic validation
            var errors = new List<string>();
            foreach (var item in dto.Items)
            {
                if (item.ProductId <= 0)
                {
                    errors.Add("ProductId must be valid");
                }
                if (item.Quantity <= 0)
                {
                    errors.Add($"Quantity must be > 0 for ProductId {item.ProductId}");
                }
            }
            if (errors.Count > 0)
            {
                return BadRequest(new { message = "Validation failed", errors });
            }

            try
            {
                using var tx = await _context.Database.BeginTransactionAsync();

                // Validate client (optional)
                Client? client = null;
                if (dto.ClientId.HasValue)
                {
                    client = await _context.Clients.FindAsync(dto.ClientId.Value);
                    if (client == null)
                    {
                        return BadRequest(new { message = $"ClientId {dto.ClientId.Value} does not exist" });
                    }
                }

                // Fetch products used in sale
                var productIds = dto.Items.Select(i => i.ProductId).Distinct().ToList();
                var products = await _context.Products
                    .Where(p => productIds.Contains(p.Id))
                    .ToDictionaryAsync(p => p.Id);

                // Ensure all products exist
                var missing = productIds.Where(id => !products.ContainsKey(id)).ToList();
                if (missing.Count > 0)
                {
                    return BadRequest(new { message = "Some products do not exist", missing });
                }

                var sale = new Sale
                {
                    ClientId = dto.ClientId ?? 0,
                    Client = client,
                    SaleDate = DateTime.UtcNow,
                    TotalAmount = 0m
                };

                _context.Sales.Add(sale);
                await _context.SaveChangesAsync();

                decimal total = 0m;
                foreach (var item in dto.Items)
                {
                    var product = products[item.ProductId];

                    // Compute price with optional per-client override hook
                    decimal unitPrice = GetUnitPriceForClient(product, client);

                    var saleItem = new SaleItem
                    {
                        SaleId = sale.Id,
                        ProductId = product.Id,
                        Quantity = item.Quantity,
                        UnitPrice = unitPrice
                    };

                    _context.SaleItems.Add(saleItem);
                    total += unitPrice * item.Quantity;
                }

                sale.TotalAmount = total;
                _context.Sales.Update(sale);
                await _context.SaveChangesAsync();

                await tx.CommitAsync();

                // Reload with includes for response
                var saved = await _context.Sales
                    .Include(s => s.Client)
                    .Include(s => s.SaleItems)
                        .ThenInclude(si => si.Product)
                    .FirstAsync(s => s.Id == sale.Id);

                var result = MapSaleToDto(saved);
                return CreatedAtAction(nameof(GetSale), new { id = result.Id }, result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating sale");
                return StatusCode(500, new { message = "Error creating sale", error = ex.Message });
            }
        }

        private static SaleDto MapSaleToDto(Sale sale)
        {
            return new SaleDto
            {
                Id = sale.Id,
                Client = sale.Client == null ? null : new ClientSummaryDto
                {
                    Id = sale.Client.Id,
                    Name = sale.Client.Name,
                    Email = sale.Client.Email,
                    Phone = sale.Client.Phone
                },
                SaleDate = sale.SaleDate,
                TotalAmount = sale.TotalAmount,
                Items = sale.SaleItems.Select(si => new SaleItemDto
                {
                    ProductId = si.ProductId,
                    ProductName = si.Product?.Name ?? string.Empty,
                    Quantity = si.Quantity,
                    UnitPrice = si.UnitPrice,
                    Subtotal = si.UnitPrice * si.Quantity
                }).ToList()
            };
        }

        // Placeholder for per-client pricing override (extend when override table exists)
        private static decimal GetUnitPriceForClient(Product product, Client? client)
        {
            // TODO: If you add a per-client price table (e.g., ClientProductPrice), query it here.
            // For now, return the product base price.
            return product.Price;
        }
    }

    // DTOs
    public class CreateSaleDto
    {
        public int? ClientId { get; set; }
        public List<CreateSaleItemDto> Items { get; set; } = new();
    }

    public class CreateSaleItemDto
    {
        public int ProductId { get; set; }
        public int Quantity { get; set; }
    }

    public class SaleDto
    {
        public int Id { get; set; }
        public ClientSummaryDto? Client { get; set; }
        public DateTime SaleDate { get; set; }
        public decimal TotalAmount { get; set; }
        public List<SaleItemDto> Items { get; set; } = new();
    }

    public class ClientSummaryDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
    }

    public class SaleItemDto
    {
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal Subtotal { get; set; }
    }
}
