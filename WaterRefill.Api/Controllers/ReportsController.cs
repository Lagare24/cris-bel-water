using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WaterRefill.Api.Data;

namespace WaterRefill.Api.Controllers
{
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
                    .Where(c => clientIds.Contains(c.Id))
                    .ToDictionaryAsync(c => c.Id, c => c);

                var result = query.Select(x => new TopClientDto
                {
                    ClientId = x.ClientId == 0 ? null : x.ClientId,
                    ClientName = x.ClientId == 0 ? "Walk-in" : (clients.TryGetValue(x.ClientId, out var c) ? c.Name : "Unknown"),
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
                    .Where(p => productIds.Contains(p.Id))
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
    }

    // DTOs
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
