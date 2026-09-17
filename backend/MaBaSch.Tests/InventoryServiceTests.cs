using MaBaSch.Data;
using MaBaSch.Dtos;
using MaBaSch.Services;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;

namespace MaBaSch.Tests;

public class InventoryServiceTests
{
    private SqliteConnection _connection = null!;
    private InventoryDbContext _db = null!;
    private InventoryService _sut = null!;

    [Before(Test)]
    public async Task Setup()
    {
        // In-memory SQLite via a kept-open connection: the pattern the docs point QA
        // agents at for exercising real EF Core / SQLite behavior without a file on disk.
        _connection = new SqliteConnection("Data Source=:memory:");
        await _connection.OpenAsync();

        var options = new DbContextOptionsBuilder<InventoryDbContext>()
            .UseSqlite(_connection)
            .Options;

        _db = new InventoryDbContext(options);
        await _db.Database.EnsureCreatedAsync();

        _sut = new InventoryService(_db);
    }

    [After(Test)]
    public async Task TearDown()
    {
        await _db.DisposeAsync();
        await _connection.DisposeAsync();
    }

    [Test]
    public async Task CreateItemAsync_WithoutVariants_PersistsDirectFields()
    {
        var dto = new InventoryItemCreateUpdateDto("Testartikel", "Testkategorie", 10, 5, "Stück", 9.99m, "Lager X", null);

        var created = await _sut.CreateItemAsync(dto);

        await Assert.That(created.HasVariants).IsFalse();
        await Assert.That(created.Quantity).IsEqualTo(10);
        await Assert.That(created.TotalQuantity).IsEqualTo(10);
        await Assert.That(created.IsLowStock).IsFalse();
    }

    [Test]
    public async Task CreateItemAsync_WithVariants_AggregatesTotalsAndLowStock()
    {
        var dto = new InventoryItemCreateUpdateDto(
            "Arbeitshandschuhe",
            "Sicherheit",
            null,
            null,
            null,
            null,
            null,
            [
                new InventoryItemVariantInputDto("S", null, "Paar", 20, 10, 6.50m, null),
                new InventoryItemVariantInputDto("L", null, "Paar", 2, 10, 6.50m, null),
            ]);

        var created = await _sut.CreateItemAsync(dto);

        await Assert.That(created.HasVariants).IsTrue();
        await Assert.That(created.TotalQuantity).IsEqualTo(22);
        await Assert.That(created.IsLowStock).IsTrue(); // die "L"-Variante liegt bei/unter MinQuantity
        await Assert.That(created.Variants).Count().IsEqualTo(2);
    }

    [Test]
    public async Task UpdateItemAsync_SwitchingFromSimpleToVariants_ReplacesVariantsWithoutError()
    {
        var simple = await _sut.CreateItemAsync(new InventoryItemCreateUpdateDto("Artikel", "Kategorie", 5, 2, "Stk", 1.0m, null, null));

        var updateDto = new InventoryItemCreateUpdateDto(
            "Artikel",
            "Kategorie",
            null,
            null,
            null,
            null,
            null,
            [new InventoryItemVariantInputDto("M", null, null, 3, 1, 2.0m, null)]);

        var updated = await _sut.UpdateItemAsync(simple.Id, updateDto);

        await Assert.That(updated).IsNotNull();
        await Assert.That(updated!.HasVariants).IsTrue();
        await Assert.That(updated.Variants).Count().IsEqualTo(1);
        await Assert.That(updated.Quantity).IsNull();
    }

    [Test]
    public async Task DeleteItemAsync_UnknownId_ReturnsFalse()
    {
        var deleted = await _sut.DeleteItemAsync(Guid.NewGuid());

        await Assert.That(deleted).IsFalse();
    }

    [Test]
    public async Task GetItemsAsync_SearchMatchesVariantSize()
    {
        await _sut.CreateItemAsync(new InventoryItemCreateUpdateDto(
            "T-Shirt Rundhals",
            "Bekleidung",
            null,
            null,
            null,
            null,
            null,
            [new InventoryItemVariantInputDto("XL", "Acme", "Stück", 5, 2, 9.90m, null)]));

        var results = await _sut.GetItemsAsync(search: "XL", category: null, sortBy: null, sortDescending: false);

        await Assert.That(results).Count().IsEqualTo(1);
        await Assert.That(results[0].Name).IsEqualTo("T-Shirt Rundhals");
    }
}
