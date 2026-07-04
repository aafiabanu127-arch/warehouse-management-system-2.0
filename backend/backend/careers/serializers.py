from rest_framework import serializers
from .models import JobApplication


class JobApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobApplication
        fields = [
            'id',
            'full_name',
            'email',
            'phone',
            'position',
            'years_experience',
            'message',
            'status',
            'created_at',
        ]
        read_only_fields = ['id', 'status', 'created_at']
