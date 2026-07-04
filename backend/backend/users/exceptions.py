from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
import logging

logger = logging.getLogger(__name__)


def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)

    if response is not None:
        view = context.get('view', None)
        request = context.get('request', None)

        logger.error(
            f"API Error | View: {view.__class__.__name__} | "
            f"Method: {request.method if request else 'N/A'} | "
            f"Status: {response.status_code} | "
            f"Detail: {response.data}"
        )

        custom_response = {
            'success': False,
            'status_code': response.status_code,
            'error': {
                'message': _extract_message(response.data),
                'detail': response.data,
            }
        }
        return Response(custom_response, status=response.status_code)

    # Unhandled exceptions (500 errors)
    logger.critical(f"Unhandled exception: {str(exc)}", exc_info=True)
    return Response({
        'success': False,
        'status_code': 500,
        'error': {
            'message': 'An unexpected server error occurred.',
            'detail': str(exc),
        }
    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


def _extract_message(data):
    if isinstance(data, dict):
        for key in ('detail', 'message', 'non_field_errors'):
            if key in data:
                val = data[key]
                return val[0] if isinstance(val, list) else str(val)
        first_val = next(iter(data.values()))
        return first_val[0] if isinstance(first_val, list) else str(first_val)
    if isinstance(data, list):
        return str(data[0])
    return str(data)