from rest_framework.throttling import AnonRateThrottle


class LoginRateThrottle(AnonRateThrottle):
    """
    Stricter throttle applied only to the login (token obtain) endpoint,
    to slow down credential brute-forcing. Rate is configured via
    DEFAULT_THROTTLE_RATES['login'] in settings.py.
    """
    scope = 'login'
