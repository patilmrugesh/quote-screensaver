"use client";

import { useState, useMemo } from "react";
import {
  Plus,
  Check,
  ChevronLeft,
  ChevronRight,
  Minus,
  Pencil,
  Trash2,
  Sparkles,
  Award,
  Calendar,
} from "lucide-react";
import {
  Goal,
  GoalTiming,
  CATEGORY_DETAILS,
  IMPORTANCE_POINTS,
} from "@/lib/goalTypes";
import { formatLocalDate } from "@/lib/goalCalculations";
import { useGoals } from "@/hooks/useGoals";

interface DailyGoalsTabProps {
  goalsHook: ReturnType<typeof useGoals>;
  onOpenCreateModal: (level: "daily") => void;
  onEditGoal: (goal: Goal) => void;
}

export default function DailyGoalsTab({
  goalsHook,
  onOpenCreateModal,
  onEditGoal,
}: DailyGoalsTabProps) {
  const {
    goals,
    deleteGoal,
    logProgress,
    setInstanceValue,
    getDailyExecution,
  } = goalsHook;

  const [selectedDate, setSelectedDate] = useState<string>(formatLocalDate());
  const [timingFilter, setTimingFilter] = useState<GoalTiming | "all">("all");

  const todayStr = formatLocalDate();
  const isToday = selectedDate === todayStr;

  // Navigate date
  const handleDateChange = (daysOffset: number) => {
    const current = new Date(selectedDate + "T12:00:00");
    current.setDate(current.getDate() + daysOffset);
    setSelectedDate(formatLocalDate(current));
  };

  // Get daily execution for current selected date
  const dailyExecution = useMemo(() => {
    return getDailyExecution(selectedDate);
  }, [getDailyExecution, selectedDate]);

  // Daily goals list
  const dailyGoals = useMemo(() => {
    return goals.filter((g) => g.level === "daily" && g.status === "active");
  }, [goals]);

  // Filtered daily goals
  const filteredGoals = useMemo(() => {
    if (timingFilter === "all") return dailyGoals;
    return dailyGoals.filter((g) => g.timing === timingFilter);
  }, [dailyGoals, timingFilter]);

  // Format nice display date
  const displayDateLabel = useMemo(() => {
    const dateObj = new Date(selectedDate + "T12:00:00");
    const options: Intl.DateTimeFormatOptions = {
      weekday: "short",
      month: "short",
      day: "numeric",
    };
    return dateObj.toLocaleDateString("en-US", options);
  }, [selectedDate]);

  return (
    <div className="space-y-6">
      {/* Top Hero: Daily Score & Date Controls */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5 sm:p-6 backdrop-blur-md relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          {/* Points & Score */}
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs uppercase tracking-wider text-amber-400/90 font-semibold flex items-center gap-1.5">
                <Award className="w-4 h-4" /> Daily Execution Score
              </span>
              {isToday && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-medium border border-emerald-500/30">
                  Today
                </span>
              )}
            </div>
            <div className="flex items-baseline gap-3">
              <span className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                {dailyExecution.scorePercentage}%
              </span>
              <span className="text-sm font-medium text-neutral-400">
                {dailyExecution.earnedPoints} / {dailyExecution.possiblePoints} pts earned
              </span>
            </div>
          </div>

          {/* Date Selector Navigation */}
          <div className="flex items-center gap-2 bg-neutral-900/80 border border-white/10 p-1 rounded-xl self-start sm:self-auto">
            <button
              onClick={() => handleDateChange(-1)}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Previous Day"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="px-3 py-1 text-xs font-semibold text-neutral-200 flex items-center gap-1.5 min-w-[120px] justify-center">
              <Calendar className="w-3.5 h-3.5 text-neutral-400" />
              {displayDateLabel}
            </div>
            <button
              onClick={() => handleDateChange(1)}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Next Day"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            {!isToday && (
              <button
                onClick={() => setSelectedDate(todayStr)}
                className="px-2 py-1 text-[11px] font-medium bg-amber-500/20 text-amber-300 rounded-lg hover:bg-amber-500/30 transition-colors ml-1"
              >
                Today
              </button>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-5">
          <div className="w-full h-2.5 bg-neutral-800 rounded-full overflow-hidden p-0.5 border border-white/5">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                dailyExecution.scorePercentage >= 90
                  ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                  : dailyExecution.scorePercentage >= 50
                  ? "bg-gradient-to-r from-amber-500 to-amber-300"
                  : "bg-gradient-to-r from-amber-600 to-amber-500"
              }`}
              style={{ width: `${dailyExecution.scorePercentage}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-neutral-400 mt-2 font-medium">
            <span>Minimum standard: 70%</span>
            <span>Target: 100% (+10 XP per pt)</span>
          </div>
        </div>
      </div>

      {/* Filter Chips & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Timing Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 custom-scrollbar">
          {(["all", "morning", "afternoon", "evening", "anytime"] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setTimingFilter(filter)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize whitespace-nowrap transition-all ${
                timingFilter === filter
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                  : "bg-white/5 text-neutral-400 border border-white/5 hover:text-white hover:bg-white/10"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Create Button */}
        <button
          onClick={() => onOpenCreateModal("daily")}
          className="px-4 py-2 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-neutral-950 flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/10 transition-all hover:scale-[1.02] active:scale-[0.98] self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add Daily Goal
        </button>
      </div>

      {/* Daily Goals List */}
      {filteredGoals.length === 0 ? (
        <div className="border border-dashed border-white/15 rounded-2xl p-10 text-center flex flex-col items-center justify-center bg-white/2">
          <div className="p-3 rounded-full bg-amber-500/10 text-amber-400 mb-3">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-white mb-1">No daily goals for this filter</h3>
          <p className="text-xs text-neutral-400 max-w-sm mb-4">
            Add recurring daily habits or execution commitments to track performance and earn XP.
          </p>
          <button
            onClick={() => onOpenCreateModal("daily")}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-amber-500 text-neutral-950 hover:bg-amber-400 transition-colors"
          >
            Create Goal
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Desktop Table Header */}
          <div className="hidden md:grid grid-cols-12 gap-3 px-4 py-2 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
            <div className="col-span-4">Goal & Category</div>
            <div className="col-span-2">Priority & Weight</div>
            <div className="col-span-3">Progress</div>
            <div className="col-span-2 text-center">Adjust</div>
            <div className="col-span-1 text-right">Actions</div>
          </div>

          {/* Goals Items */}
          {filteredGoals.map((goal) => {
            const inst = dailyExecution.instances.find((i) => i.goalId === goal.id);
            const actualValue = inst ? inst.actualValue : 0;
            const completionPct = inst ? inst.completionPercentage : 0;
            const earnedPts = inst ? inst.earnedPoints : 0;
            const possiblePts = IMPORTANCE_POINTS[goal.importance] || 2;
            const isCompleted = completionPct >= 100;
            const catDetails = CATEGORY_DETAILS[goal.category] || CATEGORY_DETAILS.general;

            return (
              <div
                key={goal.id}
                className={`bg-neutral-900/70 border rounded-2xl p-4 transition-all duration-200 ${
                  isCompleted
                    ? "border-emerald-500/30 bg-emerald-500/[0.03]"
                    : "border-white/10 hover:border-white/20"
                }`}
              >
                {/* Desktop Grid Layout */}
                <div className="hidden md:grid grid-cols-12 gap-3 items-center">
                  {/* Col 1: Goal info */}
                  <div className="col-span-4 flex items-center gap-3">
                    <button
                      onClick={() => {
                        const nextVal = isCompleted ? 0 : goal.targetValue;
                        setInstanceValue(goal.id, nextVal, selectedDate);
                      }}
                      className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all ${
                        isCompleted
                          ? "bg-emerald-500 border-emerald-400 text-neutral-950"
                          : "border-white/20 hover:border-amber-400 text-transparent"
                      }`}
                      title={isCompleted ? "Mark incomplete" : "Quick complete"}
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </button>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-semibold truncate ${isCompleted ? "text-neutral-300 line-through opacity-80" : "text-white"}`}>
                          {goal.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-[10px] px-2 py-0.5 rounded-md font-medium border ${catDetails.bg} ${catDetails.color} ${catDetails.border}`}>
                          {catDetails.label}
                        </span>
                        <span className="text-[11px] text-neutral-400 capitalize">
                          {goal.timing}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Col 2: Importance & Points */}
                  <div className="col-span-2">
                    <span
                      className={`text-[11px] px-2.5 py-1 rounded-lg font-semibold inline-flex items-center gap-1.5 border ${
                        goal.importance === "critical"
                          ? "bg-rose-500/15 border-rose-500/30 text-rose-300"
                          : goal.importance === "high"
                          ? "bg-amber-500/15 border-amber-500/30 text-amber-300"
                          : "bg-blue-500/15 border-blue-500/30 text-blue-300"
                      }`}
                    >
                      <span className="capitalize">{goal.importance}</span>
                      <span className="opacity-80">({earnedPts}/{possiblePts} pts)</span>
                    </span>
                  </div>

                  {/* Col 3: Progress Bar */}
                  <div className="col-span-3">
                    <div className="flex items-center justify-between text-xs font-semibold mb-1">
                      <span className="text-white">
                        {actualValue} / {goal.targetValue}{" "}
                        <span className="text-[11px] font-normal text-neutral-400">{goal.unit}</span>
                      </span>
                      <span className={isCompleted ? "text-emerald-400 font-bold" : "text-neutral-400"}>
                        {completionPct}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden border border-white/5">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isCompleted ? "bg-emerald-400" : "bg-amber-400"
                        }`}
                        style={{ width: `${Math.min(100, completionPct)}%` }}
                      />
                    </div>
                  </div>

                  {/* Col 4: Inline Stepper */}
                  <div className="col-span-2 flex items-center justify-center gap-1.5">
                    <button
                      onClick={() => logProgress(goal.id, -1, selectedDate)}
                      disabled={actualValue <= 0}
                      className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-neutral-300 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-all active:scale-95"
                      title="Decrease by 1"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <input
                      type="number"
                      min={0}
                      value={actualValue}
                      onChange={(e) => setInstanceValue(goal.id, Number(e.target.value) || 0, selectedDate)}
                      className="w-12 h-8 text-center bg-white/5 border border-white/10 rounded-lg text-xs font-semibold text-white focus:outline-none focus:border-amber-500/60"
                    />
                    <button
                      onClick={() => logProgress(goal.id, 1, selectedDate)}
                      className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-neutral-300 hover:text-white hover:bg-white/10 transition-all active:scale-95"
                      title="Increase by 1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Col 5: Actions */}
                  <div className="col-span-1 flex items-center justify-end gap-1">
                    <button
                      onClick={() => onEditGoal(goal)}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
                      title="Edit Goal"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete "${goal.name}"?`)) {
                          deleteGoal(goal.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Delete Goal"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Mobile Card Layout */}
                <div className="md:hidden space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5">
                      <button
                        onClick={() => {
                          const nextVal = isCompleted ? 0 : goal.targetValue;
                          setInstanceValue(goal.id, nextVal, selectedDate);
                        }}
                        className={`w-6 h-6 rounded-lg flex items-center justify-center border mt-0.5 transition-all shrink-0 ${
                          isCompleted
                            ? "bg-emerald-500 border-emerald-400 text-neutral-950"
                            : "border-white/20 text-transparent"
                        }`}
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </button>
                      <div>
                        <h4 className={`text-sm font-semibold ${isCompleted ? "text-neutral-300 line-through" : "text-white"}`}>
                          {goal.name}
                        </h4>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1">
                          <span className={`text-[10px] px-2 py-0.5 rounded-md font-medium border ${catDetails.bg} ${catDetails.color} ${catDetails.border}`}>
                            {catDetails.label}
                          </span>
                          <span className="text-[10px] text-neutral-400 capitalize">
                            {goal.timing}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onEditGoal(goal)}
                        className="p-1 rounded-lg text-neutral-400 hover:text-white"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete "${goal.name}"?`)) {
                            deleteGoal(goal.id);
                          }
                        }}
                        className="p-1 rounded-lg text-neutral-400 hover:text-rose-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Mobile Progress Bar */}
                  <div>
                    <div className="flex items-center justify-between text-xs font-semibold mb-1">
                      <span className="text-white">
                        {actualValue} / {goal.targetValue} {goal.unit}
                      </span>
                      <span className={isCompleted ? "text-emerald-400" : "text-neutral-400"}>
                        {completionPct}% ({earnedPts}/{possiblePts} pts)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${isCompleted ? "bg-emerald-400" : "bg-amber-400"}`}
                        style={{ width: `${Math.min(100, completionPct)}%` }}
                      />
                    </div>
                  </div>

                  {/* Mobile Stepper Controls */}
                  <div className="flex items-center justify-end gap-2 pt-1 border-t border-white/5">
                    <button
                      onClick={() => logProgress(goal.id, -1, selectedDate)}
                      disabled={actualValue <= 0}
                      className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-medium text-white disabled:opacity-30"
                    >
                      -1
                    </button>
                    <span className="text-xs font-semibold text-white px-2">
                      {actualValue}
                    </span>
                    <button
                      onClick={() => logProgress(goal.id, 1, selectedDate)}
                      className="px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-xs font-semibold text-amber-300"
                    >
                      +1 {goal.unit}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
