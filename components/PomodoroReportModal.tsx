"use client";

import { useState, useMemo } from "react";
import {
  X,
  BarChart3,
  Flame,
  Clock,
  Calendar,
  Award,
  Download,
  CheckCircle2,
  Lock,
  ListOrdered,
} from "lucide-react";
import { PomodoroSession, GamificationProfile } from "@/lib/pomodoroTypes";
import { ALL_BADGES } from "@/hooks/usePomodoro";

interface PomodoroReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  gamification: GamificationProfile;
  sessions: PomodoroSession[];
  todayMinutesFocused: number;
  levelInfo: {
    level: number;
    title: string;
    nextLevelXP: number;
    currentLevelBaseXP: number;
  };
}

type ReportTab = "summary" | "gamification" | "detail";

export default function PomodoroReportModal({
  isOpen,
  onClose,
  gamification,
  sessions,
  todayMinutesFocused,
  levelInfo,
}: PomodoroReportModalProps) {
  const [tab, setTab] = useState<ReportTab>("summary");

  const totalHours = (gamification.totalMinutesFocused / 60).toFixed(1);
  const todayHours = Math.floor(todayMinutesFocused / 60);
  const todayMins = todayMinutesFocused % 60;

  // Level progress percentage
  const levelProgressPct = useMemo(() => {
    const range = levelInfo.nextLevelXP - levelInfo.currentLevelBaseXP;
    const currentWithinRange = gamification.totalXP - levelInfo.currentLevelBaseXP;
    return Math.min(100, Math.max(0, Math.round((currentWithinRange / range) * 100)));
  }, [gamification.totalXP, levelInfo]);

  // Export data as JSON
  const handleExportJSON = () => {
    const data = {
      exportedAt: new Date().toISOString(),
      gamification,
      sessions,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pomodoro-report-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Pomodoro Focus Report"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 select-none"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative z-10 flex h-[620px] max-h-[92vh] w-full max-w-2xl flex-col rounded-2xl border border-white/15 bg-neutral-900/95 text-neutral-100 shadow-2xl backdrop-blur-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center gap-2">
            <BarChart3 size={20} className="text-amber-400" />
            <h2 className="text-sm sm:text-base font-bold uppercase tracking-wider text-neutral-100">
              Focus Activity Report
            </h2>
          </div>
          <button
            type="button"
            aria-label="Close report"
            onClick={onClose}
            className="rounded-full p-1.5 text-neutral-400 transition hover:bg-white/10 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Bar */}
        <div className="flex border-b border-white/10 bg-neutral-950/40 px-3 sm:px-6 text-xs font-semibold overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setTab("summary")}
            className={`flex items-center gap-1.5 border-b-2 py-3 px-3 transition ${
              tab === "summary"
                ? "border-amber-400 text-amber-300"
                : "border-transparent text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <Clock size={14} />
            <span>Summary</span>
          </button>

          <button
            type="button"
            onClick={() => setTab("gamification")}
            className={`flex items-center gap-1.5 border-b-2 py-3 px-3 transition ${
              tab === "gamification"
                ? "border-amber-400 text-amber-300"
                : "border-transparent text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <Award size={14} />
            <span>Gamification & Levels</span>
          </button>

          <button
            type="button"
            onClick={() => setTab("detail")}
            className={`flex items-center gap-1.5 border-b-2 py-3 px-3 transition ${
              tab === "detail"
                ? "border-amber-400 text-amber-300"
                : "border-transparent text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <ListOrdered size={14} />
            <span>History Log</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* TAB 1: SUMMARY STATS */}
          {tab === "summary" && (
            <div className="space-y-6">
              {/* Top 4 Summary Cards (matches Pomofocus style) */}
              <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4">
                <div className="flex flex-col items-center justify-center rounded-xl border border-white/10 bg-neutral-800/60 p-4 text-center">
                  <Clock size={22} className="mb-2 text-amber-400" />
                  <span className="font-mono text-xl font-bold text-neutral-100">
                    {totalHours}h
                  </span>
                  <span className="mt-1 text-[11px] font-medium uppercase tracking-wider text-neutral-400">
                    Total Focused
                  </span>
                </div>

                <div className="flex flex-col items-center justify-center rounded-xl border border-white/10 bg-neutral-800/60 p-4 text-center">
                  <Flame size={22} className="mb-2 text-rose-500" />
                  <span className="font-mono text-xl font-bold text-neutral-100">
                    {gamification.streakDays}
                  </span>
                  <span className="mt-1 text-[11px] font-medium uppercase tracking-wider text-neutral-400">
                    Day Streak
                  </span>
                </div>

                <div className="flex flex-col items-center justify-center rounded-xl border border-white/10 bg-neutral-800/60 p-4 text-center">
                  <span className="mb-2 text-2xl">🍅</span>
                  <span className="font-mono text-xl font-bold text-neutral-100">
                    {gamification.totalPomodorosCompleted}
                  </span>
                  <span className="mt-1 text-[11px] font-medium uppercase tracking-wider text-neutral-400">
                    Pomodoros
                  </span>
                </div>

                <div className="flex flex-col items-center justify-center rounded-xl border border-white/10 bg-neutral-800/60 p-4 text-center">
                  <Calendar size={22} className="mb-2 text-sky-400" />
                  <span className="font-mono text-xl font-bold text-neutral-100">
                    {todayHours}h {todayMins}m
                  </span>
                  <span className="mt-1 text-[11px] font-medium uppercase tracking-wider text-neutral-400">
                    Today&apos;s Focus
                  </span>
                </div>
              </div>

              {/* Focus Streak & Motivation Banner */}
              <div className="flex items-center justify-between rounded-xl border border-amber-400/20 bg-amber-400/10 p-4">
                <div>
                  <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                    {gamification.streakDays > 0
                      ? `🔥 ${gamification.streakDays}-Day Focus Streak Active!`
                      : "Start Your Focus Streak Today"}
                  </h3>
                  <p className="mt-0.5 text-xs text-neutral-300">
                    Complete at least one 25-minute Pomodoro session every day to build momentum.
                  </p>
                </div>
                <span className="text-3xl">🚀</span>
              </div>

              {/* Quick Gamification Teaser */}
              <div className="rounded-xl border border-white/10 bg-neutral-800/50 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">⭐</span>
                    <span className="text-xs font-bold text-neutral-200">
                      Level {levelInfo.level}: {levelInfo.title}
                    </span>
                  </div>
                  <span className="font-mono text-xs font-semibold text-amber-400">
                    {gamification.totalXP} XP
                  </span>
                </div>

                <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-700">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-500"
                    style={{ width: `${levelProgressPct}%` }}
                  />
                </div>
                <div className="mt-1.5 flex justify-between text-[10px] text-neutral-400">
                  <span>{levelProgressPct}% to Next Level</span>
                  <span>Goal: {levelInfo.nextLevelXP} XP</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: GAMIFICATION & BADGES */}
          {tab === "gamification" && (
            <div className="space-y-6">
              {/* Level Card */}
              <div className="rounded-2xl border border-amber-400/30 bg-gradient-to-br from-amber-500/15 via-neutral-900 to-neutral-950 p-5 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="inline-block rounded-full bg-amber-400/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-300">
                      Rank & Mastery
                    </span>
                    <h3 className="mt-1 text-lg font-extrabold text-neutral-100">
                      Level {levelInfo.level}: {levelInfo.title}
                    </h3>
                    <p className="mt-0.5 text-xs text-neutral-400">
                      Earn 10 XP for every completed minute of deep work.
                    </p>
                  </div>
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-400/30 bg-amber-400/10 text-2xl shadow-inner">
                    ⚡
                  </div>
                </div>

                <div className="mt-4">
                  <div className="mb-1.5 flex items-center justify-between text-xs">
                    <span className="font-mono font-medium text-neutral-300">
                      {gamification.totalXP} / {levelInfo.nextLevelXP} XP
                    </span>
                    <span className="font-bold text-amber-300">
                      {levelProgressPct}%
                    </span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-neutral-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-400 to-yellow-300 transition-all duration-500"
                      style={{ width: `${levelProgressPct}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Achievement Badges */}
              <div>
                <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-neutral-400">
                  Focus Badges & Milestones
                </h4>
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {ALL_BADGES.map((badge) => {
                    const isUnlocked = !!gamification.badges[badge.id];
                    return (
                      <div
                        key={badge.id}
                        className={`flex items-start gap-3 rounded-xl border p-3 transition ${
                          isUnlocked
                            ? "border-amber-400/30 bg-amber-400/5 text-neutral-100"
                            : "border-white/5 bg-neutral-800/30 text-neutral-500 opacity-60"
                        }`}
                      >
                        <span className="text-2xl">{badge.icon}</span>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold">
                              {badge.title}
                            </span>
                            {isUnlocked ? (
                              <CheckCircle2
                                size={14}
                                className="text-emerald-400"
                              />
                            ) : (
                              <Lock size={12} className="text-neutral-500" />
                            )}
                          </div>
                          <p className="mt-0.5 text-[11px] leading-relaxed">
                            {badge.description}
                          </p>
                          {isUnlocked && (
                            <span className="mt-1 block text-[10px] text-amber-300/80">
                              Unlocked on{" "}
                              {new Date(
                                gamification.badges[badge.id]
                              ).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: HISTORY DETAIL */}
          {tab === "detail" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                  Recent Sessions ({sessions.length})
                </span>
                <button
                  type="button"
                  onClick={handleExportJSON}
                  className="flex items-center gap-1 rounded-md border border-white/10 px-2.5 py-1 text-xs text-neutral-300 transition hover:bg-white/10 hover:text-white"
                >
                  <Download size={13} />
                  <span>Export JSON</span>
                </button>
              </div>

              {sessions.length === 0 ? (
                <div className="flex h-48 flex-col items-center justify-center text-center text-neutral-400">
                  <Clock size={32} className="mb-2 opacity-30" />
                  <p className="text-sm font-medium">No sessions recorded yet</p>
                  <p className="text-xs text-neutral-500">
                    Complete your first Pomodoro to see it logged here.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {sessions.slice(0, 30).map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between rounded-xl border border-white/5 bg-neutral-800/40 p-3 text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-base">
                          {s.mode === "pomodoro" ? "🍅" : "☕"}
                        </span>
                        <div>
                          <span className="font-semibold text-neutral-200">
                            {s.taskName ||
                              (s.mode === "pomodoro"
                                ? "Deep Work Session"
                                : "Rest & Recharge")}
                          </span>
                          <span className="block text-[10px] text-neutral-400">
                            {new Date(s.timestamp).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs font-medium text-amber-300">
                          +{s.durationMinutes} min
                        </span>
                        {s.mode === "pomodoro" && (
                          <span className="rounded-full bg-amber-400/10 px-2 py-0.5 text-[10px] font-bold text-amber-400">
                            +{s.durationMinutes * 10} XP
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-white/10 bg-neutral-950/40 px-6 py-3.5">
          <span className="text-[11px] text-neutral-400">
            Database & account synchronization coming in future updates.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-neutral-800 px-4 py-1.5 text-xs font-semibold text-neutral-200 transition hover:bg-neutral-700 hover:text-white"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
