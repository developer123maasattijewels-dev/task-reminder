import { Task, AppSettings } from '../types';

export const STORAGE_KEYS = {
  TASKS: 'daypulse_tasks_v1',
  SETTINGS: 'daypulse_settings_v1',
};

export const DEFAULT_SETTINGS: AppSettings = {
  soundEnabled: true,
  soundVolume: 0.8,
  browserNotificationsEnabled: false,
  dailyDigestEnabled: true,
  dailyDigestTime: '09:00',
  lastResetDate: getTodayDateString(),
  streakCount: 1,
  lastStreakDate: getTodayDateString(),
};

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getCurrentTimeString(): string {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

export const INITIAL_SAMPLE_TASKS: Task[] = [
  {
    id: 'sample-1',
    title: 'Morning Hydration & Light Exercise (15m)',
    notes: 'Drink 2 glasses of lukewarm water and stretch',
    category: 'health',
    priority: 'high',
    isDaily: true,
    reminderTime: '07:30',
    reminderEnabled: true,
    completed: true,
    completedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: 'sample-2',
    title: 'Plan & Prioritize Top 3 Daily Goals',
    notes: 'Review tasks and organize the schedule for today',
    category: 'routine',
    priority: 'high',
    isDaily: true,
    reminderTime: '09:00',
    reminderEnabled: true,
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'sample-3',
    title: 'Deep Work Session: Core Project Tasks',
    notes: 'Focus with no social media interruptions for 90 mins',
    category: 'work',
    priority: 'high',
    isDaily: true,
    reminderTime: '11:00',
    reminderEnabled: true,
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'sample-4',
    title: 'Afternoon Refresh Walk & Break',
    notes: 'Rest eyes, step outside or do breathing exercise',
    category: 'health',
    priority: 'medium',
    isDaily: true,
    reminderTime: '16:00',
    reminderEnabled: true,
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'sample-5',
    title: 'Evening Task Review & Tomorrow Prep',
    notes: 'Check what was done today and plan for tomorrow',
    category: 'routine',
    priority: 'medium',
    isDaily: true,
    reminderTime: '20:30',
    reminderEnabled: true,
    completed: false,
    createdAt: new Date().toISOString(),
  },
];

export function loadSettings(): AppSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save settings:', err);
  }
}

export function loadTasks(): Task[] {
  if (typeof window === 'undefined') return INITIAL_SAMPLE_TASKS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TASKS);
    if (!raw) {
      saveTasks(INITIAL_SAMPLE_TASKS);
      return INITIAL_SAMPLE_TASKS;
    }
    const parsed: Task[] = JSON.parse(raw);
    return parsed;
  } catch {
    return INITIAL_SAMPLE_TASKS;
  }
}

export function saveTasks(tasks: Task[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  } catch (err) {
    console.error('Failed to save tasks:', err);
  }
}

/**
 * Handles daily reset:
 * If the current day is different from lastResetDate,
 * daily recurring tasks (isDaily = true) have completed set to false,
 * and lastRemindedDate is reset so new reminders fire for today!
 */
export function checkAndPerformDailyReset(
  tasks: Task[],
  settings: AppSettings
): { updatedTasks: Task[]; updatedSettings: AppSettings; wasReset: boolean } {
  const today = getTodayDateString();

  if (settings.lastResetDate === today) {
    return { updatedTasks: tasks, updatedSettings: settings, wasReset: false };
  }

  // Calculate streak: if at least 1 task was completed yesterday or today
  const hadCompletedTasks = tasks.some((t) => t.completed);
  let newStreak = settings.streakCount;

  // If previous day had completions, increment or maintain streak
  if (hadCompletedTasks) {
    newStreak += 1;
  }

  // Reset daily tasks
  const updatedTasks = tasks.map((task) => {
    if (task.isDaily) {
      return {
        ...task,
        completed: false,
        completedAt: undefined,
        lastRemindedDate: undefined,
        snoozeUntil: undefined,
      };
    }
    return task;
  });

  const updatedSettings: AppSettings = {
    ...settings,
    lastResetDate: today,
    lastDigestDate: undefined,
    streakCount: Math.max(1, newStreak),
    lastStreakDate: today,
  };

  saveTasks(updatedTasks);
  saveSettings(updatedSettings);

  return { updatedTasks, updatedSettings, wasReset: true };
}
