using Microsoft.AspNetCore.Identity;

namespace FlowForge.Core.Entities;

public class ApplicationUser : IdentityUser
{
    public Guid TenantId { get; set; }
    public Tenant? Tenant { get; set; }
}