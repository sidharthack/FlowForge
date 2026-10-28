namespace FlowForge.Core.Entities;

public class TaskComment : BaseEntity
{
    public string Content { get; set; } = string.Empty;

    // Foreign Key to the Task
    public Guid TaskId { get; set; }
    public ProjectTask? Task { get; set; }

    // Foreign Key to the User (Author)
    public string AuthorId { get; set; } = string.Empty;
    public ApplicationUser? Author { get; set; }
}