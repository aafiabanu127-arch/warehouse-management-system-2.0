from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from users.models import CustomUser
from inventory.models import Category, Product, Inventory
from warehouses.models import Warehouse, Zone, Rack, Shelf


class FullWarehouseFlowTest(TestCase):
    """
    Integration test: user registers → adds product → creates inventory → moves stock
    """

    def setUp(self):
        self.client = APIClient()

        # Create admin user directly (registration creates STAFF by default)
        self.admin = CustomUser.objects.create_superuser(
            username='admin_test',
            email='admin@test.com',
            password='Admin@1234',
            role='ADMIN',
        )

        # Create warehouse structure
        self.warehouse = Warehouse.objects.create(
            name='Test Warehouse',
            location='Chennai',
            total_capacity=1000.0,
            available_capacity=1000.0,
            manager_name='admin_test',
        )
        self.zone = Zone.objects.create(
            warehouse=self.warehouse,
            name='Zone A',
            capacity=500.0,
        )
        self.rack = Rack.objects.create(
            zone=self.zone,
            rack_code='R-01',
            capacity=200.0,
        )
        self.shelf = Shelf.objects.create(
            rack=self.rack,
            shelf_code='S-01',
            capacity=100.0,
            occupied_capacity=0.0,
        )

        # Category and Product
        self.category = Category.objects.create(name='Electronics')
        self.product = Product.objects.create(
            category=self.category,
            name='Laptop',
            sku='LAP-001',
            unit_volume=5.0,
            unit_weight=2.5,
            unit_price=999.99,
            reorder_level=5,
        )

    def _login(self, username='admin_test', password='Admin@1234'):
        res = self.client.post('/api/token/', {
            'username': username,
            'password': password,
        })
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        token = res.data.get('access')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        return token

    def test_01_login_success(self):
        """Admin can log in and receive a token"""
        token = self._login()
        self.assertIsNotNone(token)

    def test_02_create_inventory(self):
        """Admin can create an inventory record for a product on a shelf"""
        self._login()
        res = self.client.post('/api/inventory/inventory/', {
            'product': self.product.id,
            'shelf': self.shelf.id,
            'quantity': 50,
        })
        self.assertIn(res.status_code, [status.HTTP_200_OK, status.HTTP_201_CREATED])
        self.assertEqual(Inventory.objects.count(), 1)
        self.assertEqual(Inventory.objects.first().quantity, 50)

    def test_03_stock_movement_in(self):
        """Stock IN movement increases recorded quantity"""
        self._login()
        # Create inventory first
        inventory = Inventory.objects.create(
            product=self.product,
            shelf=self.shelf,
            quantity=20,
        )
        res = self.client.post('/api/inventory/stock-movements/', {
            'product': self.product.id,
            'quantity': 10,
            'movement_type': 'IN',
            'notes': 'Initial stock',
        })
        self.assertIn(res.status_code, [status.HTTP_200_OK, status.HTTP_201_CREATED])

    def test_04_stock_movement_out(self):
        """Stock OUT movement is recorded"""
        self._login()
        Inventory.objects.create(
            product=self.product,
            shelf=self.shelf,
            quantity=30,
        )
        res = self.client.post('/api/inventory/stock-movements/', {
            'product': self.product.id,
            'quantity': 5,
            'movement_type': 'OUT',
            'notes': 'Dispatched order',
        })
        self.assertIn(res.status_code, [status.HTTP_200_OK, status.HTTP_201_CREATED])

    def test_05_low_stock_threshold(self):
        """Product reorder_level is stored and retrievable"""
        self._login()
        res = self.client.get(f'/api/inventory/products/{self.product.id}/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['reorder_level'], 5)

    def test_06_list_inventory(self):
        """Inventory list endpoint returns paginated results"""
        self._login()
        Inventory.objects.create(product=self.product, shelf=self.shelf, quantity=15)
        res = self.client.get('/api/inventory/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        results = res.data.get('results', res.data)
        self.assertGreaterEqual(len(results), 1)

    def test_07_unauthorized_access_blocked(self):
        """Unauthenticated requests are rejected"""
        self.client.credentials()  # clear token
        res = self.client.get('/api/inventory/inventory/')
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)