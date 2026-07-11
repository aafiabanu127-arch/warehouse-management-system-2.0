from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, AuditLog


class CustomUserAdmin(UserAdmin):
    model = CustomUser
    list_display = ("username", "email", "role", "is_active", "is_staff")
    list_filter = ("role", "is_active", "is_staff")

    fieldsets = UserAdmin.fieldsets + (
        ("Warehouse info", {"fields": ("role", "phone", "department")}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ("Warehouse info", {"fields": ("role", "phone", "department")}),
    )


admin.site.register(CustomUser, CustomUserAdmin)
admin.site.register(AuditLog)
