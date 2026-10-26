using FlowForge.Core.Entities;
using FlowForge.Core.Interfaces;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace FlowForge.Infra.Data;

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
    public DbSet<Client> Clients { get; set; } // Added Clients DbSet

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // GLOBAL QUERY FILTERS for strict tenant isolation
        modelBuilder.Entity<Project>().HasQueryFilter(p => p.TenantId == CurrentTenantId);
        modelBuilder.Entity<Client>().HasQueryFilter(c => c.TenantId == CurrentTenantId);

        // Configure the One-to-Many relationship
        modelBuilder.Entity<Project>()
            .HasOne(p => p.Client)
            .WithMany(c => c.Projects)
            .HasForeignKey(p => p.ClientId)
            .OnDelete(DeleteBehavior.Restrict); // Prevent deleting a client if they have active projects
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