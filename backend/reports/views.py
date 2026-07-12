from django.utils import timezone
from django.db.models import Sum, Count, Avg, F, DecimalField, ExpressionWrapper  # Avg kept for ReportViewSet SPACE report
from django.db.models.functions import TruncDate
from datetime import timedelta
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Report
from .serializers import ReportSerializer
from .exports import export_report_csv, export_report_excel, export_report_pdf
from inventory.models import (
    Inventory, StockMovement, SpaceAllocation, Category, Product,
    StockTransferRequest, InventoryAdjustmentRequest,
)
from warehouses.models import Warehouse, Zone, Rack, Shelf


class ReportViewSet(viewsets.ModelViewSet):
    queryset = Report.objects.all()
    serializer_class = ReportSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['report_type', 'status']
    ordering_fields = ['created_at']

    def perform_create(self, serializer):
        report = serializer.save(
            generated_by=self.request.user,
            status='PENDING'
        )
        self._generate_report(report)

    def _generate_report(self, report):
        try:
            result = {}
            rtype  = report.report_type

            if rtype == 'INVENTORY':
                data = Inventory.objects.values(
                    'product__name', 'shelf__shelf_code'
                ).annotate(total_qty=Sum('quantity'))
                result = {'inventory': list(data)}

            elif rtype == 'WAREHOUSE':
                data = Warehouse.objects.values(
                    'name', 'total_capacity', 'available_capacity'
                ).annotate(zone_count=Count('zones'))
                result = {'warehouses': list(data)}

            elif rtype == 'STOCK':
                data = StockMovement.objects.values(
                    'movement_type'
                ).annotate(
                    count=Count('id'),
                    total_qty=Sum('quantity')
                )
                result = {'stock_movements': list(data)}

            elif rtype == 'SPACE':
                data = SpaceAllocation.objects.values(
                    'shelf__shelf_code'
                ).annotate(
                    avg_utilization=Avg('utilization_percentage'),
                    total_allocated=Sum('allocated_volume')
                )
                result = {'space': list(data)}

            report.result       = result
            report.status       = 'COMPLETED'
            report.completed_at = timezone.now()
            report.save()

        except Exception as e:
            report.status = 'FAILED'
            report.result = {'error': str(e)}
            report.save()

    @action(detail=True, methods=['get'])
    def export_csv(self, request, pk=None):
        report = self.get_object()
        return export_report_csv(report)

    @action(detail=True, methods=['get'])
    def export_excel(self, request, pk=None):
        report = self.get_object()
        return export_report_excel(report)

    @action(detail=True, methods=['get'])
    def export_pdf(self, request, pk=None):
        report = self.get_object()
        return export_report_pdf(report)


class DashboardView(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def summary(self, request):
        LOW_STOCK_THRESHOLD = 10

        total_warehouses = Warehouse.objects.count()
        total_products   = Inventory.objects.values('product').distinct().count()
        total_inventory  = Inventory.objects.aggregate(
                               total=Sum('quantity'))['total'] or 0
        low_stock        = Inventory.objects.filter(
                               quantity__lt=LOW_STOCK_THRESHOLD).count()

        recent_movements = StockMovement.objects.order_by('-timestamp')[:5].values(
                               'product__name', 'movement_type', 'quantity', 'timestamp')

        # Warehouse utilization: used capacity as a percentage of total
        warehouses = Warehouse.objects.all()
        warehouse_utilization = []
        for wh in warehouses:
            if wh.total_capacity and wh.total_capacity > 0:
                used = wh.total_capacity - (wh.available_capacity or 0)
                utilization_percent = round((used / wh.total_capacity) * 100, 1)
            else:
                utilization_percent = 0
            warehouse_utilization.append({
                'name': wh.name,
                'utilization_percent': utilization_percent,
            })

        # ---- Inventory value (quantity * unit_price) ----
        value_expr = ExpressionWrapper(
            F('quantity') * F('product__unit_price'),
            output_field=DecimalField(max_digits=14, decimal_places=2),
        )
        total_inventory_value = Inventory.objects.aggregate(
            total=Sum(value_expr))['total'] or 0

        # ---- Category breakdown ----
        category_breakdown = list(
            Inventory.objects.values('product__category__name')
            .annotate(
                total_quantity=Sum('quantity'),
                total_value=Sum(value_expr),
                product_count=Count('product', distinct=True),
            )
            .order_by('-total_quantity')
        )
        category_breakdown = [{
            'category':       c['product__category__name'] or 'Uncategorized',
            'total_quantity': c['total_quantity'] or 0,
            'total_value':    float(c['total_value'] or 0),
            'product_count':  c['product_count'],
        } for c in category_breakdown]

        # ---- 14-day movement trend (daily IN vs OUT) ----
        since_14 = timezone.now() - timedelta(days=14)
        daily = (
            StockMovement.objects.filter(timestamp__gte=since_14)
            .annotate(day=TruncDate('timestamp'))
            .values('day', 'movement_type')
            .annotate(total=Sum('quantity'))
            .order_by('day')
        )
        trend_map: dict = {}
        for row in daily:
            day_key = row['day'].isoformat()
            entry = trend_map.setdefault(day_key, {'date': day_key, 'in': 0, 'out': 0, 'transfer': 0})
            mtype = row['movement_type']
            if mtype == 'IN':
                entry['in'] += row['total']
            elif mtype == 'OUT':
                entry['out'] += row['total']
            else:
                entry['transfer'] += row['total']
        # Fill in the full 14-day range so the chart has no gaps
        movement_trend = []
        for i in range(13, -1, -1):
            day = (timezone.now() - timedelta(days=i)).date().isoformat()
            movement_trend.append(trend_map.get(day, {'date': day, 'in': 0, 'out': 0, 'transfer': 0}))

        # ---- Top products by quantity on hand ----
        top_products = list(
            Inventory.objects.values('product__name', 'product__sku')
            .annotate(total_quantity=Sum('quantity'))
            .order_by('-total_quantity')[:6]
        )
        top_products = [{
            'name':     p['product__name'],
            'sku':      p['product__sku'],
            'quantity': p['total_quantity'],
        } for p in top_products]

        # ---- Detailed low-stock items (not just a count) ----
        low_stock_items = list(
            Inventory.objects.filter(quantity__lt=LOW_STOCK_THRESHOLD)
            .select_related('product', 'shelf')
            .order_by('quantity')
            .values('product__name', 'product__sku', 'quantity', 'shelf__shelf_code')[:8]
        )
        low_stock_items = [{
            'name':        i['product__name'],
            'sku':         i['product__sku'],
            'quantity':    i['quantity'],
            'shelf_code':  i['shelf__shelf_code'],
        } for i in low_stock_items]

        # ---- Pending approvals (transfers + adjustments) ----
        pending_transfers   = StockTransferRequest.objects.filter(status='PENDING').count()
        pending_adjustments = InventoryAdjustmentRequest.objects.filter(status='PENDING').count()

        # ---- Warehouse structure counts ----
        structure_counts = {
            'zones':  Zone.objects.count(),
            'racks':  Rack.objects.count(),
            'shelves': Shelf.objects.count(),
            'categories': Category.objects.count(),
        }

        # ---- Capacity overview across all warehouses ----
        capacity_agg = Warehouse.objects.aggregate(
            total=Sum('total_capacity'), available=Sum('available_capacity'))
        total_cap = capacity_agg['total'] or 0
        avail_cap = capacity_agg['available'] or 0
        used_cap  = total_cap - avail_cap
        capacity_overview = {
            'total_capacity':     round(total_cap, 1),
            'available_capacity': round(avail_cap, 1),
            'used_capacity':      round(used_cap, 1),
            'utilization_percent': round((used_cap / total_cap) * 100, 1) if total_cap else 0,
        }

        # ---- 30-day movement totals (overall throughput) ----
        since_30 = timezone.now() - timedelta(days=30)
        totals_30 = (
            StockMovement.objects.filter(timestamp__gte=since_30)
            .values('movement_type').annotate(total=Sum('quantity'))
        )
        movement_totals_30d = {'in': 0, 'out': 0, 'transfer': 0}
        for row in totals_30:
            key = row['movement_type'].lower()
            if key in movement_totals_30d:
                movement_totals_30d[key] = row['total'] or 0

        return Response({
            'total_warehouses':         total_warehouses,
            'total_products':           total_products,
            'total_inventory_quantity': total_inventory,
            'total_inventory_value':    float(total_inventory_value),
            'low_stock_count':          low_stock,
            'low_stock_threshold_used': LOW_STOCK_THRESHOLD,
            'warehouse_utilization':    warehouse_utilization,
            'recent_movements':         list(recent_movements),
            'category_breakdown':       category_breakdown,
            'movement_trend':           movement_trend,
            'top_products':             top_products,
            'low_stock_items':          low_stock_items,
            'pending_approvals': {
                'transfers':    pending_transfers,
                'adjustments':  pending_adjustments,
                'total':        pending_transfers + pending_adjustments,
            },
            'structure_counts':         structure_counts,
            'capacity_overview':        capacity_overview,
            'movement_totals_30d':      movement_totals_30d,
        })
    

from rest_framework.views import APIView
from datetime import timedelta
from django.db.models import F


class InventoryAnalyticsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        report_type = request.query_params.get('type', 'slow_moving')
        days = int(request.query_params.get('days', 30))
        since = timezone.now() - timedelta(days=days)

        if report_type == 'slow_moving':
            # Products with little or no outbound movement in the period
            active_ids = StockMovement.objects.filter(
                movement_type='OUT', timestamp__gte=since
            ).values_list('product_id', flat=True).distinct()

            slow = Inventory.objects.exclude(
                product_id__in=active_ids
            ).values(
                'product__name', 'product__sku'
            ).annotate(
                total_quantity=Sum('quantity')
            ).order_by('-total_quantity')

            return Response({
                'report_type': 'slow_moving',
                'period_days': days,
                'count': slow.count(),
                'items': list(slow),
            })

        elif report_type == 'dead_stock':
            # Products with zero movement ever
            moved_ids = StockMovement.objects.values_list('product_id', flat=True).distinct()
            dead = Inventory.objects.exclude(
                product_id__in=moved_ids
            ).values(
                'product__name', 'product__sku'
            ).annotate(
                total_quantity=Sum('quantity')
            ).order_by('-total_quantity')

            return Response({
                'report_type': 'dead_stock',
                'count': dead.count(),
                'items': list(dead),
            })

        elif report_type == 'turnover':
            # Inventory turnover = total outbound / average inventory quantity
            movements = StockMovement.objects.filter(
                movement_type='OUT', timestamp__gte=since
            ).values('product__name', 'product__sku').annotate(
                total_out=Sum('quantity')
            )

            result = []
            for m in movements:
                avg_inv = Inventory.objects.filter(
                    product__sku=m['product__sku']
                ).aggregate(avg=Avg('quantity'))['avg'] or 1
                turnover = round(m['total_out'] / avg_inv, 2)
                result.append({
                    'product_name': m['product__name'],
                    'sku': m['product__sku'],
                    'total_outbound': m['total_out'],
                    'avg_inventory': round(avg_inv, 2),
                    'turnover_ratio': turnover,
                    'rating': 'Fast' if turnover > 2 else 'Normal' if turnover > 0.5 else 'Slow',
                })
            result.sort(key=lambda x: x['turnover_ratio'], reverse=True)

            return Response({
                'report_type': 'turnover',
                'period_days': days,
                'count': len(result),
                'items': result,
            })

        return Response({'error': 'Invalid type. Use slow_moving, dead_stock, or turnover.'}, status=400)

class ForecastingReportView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from inventory.forecasting import get_forecasting_summary, forecast_all_products
        summary = get_forecasting_summary()
        detailed = forecast_all_products()
        return Response({
            'report_type': 'FORECASTING',
            'generated_at': timezone.now().isoformat(),
            'summary': summary,
            'product_forecasts': detailed,
        }, status=status.HTTP_200_OK)