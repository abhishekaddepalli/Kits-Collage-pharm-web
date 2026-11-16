import React, { useState } from 'react';
import { Bot, Plus, Send, Trash2 } from 'lucide-react';
import { useCms } from '../app/providers/CmsContext';
import type { ChatbotCategory, ChatbotFAQ } from '../types/cms';
import { resolveChatbotReply } from '../utils/chatbotEngine';

const CATEGORIES: ChatbotCategory[] = [
  'College Information',
  'Admissions',
  'Courses',
  'Eligibility',
  'Departments',
  'Faculty',
  'Facilities',
  'Hostel',
  'Contact',
  'Academic Information',
];

export const ChatbotSettingsManager: React.FC = () => {
  const { state, updateState } = useCms();
  const bot = state.chatbot;
  const [testQuery, setTestQuery] = useState('');
  const [testResult, setTestResult] = useState<string>('');

  const updateBot = (patch: Partial<typeof bot>, action: string) => {
    updateState(
      (prev) => ({ ...prev, chatbot: { ...prev.chatbot, ...patch } }),
      { action, module: 'Chatbot' }
    );
  };

  const runTest = (e: React.FormEvent) => {
    e.preventDefault();
    const res = resolveChatbotReply(testQuery, bot, {
      phone: state.settings.contact.primaryPhone,
      email: state.settings.contact.email,
      address: state.settings.contact.address,
      workingHours: state.settings.contact.workingHours,
    });
    setTestResult(res.response);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#171238]">KITS AI Assistant Manager</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure chatbot branding, welcome message, suggested questions, fallback behavior, and test FAQ matching.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white border border-[#E8DFF5] rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <label className="inline-flex items-center gap-2 text-xs font-bold cursor-pointer">
              <input
                type="checkbox"
                checked={bot.enabled}
                onChange={(e) => updateBot({ enabled: e.target.checked }, 'Toggled chatbot widget')}
              />
              Enable Public Floating Chatbot
            </label>
            <div className="flex items-center gap-2 text-xs">
              <span>Accent:</span>
              <input
                type="color"
                value={bot.primaryColor}
                onChange={(e) => updateBot({ primaryColor: e.target.value }, 'Changed chatbot color')}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Assistant Name</label>
            <input
              type="text"
              value={bot.name}
              onChange={(e) => updateBot({ name: e.target.value }, 'Renamed chatbot')}
              className="w-full px-3.5 py-2 text-sm border border-[#E8DFF5] rounded-lg"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Welcome Message</label>
            <textarea
              rows={2}
              value={bot.welcomeMessage}
              onChange={(e) => updateBot({ welcomeMessage: e.target.value }, 'Updated chatbot welcome message')}
              className="w-full px-3.5 py-2 text-xs border border-[#E8DFF5] rounded-lg"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Fallback Message (When Unmatched)</label>
            <textarea
              rows={2}
              value={bot.fallbackMessage}
              onChange={(e) => updateBot({ fallbackMessage: e.target.value }, 'Updated chatbot fallback')}
              className="w-full px-3.5 py-2 text-xs border border-[#E8DFF5] rounded-lg"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Suggested Questions (Comma-separated)</label>
            <input
              type="text"
              value={bot.suggestedQuestions.join(', ')}
              onChange={(e) =>
                updateBot(
                  {
                    suggestedQuestions: e.target.value
                      .split(',')
                      .map((x) => x.trim())
                      .filter(Boolean),
                  },
                  'Updated suggested chatbot prompts'
                )
              }
              className="w-full px-3.5 py-2 text-xs border border-[#E8DFF5] rounded-lg"
            />
          </div>
        </div>

        {/* Live Test Console + Recent Logs */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-[#E8DFF5] rounded-2xl p-5 space-y-3">
            <h2 className="text-sm font-bold text-[#171238] flex items-center gap-2 font-sans">
              <Bot className="w-4 h-4 text-[#52128B]" /> Test FAQ Matching Engine
            </h2>
            <form onSubmit={runTest} className="flex gap-2">
              <input
                type="text"
                value={testQuery}
                onChange={(e) => setTestQuery(e.target.value)}
                placeholder="Ask a test question..."
                className="flex-1 px-3 py-2 text-xs border border-[#E8DFF5] rounded-lg"
              />
              <button type="submit" className="px-3 py-2 bg-[#52128B] text-white rounded-lg cursor-pointer">
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
            {testResult && (
              <div className="bg-[#F5F0FC] rounded-xl p-3 text-xs text-[#171238] whitespace-pre-line">
                {testResult}
              </div>
            )}
          </div>

          <div className="bg-white border border-[#E8DFF5] rounded-2xl p-5 space-y-3">
            <h2 className="text-sm font-bold text-[#171238] font-sans">Recent Visitor Queries</h2>
            <div className="space-y-2 max-h-56 overflow-y-auto text-xs">
              {bot.conversations.slice(0, 8).map((c) => (
                <div key={c.id} className="p-2.5 rounded-lg bg-[#FCFAFF] border border-[#E8DFF5]">
                  <div className="font-semibold text-[#171238]">Q: {c.userQuery}</div>
                  <div className="text-slate-500 mt-0.5">
                    {c.matched ? 'Matched FAQ' : 'Fallback contact provided'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ChatbotFaqManager: React.FC = () => {
  const { state, updateState } = useCms();
  const [catFilter, setCatFilter] = useState<string>('All');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [category, setCategory] = useState<ChatbotCategory>('Admissions');
  const [keywords, setKeywords] = useState('');

  const addFaq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !answer.trim()) return;
    const item: ChatbotFAQ = {
      id: `faq-${Date.now()}`,
      category,
      question: question.trim(),
      answer: answer.trim(),
      keywords: keywords
        .split(',')
        .map((k) => k.trim())
        .filter(Boolean),
      enabled: true,
    };
    updateState(
      (prev) => ({
        ...prev,
        chatbot: { ...prev.chatbot, faqs: [item, ...prev.chatbot.faqs] },
      }),
      { action: `Added chatbot FAQ "${item.question}"`, module: 'Chatbot FAQs' }
    );
    setQuestion('');
    setAnswer('');
    setKeywords('');
  };

  const faqs = state.chatbot.faqs.filter((f) => catFilter === 'All' || f.category === catFilter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#171238]">Chatbot Knowledge Base (FAQs)</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Edit approved institutional Q&A pairs and matching keywords across 10 knowledge categories.
        </p>
      </div>

      <form onSubmit={addFaq} className="bg-white border border-[#E8DFF5] rounded-2xl p-5 grid grid-cols-1 md:grid-cols-2 gap-3">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="FAQ Question"
          className="px-3 py-2 text-xs border border-[#E8DFF5] rounded-lg"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as ChatbotCategory)}
          className="px-3 py-2 text-xs border border-[#E8DFF5] rounded-lg bg-white"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <textarea
          rows={2}
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Verified institutional answer"
          className="md:col-span-2 px-3 py-2 text-xs border border-[#E8DFF5] rounded-lg"
        />
        <input
          type="text"
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
          placeholder="Keywords (comma-separated, e.g. fees, scholarship, eapcet)"
          className="px-3 py-2 text-xs border border-[#E8DFF5] rounded-lg"
        />
        <button
          type="submit"
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#52128B] rounded-lg cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" /> Add FAQ Entry
        </button>
      </form>

      <div className="flex flex-wrap gap-2">
        {['All', ...CATEGORIES].map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCatFilter(c)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-full cursor-pointer ${
              catFilter === c ? 'bg-[#52128B] text-white' : 'bg-white border border-[#E8DFF5]'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {faqs.map((faq) => (
          <div key={faq.id} className="bg-white border border-[#E8DFF5] rounded-xl p-4 space-y-2 text-xs">
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-[#52128B]">{faq.category}</span>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={faq.enabled}
                    onChange={(e) =>
                      updateState((prev) => ({
                        ...prev,
                        chatbot: {
                          ...prev.chatbot,
                          faqs: prev.chatbot.faqs.map((f) =>
                            f.id === faq.id ? { ...f, enabled: e.target.checked } : f
                          ),
                        },
                      }))
                    }
                  />
                  Enabled
                </label>
                <button
                  type="button"
                  onClick={() =>
                    updateState((prev) => ({
                      ...prev,
                      chatbot: {
                        ...prev.chatbot,
                        faqs: prev.chatbot.faqs.filter((f) => f.id !== faq.id),
                      },
                    }))
                  }
                  className="text-red-600 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <input
              type="text"
              value={faq.question}
              onChange={(e) =>
                updateState((prev) => ({
                  ...prev,
                  chatbot: {
                    ...prev.chatbot,
                    faqs: prev.chatbot.faqs.map((f) =>
                      f.id === faq.id ? { ...f, question: e.target.value } : f
                    ),
                  },
                }))
              }
              className="w-full font-bold text-sm text-[#171238] border-b border-[#E8DFF5] pb-1 focus:outline-none"
            />
            <textarea
              rows={2}
              value={faq.answer}
              onChange={(e) =>
                updateState((prev) => ({
                  ...prev,
                  chatbot: {
                    ...prev.chatbot,
                    faqs: prev.chatbot.faqs.map((f) =>
                      f.id === faq.id ? { ...f, answer: e.target.value } : f
                    ),
                  },
                }))
              }
              className="w-full px-3 py-1.5 border border-[#E8DFF5] rounded"
            />
            <div className="text-[11px] text-slate-500">
              Keywords: {faq.keywords.join(', ')}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
