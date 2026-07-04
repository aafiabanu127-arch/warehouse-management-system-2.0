from rest_framework import serializers
from .models import Category, Product, Inventory, StockMovement, SpaceAllocation


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'


class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = '__all__'


class InventorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Inventory
        fields = '__all__'


class StockMovementSerializer(serializers.ModelSerializer):
    class Meta:
        model = StockMovement
        fields = '__all__'


class SpaceAllocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = SpaceAllocation
        fields = '__all__'
from .models import StockTransferRequest, InventoryAdjustmentRequest

class StockTransferRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = StockTransferRequest
        fields = '__all__'
        read_only_fields = ['status', 'requested_by', 'reviewed_by', 'reviewed_at']
class InventoryAdjustmentRequestSerializer(serializers.ModelSerializer):
    requested_by_username = serializers.CharField(source='requested_by.username', read_only=True)
    reviewed_by_username = serializers.CharField(source='reviewed_by.username', read_only=True)

    class Meta:
        model = InventoryAdjustmentRequest
        fields = '__all__'
        read_only_fields = ['status', 'requested_by', 'reviewed_by', 'reviewed_at', 'created_at']
