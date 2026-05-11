using ISTTP_lab_2.Models;
using Microsoft.EntityFrameworkCore;
using System.Reflection.Emit;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users { get; set; }
    public DbSet<Listing> Listings { get; set; }
    public DbSet<Proposal> Proposals { get; set; }
    public DbSet<Contract> Contracts { get; set; }
    public DbSet<Review> Reviews { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>().HasIndex(u => u.Email).IsUnique();
        modelBuilder.Entity<User>().HasIndex(u => u.Username).IsUnique();

        modelBuilder.Entity<Contract>()
            .HasOne(c => c.Client)
            .WithMany(u => u.ContractsAsClient) 
            .HasForeignKey(c => c.ClientId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Contract>()
            .HasOne(c => c.Booster)
            .WithMany(u => u.ContractsAsBooster)
            .HasForeignKey(c => c.BoosterId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Review>()
            .HasOne(r => r.Reviewer)
            .WithMany(u => u.ReviewsGiven) 
            .HasForeignKey(r => r.ReviewerId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Review>()
            .HasOne(r => r.Reviewee)
            .WithMany(u => u.ReviewsReceived) 
            .HasForeignKey(r => r.RevieweeId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Proposal>()
            .HasOne(p => p.User)
            .WithMany(u => u.Proposals)
            .HasForeignKey(p => p.UserId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}