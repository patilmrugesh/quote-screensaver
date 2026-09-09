"use client";

import { useState, useMemo } from "react";
import {
  Award,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  Plus,
  Minus,
  Check,
  RotateCcw,
  BookOpen,
  Pencil,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import {
  Goal,
  GoalRecoveryPlan,
  GoalReview,
  CATEGORY_DETAILS,
} from "@/lib/goalTypes";
import { useGoals } from "@/hooks/useGoals";

interface WeeklyGoalsTabProps {
  goalsHook: ReturnType<typeof useGoals>;
  onOpenCreateModal: (level: "weekly") => void;
  onEditGoal: (goal: Goal) => void;
}

export default function WeeklyGoalsTab({
  goalsHook,
  onOpenCreateModal,
  onEditGoal,
}: WeeklyGoalsTabProps) {
  const {
    goals,
    getWeeklyExecution,
    getSundayRecoveryData,
    setInstanceValue,
    logProgress,
    saveRecoveryPlan,
    saveReview,
  } = goalsHook;

  const [capacityMinutes, setCapacityMinutes] = useState<number>(240); // default 4 hours
  const [reflectionText, setReflectionText] = useState("");
  const [isSavedNotice, setIsSavedNotice] = useState(false);

  const weeklyData = useMemo(() => {
    return getWeeklyExecution();
  }, [getWeeklyExecution]);

  const sundayRecovery = useMemo(() => {
    return getSundayRecoveryData(capacityMinutes);
  }, [getSundayRecoveryData, capacityMinutes]);

  const weeklyOutcomeGoals = useMemo(() => {
    return goals.filter((g) => g.level === "weekly" && g.status === "active");
  }, [goals]);

  // Handle saving weekly review
  const handleSaveReview = () => {
    const review: GoalReview = {
      id: `grev_${Date.now()}`,
      periodType: "weekly",
      periodKey: weeklyData.weekKey,
      dailyExecutionScore: weeklyData.dailyScore,
      outcomeScore: weeklyData.outcomeScore,
      overallScore: weeklyData.combinedScore,
      reflection: reflectionText.trim() || undefined,
      createdAt: Date.now(),
    };
    saveReview(review);
    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 3000);
  };

  // Handle committing Sunday recovery plan
  const handleAcceptRecoveryPlans = () => {
    for (const plan of sundayRecovery.recoveryPlans) {
      const fullPlan: GoalRecoveryPlan = {
        ...plan,
        id: `grec_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        createdAt: Date.now(),
      };
      saveRecoveryPlan(fullPlan);
    }
    alert(`Successfully activated ${sundayRecovery.recoveryPlans.length} Sunday recovery items within your ${Math.round(capacityMinutes / 60)}h capacity limit!`);
  };

  const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="space-y-6">
      {/* 1. Weekly Score Hero */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5 sm:p-6 backdrop-blur-md relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs uppercase tracking-wider text-amber-400 font-semibold flex items-center gap-1.5">
                <Award className="w-4 h-4" /> Weekly Performance Dashboard
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-neutral-300 font-mono">
                {weeklyData.weekKey}
              </span>
            </div>
            <div className="flex items-baseline gap-3">
              <span className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                {weeklyData.combinedScore}%
              </span>
              <span className="text-xs font-medium text-neutral-400">
                Combined Score (70% Daily + 30% Weekly)
              </span>
            </div>
          </div>

          {/* 7-Day Execution Sparkline */}
          <div className="bg-neutral-900/80 border border-white/10 p-3 rounded-xl">
            <div className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold mb-2 text-center">
              7-Day Daily Execution
            </div>
            <div className="flex items-end gap-2 h-10">
              {weeklyData.weekDates.map((dateStr, idx) => {
                const score = weeklyData.dailyScoresByDay[dateStr] || 0;
                const isPassed = score >= 70;
                return (
                  <div key={dateStr} className="flex flex-col items-center gap-1">
                    <div
                      className={`w-5 rounded-t transition-all ${
                        score > 0
                          ? isPassed
                            ? "bg-emerald-400"
                            : "bg-amber-400"
                          : "bg-neutral-800"
                      }`}
                      style={{ height: `${Math.max(6, Math.round((score / 100) * 32))}px` }}
                      title={`${dayLabels[idx]}: ${score}%`}
                    />
                    <span className="text-[9px] font-semibold text-neutral-400">
                      {dayLabels[idx]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 70/30 Breakdown Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5 pt-4 border-t border-white/10">
          <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-neutral-300">Daily Execution Average (70%)</span>
              <p className="text-[11px] text-neutral-400">Calculated from your actual daily check-ins</p>
            </div>
            <span className="text-lg font-bold text-amber-300">{weeklyData.dailyScore}%</span>
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-neutral-300">Weekly Outcome Goals (30%)</span>
              <p className="text-[11px] text-neutral-400">Macro targets and multi-day projects</p>
            </div>
            <span className="text-lg font-bold text-emerald-300">{weeklyData.outcomeScore}%</span>
          </div>
        </div>
      </div>

      {/* 2. Weekly Outcome Goals */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-400" /> Weekly Outcome Goals
            </h3>
            <p className="text-xs text-neutral-400">
              High-impact targets to accomplish by Sunday night
            </p>
          </div>
          <button
            onClick={() => onOpenCreateModal("weekly")}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-neutral-950 flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Add Weekly Goal
          </button>
        </div>

        {weeklyOutcomeGoals.length === 0 ? (
          <div className="border border-dashed border-white/15 rounded-2xl p-6 text-center bg-white/2">
            <p className="text-xs text-neutral-400 mb-2">
              No weekly outcome goals defined yet. Set targets like &quot;12 commits&quot;, &quot;5 workouts&quot;, or &quot;4 chapters&quot;.
            </p>
            <button
              onClick={() => onOpenCreateModal("weekly")}
              className="px-3 py-1.5 text-xs font-semibold text-amber-400 hover:underline"
            >
              + Create your first weekly goal
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {weeklyOutcomeGoals.map((goal) => {
              const inst = weeklyData.weeklyInstances.find((i) => i.goalId === goal.id);
              const actual = inst ? inst.actualValue : 0;
              const pct = inst ? inst.completionPercentage : 0;
              const isCompleted = pct >= 100;
              const cat = CATEGORY_DETAILS[goal.category] || CATEGORY_DETAILS.general;

              return (
                <div
                  key={goal.id}
                  className={`bg-neutral-900/70 border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                    isCompleted ? "border-emerald-500/30 bg-emerald-500/[0.02]" : "border-white/10"
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const next = isCompleted ? 0 : goal.targetValue;
                          setInstanceValue(goal.id, next, weeklyData.weekKey);
                        }}
                        className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                          isCompleted
                            ? "bg-emerald-500 border-emerald-400 text-neutral-950"
                            : "border-white/20 text-transparent"
                        }`}
                      >
                        <Check className="w-3 h-3 stroke-[3]" />
                      </button>
                      <span className={`text-sm font-semibold truncate ${isCompleted ? "text-neutral-400 line-through" : "text-white"}`}>
                        {goal.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[10px] px-2 py-0.5 rounded font-medium border ${cat.bg} ${cat.color} ${cat.border}`}>
                        {cat.label}
                      </span>
                      <span className="text-xs text-neutral-400 font-medium">
                        Target: {goal.targetValue} {goal.unit}
                      </span>
                    </div>
                  </div>

                  {/* Progress & Steppers */}
                  <div className="flex items-center gap-4 self-end sm:self-auto">
                    <div className="w-32 sm:w-40 text-right">
                      <div className="text-xs font-bold text-white mb-1">
                        {actual} / {goal.targetValue} {goal.unit} ({pct}%)
                      </div>
                      <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${isCompleted ? "bg-emerald-400" : "bg-amber-400"}`}
                          style={{ width: `${Math.min(100, pct)}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => logProgress(goal.id, -1, weeklyData.weekKey)}
                        disabled={actual <= 0}
                        className="w-7 h-7 rounded bg-white/5 border border-white/10 flex items-center justify-center text-white disabled:opacity-30"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => logProgress(goal.id, 1, weeklyData.weekKey)}
                        className="w-7 h-7 rounded bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 font-bold text-xs"
                      >
                        +1
                      </button>
                      <button
                        onClick={() => onEditGoal(goal)}
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 ml-1"
                        title="Edit Goal"
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Sunday Recovery Engine: Deficit Analysis */}
      <div className="bg-neutral-900/80 border border-amber-500/20 rounded-2xl p-5 sm:p-6 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-semibold text-white">
                Sunday Recovery Engine & Deficit Analysis
              </h3>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Intelligent catch-up plan capped to prevent burnout and guilt
            </p>
          </div>

          {/* Capacity Selector */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-[11px] text-neutral-400 flex items-center gap-1 font-medium">
              <Clock className="w-3.5 h-3.5" /> Capacity Cap:
            </span>
            <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-xl border border-white/10">
              {[120, 240, 360].map((mins) => (
                <button
                  key={mins}
                  onClick={() => setCapacityMinutes(mins)}
                  className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all ${
                    capacityMinutes === mins
                      ? "bg-amber-500 text-neutral-950"
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  {mins / 60}h
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Burnout Guard Warning Banner if Over Capacity */}
        {sundayRecovery.isOverCapacity && (
          <div className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-200/90 leading-relaxed">
              <strong className="text-amber-300 font-semibold">Burnout Protection Active:</strong> Total weekly shortfall is {Math.round(sundayRecovery.totalShortfallMinutes / 60 * 10) / 10} hours, exceeding your {capacityMinutes / 60}h cap. Non-negotiable critical tasks have been prioritized; lower-priority items are marked optional to keep catch-up realistic.
            </div>
          </div>
        )}

        {/* Deficits Shortfall List */}
        {sundayRecovery.deficits.length === 0 ? (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center flex items-center justify-center gap-2 text-emerald-300 text-xs font-medium">
            <CheckCircle2 className="w-4 h-4" />
            Zero deficits! You completed 100% of your daily execution targets this week.
          </div>
        ) : (
          <div className="space-y-2 mb-5">
            {sundayRecovery.deficits.map((item, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                      item.priority === "critical"
                        ? "bg-rose-500/20 border-rose-500/40 text-rose-300"
                        : item.priority === "recommended"
                        ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                        : "bg-neutral-700/50 border-neutral-600 text-neutral-400"
                    }`}
                  >
                    {item.priority}
                  </span>
                  <div>
                    <h5 className="text-xs font-semibold text-white">{item.goal.name}</h5>
                    <span className="text-[11px] text-neutral-400">
                      Missed: {item.shortfall} {item.unit}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-medium text-neutral-300">
                    ~{item.estimatedMinutes} mins
                  </span>
                </div>
              </div>
            ))}

            <div className="pt-2 flex justify-end">
              <button
                onClick={handleAcceptRecoveryPlans}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-neutral-950 flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/10"
              >
                <Check className="w-3.5 h-3.5" /> Accept Sunday Recovery Plan
              </button>
            </div>
          </div>
        )}

        {/* Dynamic Weekly Adjustment Suggestions */}
        {sundayRecovery.suggestions.length > 0 && (
          <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
            <span className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Next Week Dynamic Adjustments:
            </span>
            {sundayRecovery.suggestions.map((sugg, i) => (
              <div
                key={i}
                className="p-3 rounded-xl bg-neutral-950/60 border border-white/5 text-xs text-neutral-300 flex items-start gap-2.5"
              >
                {sugg.type === "decrease" ? (
                  <TrendingDown className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                ) : (
                  <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                )}
                <span>{sugg.message}</span>
              </div>
            ))}
          </div>
        )}

        {/* Weekly Reflection & Save Review */}
        <div className="mt-5 pt-4 border-t border-white/10 space-y-3">
          <label className="block text-xs font-semibold tracking-wider text-neutral-400 uppercase">
            Weekly Reflection & Lessons Learned
          </label>
          <textarea
            value={reflectionText}
            onChange={(e) => setReflectionText(e.target.value)}
            rows={2}
            placeholder="What went well? What caused deficits? What adjustments will you make next week?"
            className="w-full px-4 py-2 bg-neutral-950 border border-white/10 rounded-xl text-white text-xs placeholder:text-neutral-500 focus:outline-none focus:border-amber-500/60 resize-none"
          />
          <div className="flex items-center justify-between">
            {isSavedNotice && (
              <span className="text-xs text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Weekly review recorded!
              </span>
            )}
            <button
              onClick={handleSaveReview}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white transition-colors ml-auto flex items-center gap-1.5"
            >
              <BookOpen className="w-3.5 h-3.5" /> Save Weekly Review
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
