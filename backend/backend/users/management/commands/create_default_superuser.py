"""
Management command: create_default_superuser

Ensures a superuser exists with credentials from environment variables.
- If no superuser exists: creates one.
- If a superuser already exists: updates its password to match DJANGO_SUPERUSER_PASSWORD.

This guarantees you can always log in after a fresh deploy.

Env vars (all optional):
    DJANGO_SUPERUSER_USERNAME  (default: admin)
    DJANGO_SUPERUSER_PASSWORD  (default: admin123)
    DJANGO_SUPERUSER_EMAIL     (default: admin@example.com)
"""
import os

from django.core.management.base import BaseCommand

from users.models import CustomUser


class Command(BaseCommand):
    help = "Ensure a default superuser exists with the configured credentials"

    def handle(self, *args, **options):
        username = os.environ.get("DJANGO_SUPERUSER_USERNAME", "admin")
        password = os.environ.get("DJANGO_SUPERUSER_PASSWORD", "admin123")
        email = os.environ.get("DJANGO_SUPERUSER_EMAIL", "admin@example.com")

        user = CustomUser.objects.filter(username=username).first()

        if user is None:
            # No user with this username — create a fresh superuser
            CustomUser.objects.create_superuser(
                username=username,
                email=email,
                password=password,
                role="ADMIN",
            )
            self.stdout.write(
                self.style.SUCCESS(f"Superuser '{username}' created successfully.")
            )
        else:
            # User exists — ensure it is a superuser and sync the password
            changed = False
            if not user.is_superuser or not user.is_staff:
                user.is_superuser = True
                user.is_staff = True
                user.role = "ADMIN"
                changed = True
            # Always reset the password so the env var stays authoritative
            user.set_password(password)
            user.save()
            self.stdout.write(
                self.style.SUCCESS(
                    f"Superuser '{username}' already exists — password synced from env."
                )
            )
