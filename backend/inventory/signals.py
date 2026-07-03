from django.contrib.auth import get_user_model
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import StockMovement, Inventory


def _notify_admins(notif_type, title, message):
    from notifications.models import Notification
    User = get_user_model()
    for admin in User.objects.filter(role__in=['ADMIN', 'MANAGER']):
        Notification.objects.create(
            user=admin, notif_type=notif_type, title=title, message=message
        )


@receiver(post_save, sender=StockMovement)
def notify_stock_movement(sender, instance, created, **kwargs):
    if not created:
        return

    _notify_admins(
        'SYSTEM',
        f"Stock {instance.get_movement_type_display()}",
        f"{instance.product.name}: {instance.movement_type} of {instance.quantity} units recorded.",
    )

    low_items = Inventory.objects.filter(
        product=instance.product,
        quantity__lt=instance.product.reorder_level,
    )
    for item in low_items:
        _notify_admins(
            'LOW_STOCK',
            f"Low stock: {item.product.name}",
            f"{item.product.name} on shelf {item.shelf.shelf_code} is down to "
            f"{item.quantity} units (reorder level {item.product.reorder_level}).",
        )