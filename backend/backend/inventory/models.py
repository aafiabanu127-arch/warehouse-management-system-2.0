from django.db import models
from warehouses.models import Shelf


class Category(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name


class Product(models.Model):
    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
        related_name='products'
    )
    name = models.CharField(max_length=100)
    sku = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True)
    unit_volume = models.FloatField()
    unit_weight = models.FloatField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    reorder_level = models.PositiveIntegerField(default=10)

    def __str__(self):
        return self.name


class Inventory(models.Model):
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='inventory_records'
    )
    shelf = models.ForeignKey(
        Shelf,
        on_delete=models.CASCADE,
        related_name='inventory_items'
    )
    quantity = models.PositiveIntegerField(default=0)
    last_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.product.name} - {self.quantity}"


class StockMovement(models.Model):
    MOVEMENT_TYPES = [
        ('IN', 'Stock In'),
        ('OUT', 'Stock Out'),
        ('TRANSFER', 'Transfer'),
    ]

    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    movement_type = models.CharField(max_length=20, choices=MOVEMENT_TYPES)
    timestamp = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True)

    def __str__(self):
        return f"{self.product.name} - {self.movement_type}"


class SpaceAllocation(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    shelf = models.ForeignKey(Shelf, on_delete=models.CASCADE)
    allocated_volume = models.FloatField()
    utilization_percentage = models.FloatField(default=0)

    def __str__(self):
        return f"{self.product.name} -> {self.shelf.shelf_code}"
class StockTransferRequest(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
    ]

    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='transfer_requests')
    from_inventory = models.ForeignKey(Inventory, on_delete=models.CASCADE, related_name='outgoing_requests')
    to_inventory = models.ForeignKey(Inventory, on_delete=models.CASCADE, related_name='incoming_requests')
    quantity = models.PositiveIntegerField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='PENDING')
    requested_by = models.ForeignKey('users.CustomUser', on_delete=models.CASCADE, related_name='transfer_requests')
    reviewed_by = models.ForeignKey('users.CustomUser', on_delete=models.SET_NULL, null=True, blank=True, related_name='reviewed_transfers')
    reason = models.TextField(blank=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Transfer {self.product} x{self.quantity} [{self.status}]"
    
class InventoryAdjustmentRequest(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
    ]
    ADJUSTMENT_TYPES = [
        ('ADD', 'Add Stock'),
        ('REMOVE', 'Remove Stock'),
        ('CORRECT', 'Correct Quantity'),
    ]
    inventory = models.ForeignKey(Inventory, on_delete=models.CASCADE, related_name='adjustment_requests')
    adjustment_type = models.CharField(max_length=10, choices=ADJUSTMENT_TYPES)
    requested_quantity = models.IntegerField()
    reason = models.TextField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='PENDING')
    requested_by = models.ForeignKey('users.CustomUser', on_delete=models.CASCADE, related_name='adjustment_requests')
    reviewed_by = models.ForeignKey('users.CustomUser', on_delete=models.SET_NULL, null=True, blank=True, related_name='reviewed_adjustments')
    reviewed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Adjustment [{self.adjustment_type}] x{self.requested_quantity} [{self.status}]"