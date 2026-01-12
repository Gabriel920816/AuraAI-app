
import React, { useState } from 'react';
import { TodoItem } from '../types';

interface TodoViewProps {
  todos: TodoItem[];
  setTodos: (todos: TodoItem[]) => void;
}

const TodoView: React.FC<TodoViewProps> = ({ todos, setTodos }) => {
  const [inputValue, setInputValue] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'completed'>('all');

  const addTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    const newItem: TodoItem = {
      id: Date.now().toString(),
      text: inputValue,
      completed: false,
      priority: 'medium'
    };
    setTodos([...todos, newItem]);
    setInputValue('');
  };

  const toggleTodo = (id: string) => {
    setTodos(todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(t => t.id !== id));
  };

  const filteredTodos = todos.filter(t => {
    if (activeTab === 'active') return !t.completed;
    if (activeTab === 'completed') return t.completed;
    return true;
  });

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
        <form onSubmit={addTodo} className="flex gap-3">
          <input 
            type="text" 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="What needs to be done?" 
            className="flex-1 px-5 py-4 bg-slate-50 rounded-2xl border-transparent focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none transition-all font-medium"
          />
          <button type="submit" className="px-6 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-2">
            <i className="fa-solid fa-plus"></i>
            <span className="hidden sm:inline">Add Task</span>
          </button>
        </form>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <div className="flex gap-4">
            {(['all', 'active', 'completed'] as const).map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-sm font-bold capitalize ${activeTab === tab ? 'text-indigo-600 underline underline-offset-8' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {tab}
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-400 font-medium">{todos.filter(t => !t.completed).length} items left</p>
        </div>

        <div className="space-y-3">
          {filteredTodos.length > 0 ? filteredTodos.map(todo => (
            <div 
              key={todo.id} 
              className={`group flex items-center gap-4 p-5 rounded-3xl bg-white border border-slate-100 transition-all hover:border-indigo-200 hover:shadow-md ${todo.completed ? 'opacity-60' : ''}`}
            >
              <button 
                onClick={() => toggleTodo(todo.id)}
                className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${
                  todo.completed ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-slate-200 hover:border-indigo-500'
                }`}
              >
                {todo.completed && <i className="fa-solid fa-check text-[10px]"></i>}
              </button>
              <span className={`flex-1 font-medium transition-all ${todo.completed ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                {todo.text}
              </span>
              <button 
                onClick={() => deleteTodo(todo.id)}
                className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-all"
              >
                <i className="fa-solid fa-trash-can"></i>
              </button>
            </div>
          )) : (
            <div className="py-20 text-center space-y-3">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fa-solid fa-clipboard-list text-slate-200 text-4xl"></i>
              </div>
              <h3 className="text-lg font-bold text-slate-400">All clear for now!</h3>
              <p className="text-sm text-slate-300 max-w-xs mx-auto">Great job staying organized. Add a new task to keep the momentum going.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TodoView;
