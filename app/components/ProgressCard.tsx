'use client';

import React, { useState, useEffect } from 'react';
import { Flame, CheckCircle2, Clock, Calendar, Sparkles, RefreshCw } from 'lucide-react';
import { Task } from '../types';

interface ProgressCardProps {
  tasks: Task[];
  streak: number;
}

export const ProgressCard: React.FC<ProgressCardProps> = ({ tasks, streak }) => {
  const [resetCountdown, setResetCountdown] = useState<string>('');
  const [greeting, setGreeting] = useState<string>('Welcome');

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const pendingTasks = totalTasks - completedTasks;
  const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const currentHour = now.getHours();

      if (currentHour < 12) setGreeting('Good morning ☀️');
      else if (currentHour < 18) setGreeting('Good afternoon 🌤️');
      else setGreeting('Good evening 🌙');

      // Calculate time until midnight
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      const diffMs = midnight.getTime() - now.getTime();
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      setResetCountdown(`${hours}h ${minutes}m`);
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 p-6 text-white shadow-xl shadow-indigo-950/20">
      {/* Background glowing ambient shapes */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-violet-500/10 blur-3xl" />

      <div className="relative z-10 flex flex-col gap-5">
        {/* Top greeting & streak */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-indigo-200">{greeting}</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500/20 px-2 py-0.5 text-[11px] font-medium text-indigo-200 border border-indigo-400/20">
                <RefreshCw className="h-2.5 w-2.5 animate-spin-slow" />
                Resets in {resetCountdown}
              </span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white">Daily Task Overview</h2>
          </div>

          {/* Streak pill */}
          <div className="flex items-center gap-2 rounded-xl bg-white/10 px-3.5 py-2 backdrop-blur-md border border-white/10 shadow-inner">
            <Flame className="h-5 w-5 text-amber-400 animate-bounce" />
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-indigo-200">Consistency</p>
              <p className="text-sm font-bold text-white">{streak} Day{streak !== 1 ? 's' : ''} Streak</p>
            </div>
          </div>
        </div>

        {/* Progress Bar & Percentage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-indigo-200">Today&apos;s Goal Progress</span>
            <span className="text-white font-mono text-sm">{percentage}% Completed</span>
          </div>

          <div className="relative h-3 w-full overflow-hidden rounded-full bg-black/30 p-0.5 border border-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-teal-300 to-indigo-300 transition-all duration-700 ease-out shadow-sm"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {/* Mini stats counters */}
        <div className="grid grid-cols-3 gap-3 pt-2">
          <div className="rounded-xl bg-white/5 p-3 backdrop-blur-sm border border-white/5">
            <div className="flex items-center gap-1.5 text-xs text-indigo-200 mb-1">
              <Calendar className="h-3.5 w-3.5 text-indigo-400" />
              <span>Total Tasks</span>
            </div>
            <p className="text-xl font-bold text-white">{totalTasks}</p>
          </div>

          <div className="rounded-xl bg-emerald-500/10 p-3 backdrop-blur-sm border border-emerald-500/20">
            <div className="flex items-center gap-1.5 text-xs text-emerald-300 mb-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              <span>Completed</span>
            </div>
            <p className="text-xl font-bold text-emerald-300">{completedTasks}</p>
          </div>

          <div className="rounded-xl bg-amber-500/10 p-3 backdrop-blur-sm border border-amber-500/20">
            <div className="flex items-center gap-1.5 text-xs text-amber-300 mb-1">
              <Clock className="h-3.5 w-3.5 text-amber-400" />
              <span>Pending</span>
            </div>
            <p className="text-xl font-bold text-amber-300">{pendingTasks}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
