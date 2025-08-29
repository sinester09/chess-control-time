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
import { SettingsIcon, StopCircleIcon, DownloadIcon, UploadIcon, PlayCircleIcon, FocusIcon, MenuIcon, LogOutIcon, LogoEmpresas } from './components/icons';
import { TaskStorageService } from './src/services/taskStorageService';
import { getOrCreateUserUid } from './src/utils/uid';
import { useMemo } from 'react';

const App: React.FC = () => {
  const storageService = useMemo(() => {
    const uid = getOrCreateUserUid();
    return new TaskStorageService(uid);
  }, []);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [points, setPoints] = useState<number>(0);
  const [activePauses, setActivePauses] = useState<number>(0);
  const [totalWorkTime, setTotalWorkTime] = useState<number>(0);
  
  const [showPauseReminder, setShowPauseReminder] = useState<boolean>(false);
  const [workDay, setWorkDay] = useState<{ start: string; end: string } | null>(null);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);

  const [isDayStarted, setIsDayStarted] = useState<boolean>(false);
  const [snoozeUntil, setSnoozeUntil] = useState<number | null>(null);
  
  const [settings, setSettings] = useState<Settings>({
    toleranceTime: 300,
    pauseInterval: 2 * 60 * 60,
    pauseDuration: 15,
    snoozeDuration: 15,
    focusModeEnabled: false,
    pomodoroTimer: 25
  });
  
  const [showAdvancedSettings, setShowAdvancedSettings] = useState<boolean>(false);
  const [showMenu, setShowMenu] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Refs para el timer y audio
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const alertAudioRef = useRef<HTMLAudioElement | null>(null);
  
  // Estado para el título original del documento
  const originalTitleRef = useRef<string>(document.title);
  const titleBlinkRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const storedTasks = await storageService.getTasks();
      setTasks(storedTasks);
      const storedSettings = await storageService.getSettings();
      setSettings(storedSettings);
      if (storedSettings.workDay) {
        setWorkDay(storedSettings.workDay);
      } else {
        setShowSettingsModal(true);
      }
      setIsLoading(false);
    };
    loadData();
  }, [storageService]);

  useEffect(() => {
    if (isLoading || !isDayStarted) return;

    const timer = setInterval(() => {
        setTasks(prevTasks => {
            let activeTaskFound = false;
            const newTasks = prevTasks.map(task => {
                if (task.isActive && !task.isCompleted) {
                    activeTaskFound = true;
                    return { ...task, elapsedTime: task.elapsedTime + 1 };
                }
                return task;
            });

            if (activeTaskFound) {
                setTotalWorkTime(prev => prev + 1);
                storageService.saveTasks(newTasks);
                return newTasks;
            }

            return prevTasks;
        });
    }, 1000);

    return () => clearInterval(timer);
  }, [isDayStarted, isLoading, storageService]);

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

  const handleAddTask = async (name: string, estimatedTime: number) => {
    const newTask = await storageService.addTask({ name, estimatedTime, completedAt: null, lastActiveTime: null });
    if (newTask) {
      setTasks(prevTasks => [...prevTasks, newTask]);
    }
  };

  const handleToggleTask = async (id: number) => {
    await storageService.toggleTask(id);
    const updatedTasks = await storageService.getTasks();
    setTasks(updatedTasks);
  };

  const handleCompleteTask = async (id: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(err => console.error("Error reproduciendo sonido:", err));
    }

    const taskToComplete = tasks.find(t => t.id === id);
    if (taskToComplete && taskToComplete.elapsedTime <= taskToComplete.estimatedTime) {
      setPoints(prevPoints => prevPoints + 1);
    }

    await storageService.completeTask(id);
    const updatedTasks = await storageService.getTasks();
    setTasks(updatedTasks);
  };

  const handleDeleteTask = async (id: number) => {
    const success = await storageService.deleteTask(id);
    if (success) {
      setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
    }
  };

  const handleConfirmPause = () => {
    setActivePauses(prev => prev + 1);
    setShowPauseReminder(false);
    setSnoozeUntil(null);
  };
  
  const handleSnoozePause = () => {
    const snoozeDurationMs = settings.snoozeDuration * 60 * 1000;
    setSnoozeUntil(Date.now() + snoozeDurationMs);
    setShowPauseReminder(false);
  };

  const handleSaveSettings = async (start: string, end: string) => {
    const newWorkDay = { start, end };
    setWorkDay(newWorkDay);
    await storageService.saveSettings({ workDay: newWorkDay });
    setShowSettingsModal(false);
  };

  const handleCloseSettings = () => {
    if (workDay) {
      setShowSettingsModal(false);
    }
  };
  
  const handleSaveAdvancedSettings = async (newSettings: Settings) => {
    setSettings(newSettings);
    await storageService.saveSettings(newSettings);
    setShowAdvancedSettings(false);
  };
  
  const handleCloseAdvancedSettings = () => {
    setShowAdvancedSettings(false);
  };

  const handleStartDay = async () => {
    // Unlock audio on first user interaction
    const unlockAudio = async () => {
      try {
        if (audioRef.current) {
          await audioRef.current.play();
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }
        if (alertAudioRef.current) {
          await alertAudioRef.current.play();
          alertAudioRef.current.pause();
          alertAudioRef.current.currentTime = 0;
        }
      } catch (error) {
        // Autoplay was prevented. This is common before a user interaction.
        // We can ignore this error as the main goal is to enable future plays.
      }
    };

    unlockAudio();
    
    // Guardar título original
    originalTitleRef.current = document.title;
    
    // Reset all daily stats
    setPoints(0);
    setActivePauses(0);
    setTotalWorkTime(0);
    setSnoozeUntil(null);

    // Clean up tasks for the new day
    const activeTasks = tasks.filter(task => !task.isCompleted).map(task => ({ ...task, isActive: false, elapsedTime: 0, timeExceededNotified: false }));
    setTasks(activeTasks);
    await storageService.saveTasks(activeTasks);

    setIsDayStarted(true);
  };

  const handleEndDay = () => {
    if (window.confirm("¿Estás seguro de que quieres finalizar tu jornada laboral? Todos los temporizadores se detendrán. Las tareas completadas se borrarán cuando inicies el próximo día.")) {
      setIsDayStarted(false);
      setTasks(prevTasks =>
        prevTasks.map(task => ({
          ...task,
          isActive: false,
          lastActiveTime: undefined
        }))
      );
      
      // Restaurar título original y limpiar alertas
      document.title = originalTitleRef.current;
      if (titleBlinkRef.current) {
        clearInterval(titleBlinkRef.current);
        titleBlinkRef.current = null;
      }
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
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const toggleFocusMode = () => {
    setSettings(prev => ({
      ...prev,
      focusModeEnabled: !prev.focusModeEnabled
    }));
    setShowMenu(false);
  };
  
  const closeMenu = () => {
    setShowMenu(false);
  };
  
  const activeTask = tasks.find(task => task.isActive && !task.isCompleted) || null;

  return (
    <>
      <audio ref={audioRef} src={`${import.meta.env.BASE_URL}finish.mp3`} preload="auto" />
      <audio ref={alertAudioRef} src={`${import.meta.env.BASE_URL}yet.mp3`} preload="auto" />
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
      
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleImportData} 
        style={{ display: 'none' }} 
        accept=".json" 
      />
      
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
              <div>
                <LogoEmpresas className="hover:scale-110 transition-transform" />
                <h1 className="text-lg font-semibold mb-3">Chess Control</h1>
              </div>
              <div className="absolute top-0 right-0 flex items-center gap-3">
                {isDayStarted && (
                  <button 
                    onClick={handleEndDay} 
                    className="group flex items-center gap-2 px-4 py-2.5 bg-red-700 hover:bg-red-800 border border-red-600 text-white rounded-xl transition-all duration-300 font-medium text-sm shadow-lg hover:shadow-red-500/30"
                    aria-label="End workday"
                  >
                    <LogOutIcon className="w-5 h-5 group-hover:scale-110 transition-transform duration-200 text-white" />
                    <span className="hidden sm:inline">Finalizar Día</span>
                  </button>
                )}
                
                {isDayStarted && (
                  <button
                    onClick={toggleFocusMode}
                    className="group flex items-center gap-2 px-4 py-2.5 bg-lime-500 hover:bg-lime-600 border border-lime-400 text-slate-900 rounded-xl transition-all duration-300 font-medium text-sm shadow-lg hover:shadow-lime-500/30"
                    aria-label="Focus mode"
                  >
                    <FocusIcon className="w-5 h-5 group-hover:scale-110 transition-transform duration-200 text-slate-900" />
                    <span className="hidden sm:inline">Modo Enfoque</span>
                  </button>
                )}
                
                {workDay && (
                  <div className="flex items-center gap-2">
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
                    </div>
                    
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
                          <div 
                            className="fixed inset-0 z-10" 
                            onClick={() => setShowMenu(false)}
                          ></div>
                          
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