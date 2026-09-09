"use client";

import { useState } from "react";
import { X, Target, Plus, Check } from "lucide-react";
import {
  Goal,
  GoalLevel,
  GoalImportance,
  GoalTiming,
  GoalCategory,
  GoalRecurrence,
  COMMON_UNITS,
  CATEGORY_DETAILS,
  IMPORTANCE_POINTS,
} from "@/lib/goalTypes";

interface GoalFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (goalData: Omit<Goal, "id" | "createdAt" | "updatedAt">, id?: string) => void;
  initialGoal?: Goal | null;
  defaultLevel?: GoalLevel;
  availableGoals?: Goal[];
}

export default function GoalFormModal({
  isOpen,
  onClose,
  onSave,
  initialGoal,
  defaultLevel = "daily",
  availableGoals = [],
}: GoalFormModalProps) {
  const [name, setName] = useState(initialGoal ? initialGoal.name : "");
  const [description, setDescription] = useState(initialGoal?.description || "");
  const [level, setLevel] = useState<GoalLevel>(initialGoal?.level || defaultLevel);
  const [parentGoalId, setParentGoalId] = useState<string | null>(initialGoal?.parentGoalId || null);
  const [importance, setImportance] = useState<GoalImportance>(initialGoal?.importance || "high");
  const [timing, setTiming] = useState<GoalTiming>(
    initialGoal?.timing || (defaultLevel === "daily" ? "morning" : "anytime")
  );
  const [targetValue, setTargetValue] = useState<number>(
    initialGoal ? initialGoal.targetValue : defaultLevel === "yearly" ? 1 : 2
  );
  const [unit, setUnit] = useState<string>(
    initialGoal ? initialGoal.unit : defaultLevel === "yearly" ? "milestone" : "problems"
  );
  const [category, setCategory] = useState<GoalCategory>(initialGoal?.category || "coding");
  const [recurrence, setRecurrence] = useState<GoalRecurrence>(
    initialGoal?.recurrence ||
      (defaultLevel === "daily" ? "daily" : defaultLevel === "weekly" ? "weekly" : "none")
  );

  if (!isOpen) return null;

  // Potential parent goals (only higher level goals)
  const eligibleParents = availableGoals.filter((g) => {
    if (initialGoal && g.id === initialGoal.id) return false;
    if (level === "daily") return g.level === "weekly" || g.level === "monthly" || g.level === "yearly";
    if (level === "weekly") return g.level === "monthly" || g.level === "yearly";
    if (level === "monthly") return g.level === "yearly";
    return false;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave(
      {
        name: name.trim(),
        description: description.trim() || undefined,
        level,
        parentGoalId: parentGoalId || null,
        importance,
        timing,
        targetValue: Math.max(1, Number(targetValue) || 1),
        unit: unit.trim() || "tasks",
        category,
        recurrence,
        status: initialGoal ? initialGoal.status : "active",
      },
      initialGoal?.id
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-neutral-900 border border-white/15 rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-neutral-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">
                {initialGoal ? "Edit Goal" : "Create New Goal"}
              </h2>
              <p className="text-xs text-neutral-400">
                Connect your execution targets across all 4 levels
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
          {/* Goal Name */}
          <div>
            <label className="block text-xs font-semibold tracking-wider text-neutral-400 uppercase mb-1.5">
              Goal Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Solve 2 LeetCode Problems, Read 20 pages..."
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-neutral-500 focus:outline-none focus:border-amber-500/60 transition-colors text-sm"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold tracking-wider text-neutral-400 uppercase mb-1.5">
              Description / Why this matters (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Context or criteria for completing this goal..."
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-neutral-500 focus:outline-none focus:border-amber-500/60 transition-colors text-sm resize-none"
            />
          </div>

          {/* Level Selector */}
          <div>
            <label className="block text-xs font-semibold tracking-wider text-neutral-400 uppercase mb-2">
              Goal Level
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(["daily", "weekly", "monthly", "yearly"] as GoalLevel[]).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => {
                    setLevel(lvl);
                    if (lvl === "daily") setRecurrence("daily");
                    else if (lvl === "weekly") setRecurrence("weekly");
                    else setRecurrence("none");
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-medium capitalize border transition-all text-center ${
                    level === lvl
                      ? "bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-sm"
                      : "bg-white/5 border-white/10 text-neutral-400 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Parent Goal Link (Tree Hierarchy) */}
          {eligibleParents.length > 0 && (
            <div>
              <label className="block text-xs font-semibold tracking-wider text-neutral-400 uppercase mb-1.5">
                Link to Parent Goal (Optional Hierarchy)
              </label>
              <select
                value={parentGoalId || ""}
                onChange={(e) => setParentGoalId(e.target.value || null)}
                className="w-full px-4 py-2.5 bg-neutral-900 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500/60 transition-colors"
              >
                <option value="">No parent goal (Independent)</option>
                {eligibleParents.map((p) => (
                  <option key={p.id} value={p.id}>
                    [{p.level.toUpperCase()}] {p.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Measurable Target & Unit */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold tracking-wider text-neutral-400 uppercase mb-1.5">
                Target Value *
              </label>
              <input
                type="number"
                min={1}
                required
                value={targetValue}
                onChange={(e) => setTargetValue(Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500/60 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold tracking-wider text-neutral-400 uppercase mb-1.5">
                Unit (e.g. pages, problems) *
              </label>
              <input
                type="text"
                list="unit-suggestions"
                required
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="unit"
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500/60 transition-colors"
              />
              <datalist id="unit-suggestions">
                {COMMON_UNITS.map((u) => (
                  <option key={u} value={u} />
                ))}
              </datalist>
            </div>
          </div>

          {/* Importance / Base Points */}
          <div>
            <label className="block text-xs font-semibold tracking-wider text-neutral-400 uppercase mb-2">
              Importance & Points Value
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(["low", "medium", "high", "critical"] as GoalImportance[]).map((imp) => {
                const points = IMPORTANCE_POINTS[imp];
                const isSelected = importance === imp;
                return (
                  <button
                    key={imp}
                    type="button"
                    onClick={() => setImportance(imp)}
                    className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
                      isSelected
                        ? imp === "critical"
                          ? "bg-rose-500/20 border-rose-500/50 text-rose-300"
                          : imp === "high"
                          ? "bg-amber-500/20 border-amber-500/50 text-amber-300"
                          : "bg-blue-500/20 border-blue-500/50 text-blue-300"
                        : "bg-white/5 border-white/10 text-neutral-400 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <span className="text-xs font-semibold capitalize">{imp}</span>
                    <span className="text-[10px] opacity-80 mt-1">{points} {points === 1 ? "Point" : "Points"}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Timing & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Timing */}
            <div>
              <label className="block text-xs font-semibold tracking-wider text-neutral-400 uppercase mb-1.5">
                Timing
              </label>
              <select
                value={timing}
                onChange={(e) => setTiming(e.target.value as GoalTiming)}
                className="w-full px-4 py-2.5 bg-neutral-900 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500/60"
              >
                <option value="morning">Morning Focus</option>
                <option value="afternoon">Afternoon</option>
                <option value="evening">Evening Routine</option>
                <option value="anytime">Anytime during day</option>
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-semibold tracking-wider text-neutral-400 uppercase mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as GoalCategory)}
                className="w-full px-4 py-2.5 bg-neutral-900 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500/60"
              >
                {Object.entries(CATEGORY_DETAILS).map(([catKey, details]) => (
                  <option key={catKey} value={catKey}>
                    {details.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Recurrence */}
          <div>
            <label className="block text-xs font-semibold tracking-wider text-neutral-400 uppercase mb-1.5">
              Recurrence Schedule
            </label>
            <select
              value={recurrence}
              onChange={(e) => setRecurrence(e.target.value as GoalRecurrence)}
              className="w-full px-4 py-2.5 bg-neutral-900 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500/60"
            >
              <option value="daily">Every Day</option>
              <option value="weekdays">Weekdays (Mon - Fri)</option>
              <option value="weekends">Weekends (Sat - Sun)</option>
              <option value="weekly">Weekly</option>
              <option value="none">One-time / Milestone</option>
            </select>
          </div>

          {/* Actions */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-sm font-semibold bg-amber-500 hover:bg-amber-400 text-neutral-950 flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {initialGoal ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {initialGoal ? "Update Goal" : "Save Goal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
