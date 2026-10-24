namespace FlowForge.Core.Entities;

// Tenant does not inherit BaseEntity because it IS the tenant
public class Tenant
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}