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
        public DbSet<Invoice> Invoices { get; set; }
        public DbSet<InvoiceItem> InvoiceItems { get; set; }
        public DbSet<ClientProductPrice> ClientProductPrices { get; set; }

      protected override void OnModelCreating(ModelBuilder modelBuilder)
      {
        base.OnModelCreating(modelBuilder);

        // Invoice configuration
        modelBuilder.Entity<Invoice>(entity =>
        {
            entity.HasKey(i => i.Id);
            entity.Property(i => i.InvoiceNumber)
                .IsRequired();
            entity.HasIndex(i => i.InvoiceNumber)
                .IsUnique();
            // Ensure only one invoice per sale
            entity.HasIndex(i => i.SaleId)
                .IsUnique();

            entity.Property(i => i.SaleId)
                .IsRequired();
            entity.Property(i => i.IssueDate)
                .IsRequired();
            entity.Property(i => i.TotalAmount)
                .HasPrecision(18, 2)
                .IsRequired();
            entity.Property(i => i.Status)
                .IsRequired();

            entity.HasOne(i => i.Sale)
                .WithMany()
                .HasForeignKey(i => i.SaleId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(i => i.Client)
                .WithMany()
                .HasForeignKey(i => i.ClientId)
                .OnDelete(DeleteBehavior.NoAction);

            entity.HasMany(i => i.Items)
                .WithOne()
                .HasForeignKey(ii => ii.InvoiceId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // InvoiceItem configuration
        modelBuilder.Entity<InvoiceItem>(entity =>
        {
            entity.HasKey(ii => ii.Id);
            entity.Property(ii => ii.InvoiceId)
                .IsRequired();
            entity.Property(ii => ii.ProductName)
                .IsRequired();
            entity.Property(ii => ii.Quantity)
                .IsRequired();
            entity.Property(ii => ii.UnitPrice)
                .HasPrecision(18, 2)
                .IsRequired();
            entity.Property(ii => ii.LineTotal)
                .HasPrecision(18, 2)
                .IsRequired();
        });

        // ClientProductPrice configuration
        modelBuilder.Entity<ClientProductPrice>(entity =>
        {
            entity.HasKey(x => x.Id);
            entity.Property(x => x.ClientId).IsRequired();
            entity.Property(x => x.ProductId).IsRequired();
            entity.Property(x => x.Price).HasPrecision(18, 2).IsRequired();
            entity.Property(x => x.IsActive).HasDefaultValue(true);

            entity.Property(x => x.CreatedAt)
                  .HasColumnType("datetime2");
            entity.Property(x => x.UpdatedAt)
                  .HasColumnType("datetime2");

            entity.HasIndex(x => new { x.ClientId, x.ProductId }).IsUnique();

            entity.HasOne(x => x.Client)
                  .WithMany()
                  .HasForeignKey(x => x.ClientId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(x => x.Product)
                  .WithMany()
                  .HasForeignKey(x => x.ProductId)
                  .OnDelete(DeleteBehavior.Cascade);
        });
      }

      public override int SaveChanges()
      {
          SetAuditTimestamps();
          return base.SaveChanges();
      }

      public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
      {
          SetAuditTimestamps();
          return base.SaveChangesAsync(cancellationToken);
      }

      private void SetAuditTimestamps()
      {
          var utcNow = DateTime.UtcNow;

          foreach (var entry in ChangeTracker.Entries<ClientProductPrice>())
          {
              if (entry.State == EntityState.Added)
              {
                  entry.Entity.CreatedAt = utcNow;
                  entry.Entity.UpdatedAt = utcNow;
              }
              else if (entry.State == EntityState.Modified)
              {
                  entry.Entity.UpdatedAt = utcNow;
              }
          }
      }
    }
}
