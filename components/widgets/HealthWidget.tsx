
import React, { useState, useEffect, useMemo } from 'react';
import { PeriodRecord } from '../../types';
import GlassDatePicker from '../ui/GlassDatePicker';

interface HealthWidgetProps {
  records: PeriodRecord[];
  setRecords: (r: PeriodRecord[]) => void;
}

const HealthWidget: React.FC<HealthWidgetProps> = ({ records, setRecords }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Base settings (fallbacks)
  const [manualAvgCycle, setManualAvgCycle] = useState(parseInt(localStorage.getItem('aura_avg_cycle') || '28'));
  const [manualAvgPeriod, setManualAvgPeriod] = useState(parseInt(localStorage.getItem('aura_avg_period') || '5'));

  // --- Dynamic Learning Engine ---
  const { avgCycle, avgPeriod, hasHistory } = useMemo(() => {
    const sortedStarts = records
      .filter(r => r.type === 'start')
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const sortedEnds = records
      .filter(r => r.type === 'end')
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let cycleSum = 0;
    let cycleCount = 0;
    for (let i = 1; i < sortedStarts.length; i++) {
      const diff = (new Date(sortedStarts[i].date).getTime() - new Date(sortedStarts[i - 1].date).getTime()) / (1000 * 3600 * 24);
      if (diff >= 20 && diff <= 45) { // Valid range filter
        cycleSum += diff;
        cycleCount++;
      }
    }

    let periodSum = 0;
    let periodCount = 0;
    sortedStarts.forEach(start => {
      const startT = new Date(start.date).getTime();
      // Find the first end record that occurs within 14 days after this start
      const matchingEnd = sortedEnds.find(e => {
        const diff = (new Date(e.date).getTime() - startT) / (1000 * 3600 * 24);
        return diff > 0 && diff <= 14;
      });
      if (matchingEnd) {
        periodSum += (new Date(matchingEnd.date).getTime() - startT) / (1000 * 3600 * 24);
        periodCount++;
      }
    });

    const learnedCycle = cycleCount > 0 ? Math.round(cycleSum / cycleCount) : manualAvgCycle;
    const learnedPeriod = periodCount > 0 ? Math.round(periodSum / periodCount) : manualAvgPeriod;

    return { 
      avgCycle: learnedCycle, 
      avgPeriod: learnedPeriod,
      hasHistory: cycleCount > 0 || periodCount > 0
    };
  }, [records, manualAvgCycle, manualAvgPeriod]);

  // Sync manual settings to storage when they change
  useEffect(() => {
    localStorage.setItem('aura_avg_cycle', manualAvgCycle.toString());
    localStorage.setItem('aura_avg_period', manualAvgPeriod.toString());
  }, [manualAvgCycle, manualAvgPeriod]);

  const getTodayStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };
  const [formDate, setFormDate] = useState(getTodayStr());

  // --- Core Calculation Logic ---
  const stats = useMemo(() => {
    const sorted = [...records].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const lastStartRecord = sorted.find(r => r.type === 'start');
    const lastEndRecord = sorted.find(r => r.type === 'end');

    const fallback = { 
      day: 0, 
      left: 0, 
      phase: 'Ready', 
      percent: 0, 
      nextDate: 'TBD', 
      isPeriod: false, 
      dayInPeriod: 0, 
      color: 'bg-white/10' 
    };

    if (!lastStartRecord) return fallback;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let lastLoggedStart = new Date(lastStartRecord.date);
    lastLoggedStart.setHours(0, 0, 0, 0);

    // Project forward to the current cycle
    let currentCycleStart = new Date(lastLoggedStart);
    while (currentCycleStart.getTime() + (avgCycle * 24 * 3600 * 1000) <= today.getTime()) {
      currentCycleStart.setDate(currentCycleStart.getDate() + avgCycle);
    }

    let nextCycleStart = new Date(currentCycleStart);
    nextCycleStart.setDate(nextCycleStart.getDate() + avgCycle);

    const diffDays = Math.floor((today.getTime() - currentCycleStart.getTime()) / (1000 * 3600 * 24));
    const dayOfCycle = diffDays + 1;
    const daysUntilNext = Math.max(0, Math.floor((nextCycleStart.getTime() - today.getTime()) / (1000 * 3600 * 24)));

    const hasLoggedEndThisCycle = lastEndRecord && new Date(lastEndRecord.date) >= currentCycleStart;
    const isPeriodActive = !hasLoggedEndThisCycle && dayOfCycle <= avgPeriod;
    
    let phase = 'Follicular';
    let color = 'bg-emerald-400';
    
    if (isPeriodActive) {
      phase = 'Menstrual';
      color = 'bg-rose-500';
    } else if (dayOfCycle >= 12 && dayOfCycle <= 16) {
      phase = 'Ovulation';
      color = 'bg-amber-400';
    } else if (dayOfCycle > 16) {
      phase = 'Luteal';
      color = 'bg-indigo-400';
    }

    return { 
      day: dayOfCycle, 
      left: daysUntilNext, 
      phase, 
      nextDate: nextCycleStart.toLocaleDateString('en-AU', { month: 'short', day: 'numeric' }), 
      isPeriod: isPeriodActive,
      dayInPeriod: dayOfCycle,
      color
    };
  }, [records, avgCycle, avgPeriod]);

  const handleLog = (type: 'start' | 'end', dateStr: string) => {
    if (!dateStr) return;
    setRecords([...records, { id: Date.now().toString(), date: dateStr, type }]);
  };

  const removeRecord = (id: string) => setRecords(records.filter(r => r.id !== id));

  const narrative = useMemo(() => {
    if (stats.isPeriod) {
      return {
        number: stats.dayInPeriod,
        label: `Day of Period`
      };
    }
    if (stats.left <= 0) {
      return { number: 0, label: "Period Expected" };
    }
    return {
      number: stats.left,
      label: `Days left to Period`
    };
  }, [stats]);

  const renderDottedProgress = () => {
    const totalDots = 28;
    const activeDotIndex = Math.floor(((stats.day - 1) / avgCycle) * totalDots);
    return (
      <div className="flex justify-between gap-1 mt-3">
        {Array.from({ length: totalDots }).map((_, i) => (
          <div 
            key={i} 
            className={`h-[4px] flex-1 rounded-full transition-all duration-700 
              ${i <= activeDotIndex ? stats.color : 'bg-white/10'} 
              ${i === activeDotIndex ? 'animate-aura-glow opacity-100 scale-y-150' : 'opacity-80'}
            `}
          />
        ))}
      </div>
    );
  };

  const getTextColor = (bgColor: string) => bgColor.replace('bg-', 'text-');
  const showStartBtn = !stats.isPeriod && (stats.left <= 0 || stats.day >= avgCycle - 2);
  const showEndBtn = stats.isPeriod;

  return (
    <>
      <div 
        onClick={() => setIsModalOpen(true)}
        className="ios-glass p-[clamp(1rem,2.5vw,1.5rem)] h-full flex flex-col justify-between cursor-pointer group hover:bg-white/10 transition-all active:scale-[0.98] overflow-hidden relative"
      >
        <div className="flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2.5">
            <div className={`w-3 h-3 rounded-full ${stats.color} shadow-[0_0_12px_rgba(255,255,255,0.3)] animate-pulse`} />
            <h3 className="text-[clamp(0.9rem,1.5vw,1.1rem)] font-black text-white/95 tracking-tight">Cycle Hub</h3>
          </div>
          <div className={`px-2.5 py-1 rounded-full border border-white/10 backdrop-blur-xl shadow-sm transition-all duration-500 ${getTextColor(stats.color)} bg-white/5`}>
            <span className="text-[8px] font-black uppercase tracking-[0.15em]">{stats.phase}</span>
          </div>
        </div>

        <div className="flex flex-row items-baseline gap-3 mt-4 mb-2">
          <span className="text-5xl font-black tracking-tighter text-white digital-number leading-none">
            {narrative.number}
          </span>
          <span className="text-[11px] font-black uppercase tracking-[0.1em] text-white/40 whitespace-nowrap">
            {narrative.label}
          </span>
        </div>

        <div className="space-y-3 shrink-0">
          <div className="flex justify-between items-end">
             <div className="flex flex-col">
                <span className="text-[8px] font-black uppercase tracking-widest opacity-30 mb-1">Expected Next</span>
                <span className="text-sm font-black text-white/90 tracking-tight leading-none">{stats.nextDate}</span>
             </div>
             
             {showEndBtn && (
               <button onClick={(e) => { e.stopPropagation(); handleLog('end', getTodayStr()); }} className="px-4 py-2 rounded-xl bg-rose-500 text-white text-[9px] font-black uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-lg flex items-center gap-2">
                 <i className="fa-solid fa-stop text-[8px]"></i> End Period
               </button>
             )}

             {showStartBtn && (
               <button onClick={(e) => { e.stopPropagation(); handleLog('start', getTodayStr()); }} className="px-4 py-2 rounded-xl bg-indigo-500 text-white text-[9px] font-black uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-lg flex items-center gap-2">
                 <i className="fa-solid fa-play text-[8px]"></i> Start Period
               </button>
             )}
          </div>
          {renderDottedProgress()}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-black/40 backdrop-blur-[25px] animate-in fade-in" onClick={() => setIsModalOpen(false)}>
          <div className="w-full max-w-2xl p-10 rounded-[3.5rem] !bg-black/60 backdrop-blur-[25px] shadow-2xl border border-white/20 flex flex-col gap-8 max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black text-white tracking-tighter">Cycle Management</h2>
                <div className="flex gap-4 mt-2">
                  <span className={`text-[10px] font-black uppercase tracking-widest ${hasHistory ? 'text-indigo-400' : 'text-white/50'}`}>
                    Avg Cycle: {avgCycle} Days {hasHistory && '(Auto)'}
                  </span>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${hasHistory ? 'text-indigo-400' : 'text-white/50'}`}>
                    Avg Period: {avgPeriod} Days {hasHistory && '(Auto)'}
                  </span>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="w-12 h-12 rounded-3xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all border border-white/10"><i className="fa-solid fa-xmark text-lg"></i></button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-20 overflow-visible">
              {/* Added relative z-20 to ensure date picker popup stays above siblings */}
              <div className="ios-glass p-8 rounded-[2.5rem] flex flex-col gap-6 !bg-white/5 !border-white/10 relative z-20">
                <h4 className="text-[11px] font-black uppercase tracking-widest text-white/70">Log Activity</h4>
                <div className="space-y-6">
                  <GlassDatePicker label="Log Date" value={formDate} onChange={setFormDate} />
                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => handleLog('start', formDate)} className="flex flex-col items-center justify-center py-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[10px] font-black uppercase tracking-widest hover:bg-rose-500/20 transition-all active:scale-95"><span>Started</span><span>Period</span></button>
                    <button onClick={() => handleLog('end', formDate)} className="flex flex-col items-center justify-center py-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500/20 transition-all active:scale-95"><span>Ended</span><span>Period</span></button>
                  </div>
                </div>
              </div>

              {/* Added relative z-10 to ensure it stays below the Log Activity card's popups */}
              <div className="ios-glass p-8 rounded-[2.5rem] space-y-8 !bg-white/5 !border-white/10 relative z-10">
                <h4 className="text-[11px] font-black uppercase tracking-widest text-white/70">Settings</h4>
                <div className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex justify-between items-end"><span className="text-[11px] font-black text-white/30 uppercase tracking-widest">Cycle Duration</span><span className="text-lg font-black text-rose-400">{manualAvgCycle}d</span></div>
                    <input type="range" min="20" max="45" value={manualAvgCycle} onChange={e => setManualAvgCycle(parseInt(e.target.value))} className="w-full h-1.5 bg-white/5 rounded-full appearance-none accent-rose-500 cursor-pointer" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-end"><span className="text-[11px] font-black text-white/30 uppercase tracking-widest">Period Duration</span><span className="text-lg font-black text-rose-400">{manualAvgPeriod}d</span></div>
                    <input type="range" min="2" max="14" value={manualAvgPeriod} onChange={e => setManualAvgPeriod(parseInt(e.target.value))} className="w-full h-1.5 bg-white/5 rounded-full appearance-none accent-rose-500 cursor-pointer" />
                  </div>
                </div>
              </div>
            </div>

            <div className="ios-glass rounded-[2.5rem] flex-1 min-h-0 flex flex-col overflow-hidden !bg-white/5 !border-white/10">
              <div className="p-5 bg-white/5 border-b border-white/10 flex justify-between items-center shrink-0">
                <span className="text-[11px] font-black uppercase tracking-widest text-white/70">Record History</span>
              </div>
              <div className="flex-1 overflow-y-auto scrollbar-hide p-4 divide-y divide-white/5">
                {[...records].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(record => (
                  <div key={record.id} className="flex items-center justify-between py-4 px-2 hover:bg-white/5 transition-all group rounded-2xl">
                    <div className="flex items-center gap-5">
                      <div className={`w-2.5 h-2.5 rounded-full shadow-lg ${record.type === 'start' ? 'bg-rose-500' : 'bg-indigo-400'}`} />
                      <div>
                        <p className="text-sm font-black text-white/90">{new Date(record.date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                        <p className={`text-[9px] font-black uppercase tracking-widest ${record.type === 'start' ? 'text-rose-400' : 'text-indigo-400'}`}>{record.type === 'start' ? 'Period Started' : 'Period Ended'}</p>
                      </div>
                    </div>
                    <button onClick={() => removeRecord(record.id)} className="opacity-0 group-hover:opacity-100 w-10 h-10 rounded-xl hover:bg-white/10 text-white/20 hover:text-rose-400 transition-all flex items-center justify-center"><i className="fa-solid fa-trash-can text-sm"></i></button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default HealthWidget;
