using MaBaSch.Data;
using MaBaSch.Dtos;
using MaBaSch.Models;
using Microsoft.EntityFrameworkCore;

namespace MaBaSch.Services;

public class InventoryService(InventoryDbContext db) : IInventoryService
{
    public async Task<IReadOnlyList<InventoryItemDto>> GetItemsAsync(
        string? search, string? category, string? sortBy, bool sortDescending, CancellationToken ct = default)
    {
        var query = db.InventoryItems.AsNoTracking().Include(i => i.Variants).AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim();
            query = query.Where(i =>
                EF.Functions.Like(i.Name, $"%{term}%") ||
                EF.Functions.Like(i.Category, $"%{term}%") ||
                (i.Location != null && EF.Functions.Like(i.Location, $"%{term}%")) ||
                i.Variants.Any(v =>
                    (v.Size != null && EF.Functions.Like(v.Size, $"%{term}%")) ||
                    (v.Manufacturer != null && EF.Functions.Like(v.Manufacturer, $"%{term}%")) ||
                    (v.Location != null && EF.Functions.Like(v.Location, $"%{term}%"))));
        }

        if (!string.IsNullOrWhiteSpace(category))
        {
            query = query.Where(i => i.Category == category);
        }

        var items = await query.ToListAsync(ct);
        var dtos = items.Select(ToDto);

        dtos = (sortBy?.ToLowerInvariant()) switch
        {
            "category" => sortDescending ? dtos.OrderByDescending(i => i.Category) : dtos.OrderBy(i => i.Category),
            "quantity" => sortDescending ? dtos.OrderByDescending(i => i.TotalQuantity) : dtos.OrderBy(i => i.TotalQuantity),
            "price" => sortDescending ? dtos.OrderByDescending(i => i.MinPrice) : dtos.OrderBy(i => i.MinPrice),
            "updatedat" => sortDescending ? dtos.OrderByDescending(i => i.UpdatedAt) : dtos.OrderBy(i => i.UpdatedAt),
            _ => sortDescending ? dtos.OrderByDescending(i => i.Name) : dtos.OrderBy(i => i.Name),
        };

        return dtos.ToList();
    }

    public async Task<InventoryItemDto?> GetItemAsync(Guid id, CancellationToken ct = default)
    {
        var item = await db.InventoryItems.AsNoTracking().Include(i => i.Variants).FirstOrDefaultAsync(i => i.Id == id, ct);
        return item is null ? null : ToDto(item);
    }

    public async Task<InventoryItemDto> CreateItemAsync(InventoryItemCreateUpdateDto dto, CancellationToken ct = default)
    {
        var item = new InventoryItem
        {
            Id = Guid.NewGuid(),
            Name = dto.Name.Trim(),
            Category = dto.Category.Trim(),
            UpdatedAt = DateTimeOffset.UtcNow,
        };

        ApplyDto(item, dto, db);

        db.InventoryItems.Add(item);
        await db.SaveChangesAsync(ct);
        return ToDto(item);
    }

    public async Task<InventoryItemDto?> UpdateItemAsync(Guid id, InventoryItemCreateUpdateDto dto, CancellationToken ct = default)
    {
        var item = await db.InventoryItems.Include(i => i.Variants).FirstOrDefaultAsync(i => i.Id == id, ct);
        if (item is null)
        {
            return null;
        }

        item.Name = dto.Name.Trim();
        item.Category = dto.Category.Trim();
        item.UpdatedAt = DateTimeOffset.UtcNow;

        db.InventoryItemVariants.RemoveRange(item.Variants);
        item.Variants.Clear();

        ApplyDto(item, dto, db);

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

    private static void ApplyDto(InventoryItem item, InventoryItemCreateUpdateDto dto, InventoryDbContext db)
    {
        var hasVariants = dto.Variants is { Count: > 0 };

        if (hasVariants)
        {
            item.Quantity = null;
            item.MinQuantity = null;
            item.Unit = null;
            item.Price = null;
            item.Location = null;

            foreach (var variant in dto.Variants!)
            {
                var newVariant = new InventoryItemVariant
                {
                    Id = Guid.NewGuid(),
                    InventoryItemId = item.Id,
                    Size = string.IsNullOrWhiteSpace(variant.Size) ? null : variant.Size.Trim(),
                    Manufacturer = string.IsNullOrWhiteSpace(variant.Manufacturer) ? null : variant.Manufacturer.Trim(),
                    Unit = string.IsNullOrWhiteSpace(variant.Unit) ? null : variant.Unit.Trim(),
                    Quantity = variant.Quantity,
                    MinQuantity = variant.MinQuantity,
                    Price = variant.Price,
                    Location = string.IsNullOrWhiteSpace(variant.Location) ? null : variant.Location.Trim(),
                };

                item.Variants.Add(newVariant);
                // EF Core's default key-based heuristic treats an entity with a non-default
                // (explicitly assigned) Guid key as "existing" when attached indirectly via a
                // tracked parent's navigation collection, which produces a no-op UPDATE instead
                // of an INSERT and throws DbUpdateConcurrencyException. Forcing Added avoids that.
                db.Entry(newVariant).State = EntityState.Added;
            }
        }
        else
        {
            item.Quantity = dto.Quantity;
            item.MinQuantity = dto.MinQuantity;
            item.Unit = string.IsNullOrWhiteSpace(dto.Unit) ? null : dto.Unit.Trim();
            item.Price = dto.Price;
            item.Location = string.IsNullOrWhiteSpace(dto.Location) ? null : dto.Location.Trim();
        }
    }

    private static InventoryItemDto ToDto(InventoryItem item)
    {
        var hasVariants = item.Variants.Count > 0;

        var variantDtos = item.Variants
            .OrderBy(v => v.Size)
            .ThenBy(v => v.Manufacturer)
            .Select(v => new InventoryItemVariantDto(
                v.Id, v.Size, v.Manufacturer, v.Unit, v.Quantity, v.MinQuantity, v.Price, v.Location, v.IsLowStock))
            .ToList();

        var totalQuantity = hasVariants ? item.Variants.Sum(v => v.Quantity) : item.Quantity ?? 0;
        var minPrice = hasVariants ? item.Variants.Min(v => v.Price) : item.Price ?? 0m;
        var maxPrice = hasVariants ? item.Variants.Max(v => v.Price) : item.Price ?? 0m;
        var isLowStock = hasVariants ? item.Variants.Any(v => v.IsLowStock) : item.Quantity <= item.MinQuantity;

        return new InventoryItemDto(
            item.Id,
            item.Name,
            item.Category,
            item.UpdatedAt,
            hasVariants,
            isLowStock,
            totalQuantity,
            minPrice,
            maxPrice,
            item.Quantity,
            item.MinQuantity,
            item.Unit,
            item.Price,
            item.Location,
            variantDtos
        );
    }
}
