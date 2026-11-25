export type Category = 'work' | 'personal' | 'health' | 'study' | 'routine' | 'general';
export type Priority = 'high' | 'medium' | 'low';

export interface Task {
  id: string;
  title: string;
  notes?: string;
  category: Category;
  priority: Priority;
  isDaily: boolean; // Auto-resets every day for daily routines
  reminderTime?: string; // HH:mm format (e.g. "09:30")
  reminderEnabled: boolean;
  completed: boolean;
  completedAt?: string;
  createdAt: string;
  lastRemindedDate?: string; // YYYY-MM-DD of when notification was last sent
  snoozeUntil?: number; // timestamp in ms
}

export interface AppSettings {
  soundEnabled: boolean;
  soundVolume: number; // 0 to 1
  browserNotificationsEnabled: boolean;
  dailyDigestEnabled: boolean;
  dailyDigestTime: string; // HH:mm (e.g. "08:30")
  lastDigestDate?: string;
  lastResetDate: string; // YYYY-MM-DD to detect new day
  streakCount: number;
  lastStreakDate?: string;
}

export interface ActiveAlert {
  task: Task;
  timestamp: number;
}
