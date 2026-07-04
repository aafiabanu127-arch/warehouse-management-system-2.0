"""
Management Command: run_forecasting
------------------------------------
Simulates a scheduled automation job that runs AI demand forecasting
for all products and prints a summary report.

Usage:
    python manage.py run_forecasting
    python manage.py run_forecasting --weeks 8 --forecast 6

In production, this would be run via cron / Celery beat / Railway cron.
"""

from django.core.management.base import BaseCommand
from inventory.forecasting import forecast_all_products, get_forecasting_summary


class Command(BaseCommand):
    help = 'Run AI demand forecasting for all products and display summary report'

    def add_arguments(self, parser):
        parser.add_argument('--weeks', type=int, default=12, help='Weeks of history to analyse (default: 12)')
        parser.add_argument('--forecast', type=int, default=4, help='Weeks to forecast ahead (default: 4)')

    def handle(self, *args, **options):
        weeks = options['weeks']
        forecast = options['forecast']

        self.stdout.write(self.style.MIGRATE_HEADING(
            f'\n=== AI Demand Forecasting Job ===\n'
            f'History: {weeks} weeks | Forecast horizon: {forecast} weeks\n'
        ))

        results = forecast_all_products(weeks_history=weeks, forecast_weeks=forecast)

        if not results:
            self.stdout.write(self.style.WARNING('No products found. Add products and stock movements first.'))
            return

        for r in results:
            metrics = r.get('model_evaluation', {})
            mae = metrics.get('mae', 'N/A')
            r2 = metrics.get('r_squared', 'N/A')
            accuracy = metrics.get('model_accuracy', 'N/A')

            self.stdout.write(
                f"\n  Product : {r['product_name']} ({r['sku']})\n"
                f"  Trend   : {r['trend'].upper()}\n"
                f"  MAE     : {mae}  |  R²: {r2}  |  Accuracy: {accuracy}\n"
                f"  Forecast: {[f['predicted_quantity'] for f in r['forecast_next_weeks']]}\n"
                f"  Advice  : {r['reorder_recommendation']}"
            )

        summary = get_forecasting_summary()
        self.stdout.write(self.style.SUCCESS(
            f"\n=== Summary ===\n"
            f"Total products analysed : {summary['total_products_analyzed']}\n"
            f"Increasing demand       : {len(summary['products_with_increasing_demand'])}\n"
            f"Decreasing demand       : {len(summary['products_with_decreasing_demand'])}\n"
            f"Model accuracy dist.    : {summary['model_accuracy_distribution']}\n"
        ))

        self.stdout.write(self.style.SUCCESS('Forecasting job completed successfully.\n'))