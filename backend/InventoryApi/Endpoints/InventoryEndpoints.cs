using InventoryApi.Dtos;
using InventoryApi.Services;

namespace InventoryApi.Endpoints;

public static class InventoryEndpoints
{
    public static RouteGroupBuilder MapInventoryEndpoints(this RouteGroupBuilder group)
    {
        group.MapGet("/", async (
            IInventoryService service,
            string? search,
            string? category,
            string? sortBy,
            bool sortDescending = false,
            CancellationToken ct = default) =>
        {
            var items = await service.GetItemsAsync(search, category, sortBy, sortDescending, ct);
            return Results.Ok(items);
        })
        .WithName("GetInventoryItems")
        .WithSummary("Listet Inventarartikel mit optionaler Suche, Filter und Sortierung.")
        .Produces<IReadOnlyList<InventoryItemDto>>();

        group.MapGet("/categories", async (IInventoryService service, CancellationToken ct) =>
        {
            var categories = await service.GetCategoriesAsync(ct);
            return Results.Ok(categories);
        })
        .WithName("GetInventoryCategories")
        .WithSummary("Listet alle vorhandenen Kategorien.")
        .Produces<IReadOnlyList<string>>();

        group.MapGet("/{id:guid}", async (Guid id, IInventoryService service, CancellationToken ct) =>
        {
            var item = await service.GetItemAsync(id, ct);
            return item is null ? Results.NotFound() : Results.Ok(item);
        })
        .WithName("GetInventoryItem")
        .WithSummary("Liest einen einzelnen Inventarartikel.")
        .Produces<InventoryItemDto>()
        .Produces(StatusCodes.Status404NotFound);

        group.MapPost("/", async (InventoryItemCreateUpdateDto dto, IInventoryService service, CancellationToken ct) =>
        {
            var created = await service.CreateItemAsync(dto, ct);
            return Results.Created($"/api/items/{created.Id}", created);
        })
        .WithName("CreateInventoryItem")
        .WithSummary("Legt einen neuen Inventarartikel an.")
        .AddEndpointFilter<ValidationFilter<InventoryItemCreateUpdateDto>>()
        .Produces<InventoryItemDto>(StatusCodes.Status201Created)
        .ProducesValidationProblem();

        group.MapPut("/{id:guid}", async (Guid id, InventoryItemCreateUpdateDto dto, IInventoryService service, CancellationToken ct) =>
        {
            var updated = await service.UpdateItemAsync(id, dto, ct);
            return updated is null ? Results.NotFound() : Results.Ok(updated);
        })
        .WithName("UpdateInventoryItem")
        .WithSummary("Aktualisiert einen bestehenden Inventarartikel.")
        .AddEndpointFilter<ValidationFilter<InventoryItemCreateUpdateDto>>()
        .Produces<InventoryItemDto>()
        .Produces(StatusCodes.Status404NotFound)
        .ProducesValidationProblem();

        group.MapDelete("/{id:guid}", async (Guid id, IInventoryService service, CancellationToken ct) =>
        {
            var deleted = await service.DeleteItemAsync(id, ct);
            return deleted ? Results.NoContent() : Results.NotFound();
        })
        .WithName("DeleteInventoryItem")
        .WithSummary("Löscht einen Inventarartikel.")
        .Produces(StatusCodes.Status204NoContent)
        .Produces(StatusCodes.Status404NotFound);

        return group;
    }
}
