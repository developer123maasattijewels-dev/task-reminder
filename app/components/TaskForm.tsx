'use client';

import React, { useState, useEffect } from 'react';
import {
  Plus,
  Clock,
  Repeat,
  Tag,
  AlertCircle,
  X,
  Sparkles,
} from 'lucide-react';
import { Task, Category, Priority } from '../types';

interface TaskFormProps {
  initialTask?: Task | null;
  onSave: (taskData: Omit<Task, 'id' | 'createdAt' | 'completed'>) => void;
  onClose?: () => void;
  isModal?: boolean;
}

const CATEGORIES: { id: Category; label: string; color: string }[] = [
  { id: 'routine', label: 'Daily Routine', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  { id: 'work', label: 'Work', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { id: 'health', label: 'Health & Fitness', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  { id: 'personal', label: 'Personal', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  { id: 'study', label: 'Study / Learn', color: 'bg-rose-100 text-rose-700 border-rose-200' },
  { id: 'general', label: 'General', color: 'bg-slate-100 text-slate-700 border-slate-200' },
];

export const TaskForm: React.FC<TaskFormProps> = ({
  initialTask,
  onSave,
  onClose,
  isModal = false,
}) => {
  const [title, setTitle] = useState(initialTask?.title || '');
  const [notes, setNotes] = useState(initialTask?.notes || '');
  const [category, setCategory] = useState<Category>(initialTask?.category || 'routine');
  const [priority, setPriority] = useState<Priority>(initialTask?.priority || 'medium');
  const [isDaily, setIsDaily] = useState<boolean>(initialTask ? initialTask.isDaily : true);
  const [reminderEnabled, setReminderEnabled] = useState<boolean>(
    initialTask ? initialTask.reminderEnabled : true
  );
  const [reminderTime, setReminderTime] = useState<string>(
    initialTask?.reminderTime || '09:00'
  );

  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title);
      setNotes(initialTask.notes || '');
      setCategory(initialTask.category);
      setPriority(initialTask.priority);
      setIsDaily(initialTask.isDaily);
      setReminderEnabled(initialTask.reminderEnabled);
      setReminderTime(initialTask.reminderTime || '09:00');
    }
  }, [initialTask]);

  // Helper to set reminder relative to now
  const setQuickReminderMinutes = (mins: number) => {
    const d = new Date(Date.now() + mins * 60000);
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    setReminderTime(`${hh}:${mm}`);
    setReminderEnabled(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      title: title.trim(),
      notes: notes.trim() ? notes.trim() : undefined,
      category,
      priority,
      isDaily,
      reminderEnabled,
      reminderTime: reminderEnabled ? reminderTime : undefined,
    });

    if (!initialTask) {
      setTitle('');
      setNotes('');
    }
    if (onClose) {
      onClose();
    }
  };

  const formContent = (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Title */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
          Task Name *
        </label>
        <input
          type="text"
          required
          autoFocus={isModal}
          placeholder="e.g. Morning Jog, Review Project, Drink 3L Water..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
        />
      </div>

      {/* Notes / Description */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
          Notes / Details (Optional)
        </label>
        <textarea
          rows={2}
          placeholder="Add extra instructions, checklist or tips..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all resize-none"
        />
      </div>

      {/* Reminder Schedule */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-indigo-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Daily Reminder Alert
            </span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={reminderEnabled}
              onChange={(e) => setReminderEnabled(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
          </label>
        </div>

        {reminderEnabled && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <input
              type="time"
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-800 focus:border-indigo-500 focus:outline-none shadow-2xs"
            />
            {/* Quick offset buttons */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setQuickReminderMinutes(10)}
                className="rounded-md bg-white border border-slate-200 px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
              >
                In 10m
              </button>
              <button
                type="button"
                onClick={() => setQuickReminderMinutes(30)}
                className="rounded-md bg-white border border-slate-200 px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
              >
                In 30m
              </button>
              <button
                type="button"
                onClick={() => setReminderTime('08:00')}
                className="rounded-md bg-white border border-slate-200 px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
              >
                8:00 AM
              </button>
              <button
                type="button"
                onClick={() => setReminderTime('20:00')}
                className="rounded-md bg-white border border-slate-200 px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
              >
                8:00 PM
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Daily Repeat Toggle & Priority */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Daily Habit vs One-time */}
        <div
          onClick={() => setIsDaily(!isDaily)}
          className={`flex items-center justify-between rounded-xl border p-3 cursor-pointer transition-all ${
            isDaily
              ? 'border-indigo-300 bg-indigo-50/60 text-indigo-900'
              : 'border-slate-200 bg-white text-slate-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <Repeat className={`h-4 w-4 ${isDaily ? 'text-indigo-600' : 'text-slate-400'}`} />
            <div>
              <p className="text-xs font-bold">Repeat Daily</p>
              <p className="text-[11px] text-slate-500">Auto-resets each midnight</p>
            </div>
          </div>
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
              isDaily ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'
            }`}
          >
            {isDaily ? 'Daily' : 'Once'}
          </span>
        </div>

        {/* Priority Selector */}
        <div className="rounded-xl border border-slate-200 bg-white p-2.5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
            Priority
          </p>
          <div className="grid grid-cols-3 gap-1">
            {(['low', 'medium', 'high'] as Priority[]).map((p) => {
              const active = priority === p;
              return (
                <button
                  type="button"
                  key={p}
                  onClick={() => setPriority(p)}
                  className={`rounded-lg py-1 text-xs font-bold capitalize transition-all ${
                    active
                      ? p === 'high'
                        ? 'bg-rose-500 text-white shadow-xs'
                        : p === 'medium'
                        ? 'bg-amber-500 text-white shadow-xs'
                        : 'bg-emerald-500 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {p}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Category selector */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
          Category
        </label>
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((cat) => (
            <button
              type="button"
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold border transition-all ${
                category === cat.id
                  ? 'border-indigo-600 bg-indigo-600 text-white shadow-xs'
                  : `${cat.color} hover:brightness-95`
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-2 flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-5 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-600/20 transition-all hover:shadow-lg active:scale-98"
        >
          <Plus className="h-4 w-4" />
          <span>{initialTask ? 'Save Changes' : 'Add Daily Task'}</span>
        </button>
      </div>
    </form>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
        <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <h3 className="text-lg font-bold text-slate-900">
              {initialTask ? 'Edit Task' : 'New Daily Task'}
            </h3>
            {onClose && (
              <button
                onClick={onClose}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
          {formContent}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="h-4 w-4 text-indigo-600" />
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
          Quick Add Task
        </h3>
      </div>
      {formContent}
    </div>
  );
};
