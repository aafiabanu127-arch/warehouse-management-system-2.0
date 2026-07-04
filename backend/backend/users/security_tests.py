from django.test import TestCase
from rest_framework.test import APITestCase
from rest_framework import status
from .models import CustomUser


class SecurityTests(APITestCase):
    def setUp(self):
        self.admin = CustomUser.objects.create_superuser(
            username='secadmin', password='AdminPass123!', email='secadmin@test.com'
        )
        self.admin.role = 'ADMIN'
        self.admin.save()

        self.viewer = CustomUser.objects.create_user(
            username='secviewer', password='ViewerPass123!', email='secviewer@test.com'
        )
        self.viewer.role = 'VIEWER'
        self.viewer.save()

    def get_token(self, username, password):
        response = self.client.post('/api/token/', {'username': username, 'password': password})
        return response.data.get('access')

    # --- Authentication enforcement ---

    def test_no_token_rejected_on_protected_endpoint(self):
        response = self.client.get('/api/inventory/products/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_malformed_token_rejected(self):
        self.client.credentials(HTTP_AUTHORIZATION='Bearer not.a.valid.token')
        response = self.client.get('/api/inventory/products/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_empty_bearer_token_rejected(self):
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ')
        response = self.client.get('/api/inventory/products/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_wrong_auth_scheme_rejected(self):
        token = self.get_token('secadmin', 'AdminPass123!')
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {token}')
        response = self.client.get('/api/inventory/products/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    # --- Role / permission enforcement ---

    def test_viewer_cannot_create_category(self):
        token = self.get_token('secviewer', 'ViewerPass123!')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.post('/api/inventory/categories/', {'name': 'Hacked Category'})
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_viewer_cannot_delete_product(self):
        token = self.get_token('secviewer', 'ViewerPass123!')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.delete('/api/inventory/products/1/')
        self.assertIn(response.status_code, [status.HTTP_403_FORBIDDEN, status.HTTP_404_NOT_FOUND])

    def test_viewer_can_still_read(self):
        token = self.get_token('secviewer', 'ViewerPass123!')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.get('/api/inventory/products/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    # --- Input sanitization sanity checks ---

    def test_sql_injection_attempt_in_search_param(self):
        token = self.get_token('secadmin', 'AdminPass123!')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        malicious = "'; DROP TABLE inventory_product; --"
        response = self.client.get(f'/api/inventory/products/?search={malicious}')
        # Should not 500 - ORM parameterizes queries, so this should return normally
        self.assertNotEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)

    def test_xss_payload_in_category_name_stored_safely(self):
        token = self.get_token('secadmin', 'AdminPass123!')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        payload = '<script>alert(1)</script>'
        response = self.client.post('/api/inventory/categories/', {'name': payload})
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        # Confirm it's stored as plain text, not executed/altered
        self.assertEqual(response.data.get('name'), payload)

    # --- Password / credential checks ---

    def test_login_with_wrong_password_does_not_leak_user_existence(self):
        response = self.client.post('/api/token/', {'username': 'secadmin', 'password': 'wrong'})
        response2 = self.client.post('/api/token/', {'username': 'doesnotexist', 'password': 'wrong'})
        # Both should fail identically - no hint about which part was wrong
        self.assertEqual(response.status_code, response2.status_code)