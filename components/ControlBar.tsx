"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Shuffle,
  Pause,
  Play,
  Settings,
  ChevronLeft,
  ChevronRight,
  Heart,
  Volume2,
  VolumeX,
  HelpCircle,
  Bookmark,
  CheckSquare,
  User,
  Target,
} from "lucide-react";
import { AmbientSoundType } from "@/lib/types";
import type { AuthUser } from "@/hooks/useAuth";

interface ControlBarProps {
  isPaused: boolean;
  onTogglePause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  hasPrevious: boolean;
  hasNext: boolean;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  favoritesCount: number;
  onOpenFavorites: () => void;
  tasksPendingCount?: number;
  onOpenTasks?: () => void;
  onOpenGoals?: () => void;
  goalScorePercentage?: number;
  onOpenSettings: () => void;
  onOpenShortcuts: () => void;
  user?: AuthUser | null;
  onOpenAuth?: () => void;
  isLocked?: boolean;
  ambientSoundType: AmbientSoundType;
  ambientSoundVolume: number;
  onSelectAmbientSound: (type: AmbientSoundType) => void;
  onChangeAmbientVolume: (vol: number) => void;
}

const IDLE_HIDE_DELAY_MS = 3500;

const AMBIENT_SOUND_OPTIONS: { id: AmbientSoundType; label: string }[] = [
  { id: "none", label: "Mute" },
  { id: "rain", label: "Rain" },
  { id: "brown-noise", label: "Deep Focus (Brown Noise)" },
  { id: "binaural", label: "Alpha Wave Drone" },
  { id: "campfire", label: "Campfire Embers" },
];

export default function ControlBar({
  isPaused,
  onTogglePause,
  onNext,
  onPrevious,
  hasPrevious,
  hasNext,
  isFavorite,
  onToggleFavorite,
  favoritesCount,
  onOpenFavorites,
  tasksPendingCount,
  onOpenTasks,
  onOpenGoals,
  goalScorePercentage,
  onOpenSettings,
  onOpenShortcuts,
  user,
  onOpenAuth,
  isLocked = false,
  ambientSoundType,
  ambientSoundVolume,
  onSelectAmbientSound,
  onChangeAmbientVolume,
}: ControlBarProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isBarHovered, setIsBarHovered] = useState(false);
  const [isSoundMenuOpen, setIsSoundMenuOpen] = useState(false);
  const idleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetIdleTimer = useCallback(() => {
    setIsVisible(true);
    if (idleTimeoutRef.current) {
      clearTimeout(idleTimeoutRef.current);
    }
    idleTimeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, IDLE_HIDE_DELAY_MS);
  }, []);

  useEffect(() => {
    // Initial hide timeout after delay
    idleTimeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, IDLE_HIDE_DELAY_MS);

    const handleInteraction = () => resetIdleTimer();

    window.addEventListener("mousemove", handleInteraction);
    window.addEventListener("touchstart", handleInteraction);
    window.addEventListener("keydown", handleInteraction);

    return () => {
      window.removeEventListener("mousemove", handleInteraction);
      window.removeEventListener("touchstart", handleInteraction);
      window.removeEventListener("keydown", handleInteraction);
      if (idleTimeoutRef.current) {
        clearTimeout(idleTimeoutRef.current);
      }
    };
  }, [resetIdleTimer]);

  const withStopPropagation =
    (handler: () => void) => (e: React.MouseEvent) => {
      e.stopPropagation();
      handler();
    };

  const isBarShown = isVisible || isBarHovered || isSoundMenuOpen;

  return (
    <div
      onMouseEnter={() => setIsBarHovered(true)}
      onMouseLeave={() => {
        setIsBarHovered(false);
        resetIdleTimer();
      }}
      className={`fixed bottom-4 sm:bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-1 sm:gap-1.5 max-w-[96vw] overflow-x-auto no-scrollbar sm:overflow-visible rounded-full border border-white/15 bg-neutral-950/85 px-2 sm:px-3.5 py-1.5 sm:py-2.5 shadow-2xl backdrop-blur-xl transition-all duration-500 shrink-0 ${
        isBarShown ? "opacity-100 translate-y-0" : "pointer-events-none opacity-0 translate-y-4"
      }`}
    >
      {/* Previous Quote */}
      <button
        type="button"
        title="Previous quote (←)"
        aria-label="Previous quote"
        onClick={withStopPropagation(onPrevious)}
        disabled={!hasPrevious || isLocked}
        className="rounded-full p-2 text-white/80 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-25"
      >
        <ChevronLeft size={19} />
      </button>

      {/* Next / Shuffle Quote */}
      <button
        type="button"
        title="Next quote (Space / →)"
        aria-label="Next quote"
        onClick={withStopPropagation(onNext)}
        disabled={!hasNext || isLocked}
        className="rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20 hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-25"
      >
        <Shuffle size={18} />
      </button>

      {/* Next History Step */}
      <button
        type="button"
        title="Next quote (→)"
        aria-label="Next quote forward"
        onClick={withStopPropagation(onNext)}
        disabled={!hasNext || isLocked}
        className="rounded-full p-2 text-white/80 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-25"
      >
        <ChevronRight size={19} />
      </button>

      {/* Play / Pause Auto-shuffle */}
      <button
        type="button"
        title={isPaused ? "Resume auto-shuffle (P)" : "Pause auto-shuffle (P)"}
        aria-label={isPaused ? "Resume auto-shuffle" : "Pause auto-shuffle"}
        onClick={withStopPropagation(onTogglePause)}
        disabled={isLocked}
        className="rounded-full p-2 text-white/80 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-25"
      >
        {isPaused ? <Play size={18} /> : <Pause size={18} />}
      </button>

      <div className="mx-1 h-5 w-[1px] bg-white/15" />

      {/* Favorite / Star */}
      <button
        type="button"
        title={isFavorite ? "Favorited (L)" : "Add to favorites (L)"}
        aria-label={isFavorite ? "Unfavorite quote" : "Favorite quote"}
        onClick={withStopPropagation(onToggleFavorite)}
        className="rounded-full p-2 text-white/80 transition hover:bg-white/10 hover:text-white"
      >
        <Heart
          size={18}
          className={isFavorite ? "fill-rose-500 text-rose-500" : ""}
        />
      </button>

      {/* Favorites Drawer Toggle */}
      <button
        type="button"
        title={`Saved Favorites (${favoritesCount})`}
        aria-label="Open saved favorites collection"
        onClick={withStopPropagation(onOpenFavorites)}
        className="relative rounded-full p-2 text-white/80 transition hover:bg-white/10 hover:text-white"
      >
        <Bookmark size={18} />
        {favoritesCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
            {favoritesCount}
          </span>
        )}
      </button>

      {/* Tasks & Habits Drawer Toggle */}
      {onOpenTasks && (
        <button
          type="button"
          title="Tasks, Habits & Routines (K)"
          aria-label="Open tasks and habits tracker"
          onClick={withStopPropagation(onOpenTasks)}
          className="relative rounded-full p-2 text-white/80 transition hover:bg-white/10 hover:text-white"
        >
          <CheckSquare size={18} />
          {tasksPendingCount !== undefined && tasksPendingCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold text-neutral-950">
              {tasksPendingCount}
            </span>
          )}
        </button>
      )}

      {/* Goals & Execution System Toggle */}
      {onOpenGoals && (
        <button
          type="button"
          title={`Goals & Execution System (G)${goalScorePercentage !== undefined && goalScorePercentage > 0 ? ` • ${goalScorePercentage}% today` : ""}`}
          aria-label="Open goal and execution management"
          onClick={withStopPropagation(onOpenGoals)}
          className="relative rounded-full p-2 text-white/80 transition hover:bg-white/10 hover:text-white"
        >
          <Target size={18} />
          {goalScorePercentage !== undefined && goalScorePercentage > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-emerald-500 px-1 text-[9px] font-bold text-neutral-950">
              {goalScorePercentage}%
            </span>
          )}
        </button>
      )}

      {/* Ambient Sound Menu Popover */}
      <div className="relative">
        <button
          type="button"
          title="Ambient focus soundscape (M)"
          aria-label="Ambient sound settings"
          onClick={withStopPropagation(() => setIsSoundMenuOpen((prev) => !prev))}
          className={`rounded-full p-2 transition ${
            ambientSoundType !== "none"
              ? "bg-amber-400/20 text-amber-300 hover:bg-amber-400/30"
              : "text-white/80 hover:bg-white/10 hover:text-white"
          }`}
        >
          {ambientSoundType !== "none" ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>

        {isSoundMenuOpen && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute bottom-12 left-1/2 -translate-x-1/2 w-64 rounded-2xl border border-white/15 bg-neutral-900/95 p-4 text-xs text-neutral-100 shadow-2xl backdrop-blur-2xl"
          >
            <div className="mb-2 flex items-center justify-between font-semibold text-neutral-200">
              <span>Ambient Sound</span>
              <span className="text-[11px] font-normal text-amber-300 capitalize">
                {ambientSoundType}
              </span>
            </div>

            <div className="space-y-1 mb-3">
              {AMBIENT_SOUND_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onSelectAmbientSound(opt.id)}
                  className={`flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left text-xs transition ${
                    ambientSoundType === opt.id
                      ? "bg-white/15 font-medium text-white"
                      : "text-neutral-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <span>{opt.label}</span>
                  {ambientSoundType === opt.id && (
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                  )}
                </button>
              ))}
            </div>

            {ambientSoundType !== "none" && (
              <div>
                <div className="mb-1 flex items-center justify-between text-[11px] text-neutral-400">
                  <span>Volume</span>
                  <span>{Math.round(ambientSoundVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={ambientSoundVolume}
                  onChange={(e) => onChangeAmbientVolume(parseFloat(e.target.value))}
                  className="w-full accent-amber-400"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Keyboard Shortcuts Help */}
      <button
        type="button"
        title="Keyboard shortcuts (?)"
        aria-label="View keyboard shortcuts"
        onClick={withStopPropagation(onOpenShortcuts)}
        className="rounded-full p-2 text-white/80 transition hover:bg-white/10 hover:text-white"
      >
        <HelpCircle size={18} />
      </button>

      {/* Settings Panel */}
      <button
        type="button"
        title="Customize screensaver (S)"
        aria-label="Open customization settings"
        onClick={withStopPropagation(onOpenSettings)}
        className="rounded-full p-2 text-white/80 transition hover:bg-white/10 hover:text-white"
      >
        <Settings size={18} />
      </button>

      {/* Account / Cloud Sync */}
      {onOpenAuth && (
        <button
          type="button"
          title={user ? `Account: @${user.username} (U)` : "Account & Cloud Sync (U)"}
          aria-label="Open account and cloud sync"
          onClick={withStopPropagation(onOpenAuth)}
          className="relative rounded-full p-2 text-white/80 transition hover:bg-white/10 hover:text-white"
        >
          <User size={18} />
          <span
            className={`absolute bottom-1.5 right-1.5 h-2 w-2 rounded-full border border-neutral-900 ${
              user ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
            }`}
          />
        </button>
      )}
    </div>
  );
}