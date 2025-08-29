import { Task } from '../../types';

// Interfaz para configuraciones
export interface TaskSettings {
  toleranceTime: number;
  theme: 'light' | 'dark';
  notifications: boolean;
  autoBackup: boolean;
  workDay: { start: string; end: string } | null;
}

// Clase principal del servicio
export class TaskStorageService {
  private readonly TASKS_KEY: string;
  private readonly SETTINGS_KEY: string;
  private readonly BACKUP_KEY: string;

  // Configuración por defecto
  private readonly DEFAULT_SETTINGS: TaskSettings = {
    toleranceTime: 300, // 5 minutos
    theme: 'dark',
    notifications: true,
    autoBackup: true,
    workDay: null,
  };

  constructor(private uid: string) {
    if (!uid) {
      throw new Error('[TaskStorage] Se requiere un UID de usuario.');
    }
    this.TASKS_KEY = `pomodoro_tasks_${uid}`;
    this.SETTINGS_KEY = `pomodoro_settings_${uid}`;
    this.BACKUP_KEY = `pomodoro_backup_${uid}`;
  }

  private isLocalStorageAvailable(): boolean {
    try {
      const testKey = '__localStorage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch (error) {
      console.error('[TaskStorage] LocalStorage no disponible:', error);
      return false;
    }
  }

  private safeOperation<T>(operation: () => T, fallback: T): T {
    if (!this.isLocalStorageAvailable()) {
      return fallback;
    }

    try {
      return operation();
    } catch (error) {
      console.error(`[TaskStorage] Error en operación para UID ${this.uid}:`, error);
      return fallback;
    }
  }

  async getTasks(): Promise<Task[]> {
    return this.safeOperation(() => {
      const tasksJson = localStorage.getItem(this.TASKS_KEY);
      if (!tasksJson) return [];
      const tasks = JSON.parse(tasksJson) as Task[];
      return tasks.filter(task => 
        task && 
        typeof task.id === 'number' && 
        typeof task.name === 'string' && 
        task.name.trim().length > 0
      );
    }, []);
  }

  async saveTasks(tasks: Task[]): Promise<boolean> {
    return this.safeOperation(async () => {
      const validTasks = tasks.filter(task => 
        task && 
        typeof task.id === 'number' && 
        typeof task.name === 'string' && 
        task.name.trim().length > 0
      );

      localStorage.setItem(this.TASKS_KEY, JSON.stringify(validTasks));
      
      if (await this.shouldAutoBackup()) {
        await this.createBackup(validTasks);
      }
      
      return true;
    }, Promise.resolve(false));
  }

  async addTask(taskData: Omit<Task, 'id' | 'createdAt' | 'isActive' | 'isCompleted' | 'elapsedTime' | 'timeExceededNotified'>): Promise<Task | null> {
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
    const success = await this.saveTasks(updatedTasks);
    
    return success ? newTask : null;
  }

  async updateTask(taskId: number, updates: Partial<Task>): Promise<boolean> {
    const tasks = await this.getTasks();
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    
    if (taskIndex === -1) return false;

    tasks[taskIndex] = { ...tasks[taskIndex], ...updates };
    return await this.saveTasks(tasks);
  }

  async deleteTask(taskId: number): Promise<boolean> {
    const tasks = await this.getTasks();
    const filteredTasks = tasks.filter(t => t.id !== taskId);
    
    if (filteredTasks.length === tasks.length) return false;
    
    return await this.saveTasks(filteredTasks);
  }

  async getTask(taskId: number): Promise<Task | null> {
    const tasks = await this.getTasks();
    return tasks.find(t => t.id === taskId) || null;
  }

  async completeTask(taskId: number): Promise<boolean> {
    return await this.updateTask(taskId, {
      isCompleted: true,
      isActive: false,
      completedAt: Date.now(),
    });
  }

  async toggleTask(taskId: number): Promise<boolean> {
    const task = await this.getTask(taskId);
    if (!task) return false;

    if (!task.isActive) {
      const tasks = await this.getTasks();
      const updatedTasks = tasks.map(t => ({
        ...t,
        isActive: t.id === taskId ? true : false
      }));
      return await this.saveTasks(updatedTasks);
    } else {
      return await this.updateTask(taskId, { isActive: false });
    }
  }

  async getSettings(): Promise<TaskSettings> {
    return this.safeOperation(() => {
      const settingsJson = localStorage.getItem(this.SETTINGS_KEY);
      if (!settingsJson) return this.DEFAULT_SETTINGS;
      
      const parsed = JSON.parse(settingsJson);
      return { ...this.DEFAULT_SETTINGS, ...parsed };
    }, this.DEFAULT_SETTINGS);
  }

  async saveSettings(settings: Partial<TaskSettings>): Promise<boolean> {
    return this.safeOperation(async () => {
      const currentSettings = await this.getSettings();
      const newSettings = { ...currentSettings, ...settings };
      localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(newSettings));
      return true;
    }, Promise.resolve(false));
  }

  async createBackup(tasks?: Task[]): Promise<boolean> {
    const tasksToBackup = tasks || await this.getTasks();
    const settings = await this.getSettings();
    
    const backup = {
      timestamp: Date.now(),
      tasks: tasksToBackup,
      settings,
      version: '1.0',
    };

    return this.safeOperation(() => {
      localStorage.setItem(this.BACKUP_KEY, JSON.stringify(backup));
      return true;
    }, false);
  }

  async clearAllData(): Promise<boolean> {
    return this.safeOperation(() => {
      localStorage.removeItem(this.TASKS_KEY);
      localStorage.removeItem(this.SETTINGS_KEY);
      localStorage.removeItem(this.BACKUP_KEY);
      return true;
    }, false);
  }

  private async shouldAutoBackup(): Promise<boolean> {
    const settings = await this.getSettings();
    return settings.autoBackup;
  }
}
