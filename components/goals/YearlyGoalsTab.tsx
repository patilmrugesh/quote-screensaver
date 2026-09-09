"use client";

import { useState, useMemo } from "react";
import {
  Plus,
  Minus,
  Compass,
  ChevronDown,
  ChevronRight,
  Pencil,
  Trash2,
  CheckCircle2,
  GitFork,
  Sparkles,
} from "lucide-react";
import {
  Goal,
  CATEGORY_DETAILS,
} from "@/lib/goalTypes";
import { getYearKey } from "@/lib/goalCalculations";
import { useGoals } from "@/hooks/useGoals";

interface YearlyGoalsTabProps {
  goalsHook: ReturnType<typeof useGoals>;
  onOpenCreateModal: (level: "yearly") => void;
  onEditGoal: (goal: Goal) => void;
}

export default function YearlyGoalsTab({
  goalsHook,
  onOpenCreateModal,
  onEditGoal,
}: YearlyGoalsTabProps) {
  const {
    goals,
    instances,
    deleteGoal,
    setInstanceValue,
    logProgress,
  } = goalsHook;

  const currentYearKey = useMemo(() => getYearKey(), []);
  const [expandedGoals, setExpandedGoals] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedGoals((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Yearly goals
  const yearlyGoals = useMemo(() => {
    return goals.filter((g) => g.level === "yearly" && g.status === "active");
  }, [goals]);

  // Find descendants of a parent goal (Monthly -> Weekly -> Daily)
  const getChildrenGoals = (parentId: string) => {
    return goals.filter((g) => g.parentGoalId === parentId);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Hero */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5 sm:p-6 backdrop-blur-md relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs uppercase tracking-wider text-amber-400 font-semibold flex items-center gap-1.5">
                <Compass className="w-4 h-4" /> North Star Objectives
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-neutral-300 font-mono">
                Year {currentYearKey}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Annual Execution Roadmap
            </h2>
            <p className="text-xs text-neutral-400 mt-1 max-w-xl">
              Major macro objectives for the year. Expand any objective to view its hierarchical tree of Monthly Milestones, Weekly Outcomes, and Daily Habits.
            </p>
          </div>

          <button
            onClick={() => onOpenCreateModal("yearly")}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-neutral-950 flex items-center gap-1.5 transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> Add Yearly Objective
          </button>
        </div>
      </div>

      {/* 2. Objectives List with Expandable Hierarchy Tree */}
      <div className="space-y-4">
        {yearlyGoals.length === 0 ? (
          <div className="border border-dashed border-white/15 rounded-2xl p-10 text-center bg-white/2">
            <div className="p-3 rounded-full bg-amber-500/10 text-amber-400 inline-block mb-3">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-white mb-1">No yearly objectives set</h3>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto mb-4">
              Define your high-level vision for {currentYearKey} (e.g. Master Distributed Systems, Senior Engineer Readiness, Marathon Fitness).
            </p>
            <button
              onClick={() => onOpenCreateModal("yearly")}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-amber-500 text-neutral-950 hover:bg-amber-400 transition-colors"
            >
              Set First Objective
            </button>
          </div>
        ) : (
          yearlyGoals.map((objective) => {
            const inst = instances.find(
              (i) => i.goalId === objective.id && i.periodKey === currentYearKey
            );
            const actual = inst ? inst.actualValue : 0;
            const pct = inst ? inst.completionPercentage : 0;
            const isCompleted = pct >= 100;
            const isExpanded = !!expandedGoals[objective.id];
            const cat = CATEGORY_DETAILS[objective.category] || CATEGORY_DETAILS.general;

            // Direct children (e.g., Monthly goals linked to this Yearly objective)
            const monthlyChildren = getChildrenGoals(objective.id);

            return (
              <div
                key={objective.id}
                className={`bg-neutral-900/80 border rounded-2xl transition-all overflow-hidden ${
                  isCompleted
                    ? "border-emerald-500/30 bg-emerald-500/[0.02]"
                    : "border-white/10 hover:border-white/20"
                }`}
              >
                {/* Main Card Header */}
                <div className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => toggleExpand(objective.id)}
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors mt-0.5"
                        title={isExpanded ? "Collapse tree" : "Expand tree hierarchy"}
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-amber-400" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </button>

                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className={`text-base font-bold ${isCompleted ? "text-neutral-400 line-through" : "text-white"}`}>
                            {objective.name}
                          </h3>
                          {isCompleted && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold flex items-center gap-1 border border-emerald-500/30">
                              <CheckCircle2 className="w-3 h-3" /> Achieved
                            </span>
                          )}
                        </div>

                        {objective.description && (
                          <p className="text-xs text-neutral-400 mt-1">
                            {objective.description}
                          </p>
                        )}

                        <div className="flex items-center gap-2 mt-2">
                          <span className={`text-[10px] px-2 py-0.5 rounded-md font-medium border ${cat.bg} ${cat.color} ${cat.border}`}>
                            {cat.label}
                          </span>
                          <span className="text-xs text-neutral-400 font-medium">
                            Target: {objective.targetValue} {objective.unit}
                          </span>
                          {monthlyChildren.length > 0 && (
                            <span className="text-[11px] text-amber-400/90 font-medium flex items-center gap-1">
                              <GitFork className="w-3 h-3" /> {monthlyChildren.length} linked sub-goals
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Stepper Controls & Actions */}
                    <div className="flex items-center gap-3 self-end sm:self-auto">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => logProgress(objective.id, -1, currentYearKey)}
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
                            setInstanceValue(objective.id, Number(e.target.value) || 0, currentYearKey)
                          }
                          className="w-12 h-8 text-center bg-white/5 border border-white/10 rounded-lg text-xs font-bold text-white focus:outline-none focus:border-amber-500/60"
                        />
                        <button
                          onClick={() => logProgress(objective.id, 1, currentYearKey)}
                          className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 font-bold"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-1 pl-2 border-l border-white/10">
                        <button
                          onClick={() => onEditGoal(objective)}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete "${objective.name}"?`)) {
                              deleteGoal(objective.id);
                            }
                          }}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4 pt-3 border-t border-white/5">
                    <div className="flex items-center justify-between text-xs font-semibold mb-1">
                      <span className="text-white">
                        {actual} / {objective.targetValue} {objective.unit}
                      </span>
                      <span className={isCompleted ? "text-emerald-400" : "text-amber-400"}>
                        {pct}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isCompleted ? "bg-emerald-400" : "bg-amber-400"
                        }`}
                        style={{ width: `${Math.min(100, pct)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Expandable Sub-Tree Hierarchy (Monthly -> Weekly -> Daily) */}
                {isExpanded && (
                  <div className="bg-black/30 border-t border-white/10 p-5 pl-8 space-y-3">
                    <div className="text-xs uppercase tracking-wider text-amber-400/90 font-semibold flex items-center gap-1.5 mb-2">
                      <GitFork className="w-3.5 h-3.5" /> Linked Execution Breakdown Tree
                    </div>

                    {monthlyChildren.length === 0 ? (
                      <div className="text-xs text-neutral-400 italic py-2">
                        No sub-goals linked directly to this objective yet. When creating a Monthly, Weekly, or Daily goal, select &quot;{objective.name}&quot; as the parent to build an execution tree!
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {monthlyChildren.map((subGoal) => {
                          const subChildren = getChildrenGoals(subGoal.id);
                          return (
                            <div
                              key={subGoal.id}
                              className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-2"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold uppercase">
                                    {subGoal.level}
                                  </span>
                                  <span className="text-xs font-semibold text-white">
                                    {subGoal.name}
                                  </span>
                                </div>
                                <span className="text-xs text-neutral-400">
                                  {subGoal.targetValue} {subGoal.unit}
                                </span>
                              </div>

                              {/* Nested sub-children (e.g. Weekly/Daily) */}
                              {subChildren.length > 0 && (
                                <div className="pl-4 border-l border-white/10 space-y-1.5 pt-1">
                                  {subChildren.map((leaf) => (
                                    <div
                                      key={leaf.id}
                                      className="text-[11px] text-neutral-300 flex items-center justify-between py-0.5"
                                    >
                                      <div className="flex items-center gap-1.5">
                                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 uppercase font-mono">
                                          {leaf.level}
                                        </span>
                                        <span>{leaf.name}</span>
                                      </div>
                                      <span className="text-neutral-400">
                                        {leaf.targetValue} {leaf.unit}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
