import apiClient from './client';

export interface ChatMessage {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  tools_used: string[];
  created_at: string;
}

export interface Conversation {
  id: number;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface ConversationDetail extends Conversation {
  messages: ChatMessage[];
}

export interface ChatResponse {
  conversation_id: number;
  title: string;
  reply: string;
  tools_used: string[];
  created_at: string;
}

export const sendChatMessage = (message: string, conversationId?: number) =>
  apiClient.post<ChatResponse>('/assistant/chat/', {
    message,
    conversation_id: conversationId,
  });

export const listConversations = () =>
  apiClient.get<Conversation[]>('/assistant/conversations/');

export const getConversation = (id: number) =>
  apiClient.get<ConversationDetail>(`/assistant/conversations/${id}/`);

export const deleteConversation = (id: number) =>
  apiClient.delete(`/assistant/conversations/${id}/`);
