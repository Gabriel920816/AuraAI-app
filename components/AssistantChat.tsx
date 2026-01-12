
import React, { useState, useRef, useEffect } from 'react';
import { processAssistantQuery } from '../geminiService';
import { CalendarEvent } from '../types';

interface Message {
  role: 'user' | 'aura';
  content: string;
}

interface AssistantChatProps {
  events: CalendarEvent[];
  onAddEvent: (event: CalendarEvent) => void;
}

const AssistantChat: React.FC<AssistantChatProps> = ({ events, onAddEvent }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'aura', content: 'Hi! I am Aura, your personal calendar assistant. How can I help you organize your life today?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsTyping(true);

    try {
      const response = await processAssistantQuery(userMsg, { upcomingEvents: events.slice(0, 3) });
      
      if (response.action && response.action.type === 'ADD_EVENT') {
        const d = response.action.data;
        onAddEvent({
          id: Date.now().toString(),
          title: d.title || 'Untitled Event',
          date: d.date || new Date().toISOString().split('T')[0],
          startTime: d.startTime || '12:00',
          endTime: d.endTime || '13:00',
          category: 'personal'
        });
      }

      setMessages(prev => [...prev, { role: 'aura', content: response.reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'aura', content: "Sorry, I encountered an issue processing that. Could you try again?" }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[70vh] bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-6 bg-indigo-600 text-white flex items-center gap-4">
        <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
          <i className="fa-solid fa-robot text-2xl"></i>
        </div>
        <div>
          <h3 className="font-bold text-lg leading-tight">Aura Assistant</h3>
          <p className="text-white/70 text-sm">Powered by Gemini AI</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
              m.role === 'user' 
              ? 'bg-indigo-600 text-white rounded-br-none shadow-md' 
              : 'bg-slate-100 text-slate-800 rounded-bl-none'
            }`}>
              {m.content}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-slate-100 px-4 py-3 rounded-2xl flex gap-1 items-center">
              <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-75"></div>
              <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-150"></div>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3">
        <input 
          type="text" 
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="e.g. Add a gym session tomorrow at 7am" 
          className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
        />
        <button type="submit" className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200 hover:bg-indigo-700">
          <i className="fa-solid fa-paper-plane"></i>
        </button>
      </form>
    </div>
  );
};

export default AssistantChat;
