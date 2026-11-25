'use client';

import React, { useRef } from 'react';
import {
  X,
  Volume2,
  Bell,
  Sun,
  Download,
  Upload,
  RotateCcw,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { AppSettings, Task } from '../types';
import { soundEngine } from '../lib/audio';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onRequestPermission: () => Promise<void>;
  permissionStatus: NotificationPermission | 'unsupported';
  tasks: Task[];
  onImportTasks: (tasks: Task[]) => void;
  onResetTasks: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onRequestPermission,
  permissionStatus,
  tasks,
  onImportTasks,
  onResetTasks,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Export tasks as JSON
  const handleExport = () => {
    const data = {
      version: 1,
      exportDate: new Date().toISOString(),
      tasks,
      settings,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `daypulse-tasks-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import tasks from JSON
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed.tasks)) {
          onImportTasks(parsed.tasks);
          alert('Tasks restored successfully!');
        } else if (Array.isArray(parsed)) {
          onImportTasks(parsed);
          alert('Tasks restored successfully!');
        } else {
          alert('Invalid backup file format.');
        }
      } catch {
        alert('Failed to parse backup JSON file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleSoundTest = () => {
    soundEngine.playReminderChime(settings.soundVolume);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-5">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-slate-900">App Settings</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-col gap-5">
          {/* Section: Browser Notifications */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <Bell className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Browser System Notifications
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Receive alert popups on your desktop/mobile even when the browser tab is minimized.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-200/60">
              <span className="text-xs font-semibold text-slate-600">
                Status:{' '}
                <span
                  className={
                    permissionStatus === 'granted'
                      ? 'text-emerald-600 font-bold'
                      : permissionStatus === 'denied'
                      ? 'text-rose-600 font-bold'
                      : 'text-amber-600 font-bold'
                  }
                >
                  {permissionStatus.toUpperCase()}
                </span>
              </span>

              {permissionStatus !== 'granted' ? (
                <button
                  type="button"
                  onClick={onRequestPermission}
                  className="rounded-lg bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 text-xs font-semibold text-white shadow-xs transition-colors"
                >
                  Enable Alerts
                </button>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                  <Check className="h-4 w-4" /> Enabled
                </span>
              )}
            </div>
          </div>

          {/* Section: Sound Alerts */}
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Volume2 className="h-5 w-5 text-indigo-600" />
                <h4 className="text-sm font-bold text-slate-900">
                  Audio Chimes & Sound Effects
                </h4>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.soundEnabled}
                  onChange={(e) =>
                    onUpdateSettings({ soundEnabled: e.target.checked })
                  }
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            {settings.soundEnabled && (
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span>Volume: {Math.round(settings.soundVolume * 100)}%</span>
                  <button
                    type="button"
                    onClick={handleSoundTest}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                  >
                    Play Chime Sample
                  </button>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={settings.soundVolume}
                  onChange={(e) =>
                    onUpdateSettings({ soundVolume: parseFloat(e.target.value) })
                  }
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>
            )}
          </div>

          {/* Section: Daily Morning Digest */}
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sun className="h-5 w-5 text-amber-500" />
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Daily Morning Briefing
                  </h4>
                  <p className="text-xs text-slate-500">
                    Get an alert with your tasks overview to kickstart each day.
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.dailyDigestEnabled}
                  onChange={(e) =>
                    onUpdateSettings({ dailyDigestEnabled: e.target.checked })
                  }
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            {settings.dailyDigestEnabled && (
              <div className="mt-3 flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-700">
                  Briefing Time:
                </span>
                <input
                  type="time"
                  value={settings.dailyDigestTime}
                  onChange={(e) =>
                    onUpdateSettings({ dailyDigestTime: e.target.value })
                  }
                  className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-800 focus:border-indigo-500 focus:outline-none"
                />
              </div>
            )}
          </div>

          {/* Section: Data Backup & Restore */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
            <h4 className="text-sm font-bold text-slate-900 mb-1">
              Data Backup & Storage
            </h4>
            <p className="text-xs text-slate-500 mb-3">
              All your tasks are safely stored locally in your browser. You can export a backup or restore from JSON anytime.
            </p>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleExport}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors shadow-2xs"
              >
                <Download className="h-3.5 w-3.5" />
                Export Backup (JSON)
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors shadow-2xs"
              >
                <Upload className="h-3.5 w-3.5" />
                Restore Backup
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".json"
                className="hidden"
              />

              <button
                type="button"
                onClick={() => {
                  if (confirm('Reset to default sample tasks? Your current tasks will be replaced.')) {
                    onResetTasks();
                  }
                }}
                className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset Defaults
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-slate-900 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
