using System.ComponentModel.DataAnnotations;

namespace MaBaSch.Dtos;

public record InventoryItemVariantInputDto(
    [property: StringLength(100)]
    string? Size,

    [property: StringLength(100)]
    string? Manufacturer,

    [property: StringLength(50)]
    string? Unit,

    [property: Range(0, int.MaxValue)]
    int Quantity,

    [property: Range(0, int.MaxValue)]
    int MinQuantity,

    [property: Range(0, double.MaxValue)]
    decimal Price,

    [property: StringLength(200)]
    string? Location
);
