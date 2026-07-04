import apiClient from './client';
import type { Shelf, PaginatedResponse } from '../types/shelf';

export const getShelves = async (params?: { search?: string; page?: number }) => {
  const response = await apiClient.get<PaginatedResponse<Shelf>>('/warehouses/shelves/', { params });
  return response.data;
};

export const createShelf = async (payload: { shelf_code: string; capacity: number; rack: number }) => {
  const response = await apiClient.post<Shelf>('/warehouses/shelves/', payload);
  return response.data;
};

export const updateShelf = async (id: number, payload: Partial<{ shelf_code: string; capacity: number; rack: number }>) => {
  const response = await apiClient.patch<Shelf>(`/warehouses/shelves/${id}/`, payload);
  return response.data;
};

export const deleteShelf = async (id: number) => {
  await apiClient.delete(`/warehouses/shelves/${id}/`);
};
