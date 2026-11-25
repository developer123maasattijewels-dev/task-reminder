'use client';

import React from 'react';
import {
  Check,
  Clock,
  Repeat,
  Trash2,
  Edit2,
  Bell,
  BellOff,
  AlertCircle,
  Play,
  RotateCcw,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Task } from '../types';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onTriggerTestAlarm: (task: Task) => void;
  onSnooze: (id: string, minutes: number) => void;
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  routine: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  work: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  health: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  personal: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  study: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
  general: { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' },
};

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onToggle,
  onEdit,
  onDelete,
  onTriggerTestAlarm,
  onSnooze,
}) => {
  const catStyle = CATEGORY_COLORS[task.category] || CATEGORY_COLORS.general;

  const handleToggle = () => {
    if (!task.completed) {
      // Trigger subtle celebratory confetti!
      try {
        confetti({
          particleCount: 35,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#6366f1', '#10b981', '#f59e0b', '#ec4899'],
        });
      } catch {
        // Fallback gracefully if confetti fails
      }
    }
    onToggle(task.id);
  };

  const isSnoozed = task.snoozeUntil && task.snoozeUntil > Date.now();
  let snoozeFormatted = '';
  if (isSnoozed && task.snoozeUntil) {
    const diffMins = Math.max(1, Math.round((task.snoozeUntil - Date.now()) / 60000));
    snoozeFormatted = `${diffMins}m`;
  }

  return (
    <div
      className={`group relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl border p-4 transition-all duration-200 ${
        task.completed
          ? 'border-slate-200 bg-slate-50/70 opacity-70'
          : 'border-slate-200 bg-white hover:border-indigo-300 hover:shadow-md'
      }`}
    >
      {/* Left section: Checkbox & Info */}
      <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
        {/* Custom Checkbox */}
        <button
          type="button"
          onClick={handleToggle}
          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border-2 transition-all mt-0.5 sm:mt-0 ${
            task.completed
              ? 'border-emerald-500 bg-emerald-500 text-white shadow-xs'
              : 'border-slate-300 bg-white hover:border-indigo-500 hover:bg-indigo-50/50'
          }`}
          aria-label={task.completed ? 'Mark pending' : 'Mark completed'}
        >
          {task.completed && <Check className="h-4 w-4 stroke-[3]" />}
        </button>

        {/* Title, description & meta badges */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4
              className={`text-sm font-semibold truncate transition-all ${
                task.completed ? 'line-through text-slate-400' : 'text-slate-900'
              }`}
            >
              {task.title}
            </h4>
          </div>

          {task.notes && (
            <p
              className={`text-xs mt-0.5 line-clamp-1 transition-all ${
                task.completed ? 'text-slate-400 line-through' : 'text-slate-500'
              }`}
            >
              {task.notes}
            </p>
          )}

          {/* Badges row */}
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {/* Category */}
            <span
              className={`rounded-md px-2 py-0.5 text-[11px] font-semibold border ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}
            >
              {task.category}
            </span>

            {/* Priority */}
            <span
              className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                task.priority === 'high'
                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                  : task.priority === 'medium'
                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}
            >
              {task.priority}
            </span>

            {/* Daily Habit indicator */}
            {task.isDaily && (
              <span
                title="Repeats daily - auto resets every midnight"
                className="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-2 py-0.5 text-[11px] font-medium text-indigo-700 border border-indigo-200"
              >
                <Repeat className="h-3 w-3" />
                <span>Daily</span>
              </span>
            )}

            {/* Reminder time badge */}
            {task.reminderEnabled && task.reminderTime && (
              <span
                className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium border ${
                  isSnoozed
                    ? 'bg-amber-100 text-amber-800 border-amber-300 animate-pulse'
                    : 'bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <Clock className="h-3 w-3 text-indigo-600" />
                <span>
                  {task.reminderTime}
                  {isSnoozed && ` (Snoozed ${snoozeFormatted})`}
                </span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right section: Action Buttons */}
      <div className="flex items-center gap-1 self-end sm:self-center shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 w-full sm:w-auto justify-end">
        {/* Test alert button */}
        {task.reminderEnabled && (
          <button
            onClick={() => onTriggerTestAlarm(task)}
            title="Test reminder chime for this task"
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50 transition-colors"
          >
            <Play className="h-3 w-3" />
            <span className="hidden sm:inline">Test Alert</span>
          </button>
        )}

        {/* Quick snooze button */}
        {!task.completed && task.reminderEnabled && (
          <button
            onClick={() => onSnooze(task.id, 10)}
            title="Snooze reminder by 10 minutes"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        )}

        {/* Edit Button */}
        <button
          onClick={() => onEdit(task)}
          title="Edit task"
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
        >
          <Edit2 className="h-3.5 w-3.5" />
        </button>

        {/* Delete Button */}
        <button
          onClick={() => onDelete(task.id)}
          title="Delete task"
          className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};
