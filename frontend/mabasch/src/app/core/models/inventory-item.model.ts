export interface InventoryItemVariant {
  id: string;
  size: string | null;
  manufacturer: string | null;
  unit: string | null;
  quantity: number;
  minQuantity: number;
  price: number;
  location: string | null;
  isLowStock: boolean;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  updatedAt: string;
  hasVariants: boolean;
  isLowStock: boolean;
  totalQuantity: number;
  minPrice: number;
  maxPrice: number;
  quantity: number | null;
  minQuantity: number | null;
  unit: string | null;
  price: number | null;
  location: string | null;
  variants: InventoryItemVariant[];
}

export interface InventoryItemVariantInput {
  size: string | null;
  manufacturer: string | null;
  unit: string | null;
  quantity: number;
  minQuantity: number;
  price: number;
  location: string | null;
}

export interface InventoryItemInput {
  name: string;
  category: string;
  quantity: number | null;
  minQuantity: number | null;
  unit: string | null;
  price: number | null;
  location: string | null;
  variants: InventoryItemVariantInput[] | null;
}

export type SortField = 'name' | 'category' | 'quantity' | 'price' | 'updatedAt';

export interface InventoryQuery {
  search?: string;
  category?: string;
  sortBy?: SortField;
  sortDescending?: boolean;
}
