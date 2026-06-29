namespace WaterRefill.Api.Models
{
    public class Product
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public int Quantity { get; set; }
        public int MinStock { get; set; } = 10;
        public int MaxStock { get; set; } = 50;
        public bool IsActive { get; set; } = true;
    }
}
