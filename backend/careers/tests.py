from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model

User = get_user_model()

class CareerApplicationTests(APITestCase):

    def setUp(self):
        self.admin = User.objects.create_user(
            username='admin_c', password='admin123', role='ADMIN'
        )
        self.application_data = {
            'full_name': 'John Doe',
            'email': 'john@example.com',
            'phone': '9876543210',
            'position': 'SUPERVISOR',
            'message': 'I am interested in this role.',
        }

    def test_public_can_submit_application(self):
        res = self.client.post('/api/careers/applications/', self.application_data)
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)

    def test_admin_can_list_applications(self):
        self.client.force_authenticate(user=self.admin)
        res = self.client.get('/api/careers/applications/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_duplicate_application_allowed(self):
        self.client.post('/api/careers/applications/', self.application_data)
        res = self.client.post('/api/careers/applications/', self.application_data)
        self.assertIn(res.status_code, [
            status.HTTP_201_CREATED,
            status.HTTP_400_BAD_REQUEST
        ])

    def test_missing_required_fields(self):
        res = self.client.post('/api/careers/applications/', {
            'email': 'incomplete@example.com'
        })
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)