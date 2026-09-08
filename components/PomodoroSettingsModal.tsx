"use client";

import { useState } from "react";
import { X, Volume2, Clock, Bell, Sparkles } from "lucide-react";
import { PomodoroSettings } from "@/lib/pomodoroTypes";
import { pomodoroAlarm } from "@/lib/pomodoroAudio";

interface PomodoroSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: PomodoroSettings;
  onUpdateSettings: (newValues: Partial<PomodoroSettings>) => void;
}

export default function PomodoroSettingsModal({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}: PomodoroSettingsModalProps) {
  const [isPlayingTest, setIsPlayingTest] = useState(false);

  if (!isOpen) return null;

  const handleTestAlarm = () => {
    setIsPlayingTest(true);
    pomodoroAlarm.playAlarm(settings.alarmVolume);
    setTimeout(() => setIsPlayingTest(false), 3100);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Pomodoro Settings"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/15 bg-neutral-900/95 p-6 text-neutral-100 shadow-2xl backdrop-blur-2xl">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-amber-400" />
            <h2 className="text-base font-bold uppercase tracking-wider text-neutral-100">
              Timer Settings
            </h2>
          </div>
          <button
            type="button"
            aria-label="Close settings"
            onClick={onClose}
            className="rounded-full p-1 text-neutral-400 transition hover:bg-white/10 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-5 max-h-[75vh] overflow-y-auto pr-1">
          {/* Time in Minutes */}
          <div>
            <label className="mb-2.5 block text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Time (minutes)
            </label>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <span className="mb-1 block text-[11px] text-neutral-300">Focus</span>
                <input
                  type="number"
                  min={1}
                  max={120}
                  value={settings.pomodoroMinutes}
                  onChange={(e) =>
                    onUpdateSettings({
                      pomodoroMinutes: Math.max(1, parseInt(e.target.value) || 25),
                    })
                  }
                  className="w-full rounded-lg border border-white/10 bg-neutral-800 p-2 text-center font-mono text-sm font-semibold text-neutral-100 focus:outline-none focus:ring-1 focus:ring-amber-400"
                />
              </div>

              <div>
                <span className="mb-1 block text-[11px] text-neutral-300">Short Break</span>
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={settings.shortBreakMinutes}
                  onChange={(e) =>
                    onUpdateSettings({
                      shortBreakMinutes: Math.max(1, parseInt(e.target.value) || 5),
                    })
                  }
                  className="w-full rounded-lg border border-white/10 bg-neutral-800 p-2 text-center font-mono text-sm font-semibold text-neutral-100 focus:outline-none focus:ring-1 focus:ring-amber-400"
                />
              </div>

              <div>
                <span className="mb-1 block text-[11px] text-neutral-300">Long Break</span>
                <input
                  type="number"
                  min={1}
                  max={90}
                  value={settings.longBreakMinutes}
                  onChange={(e) =>
                    onUpdateSettings({
                      longBreakMinutes: Math.max(1, parseInt(e.target.value) || 15),
                    })
                  }
                  className="w-full rounded-lg border border-white/10 bg-neutral-800 p-2 text-center font-mono text-sm font-semibold text-neutral-100 focus:outline-none focus:ring-1 focus:ring-amber-400"
                />
              </div>
            </div>
          </div>

          {/* Long Break Interval */}
          <div className="flex items-center justify-between rounded-xl border border-white/10 bg-neutral-800/40 p-3.5">
            <div>
              <span className="block text-xs font-medium text-neutral-200">
                Long Break Interval
              </span>
              <span className="text-[11px] text-neutral-400">
                Take a long break after how many focus blocks
              </span>
            </div>
            <input
              type="number"
              min={1}
              max={12}
              value={settings.longBreakInterval}
              onChange={(e) =>
                onUpdateSettings({
                  longBreakInterval: Math.max(1, parseInt(e.target.value) || 4),
                })
              }
              className="w-16 rounded-lg border border-white/10 bg-neutral-800 p-1.5 text-center font-mono text-xs font-semibold text-neutral-100 focus:outline-none focus:ring-1 focus:ring-amber-400"
            />
          </div>

          {/* Auto Start Toggles */}
          <div className="space-y-3 rounded-xl border border-white/10 bg-neutral-800/40 p-3.5">
            <div className="flex items-center justify-between">
              <div>
                <span className="block text-xs font-medium text-neutral-200">
                  Auto-Start Breaks
                </span>
                <span className="text-[11px] text-neutral-400">
                  Start break timer immediately when focus ends
                </span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={settings.autoStartBreaks}
                onClick={() =>
                  onUpdateSettings({ autoStartBreaks: !settings.autoStartBreaks })
                }
                className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
                  settings.autoStartBreaks ? "bg-amber-400" : "bg-white/20"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-4 w-4 rounded-full bg-neutral-900 transition-transform ${
                    settings.autoStartBreaks ? "translate-x-4.5" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between border-t border-white/5 pt-3">
              <div>
                <span className="block text-xs font-medium text-neutral-200">
                  Auto-Start Pomodoros
                </span>
                <span className="text-[11px] text-neutral-400">
                  Start next focus session automatically after break
                </span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={settings.autoStartPomodoros}
                onClick={() =>
                  onUpdateSettings({
                    autoStartPomodoros: !settings.autoStartPomodoros,
                  })
                }
                className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
                  settings.autoStartPomodoros ? "bg-amber-400" : "bg-white/20"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-4 w-4 rounded-full bg-neutral-900 transition-transform ${
                    settings.autoStartPomodoros ? "translate-x-4.5" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Alarm Ring & Sound Section */}
          <div className="rounded-xl border border-white/10 bg-neutral-800/40 p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-300">
                <Bell size={14} className="text-amber-400" />
                <span>Completion Alarm (3s)</span>
              </div>
              <button
                type="button"
                onClick={handleTestAlarm}
                disabled={isPlayingTest}
                className="flex items-center gap-1 rounded-md bg-amber-400/20 px-2.5 py-1 text-[11px] font-semibold text-amber-300 transition hover:bg-amber-400/30 disabled:opacity-50"
              >
                <Sparkles size={12} />
                <span>{isPlayingTest ? "Ringing..." : "Test Chime"}</span>
              </button>
            </div>

            <div>
              <div className="mb-1 flex items-center justify-between text-[11px] text-neutral-400">
                <span className="flex items-center gap-1">
                  <Volume2 size={12} />
                  <span>Alarm Volume</span>
                </span>
                <span>{Math.round(settings.alarmVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.alarmVolume}
                onChange={(e) =>
                  onUpdateSettings({ alarmVolume: parseFloat(e.target.value) })
                }
                className="w-full accent-amber-400"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 border-t border-white/10 pt-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl bg-amber-400 py-2 text-xs font-bold text-neutral-950 transition hover:bg-amber-300 active:scale-98"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
