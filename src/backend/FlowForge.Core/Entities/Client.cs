namespace FlowForge.Core.Entities;

public class Client : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string ContactEmail { get; set; } = string.Empty;

    // Navigation property: A client can have many projects
    public ICollection<Project> Projects { get; set; } = new List<Project>();
}