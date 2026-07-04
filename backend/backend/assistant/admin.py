from django.contrib import admin
from .models import ChatConversation, ChatMessage


class ChatMessageInline(admin.TabularInline):
    model = ChatMessage
    extra = 0
    readonly_fields = ['role', 'content', 'tools_used', 'created_at']


@admin.register(ChatConversation)
class ChatConversationAdmin(admin.ModelAdmin):
    list_display = ['id', 'title', 'user', 'created_at', 'updated_at']
    list_filter = ['created_at']
    search_fields = ['title', 'user__username']
    inlines = [ChatMessageInline]
