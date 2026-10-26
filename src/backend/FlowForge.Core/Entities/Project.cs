namespace FlowForge.Core.Entities;

public class Project : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Status { get; set; } = "Active"; // e.g., Active, Completed, OnHold

    // Foreign Key to Client
    public Guid ClientId { get; set; }
    public Client? Client { get; set; }
}