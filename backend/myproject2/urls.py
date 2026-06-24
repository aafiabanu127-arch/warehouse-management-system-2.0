from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    path('admin/', admin.site.urls),

    # Auth
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Schema & Docs
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),

    # Apps
    path('api/users/',         include('users.urls')),
    path('api/warehouses/',    include('warehouses.urls')),
    path('api/inventory/',     include('inventory.urls')),
    path('api/reports/',       include('reports.urls')),
    path('api/notifications/', include('notifications.urls')),
    path('api/careers/',       include('careers.urls')),
    path('api/applications/', include('applications.urls')),
]
