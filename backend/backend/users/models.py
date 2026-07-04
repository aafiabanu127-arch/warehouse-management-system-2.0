from django.contrib.auth.models import AbstractUser
from django.db import models
from django.conf import settings


class CustomUser(AbstractUser):
    ROLE_CHOICES = [
        ('ADMIN',      'Admin'),
        ('MANAGER',    'Manager'),
        ('SUPERVISOR', 'Warehouse Supervisor'),
        ('STAFF',      'Staff'),
        ('PICKER',     'Picker/Operator'),
        ('AUDITOR',    'Auditor'),
        ('VIEWER',     'Viewer'),
    ]

    role       = models.CharField(max_length=20, choices=ROLE_CHOICES, default='VIEWER')
    phone      = models.CharField(max_length=20, null=True, blank=True)
    department = models.CharField(max_length=100, null=True, blank=True)

    def __str__(self):
        return f"{self.username} ({self.role})"


class AuditLog(models.Model):
    ACTION_CHOICES = [
        ('CREATE', 'Create'),
        ('UPDATE', 'Update'),
        ('DELETE', 'Delete'),
        ('VIEW',   'View'),
        ('LOGIN',  'Login'),
        ('LOGOUT', 'Logout'),
    ]

    user        = models.ForeignKey(
                      settings.AUTH_USER_MODEL,
                      null=True, blank=True,
                      on_delete=models.SET_NULL,
                      related_name='audit_logs'
                  )
    action      = models.CharField(max_length=10, choices=ACTION_CHOICES)
    resource    = models.CharField(max_length=100)
    resource_id = models.CharField(max_length=100, null=True, blank=True)
    detail      = models.TextField(null=True, blank=True)
    ip_address  = models.GenericIPAddressField(null=True, blank=True)
    timestamp   = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.timestamp} | {self.user} | {self.action} | {self.resource}"


def log_action(user, action, resource, resource_id=None, detail=None, request=None):
    ip = None
    if request:
        x_forwarded = request.META.get('HTTP_X_FORWARDED_FOR')
        ip = x_forwarded.split(',')[0] if x_forwarded else request.META.get('REMOTE_ADDR')

    AuditLog.objects.create(
        user=user if user and user.is_authenticated else None,
        action=action,
        resource=resource,
        resource_id=str(resource_id) if resource_id else None,
        detail=detail,
        ip_address=ip,
    )