from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ReportViewSet, DashboardView, InventoryAnalyticsView, ForecastingReportView

router = DefaultRouter()
router.register(r'reports', ReportViewSet, basename='report')

dashboard_summary = DashboardView.as_view({'get': 'summary'})

urlpatterns = [
    path('forecasting/', ForecastingReportView.as_view(), name='forecasting-report'),
    path('dashboard-summary/', dashboard_summary, name='dashboard-summary'),
    path('analytics/', InventoryAnalyticsView.as_view(), name='inventory-analytics'),
] + router.urls
