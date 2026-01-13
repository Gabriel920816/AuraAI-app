
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { HoroscopeData } from '../types';
import FocusWidget from './widgets/FocusWidget';
import WeatherIcon from './WeatherIcon';
import BigClock from './widgets/BigClock';

const ZODIAC_META: Record<string, { color: string; path: string }> = {
  Aries: { color: '#FF4136', path: "M7 2a5 5 0 0 1 10 0v2l-5 4-5-4V2zm0 20v-8l5 4 5-4v8H7z" },
  Taurus: { color: '#2ECC40', path: "M12 2a5 5 0 0 0-5 5v3a7 7 0 0 0 10 0V7a5 5 0 0 0-5-5zm5 11H7v2h10v-2z" },
  Gemini: { color: '#FFDC00', path: "M9 2v20M15 2v20M5 4h14M5 20h14" },
  Cancer: { color: '#7FDBFF', path: "M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 15a5 5 0 1 1 5-5 5 5 0 0 1-5 5z" },
  Leo: { color: '#FF851B', path: "M12 2c4 0 7 3 7 7s-3 7-7 7-7-3-7-7 3-7 7-7zm0 11a4 4 0 1 0-4-4 4 4 0 0 0 4 4z" },
  Virgo: { color: '#B10DC9', path: "M18 2v10a6 6 0 0 1-12 0V2h2v10a4 4 0 0 0 8 0V2h2z" },
  Libra: { color: '#F012BE', path: "M2 20h20M5 15h14M12 4v11" },
  Scorpio: { color: '#85144B', path: "M4 4v12l8 4l8-4V4M12 4v11" },
  Sagittarius: { color: '#FF4136', path: "M22 2L12 12M22 2h-8M22 2v8M3 21l9-9" },
  Capricorn: { color: '#AAAAAA', path: "M12 2L2 7v10l10 5l10-5V7l12-5z" },
  Aquarius: { color: '#0074D9', path: "M2 6l5 4l5-4l5 4l5-4M2 14l5 4l5-4l5 4l5-4" },
  Pisces: { color: '#39CCCC', path: "M12 2c5 0 5 10 5 10s0 10-5 10-5-10-5-10 0-10 5-10z" },
};

const ZodiacSVG = ({ sign, size = 24, glow = true }: { sign: string; size?: number, glow?: boolean }) => {
  const meta = ZODIAC_META[sign] || ZODIAC_META.Aries;
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className="fill-none stroke-current animate-in zoom-in-50 duration-700 block" style={{ color: meta.color, filter: glow ? `drop-shadow(0 0 25px ${meta.color}) drop-shadow(0 0 5px ${meta.color})` : 'none' }} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={meta.path} />
    </svg>
  );
};

const StarRating = ({ value }: { value: number }) => (
  <div className="flex gap-0.5">
    {Array.from({ length: 5 }).map((_, i) => {
      const diff = value - i;
      const icon = diff >= 1 ? 'fa-star' : (diff >= 0.5 ? 'fa-star-half-stroke' : 'fa-star');
      const active = diff > 0;
      return <i key={i} className={`fa-solid ${icon} text-[10px] ${active ? 'text-amber-400' : 'text-white/10'}`}></i>;
    })}
  </div>
);

const GlassSelect = ({ value, options, onChange, label }: { value: number, options: number[], onChange: (v: number) => void, label: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClick = (e: MouseEvent) => { if (selectRef.current && !selectRef.current.contains(e.target as Node)) setIsOpen(false); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);
  return (
    <div className="flex-1 flex flex-col gap-1.5 relative" ref={selectRef}>
      <span className="text-[9px] font-black uppercase tracking-widest text-white/40 text-center">{label}</span>
      <div onClick={() => setIsOpen(!isOpen)} className="bg-white/5 border border-white/10 rounded-2xl p-2.5 text-xs font-bold text-white outline-none hover:bg-white/10 transition-all cursor-pointer text-center select-none">{value}</div>
      {isOpen && (
        <div className="absolute bottom-full left-0 right-0 mb-2 z-[2000] bg-zinc-950/95 backdrop-blur-3xl rounded-[1.8rem] overflow-hidden p-1.5 shadow-2xl border border-white/20 max-h-40 overflow-y-auto scrollbar-hide animate-in slide-in-from-bottom-2 fade-in">
          {options.map(opt => (<div key={opt} onClick={() => { onChange(opt); setIsOpen(false); }} className={`p-2 text-center text-[10px] font-bold rounded-xl cursor-pointer transition-all ${value === opt ? 'bg-indigo-500 text-white' : 'text-white/60 hover:bg-white/10 hover:text-white'}`}>{opt}</div>))}
        </div>
      )}
    </div>
  );
};

const GlassTripleDropdown = ({ value, onChange }: { value: string, onChange: (val: string) => void }) => {
  const parts = value ? value.split('-') : [];
  const y = parts[0] ? parseInt(parts[0]) : 2000;
  const m = parts[1] ? parseInt(parts[1]) : 1;
  const d = parts[2] ? parseInt(parts[2]) : 1;
  const years = Array.from({ length: 100 }, (_, i) => 2024 - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const daysInMonth = new Date(y, m, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const update = (ny = y, nm = m, nd = d) => { onChange(`${ny}-${String(nm).padStart(2, '0')}-${String(nd).padStart(2, '0')}`); };
  return (
    <div className="flex gap-2 w-full">
      <GlassSelect value={y} options={years} onChange={(val) => update(val, m, d)} label="Year" />
      <GlassSelect value={m} options={months} onChange={(val) => update(y, val, d)} label="Month" />
      <GlassSelect value={d} options={days} onChange={(val) => update(y, m, val)} label="Day" />
    </div>
  );
};

interface HeaderWidgetsProps {
  showHealth: boolean;
  setShowHealth: (val: boolean) => void;
  setBgImage: (url: string) => void;
  weatherData?: { temp: number, code: number, condition: string, location: string };
  onSetLocation: (lat: number, lon: number, name: string) => void;
  horoscope: HoroscopeData | null;
  onRefreshHoroscope: (date: string, force?: boolean) => void;
}

const HeaderWidgets: React.FC<HeaderWidgetsProps> = ({ 
  showHealth, setShowHealth, setBgImage, weatherData, onSetLocation,
  horoscope, onRefreshHoroscope 
}) => {
  const [birthDate, setBirthDate] = useState<string>(localStorage.getItem('aura_birthdate') || '2000-01-01');
  const [isSyncing, setIsSyncing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showBgPicker, setShowBgPicker] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const bgPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setShowSearch(false);
      if (bgPickerRef.current && !bgPickerRef.current.contains(e.target as Node)) setShowBgPicker(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => { document.removeEventListener('mousedown', handleClickOutside); };
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length < 2) { setSearchResults([]); return; }
      try {
        const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchQuery)}&count=5&language=en&format=json`);
        const data = await res.json();
        setSearchResults(data.results || []);
      } catch (e) {}
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleFetchHoroscope = async (date: string, force = false) => {
    setIsSyncing(true);
    await onRefreshHoroscope(date, force);
    setIsSyncing(false);
  };

  const isLimitReached = horoscope?.summary === "Limit Reached";

  return (
    <header className="flex flex-col lg:flex-row justify-between items-center gap-4 shrink-0 overflow-visible relative z-[500] h-14">
      <div className="flex items-center gap-8 shrink-0 w-full lg:w-auto overflow-visible ml-0 lg:ml-10">
        <div className="flex items-center select-none group cursor-default">
          <span className="text-[1.85rem] font-[100] tracking-[0.2em] text-white uppercase opacity-95">A</span>
          <div className="relative w-[1.7rem] h-[1.7rem] thick-glass-orb rounded-full shrink-0 mr-[0.2em]">
            <div className="w-[6px] h-[6px] bg-white rounded-full animate-aura-core z-20"></div>
            <div className="w-[6px] h-[6px] bg-white rounded-full animate-aura-halo z-10"></div>
          </div>
          <span className="text-[1.85rem] font-[100] tracking-[0.2em] text-white uppercase opacity-95">RA</span>
        </div>
        <div className="flex gap-3 py-1 items-center">
            <button onClick={() => setShowHealth(!showHealth)} className={`flex items-center gap-2 px-4 py-1.5 ios-glass h-10 ${showHealth ? 'bg-rose-500/20 border-rose-500/40 text-rose-300' : 'opacity-60'}`}>
              <i className="fa-solid fa-droplet text-[10px]"></i>
              <span className="text-[9px] font-black uppercase hidden md:inline">Health</span>
            </button>
            <button onClick={() => setShowBgPicker(!showBgPicker)} className="w-10 h-10 ios-glass flex items-center justify-center opacity-60"><i className="fa-solid fa-palette text-[10px]"></i></button>
        </div>
      </div>

      <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 top-0 h-full items-center justify-center z-[-1]"><BigClock /></div>

      <div className="flex flex-wrap items-center justify-center lg:justify-end gap-2.5 flex-1 w-full lg:auto">
        <div className="ios-glass px-4 py-1.5 h-10 flex items-center shrink-0"><FocusWidget isCompact /></div>
        
        <div onClick={() => setIsModalOpen(true)} className={`ios-glass px-4 py-1.5 h-10 flex items-center gap-3.5 cursor-pointer hover:bg-white/10 transition-all ${isLimitReached ? 'border-amber-500/40' : ''}`}>
          {isSyncing ? (
            <div className="flex items-center gap-2 opacity-30"><div className="w-3 h-3 border-2 border-white/40 border-t-transparent rounded-full animate-spin"></div><span className="text-[10px] font-black uppercase tracking-widest">Updating...</span></div>
          ) : isLimitReached ? (
            <div className="flex items-center gap-2 text-amber-400"><i className="fa-solid fa-triangle-exclamation text-[10px]"></i><span className="text-[10px] font-black uppercase tracking-widest">Quota Full</span></div>
          ) : !horoscope ? (
            <div className="flex items-center gap-2 text-white"><i className="fa-solid fa-sparkles text-[10px]"></i><span className="text-[10px] font-black uppercase tracking-widest">Horoscope</span></div>
          ) : (
            <>
              <ZodiacSVG sign={horoscope?.sign || 'Aries'} size={24} />
              <div className="flex flex-col">
                <span className="text-sm font-black text-white leading-none truncate max-w-[80px]">{horoscope?.summary}</span>
                <span className="text-[8px] font-black opacity-30 uppercase">{horoscope?.sign}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-[25px] animate-in fade-in" onClick={() => setIsModalOpen(false)}>
          <div className="w-full max-w-[420px] p-8 md:p-10 rounded-[3.5rem] ios-glass border border-white/20 shadow-2xl relative max-h-[90vh] overflow-y-auto scrollbar-hide" onClick={e => e.stopPropagation()}>
            <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center"><i className="fa-solid fa-xmark text-white/40 text-xs"></i></button>
            
            {isLimitReached && (
              <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs font-bold leading-relaxed">
                <i className="fa-solid fa-circle-info mr-2"></i>
                Daily API quota exceeded. Free tier resets at 4:00 PM (Local). Aura is currently in battery-saving mode.
              </div>
            )}

            {!horoscope || isLimitReached ? (
              <div className="py-6 flex flex-col items-center gap-6 text-center">
                <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center"><i className="fa-solid fa-sparkles text-3xl text-indigo-400"></i></div>
                <h2 className="text-2xl font-black text-white tracking-tighter">Daily Horoscope</h2>
                <div className="w-full"><GlassTripleDropdown value={birthDate} onChange={setBirthDate} /></div>
                <button disabled={isSyncing} onClick={() => { if (birthDate) { localStorage.setItem('aura_birthdate', birthDate); handleFetchHoroscope(birthDate, true); } }} className="w-full py-4 ios-glass text-white text-[10px] font-black uppercase tracking-[0.4em]">
                  {isSyncing ? "Syncing..." : "Update Insight"}
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                <div className="flex items-center gap-5">
                  <div className="w-24 h-24 rounded-[2.5rem] bg-white/5 border border-white/10 flex items-center justify-center"><ZodiacSVG sign={horoscope?.sign || 'Aries'} size={64} /></div>
                  <div className="flex-1"><h2 className="text-3xl font-black text-white tracking-tighter leading-none">{horoscope?.sign}</h2><p className="text-[9px] font-black opacity-30 uppercase tracking-[0.2em] mt-2">Theme: {horoscope?.summary}</p></div>
                </div>
                <p className="text-[13px] font-medium leading-snug text-white/90 italic tracking-tight italic">"{horoscope?.prediction}"</p>
                <div className="p-5 rounded-[2rem] bg-white/10 border border-white/10 flex flex-wrap justify-between gap-x-4 gap-y-2">
                    {[{ label: 'Love', val: horoscope?.ratings.love }, { label: 'Work', val: horoscope?.ratings.work }, { label: 'Health', val: horoscope?.ratings.health }, { label: 'Wealth', val: horoscope?.ratings.wealth }].map(r => (
                      <div key={r.label} className="flex justify-between items-center w-[45%]"><span className="text-[8px] font-black uppercase text-white/30">{r.label}</span><StarRating value={r.val || 0} /></div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default HeaderWidgets;
