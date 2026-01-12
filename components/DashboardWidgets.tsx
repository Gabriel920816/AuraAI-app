
import React, { useState, useEffect } from 'react';
import { generateHoroscope, getZodiacSign } from '../geminiService';
import { HoroscopeData } from '../types';

const DashboardWidgets: React.FC = () => {
  const [horoscope, setHoroscope] = useState<HoroscopeData | null>(null);
  const birthDate = localStorage.getItem('aura_birthdate');

  useEffect(() => {
    if (birthDate) {
      const sign = getZodiacSign(birthDate);
      generateHoroscope(sign, birthDate).then(data => {
        setHoroscope({ sign, ...data });
      }).catch(err => {
        console.error("Dashboard Horoscope error", err);
      });
    }
  }, [birthDate]);

  return (
    <div className="flex items-center gap-2 md:gap-4">
      {/* Weather Info (Simplified) */}
      <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-sky-50/10 text-sky-200 rounded-full text-xs font-bold border border-white/10">
        <i className="fa-solid fa-cloud-sun text-[10px]"></i>
        <span>Live</span>
      </div>

      {/* Horoscope Badge */}
      <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-amber-50/10 text-amber-200 rounded-full text-xs font-bold border border-white/10 cursor-help group relative">
        <i className="fa-solid fa-moon text-[10px]"></i>
        <span>{horoscope ? horoscope.summary : 'Sync Vibe'}</span>
        {horoscope && (
          <div className="absolute top-full mt-2 right-0 w-64 p-4 heavy-frost border border-white/20 rounded-2xl shadow-xl z-[200] opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
            <p className="font-bold mb-1 uppercase tracking-widest text-[10px] opacity-50">{horoscope.sign} Daily</p>
            <p className="text-[11px] text-white/80 leading-relaxed">{horoscope.prediction}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardWidgets;
