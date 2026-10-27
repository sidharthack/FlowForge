using FlowForge.Core.Interfaces;
using FlowForge.Infra.Data;
using Microsoft.EntityFrameworkCore;

namespace FlowForge.Api.Endpoints;

public static class UserEndpoints
{
    public static void MapUserEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/users").RequireAuthorization();

        group.MapGet("/", async (FlowForgeDbContext db, ICurrentTenantService tenantService) =>
        {
            // Fetch users belonging to the current tenant
            var users = await db.Users
                .Where(u => u.TenantId == tenantService.TenantId)
                .Select(u => new UserDto(u.Id, u.UserName!))
                .ToListAsync();

            return Results.Ok(users);
        });
    }
}

public record UserDto(string Id, string Name);