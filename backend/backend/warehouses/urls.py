from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    WarehouseViewSet,
    ZoneViewSet,
    RackViewSet,
    ShelfViewSet,
    WarehouseKPIView,
)
router = DefaultRouter()
router.register(r'warehouses', WarehouseViewSet)
router.register(r'zones', ZoneViewSet)
router.register(r'racks', RackViewSet)
router.register(r'shelves', ShelfViewSet)
urlpatterns = [
    path('', include(router.urls)),
    path('kpi/', WarehouseKPIView.as_view(), name='warehouse-kpi'),
]
