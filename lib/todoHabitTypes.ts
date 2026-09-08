export type TaskPriority = "low" | "medium" | "high" | "urgent";

export interface TaskItem {
  id: string;
  title: string;
  completed: boolean;
  priority: TaskPriority;
  category?: string;
  estimatedPomodoros: number;
  completedPomodoros: number;
  dueDate?: string; // YYYY-MM-DD
  createdAt: number;
  completedAt?: number;
}

export type HabitType = "build" | "quit";
export type HabitCategory =
  | "reading"
  | "fitness"
  | "mindset"
  | "health"
  | "productivity"
  | "discipline";

export interface HabitItem {
  id: string;
  name: string;
  type: HabitType; // "build" = good habit to establish, "quit" = bad habit to break
  category: HabitCategory;
  targetMetric?: string; // e.g. "20-30 pages", "10,000 steps", "3L water"
  currentStreak: number; // consecutive days
  bestStreak: number;
  completedDates: string[]; // YYYY-MM-DD
  quitStartDate?: string; // For "quit" habits: clean since date (YYYY-MM-DDTHH:mm:ss)
  resistedUrges?: number; // Times user clicked "Resisted Urge"
  color: string;
  icon: string;
}

export interface HabitTemplatePack {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  badge: string;
  habits: Omit<HabitItem, "id" | "currentStreak" | "bestStreak" | "completedDates">[];
  tasks: Omit<TaskItem, "id" | "completed" | "createdAt">[];
}

export interface TodoHabitProfile {
  totalTasksCompleted: number;
  totalHabitCheckins: number;
  totalUrgesResisted: number;
  totalBonusXP: number;
}
