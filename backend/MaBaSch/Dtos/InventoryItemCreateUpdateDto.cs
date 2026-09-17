using System.ComponentModel.DataAnnotations;

namespace MaBaSch.Dtos;

public record InventoryItemCreateUpdateDto(
    [property: Required, StringLength(200, MinimumLength = 1)]
    string Name,

    [property: Required, StringLength(100, MinimumLength = 1)]
    string Category,

    [property: Range(0, int.MaxValue)]
    int? Quantity,

    [property: Range(0, int.MaxValue)]
    int? MinQuantity,

    [property: StringLength(50)]
    string? Unit,

    [property: Range(0, double.MaxValue)]
    decimal? Price,

    [property: StringLength(200)]
    string? Location,

    List<InventoryItemVariantInputDto>? Variants
) : IValidatableObject
{
    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        var hasVariants = Variants is { Count: > 0 };

        if (hasVariants)
        {
            yield break;
        }

        if (Quantity is null)
        {
            yield return new ValidationResult("Menge ist erforderlich, wenn keine Varianten angegeben sind.", [nameof(Quantity)]);
        }

        if (MinQuantity is null)
        {
            yield return new ValidationResult("Mindestbestand ist erforderlich, wenn keine Varianten angegeben sind.", [nameof(MinQuantity)]);
        }

        if (string.IsNullOrWhiteSpace(Unit))
        {
            yield return new ValidationResult("Einheit ist erforderlich, wenn keine Varianten angegeben sind.", [nameof(Unit)]);
        }

        if (Price is null)
        {
            yield return new ValidationResult("Preis ist erforderlich, wenn keine Varianten angegeben sind.", [nameof(Price)]);
        }
    }
}
