"""
AI Demand Forecasting - with Model Evaluation Metrics (MAE, RMSE, R-squared)
"""
import numpy as np
from django.utils import timezone
from datetime import timedelta
from django.db.models import Sum
from django.db.models.functions import TruncWeek
from .models import StockMovement, Product


def get_weekly_demand(product_id, weeks=12):
    since = timezone.now() - timedelta(weeks=weeks)
    movements = (
        StockMovement.objects
        .filter(product_id=product_id, movement_type='OUT', timestamp__gte=since)
        .annotate(week=TruncWeek('timestamp'))
        .values('week')
        .annotate(total=Sum('quantity'))
        .order_by('week')
    )
    return [(i, m['total']) for i, m in enumerate(movements)]


def linear_regression_forecast(data_points, forecast_periods=4):
    if len(data_points) < 2:
        return [0] * forecast_periods
    x = np.array([p[0] for p in data_points], dtype=float)
    y = np.array([p[1] for p in data_points], dtype=float)
    coeffs = np.polyfit(x, y, 1)
    m, b = coeffs
    last_x = x[-1]
    forecasts = []
    for i in range(1, forecast_periods + 1):
        predicted = m * (last_x + i) + b
        forecasts.append(max(0, round(float(predicted), 2)))
    return forecasts


def evaluate_model(data_points):
    if len(data_points) < 4:
        return {'mae': None, 'rmse': None, 'r_squared': None, 'note': 'Need >= 4 weeks of data for evaluation'}
    x = np.array([p[0] for p in data_points], dtype=float)
    y = np.array([p[1] for p in data_points], dtype=float)
    split = max(2, int(len(data_points) * 0.7))
    x_train, x_test = x[:split], x[split:]
    y_train, y_test = y[:split], y[split:]
    coeffs = np.polyfit(x_train, y_train, 1)
    m, b = coeffs
    y_pred = m * x_test + b
    errors = y_test - y_pred
    mae = round(float(np.mean(np.abs(errors))), 4)
    rmse = round(float(np.sqrt(np.mean(errors ** 2))), 4)
    ss_res = np.sum(errors ** 2)
    ss_tot = np.sum((y_test - np.mean(y_test)) ** 2)
    r_squared = round(float(1 - ss_res / ss_tot) if ss_tot != 0 else 1.0, 4)
    accuracy_label = (
        'Excellent' if r_squared >= 0.85 else
        'Good' if r_squared >= 0.65 else
        'Fair' if r_squared >= 0.40 else
        'Poor'
    )
    return {
        'mae': mae,
        'rmse': rmse,
        'r_squared': r_squared,
        'model_accuracy': accuracy_label,
        'training_weeks': int(split),
        'evaluation_weeks': int(len(data_points) - split),
    }


def forecast_product_demand(product_id, weeks_history=12, forecast_weeks=4):
    try:
        product = Product.objects.get(id=product_id)
    except Product.DoesNotExist:
        return None
    data_points = get_weekly_demand(product_id, weeks=weeks_history)
    forecasts = linear_regression_forecast(data_points, forecast_periods=forecast_weeks)
    model_metrics = evaluate_model(data_points)
    total_historical = sum(p[1] for p in data_points)
    avg_weekly = round(total_historical / len(data_points), 2) if data_points else 0
    trend = (
        'increasing' if len(forecasts) >= 2 and forecasts[-1] > forecasts[0] else
        'decreasing' if len(forecasts) >= 2 and forecasts[-1] < forecasts[0] else
        'stable'
    )
    model_comparison = compare_models(data_points)
    return {
        'product_id': product.id,
        'product_name': product.name,
        'sku': product.sku,
        'historical_weeks_analyzed': len(data_points),
        'average_weekly_demand': avg_weekly,
        'trend': trend,
        'model_evaluation': model_metrics,
        'model_comparison': model_comparison,
        'forecast_next_weeks': [
            {'week': i + 1, 'predicted_quantity': q}
            for i, q in enumerate(forecasts)
        ],
        'reorder_recommendation': (
            'Reorder soon - demand is rising.' if trend == 'increasing' else
            'Monitor stock - demand is declining.' if trend == 'decreasing' else
            'Stable demand - maintain current stock levels.'
        ),
    }


def forecast_all_products(weeks_history=12, forecast_weeks=4):
    products = Product.objects.all()
    results = []
    for p in products:
        r = forecast_product_demand(p.id, weeks_history, forecast_weeks)
        if r:
            results.append(r)
    return results


def get_forecasting_summary():
    all_forecasts = forecast_all_products()
    if not all_forecasts:
        return {'message': 'No products to forecast.'}
    accuracy_counts = {'Excellent': 0, 'Good': 0, 'Fair': 0, 'Poor': 0, 'N/A': 0}
    increasing = []
    decreasing = []
    for f in all_forecasts:
        metrics = f.get('model_evaluation', {})
        label = metrics.get('model_accuracy', 'N/A') if metrics.get('mae') is not None else 'N/A'
        accuracy_counts[label] = accuracy_counts.get(label, 0) + 1
        if f['trend'] == 'increasing':
            increasing.append({'product': f['product_name'], 'sku': f['sku']})
        elif f['trend'] == 'decreasing':
            decreasing.append({'product': f['product_name'], 'sku': f['sku']})
    return {
        'total_products_analyzed': len(all_forecasts),
        'model_accuracy_distribution': accuracy_counts,
        'products_with_increasing_demand': increasing,
        'products_with_decreasing_demand': decreasing,
        'reorder_candidates': increasing,
    }


def moving_average_forecast(data_points, window=3, forecast_periods=4):
    """Moving Average model ? baseline comparator against Linear Regression."""
    if len(data_points) < 2:
        return [0] * forecast_periods
    y = [p[1] for p in data_points]
    w = min(window, len(y))
    avg = sum(y[-w:]) / w
    return [round(avg, 2)] * forecast_periods


def compare_models(data_points):
    """
    Model Comparison: Linear Regression vs Moving Average.
    Evaluates both on held-out test data and returns side-by-side metrics.
    Used to justify why Linear Regression is selected as the primary model.
    """
    if len(data_points) < 4:
        return {'note': 'Need >= 4 weeks of data for model comparison'}

    split = max(2, int(len(data_points) * 0.7))
    train = data_points[:split]
    test  = data_points[split:]

    x_all   = np.array([p[0] for p in data_points], dtype=float)
    x_train = np.array([p[0] for p in train], dtype=float)
    y_train = np.array([p[1] for p in train], dtype=float)
    x_test  = np.array([p[0] for p in test],  dtype=float)
    y_test  = np.array([p[1] for p in test],  dtype=float)

    # Linear Regression
    coeffs  = np.polyfit(x_train, y_train, 1)
    lr_pred = coeffs[0] * x_test + coeffs[1]
    lr_mae  = round(float(np.mean(np.abs(y_test - lr_pred))), 4)
    lr_rmse = round(float(np.sqrt(np.mean((y_test - lr_pred) ** 2))), 4)

    # Moving Average
    w       = min(3, len(train))
    ma_val  = sum(p[1] for p in train[-w:]) / w
    ma_pred = np.array([ma_val] * len(test))
    ma_mae  = round(float(np.mean(np.abs(y_test - ma_pred))), 4)
    ma_rmse = round(float(np.sqrt(np.mean((y_test - ma_pred) ** 2))), 4)

    winner = 'LinearRegression' if lr_mae <= ma_mae else 'MovingAverage'

    return {
        'training_weeks': split,
        'test_weeks': len(test),
        'linear_regression': {'mae': lr_mae, 'rmse': lr_rmse},
        'moving_average':    {'mae': ma_mae, 'rmse': ma_rmse},
        'selected_model':    winner,
        'reason': f'{winner} had lower MAE on held-out test data.',
    }
