from django.db import models


class JobApplication(models.Model):
    POSITION_CHOICES = [
        ('MANAGER',    'Warehouse Manager'),
        ('SUPERVISOR', 'Warehouse Supervisor'),
        ('STAFF',      'Warehouse Staff'),
        ('PICKER',     'Picker / Operator'),
        ('AUDITOR',    'Auditor'),
        ('OTHER',      'Other'),
    ]

    STATUS_CHOICES = [
        ('NEW',       'New'),
        ('REVIEWED',  'Reviewed'),
        ('CONTACTED', 'Contacted'),
        ('REJECTED',  'Rejected'),
        ('HIRED',     'Hired'),
    ]

    full_name        = models.CharField(max_length=150)
    email            = models.EmailField()
    phone             = models.CharField(max_length=20)
    position         = models.CharField(max_length=20, choices=POSITION_CHOICES)
    years_experience = models.PositiveIntegerField(default=0)
    message          = models.TextField(blank=True)
    status           = models.CharField(max_length=10, choices=STATUS_CHOICES, default='NEW')
    created_at       = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.full_name} - {self.get_position_display()} ({self.status})"
