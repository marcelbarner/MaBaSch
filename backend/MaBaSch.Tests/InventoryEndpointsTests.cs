using System.Net;
using System.Net.Http.Json;
using MaBaSch.Dtos;

namespace MaBaSch.Tests;

public class InventoryEndpointsTests
{
    private InventoryApiFactory _factory = null!;
    private HttpClient _client = null!;

    [Before(Test)]
    public void Setup()
    {
        _factory = new InventoryApiFactory();
        _client = _factory.CreateClient();
    }

    [After(Test)]
    public async Task TearDown()
    {
        _client.Dispose();
        await _factory.DisposeAsync();
    }

    [Test]
    public async Task GetItems_OnFreshDatabase_ReturnsSeededItems()
    {
        var response = await _client.GetAsync("/api/items");

        await Assert.That(response.StatusCode).IsEqualTo(HttpStatusCode.OK);
        var items = await response.Content.ReadFromJsonAsync<List<InventoryItemDto>>();
        await Assert.That(items).IsNotNull();
        await Assert.That(items!.Count).IsGreaterThan(0);
    }

    [Test]
    public async Task GetCategories_ReturnsDistinctSortedList()
    {
        var response = await _client.GetAsync("/api/items/categories");

        await Assert.That(response.StatusCode).IsEqualTo(HttpStatusCode.OK);
        var categories = await response.Content.ReadFromJsonAsync<List<string>>();
        await Assert.That(categories).IsNotNull();
        await Assert.That(categories).IsEquivalentTo(categories!.OrderBy(c => c).Distinct());
    }

    [Test]
    public async Task GetItem_UnknownId_ReturnsNotFound()
    {
        var response = await _client.GetAsync($"/api/items/{Guid.NewGuid()}");

        await Assert.That(response.StatusCode).IsEqualTo(HttpStatusCode.NotFound);
    }

    [Test]
    public async Task PostItem_Valid_ReturnsCreatedWithLocation()
    {
        var dto = new InventoryItemCreateUpdateDto("API-Test-Artikel", "API-Test", 5, 2, "Stk", 3.5m, null, null);

        var response = await _client.PostAsJsonAsync("/api/items", dto);

        await Assert.That(response.StatusCode).IsEqualTo(HttpStatusCode.Created);
        await Assert.That(response.Headers.Location).IsNotNull();
        var created = await response.Content.ReadFromJsonAsync<InventoryItemDto>();
        await Assert.That(created!.Name).IsEqualTo("API-Test-Artikel");
    }

    [Test]
    public async Task PostItem_MissingRequiredFieldsWithoutVariants_ReturnsValidationProblem()
    {
        var dto = new InventoryItemCreateUpdateDto("API-Test-Artikel", "API-Test", null, null, null, null, null, null);

        var response = await _client.PostAsJsonAsync("/api/items", dto);

        await Assert.That(response.StatusCode).IsEqualTo(HttpStatusCode.BadRequest);
    }

    [Test]
    public async Task PutItem_UnknownId_ReturnsNotFound()
    {
        var dto = new InventoryItemCreateUpdateDto("Ghost", "Ghost", 1, 1, "Stk", 1m, null, null);

        var response = await _client.PutAsJsonAsync($"/api/items/{Guid.NewGuid()}", dto);

        await Assert.That(response.StatusCode).IsEqualTo(HttpStatusCode.NotFound);
    }

    [Test]
    public async Task DeleteItem_CreatedThenDeleted_ReturnsNoContentThenNotFound()
    {
        var createDto = new InventoryItemCreateUpdateDto("Zu löschen", "API-Test", 1, 1, "Stk", 1m, null, null);
        var createResponse = await _client.PostAsJsonAsync("/api/items", createDto);
        var created = await createResponse.Content.ReadFromJsonAsync<InventoryItemDto>();

        var deleteResponse = await _client.DeleteAsync($"/api/items/{created!.Id}");
        await Assert.That(deleteResponse.StatusCode).IsEqualTo(HttpStatusCode.NoContent);

        var getResponse = await _client.GetAsync($"/api/items/{created.Id}");
        await Assert.That(getResponse.StatusCode).IsEqualTo(HttpStatusCode.NotFound);
    }

    [Test]
    public async Task GetItems_FiltersByCategory()
    {
        await _client.PostAsJsonAsync("/api/items", new InventoryItemCreateUpdateDto("Nur-Kategorie-Artikel", "EinzigartigeKategorie", 1, 1, "Stk", 1m, null, null));

        var response = await _client.GetAsync("/api/items?category=EinzigartigeKategorie");
        var items = await response.Content.ReadFromJsonAsync<List<InventoryItemDto>>();

        await Assert.That(items!.Count).IsEqualTo(1);
        await Assert.That(items[0].Category).IsEqualTo("EinzigartigeKategorie");
    }
}
