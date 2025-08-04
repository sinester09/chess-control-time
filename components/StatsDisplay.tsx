import React from 'react';
import { Task } from '../types';
import { TrophyIcon, CoffeeIcon, ClockIcon } from './icons';

// Función para formatear segundos en formato HH:MM:SS
const formatWorkTime = (totalSeconds: number): string => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

interface StatsDisplayProps {
  points: number;
  activePauses: number;
  totalWorkTime: number; // in seconds
  tasks?: Task[]; // Lista de tareas opcional para mostrar estadísticas adicionales
}

const StatsDisplay: React.FC<StatsDisplayProps> = ({ points, activePauses, totalWorkTime, tasks = [] }) => {
  // Función para formatear el tiempo de trabajo
  const formatWorkTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${remainingSeconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      return `${remainingSeconds}s`;
    }
  };

  // Calcular estadísticas adicionales
  const completedTasks = tasks.filter(task => task.isCompleted).length;
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  // Calcular tiempo promedio por tarea completada
  const completedTasksArray = tasks.filter(task => task.isCompleted);
  const avgTimePerTask = completedTasksArray.length > 0 
    ? Math.round(completedTasksArray.reduce((sum, task) => sum + task.elapsedTime, 0) / completedTasksArray.length)
    : 0;
  
  // Calcular tiempo de pausa estimado (asumiendo que cada pausa dura aproximadamente 5 minutos)
  const estimatedPauseTime = activePauses * 5 * 60; // en segundos

  return (
    <div className="flex flex-col gap-4 mb-6">
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 shadow-lg">
        <h2 className="text-xl font-bold text-cyan-400 mb-4 text-center">Estadísticas</h2>
        <div className="flex flex-col sm:flex-row justify-around items-center gap-4">
          <div className="flex flex-col items-center p-3 bg-slate-700/50 rounded-lg w-full sm:w-1/3">
            <TrophyIcon className="w-10 h-10 text-amber-400 mb-2" />
            <span className="text-3xl font-bold">{points}</span>
            <span className="text-sm text-slate-400">Puntos Ganados</span>
            <span className="text-xs text-slate-500 mt-1">{completedTasks}/{totalTasks} tareas ({completionRate}%)</span>
          </div>
          <div className="flex flex-col items-center p-3 bg-slate-700/50 rounded-lg w-full sm:w-1/3">
            <ClockIcon className="w-10 h-10 text-cyan-400 mb-2" />
            <span className="text-3xl font-bold font-mono">{formatWorkTime(totalWorkTime)}</span>
            <span className="text-sm text-slate-400">Tiempo Activo</span>
            <span className="text-xs text-slate-500 mt-1">Promedio: {formatWorkTime(avgTimePerTask)}/tarea</span>
          </div>
          <div className="flex flex-col items-center p-3 bg-slate-700/50 rounded-lg w-full sm:w-1/3">
            <CoffeeIcon className="w-10 h-10 text-lime-400 mb-2" />
            <span className="text-3xl font-bold">{activePauses}</span>
            <span className="text-sm text-slate-400">Pausas Tomadas</span>
            <span className="text-xs text-slate-500 mt-1">Tiempo: ~{formatWorkTime(estimatedPauseTime)}</span>
          </div>
        </div>
      </div>
      
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 shadow-lg">
        <h3 className="text-lg font-semibold text-cyan-400 mb-3">Detalles de Productividad</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-slate-700/50 rounded-lg p-3">
            <h4 className="text-sm font-medium text-slate-300 mb-2">Tiempo de Trabajo</h4>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-slate-400">Tiempo total:</span>
              <span className="text-sm font-medium text-white">{formatWorkTime(totalWorkTime)}</span>
            </div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-slate-400">Tiempo promedio por tarea:</span>
              <span className="text-sm font-medium text-white">{formatWorkTime(avgTimePerTask)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-400">Tiempo estimado de pausas:</span>
              <span className="text-sm font-medium text-white">{formatWorkTime(estimatedPauseTime)}</span>
            </div>
          </div>
          
          <div className="bg-slate-700/50 rounded-lg p-3">
            <h4 className="text-sm font-medium text-slate-300 mb-2">Tareas y Puntos</h4>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-slate-400">Tareas completadas:</span>
              <span className="text-sm font-medium text-white">{completedTasks} de {totalTasks}</span>
            </div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-slate-400">Tasa de finalización:</span>
              <span className="text-sm font-medium text-white">{completionRate}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-400">Puntos ganados:</span>
              <span className="text-sm font-medium text-white">{points}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsDisplay;