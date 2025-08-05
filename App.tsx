import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Task, Settings } from './types';
import TaskInput from './components/TaskInput';
import TaskList from './components/TaskList';
import StatsDisplay from './components/StatsDisplay';
import PauseReminderModal from './components/PauseReminderModal';
import SettingsModal from './components/SettingsModal';
import AdvancedSettingsModal from './components/AdvancedSettingsModal';
import StartDayScreen from './components/StartDayScreen';
import FocusMode from './components/FocusMode';
import { SettingsIcon, StopCircleIcon, DownloadIcon, UploadIcon, PlayCircleIcon, FocusIcon, MenuIcon } from './components/icons';

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [points, setPoints] = useState<number>(0);
  const [activePauses, setActivePauses] = useState<number>(0);
  const [totalWorkTime, setTotalWorkTime] = useState<number>(0);
  
  const [showPauseReminder, setShowPauseReminder] = useState<boolean>(false);
  const [workDay, setWorkDay] = useState<{ start: string; end: string } | null>(null);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);

  const [isDayStarted, setIsDayStarted] = useState<boolean>(false);
  const [snoozeUntil, setSnoozeUntil] = useState<number | null>(null);
  
  // Configuración de la aplicación
  const [settings, setSettings] = useState<Settings>({
    toleranceTime: 300, // 5 minutos en segundos por defecto
    pauseInterval: 2 * 60 * 60, // 2 horas en segundos por defecto
    pauseDuration: 15, // 15 minutos por defecto
    snoozeDuration: 15, // 15 minutos por defecto
    focusModeEnabled: false, // Modo de enfoque desactivado por defecto
    pomodoroTimer: 25 // 25 minutos por defecto para el temporizador pomodoro
  });
  
  // Estado para mostrar el modal de configuración avanzada
  const [showAdvancedSettings, setShowAdvancedSettings] = useState<boolean>(false);
  
  // Estado para el menú desplegable
  const [showMenu, setShowMenu] = useState<boolean>(false);

  // Ref para mantener el estado actualizado de las tareas (si es necesario)
  const tasksRef = useRef(tasks);
  tasksRef.current = tasks;

  // Ref para el timer
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Main task timer effect - ULTRA LIMPIO
  useEffect(() => {
    // Limpiar timer anterior si existe
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    if (!isDayStarted) return;

    timerRef.current = setInterval(() => {
      setTasks(prevTasks => {
        const activeTask = prevTasks.find(task => task.isActive && !task.isCompleted);
        
        if (activeTask) {
          // Actualizar tiempo total de trabajo (1 segundo por tick)
          setTotalWorkTime(prev => prev + 1);
          
          // Actualizar tareas con 1 segundo adicional
          return prevTasks.map(task => {
            if (task.id === activeTask.id) {
              const newElapsedTime = task.elapsedTime + 1;
              
              // Verificar si se excedió el tiempo estimado
              console.log(newElapsedTime);
              if (newElapsedTime > (task.estimatedTime + settings.toleranceTime) && !task.timeExceededNotified) {
                const toleranceMinutes = Math.floor(settings.toleranceTime / 60);
                setTimeout(() => {
                  alert(`Task "${task.name}" has exceeded its estimated time by more than ${toleranceMinutes} minutes!`);
                }, 0);
                return { ...task, elapsedTime: newElapsedTime, timeExceededNotified: true };
              }
              
              return { ...task, elapsedTime: newElapsedTime };
            }
            return task;
          });
        }
        
        return prevTasks; // No hay tarea activa, no cambiar nada
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isDayStarted, settings.toleranceTime]);

  // Effect to show settings modal on first load if workday is not set
  useEffect(() => {
    if (!workDay) {
      setShowSettingsModal(true);
    }
  }, [workDay]);

  // Accurate pause reminder effect based on effective work time
  useEffect(() => {
    if (!isDayStarted || showPauseReminder || (snoozeUntil && Date.now() < snoozeUntil)) {
      return;
    }
  
    const breaksDue = Math.floor(totalWorkTime / settings.pauseInterval);
  
    if (breaksDue > activePauses) {
      setShowPauseReminder(true);
    }
  }, [totalWorkTime, activePauses, isDayStarted, showPauseReminder, snoozeUntil, settings.pauseInterval]);

  const handleAddTask = (name: string, estimatedTime: number) => {
    const now = Date.now();
    const newTask: Task = {
      id: now,
      name,
      estimatedTime,
      elapsedTime: 0,
      isActive: false,
      isCompleted: false,
      timeExceededNotified: false,
      createdAt: now
    };
    setTasks(prevTasks => [...prevTasks, newTask]);
  };

  const handleToggleTask = useCallback((id: number) => {
    setTasks(prevTasks =>
      prevTasks.map(task => {
        if (task.isCompleted) return task;
        if (task.id === id) {
          return { ...task, isActive: !task.isActive };
        }
        return { ...task, isActive: false };
      })
    );
  }, []);

  const handleCompleteTask = useCallback((id: number) => {
    const now = Date.now();
    setTasks(prevTasks =>
      prevTasks.map(task => {
        if (task.id === id) {
          if (!task.isCompleted) {
            if (task.elapsedTime <= task.estimatedTime) {
              setPoints(prevPoints => prevPoints + 1);
            }
          }
          return { 
            ...task, 
            isActive: false, 
            isCompleted: true,
            completedAt: now
          };
        }
        return task;
      })
    );
  }, []);

  const handleDeleteTask = useCallback((id: number) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
  }, []);

  const handleConfirmPause = () => {
    setActivePauses(prev => prev + 1);
    setShowPauseReminder(false);
    setSnoozeUntil(null); // Clear snooze when a break is confirmed
  };
  
  const handleSnoozePause = () => {
    const snoozeDurationMs = settings.snoozeDuration * 60 * 1000; // Convertir minutos a milisegundos
    setSnoozeUntil(Date.now() + snoozeDurationMs);
    setShowPauseReminder(false);
  };

  const handleSaveSettings = (start: string, end: string) => {
    setWorkDay({ start, end });
    setShowSettingsModal(false);
    if(isDayStarted) {
      setIsDayStarted(false);
      setTasks(prevTasks => prevTasks.map(task => ({ ...task, isActive: false })));
      alert("Workday settings updated. Please start a new day to apply the changes.");
    }
  };

  const handleCloseSettings = () => {
    if (workDay) {
      setShowSettingsModal(false);
    }
  };
  
  const handleSaveAdvancedSettings = (newSettings: Settings) => {
    setSettings(newSettings);
    setShowAdvancedSettings(false);
  };
  
  const handleCloseAdvancedSettings = () => {
    setShowAdvancedSettings(false);
  };

  const handleStartDay = () => {
    // Reset all daily stats
    setPoints(0);
    setActivePauses(0);
    setTotalWorkTime(0);
    setSnoozeUntil(null);

    // Clean up tasks for the new day:
    // - Filter out tasks that were completed on the previous day.
    // - Ensure all remaining (pending) tasks are inactive.
    setTasks(prevTasks => 
        prevTasks
            .filter(task => !task.isCompleted)
            .map(task => ({ ...task, isActive: false }))
    );

    setIsDayStarted(true);
  };

  const handleEndDay = () => {
    if (window.confirm("Are you sure you want to end your workday? All timers will stop. Completed tasks will be cleared when you start the next day.")) {
      setIsDayStarted(false);
      setTasks(prevTasks =>
        prevTasks.map(task => ({ ...task, isActive: false }))
      );
    }
  };
  
  // Función para exportar datos
  const handleExportData = () => {
    const data = {
      tasks,
      points,
      activePauses,
      totalWorkTime,
      workDay,
      settings
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const exportFileDefaultName = `taskflow-data-${new Date().toISOString().slice(0, 10)}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };
  
  // Función para importar datos
  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (event.target.files && event.target.files.length > 0) {
      fileReader.readAsText(event.target.files[0], "UTF-8");
      fileReader.onload = e => {
        if (e.target && typeof e.target.result === 'string') {
          try {
            const data = JSON.parse(e.target.result);
            
            // Validar que el archivo tenga la estructura correcta
            if (data.tasks && Array.isArray(data.tasks)) {
              setTasks(data.tasks);
              if (typeof data.points === 'number') setPoints(data.points);
              if (typeof data.activePauses === 'number') setActivePauses(data.activePauses);
              if (typeof data.totalWorkTime === 'number') setTotalWorkTime(data.totalWorkTime);
              if (data.workDay) setWorkDay(data.workDay);
              if (data.settings) setSettings(data.settings);
              
              alert('Data imported successfully!');
            } else {
              alert('Invalid data format. Could not import.');
            }
          } catch (error) {
            console.error('Error parsing JSON:', error);
            alert('Error importing data. Please check the file format.');
          }
        }
      };
      fileReader.onerror = () => {
        alert('Error reading file.');
      };
    }
  };
  
  // Referencia al input de archivo oculto
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Función para abrir el selector de archivos
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  // Función para activar/desactivar el modo de enfoque
  const toggleFocusMode = () => {
    setSettings(prev => ({
      ...prev,
      focusModeEnabled: !prev.focusModeEnabled
    }));
    setShowMenu(false); // Cerrar el menú al activar/desactivar el modo de enfoque
  };
  
  // Función para cerrar el menú desplegable
  const closeMenu = () => {
    setShowMenu(false);
  };
  
  // Obtener la tarea activa actual
  const activeTask = tasks.find(task => task.isActive && !task.isCompleted) || null;

  return (
    <>
      <PauseReminderModal 
        show={showPauseReminder} 
        onConfirm={handleConfirmPause} 
        onClose={handleSnoozePause} 
        pauseDuration={settings.pauseDuration}
      />
      <SettingsModal
        show={showSettingsModal}
        onSave={handleSaveSettings}
        onClose={handleCloseSettings}
        initialWorkDay={workDay}
      />
      <AdvancedSettingsModal
        show={showAdvancedSettings}
        onSave={handleSaveAdvancedSettings}
        onClose={handleCloseAdvancedSettings}
        initialSettings={settings}
      />
      
      {/* Input de archivo oculto para importar datos */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleImportData} 
        style={{ display: 'none' }} 
        accept=".json" 
      />
      
      {/* Modo de enfoque */}
      {settings.focusModeEnabled && activeTask ? (
        <FocusMode 
          task={activeTask} 
          onToggle={handleToggleTask}
          onComplete={handleCompleteTask}
          onExitFocusMode={toggleFocusMode}
          pomodoroTimer={settings.pomodoroTimer}
        />
      ) : (
        <main className="min-h-screen p-4 sm:p-8 bg-gradient-to-br from-slate-900 to-slate-800">
          <div className="max-w-3xl mx-auto">
        <header className="relative text-center mb-8 h-20 sm:h-auto">
  <div className="absolute top-0 right-0 flex items-center gap-3">
    {isDayStarted && (
      <button 
        onClick={handleEndDay} 
        className="group flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-500/10 to-red-600/10 hover:from-red-500/20 hover:to-red-600/20 border border-red-500/30 hover:border-red-400/50 text-red-300 hover:text-red-200 rounded-xl transition-all duration-300 font-medium text-sm backdrop-blur-sm shadow-lg hover:shadow-red-500/10"
        aria-label="End workday"
      >
        <StopCircleIcon className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
        <span className="hidden sm:inline">Finalizar Día</span>
      </button>
    )}
    
    {isDayStarted && (
      <button
        onClick={toggleFocusMode}
        className="group flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-500/10 to-purple-600/10 hover:from-indigo-500/20 hover:to-purple-600/20 border border-indigo-500/30 hover:border-indigo-400/50 text-indigo-300 hover:text-indigo-200 rounded-xl transition-all duration-300 font-medium text-sm backdrop-blur-sm shadow-lg hover:shadow-indigo-500/10"
        aria-label="Focus mode"
      >
        <FocusIcon className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
        <span className="hidden sm:inline">Modo Enfoque</span>
      </button>
    )}
    
    {workDay && (
      <div className="flex items-center gap-2">
        {/* Botones de acción rápida */}
        <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-slate-800/60 backdrop-blur-sm border border-slate-600/30 rounded-xl">
          <button 
            onClick={handleExportData} 
            className="group p-2 text-slate-400 hover:text-cyan-300 hover:bg-cyan-500/10 rounded-lg transition-all duration-200"
            aria-label="Export data"
            title="Exportar datos"
          >
            <DownloadIcon className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
          </button>
          
          <button 
            onClick={triggerFileInput} 
            className="group p-2 text-slate-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-lg transition-all duration-200"
            aria-label="Import data"
            title="Importar datos"
          >
            <UploadIcon className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
          </button>
          
          <div className="w-px h-6 bg-slate-600/50"></div>
          
          <button 
            onClick={() => setShowAdvancedSettings(true)} 
            className="group p-2 text-slate-400 hover:text-amber-300 hover:bg-amber-500/10 rounded-lg transition-all duration-200"
            aria-label="Advanced settings"
            title="Configuración avanzada"
          >
            <SettingsIcon className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
          </button>
          
          <button 
            onClick={() => setShowSettingsModal(true)} 
            className="group p-2 text-slate-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-all duration-200"
            aria-label="Work hours settings"
            title="Horario de trabajo"
          >
            <SettingsIcon className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
          </button>
        </div>
        
        {/* Botón de menú mejorado */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className={`group p-3 rounded-xl transition-all duration-300 backdrop-blur-sm shadow-lg ${
              showMenu 
                ? 'bg-gradient-to-r from-cyan-500/20 to-blue-600/20 border border-cyan-400/40 text-cyan-200' 
                : 'bg-slate-800/60 border border-slate-600/30 text-slate-300 hover:bg-slate-700/60 hover:border-slate-500/40 hover:text-cyan-300'
            }`}
            aria-label="Menu"
            title="Menú"
          >
            <MenuIcon className={`w-6 h-6 transition-all duration-300 ${showMenu ? 'rotate-180 scale-110' : 'group-hover:scale-110'}`} />
          </button>
          
          {showMenu && (
            <>
              {/* Overlay para cerrar el menú */}
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowMenu(false)}
              ></div>
              
              {/* Menú desplegable mejorado */}
              <div className="absolute right-0 top-full mt-3 w-64 bg-slate-800/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-600/30 py-2 z-20 animate-in slide-in-from-top-2 duration-200">
                <div className="px-4 py-2 border-b border-slate-600/20">
                  <h3 className="text-sm font-semibold text-slate-200">Acciones Rápidas</h3>
                </div>
                
                <button
                  onClick={() => {
                    setShowMenu(false);
                    handleExportData();
                  }}
                  className="flex items-center w-full text-left px-4 py-3 text-sm text-slate-300 hover:bg-slate-700/50 hover:text-cyan-300 transition-colors duration-200 group"
                >
                  <div className="flex items-center justify-center w-8 h-8 bg-cyan-500/10 rounded-lg mr-3 group-hover:bg-cyan-500/20 transition-colors duration-200">
                    <DownloadIcon className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div>
                    <div className="font-medium">Exportar datos</div>
                    <div className="text-xs text-slate-500">Descargar respaldo en JSON</div>
                  </div>
                </button>
                
                <button
                  onClick={() => {
                    setShowMenu(false);
                    triggerFileInput();
                  }}
                  className="flex items-center w-full text-left px-4 py-3 text-sm text-slate-300 hover:bg-slate-700/50 hover:text-emerald-300 transition-colors duration-200 group"
                >
                  <div className="flex items-center justify-center w-8 h-8 bg-emerald-500/10 rounded-lg mr-3 group-hover:bg-emerald-500/20 transition-colors duration-200">
                    <UploadIcon className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <div className="font-medium">Importar datos</div>
                    <div className="text-xs text-slate-500">Cargar respaldo desde archivo</div>
                  </div>
                </button>
                
                <div className="h-px bg-slate-600/20 mx-4 my-2"></div>
                
                <button
                  onClick={() => {
                    setShowAdvancedSettings(true);
                    setShowMenu(false);
                  }}
                  className="flex items-center w-full text-left px-4 py-3 text-sm text-slate-300 hover:bg-slate-700/50 hover:text-amber-300 transition-colors duration-200 group"
                >
                  <div className="flex items-center justify-center w-8 h-8 bg-amber-500/10 rounded-lg mr-3 group-hover:bg-amber-500/20 transition-colors duration-200">
                    <SettingsIcon className="w-4 h-4 text-amber-400" />
                  </div>
                  <div>
                    <div className="font-medium">Configuración avanzada</div>
                    <div className="text-xs text-slate-500">Personalizar comportamiento</div>
                  </div>
                </button>
                
                <button
                  onClick={() => {
                    setShowSettingsModal(true);
                    setShowMenu(false);
                  }}
                  className="flex items-center w-full text-left px-4 py-3 text-sm text-slate-300 hover:bg-slate-700/50 hover:text-blue-300 transition-colors duration-200 group"
                >
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-500/10 rounded-lg mr-3 group-hover:bg-blue-500/20 transition-colors duration-200">
                    <SettingsIcon className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <div className="font-medium">Horario de trabajo</div>
                    <div className="text-xs text-slate-500">Configurar horas laborales</div>
                  </div>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    )}
  </div>
  
  <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-lime-400 pb-2 pt-8 sm:pt-0">
ALO-TASK-CONTROL
  </h1>
  <p className="text-slate-400">Controlador de reloj para productividad</p>
</header>
            
            {isDayStarted ? (
              <>
                <StatsDisplay points={points} activePauses={activePauses} totalWorkTime={totalWorkTime} tasks={tasks} />
                <TaskInput onAddTask={handleAddTask} />
                <TaskList 
                  tasks={tasks} 
                  onToggle={handleToggleTask} 
                  onComplete={handleCompleteTask} 
                  onDelete={handleDeleteTask} 
                  toleranceTime={settings.toleranceTime}
                />
              </>
            ) : (
              <StartDayScreen onStart={handleStartDay} />
            )}

          </div>
        </main>
      )}
    </>
  );
};

export default App;