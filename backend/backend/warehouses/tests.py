from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model

User = get_user_model()

class WarehouseTests(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_user(
            username='admin_w', password='admin123', role='ADMIN'
        )
        self.client.force_authenticate(user=self.admin)

    def test_create_warehouse(self):
        res = self.client.post('/api/warehouses/warehouses/', {
            'name': 'Main Warehouse',
            'location': 'Mumbai',
            'total_capacity': 1000,
            'available_capacity': 1000,
        })
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data['name'], 'Main Warehouse')

    def test_list_warehouses(self):
        res = self.client.get('/api/warehouses/warehouses/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_unauthenticated_cannot_access(self):
        self.client.force_authenticate(user=None)
        res = self.client.get('/api/warehouses/warehouses/')
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_search_warehouse(self):
        self.client.post('/api/warehouses/warehouses/', {
            'name': 'South Hub',
            'location': 'Chennai',
            'total_capacity': 500,
            'available_capacity': 500,
        })
        res = self.client.get('/api/warehouses/warehouses/?search=South')
        self.assertEqual(res.status_code, status.HTTP_200_OK)


class ZoneTests(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_user(
            username='admin_z', password='admin123', role='ADMIN'
        )
        self.client.force_authenticate(user=self.admin)
        wres = self.client.post('/api/warehouses/warehouses/', {
            'name': 'Zone Warehouse',
            'location': 'Delhi',
            'total_capacity': 800,
            'available_capacity': 800,
        })
        self.warehouse_id = wres.data['id']

    def test_create_zone(self):
        res = self.client.post('/api/warehouses/zones/', {
            'name': 'Zone A',
            'warehouse': self.warehouse_id,
            'capacity': 200,
        })
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)

    def test_list_zones(self):
        res = self.client.get('/api/warehouses/zones/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_staff_cannot_delete_zone(self):
        staff = User.objects.create_user(
            username='staff_z', password='pass123', role='STAFF'
        )
        self.client.force_authenticate(user=staff)
        res = self.client.delete('/api/warehouses/zones/999/')
        self.assertIn(res.status_code, [
            status.HTTP_403_FORBIDDEN,
            status.HTTP_404_NOT_FOUND
        ])