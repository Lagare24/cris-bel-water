using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;
using WaterRefill.Api.Models;

namespace WaterRefill.Api.Data;

public static class DataSeeder
{
    public static async Task SeedDataAsync(WaterRefillContext context)
    {
        // Check if data already exists
        if (await context.Users.AnyAsync() || await context.Clients.AnyAsync())
        {
            Console.WriteLine("Database already seeded. Skipping seed data.");
            return;
        }

        Console.WriteLine("Seeding database with demo data...");

        // Helper for hashing passwords (matches AuthController.HashPassword)
        string HashPassword(string password)
        {
            using var sha256 = SHA256.Create();
            var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
            return Convert.ToBase64String(hashedBytes);
        }

        // Seed Users
        var users = new List<User>
        {
            new User
            {
                FullName = "Admin User",
                Username = "admin",
                PasswordHash = HashPassword("admin123"),
                Role = "Admin",
                IsActive = true
            },
            new User
            {
                FullName = "Staff Member One",
                Username = "staff1",
                PasswordHash = HashPassword("staff123"),
                Role = "Staff",
                IsActive = true
            },
            new User
            {
                FullName = "Staff Member Two",
                Username = "staff2",
                PasswordHash = HashPassword("staff123"),
                Role = "Staff",
                IsActive = true
            }
        };
        context.Users.AddRange(users);
        await context.SaveChangesAsync();

        // Seed Clients
        var clients = new List<Client>
        {
            new Client { Name = "Walk-in Customer", Email = "walkin@waterrefill.com", Phone = "000-0000", Address = "N/A", IsActive = true },
            new Client { Name = "ABC Corporation", Email = "contact@abc.com", Phone = "555-0101", Address = "123 Business St", IsActive = true },
            new Client { Name = "XYZ Restaurant", Email = "orders@xyz.com", Phone = "555-0102", Address = "456 Food Ave", IsActive = true },
            new Client { Name = "Smith Family", Email = "smith@email.com", Phone = "555-0103", Address = "789 Home Rd", IsActive = true },
            new Client { Name = "Green Gym", Email = "info@greengym.com", Phone = "555-0104", Address = "321 Fitness Blvd", IsActive = true },
            new Client { Name = "Tech Startup Inc", Email = "hello@techstartup.com", Phone = "555-0105", Address = "654 Innovation Dr", IsActive = true },
            new Client { Name = "Downtown Cafe", Email = "cafe@downtown.com", Phone = "555-0106", Address = "987 Main St", IsActive = true },
            new Client { Name = "Johnson Household", Email = "johnson@email.com", Phone = "555-0107", Address = "147 Oak Lane", IsActive = true },
            new Client { Name = "City School", Email = "admin@cityschool.edu", Phone = "555-0108", Address = "258 Education Way", IsActive = true },
            new Client { Name = "Wellness Spa", Email = "booking@wellnessspa.com", Phone = "555-0109", Address = "369 Relax Ave", IsActive = false },
            new Client { Name = "Martinez Office", Email = "martinez@business.com", Phone = "555-0110", Address = "741 Corporate Plaza", IsActive = true }
        };
        context.Clients.AddRange(clients);
        await context.SaveChangesAsync();

        // Seed Products (Prices in PHP - Philippine Peso)
        var products = new List<Product>
        {
            new Product { Name = "5-Gallon Refill", Description = "Standard 5-gallon water refill", Price = 35.00m, Quantity = 500, IsActive = true },
            new Product { Name = "3-Gallon Refill", Description = "Medium 3-gallon water refill", Price = 25.00m, Quantity = 300, IsActive = true },
            new Product { Name = "1-Gallon Refill", Description = "Small 1-gallon water refill", Price = 15.00m, Quantity = 200, IsActive = true },
            new Product { Name = "500ml Bottle", Description = "Purified water in 500ml bottle", Price = 10.00m, Quantity = 1000, IsActive = true },
            new Product { Name = "1-Liter Bottle", Description = "Purified water in 1-liter bottle", Price = 18.00m, Quantity = 800, IsActive = true },
            new Product { Name = "Empty 5-Gallon Container", Description = "New empty container for refills", Price = 250.00m, Quantity = 50, IsActive = true },
            new Product { Name = "Dispenser Pump", Description = "Manual water dispenser pump", Price = 150.00m, Quantity = 30, IsActive = true },
            new Product { Name = "Alkaline 5-Gallon", Description = "Alkaline water 5-gallon refill", Price = 50.00m, Quantity = 150, IsActive = true },
            new Product { Name = "Mineral 3-Gallon", Description = "Mineral-enriched 3-gallon refill", Price = 35.00m, Quantity = 100, IsActive = true },
            new Product { Name = "Distilled 5-Gallon", Description = "Distilled water for medical/lab use", Price = 60.00m, Quantity = 80, IsActive = true },
            new Product { Name = "2-Gallon Jug", Description = "Portable 2-gallon water jug", Price = 20.00m, Quantity = 120, IsActive = true },
            new Product { Name = "Cleaning Service", Description = "Container cleaning and sanitization", Price = 50.00m, Quantity = 0, IsActive = true },
            new Product { Name = "Premium Filtered 5-Gallon", Description = "7-stage filtered premium water", Price = 45.00m, Quantity = 200, IsActive = true },
            new Product { Name = "Water Cooler Rental", Description = "Monthly water cooler rental", Price = 200.00m, Quantity = 15, IsActive = true },
            new Product { Name = "Vintage 5-Gallon (Discontinued)", Description = "Old product line", Price = 30.00m, Quantity = 5, IsActive = false }
        };
        context.Products.AddRange(products);
        await context.SaveChangesAsync();

        // Seed Sales (with SaleItems)
        var random = new Random();
        var sales = new List<Sale>();

        for (int i = 0; i < 30; i++)
        {
            var daysAgo = random.Next(1, 60);
            var saleDate = DateTime.UtcNow.AddDays(-daysAgo);
            var hasClient = random.Next(0, 10) > 3; // 60% have a client, 40% walk-in

            var sale = new Sale
            {
                ClientId = hasClient ? clients[random.Next(1, clients.Count - 1)].Id : clients[0].Id, // Use Walk-in Customer (first client)
                SaleDate = saleDate,
                TotalAmount = 0, // Will calculate below
                SaleItems = new List<SaleItem>()
            };

            // Add 1-4 items per sale
            var itemCount = random.Next(1, 5);
            for (int j = 0; j < itemCount; j++)
            {
                var product = products[random.Next(products.Count - 1)]; // Exclude discontinued
                var quantity = random.Next(1, 6);
                var unitPrice = product.Price;

                sale.SaleItems.Add(new SaleItem
                {
                    ProductId = product.Id,
                    Quantity = quantity,
                    UnitPrice = unitPrice
                });
            }

            sale.TotalAmount = sale.SaleItems.Sum(item => item.Quantity * item.UnitPrice);
            sales.Add(sale);
        }

        context.Sales.AddRange(sales);
        await context.SaveChangesAsync();

        Console.WriteLine($"✅ Database seeded successfully!");
        Console.WriteLine($"   - {users.Count} users");
        Console.WriteLine($"   - {clients.Count} clients");
        Console.WriteLine($"   - {products.Count} products");
        Console.WriteLine($"   - {sales.Count} sales with {sales.Sum(s => s.SaleItems.Count)} items");
        Console.WriteLine();
        Console.WriteLine("Demo Credentials:");
        Console.WriteLine("   Admin: admin / admin123");
        Console.WriteLine("   Staff: staff1 / staff123");
    }
}
