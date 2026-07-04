export type MovementType = 'IN' | 'OUT' | 'TRANSFER';

export interface StockMovement {
  id: number;
  product: number;
  quantity: number;
  movement_type: MovementType;
  timestamp: string;
  notes: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}