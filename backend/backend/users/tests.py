from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from .models import CustomUser


class UserAuthTests(APITestCase):

    def setUp(self):
        self.admin = CustomUser.objects.create_superuser(
            username='admin', password='admin123', email='admin@test.com'
        )
        self.admin.role = 'ADMIN'
        self.admin.save()

        self.staff = CustomUser.objects.create_user(
            username='staff', password='staff123', email='staff@test.com'
        )
        self.staff.role = 'STAFF'
        self.staff.save()

    def get_token(self, username, password):
        response = self.client.post('/api/token/', {'username': username, 'password': password})
        return response.data.get('access')

    def test_admin_login(self):
        response = self.client.post('/api/token/', {'username': 'admin', 'password': 'admin123'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)

    def test_invalid_login(self):
        response = self.client.post('/api/token/', {'username': 'admin', 'password': 'wrongpass'})
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_token_refresh(self):
        response = self.client.post('/api/token/', {'username': 'admin', 'password': 'admin123'})
        refresh = response.data.get('refresh')
        response2 = self.client.post('/api/token/refresh/', {'refresh': refresh})
        self.assertEqual(response2.status_code, status.HTTP_200_OK)
        self.assertIn('access', response2.data)

    def test_unauthenticated_access(self):
        response = self.client.get('/api/inventory/products/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_staff_cannot_access_user_list(self):
        token = self.get_token('staff', 'staff123')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.get('/api/users/')
        self.assertIn(response.status_code, [status.HTTP_403_FORBIDDEN, status.HTTP_404_NOT_FOUND])