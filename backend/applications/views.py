import logging

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, BasePermission

from .models import JobApplication
from .serializers import JobApplicationSerializer

logger = logging.getLogger(__name__)


class IsAdminOrManagerRole(BasePermission):
    """Restricts access to authenticated Admin/Manager users only (no SAFE_METHODS carve-out)."""

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role in ('ADMIN', 'MANAGER')
        )


class JobApplicationView(APIView):
    """
    Public can submit an application (POST).
    Only authenticated Admin/Manager staff can list applications (GET),
    since submissions contain applicant PII (name, email, phone, resume link).
    """

    def get_permissions(self):
        if self.request.method == 'POST':
            return [AllowAny()]
        return [IsAdminOrManagerRole()]

    def post(self, request):
        serializer = JobApplicationSerializer(data=request.data)
        if serializer.is_valid():
            app = serializer.save()
            # Notify admins/managers of the new application. This must not be
            # allowed to block or fail the applicant's submission, but failures
            # are logged rather than silently swallowed.
            try:
                from django.contrib.auth import get_user_model
                from notifications.models import Notification

                User = get_user_model()
                recipients = User.objects.filter(role__in=('ADMIN', 'MANAGER'))
                Notification.objects.bulk_create([
                    Notification(
                        user=recipient,
                        notif_type='SYSTEM',
                        title=f"New Job Application: {app.job_title}",
                        message=(
                            f"{app.full_name} applied for {app.job_title}. "
                            f"Email: {app.email}, Phone: {app.phone}."
                        ),
                    )
                    for recipient in recipients
                ])
            except Exception:
                logger.exception(
                    "Failed to create notification for job application %s", app.pk
                )
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def get(self, request):
        apps = JobApplication.objects.all()
        serializer = JobApplicationSerializer(apps, many=True)
        return Response(serializer.data)