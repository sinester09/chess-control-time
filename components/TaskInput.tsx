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
      {/* Header con selector de fechas */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Today's Tasks</h2>
          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
            <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {dates.map((date, index) => {
            const dateInfo = formatDate(date);
            const isSelected = selectedDate.toDateString() === date.toDateString();
            const isToday = date.toDateString() === new Date().toDateString();
            return (
              <button
                key={index}
                onClick={() => setSelectedDate(date)}
                className={`flex-shrink-0 flex flex-col items-center p-3 rounded-xl transition-all duration-200 min-w-[60px] ${
                  isSelected ? 'bg-purple-500 text-white shadow-lg scale-105'
                    : isToday ? 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span className="text-xs font-medium opacity-75">{formatMonth(date)}</span>
                <span className="text-lg font-bold">{dateInfo.main}</span>
                <span className="text-xs font-medium opacity-75">{dateInfo.sub}</span>
              </button>
            );
          })}
        </div>
      </div>

      {!isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          className="w-full bg-white border-2 border-dashed border-gray-300 hover:border-purple-400 hover:bg-purple-50 rounded-2xl p-6 transition-all duration-200 group"
        >
          <div className="flex items-center justify-center gap-3 text-gray-500 group-hover:text-purple-600">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center group-hover:bg-purple-200 transition-colors">
              <PlusIcon className="w-5 h-5" />
            </div>
            <span className="font-medium">Agregar nueva tarea</span>
          </div>
        </button>
      )}

      {isExpanded && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Nueva Tarea</h3>
            <button
              onClick={() => setIsExpanded(false)}
              className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
            >
              <span className="text-gray-500">✕</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nombre */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Nombre de la tarea</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Revisar documentos del proyecto"
                className="w-full bg-gray-50 border border-gray-200 hover:border-gray-300 focus:border-purple-500 focus:bg-white rounded-xl px-4 py-3 text-gray-900 placeholder-gray-500 focus:ring-4 focus:ring-purple-100 focus:outline-none transition-all duration-200"
                required
              />
            </div>

            {/* Tiempo estimado */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Tiempo estimado</label>
              <div className="relative">
                <input
                  type="number"
                  value={minutes}
                  onChange={(e) => setMinutes(e.target.value)}
                  placeholder="30"
                  className="w-full bg-gray-50 border border-gray-200 hover:border-gray-300 focus:border-purple-500 focus:bg-white rounded-xl px-4 py-3 pr-20 text-gray-900 placeholder-gray-500 focus:ring-4 focus:ring-purple-100 focus:outline-none transition-all duration-200"
                  min="1"
                  required
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-gray-500">
                  <ClockIcon className="w-4 h-4" />
                  <span className="text-sm font-medium">min</span>
                </div>
              </div>
            </div>

            {/* Proyecto */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Proyecto</label>
              <div className="flex gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setSelectedProjectId(null)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                    selectedProjectId === null
                      ? 'bg-gray-200 border-gray-400 text-gray-800'
                      : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  Sin proyecto
                </button>
                {projects.map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedProjectId(p.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                      selectedProjectId === p.id
                        ? 'border-transparent text-white'
                        : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
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
                  className="px-3 py-1.5 rounded-lg text-sm font-medium border border-dashed border-gray-300 text-gray-400 hover:border-purple-400 hover:text-purple-500 transition-all"
                >
                  + Nuevo proyecto
                </button>
              </div>

              {selectedProject && (
                <div className="flex items-center gap-2 p-2 rounded-lg" style={{ backgroundColor: `${selectedProject.color}15` }}>
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedProject.color }} />
                  <span className="text-sm font-medium" style={{ color: selectedProject.color }}>{selectedProject.name}</span>
                </div>
              )}
            </div>

            {/* Fecha */}
            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl border border-purple-200">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                <CalendarIcon className="w-4 h-4 text-white" />
              </div>
              <div>
                <span className="text-sm text-purple-600 font-medium">Programada para:</span>
                <p className="text-purple-900 font-semibold">
                  {selectedDate.toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' })}
                </p>
              </div>
            </div>

            {/* Acciones */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-xl transition-colors duration-200"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg"
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
