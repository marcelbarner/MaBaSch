using MaBaSch.Data;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;

namespace MaBaSch.Tests;

public class SeedDataTests
{
    private SqliteConnection _connection = null!;
    private InventoryDbContext _db = null!;

    [Before(Test)]
    public async Task Setup()
    {
        _connection = new SqliteConnection("Data Source=:memory:");
        await _connection.OpenAsync();

        var options = new DbContextOptionsBuilder<InventoryDbContext>()
            .UseSqlite(_connection)
            .Options;

        _db = new InventoryDbContext(options);
        await _db.Database.EnsureCreatedAsync();
    }

    [After(Test)]
    public async Task TearDown()
    {
        await _db.DisposeAsync();
        await _connection.DisposeAsync();
    }

    [Test]
    public async Task EnsureSeeded_OnEmptyDatabase_AddsItems()
    {
        SeedData.EnsureSeeded(_db);

        var count = await _db.InventoryItems.CountAsync();
        await Assert.That(count).IsGreaterThan(0);
    }

    [Test]
    public async Task EnsureSeeded_IncludesAtLeastOneVariantItem()
    {
        SeedData.EnsureSeeded(_db);

        var hasVariantItem = await _db.InventoryItems.AnyAsync(i => i.Variants.Count > 0);
        await Assert.That(hasVariantItem).IsTrue();
    }

    [Test]
    public async Task EnsureSeeded_CalledTwice_IsIdempotent()
    {
        SeedData.EnsureSeeded(_db);
        var firstCount = await _db.InventoryItems.CountAsync();

        SeedData.EnsureSeeded(_db);
        var secondCount = await _db.InventoryItems.CountAsync();

        await Assert.That(secondCount).IsEqualTo(firstCount);
    }
}
