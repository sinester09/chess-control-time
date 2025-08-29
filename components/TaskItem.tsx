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
  
  // MANTENGO LA LÓGICA ORIGINAL EXACTA
  const isOverTime = elapsedTime > (estimatedTime + toleranceTime) && estimatedTime > 0;
  const progressPercentage = estimatedTime > 0 ? Math.min((elapsedTime / estimatedTime) * 100, 100) : 0;
  
  // Calcular el tiempo restante de forma más precisa
  const remainingTime = Math.max(0, estimatedTime - elapsedTime);
  const isNearingDeadline = remainingTime > 0 && remainingTime <= 300; // 5 minutos o menos

  // Determinar el color base según el estado (mantengo la lógica original)
  const getTaskColor = () => {
    if (task.isActive) return 'blue'; // Azul para activas
    if (task.isCompleted) return 'gray'; // Gris para completadas
    return 'purple'; // Púrpura para pendientes
  };

  const baseColor = getTaskColor();

  // Colores para diferentes estados
  const colorClasses = {
    blue: {
      bg: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
      accent: 'bg-blue-500',
      text: 'text-blue-700',
      badge: 'bg-blue-100 text-blue-700'
    },
    purple: {
      bg: 'bg-purple-50 border-purple-200 hover:bg-purple-100',
      accent: 'bg-purple-500',
      text: 'text-purple-700',
      badge: 'bg-purple-100 text-purple-700'
    },
    gray: {
      bg: 'bg-gray-50 border-gray-200 hover:bg-gray-100',
      accent: 'bg-gray-400',
      text: 'text-gray-600',
      badge: 'bg-gray-100 text-gray-600'
    }
  };

  const currentColors = colorClasses[baseColor];

  return (
    <div className={`relative bg-white border-2 rounded-2xl p-4 mb-3 shadow-sm hover:shadow-md transition-all duration-300 ${currentColors.bg} overflow-hidden`}>
      {/* Barra de progreso - MANTENGO LÓGICA ORIGINAL */}
      {estimatedTime > 0 && (
        <div className="absolute top-0 left-0 right-0 h-1">
          <div 
            className={`h-full transition-all duration-500 ease-linear rounded-t-2xl ${
              isOverTime ? 'bg-red-500' : currentColors.accent
            }`}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      )}

      {/* Indicador de color en el borde izquierdo */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${
        isOverTime ? 'bg-red-500' : currentColors.accent
      } rounded-l-2xl`} />

      <div className="flex items-center justify-between gap-4 ml-3">
        {/* Contenido principal */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            {/* Nombre de la tarea - MANTENGO LÓGICA ORIGINAL */}
            <h3 className={`font-semibold text-lg leading-tight ${
              task.isCompleted ? 'line-through text-gray-500' : 'text-gray-900'
            }`}>
              {task.name}
            </h3>
            
            {/* Estado de la tarea */}
            <div className="flex items-center gap-2 ml-4">
              {task.isActive && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  Corriendo
                </div>
              )}
            </div>
          </div>

          {/* Información de tiempo - MANTENGO TODA LA LÓGICA ORIGINAL */}
          <div className="flex items-center gap-3 text-sm mb-2">
            <div className="flex items-center gap-1.5">
              <ClockIcon className="w-4 h-4 text-gray-400" />
              {/* MANTENGO LOS COLORES EXACTOS DEL CÓDIGO ORIGINAL */}
              <span className={`font-mono text-sm ${
                isOverTime ? 'text-red-600 font-bold' : 
                isNearingDeadline ? 'text-yellow-600 font-bold' : 
                'text-gray-700'
              }`}>
                {formatTime(elapsedTime)} / {formatTime(estimatedTime)}
              </span>
            </div>
            
            {/* MANTENGO EXACTAMENTE LA LÓGICA DE BADGES ORIGINALES */}
            {!task.isCompleted && remainingTime > 0 && (
              <div className="flex items-center gap-1 text-xs font-medium rounded-full px-2 py-0.5 bg-gray-100">
                <ClockIcon className="w-3 h-3 text-teal-500" />
                <span className={`${isNearingDeadline ? 'text-yellow-600' : 'text-teal-600'}`}>
                  {formatTime(remainingTime)} falta
                </span>
              </div>
            )}
            
            {!task.isCompleted && remainingTime === 0 && estimatedTime > 0 && (
              <div className="flex items-center gap-1 text-xs font-medium rounded-full px-2 py-0.5 bg-red-100">
                <ClockIcon className="w-3 h-3 text-red-600" />
                <span className="text-red-600">
                  ¡Ya pasó el tiempo!
                </span>
              </div>
            )}
          </div>

          {/* Timestamps - MANTENGO FORMATO ORIGINAL */}
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span>Creada: {formatTimestamp(task.createdAt)}</span>
            {task.isCompleted && task.completedAt && (
              <span>• Completada: {formatTimestamp(task.completedAt)}</span>
            )}
          </div>
        </div>

        {/* Botones de acción - MANTENGO LÓGICA ORIGINAL */}
        <div className="flex items-center gap-2">
          {!task.isCompleted && (
            <>
              <button 
                onClick={() => onToggle(task.id)} 
                className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 ${
                  task.isActive 
                    ? 'bg-yellow-100 hover:bg-yellow-200 text-yellow-700' // Pausar
                    : 'bg-teal-100 hover:bg-teal-200 text-teal-700' // Empezar
                }`}
                title={task.isActive ? 'Pausar' : 'Empezar'}
              >
                {task.isActive ? (
                  <PauseIcon className="w-5 h-5" />
                ) : (
                  <PlayIcon className="w-5 h-5" />
                )}
              </button>
              
              <button 
                onClick={() => onComplete(task.id)} 
                className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100 hover:bg-purple-200 text-purple-700 transition-all duration-200"
                title="Completar tarea"
              >
                <CheckIcon className="w-5 h-5" />
              </button>
            </>
          )}
          
          <button 
            onClick={() => onDelete(task.id)} 
            className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-red-100 hover:text-red-700 text-gray-500 transition-all duration-200"
            title="Eliminar tarea"
          >
            <TrashIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Barra de progreso visual en la parte inferior - MANTENGO LÓGICA ORIGINAL */}
      {estimatedTime > 0 && !task.isCompleted && (
        <div className="mt-3 bg-gray-200 rounded-full h-2 overflow-hidden">
          <div 
            className={`h-full transition-all duration-500 ease-linear ${
              isOverTime ? 'bg-red-500' : currentColors.accent
            }`}
            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
          />
        </div>
      )}
    </div>
  );
};

export default TaskItem;