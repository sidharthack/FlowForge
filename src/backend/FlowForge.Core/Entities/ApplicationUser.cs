using Microsoft.AspNetCore.Identity;

namespace FlowForge.Core.Entities;

public class ApplicationUser : IdentityUser
{
    public Guid TenantId { get; set; }
    public Tenant? Tenant { get; set; }

    // NEW: Optional link to a specific Client organization
    public Guid? ClientId { get; set; }
    public Client? Client { get; set; }
}