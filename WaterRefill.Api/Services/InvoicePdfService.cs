using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using WaterRefill.Api.Models;

namespace WaterRefill.Api.Services
{
    public class InvoicePdfService
    {
        public byte[] Generate(Invoice invoice)
        {
            var companyName = "Water Refilling Station";
            var companyAddress = "123 Main St, City";
            var companyContact = "(+00) 000-000-0000 | info@example.com";

            var items = invoice.Items ?? new List<InvoiceItem>();
            var totalAmount = items.Sum(i => i.LineTotal);

            var document = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4);
                    page.Margin(2f, Unit.Centimetre);
                    page.DefaultTextStyle(x => x.FontSize(11));
                    page.PageColor(Colors.White);

                    page.Header().Element(Header);
                    page.Content().Element(Content);
                    page.Footer().Element(Footer);

                    void Header(IContainer header)
                    {
                        header.Row(row =>
                        {
                            row.RelativeItem().Column(col =>
                            {
                                col.Item().Text(companyName).SemiBold().FontSize(18);
                                col.Item().Text(companyAddress);
                                col.Item().Text(companyContact);
                            });
                            row.ConstantItem(200).Column(col =>
                            {
                                col.Item().Text($"Invoice").SemiBold().FontSize(16);
                                col.Item().PaddingTop(4).Text($"No: {invoice.InvoiceNumber}");
                                col.Item().Text($"Issued: {invoice.IssueDate:yyyy-MM-dd}");
                                col.Item().Text($"Due: {(invoice.DueDate.HasValue ? invoice.DueDate.Value.ToString("yyyy-MM-dd") : "-")}");
                                col.Item().Text($"Status: {invoice.Status}");
                            });
                        });
                    }

                    void Content(IContainer content)
                    {
                        content.PaddingTop(10).Column(col =>
                        {
                            col.Spacing(8);

                            // Client block
                            col.Item().Element(ClientBlock);

                            // Items table
                            col.Item().Element(ItemsTable);

                            // Total summary
                            col.Item().AlignRight().Text($"Total: {totalAmount:C}").SemiBold().FontSize(14);
                        });
                    }

                    void ClientBlock(IContainer container)
                    {
                        container.Column(col =>
                        {
                            col.Item().Text("Bill To").SemiBold();
                            if (invoice.Client != null)
                            {
                                col.Item().Text(invoice.Client.Name);
                                col.Item().Text(invoice.Client.Address);
                                col.Item().Text(invoice.Client.Email);
                                col.Item().Text(invoice.Client.Phone);
                            }
                            else
                            {
                                col.Item().Text("Walk-in Customer");
                            }
                        });
                    }

                    void ItemsTable(IContainer container)
                    {
                        container.Table(table =>
                        {
                            table.ColumnsDefinition(columns =>
                            {
                                columns.RelativeColumn(6); // Product
                                columns.RelativeColumn(2); // Quantity
                                columns.RelativeColumn(3); // Unit Price
                                columns.RelativeColumn(3); // Line Total
                            });

                            // Header
                            table.Header(header =>
                            {
                                header.Cell().Element(CellHeader).Text("Product");
                                header.Cell().Element(CellHeader).Text("Qty");
                                header.Cell().Element(CellHeader).Text("Unit Price");
                                header.Cell().Element(CellHeader).Text("Line Total");

                                static IContainer CellHeader(IContainer container) =>
                                    container.DefaultTextStyle(x => x.SemiBold())
                                        .PaddingVertical(5)
                                        .Background(Colors.Grey.Lighten3)
                                        .BorderBottom(1)
                                        .BorderColor(Colors.Grey.Lighten1);
                            });

                            // Rows
                            foreach (var item in items)
                            {
                                table.Cell().Element(Cell).Text(item.ProductName);
                                table.Cell().Element(Cell).Text(item.Quantity.ToString());
                                table.Cell().Element(Cell).Text(item.UnitPrice.ToString("C"));
                                table.Cell().Element(Cell).Text(item.LineTotal.ToString("C"));
                            }

                            static IContainer Cell(IContainer container) =>
                                container.PaddingVertical(5).BorderBottom(1).BorderColor(Colors.Grey.Lighten3);
                        });
                    }

                    void Footer(IContainer footer)
                    {
                        footer.Row(row =>
                        {
                            row.RelativeItem().Text("Thank you for your business").Italic().FontSize(10);
                            row.ConstantItem(50).AlignRight().DefaultTextStyle(x => x.FontSize(10)).Text(text =>
                            {
                                text.Span("Page ");
                                text.CurrentPageNumber();
                            });
                        });
                    }
                });
            });

            return document.GeneratePdf();
        }
    }
}
