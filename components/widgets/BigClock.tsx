
import React, { useState, useEffect, useMemo } from 'react';

const BigClock: React.FC = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const clockParts = useMemo(() => {
    const timeStr = time.toLocaleTimeString('en-AU', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit', 
      hour12: true 
    });
    const [hms, period] = timeStr.split(' ');
    const [h, m, s] = hms.split(':');
    return { h, m, s, period };
  }, [time]);

  return (
    <div className="flex flex-col items-center justify-center select-none pointer-events-none">
      <div className="flex items-baseline gap-2">
        <div className="flex items-center gap-0.5 font-slim-tall text-[2.8rem] leading-none text-white/95">
          <span>{clockParts.h}</span>
          <span className="opacity-20 mx-0.5">:</span>
          <span>{clockParts.m}</span>
          <span className="text-[1.8rem] opacity-30 ml-2">{clockParts.s}</span>
        </div>
        <span className="text-[11px] font-[200] uppercase tracking-[0.3em] text-white/30 mb-1.5 ml-1">
          {clockParts.period}
        </span>
      </div>
    </div>
  );
};

export default BigClock;
