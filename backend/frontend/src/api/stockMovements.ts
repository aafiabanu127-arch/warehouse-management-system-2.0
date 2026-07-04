import apiClient from './client';
import type { StockMovement, PaginatedResponse } from '../types/stockMovement';

export const getStockMovements = async (params?: { search?: string; page?: number }) => {
  const response = await apiClient.get<PaginatedResponse<StockMovement>>('/inventory/stock-movements/', { params });
  return response.data;
};

export const createStockMovement = async (data: Partial<StockMovement>) => {
  const response = await apiClient.post<StockMovement>('/inventory/stock-movements/', data);
  return response.data;
};

export const updateStockMovement = async (id: number, data: Partial<StockMovement>) => {
  const response = await apiClient.put<StockMovement>(`/inventory/stock-movements/${id}/`, data);
  return response.data;
};

export const deleteStockMovement = async (id: number) => {
  await apiClient.delete(`/inventory/stock-movements/${id}/`);
};