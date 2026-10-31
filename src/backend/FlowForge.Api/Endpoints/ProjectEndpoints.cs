using FlowForge.Core.Entities;
using FlowForge.Infra.Data;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace FlowForge.Api.Endpoints;

public static class ProjectEndpoints
{
    public static void MapProjectEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/projects").RequireAuthorization();

        // UPDATED: Inject ClaimsPrincipal to verify identity
        group.MapGet("/", async (ClaimsPrincipal user, FlowForgeDbContext db) =>
        {
            var query = db.Projects.Include(p => p.Client).AsQueryable();

            // NEW: Restrict data access if the user is a Client
            if (user.IsInRole("Client"))
            {
                var clientIdClaim = user.FindFirst("clientId")?.Value;
                if (Guid.TryParse(clientIdClaim, out var clientId))
                {
                    query = query.Where(p => p.ClientId == clientId);
                }
                else
                {
                    // Fail-safe: if they are a client but lack a ClientId claim, return empty
                    return Results.Ok(new List<ProjectDto>());
                }
            }

            var projects = await query
                .Select(p => new ProjectDto(p.Id, p.Name, p.Description, p.Status, p.Client!.Name))
                .ToListAsync();

            return Results.Ok(projects);
        });

        group.MapPost("/", async (CreateProjectRequest req, FlowForgeDbContext db) =>
        {
            // Verify the client exists and belongs to the tenant (filter handles this implicitly)
            var clientExists = await db.Clients.AnyAsync(c => c.Id == req.ClientId);
            if (!clientExists) return Results.BadRequest("Invalid Client ID.");

            var project = new Project
            {
                Name = req.Name,
                Description = req.Description,
                ClientId = req.ClientId,
                Status = "Active"
            };

            db.Projects.Add(project);
            await db.SaveChangesAsync();

            return Results.Created($"/api/projects/{project.Id}",
                new ProjectDto(project.Id, project.Name, project.Description, project.Status, ""));
        }).RequireAuthorization("AgencyOnly"); // <-- ADD THIS POLICY REQUIREMENT    }
    }
}

public record ProjectDto(Guid Id, string Name, string Description, string Status, string ClientName);
public record CreateProjectRequest(string Name, string Description, Guid ClientId);