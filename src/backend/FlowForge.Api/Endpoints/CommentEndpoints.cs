using System.Security.Claims;
using FlowForge.Core.Entities;
using FlowForge.Infra.Data;
using Microsoft.EntityFrameworkCore;
using System.IdentityModel.Tokens.Jwt;

namespace FlowForge.Api.Endpoints;

public static class CommentEndpoints
{
    public static void MapCommentEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/tasks/{taskId:guid}/comments").RequireAuthorization();

        // 1. Get comments for a task
        group.MapGet("/", async (Guid taskId, FlowForgeDbContext db) =>
        {
            var comments = await db.Comments
                .Where(c => c.TaskId == taskId)
                .Include(c => c.Author)
                .OrderBy(c => c.CreatedAt)
                .Select(c => new CommentDto(c.Id, c.Content, c.CreatedAt, c.Author!.UserName!))
                .ToListAsync();

            return Results.Ok(comments);
        });

        // 2. Add a new comment
        group.MapPost("/", async (Guid taskId, CreateCommentRequest req, ClaimsPrincipal user, FlowForgeDbContext db) =>
        {
            var taskExists = await db.Tasks.AnyAsync(t => t.Id == taskId);
            if (!taskExists) return Results.NotFound("Task not found.");

            // Extract the user ID securely from the JWT token
            var authorId = user.FindFirst(ClaimTypes.NameIdentifier)?.Value
                        ?? user.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;

            if (string.IsNullOrEmpty(authorId)) return Results.Unauthorized();

            var comment = new TaskComment
            {
                Content = req.Content,
                TaskId = taskId,
                AuthorId = authorId
            };

            db.Comments.Add(comment);
            await db.SaveChangesAsync();

            // Fetch the author's name to return a complete DTO
            var authorName = await db.Users.Where(u => u.Id == authorId).Select(u => u.UserName).FirstOrDefaultAsync();

            return Results.Created($"/api/tasks/{taskId}/comments/{comment.Id}",
                new CommentDto(comment.Id, comment.Content, comment.CreatedAt, authorName!));
        });
    }
}

public record CommentDto(Guid Id, string Content, DateTime CreatedAt, string AuthorName);
public record CreateCommentRequest(string Content);