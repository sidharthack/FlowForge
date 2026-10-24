using FlowForge.Core.Entities;
using FlowForge.Core.Interfaces;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace FlowForge.Infra.Data;

// Change inheritance to IdentityDbContext<ApplicationUser>
public class FlowForgeDbContext : IdentityDbContext<ApplicationUser>
{
    private readonly ICurrentTenantService? _tenantService;

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
        base.OnModelCreating(modelBuilder); // Required for Identity tables

        modelBuilder.Entity<Project>().HasQueryFilter(p => p.TenantId == CurrentTenantId);
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        foreach (var entry in ChangeTracker.Entries<BaseEntity>().Where(e => e.State == EntityState.Added))
        {
            if (CurrentTenantId.HasValue)
            {
                entry.Entity.TenantId = CurrentTenantId.Value;
            }
        }
        return base.SaveChangesAsync(cancellationToken);
    }
}