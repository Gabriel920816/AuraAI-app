
import React, { useState, useEffect } from 'react';
import { generateHoroscope, getZodiacSign } from '../../geminiService';

const InfoRow: React.FC = () => {
  const [horoscope, setHoroscope] = useState<any>(null);
  const birthDate = localStorage.getItem('aura_birthdate');

  useEffect(() => {
    if (birthDate) {
      const sign = getZodiacSign(birthDate);
      const cached = localStorage.getItem(`aura_horoscope_${sign}`);
      if (cached) {
        setHoroscope(JSON.parse(cached).data);
      }
    }
  }, [birthDate]);

  return (
    <div className="flex flex-wrap gap-4">
      {/* Weather Card */}
      <div className="ios-glass px-5 py-3 flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-sky-500/20 flex items-center justify-center">
            <i className="fa-solid fa-cloud-sun text-lg text-sky-400"></i>
        </div>
        <div>
          <p className="text-lg font-black leading-none tracking-tighter">Detected</p>
          <p className="text-[9px] opacity-40 uppercase font-black tracking-widest mt-1">Local Area</p>
        </div>
      </div>

      {/* Horoscope Card */}
      <div className="ios-glass px-5 py-3 flex items-center gap-4 group relative cursor-help">
        <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
            <i className="fa-solid fa-moon text-lg text-amber-400"></i>
        </div>
        <div>
          <p className="text-lg font-black leading-none tracking-tighter">{horoscope?.summary || 'Stable'}</p>
          <p className="text-[9px] opacity-40 uppercase font-black tracking-widest mt-1">{birthDate ? getZodiacSign(birthDate) : 'Sync Vibe'}</p>
        </div>
        
        {horoscope && (
            <div className="absolute top-full mt-4 left-0 w-72 p-6 heavy-frost rounded-[2rem] shadow-2xl opacity-0 group-hover:opacity-100 transition-all z-[999] pointer-events-none scale-95 group-hover:scale-100 origin-top-left border border-white/20">
                <p className="text-xs leading-relaxed text-white/90">{horoscope.prediction}</p>
                <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
                   <span className="text-[9px] font-black opacity-40 uppercase tracking-widest">Lucky: {horoscope.luckyNumber}</span>
                   <i className="fa-solid fa-stars text-amber-400"></i>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default InfoRow;
