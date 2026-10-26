using FlowForge.Core.Entities;
using FlowForge.Infra.Data;
using Microsoft.EntityFrameworkCore;

namespace FlowForge.Api.Endpoints;

public static class ClientEndpoints
{
    public static void MapClientEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/clients").RequireAuthorization();

        group.MapGet("/", async (FlowForgeDbContext db) =>
        {
            // Global Query Filter automatically scopes this to the current Tenant!
            var clients = await db.Clients.Select(c => new ClientDto(c.Id, c.Name, c.ContactEmail)).ToListAsync();
            return Results.Ok(clients);
        });

        group.MapPost("/", async (CreateClientRequest req, FlowForgeDbContext db) =>
        {
            var client = new Client
            {
                Name = req.Name,
                ContactEmail = req.ContactEmail
            };

            db.Clients.Add(client);
            await db.SaveChangesAsync(); // TenantId is assigned automatically in SaveChangesAsync

            return Results.Created($"/api/clients/{client.Id}", new ClientDto(client.Id, client.Name, client.ContactEmail));
        });
    }
}

// DTOs for data transfer
public record ClientDto(Guid Id, string Name, string ContactEmail);
public record CreateClientRequest(string Name, string ContactEmail);