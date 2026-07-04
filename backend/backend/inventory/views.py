from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from .optimization import recommend_shelf, get_warehouse_utilization_summary
from rest_framework.views import APIView
from .models import Category, Product, Inventory, StockMovement, SpaceAllocation, StockTransferRequest, InventoryAdjustmentRequest
from .serializers import (
    CategorySerializer,
    ProductSerializer,
    InventorySerializer,
    StockMovementSerializer,
    SpaceAllocationSerializer,
    StockTransferRequestSerializer,
    InventoryAdjustmentRequestSerializer,
)
from users.permissions import (
    IsAdminOrManager,
    IsAdminManagerOrStaff,
    IsAdminManagerOrSupervisor,
    IsWarehouseFloorStaff,
)
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


class CategoryViewSet(AuditLogMixin, viewsets.ModelViewSet):
    queryset = Category.objects.order_by('id')
    serializer_class = CategorySerializer
    permission_classes = [IsAdminOrManager]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    search_fields = ['name']
    ordering_fields = ['name']
    ordering = ['name']


class ProductViewSet(AuditLogMixin, viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsAdminOrManager]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['category']
    search_fields = ['name', 'sku', 'description']
    ordering_fields = ['name', 'unit_volume', 'unit_weight']


class InventoryViewSet(AuditLogMixin, viewsets.ModelViewSet):
    queryset = Inventory.objects.all()
    serializer_class = InventorySerializer
    permission_classes = [IsAdminManagerOrStaff]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['product', 'shelf']
    search_fields = ['product__name', 'shelf__name']
    ordering_fields = ['quantity', 'last_updated']


class StockMovementViewSet(AuditLogMixin, viewsets.ModelViewSet):
    queryset = StockMovement.objects.all()
    serializer_class = StockMovementSerializer
    permission_classes = [IsWarehouseFloorStaff]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['product', 'movement_type']
    search_fields = ['product__name', 'notes']
    ordering_fields = ['timestamp', 'quantity']


class SpaceAllocationViewSet(AuditLogMixin, viewsets.ModelViewSet):
    queryset = SpaceAllocation.objects.all()
    serializer_class = SpaceAllocationSerializer
    permission_classes = [IsAdminManagerOrStaff]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['product', 'shelf']
    search_fields = ['product__name', 'shelf__shelf_code']
    ordering_fields = ['allocated_volume', 'utilization_percentage']


class StockTransferRequestViewSet(viewsets.ModelViewSet):
    serializer_class = StockTransferRequestSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'product']
    search_fields = ['product__name', 'reason']
    ordering_fields = ['created_at']
    ordering = ['-created_at']

    def get_queryset(self):
        user = self.request.user
        if user.role in ('ADMIN', 'MANAGER', 'SUPERVISOR'):
            return StockTransferRequest.objects.all()
        return StockTransferRequest.objects.filter(requested_by=user)

    def perform_create(self, serializer):
        serializer.save(requested_by=self.request.user)

    @action(detail=True, methods=['post'], permission_classes=[IsAdminManagerOrSupervisor])
    def approve(self, request, pk=None):
        transfer = self.get_object()
        if transfer.status != 'PENDING':
            return Response({'error': 'Only pending requests can be approved.'}, status=status.HTTP_400_BAD_REQUEST)
        transfer.status = 'APPROVED'
        transfer.reviewed_by = request.user
        transfer.reviewed_at = timezone.now()
        transfer.save()
        return Response({'message': 'Transfer request approved.'})

    @action(detail=True, methods=['post'], permission_classes=[IsAdminManagerOrSupervisor])
    def reject(self, request, pk=None):
        transfer = self.get_object()
        if transfer.status != 'PENDING':
            return Response({'error': 'Only pending requests can be rejected.'}, status=status.HTTP_400_BAD_REQUEST)
        transfer.status = 'REJECTED'
        transfer.reviewed_by = request.user
        transfer.reviewed_at = timezone.now()
        transfer.save()
        return Response({'message': 'Transfer request rejected.'})


class ShelfRecommendationView(APIView):
    permission_classes = [IsAdminManagerOrStaff]

    def post(self, request):
        required_volume = request.data.get('required_volume')
        warehouse_id = request.data.get('warehouse_id')
        strategy = request.data.get('strategy', 'BEST_FIT')

        if required_volume is None:
            return Response(
                {'error': 'required_volume is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            required_volume = float(required_volume)
        except (TypeError, ValueError):
            return Response(
                {'error': 'required_volume must be a number.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        result = recommend_shelf(required_volume, warehouse_id, strategy)

        if result is None:
            return Response(
                {'message': 'No shelf with sufficient capacity was found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        return Response(result, status=status.HTTP_200_OK)

class WarehouseUtilizationView(APIView):
    permission_classes = [IsAdminManagerOrStaff]

    def get(self, request):
        warehouse_id = request.query_params.get('warehouse_id')
        summary = get_warehouse_utilization_summary(warehouse_id)
        return Response(summary, status=status.HTTP_200_OK)

class ProductVelocityView(APIView):
    permission_classes = [IsAdminManagerOrStaff]

    def get(self, request):
        from .optimization import get_product_velocity
        data = get_product_velocity()
        return Response(data, status=status.HTTP_200_OK)


class ABCClassificationView(APIView):
    permission_classes = [IsAdminManagerOrStaff]

    def get(self, request):
        from .optimization import get_abc_classification
        data = get_abc_classification()
        return Response(data, status=status.HTTP_200_OK)
    
class DemandForecastView(APIView):
    permission_classes = [IsAdminManagerOrStaff]

    def get(self, request):
        product_id = request.query_params.get('product_id')
        if product_id:
            from .forecasting import forecast_product_demand
            result = forecast_product_demand(int(product_id))
            if result is None:
                return Response({'error': 'Product not found.'}, status=status.HTTP_404_NOT_FOUND)
            return Response(result, status=status.HTTP_200_OK)
        from .forecasting import forecast_all_products
        data = forecast_all_products()
        return Response(data, status=status.HTTP_200_OK)
class InventoryAdjustmentRequestViewSet(viewsets.ModelViewSet):
    serializer_class = InventoryAdjustmentRequestSerializer
    permission_classes = [IsAdminManagerOrStaff]

    def get_queryset(self):
        return InventoryAdjustmentRequest.objects.select_related(
            'inventory', 'requested_by', 'reviewed_by'
        ).all()

    def perform_create(self, serializer):
        serializer.save(requested_by=self.request.user)

    @action(detail=True, methods=['post'], permission_classes=[IsAdminManagerOrSupervisor])
    def approve(self, request, pk=None):
        adj = self.get_object()
        if adj.status != 'PENDING':
            return Response({'error': 'Only pending requests can be approved.'}, status=status.HTTP_400_BAD_REQUEST)
        adj.status = 'APPROVED'
        adj.reviewed_by = request.user
        adj.reviewed_at = timezone.now()
        adj.save()
        return Response({'message': 'Adjustment request approved.'}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], permission_classes=[IsAdminManagerOrSupervisor])
    def reject(self, request, pk=None):
        adj = self.get_object()
        if adj.status != 'PENDING':
            return Response({'error': 'Only pending requests can be rejected.'}, status=status.HTTP_400_BAD_REQUEST)
        adj.status = 'REJECTED'
        adj.reviewed_by = request.user
        adj.reviewed_at = timezone.now()
        adj.save()
        return Response({'message': 'Adjustment request rejected.'}, status=status.HTTP_200_OK)

class DemandForecastSummaryView(APIView):
    permission_classes = [IsAdminManagerOrStaff]

    def get(self, request):
        from .forecasting import get_forecasting_summary
        data = get_forecasting_summary()
        return Response(data, status=status.HTTP_200_OK)
