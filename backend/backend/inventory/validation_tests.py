from rest_framework.test import APITestCase
from rest_framework import status
from users.models import CustomUser
from .models import Category, Product
from warehouses.models import Warehouse, Zone, Rack, Shelf


class ValidationTests(APITestCase):
    def setUp(self):
        self.manager = CustomUser.objects.create_user(
            username='valmanager', password='ValPass123!', email='valmanager@test.com'
        )
        self.manager.role = 'MANAGER'
        self.manager.save()

        token = self.client.post('/api/token/', {
            'username': 'valmanager', 'password': 'ValPass123!'
        }).data.get('access')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

        self.category = Category.objects.create(name='Electronics')

        warehouse = Warehouse.objects.create(
            name='Test Warehouse', location='Test City', total_capacity=100.0,
            available_capacity=100.0
        )
        zone = Zone.objects.create(warehouse=warehouse, name='Zone A', capacity=50.0)
        rack = Rack.objects.create(zone=zone, rack_code='RACK-VAL-001', capacity=25.0)
        self.shelf = Shelf.objects.create(rack=rack, shelf_code='SHELF-VAL-001', capacity=25.0)

    def get_error_detail(self, response, field):
        """Helper to dig into the custom exception handler's nested error structure."""
        return response.data.get('error', {}).get('detail', {}).get(field)

    # --- Required field validation ---

    def test_category_requires_name(self):
        response = self.client.post('/api/inventory/categories/', {})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIsNotNone(self.get_error_detail(response, 'name'))

    def test_product_requires_category(self):
        response = self.client.post('/api/inventory/products/', {
            'name': 'Test Product', 'sku': 'TP001', 'unit_volume': 1.0, 'unit_weight': 1.0
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIsNotNone(self.get_error_detail(response, 'category'))

    def test_product_requires_unit_volume(self):
        response = self.client.post('/api/inventory/products/', {
            'name': 'Test Product', 'sku': 'TP002', 'category': self.category.id, 'unit_weight': 1.0
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIsNotNone(self.get_error_detail(response, 'unit_volume'))

    # --- Uniqueness validation ---

    def test_duplicate_sku_rejected(self):
        Product.objects.create(
            category=self.category, name='Original', sku='DUP001',
            unit_volume=1.0, unit_weight=1.0
        )
        response = self.client.post('/api/inventory/products/', {
            'name': 'Duplicate', 'sku': 'DUP001', 'category': self.category.id,
            'unit_volume': 1.0, 'unit_weight': 1.0
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIsNotNone(self.get_error_detail(response, 'sku'))

    # --- Type / range validation ---

    def test_negative_inventory_quantity_rejected(self):
        product = Product.objects.create(
            category=self.category, name='Widget', sku='WID001',
            unit_volume=1.0, unit_weight=1.0
        )
        response = self.client.post('/api/inventory/inventory/', {
            'product': product.id, 'shelf': self.shelf.id, 'quantity': -5
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIsNotNone(self.get_error_detail(response, 'quantity'))

    def test_non_numeric_unit_volume_rejected(self):
        response = self.client.post('/api/inventory/products/', {
            'name': 'Bad Product', 'sku': 'BAD001', 'category': self.category.id,
            'unit_volume': 'not-a-number', 'unit_weight': 1.0
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIsNotNone(self.get_error_detail(response, 'unit_volume'))

    # --- Choice field validation ---

    def test_invalid_role_value_rejected_at_model_level(self):
        from django.core.exceptions import ValidationError
        user = CustomUser(username='badrole', email='badrole@test.com', role='SUPERADMIN')
        with self.assertRaises(ValidationError):
            user.full_clean()

    # --- Shelf recommendation input validation ---

    def test_shelf_recommendation_rejects_missing_volume(self):
        response = self.client.post('/api/inventory/optimization/recommend-shelf/', {})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_shelf_recommendation_rejects_non_numeric_volume(self):
        response = self.client.post('/api/inventory/optimization/recommend-shelf/', {
            'required_volume': 'abc'
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_shelf_recommendation_handles_negative_volume_gracefully(self):
        response = self.client.post('/api/inventory/optimization/recommend-shelf/', {
            'required_volume': -10
        })
        self.assertNotEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)
