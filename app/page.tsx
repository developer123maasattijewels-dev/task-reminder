'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  Check,
  Clock,
  Repeat,
  Trash2,
  Bell,
  Volume2,
  VolumeX,
  Play,
  RotateCcw,
  Sparkles,
  X,
  AlertCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface Task {
  id: string;
  title: string;
  isDaily: boolean;
  reminderTime?: string; // HH:mm
  completed: boolean;
  lastRemindedDate?: string;
  snoozeUntil?: number;
}

// Built-in Web Audio API Chime - zero external assets needed!
const playChime = () => {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.12);
      gain.gain.setValueAtTime(0, now + i * 0.12);
      gain.gain.linearRampToValueAtTime(0.25, now + i * 0.12 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.12 + 0.8);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.12);
      osc.stop(now + i * 0.12 + 0.9);
    });
  } catch {
    // fallback
  }
};

const playCheckSound = () => {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;
    [587.33, 880].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + i * 0.08);
      gain.gain.setValueAtTime(0, now + i * 0.08);
      gain.gain.linearRampToValueAtTime(0.2, now + i * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.08 + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.5);
    });
  } catch {
    // fallback
  }
};

const getTodayString = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
    now.getDate()
  ).padStart(2, '0')}`;
};

const getCurrentTime = () => {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(
    now.getMinutes()
  ).padStart(2, '0')}`;
};

const INITIAL_TASKS: Task[] = [
  {
    id: '1',
    title: 'Morning Water & 15m Exercise',
    isDaily: true,
    reminderTime: '07:30',
    completed: true,
  },
  {
    id: '2',
    title: 'Daily Top 3 Priorities Check',
    isDaily: true,
    reminderTime: '09:00',
    completed: false,
  },
  {
    id: '3',
    title: 'Important Work / Study Session',
    isDaily: true,
    reminderTime: '11:30',
    completed: false,
  },
  {
    id: '4',
    title: 'Evening Walk & Rest',
    isDaily: true,
    reminderTime: '17:30',
    completed: false,
  },
  {
    id: '5',
    title: 'Review Today & Plan Tomorrow',
    isDaily: true,
    reminderTime: '21:00',
    completed: false,
  },
];

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>('default');
  const [activeAlerts, setActiveAlerts] = useState<Task[]>([]);

  // Input states
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('09:00');
  const [newIsDaily, setNewIsDaily] = useState(true);

  // Filter
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  // Live Clock
  const [currentTimeDisplay, setCurrentTimeDisplay] = useState('');
  const [currentDateDisplay, setCurrentDateDisplay] = useState('');

  // 1. Initial Load & Daily Reset
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if ('Notification' in window) {
      setNotifPermission(Notification.permission);
    }

    try {
      const stored = localStorage.getItem('simple_daily_tasks');
      const lastReset = localStorage.getItem('simple_daily_last_reset');
      const today = getTodayString();

      let loaded: Task[] = stored ? JSON.parse(stored) : INITIAL_TASKS;

      // Reset daily habits if it's a new day
      if (lastReset !== today) {
        loaded = loaded.map((t) => (t.isDaily ? { ...t, completed: false, lastRemindedDate: undefined, snoozeUntil: undefined } : t));
        localStorage.setItem('simple_daily_last_reset', today);
      }

      setTasks(loaded);
      localStorage.setItem('simple_daily_tasks', JSON.stringify(loaded));
    } catch {
      setTasks(INITIAL_TASKS);
    }
  }, []);

  // 2. Live Date & Time Updater
  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTimeDisplay(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
      setCurrentDateDisplay(
        now.toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  // 3. Save tasks helper
  const updateTasks = (updated: Task[]) => {
    setTasks(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('simple_daily_tasks', JSON.stringify(updated));
    }
  };

  // 4. Request Browser Notification Permission
  const requestPermission = async () => {
    if ('Notification' in window) {
      const res = await Notification.requestPermission();
      setNotifPermission(res);
      if (res === 'granted') {
        new Notification('🔔 Daily Reminders Enabled!', {
          body: 'You will receive on-time daily alerts for your tasks.',
          icon: '/favicon.ico',
        });
      }
    }
  };

  // 5. Background Reminder Engine (Runs every 10 seconds)
  useEffect(() => {
    const timer = setInterval(() => {
      const nowTime = getCurrentTime();
      const today = getTodayString();
      const nowMs = Date.now();

      setTasks((prevTasks) => {
        let changed = false;
        const nextTasks = prevTasks.map((t) => {
          if (t.completed || !t.reminderTime) return t;

          const isSnoozedDue = t.snoozeUntil && nowMs >= t.snoozeUntil;
          const isTimeDue = t.reminderTime === nowTime && t.lastRemindedDate !== today;

          if (isSnoozedDue || isTimeDue) {
            changed = true;

            // Trigger Alert
            setActiveAlerts((alerts) => {
              if (alerts.some((a) => a.id === t.id)) return alerts;
              return [...alerts, t];
            });

            // Play sound
            if (soundEnabled) {
              playChime();
            }

            // Desktop notification
            if (
              typeof window !== 'undefined' &&
              'Notification' in window &&
              Notification.permission === 'granted'
            ) {
              new Notification(`⏰ Reminder: ${t.title}`, {
                body: `It is ${t.reminderTime}. Time to complete your task!`,
                icon: '/favicon.ico',
              });
            }

            return {
              ...t,
              lastRemindedDate: today,
              snoozeUntil: undefined,
            };
          }
          return t;
        });

        if (changed && typeof window !== 'undefined') {
          localStorage.setItem('simple_daily_tasks', JSON.stringify(nextTasks));
        }
        return nextTasks;
      });
    }, 10000);

    return () => clearInterval(timer);
  }, [soundEnabled]);

  // Actions
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newTask: Task = {
      id: String(Date.now()),
      title: newTitle.trim(),
      reminderTime: newTime || undefined,
      isDaily: newIsDaily,
      completed: false,
    };

    updateTasks([newTask, ...tasks]);
    setNewTitle('');
  };

  const handleToggle = (id: string) => {
    const target = tasks.find((t) => t.id === id);
    const willBeDone = target ? !target.completed : false;

    if (willBeDone) {
      if (soundEnabled) playCheckSound();
      try {
        confetti({
          particleCount: 25,
          spread: 50,
          origin: { y: 0.8 },
          colors: ['#4f46e5', '#10b981', '#f59e0b'],
        });
      } catch {
        // ignore
      }
      setActiveAlerts((prev) => prev.filter((a) => a.id !== id));
    }

    const updated = tasks.map((t) =>
      t.id === id ? { ...t, completed: !t.completed } : t
    );
    updateTasks(updated);
  };

  const handleDelete = (id: string) => {
    const updated = tasks.filter((t) => t.id !== id);
    updateTasks(updated);
    setActiveAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSnooze = (id: string, mins: number) => {
    const snoozeUntil = Date.now() + mins * 60000;
    const updated = tasks.map((t) => (t.id === id ? { ...t, snoozeUntil } : t));
    updateTasks(updated);
    setActiveAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  const handleTriggerTest = (task: Task) => {
    if (soundEnabled) playChime();
    setActiveAlerts((prev) => {
      if (prev.some((a) => a.id === task.id)) return prev;
      return [...prev, task];
    });
  };

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    if (filter === 'active') return tasks.filter((t) => !t.completed);
    if (filter === 'completed') return tasks.filter((t) => t.completed);
    return tasks;
  }, [tasks, filter]);

  const completedCount = tasks.filter((t) => t.completed).length;
  const totalCount = tasks.length;
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#fcfcfd] text-slate-800 antialiased selection:bg-indigo-500 selection:text-white">
      {/* Floating Active Reminder Alerts */}
      {activeAlerts.length > 0 && (
        <div className="fixed top-4 left-4 right-4 z-50 mx-auto max-w-lg space-y-2">
          {activeAlerts.map((task) => (
            <div
              key={task.id}
              className="flex items-center justify-between gap-3 rounded-2xl bg-slate-900 p-4 text-white shadow-2xl border border-indigo-500/50 animate-bounce-short"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white animate-pulse">
                  <Bell className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-indigo-300">
                    ⏰ TASK REMINDER DUE ({task.reminderTime})
                  </p>
                  <h4 className="text-sm font-bold truncate text-white">
                    {task.title}
                  </h4>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleToggle(task.id)}
                  className="rounded-lg bg-emerald-500 hover:bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white transition-colors"
                >
                  Done
                </button>
                <button
                  onClick={() => handleSnooze(task.id, 5)}
                  className="rounded-lg bg-slate-800 hover:bg-slate-700 px-2.5 py-1.5 text-xs font-medium text-slate-300 transition-colors"
                >
                  +5m
                </button>
                <button
                  onClick={() =>
                    setActiveAlerts((prev) => prev.filter((a) => a.id !== task.id))
                  }
                  className="rounded-lg p-1 text-slate-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Main Container */}
      <div className="mx-auto max-w-2xl px-4 py-10 sm:py-14">
        {/* Top Minimal Bar */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-200/80">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
              Daily Tasks
            </h1>
            <p className="text-xs font-medium text-slate-500 mt-0.5">
              {currentDateDisplay} • <span className="font-mono text-slate-700">{currentTimeDisplay}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Test Alarm Sound Button */}
            <button
              onClick={playChime}
              title="Test reminder chime"
              className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 hover:bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 transition-colors"
            >
              <Play className="h-3 w-3 fill-current text-indigo-600" />
              <span>Test Chime</span>
            </button>

            {/* Notification Permission Pill */}
            {notifPermission === 'granted' ? (
              <span
                title="Browser notifications active"
                className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-xs font-semibold text-emerald-700"
              >
                <Bell className="h-3 w-3 text-emerald-600" />
                <span>Alerts On</span>
              </span>
            ) : (
              <button
                onClick={requestPermission}
                title="Enable browser notifications"
                className="inline-flex items-center gap-1 rounded-full bg-amber-500 hover:bg-amber-600 px-3 py-1 text-xs font-semibold text-white shadow-xs transition-colors"
              >
                <Bell className="h-3 w-3" />
                <span>Enable Alerts</span>
              </button>
            )}

            {/* Sound Mute/Unmute */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? 'Mute sound' : 'Unmute sound'}
              className="rounded-full p-1.5 text-slate-500 hover:bg-slate-100 transition-colors"
            >
              {soundEnabled ? (
                <Volume2 className="h-4 w-4 text-indigo-600" />
              ) : (
                <VolumeX className="h-4 w-4 text-slate-400" />
              )}
            </button>
          </div>
        </div>

        {/* Clean Progress Summary */}
        <div className="py-5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600 mb-2">
            <span>
              {completedCount} of {totalCount} completed
            </span>
            <span className="font-mono text-slate-700">{percentage}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-indigo-600 transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {/* Ultra Simple Add Task Input */}
        <form
          onSubmit={handleAddTask}
          className="mb-6 rounded-2xl bg-white p-3 shadow-xs border border-slate-200/90 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/10 transition-all"
        >
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Add a new daily task..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="flex-1 bg-transparent px-2 py-1.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
            />

            {/* Reminder Time input */}
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1">
              <Clock className="h-3.5 w-3.5 text-slate-400" />
              <input
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none"
              />
            </div>

            {/* Daily Habit Toggle */}
            <button
              type="button"
              onClick={() => setNewIsDaily(!newIsDaily)}
              title={newIsDaily ? 'Daily recurring task' : 'One-time task'}
              className={`inline-flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-semibold border transition-colors ${
                newIsDaily
                  ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
                  : 'border-slate-200 bg-slate-50 text-slate-500'
              }`}
            >
              <Repeat className="h-3 w-3" />
              <span className="hidden sm:inline">Daily</span>
            </button>

            {/* Add Button */}
            <button
              type="submit"
              disabled={!newTitle.trim()}
              className="inline-flex items-center gap-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 px-3.5 py-1.5 text-xs font-bold text-white transition-all shadow-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add</span>
            </button>
          </div>
        </form>

        {/* Clean Filter Tabs */}
        <div className="flex items-center gap-1 border-b border-slate-200/70 pb-2 mb-3">
          {[
            { id: 'all', label: 'All Tasks', count: tasks.length },
            {
              id: 'active',
              label: 'Pending',
              count: tasks.filter((t) => !t.completed).length,
            },
            {
              id: 'completed',
              label: 'Done',
              count: tasks.filter((t) => t.completed).length,
            },
          ].map((tab) => {
            const active = filter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id as 'all' | 'active' | 'completed')}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  active
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                    active ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Clean Minimal Task List */}
        <div className="space-y-1.5">
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => (
              <div
                key={task.id}
                className={`group flex items-center justify-between gap-3 rounded-xl border px-3.5 py-3 transition-all ${
                  task.completed
                    ? 'border-slate-100 bg-slate-50/60 opacity-60'
                    : 'border-slate-200/80 bg-white hover:border-slate-300 hover:shadow-2xs'
                }`}
              >
                {/* Checkbox & Title */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <button
                    onClick={() => handleToggle(task.id)}
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all ${
                      task.completed
                        ? 'border-emerald-500 bg-emerald-500 text-white'
                        : 'border-slate-300 hover:border-indigo-600'
                    }`}
                  >
                    {task.completed && <Check className="h-3 w-3 stroke-[3]" />}
                  </button>

                  <span
                    onClick={() => handleToggle(task.id)}
                    className={`cursor-pointer text-sm font-medium truncate select-none ${
                      task.completed
                        ? 'line-through text-slate-400'
                        : 'text-slate-800'
                    }`}
                  >
                    {task.title}
                  </span>
                </div>

                {/* Badges & Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {/* Daily Repeat Icon */}
                  {task.isDaily && (
                    <span
                      title="Repeats every day"
                      className="inline-flex items-center gap-0.5 rounded-md bg-indigo-50 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-700"
                    >
                      <Repeat className="h-2.5 w-2.5" />
                      <span>Daily</span>
                    </span>
                  )}

                  {/* Reminder Time */}
                  {task.reminderTime && (
                    <span
                      title="Scheduled reminder time"
                      className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600"
                    >
                      <Clock className="h-3 w-3 text-indigo-500" />
                      <span>{task.reminderTime}</span>
                    </span>
                  )}

                  {/* Test Alarm Trigger */}
                  <button
                    onClick={() => handleTriggerTest(task)}
                    title="Test alarm alert for this task"
                    className="opacity-0 group-hover:opacity-100 rounded-md p-1 text-slate-400 hover:text-indigo-600 transition-opacity"
                  >
                    <Bell className="h-3.5 w-3.5" />
                  </button>

                  {/* Delete Task */}
                  <button
                    onClick={() => handleDelete(task.id)}
                    title="Delete task"
                    className="opacity-0 group-hover:opacity-100 rounded-md p-1 text-slate-400 hover:text-rose-600 transition-opacity"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center text-xs text-slate-400">
              No tasks found. Add a task above to schedule your daily reminder!
            </div>
          )}
        </div>

        {/* Footer info note */}
        <div className="mt-12 text-center text-[11px] text-slate-400">
          <p>🔁 Daily tasks auto-reset every midnight • Reminders chime on schedule</p>
        </div>
      </div>
    </div>
  );
}
