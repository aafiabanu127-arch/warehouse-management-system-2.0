from rest_framework import permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.generics import ListAPIView, RetrieveDestroyAPIView

from .models import ChatConversation, ChatMessage
from .serializers import (
    ChatConversationSerializer,
    ChatConversationDetailSerializer,
)
from .ai_client import run_chat


class ChatView(APIView):
    """
    POST /api/assistant/chat/
    body: { "message": str, "conversation_id": int (optional) }

    Creates a new conversation if conversation_id is omitted, sends the
    message plus prior history to Claude (with tool access to live backend
    data), stores both turns, and returns the assistant's reply.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        message = (request.data.get('message') or '').strip()
        if not message:
            return Response({'error': 'message is required'}, status=status.HTTP_400_BAD_REQUEST)

        conversation_id = request.data.get('conversation_id')
        if conversation_id:
            try:
                conversation = ChatConversation.objects.get(id=conversation_id, user=request.user)
            except ChatConversation.DoesNotExist:
                return Response({'error': 'Conversation not found'}, status=status.HTTP_404_NOT_FOUND)
        else:
            title = message[:60] + ('...' if len(message) > 60 else '')
            conversation = ChatConversation.objects.create(user=request.user, title=title or 'New conversation')

        history = [
            {'role': m.role, 'content': m.content}
            for m in conversation.messages.order_by('created_at')
        ]

        ChatMessage.objects.create(conversation=conversation, role='user', content=message)

        try:
            result = run_chat(request.user, history, message)
        except RuntimeError as e:
            # e.g. missing ANTHROPIC_API_KEY
            return Response({'error': str(e)}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        except Exception as e:
            return Response({'error': f'Assistant failed: {e}'}, status=status.HTTP_502_BAD_GATEWAY)

        assistant_msg = ChatMessage.objects.create(
            conversation=conversation,
            role='assistant',
            content=result['reply'],
            tools_used=result.get('tools_used', []),
        )
        conversation.save()  # bump updated_at

        return Response({
            'conversation_id': conversation.id,
            'title': conversation.title,
            'reply': assistant_msg.content,
            'tools_used': assistant_msg.tools_used,
            'created_at': assistant_msg.created_at,
        })


class ConversationListView(ListAPIView):
    """GET /api/assistant/conversations/ - list current user's conversations."""
    serializer_class = ChatConversationSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None  # conversation lists are small; keep the response a plain array

    def get_queryset(self):
        return ChatConversation.objects.filter(user=self.request.user)


class ConversationDetailView(RetrieveDestroyAPIView):
    """GET/DELETE /api/assistant/conversations/<id>/ - full history / delete."""
    serializer_class = ChatConversationDetailSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ChatConversation.objects.filter(user=self.request.user)
