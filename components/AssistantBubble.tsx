
import React, { useState, useRef, useEffect } from 'react';
import { processAssistantQuery } from '../geminiService';
import { CalendarEvent } from '../types';

interface AssistantBubbleProps {
  events: CalendarEvent[];
  onAddEvent: (e: CalendarEvent) => void;
  onSetCountry: (c: string) => void;
}

const AssistantBubble: React.FC<AssistantBubbleProps> = ({ events, onAddEvent, onSetCountry }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'aura', content: string}[]>([
    { role: 'aura', content: 'Hi! Aura is ready to help you.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const sendQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const response = await processAssistantQuery(userMsg, { events: events.slice(0, 5) });
      if (response.action?.type === 'ADD_EVENT' && response.action.data) {
        onAddEvent({
          id: Date.now().toString(),
          title: response.action.data.title || 'New Task',
          date: response.action.data.date || new Date().toISOString().split('T')[0],
          startTime: response.action.data.startTime || '10:00',
          endTime: response.action.data.endTime || '11:00',
          category: 'personal'
        });
      }
      setMessages(prev => [...prev, { role: 'aura', content: response.reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'aura', content: "Sorry, I am having trouble connecting right now." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-[2.5%] z-[250]">
      {isOpen && (
        <div className="absolute bottom-14 right-0 w-[75vw] md:w-[280px] h-[400px] ios-glass rounded-[1.8rem] flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-300 border border-white/20">
          <div className="p-3.5 bg-white/5 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-indigo-500/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 shadow-lg pulse-soft">
                <i className="fa-solid fa-wand-magic-sparkles text-indigo-200 text-[9px]"></i>
              </div>
              <h3 className="font-black text-[11px] tracking-tight text-white/90">Aura Assistant</h3>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/40 hover:text-white transition-all p-1">
              <i className="fa-solid fa-minus text-[10px]"></i>
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3 scrollbar-hide text-[10px]">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`px-3.5 py-2 rounded-[1rem] leading-relaxed max-w-[90%] transition-all shadow-md ${m.role === 'user' ? 'bg-white/20 backdrop-blur-md text-white border border-white/30' : 'bg-white/10 text-white/85 border border-white/10'}`}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && <div className="ml-2 w-8 h-4 flex gap-1 items-center opacity-50"><div className="w-1 h-1 bg-white rounded-full animate-bounce"></div><div className="w-1 h-1 bg-white rounded-full animate-bounce [animation-delay:-0.15s]"></div></div>}
            <div ref={scrollRef} />
          </div>

          <form onSubmit={sendQuery} className="p-2.5 bg-white/5 flex gap-2 border-t border-white/10">
            <input 
              type="text" value={input} onChange={e => setInput(e.target.value)}
              placeholder="How can I help?"
              className="flex-1 bg-white/5 border border-white/10 rounded-full px-3 py-1.5 text-[9px] outline-none focus:bg-white/10 focus:border-white/30 transition-all placeholder:text-white/20 text-white"
            />
            <button 
              type="submit" 
              className="w-7 h-7 ios-glass bg-white/10 flex items-center justify-center text-white shadow-lg hover:bg-white/20 active:scale-90 transition-all border border-white/20"
            >
              <i className="fa-solid fa-paper-plane text-[8px]"></i>
            </button>
          </form>
        </div>
      )}

      {/* Smaller Main Glass Orb Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 md:w-11 md:h-11 rounded-full ios-glass bg-white/10 flex items-center justify-center text-white shadow-2xl hover:bg-white/20 hover:scale-110 active:scale-90 transition-all border border-white/30"
      >
        <i className={`fa-solid ${isOpen ? 'fa-xmark text-base' : 'fa-wand-magic-sparkles text-lg'} opacity-90`}></i>
      </button>
    </div>
  );
};

export default AssistantBubble;
