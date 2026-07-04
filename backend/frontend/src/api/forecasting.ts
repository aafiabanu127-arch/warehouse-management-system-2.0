import apiClient from './client';

export const getDemandForecastSummary = async () => {
  const response = await apiClient.get('/inventory/demand-forecast/summary/');
  return response.data;
};

export const getDemandForecast = async (productId?: number) => {
  const url = productId
    ? `/inventory/demand-forecast/?product_id=${productId}`
    : '/inventory/demand-forecast/';
  const response = await apiClient.get(url);
  return response.data;
};

export const getABCClassification = async () => {
  const response = await apiClient.get('/inventory/abc-classification/');
  return response.data;
};

export const getProductVelocity = async () => {
  const response = await apiClient.get('/inventory/product-velocity/');
  return response.data;
};

export const recommendShelf = async (
  requiredVolume: number,
  warehouseId?: number,
  strategy: 'BEST_FIT' | 'WORST_FIT' = 'BEST_FIT'
) => {
  const response = await apiClient.post('/inventory/shelf-recommendation/', {
    required_volume: requiredVolume,
    warehouse_id: warehouseId,
    strategy,
  });
  return response.data;
};