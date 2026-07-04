from django.contrib import admin
from .models import Warehouse, Zone, Rack, Shelf

admin.site.register(Warehouse)
admin.site.register(Zone)
admin.site.register(Rack)
admin.site.register(Shelf)