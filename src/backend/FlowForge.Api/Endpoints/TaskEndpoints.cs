using FlowForge.Core.Entities;
using FlowForge.Infra.Data;
using Microsoft.EntityFrameworkCore;

namespace FlowForge.Api.Endpoints;

public static class TaskEndpoints
{
    public static void MapTaskEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api").RequireAuthorization();

        // 1. Get tasks for a specific project (For the Kanban board)
        group.MapGet("/projects/{projectId:guid}/tasks", async (Guid projectId, FlowForgeDbContext db) =>
        {
            // Verify project exists and belongs to the tenant
            var projectExists = await db.Projects.AnyAsync(p => p.Id == projectId);
            if (!projectExists) return Results.NotFound("Project not found.");

            var tasks = await db.Tasks
                .Where(t => t.ProjectId == projectId)
                .Select(t => new TaskDto(t.Id, t.Title, t.Description, t.Status, t.ProjectId))
                .ToListAsync();

            return Results.Ok(tasks);
        });

        // 2. Create a new task
        group.MapPost("/tasks", async (CreateTaskRequest req, FlowForgeDbContext db) =>
        {
            var projectExists = await db.Projects.AnyAsync(p => p.Id == req.ProjectId);
            if (!projectExists) return Results.BadRequest("Invalid Project ID.");

            var task = new ProjectTask
            {
                Title = req.Title,
                Description = req.Description,
                ProjectId = req.ProjectId,
                Status = "To Do" // Default status
            };

            db.Tasks.Add(task);
            await db.SaveChangesAsync();

            return Results.Created($"/api/tasks/{task.Id}",
                new TaskDto(task.Id, task.Title, task.Description, task.Status, task.ProjectId));
        });

        // 3. Update task status (Optimized for drag-and-drop)
        group.MapPatch("/tasks/{id:guid}/status", async (Guid id, UpdateTaskStatusRequest req, FlowForgeDbContext db) =>
        {
            var task = await db.Tasks.FindAsync(id);
            if (task == null) return Results.NotFound();

            task.Status = req.Status;
            await db.SaveChangesAsync();

            return Results.NoContent();
        });
    }
}

// DTOs
public record TaskDto(Guid Id, string Title, string Description, string Status, Guid ProjectId);
public record CreateTaskRequest(string Title, string Description, Guid ProjectId);
public record UpdateTaskStatusRequest(string Status);