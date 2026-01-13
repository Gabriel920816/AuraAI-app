
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { CalendarEvent, TodoItem, PeriodRecord, HoroscopeData } from './types';
import Dashboard from './components/Dashboard';
import AssistantBubble from './components/AssistantBubble';
import HeaderWidgets from './components/HeaderWidgets';
import WeatherBackground from './components/WeatherBackground';
import { generateHoroscope, getZodiacSign } from './geminiService';

const App: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [periods, setPeriods] = useState<PeriodRecord[]>([]);
  const [showHealth, setShowHealth] = useState<boolean>(false);
  const [selectedCountry, setSelectedCountry] = useState<string>('Australia');
  const [bgImage, setBgImage] = useState<string>('https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=2560');
  
  const [todayKey, setTodayKey] = useState<string>(new Date().toDateString());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [horoscope, setHoroscope] = useState<HoroscopeData | null>(null);

  const [weather, setWeather] = useState<{temp: number, code: number, condition: string, location: string}>({ 
    temp: 24, 
    code: 0, 
    condition: 'Clear',
    location: 'Detecting...'
  });

  const isHoroscopeLoading = useRef(false);

  const getTodayStr = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  };

  const rolloverTasks = useCallback((currentTodos: TodoItem[]) => {
    const todayStr = getTodayStr();
    let hasChanges = false;
    const updatedTodos = currentTodos.map(todo => {
      if (!todo.completed && todo.date < todayStr) {
        hasChanges = true;
        return { ...todo, date: todayStr, originalDate: todo.originalDate || todo.date };
      }
      return todo;
    });
    if (hasChanges) setTodos(updatedTodos);
  }, []);

  const updateWeather = async (lat: number, lon: number, locationName: string) => {
    try {
      const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
      const data = await res.json();
      const code = data.current_weather.weathercode;
      let cond = 'Clear';
      if (code >= 1 && code <= 3) cond = 'Cloudy';
      else if (code >= 51 && code <= 67) cond = 'Rain';
      else if (code >= 71 && code <= 77) cond = 'Snow';
      else if (code >= 80) cond = 'Rain';
      setWeather({ temp: Math.round(data.current_weather.temperature), code, condition: cond, location: locationName });
    } catch (e) {}
  };

  const loadHoroscope = useCallback(async (birthDate: string, force = false) => {
    if (!birthDate || isHoroscopeLoading.current) return;
    
    // 即使缓存没有，也要防止并发
    isHoroscopeLoading.current = true;
    const sign = getZodiacSign(birthDate);
    const data = await generateHoroscope(sign, birthDate, force);
    if (data) setHoroscope({ ...data, sign });
    isHoroscopeLoading.current = false;
  }, []);

  useEffect(() => {
    const savedEvents = localStorage.getItem('aura_events');
    if (savedEvents) setEvents(JSON.parse(savedEvents));
    const savedTodos = localStorage.getItem('aura_todos');
    if (savedTodos) rolloverTasks(JSON.parse(savedTodos));
    const savedPeriods = localStorage.getItem('aura_periods');
    if (savedPeriods) setPeriods(JSON.parse(savedPeriods));
    const savedHealthPref = localStorage.getItem('aura_show_health');
    if (savedHealthPref !== null) setShowHealth(JSON.parse(savedHealthPref));
    const savedCountry = localStorage.getItem('aura_selected_country');
    if (savedCountry) setSelectedCountry(savedCountry);
    const savedBg = localStorage.getItem('aura_bg');
    if (savedBg) setBgImage(savedBg);

    const savedBirthdate = localStorage.getItem('aura_birthdate');
    if (savedBirthdate) loadHoroscope(savedBirthdate);

    navigator.geolocation.getCurrentPosition(
      (pos) => updateWeather(pos.coords.latitude, pos.coords.longitude, 'Nearby'),
      () => updateWeather(-33.8688, 151.2093, 'Sydney')
    );
  }, [rolloverTasks, loadHoroscope]);

  useEffect(() => { localStorage.setItem('aura_events', JSON.stringify(events)); }, [events]);
  useEffect(() => { localStorage.setItem('aura_todos', JSON.stringify(todos)); }, [todos]);
  useEffect(() => { localStorage.setItem('aura_periods', JSON.stringify(periods)); }, [periods]);
  useEffect(() => { localStorage.setItem('aura_show_health', JSON.stringify(showHealth)); }, [showHealth]);
  useEffect(() => { localStorage.setItem('aura_selected_country', selectedCountry); }, [selectedCountry]);
  useEffect(() => { localStorage.setItem('aura_bg', bgImage); }, [bgImage]);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black" key={todayKey}>
      <div className="fixed inset-0 z-0 transition-all duration-1000" style={{ backgroundImage: `url('${bgImage}')`, backgroundPosition: 'center', backgroundSize: 'cover' }}>
        <div className="absolute inset-0 bg-black/45 backdrop-blur-[1px]"></div>
      </div>
      <WeatherBackground condition={weather.condition} />
      <div className="dashboard-container relative z-10 border-none bg-transparent">
        <HeaderWidgets 
          showHealth={showHealth} setShowHealth={setShowHealth} setBgImage={setBgImage}
          weatherData={weather} onSetLocation={updateWeather}
          horoscope={horoscope} onRefreshHoroscope={loadHoroscope}
        />
        <main className="min-h-0 flex-1">
          <Dashboard 
            events={events} setEvents={setEvents} 
            todos={todos} setTodos={setTodos} 
            periods={periods} setPeriods={setPeriods} 
            showHealth={showHealth}
            selectedCountry={selectedCountry} setSelectedCountry={setSelectedCountry}
            selectedDate={selectedDate} setSelectedDate={setSelectedDate}
          />
        </main>
        <AssistantBubble 
          events={events} weather={weather}
          onAddEvent={(e) => setEvents([...events, e])} onSetCountry={setSelectedCountry} 
        />
      </div>
    </div>
  );
};

export default App;
