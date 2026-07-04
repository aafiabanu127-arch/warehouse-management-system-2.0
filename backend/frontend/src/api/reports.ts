import apiClient from './client';

export const getReports = () =>
  apiClient.get('/reports/').then(r => r.data);

export const createReport = (report_type: string, title: string) =>
  apiClient.post('/reports/', { report_type, title }).then(r => r.data);

export const deleteReport = (id: number) =>
  apiClient.delete(`/reports/${id}/`);

export const exportReportCSV = (id: number) =>
  apiClient.get(`/reports/${id}/export_csv/`, { responseType: 'blob' }).then(r => r.data);

export const exportReportExcel = (id: number) =>
  apiClient.get(`/reports/${id}/export_excel/`, { responseType: 'blob' }).then(r => r.data);

export const exportReportPDF = (id: number) =>
  apiClient.get(`/reports/${id}/export_pdf/`, { responseType: 'blob' }).then(r => r.data);