
import React, { useState, useEffect } from 'react';

const FocusView: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'work' | 'break'>('work');

  useEffect(() => {
    let timer: any;
    if (isActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
      audio.play().catch(() => {});
      alert(mode === 'work' ? 'Time for a break!' : 'Break over, back to work!');
    }
    return () => clearInterval(timer);
  }, [isActive, timeLeft, mode]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(mode === 'work' ? 25 * 60 : 5 * 60);
  };

  const switchMode = (newMode: 'work' | 'break') => {
    setMode(newMode);
    setIsActive(false);
    setTimeLeft(newMode === 'work' ? 25 * 60 : 5 * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = (timeLeft / (mode === 'work' ? 25 * 60 : 5 * 60)) * 100;

  return (
    <div className="max-w-xl mx-auto flex flex-col items-center justify-center space-y-12 py-12">
      <div className="flex p-1 bg-slate-100 rounded-2xl">
        <button 
          onClick={() => switchMode('work')}
          className={`px-8 py-2 rounded-xl text-sm font-bold transition-all ${mode === 'work' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}
        >
          Pomodoro
        </button>
        <button 
          onClick={() => switchMode('break')}
          className={`px-8 py-2 rounded-xl text-sm font-bold transition-all ${mode === 'break' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}
        >
          Short Break
        </button>
      </div>

      <div className="relative w-72 h-72 md:w-96 md:h-96 flex items-center justify-center">
        {/* SVG Progress Circle */}
        <svg className="absolute inset-0 w-full h-full -rotate-90">
          <circle 
            cx="50%" cy="50%" r="48%" 
            className="fill-none stroke-slate-100" strokeWidth="12" 
          />
          <circle 
            cx="50%" cy="50%" r="48%" 
            className={`fill-none transition-all duration-1000 ease-linear ${mode === 'work' ? 'stroke-indigo-600' : 'stroke-emerald-500'}`} 
            strokeWidth="12"
            strokeDasharray="301.5%"
            strokeDashoffset={`${301.5 - (progress * 3.015)}%`}
            strokeLinecap="round"
          />
        </svg>

        <div className="text-center">
          <span className="text-6xl md:text-8xl font-black tracking-tighter tabular-nums text-slate-800">
            {formatTime(timeLeft)}
          </span>
          <p className="text-slate-400 font-medium tracking-widest uppercase mt-2">{mode === 'work' ? 'Deep Work' : 'Resting'}</p>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <button 
          onClick={resetTimer}
          className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-all"
        >
          <i className="fa-solid fa-rotate-left text-xl"></i>
        </button>
        <button 
          onClick={toggleTimer}
          className={`w-24 h-24 rounded-full flex items-center justify-center text-white text-3xl shadow-2xl transition-all transform hover:scale-110 active:scale-95 ${
            isActive ? 'bg-slate-800' : (mode === 'work' ? 'bg-indigo-600 shadow-indigo-200' : 'bg-emerald-500 shadow-emerald-200')
          }`}
        >
          <i className={`fa-solid ${isActive ? 'fa-pause' : 'fa-play ml-1'}`}></i>
        </button>
        <div className="w-16"></div> {/* Spacer for symmetry */}
      </div>

      <div className="text-center text-slate-400 flex items-center gap-2">
        <i className="fa-solid fa-lightbulb"></i>
        <p className="text-sm">Keep it up! Consistency is the key to focus.</p>
      </div>
    </div>
  );
};

export default FocusView;
