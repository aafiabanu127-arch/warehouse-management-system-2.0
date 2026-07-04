from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CategoryViewSet, ProductViewSet, InventoryViewSet,
    StockMovementViewSet, SpaceAllocationViewSet,
    StockTransferRequestViewSet, InventoryAdjustmentRequestViewSet,
    ShelfRecommendationView, WarehouseUtilizationView,
    ProductVelocityView, ABCClassificationView,
    DemandForecastView, DemandForecastSummaryView,
)

router = DefaultRouter()
router.register(r'categories', CategoryViewSet)
router.register(r'products', ProductViewSet)
router.register(r'inventory', InventoryViewSet)
router.register(r'stock-movements', StockMovementViewSet)
router.register(r'space-allocations', SpaceAllocationViewSet)
router.register(r'transfer-requests', StockTransferRequestViewSet, basename='stocktransferrequest')
router.register(r'adjustment-requests', InventoryAdjustmentRequestViewSet, basename='inventoryadjustmentrequest')

urlpatterns = [
    path('', include(router.urls)),
    path('shelf-recommendation/', ShelfRecommendationView.as_view(), name='shelf-recommendation'),
    path('warehouse-utilization/', WarehouseUtilizationView.as_view(), name='warehouse-utilization'),
    path('product-velocity/', ProductVelocityView.as_view(), name='product-velocity'),
    path('abc-classification/', ABCClassificationView.as_view(), name='abc-classification'),
    path('demand-forecast/', DemandForecastView.as_view(), name='demand-forecast'),
    path('demand-forecast/summary/', DemandForecastSummaryView.as_view(), name='demand-forecast-summary'),
]
