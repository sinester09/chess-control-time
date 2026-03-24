/**
 * SupabaseStorageService
 *
 * Persiste tareas y configuraciones en Supabase (PostgreSQL).
 * Usa localStorage como caché local para operaciones de alta frecuencia
 * (el temporizador actualiza elapsedTime cada segundo); la sincronización
 * a Supabase se hace con debounce de 5 segundos para evitar sobrecarga.
 *
 * Tablas requeridas → ver supabase/schema.sql
 */

import { supabase } from '../lib/supabase';
import { Task, Settings, DEFAULT_SETTINGS } from '../../types';

type TaskRow = {
  user_uid: string;
  task_id: number;
  project_id: string | null;
  name: string;
  estimated_time: number;
  elapsed_time: number;
  is_active: boolean;
  is_completed: boolean;
  time_exceeded_notified: boolean;
  created_at: number;
  completed_at: number | null;
};

type SettingsRow = {
  user_uid: string;
  tolerance_time: number;
  pause_interval: number;
  pause_duration: number;
  snooze_duration: number;
  focus_mode_enabled: boolean;
  pomodoro_timer: number;
  work_day: { start: string; end: string } | null;
};

// ─── helpers ────────────────────────────────────────────────────────────────

const taskToRow = (task: Task, uid: string): TaskRow => ({
  user_uid: uid,
  task_id: task.id,
  project_id: task.projectId ?? null,
  name: task.name,
  estimated_time: task.estimatedTime,
  elapsed_time: task.elapsedTime,
  is_active: task.isActive,
  is_completed: task.isCompleted,
  time_exceeded_notified: task.timeExceededNotified,
  created_at: task.createdAt,
  completed_at: task.completedAt ?? null,
});

const rowToTask = (row: TaskRow): Task => ({
  id: row.task_id,
  projectId: row.project_id ?? null,
  name: row.name,
  estimatedTime: row.estimated_time,
  elapsedTime: row.elapsed_time,
  isActive: row.is_active,
  isCompleted: row.is_completed,
  timeExceededNotified: row.time_exceeded_notified,
  createdAt: row.created_at,
  completedAt: row.completed_at ?? undefined,
});

const settingsToRow = (uid: string, s: Settings): SettingsRow => ({
  user_uid: uid,
  tolerance_time: s.toleranceTime,
  pause_interval: s.pauseInterval,
  pause_duration: s.pauseDuration,
  snooze_duration: s.snoozeDuration,
  focus_mode_enabled: s.focusModeEnabled,
  pomodoro_timer: s.pomodoroTimer,
  work_day: s.workDay ?? null,
});

const rowToSettings = (row: SettingsRow): Settings => ({
  toleranceTime: row.tolerance_time,
  pauseInterval: row.pause_interval,
  pauseDuration: row.pause_duration,
  snoozeDuration: row.snooze_duration,
  focusModeEnabled: row.focus_mode_enabled,
  pomodoroTimer: row.pomodoro_timer,
  workDay: row.work_day,
});

// ─── service ────────────────────────────────────────────────────────────────

export class SupabaseStorageService {
  private readonly TASKS_KEY: string;
  private readonly SETTINGS_KEY: string;
  private syncTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(private uid: string) {
    this.TASKS_KEY = `chess_tasks_${uid}`;
    this.SETTINGS_KEY = `chess_settings_${uid}`;
  }

  // ── local cache helpers ─────────────────────────────────────────────────

  private cacheGetTasks(): Task[] {
    try {
      const raw = localStorage.getItem(this.TASKS_KEY);
      return raw ? (JSON.parse(raw) as Task[]) : [];
    } catch {
      return [];
    }
  }

  private cacheSetTasks(tasks: Task[]): void {
    try {
      localStorage.setItem(this.TASKS_KEY, JSON.stringify(tasks));
    } catch {
      // quota exceeded – ignore
    }
  }

  private cacheGetSettings(): Settings {
    try {
      const raw = localStorage.getItem(this.SETTINGS_KEY);
      if (!raw) return DEFAULT_SETTINGS;
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  private cacheSetSettings(settings: Settings): void {
    try {
      localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(settings));
    } catch {
      // quota exceeded – ignore
    }
  }

  // ── Supabase sync ───────────────────────────────────────────────────────

  private async syncTasksNow(tasks: Task[]): Promise<void> {
    if (!supabase) return;
    try {
      // Fetch existing task_ids for this user
      const { data: existing } = await supabase
        .from('tasks')
        .select('task_id')
        .eq('user_uid', this.uid);

      const existingIds = new Set((existing ?? []).map((r: { task_id: number }) => r.task_id));
      const currentIds = new Set(tasks.map(t => t.id));

      // Delete tasks removed locally
      const toDelete = [...existingIds].filter(id => !currentIds.has(id));
      if (toDelete.length > 0) {
        await supabase
          .from('tasks')
          .delete()
          .eq('user_uid', this.uid)
          .in('task_id', toDelete);
      }

      // Upsert current tasks
      if (tasks.length > 0) {
        await supabase
          .from('tasks')
          .upsert(tasks.map(t => taskToRow(t, this.uid)), {
            onConflict: 'user_uid,task_id',
          });
      }
    } catch (err) {
      console.warn('[Supabase] syncTasksNow error:', err);
    }
  }

  /** Debounced sync: waits 5 s after last call before hitting Supabase */
  private debouncedSync(tasks: Task[]): void {
    if (this.syncTimer) clearTimeout(this.syncTimer);
    this.syncTimer = setTimeout(() => {
      this.syncTasksNow(tasks);
    }, 5000);
  }

  // ── public API ──────────────────────────────────────────────────────────

  async getTasks(): Promise<Task[]> {
    if (!supabase) return this.cacheGetTasks();

    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_uid', this.uid)
        .order('created_at');

      if (error) throw error;

      const tasks = (data as TaskRow[]).map(rowToTask);
      this.cacheSetTasks(tasks);
      return tasks;
    } catch (err) {
      console.warn('[Supabase] getTasks – fallback to cache:', err);
      return this.cacheGetTasks();
    }
  }

  /**
   * Saves to local cache immediately.
   * Supabase sync is debounced (5 s) so the 1-second timer doesn't spam the API.
   */
  async saveTasks(tasks: Task[]): Promise<boolean> {
    this.cacheSetTasks(tasks);
    this.debouncedSync(tasks);
    return true;
  }

  async addTask(
    taskData: Pick<Task, 'name' | 'estimatedTime' | 'completedAt' | 'projectId'>
  ): Promise<Task | null> {
    const tasks = await this.getTasks();
    const newId = tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1;

    const newTask: Task = {
      ...taskData,
      id: newId,
      createdAt: Date.now(),
      isActive: false,
      isCompleted: false,
      elapsedTime: 0,
      timeExceededNotified: false,
    };

    const updatedTasks = [...tasks, newTask];
    this.cacheSetTasks(updatedTasks);

    // Sync immediately on add (no debounce)
    if (syncTimer_flush(this)) {
      /* timer cleared */ }
    await this.syncTasksNow(updatedTasks);

    return newTask;
  }

  async updateTask(taskId: number, updates: Partial<Task>): Promise<boolean> {
    const tasks = await this.getTasks();
    const idx = tasks.findIndex(t => t.id === taskId);
    if (idx === -1) return false;

    tasks[idx] = { ...tasks[idx], ...updates };
    this.cacheSetTasks(tasks);
    await this.syncTasksNow(tasks);
    return true;
  }

  async deleteTask(taskId: number): Promise<boolean> {
    const tasks = await this.getTasks();
    const filtered = tasks.filter(t => t.id !== taskId);
    if (filtered.length === tasks.length) return false;

    this.cacheSetTasks(filtered);

    if (supabase) {
      try {
        await supabase
          .from('tasks')
          .delete()
          .eq('user_uid', this.uid)
          .eq('task_id', taskId);
      } catch (err) {
        console.warn('[Supabase] deleteTask error:', err);
      }
    }
    return true;
  }

  async getTask(taskId: number): Promise<Task | null> {
    const tasks = await this.getTasks();
    return tasks.find(t => t.id === taskId) ?? null;
  }

  async completeTask(taskId: number): Promise<boolean> {
    return this.updateTask(taskId, {
      isCompleted: true,
      isActive: false,
      completedAt: Date.now(),
    });
  }

  async toggleTask(taskId: number): Promise<boolean> {
    const tasks = await this.getTasks();
    const task = tasks.find(t => t.id === taskId);
    if (!task) return false;

    let updatedTasks: Task[];

    if (!task.isActive) {
      // Activar esta, desactivar las demás
      updatedTasks = tasks.map(t => ({ ...t, isActive: t.id === taskId }));
    } else {
      updatedTasks = tasks.map(t =>
        t.id === taskId ? { ...t, isActive: false } : t
      );
    }

    this.cacheSetTasks(updatedTasks);
    await this.syncTasksNow(updatedTasks);
    return true;
  }

  async getSettings(): Promise<Settings> {
    if (!supabase) return this.cacheGetSettings();

    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_uid', this.uid)
        .single();

      if (error || !data) return this.cacheGetSettings();

      const settings = rowToSettings(data as SettingsRow);
      this.cacheSetSettings(settings);
      return settings;
    } catch (err) {
      console.warn('[Supabase] getSettings – fallback to cache:', err);
      return this.cacheGetSettings();
    }
  }

  async saveSettings(settings: Partial<Settings>): Promise<boolean> {
    const current = await this.getSettings();
    const merged: Settings = { ...current, ...settings };
    this.cacheSetSettings(merged);

    if (!supabase) return true;

    try {
      await supabase
        .from('user_settings')
        .upsert(settingsToRow(this.uid, merged), { onConflict: 'user_uid' });
      return true;
    } catch (err) {
      console.warn('[Supabase] saveSettings error:', err);
      return false;
    }
  }

  async clearAllData(): Promise<boolean> {
    localStorage.removeItem(this.TASKS_KEY);
    localStorage.removeItem(this.SETTINGS_KEY);

    if (supabase) {
      try {
        await supabase.from('tasks').delete().eq('user_uid', this.uid);
        await supabase.from('user_settings').delete().eq('user_uid', this.uid);
      } catch (err) {
        console.warn('[Supabase] clearAllData error:', err);
      }
    }
    return true;
  }
}

// Helper: clears pending debounce timer on the instance
function syncTimer_flush(svc: SupabaseStorageService): boolean {
  const timer = (svc as unknown as { syncTimer: ReturnType<typeof setTimeout> | null }).syncTimer;
  if (timer) {
    clearTimeout(timer);
    (svc as unknown as { syncTimer: null }).syncTimer = null;
    return true;
  }
  return false;
}
