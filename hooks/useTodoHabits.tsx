"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import {
  TaskItem,
  TaskPriority,
  HabitItem,
  HabitType,
  HabitCategory,
  HabitTemplatePack,
  TodoHabitProfile,
} from "@/lib/todoHabitTypes";
import { todoHabitAudio } from "@/lib/todoHabitAudio";

const TASKS_KEY = "quote-screensaver-tasks";
const HABITS_KEY = "quote-screensaver-habits";
const PROFILE_KEY = "quote-screensaver-todo-profile";

export const CURATED_TEMPLATES: HabitTemplatePack[] = [
  {
    id: "reader-scholar",
    title: "The 20-Page Daily Reader",
    subtitle: "Lifelong Wisdom & Brain Expansion",
    description:
      "Reading 20 pages a day equals 30+ life-altering books a year. Form the reading habit that built history's greatest minds.",
    icon: "📖",
    badge: "Scholar Pack",
    habits: [
      {
        name: "Read 20–30 Pages of Non-Fiction",
        type: "build",
        category: "reading",
        targetMetric: "20–30 pages",
        color: "#f59e0b",
        icon: "📖",
      },
      {
        name: "Write Down 3 Key Takeaways",
        type: "build",
        category: "mindset",
        targetMetric: "3 takeaways",
        color: "#6366f1",
        icon: "✍️",
      },
      {
        name: "15 Min Deep Reflection & Application",
        type: "build",
        category: "mindset",
        targetMetric: "15 min",
        color: "#10b981",
        icon: "🧘",
      },
    ],
    tasks: [
      {
        title: "Choose this week's book & place it on desk",
        priority: "high",
        estimatedPomodoros: 1,
        completedPomodoros: 0,
      },
      {
        title: "Read Chapter 1 with phone outside the room",
        priority: "urgent",
        estimatedPomodoros: 2,
        completedPomodoros: 0,
      },
      {
        title: "Apply 1 actionable lesson from your reading",
        priority: "medium",
        estimatedPomodoros: 1,
        completedPomodoros: 0,
      },
    ],
  },
  {
    id: "vitality-10k-steps",
    title: "10,000 Steps & Peak Vitality",
    subtitle: "Endless Energy & Daily Cardio",
    description:
      "Walking 10,000 steps lowers stress, sparks creative thought, and boosts cardiovascular stamina. Paired with hydration and zero sugary drinks.",
    icon: "🏃",
    badge: "Vitality Pack",
    habits: [
      {
        name: "Walk 10,000 Steps Daily",
        type: "build",
        category: "fitness",
        targetMetric: "10,000 steps",
        color: "#10b981",
        icon: "👟",
      },
      {
        name: "Drink 3 Liters of Water",
        type: "build",
        category: "health",
        targetMetric: "3 Liters",
        color: "#38bdf8",
        icon: "💧",
      },
      {
        name: "30 Min Cardio or Bodyweight Workout",
        type: "build",
        category: "fitness",
        targetMetric: "30 mins",
        color: "#f97316",
        icon: "🏃",
      },
      {
        name: "Zero Sugary Sodas & Energy Drinks",
        type: "quit",
        category: "health",
        targetMetric: "Clean diet",
        color: "#ec4899",
        icon: "🥗",
      },
    ],
    tasks: [
      {
        title: "Morning 20-minute brisk walk outdoors",
        priority: "high",
        estimatedPomodoros: 1,
        completedPomodoros: 0,
      },
      {
        title: "Post-lunch 10-minute digestion stroll",
        priority: "medium",
        estimatedPomodoros: 1,
        completedPomodoros: 0,
      },
      {
        title: "Evening mobility & stretching routine",
        priority: "low",
        estimatedPomodoros: 1,
        completedPomodoros: 0,
      },
    ],
  },
  {
    id: "iron-will-bad-habits",
    title: "Iron Will: Bad Habit Breaker",
    subtitle: "Quit Smoking, Doom-Scrolling & Junk Food",
    description:
      "Reclaim your dopamine. Track real-time days clean, build unbreakable discipline, and hit the 'Resisted Urge' shield button whenever temptation strikes.",
    icon: "🛡️",
    badge: "Discipline Pack",
    habits: [
      {
        name: "Quit Smoking & Vaping",
        type: "quit",
        category: "health",
        targetMetric: "Zero nicotine",
        color: "#ef4444",
        icon: "🚭",
      },
      {
        name: "Zero Doom-Scrolling & Social Feeds",
        type: "quit",
        category: "discipline",
        targetMetric: "No mindless feeds",
        color: "#f97316",
        icon: "📵",
      },
      {
        name: "No Junk Food & Refined Sugar",
        type: "quit",
        category: "health",
        targetMetric: "Clean fuel",
        color: "#10b981",
        icon: "🥦",
      },
      {
        name: "No Alcohol / 100% Sober Mind",
        type: "quit",
        category: "health",
        targetMetric: "Zero alcohol",
        color: "#8b5cf6",
        icon: "✨",
      },
    ],
    tasks: [
      {
        title: "Drink tall glass of water when an urge strikes",
        priority: "urgent",
        estimatedPomodoros: 1,
        completedPomodoros: 0,
      },
      {
        title: "Take 10 deep box breaths to defeat cravings",
        priority: "high",
        estimatedPomodoros: 1,
        completedPomodoros: 0,
      },
      {
        title: "Replace screen time with physical book or walk",
        priority: "medium",
        estimatedPomodoros: 1,
        completedPomodoros: 0,
      },
    ],
  },
  {
    id: "monk-mode-deep-work",
    title: "Monk Mode & Deep Work",
    subtitle: "Elite Concentration & Peak Output",
    description:
      "Unplug from digital distractions. 3 deep Pomodoro focus sessions per day with zero morning phone usage.",
    icon: "⚡",
    badge: "Mastery Pack",
    habits: [
      {
        name: "3 Deep Focus Pomodoros Daily",
        type: "build",
        category: "productivity",
        targetMetric: "3 blocks (75m)",
        color: "#eab308",
        icon: "⚡",
      },
      {
        name: "No Phone in First 1 Hour of Morning",
        type: "build",
        category: "discipline",
        targetMetric: "First 60 mins",
        color: "#ef4444",
        icon: "📵",
      },
      {
        name: "Plan Top 3 Priorities Before Bed",
        type: "build",
        category: "productivity",
        targetMetric: "3 priorities",
        color: "#a855f7",
        icon: "🎯",
      },
    ],
    tasks: [
      {
        title: "Tackle today's hardest priority before noon",
        priority: "urgent",
        estimatedPomodoros: 3,
        completedPomodoros: 0,
      },
      {
        title: "Batch check all emails/slack in 20 min block",
        priority: "medium",
        estimatedPomodoros: 1,
        completedPomodoros: 0,
      },
      {
        title: "Clear desk and complete evening shutdown ritual",
        priority: "low",
        estimatedPomodoros: 1,
        completedPomodoros: 0,
      },
    ],
  },
  {
    id: "stoic-rituals",
    title: "Stoic Morning & Evening Rituals",
    subtitle: "Mental Clarity & Unshakable Peace",
    description:
      "Ancient routines for modern peace of mind. Calm morning stillness, evening gratitude reflections, and consistent rejuvenating sleep.",
    icon: "🧘",
    badge: "Mindfulness Pack",
    habits: [
      {
        name: "10 Mins Morning Stillness / Meditation",
        type: "build",
        category: "mindset",
        targetMetric: "10 mins",
        color: "#06b6d4",
        icon: "🧘",
      },
      {
        name: "Evening Gratitude Journal (3 Blessings)",
        type: "build",
        category: "mindset",
        targetMetric: "3 blessings",
        color: "#a855f7",
        icon: "🌅",
      },
      {
        name: "In Bed & Lights Out by 10:30 PM",
        type: "build",
        category: "health",
        targetMetric: "10:30 PM",
        color: "#3b82f6",
        icon: "🌙",
      },
    ],
    tasks: [
      {
        title: "Morning intention: 'What virtue will I practice today?'",
        priority: "medium",
        estimatedPomodoros: 1,
        completedPomodoros: 0,
      },
      {
        title: "Write down 3 things you were grateful for today",
        priority: "medium",
        estimatedPomodoros: 1,
        completedPomodoros: 0,
      },
    ],
  },
];

// Initial clean starter tasks & habits for new users (zero default progress)
const DEFAULT_TASKS: TaskItem[] = [];

const DEFAULT_HABITS: HabitItem[] = [
  {
    id: "habit_1",
    name: "Read 20–30 Pages",
    type: "build",
    category: "reading",
    targetMetric: "20–30 pages",
    currentStreak: 0,
    bestStreak: 0,
    completedDates: [],
    color: "#f59e0b",
    icon: "📖",
  },
  {
    id: "habit_2",
    name: "Walk 10,000 Steps",
    type: "build",
    category: "fitness",
    targetMetric: "10,000 steps",
    currentStreak: 0,
    bestStreak: 0,
    completedDates: [],
    color: "#10b981",
    icon: "👟",
  },
  {
    id: "habit_3",
    name: "Quit Smoking & Vaping",
    type: "quit",
    category: "health",
    targetMetric: "Zero nicotine",
    currentStreak: 0,
    bestStreak: 0,
    completedDates: [],
    resistedUrges: 0,
    color: "#ef4444",
    icon: "🚭",
  },
];

const DEFAULT_PROFILE: TodoHabitProfile = {
  totalTasksCompleted: 0,
  totalHabitCheckins: 0,
  totalUrgesResisted: 0,
  totalBonusXP: 0,
};

// Storage caching & subscription helpers
let cachedTasks: TaskItem[] = DEFAULT_TASKS;
let cachedRawTasks: string | null = null;
function getCachedTasks(): TaskItem[] {
  if (typeof window === "undefined") return DEFAULT_TASKS;
  try {
    const raw = window.localStorage.getItem(TASKS_KEY);
    if (raw === cachedRawTasks) return cachedTasks;
    cachedRawTasks = raw;
    if (raw) cachedTasks = JSON.parse(raw);
    else cachedTasks = DEFAULT_TASKS;
  } catch {}
  return cachedTasks;
}

function saveTasks(tasks: TaskItem[]) {
  cachedTasks = tasks;
  cachedRawTasks = JSON.stringify(tasks);
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(TASKS_KEY, cachedRawTasks);
      setTimeout(() => {
        window.dispatchEvent(new Event("todo-tasks-changed"));
      }, 0);
    } catch {}
  }
}

function subscribeTasks(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("todo-tasks-changed", cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener("todo-tasks-changed", cb);
    window.removeEventListener("storage", cb);
  };
}

let cachedHabits: HabitItem[] = DEFAULT_HABITS;
let cachedRawHabits: string | null = null;
function getCachedHabits(): HabitItem[] {
  if (typeof window === "undefined") return DEFAULT_HABITS;
  try {
    const raw = window.localStorage.getItem(HABITS_KEY);
    if (raw === cachedRawHabits) return cachedHabits;
    cachedRawHabits = raw;
    if (raw) cachedHabits = JSON.parse(raw);
    else cachedHabits = DEFAULT_HABITS;
  } catch {}
  return cachedHabits;
}

function saveHabits(habits: HabitItem[]) {
  cachedHabits = habits;
  cachedRawHabits = JSON.stringify(habits);
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(HABITS_KEY, cachedRawHabits);
      setTimeout(() => {
        window.dispatchEvent(new Event("todo-habits-changed"));
      }, 0);
    } catch {}
  }
}

function subscribeHabits(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("todo-habits-changed", cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener("todo-habits-changed", cb);
    window.removeEventListener("storage", cb);
  };
}

let cachedProfile: TodoHabitProfile = DEFAULT_PROFILE;
let cachedRawProfile: string | null = null;
function getCachedProfile(): TodoHabitProfile {
  if (typeof window === "undefined") return DEFAULT_PROFILE;
  try {
    const raw = window.localStorage.getItem(PROFILE_KEY);
    if (raw === cachedRawProfile) return cachedProfile;
    cachedRawProfile = raw;
    if (raw) cachedProfile = JSON.parse(raw);
    else cachedProfile = DEFAULT_PROFILE;
  } catch {}
  return cachedProfile;
}

function saveProfile(p: TodoHabitProfile) {
  cachedProfile = p;
  cachedRawProfile = JSON.stringify(p);
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(PROFILE_KEY, cachedRawProfile);
      setTimeout(() => {
        window.dispatchEvent(new Event("todo-profile-changed"));
      }, 0);
    } catch {}
  }
}

function subscribeProfile(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("todo-profile-changed", cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener("todo-profile-changed", cb);
    window.removeEventListener("storage", cb);
  };
}

const getServerTasks = () => DEFAULT_TASKS;
const getServerHabits = () => DEFAULT_HABITS;
const getServerProfile = () => DEFAULT_PROFILE;

export function useTodoHabits() {
  const tasks = useSyncExternalStore(subscribeTasks, getCachedTasks, getServerTasks);
  const habits = useSyncExternalStore(subscribeHabits, getCachedHabits, getServerHabits);
  const profile = useSyncExternalStore(subscribeProfile, getCachedProfile, getServerProfile);

  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);

  // --- Task Actions ---

  const addTask = useCallback(
    (title: string, priority: TaskPriority = "medium", estimatedPomodoros = 1, category = "General") => {
      if (!title.trim()) return;
      const newTask: TaskItem = {
        id: `task_${Date.now()}`,
        title: title.trim(),
        completed: false,
        priority,
        category,
        estimatedPomodoros: Math.max(1, estimatedPomodoros),
        completedPomodoros: 0,
        createdAt: Date.now(),
      };
      saveTasks([newTask, ...tasks]);
    },
    [tasks]
  );

  const toggleTask = useCallback(
    (taskId: string) => {
      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;

      const isNowCompleted = !task.completed;
      if (isNowCompleted) {
        todoHabitAudio.playCheckmarkSound();
        saveProfile({
          ...profile,
          totalTasksCompleted: profile.totalTasksCompleted + 1,
          totalBonusXP: profile.totalBonusXP + 25,
        });
      }

      const updated = tasks.map((t) =>
        t.id === taskId
          ? {
              ...t,
              completed: isNowCompleted,
              completedAt: isNowCompleted ? Date.now() : undefined,
            }
          : t
      );
      saveTasks(updated);
    },
    [tasks, profile]
  );

  const deleteTask = useCallback(
    (taskId: string) => {
      saveTasks(tasks.filter((t) => t.id !== taskId));
    },
    [tasks]
  );

  // --- Habit Actions ---

  const addHabit = useCallback(
    (
      name: string,
      type: HabitType = "build",
      category: HabitCategory = "mindset",
      targetMetric = "",
      icon = "⭐",
      color = "#f59e0b"
    ) => {
      if (!name.trim()) return;
      const newHabit: HabitItem = {
        id: `habit_${Date.now()}`,
        name: name.trim(),
        type,
        category,
        targetMetric: targetMetric.trim() || undefined,
        currentStreak: type === "quit" ? 1 : 0,
        bestStreak: type === "quit" ? 1 : 0,
        completedDates: [],
        quitStartDate: type === "quit" ? new Date().toISOString() : undefined,
        resistedUrges: 0,
        color,
        icon,
      };
      saveHabits([newHabit, ...habits]);
    },
    [habits]
  );

  const toggleHabitToday = useCallback(
    (habitId: string) => {
      const habit = habits.find((h) => h.id === habitId);
      if (!habit) return;

      const alreadyDoneToday = habit.completedDates.includes(todayStr);
      let updatedDates = habit.completedDates;
      let newStreak = habit.currentStreak;

      if (alreadyDoneToday) {
        // Uncheck
        updatedDates = habit.completedDates.filter((d) => d !== todayStr);
        newStreak = Math.max(0, habit.currentStreak - 1);
      } else {
        // Check off
        todoHabitAudio.playCheckmarkSound();
        updatedDates = [...habit.completedDates, todayStr];
        newStreak = habit.currentStreak + 1;

        saveProfile({
          ...profile,
          totalHabitCheckins: profile.totalHabitCheckins + 1,
          totalBonusXP: profile.totalBonusXP + 30,
        });
      }

      const updated = habits.map((h) =>
        h.id === habitId
          ? {
              ...h,
              completedDates: updatedDates,
              currentStreak: newStreak,
              bestStreak: Math.max(h.bestStreak, newStreak),
            }
          : h
      );
      saveHabits(updated);
    },
    [habits, profile, todayStr]
  );

  // For "quit" habits: resisting an urge awards shield sound + 40 XP!
  const resistBadHabitUrge = useCallback(
    (habitId: string) => {
      todoHabitAudio.playShieldSound();

      saveProfile({
        ...profile,
        totalUrgesResisted: profile.totalUrgesResisted + 1,
        totalBonusXP: profile.totalBonusXP + 40,
      });

      const updated = habits.map((h) =>
        h.id === habitId
          ? { ...h, resistedUrges: (h.resistedUrges || 0) + 1 }
          : h
      );
      saveHabits(updated);
    },
    [habits, profile]
  );

  const resetBadHabitQuitDate = useCallback(
    (habitId: string) => {
      const updated = habits.map((h) =>
        h.id === habitId
          ? {
              ...h,
              quitStartDate: new Date().toISOString(),
              currentStreak: 0,
            }
          : h
      );
      saveHabits(updated);
    },
    [habits]
  );

  const deleteHabit = useCallback(
    (habitId: string) => {
      saveHabits(habits.filter((h) => h.id !== habitId));
    },
    [habits]
  );

  // Adopt a full curated template pack
  const adoptTemplatePack = useCallback(
    (pack: HabitTemplatePack) => {
      todoHabitAudio.playStreakSound();

      // Add habits with unique ids
      const newHabitItems: HabitItem[] = pack.habits.map((h, idx) => ({
        ...h,
        id: `habit_${Date.now()}_${idx}`,
        currentStreak: h.type === "quit" ? 1 : 0,
        bestStreak: h.type === "quit" ? 1 : 0,
        completedDates: [],
        quitStartDate: h.type === "quit" ? new Date().toISOString() : undefined,
        resistedUrges: 0,
      }));

      // Add tasks with unique ids
      const newTaskItems: TaskItem[] = pack.tasks.map((t, idx) => ({
        ...t,
        id: `task_${Date.now()}_${idx}`,
        completed: false,
        createdAt: Date.now(),
      }));

      saveHabits([...newHabitItems, ...habits]);
      saveTasks([...newTaskItems, ...tasks]);

      saveProfile({
        ...profile,
        totalBonusXP: profile.totalBonusXP + 60,
      });
    },
    [habits, tasks, profile]
  );

  // Quick summary counts
  const tasksCompletedToday = useMemo(() => {
    return tasks.filter((t) => t.completed).length;
  }, [tasks]);

  const habitsDoneToday = useMemo(() => {
    return habits.filter((h) => h.completedDates.includes(todayStr)).length;
  }, [habits, todayStr]);

  const totalBuildHabits = useMemo(() => {
    return habits.filter((h) => h.type === "build").length;
  }, [habits]);

  return {
    tasks,
    habits,
    profile,
    todayStr,
    addTask,
    toggleTask,
    deleteTask,
    addHabit,
    toggleHabitToday,
    resistBadHabitUrge,
    resetBadHabitQuitDate,
    deleteHabit,
    adoptTemplatePack,
    tasksCompletedToday,
    habitsDoneToday,
    totalBuildHabits,
  };
}
