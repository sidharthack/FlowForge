using FlowForge.Core.Interfaces;
using FlowForge.Infra.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Register DB Context with SQL Server
builder.Services.AddDbContext<FlowForgeDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Temporary dummy service to allow the app to compile and run migrations
builder.Services.AddScoped<ICurrentTenantService, DummyTenantService>();

var app = builder.Build();

app.MapGet("/", () => "FlowForge API is running!");

app.Run();

// Dummy implementation (will be replaced by real JWT claims extraction)
class DummyTenantService : ICurrentTenantService
{
    public Guid? TenantId => Guid.Empty;
}