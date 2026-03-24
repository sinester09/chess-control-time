import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Task, Settings, DEFAULT_SETTINGS, Project, TimeRecord } from './types';
import TaskInput from './components/TaskInput';
import TaskList from './components/TaskList';
import StatsDisplay from './components/StatsDisplay';
import PauseReminderModal from './components/PauseReminderModal';
import SettingsModal from './components/SettingsModal';
import AdvancedSettingsModal from './components/AdvancedSettingsModal';
import StartDayScreen from './components/StartDayScreen';
import FocusMode from './components/FocusMode';
import AuthScreen from './components/AuthScreen';
import ProjectModal from './components/ProjectModal';
import DaySummaryModal from './components/DaySummaryModal';
import { SettingsIcon, DownloadIcon, UploadIcon, FocusIcon, MenuIcon, LogOutIcon, LogoEmpresas } from './components/icons';
import { TaskStorageService } from './src/services/taskStorageService';
import { getOrCreateUserUid } from './src/utils/uid';
import { isSupabaseConfigured } from './src/lib/supabase';
import { SupabaseStorageService } from './src/services/supabaseStorageService';
import { authService, AuthUser } from './src/services/authService';
import { projectService, timeRecordService } from './src/services/projectService';

const App: React.FC = () => {
  // ── Auth ──────────────────────────────────────────────────
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [authLoading, setAuthLoading] = useState(isSupabaseConfigured);

  // ── Storage service ───────────────────────────────────────
  const storageService = useMemo(() => {
    const uid = authUser?.id ?? getOrCreateUserUid();
    if (isSupabaseConfigured) return new SupabaseStorageService(uid);
    return new TaskStorageService(uid);
  }, [authUser]);

  const userId = authUser?.id ?? getOrCreateUserUid();

  // ── Task & app state ──────────────────────────────────────
  const [tasks, setTasks] = useState<Task[]>([]);
  const [points, setPoints] = useState<number>(0);
  const [activePauses, setActivePauses] = useState<number>(0);
  const [totalWorkTime, setTotalWorkTime] = useState<number>(0);
  const [showPauseReminder, setShowPauseReminder] = useState<boolean>(false);
  const [workDay, setWorkDay] = useState<{ start: string; end: string } | null>(null);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [isDayStarted, setIsDayStarted] = useState<boolean>(false);
  const [snoozeUntil, setSnoozeUntil] = useState<number | null>(null);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState<boolean>(false);
  const [showMenu, setShowMenu] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // ── Projects ──────────────────────────────────────────────
  const [projects, setProjects] = useState<Project[]>([]);
  const [showProjectModal, setShowProjectModal] = useState<boolean>(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // ── Day summary ───────────────────────────────────────────
  const [showDaySummary, setShowDaySummary] = useState<boolean>(false);
  const [daySummaryRecords, setDaySummaryRecords] = useState<TimeRecord[]>([]);

  // ── Refs ──────────────────────────────────────────────────
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const alertAudioRef = useRef<HTMLAudioElement | null>(null);
  const originalTitleRef = useRef<string>(document.title);
  const titleBlinkRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Auth listener ─────────────────────────────────────────
  useEffect(() => {
    if (!isSupabaseConfigured) { setAuthLoading(false); return; }
    authService.getSession().then(user => { setAuthUser(user); setAuthLoading(false); });
    const { data } = authService.onAuthStateChange(user => setAuthUser(user));
    return () => data.subscription.unsubscribe();
  }, []);

  // ── Load data ─────────────────────────────────────────────
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const storedTasks = await storageService.getTasks();
      setTasks(storedTasks);
      setTotalWorkTime(storedTasks.reduce((acc, t) => acc + (t.elapsedTime || 0), 0));
      const storedSettings = await storageService.getSettings();
      setSettings(storedSettings);
      if (storedSettings.workDay) setWorkDay(storedSettings.workDay);
      else setShowSettingsModal(true);
      if (storedTasks.some(t => t.isActive && !t.isCompleted)) setIsDayStarted(true);
      const projs = await projectService.getProjects(userId);
      setProjects(projs);
      setIsLoading(false);
    };
    loadData();
  }, [storageService, userId]);

  // ── 1-second timer ────────────────────────────────────────
  useEffect(() => {
    if (isLoading || !isDayStarted) return;
    const timer = setInterval(() => {
      setTasks(prevTasks => {
        let activeFound = false;
        const newTasks = prevTasks.map(task => {
          if (task.isActive && !task.isCompleted) { activeFound = true; return { ...task, elapsedTime: task.elapsedTime + 1 }; }
          return task;
        });
        if (activeFound) { setTotalWorkTime(prev => prev + 1); storageService.saveTasks(newTasks); return newTasks; }
        return prevTasks;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isDayStarted, isLoading, storageService]);

  // ── Pause reminder ────────────────────────────────────────
  useEffect(() => {
    if (!isDayStarted || showPauseReminder || (snoozeUntil && Date.now() < snoozeUntil)) return;
    if (Math.floor(totalWorkTime / settings.pauseInterval) > activePauses) setShowPauseReminder(true);
  }, [totalWorkTime, activePauses, isDayStarted, showPauseReminder, snoozeUntil, settings.pauseInterval]);

  // ── Task handlers ─────────────────────────────────────────
  const handleAddTask = async (name: string, estimatedTime: number, projectId: string | null, _date?: Date) => {
    const newTask = await storageService.addTask({ name, estimatedTime, completedAt: null, projectId });
    if (newTask) setTasks(prev => [...prev, newTask]);
  };

  const handleToggleTask = async (id: number) => {
    await storageService.toggleTask(id);
    setTasks(await storageService.getTasks());
  };

  const handleCompleteTask = async (id: number) => {
    if (audioRef.current) { audioRef.current.currentTime = 0; audioRef.current.play().catch(() => {}); }
    const task = tasks.find(t => t.id === id);
    if (task && task.elapsedTime <= task.estimatedTime) setPoints(p => p + 1);
    await storageService.completeTask(id);
    setTasks(await storageService.getTasks());
  };

  const handleDeleteTask = async (id: number) => {
    if (await storageService.deleteTask(id)) setTasks(prev => prev.filter(t => t.id !== id));
  };

  const handleConfirmPause = () => { setActivePauses(p => p + 1); setShowPauseReminder(false); setSnoozeUntil(null); };
  const handleSnoozePause = () => { setSnoozeUntil(Date.now() + settings.snoozeDuration * 60 * 1000); setShowPauseReminder(false); };

  const handleSaveSettings = async (start: string, end: string) => {
    const wd = { start, end };
    setWorkDay(wd);
    await storageService.saveSettings({ workDay: wd });
    setShowSettingsModal(false);
  };

  const handleSaveAdvancedSettings = async (s: Settings) => {
    setSettings(s);
    await storageService.saveSettings(s);
    setShowAdvancedSettings(false);
  };

  const handleStartDay = async () => {
    try {
      if (audioRef.current) { await audioRef.current.play(); audioRef.current.pause(); audioRef.current.currentTime = 0; }
      if (alertAudioRef.current) { await alertAudioRef.current.play(); alertAudioRef.current.pause(); alertAudioRef.current.currentTime = 0; }
    } catch {}
    originalTitleRef.current = document.title;
    setPoints(0); setActivePauses(0); setTotalWorkTime(0); setSnoozeUntil(null);
    const activeTasks = tasks.filter(t => !t.isCompleted).map(t => ({ ...t, isActive: false, elapsedTime: 0, timeExceededNotified: false }));
    setTasks(activeTasks);
    await storageService.saveTasks(activeTasks);
    setIsDayStarted(true);
  };

  const handleEndDay = async () => {
    if (!window.confirm('¿Finalizar jornada? Se guardarán las horas por proyecto.')) return;
    const records = await timeRecordService.saveEndOfDay(userId, tasks);
    setDaySummaryRecords(records);
    setIsDayStarted(false);
    setTasks(prev => prev.map(t => ({ ...t, isActive: false })));
    document.title = originalTitleRef.current;
    if (titleBlinkRef.current) { clearInterval(titleBlinkRef.current); titleBlinkRef.current = null; }
    setShowDaySummary(true);
  };

  // ── Project handlers ──────────────────────────────────────
  const handleSaveProject = async (name: string, color: string) => {
    if (editingProject) {
      await projectService.updateProject(userId, editingProject.id, name, color);
      setProjects(prev => prev.map(p => p.id === editingProject.id ? { ...p, name, color } : p));
    } else {
      const proj = await projectService.createProject(userId, name, color);
      if (proj) setProjects(prev => [...prev, proj]);
    }
    setShowProjectModal(false);
    setEditingProject(null);
  };

  const handleAuth = (id: string, email: string) => setAuthUser({ id, email });
  const handleLogout = async () => {
    await authService.signOut();
    setAuthUser(null);
    setTasks([]); setProjects([]); setIsDayStarted(false);
  };

  const handleExportData = () => {
    const uri = `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify({ tasks, points, activePauses, totalWorkTime, workDay, settings, projects }, null, 2))}`;
    Object.assign(document.createElement('a'), { href: uri, download: `taskflow-${new Date().toISOString().slice(0,10)}.json` }).click();
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        if (!Array.isArray(data.tasks)) { alert('Formato inválido.'); return; }
        setTasks(data.tasks);
        if (typeof data.points === 'number') setPoints(data.points);
        if (typeof data.activePauses === 'number') setActivePauses(data.activePauses);
        if (typeof data.totalWorkTime === 'number') setTotalWorkTime(data.totalWorkTime);
        if (data.workDay) setWorkDay(data.workDay);
        if (data.settings) setSettings(data.settings);
        if (data.projects) setProjects(data.projects);
        alert('Datos importados correctamente.');
      } catch { alert('Error al importar.'); }
    };
    reader.readAsText(file);
  };

  const toggleFocusMode = () => { setSettings(prev => ({ ...prev, focusModeEnabled: !prev.focusModeEnabled })); setShowMenu(false); };
  const activeTask = tasks.find(t => t.isActive && !t.isCompleted) ?? null;

  // ── Render guards ─────────────────────────────────────────
  if (authLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="text-slate-400">Cargando...</div>
    </div>
  );

  if (isSupabaseConfigured && !authUser) return <AuthScreen onAuth={handleAuth} />;

  return (
    <>
      <audio ref={audioRef} src={`${import.meta.env.BASE_URL}finish.mp3`} preload="auto" />
      <audio ref={alertAudioRef} src={`${import.meta.env.BASE_URL}yet.mp3`} preload="auto" />
      <PauseReminderModal show={showPauseReminder} onConfirm={handleConfirmPause} onClose={handleSnoozePause} pauseDuration={settings.pauseDuration} />
      <SettingsModal show={showSettingsModal} onSave={handleSaveSettings} onClose={() => { if (workDay) setShowSettingsModal(false); }} initialWorkDay={workDay} />
      <AdvancedSettingsModal show={showAdvancedSettings} onSave={handleSaveAdvancedSettings} onClose={() => setShowAdvancedSettings(false)} initialSettings={settings} />
      <ProjectModal show={showProjectModal} onSave={handleSaveProject} onClose={() => { setShowProjectModal(false); setEditingProject(null); }} editing={editingProject} />
      <DaySummaryModal show={showDaySummary} records={daySummaryRecords} projects={projects} onClose={() => setShowDaySummary(false)} />
      <input type="file" ref={fileInputRef} onChange={handleImportData} style={{ display: 'none' }} accept=".json" />

      {settings.focusModeEnabled && activeTask ? (
        <FocusMode task={activeTask} onToggle={handleToggleTask} onComplete={handleCompleteTask} onExitFocusMode={toggleFocusMode} pomodoroTimer={settings.pomodoroTimer} />
      ) : (
        <main className="min-h-screen p-4 sm:p-8 bg-gradient-to-br from-slate-900 to-slate-800">
          <div className="max-w-3xl mx-auto">
            <header className="relative text-center mb-8 h-20 sm:h-auto">
              <div>
                <LogoEmpresas className="hover:scale-110 transition-transform" />
                <h1 className="text-lg font-semibold mb-3">Chess Control</h1>
              </div>

              {authUser && (
                <div className="absolute top-0 left-0 flex items-center gap-2 px-3 py-1.5 bg-slate-800/60 border border-slate-600/30 rounded-xl text-xs text-slate-400">
                  <div className="w-2 h-2 rounded-full bg-green-400" />
                  {authUser.email}
                </div>
              )}

              <div className="absolute top-0 right-0 flex items-center gap-3">
                {isDayStarted && (
                  <button onClick={handleEndDay} className="flex items-center gap-2 px-4 py-2.5 bg-red-700 hover:bg-red-800 border border-red-600 text-white rounded-xl font-medium text-sm shadow-lg transition-all">
                    <LogOutIcon className="w-5 h-5" />
                    <span className="hidden sm:inline">Finalizar Día</span>
                  </button>
                )}
                {isDayStarted && (
                  <button onClick={toggleFocusMode} className="flex items-center gap-2 px-4 py-2.5 bg-lime-500 hover:bg-lime-600 border border-lime-400 text-slate-900 rounded-xl font-medium text-sm shadow-lg transition-all">
                    <FocusIcon className="w-5 h-5" />
                    <span className="hidden sm:inline">Modo Enfoque</span>
                  </button>
                )}
                {workDay && (
                  <div className="flex items-center gap-2">
                    <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-slate-800/60 border border-slate-600/30 rounded-xl">
                      <button onClick={handleExportData} className="p-2 text-slate-400 hover:text-cyan-300 hover:bg-cyan-500/10 rounded-lg transition-all" title="Exportar datos">
                        <DownloadIcon className="w-5 h-5" />
                      </button>
                      <button onClick={() => fileInputRef.current?.click()} className="p-2 text-slate-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-lg transition-all" title="Importar datos">
                        <UploadIcon className="w-5 h-5" />
                      </button>
                      <div className="w-px h-6 bg-slate-600/50" />
                    </div>
                    <div className="relative">
                      <button onClick={() => setShowMenu(!showMenu)} className={`p-3 rounded-xl transition-all backdrop-blur-sm shadow-lg ${showMenu ? 'bg-cyan-500/20 border border-cyan-400/40 text-cyan-200' : 'bg-slate-800/60 border border-slate-600/30 text-slate-300 hover:text-cyan-300'}`}>
                        <MenuIcon className={`w-6 h-6 transition-all ${showMenu ? 'rotate-180' : ''}`} />
                      </button>
                      {showMenu && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                          <div className="absolute right-0 top-full mt-3 w-64 bg-slate-800/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-600/30 py-2 z-20">
                            <div className="px-4 py-2 border-b border-slate-600/20">
                              <h3 className="text-sm font-semibold text-slate-200">Acciones Rápidas</h3>
                            </div>
                            <button onClick={() => { setShowMenu(false); setShowProjectModal(true); }} className="flex items-center w-full text-left px-4 py-3 text-sm text-slate-300 hover:bg-slate-700/50 hover:text-purple-300 transition-colors">
                              <div className="flex items-center justify-center w-8 h-8 bg-purple-500/10 rounded-lg mr-3">
                                <span className="text-purple-400 font-bold text-xs">P+</span>
                              </div>
                              <div><div className="font-medium">Nuevo proyecto</div><div className="text-xs text-slate-500">Organizar tareas por proyecto</div></div>
                            </button>
                            <button onClick={() => { setShowMenu(false); handleExportData(); }} className="flex items-center w-full text-left px-4 py-3 text-sm text-slate-300 hover:bg-slate-700/50 hover:text-cyan-300 transition-colors">
                              <div className="flex items-center justify-center w-8 h-8 bg-cyan-500/10 rounded-lg mr-3"><DownloadIcon className="w-4 h-4 text-cyan-400" /></div>
                              <div><div className="font-medium">Exportar datos</div><div className="text-xs text-slate-500">Descargar respaldo en JSON</div></div>
                            </button>
                            <button onClick={() => { setShowMenu(false); fileInputRef.current?.click(); }} className="flex items-center w-full text-left px-4 py-3 text-sm text-slate-300 hover:bg-slate-700/50 hover:text-emerald-300 transition-colors">
                              <div className="flex items-center justify-center w-8 h-8 bg-emerald-500/10 rounded-lg mr-3"><UploadIcon className="w-4 h-4 text-emerald-400" /></div>
                              <div><div className="font-medium">Importar datos</div><div className="text-xs text-slate-500">Cargar respaldo desde archivo</div></div>
                            </button>
                            <div className="h-px bg-slate-600/20 mx-4 my-2" />
                            <button onClick={() => { setShowAdvancedSettings(true); setShowMenu(false); }} className="flex items-center w-full text-left px-4 py-3 text-sm text-slate-300 hover:bg-slate-700/50 hover:text-amber-300 transition-colors">
                              <div className="flex items-center justify-center w-8 h-8 bg-amber-500/10 rounded-lg mr-3"><SettingsIcon className="w-4 h-4 text-amber-400" /></div>
                              <div><div className="font-medium">Configuración avanzada</div><div className="text-xs text-slate-500">Personalizar comportamiento</div></div>
                            </button>
                            <button onClick={() => { setShowSettingsModal(true); setShowMenu(false); }} className="flex items-center w-full text-left px-4 py-3 text-sm text-slate-300 hover:bg-slate-700/50 hover:text-blue-300 transition-colors">
                              <div className="flex items-center justify-center w-8 h-8 bg-blue-500/10 rounded-lg mr-3"><SettingsIcon className="w-4 h-4 text-blue-400" /></div>
                              <div><div className="font-medium">Horario de trabajo</div><div className="text-xs text-slate-500">Configurar horas laborales</div></div>
                            </button>
                            {authUser && (
                              <>
                                <div className="h-px bg-slate-600/20 mx-4 my-2" />
                                <button onClick={() => { setShowMenu(false); handleLogout(); }} className="flex items-center w-full text-left px-4 py-3 text-sm text-slate-300 hover:bg-slate-700/50 hover:text-red-300 transition-colors">
                                  <div className="flex items-center justify-center w-8 h-8 bg-red-500/10 rounded-lg mr-3"><LogOutIcon className="w-4 h-4 text-red-400" /></div>
                                  <div><div className="font-medium">Cerrar sesión</div><div className="text-xs text-slate-500">{authUser.email}</div></div>
                                </button>
                              </>
                            )}
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
                <TaskInput onAddTask={handleAddTask} projects={projects} onCreateProject={() => setShowProjectModal(true)} />
                <TaskList tasks={tasks} onToggle={handleToggleTask} onComplete={handleCompleteTask} onDelete={handleDeleteTask} toleranceTime={settings.toleranceTime} projects={projects} />
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
