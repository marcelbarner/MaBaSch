using InventoryApi.Data;
using InventoryApi.Dtos;
using InventoryApi.Models;
using Microsoft.EntityFrameworkCore;

namespace InventoryApi.Services;

public class InventoryService(InventoryDbContext db) : IInventoryService
{
    public async Task<IReadOnlyList<InventoryItemDto>> GetItemsAsync(
        string? search, string? category, string? sortBy, bool sortDescending, CancellationToken ct = default)
    {
        var query = db.InventoryItems.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim();
            query = query.Where(i =>
                EF.Functions.Like(i.Name, $"%{term}%") ||
                EF.Functions.Like(i.Category, $"%{term}%") ||
                (i.Location != null && EF.Functions.Like(i.Location, $"%{term}%")));
        }

        if (!string.IsNullOrWhiteSpace(category))
        {
            query = query.Where(i => i.Category == category);
        }

        query = (sortBy?.ToLowerInvariant()) switch
        {
            "category" => sortDescending ? query.OrderByDescending(i => i.Category) : query.OrderBy(i => i.Category),
            "quantity" => sortDescending ? query.OrderByDescending(i => i.Quantity) : query.OrderBy(i => i.Quantity),
            "price" => sortDescending ? query.OrderByDescending(i => i.Price) : query.OrderBy(i => i.Price),
            "updatedat" => sortDescending ? query.OrderByDescending(i => i.UpdatedAt) : query.OrderBy(i => i.UpdatedAt),
            _ => sortDescending ? query.OrderByDescending(i => i.Name) : query.OrderBy(i => i.Name),
        };

        var items = await query.ToListAsync(ct);
        return items.Select(ToDto).ToList();
    }

    public async Task<InventoryItemDto?> GetItemAsync(Guid id, CancellationToken ct = default)
    {
        var item = await db.InventoryItems.AsNoTracking().FirstOrDefaultAsync(i => i.Id == id, ct);
        return item is null ? null : ToDto(item);
    }

    public async Task<InventoryItemDto> CreateItemAsync(InventoryItemCreateUpdateDto dto, CancellationToken ct = default)
    {
        var item = new InventoryItem
        {
            Id = Guid.NewGuid(),
            Name = dto.Name.Trim(),
            Category = dto.Category.Trim(),
            Quantity = dto.Quantity,
            MinQuantity = dto.MinQuantity,
            Unit = dto.Unit.Trim(),
            Price = dto.Price,
            Location = string.IsNullOrWhiteSpace(dto.Location) ? null : dto.Location.Trim(),
            UpdatedAt = DateTimeOffset.UtcNow,
        };

        db.InventoryItems.Add(item);
        await db.SaveChangesAsync(ct);
        return ToDto(item);
    }

    public async Task<InventoryItemDto?> UpdateItemAsync(Guid id, InventoryItemCreateUpdateDto dto, CancellationToken ct = default)
    {
        var item = await db.InventoryItems.FirstOrDefaultAsync(i => i.Id == id, ct);
        if (item is null)
        {
            return null;
        }

        item.Name = dto.Name.Trim();
        item.Category = dto.Category.Trim();
        item.Quantity = dto.Quantity;
        item.MinQuantity = dto.MinQuantity;
        item.Unit = dto.Unit.Trim();
        item.Price = dto.Price;
        item.Location = string.IsNullOrWhiteSpace(dto.Location) ? null : dto.Location.Trim();
        item.UpdatedAt = DateTimeOffset.UtcNow;

        await db.SaveChangesAsync(ct);
        return ToDto(item);
    }

    public async Task<bool> DeleteItemAsync(Guid id, CancellationToken ct = default)
    {
        var item = await db.InventoryItems.FirstOrDefaultAsync(i => i.Id == id, ct);
        if (item is null)
        {
            return false;
        }

        db.InventoryItems.Remove(item);
        await db.SaveChangesAsync(ct);
        return true;
    }

    public async Task<IReadOnlyList<string>> GetCategoriesAsync(CancellationToken ct = default)
    {
        return await db.InventoryItems
            .AsNoTracking()
            .Select(i => i.Category)
            .Distinct()
            .OrderBy(c => c)
            .ToListAsync(ct);
    }

    private static InventoryItemDto ToDto(InventoryItem item) => new(
        item.Id,
        item.Name,
        item.Category,
        item.Quantity,
        item.MinQuantity,
        item.Unit,
        item.Price,
        item.Location,
        item.IsLowStock,
        item.UpdatedAt
    );
}
