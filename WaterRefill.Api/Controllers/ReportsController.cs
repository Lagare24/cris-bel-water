using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WaterRefill.Api.Data;
using System.Text;
using QuestPDF.Fluent;
using QuestPDF.Infrastructure;
using QuestPDF.Helpers;

namespace WaterRefill.Api.Controllers
{
    [Authorize(Roles = "Admin,Staff")]
    [ApiController]
    [Route("api/[controller]")]
    public class ReportsController : ControllerBase
    {
        private readonly WaterRefillContext _context;
        private readonly ILogger<ReportsController> _logger;

        public ReportsController(WaterRefillContext context, ILogger<ReportsController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: /api/reports/sales?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&clientId=123&staffId=456
        [HttpGet("sales")]
        public async Task<ActionResult<SalesReportDto>> GetSalesReport(
            [FromQuery] DateTime? startDate,
            [FromQuery] DateTime? endDate,
            [FromQuery] int? clientId,
            [FromQuery] int? staffId)
        {
            try
            {
                var query = _context.Sales
                    .Include(s => s.Client)
                    .AsQueryable();

                // Filter by date range
                if (startDate.HasValue)
                {
                    query = query.Where(s => s.SaleDate.Date >= startDate.Value.Date);
                }

                if (endDate.HasValue)
                {
                    query = query.Where(s => s.SaleDate.Date <= endDate.Value.Date);
                }

                // Filter by clientId
                if (clientId.HasValue)
                {
                    query = query.Where(s => s.ClientId == clientId.Value);
                }

                // Exclude soft-deleted clients
                query = query.Where(s => s.Client == null || s.Client.IsActive);

                var sales = await query
                    .Include(s => s.SaleItems)
                    .ThenInclude(si => si.Product)
                    .ToListAsync();

                // Exclude sales with soft-deleted products
                sales = sales.Where(s => s.SaleItems.All(si => si.Product == null || si.Product.IsActive)).ToList();

                // Calculate summary data
                int totalSales = sales.Count;
                int totalItemsSold = sales.SelectMany(s => s.SaleItems).Sum(si => si.Quantity);
                decimal totalRevenue = sales.Sum(s => s.TotalAmount);

                var result = new SalesReportDto
                {
                    StartDate = startDate,
                    EndDate = endDate,
                    ClientId = clientId,
                    StaffId = staffId,
                    TotalSales = totalSales,
                    TotalItemsSold = totalItemsSold,
                    TotalRevenue = totalRevenue,
                    Sales = sales.Select(s => new SalesReportItemDto
                    {
                        SaleId = s.Id,
                        SaleDate = s.SaleDate,
                        ClientId = s.ClientId,
                        ClientName = s.Client?.Name ?? "Walk-in",
                        TotalAmount = s.TotalAmount,
                        ItemCount = s.SaleItems.Count
                    }).ToList()
                };

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating sales report");
                return StatusCode(500, new { message = "Error generating sales report", error = ex.Message });
            }
        }

        // GET: /api/reports/sales/csv?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&clientId=123
        [HttpGet("sales/csv")]
        public async Task<IActionResult> ExportSalesReportCsv(
            [FromQuery] DateTime? startDate,
            [FromQuery] DateTime? endDate,
            [FromQuery] int? clientId,
            [FromQuery] int? staffId)
        {
            try
            {
                var query = _context.Sales
                    .Include(s => s.Client)
                    .AsQueryable();

                if (startDate.HasValue)
                {
                    query = query.Where(s => s.SaleDate.Date >= startDate.Value.Date);
                }

                if (endDate.HasValue)
                {
                    query = query.Where(s => s.SaleDate.Date <= endDate.Value.Date);
                }

                if (clientId.HasValue)
                {
                    query = query.Where(s => s.ClientId == clientId.Value);
                }

                query = query.Where(s => s.Client == null || s.Client.IsActive);

                var sales = await query
                    .Include(s => s.SaleItems)
                    .ThenInclude(si => si.Product)
                    .OrderByDescending(s => s.SaleDate)
                    .ToListAsync();

                sales = sales.Where(s => s.SaleItems.All(si => si.Product == null || si.Product.IsActive)).ToList();

                // Generate CSV
                var sb = new StringBuilder();
                sb.AppendLine("Sale ID,Sale Date,Client Name,Item Count,Total Amount");

                foreach (var sale in sales)
                {
                    sb.AppendLine($"{sale.Id},{sale.SaleDate:yyyy-MM-dd},{EscapeCsvField(sale.Client?.Name ?? "Walk-in")},{sale.SaleItems.Count},{sale.TotalAmount:F2}");
                }

                var csv = sb.ToString();
                var bytes = Encoding.UTF8.GetBytes(csv);

                return File(bytes, "text/csv", $"SalesReport_{DateTime.Now:yyyyMMdd_HHmmss}.csv");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error exporting sales report to CSV");
                return StatusCode(500, new { message = "Error exporting sales report", error = ex.Message });
            }
        }

        // GET: /api/reports/sales/pdf?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&clientId=123
        [HttpGet("sales/pdf")]
        public async Task<IActionResult> ExportSalesReportPdf(
            [FromQuery] DateTime? startDate,
            [FromQuery] DateTime? endDate,
            [FromQuery] int? clientId,
            [FromQuery] int? staffId)
        {
            try
            {
                var query = _context.Sales
                    .Include(s => s.Client)
                    .AsQueryable();

                if (startDate.HasValue)
                {
                    query = query.Where(s => s.SaleDate.Date >= startDate.Value.Date);
                }

                if (endDate.HasValue)
                {
                    query = query.Where(s => s.SaleDate.Date <= endDate.Value.Date);
                }

                if (clientId.HasValue)
                {
                    query = query.Where(s => s.ClientId == clientId.Value);
                }

                query = query.Where(s => s.Client == null || s.Client.IsActive);

                var sales = await query
                    .Include(s => s.SaleItems)
                    .ThenInclude(si => si.Product)
                    .OrderByDescending(s => s.SaleDate)
                    .ToListAsync();

                sales = sales.Where(s => s.SaleItems.All(si => si.Product == null || si.Product.IsActive)).ToList();

                // Calculate summary
                int totalSales = sales.Count;
                int totalItemsSold = sales.SelectMany(s => s.SaleItems).Sum(si => si.Quantity);
                decimal totalRevenue = sales.Sum(s => s.TotalAmount);

                // Generate PDF using QuestPDF
                var pdf = Document.Create(container =>
                {
                    container.Page(page =>
                    {
                        page.Size(PageSizes.A4);
                        page.Margin(20);

                        page.Header().Element(header =>
                        {
                            header.Text("Sales Report").Bold().FontSize(24);
                        });

                        page.Content().Column(col =>
                        {
                            col.Spacing(10);

                            // Filter info
                            var filterText = $"Period: {(startDate?.ToString("yyyy-MM-dd") ?? "Start")} to {(endDate?.ToString("yyyy-MM-dd") ?? "End")}";
                            if (clientId.HasValue)
                            {
                                filterText += $" | Client ID: {clientId}";
                            }
                            col.Item().Text(filterText).FontSize(10);

                            // Summary section
                            col.Item().PaddingTop(10).PaddingBottom(10).Element(summary =>
                            {
                                summary.Row(row =>
                                {
                                    row.RelativeItem().Text($"Total Sales: {totalSales}").Bold();
                                    row.RelativeItem().Text($"Total Items: {totalItemsSold}").Bold();
                                    row.RelativeItem().Text($"Total Revenue: ${totalRevenue:F2}").Bold();
                                });
                            });

                            // Table rows
                            col.Item().Element(table =>
                            {
                                table.Column(tableCol =>
                                {
                                    // Header
                                    tableCol.Item().BorderBottom(1).BorderColor("CCCCCC").Element(header =>
                                    {
                                        header.Row(row =>
                                        {
                                            row.RelativeItem(1).Text("Date").Bold().FontSize(10);
                                            row.RelativeItem(2).Text("Client").Bold().FontSize(10);
                                            row.RelativeItem(1).Text("Items").Bold().FontSize(10);
                                            row.RelativeItem(1).Text("Amount").Bold().FontSize(10);
                                        });
                                    });

                                    // Rows
                                    foreach (var sale in sales.Take(100))
                                    {
                                        tableCol.Item().BorderBottom(1).BorderColor("EEEEEE").Element(row =>
                                        {
                                            row.Row(r =>
                                            {
                                                r.RelativeItem(1).Text(sale.SaleDate.ToString("yyyy-MM-dd")).FontSize(9);
                                                r.RelativeItem(2).Text(sale.Client?.Name ?? "Walk-in").FontSize(9);
                                                r.RelativeItem(1).Text(sale.SaleItems.Count.ToString()).FontSize(9);
                                                r.RelativeItem(1).Text($"${sale.TotalAmount:F2}").FontSize(9);
                                            });
                                        });
                                    }

                                    if (sales.Count > 100)
                                    {
                                        tableCol.Item().Text($"... and {sales.Count - 100} more records").FontSize(9);
                                    }
                                });
                            });
                        });

                        page.Footer().AlignCenter().Text($"Generated on {DateTime.Now:yyyy-MM-dd HH:mm:ss}").FontSize(8);
                    });
                }).GeneratePdf();

                return File(pdf, "application/pdf", $"SalesReport_{DateTime.Now:yyyyMMdd_HHmmss}.pdf");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error exporting sales report to PDF");
                return StatusCode(500, new { message = "Error exporting sales report", error = ex.Message });
            }
        }


        // GET: /api/reports/daily-sales?date=YYYY-MM-DD
        [HttpGet("daily-sales")]
        public async Task<ActionResult<DailySalesReportDto>> GetDailySales([FromQuery] DateTime? date)
        {
            if (!date.HasValue)
            {
                return BadRequest(new { message = "Query parameter 'date' is required (YYYY-MM-DD)" });
            }

            var targetDate = date.Value.Date;

            try
            {
                var salesQuery = _context.Sales.Where(s => s.SaleDate.Date == targetDate);
                var invoiceQuery = _context.Invoices.Where(i => i.IssueDate.Date == targetDate);
                var saleItemsQuery = _context.SaleItems.Where(si => si.Sale!.SaleDate.Date == targetDate);

                var salesCount = await salesQuery.CountAsync();
                var salesTotal = await salesQuery.Select(s => s.TotalAmount).DefaultIfEmpty(0m).SumAsync();
                var invoicesCount = await invoiceQuery.CountAsync();
                var invoicesTotal = await invoiceQuery.Select(i => i.TotalAmount).DefaultIfEmpty(0m).SumAsync();
                var itemsCount = await saleItemsQuery.Select(si => si.Quantity).DefaultIfEmpty(0).SumAsync();

                var result = new DailySalesReportDto
                {
                    Date = targetDate,
                    SalesCount = salesCount,
                    TotalSalesAmount = salesTotal,
                    InvoiceCount = invoicesCount,
                    TotalInvoiceAmount = invoicesTotal,
                    TotalItemsSold = itemsCount
                };

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating daily sales report");
                return StatusCode(500, new { message = "Error generating daily sales report", error = ex.Message });
            }
        }

        // GET: /api/reports/monthly-sales?year=YYYY&month=MM
        [HttpGet("monthly-sales")]
        public async Task<ActionResult<MonthlySalesReportDto>> GetMonthlySales([FromQuery] int? year, [FromQuery] int? month)
        {
            if (year is null || month is null || month < 1 || month > 12)
            {
                return BadRequest(new { message = "Query parameters 'year' and 'month' are required (month 1-12)" });
            }

            try
            {
                var salesQuery = _context.Sales.Where(s => s.SaleDate.Year == year && s.SaleDate.Month == month);
                var invoiceQuery = _context.Invoices.Where(i => i.IssueDate.Year == year && i.IssueDate.Month == month);
                var saleItemsQuery = _context.SaleItems.Where(si => si.Sale!.SaleDate.Year == year && si.Sale.SaleDate.Month == month);

                var salesCount = await salesQuery.CountAsync();
                var salesTotal = await salesQuery.Select(s => s.TotalAmount).DefaultIfEmpty(0m).SumAsync();
                var invoicesCount = await invoiceQuery.CountAsync();
                var invoicesTotal = await invoiceQuery.Select(i => i.TotalAmount).DefaultIfEmpty(0m).SumAsync();
                var itemsCount = await saleItemsQuery.Select(si => si.Quantity).DefaultIfEmpty(0).SumAsync();

                var result = new MonthlySalesReportDto
                {
                    Year = year.Value,
                    Month = month.Value,
                    SalesCount = salesCount,
                    TotalSalesAmount = salesTotal,
                    InvoiceCount = invoicesCount,
                    TotalInvoiceAmount = invoicesTotal,
                    TotalItemsSold = itemsCount
                };

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating monthly sales report");
                return StatusCode(500, new { message = "Error generating monthly sales report", error = ex.Message });
            }
        }

        // GET: /api/reports/top-clients?limit=10
        [HttpGet("top-clients")]
        public async Task<ActionResult<IEnumerable<TopClientDto>>> GetTopClients([FromQuery] int limit = 10)
        {
            if (limit <= 0)
            {
                return BadRequest(new { message = "limit must be greater than 0" });
            }

            try
            {
                var query = await _context.Sales
                    .GroupBy(s => s.ClientId)
                    .Select(g => new
                    {
                        ClientId = g.Key,
                        SalesCount = g.Count(),
                        TotalAmount = g.Sum(x => x.TotalAmount)
                    })
                    .OrderByDescending(x => x.TotalAmount)
                    .ThenByDescending(x => x.SalesCount)
                    .Take(limit)
                    .ToListAsync();

                var clientIds = query.Where(x => x.ClientId != 0).Select(x => x.ClientId).ToList();
                var clients = await _context.Clients
                    .Where(c => clientIds.Contains(c.Id) && c.IsActive)
                    .ToDictionaryAsync(c => c.Id, c => c);

                var result = query.Select(x => new TopClientDto
                {
                    ClientId = x.ClientId,
                    ClientName = x.ClientId == null ? "Walk-in" : (clients.TryGetValue(x.ClientId.Value, out var c) ? c.Name : "Unknown"),
                    SalesCount = x.SalesCount,
                    TotalAmount = x.TotalAmount
                }).ToList();

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating top clients report");
                return StatusCode(500, new { message = "Error generating top clients report", error = ex.Message });
            }
        }

        // GET: /api/reports/top-products?limit=10
        [HttpGet("top-products")]
        public async Task<ActionResult<IEnumerable<TopProductDto>>> GetTopProducts([FromQuery] int limit = 10)
        {
            if (limit <= 0)
            {
                return BadRequest(new { message = "limit must be greater than 0" });
            }

            try
            {
                var grouped = await _context.SaleItems
                    .GroupBy(si => si.ProductId)
                    .Select(g => new
                    {
                        ProductId = g.Key,
                        Quantity = g.Sum(x => x.Quantity),
                        Revenue = g.Sum(x => x.UnitPrice * x.Quantity)
                    })
                    .OrderByDescending(x => x.Revenue)
                    .ThenByDescending(x => x.Quantity)
                    .Take(limit)
                    .ToListAsync();

                var productIds = grouped.Select(x => x.ProductId).ToList();
                var products = await _context.Products
                    .Where(p => productIds.Contains(p.Id) && p.IsActive)
                    .ToDictionaryAsync(p => p.Id, p => p);

                var result = grouped.Select(x => new TopProductDto
                {
                    ProductId = x.ProductId,
                    ProductName = products.TryGetValue(x.ProductId, out var p) ? p.Name : "Unknown",
                    TotalQuantity = x.Quantity,
                    TotalRevenue = x.Revenue
                }).ToList();

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating top products report");
                return StatusCode(500, new { message = "Error generating top products report", error = ex.Message });
            }
        }

        // Helper method to escape CSV fields
        private static string EscapeCsvField(string field)
        {
            if (string.IsNullOrEmpty(field))
                return string.Empty;

            if (field.Contains(",") || field.Contains("\"") || field.Contains("\n"))
            {
                return $"\"{field.Replace("\"", "\"\"")}\"";
            }

            return field;
        }
    }

    // DTOs for Reports
    public class SalesReportDto
    {
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public int? ClientId { get; set; }
        public int? StaffId { get; set; }
        public int TotalSales { get; set; }
        public int TotalItemsSold { get; set; }
        public decimal TotalRevenue { get; set; }
        public List<SalesReportItemDto> Sales { get; set; } = new();
    }

    public class SalesReportItemDto
    {
        public int SaleId { get; set; }
        public DateTime SaleDate { get; set; }
        public int? ClientId { get; set; }
        public string ClientName { get; set; } = string.Empty;
        public decimal TotalAmount { get; set; }
        public int ItemCount { get; set; }
    }

    public class DailySalesReportDto
    {
        public DateTime Date { get; set; }
        public int SalesCount { get; set; }
        public decimal TotalSalesAmount { get; set; }
        public int InvoiceCount { get; set; }
        public decimal TotalInvoiceAmount { get; set; }
        public int TotalItemsSold { get; set; }
    }

    public class MonthlySalesReportDto
    {
        public int Year { get; set; }
        public int Month { get; set; }
        public int SalesCount { get; set; }
        public decimal TotalSalesAmount { get; set; }
        public int InvoiceCount { get; set; }
        public decimal TotalInvoiceAmount { get; set; }
        public int TotalItemsSold { get; set; }
    }

    public class TopClientDto
    {
        public int? ClientId { get; set; }
        public string ClientName { get; set; } = string.Empty;
        public int SalesCount { get; set; }
        public decimal TotalAmount { get; set; }
    }

    public class TopProductDto
    {
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public int TotalQuantity { get; set; }
        public decimal TotalRevenue { get; set; }
    }
}
