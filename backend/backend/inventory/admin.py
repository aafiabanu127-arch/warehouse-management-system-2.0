from django.contrib import admin
from .models import Category, Product, Inventory, StockMovement, SpaceAllocation, StockTransferRequest

admin.site.register(Category)
admin.site.register(Product)
admin.site.register(Inventory)
admin.site.register(StockMovement)
admin.site.register(SpaceAllocation)
admin.site.register(StockTransferRequest)