"""
Management Command: check_low_stock
-------------------------------------
Automated job that scans all inventory and flags items
below the low-stock threshold. Simulates a scheduled alert system.

Usage:
    python manage.py check_low_stock
    python manage.py check_low_stock --threshold 20
"""

from django.core.management.base import BaseCommand
from inventory.models import Inventory


class Command(BaseCommand):
    help = 'Scan inventory and report items below low-stock threshold'

    def add_arguments(self, parser):
        parser.add_argument('--threshold', type=int, default=10, help='Low stock threshold (default: 10)')

    def handle(self, *args, **options):
        threshold = options['threshold']

        self.stdout.write(self.style.MIGRATE_HEADING(
            f'\n=== Low Stock Automation Check ===\nThreshold: {threshold} units\n'
        ))

        low_stock = Inventory.objects.filter(quantity__lte=threshold).select_related('product', 'shelf')

        if not low_stock.exists():
            self.stdout.write(self.style.SUCCESS(f'All inventory is above threshold ({threshold}). No action needed.\n'))
            return

        self.stdout.write(self.style.WARNING(f'Found {low_stock.count()} low-stock item(s):\n'))

        for item in low_stock:
            self.stdout.write(
                f'  [LOW STOCK] {item.product.name} (SKU: {item.product.sku})'
                f' | Qty: {item.quantity} | Shelf: {item.shelf.shelf_code}'
            )

        self.stdout.write(self.style.SUCCESS('\nLow stock check complete. Notifications would be dispatched in production.\n'))
