using System.ComponentModel.DataAnnotations.Schema;

namespace MaBaSch.Models;

public class InventoryItemVariant
{
    public Guid Id { get; set; }
    public Guid InventoryItemId { get; set; }
    public string? Size { get; set; }
    public string? Manufacturer { get; set; }
    public string? Unit { get; set; }
    public int Quantity { get; set; }
    public int MinQuantity { get; set; }
    public decimal Price { get; set; }
    public string? Location { get; set; }

    [NotMapped]
    public bool IsLowStock => Quantity <= MinQuantity;
}
