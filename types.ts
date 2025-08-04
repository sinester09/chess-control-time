
export interface Task {
  id: number;
  name: string;
  estimatedTime: number; // in seconds
  elapsedTime: number; // in seconds
  isActive: boolean;
  isCompleted: boolean;
  timeExceededNotified: boolean;
  createdAt: number; // timestamp de creación
  completedAt?: number; // timestamp de finalización (opcional)
}

export interface Settings {
  toleranceTime: number; // in seconds
  pauseInterval: number; // in seconds
  pauseDuration: number; // in minutes
  snoozeDuration: number; // in minutes
  focusModeEnabled?: boolean; // indica si el modo de enfoque está activado
  pomodoroTimer?: number; // duración del temporizador pomodoro en minutos
}
