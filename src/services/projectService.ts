import { supabase } from '../lib/supabase';
import { Project, TimeRecord, Task } from '../../types';

function generateId(): string {
  return crypto.randomUUID ? crypto.randomUUID() :
    Math.random().toString(36).slice(2) + Date.now().toString(36);
}

const PROJECTS_KEY = (uid: string) => `chess_projects_${uid}`;
const RECORDS_KEY = (uid: string) => `chess_time_records_${uid}`;

// ── local cache ──────────────────────────────────────────────

function cacheGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

function cacheSet(key: string, value: unknown): void {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

// ── Projects ─────────────────────────────────────────────────

export const projectService = {
  async getProjects(userId: string): Promise<Project[]> {
    if (!supabase) return cacheGet<Project[]>(PROJECTS_KEY(userId), []);
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', userId)
        .order('created_at');
      if (error) throw error;
      const projects = (data as Array<{
        id: string; user_id: string; name: string; color: string; created_at: number;
      }>).map(r => ({ id: r.id, userId: r.user_id, name: r.name, color: r.color, createdAt: r.created_at }));
      cacheSet(PROJECTS_KEY(userId), projects);
      return projects;
    } catch {
      return cacheGet<Project[]>(PROJECTS_KEY(userId), []);
    }
  },

  async createProject(userId: string, name: string, color: string): Promise<Project | null> {
    const project: Project = { id: generateId(), userId, name, color, createdAt: Date.now() };
    const cached = cacheGet<Project[]>(PROJECTS_KEY(userId), []);
    cacheSet(PROJECTS_KEY(userId), [...cached, project]);

    if (supabase) {
      try {
        await supabase.from('projects').insert({
          id: project.id, user_id: userId, name, color, created_at: project.createdAt,
        });
      } catch (err) { console.warn('[projectService] createProject:', err); }
    }
    return project;
  },

  async updateProject(userId: string, id: string, name: string, color: string): Promise<boolean> {
    const cached = cacheGet<Project[]>(PROJECTS_KEY(userId), []);
    const updated = cached.map(p => p.id === id ? { ...p, name, color } : p);
    cacheSet(PROJECTS_KEY(userId), updated);

    if (supabase) {
      try {
        await supabase.from('projects').update({ name, color }).eq('id', id);
      } catch (err) { console.warn('[projectService] updateProject:', err); }
    }
    return true;
  },

  async deleteProject(userId: string, id: string): Promise<boolean> {
    const cached = cacheGet<Project[]>(PROJECTS_KEY(userId), []);
    cacheSet(PROJECTS_KEY(userId), cached.filter(p => p.id !== id));

    if (supabase) {
      try {
        await supabase.from('projects').delete().eq('id', id);
      } catch (err) { console.warn('[projectService] deleteProject:', err); }
    }
    return true;
  },
};

// ── Time Records ─────────────────────────────────────────────

export const timeRecordService = {
  /** Builds time records from completed tasks and saves them */
  async saveEndOfDay(userId: string, tasks: Task[]): Promise<TimeRecord[]> {
    const today = new Date().toISOString().slice(0, 10);

    // Group elapsed time by projectId (null = sin proyecto)
    const groups: Record<string, { totalSeconds: number; taskCount: number }> = {};
    for (const task of tasks) {
      if (task.elapsedTime <= 0) continue;
      const key = task.projectId ?? '__none__';
      if (!groups[key]) groups[key] = { totalSeconds: 0, taskCount: 0 };
      groups[key].totalSeconds += task.elapsedTime;
      groups[key].taskCount += task.isCompleted ? 1 : 0;
    }

    const records: TimeRecord[] = Object.entries(groups).map(([key, val]) => ({
      id: generateId(),
      userId,
      projectId: key === '__none__' ? null : key,
      date: today,
      totalSeconds: val.totalSeconds,
      taskCount: val.taskCount,
      createdAt: Date.now(),
    }));

    // Save to cache
    const existing = cacheGet<TimeRecord[]>(RECORDS_KEY(userId), []);
    cacheSet(RECORDS_KEY(userId), [...existing, ...records]);

    // Save to Supabase
    if (supabase && records.length > 0) {
      try {
        await supabase.from('time_records').insert(
          records.map(r => ({
            id: r.id, user_id: r.userId, project_id: r.projectId,
            date: r.date, total_seconds: r.totalSeconds,
            task_count: r.taskCount, created_at: r.createdAt,
          }))
        );
      } catch (err) { console.warn('[timeRecordService] saveEndOfDay:', err); }
    }

    return records;
  },

  async getRecords(userId: string, fromDate?: string): Promise<TimeRecord[]> {
    if (!supabase) return cacheGet<TimeRecord[]>(RECORDS_KEY(userId), []);
    try {
      let query = supabase.from('time_records').select('*').eq('user_id', userId).order('date', { ascending: false });
      if (fromDate) query = query.gte('date', fromDate);
      const { data, error } = await query;
      if (error) throw error;
      return (data as Array<{
        id: string; user_id: string; project_id: string | null;
        date: string; total_seconds: number; task_count: number; created_at: number;
      }>).map(r => ({
        id: r.id, userId: r.user_id, projectId: r.project_id,
        date: r.date, totalSeconds: r.total_seconds,
        taskCount: r.task_count, createdAt: r.created_at,
      }));
    } catch {
      return cacheGet<TimeRecord[]>(RECORDS_KEY(userId), []);
    }
  },
};
