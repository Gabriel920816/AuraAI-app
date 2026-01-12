
import React, { useState } from 'react';
import { CalendarEvent } from '../types';

interface CalendarViewProps {
  events: CalendarEvent[];
  onAddEvent: (event: CalendarEvent) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ events, onAddEvent }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const getEventsForDay = (day: number) => {
    const dateStr = `${year}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(e => e.date === dateStr);
  };

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle) return;
    onAddEvent({
      id: Date.now().toString(),
      title: newEventTitle,
      date: new Date().toISOString().split('T')[0],
      startTime: '12:00',
      endTime: '13:00',
      category: 'personal'
    });
    setNewEventTitle('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">{monthName} {year}</h2>
          <p className="text-slate-500">Australia (Local) Time</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={prevMonth} className="p-2 hover:bg-slate-100 rounded-lg"><i className="fa-solid fa-chevron-left"></i></button>
          <button onClick={() => setCurrentDate(new Date())} className="px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 font-medium">Today</button>
          <button onClick={nextMonth} className="p-2 hover:bg-slate-100 rounded-lg"><i className="fa-solid fa-chevron-right"></i></button>
          <button onClick={() => setShowAddModal(true)} className="ml-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-lg shadow-indigo-100 flex items-center gap-2">
            <i className="fa-solid fa-plus"></i>
            <span className="hidden sm:inline">Add Event</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="grid grid-cols-7 border-b border-slate-100">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="py-4 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">{day}</div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {blanks.map(i => <div key={`blank-${i}`} className="min-h-[120px] bg-slate-50/50 border-r border-b border-slate-100"></div>)}
          {days.map(day => {
            const dayEvents = getEventsForDay(day);
            const isToday = day === new Date().getDate() && currentDate.getMonth() === new Date().getMonth();
            
            return (
              <div key={day} className="min-h-[120px] p-2 border-r border-b border-slate-100 hover:bg-slate-50 transition-colors">
                <div className={`text-sm font-semibold mb-1 w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-indigo-600 text-white' : 'text-slate-700'}`}>
                  {day}
                </div>
                <div className="space-y-1">
                  {dayEvents.map(event => (
                    <div key={event.id} className={`text-[10px] md:text-xs p-1 rounded border leading-tight truncate ${
                      event.category === 'work' ? 'bg-blue-50 border-blue-100 text-blue-700' : 
                      event.category === 'personal' ? 'bg-purple-50 border-purple-100 text-purple-700' :
                      'bg-orange-50 border-orange-100 text-orange-700'
                    }`}>
                      <span className="font-bold mr-1">{event.startTime}</span>
                      {event.title}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <form onSubmit={handleQuickAdd} className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl">
            <h3 className="text-xl font-bold mb-4">Quick Add Event</h3>
            <input 
              autoFocus
              type="text" 
              placeholder="e.g. Dinner with Friends" 
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none mb-4"
              value={newEventTitle}
              onChange={(e) => setNewEventTitle(e.target.value)}
            />
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setShowAddModal(false)} className="px-6 py-2 text-slate-500 font-medium">Cancel</button>
              <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors">Add</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default CalendarView;
