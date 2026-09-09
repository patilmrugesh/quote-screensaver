import { useCallback, useMemo, useSyncExternalStore } from "react";
import {
  Goal,
  GoalInstance,
  GoalReview,
  GoalRecoveryPlan,
  GoalLevel,
  STARTER_GOALS,
  GoalWithInstance,
} from "@/lib/goalTypes";
import {
  calculateInstancePoints,
  calculateDailyExecutionScore,
  calculateWeeklyCombinedScore,
  analyzeSundayRecovery,
  formatLocalDate,
  getISOWeekKey,
  getMonthKey,
  getYearKey,
  getWeekDates,
  generateWeeklyAdjustmentSuggestions,
} from "@/lib/goalCalculations";
import type { GamificationProfile } from "@/lib/pomodoroTypes";

const GOALS_STORAGE_KEY = "study_goals";
const INSTANCES_STORAGE_KEY = "study_goal_instances";
const REVIEWS_STORAGE_KEY = "study_goal_reviews";
const RECOVERY_STORAGE_KEY = "study_goal_recovery";
const GAMIFICATION_KEYS = [
  "quote-screensaver-pomodoro-gamification",
  "screensaver_pomodoro_gamification",
];

interface GoalsStoreState {
  goals: Goal[];
  instances: GoalInstance[];
  reviews: GoalReview[];
  recoveryPlans: GoalRecoveryPlan[];
}

let storeSnapshot: GoalsStoreState = {
  goals: [],
  instances: [],
  reviews: [],
  recoveryPlans: [],
};

const SERVER_STORE_STATE: GoalsStoreState = {
  goals: [],
  instances: [],
  reviews: [],
  recoveryPlans: [],
};

let isInitialized = false;

function loadStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as T;
  } catch {}
  return fallback;
}

function saveStorage(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

function initSnapshot() {
  if (typeof window === "undefined" || isInitialized) return;
  isInitialized = true;

  let goals = loadStorage<Goal[]>(GOALS_STORAGE_KEY, []);
  if (goals.length === 0) {
    const now = Date.now();
    goals = STARTER_GOALS.map((sg, index) => ({
      ...sg,
      id: `starter_goal_${now}_${index}`,
      createdAt: now,
      updatedAt: now,
    }));
    saveStorage(GOALS_STORAGE_KEY, goals);
  }

  const instances = loadStorage<GoalInstance[]>(INSTANCES_STORAGE_KEY, []);
  const reviews = loadStorage<GoalReview[]>(REVIEWS_STORAGE_KEY, []);
  const recoveryPlans = loadStorage<GoalRecoveryPlan[]>(RECOVERY_STORAGE_KEY, []);

  storeSnapshot = {
    goals,
    instances,
    reviews,
    recoveryPlans,
  };
}

function emitGoalsChange() {
  if (typeof window !== "undefined") {
    saveStorage(GOALS_STORAGE_KEY, storeSnapshot.goals);
    saveStorage(INSTANCES_STORAGE_KEY, storeSnapshot.instances);
    saveStorage(REVIEWS_STORAGE_KEY, storeSnapshot.reviews);
    saveStorage(RECOVERY_STORAGE_KEY, storeSnapshot.recoveryPlans);

    window.dispatchEvent(new Event("goals-changed"));
  }
}

function awardGamificationXP(pointsDelta: number) {
  if (typeof window === "undefined" || pointsDelta <= 0) return;
  const xpToAdd = Math.round(pointsDelta * 10); // 10 XP per goal point
  if (xpToAdd <= 0) return;

  try {
    for (const key of GAMIFICATION_KEYS) {
      const raw = window.localStorage.getItem(key);
      if (!raw) continue;
      const profile = JSON.parse(raw) as GamificationProfile;
      const newTotalXP = (profile.totalXP || 0) + xpToAdd;

      let level = profile.currentLevel || 1;
      let title = profile.levelTitle || "Mindful Novice";

      if (newTotalXP >= 7000) {
        level = 5;
        title = "Zen Grandmaster";
      } else if (newTotalXP >= 3500) {
        level = 4;
        title = "Deep Work Artisan";
      } else if (newTotalXP >= 1500) {
        level = 3;
        title = "Flow State Walker";
      } else if (newTotalXP >= 500) {
        level = 2;
        title = "Focus Seeker";
      }

      const updated: GamificationProfile = {
        ...profile,
        totalXP: newTotalXP,
        currentLevel: level,
        levelTitle: title,
      };

      window.localStorage.setItem(key, JSON.stringify(updated));
    }

    setTimeout(() => {
      window.dispatchEvent(new Event("pomodoro-gamification-changed"));
    }, 0);
  } catch {}
}

function subscribe(callback: () => void) {
  if (typeof window === "undefined") return () => {};

  const handleUpdate = () => {
    const goals = loadStorage<Goal[]>(GOALS_STORAGE_KEY, storeSnapshot.goals);
    const instances = loadStorage<GoalInstance[]>(INSTANCES_STORAGE_KEY, storeSnapshot.instances);
    const reviews = loadStorage<GoalReview[]>(REVIEWS_STORAGE_KEY, storeSnapshot.reviews);
    const recoveryPlans = loadStorage<GoalRecoveryPlan[]>(RECOVERY_STORAGE_KEY, storeSnapshot.recoveryPlans);

    storeSnapshot = { goals, instances, reviews, recoveryPlans };
    callback();
  };

  window.addEventListener("goals-changed", handleUpdate);
  window.addEventListener("storage", handleUpdate);

  return () => {
    window.removeEventListener("goals-changed", handleUpdate);
    window.removeEventListener("storage", handleUpdate);
  };
}

function getSnapshot(): GoalsStoreState {
  initSnapshot();
  return storeSnapshot;
}

const getServerSnapshot = () => SERVER_STORE_STATE;

export function useGoals() {
  const store = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // --- GOAL ACTIONS ---

  const addGoal = useCallback((goalData: Omit<Goal, "id" | "createdAt" | "updatedAt">): Goal => {
    const now = Date.now();
    const newGoal: Goal = {
      ...goalData,
      id: `goal_${now}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: now,
      updatedAt: now,
    };

    storeSnapshot = {
      ...storeSnapshot,
      goals: [...storeSnapshot.goals, newGoal],
    };
    emitGoalsChange();
    return newGoal;
  }, []);

  const updateGoal = useCallback((id: string, updates: Partial<Goal>): Goal | null => {
    const existing = storeSnapshot.goals.find((g) => g.id === id);
    if (!existing) return null;

    const now = Date.now();
    const updatedGoal: Goal = {
      ...existing,
      ...updates,
      updatedAt: now,
    };

    storeSnapshot = {
      ...storeSnapshot,
      goals: storeSnapshot.goals.map((g) => (g.id === id ? updatedGoal : g)),
    };
    emitGoalsChange();
    return updatedGoal;
  }, []);

  const deleteGoal = useCallback((id: string): boolean => {
    const existing = storeSnapshot.goals.find((g) => g.id === id);
    if (!existing) return false;

    storeSnapshot = {
      ...storeSnapshot,
      goals: storeSnapshot.goals.filter((g) => g.id !== id),
      // Also cascade clean instances
      instances: storeSnapshot.instances.filter((inst) => inst.goalId !== id),
    };
    emitGoalsChange();
    return true;
  }, []);

  // --- INSTANCE PROGRESS LOGGING ---

  const getPeriodKeyForLevel = useCallback((level: GoalLevel, date: Date = new Date()): string => {
    switch (level) {
      case "daily":
        return formatLocalDate(date);
      case "weekly":
        return getISOWeekKey(date);
      case "monthly":
        return getMonthKey(date);
      case "yearly":
        return getYearKey(date);
    }
  }, []);

  const getInstance = useCallback(
    (goalId: string, periodKey?: string): GoalInstance | null => {
      const goal = storeSnapshot.goals.find((g) => g.id === goalId);
      if (!goal) return null;

      const pKey = periodKey || getPeriodKeyForLevel(goal.level);
      return (
        storeSnapshot.instances.find(
          (inst) => inst.goalId === goalId && inst.periodKey === pKey
        ) || null
      );
    },
    [getPeriodKeyForLevel]
  );

  const setInstanceValue = useCallback(
    (goalId: string, actualValue: number, periodKey?: string): GoalInstance | null => {
      const goal = storeSnapshot.goals.find((g) => g.id === goalId);
      if (!goal) return null;

      const pKey = periodKey || getPeriodKeyForLevel(goal.level);
      const safeActual = Math.max(0, actualValue);

      const existing = storeSnapshot.instances.find(
        (inst) => inst.goalId === goalId && inst.periodKey === pKey
      );

      const { completionPercentage, earnedPoints, possiblePoints } =
        calculateInstancePoints(safeActual, goal.targetValue, goal.importance);

      const status =
        completionPercentage >= 100
          ? "completed"
          : safeActual > 0
          ? "in_progress"
          : "pending";

      const now = Date.now();
      let updatedInstance: GoalInstance;

      const previousEarnedPoints = existing ? existing.earnedPoints : 0;
      const pointsDelta = earnedPoints - previousEarnedPoints;

      if (existing) {
        updatedInstance = {
          ...existing,
          targetValue: goal.targetValue,
          actualValue: safeActual,
          completionPercentage,
          earnedPoints,
          possiblePoints,
          status,
          updatedAt: now,
        };
        storeSnapshot = {
          ...storeSnapshot,
          instances: storeSnapshot.instances.map((inst) =>
            inst.id === existing.id ? updatedInstance : inst
          ),
        };
      } else {
        updatedInstance = {
          id: `ginst_${now}_${Math.random().toString(36).substring(2, 7)}`,
          goalId,
          periodKey: pKey,
          targetValue: goal.targetValue,
          actualValue: safeActual,
          completionPercentage,
          earnedPoints,
          possiblePoints,
          status,
          createdAt: now,
          updatedAt: now,
        };
        storeSnapshot = {
          ...storeSnapshot,
          instances: [...storeSnapshot.instances, updatedInstance],
        };
      }

      if (pointsDelta > 0) {
        awardGamificationXP(pointsDelta);
      }

      emitGoalsChange();
      return updatedInstance;
    },
    [getPeriodKeyForLevel]
  );

  const logProgress = useCallback(
    (goalId: string, delta: number, periodKey?: string): GoalInstance | null => {
      const current = getInstance(goalId, periodKey);
      const currentValue = current ? current.actualValue : 0;
      return setInstanceValue(goalId, currentValue + delta, periodKey);
    },
    [getInstance, setInstanceValue]
  );

  // --- QUERY SELECTORS ---

  const getGoalsForLevel = useCallback(
    (level: GoalLevel): Goal[] => {
      return store.goals.filter((g) => g.level === level);
    },
    [store.goals]
  );

  const getGoalsWithInstances = useCallback(
    (level: GoalLevel, periodKey?: string): GoalWithInstance[] => {
      const filteredGoals = store.goals.filter((g) => g.level === level);
      return filteredGoals.map((goal) => {
        const pKey = periodKey || getPeriodKeyForLevel(level);
        const instance = store.instances.find(
          (inst) => inst.goalId === goal.id && inst.periodKey === pKey
        );
        return {
          ...goal,
          instance,
        };
      });
    },
    [store.goals, store.instances, getPeriodKeyForLevel]
  );

  // --- METRICS & SCORES ---

  const getDailyExecution = useCallback(
    (dateStr: string = formatLocalDate()) => {
      const dailyGoals = store.goals.filter((g) => g.level === "daily" && g.status === "active");
      const instances = dailyGoals.map((goal) => {
        const inst = store.instances.find(
          (i) => i.goalId === goal.id && i.periodKey === dateStr
        );
        if (inst) return inst;
        const { possiblePoints } = calculateInstancePoints(0, goal.targetValue, goal.importance);
        return {
          id: `virtual_${goal.id}_${dateStr}`,
          goalId: goal.id,
          periodKey: dateStr,
          targetValue: goal.targetValue,
          actualValue: 0,
          completionPercentage: 0,
          earnedPoints: 0,
          possiblePoints,
          status: "pending" as const,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
      });

      const score = calculateDailyExecutionScore(instances);
      return {
        ...score,
        instances,
        dateStr,
      };
    },
    [store.goals, store.instances]
  );

  const getWeeklyExecution = useCallback(
    (currentDate: Date = new Date()) => {
      const weekDates = getWeekDates(currentDate);
      const weekKey = getISOWeekKey(currentDate);

      // Daily scores for each date
      const dailyScoresByDay: Record<string, number> = {};
      const dailyScoresList: number[] = [];

      for (const d of weekDates) {
        const dayExecution = getDailyExecution(d);
        if (dayExecution.possiblePoints > 0) {
          dailyScoresByDay[d] = dayExecution.scorePercentage;
          dailyScoresList.push(dayExecution.scorePercentage);
        } else {
          dailyScoresByDay[d] = 0;
        }
      }

      // Weekly outcome goals
      const weeklyGoals = store.goals.filter((g) => g.level === "weekly" && g.status === "active");
      const weeklyInstances = weeklyGoals.map((goal) => {
        const inst = store.instances.find(
          (i) => i.goalId === goal.id && i.periodKey === weekKey
        );
        if (inst) return inst;
        const { possiblePoints } = calculateInstancePoints(0, goal.targetValue, goal.importance);
        return {
          id: `virtual_${goal.id}_${weekKey}`,
          goalId: goal.id,
          periodKey: weekKey,
          targetValue: goal.targetValue,
          actualValue: 0,
          completionPercentage: 0,
          earnedPoints: 0,
          possiblePoints,
          status: "pending" as const,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
      });

      const weeklyCalculation = calculateWeeklyCombinedScore(
        dailyScoresList,
        weeklyInstances
      );

      return {
        weekKey,
        weekDates,
        dailyScoresByDay,
        weeklyInstances,
        ...weeklyCalculation,
      };
    },
    [getDailyExecution, store.goals, store.instances]
  );

  // --- SUNDAY RECOVERY ENGINE ---

  const getSundayRecoveryData = useCallback(
    (capacityMinutes: number = 240, currentDate: Date = new Date()) => {
      const weekDates = getWeekDates(currentDate);
      const dailyGoals = store.goals.filter((g) => g.level === "daily" && g.status === "active");

      const weekDailyPairs: Array<{ goal: Goal; instance: GoalInstance }> = [];

      for (const d of weekDates) {
        for (const goal of dailyGoals) {
          const inst = store.instances.find(
            (i) => i.goalId === goal.id && i.periodKey === d
          );
          if (inst) {
            weekDailyPairs.push({ goal, instance: inst });
          } else {
            // Unstarted day goal counts as shortfall
            const { possiblePoints } = calculateInstancePoints(0, goal.targetValue, goal.importance);
            weekDailyPairs.push({
              goal,
              instance: {
                id: `virtual_${goal.id}_${d}`,
                goalId: goal.id,
                periodKey: d,
                targetValue: goal.targetValue,
                actualValue: 0,
                completionPercentage: 0,
                earnedPoints: 0,
                possiblePoints,
                status: "pending",
                createdAt: Date.now(),
                updatedAt: Date.now(),
              },
            });
          }
        }
      }

      const recoveryAnalysis = analyzeSundayRecovery(weekDailyPairs, capacityMinutes);
      const suggestions = generateWeeklyAdjustmentSuggestions(weekDailyPairs);

      return {
        ...recoveryAnalysis,
        suggestions,
      };
    },
    [store.goals, store.instances]
  );

  const saveRecoveryPlan = useCallback((plan: GoalRecoveryPlan) => {
    const existing = storeSnapshot.recoveryPlans.find((p) => p.id === plan.id);
    if (existing) {
      storeSnapshot = {
        ...storeSnapshot,
        recoveryPlans: storeSnapshot.recoveryPlans.map((p) =>
          p.id === plan.id ? plan : p
        ),
      };
    } else {
      storeSnapshot = {
        ...storeSnapshot,
        recoveryPlans: [...storeSnapshot.recoveryPlans, plan],
      };
    }
    emitGoalsChange();
  }, []);

  const saveReview = useCallback((review: GoalReview) => {
    const existing = storeSnapshot.reviews.find(
      (r) => r.periodKey === review.periodKey && r.periodType === review.periodType
    );
    if (existing) {
      storeSnapshot = {
        ...storeSnapshot,
        reviews: storeSnapshot.reviews.map((r) =>
          r.id === existing.id ? { ...review, id: existing.id } : r
        ),
      };
    } else {
      storeSnapshot = {
        ...storeSnapshot,
        reviews: [...storeSnapshot.reviews, review],
      };
    }
    emitGoalsChange();
  }, []);

  const resetToStarterGoals = useCallback(() => {
    const now = Date.now();
    const starterGoals: Goal[] = STARTER_GOALS.map((sg, index) => ({
      ...sg,
      id: `starter_goal_${now}_${index}`,
      createdAt: now,
      updatedAt: now,
    }));
    storeSnapshot = {
      goals: starterGoals,
      instances: [],
      reviews: [],
      recoveryPlans: [],
    };
    emitGoalsChange();
  }, []);

  // Today's summary stats
  const todaySummary = useMemo(() => {
    return getDailyExecution(formatLocalDate());
  }, [getDailyExecution]);

  return {
    goals: store.goals,
    instances: store.instances,
    reviews: store.reviews,
    recoveryPlans: store.recoveryPlans,
    todaySummary,
    addGoal,
    updateGoal,
    deleteGoal,
    getInstance,
    setInstanceValue,
    logProgress,
    getGoalsForLevel,
    getGoalsWithInstances,
    getDailyExecution,
    getWeeklyExecution,
    getSundayRecoveryData,
    saveRecoveryPlan,
    saveReview,
    resetToStarterGoals,
  };
}
