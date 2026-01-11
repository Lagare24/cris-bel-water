namespace WaterRefill.Api.Models
{
    public class Invoice
    {
        public int Id { get; set; }
        public string InvoiceNumber { get; set; } = string.Empty;
        public int SaleId { get; set; }
        public int? ClientId { get; set; }
        public DateTime IssueDate { get; set; }
        public DateTime? DueDate { get; set; }
        public decimal TotalAmount { get; set; }
        public string Status { get; set; } = string.Empty; // Unpaid, Paid, Cancelled

        public Sale Sale { get; set; }
        public Client? Client { get; set; }
        public ICollection<InvoiceItem> Items { get; set; } = new List<InvoiceItem>();
    }
}
