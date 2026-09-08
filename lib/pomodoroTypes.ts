export type PomodoroMode = "pomodoro" | "shortBreak" | "longBreak";

export interface PomodoroSettings {
  pomodoroMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  longBreakInterval: number; // Every N pomodoros
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
  alarmVolume: number; // 0 to 1
}

export interface PomodoroSession {
  id: string;
  timestamp: number; // Date.now()
  durationMinutes: number;
  mode: PomodoroMode;
  taskName?: string;
}

export interface AchievementBadge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: number; // timestamp if unlocked
}

export interface GamificationProfile {
  totalMinutesFocused: number;
  totalPomodorosCompleted: number;
  totalXP: number;
  currentLevel: number;
  levelTitle: string;
  streakDays: number;
  lastActiveDate: string; // YYYY-MM-DD
  badges: Record<string, number>; // badgeId -> unlocked timestamp
}
