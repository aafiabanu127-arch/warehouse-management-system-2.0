import apiClient from './client';
import type { InventoryItem, PaginatedResponse } from '../types/inventory';

export const getInventoryItems = async (params?: { search?: string; page?: number }) => {
  const response = await apiClient.get<PaginatedResponse<InventoryItem>>('/inventory/inventory/', { params });
  return response.data;
};

export const createInventoryItem = async (data: Partial<InventoryItem>) => {
  const response = await apiClient.post<InventoryItem>('/inventory/inventory/', data);
  return response.data;
};

export const updateInventoryItem = async (id: number, data: Partial<InventoryItem>) => {
  const response = await apiClient.put<InventoryItem>(`/inventory/inventory/${id}/`, data);
  return response.data;
};

export const deleteInventoryItem = async (id: number) => {
  await apiClient.delete(`/inventory/inventory/${id}/`);
};