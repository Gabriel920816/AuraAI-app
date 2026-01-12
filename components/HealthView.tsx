
import React, { useState } from 'react';
import { PeriodRecord } from '../types';

interface HealthViewProps {
  records: PeriodRecord[];
  setRecords: (records: PeriodRecord[]) => void;
}

const HealthView: React.FC<HealthViewProps> = ({ records, setRecords }) => {
  const [cycleLength, setCycleLength] = useState(28);
  const [periodDuration, setPeriodDuration] = useState(5);

  // Helper to find the last start record for predictions
  // Fix: PeriodRecord in types.ts uses 'date' and 'type' fields.
  const lastStart = [...records].reverse().find(r => r.type === 'start');
  
  // Fix: Ensure the newRecord object strictly follows the PeriodRecord interface.
  // Properties 'startDate', 'cycleLength', and 'periodDuration' were removed as they are not in the interface.
  const addRecord = () => {
    const today = new Date().toISOString().split('T')[0];
    const newRecord: PeriodRecord = {
      id: Date.now().toString(),
      date: today,
      type: 'start'
    };
    setRecords([...records, newRecord]);
  };

  // Prediction Logic
  // Fix: Use 'date' instead of 'startDate'. Use the component state 'cycleLength' for calculation.
  const predictNextDate = () => {
    if (!lastStart) return 'No data logged yet';
    const lastDate = new Date(lastStart.date);
    lastDate.setDate(lastDate.getDate() + cycleLength);
    return lastDate.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });
  };

  // Fix: Use 'date' instead of 'startDate'. Use the component state 'cycleLength' for calculation.
  const daysToNext = () => {
    if (!lastStart) return null;
    const lastDate = new Date(lastStart.date);
    lastDate.setDate(lastDate.getDate() + cycleLength);
    const diff = lastDate.getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 3600 * 24));
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Status Card */}
        <div className="col-span-1 md:col-span-2 bg-gradient-to-br from-rose-500 to-pink-500 rounded-3xl p-8 text-white shadow-xl shadow-rose-200 relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-xl font-bold opacity-80 mb-6">Cycle Tracker</h3>
            <div className="flex items-end gap-2 mb-2">
              <span className="text-6xl font-black">{daysToNext() ?? '--'}</span>
              <span className="text-xl font-semibold pb-2">days until next cycle</span>
            </div>
            <p className="opacity-90">Estimated start: <span className="font-bold">{predictNextDate()}</span></p>
            
            <button 
              onClick={addRecord}
              className="mt-8 px-8 py-3 bg-white text-rose-600 font-bold rounded-2xl hover:bg-rose-50 transition-colors shadow-lg"
            >
              Log Period Start
            </button>
          </div>
          {/* Decorative shapes */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        </div>

        {/* Stats Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 space-y-6">
          <h4 className="font-bold text-slate-800">Your Stats</h4>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-500">Average Cycle</span>
                <span className="font-bold">{cycleLength} days</span>
              </div>
              <input 
                type="range" min="20" max="40" value={cycleLength} 
                onChange={(e) => setCycleLength(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-rose-500" 
              />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-500">Avg. Period Duration</span>
                <span className="font-bold">{periodDuration} days</span>
              </div>
              <input 
                type="range" min="2" max="10" value={periodDuration} 
                onChange={(e) => setPeriodDuration(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-rose-500" 
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h4 className="font-bold">Log History</h4>
          <i className="fa-solid fa-calendar-heart text-rose-300 text-xl"></i>
        </div>
        <div className="divide-y divide-slate-50">
          {records.length > 0 ? [...records].reverse().map(record => (
            <div key={record.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
              <div>
                <p className="font-semibold text-slate-800">{new Date(record.date).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                <p className="text-xs text-slate-500">Event: {record.type === 'start' ? 'Period Started' : 'Period Ended'}</p>
              </div>
              <button 
                onClick={() => setRecords(records.filter(r => r.id !== record.id))}
                className="text-slate-300 hover:text-rose-500 transition-colors"
              >
                <i className="fa-solid fa-trash-can"></i>
              </button>
            </div>
          )) : (
            <div className="p-12 text-center text-slate-400">
              <i className="fa-solid fa-seedling text-4xl mb-3 block"></i>
              <p>No history found. Start logging today!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HealthView;
