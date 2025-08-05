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
  const stateClasses = task.isActive 
    ? "bg-green-800/50 border-2 border-green-500" 
    : task.isCompleted 
    ? "bg-slate-700/50 opacity-60" 
    : "bg-slate-800 hover:bg-slate-700/50";

  return (
    <div className={`${baseClasses} ${stateClasses}`}>
        <div 
            className={`absolute top-0 left-0 h-full transition-all duration-500 ease-linear ${isOverTime ? 'bg-red-500/40' : 'bg-cyan-500/30'}`}
            style={{ width: `${progressPercentage}%` }}
        ></div>
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex-grow text-center sm:text-left">
                <p className={`text-lg font-semibold ${task.isCompleted ? 'line-through text-slate-400' : ''}`}>
                    {task.name}
                </p>
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <p className={`text-sm font-mono ${isOverTime ? 'text-red-400 font-bold' : isNearingDeadline ? 'text-yellow-400 font-bold' : 'text-slate-400'}`}>
                            {formatTime(elapsedTime)} / {formatTime(estimatedTime)}
                        </p>
                        {!task.isCompleted && remainingTime > 0 && (
                            <div className="flex items-center gap-1 text-xs font-medium rounded-full px-2 py-0.5 bg-slate-700">
                                <ClockIcon className="w-3 h-3 text-cyan-400" />
                                <span className={`${isNearingDeadline ? 'text-yellow-400' : 'text-cyan-400'}`}>
                                    {formatTime(remainingTime)} left
                                </span>
                            </div>
                        )}
                        {!task.isCompleted && remainingTime === 0 && estimatedTime > 0 && (
                            <div className="flex items-center gap-1 text-xs font-medium rounded-full px-2 py-0.5 bg-red-800">
                                <ClockIcon className="w-3 h-3 text-red-400" />
                                <span className="text-red-400">
                                    Time's up!
                                </span>
                            </div>
                        )}
                        {task.isActive && (
                            <div className="flex items-center gap-1 text-xs font-medium rounded-full px-2 py-0.5 bg-green-700">
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                <span className="text-green-400">Running</span>
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
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
                        <button 
                            onClick={() => onToggle(task.id)} 
                            className={`p-2 rounded-full transition-colors duration-200 ${
                                task.isActive 
                                    ? 'bg-yellow-500/20 hover:bg-yellow-500/40 text-yellow-400' 
                                    : 'bg-green-500/20 hover:bg-green-500/40 text-green-400'
                            }`}
                            title={task.isActive ? 'Pause task' : 'Start task'}
                        >
                            {task.isActive ? <PauseIcon className="w-6 h-6" /> : <PlayIcon className="w-6 h-6" />}
                        </button>
                        <button 
                            onClick={() => onComplete(task.id)} 
                            className="p-2 rounded-full bg-blue-500/20 hover:bg-blue-500/40 text-blue-400 transition-colors duration-200"
                            title="Complete task"
                        >
                            <CheckIcon className="w-6 h-6" />
                        </button>
                    </>
                )}
                <button 
                    onClick={() => onDelete(task.id)} 
                    className="p-2 rounded-full bg-red-500/20 hover:bg-red-500/40 text-red-400 transition-colors duration-200"
                    title="Delete task"
                >
                    <TrashIcon className="w-6 h-6" />
                </button>
            </div>
        </div>
    </div>
  );
};

export default TaskItem;