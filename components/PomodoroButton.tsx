"use client";

import { Timer } from "lucide-react";
import { PomodoroMode } from "@/lib/pomodoroTypes";

interface PomodoroButtonProps {
  formattedTime: string;
  isRunning: boolean;
  mode: PomodoroMode;
  onClick: () => void;
}

export default function PomodoroButton({
  formattedTime,
  isRunning,
  mode,
  onClick,
}: PomodoroButtonProps) {
  const isBreak = mode === "shortBreak" || mode === "longBreak";

  return (
    <div className="fixed top-4 sm:top-6 left-1/2 z-40 -translate-x-1/2 select-none max-w-[92vw]">
      <button
        type="button"
        onClick={onClick}
        aria-label="Open Pomodoro Focus timer"
        className={`group flex items-center gap-2 sm:gap-2.5 rounded-full border px-3 sm:px-4 py-1.5 sm:py-2 text-xs font-semibold tracking-wide shadow-2xl backdrop-blur-xl transition-all duration-300 hover:scale-105 active:scale-95 ${
          isRunning
            ? isBreak
              ? "border-emerald-500/40 bg-emerald-950/70 text-emerald-300 ring-2 ring-emerald-500/30"
              : "border-rose-500/40 bg-rose-950/70 text-rose-200 ring-2 ring-rose-500/30"
            : "border-white/15 bg-neutral-950/75 text-neutral-200 hover:border-white/30 hover:bg-neutral-900/90 hover:text-white"
        }`}
      >
        <span className="text-sm transition-transform duration-300 group-hover:rotate-12">
          {isBreak ? "☕" : "🍅"}
        </span>

        <span className="font-mono text-sm tracking-wider">
          {isRunning ? formattedTime : "Pomodoro Focus"}
        </span>

        {isRunning && (
          <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-widest text-neutral-300">
            <span
              className={`h-1.5 w-1.5 rounded-full animate-pulse ${
                isBreak ? "bg-emerald-400" : "bg-rose-400"
              }`}
            />
            {mode === "pomodoro" ? "Focus" : "Break"}
          </span>
        )}

        {!isRunning && (
          <Timer size={14} className="opacity-60 group-hover:opacity-100" />
        )}
      </button>
    </div>
  );
}
