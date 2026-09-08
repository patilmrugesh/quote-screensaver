"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import quotesData from "@/data/quotes.json";
import { Quote } from "@/lib/types";
import { useCustomization } from "@/hooks/useCustomization";
import { useQuoteShuffle } from "@/hooks/useQuoteShuffle";
import { useFavorites } from "@/hooks/useFavorites";
import { ambientSoundEngine } from "@/lib/ambientAudio";

import QuoteDisplay from "@/components/QuoteDisplay";
import ControlBar from "@/components/ControlBar";
import CustomizationPanel from "@/components/CustomizationPanel";
import FavoritesModal from "@/components/FavoritesModal";
import ShortcutsModal from "@/components/ShortcutsModal";
import ClockOverlay from "@/components/ClockOverlay";
import ParticleCanvas from "@/components/ParticleCanvas";
import PomodoroButton from "@/components/PomodoroButton";
import PomodoroModal from "@/components/PomodoroModal";
import PomodoroSettingsModal from "@/components/PomodoroSettingsModal";
import PomodoroReportModal from "@/components/PomodoroReportModal";
import TodoHabitDrawer from "@/components/TodoHabitDrawer";
import AuthModal from "@/components/AuthModal";
import { usePomodoro } from "@/hooks/usePomodoro";
import { useTodoHabits } from "@/hooks/useTodoHabits";
import { useAuth } from "@/hooks/useAuth";

const allQuotes: Quote[] = quotesData as Quote[];

export default function Home() {
  const { settings, updateSetting, applyTheme, resetToDefaults } = useCustomization();
  const { favorites, isFavorite, toggleFavorite, removeFavorite } = useFavorites();
  const pomodoro = usePomodoro();
  const todoHabits = useTodoHabits();
  const auth = useAuth();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isTasksOpen, setIsTasksOpen] = useState(false);
  const [isPomodoroOpen, setIsPomodoroOpen] = useState(false);
  const [isPomodoroSettingsOpen, setIsPomodoroSettingsOpen] = useState(false);
  const [isPomodoroReportOpen, setIsPomodoroReportOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isZenMode, setIsZenMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Custom pinned quote override
  const lockedQuote = useMemo<Quote | null>(() => {
    if (settings.useCustomQuote && settings.customQuoteText.trim()) {
      return {
        id: -999,
        text: settings.customQuoteText.trim(),
        author: settings.customQuoteAuthor.trim() || "You",
        category: "Personal Mantra",
      };
    }
    return null;
  }, [settings.useCustomQuote, settings.customQuoteText, settings.customQuoteAuthor]);

  // Quote shuffle controller
  const {
    currentQuote,
    nextQuote,
    previousQuote,
    selectQuote,
    isPaused,
    togglePause,
    isLocked,
    progress,
    hasPrevious,
    hasNext,
  } = useQuoteShuffle({
    quotes: allQuotes,
    shuffleIntervalSeconds: settings.shuffleIntervalSeconds,
    lockedQuote,
    selectedCategory: settings.selectedCategory,
    onlyFavorites: settings.onlyFavorites,
    isFavorite,
  });

  // Sync ambient soundscape
  useEffect(() => {
    if (settings.ambientSoundType !== "none") {
      ambientSoundEngine.play(settings.ambientSoundType, settings.ambientSoundVolume);
    } else {
      ambientSoundEngine.stop();
    }

    return () => {
      ambientSoundEngine.stop();
    };
  }, [settings.ambientSoundType, settings.ambientSoundVolume]);

  // Handle true browser fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  }, []);

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept typing when inside an input or textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        if (e.key === "Escape") {
          target.blur();
        }
        return;
      }

      switch (e.key) {
        case " ": // Spacebar
        case "ArrowRight":
          e.preventDefault();
          nextQuote();
          break;
        case "ArrowLeft":
          e.preventDefault();
          previousQuote();
          break;
        case "p":
        case "P":
          e.preventDefault();
          togglePause();
          break;
        case "l":
        case "L":
          e.preventDefault();
          if (currentQuote) toggleFavorite(currentQuote);
          break;
        case "f":
        case "F":
          e.preventDefault();
          toggleFullscreen();
          break;
        case "s":
        case "S":
        case "c":
        case "C":
          e.preventDefault();
          setIsSettingsOpen((prev) => !prev);
          break;
        case "h":
        case "H":
          e.preventDefault();
          setIsZenMode((prev) => !prev);
          break;
        case "m":
        case "M":
          e.preventDefault();
          updateSetting(
            "ambientSoundType",
            settings.ambientSoundType === "none" ? "rain" : "none"
          );
          break;
        case "t":
        case "T":
          e.preventDefault();
          setIsPomodoroOpen((prev) => !prev);
          break;
        case "k":
        case "K":
          e.preventDefault();
          setIsTasksOpen((prev) => !prev);
          break;
        case "u":
        case "U":
          e.preventDefault();
          setIsAuthOpen((prev) => !prev);
          break;
        case "?":
          e.preventDefault();
          setIsShortcutsOpen((prev) => !prev);
          break;
        case "Escape":
          setIsSettingsOpen(false);
          setIsFavoritesOpen(false);
          setIsShortcutsOpen(false);
          setIsPomodoroOpen(false);
          setIsPomodoroSettingsOpen(false);
          setIsPomodoroReportOpen(false);
          setIsTasksOpen(false);
          setIsAuthOpen(false);
          setIsZenMode(false);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    nextQuote,
    previousQuote,
    togglePause,
    currentQuote,
    toggleFavorite,
    toggleFullscreen,
    updateSetting,
    settings.ambientSoundType,
  ]);

  const currentIsFav = currentQuote ? isFavorite(currentQuote.id) : false;

  return (
    <main className="relative h-screen w-screen overflow-hidden">
      {/* Particle Canvas Effect */}
      <ParticleCanvas
        enabled={settings.ambientParticles && !isZenMode}
        color={settings.textColor}
      />

      {/* Live Desk Clock Overlay */}
      {!isZenMode && (
        <ClockOverlay
          show={settings.showClock}
          format={settings.clockFormat}
          textColor={settings.textColor}
        />
      )}

      {/* Top Center Pomodoro Focus Capsule Button */}
      {!isZenMode && (
        <PomodoroButton
          formattedTime={pomodoro.formattedTime}
          isRunning={pomodoro.isRunning}
          mode={pomodoro.mode}
          onClick={() => setIsPomodoroOpen(true)}
        />
      )}

      {/* Main Fullscreen Quote View */}
      <QuoteDisplay
        quote={currentQuote}
        settings={settings}
        onManualShuffle={nextQuote}
        onToggleFullscreen={toggleFullscreen}
        isFullscreen={isFullscreen}
        isFavorite={currentIsFav}
        onToggleFavorite={toggleFavorite}
        progressPct={progress}
      />

      {/* Floating Bottom Control Bar */}
      {!isZenMode && (
        <ControlBar
          isPaused={isPaused}
          onTogglePause={togglePause}
          onNext={nextQuote}
          onPrevious={previousQuote}
          hasPrevious={hasPrevious}
          hasNext={hasNext}
          isFavorite={currentIsFav}
          onToggleFavorite={() => currentQuote && toggleFavorite(currentQuote)}
          favoritesCount={favorites.length}
          onOpenFavorites={() => setIsFavoritesOpen(true)}
          tasksPendingCount={todoHabits.tasks.filter((t) => !t.completed).length}
          onOpenTasks={() => setIsTasksOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenShortcuts={() => setIsShortcutsOpen(true)}
          user={auth.user}
          onOpenAuth={() => setIsAuthOpen(true)}
          isLocked={isLocked}
          ambientSoundType={settings.ambientSoundType}
          ambientSoundVolume={settings.ambientSoundVolume}
          onSelectAmbientSound={(t) => updateSetting("ambientSoundType", t)}
          onChangeAmbientVolume={(v) => updateSetting("ambientSoundVolume", v)}
        />
      )}

      {/* Tasks & Habit Tracker Drawer */}
      <TodoHabitDrawer
        isOpen={isTasksOpen}
        onClose={() => setIsTasksOpen(false)}
        todoHabits={todoHabits}
        onStartPomodoroForTask={(taskTitle) => {
          pomodoro.setActiveTask(taskTitle);
          setIsPomodoroOpen(true);
        }}
      />

      {/* Pomodoro Focus Modal */}
      <PomodoroModal
        isOpen={isPomodoroOpen}
        onClose={() => setIsPomodoroOpen(false)}
        mode={pomodoro.mode}
        onSwitchMode={pomodoro.switchMode}
        formattedTime={pomodoro.formattedTime}
        isRunning={pomodoro.isRunning}
        onToggleTimer={pomodoro.toggleTimer}
        onResetTimer={pomodoro.resetTimer}
        onSkipTimer={pomodoro.skipTimer}
        activeTask={pomodoro.activeTask}
        onSetActiveTask={pomodoro.setActiveTask}
        cycleCount={pomodoro.cycleCount}
        onOpenReport={() => setIsPomodoroReportOpen(true)}
        onOpenSettings={() => setIsPomodoroSettingsOpen(true)}
      />

      {/* Pomodoro Settings Modal */}
      <PomodoroSettingsModal
        isOpen={isPomodoroSettingsOpen}
        onClose={() => setIsPomodoroSettingsOpen(false)}
        settings={pomodoro.settings}
        onUpdateSettings={pomodoro.updateSettings}
      />

      {/* Pomodoro Report & Gamification Modal */}
      <PomodoroReportModal
        isOpen={isPomodoroReportOpen}
        onClose={() => setIsPomodoroReportOpen(false)}
        gamification={pomodoro.gamification}
        sessions={pomodoro.sessions}
        todayMinutesFocused={pomodoro.todayMinutesFocused}
        levelInfo={pomodoro.levelInfo}
      />

      {/* Customization Drawer Panel */}
      <CustomizationPanel
        isOpen={isSettingsOpen}
        settings={settings}
        onUpdateSetting={updateSetting}
        onApplyTheme={applyTheme}
        onClose={() => setIsSettingsOpen(false)}
        onResetToDefaults={resetToDefaults}
      />

      {/* Favorites Drawer Modal */}
      <FavoritesModal
        isOpen={isFavoritesOpen}
        onClose={() => setIsFavoritesOpen(false)}
        favorites={favorites}
        onSelectQuote={selectQuote}
        onRemoveFavorite={removeFavorite}
        onlyFavorites={settings.onlyFavorites}
        onToggleOnlyFavorites={(val) => updateSetting("onlyFavorites", val)}
      />

      {/* Shortcuts Modal Guide */}
      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      {/* Account & Cloud Sync Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        user={auth.user}
        isLoading={auth.isLoading}
        isSyncing={auth.isSyncing}
        lastSyncedAt={auth.lastSyncedAt}
        error={auth.error}
        onLogin={auth.login}
        onRegister={auth.register}
        onLogout={auth.logout}
        onSync={auth.syncToCloud}
        getLocalPayload={() => ({
          habits: todoHabits.habits,
          tasks: todoHabits.tasks,
          sessions: pomodoro.sessions,
          gamification: pomodoro.gamification,
          favorites: favorites,
          settings: settings,
        })}
        onApplySyncedData={(data) => {
          const syncData = data as {
            habits?: typeof todoHabits.habits;
            tasks?: typeof todoHabits.tasks;
          };
          if (syncData.habits && typeof window !== "undefined") {
            window.localStorage.setItem("study_todo_habits", JSON.stringify(syncData.habits));
            window.dispatchEvent(new Event("todo-habits-changed"));
          }
          if (syncData.tasks && typeof window !== "undefined") {
            window.localStorage.setItem("study_todo_tasks", JSON.stringify(syncData.tasks));
            window.dispatchEvent(new Event("todo-tasks-changed"));
          }
        }}
        clearError={auth.clearError}
      />
    </main>
  );
}