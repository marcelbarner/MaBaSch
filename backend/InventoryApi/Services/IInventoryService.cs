using InventoryApi.Dtos;

namespace InventoryApi.Services;

public interface IInventoryService
{
    Task<IReadOnlyList<InventoryItemDto>> GetItemsAsync(string? search, string? category, string? sortBy, bool sortDescending, CancellationToken ct = default);
    Task<InventoryItemDto?> GetItemAsync(Guid id, CancellationToken ct = default);
    Task<InventoryItemDto> CreateItemAsync(InventoryItemCreateUpdateDto dto, CancellationToken ct = default);
    Task<InventoryItemDto?> UpdateItemAsync(Guid id, InventoryItemCreateUpdateDto dto, CancellationToken ct = default);
    Task<bool> DeleteItemAsync(Guid id, CancellationToken ct = default);
    Task<IReadOnlyList<string>> GetCategoriesAsync(CancellationToken ct = default);
}
