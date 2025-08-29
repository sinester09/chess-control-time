import React, { useState } from 'react';
import { PlusIcon, CalendarIcon, ClockIcon } from './icons';

interface TaskInputProps {
  onAddTask: (name: string, estimatedTime: number, selectedDate?: Date) => void;
}

const TaskInput: React.FC<TaskInputProps> = ({ onAddTask }) => {
  const [name, setName] = useState('');
  const [minutes, setMinutes] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isExpanded, setIsExpanded] = useState(false);

  // Generar los próximos 7 días
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

  // Formatear fecha para mostrar
  const formatDate = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return { main: date.getDate().toString(), sub: 'Hoy' };
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return { main: date.getDate().toString(), sub: 'Mañ' };
    } else {
      return { 
        main: date.getDate().toString(), 
        sub: date.toLocaleDateString('es', { weekday: 'short' }).slice(0, 3)
      };
    }
  };

  // Formatear mes
  const formatMonth = (date: Date) => {
    return date.toLocaleDateString('es', { month: 'short' }).slice(0, 3);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && parseInt(minutes, 10) > 0) {
      onAddTask(name.trim(), parseInt(minutes, 10) * 60, selectedDate);
      setName('');
      setMinutes('');
      setIsExpanded(false);
    }
  };

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

        {/* Selector de fechas */}
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
                  isSelected
                    ? 'bg-purple-500 text-white shadow-lg scale-105'
                    : isToday
                    ? 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span className="text-xs font-medium opacity-75">
                  {formatMonth(date)}
                </span>
                <span className="text-lg font-bold">
                  {dateInfo.main}
                </span>
                <span className="text-xs font-medium opacity-75">
                  {dateInfo.sub}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Botón para expandir formulario */}
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

      {/* Formulario expandido */}
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
            {/* Input de nombre */}
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

            {/* Input de tiempo */}
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

            {/* Fecha seleccionada */}
            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl border border-purple-200">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                <CalendarIcon className="w-4 h-4 text-white" />
              </div>
              <div>
                <span className="text-sm text-purple-600 font-medium">Programada para:</span>
                <p className="text-purple-900 font-semibold">
                  {selectedDate.toLocaleDateString('es', { 
                    weekday: 'long', 
                    day: 'numeric', 
                    month: 'long' 
                  })}
                </p>
              </div>
            </div>

            {/* Botones de acción */}
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
                className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
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