using FlowForge.Core.Entities;
using FlowForge.Infra.Data;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace FlowForge.Api.Endpoints;

public static class AuthEndpoints
{
    public static void MapAuthEndpoints(this IEndpointRouteBuilder app, IConfiguration configuration)
    {
        var group = app.MapGroup("/api/auth");

        group.MapPost("/register", async (RegisterRequest req, UserManager<ApplicationUser> userManager, FlowForgeDbContext db) =>
        {
            // 1. Create the new Tenant (Organization)
            var tenant = new Tenant { Name = req.OrganizationName };
            db.Tenants.Add(tenant);
            await db.SaveChangesAsync();

            // 2. Create the User linked to the Tenant
            var user = new ApplicationUser
            {
                UserName = req.Email,
                Email = req.Email,
                TenantId = tenant.Id
            };

            var result = await userManager.CreateAsync(user, req.Password);
            if (!result.Succeeded) return Results.BadRequest(result.Errors);

            return Results.Ok(new { Message = "Registration successful." });
        });

        group.MapPost("/login", async (LoginRequest req, UserManager<ApplicationUser> userManager) =>
        {
            var user = await userManager.FindByEmailAsync(req.Email);
            if (user == null || !await userManager.CheckPasswordAsync(user, req.Password))
                return Results.Unauthorized();

            // 3. Generate JWT with the TenantId claim
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes(configuration["JwtSettings:Secret"]!);
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(JwtRegisteredClaimNames.Sub, user.Id),
                    new Claim(JwtRegisteredClaimNames.Email, user.Email!),
                    new Claim("tenantId", user.TenantId.ToString()) // Critical for Isolation
                }),
                Expires = DateTime.UtcNow.AddMinutes(configuration.GetValue<int>("JwtSettings:ExpirationMinutes")),
                Issuer = configuration["JwtSettings:Issuer"],
                Audience = configuration["JwtSettings:Audience"],
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return Results.Ok(new { Token = tokenHandler.WriteToken(token) });
        });
    }
}

public record RegisterRequest(string Email, string Password, string OrganizationName);
public record LoginRequest(string Email, string Password);