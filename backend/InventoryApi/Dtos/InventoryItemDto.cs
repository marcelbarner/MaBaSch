namespace InventoryApi.Dtos;

public record InventoryItemDto(
    Guid Id,
    string Name,
    string Category,
    int Quantity,
    int MinQuantity,
    string Unit,
    decimal Price,
    string? Location,
    bool IsLowStock,
    DateTimeOffset UpdatedAt
);
