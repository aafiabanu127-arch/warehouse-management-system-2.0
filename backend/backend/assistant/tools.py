"""
Tool functions the AI assistant can call.

Every function takes `user` (the authenticated CustomUser making the chat
request) as its first argument so we can scope/permission-check each action
exactly like the regular REST endpoints do. Every function returns a plain
JSON-serialisable dict — never a model instance — since results are fed
straight back to the Claude API as tool_result content.
"""
from django.db.models import Sum, F, Q
from django.utils import timezone
from datetime import timedelta

from inventory.models import Product, Category, Inventory, StockMovement
from warehouses.models import Warehouse, Zone, Rack, Shelf
from notifications.models import Notification, Alert

ROLE_LEVEL = {
    'ADMIN': 6, 'MANAGER': 5, 'SUPERVISOR': 4,
    'STAFF': 3, 'PICKER': 2, 'AUDITOR': 1, 'VIEWER': 0,
}


def _level(user):
    return ROLE_LEVEL.get(getattr(user, 'role', 'VIEWER'), 0)


class ToolPermissionError(Exception):
    """Raised when the current user's role can't perform a requested action."""
    pass


# ---------------------------------------------------------------------------
# READ-ONLY TOOLS
# ---------------------------------------------------------------------------

def search_products(user, query: str = '', category: str = '', limit: int = 15):
    qs = Product.objects.select_related('category').all()
    if query:
        qs = qs.filter(Q(name__icontains=query) | Q(sku__icontains=query))
    if category:
        qs = qs.filter(category__name__icontains=category)
    qs = qs[:limit]
    return {
        'count': qs.count() if hasattr(qs, 'count') else len(qs),
        'products': [
            {
                'id': p.id, 'name': p.name, 'sku': p.sku,
                'category': p.category.name,
                'unit_price': str(p.unit_price),
                'reorder_level': p.reorder_level,
            } for p in qs
        ]
    }


def get_low_stock_products(user, limit: int = 20):
    """Products whose total quantity across all shelves is at/below reorder_level."""
    products = Product.objects.annotate(
        total_qty=Sum('inventory_records__quantity')
    ).filter(total_qty__isnull=False, total_qty__lte=F('reorder_level')).order_by('total_qty')[:limit]
    return {
        'low_stock_products': [
            {
                'id': p.id, 'name': p.name, 'sku': p.sku,
                'current_quantity': p.total_qty, 'reorder_level': p.reorder_level,
            } for p in products
        ]
    }


def get_inventory_summary(user, product_name: str = '', warehouse_name: str = ''):
    qs = Inventory.objects.select_related('product', 'shelf__rack__zone__warehouse')
    if product_name:
        qs = qs.filter(product__name__icontains=product_name)
    if warehouse_name:
        qs = qs.filter(shelf__rack__zone__warehouse__name__icontains=warehouse_name)
    qs = qs[:50]
    return {
        'inventory': [
            {
                'product': inv.product.name,
                'sku': inv.product.sku,
                'quantity': inv.quantity,
                'shelf': inv.shelf.shelf_code,
                'warehouse': inv.shelf.rack.zone.warehouse.name,
                'last_updated': inv.last_updated.isoformat(),
            } for inv in qs
        ]
    }


def get_warehouses(user):
    warehouses = Warehouse.objects.all()
    return {
        'warehouses': [
            {
                'id': w.id, 'name': w.name, 'location': w.location,
                'total_capacity': w.total_capacity,
                'available_capacity': w.available_capacity,
                'utilization_pct': round(
                    100 * (1 - w.available_capacity / w.total_capacity), 2
                ) if w.total_capacity else None,
                'manager': w.manager.username if w.manager else None,
            } for w in warehouses
        ]
    }


def get_recent_stock_movements(user, product_name: str = '', movement_type: str = '', days: int = 7, limit: int = 20):
    since = timezone.now() - timedelta(days=days)
    qs = StockMovement.objects.select_related('product').filter(timestamp__gte=since)
    if product_name:
        qs = qs.filter(product__name__icontains=product_name)
    if movement_type:
        qs = qs.filter(movement_type=movement_type.upper())
    qs = qs.order_by('-timestamp')[:limit]
    return {
        'movements': [
            {
                'product': m.product.name, 'quantity': m.quantity,
                'type': m.movement_type, 'timestamp': m.timestamp.isoformat(),
                'notes': m.notes,
            } for m in qs
        ]
    }


def get_notifications_summary(user, unread_only: bool = True, limit: int = 10):
    qs = Notification.objects.filter(user=user)
    if unread_only:
        qs = qs.filter(is_read=False)
    qs = qs[:limit]
    active_alerts = Alert.objects.filter(is_active=True)[:10]
    return {
        'notifications': [
            {'title': n.title, 'message': n.message, 'type': n.notif_type, 'is_read': n.is_read}
            for n in qs
        ],
        'active_alerts': [
            {'title': a.title, 'message': a.message, 'severity': a.severity}
            for a in active_alerts
        ],
    }


def get_dashboard_overview(user):
    total_products = Product.objects.count()
    total_warehouses = Warehouse.objects.count()
    total_stock = Inventory.objects.aggregate(total=Sum('quantity'))['total'] or 0
    low_stock_count = Product.objects.annotate(
        total_qty=Sum('inventory_records__quantity')
    ).filter(total_qty__isnull=False, total_qty__lte=F('reorder_level')).count()
    return {
        'total_products': total_products,
        'total_warehouses': total_warehouses,
        'total_units_in_stock': total_stock,
        'low_stock_product_count': low_stock_count,
    }


# ---------------------------------------------------------------------------
# ACTION TOOLS (mutate data — permission checked against the same role rules
# used by the REST API, see users/permissions.py)
# ---------------------------------------------------------------------------

def create_stock_movement(user, product_sku: str, quantity: int, movement_type: str, notes: str = ''):
    """Record a stock movement (IN / OUT / TRANSFER). Mirrors StockMovementViewSet,
    which requires ADMIN, MANAGER, SUPERVISOR, STAFF, or PICKER (IsWarehouseFloorStaff)."""
    if _level(user) < 2:
        raise ToolPermissionError(
            "Your role doesn't have permission to record stock movements. "
            "This requires Staff level or above."
        )
    movement_type = movement_type.upper()
    if movement_type not in ('IN', 'OUT', 'TRANSFER'):
        return {'error': "movement_type must be one of IN, OUT, TRANSFER"}
    try:
        product = Product.objects.get(sku__iexact=product_sku)
    except Product.DoesNotExist:
        return {'error': f"No product found with SKU '{product_sku}'"}
    if quantity <= 0:
        return {'error': "quantity must be a positive number"}

    movement = StockMovement.objects.create(
        product=product, quantity=quantity, movement_type=movement_type, notes=notes,
    )

    # Keep aggregate inventory numbers consistent with the movement, same as
    # the rest of the app expects (best-effort: only if a single inventory
    # row exists for this product, otherwise ask the user to specify a shelf
    # via the Inventory page).
    inv_rows = Inventory.objects.filter(product=product)
    updated_row = None
    if inv_rows.count() == 1:
        inv = inv_rows.first()
        if movement_type == 'IN':
            inv.quantity = F('quantity') + quantity
        elif movement_type == 'OUT':
            inv.quantity = F('quantity') - quantity
        if movement_type in ('IN', 'OUT'):
            inv.save(update_fields=['quantity'])
            inv.refresh_from_db()
            updated_row = {'shelf': inv.shelf.shelf_code, 'new_quantity': inv.quantity}

    return {
        'success': True,
        'movement_id': movement.id,
        'product': product.name,
        'movement_type': movement_type,
        'quantity': quantity,
        'updated_inventory': updated_row,
    }


def adjust_inventory_quantity(user, product_sku: str, shelf_code: str, new_quantity: int):
    """Directly set an inventory row's quantity. Mirrors InventoryViewSet,
    which requires ADMIN, MANAGER, SUPERVISOR, or STAFF (IsAdminManagerOrStaff)."""
    if _level(user) < 3:
        raise ToolPermissionError(
            "Your role doesn't have permission to edit inventory directly. "
            "This requires Supervisor level or above."
        )
    if new_quantity < 0:
        return {'error': "new_quantity cannot be negative"}
    try:
        inv = Inventory.objects.select_related('product').get(
            product__sku__iexact=product_sku, shelf__shelf_code__iexact=shelf_code
        )
    except Inventory.DoesNotExist:
        return {'error': f"No inventory row found for SKU '{product_sku}' on shelf '{shelf_code}'"}
    old_quantity = inv.quantity
    inv.quantity = new_quantity
    inv.save(update_fields=['quantity'])
    return {
        'success': True,
        'product': inv.product.name,
        'shelf': shelf_code,
        'old_quantity': old_quantity,
        'new_quantity': new_quantity,
    }


# Registry consumed by claude_client.py — maps tool name -> (function, JSON schema)
TOOL_SPECS = [
    {
        "name": "search_products",
        "description": "Search the product catalog by name, SKU, or category.",
        "input_schema": {
            "type": "object",
            "properties": {
                "query": {"type": "string", "description": "Text to search in product name or SKU"},
                "category": {"type": "string", "description": "Filter by category name"},
                "limit": {"type": "integer", "description": "Max results, default 15"},
            },
        },
        "func": search_products,
    },
    {
        "name": "get_low_stock_products",
        "description": "List products whose current stock is at or below their reorder level.",
        "input_schema": {
            "type": "object",
            "properties": {"limit": {"type": "integer", "description": "Max results, default 20"}},
        },
        "func": get_low_stock_products,
    },
    {
        "name": "get_inventory_summary",
        "description": "Get current inventory levels, optionally filtered by product or warehouse name.",
        "input_schema": {
            "type": "object",
            "properties": {
                "product_name": {"type": "string"},
                "warehouse_name": {"type": "string"},
            },
        },
        "func": get_inventory_summary,
    },
    {
        "name": "get_warehouses",
        "description": "List all warehouses with capacity and utilization info.",
        "input_schema": {"type": "object", "properties": {}},
        "func": get_warehouses,
    },
    {
        "name": "get_recent_stock_movements",
        "description": "List recent stock movements (IN/OUT/TRANSFER), optionally filtered by product or type.",
        "input_schema": {
            "type": "object",
            "properties": {
                "product_name": {"type": "string"},
                "movement_type": {"type": "string", "enum": ["IN", "OUT", "TRANSFER"]},
                "days": {"type": "integer", "description": "How many days back to look, default 7"},
                "limit": {"type": "integer", "description": "Max results, default 20"},
            },
        },
        "func": get_recent_stock_movements,
    },
    {
        "name": "get_notifications_summary",
        "description": "Get the current user's notifications and any active system-wide alerts.",
        "input_schema": {
            "type": "object",
            "properties": {"unread_only": {"type": "boolean"}, "limit": {"type": "integer"}},
        },
        "func": get_notifications_summary,
    },
    {
        "name": "get_dashboard_overview",
        "description": "Get high-level KPIs: total products, warehouses, units in stock, and low-stock count.",
        "input_schema": {"type": "object", "properties": {}},
        "func": get_dashboard_overview,
    },
    {
        "name": "create_stock_movement",
        "description": (
            "Record a stock IN, OUT, or TRANSFER movement for a product by SKU. "
            "This is a real write action — confirm details with the user before calling it "
            "if there's any ambiguity. Requires Staff role or above."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "product_sku": {"type": "string"},
                "quantity": {"type": "integer"},
                "movement_type": {"type": "string", "enum": ["IN", "OUT", "TRANSFER"]},
                "notes": {"type": "string"},
            },
            "required": ["product_sku", "quantity", "movement_type"],
        },
        "func": create_stock_movement,
    },
    {
        "name": "adjust_inventory_quantity",
        "description": (
            "Directly set the quantity of a product on a specific shelf. "
            "This is a real write action — confirm with the user before calling. "
            "Requires Supervisor role or above."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "product_sku": {"type": "string"},
                "shelf_code": {"type": "string"},
                "new_quantity": {"type": "integer"},
            },
            "required": ["product_sku", "shelf_code", "new_quantity"],
        },
        "func": adjust_inventory_quantity,
    },
]

TOOLS_BY_NAME = {spec["name"]: spec for spec in TOOL_SPECS}
