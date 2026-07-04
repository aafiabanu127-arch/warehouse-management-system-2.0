from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model
from notifications.models import Notification

User = get_user_model()

class NotificationTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='notif_user', password='pass123', role='STAFF'
        )
        self.client.force_authenticate(user=self.user)
        self.notif = Notification.objects.create(
            user=self.user,
            notif_type='LOW_STOCK',
            title='Low Stock Alert',
            message='Product X is running low.',
        )

    def test_list_notifications(self):
        res = self.client.get('/api/notifications/notifications/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        # support both paginated and non-paginated responses
        data = res.data.get('results', res.data)
        self.assertGreaterEqual(len(data), 1)

    def test_mark_notification_read(self):
        res = self.client.patch(
            f'/api/notifications/notifications/{self.notif.id}/',
            {'is_read': True}
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertTrue(res.data['is_read'])

    def test_list_requires_authentication(self):
        self.client.force_authenticate(user=None)
        res = self.client.get('/api/notifications/notifications/')
        self.assertIn(res.status_code, [
            status.HTTP_401_UNAUTHORIZED,
            status.HTTP_403_FORBIDDEN,
        ])

    def test_user_only_sees_own_notifications(self):
        other = User.objects.create_user(
            username='other_user', password='pass123', role='STAFF'
        )
        Notification.objects.create(
            user=other,
            notif_type='SYSTEM',
            title='Other User Notif',
            message='Should not be visible.',
        )
        res = self.client.get('/api/notifications/notifications/')
        data = res.data.get('results', res.data)
        titles = [item['title'] for item in data]
        self.assertNotIn('Other User Notif', titles)