using FlowForge.Core.Entities;
using FlowForge.Core.Interfaces;
using FlowForge.Infra.Data;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace FlowForge.Api.Endpoints;

public static class UserEndpoints
{
    public static void MapUserEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/users").RequireAuthorization();

        group.MapGet("/", async (FlowForgeDbContext db, ICurrentTenantService tenantService) =>
        {
            var users = await db.Users
                .Where(u => u.TenantId == tenantService.TenantId)
                .Select(u => new UserDto(u.Id, u.UserName!))
                .ToListAsync();

            return Results.Ok(users);
        });

        group.MapPost("/invite", async (InviteUserRequest req, UserManager<ApplicationUser> userManager, ICurrentTenantService tenantService, FlowForgeDbContext db) =>
        {
            var allowedRoles = new[] { "AgencyMember", "Client" };
            if (!allowedRoles.Contains(req.Role))
                return Results.BadRequest("Invalid role. Must be 'AgencyMember' or 'Client'.");

            // NEW: Enforce ClientId requirement for external clients
            if (req.Role == "Client")
            {
                if (!req.ClientId.HasValue)
                    return Results.BadRequest("ClientId is required when inviting a Client.");

                var clientExists = await db.Clients.AnyAsync(c => c.Id == req.ClientId.Value);
                if (!clientExists)
                    return Results.BadRequest("Invalid Client ID.");
            }

            if (await userManager.FindByEmailAsync(req.Email) != null)
                return Results.BadRequest("A user with this email already exists.");

            var user = new ApplicationUser
            {
                UserName = req.Email,
                Email = req.Email,
                TenantId = tenantService.TenantId!.Value,
                ClientId = req.ClientId // NEW: Associate with the client record
            };

            var tempPassword = $"Welcome{new Random().Next(1000, 9999)}!";
            var result = await userManager.CreateAsync(user, tempPassword);

            if (!result.Succeeded) return Results.BadRequest(result.Errors);

            await userManager.AddToRoleAsync(user, req.Role);

            return Results.Ok(new
            {
                Message = $"User invited successfully as {req.Role}.",
                Email = req.Email,
                TemporaryPassword = tempPassword
            });
        }).RequireAuthorization("AdminOnly");
    }
}

public record UserDto(string Id, string Name);
public record InviteUserRequest(string Email, string Role, Guid? ClientId); // UPDATED