namespace FlowForge.Core.Entities;

public class Project : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Status { get; set; } = "Active";

    public Guid ClientId { get; set; }
    public Client? Client { get; set; }

    // Navigation property: A project contains many tasks
    public ICollection<ProjectTask> Tasks { get; set; } = new List<ProjectTask>();
}