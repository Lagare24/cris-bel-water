using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WaterRefill.Api.Data;
using WaterRefill.Api.Models;

namespace WaterRefill.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class InvoicesController : ControllerBase
    {
        private readonly WaterRefillContext _context;
        private readonly ILogger<InvoicesController> _logger;

        public InvoicesController(WaterRefillContext context, ILogger<InvoicesController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // POST: /api/invoices/from-sale/{saleId}
        [HttpPost("from-sale/{saleId}")]
        public async Task<ActionResult<InvoiceDto>> CreateFromSale(int saleId, [FromBody] CreateInvoiceFromSaleDto? body)
        {
            try
            {
                var sale = await _context.Sales
                    .Include(s => s.Client)
                    .Include(s => s.SaleItems)
                        .ThenInclude(si => si.Product)
                    .FirstOrDefaultAsync(s => s.Id == saleId);
                if (sale == null)
                {
                    return NotFound(new { message = $"Sale with ID {saleId} not found" });
                }

                var existing = await _context.Invoices.FirstOrDefaultAsync(i => i.SaleId == saleId);
                if (existing != null)
                {
                    return Conflict(new { message = "An invoice already exists for this sale", invoiceId = existing.Id });
                }

                string invoiceNumber;
                if (!string.IsNullOrWhiteSpace(body?.ManualInvoiceNumber))
                {
                    var manual = body!.ManualInvoiceNumber!.Trim();
                    var manualExists = await _context.Invoices.AnyAsync(i => i.InvoiceNumber == manual);
                    if (manualExists)
                    {
                        return Conflict(new { message = "Manual invoice number already exists", invoiceNumber = manual });
                    }
                    invoiceNumber = manual;
                }
                else
                {
                    invoiceNumber = await GenerateInvoiceNumberAsync();
                }

                var issueDate = DateTime.UtcNow;

                var invoice = new Invoice
                {
                    InvoiceNumber = invoiceNumber,
                    SaleId = sale.Id,
                    ClientId = sale.ClientId == 0 ? null : sale.ClientId,
                    IssueDate = issueDate,
                    DueDate = body?.DueDate,
                    Status = "Unpaid",
                    TotalAmount = 0m
                };

                _context.Invoices.Add(invoice);
                await _context.SaveChangesAsync();

                decimal total = 0m;
                foreach (var si in sale.SaleItems)
                {
                    var ii = new InvoiceItem
                    {
                        InvoiceId = invoice.Id,
                        ProductId = si.ProductId,
                        ProductName = si.Product?.Name ?? string.Empty,
                        Quantity = si.Quantity,
                        UnitPrice = si.UnitPrice,
                        LineTotal = si.UnitPrice * si.Quantity
                    };
                    total += ii.LineTotal;
                    _context.InvoiceItems.Add(ii);
                }

                invoice.TotalAmount = total;
                _context.Invoices.Update(invoice);
                await _context.SaveChangesAsync();

                var saved = await _context.Invoices
                    .Include(i => i.Client)
                    .Include(i => i.Items)
                    .FirstAsync(i => i.Id == invoice.Id);

                return CreatedAtAction(nameof(GetInvoice), new { id = saved.Id }, MapInvoiceToDto(saved));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating invoice from sale");
                return StatusCode(500, new { message = "Error creating invoice", error = ex.Message });
            }
        }

        // GET: /api/invoices
        [HttpGet]
        public async Task<ActionResult<IEnumerable<InvoiceDto>>> GetInvoices()
        {
            try
            {
                var invoices = await _context.Invoices
                    .Include(i => i.Client)
                    .Include(i => i.Items)
                    .OrderByDescending(i => i.IssueDate)
                    .ToListAsync();

                return Ok(invoices.Select(MapInvoiceToDto).ToList());
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving invoices");
                return StatusCode(500, new { message = "Error retrieving invoices", error = ex.Message });
            }
        }

        // GET: /api/invoices/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<InvoiceDto>> GetInvoice(int id)
        {
            try
            {
                var invoice = await _context.Invoices
                    .Include(i => i.Client)
                    .Include(i => i.Items)
                    .FirstOrDefaultAsync(i => i.Id == id);
                if (invoice == null)
                {
                    return NotFound(new { message = $"Invoice with ID {id} not found" });
                }
                return Ok(MapInvoiceToDto(invoice));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error retrieving invoice with ID {id}");
                return StatusCode(500, new { message = "Error retrieving invoice", error = ex.Message });
            }
        }

        private async Task<string> GenerateInvoiceNumberAsync()
        {
            var year = DateTime.UtcNow.Year;
            // Count existing invoices this year to derive next sequence
            var count = await _context.Invoices.CountAsync(i => i.IssueDate.Year == year);
            var seq = count + 1;
            var candidate = $"INV-{year}-{seq:000000}";

            // Ensure uniqueness in case of concurrent operations
            while (await _context.Invoices.AnyAsync(i => i.InvoiceNumber == candidate))
            {
                seq++;
                candidate = $"INV-{year}-{seq:000000}";
            }
            return candidate;
        }

        private static InvoiceDto MapInvoiceToDto(Invoice invoice)
        {
            return new InvoiceDto
            {
                Id = invoice.Id,
                InvoiceNumber = invoice.InvoiceNumber,
                SaleId = invoice.SaleId,
                ClientId = invoice.ClientId,
                IssueDate = invoice.IssueDate,
                DueDate = invoice.DueDate,
                TotalAmount = invoice.TotalAmount,
                Status = invoice.Status,
                Client = invoice.Client == null ? null : new InvoiceClientSummaryDto
                {
                    Id = invoice.Client.Id,
                    Name = invoice.Client.Name,
                    Email = invoice.Client.Email,
                    Phone = invoice.Client.Phone
                },
                Items = invoice.Items.Select(ii => new InvoiceItemDto
                {
                    Id = ii.Id,
                    ProductId = ii.ProductId,
                    ProductName = ii.ProductName,
                    Quantity = ii.Quantity,
                    UnitPrice = ii.UnitPrice,
                    LineTotal = ii.LineTotal
                }).ToList()
            };
        }
    }

    // DTOs
    public class CreateInvoiceFromSaleDto
    {
        public string? ManualInvoiceNumber { get; set; }
        public DateTime? DueDate { get; set; }
    }

    public class InvoiceDto
    {
        public int Id { get; set; }
        public string InvoiceNumber { get; set; } = string.Empty;
        public int SaleId { get; set; }
        public int? ClientId { get; set; }
        public DateTime IssueDate { get; set; }
        public DateTime? DueDate { get; set; }
        public decimal TotalAmount { get; set; }
        public string Status { get; set; } = string.Empty;
        public InvoiceClientSummaryDto? Client { get; set; }
        public List<InvoiceItemDto> Items { get; set; } = new();
    }

    public class InvoiceItemDto
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal LineTotal { get; set; }
    }

    public class InvoiceClientSummaryDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
    }
}
