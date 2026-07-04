from rest_framework import viewsets, permissions
from .models import JobApplication
from .serializers import JobApplicationSerializer


class JobApplicationViewSet(viewsets.ModelViewSet):
    """
    Public can CREATE (submit an application).
    Only authenticated staff (Admin/Manager) can LIST/VIEW/UPDATE/DELETE.
    """
    queryset = JobApplication.objects.all()
    serializer_class = JobApplicationSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]
