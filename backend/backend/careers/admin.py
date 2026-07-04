from django.contrib import admin
from .models import JobApplication


@admin.register(JobApplication)
class JobApplicationAdmin(admin.ModelAdmin):
    list_display = ['full_name', 'email', 'position', 'years_experience', 'status', 'created_at']
    list_filter = ['position', 'status']
    search_fields = ['full_name', 'email', 'phone']
