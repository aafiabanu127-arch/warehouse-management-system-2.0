from django.db import models
from django.conf import settings


class Notification(models.Model):
    NOTIF_TYPES = [
        ('LOW_STOCK',     'Low Stock Alert'),
        ('SPACE_FULL',    'Space Full Alert'),
        ('REPORT_READY',  'Report Ready'),
        ('SYSTEM',        'System Message'),
    ]

    user        = models.ForeignKey(
                      settings.AUTH_USER_MODEL,
                      on_delete=models.CASCADE,
                      related_name='notifications'
                  )
    notif_type  = models.CharField(max_length=20, choices=NOTIF_TYPES)
    title       = models.CharField(max_length=200)
    message     = models.TextField()
    is_read     = models.BooleanField(default=False)
    created_at  = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.notif_type} → {self.user.username}: {self.title}"


class Alert(models.Model):
    SEVERITY_CHOICES = [
        ('LOW',      'Low'),
        ('MEDIUM',   'Medium'),
        ('HIGH',     'High'),
        ('CRITICAL', 'Critical'),
    ]

    title      = models.CharField(max_length=200)
    message    = models.TextField()
    severity   = models.CharField(max_length=10, choices=SEVERITY_CHOICES, default='LOW')
    is_active  = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"[{self.severity}] {self.title}"