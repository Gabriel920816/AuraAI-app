
import React, { useMemo } from 'react';

interface WeatherBackgroundProps {
  condition: string;
}

const WeatherBackground: React.FC<WeatherBackgroundProps> = ({ condition }) => {
  const effects = useMemo(() => {
    const els = [];
    if (condition === 'Rain') {
      // Background full screen rain
      for (let i = 0; i < 60; i++) {
        els.push(
          <div 
            key={`rain-${i}`} 
            className="weather-rain-drop" 
            style={{ 
              left: `${Math.random() * 100}vw`, 
              animationDelay: `${Math.random() * 2}s`,
              opacity: Math.random() * 0.5 + 0.2
            }} 
          />
        );
      }
    } else if (condition === 'Snow') {
      for (let i = 0; i < 50; i++) {
        els.push(
          <div 
            key={`snow-${i}`} 
            className="weather-snow-flake" 
            style={{ 
              left: `${Math.random() * 100}vw`, 
              width: `${Math.random() * 4 + 2}px`, 
              height: `${Math.random() * 4 + 2}px`, 
              animationDelay: `${Math.random() * 5}s`,
              opacity: Math.random() * 0.8
            }} 
          />
        );
      }
    } else if (condition === 'Cloudy') {
      for (let i = 0; i < 12; i++) {
        els.push(
          <div 
            key={`cloud-${i}`} 
            className="weather-cloud-mist" 
            style={{ 
              top: `${Math.random() * 100}vh`, 
              width: `${Math.random() * 50 + 20}vw`, 
              height: `${Math.random() * 50 + 20}vw`, 
              animationDelay: `-${Math.random() * 60}s`, 
              left: `-${Math.random() * 30}vw` 
            }} 
          />
        );
      }
    } else if (condition === 'Clear' || !condition) {
      els.push(<div key="sun-flare" className="sun-flare" />);
      els.push(<div key="sun-beams" className="weather-sun-beam" />);
    }
    return els;
  }, [condition]);

  return <div className="fixed inset-0 pointer-events-none z-[5] overflow-hidden">{effects}</div>;
};

export default WeatherBackground;
