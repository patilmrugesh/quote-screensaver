"use client";

import { useState, useEffect, useRef, useCallback, useMemo, useSyncExternalStore } from "react";
import {
  PomodoroMode,
  PomodoroSettings,
  PomodoroSession,
  GamificationProfile,
  AchievementBadge,
} from "@/lib/pomodoroTypes";
import { pomodoroAlarm } from "@/lib/pomodoroAudio";

const SETTINGS_KEY = "quote-screensaver-pomodoro-settings";
const SESSIONS_KEY = "quote-screensaver-pomodoro-sessions";
const GAMIFICATION_KEY = "quote-screensaver-pomodoro-gamification";

const DEFAULT_SETTINGS: PomodoroSettings = {
  pomodoroMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  longBreakInterval: 4,
  autoStartBreaks: false,
  autoStartPomodoros: false,
  alarmVolume: 0.8,
};

const DEFAULT_GAMIFICATION: GamificationProfile = {
  totalMinutesFocused: 0,
  totalPomodorosCompleted: 0,
  totalXP: 0,
  currentLevel: 1,
  levelTitle: "Mindful Novice",
  streakDays: 0,
  lastActiveDate: "",
  badges: {},
};

export const ALL_BADGES: AchievementBadge[] = [
  {
    id: "first-pomodoro",
    title: "First Step",
    description: "Completed your first 25-minute focus session.",
    icon: "🌱",
  },
  {
    id: "streak-3",
    title: "On Fire",
    description: "Maintained a 3-day consecutive focus streak.",
    icon: "🔥",
  },
  {
    id: "century-club",
    title: "Century Club",
    description: "Accumulated 100+ minutes of deep focus.",
    icon: "💯",
  },
  {
    id: "marathoner",
    title: "Flow Marathoner",
    description: "Completed 4 consecutive Pomodoro cycles.",
    icon: "⚡",
  },
  {
    id: "focus-master",
    title: "Deep Work Artisan",
    description: "Completed 10 total Pomodoro focus blocks.",
    icon: "🏆",
  },
  {
    id: "zen-grandmaster",
    title: "Zen Grandmaster",
    description: "Reached 3,500+ XP in deep work.",
    icon: "🧘",
  },
];

function getLevelInfo(totalXP: number) {
  if (totalXP < 500) {
    return {
      level: 1,
      title: "Mindful Novice",
      nextLevelXP: 500,
      currentLevelBaseXP: 0,
    };
  }
  if (totalXP < 1500) {
    return {
      level: 2,
      title: "Focus Seeker",
      nextLevelXP: 1500,
      currentLevelBaseXP: 500,
    };
  }
  if (totalXP < 3500) {
    return {
      level: 3,
      title: "Flow State Walker",
      nextLevelXP: 3500,
      currentLevelBaseXP: 1500,
    };
  }
  if (totalXP < 7000) {
    return {
      level: 4,
      title: "Deep Work Artisan",
      nextLevelXP: 7000,
      currentLevelBaseXP: 3500,
    };
  }
  return {
    level: 5,
    title: "Zen Grandmaster",
    nextLevelXP: 15000,
    currentLevelBaseXP: 7000,
  };
}

let cachedSettings: PomodoroSettings = DEFAULT_SETTINGS;
let cachedRawSettings: string | null = null;
function getCachedSettings(): PomodoroSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY);
    if (raw === cachedRawSettings) return cachedSettings;
    cachedRawSettings = raw;
    if (raw) cachedSettings = { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {}
  return cachedSettings;
}

function saveSettings(s: PomodoroSettings) {
  cachedSettings = s;
  cachedRawSettings = JSON.stringify(s);
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(SETTINGS_KEY, cachedRawSettings);
      setTimeout(() => {
        window.dispatchEvent(new Event("pomodoro-settings-changed"));
      }, 0);
    } catch {}
  }
}

function subscribeSettings(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("pomodoro-settings-changed", cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener("pomodoro-settings-changed", cb);
    window.removeEventListener("storage", cb);
  };
}

let cachedSessions: PomodoroSession[] = [];
let cachedRawSessions: string | null = null;
function getCachedSessions(): PomodoroSession[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(SESSIONS_KEY);
    if (raw === cachedRawSessions) return cachedSessions;
    cachedRawSessions = raw;
    if (raw) cachedSessions = JSON.parse(raw);
  } catch {}
  return cachedSessions;
}

function saveSessions(s: PomodoroSession[]) {
  cachedSessions = s;
  cachedRawSessions = JSON.stringify(s);
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(SESSIONS_KEY, cachedRawSessions);
      setTimeout(() => {
        window.dispatchEvent(new Event("pomodoro-sessions-changed"));
      }, 0);
    } catch {}
  }
}

function subscribeSessions(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("pomodoro-sessions-changed", cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener("pomodoro-sessions-changed", cb);
    window.removeEventListener("storage", cb);
  };
}

let cachedGamification: GamificationProfile = DEFAULT_GAMIFICATION;
let cachedRawGamification: string | null = null;
function getCachedGamification(): GamificationProfile {
  if (typeof window === "undefined") return DEFAULT_GAMIFICATION;
  try {
    const raw = window.localStorage.getItem(GAMIFICATION_KEY);
    if (raw === cachedRawGamification) return cachedGamification;
    cachedRawGamification = raw;
    if (raw) cachedGamification = { ...DEFAULT_GAMIFICATION, ...JSON.parse(raw) };
  } catch {}
  return cachedGamification;
}

function saveGamification(g: GamificationProfile) {
  cachedGamification = g;
  cachedRawGamification = JSON.stringify(g);
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(GAMIFICATION_KEY, cachedRawGamification);
      setTimeout(() => {
        window.dispatchEvent(new Event("pomodoro-gamification-changed"));
      }, 0);
    } catch {}
  }
}

function subscribeGamification(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("pomodoro-gamification-changed", cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener("pomodoro-gamification-changed", cb);
    window.removeEventListener("storage", cb);
  };
}

const SERVER_EMPTY_SESSIONS: PomodoroSession[] = [];
const getServerSettings = () => DEFAULT_SETTINGS;
const getServerSessions = () => SERVER_EMPTY_SESSIONS;
const getServerGamification = () => DEFAULT_GAMIFICATION;

export function usePomodoro() {
  const settings = useSyncExternalStore(
    subscribeSettings,
    getCachedSettings,
    getServerSettings
  );
  const sessions = useSyncExternalStore(
    subscribeSessions,
    getCachedSessions,
    getServerSessions
  );
  const gamification = useSyncExternalStore(
    subscribeGamification,
    getCachedGamification,
    getServerGamification
  );

  const [mode, setMode] = useState<PomodoroMode>("pomodoro");
  const [timeLeft, setTimeLeft] = useState<number>(() => {
    return DEFAULT_SETTINGS.pomodoroMinutes * 60;
  });
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [activeTask, setActiveTask] = useState<string>("");
  const [cycleCount, setCycleCount] = useState<number>(0);

  const saveSettingsToStorage = useCallback((newSettings: PomodoroSettings) => {
    saveSettings(newSettings);
  }, []);

  const saveSessionsToStorage = useCallback((newSessions: PomodoroSession[]) => {
    saveSessions(newSessions);
  }, []);

  const saveGamificationToStorage = useCallback(
    (newGamification: GamificationProfile) => {
      saveGamification(newGamification);
    },
    []
  );

  // Helper to get duration in seconds for any mode
  const getDurationForMode = useCallback(
    (m: PomodoroMode, currentSettings = settings) => {
      switch (m) {
        case "pomodoro":
          return currentSettings.pomodoroMinutes * 60;
        case "shortBreak":
          return currentSettings.shortBreakMinutes * 60;
        case "longBreak":
          return currentSettings.longBreakMinutes * 60;
      }
    },
    [settings]
  );

  // Switch mode directly
  const switchMode = useCallback(
    (newMode: PomodoroMode) => {
      setIsRunning(false);
      setMode(newMode);
      setTimeLeft(getDurationForMode(newMode));
    },
    [getDurationForMode]
  );

  // Award XP and complete session
  const completeSession = useCallback(() => {
    pomodoroAlarm.playAlarm(settings.alarmVolume);

    const now = Date.now();
    const todayStr = new Date().toISOString().split("T")[0];
    const durationMins =
      mode === "pomodoro"
        ? settings.pomodoroMinutes
        : mode === "shortBreak"
        ? settings.shortBreakMinutes
        : settings.longBreakMinutes;

    // Record session
    const newSession: PomodoroSession = {
      id: `session_${now}`,
      timestamp: now,
      durationMinutes: durationMins,
      mode,
      taskName: activeTask.trim() || undefined,
    };
    const updatedSessions = [newSession, ...sessions].slice(0, 100);
    saveSessionsToStorage(updatedSessions);

    if (mode === "pomodoro") {
      const newCycleCount = cycleCount + 1;
      setCycleCount(newCycleCount);

      const addedXP = durationMins * 10;
      const newTotalMinutes = gamification.totalMinutesFocused + durationMins;
      const newTotalPomodoros = gamification.totalPomodorosCompleted + 1;
      const newTotalXP = gamification.totalXP + addedXP;

      // Streak calculation
      let newStreak = gamification.streakDays;
      if (!gamification.lastActiveDate) {
        newStreak = 1;
      } else if (gamification.lastActiveDate !== todayStr) {
        const lastDate = new Date(gamification.lastActiveDate);
        const today = new Date(todayStr);
        const diffDays = Math.round(
          (today.getTime() - lastDate.getTime()) / (1000 * 3600 * 24)
        );
        if (diffDays === 1) {
          newStreak += 1;
        } else if (diffDays > 1) {
          newStreak = 1;
        }
      }

      // Check badges
      const newBadges = { ...gamification.badges };
      if (!newBadges["first-pomodoro"] && newTotalPomodoros >= 1) {
        newBadges["first-pomodoro"] = now;
      }
      if (!newBadges["streak-3"] && newStreak >= 3) {
        newBadges["streak-3"] = now;
      }
      if (!newBadges["century-club"] && newTotalMinutes >= 100) {
        newBadges["century-club"] = now;
      }
      if (!newBadges["marathoner"] && newCycleCount >= 4) {
        newBadges["marathoner"] = now;
      }
      if (!newBadges["focus-master"] && newTotalPomodoros >= 10) {
        newBadges["focus-master"] = now;
      }
      if (!newBadges["zen-grandmaster"] && newTotalXP >= 3500) {
        newBadges["zen-grandmaster"] = now;
      }

      const { level, title } = getLevelInfo(newTotalXP);

      saveGamificationToStorage({
        totalMinutesFocused: newTotalMinutes,
        totalPomodorosCompleted: newTotalPomodoros,
        totalXP: newTotalXP,
        currentLevel: level,
        levelTitle: title,
        streakDays: newStreak,
        lastActiveDate: todayStr,
        badges: newBadges,
      });

      // Next mode: Long break or Short break
      const isLongBreak = newCycleCount % settings.longBreakInterval === 0;
      const nextMode: PomodoroMode = isLongBreak ? "longBreak" : "shortBreak";
      setMode(nextMode);
      setTimeLeft(getDurationForMode(nextMode));
      setIsRunning(settings.autoStartBreaks);
    } else {
      // Break finished -> back to Pomodoro
      setMode("pomodoro");
      setTimeLeft(getDurationForMode("pomodoro"));
      setIsRunning(settings.autoStartPomodoros);
    }
  }, [
    mode,
    settings,
    activeTask,
    sessions,
    cycleCount,
    gamification,
    saveSessionsToStorage,
    saveGamificationToStorage,
    getDurationForMode,
  ]);

  // Main countdown timer interval
  const completeSessionRef = useRef(completeSession);
  useEffect(() => {
    completeSessionRef.current = completeSession;
  }, [completeSession]);

  useEffect(() => {
    if (!isRunning) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setTimeout(() => {
            completeSessionRef.current();
          }, 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning]);

  // Controls
  const startTimer = useCallback(() => setIsRunning(true), []);
  const pauseTimer = useCallback(() => setIsRunning(false), []);
  const toggleTimer = useCallback(() => setIsRunning((prev) => !prev), []);

  const resetTimer = useCallback(() => {
    setIsRunning(false);
    setTimeLeft(getDurationForMode(mode));
  }, [mode, getDurationForMode]);

  const skipTimer = useCallback(() => {
    setIsRunning(false);
    if (mode === "pomodoro") {
      const isLongBreak = (cycleCount + 1) % settings.longBreakInterval === 0;
      const nextMode: PomodoroMode = isLongBreak ? "longBreak" : "shortBreak";
      setMode(nextMode);
      setTimeLeft(getDurationForMode(nextMode));
    } else {
      setMode("pomodoro");
      setTimeLeft(getDurationForMode("pomodoro"));
    }
  }, [mode, cycleCount, settings.longBreakInterval, getDurationForMode]);

  const updateSettings = useCallback(
    (newValues: Partial<PomodoroSettings>) => {
      const updated = { ...settings, ...newValues };
      saveSettingsToStorage(updated);
      if (!isRunning) {
        setTimeLeft(getDurationForMode(mode, updated));
      }
    },
    [settings, isRunning, mode, saveSettingsToStorage, getDurationForMode]
  );

  // Time formatted MM:SS
  const formattedTime = useMemo(() => {
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }, [timeLeft]);

  // Level progression stats
  const levelInfo = useMemo(() => {
    return getLevelInfo(gamification.totalXP);
  }, [gamification.totalXP]);

  const todayMinutesFocused = useMemo(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    return sessions
      .filter(
        (s) =>
          s.mode === "pomodoro" &&
          new Date(s.timestamp).toISOString().split("T")[0] === todayStr
      )
      .reduce((sum, s) => sum + s.durationMinutes, 0);
  }, [sessions]);

  return {
    mode,
    switchMode,
    timeLeft,
    formattedTime,
    isRunning,
    startTimer,
    pauseTimer,
    toggleTimer,
    resetTimer,
    skipTimer,
    activeTask,
    setActiveTask,
    cycleCount,
    settings,
    updateSettings,
    sessions,
    gamification,
    levelInfo,
    todayMinutesFocused,
  };
}
