import React, { useState, useEffect, useRef } from 'react';
import { Task } from '../types';
import { PlayIcon, PauseIcon, CheckIcon } from './icons';

// Función para formatear segundos en formato MM:SS
const formatTime = (totalSeconds: number): string => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

interface FocusModeProps {
  task: Task;
  onToggle: (taskId: string) => void;
  onComplete: (taskId: string) => void;
  onExitFocusMode: () => void;
  pomodoroTimer: number; // en minutos
}

const FocusMode: React.FC<FocusModeProps> = ({
  task,
  onToggle,
  onComplete,
  onExitFocusMode,
  pomodoroTimer
}) => {
  const [timeLeft, setTimeLeft] = useState<number>(pomodoroTimer * 60); // Convertir a segundos
  const [isTimerActive, setIsTimerActive] = useState<boolean>(false);
  const [timerCompleted, setTimerCompleted] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Inicializar el audio
  useEffect(() => {
    audioRef.current = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3');
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Manejar el temporizador
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isTimerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && !timerCompleted) {
      setTimerCompleted(true);
      setIsTimerActive(false);
      // Reproducir sonido de notificación
      if (audioRef.current) {
        audioRef.current.play().catch(error => console.error('Error playing audio:', error));
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerActive, timeLeft, timerCompleted]);

  // Formatear el tiempo restante para mostrar
  const formattedTimeLeft = () => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Reiniciar el temporizador
  const resetTimer = () => {
    setTimeLeft(pomodoroTimer * 60);
    setTimerCompleted(false);
    setIsTimerActive(false);
  };

  // Alternar el temporizador
  const toggleTimer = () => {
    setIsTimerActive(prev => !prev);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-lg z-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-800 rounded-xl shadow-2xl p-8 border border-cyan-500/30">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-lime-400">
            Modo Enfoque
          </h2>
          <button
            onClick={onExitFocusMode}
            className="text-slate-400 hover:text-cyan-400 transition-colors duration-200"
            aria-label="Salir del modo enfoque"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-8 text-center">
          <h3 className="text-xl font-semibold text-white mb-2">Tarea Actual</h3>
          <p className="text-2xl font-bold text-cyan-400 mb-4">{task.name}</p>
          <div className="flex justify-center gap-4 text-sm">
            <span className="text-slate-300">
              Tiempo estimado: {formatTime(task.estimatedTime)}
            </span>
            <span className="text-slate-300">
              Tiempo transcurrido: {formatTime(task.elapsedTime)}
            </span>
          </div>
        </div>
        
        <div className="text-center mb-8">
          <div className="text-6xl font-mono font-bold text-white mb-4">
            {formattedTimeLeft()}
          </div>
          <div className="flex justify-center gap-4">
            <button 
              onClick={toggleTimer} 
              className={`flex items-center justify-center p-3 rounded-full ${isTimerActive ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'} hover:bg-opacity-40 transition-colors duration-200`}
              aria-label={isTimerActive ? 'Pausar temporizador' : 'Iniciar temporizador'}
            >
              {isTimerActive ? <PauseIcon className="w-6 h-6" /> : <PlayIcon className="w-6 h-6" />}
            </button>
            <button 
              onClick={resetTimer} 
              className="flex items-center justify-center p-3 rounded-full bg-slate-600/20 text-slate-400 hover:bg-slate-600/40 transition-colors duration-200"
              aria-label="Reiniciar temporizador"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>
        
        <div className="flex justify-between">
          <button
            onClick={() => onToggle(task.id)}
            className={`flex items-center gap-2 p-2 px-4 rounded-lg transition-colors duration-200 ${task.isActive ? 'bg-red-500/20 text-red-400 hover:bg-red-500/40' : 'bg-green-500/20 text-green-400 hover:bg-green-500/40'}`}
          >
            {task.isActive ? <PauseIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5" />}
            <span>{task.isActive ? 'Pausar tarea' : 'Reanudar tarea'}</span>
          </button>
          <button
            onClick={() => onComplete(task.id)}
            className="flex items-center gap-2 p-2 px-4 bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/40 rounded-lg transition-colors duration-200"
          >
            <CheckIcon className="w-5 h-5" />
            <span>Completar tarea</span>
          </button>
        </div>

        {timerCompleted && (
          <div className="mt-6 p-4 bg-indigo-500/20 text-indigo-300 rounded-lg">
            <p className="text-center font-medium">¡Tiempo completado! Toma un descanso antes de continuar.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FocusMode;