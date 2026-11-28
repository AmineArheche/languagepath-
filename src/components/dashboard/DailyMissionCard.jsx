import React, { useMemo } from "react";
import {
  Target,
  CheckCircle2,
  Circle,
  Flame,
  Shield,
  Snowflake,
  BookOpen,
  Layers,
  PenTool,
  ArrowRight,
  Clock,
  Sparkles
} from "lucide-react";
import { useProgress } from "../../context/ProgressContext";
import { Button } from "../common/Button";

export function DailyMissionCard({ onNavigate }) {
  const { progress, getDueCards, allFlashcards } = useProgress();

  const todayStr = new Date().toISOString().split("T")[0];
  const dailyGoalMinutes = progress.dailyGoalMinutes || 30;
  const dueCards = getDueCards();
  const dueCount = dueCards.length;

  // 1. Calculate Flashcard Reviews Objective
  // Check how many reviews occurred today
  const srsCardsList = Object.values(progress.srsCards || {});
  const reviewsTodayCount = srsCardsList.filter((card) => {
    return card.lastReviewed && card.lastReviewed.startsWith(todayStr);
  }).length;
  // If no cards were due or user completed at least 5 reviews, consider review mission accomplished
  const isReviewDone = reviewsTodayCount >= Math.min(10, Math.max(5, dueCount)) || (dueCount === 0 && reviewsTodayCount > 0);

  // 2. Calculate Reading Objective
  const readingScores = Object.values(progress.readingScores || {});
  const readingToday = readingScores.find((r) => r.lastCompleted && r.lastCompleted.startsWith(todayStr));
  const isReadingDone = Boolean(readingToday);

  // 3. Calculate Production Objective (Writing or Speaking)
  const isProductionDone = useMemo(() => {
    try {
      const writingStr = localStorage.getItem("deutschpath_writing_history_v1");
      if (writingStr) {
        const writingList = JSON.parse(writingStr);
        if (Array.isArray(writingList)) {
          const hasTodayWriting = writingList.some((w) => {
            // Check date string or ISO timestamp
            return w.date?.includes(todayStr) || (w.id && new Date(parseInt(w.id.replace("submission-", ""))).toISOString().startsWith(todayStr));
          });
          if (hasTodayWriting) return true;
        }
      }

      const speakingStr = localStorage.getItem("deutschpath_speaking_history_v1");
      if (speakingStr) {
        const speakingList = JSON.parse(speakingStr);
        if (Array.isArray(speakingList)) {
          const hasTodaySpeaking = speakingList.some((s) => s.timestamp && s.timestamp.startsWith(todayStr));
          if (hasTodaySpeaking) return true;
        }
      }
    } catch {}
    return false;
  }, [todayStr]);

  // Tasks completed count
  const completedCount = (isReviewDone ? 1 : 0) + (isReadingDone ? 1 : 0) + (isProductionDone ? 1 : 0);
  const missionProgressPct = Math.round((completedCount / 3) * 100);

  // Time sizing breakdown according to dailyGoalMinutes
  const reviewTimeMins = Math.max(5, Math.round(dailyGoalMinutes * 0.3));
  const readingTimeMins = Math.max(5, Math.round(dailyGoalMinutes * 0.35));
  const productionTimeMins = Math.max(5, dailyGoalMinutes - reviewTimeMins - readingTimeMins);

  const streakFreeze = progress.streakFreeze || { available: 1, lastResetWeek: null };

  return (
    <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 text-slate-100 shadow-sm space-y-5">
      {/* Header with Title and Streak Freeze Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-slate-900 dark:text-white text-base">
                Tägliche Mission (Daily Mission)
              </h3>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-500" />
                <span>{dailyGoalMinutes} min goal</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Structured daily loop: <strong>Spaced repetition</strong> + <strong>Input</strong> + <strong>Production</strong>.
            </p>
          </div>
        </div>

        {/* Streak Freeze Status Indicator */}
        <div className="flex items-center gap-2">
          {streakFreeze.available > 0 ? (
            <div
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-300 text-xs font-bold"
              title="1 freeze per week active: protects your streak if a day is missed"
            >
              <Snowflake className="w-3.5 h-3.5 text-sky-500" />
              <span>1/1 Streak Freeze Active</span>
            </div>
          ) : (
            <div
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 text-xs font-bold"
              title="Streak freeze consumed for this week. Resets next Monday."
            >
              <Shield className="w-3.5 h-3.5 text-slate-400" />
              <span>Streak Freeze Used</span>
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar of Daily Mission */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <span>Mission Progress: {completedCount} / 3 Tasks</span>
            {completedCount === 3 && (
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Mission Complete! +50 XP
              </span>
            )}
          </span>
          <span className="font-black text-amber-600 dark:text-amber-400">
            {missionProgressPct}%
          </span>
        </div>
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              completedCount === 3
                ? "bg-emerald-500"
                : "bg-gradient-to-r from-amber-500 to-orange-500"
            }`}
            style={{ width: `${missionProgressPct}%` }}
          />
        </div>
      </div>

      {/* 3 Core Mission Tasks */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Task 1: SRS Flashcard Reviews */}
        <div
          className={`p-4 rounded-2xl border transition-all ${
            isReviewDone
              ? "bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/60"
              : "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-600"
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <div
                className={`p-2 rounded-xl ${
                  isReviewDone
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300"
                    : "bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300"
                }`}
              >
                <Layers className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                ~{reviewTimeMins} min
              </span>
            </div>
            {isReviewDone ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            ) : (
              <Circle className="w-5 h-5 text-slate-300 dark:text-slate-600" />
            )}
          </div>

          <div className="mt-3">
            <h4 className="font-bold text-slate-900 dark:text-white text-sm">
              Due SRS Flashcards
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {dueCount > 0
                ? `${dueCount} cards due today`
                : reviewsTodayCount > 0
                ? `${reviewsTodayCount} cards reviewed today`
                : "No cards currently due"}
            </p>
          </div>

          <button
            type="button"
            onClick={() => onNavigate && onNavigate("practice")}
            className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline"
          >
            <span>{isReviewDone ? "Review more cards" : "Start reviews"}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Task 2: 1 Reading Passage */}
        <div
          className={`p-4 rounded-2xl border transition-all ${
            isReadingDone
              ? "bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/60"
              : "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-600"
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <div
                className={`p-2 rounded-xl ${
                  isReadingDone
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300"
                    : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300"
                }`}
              >
                <BookOpen className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                ~{readingTimeMins} min
              </span>
            </div>
            {isReadingDone ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            ) : (
              <Circle className="w-5 h-5 text-slate-300 dark:text-slate-600" />
            )}
          </div>

          <div className="mt-3">
            <h4 className="font-bold text-slate-900 dark:text-white text-sm">
              1 Reading Passage
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {isReadingDone
                ? "Reading quiz completed today!"
                : "Read an authentic text with comprehension quiz"}
            </p>
          </div>

          <button
            type="button"
            onClick={() => onNavigate && onNavigate("reading")}
            className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            <span>{isReadingDone ? "Read another text" : "Open Reading Studio"}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Task 3: 1 Production Task (Writing or Speaking) */}
        <div
          className={`p-4 rounded-2xl border transition-all ${
            isProductionDone
              ? "bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/60"
              : "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-600"
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <div
                className={`p-2 rounded-xl ${
                  isProductionDone
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300"
                    : "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300"
                }`}
              >
                <PenTool className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                ~{productionTimeMins} min
              </span>
            </div>
            {isProductionDone ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            ) : (
              <Circle className="w-5 h-5 text-slate-300 dark:text-slate-600" />
            )}
          </div>

          <div className="mt-3">
            <h4 className="font-bold text-slate-900 dark:text-white text-sm">
              1 Production Task
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {isProductionDone
                ? "Writing or Speaking task submitted today!"
                : "Submit 1 essay or record 1 speech exercise"}
            </p>
          </div>

          <div className="mt-3 flex items-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate && onNavigate("writing")}
              className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              <span>Writing</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <span className="text-slate-300 dark:text-slate-600">|</span>
            <button
              type="button"
              onClick={() => onNavigate && onNavigate("speaking")}
              className="inline-flex items-center gap-1 text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline"
            >
              <span>Speaking</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
