import apiClient from './client';
import type { Product, PaginatedResponse } from '../types/product';

export const getProducts = async (params?: { search?: string; page?: number; category?: number }) => {
  const response = await apiClient.get<PaginatedResponse<Product>>('/inventory/products/', { params });
  return response.data;
};

export const createProduct = async (data: Partial<Product>) => {
  const response = await apiClient.post<Product>('/inventory/products/', data);
  return response.data;
};

export const updateProduct = async (id: number, data: Partial<Product>) => {
  const response = await apiClient.put<Product>(`/inventory/products/${id}/`, data);
  return response.data;
};

export const deleteProduct = async (id: number) => {
  await apiClient.delete(`/inventory/products/${id}/`);
};