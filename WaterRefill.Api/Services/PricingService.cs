using Microsoft.EntityFrameworkCore;
using WaterRefill.Api.Data;
using WaterRefill.Api.Models;

namespace WaterRefill.Api.Services
{
    public class PricingService
    {
        private readonly WaterRefillContext _context;
        private readonly ILogger<PricingService> _logger;

        public PricingService(WaterRefillContext context, ILogger<PricingService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public decimal GetEffectivePrice(int clientId, int productId)
        {
            // Validate product
            var product = _context.Products.FirstOrDefault(p => p.Id == productId);
            if (product == null)
                throw new KeyNotFoundException($"Product with ID {productId} not found");
            if (!product.IsActive)
                throw new InvalidOperationException($"Product with ID {productId} is inactive");

            // Validate client
            var client = _context.Clients.FirstOrDefault(c => c.Id == clientId);
            if (client == null)
                throw new KeyNotFoundException($"Client with ID {clientId} not found");
            // Client model currently has no IsActive flag; assume active if present elsewhere

            // Override if exists and active
            var overridePrice = _context.ClientProductPrices
                .FirstOrDefault(x => x.ClientId == clientId && x.ProductId == productId && x.IsActive);

            return overridePrice?.Price ?? product.Price;
        }

        public async Task<decimal> GetEffectivePriceAsync(int clientId, int productId, CancellationToken cancellationToken = default)
        {
            // Validate product
            var product = await _context.Products
                .FirstOrDefaultAsync(p => p.Id == productId, cancellationToken);
            if (product == null)
                throw new KeyNotFoundException($"Product with ID {productId} not found");
            if (!product.IsActive)
                throw new InvalidOperationException($"Product with ID {productId} is inactive");

            // Validate client
            var client = await _context.Clients
                .FirstOrDefaultAsync(c => c.Id == clientId, cancellationToken);
            if (client == null)
                throw new KeyNotFoundException($"Client with ID {clientId} not found");

            var overridePrice = await _context.ClientProductPrices
                .Where(x => x.ClientId == clientId && x.ProductId == productId && x.IsActive)
                .FirstOrDefaultAsync(cancellationToken);

            return overridePrice?.Price ?? product.Price;
        }
    }
}
