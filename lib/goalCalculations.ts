import type {
  Goal,
  GoalImportance,
  GoalInstance,
  GoalRecoveryPlan,
} from "./goalTypes.ts";
import { IMPORTANCE_POINTS } from "./goalTypes.ts";

/**
 * Format a Date to local ISO date string: YYYY-MM-DD
 */
export function formatLocalDate(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Calculate ISO week key: YYYY-Www (e.g. 2026-W37)
 */
export function getISOWeekKey(d: Date = new Date()): string {
  const target = new Date(d.valueOf());
  const dayNr = (d.getDay() + 6) % 7; // Monday = 0, Sunday = 6
  target.setDate(target.getDate() - dayNr + 3); // Nearest Thursday
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7));
  }
  const weekNum = 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
  const year = new Date(firstThursday).getFullYear();
  return `${year}-W${String(weekNum).padStart(2, "0")}`;
}

/**
 * Format month key: YYYY-MM
 */
export function getMonthKey(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

/**
 * Format year key: YYYY
 */
export function getYearKey(d: Date = new Date()): string {
  return String(d.getFullYear());
}

/**
 * Returns all 7 dates (Monday to Sunday) of the week containing the given date
 */
export function getWeekDates(date: Date = new Date()): string[] {
  const current = new Date(date.valueOf());
  const day = current.getDay();
  // Monday is day 1 in ISO, 0 is Sunday
  const diffToMonday = day === 0 ? -6 : 1 - day;
  
  const monday = new Date(current);
  monday.setDate(current.getDate() + diffToMonday);

  const dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const nextDay = new Date(monday);
    nextDay.setDate(monday.getDate() + i);
    dates.push(formatLocalDate(nextDay));
  }
  return dates;
}

/**
 * Check if the given date is Sunday
 */
export function isSunday(d: Date = new Date()): boolean {
  return d.getDay() === 0;
}

/**
 * Calculate points and completion percentage for a goal execution instance
 */
export function calculateInstancePoints(
  actualValue: number,
  targetValue: number,
  importance: GoalImportance
): {
  completionPercentage: number;
  earnedPoints: number;
  possiblePoints: number;
} {
  const possiblePoints = IMPORTANCE_POINTS[importance] ?? 2;

  if (targetValue <= 0) {
    return {
      completionPercentage: 100,
      earnedPoints: possiblePoints,
      possiblePoints,
    };
  }

  const safeActual = Math.max(0, actualValue);
  const rawPct = (safeActual / targetValue) * 100;
  const completionPercentage = Math.min(100, Math.round(rawPct * 10) / 10);

  // Earned points proportional to completion %
  const earned = (possiblePoints * (completionPercentage / 100));
  const earnedPoints = Math.round(earned * 10) / 10;

  return {
    completionPercentage,
    earnedPoints,
    possiblePoints,
  };
}

/**
 * Calculate Daily Execution Score (0-100) from an array of daily instances
 */
export function calculateDailyExecutionScore(instances: GoalInstance[]): {
  earnedPoints: number;
  possiblePoints: number;
  scorePercentage: number;
} {
  if (!instances || instances.length === 0) {
    return { earnedPoints: 0, possiblePoints: 0, scorePercentage: 0 };
  }

  const earnedPoints = Math.round(
    instances.reduce((sum, inst) => sum + (inst.earnedPoints || 0), 0) * 10
  ) / 10;

  const possiblePoints = Math.round(
    instances.reduce((sum, inst) => sum + (inst.possiblePoints || 0), 0) * 10
  ) / 10;

  const scorePercentage =
    possiblePoints > 0
      ? Math.min(100, Math.round((earnedPoints / possiblePoints) * 100))
      : 0;

  return { earnedPoints, possiblePoints, scorePercentage };
}

/**
 * Calculate Weekly Combined Score:
 * Daily Execution (70% weight) + Weekly Outcomes (30% weight)
 */
export function calculateWeeklyCombinedScore(
  dailyScores: number[], // Array of 0-100 daily score percentages (e.g. from Mon to Sun)
  weeklyOutcomeInstances: GoalInstance[]
): {
  dailyScore: number;
  outcomeScore: number;
  combinedScore: number;
} {
  // 1. Daily Execution average (days that had goals)
  const validDailyScores = dailyScores.filter((s) => typeof s === "number" && !isNaN(s));
  const dailyScore =
    validDailyScores.length > 0
      ? Math.round(
          validDailyScores.reduce((sum, s) => sum + s, 0) / validDailyScores.length
        )
      : 0;

  // 2. Weekly Outcome score
  const outcomeCalc = calculateDailyExecutionScore(weeklyOutcomeInstances);
  const outcomeScore = outcomeCalc.scorePercentage;

  // 3. Combined score 70% / 30%
  // If there are no weekly outcome goals defined, daily execution carries 100%
  let combinedScore = 0;
  if (weeklyOutcomeInstances.length === 0) {
    combinedScore = dailyScore;
  } else if (validDailyScores.length === 0) {
    combinedScore = outcomeScore;
  } else {
    combinedScore = Math.round(dailyScore * 0.7 + outcomeScore * 0.3);
  }

  return {
    dailyScore,
    outcomeScore,
    combinedScore: Math.min(100, Math.max(0, combinedScore)),
  };
}

export interface DeficitItem {
  goal: Goal;
  instance: GoalInstance;
  shortfall: number;
  unit: string;
  estimatedMinutes: number;
  priority: "critical" | "recommended" | "optional";
}

/**
 * Sunday Recovery Engine:
 * Analyzes shortfalls across the week, prioritizes non-negotiables,
 * caps within user capacity (e.g. 240 mins) to prevent burnout.
 */
export function analyzeSundayRecovery(
  weekDailyInstances: Array<{ goal: Goal; instance: GoalInstance }>,
  capacityMinutes: number = 240
): {
  deficits: DeficitItem[];
  totalShortfallMinutes: number;
  capacityMinutes: number;
  isOverCapacity: boolean;
  recoveryPlans: Array<Omit<GoalRecoveryPlan, "id" | "createdAt">>;
} {
  // Group deficits by goal to aggregate multi-day shortfalls
  const goalDeficitMap = new Map<
    string,
    {
      goal: Goal;
      latestInstance: GoalInstance;
      totalShortfall: number;
    }
  >();

  for (const item of weekDailyInstances) {
    const shortfall = Math.max(0, item.instance.targetValue - item.instance.actualValue);
    if (shortfall > 0) {
      const existing = goalDeficitMap.get(item.goal.id);
      if (existing) {
        existing.totalShortfall += shortfall;
        if (item.instance.periodKey > existing.latestInstance.periodKey) {
          existing.latestInstance = item.instance;
        }
      } else {
        goalDeficitMap.set(item.goal.id, {
          goal: item.goal,
          latestInstance: item.instance,
          totalShortfall: shortfall,
        });
      }
    }
  }

  // Convert to sorted deficits
  const deficitList = Array.from(goalDeficitMap.values()).map(({ goal, latestInstance, totalShortfall }) => {
    // Estimate minutes per unit:
    // Default: 20 mins per problem/commit/session, 2 mins per page, 60 mins per hour, etc.
    let minsPerUnit = 25;
    const u = (goal.unit || "").toLowerCase();
    if (u.includes("page")) minsPerUnit = 2;
    else if (u.includes("prob") || u.includes("dsa") || u.includes("leet")) minsPerUnit = 25;
    else if (u.includes("hour")) minsPerUnit = 60;
    else if (u.includes("min")) minsPerUnit = 1;
    else if (u.includes("commit")) minsPerUnit = 30;
    else if (u.includes("session")) minsPerUnit = 25;

    const estimatedMinutes = Math.min(180, Math.round(totalShortfall * minsPerUnit));

    return {
      goal,
      instance: latestInstance,
      shortfall: totalShortfall,
      unit: goal.unit,
      estimatedMinutes: Math.max(10, estimatedMinutes),
    };
  });

  // Sort by Importance (critical first) then highest shortfall
  const importanceOrder: Record<GoalImportance, number> = {
    critical: 4,
    high: 3,
    medium: 2,
    low: 1,
  };

  deficitList.sort((a, b) => {
    const impDiff = importanceOrder[b.goal.importance] - importanceOrder[a.goal.importance];
    if (impDiff !== 0) return impDiff;
    return b.estimatedMinutes - a.estimatedMinutes;
  });

  let accumulatedMinutes = 0;
  const deficits: DeficitItem[] = [];

  for (const item of deficitList) {
    let priority: "critical" | "recommended" | "optional" = "optional";

    if (item.goal.importance === "critical") {
      priority = "critical";
    } else if (accumulatedMinutes + item.estimatedMinutes <= capacityMinutes) {
      priority = "recommended";
    } else {
      priority = "optional";
    }

    accumulatedMinutes += item.estimatedMinutes;

    deficits.push({
      ...item,
      priority,
    });
  }

  const isOverCapacity = accumulatedMinutes > capacityMinutes;

  const recoveryPlans = deficits.map((d) => ({
    weekKey: getISOWeekKey(),
    sourceInstanceId: d.instance.id,
    recoveryDate: formatLocalDate(),
    targetValue: d.shortfall,
    actualValue: 0,
    capacityMinutes: d.estimatedMinutes,
    priority: d.priority,
    status: "planned" as const,
  }));

  return {
    deficits,
    totalShortfallMinutes: accumulatedMinutes,
    capacityMinutes,
    isOverCapacity,
    recoveryPlans,
  };
}

/**
 * Generates dynamic adjustment suggestions for next week
 */
export function generateWeeklyAdjustmentSuggestions(
  weekDailyInstances: Array<{ goal: Goal; instance: GoalInstance }>
): Array<{ goalId: string; goalName: string; type: "decrease" | "increase" | "shift"; message: string }> {
  const suggestions: Array<{ goalId: string; goalName: string; type: "decrease" | "increase" | "shift"; message: string }> = [];

  const grouped = new Map<string, { goal: Goal; instances: GoalInstance[] }>();
  for (const item of weekDailyInstances) {
    const list = grouped.get(item.goal.id) || { goal: item.goal, instances: [] };
    list.instances.push(item.instance);
    grouped.set(item.goal.id, list);
  }

  for (const { goal, instances } of grouped.values()) {
    if (instances.length < 3) continue;

    const avgCompletion =
      instances.reduce((sum, inst) => sum + inst.completionPercentage, 0) /
      instances.length;

    if (avgCompletion < 50) {
      const suggestedTarget = Math.max(1, Math.round(goal.targetValue * 0.75));
      suggestions.push({
        goalId: goal.id,
        goalName: goal.name,
        type: "decrease",
        message: `Consistent shortfall detected (${Math.round(avgCompletion)}% avg). Lower target from ${goal.targetValue} ${goal.unit} to ${suggestedTarget} ${goal.unit} to rebuild momentum without burnout.`,
      });
    } else if (avgCompletion >= 98 && instances.length >= 5) {
      const suggestedTarget = Math.round(goal.targetValue * 1.25);
      suggestions.push({
        goalId: goal.id,
        goalName: goal.name,
        type: "increase",
        message: `High consistency achieved (100% completed 5+ days). Ready to level up target to ${suggestedTarget} ${goal.unit}?`,
      });
    }
  }

  return suggestions;
}
