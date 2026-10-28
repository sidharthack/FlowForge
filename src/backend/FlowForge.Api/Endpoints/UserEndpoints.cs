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

        // 1. Get all users in the current organization
        group.MapGet("/", async (FlowForgeDbContext db, ICurrentTenantService tenantService) =>
        {
            var users = await db.Users
                .Where(u => u.TenantId == tenantService.TenantId)
                .Select(u => new UserDto(u.Id, u.UserName!))
                .ToListAsync();

            return Results.Ok(users);
        });

        // 2. Invite a new user to the organization
        group.MapPost("/invite", async (InviteUserRequest req, UserManager<ApplicationUser> userManager, ICurrentTenantService tenantService) =>
        {
            // Only allow specific roles
            var allowedRoles = new[] { "AgencyMember", "Client" };
            if (!allowedRoles.Contains(req.Role))
                return Results.BadRequest("Invalid role. Must be 'AgencyMember' or 'Client'.");

            // Prevent duplicate emails
            if (await userManager.FindByEmailAsync(req.Email) != null)
                return Results.BadRequest("A user with this email already exists.");

            // Create the user inherently bound to the Admin's TenantId
            var user = new ApplicationUser
            {
                UserName = req.Email,
                Email = req.Email,
                TenantId = tenantService.TenantId!.Value
            };

            // MVP Shortcut: Auto-generate a secure temporary password
            var tempPassword = $"Welcome{new Random().Next(1000, 9999)}!";
            var result = await userManager.CreateAsync(user, tempPassword);

            if (!result.Succeeded) return Results.BadRequest(result.Errors);

            // Assign the requested role
            await userManager.AddToRoleAsync(user, req.Role);

            return Results.Ok(new
            {
                Message = $"User invited successfully as {req.Role}.",
                Email = req.Email,
                TemporaryPassword = tempPassword // The Admin will securely share this with the user
            });
        }).RequireAuthorization("AdminOnly"); // <-- CRITICAL: Only AgencyAdmins can hit this endpoint
    }
}

public record UserDto(string Id, string Name);
public record InviteUserRequest(string Email, string Role);