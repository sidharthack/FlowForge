namespace FlowForge.Core.Entities;

public class ProjectTask : BaseEntity
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Status { get; set; } = "To Do";

    public Guid ProjectId { get; set; }
    public Project? Project { get; set; }

    // NEW: Nullable Assignee (ASP.NET Identity uses string IDs by default)
    public string? AssigneeId { get; set; }
    public ApplicationUser? Assignee { get; set; }
}