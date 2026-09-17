using InventoryApi.Models;

namespace InventoryApi.Data;

public static class SeedData
{
    public static void EnsureSeeded(InventoryDbContext db)
    {
        if (db.InventoryItems.Any())
        {
            return;
        }

        var now = DateTimeOffset.UtcNow;

        db.InventoryItems.AddRange(
            new InventoryItem { Id = Guid.NewGuid(), Name = "Bürostuhl Ergo", Category = "Möbel", Quantity = 12, MinQuantity = 5, Unit = "Stück", Price = 189.99m, Location = "Lager A1", UpdatedAt = now },
            new InventoryItem { Id = Guid.NewGuid(), Name = "Höhenverstellbarer Schreibtisch", Category = "Möbel", Quantity = 3, MinQuantity = 4, Unit = "Stück", Price = 349.00m, Location = "Lager A1", UpdatedAt = now },
            new InventoryItem { Id = Guid.NewGuid(), Name = "USB-C Dockingstation", Category = "Elektronik", Quantity = 25, MinQuantity = 10, Unit = "Stück", Price = 79.90m, Location = "Lager B2", UpdatedAt = now },
            new InventoryItem { Id = Guid.NewGuid(), Name = "27-Zoll Monitor", Category = "Elektronik", Quantity = 8, MinQuantity = 6, Unit = "Stück", Price = 259.00m, Location = "Lager B2", UpdatedAt = now },
            new InventoryItem { Id = Guid.NewGuid(), Name = "Mechanische Tastatur", Category = "Elektronik", Quantity = 2, MinQuantity = 8, Unit = "Stück", Price = 89.50m, Location = "Lager B3", UpdatedAt = now },
            new InventoryItem { Id = Guid.NewGuid(), Name = "Kopierpapier A4", Category = "Büromaterial", Quantity = 150, MinQuantity = 50, Unit = "Pakete", Price = 4.99m, Location = "Lager C1", UpdatedAt = now },
            new InventoryItem { Id = Guid.NewGuid(), Name = "Kugelschreiber blau", Category = "Büromaterial", Quantity = 18, MinQuantity = 30, Unit = "Stück", Price = 0.79m, Location = "Lager C1", UpdatedAt = now },
            new InventoryItem { Id = Guid.NewGuid(), Name = "Whiteboard-Marker Set", Category = "Büromaterial", Quantity = 6, MinQuantity = 5, Unit = "Sets", Price = 12.30m, Location = "Lager C2", UpdatedAt = now },
            new InventoryItem { Id = Guid.NewGuid(), Name = "Klimaanlage mobil", Category = "Haustechnik", Quantity = 4, MinQuantity = 2, Unit = "Stück", Price = 429.00m, Location = "Lager D1", UpdatedAt = now },
            new InventoryItem { Id = Guid.NewGuid(), Name = "Erste-Hilfe-Koffer", Category = "Sicherheit", Quantity = 5, MinQuantity = 5, Unit = "Stück", Price = 34.90m, Location = "Lager D2", UpdatedAt = now }
        );

        db.SaveChanges();
    }
}
