namespace MaBaSch.Models;

public class InventoryItem
{
    public Guid Id { get; set; }
    public required string Name { get; set; }
    public required string Category { get; set; }
    public int? Quantity { get; set; }
    public int? MinQuantity { get; set; }
    public string? Unit { get; set; }
    public decimal? Price { get; set; }
    public string? Location { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }

    public List<InventoryItemVariant> Variants { get; set; } = [];
}
