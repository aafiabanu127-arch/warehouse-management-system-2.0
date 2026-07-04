import apiClient from './client';
import type { DashboardSummary } from '../types/dashboard';

export const getDashboardSummary = async () => {
  const response = await apiClient.get<DashboardSummary>('/reports/dashboard-summary/');
  return response.data;
};