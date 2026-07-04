import logging

from django.conf import settings
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status

logger = logging.getLogger(__name__)


def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)

    if response is not None:
        detail = response.data.get('detail') if isinstance(response.data, dict) else None
        response.data = {
            'error': True,
            'status_code': response.status_code,
            'message': detail or 'A request error occurred.',
            'details': response.data,
        }
        return response

    logger.error("Unhandled exception: %s", exc, exc_info=True)
    return Response(
        {
            'error': True,
            'status_code': status.HTTP_500_INTERNAL_SERVER_ERROR,
            'message': 'An unexpected error occurred. Please try again later.',
            'details': str(exc) if settings.DEBUG else None,
        },
        status=status.HTTP_500_INTERNAL_SERVER_ERROR
    )