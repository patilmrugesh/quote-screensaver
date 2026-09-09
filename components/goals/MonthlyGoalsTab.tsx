"use client";

import { useMemo } from "react";
import {
  Plus,
  Minus,
  Calendar,
  AlertCircle,
  CheckCircle2,
  PieChart,
  Pencil,
  Trash2,
} from "lucide-react";
import {
  Goal,
  GoalCategory,
  CATEGORY_DETAILS,
} from "@/lib/goalTypes";
import { getMonthKey } from "@/lib/goalCalculations";
import { useGoals } from "@/hooks/useGoals";

interface MonthlyGoalsTabProps {
  goalsHook: ReturnType<typeof useGoals>;
  onOpenCreateModal: (level: "monthly") => void;
  onEditGoal: (goal: Goal) => void;
}

export default function MonthlyGoalsTab({
  goalsHook,
  onOpenCreateModal,
  onEditGoal,
}: MonthlyGoalsTabProps) {
  const {
    goals,
    instances,
    deleteGoal,
    setInstanceValue,
    logProgress,
  } = goalsHook;

  const currentMonthKey = useMemo(() => getMonthKey(), []);

  // Compute day of month trajectory
  const monthTrajectory = useMemo(() => {
    const now = new Date();
    const day = now.getDate();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const elapsedPercentage = Math.round((day / daysInMonth) * 100);
    const monthName = now.toLocaleString("en-US", { month: "long", year: "numeric" });
    return {
      day,
      daysInMonth,
      elapsedPercentage,
      monthName,
    };
  }, []);

  // Monthly goals
  const monthlyGoals = useMemo(() => {
    return goals.filter((g) => g.level === "monthly" && g.status === "active");
  }, [goals]);

  // Category breakdown calculation
  const categoryBreakdown = useMemo(() => {
    const counts: Record<GoalCategory, { total: number; completed: number }> = {
      learning: { total: 0, completed: 0 },
      coding: { total: 0, completed: 0 },
      career: { total: 0, completed: 0 },
      fitness: { total: 0, completed: 0 },
      mindfulness: { total: 0, completed: 0 },
      general: { total: 0, completed: 0 },
    };

    for (const g of monthlyGoals) {
      const inst = instances.find((i) => i.goalId === g.id && i.periodKey === currentMonthKey);
      const isDone = inst ? inst.completionPercentage >= 100 : false;
      counts[g.category].total += 1;
      if (isDone) counts[g.category].completed += 1;
    }

    return counts;
  }, [monthlyGoals, instances, currentMonthKey]);

  return (
    <div className="space-y-6">
      {/* 1. Month Header & Trajectory */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5 sm:p-6 backdrop-blur-md relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs uppercase tracking-wider text-amber-400 font-semibold flex items-center gap-1.5">
                <Calendar className="w-4 h-4" /> Monthly Milestones
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-neutral-300 font-mono">
                {monthTrajectory.monthName}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Day {monthTrajectory.day} of {monthTrajectory.daysInMonth}
            </h2>
            <p className="text-xs text-neutral-400 mt-1">
              Month is {monthTrajectory.elapsedPercentage}% elapsed. Check trajectory risk below.
            </p>
          </div>

          <button
            onClick={() => onOpenCreateModal("monthly")}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-neutral-950 flex items-center gap-1.5 transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> Add Monthly Milestone
          </button>
        </div>

        {/* Elapsed Month Trajectory Bar */}
        <div className="mt-5">
          <div className="flex justify-between text-[11px] text-neutral-400 font-medium mb-1.5">
            <span>Time Elapsed: {monthTrajectory.elapsedPercentage}%</span>
            <span>Target Milestone Pace</span>
          </div>
          <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500/60 rounded-full transition-all duration-300"
              style={{ width: `${monthTrajectory.elapsedPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. Category Distribution */}
      <div className="bg-neutral-900/60 border border-white/10 rounded-2xl p-4 sm:p-5">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5 mb-3">
          <PieChart className="w-3.5 h-3.5 text-amber-400" /> Milestone Distribution by Category
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
          {(Object.keys(CATEGORY_DETAILS) as GoalCategory[]).map((catKey) => {
            const data = categoryBreakdown[catKey];
            const details = CATEGORY_DETAILS[catKey];
            return (
              <div
                key={catKey}
                className={`p-3 rounded-xl border ${details.bg} ${details.border} flex flex-col justify-between`}
              >
                <span className={`text-[11px] font-semibold ${details.color}`}>
                  {details.label}
                </span>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-lg font-bold text-white">{data.total}</span>
                  <span className="text-[10px] text-neutral-400">
                    {data.completed} done
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Monthly Milestones List */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-white">Active Milestones</h3>

        {monthlyGoals.length === 0 ? (
          <div className="border border-dashed border-white/15 rounded-2xl p-8 text-center bg-white/2">
            <p className="text-xs text-neutral-400 mb-2">
              No monthly milestones planned for {monthTrajectory.monthName}.
            </p>
            <button
              onClick={() => onOpenCreateModal("monthly")}
              className="px-3 py-1.5 text-xs font-semibold text-amber-400 hover:underline"
            >
              + Create Monthly Milestone
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {monthlyGoals.map((goal) => {
              const inst = instances.find(
                (i) => i.goalId === goal.id && i.periodKey === currentMonthKey
              );
              const actual = inst ? inst.actualValue : 0;
              const pct = inst ? inst.completionPercentage : 0;
              const isDone = pct >= 100;
              const cat = CATEGORY_DETAILS[goal.category] || CATEGORY_DETAILS.general;

              // Trajectory Risk
              const isAtRisk = !isDone && pct < Math.max(0, monthTrajectory.elapsedPercentage - 15);

              return (
                <div
                  key={goal.id}
                  className={`bg-neutral-900/80 border rounded-2xl p-4 sm:p-5 transition-all ${
                    isDone
                      ? "border-emerald-500/30 bg-emerald-500/[0.02]"
                      : isAtRisk
                      ? "border-rose-500/30 bg-rose-500/[0.02]"
                      : "border-white/10 hover:border-white/20"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-base font-bold truncate ${isDone ? "text-neutral-400 line-through" : "text-white"}`}>
                          {goal.name}
                        </span>
                        {/* Status Badge */}
                        {isDone ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold flex items-center gap-1 border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3" /> Completed
                          </span>
                        ) : isAtRisk ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-semibold flex items-center gap-1 border border-rose-500/30">
                            <AlertCircle className="w-3 h-3" /> Behind Pace
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-semibold border border-blue-500/30">
                            On Track
                          </span>
                        )}
                      </div>
                      {goal.description && (
                        <p className="text-xs text-neutral-400 mt-1 line-clamp-1">
                          {goal.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`text-[10px] px-2 py-0.5 rounded-md font-medium border ${cat.bg} ${cat.color} ${cat.border}`}>
                          {cat.label}
                        </span>
                        <span className="text-xs text-neutral-400">
                          Target: {goal.targetValue} {goal.unit}
                        </span>
                      </div>
                    </div>

                    {/* Steppers & Controls */}
                    <div className="flex items-center gap-3 self-end sm:self-auto">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => logProgress(goal.id, -1, currentMonthKey)}
                          disabled={actual <= 0}
                          className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white disabled:opacity-30"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <input
                          type="number"
                          min={0}
                          value={actual}
                          onChange={(e) =>
                            setInstanceValue(goal.id, Number(e.target.value) || 0, currentMonthKey)
                          }
                          className="w-14 h-8 text-center bg-white/5 border border-white/10 rounded-lg text-xs font-bold text-white focus:outline-none focus:border-amber-500/60"
                        />
                        <button
                          onClick={() => logProgress(goal.id, 1, currentMonthKey)}
                          className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 font-bold"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-1 pl-2 border-l border-white/10">
                        <button
                          onClick={() => onEditGoal(goal)}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete "${goal.name}"?`)) {
                              deleteGoal(goal.id);
                            }
                          }}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Milestone Progress Bar */}
                  <div className="mt-4 pt-3 border-t border-white/5">
                    <div className="flex items-center justify-between text-xs font-semibold mb-1">
                      <span className="text-white">
                        {actual} / {goal.targetValue} {goal.unit}
                      </span>
                      <span className={isDone ? "text-emerald-400" : isAtRisk ? "text-rose-400" : "text-amber-400"}>
                        {pct}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isDone
                            ? "bg-emerald-400"
                            : isAtRisk
                            ? "bg-rose-400"
                            : "bg-amber-400"
                        }`}
                        style={{ width: `${Math.min(100, pct)}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
