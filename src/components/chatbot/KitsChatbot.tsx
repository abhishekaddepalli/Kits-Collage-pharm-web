import React, { useEffect, useRef, useState } from 'react';
import { BookOpen, MessageSquare, Minimize2, Send, X } from 'lucide-react';
import { useCms } from '../../app/providers/CmsContext';
import { cmsService } from '../../services/cms/cmsService';
import { SafeImage } from '../common/SafeImage';

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  time: string;
}

export const KitsChatbot: React.FC = () => {
  const { state } = useCms();
  const { chatbot } = state;

  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionToken] = useState(() => `kits-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'msg-welcome',
      sender: 'bot',
      text: chatbot.welcomeMessage,
      time: 'Now',
    },
  ]);

  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].id === 'msg-welcome') {
        return [{ ...prev[0], text: chatbot.welcomeMessage }];
      }
      return prev;
    });
  }, [chatbot.welcomeMessage]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping, isOpen]);

  if (!chatbot.enabled) return null;

  const sendQuery = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isTyping) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: trimmed,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    const res = await cmsService.sendChatbotMessage(trimmed, sessionToken);
    const replyText =
      res.ok && res.data?.reply
        ? res.data.reply
        : res.message || chatbot.fallbackMessage || 'Please contact +91 97015 18708 for assistance.';

    const botMsg: ChatMessage = {
      id: `b-${Date.now()}`,
      sender: 'bot',
      text: replyText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, botMsg]);
    setIsTyping(false);
  };

  return (
    <div className="fixed bottom-16 md:bottom-6 right-4 md:right-6 z-50">
      {!isOpen ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label={`Open ${chatbot.name}`}
          style={{ backgroundColor: chatbot.primaryColor || 'var(--kits-primary)' }}
          className="group flex items-center justify-center sm:gap-2.5 w-12 h-12 sm:w-auto sm:h-auto sm:px-4 sm:py-3 text-white rounded-full shadow-lg hover:shadow-xl transition-all cursor-pointer"
        >
          <span className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center shrink-0">
            <MessageSquare className="w-4 h-4" />
          </span>
          <span className="hidden sm:inline text-sm font-semibold whitespace-nowrap pr-1">{chatbot.name}</span>
        </button>
      ) : (
        <div
          role="dialog"
          aria-label={chatbot.name}
          className="fixed inset-0 md:static md:w-[390px] md:h-[540px] bg-white md:rounded-2xl shadow-2xl border border-[var(--kits-border)] flex flex-col overflow-hidden"
        >
          {/* Chat Header */}
          <div
            style={{ backgroundColor: chatbot.primaryColor || 'var(--kits-primary)' }}
            className="px-4 py-3.5 text-white flex items-center justify-between shrink-0"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center shrink-0">
                <BookOpen className="w-4 h-4 text-[var(--kits-gold)]" />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm font-bold truncate font-sans">{chatbot.name}</h2>
                <p className="text-[11px] text-purple-100 truncate">
                  Institutional Helpdesk · Online
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Minimize chat"
                className="p-1.5 rounded-lg hover:bg-white/15 transition-colors cursor-pointer"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close chat"
                className="p-1.5 rounded-lg hover:bg-white/15 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Body */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#FCFAFF]">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-end gap-2 ${
                  msg.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.sender === 'bot' && (
                  <SafeImage
                    src={chatbot.avatarUrl}
                    alt={`${chatbot.name} avatar`}
                    className="w-7 h-7 rounded-full object-cover border border-[var(--kits-border)] shrink-0"
                  />
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-[13px] leading-relaxed whitespace-pre-line ${
                    msg.sender === 'user'
                      ? 'bg-[var(--kits-primary)] text-white rounded-br-sm'
                      : 'bg-white text-[var(--kits-heading)] border border-[var(--kits-border)] rounded-bl-sm'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 text-xs text-slate-500 pl-9">
                <span className="inline-flex gap-1 bg-white border border-[var(--kits-border)] px-3 py-2 rounded-2xl">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-bounce [animation-delay:120ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-bounce [animation-delay:240ms]" />
                </span>
              </div>
            )}

            {/* Suggested Quick Questions */}
            <div className="pt-2">
              <p className="text-[11px] font-semibold text-slate-500 mb-2">Suggested topics</p>
              <div className="flex flex-wrap gap-1.5">
                {chatbot.suggestedQuestions.slice(0, 6).map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => sendQuery(q)}
                    className="text-left text-xs px-3 py-1.5 rounded-full border border-[var(--kits-border)] bg-white hover:bg-[var(--kits-surface)] text-[var(--kits-primary)] font-medium transition-colors cursor-pointer"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendQuery(input);
            }}
            className="p-3 bg-white border-t border-[var(--kits-border)] flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your question..."
              aria-label="Ask KITS AI Assistant"
              className="flex-1 px-3.5 py-2 text-sm bg-[#FCFAFF] border border-[var(--kits-border)] rounded-full focus:outline-none focus:ring-2 focus:ring-[var(--kits-primary)]"
            />
            <button
              type="submit"
              aria-label="Send message"
              style={{ backgroundColor: chatbot.primaryColor || 'var(--kits-primary)' }}
              className="w-9 h-9 rounded-full text-white flex items-center justify-center shrink-0 hover:opacity-90 transition-opacity cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
