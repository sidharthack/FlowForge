namespace FlowForge.Core.Interfaces;

public interface ICurrentTenantService
{
    // Will be populated from the JWT token of the logged-in user
    Guid? TenantId { get; }
}