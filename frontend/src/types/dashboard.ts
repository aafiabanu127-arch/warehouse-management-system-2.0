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

export interface CategoryBreakdown {
  category: string;
  total_quantity: number;
  total_value: number;
  product_count: number;
}

export interface MovementTrendPoint {
  date: string;
  in: number;
  out: number;
  transfer: number;
}

export interface TopProduct {
  name: string;
  sku: string;
  quantity: number;
}

export interface LowStockItem {
  name: string;
  sku: string;
  quantity: number;
  shelf_code: string;
}

export interface PendingApprovals {
  transfers: number;
  adjustments: number;
  total: number;
}

export interface StructureCounts {
  zones: number;
  racks: number;
  shelves: number;
  categories: number;
}

export interface CapacityOverview {
  total_capacity: number;
  available_capacity: number;
  used_capacity: number;
  utilization_percent: number;
}

export interface MovementTotals30d {
  in: number;
  out: number;
  transfer: number;
}

export interface DashboardSummary {
  total_warehouses: number;
  total_products: number;
  total_inventory_quantity: number;
  total_inventory_value: number;
  low_stock_count: number;
  low_stock_threshold_used: number;
  warehouse_utilization: WarehouseUtilization[];
  recent_movements: RecentMovement[];
  category_breakdown: CategoryBreakdown[];
  movement_trend: MovementTrendPoint[];
  top_products: TopProduct[];
  low_stock_items: LowStockItem[];
  pending_approvals: PendingApprovals;
  structure_counts: StructureCounts;
  capacity_overview: CapacityOverview;
  movement_totals_30d: MovementTotals30d;
}
