using System.ComponentModel.DataAnnotations;

namespace MaBaSch.Dtos;

public record InventoryItemCreateUpdateDto(
    [property: Required, StringLength(200, MinimumLength = 1)]
    string Name,

    [property: Required, StringLength(100, MinimumLength = 1)]
    string Category,

    [property: Range(0, int.MaxValue)]
    int Quantity,

    [property: Range(0, int.MaxValue)]
    int MinQuantity,

    [property: Required, StringLength(50, MinimumLength = 1)]
    string Unit,

    [property: Range(0, double.MaxValue)]
    decimal Price,

    [property: StringLength(200)]
    string? Location
);
