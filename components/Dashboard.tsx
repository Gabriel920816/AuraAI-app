
import React from 'react';
import CalendarWidget from './widgets/CalendarWidget';
import TodoWidget from './widgets/TodoWidget';
import HealthWidget from './widgets/HealthWidget';
import { CalendarEvent, TodoItem, PeriodRecord } from '../types';

interface DashboardProps {
  events: CalendarEvent[];
  setEvents: (e: CalendarEvent[]) => void;
  todos: TodoItem[];
  setTodos: (t: TodoItem[]) => void;
  periods: PeriodRecord[];
  setPeriods: (p: PeriodRecord[]) => void;
  showHealth: boolean;
  selectedCountry: string;
  setSelectedCountry: (c: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  events, setEvents, todos, setTodos, periods, setPeriods, 
  showHealth, selectedCountry, setSelectedCountry 
}) => {
  return (
    <div className="h-full w-full grid gap-8 grid-cols-12 overflow-visible">
      
      {/* Calendar Area - 75% width (9/12) */}
      <div className="col-span-12 lg:col-span-9 h-full min-h-0 transition-all duration-700 ease-in-out overflow-visible">
        <CalendarWidget 
          events={events} 
          setEvents={setEvents}
          selectedCountry={selectedCountry}
          setSelectedCountry={setSelectedCountry}
        />
      </div>

      {/* Daily Flow Sidebar - 25% width (3/12) */}
      <div className="col-span-12 lg:col-span-3 flex flex-col gap-6 h-full min-h-0 transition-all duration-700 overflow-visible">
        <div className={`${showHealth ? 'flex-[0.7]' : 'flex-1'} min-h-0 overflow-visible`}>
          <TodoWidget todos={todos} setTodos={setTodos} />
        </div>

        {showHealth && (
          <div className="flex-[0.3] min-h-0 overflow-visible animate-in slide-in-from-right-8">
            <HealthWidget records={periods} setRecords={setPeriods} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
