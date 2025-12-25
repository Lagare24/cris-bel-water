using Microsoft.EntityFrameworkCore;
using WaterRefill.Api.Models;

namespace WaterRefill.Api.Data
{
    public class WaterRefillContext : DbContext
    {
        public WaterRefillContext(DbContextOptions<WaterRefillContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Client> Clients { get; set; }
        public DbSet<Product> Products { get; set; }
        public DbSet<Sale> Sales { get; set; }
        public DbSet<SaleItem> SaleItems { get; set; }
    }
}
