using FlowForge.Core.Entities;
using FlowForge.Core.Interfaces;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace FlowForge.Infra.Data;

public class FlowForgeDbContext : IdentityDbContext<ApplicationUser>
{
    private readonly ICurrentTenantService? _tenantService;
    public Guid? CurrentTenantId => _tenantService?.TenantId;

    public FlowForgeDbContext(DbContextOptions<FlowForgeDbContext> options, ICurrentTenantService tenantService) : base(options)
    {
        _tenantService = tenantService;
    }

    public DbSet<Tenant> Tenants { get; set; }
    public DbSet<Client> Clients { get; set; }
    public DbSet<Project> Projects { get; set; }
    public DbSet<ProjectTask> Tasks { get; set; }
    public DbSet<TaskComment> Comments { get; set; } // NEW

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // GLOBAL QUERY FILTERS
        modelBuilder.Entity<Client>().HasQueryFilter(c => c.TenantId == CurrentTenantId);
        modelBuilder.Entity<Project>().HasQueryFilter(p => p.TenantId == CurrentTenantId);
        modelBuilder.Entity<ProjectTask>().HasQueryFilter(t => t.TenantId == CurrentTenantId);
        modelBuilder.Entity<TaskComment>().HasQueryFilter(c => c.TenantId == CurrentTenantId); // NEW

        // Relationships
        modelBuilder.Entity<Project>()
            .HasOne(p => p.Client).WithMany(c => c.Projects)
            .HasForeignKey(p => p.ClientId).OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<ProjectTask>()
            .HasOne(t => t.Project).WithMany(p => p.Tasks)
            .HasForeignKey(t => t.ProjectId).OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ProjectTask>()
            .HasOne(t => t.Assignee).WithMany()
            .HasForeignKey(t => t.AssigneeId).OnDelete(DeleteBehavior.SetNull);

        // NEW: Comment Relationships
        modelBuilder.Entity<TaskComment>()
            .HasOne(c => c.Task).WithMany()
            .HasForeignKey(c => c.TaskId).OnDelete(DeleteBehavior.Cascade); // Delete comments if task is deleted

        modelBuilder.Entity<TaskComment>()
            .HasOne(c => c.Author).WithMany()
            .HasForeignKey(c => c.AuthorId).OnDelete(DeleteBehavior.Restrict); // Prevent deleting a user if they have comments
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        foreach (var entry in ChangeTracker.Entries<BaseEntity>().Where(e => e.State == EntityState.Added))
        {
            if (CurrentTenantId.HasValue) entry.Entity.TenantId = CurrentTenantId.Value;
        }
        return base.SaveChangesAsync(cancellationToken);
    }
}