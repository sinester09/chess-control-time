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

  // Use a ref to give the setInterval callback access to the latest tasks state
  // without including it in the useEffect dependency array.
  const tasksRef = useRef(tasks);
  tasksRef.current = tasks;

  // Main task timer effect
  useEffect(() => {
    if (!isDayStarted) return;

    const timer = setInterval(() => {
      // Read the latest tasks from the ref
      const currentTasks = tasksRef.current;
      const activeTask = currentTasks.find(task => task.isActive && !task.isCompleted);

      if (activeTask) {
        // Increment total work time if a task is active
        setTotalWorkTime(prev => prev + 1);

        // Increment elapsed time for the specific active task
        setTasks(prevTasks =>
          prevTasks.map(task => {
            if (task.id === activeTask.id) {
              const newElapsedTime = task.elapsedTime + 1;
              // Usar la tolerancia configurada antes de mostrar la alerta
              if (newElapsedTime > (task.estimatedTime + settings.toleranceTime) && !task.timeExceededNotified) {
                const toleranceMinutes = Math.floor(settings.toleranceTime / 60);
                alert(`Task "${task.name}" has exceeded its estimated time by more than ${toleranceMinutes} minutes!`);
                return { ...task, elapsedTime: newElapsedTime, timeExceededNotified: true };
              }
              return { ...task, elapsedTime: newElapsedTime };
            }
            return task;
          })
        );
      }
    }, 1000);

    return () => clearInterval(timer);
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
              <div className="absolute top-0 right-0 flex items-center gap-2">
                {isDayStarted && (
                  <button 
                    onClick={handleEndDay} 
                    className="flex items-center gap-2 p-2 px-3 bg-red-500/20 hover:bg-red-500/40 text-red-400 rounded-lg transition-colors duration-200"
                    aria-label="End workday"
                  >
                    <StopCircleIcon className="w-6 h-6" />
                    <span className="hidden sm:inline">End Day</span>
                  </button>
                )}
                {isDayStarted && (
                  <button
                    onClick={toggleFocusMode}
                    className="flex items-center gap-2 p-2 px-3 bg-indigo-500/20 hover:bg-indigo-500/40 text-indigo-400 rounded-lg transition-colors duration-200"
                    aria-label="Focus mode"
                  >
                    <FocusIcon className="w-6 h-6" />
                    <span className="hidden sm:inline">Focus Mode</span>
                  </button>
                )}
                {workDay && (
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={handleExportData} 
                      className="p-2 text-slate-400 hover:text-cyan-400 transition-colors duration-200"
                      aria-label="Export data"
                      title="Export data"
                    >
                      <DownloadIcon className="w-6 h-6" />
                    </button>
                    <button 
                      onClick={triggerFileInput} 
                      className="p-2 text-slate-400 hover:text-cyan-400 transition-colors duration-200"
                      aria-label="Import data"
                      title="Import data"
                    >
                      <UploadIcon className="w-6 h-6" />
                    </button>
                    <button 
                      onClick={() => setShowAdvancedSettings(true)} 
                      className="p-2 text-slate-400 hover:text-cyan-400 transition-colors duration-200"
                      aria-label="Advanced settings"
                      title="Advanced settings"
                    >
                      <SettingsIcon className="w-6 h-6" />
                    </button>
                    <button 
                      onClick={() => setShowSettingsModal(true)} 
                      className="p-2 text-slate-400 hover:text-cyan-400 transition-colors duration-200"
                      aria-label="Work hours settings"
                      title="Work hours settings"
                    >
                      <SettingsIcon className="w-7 h-7" />
                    </button>
                    <button
                      onClick={() => setShowMenu(!showMenu)}
                      className="p-2 text-slate-400 hover:text-cyan-400 transition-colors duration-200"
                      aria-label="Menu"
                      title="Menu"
                    >
                      <MenuIcon className="w-6 h-6" />
                    </button>
                    
                    {showMenu && (
                      <div className="absolute right-0 top-10 mt-2 w-48 bg-slate-800 rounded-md shadow-lg py-1 z-20 border border-slate-700">
                        <button
                          onClick={() => {
                            setShowMenu(false);
                            handleExportData();
                          }}
                          className="flex items-center w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700"
                        >
                          <DownloadIcon className="w-4 h-4 mr-2" />
                          Export data
                        </button>
                        <button
                          onClick={() => {
                            setShowMenu(false);
                            triggerFileInput();
                          }}
                          className="flex items-center w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700"
                        >
                          <UploadIcon className="w-4 h-4 mr-2" />
                          Import data
                        </button>
                        <button
                          onClick={() => {
                            setShowAdvancedSettings(true);
                            setShowMenu(false);
                          }}
                          className="flex items-center w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700"
                        >
                          <SettingsIcon className="w-4 h-4 mr-2" />
                          Advanced settings
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-lime-400 pb-2 pt-8 sm:pt-0">
                TaskFlow
              </h1>
              <p className="text-slate-400">Your Chess Clock for Productivity</p>
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