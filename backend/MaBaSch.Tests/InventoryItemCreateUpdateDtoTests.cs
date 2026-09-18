using System.ComponentModel.DataAnnotations;
using MaBaSch.Dtos;

namespace MaBaSch.Tests;

public class InventoryItemCreateUpdateDtoTests
{
    [Test]
    public async Task Validate_WithVariants_DirectFieldsNotRequired()
    {
        var dto = new InventoryItemCreateUpdateDto(
            "Name", "Category", null, null, null, null, null,
            [new InventoryItemVariantInputDto("M", null, null, 1, 1, 1m, null)]);

        var results = Validate(dto);

        await Assert.That(results).IsEmpty();
    }

    [Test]
    public async Task Validate_WithoutVariants_AllDirectFieldsMissing_ReturnsFourErrors()
    {
        var dto = new InventoryItemCreateUpdateDto("Name", "Category", null, null, null, null, null, null);

        var results = Validate(dto);

        await Assert.That(results).Count().IsEqualTo(4);
    }

    [Test]
    public async Task Validate_WithoutVariants_OnlyQuantityMissing_ReturnsSingleError()
    {
        var dto = new InventoryItemCreateUpdateDto("Name", "Category", null, 1, "Stk", 1m, null, null);

        var results = Validate(dto);

        await Assert.That(results).Count().IsEqualTo(1);
        await Assert.That(results[0].MemberNames).Contains(nameof(InventoryItemCreateUpdateDto.Quantity));
    }

    [Test]
    public async Task Validate_WithoutVariants_AllDirectFieldsPresent_ReturnsNoErrors()
    {
        var dto = new InventoryItemCreateUpdateDto("Name", "Category", 1, 1, "Stk", 1m, null, null);

        var results = Validate(dto);

        await Assert.That(results).IsEmpty();
    }

    [Test]
    public async Task Validate_WithEmptyVariantsList_TreatedAsWithoutVariants()
    {
        var dto = new InventoryItemCreateUpdateDto("Name", "Category", null, null, null, null, null, []);

        var results = Validate(dto);

        await Assert.That(results).Count().IsEqualTo(4);
    }

    private static List<ValidationResult> Validate(InventoryItemCreateUpdateDto dto)
    {
        var context = new ValidationContext(dto);
        return dto.Validate(context).ToList();
    }
}
