
export interface Task {
  id: number;
  projectId?: string | null;
  name: string;
  estimatedTime: number; // in seconds
  elapsedTime: number; // in seconds
  isActive: boolean;
  isCompleted: boolean;
  timeExceededNotified: boolean;
  createdAt: number;
  completedAt?: number | null;
}

export interface Project {
  id: string; // UUID
  userId: string;
  name: string;
  color: string; // hex color
  createdAt: number;
}

export interface TimeRecord {
  id: string; // UUID
  userId: string;
  projectId: string | null;
  date: string; // YYYY-MM-DD
  totalSeconds: number;
  taskCount: number;
  createdAt: number;
}

export interface Settings {
  toleranceTime: number;    // in seconds
  pauseInterval: number;    // in seconds (ej: 7200 = 2 horas)
  pauseDuration: number;    // in minutes
  snoozeDuration: number;   // in minutes
  focusModeEnabled: boolean;
  pomodoroTimer: number;    // in minutes
  workDay?: { start: string; end: string } | null;
}

export const DEFAULT_SETTINGS: Settings = {
  toleranceTime: 300,
  pauseInterval: 2 * 60 * 60,
  pauseDuration: 15,
  snoozeDuration: 15,
  focusModeEnabled: false,
  pomodoroTimer: 25,
  workDay: null,
};

export const PROJECT_COLORS = [
  '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b',
  '#ef4444', '#ec4899', '#06b6d4', '#84cc16',
];
