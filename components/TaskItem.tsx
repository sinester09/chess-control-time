import React from 'react';
import { Task } from '../types';
import { PlayIcon, PauseIcon, CheckIcon, TrashIcon, ClockIcon } from './icons';

// Función para formatear segundos en formato MM:SS
const formatTime = (totalSeconds: number): string => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

// Función para formatear timestamp a hora local
const formatTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

interface TaskItemProps {
  task: Task;
  onToggle: (id: number) => void;
  onComplete: (id: number) => void;
  onDelete: (id: number) => void;
  toleranceTime?: number; // Tiempo de tolerancia en segundos
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onToggle, onComplete, onDelete, toleranceTime = 300 }) => {
  // Asegurar que los valores sean números válidos
  const elapsedTime = Math.max(0, Math.floor(task.elapsedTime || 0));
  const estimatedTime = Math.max(0, Math.floor(task.estimatedTime || 0));
  
  const isOverTime = elapsedTime > (estimatedTime + toleranceTime) && estimatedTime > 0;
  const progressPercentage = estimatedTime > 0 ? Math.min((elapsedTime / estimatedTime) * 100, 100) : 0;
  
  // Calcular el tiempo restante de forma más precisa
  const remainingTime = Math.max(0, estimatedTime - elapsedTime);
  const isNearingDeadline = remainingTime > 0 && remainingTime <= 300; // 5 minutos o menos

  const baseClasses = "relative p-4 mb-3 rounded-lg shadow-md transition-all duration-300 overflow-hidden";
  
  // Ajustes clave para la visibilidad:
  // - Fondo más oscuro para tareas completadas
  // - Colores de texto por defecto más claros para alto contraste
  const stateClasses = task.isActive 
    ? "bg-green-800/50 border-2 border-green-500" 
    : task.isCompleted 
    // Cambiamos a un gris más oscuro y sin opacidad para mejor contraste
    ? "bg-gray-800/70 border-2 border-gray-700" 
    // Fondo oscuro para tareas pendientes/normales
    : "bg-gray-800 hover:bg-gray-700";

  return (
    <div className={`${baseClasses} ${stateClasses}`}>
        {/* Barra de progreso: ajustamos el color a un tono más profesional (teal) */}
        <div 
            className={`absolute top-0 left-0 h-full transition-all duration-500 ease-linear ${isOverTime ? 'bg-red-600/40' : 'bg-teal-500/30'}`}
            style={{ width: `${progressPercentage}%` }}
        ></div>
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex-grow text-center sm:text-left">
                {/* Nombre de la tarea: texto blanco por defecto, gris claro si completada */}
                <p className={`text-lg font-semibold ${task.isCompleted ? 'line-through text-gray-400' : 'text-white'}`}>
                    {task.name}
                </p>
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        {/* Tiempo transcurrido/estimado: texto blanco por defecto, colores de alerta */}
                        <p className={`text-sm font-mono ${isOverTime ? 'text-red-400 font-bold' : isNearingDeadline ? 'text-yellow-400 font-bold' : 'text-gray-300'}`}>
                            {formatTime(elapsedTime)} / {formatTime(estimatedTime)}
                        </p>
                        {!task.isCompleted && remainingTime > 0 && (
                            <div className="flex items-center gap-1 text-xs font-medium rounded-full px-2 py-0.5 bg-gray-700">
                                <ClockIcon className="w-3 h-3 text-teal-400" />
                                <span className={`${isNearingDeadline ? 'text-yellow-400' : 'text-teal-400'}`}>
                                    {formatTime(remainingTime)} falta
                                </span>
                            </div>
                        )}
                        {!task.isCompleted && remainingTime === 0 && estimatedTime > 0 && (
                            <div className="flex items-center gap-1 text-xs font-medium rounded-full px-2 py-0.5 bg-red-800">
                                <ClockIcon className="w-3 h-3 text-red-400" />
                                <span className="text-red-400">
                                  ¡ Ya pasó el tiempo !
                                </span>
                            </div>
                        )}
                        {task.isActive && (
                            <div className="flex items-center gap-1 text-xs font-medium rounded-full px-2 py-0.5 bg-green-700">
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                <span className="text-green-400">Corriendo</span>
                            </div>
                        )}
                    </div>
                    {/* Timestamps de creación/completado: texto gris más claro */}
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                        <span>Creada: {formatTimestamp(task.createdAt)}</span>
                        {task.isCompleted && task.completedAt && (
                            <span>• Completada: {formatTimestamp(task.completedAt)}</span>
                        )}
                    </div>
                </div>
            </div>
            
            <div className="flex items-center gap-2">
                {!task.isCompleted && (
                    <>
                        {/* Botones de acción: colores más consistentes con la paleta */}
                        <button 
                            onClick={() => onToggle(task.id)} 
                            className={`p-2 rounded-full transition-colors duration-200 ${
                                task.isActive 
                                    ? 'bg-yellow-600/20 hover:bg-yellow-600/40 text-yellow-400' // Pausar
                                    : 'bg-teal-600/20 hover:bg-teal-600/40 text-teal-400' // Empezar
                            }`}
                            title={task.isActive ? 'Pausar' : 'Empezar'}
                        >
                            {task.isActive ? <PauseIcon className="w-6 h-6" /> : <PlayIcon className="w-6 h-6" />}
                        </button>
                        <button 
                            onClick={() => onComplete(task.id)} 
                            className="p-2 rounded-full bg-purple-600/20 hover:bg-purple-600/40 text-purple-400 transition-colors duration-200"
                            title="Completar tarea"
                        >
                            <CheckIcon className="w-6 h-6" />
                        </button>
                    </>
                )}
                <button 
                    onClick={() => onDelete(task.id)} 
                    className="p-2 rounded-full bg-red-600/20 hover:bg-red-600/40 text-red-400 transition-colors duration-200"
                    title="Eliminar tarea"
                >
                    <TrashIcon className="w-6 h-6" />
                </button>
            </div>
        </div>
    </div>
  );
};

export default TaskItem;
