import apiClient from './client';
import type { Warehouse, PaginatedResponse } from '../types/warehouse';

export const getWarehouses = async (params?: { search?: string; page?: number }) => {
  const response = await apiClient.get<PaginatedResponse<Warehouse>>('/warehouses/warehouses/', { params });
  return response.data;
};

export const createWarehouse = async (data: Partial<Warehouse>) => {
  const response = await apiClient.post<Warehouse>('/warehouses/warehouses/', data);
  return response.data;
};

export const updateWarehouse = async (id: number, data: Partial<Warehouse>) => {
  const response = await apiClient.put<Warehouse>(`/warehouses/warehouses/${id}/`, data);
  return response.data;
};

export const deleteWarehouse = async (id: number) => {
  await apiClient.delete(`/warehouses/warehouses/${id}/`);
};