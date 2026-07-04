export interface WarehouseUtilization {
  warehouse_id: number;
  name: string;
  utilization_percent: number;
}

export interface RecentMovement {
  product__name: string;
  quantity: number;
  movement_type: string;
  timestamp: string;
}

export interface DashboardSummary {
  total_warehouses: number;
  total_products: number;
  total_inventory_quantity: number;
  low_stock_count: number;
  low_stock_threshold_used: number;
  warehouse_utilization: WarehouseUtilization[];
  recent_movements: RecentMovement[];
}