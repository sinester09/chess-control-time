
export interface Task {
  id: number;
  name: string;
  estimatedTime: number; // in seconds
  elapsedTime: number; // in seconds
  isActive: boolean;
  isCompleted: boolean;
  timeExceededNotified: boolean;
  createdAt: number; // timestamp de creación
  completedAt?: number | null; // timestamp de finalización (opcional)
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
