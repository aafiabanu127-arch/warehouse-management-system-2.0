from rest_framework import serializers
from .models import Report


class ReportSerializer(serializers.ModelSerializer):
    generated_by_username = serializers.CharField(
        source='generated_by.username', read_only=True
    )

    class Meta:
        model  = Report
        fields = [
            'id', 'title', 'report_type', 'status',
            'generated_by', 'generated_by_username',
            'parameters', 'result', 'created_at', 'completed_at',
        ]
        read_only_fields = ['status', 'result', 'generated_by', 'completed_at']