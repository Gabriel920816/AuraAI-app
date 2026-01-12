
import React, { useState, useRef, useEffect } from 'react';
import { processAssistantQuery } from '../geminiService';
import { CalendarEvent } from '../types';

interface AssistantBubbleProps {
  events: CalendarEvent[];
  weather: { temp: number, condition: string, location: string };
  onAddEvent: (e: CalendarEvent) => void;
  onSetCountry: (c: string) => void;
}

const AssistantBubble: React.FC<AssistantBubbleProps> = ({ events, weather, onAddEvent, onSetCountry }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'aura', content: string}[]>([
    { role: 'aura', content: 'Hi! Aura is ready to help you.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { 
    if (isOpen) {
      setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  }, [messages, isOpen]);

  const sendQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedInput = input.trim();
    if (!trimmedInput || loading) return;
    
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: trimmedInput }]);
    setLoading(true);

    try {
      const context = { 
        recentEvents: events.slice(0, 5).map(ev => ({ title: ev.title, date: ev.date, time: ev.startTime })),
        currentCountry: localStorage.getItem('aura_selected_country') || 'Australia',
        currentWeather: weather
      };

      const response = await processAssistantQuery(trimmedInput, context);
      
      if (response.action) {
        if (response.action.type === 'ADD_EVENT' && response.action.data) {
          const { title, date, startTime, endTime } = response.action.data;
          onAddEvent({
            id: Date.now().toString(),
            title: title || 'New Task',
            date: date || new Date().toISOString().split('T')[0],
            startTime: startTime || '10:00',
            endTime: endTime || '11:00',
            category: 'personal'
          });
        } else if (response.action.type === 'CHANGE_COUNTRY' && response.action.data?.country) {
          onSetCountry(response.action.data.country);
        }
      }

      setMessages(prev => [...prev, { role: 'aura', content: response.reply || "Done!" }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'aura', content: "I'm having trouble connecting to my brain right now." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-[2.5%] z-[250]">
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-[85vw] md:w-[320px] h-[450px] ios-glass rounded-[2.5rem] flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-300 border border-white/20 overflow-hidden">
          <div className="p-5 bg-white/5 border-b border-white/10 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-500/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 shadow-lg pulse-soft">
                <i className="fa-solid fa-wand-magic-sparkles text-indigo-200 text-[10px]"></i>
              </div>
              <h3 className="font-black text-[12px] tracking-tight text-white/90">Aura AI</h3>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/40 hover:text-white transition-all p-1">
              <i className="fa-solid fa-minus text-[12px]"></i>
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-hide">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                <div className={`px-4 py-2.5 rounded-[1.2rem] leading-relaxed max-w-[90%] transition-all shadow-md text-[11px] ${
                  m.role === 'user' 
                  ? 'bg-indigo-600/40 backdrop-blur-md text-white border border-white/30 rounded-tr-none' 
                  : 'bg-white/10 text-white/90 border border-white/10 rounded-tl-none'
                }`}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start animate-pulse">
                <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-2xl flex gap-1.5 items-center">
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-duration:0.6s]"></div>
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.1s] [animation-duration:0.6s]"></div>
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s] [animation-duration:0.6s]"></div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-indigo-300/60 ml-1">Thinking</span>
                </div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>

          <form onSubmit={sendQuery} className="p-4 bg-white/5 flex gap-3 border-t border-white/10 shrink-0">
            <input 
              type="text" value={input} onChange={e => setInput(e.target.value)}
              placeholder="Ask about schedule or weather..."
              className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2.5 text-[11px] outline-none focus:bg-white/10 focus:border-white/20 transition-all placeholder:text-white/20 text-white font-medium"
            />
            <button 
              type="submit" disabled={loading}
              className={`w-10 h-10 rounded-full flex items-center justify-center text-white transition-all border border-white/20 ${loading ? 'opacity-30 bg-white/5' : 'bg-white/10 hover:bg-white/20 active:scale-90 shadow-lg'}`}
            >
              <i className={`fa-solid ${loading ? 'fa-spinner animate-spin' : 'fa-paper-plane'} text-[12px] opacity-80`}></i>
            </button>
          </form>
        </div>
      )}

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full ios-glass bg-white/10 flex items-center justify-center text-white shadow-2xl hover:bg-white/20 hover:scale-110 active:scale-95 transition-all border border-white/30 group"
      >
        <i className={`fa-solid ${isOpen ? 'fa-xmark text-lg' : 'fa-wand-magic-sparkles text-xl'} opacity-90 transition-transform duration-500 ${isOpen ? 'rotate-90' : 'group-hover:rotate-12'}`}></i>
      </button>
    </div>
  );
};

export default AssistantBubble;
