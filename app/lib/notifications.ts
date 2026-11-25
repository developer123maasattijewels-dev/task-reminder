import { Task, AppSettings } from '../types';
import { soundEngine } from './audio';
import { getCurrentTimeString, getTodayDateString } from './storage';

export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function getNotificationPermissionStatus(): NotificationPermission | 'unsupported' {
  if (!isNotificationSupported()) return 'unsupported';
  return Notification.permission;
}

export function sendBrowserNotification(title: string, options?: NotificationOptions): Notification | null {
  if (!isNotificationSupported() || Notification.permission !== 'granted') {
    return null;
  }

  try {
    const notif = new Notification(title, {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      ...options,
    });

    notif.onclick = () => {
      window.focus();
      notif.close();
    };

    return notif;
  } catch (err) {
    console.warn('Browser notification trigger failed:', err);
    return null;
  }
}

/**
 * Checks all tasks against the current time.
 * Triggers sound + browser notification + returns tasks with updated reminder timestamps.
 */
export function checkReminders(
  tasks: Task[],
  settings: AppSettings,
  onAlert: (task: Task) => void
): { updatedTasks: Task[]; updatedSettings: AppSettings; triggeredTasks: Task[] } {
  const currentTime = getCurrentTimeString();
  const today = getTodayDateString();
  const nowMs = Date.now();

  const triggeredTasks: Task[] = [];
  let tasksChanged = false;

  const updatedTasks = tasks.map((task) => {
    // If task is completed, do not remind
    if (task.completed) {
      return task;
    }

    // Check if task has a reminder set and enabled
    if (!task.reminderEnabled || !task.reminderTime) {
      return task;
    }

    const isSnoozedDue = task.snoozeUntil && nowMs >= task.snoozeUntil;
    const isScheduledDue =
      task.reminderTime === currentTime && task.lastRemindedDate !== today;

    if (isSnoozedDue || isScheduledDue) {
      // Trigger notification!
      triggeredTasks.push(task);
      tasksChanged = true;

      // Play Sound
      if (settings.soundEnabled) {
        if (task.priority === 'high') {
          soundEngine.playUrgentAlert(settings.soundVolume);
        } else {
          soundEngine.playReminderChime(settings.soundVolume);
        }
      }

      // Send Browser System Notification
      if (settings.browserNotificationsEnabled && isNotificationSupported() && Notification.permission === 'granted') {
        const bodyText = task.notes
          ? `${task.notes}\n[Priority: ${task.priority.toUpperCase()}]`
          : `Scheduled for ${task.reminderTime}. Tap to open DayPulse.`;

        sendBrowserNotification(`⏰ Reminder: ${task.title}`, {
          body: bodyText,
          tag: `task-${task.id}`,
        });
      }

      // Trigger UI Banner callback
      onAlert(task);

      return {
        ...task,
        lastRemindedDate: today,
        snoozeUntil: undefined, // Clear snooze once fired
      };
    }

    return task;
  });

  // Check Daily Digest (e.g. morning reminder)
  let updatedSettings = { ...settings };
  if (
    settings.dailyDigestEnabled &&
    settings.dailyDigestTime === currentTime &&
    settings.lastDigestDate !== today
  ) {
    const pendingTasks = tasks.filter((t) => !t.completed).length;
    if (pendingTasks > 0) {
      if (settings.soundEnabled) {
        soundEngine.playReminderChime(settings.soundVolume);
      }
      if (settings.browserNotificationsEnabled && isNotificationSupported() && Notification.permission === 'granted') {
        sendBrowserNotification('☀️ Daily Morning Briefing', {
          body: `Good day! You have ${pendingTasks} tasks to crush today. Stay focused!`,
          tag: 'daily-digest',
        });
      }
    }
    updatedSettings.lastDigestDate = today;
  }

  return {
    updatedTasks: tasksChanged ? updatedTasks : tasks,
    updatedSettings,
    triggeredTasks,
  };
}
