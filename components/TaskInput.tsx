import React, { useState } from 'react';
import { PlusIcon, CalendarIcon, ClockIcon } from './icons';
import { Project } from '../types';

interface TaskInputProps {
  onAddTask: (name: string, estimatedTime: number, projectId: string | null, selectedDate?: Date) => void;
  projects: Project[];
  onCreateProject: () => void;
}

const TaskInput: React.FC<TaskInputProps> = ({ onAddTask, projects, onCreateProject }) => {
  const [name, setName] = useState('');
  const [minutes, setMinutes] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const generateDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const dates = generateDates();

  const formatDate = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    if (date.toDateString() === today.toDateString()) return { main: date.getDate().toString(), sub: 'Hoy' };
    if (date.toDateString() === tomorrow.toDateString()) return { main: date.getDate().toString(), sub: 'Mañ' };
    return { main: date.getDate().toString(), sub: date.toLocaleDateString('es', { weekday: 'short' }).slice(0, 3) };
  };

  const formatMonth = (date: Date) => date.toLocaleDateString('es', { month: 'short' }).slice(0, 3);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && parseInt(minutes, 10) > 0) {
      onAddTask(name.trim(), parseInt(minutes, 10) * 60, selectedProjectId, selectedDate);
      setName('');
      setMinutes('');
      setIsExpanded(false);
    }
  };

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  return (
    <div className="mb-6">
      {/* Selector de fechas */}
      <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-slate-700 p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-slate-200">Tareas del día</h2>
          <CalendarIcon className="w-4 h-4 text-slate-400" />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {dates.map((date, index) => {
            const dateInfo = formatDate(date);
            const isSelected = selectedDate.toDateString() === date.toDateString();
            const isToday = date.toDateString() === new Date().toDateString();
            return (
              <button
                key={index}
                onClick={() => setSelectedDate(date)}
                className={`flex-shrink-0 flex flex-col items-center p-2.5 rounded-xl transition-all duration-200 min-w-[52px] ${
                  isSelected
                    ? 'bg-cyan-500 text-slate-900 shadow-lg shadow-cyan-500/30 scale-105'
                    : isToday
                    ? 'bg-slate-700 text-cyan-400 hover:bg-slate-600'
                    : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700'
                }`}
              >
                <span className="text-xs font-medium opacity-75">{formatMonth(date)}</span>
                <span className="text-lg font-bold leading-tight">{dateInfo.main}</span>
                <span className="text-xs font-medium opacity-75">{dateInfo.sub}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Botón añadir */}
      {!isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          className="w-full bg-slate-800/40 border-2 border-dashed border-slate-600 hover:border-cyan-500/60 hover:bg-slate-800/70 rounded-2xl p-5 transition-all duration-200 group"
        >
          <div className="flex items-center justify-center gap-3 text-slate-400 group-hover:text-cyan-400">
            <div className="w-9 h-9 bg-slate-700 group-hover:bg-cyan-500/20 rounded-full flex items-center justify-center transition-colors">
              <PlusIcon className="w-5 h-5" />
            </div>
            <span className="font-medium">Agregar nueva tarea</span>
          </div>
        </button>
      )}

      {/* Formulario expandido */}
      {isExpanded && (
        <div className="bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-slate-700 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-100">Nueva Tarea</h3>
            <button
              onClick={() => setIsExpanded(false)}
              className="w-7 h-7 bg-slate-700 hover:bg-slate-600 rounded-full flex items-center justify-center transition-colors text-slate-400 hover:text-slate-200"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nombre */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300">Nombre de la tarea</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Revisar documentos del proyecto"
                className="w-full bg-slate-700/60 border border-slate-600 hover:border-slate-500 focus:border-cyan-500 rounded-xl px-4 py-2.5 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-cyan-500/30 focus:outline-none transition-all"
                required
              />
            </div>

            {/* Tiempo estimado */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300">Tiempo estimado</label>
              <div className="relative">
                <input
                  type="number"
                  value={minutes}
                  onChange={(e) => setMinutes(e.target.value)}
                  placeholder="30"
                  className="w-full bg-slate-700/60 border border-slate-600 hover:border-slate-500 focus:border-cyan-500 rounded-xl px-4 py-2.5 pr-16 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-cyan-500/30 focus:outline-none transition-all"
                  min="1"
                  required
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-slate-400 pointer-events-none">
                  <ClockIcon className="w-4 h-4" />
                  <span className="text-sm">min</span>
                </div>
              </div>
            </div>

            {/* Proyecto */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300">Proyecto</label>
              <div className="flex gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setSelectedProjectId(null)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    selectedProjectId === null
                      ? 'bg-slate-500 border-slate-400 text-slate-100'
                      : 'bg-slate-700/50 border-slate-600 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  Sin proyecto
                </button>
                {projects.map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedProjectId(p.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      selectedProjectId === p.id
                        ? 'border-transparent text-white'
                        : 'bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-700'
                    }`}
                    style={selectedProjectId === p.id ? { backgroundColor: p.color, borderColor: p.color } : {}}
                  >
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedProjectId === p.id ? 'white' : p.color }} />
                    {p.name}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={onCreateProject}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium border border-dashed border-slate-600 text-slate-500 hover:border-cyan-500/60 hover:text-cyan-400 transition-all"
                >
                  + Nuevo proyecto
                </button>
              </div>

              {selectedProject && (
                <div className="flex items-center gap-2 p-2 rounded-lg mt-1" style={{ backgroundColor: `${selectedProject.color}1A` }}>
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedProject.color }} />
                  <span className="text-xs font-medium" style={{ color: selectedProject.color }}>{selectedProject.name}</span>
                </div>
              )}
            </div>

            {/* Fecha seleccionada */}
            <div className="flex items-center gap-3 p-3 bg-cyan-500/10 rounded-xl border border-cyan-500/20">
              <div className="w-7 h-7 bg-cyan-500/20 rounded-full flex items-center justify-center">
                <CalendarIcon className="w-4 h-4 text-cyan-400" />
              </div>
              <div>
                <span className="text-xs text-cyan-400 font-medium">Programada para:</span>
                <p className="text-slate-200 text-sm font-semibold">
                  {selectedDate.toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' })}
                </p>
              </div>
            </div>

            {/* Acciones */}
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-300 font-medium py-2.5 px-4 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-slate-900 font-semibold py-2.5 px-4 rounded-xl transition-all shadow-lg shadow-cyan-500/20"
              >
                <div className="flex items-center justify-center gap-2">
                  <PlusIcon className="w-4 h-4" />
                  Agregar Tarea
                </div>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default TaskInput;
