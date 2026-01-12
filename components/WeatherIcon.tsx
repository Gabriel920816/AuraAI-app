
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
            <i className="fa-solid fa-cloud text-[1.4rem] text-sky-400/90 relative z-10 filter drop-shadow-md"></i>
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
            <i className="fa-solid fa-snowflake text-[1.3rem]"></i>
          </div>
        );
      case 'Cloudy':
        return (
          <div className={`relative flex items-center justify-center icon-cloudy ${className}`}>
            <i className="fa-solid fa-cloud text-[1.3rem]"></i>
          </div>
        );
      case 'Clear':
      default:
        return (
          <div className={`relative flex items-center justify-center icon-sunny ${className}`}>
            <i className="fa-solid fa-sun text-[1.5rem]"></i>
          </div>
        );
    }
  };

  return <div className="weather-icon-wrapper">{renderIcon()}</div>;
};

export default WeatherIcon;
