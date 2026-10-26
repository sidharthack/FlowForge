namespace FlowForge.Core.Entities;

public class ProjectTask : BaseEntity
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;

    // Status drives the Kanban board columns (e.g., "To Do", "In Progress", "Done")
    public string Status { get; set; } = "To Do";

    // Foreign Key to Project
    public Guid ProjectId { get; set; }
    public Project? Project { get; set; }
}