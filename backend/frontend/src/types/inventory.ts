export interface InventoryItem {
  id: number;
  product: number;
  shelf: number;
  quantity: number;
  last_updated: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}