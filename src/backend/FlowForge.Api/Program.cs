using FlowForge.Api.Endpoints;
using FlowForge.Api.Services;
using FlowForge.Core.Entities;
using FlowForge.Core.Interfaces;
using FlowForge.Infra.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
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

// --- SWAGGER CONFIGURATION ---
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo { Title = "FlowForge API", Version = "v1" });

    // Define the JWT Bearer security scheme
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header. \r\n\r\nEnter your token in the text input below.\r\n(Swagger automatically adds the 'Bearer ' prefix).",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer"
    });

    // Apply the security scheme globally to all endpoints
    options.AddSecurityRequirement(document => new OpenApiSecurityRequirement
    {
        [new OpenApiSecuritySchemeReference("Bearer", document)] = []
    });
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5174")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// -----------------------------

var app = builder.Build();
app.UseCors("AllowFrontend");
// Enable Swagger Middleware in Development
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseAuthentication();
app.UseAuthorization();

// Map Endpoints
app.MapGet("/", () => "FlowForge API is running! Navigate to /swagger to test endpoints.");
app.MapAuthEndpoints(builder.Configuration);

// Example protected endpoint to test tenant isolation
app.MapGet("/api/projects", async (FlowForgeDbContext db) => {
    // This will automatically filter by the logged-in user's TenantId!
    return await db.Projects.ToListAsync();
}).RequireAuthorization();

app.Run();