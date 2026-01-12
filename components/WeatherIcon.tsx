
import React from 'react';

interface WeatherIconProps {
  condition: string;
  className?: string;
}

const WeatherIcon: React.FC<WeatherIconProps> = ({ condition, className = "" }) => {
  const renderIcon = () => {
    switch (condition) {
      case 'Rain':
        return (
          <div className={`relative flex items-center justify-center ${className}`}>
            <i className="fa-solid fa-cloud text-[1.4rem] text-sky-400 relative z-10 filter drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]"></i>
            {/* 3 sequential raindrops */}
            <div className="absolute inset-0 top-3 left-0 flex justify-around w-full px-1">
              <span className="raindrop-drip" style={{ animationDelay: '0s', left: '20%' }}></span>
              <span className="raindrop-drip" style={{ animationDelay: '0.5s', left: '50%' }}></span>
              <span className="raindrop-drip" style={{ animationDelay: '1.0s', left: '80%' }}></span>
            </div>
          </div>
        );
      case 'Snow':
        return (
          <div className={`relative flex items-center justify-center icon-snowy ${className}`}>
            <i className="fa-solid fa-snowflake text-[1.3rem] text-indigo-200 filter drop-shadow-[0_0_8px_rgba(199,210,254,0.5)]"></i>
          </div>
        );
      case 'Cloudy':
        return (
          <div className={`relative flex items-center justify-center icon-cloudy ${className}`}>
            <i className="fa-solid fa-cloud text-[1.3rem] text-slate-300 filter drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]"></i>
          </div>
        );
      case 'Clear':
      default:
        return (
          <div className={`relative flex items-center justify-center icon-sunny ${className}`}>
            <i className="fa-solid fa-sun text-[1.5rem] text-amber-400 filter drop-shadow-[0_0_12px_rgba(251,191,36,0.7)]"></i>
          </div>
        );
    }
  };

  return <div className="weather-icon-wrapper">{renderIcon()}</div>;
};

export default WeatherIcon;
