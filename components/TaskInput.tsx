
import React, { useState } from 'react';
import { PlusIcon } from './icons';

interface TaskInputProps {
  onAddTask: (name: string, estimatedTime: number) => void;
}

const TaskInput: React.FC<TaskInputProps> = ({ onAddTask }) => {
  const [name, setName] = useState('');
  const [minutes, setMinutes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && parseInt(minutes, 10) > 0) {
      onAddTask(name.trim(), parseInt(minutes, 10) * 60);
      setName('');
      setMinutes('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 mb-6 p-4 bg-slate-800/50 backdrop-blur-sm rounded-lg shadow-lg">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="New task name..."
        className="flex-grow bg-slate-700 border border-slate-600 rounded-md px-4 py-2 focus:ring-2 focus:ring-cyan-500 focus:outline-none transition"
        required
      />
      <input
        type="number"
        value={minutes}
        onChange={(e) => setMinutes(e.target.value)}
        placeholder="Est. minutes"
        className="w-full sm:w-36 bg-slate-700 border border-slate-600 rounded-md px-4 py-2 focus:ring-2 focus:ring-cyan-500 focus:outline-none transition"
        min="1"
        required
      />
      <button type="submit" className="flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out transform hover:scale-105">
        <PlusIcon className="w-5 h-5" />
        <span>Add Task</span>
      </button>
    </form>
  );
};

export default TaskInput;
