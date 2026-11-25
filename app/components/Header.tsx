'use client';

import React, { useState, useEffect } from 'react';
import { Bell, BellOff, Volume2, VolumeX, Sparkles, SlidersHorizontal, Play } from 'lucide-react';
import { AppSettings } from '../types';
import { soundEngine } from '../lib/audio';

interface HeaderProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onRequestPermission: () => Promise<void>;
  permissionStatus: NotificationPermission | 'unsupported';
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  onUpdateSettings,
  onRequestPermission,
  permissionStatus,
  onOpenSettings,
}) => {
  const [time, setTime] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [testSoundPlaying, setTestSoundPlaying] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
      setDate(
        now.toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleTestSound = () => {
    setTestSoundPlaying(true);
    soundEngine.playReminderChime(settings.soundVolume);
    setTimeout(() => setTestSoundPlaying(false), 800);
  };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white shadow-md shadow-indigo-500/20">
            <Bell className="h-5 w-5 animate-pulse-subtle" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-900">DayPulse</h1>
              <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-700 border border-indigo-100">
                Daily Tasks & Reminders
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              {date || 'Loading date...'}
            </p>
          </div>
        </div>

        {/* Live Clock & Action Badges */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Real-time Clock */}
          <div className="hidden md:flex items-center gap-1.5 rounded-lg bg-slate-100/80 px-3 py-1.5 text-xs font-mono font-medium text-slate-700 border border-slate-200/60 shadow-xs">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>{time}</span>
          </div>

          {/* Test Sound Button */}
          <button
            onClick={handleTestSound}
            title="Click to test reminder sound"
            className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all ${
              testSoundPlaying
                ? 'bg-indigo-600 text-white scale-105 shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
            }`}
          >
            <Play className={`h-3.5 w-3.5 ${testSoundPlaying ? 'fill-current' : ''}`} />
            <span className="hidden sm:inline">Test Sound</span>
          </button>

          {/* Browser Notification Pill */}
          {permissionStatus === 'granted' ? (
            <div
              title="Browser notifications are enabled"
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 border border-emerald-200/70 px-2.5 py-1.5 text-xs font-medium text-emerald-700"
            >
              <Bell className="h-3.5 w-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Alerts Active</span>
            </div>
          ) : (
            <button
              onClick={onRequestPermission}
              title="Click to enable desktop/browser notifications"
              className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 px-2.5 py-1.5 text-xs font-medium text-white shadow-xs transition-colors"
            >
              <Bell className="h-3.5 w-3.5 animate-bounce" />
              <span>Enable Alerts</span>
            </button>
          )}

          {/* Sound Toggle */}
          <button
            onClick={() => onUpdateSettings({ soundEnabled: !settings.soundEnabled })}
            title={settings.soundEnabled ? 'Mute sounds' : 'Unmute sounds'}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          >
            {settings.soundEnabled ? (
              <Volume2 className="h-4 w-4 text-indigo-600" />
            ) : (
              <VolumeX className="h-4 w-4 text-slate-400" />
            )}
          </button>

          {/* Settings Trigger */}
          <button
            onClick={onOpenSettings}
            title="Settings"
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          >
            <SlidersHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
