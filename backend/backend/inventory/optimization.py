"""
Space Optimization Engine
--------------------------
Implements Best-Fit and First-Fit shelf allocation algorithms,
ABC classification, and product velocity analysis.
"""

from django.db.models import Sum, Count
from warehouses.models import Shelf
from .models import SpaceAllocation, StockMovement, Product


def get_shelf_free_capacity(shelf):
    return shelf.capacity - shelf.occupied_capacity


def first_fit(required_volume, warehouse_id=None):
    shelves = Shelf.objects.select_related('rack__zone__warehouse').order_by('id')
    if warehouse_id:
        shelves = shelves.filter(rack__zone__warehouse_id=warehouse_id)
    for shelf in shelves:
        if get_shelf_free_capacity(shelf) >= required_volume:
            return shelf
    return None


def best_fit(required_volume, warehouse_id=None):
    shelves = Shelf.objects.select_related('rack__zone__warehouse').order_by('id')
    if warehouse_id:
        shelves = shelves.filter(rack__zone__warehouse_id=warehouse_id)
    best_shelf = None
    smallest_remaining_space = None
    for shelf in shelves:
        free_capacity = get_shelf_free_capacity(shelf)
        if free_capacity >= required_volume:
            remaining_after_placement = free_capacity - required_volume
            if smallest_remaining_space is None or remaining_after_placement < smallest_remaining_space:
                smallest_remaining_space = remaining_after_placement
                best_shelf = shelf
    return best_shelf


def recommend_shelf(required_volume, warehouse_id=None, strategy='BEST_FIT'):
    if strategy == 'FIRST_FIT':
        shelf = first_fit(required_volume, warehouse_id)
    else:
        shelf = best_fit(required_volume, warehouse_id)
    if shelf is None:
        return None
    free_capacity = get_shelf_free_capacity(shelf)
    projected_utilization = ((shelf.occupied_capacity + required_volume) / shelf.capacity) * 100 if shelf.capacity else 0
    return {
        'shelf_id': shelf.id,
        'shelf_code': shelf.shelf_code,
        'rack_code': shelf.rack.rack_code,
        'zone_name': shelf.rack.zone.name,
        'warehouse_name': shelf.rack.zone.warehouse.name,
        'shelf_capacity': shelf.capacity,
        'shelf_occupied_capacity': shelf.occupied_capacity,
        'free_capacity_before': free_capacity,
        'required_volume': required_volume,
        'projected_utilization_percentage': round(projected_utilization, 2),
        'strategy_used': strategy,
    }


def get_warehouse_utilization_summary(warehouse_id=None):
    shelves = Shelf.objects.select_related('rack__zone__warehouse')
    if warehouse_id:
        shelves = shelves.filter(rack__zone__warehouse_id=warehouse_id)
    total_capacity = 0
    total_occupied = 0
    shelf_breakdown = []
    for shelf in shelves:
        total_capacity += shelf.capacity
        total_occupied += shelf.occupied_capacity
        utilization = (shelf.occupied_capacity / shelf.capacity * 100) if shelf.capacity else 0
        shelf_breakdown.append({
            'shelf_id': shelf.id,
            'shelf_code': shelf.shelf_code,
            'capacity': shelf.capacity,
            'occupied_capacity': shelf.occupied_capacity,
            'utilization_percentage': round(utilization, 2),
        })
    overall_utilization = (total_occupied / total_capacity * 100) if total_capacity else 0
    return {
        'total_capacity': total_capacity,
        'total_occupied': total_occupied,
        'total_free': total_capacity - total_occupied,
        'overall_utilization_percentage': round(overall_utilization, 2),
        'shelf_breakdown': shelf_breakdown,
    }


def get_product_velocity():
    """
    Product Velocity Analysis:
    Ranks products by total outbound movement quantity over all time.
    Returns a list sorted by movement volume descending.
    """
    movements = (
        StockMovement.objects
        .filter(movement_type='OUT')
        .values('product_id', 'product__name', 'product__sku')
        .annotate(
            total_out=Sum('quantity'),
            movement_count=Count('id'),
        )
        .order_by('-total_out')
    )

    result = []
    for m in movements:
        result.append({
            'product_id': m['product_id'],
            'product_name': m['product__name'],
            'sku': m['product__sku'],
            'total_outbound_quantity': m['total_out'],
            'movement_count': m['movement_count'],
        })
    return result


def get_abc_classification():
    """
    ABC Classification:
    Classifies products based on cumulative outbound movement volume.
      A: top 70% of total movement volume (fast movers)
      B: next 20% (moderate movers)
      C: remaining 10% (slow movers)
    Products with no movement are classified as C.
    """
    velocity = get_product_velocity()
    total_volume = sum(p['total_outbound_quantity'] for p in velocity) if velocity else 0

    classified = []
    cumulative = 0

    for product in velocity:
        prev_cumulative_pct = (cumulative / total_volume) * 100 if total_volume > 0 else 100
        cumulative += product['total_outbound_quantity']

        if prev_cumulative_pct < 70:
            abc_class = 'A'
        elif prev_cumulative_pct < 90:
            abc_class = 'B'
        else:
            abc_class = 'C'

        classified.append({
            **product,
            'cumulative_percentage': round(prev_cumulative_pct, 2),
            'abc_class': abc_class,
            'recommendation': {
                'A': 'High-velocity item â€” store near dispatch for fast retrieval.',
                'B': 'Moderate-velocity item â€” standard shelf location.',
                'C': 'Slow-moving item â€” store in remote/overflow shelves.',
            }[abc_class],
        })

    # Products with zero movement get class C
    all_product_ids = set(Product.objects.values_list('id', flat=True))
    classified_ids = {p['product_id'] for p in classified}
    for pid in all_product_ids - classified_ids:
        product = Product.objects.get(id=pid)
        classified.append({
            'product_id': pid,
            'product_name': product.name,
            'sku': product.sku,
            'total_outbound_quantity': 0,
            'movement_count': 0,
            'cumulative_percentage': 100.0,
            'abc_class': 'C',
            'recommendation': 'Slow-moving item â€” store in remote/overflow shelves.',
        })

    return classified

