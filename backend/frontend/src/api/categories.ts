import apiClient from './client';
import type { Category, PaginatedResponse } from '../types/category';

export const getCategories = async (params?: { search?: string; page?: number }) => {
  const response = await apiClient.get<PaginatedResponse<Category>>('/inventory/categories/', { params });
  return response.data;
};

export const createCategory = async (data: Partial<Category>) => {
  const response = await apiClient.post<Category>('/inventory/categories/', data);
  return response.data;
};

export const updateCategory = async (id: number, data: Partial<Category>) => {
  const response = await apiClient.put<Category>(`/inventory/categories/${id}/`, data);
  return response.data;
};

export const deleteCategory = async (id: number) => {
  await apiClient.delete(`/inventory/categories/${id}/`);
};