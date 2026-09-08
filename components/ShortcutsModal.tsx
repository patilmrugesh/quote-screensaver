"use client";

import { useEffect } from "react";
import { X, Command } from "lucide-react";

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SHORTCUTS = [
  { key: "Space", action: "Next random quote" },
  { key: "←", action: "Previous quote in history" },
  { key: "→", action: "Next quote" },
  { key: "P", action: "Pause / Resume auto-shuffle" },
  { key: "L", action: "Favorite / Star current quote" },
  { key: "F", action: "Toggle true fullscreen mode" },
  { key: "H", action: "Zen mode (hide all UI controls)" },
  { key: "S", action: "Open customization panel" },
  { key: "T", action: "Open Pomodoro focus timer" },
  { key: "K", action: "Open Tasks, Habits & Routines" },
  { key: "U", action: "Open Account & Cloud Sync" },
  { key: "M", action: "Mute / toggle ambient sound" },
  { key: "?", action: "Open this keyboard guide" },
  { key: "Esc", action: "Close panels / exit zen mode" },
];

export default function ShortcutsModal({ isOpen, onClose }: ShortcutsModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Keyboard Shortcuts"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4"
    >
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-md max-h-[90vh] overflow-y-auto no-scrollbar rounded-2xl border border-white/15 bg-neutral-900/95 p-5 sm:p-6 text-neutral-100 shadow-2xl backdrop-blur-xl">
        <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Command size={18} className="text-amber-400" />
            <h2 className="text-base font-semibold tracking-wide">Keyboard Shortcuts</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close shortcuts"
            className="rounded-full p-1 text-neutral-400 transition hover:bg-white/10 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-2.5">
          {SHORTCUTS.map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between text-sm py-1"
            >
              <span className="text-neutral-300">{item.action}</span>
              <kbd className="min-w-[28px] rounded border border-white/20 bg-neutral-800 px-2 py-0.5 text-center font-mono text-xs font-medium text-amber-300 shadow-xs">
                {item.key}
              </kbd>
            </div>
          ))}
        </div>

        <p className="mt-5 text-center text-xs text-neutral-400">
          Tip: You can also click anywhere on the background to shuffle!
        </p>
      </div>
    </div>
  );
}
