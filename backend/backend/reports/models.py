from django.db import models
from django.conf import settings


class Report(models.Model):
    REPORT_TYPES = [
        ('INVENTORY',    'Inventory Report'),
        ('WAREHOUSE',    'Warehouse Utilization'),
        ('STOCK',        'Stock Movement'),
        ('SPACE',        'Space Optimization'),
    ]
    STATUS_CHOICES = [
        ('PENDING',   'Pending'),
        ('COMPLETED', 'Completed'),
        ('FAILED',    'Failed'),
    ]

    title       = models.CharField(max_length=200)
    report_type = models.CharField(max_length=20, choices=REPORT_TYPES)
    status      = models.CharField(max_length=10, choices=STATUS_CHOICES, default='PENDING')
    generated_by = models.ForeignKey(
                       settings.AUTH_USER_MODEL,
                       null=True, blank=True,
                       on_delete=models.SET_NULL,
                       related_name='reports'
                   )
    parameters  = models.JSONField(default=dict, blank=True)
    result      = models.JSONField(default=dict, blank=True)
    created_at  = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} ({self.report_type}) — {self.status}"