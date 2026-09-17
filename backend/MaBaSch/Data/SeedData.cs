using MaBaSch.Models;

namespace MaBaSch.Data;

public static class SeedData
{
    public static void EnsureSeeded(InventoryDbContext db)
    {
        if (db.InventoryItems.Any())
        {
            return;
        }

        var now = DateTimeOffset.UtcNow;

        // Einfache Artikel ohne Varianten
        db.InventoryItems.AddRange(
            new InventoryItem { Id = Guid.NewGuid(), Name = "Bürostuhl Ergo", Category = "Möbel", Quantity = 12, MinQuantity = 5, Unit = "Stück", Price = 189.99m, Location = "Lager A1", UpdatedAt = now },
            new InventoryItem { Id = Guid.NewGuid(), Name = "Höhenverstellbarer Schreibtisch", Category = "Möbel", Quantity = 3, MinQuantity = 4, Unit = "Stück", Price = 349.00m, Location = "Lager A1", UpdatedAt = now },
            new InventoryItem { Id = Guid.NewGuid(), Name = "27-Zoll Monitor", Category = "Elektronik", Quantity = 8, MinQuantity = 6, Unit = "Stück", Price = 259.00m, Location = "Lager B2", UpdatedAt = now },
            new InventoryItem { Id = Guid.NewGuid(), Name = "Kopierpapier A4", Category = "Büromaterial", Quantity = 150, MinQuantity = 50, Unit = "Pakete", Price = 4.99m, Location = "Lager C1", UpdatedAt = now },
            new InventoryItem { Id = Guid.NewGuid(), Name = "Whiteboard-Marker Set", Category = "Büromaterial", Quantity = 6, MinQuantity = 5, Unit = "Sets", Price = 12.30m, Location = "Lager C2", UpdatedAt = now },
            new InventoryItem { Id = Guid.NewGuid(), Name = "Klimaanlage mobil", Category = "Haustechnik", Quantity = 4, MinQuantity = 2, Unit = "Stück", Price = 429.00m, Location = "Lager D1", UpdatedAt = now },
            new InventoryItem { Id = Guid.NewGuid(), Name = "Erste-Hilfe-Koffer", Category = "Sicherheit", Quantity = 5, MinQuantity = 5, Unit = "Stück", Price = 34.90m, Location = "Lager D2", UpdatedAt = now }
        );

        // Artikel mit Varianten nach Größe
        db.InventoryItems.Add(new InventoryItem
        {
            Id = Guid.NewGuid(),
            Name = "Arbeitshandschuhe",
            Category = "Sicherheit",
            UpdatedAt = now,
            Variants =
            [
                new InventoryItemVariant { Id = Guid.NewGuid(), Size = "S", Unit = "Paar", Quantity = 20, MinQuantity = 10, Price = 6.50m, Location = "Lager D2" },
                new InventoryItemVariant { Id = Guid.NewGuid(), Size = "M", Unit = "Paar", Quantity = 15, MinQuantity = 10, Price = 6.50m, Location = "Lager D2" },
                new InventoryItemVariant { Id = Guid.NewGuid(), Size = "L", Unit = "Paar", Quantity = 3, MinQuantity = 10, Price = 6.50m, Location = "Lager D2" },
                new InventoryItemVariant { Id = Guid.NewGuid(), Size = "XL", Unit = "Paar", Quantity = 8, MinQuantity = 10, Price = 6.90m, Location = "Lager D2" },
            ],
        });

        // Artikel mit Varianten nach Größe UND Hersteller
        db.InventoryItems.Add(new InventoryItem
        {
            Id = Guid.NewGuid(),
            Name = "T-Shirt Rundhals",
            Category = "Bekleidung",
            UpdatedAt = now,
            Variants =
            [
                new InventoryItemVariant { Id = Guid.NewGuid(), Size = "M", Manufacturer = "Acme", Unit = "Stück", Quantity = 30, MinQuantity = 15, Price = 9.90m, Location = "Lager E1" },
                new InventoryItemVariant { Id = Guid.NewGuid(), Size = "L", Manufacturer = "Acme", Unit = "Stück", Quantity = 25, MinQuantity = 15, Price = 9.90m, Location = "Lager E1" },
                new InventoryItemVariant { Id = Guid.NewGuid(), Size = "M", Manufacturer = "Northline", Unit = "Stück", Quantity = 5, MinQuantity = 15, Price = 11.50m, Location = "Lager E2" },
                new InventoryItemVariant { Id = Guid.NewGuid(), Size = "L", Manufacturer = "Northline", Unit = "Stück", Quantity = 2, MinQuantity = 15, Price = 11.50m, Location = "Lager E2" },
            ],
        });

        // Artikel mit Varianten nur nach Hersteller (keine Größe)
        db.InventoryItems.Add(new InventoryItem
        {
            Id = Guid.NewGuid(),
            Name = "Sicherheitsschuhe S3",
            Category = "Sicherheit",
            UpdatedAt = now,
            Variants =
            [
                new InventoryItemVariant { Id = Guid.NewGuid(), Size = "42", Manufacturer = "Uvex", Unit = "Paar", Quantity = 6, MinQuantity = 4, Price = 79.90m, Location = "Lager D3" },
                new InventoryItemVariant { Id = Guid.NewGuid(), Size = "44", Manufacturer = "Uvex", Unit = "Paar", Quantity = 2, MinQuantity = 4, Price = 79.90m, Location = "Lager D3" },
                new InventoryItemVariant { Id = Guid.NewGuid(), Size = "44", Manufacturer = "Sievi", Unit = "Paar", Quantity = 4, MinQuantity = 4, Price = 89.00m, Location = "Lager D3" },
            ],
        });

        db.SaveChanges();
    }
}
