from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from .models import JobApplication
from .serializers import JobApplicationSerializer

class JobApplicationView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = JobApplicationSerializer(data=request.data)
        if serializer.is_valid():
            app = serializer.save()
            # Try to create a notification — won't crash if Notification model differs
            try:
                from notifications.models import Notification
                Notification.objects.create(
                    title=f"New Job Application: {app.job_title}",
                    message=f"{app.full_name} applied for {app.job_title}. Email: {app.email}, Phone: {app.phone}.",
                )
            except Exception:
                pass
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def get(self, request):
        apps = JobApplication.objects.all()
        serializer = JobApplicationSerializer(apps, many=True)
        return Response(serializer.data)