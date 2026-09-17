export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  minQuantity: number;
  unit: string;
  price: number;
  location: string | null;
  isLowStock: boolean;
  updatedAt: string;
}

export interface InventoryItemInput {
  name: string;
  category: string;
  quantity: number;
  minQuantity: number;
  unit: string;
  price: number;
  location: string | null;
}

export type SortField = 'name' | 'category' | 'quantity' | 'price' | 'updatedAt';

export interface InventoryQuery {
  search?: string;
  category?: string;
  sortBy?: SortField;
  sortDescending?: boolean;
}
