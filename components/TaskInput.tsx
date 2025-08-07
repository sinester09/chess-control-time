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
    <div className="relative mb-6 overflow-hidden rounded-2xl">
      {/* Fondo más oscuro y sin gradiente animado vibrante */}
      {/* Usamos un color oscuro directo o un gradiente muy sutil si prefieres un toque de profundidad */}
      <div className="absolute inset-0 bg-gray-800 opacity-95"></div> 
      
      {/* Overlay con efecto glassmorphism */}
      {/* Mantenemos este para el efecto de cristal, ajustando la opacidad si es necesario */}
      <div className="absolute inset-0 bg-white/5 backdrop-blur-xl"></div>
      
      {/* Contenido */}
      <form onSubmit={handleSubmit} className="relative z-10 flex flex-col sm:flex-row gap-4 p-6">
        <div className="flex-grow relative group">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nuevo nombre de tarea..."
            // Texto más grande y color de texto ajustado para el fondo oscuro
            className="w-full bg-white/10 backdrop-blur-sm border-2 border-white/20 hover:border-white/40 focus:border-white/60 rounded-xl px-6 py-3 text-white placeholder-gray-300 font-medium text-lg focus:ring-4 focus:ring-white/20 focus:outline-none transition-all duration-300 shadow-lg hover:shadow-xl group-hover:bg-white/15"
            required
          />
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none"></div>
        </div>
        
        <div className="relative group">
          <input
            type="number"
            value={minutes}
            onChange={(e) => setMinutes(e.target.value)}
            placeholder="Minutos"
            // Texto más grande y color de texto ajustado para el fondo oscuro
            className="w-full sm:w-36 bg-white/10 backdrop-blur-sm border-2 border-white/20 hover:border-white/40 focus:border-white/60 rounded-xl px-6 py-3 text-white placeholder-gray-300 font-medium text-lg focus:ring-4 focus:ring-white/20 focus:outline-none transition-all duration-300 shadow-lg hover:shadow-xl group-hover:bg-white/15"
            min="1"
            required
          />
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none"></div>
        </div>
        
        <button 
          type="submit" 
          // Ajustamos los colores del botón para que combinen con el nuevo fondo oscuro
          className="group relative overflow-hidden flex items-center justify-center gap-3 bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-600 hover:to-purple-700 text-white font-bold py-3 px-8 rounded-xl transition-all duration-300 ease-out transform hover:scale-105 active:scale-95 shadow-xl hover:shadow-2xl border-2 border-white/30 hover:border-white/50"
        >
          {/* Efecto de brillo en el botón */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
          
          <div className="relative flex items-center gap-3">
            <div className="p-1 bg-white/20 rounded-full group-hover:bg-white/30 transition-colors duration-300">
              <PlusIcon className="w-5 h-5 text-white" />
            </div>
            <span className="hidden sm:inline font-semibold text-lg">Agregar Tarea</span> {/* Agrandamos el texto del botón */}
            <span className="sm:hidden font-semibold text-lg">Agregar</span> {/* Agrandamos el texto del botón */}
          </div>
          
          {/* Efecto de ondas al hacer click */}
          <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-active:opacity-100 group-active:animate-ping"></div>
        </button>
      </form>
      
      {/* Efectos decorativos - ajustamos los colores para que se vean en el fondo oscuro */}
      <div className="absolute top-2 left-6 w-2 h-2 bg-white/80 rounded-full animate-pulse"></div>
      <div className="absolute top-4 right-8 w-1 h-1 bg-white/60 rounded-full animate-pulse delay-300"></div>
      <div className="absolute bottom-3 left-12 w-1.5 h-1.5 bg-white/70 rounded-full animate-pulse delay-700"></div>
    </div>
  );
};

export default TaskInput;
