"use client";

import { useState } from "react";
import {
  X,
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  BarChart2,
  Settings,
  Plus,
  Check,
  CheckCircle,
} from "lucide-react";
import { PomodoroMode } from "@/lib/pomodoroTypes";

interface PomodoroModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: PomodoroMode;
  onSwitchMode: (mode: PomodoroMode) => void;
  formattedTime: string;
  isRunning: boolean;
  onToggleTimer: () => void;
  onResetTimer: () => void;
  onSkipTimer: () => void;
  activeTask: string;
  onSetActiveTask: (task: string) => void;
  cycleCount: number;
  onOpenReport: () => void;
  onOpenSettings: () => void;
}

export default function PomodoroModal({
  isOpen,
  onClose,
  mode,
  onSwitchMode,
  formattedTime,
  isRunning,
  onToggleTimer,
  onResetTimer,
  onSkipTimer,
  activeTask,
  onSetActiveTask,
  cycleCount,
  onOpenReport,
  onOpenSettings,
}: PomodoroModalProps) {
  const [isEditingTask, setIsEditingTask] = useState(false);
  const [taskInput, setTaskInput] = useState(activeTask);

  if (!isOpen) return null;

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    onSetActiveTask(taskInput.trim());
    setIsEditingTask(false);
  };

  const isBreak = mode === "shortBreak" || mode === "longBreak";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Pomodoro Focus"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 select-none"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Main Container */}
      <div
        className={`relative z-10 flex w-full max-w-lg max-h-[92vh] overflow-y-auto no-scrollbar flex-col rounded-3xl border p-5 sm:p-8 text-neutral-100 shadow-2xl backdrop-blur-2xl transition-all ${
          isBreak
            ? "border-emerald-500/30 bg-gradient-to-b from-emerald-950/80 to-neutral-950/95"
            : "border-rose-500/30 bg-gradient-to-b from-rose-950/70 to-neutral-950/95"
        }`}
      >
        {/* Top Header Bar */}
        <div className="mb-4 sm:mb-6 flex items-center justify-between border-b border-white/10 pb-3 sm:pb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">{isBreak ? "☕" : "🍅"}</span>
            <h2 className="text-xs sm:text-sm font-extrabold tracking-wider uppercase text-neutral-100">
              Pomodoro Focus
            </h2>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={onOpenReport}
              className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 sm:px-2.5 py-1 sm:py-1.5 text-xs font-semibold text-neutral-200 transition hover:bg-white/15 hover:text-white"
            >
              <BarChart2 size={13} className="text-amber-400" />
              <span>Report</span>
            </button>

            <button
              type="button"
              onClick={onOpenSettings}
              className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 sm:px-2.5 py-1 sm:py-1.5 text-xs font-semibold text-neutral-200 transition hover:bg-white/15 hover:text-white"
            >
              <Settings size={13} className="text-neutral-300" />
              <span>Setting</span>
            </button>

            <button
              type="button"
              aria-label="Minimize timer"
              onClick={onClose}
              className="rounded-full p-1 sm:p-1.5 text-neutral-400 transition hover:bg-white/10 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="mx-auto mb-6 sm:mb-8 flex items-center gap-1 sm:gap-1.5 rounded-full border border-white/10 bg-neutral-900/60 p-1">
          <button
            type="button"
            onClick={() => onSwitchMode("pomodoro")}
            className={`rounded-full px-3 sm:px-4 py-1 sm:py-1.5 text-xs font-bold transition-all ${
              mode === "pomodoro"
                ? "bg-rose-500 text-white shadow-md"
                : "text-neutral-400 hover:text-neutral-200"
            }`}
          >
            Pomodoro
          </button>

          <button
            type="button"
            onClick={() => onSwitchMode("shortBreak")}
            className={`rounded-full px-3 sm:px-4 py-1 sm:py-1.5 text-xs font-bold transition-all ${
              mode === "shortBreak"
                ? "bg-emerald-600 text-white shadow-md"
                : "text-neutral-400 hover:text-neutral-200"
            }`}
          >
            Short Break
          </button>

          <button
            type="button"
            onClick={() => onSwitchMode("longBreak")}
            className={`rounded-full px-3 sm:px-4 py-1 sm:py-1.5 text-xs font-bold transition-all ${
              mode === "longBreak"
                ? "bg-emerald-600 text-white shadow-md"
                : "text-neutral-400 hover:text-neutral-200"
            }`}
          >
            Long Break
          </button>
        </div>

        {/* Large Digital Clock Countdown */}
        <div className="my-2 text-center">
          <div className="font-mono text-6xl sm:text-7xl md:text-8xl font-black tracking-tight text-white drop-shadow-md tabular-nums">
            {formattedTime}
          </div>

          <div className="mt-2 text-xs font-semibold uppercase tracking-widest text-neutral-400">
            {mode === "pomodoro"
              ? `#${cycleCount + 1} • Time to focus!`
              : "Time to rest & recharge!"}
          </div>
        </div>

        {/* Big Start / Pause / Reset Controls */}
        <div className="mt-8 mb-6 flex items-center justify-center gap-4">
          <button
            type="button"
            title="Reset timer"
            onClick={onResetTimer}
            className="rounded-full border border-white/10 bg-white/5 p-3 text-neutral-300 transition hover:bg-white/15 hover:text-white"
          >
            <RotateCcw size={18} />
          </button>

          <button
            type="button"
            onClick={onToggleTimer}
            className={`min-w-[160px] rounded-2xl py-3.5 px-8 font-mono text-xl font-extrabold uppercase tracking-widest text-neutral-950 shadow-xl transition-all duration-200 hover:scale-105 active:scale-95 ${
              isBreak
                ? "bg-emerald-400 hover:bg-emerald-300"
                : "bg-white hover:bg-neutral-100"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              {isRunning ? (
                <>
                  <Pause size={20} className="fill-neutral-950" />
                  <span>PAUSE</span>
                </>
              ) : (
                <>
                  <Play size={20} className="fill-neutral-950" />
                  <span>START</span>
                </>
              )}
            </div>
          </button>

          <button
            type="button"
            title="Skip to next session"
            onClick={onSkipTimer}
            className="rounded-full border border-white/10 bg-white/5 p-3 text-neutral-300 transition hover:bg-white/15 hover:text-white"
          >
            <SkipForward size={18} />
          </button>
        </div>

        {/* Active Focus Task Input Section */}
        <div className="mt-4 rounded-2xl border border-white/10 bg-black/30 p-4">
          <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-neutral-400">
            <span>Current Focus Task</span>
            {activeTask && !isEditingTask && (
              <button
                type="button"
                onClick={() => setIsEditingTask(true)}
                className="text-[11px] text-amber-400 hover:underline lowercase"
              >
                edit
              </button>
            )}
          </div>

          {isEditingTask ? (
            <form onSubmit={handleSaveTask} className="flex gap-2">
              <input
                type="text"
                value={taskInput}
                onChange={(e) => setTaskInput(e.target.value)}
                placeholder="What are you working on right now?"
                autoFocus
                className="flex-1 rounded-xl border border-white/15 bg-neutral-900/90 px-3 py-2 text-xs text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-amber-400"
              />
              <button
                type="submit"
                className="flex items-center gap-1 rounded-xl bg-amber-400 px-3 py-2 text-xs font-bold text-neutral-950 transition hover:bg-amber-300"
              >
                <Check size={14} />
                <span>Save</span>
              </button>
            </form>
          ) : activeTask ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-emerald-400" />
                <span className="text-xs font-medium text-neutral-200">
                  {activeTask}
                </span>
              </div>
              <button
                type="button"
                onClick={() => onSetActiveTask("")}
                className="rounded-md p-1 text-neutral-400 transition hover:bg-white/10 hover:text-rose-400"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                setTaskInput("");
                setIsEditingTask(true);
              }}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-white/20 py-2.5 text-xs font-medium text-neutral-400 transition hover:border-white/40 hover:text-neutral-200"
            >
              <Plus size={14} />
              <span>+ Add What You Are Working On</span>
            </button>
          )}
        </div>

        <p className="mt-4 text-center text-[11px] text-neutral-400">
          Tip: You can minimize this timer to enjoy the quote screensaver — the top-center badge keeps ticking live!
        </p>
      </div>
    </div>
  );
}
