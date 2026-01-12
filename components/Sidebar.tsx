
import React from 'react';
import { ViewType } from '../types';

interface SidebarProps {
  activeView: ViewType;
  setActiveView: (view: ViewType) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, isOpen, setIsOpen }) => {
  const menuItems = [
    { type: ViewType.CALENDAR, label: 'Calendar', icon: 'fa-calendar-days' },
    { type: ViewType.TASKS, label: 'Tasks', icon: 'fa-list-check' },
    { type: ViewType.FOCUS, label: 'Focus', icon: 'fa-clock' },
    { type: ViewType.HEALTH, label: 'Wellness', icon: 'fa-heart-pulse' },
    { type: ViewType.AI_CHAT, label: 'AI Assistant', icon: 'fa-robot' },
  ];

  return (
    <aside className={`fixed md:relative z-50 h-full transition-all duration-300 ${isOpen ? 'w-64' : 'w-0 -translate-x-64'} md:w-64 bg-white border-r border-slate-200 flex flex-col`}>
      <div className="p-6">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
            <i className="fa-solid fa-sparkles text-white"></i>
          </div>
          <span className="text-xl font-bold tracking-tight">Aura Personal</span>
        </div>

        <nav className="space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.type}
              onClick={() => setActiveView(item.type)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
                activeView === item.type 
                ? 'bg-indigo-50 text-indigo-700 font-semibold' 
                : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <i className={`fa-solid ${item.icon} text-lg w-6`}></i>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-6 space-y-4">
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <p className="text-xs text-slate-500 mb-1">Upcoming</p>
          <p className="text-sm font-medium">No meetings left</p>
        </div>
        <button className="flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600 transition-colors">
          <i className="fa-solid fa-gear"></i>
          <span>Settings</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
