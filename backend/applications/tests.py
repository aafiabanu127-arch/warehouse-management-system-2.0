from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model

from .models import JobApplication
from notifications.models import Notification

User = get_user_model()


class JobApplicationTests(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_user(
            username='admin_apps', password='admin123', role='ADMIN'
        )
        self.manager = User.objects.create_user(
            username='manager_apps', password='manager123', role='MANAGER'
        )
        self.staff = User.objects.create_user(
            username='staff_apps', password='staff123', role='STAFF'
        )
        self.application_payload = {
            'job_title': 'Warehouse Supervisor',
            'department': 'Operations',
            'location': 'Chennai',
            'full_name': 'Jane Doe',
            'email': 'jane@example.com',
            'phone': '9999999999',
        }

    def test_public_can_submit_application(self):
        res = self.client.post('/api/applications/', self.application_payload)
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)

    def test_anonymous_cannot_list_applications(self):
        JobApplication.objects.create(**self.application_payload)
        res = self.client.get('/api/applications/')
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_staff_role_cannot_list_applications(self):
        JobApplication.objects.create(**self.application_payload)
        self.client.force_authenticate(user=self.staff)
        res = self.client.get('/api/applications/')
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_can_list_applications(self):
        JobApplication.objects.create(**self.application_payload)
        self.client.force_authenticate(user=self.admin)
        res = self.client.get('/api/applications/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data), 1)

    def test_manager_can_list_applications(self):
        JobApplication.objects.create(**self.application_payload)
        self.client.force_authenticate(user=self.manager)
        res = self.client.get('/api/applications/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_submitting_application_notifies_admins_and_managers(self):
        self.client.post('/api/applications/', self.application_payload)
        self.assertEqual(Notification.objects.filter(user=self.admin).count(), 1)
        self.assertEqual(Notification.objects.filter(user=self.manager).count(), 1)
        self.assertEqual(Notification.objects.filter(user=self.staff).count(), 0)
