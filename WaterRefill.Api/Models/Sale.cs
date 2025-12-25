namespace WaterRefill.Api.Models
{
    public class Sale
    {
        public int Id { get; set; }
        public int? ClientId { get; set; }
        public DateTime SaleDate { get; set; }
        public decimal TotalAmount { get; set; }
        public Client? Client { get; set; }
        public List<SaleItem> SaleItems { get; set; } = new();
    }
}
