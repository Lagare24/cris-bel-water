using System;

namespace WaterRefill.Api.Models
{
    public class ClientProductPrice
    {
        public int Id { get; set; }
        public int ClientId { get; set; }
        public int ProductId { get; set; }
        public decimal Price { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public bool IsActive { get; set; } = true;

        public Client? Client { get; set; }
        public Product? Product { get; set; }
    }
}
