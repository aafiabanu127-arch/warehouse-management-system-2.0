from rest_framework import serializers
from .models import Notification, Alert


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Notification
        fields = ['id', 'notif_type', 'title', 'message', 'is_read', 'created_at']
        read_only_fields = ['created_at']


class AlertSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Alert
        fields = ['id', 'title', 'message', 'severity', 'is_active', 'created_at']
        read_only_fields = ['created_at']