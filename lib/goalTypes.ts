export type GoalLevel = "daily" | "weekly" | "monthly" | "yearly";

export type GoalImportance = "low" | "medium" | "high" | "critical";

export type GoalTiming = "morning" | "afternoon" | "evening" | "anytime";

export type GoalStatus = "active" | "completed" | "paused" | "archived";

export type GoalRecurrence =
  | "daily"
  | "weekdays"
  | "weekends"
  | "weekly"
  | "custom"
  | "none";

export type GoalCategory =
  | "learning"
  | "fitness"
  | "career"
  | "mindfulness"
  | "coding"
  | "general";

export interface Goal {
  id: string;
  userId?: string;
  parentGoalId?: string | null;
  name: string;
  description?: string;
  level: GoalLevel;
  importance: GoalImportance;
  timing: GoalTiming;
  targetValue: number;
  unit: string;
  category: GoalCategory;
  recurrence: GoalRecurrence;
  status: GoalStatus;
  createdAt: number;
  updatedAt: number;
}

export type GoalInstanceStatus = "pending" | "in_progress" | "completed" | "missed";
export type RolloverAction = "none" | "roll_to_sunday" | "roll_to_next_day" | "dismissed";

export interface GoalInstance {
  id: string;
  goalId: string;
  userId?: string;
  periodKey: string; // YYYY-MM-DD for daily, YYYY-Www for weekly, YYYY-MM for monthly, YYYY for yearly
  targetValue: number;
  actualValue: number;
  completionPercentage: number;
  earnedPoints: number;
  possiblePoints: number;
  status: GoalInstanceStatus;
  rolloverAction?: RolloverAction;
  createdAt: number;
  updatedAt: number;
}

export interface GoalReview {
  id: string;
  userId?: string;
  periodType: "weekly" | "monthly";
  periodKey: string; // e.g. 2026-W37
  dailyExecutionScore: number;
  outcomeScore: number;
  overallScore: number;
  reflection?: string;
  createdAt: number;
}

export interface GoalRecoveryPlan {
  id: string;
  userId?: string;
  weekKey: string;
  sourceInstanceId: string;
  recoveryDate: string; // YYYY-MM-DD (typically Sunday)
  targetValue: number; // shortfall
  actualValue: number;
  capacityMinutes: number;
  priority: "critical" | "recommended" | "optional";
  status: "planned" | "in_progress" | "completed" | "cancelled";
  createdAt: number;
}

export interface GoalWithInstance extends Goal {
  instance?: GoalInstance;
}

export const IMPORTANCE_POINTS: Record<GoalImportance, number> = {
  low: 1,
  medium: 2,
  high: 3,
  critical: 5,
};

export const IMPORTANCE_LABELS: Record<GoalImportance, string> = {
  low: "Low Priority (1 pt)",
  medium: "Medium Priority (2 pts)",
  high: "High Priority (3 pts)",
  critical: "Critical Non-Negotiable (5 pts)",
};

export const COMMON_UNITS = [
  "pages",
  "problems",
  "hours",
  "mins",
  "sessions",
  "commits",
  "tasks",
  "applications",
  "reps",
  "km",
  "steps",
] as const;

export const CATEGORY_DETAILS: Record<
  GoalCategory,
  { label: string; color: string; bg: string; border: string; icon: string }
> = {
  learning: {
    label: "Learning & DSA",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
    icon: "BookOpen",
  },
  coding: {
    label: "Coding & Dev",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    icon: "Code",
  },
  career: {
    label: "Career & Work",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/30",
    icon: "Briefcase",
  },
  fitness: {
    label: "Health & Fitness",
    color: "text-rose-400",
    bg: "bg-rose-500/10",
    border: "border-rose-500/30",
    icon: "Activity",
  },
  mindfulness: {
    label: "Mindfulness",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    icon: "Sparkles",
  },
  general: {
    label: "General Focus",
    color: "text-neutral-300",
    bg: "bg-white/5",
    border: "border-white/10",
    icon: "Target",
  },
};

export const STARTER_GOALS: Array<Omit<Goal, "id" | "createdAt" | "updatedAt">> = [
  {
    name: "DSA Problem Solving",
    description: "Solve LeetCode/NeetCode problems daily for interview readiness",
    level: "daily",
    importance: "critical",
    timing: "morning",
    targetValue: 2,
    unit: "problems",
    category: "coding",
    recurrence: "weekdays",
    status: "active",
  },
  {
    name: "Deep Work Sessions",
    description: "Uninterrupted 25-minute Pomodoro focus blocks",
    level: "daily",
    importance: "high",
    timing: "afternoon",
    targetValue: 4,
    unit: "sessions",
    category: "career",
    recurrence: "daily",
    status: "active",
  },
  {
    name: "Non-Fiction Reading",
    description: "Read books on systems design, engineering, or philosophy",
    level: "daily",
    importance: "medium",
    timing: "evening",
    targetValue: 15,
    unit: "pages",
    category: "learning",
    recurrence: "daily",
    status: "active",
  },
  {
    name: "Core Coding Projects",
    description: "Ship commits to personal projects and portfolio",
    level: "weekly",
    importance: "high",
    timing: "anytime",
    targetValue: 12,
    unit: "commits",
    category: "coding",
    recurrence: "weekly",
    status: "active",
  },
  {
    name: "Master Distributed Systems",
    description: "Complete modules and building blocks for scalable architecture",
    level: "monthly",
    importance: "critical",
    timing: "anytime",
    targetValue: 4,
    unit: "chapters",
    category: "learning",
    recurrence: "none",
    status: "active",
  },
  {
    name: "Senior Software Engineer Mastery",
    description: "Level up algorithms, system design, and complete major open-source portfolio",
    level: "yearly",
    importance: "critical",
    timing: "anytime",
    targetValue: 1,
    unit: "milestone",
    category: "career",
    recurrence: "none",
    status: "active",
  },
];
