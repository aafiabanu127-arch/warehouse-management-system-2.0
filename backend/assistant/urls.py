from django.urls import path
from .views import ChatView, ConversationListView, ConversationDetailView

urlpatterns = [
    path('chat/', ChatView.as_view(), name='assistant-chat'),
    path('conversations/', ConversationListView.as_view(), name='assistant-conversations'),
    path('conversations/<int:pk>/', ConversationDetailView.as_view(), name='assistant-conversation-detail'),
]
