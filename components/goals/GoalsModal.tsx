"use client";

import { useState, useEffect, useCallback } from "react";
import {
  X,
  Target,
  RotateCcw,
} from "lucide-react";
import { Goal, GoalLevel } from "@/lib/goalTypes";
import { useGoals } from "@/hooks/useGoals";
import DailyGoalsTab from "./DailyGoalsTab";
import WeeklyGoalsTab from "./WeeklyGoalsTab";
import MonthlyGoalsTab from "./MonthlyGoalsTab";
import YearlyGoalsTab from "./YearlyGoalsTab";
import GoalFormModal from "./GoalFormModal";

interface GoalsModalProps {
  isOpen: boolean;
  onClose: () => void;
  goalsHook: ReturnType<typeof useGoals>;
}

export default function GoalsModal({
  isOpen,
  onClose,
  goalsHook,
}: GoalsModalProps) {
  const [activeTab, setActiveTab] = useState<GoalLevel>("daily");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [formDefaultLevel, setFormDefaultLevel] = useState<GoalLevel>("daily");

  const {
    todaySummary,
    goals,
    addGoal,
    updateGoal,
    resetToStarterGoals,
  } = goalsHook;

  // Keyboard shortcut listener within modal
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "Escape" && !isFormOpen) {
        onClose();
      } else if (!isFormOpen && (e.target as HTMLElement)?.tagName !== "INPUT" && (e.target as HTMLElement)?.tagName !== "TEXTAREA") {
        if (e.key === "1") setActiveTab("daily");
        if (e.key === "2") setActiveTab("weekly");
        if (e.key === "3") setActiveTab("monthly");
        if (e.key === "4") setActiveTab("yearly");
        if (e.key.toLowerCase() === "n") {
          e.preventDefault();
          setEditingGoal(null);
          setFormDefaultLevel(activeTab);
          setIsFormOpen(true);
        }
      }
    },
    [isOpen, isFormOpen, onClose, activeTab]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const handleOpenCreateModal = (level: GoalLevel) => {
    setEditingGoal(null);
    setFormDefaultLevel(level);
    setIsFormOpen(true);
  };

  const handleEditGoal = (goal: Goal) => {
    setEditingGoal(goal);
    setFormDefaultLevel(goal.level);
    setIsFormOpen(true);
  };

  const handleSaveGoal = (
    goalData: Omit<Goal, "id" | "createdAt" | "updatedAt">,
    id?: string
  ) => {
    if (id) {
      updateGoal(id, goalData);
    } else {
      addGoal(goalData);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
        <div className="bg-neutral-900/98 border border-white/15 rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden relative">
          {/* Modal Header */}
          <div className="px-6 py-4 border-b border-white/10 bg-neutral-900/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
                <Target className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-bold text-white tracking-tight">
                    GOAL & EXECUTION SYSTEM
                  </h1>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Pro
                  </span>
                </div>
                <p className="text-xs text-neutral-400">
                  Daily Execution → Weekly Outcomes → Monthly Milestones → Yearly Vision
                </p>
              </div>
            </div>

            {/* Header Right: Today Score Pill & Close */}
            <div className="flex items-center gap-3 self-end sm:self-auto">
              <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-neutral-200 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Today:</span>
                <span className="text-amber-300 font-bold">
                  {todaySummary.earnedPoints} / {todaySummary.possiblePoints} pts ({todaySummary.scorePercentage}%)
                </span>
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
                title="Close (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="px-6 pt-3 pb-1 border-b border-white/10 bg-neutral-950/40 flex items-center gap-2 overflow-x-auto custom-scrollbar">
            {(
              [
                { id: "daily", label: "Daily Goals", shortcut: "1" },
                { id: "weekly", label: "Weekly Outcomes & Recovery", shortcut: "2" },
                { id: "monthly", label: "Monthly Milestones", shortcut: "3" },
                { id: "yearly", label: "Yearly Roadmap", shortcut: "4" },
              ] as const
            ).map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
                    isActive
                      ? "bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/20"
                      : "text-neutral-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                      isActive ? "bg-black/20 text-neutral-950" : "bg-white/10 text-neutral-400"
                    }`}
                  >
                    {tab.shortcut}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Tab Content Body */}
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-neutral-900/40">
            {activeTab === "daily" && (
              <DailyGoalsTab
                goalsHook={goalsHook}
                onOpenCreateModal={handleOpenCreateModal}
                onEditGoal={handleEditGoal}
              />
            )}
            {activeTab === "weekly" && (
              <WeeklyGoalsTab
                goalsHook={goalsHook}
                onOpenCreateModal={handleOpenCreateModal}
                onEditGoal={handleEditGoal}
              />
            )}
            {activeTab === "monthly" && (
              <MonthlyGoalsTab
                goalsHook={goalsHook}
                onOpenCreateModal={handleOpenCreateModal}
                onEditGoal={handleEditGoal}
              />
            )}
            {activeTab === "yearly" && (
              <YearlyGoalsTab
                goalsHook={goalsHook}
                onOpenCreateModal={handleOpenCreateModal}
                onEditGoal={handleEditGoal}
              />
            )}
          </div>

          {/* Modal Footer */}
          <div className="px-6 py-3 border-t border-white/10 bg-neutral-900/90 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-neutral-400">
            <div className="flex items-center gap-3">
              <span>
                <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-neutral-300 font-mono">G</kbd> Toggle
              </span>
              <span>
                <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-neutral-300 font-mono">1-4</kbd> Switch
              </span>
              <span>
                <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-neutral-300 font-mono">N</kbd> New Goal
              </span>
              <span>
                <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-neutral-300 font-mono">Esc</kbd> Close
              </span>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-auto">
              <button
                onClick={() => {
                  if (confirm("Reset to default starter goal templates? Custom goals will be replaced.")) {
                    resetToStarterGoals();
                  }
                }}
                className="text-neutral-500 hover:text-amber-400 transition-colors flex items-center gap-1"
                title="Reset to Starter Goal Templates"
              >
                <RotateCcw className="w-3 h-3" /> Reset Starter Templates
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Goal Form Modal */}
      <GoalFormModal
        key={`${editingGoal?.id || "new"}-${formDefaultLevel}-${isFormOpen}`}
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingGoal(null);
        }}
        onSave={handleSaveGoal}
        initialGoal={editingGoal}
        defaultLevel={formDefaultLevel}
        availableGoals={goals}
      />
    </>
  );
}
