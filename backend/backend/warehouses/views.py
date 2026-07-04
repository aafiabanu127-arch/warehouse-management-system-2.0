from rest_framework import viewsets
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend
from .models import Warehouse, Zone, Rack, Shelf
from .serializers import (
    WarehouseSerializer,
    ZoneSerializer,
    RackSerializer,
    ShelfSerializer,
)
from users.permissions import IsAdminOrManager
from users.models import log_action


class AuditLogMixin:
    def perform_create(self, serializer):
        instance = serializer.save()
        log_action(self.request.user, 'CREATE', instance.__class__.__name__,
                   resource_id=instance.pk, request=self.request)

    def perform_update(self, serializer):
        instance = serializer.save()
        log_action(self.request.user, 'UPDATE', instance.__class__.__name__,
                   resource_id=instance.pk, request=self.request)

    def perform_destroy(self, instance):
        log_action(self.request.user, 'DELETE', instance.__class__.__name__,
                   resource_id=instance.pk, request=self.request)
        instance.delete()


class WarehouseViewSet(AuditLogMixin, viewsets.ModelViewSet):
    queryset = Warehouse.objects.all()
    serializer_class = WarehouseSerializer
    permission_classes = [IsAdminOrManager]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['location']
    search_fields = ['name', 'location', 'manager__username']
    ordering_fields = ['name', 'total_capacity', 'available_capacity', 'created_at']


class ZoneViewSet(AuditLogMixin, viewsets.ModelViewSet):
    queryset = Zone.objects.all()
    serializer_class = ZoneSerializer
    permission_classes = [IsAdminOrManager]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['warehouse']
    search_fields = ['name']
    ordering_fields = ['name']


class RackViewSet(AuditLogMixin, viewsets.ModelViewSet):
    queryset = Rack.objects.all()
    serializer_class = RackSerializer
    permission_classes = [IsAdminOrManager]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['zone']
    search_fields = ['rack_code']
    ordering_fields = ['rack_code']


class ShelfViewSet(AuditLogMixin, viewsets.ModelViewSet):
    queryset = Shelf.objects.all()
    serializer_class = ShelfSerializer
    permission_classes = [IsAdminOrManager]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['rack']
    search_fields = ['shelf_code']
    ordering_fields = ['shelf_code']
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status


class WarehouseKPIView(APIView):
    permission_classes = [IsAdminOrManager]

    def get(self, request):
        warehouses = Warehouse.objects.all()
        kpi_list = []

        for wh in warehouses:
            total = wh.total_capacity
            available = wh.available_capacity
            occupied = total - available
            occupancy_pct = round((occupied / total * 100), 2) if total else 0
            efficiency_pct = round((occupied / total * 100), 2) if total else 0

            # Count zones, racks, shelves
            zone_count = wh.zones.count()
            rack_count = sum(z.racks.count() for z in wh.zones.all())
            shelf_count = sum(r.shelves.count() for z in wh.zones.all() for r in z.racks.all())

            kpi_list.append({
                'warehouse_id': wh.id,
                'warehouse_name': wh.name,
                'location': wh.location,
                'manager_name': wh.manager.username if wh.manager else None,
                'total_capacity': total,
                'occupied_capacity': occupied,
                'available_capacity': available,
                'occupancy_percentage': occupancy_pct,
                'storage_efficiency_percentage': efficiency_pct,
                'zone_count': zone_count,
                'rack_count': rack_count,
                'shelf_count': shelf_count,
                'status': 'Critical' if occupancy_pct >= 90 else 'High' if occupancy_pct >= 70 else 'Moderate' if occupancy_pct >= 40 else 'Low',
            })

        overall_total = sum(w['total_capacity'] for w in kpi_list)
        overall_occupied = sum(w['occupied_capacity'] for w in kpi_list)
        overall_occupancy = round((overall_occupied / overall_total * 100), 2) if overall_total else 0

        return Response({
            'overall_occupancy_percentage': overall_occupancy,
            'total_warehouses': len(kpi_list),
            'warehouses': kpi_list,
        }, status=status.HTTP_200_OK)