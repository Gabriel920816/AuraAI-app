import React, { useState, useEffect, useMemo, useRef } from 'react';
import { generateHoroscope, getZodiacSign } from '../geminiService';
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

const POPULAR_CITIES = [
  { name: 'Sydney', country: 'AU', lat: -33.8688, lon: 151.2093, icon: 'fa-bridge' },
  { name: 'Tokyo', country: 'JP', lat: 35.6895, lon: 139.6917, icon: 'fa-torii-gate' },
  { name: 'London', country: 'UK', lat: 51.5074, lon: -0.1278, icon: 'fa-landmark' },
  { name: 'New York', country: 'US', lat: 40.7128, lon: -74.0060, icon: 'fa-city' },
  { name: 'Beijing', country: 'CN', lat: 39.9042, lon: 116.4074, icon: 'fa-archway' },
  { name: 'Malaysia', country: 'MY', lat: 3.1390, lon: 101.6869, icon: 'fa-tower-broadcast' },
];

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
  const [y, m, d] = value ? value.split('-').map(Number) : [2000, 1, 1];
  const years = Array.from({ length: 100 }, (_, i) => 2024 - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const daysInMonth = new Date(y, m, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const update = (ny = y, nm = m, nd = d) => { onChange(`${ny}-${String(nm).padStart(2, '0')}:${String(nd).padStart(2, '0')}`); };
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
}

const HeaderWidgets: React.FC<HeaderWidgetsProps> = ({ showHealth, setShowHealth, setBgImage, weatherData, onSetLocation }) => {
  const [horoscope, setHoroscope] = useState<HoroscopeData | null>(null);
  const [birthDate, setBirthDate] = useState<string>(localStorage.getItem('aura_birthdate') || '');
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

  const fetchHoroscope = async (date: string, force = false) => {
    if (!date) return;
    setIsSyncing(true);
    const sign = getZodiacSign(date);
    try {
      const data = await generateHoroscope(sign, date, force);
      setHoroscope({ ...data, sign });
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => { 
    const storedDate = localStorage.getItem('aura_birthdate');
    if (storedDate) fetchHoroscope(storedDate);
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }
      try {
        const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchQuery)}&count=5&language=en&format=json`);
        const data = await res.json();
        setSearchResults(data.results || []);
      } catch (e) {}
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const useCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onSetLocation(pos.coords.latitude, pos.coords.longitude, 'Nearby');
        setShowSearch(false);
      },
      (err) => console.error("Location access denied", err)
    );
  };

  const weatherConfig = useMemo(() => {
    const t = weatherData?.temp ?? 20;
    const cond = weatherData?.condition || 'Clear';
    const percent = Math.min(Math.max(((t + 10) / 50) * 100, 5), 100);
    let thermalColor = '#FBBF24';
    if (t > 30) thermalColor = '#FB923C';
    else if (t < 15) thermalColor = '#7DD3FC';
    return { thermalColor, percent, condition: cond, tColor: t > 30 ? 'text-orange-400' : (t < 15 ? 'text-sky-300' : 'text-amber-400') };
  }, [weatherData]);

  const BACKGROUND_OPTIONS = [
    { name: 'Alpine Lake', url: 'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=2560' },
    { name: 'Snow Peak', url: 'https://images.pexels.com/photos/1287145/pexels-photo-1287145.jpeg?auto=compress&cs=tinysrgb&w=2560' },
    { name: 'Cosmic Nebula', url: 'https://images.pexels.com/photos/2150/sky-space-dark-galaxy.jpg?auto=compress&cs=tinysrgb&w=2560' },
    { name: 'Stormy Ocean', url: 'https://images.pexels.com/photos/1533720/pexels-photo-1533720.jpeg?auto=compress&cs=tinysrgb&w=2560' }
  ];

  return (
    <header className="flex flex-col lg:flex-row justify-between items-center gap-4 shrink-0 overflow-visible relative z-[500] h-14">
      {/* Left Section - Unified Brand Identifier, shifted left slightly as requested */}
      <div className="flex items-center gap-8 shrink-0 w-full lg:w-auto overflow-visible ml-0 lg:ml-10 transition-all duration-1000 ease-in-out">
        <div className="flex items-center select-none group cursor-default">
          {/* Internal spacing unit: 0.2em */}
          <span className="text-[1.85rem] font-[100] tracking-[0.2em] text-white uppercase opacity-95 leading-none translate-y-[1px]">A</span>
          
          {/* Orb container: uses mr-[0.2em] to match the tracking distance of the letters */}
          <div className="relative w-[1.7rem] h-[1.7rem] thick-glass-orb rounded-full shrink-0 mr-[0.2em] overflow-visible">
            <div className="w-[6px] h-[6px] bg-white rounded-full animate-aura-core z-20"></div>
            <div className="w-[6px] h-[6px] bg-white rounded-full animate-aura-halo z-10"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent w-[200%] h-full animate-orb-sheen pointer-events-none z-30 rounded-full"></div>
          </div>
          
          <span className="text-[1.85rem] font-[100] tracking-[0.2em] text-white uppercase opacity-95 leading-none translate-y-[1px]">RA</span>
        </div>

        <div className="hidden lg:block h-6 w-px bg-white/10 mx-2"></div>

        <div className="flex gap-3 py-1 items-center overflow-visible">
            <button onClick={() => setShowHealth(!showHealth)} className={`flex items-center gap-2 px-4 py-1.5 ios-glass transition-all shrink-0 h-10 ${showHealth ? 'bg-rose-500/20 border-rose-500/40 text-rose-300 opacity-100' : 'opacity-60 hover:opacity-100'}`}>
              <i className="fa-solid fa-droplet text-[10px]"></i>
              <span className="text-[9px] font-black uppercase tracking-widest hidden md:inline">Health</span>
            </button>
            
            <div className="relative shrink-0 overflow-visible" ref={bgPickerRef}>
                <button onClick={() => setShowBgPicker(!showBgPicker)} className={`w-10 h-10 ios-glass flex items-center justify-center transition-all ${showBgPicker ? 'bg-white/20 border-white/40 text-white scale-105 opacity-100' : 'opacity-60 hover:opacity-100'}`}>
                  <i className="fa-solid fa-palette text-[10px]"></i>
                </button>
                {showBgPicker && (
                  <div className="absolute top-full left-0 mt-4 p-5 ios-glass z-[9999] w-72 shadow-2xl animate-in fade-in slide-in-from-top-2 border border-white/10">
                    <h4 className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-3 px-1">Ambience Themes</h4>
                    <div className="grid grid-cols-2 gap-3">
                        {BACKGROUND_OPTIONS.map((bg, i) => (
                            <button key={i} onClick={() => { setBgImage(bg.url); setShowBgPicker(false); }} className="group relative h-24 rounded-2xl overflow-hidden border border-white/10 hover:border-white/50 transition-all bg-white/5">
                                <img src={bg.url} alt={bg.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><span className="text-[9px] font-black uppercase text-white tracking-widest">{bg.name}</span></div>
                            </button>
                        ))}
                    </div>
                  </div>
                )}
            </div>
        </div>
      </div>

      <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 top-0 h-full items-center justify-center z-[-1]">
        <BigClock />
      </div>

      <div className="flex flex-wrap items-center justify-center lg:justify-end gap-2.5 flex-1 w-full lg:auto overflow-visible pr-0 lg:pr-6">
        <div className="ios-glass px-4 py-1.5 h-10 flex items-center shrink-0"><FocusWidget isCompact /></div>
        
        <div className="relative overflow-visible" ref={containerRef}>
          <div onClick={() => setShowSearch(!showSearch)} className="ios-glass px-3.5 py-1.5 h-10 flex items-center gap-2.5 cursor-pointer hover:bg-white/10 transition-all shrink-0">
            <WeatherIcon condition={weatherConfig.condition} />
            <div className="flex flex-col min-w-[2rem]">
              <span className={`text-[1.1rem] font-black digital-number leading-none ${weatherConfig.tColor}`}>{weatherData?.temp ?? '--'}°</span>
              <div className="w-full h-[2.5px] bg-white/10 rounded-full overflow-hidden mt-0.5"><div className="h-full transition-all duration-1000" style={{ width: `${weatherConfig.percent}%`, backgroundColor: weatherConfig.thermalColor }}></div></div>
            </div>
            <div className="h-4 w-px bg-white/10 mx-0.5"></div>
            <div className="flex flex-col">
              <span className="text-[9px] font-black uppercase text-white/90 leading-none truncate max-w-[50px]">{weatherData?.condition}</span>
              <span className="text-[7px] font-black opacity-30 uppercase tracking-widest mt-0.5 max-w-[50px] truncate">{weatherData?.location}</span>
            </div>
            <i className="fa-solid fa-magnifying-glass text-[9px] opacity-20 ml-1"></i>
          </div>

          {showSearch && (
            <div className="absolute top-full right-0 mt-4 p-6 ios-glass z-[9999] w-80 animate-in fade-in zoom-in-95 duration-300 shadow-2xl border border-white/10">
              <div className="flex gap-2 mb-6">
                <div className="relative flex-1">
                  <input autoFocus placeholder="Explore City..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl pl-10 pr-4 py-3 text-sm text-white outline-none focus:bg-white/10 focus:border-white/30 transition-all font-bold placeholder:text-white/20" />
                  <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-[10px]"></i>
                </div>
                <button onClick={useCurrentLocation} className="w-12 h-12 ios-glass bg-white/5 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 border border-white/10 transition-all active:scale-95 shrink-0" title="Use Current Location"><i className="fa-solid fa-location-crosshairs text-sm"></i></button>
              </div>
              {searchQuery.length < 2 ? (
                <div>
                  <h5 className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 mb-3 px-1 flex items-center gap-2"><i className="fa-solid fa-earth-americas opacity-40"></i>Popular Destinations</h5>
                  <div className="flex flex-wrap gap-2">
                    {POPULAR_CITIES.map((city) => (
                      <button key={city.name} onClick={() => { onSetLocation(city.lat, city.lon, city.name); setShowSearch(false); }} className="px-3 py-2 rounded-xl ios-glass bg-white/5 hover:bg-white/15 border border-white/10 hover:border-white/30 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95 group"><i className={`fa-solid ${city.icon} opacity-40 group-hover:opacity-100 group-hover:text-indigo-400 transition-all`}></i>{city.name}</button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-2 max-h-[250px] overflow-y-auto scrollbar-hide px-1 animate-in fade-in duration-300">
                  {searchResults.length > 0 ? searchResults.map((res, i) => (
                    <button key={i} onClick={() => { onSetLocation(res.latitude, res.longitude, res.name); setShowSearch(false); setSearchQuery(''); }} className="w-full p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/30 text-left transition-all group flex items-center justify-between">
                      <div><p className="text-[12px] font-black text-white group-hover:text-indigo-300 transition-colors">{res.name}</p><p className="text-[9px] opacity-30 uppercase tracking-widest mt-0.5">{res.country || res.country_code}</p></div><i className="fa-solid fa-location-dot text-[10px] text-indigo-400 opacity-0 group-hover:opacity-100 transition-all"></i>
                    </button>
                  )) : <div className="py-8 text-center opacity-20 flex flex-col items-center gap-2"><i className="fa-solid fa-circle-notch animate-spin text-xl"></i><p className="text-[10px] font-black uppercase tracking-widest">Searching...</p></div>}
                </div>
              )}
            </div>
          )}
        </div>

        <div onClick={() => setIsModalOpen(true)} className="ios-glass px-4 py-1.5 h-10 flex items-center gap-3.5 cursor-pointer hover:bg-white/10 transition-all shrink-0 w-auto">
          {isSyncing ? (
            <div className="flex items-center gap-2 opacity-30"><div className="w-3 h-3 border-2 border-white/40 border-t-transparent rounded-full animate-spin"></div><span className="text-[10px] font-black uppercase tracking-widest">Updating...</span></div>
          ) : !horoscope ? (
            <div className="flex items-center gap-2 text-white"><i className="fa-solid fa-sparkles text-[10px] text-white"></i><span className="text-[10px] font-black uppercase tracking-widest text-white">Horoscope</span></div>
          ) : (
            <>
              <div className="translate-y-0.5"><ZodiacSVG sign={horoscope?.sign || 'Aries'} size={24} /></div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-black text-white leading-none tracking-tight whitespace-nowrap overflow-hidden text-ellipsis max-w-[80px]">{horoscope?.summary || 'Stable'}</span>
                <span className="text-[8px] font-black opacity-30 uppercase tracking-widest mt-0.5 whitespace-nowrap">{horoscope?.sign}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-[25px] animate-in fade-in duration-300" onClick={() => setIsModalOpen(false)}>
          <div className="w-full max-w-[420px] p-8 md:p-10 rounded-[3.5rem] ios-glass border border-white/20 shadow-2xl flex flex-col gap-6 relative overflow-visible max-h-[90vh] overflow-y-auto scrollbar-hide" onClick={e => e.stopPropagation()}>
            <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all z-10"><i className="fa-solid fa-xmark text-white/40 text-xs"></i></button>
            {!horoscope ? (
              <div className="py-6 flex flex-col items-center gap-6 text-center animate-in zoom-in-95 duration-500">
                <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center border border-indigo-500/20"><i className="fa-solid fa-sparkles text-3xl text-indigo-400"></i></div>
                <div>
                  <h2 className="text-2xl font-black text-white tracking-tighter mb-2">Daily Horoscope</h2>
                  <p className="text-[11px] text-white/40 leading-relaxed max-w-[240px] mx-auto">Select your birthday to get your horoscope for today.</p>
                </div>
                <div className="w-full"><GlassTripleDropdown value={birthDate} onChange={setBirthDate} /></div>
                <button disabled={isSyncing} onClick={() => { if (birthDate) { localStorage.setItem('aura_birthdate', birthDate); fetchHoroscope(birthDate); } }} className="w-full py-4 bg-indigo-600 rounded-2xl text-[10px] font-black uppercase tracking-[0.4em] shadow-xl hover:brightness-110 active:scale-95 transition-all text-white flex items-center justify-center gap-3">
                  {isSyncing ? <><div className="w-3 h-3 border-2 border-white/40 border-t-transparent rounded-full animate-spin"></div><span>Loading...</span></> : "Show Horoscope"}
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-5">
                  <div className="w-24 h-24 rounded-[2.5rem] bg-white/5 border border-white/10 flex items-center justify-center shadow-2xl shrink-0 relative"><div className="scale-110 translate-y-2"><ZodiacSVG sign={horoscope?.sign || 'Aries'} size={64} glow={true} /></div></div>
                  <div className="flex-1 min-w-0"><h2 className="text-3xl font-black text-white tracking-tighter leading-none truncate">{horoscope?.sign}</h2><p className="text-[9px] font-black opacity-30 uppercase tracking-[0.2em] mt-2">Today's Theme: <span className="text-white/80">{horoscope?.summary}</span></p></div>
                </div>
                <div className="space-y-3"><div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent"></div><p className="text-[13px] font-medium leading-snug text-white/90 italic tracking-tight py-1 min-h-[60px]">"{horoscope?.prediction}"</p></div>
                
                <div className="p-5 rounded-[2rem] bg-white/10 border border-white/10 flex flex-wrap justify-between gap-x-4 gap-y-2">
                    {[{ label: 'Love', val: horoscope?.ratings.love }, { label: 'Work', val: horoscope?.ratings.work }, { label: 'Health', val: horoscope?.ratings.health }, { label: 'Wealth', val: horoscope?.ratings.wealth }].map(r => (
                      <div key={r.label} className="flex justify-between items-center w-[45%]"><span className="text-[8px] font-black uppercase tracking-widest text-white/30">{r.label}</span><StarRating value={r.val || 0} /></div>
                    ))}
                </div>

                {horoscope.sources && horoscope.sources.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center gap-2"><i className="fa-solid fa-link"></i> Sources</h4>
                    <div className="flex flex-col gap-2">
                      {horoscope.sources.slice(0, 3).map((source, idx) => (
                        <a key={idx} href={source.uri} target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group">
                          <span className="text-[10px] font-bold text-white/70 truncate pr-4 group-hover:text-indigo-300 transition-colors">{source.title}</span>
                          <i className="fa-solid fa-arrow-up-right-from-square text-[8px] text-white/20 group-hover:text-white transition-all"></i>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-white/10 flex flex-col gap-5">
                   <div className="flex justify-between items-center px-1">
                      <span className="text-[9px] font-black uppercase tracking-widest text-white/30">Birthday Settings</span>
                      <button disabled={isSyncing} onClick={() => fetchHoroscope(birthDate, true)} className="text-indigo-400 text-[9px] font-black uppercase hover:text-white transition-all flex items-center gap-2">
                        {isSyncing && <div className="w-2 h-2 border border-current border-t-transparent rounded-full animate-spin"></div>}Refresh
                      </button>
                   </div>
                   <div className="flex justify-center w-full"><GlassTripleDropdown value={birthDate} onChange={(val) => { setBirthDate(val); localStorage.setItem('aura_birthdate', val); }} /></div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default HeaderWidgets;