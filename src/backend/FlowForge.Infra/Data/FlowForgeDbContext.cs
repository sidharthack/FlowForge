using FlowForge.Core.Entities;
using FlowForge.Core.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace FlowForge.Infra.Data;

public class FlowForgeDbContext : DbContext
{
    private readonly ICurrentTenantService? _tenantService;

    // We expose this property so EF Core can evaluate it dynamically in the query filter
    public Guid? CurrentTenantId => _tenantService?.TenantId;

    public FlowForgeDbContext(
        DbContextOptions<FlowForgeDbContext> options,
        ICurrentTenantService tenantService) : base(options)
    {
        _tenantService = tenantService;
    }

    public DbSet<Tenant> Tenants { get; set; }
    public DbSet<Project> Projects { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // GLOBAL QUERY FILTER: Automatically scopes all project queries to the current tenant
        modelBuilder.Entity<Project>().HasQueryFilter(p => p.TenantId == CurrentTenantId);
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        foreach (var entry in ChangeTracker.Entries<BaseEntity>().Where(e => e.State == EntityState.Added))
        {
            // Auto-assign the TenantId on creation so developers don't have to remember it
            if (CurrentTenantId.HasValue)
            {
                entry.Entity.TenantId = CurrentTenantId.Value;
            }
        }
        return base.SaveChangesAsync(cancellationToken);
    }
}