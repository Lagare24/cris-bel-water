using WaterRefill.Api.Data;
using Microsoft.EntityFrameworkCore;
using WaterRefill.Api.Services;

var builder = WebApplication.CreateBuilder(args);

// Add DbContext
builder.Services.AddDbContext<WaterRefillContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Add services
builder.Services.AddControllers();
builder.Services.AddScoped<InvoicePdfService>();
var app = builder.Build();

app.MapControllers();
app.Run();
