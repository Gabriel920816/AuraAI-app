
import React, { useState, useMemo } from 'react';
import { TodoItem } from '../../types';

interface TodoWidgetProps {
  todos: TodoItem[];
  setTodos: (t: TodoItem[]) => void;
  selectedDate: Date;
}

const TodoWidget: React.FC<TodoWidgetProps> = ({ todos, setTodos, selectedDate }) => {
  const [input, setInput] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'completed'>('all');
  const [editingTodo, setEditingTodo] = useState<TodoItem | null>(null);

  const selectedDateStr = useMemo(() => {
    return `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
  }, [selectedDate]);

  const isSelectedDateToday = useMemo(() => {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    return selectedDateStr === todayStr;
  }, [selectedDateStr]);

  const stats = useMemo(() => ({
    all: todos.filter(t => t.date === selectedDateStr).length,
    active: todos.filter(t => t.date === selectedDateStr && !t.completed).length,
    completed: todos.filter(t => t.date === selectedDateStr && t.completed).length
  }), [todos, selectedDateStr]);

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setTodos([{ 
      id: Date.now().toString(), 
      text: input, 
      completed: false, 
      priority: 'medium',
      date: selectedDateStr
    }, ...todos]);
    setInput('');
  };

  const toggle = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setTodos(todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const remove = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTodos(todos.filter(t => t.id !== id));
  };

  const updatePriority = (id: string, priority: 'low' | 'medium' | 'high') => {
    setTodos(todos.map(t => t.id === id ? { ...t, priority } : t));
  };

  const updateText = (id: string, text: string) => {
    setTodos(todos.map(t => t.id === id ? { ...t, text } : t));
  };

  const filteredTodos = todos.filter(t => {
    if (t.date !== selectedDateStr) return false;
    if (activeTab === 'active') return !t.completed;
    if (activeTab === 'completed') return t.completed;
    return true;
  });

  const PriorityIcon = ({ level }: { level: string }) => {
    switch (level) {
      case 'high': return <span className="text-rose-400 font-black tracking-tighter mr-2 drop-shadow-[0_0_8px_rgba(244,63,94,0.4)]">!!!</span>;
      case 'medium': return <span className="text-orange-400 font-black tracking-tighter mr-2 opacity-80">!!</span>;
      default: return <span className="text-emerald-400 font-black tracking-tighter mr-2 opacity-60">!</span>;
    }
  };

  return (
    <div className="ios-glass p-0 h-full flex flex-col min-h-0 overflow-hidden relative">
      <div className="px-6 py-4 border-b border-white/10 shrink-0 flex justify-between items-center">
        <div className="flex flex-col">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60">Tasks</h3>
          <span className="text-[8px] font-black opacity-30 mt-0.5">{isSelectedDateToday ? 'TODAY' : selectedDateStr}</span>
        </div>
        <span className="text-[10px] font-black digital-number opacity-30">{stats.active} ACTIVE</span>
      </div>

      {/* Pill Switcher */}
      <div className="px-4 py-3 shrink-0">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-1 flex relative">
          <div 
            className="absolute top-1 bottom-1 bg-white/15 rounded-xl transition-all duration-300 ease-out z-0" 
            style={{ 
              width: 'calc(33.33% - 4px)', 
              left: activeTab === 'all' ? '4px' : activeTab === 'active' ? '33.33%' : '66.66%' 
            }}
          ></div>
          
          <button onClick={() => setActiveTab('all')} className={`flex-1 py-1.5 text-[9px] font-black uppercase tracking-widest relative z-10 transition-colors ${activeTab === 'all' ? 'text-white' : 'text-white/30'}`}>All</button>
          <button onClick={() => setActiveTab('active')} className={`flex-1 py-1.5 text-[9px] font-black uppercase tracking-widest relative z-10 transition-colors ${activeTab === 'active' ? 'text-white' : 'text-white/30'}`}>To Do</button>
          <button onClick={() => setActiveTab('completed')} className={`flex-1 py-1.5 text-[9px] font-black uppercase tracking-widest relative z-10 transition-colors ${activeTab === 'completed' ? 'text-white' : 'text-white/30'}`}>Done</button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-hide min-h-0">
        {filteredTodos.length > 0 ? filteredTodos.map(todo => (
          <div 
            key={todo.id} 
            onClick={() => setEditingTodo(todo)}
            className={`group flex items-center justify-between gap-3 p-4 rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden
              ${todo.completed ? 'bg-transparent border-white/5 opacity-40' : 'bg-white/5 border-white/10 hover:border-white/30 hover:bg-white/10'}`}
          >
             <div className="flex items-center min-w-0 flex-1">
                <PriorityIcon level={todo.priority} />
                <div className="flex flex-col min-w-0">
                  <span className={`text-sm font-semibold tracking-tight transition-all truncate text-white ${todo.completed ? 'line-through opacity-50' : ''}`}>
                    {todo.text}
                  </span>
                  {todo.originalDate && !todo.completed && (
                    <span className="text-[7px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-1 mt-0.5">
                      <i className="fa-solid fa-clock-rotate-left"></i> Rolled over
                    </span>
                  )}
                </div>
             </div>

             <div className="flex items-center gap-2 shrink-0">
                <button 
                  onClick={(e) => remove(todo.id, e)}
                  className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 opacity-0 group-hover:opacity-100 flex items-center justify-center hover:bg-rose-500/30 transition-all"
                >
                  <i className="fa-solid fa-trash-can text-[10px]"></i>
                </button>
                <div 
                  onClick={(e) => toggle(todo.id, e)}
                  className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all 
                    ${todo.completed ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-white/20 bg-black/10 hover:border-white/50'}`}
                >
                  {todo.completed && <i className="fa-solid fa-check text-[10px]"></i>}
                </div>
             </div>
          </div>
        )) : (
          <div className="py-12 flex flex-col items-center justify-center opacity-20">
              <i className="fa-solid fa-layer-group text-3xl mb-3"></i>
              <p className="text-[9px] font-black uppercase tracking-[0.4em]">No tasks for this day</p>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-white/10 bg-white/[0.02]">
        <form onSubmit={add}>
          <input 
            type="text" 
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Add task to this date..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-xs outline-none focus:bg-white/10 focus:border-white/30 transition-all placeholder:opacity-30 text-white font-bold"
          />
        </form>
      </div>

      {editingTodo && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-2xl animate-in fade-in" onClick={() => setEditingTodo(null)}>
          <div className="w-full heavy-frost p-8 rounded-[2.5rem] flex flex-col gap-6 shadow-2xl scale-in-center border-white/20" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center">
               <h4 className="text-[10px] font-black uppercase tracking-widest text-white/50">Edit Task</h4>
               <button onClick={() => setEditingTodo(null)} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/30 hover:text-white transition-all border border-white/10"><i className="fa-solid fa-xmark text-xs"></i></button>
            </div>
            
            <input 
              autoFocus
              className="bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-xl font-black text-white outline-none w-full focus:bg-white/10 focus:border-white/20 transition-all"
              value={editingTodo.text}
              onChange={(e) => {
                updateText(editingTodo.id, e.target.value);
                setEditingTodo({...editingTodo, text: e.target.value});
              }}
            />

            <div className="space-y-3">
               <span className="text-[9px] font-black uppercase tracking-widest text-white/30">Priority Level</span>
               <div className="grid grid-cols-3 gap-2">
                  {(['low', 'medium', 'high'] as const).map(p => (
                    <button 
                      key={p}
                      onClick={() => {
                        updatePriority(editingTodo.id, p);
                        setEditingTodo({...editingTodo, priority: p});
                      }}
                      className={`py-3 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all
                        ${editingTodo.priority === p ? 'bg-white/20 border-white/40 text-white' : 'bg-white/5 border-white/10 text-white/30 hover:bg-white/10'}`}
                    >
                      {p}
                    </button>
                  ))}
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TodoWidget;
