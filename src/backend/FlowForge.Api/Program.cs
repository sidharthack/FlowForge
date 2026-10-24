using FlowForge.Api.Endpoints;
using FlowForge.Api.Services;
using FlowForge.Core.Entities;
using FlowForge.Core.Interfaces;
using FlowForge.Infra.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// DB Context
builder.Services.AddDbContext<FlowForgeDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Identity
builder.Services.AddIdentityCore<ApplicationUser>(options => {
    options.Password.RequireDigit = true;
    options.Password.RequiredLength = 8;
})
.AddEntityFrameworkStores<FlowForgeDbContext>()
.AddDefaultTokenProviders();

// JWT Authentication
var jwtSecret = builder.Configuration["JwtSettings:Secret"]!;
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["JwtSettings:Issuer"],
            ValidAudience = builder.Configuration["JwtSettings:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret))
        };
    });
builder.Services.AddAuthorization();

// Tenant Context Resolution
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<ICurrentTenantService, HttpCurrentTenantService>();

var app = builder.Build();

app.UseAuthentication();
app.UseAuthorization();

// Map Endpoints
app.MapGet("/", () => "FlowForge API is running!");
app.MapAuthEndpoints(builder.Configuration);

// Example protected endpoint to test tenant isolation
app.MapGet("/api/projects", async (FlowForgeDbContext db) => {
    // This will automatically filter by the logged-in user's TenantId!
    return await db.Projects.ToListAsync();
}).RequireAuthorization();

app.Run();