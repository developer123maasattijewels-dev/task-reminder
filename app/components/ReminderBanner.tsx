'use client';

import React from 'react';
import { Bell, CheckCircle, Clock, X, AlertTriangle } from 'lucide-react';
import { Task } from '../types';

interface ReminderBannerProps {
  alerts: Task[];
  onComplete: (taskId: string) => void;
  onSnooze: (taskId: string, minutes: number) => void;
  onDismiss: (taskId: string) => void;
}

export const ReminderBanner: React.FC<ReminderBannerProps> = ({
  alerts,
  onComplete,
  onSnooze,
  onDismiss,
}) => {
  if (alerts.length === 0) return null;

  return (
    <div className="fixed top-16 right-4 left-4 z-50 mx-auto max-w-xl flex flex-col gap-2.5 pointer-events-none">
      {alerts.map((task) => (
        <div
          key={task.id}
          className="pointer-events-auto relative overflow-hidden rounded-2xl border-2 border-indigo-500 bg-white p-4 shadow-2xl shadow-indigo-500/30 transition-all animate-bounce-short sm:p-5"
        >
          {/* Accent strip */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-amber-400 to-rose-500" />

          <div className="flex items-start gap-3.5">
            {/* Bell icon container */}
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 shadow-inner">
              <Bell className="h-6 w-6 animate-pulse" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-bold text-rose-600 border border-rose-200">
                  <AlertTriangle className="h-3 w-3" />
                  TASK REMINDER DUE
                </span>
                <button
                  onClick={() => onDismiss(task.id)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <h4 className="mt-1 text-base font-bold text-slate-900 truncate">
                {task.title}
              </h4>
              {task.notes && (
                <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">
                  {task.notes}
                </p>
              )}

              {/* Action Buttons */}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <button
                  onClick={() => onComplete(task.id)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white shadow-xs transition-colors"
                >
                  <CheckCircle className="h-3.5 w-3.5" />
                  Mark Done
                </button>

                <button
                  onClick={() => onSnooze(task.id, 5)}
                  className="inline-flex items-center gap-1 rounded-lg bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 transition-colors"
                >
                  <Clock className="h-3.5 w-3.5 text-slate-500" />
                  +5m
                </button>

                <button
                  onClick={() => onSnooze(task.id, 15)}
                  className="inline-flex items-center gap-1 rounded-lg bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 transition-colors"
                >
                  <Clock className="h-3.5 w-3.5 text-slate-500" />
                  +15m
                </button>

                <button
                  onClick={() => onDismiss(task.id)}
                  className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-700 transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
