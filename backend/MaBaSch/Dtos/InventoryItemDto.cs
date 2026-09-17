namespace MaBaSch.Dtos;

public record InventoryItemDto(
    Guid Id,
    string Name,
    string Category,
    DateTimeOffset UpdatedAt,
    bool HasVariants,
    bool IsLowStock,
    int TotalQuantity,
    decimal MinPrice,
    decimal MaxPrice,
    int? Quantity,
    int? MinQuantity,
    string? Unit,
    decimal? Price,
    string? Location,
    IReadOnlyList<InventoryItemVariantDto> Variants
);
