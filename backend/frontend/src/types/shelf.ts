export interface Shelf {
  id: number;
  shelf_code: string;
  capacity: number;
  occupied_capacity: number;
  rack: number;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}