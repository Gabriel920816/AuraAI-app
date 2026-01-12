
import React, { useState, useEffect, useRef } from 'react';
import { CalendarEvent, TodoItem, PeriodRecord } from './types';
import Dashboard from './components/Dashboard';
import AssistantBubble from './components/AssistantBubble';
import HeaderWidgets from './components/HeaderWidgets';
import WeatherBackground from './components/WeatherBackground';

const App: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [periods, setPeriods] = useState<PeriodRecord[]>([]);
  const [showHealth, setShowHealth] = useState<boolean>(false);
  const [selectedCountry, setSelectedCountry] = useState<string>('Australia');
  const [bgImage, setBgImage] = useState<string>('https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=2560');
  
  const [todayKey, setTodayKey] = useState<string>(new Date().toDateString());

  const [weather, setWeather] = useState<{temp: number, code: number, condition: string, location: string}>({ 
    temp: 24, 
    code: 0, 
    condition: 'Clear',
    location: 'Detecting...'
  });

  const [lastCoords, setLastCoords] = useState<{lat: number, lon: number, name: string} | null>(null);

  const updateWeather = async (lat: number, lon: number, locationName: string, retries = 3) => {
    // Validate coordinates
    if (isNaN(lat) || isNaN(lon)) return;

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
    
    for (let i = 0; i < retries; i++) {
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
        
        const data = await res.json();
        const code = data.current_weather.weathercode;
        let cond = 'Clear';
        if (code >= 1 && code <= 3) cond = 'Cloudy';
        else if (code >= 51 && code <= 67) cond = 'Rain';
        else if (code >= 71 && code <= 77) cond = 'Snow';
        else if (code >= 80) cond = 'Rain';
        
        setWeather({ 
          temp: Math.round(data.current_weather.temperature), 
          code, 
          condition: cond,
          location: locationName
        });
        setLastCoords({ lat, lon, name: locationName });
        return; // Success, exit function
      } catch (e) {
        const isLastAttempt = i === retries - 1;
        if (isLastAttempt) {
          console.error(`Aura: Final weather fetch attempt failed for ${locationName}:`, e);
        } else {
          console.warn(`Aura: Weather fetch attempt ${i + 1} failed. Retrying in ${1.5 * (i + 1)}s...`);
          await new Promise(resolve => setTimeout(resolve, 1500 * (i + 1))); // Exponential-ish backoff
        }
      }
    }
  };

  useEffect(() => {
    const savedEvents = localStorage.getItem('aura_events');
    if (savedEvents) setEvents(JSON.parse(savedEvents));
    const savedTodos = localStorage.getItem('aura_todos');
    if (savedTodos) setTodos(JSON.parse(savedTodos));
    const savedPeriods = localStorage.getItem('aura_periods');
    if (savedPeriods) setPeriods(JSON.parse(savedPeriods));
    const savedHealthPref = localStorage.getItem('aura_show_health');
    if (savedHealthPref !== null) setShowHealth(JSON.parse(savedHealthPref));
    const savedCountry = localStorage.getItem('aura_selected_country');
    if (savedCountry) setSelectedCountry(savedCountry);
    const savedBg = localStorage.getItem('aura_bg');
    if (savedBg) setBgImage(savedBg);

    navigator.geolocation.getCurrentPosition(
      (pos) => updateWeather(pos.coords.latitude, pos.coords.longitude, 'Nearby'),
      () => updateWeather(-33.8688, 151.2093, 'Sydney')
    );

    const midnightCheck = setInterval(() => {
      const current = new Date().toDateString();
      setTodayKey((prev) => {
        if (prev !== current) return current;
        return prev;
      });
    }, 60000);

    return () => clearInterval(midnightCheck);
  }, []);

  useEffect(() => {
    const weatherInterval = setInterval(() => {
      if (lastCoords) {
        updateWeather(lastCoords.lat, lastCoords.lon, lastCoords.name);
      }
    }, 15 * 60 * 1000);

    return () => clearInterval(weatherInterval);
  }, [lastCoords]);

  useEffect(() => { localStorage.setItem('aura_events', JSON.stringify(events)); }, [events]);
  useEffect(() => { localStorage.setItem('aura_todos', JSON.stringify(todos)); }, [todos]);
  useEffect(() => { localStorage.setItem('aura_periods', JSON.stringify(periods)); }, [periods]);
  useEffect(() => { localStorage.setItem('aura_show_health', JSON.stringify(showHealth)); }, [showHealth]);
  useEffect(() => { localStorage.setItem('aura_selected_country', selectedCountry); }, [selectedCountry]);
  useEffect(() => { localStorage.setItem('aura_bg', bgImage); }, [bgImage]);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black" key={todayKey}>
      <div 
        className="fixed inset-0 z-0 transition-all duration-1000"
        style={{ backgroundImage: `url('${bgImage}')`, backgroundPosition: 'center', backgroundSize: 'cover' }}
      >
        <div className="absolute inset-0 bg-black/45 backdrop-blur-[1px]"></div>
      </div>

      <WeatherBackground condition={weather.condition} />

      <div className="dashboard-container relative z-10 border-none bg-transparent">
        <HeaderWidgets 
          showHealth={showHealth} setShowHealth={setShowHealth} setBgImage={setBgImage}
          weatherData={weather} onSetLocation={updateWeather}
        />
        <main className="min-h-0 flex-1">
          <Dashboard 
            events={events} setEvents={setEvents} todos={todos} setTodos={setTodos} 
            periods={periods} setPeriods={setPeriods} showHealth={showHealth}
            selectedCountry={selectedCountry} setSelectedCountry={setSelectedCountry}
          />
        </main>
        <AssistantBubble events={events} onAddEvent={(e) => setEvents([...events, e])} onSetCountry={setSelectedCountry} />
      </div>
    </div>
  );
};

export default App;
