import { useEffect, useRef, useState } from 'react';
import type { ChatMessage, Conversation } from '../api/assistant';
import {
  sendChatMessage,
  listConversations,
  getConversation,
  deleteConversation,
} from '../api/assistant';

const SUGGESTIONS = [
  'Which products are low on stock?',
  'Show me warehouse utilization',
  'What moved in/out this week?',
  'Summarize my notifications',
];

const glass = 'bg-white/5 backdrop-blur-md border border-white/10';

export default function AIAssistant() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [loadingConvo, setLoadingConvo] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const refreshConversations = async () => {
    try {
      const res = await listConversations();
      setConversations(res.data);
    } catch {
      // non-fatal, sidebar just stays empty
    }
  };

  useEffect(() => {
    refreshConversations();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  const openConversation = async (id: number) => {
    setLoadingConvo(true);
    setError('');
    try {
      const res = await getConversation(id);
      setActiveId(id);
      setMessages(res.data.messages);
    } catch {
      setError('Failed to load that conversation.');
    } finally {
      setLoadingConvo(false);
    }
  };

  const startNewChat = () => {
    setActiveId(null);
    setMessages([]);
    setError('');
  };

  const removeConversation = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteConversation(id);
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (activeId === id) startNewChat();
    } catch {
      setError('Failed to delete conversation.');
    }
  };

  const send = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || sending) return;

    setError('');
    setInput('');
    const optimisticUser: ChatMessage = {
      id: Date.now(),
      role: 'user',
      content,
      tools_used: [],
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticUser]);
    setSending(true);

    try {
      const res = await sendChatMessage(content, activeId ?? undefined);
      const assistantMsg: ChatMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: res.data.reply,
        tools_used: res.data.tools_used,
        created_at: res.data.created_at,
      };
      setMessages((prev) => [...prev, assistantMsg]);
      if (!activeId) {
        setActiveId(res.data.conversation_id);
        refreshConversations();
      } else {
        setConversations((prev) =>
          prev.map((c) => (c.id === activeId ? { ...c, updated_at: new Date().toISOString() } : c))
        );
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.error ||
        'The assistant is unavailable right now. Please try again in a moment.';
      setError(msg);
      setMessages((prev) => prev.slice(0, -1)); // roll back optimistic user message
      setInput(content);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] -m-4 md:-m-8 gap-4 p-4">
      {/* Conversation sidebar */}
      <div className={`w-64 rounded-2xl flex flex-col shrink-0 overflow-hidden ${glass}`}>
        <div className="p-3 border-b border-white/10">
          <button
            onClick={startNewChat}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white text-sm font-medium py-2 rounded-xl transition shadow-lg shadow-purple-500/20"
          >
            + New chat
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
          {conversations.map((c) => (
            <div
              key={c.id}
              onClick={() => openConversation(c.id)}
              className={`group flex items-center justify-between gap-2 px-3 py-2 rounded-xl cursor-pointer text-sm truncate transition ${
                activeId === c.id
                  ? 'bg-gradient-to-r from-purple-600/40 to-cyan-600/30 text-white border border-white/20'
                  : 'text-slate-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span className="truncate">{c.title}</span>
              <button
                onClick={(e) => removeConversation(c.id, e)}
                className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 text-xs shrink-0"
                title="Delete conversation"
              >
                ✕
              </button>
            </div>
          ))}
          {conversations.length === 0 && (
            <p className="text-xs text-slate-500 px-3 py-2">No conversations yet.</p>
          )}
        </div>
      </div>

      {/* Chat area */}
      <div className={`flex-1 flex flex-col rounded-2xl overflow-hidden ${glass}`}>
        <div className="px-6 py-4 border-b border-white/10 flex items-center gap-3">
          <span className="text-2xl">🤖</span>
          <div>
            <h1 className="font-semibold text-white">AI Assistant</h1>
            <p className="text-xs text-slate-400">Ask about stock, warehouses, or ask it to record a movement</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
          {loadingConvo && <p className="text-sm text-slate-500">Loading conversation…</p>}

          {!loadingConvo && messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center gap-4">
              <span className="text-4xl">👋</span>
              <p className="text-slate-400 max-w-sm">
                Ask me anything about your inventory, warehouses, stock movements, or reports.
              </p>
              <div className="flex flex-wrap justify-center gap-2 max-w-md">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="text-xs px-3 py-1.5 rounded-full border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white transition"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap ${
                  m.role === 'user'
                    ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-br-sm shadow-lg shadow-purple-500/10'
                    : 'bg-black/40 border border-cyan-900/30 text-slate-100 rounded-bl-sm'
                }`}
              >
                {m.content}
                {m.tools_used?.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {m.tools_used.map((t, i) => (
                      <span
                        key={i}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-cyan-300 border border-cyan-500/20"
                      >
                        🔧 {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {sending && (
            <div className="flex justify-start">
              <div className="bg-black/40 border border-cyan-900/30 rounded-2xl rounded-bl-sm px-4 py-2.5 text-sm text-slate-400">
                Thinking…
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {error && (
          <div className="mx-6 mb-2 px-3 py-2 text-sm bg-red-500/10 text-red-300 border border-red-500/30 rounded-xl">
            {error}
          </div>
        )}

        <div className="p-4 border-t border-white/10">
          <div className="flex items-end gap-2 max-w-3xl mx-auto">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask the assistant… (Enter to send, Shift+Enter for new line)"
              rows={1}
              className="flex-1 resize-none rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50"
            />
            <button
              onClick={() => send()}
              disabled={sending || !input.trim()}
              className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2.5 rounded-xl transition shadow-lg shadow-purple-500/20"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
