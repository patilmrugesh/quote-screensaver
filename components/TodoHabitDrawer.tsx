"use client";

import { useState } from "react";
import {
  X,
  CheckSquare,
  Shield,
  Sparkles,
  BarChart2,
  Plus,
  Trash2,
  Flame,
  Check,
  Timer,
  RotateCcw,
} from "lucide-react";
import {
  TaskPriority,
  HabitType,
  HabitCategory,
} from "@/lib/todoHabitTypes";
import { CURATED_TEMPLATES, useTodoHabits } from "@/hooks/useTodoHabits";

interface TodoHabitDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  todoHabits: ReturnType<typeof useTodoHabits>;
  onStartPomodoroForTask: (taskTitle: string) => void;
}

type TabType = "habits" | "tasks" | "templates" | "analytics";
type TaskFilter = "all" | "pending" | "completed";
type HabitFilter = "all" | "build" | "quit";

export default function TodoHabitDrawer({
  isOpen,
  onClose,
  todoHabits,
  onStartPomodoroForTask,
}: TodoHabitDrawerProps) {
  const [activeTab, setActiveTab] = useState<TabType>("habits");

  // Task form state
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>("medium");
  const [newTaskPomodoros, setNewTaskPomodoros] = useState(1);
  const [taskFilter, setTaskFilter] = useState<TaskFilter>("all");

  // Habit form state
  const [isAddingHabit, setIsAddingHabit] = useState(false);
  const [habitFilter, setHabitFilter] = useState<HabitFilter>("all");
  const [newHabitName, setNewHabitName] = useState("");
  const [newHabitType, setNewHabitType] = useState<HabitType>("build");
  const [newHabitCategory, setNewHabitCategory] = useState<HabitCategory>("reading");
  const [newHabitMetric, setNewHabitMetric] = useState("");
  const [newHabitIcon, setNewHabitIcon] = useState("📖");

  const {
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
  } = todoHabits;

  if (!isOpen) return null;

  // Handle task submission
  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    addTask(newTaskTitle, newTaskPriority, newTaskPomodoros);
    setNewTaskTitle("");
    setNewTaskPomodoros(1);
  };

  // Handle habit submission
  const handleCreateHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;
    addHabit(
      newHabitName,
      newHabitType,
      newHabitCategory,
      newHabitMetric,
      newHabitIcon,
      newHabitType === "quit" ? "#ef4444" : "#f59e0b"
    );
    setNewHabitName("");
    setNewHabitMetric("");
    setIsAddingHabit(false);
  };

  // Filtered tasks
  const filteredTasks = tasks.filter((t) => {
    if (taskFilter === "pending") return !t.completed;
    if (taskFilter === "completed") return t.completed;
    return true;
  });

  // Filtered habits
  const filteredHabits = habits.filter((h) => {
    if (habitFilter === "build") return h.type === "build";
    if (habitFilter === "quit") return h.type === "quit";
    return true;
  });

  // Calculate days clean for quit habits (pure UTC calculation)
  const getDaysClean = (quitStartDate?: string) => {
    if (!quitStartDate) return 1;
    try {
      const startDateStr = quitStartDate.split("T")[0];
      const [y1, m1, d1] = startDateStr.split("-").map(Number);
      const [y2, m2, d2] = todayStr.split("-").map(Number);
      const date1 = Date.UTC(y1, m1 - 1, d1);
      const date2 = Date.UTC(y2, m2 - 1, d2);
      const days = Math.floor((date2 - date1) / (1000 * 3600 * 24));
      return Math.max(1, days);
    } catch {
      return 1;
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Slide-over Drawer */}
      <aside
        role="dialog"
        aria-label="Tasks and Habit Tracker"
        className="fixed right-0 top-0 z-50 flex h-screen w-[520px] max-w-[94vw] flex-col border-l border-white/15 bg-neutral-900/98 text-neutral-100 shadow-2xl backdrop-blur-2xl transition-transform duration-300 select-none"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-400/20 text-amber-300">
              <CheckSquare size={18} />
            </div>
            <div>
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-neutral-100">
                Tasks & Habit Tracker
              </h2>
              <span className="text-[11px] font-medium text-neutral-400">
                {habitsDoneToday}/{totalBuildHabits} Habits Done Today • +{profile.totalBonusXP} XP
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close drawer"
            className="rounded-full p-1.5 text-neutral-400 transition hover:bg-white/10 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-white/10 bg-neutral-950/40 px-4 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab("habits")}
            className={`flex items-center gap-1.5 border-b-2 px-3.5 py-3 transition ${
              activeTab === "habits"
                ? "border-amber-400 text-amber-300"
                : "border-transparent text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <Flame size={14} />
            <span>Habits & Breaker</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("tasks")}
            className={`flex items-center gap-1.5 border-b-2 px-3.5 py-3 transition ${
              activeTab === "tasks"
                ? "border-amber-400 text-amber-300"
                : "border-transparent text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <CheckSquare size={14} />
            <span>To-Do ({tasks.filter((t) => !t.completed).length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("templates")}
            className={`flex items-center gap-1.5 border-b-2 px-3.5 py-3 transition ${
              activeTab === "templates"
                ? "border-amber-400 text-amber-300"
                : "border-transparent text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <Sparkles size={14} />
            <span>Routines</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("analytics")}
            className={`flex items-center gap-1.5 border-b-2 px-3.5 py-3 transition ${
              activeTab === "analytics"
                ? "border-amber-400 text-amber-300"
                : "border-transparent text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <BarChart2 size={14} />
            <span>Progress</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* TAB 1: HABITS & BAD HABIT BREAKER */}
          {activeTab === "habits" && (
            <div className="space-y-6">
              {/* Header & Filter Controls */}
              <div className="flex items-center justify-between">
                <div className="flex gap-1.5 rounded-lg border border-white/10 bg-neutral-800/60 p-1 text-[11px] font-medium">
                  <button
                    type="button"
                    onClick={() => setHabitFilter("all")}
                    className={`rounded-md px-2.5 py-1 transition ${
                      habitFilter === "all"
                        ? "bg-amber-400 text-neutral-950 font-bold"
                        : "text-neutral-400 hover:text-white"
                    }`}
                  >
                    All ({habits.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setHabitFilter("build")}
                    className={`rounded-md px-2.5 py-1 transition ${
                      habitFilter === "build"
                        ? "bg-amber-400 text-neutral-950 font-bold"
                        : "text-neutral-400 hover:text-white"
                    }`}
                  >
                    Good Habits
                  </button>
                  <button
                    type="button"
                    onClick={() => setHabitFilter("quit")}
                    className={`rounded-md px-2.5 py-1 transition ${
                      habitFilter === "quit"
                        ? "bg-rose-500 text-white font-bold"
                        : "text-neutral-400 hover:text-white"
                    }`}
                  >
                    Bad Habits
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAddingHabit((prev) => !prev)}
                  className="flex items-center gap-1 rounded-lg border border-white/15 bg-white/5 px-2.5 py-1 text-xs font-semibold text-neutral-200 transition hover:bg-white/15 hover:text-white"
                >
                  <Plus size={13} />
                  <span>{isAddingHabit ? "Cancel" : "Add Habit"}</span>
                </button>
              </div>

              {/* Add Custom Habit Form */}
              {isAddingHabit && (
                <form
                  onSubmit={handleCreateHabit}
                  className="rounded-2xl border border-amber-400/30 bg-neutral-800/90 p-4 shadow-xl space-y-3"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-amber-300 uppercase tracking-wider">
                    <span>Create Custom Habit</span>
                  </div>

                  <div>
                    <label className="mb-1 block text-[11px] text-neutral-300">Habit Name</label>
                    <input
                      type="text"
                      value={newHabitName}
                      onChange={(e) => setNewHabitName(e.target.value)}
                      placeholder="e.g. Read 30 pages, Walk 10k steps, No sugary soda..."
                      autoFocus
                      className="w-full rounded-lg border border-white/15 bg-neutral-900 px-3 py-2 text-xs text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-amber-400"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2.5">
                    <div>
                      <label className="mb-1 block text-[11px] text-neutral-300">Type</label>
                      <select
                        value={newHabitType}
                        onChange={(e) => setNewHabitType(e.target.value as HabitType)}
                        className="w-full rounded-lg border border-white/15 bg-neutral-900 px-2 py-1.5 text-xs text-neutral-100 focus:outline-none focus:ring-1 focus:ring-amber-400"
                      >
                        <option value="build">Good Habit (Daily)</option>
                        <option value="quit">Quit Bad Habit</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-1 block text-[11px] text-neutral-300">Category</label>
                      <select
                        value={newHabitCategory}
                        onChange={(e) => {
                          const cat = e.target.value as HabitCategory;
                          setNewHabitCategory(cat);
                          const icons: Record<HabitCategory, string> = {
                            reading: "📖",
                            fitness: "🏃",
                            mindset: "🧘",
                            health: "🥗",
                            productivity: "⚡",
                            discipline: "🛡️",
                          };
                          setNewHabitIcon(icons[cat] || "⭐");
                        }}
                        className="w-full rounded-lg border border-white/15 bg-neutral-900 px-2 py-1.5 text-xs text-neutral-100 focus:outline-none focus:ring-1 focus:ring-amber-400"
                      >
                        <option value="reading">📖 Reading</option>
                        <option value="fitness">🏃 Fitness</option>
                        <option value="mindset">🧘 Mindset</option>
                        <option value="health">🥗 Health</option>
                        <option value="productivity">⚡ Focus</option>
                        <option value="discipline">🛡️ Willpower</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-1 block text-[11px] text-neutral-300">Target Goal</label>
                      <input
                        type="text"
                        value={newHabitMetric}
                        onChange={(e) => setNewHabitMetric(e.target.value)}
                        placeholder="e.g. 20 pages"
                        className="w-full rounded-lg border border-white/15 bg-neutral-900 px-2 py-1.5 text-xs text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-amber-400"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsAddingHabit(false)}
                      className="rounded-lg px-3 py-1.5 text-xs font-semibold text-neutral-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="rounded-lg bg-amber-400 px-4 py-1.5 text-xs font-bold text-neutral-950 transition hover:bg-amber-300"
                    >
                      Save Habit
                    </button>
                  </div>
                </form>
              )}

              {/* Habit Cards List */}
              <div className="space-y-3">
                {filteredHabits.length === 0 ? (
                  <div className="flex h-40 flex-col items-center justify-center text-center text-neutral-400">
                    <Flame size={32} className="mb-2 opacity-30 text-amber-400" />
                    <p className="text-xs font-medium">No habits yet in this filter.</p>
                    <p className="text-[11px] text-neutral-500">
                      Add a custom habit above or adopt a pre-built routine in the Routines tab!
                    </p>
                  </div>
                ) : (
                  filteredHabits.map((habit) => {
                    const isDoneToday = habit.completedDates.includes(todayStr);

                    // QUIT BAD HABIT CARD
                    if (habit.type === "quit") {
                      const daysClean = getDaysClean(habit.quitStartDate);
                      return (
                        <div
                          key={habit.id}
                          className="group relative rounded-2xl border border-rose-500/25 bg-gradient-to-br from-rose-950/30 to-neutral-900/90 p-4 transition hover:border-rose-500/40 hover:bg-neutral-850"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2.5">
                              <span className="text-2xl">{habit.icon}</span>
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs font-bold text-neutral-100">
                                    {habit.name}
                                  </span>
                                  <span className="rounded-full bg-rose-500/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-rose-300">
                                    Quit Mode
                                  </span>
                                </div>
                                <span className="text-[11px] font-medium text-neutral-400">
                                  {habit.targetMetric || "Zero tolerance"}
                                </span>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => deleteHabit(habit.id)}
                              aria-label="Delete habit"
                              className="rounded-md p-1 text-neutral-500 opacity-0 transition group-hover:opacity-100 hover:text-rose-400"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>

                          {/* Days Clean Odometer Counter */}
                          <div className="mt-3.5 flex items-center justify-between rounded-xl border border-rose-500/20 bg-rose-950/40 p-3">
                            <div className="flex items-center gap-2">
                              <Shield size={18} className="text-rose-400" />
                              <div>
                                <div className="font-mono text-base font-extrabold text-white">
                                  {daysClean} {daysClean === 1 ? "Day" : "Days"} Clean
                                </div>
                                <span className="text-[10px] text-neutral-400">
                                  {habit.resistedUrges || 0} cravings successfully defeated
                                </span>
                              </div>
                            </div>

                            {/* Resisted Urge Willpower Button */}
                            <button
                              type="button"
                              onClick={() => resistBadHabitUrge(habit.id)}
                              className="flex items-center gap-1 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-bold text-white shadow-lg transition hover:bg-rose-500 active:scale-95"
                            >
                              <Shield size={13} />
                              <span>Resisted! (+40 XP)</span>
                            </button>
                          </div>

                          <div className="mt-2 flex justify-end">
                            <button
                              type="button"
                              onClick={() => resetBadHabitQuitDate(habit.id)}
                              className="flex items-center gap-1 text-[10px] text-neutral-500 hover:text-neutral-300"
                            >
                              <RotateCcw size={10} />
                              <span>Relapsed? Reset timer</span>
                            </button>
                          </div>
                        </div>
                      );
                    }

                    // BUILD GOOD HABIT CARD
                    return (
                      <div
                        key={habit.id}
                        className={`group flex items-center justify-between rounded-2xl border p-3.5 transition ${
                          isDoneToday
                            ? "border-emerald-500/30 bg-emerald-950/20"
                            : "border-white/10 bg-neutral-800/40 hover:border-white/20 hover:bg-neutral-800/70"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {/* Circular Completion Button */}
                          <button
                            type="button"
                            onClick={() => toggleHabitToday(habit.id)}
                            className={`flex h-8 w-8 items-center justify-center rounded-full border transition-all duration-300 ${
                              isDoneToday
                                ? "border-emerald-500 bg-emerald-500 text-neutral-950 shadow-md scale-105"
                                : "border-white/20 bg-neutral-800 hover:border-amber-400 hover:scale-105"
                            }`}
                          >
                            {isDoneToday ? <Check size={16} className="stroke-[3]" /> : null}
                          </button>

                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-base">{habit.icon}</span>
                              <span
                                className={`text-xs font-semibold transition ${
                                  isDoneToday
                                    ? "text-neutral-300 line-through opacity-80"
                                    : "text-neutral-100"
                                }`}
                              >
                                {habit.name}
                              </span>
                            </div>

                            <div className="mt-0.5 flex items-center gap-2 text-[11px] text-neutral-400">
                              {habit.targetMetric && (
                                <span className="rounded bg-white/5 px-1.5 py-0.2 font-mono text-[10px] text-amber-300">
                                  {habit.targetMetric}
                                </span>
                              )}
                              <span>Target: Daily</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {/* Streak Counter */}
                          <div className="flex items-center gap-1 rounded-full border border-amber-400/20 bg-amber-400/10 px-2.5 py-1 text-xs font-bold text-amber-300">
                            <Flame size={13} className="fill-amber-400 text-amber-400" />
                            <span>{habit.currentStreak}d</span>
                          </div>

                          <button
                            type="button"
                            onClick={() => deleteHabit(habit.id)}
                            aria-label="Delete habit"
                            className="rounded-md p-1 text-neutral-500 opacity-0 transition group-hover:opacity-100 hover:text-rose-400"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 2: TO-DO TASKS */}
          {activeTab === "tasks" && (
            <div className="space-y-5">
              {/* Quick Add Task Form */}
              <form
                onSubmit={handleCreateTask}
                className="rounded-2xl border border-white/10 bg-neutral-800/70 p-4 space-y-3"
              >
                <div>
                  <input
                    type="text"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="Add a new task..."
                    className="w-full rounded-xl border border-white/10 bg-neutral-900 px-3.5 py-2.5 text-xs text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-amber-400"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {/* Priority Selector */}
                    <select
                      value={newTaskPriority}
                      onChange={(e) =>
                        setNewTaskPriority(e.target.value as TaskPriority)
                      }
                      className="rounded-lg border border-white/10 bg-neutral-900 px-2 py-1.5 text-xs text-neutral-200 focus:outline-none focus:ring-1 focus:ring-amber-400"
                    >
                      <option value="urgent">🔴 Urgent</option>
                      <option value="high">🟠 High</option>
                      <option value="medium">🟡 Medium</option>
                      <option value="low">⚪ Low</option>
                    </select>

                    {/* Estimated Pomodoros */}
                    <div className="flex items-center gap-1 text-xs text-neutral-400">
                      <span>🍅</span>
                      <input
                        type="number"
                        min={1}
                        max={8}
                        value={newTaskPomodoros}
                        onChange={(e) =>
                          setNewTaskPomodoros(
                            Math.max(1, parseInt(e.target.value) || 1)
                          )
                        }
                        className="w-12 rounded-lg border border-white/10 bg-neutral-900 px-2 py-1 text-center font-mono text-xs text-neutral-100 focus:outline-none focus:ring-1 focus:ring-amber-400"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="rounded-xl bg-amber-400 px-4 py-1.5 text-xs font-bold text-neutral-950 transition hover:bg-amber-300 active:scale-95"
                  >
                    Add Task
                  </button>
                </div>
              </form>

              {/* Task Filters */}
              <div className="flex items-center justify-between">
                <div className="flex gap-1.5 rounded-lg border border-white/10 bg-neutral-800/60 p-1 text-[11px] font-medium">
                  <button
                    type="button"
                    onClick={() => setTaskFilter("all")}
                    className={`rounded-md px-2.5 py-1 transition ${
                      taskFilter === "all"
                        ? "bg-amber-400 text-neutral-950 font-bold"
                        : "text-neutral-400 hover:text-white"
                    }`}
                  >
                    All ({tasks.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setTaskFilter("pending")}
                    className={`rounded-md px-2.5 py-1 transition ${
                      taskFilter === "pending"
                        ? "bg-amber-400 text-neutral-950 font-bold"
                        : "text-neutral-400 hover:text-white"
                    }`}
                  >
                    Pending ({tasks.filter((t) => !t.completed).length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setTaskFilter("completed")}
                    className={`rounded-md px-2.5 py-1 transition ${
                      taskFilter === "completed"
                        ? "bg-amber-400 text-neutral-950 font-bold"
                        : "text-neutral-400 hover:text-white"
                    }`}
                  >
                    Done ({tasksCompletedToday})
                  </button>
                </div>
              </div>

              {/* Task List */}
              <div className="space-y-2.5">
                {filteredTasks.length === 0 ? (
                  <div className="flex h-40 flex-col items-center justify-center text-center text-neutral-400">
                    <CheckSquare size={32} className="mb-2 opacity-30 text-amber-400" />
                    <p className="text-xs font-medium">No tasks found.</p>
                  </div>
                ) : (
                  filteredTasks.map((task) => {
                    const priorityColor =
                      task.priority === "urgent"
                        ? "bg-rose-500/20 text-rose-300 border-rose-500/30"
                        : task.priority === "high"
                        ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                        : task.priority === "medium"
                        ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
                        : "bg-neutral-700/40 text-neutral-300 border-white/10";

                    return (
                      <div
                        key={task.id}
                        className={`group flex items-center justify-between rounded-2xl border p-3 transition ${
                          task.completed
                            ? "border-white/5 bg-neutral-900/40 opacity-60"
                            : "border-white/10 bg-neutral-800/40 hover:border-white/20 hover:bg-neutral-800"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => toggleTask(task.id)}
                            className={`flex h-5 w-5 items-center justify-center rounded-md border transition ${
                              task.completed
                                ? "border-emerald-400 bg-emerald-400 text-neutral-950"
                                : "border-white/20 hover:border-amber-400"
                            }`}
                          >
                            {task.completed && <Check size={13} className="stroke-[3]" />}
                          </button>

                          <div>
                            <span
                              className={`text-xs font-medium transition ${
                                task.completed ? "line-through text-neutral-400" : "text-neutral-100"
                              }`}
                            >
                              {task.title}
                            </span>
                            <div className="mt-0.5 flex items-center gap-2">
                              <span
                                className={`rounded border px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider ${priorityColor}`}
                              >
                                {task.priority}
                              </span>
                              <span className="text-[10px] text-neutral-400">
                                🍅 {task.estimatedPomodoros} blocks
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {!task.completed && (
                            <button
                              type="button"
                              title="Start Pomodoro on this task"
                              onClick={() => {
                                onStartPomodoroForTask(task.title);
                                onClose();
                              }}
                              className="flex items-center gap-1 rounded-lg border border-rose-500/30 bg-rose-500/10 px-2 py-1 text-[11px] font-bold text-rose-300 transition hover:bg-rose-500 hover:text-white"
                            >
                              <Timer size={12} />
                              <span>Focus</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => deleteTask(task.id)}
                            aria-label="Delete task"
                            className="rounded-md p-1 text-neutral-500 opacity-0 transition group-hover:opacity-100 hover:text-rose-400"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 3: LIFE-CHANGING CURATED TEMPLATES */}
          {activeTab === "templates" && (
            <div className="space-y-5">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                  Curated Routine Packs
                </span>
                <p className="text-[11px] text-neutral-400">
                  Pre-built systems adopted by top thinkers and athletes. Click adopt to load habits and tasks into your daily tracker.
                </p>
              </div>

              <div className="space-y-4">
                {CURATED_TEMPLATES.map((pack) => (
                  <div
                    key={pack.id}
                    className="rounded-2xl border border-white/10 bg-neutral-800/50 p-4 transition hover:border-amber-400/30 hover:bg-neutral-800/80"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl">{pack.icon}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-xs font-bold text-neutral-100">
                              {pack.title}
                            </h3>
                            <span className="rounded-full bg-amber-400/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-300">
                              {pack.badge}
                            </span>
                          </div>
                          <span className="text-[11px] font-medium text-neutral-400">
                            {pack.subtitle}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => adoptTemplatePack(pack)}
                        className="rounded-xl bg-amber-400 px-3 py-1.5 text-xs font-bold text-neutral-950 shadow-md transition hover:bg-amber-300 active:scale-95"
                      >
                        Adopt Pack (+60 XP)
                      </button>
                    </div>

                    <p className="mt-2.5 text-xs leading-relaxed text-neutral-300">
                      {pack.description}
                    </p>

                    {/* Habits in this pack */}
                    <div className="mt-3 border-t border-white/5 pt-2.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                        Includes Habits:
                      </span>
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        {pack.habits.map((h, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-black/30 px-2 py-0.5 text-[10px] text-neutral-200"
                          >
                            <span>{h.icon}</span>
                            <span>{h.name}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: ANALYTICS & STATS */}
          {activeTab === "analytics" && (
            <div className="space-y-6">
              {/* Top Stats Grid */}
              <div className="grid grid-cols-2 gap-3.5">
                <div className="rounded-2xl border border-white/10 bg-neutral-800/60 p-4 text-center">
                  <CheckSquare size={22} className="mx-auto mb-1 text-emerald-400" />
                  <span className="font-mono text-2xl font-black text-neutral-100">
                    {profile.totalTasksCompleted}
                  </span>
                  <span className="mt-1 block text-[11px] font-medium uppercase tracking-wider text-neutral-400">
                    Tasks Completed
                  </span>
                </div>

                <div className="rounded-2xl border border-white/10 bg-neutral-800/60 p-4 text-center">
                  <Flame size={22} className="mx-auto mb-1 text-amber-400" />
                  <span className="font-mono text-2xl font-black text-neutral-100">
                    {profile.totalHabitCheckins}
                  </span>
                  <span className="mt-1 block text-[11px] font-medium uppercase tracking-wider text-neutral-400">
                    Habit Check-ins
                  </span>
                </div>

                <div className="rounded-2xl border border-white/10 bg-neutral-800/60 p-4 text-center">
                  <Shield size={22} className="mx-auto mb-1 text-rose-500" />
                  <span className="font-mono text-2xl font-black text-neutral-100">
                    {profile.totalUrgesResisted}
                  </span>
                  <span className="mt-1 block text-[11px] font-medium uppercase tracking-wider text-neutral-400">
                    Bad Urges Defeated
                  </span>
                </div>

                <div className="rounded-2xl border border-white/10 bg-neutral-800/60 p-4 text-center">
                  <Sparkles size={22} className="mx-auto mb-1 text-amber-300" />
                  <span className="font-mono text-2xl font-black text-amber-300">
                    +{profile.totalBonusXP}
                  </span>
                  <span className="mt-1 block text-[11px] font-medium uppercase tracking-wider text-neutral-400">
                    Productivity XP
                  </span>
                </div>
              </div>

              {/* Life Advice / Motivation */}
              <div className="rounded-2xl border border-amber-400/20 bg-amber-400/5 p-4">
                <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                  The Power of Tiny Habits
                </h4>
                <p className="mt-1 text-xs leading-relaxed text-neutral-300">
                  &ldquo;You do not rise to the level of your goals. You fall to the level of your systems.&rdquo; — James Clear.
                  Focusing on just 20 pages a day, 10,000 steps, or resisting one craving rewires your neurochemistry into an unstoppable identity.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-white/10 bg-neutral-950/40 px-6 py-3.5">
          <span className="text-[11px] text-neutral-400">
            Press <kbd className="rounded border border-white/20 bg-neutral-800 px-1 py-0.5 font-mono text-[10px] text-amber-300">K</kbd> anytime to toggle
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-neutral-800 px-4 py-1.5 text-xs font-semibold text-neutral-200 transition hover:bg-neutral-700 hover:text-white"
          >
            Close
          </button>
        </div>
      </aside>
    </>
  );
}
