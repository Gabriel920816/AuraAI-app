import React, { useState, useEffect, useMemo, useRef } from 'react';
import { CalendarEvent } from '../../types';
import GlassDatePicker from '../ui/GlassDatePicker';
import { GLOBAL_HOLIDAYS, REGIONAL_ECOM_FESTIVALS } from '../../holidayData';

const HOUR_HEIGHT = 70; 
const START_HOUR = 7;

const GlassTimePicker = ({ value, onChange, label }: { value: string, onChange: (v: string) => void, label: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hour24, minute] = value.split(':').map(Number);
  const period = hour24 >= 12 ? 'PM' : 'AM';
  const hour12 = hour24 % 12 || 12;
  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = ['00', '15', '30', '45'];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => { if (containerRef.current && !containerRef.current.contains(e.target as Node)) setIsOpen(false); };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const updateTime = (h: number, m: string, p: string) => {
    let finalH = h % 12;
    if (p === 'PM') finalH += 12;
    onChange(`${String(finalH).padStart(2, '0')}:${m}`);
  };

  return (
    <div className="relative flex-1" ref={containerRef}>
      <label className="text-[10px] font-black uppercase tracking-[0.2em] block mb-2 text-white/50">{label}</label>
      <div onClick={() => setIsOpen(!isOpen)} className="p-4 rounded-2xl bg-white/5 border border-white/10 text-white cursor-pointer flex justify-between items-center hover:bg-white/10 transition-all">
        <span className="font-bold text-sm">{`${String(hour12).padStart(2,'0')}:${String(minute).padStart(2,'0')} ${period}`}</span>
        <i className="fa-solid fa-clock text-[10px] opacity-40"></i>
      </div>
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-[1001] !bg-black/90 backdrop-blur-xl rounded-[2rem] p-4 shadow-2xl border border-white/20 w-[240px] flex gap-2 h-48">
          <div className="flex-1 overflow-y-auto scrollbar-hide py-2 space-y-1">
             {hours.map(h => (<button key={h} type="button" onClick={() => updateTime(h, String(minute).padStart(2,'0'), period)} className={`w-full py-2 rounded-xl text-[11px] font-black ${hour12 === h ? 'bg-indigo-500/30 text-indigo-200 border border-indigo-500/30' : 'text-white/40 hover:text-white'}`}>{String(h).padStart(2, '0')}</button>))}
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-hide py-2 space-y-1">
             {minutes.map(m => (<button key={m} type="button" onClick={() => updateTime(hour12, m, period)} className={`w-full py-2 rounded-xl text-[11px] font-black ${String(minute).padStart(2,'0') === m ? 'bg-indigo-500/30 text-indigo-200 border border-indigo-500/30' : 'text-white/40 hover:text-white'}`}>{m}</button>))}
          </div>
          <div className="flex-1 py-2 space-y-1">
             {['AM', 'PM'].map(p => (<button key={p} type="button" onClick={() => updateTime(hour12, String(minute).padStart(2,'0'), p)} className={`w-full py-2 rounded-xl text-[11px] font-black ${period === p ? 'bg-indigo-500/30 text-indigo-200 border border-indigo-500/30' : 'text-white/40 hover:text-white'}`}>{p}</button>))}
          </div>
        </div>
      )}
    </div>
  );
};

const GlassSelect = ({ value, onChange, options, label }: { value: string, onChange: (v: string) => void, options: {value: string, label: string}[], label?: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => { if (containerRef.current && !containerRef.current.contains(e.target as Node)) setIsOpen(false); };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  return (
    <div className="relative flex-1" ref={containerRef}>
      {label && <label className="text-[10px] font-black uppercase tracking-[0.2em] block mb-2 text-white/50">{label}</label>}
      <div onClick={() => setIsOpen(!isOpen)} className="p-4 rounded-2xl bg-white/5 border border-white/10 text-white cursor-pointer flex justify-between items-center hover:bg-white/10 transition-all">
        <span className="font-bold text-sm">{options.find(o => o.value === value)?.label || value}</span>
        <i className={`fa-solid fa-chevron-down text-[10px] transition-transform ${isOpen ? 'rotate-180' : ''}`}></i>
      </div>
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 z-[900] !bg-black/90 backdrop-blur-xl rounded-2xl overflow-hidden p-1 shadow-2xl border border-white/10">
          <div className="max-h-48 overflow-y-auto scrollbar-hide">
            {options.map(opt => (
              <div key={opt.value} onClick={() => { onChange(opt.value); setIsOpen(false); }} className={`p-3 text-[11px] font-black uppercase tracking-tight rounded-xl cursor-pointer transition-all ${value === opt.value ? 'bg-white/20 text-white' : 'text-white/50 hover:bg-white/5 hover:text-white'}`}>{opt.label}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

interface CalendarWidgetProps {
  events: CalendarEvent[];
  setEvents: (events: CalendarEvent[]) => void;
  selectedCountry: string;
  setSelectedCountry: (country: string) => void;
}

const CalendarWidget: React.FC<CalendarWidgetProps> = ({ events, setEvents, selectedCountry, setSelectedCountry }) => {
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCountryModalOpen, setIsCountryModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);

  const [formTitle, setFormTitle] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formStart, setFormStart] = useState('09:00');
  const [formEnd, setFormEnd] = useState('10:00');
  const [formCategory, setFormCategory] = useState<CalendarEvent['category']>('work');
  const [currentTime, setCurrentTime] = useState(new Date());

  const agendaScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const selectedDateStr = useMemo(() => `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`, [selectedDate]);
  
  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
  const firstDay = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDay }, (_, i) => i);
  const timelineHours = Array.from({ length: 15 }, (_, i) => i + START_HOUR);
  const countryOptions = Object.keys(GLOBAL_HOLIDAYS).map(c => ({ value: c, label: c }));

  const timeToMinutes = (time: string) => {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  };

  const positionedAgendaEvents = useMemo(() => {
    const filtered = events.filter(e => e.date === selectedDateStr);
    const sorted = [...filtered].sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
    
    const columns: CalendarEvent[][] = [];
    sorted.forEach(event => {
      let placed = false;
      const startMin = timeToMinutes(event.startTime);
      for (let i = 0; i < columns.length; i++) {
        const lastInCol = columns[i][columns[i].length - 1];
        if (startMin >= timeToMinutes(lastInCol.endTime)) {
          columns[i].push(event);
          placed = true;
          break;
        }
      }
      if (!placed) columns.push([event]);
    });

    return columns.flatMap((col, colIndex) => 
      col.map(event => ({ ...event, colIndex, totalCols: columns.length }))
    );
  }, [events, selectedDateStr]);

  const nowLinePos = useMemo(() => {
    if (selectedDateStr !== todayStr) return null;
    const h = currentTime.getHours();
    const m = currentTime.getMinutes();
    if (h < START_HOUR || h >= START_HOUR + timelineHours.length) return null;
    return (h - START_HOUR) * HOUR_HEIGHT + (m / 60) * HOUR_HEIGHT;
  }, [currentTime, selectedDateStr, todayStr]);

  useEffect(() => {
    if (agendaScrollRef.current && nowLinePos !== null) {
      const container = agendaScrollRef.current;
      const targetScroll = nowLinePos - container.clientHeight / 2;
      container.scrollTo({ top: targetScroll, behavior: 'smooth' });
    }
  }, [nowLinePos]);

  const currentMonthHolidays = useMemo(() => {
    const year = viewDate.getFullYear();
    const monthShort = viewDate.toLocaleString('default', { month: 'short' });
    const yearHolidays = GLOBAL_HOLIDAYS[selectedCountry]?.[year] || [];
    const local = yearHolidays.filter(h => h.date.includes(monthShort)).map(h => ({ ...h, type: 'local' }));
    const regionalEcom = REGIONAL_ECOM_FESTIVALS[selectedCountry]?.[year] || [];
    const ecom = regionalEcom.filter(f => f.date.includes(monthShort)).map(f => ({ ...f, type: 'ecom' }));
    return [...local, ...ecom];
  }, [selectedCountry, viewDate]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle) return;
    if (editingEvent) {
      setEvents(events.map(ev => ev.id === editingEvent.id ? { ...ev, title: formTitle, date: formDate, startTime: formStart, endTime: formEnd, category: formCategory } : ev));
    } else {
      setEvents([...events, { id: Date.now().toString(), title: formTitle, date: formDate, startTime: formStart, endTime: formEnd, category: formCategory }]);
    }
    setIsModalOpen(false);
  };

  const openAddModal = () => {
    setEditingEvent(null); setFormTitle(''); setFormDate(selectedDateStr); setFormStart('10:00'); setFormEnd('11:00'); setFormCategory('work'); setIsModalOpen(true);
  };

  return (
    <div className="ios-glass p-6 md:p-8 h-full flex flex-col xl:flex-row gap-8 relative overflow-visible">
      <div className="xl:w-[68%] flex flex-col h-full overflow-visible">
        <div className="flex justify-between items-start mb-4 shrink-0 px-2">
          <div className="flex flex-col">
            <h3 className="text-[2rem] font-black tracking-tighter text-white leading-tight">
              {viewDate.toLocaleString('default', { month: 'long' })}
            </h3>
            <p className="text-[1.1rem] font-black opacity-30 uppercase tracking-[0.5em]">{viewDate.getFullYear()}</p>
          </div>
          <div className="flex gap-2 items-center">
            <button onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))} className="w-10 h-10 ios-glass flex items-center justify-center hover:bg-white/10 transition-all border border-white/10"><i className="fa-solid fa-chevron-left"></i></button>
            <button onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))} className="w-10 h-10 ios-glass flex items-center justify-center hover:bg-white/10 transition-all border border-white/10"><i className="fa-solid fa-chevron-right"></i></button>
            <button onClick={() => setIsCountryModalOpen(true)} className="w-10 h-10 rounded-full ios-glass flex items-center justify-center border border-white/10 ml-2 hover:bg-white/10 transition-all"><i className="fa-solid fa-earth-asia"></i></button>
          </div>
        </div>

        <div className="flex-1 grid grid-cols-7 gap-1 min-h-0 overflow-visible">
          {['SUN','MON','TUE','WED','THU','FRI','SAT'].map(d => (
            <div key={d} className="text-center text-[10px] font-black uppercase tracking-widest py-2 text-white/90">{d}</div>
          ))}
          {blanks.map(i => <div key={`b-${i}`} />)}
          {days.map(d => {
            const dateObj = new Date(viewDate.getFullYear(), viewDate.getMonth(), d);
            const dayStr = String(d).padStart(2, '0');
            const dateStr = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${dayStr}`;
            const isSelected = dateStr === selectedDateStr;
            const isToday = dateStr === todayStr;
            const dayEventsList = events.filter(e => e.date === dateStr);
            const monthShort = viewDate.toLocaleString('default', { month: 'short' });
            const festivalsOnThisDay = currentMonthHolidays.filter(h => h.date === `${monthShort} ${dayStr}`);

            return (
              <div 
                key={d} 
                onClick={() => setSelectedDate(dateObj)} 
                className={`relative flex flex-col items-center justify-start pt-2 px-1 cursor-pointer transition-all group overflow-visible min-h-[min(74px,12vh)] border-2
                  ${isSelected ? 'bg-white/15 backdrop-blur-md rounded-2xl shadow-xl border-white/60 z-[20]' : 'border-transparent hover:bg-white/5 rounded-2xl'}
                  ${isToday ? '!border-indigo-400/80 bg-white/5 shadow-[0_0_15px_rgba(129,140,248,0.2)]' : ''}
                `}
              >
                <span className={`text-[1.1rem] font-black relative z-10 transition-colors ${isSelected || isToday ? 'text-white' : 'text-white/90'}`}>{d}</span>
                <div className="flex gap-1 mt-1 shrink-0">
                  {dayEventsList.length > 0 && <div className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-indigo-400'}`}></div>}
                  {festivalsOnThisDay.length > 0 && <div className={`w-1.5 h-1.5 rounded-full ${festivalsOnThisDay[0].type === 'ecom' ? 'bg-rose-500 animate-pulse' : 'bg-amber-500'}`}></div>}
                </div>
                {festivalsOnThisDay.length > 0 && (
                  <p className={`absolute bottom-1 left-0 right-0 text-center text-[8px] font-black uppercase truncate px-1 tracking-tighter transition-opacity z-10 ${festivalsOnThisDay[0].type === 'ecom' ? 'text-rose-400' : 'text-amber-400'}`}>
                    {festivalsOnThisDay[0].name}
                  </p>
                )}

                {(festivalsOnThisDay.length > 0 || dayEventsList.length > 0) && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-56 p-4 !bg-black/90 backdrop-blur-xl rounded-[2.5rem] shadow-2xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-[500] border border-white/20 translate-y-2 group-hover:translate-y-0">
                    {festivalsOnThisDay.map((f, idx) => (
                       <div key={idx} className={`mb-2 pb-2 border-b border-white/10 last:border-0 ${idx > 0 ? 'mt-2' : ''}`}>
                         <span className={`text-[10px] font-black uppercase tracking-widest ${f.type === 'ecom' ? 'text-rose-400' : 'text-amber-400'}`}>{f.name}</span>
                         <p className="text-[7px] font-bold opacity-40 mt-0.5 tracking-[0.2em]">{f.type === 'ecom' ? 'ECOMMERCE EVENT' : 'PUBLIC HOLIDAY'}</p>
                       </div>
                    ))}
                    {dayEventsList.map(ev => (
                      <div key={ev.id} className="mb-2 last:mb-0">
                         <p className="text-[11px] font-bold text-white leading-tight">{ev.title}</p>
                         <p className="text-[8px] font-black opacity-40 uppercase tracking-widest">{ev.startTime} - {ev.endTime}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="xl:w-[32%] flex flex-col xl:border-l border-white/10 xl:pl-6 overflow-visible">
        <div className="flex items-center justify-between mb-8">
            <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-white/90">
              {selectedDate.toLocaleDateString('default', { day: 'numeric', month: 'short' })} Agenda
            </h4>
            <button onClick={openAddModal} className="w-10 h-10 ios-glass flex items-center justify-center hover:bg-white/20 transition-all border border-white/20"><i className="fa-solid fa-plus"></i></button>
        </div>
        
        <div ref={agendaScrollRef} className="flex-1 overflow-y-auto pr-2 scrollbar-hide relative">
          <div className="relative" style={{ height: `${timelineHours.length * HOUR_HEIGHT}px` }}>
            {nowLinePos !== null && (
              <div 
                className="absolute left-0 right-0 z-50 flex items-center pointer-events-none" 
                style={{ top: `${nowLinePos}px` }}
              >
                <div className="w-10 shrink-0 text-right pr-2">
                  <span className="text-[8px] font-black text-indigo-400 bg-indigo-500/10 px-1 rounded-sm tracking-widest">NOW</span>
                </div>
                <div className="flex-1 h-px bg-gradient-to-r from-indigo-500/80 via-indigo-500/20 to-transparent relative">
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-indigo-500 rounded-full shadow-[0_0_12px_rgba(99,102,241,1)]"></div>
                </div>
              </div>
            )}

            {timelineHours.map(hour => (
              <div key={hour} className="flex gap-4" style={{ height: `${HOUR_HEIGHT}px` }}>
                <div className="w-10 text-right shrink-0"><span className="text-[10px] font-black text-white/30">{String(hour).padStart(2, '0')}:00</span></div>
                <div className="flex-1 border-l border-white/5 border-t border-white/[0.03]"></div>
              </div>
            ))}

            {positionedAgendaEvents.map(e => {
              const startMin = timeToMinutes(e.startTime);
              const endMin = timeToMinutes(e.endTime);
              const top = (startMin - START_HOUR * 60) * (HOUR_HEIGHT / 60);
              const height = Math.max((endMin - startMin) * (HOUR_HEIGHT / 60), 40);
              const width = 100 / e.totalCols;
              const left = e.colIndex * width;

              return (
                <div 
                  key={e.id}
                  onClick={() => {
                    setEditingEvent(e);
                    setFormTitle(e.title);
                    setFormDate(e.date);
                    setFormStart(e.startTime);
                    setFormEnd(e.endTime);
                    setFormCategory(e.category);
                    setIsModalOpen(true);
                  }}
                  className={`absolute p-3 ios-glass bg-white/5 rounded-2xl border-l-4 transition-all cursor-pointer overflow-hidden z-10 hover:bg-white/10 group
                    ${e.category === 'work' ? 'border-l-indigo-500' : (e.category === 'health' ? 'border-l-rose-500' : 'border-l-emerald-500')}
                  `}
                  style={{ 
                    top: `${top}px`, 
                    height: `${height}px`, 
                    left: `calc(3rem + ${left}%)`, 
                    width: `calc(${width}% - 0.5rem)` 
                  }}
                >
                  <p className="text-xs font-black text-white truncate group-hover:text-indigo-300 transition-colors">{e.title}</p>
                  <p className="text-[9px] font-black text-white/40 mt-1 uppercase tracking-tighter">{e.startTime} - {e.endTime}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {isCountryModalOpen && (
        <div className="absolute inset-0 z-[1000] flex items-center justify-center heavy-frost rounded-[2rem] animate-in fade-in duration-500" onClick={() => setIsCountryModalOpen(false)}>
            <div className="w-full max-w-xl p-10 rounded-[3.5rem] !bg-white/5 backdrop-blur-[30px] border border-white/10 animate-in zoom-in-95 duration-300 shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-10">
                  <h3 className="text-[1.2rem] font-black text-white uppercase tracking-[0.4em]">Global Regions</h3>
                  <button onClick={() => setIsCountryModalOpen(false)} className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all border border-white/10"><i className="fa-solid fa-xmark text-white/40"></i></button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[50vh] overflow-y-auto scrollbar-hide p-1">
                    {countryOptions.map(opt => (
                        <button key={opt.value} onClick={() => { setSelectedCountry(opt.value); setIsCountryModalOpen(false); }} className={`p-6 rounded-[2rem] text-[13px] font-black uppercase tracking-widest flex items-center justify-between border transition-all ${selectedCountry === opt.value ? 'bg-white/15 border-white/40 text-white shadow-xl' : 'bg-white/5 border-white/10 text-white/30 hover:bg-white/10 hover:text-white/80'}`}>
                            {opt.label}
                            {selectedCountry === opt.value && <i className="fa-solid fa-check text-indigo-400 text-xs"></i>}
                        </button>
                    ))}
                </div>
            </div>
        </div>
      )}

      {isModalOpen && (
        <div className="absolute inset-0 z-[1000] flex items-center justify-center heavy-frost rounded-[2rem] animate-in fade-in duration-500" onClick={() => setIsModalOpen(false)}>
           <form onSubmit={handleSave} className="w-full max-w-md p-10 rounded-[3.5rem] !bg-white/5 backdrop-blur-[30px] border border-white/10 space-y-8 animate-in zoom-in-95 duration-300 shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-black text-white tracking-tighter">{editingEvent ? 'Edit Event' : 'Add Event'}</h3>
                <button type="button" onClick={() => setIsModalOpen(false)} className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all border border-white/10 text-white/40 hover:text-white"><i className="fa-solid fa-xmark"></i></button>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] block text-white/30">Title</label>
                <input value={formTitle} onChange={e => setFormTitle(e.target.value)} autoFocus className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-lg font-bold text-white outline-none focus:bg-white/10 transition-all" placeholder="Enter Title..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <GlassDatePicker label="Date" value={formDate} onChange={setFormDate} />
                <GlassSelect label="Category" value={formCategory} onChange={v => setFormCategory(v as any)} options={[{value:'work',label:'Work'},{value:'personal',label:'Personal'},{value:'health',label:'Wellness'}]} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <GlassTimePicker label="Start Time" value={formStart} onChange={setFormStart} />
                <GlassTimePicker label="End Time" value={formEnd} onChange={setFormEnd} />
              </div>
              <div className="flex gap-4">
                {editingEvent && (
                  <button type="button" onClick={() => { setEvents(events.filter(ev => ev.id !== editingEvent.id)); setIsModalOpen(false); }} className="px-6 py-5 bg-rose-500/20 border border-rose-500/30 rounded-2xl text-rose-300 font-black uppercase tracking-widest text-[9px] hover:bg-rose-500/30 transition-all">Delete</button>
                )}
                <button type="submit" className="flex-1 py-5 ios-btn rounded-2xl font-black uppercase tracking-[0.4em] text-xs shadow-xl active:scale-95 transition-all text-white bg-indigo-600">Save Event</button>
              </div>
           </form>
        </div>
      )}
    </div>
  );
};

export default CalendarWidget;