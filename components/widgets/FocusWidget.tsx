
import React, { useState, useEffect } from 'react';

interface FocusWidgetProps {
  isCompact?: boolean;
}

const FocusWidget: React.FC<FocusWidgetProps> = ({ isCompact }) => {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let t: any;
    if (isActive && timeLeft > 0) t = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    else if (timeLeft === 0) {
      setIsActive(false);
      try { new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3').play(); } catch(e){}
    }
    return () => clearInterval(t);
  }, [isActive, timeLeft]);

  const mins = Math.floor(timeLeft/60).toString().padStart(2,'0');
  const secs = (timeLeft%60).toString().padStart(2,'0');

  return (
    <div className="flex items-center gap-3 w-full">
      <div className="flex items-baseline gap-1">
        <span className="text-xl font-black digital-number">{mins}</span>
        <span className="text-lg font-light text-white/20">:</span>
        <span className="text-xl font-black digital-number opacity-50">{secs}</span>
      </div>

      <div className="h-4 w-px bg-white/10 mx-0.5"></div>

      <div className="flex gap-1.5">
          <button 
            onClick={() => setIsActive(!isActive)}
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${isActive ? 'bg-white text-black scale-105' : 'bg-white/5 text-white hover:bg-white/10'}`}
          >
            <i className={`fa-solid ${isActive ? 'fa-pause' : 'fa-play ml-0.5'} text-[10px]`}></i>
          </button>
          
          <button 
            onClick={() => { setIsActive(false); setTimeLeft(25 * 60); }}
            className="w-7 h-7 rounded-lg bg-white/5 text-white/30 flex items-center justify-center hover:bg-white/10 hover:text-white"
          >
            <i className="fa-solid fa-rotate-right text-[8px]"></i>
          </button>
      </div>
    </div>
  );
};

export default FocusWidget;
