namespace MaBaSch.Dtos;

public record InventoryItemVariantDto(
    Guid Id,
    string? Size,
    string? Manufacturer,
    string? Unit,
    int Quantity,
    int MinQuantity,
    decimal Price,
    string? Location,
    bool IsLowStock
);
