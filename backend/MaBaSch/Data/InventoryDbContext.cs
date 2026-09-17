using MaBaSch.Models;
using Microsoft.EntityFrameworkCore;

namespace MaBaSch.Data;

public class InventoryDbContext(DbContextOptions<InventoryDbContext> options) : DbContext(options)
{
    public DbSet<InventoryItem> InventoryItems => Set<InventoryItem>();
    public DbSet<InventoryItemVariant> InventoryItemVariants => Set<InventoryItemVariant>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<InventoryItem>(entity =>
        {
            entity.Property(i => i.Name).IsRequired().HasMaxLength(200);
            entity.Property(i => i.Category).IsRequired().HasMaxLength(100);
            entity.Property(i => i.Unit).HasMaxLength(50);
            entity.HasIndex(i => i.Category);
            entity.HasIndex(i => i.Name);

            entity.HasMany(i => i.Variants)
                  .WithOne()
                  .HasForeignKey(v => v.InventoryItemId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<InventoryItemVariant>(entity =>
        {
            entity.Property(v => v.Size).HasMaxLength(100);
            entity.Property(v => v.Manufacturer).HasMaxLength(100);
            entity.Property(v => v.Unit).HasMaxLength(50);
            entity.HasIndex(v => v.InventoryItemId);
        });
    }
}
