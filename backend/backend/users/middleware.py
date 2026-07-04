import logging
import time

logger = logging.getLogger(__name__)


class RequestLoggingMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        start_time = time.time()

        user = getattr(request, 'user', None)
        user_str = user.username if user and user.is_authenticated else 'Anonymous'

        response = self.get_response(request)

        duration = time.time() - start_time

        logger.info(
            f"{request.method} {request.path} | "
            f"User: {user_str} | "
            f"Status: {response.status_code} | "
            f"Duration: {duration:.3f}s"
        )

        return response


class MaintenanceModeMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        from django.conf import settings
        from django.http import JsonResponse

        if getattr(settings, 'MAINTENANCE_MODE', False):
            if not request.path.startswith('/admin'):
                return JsonResponse({
                    'success': False,
                    'message': 'System is under maintenance. Please try again later.',
                }, status=503)

        return self.get_response(request)