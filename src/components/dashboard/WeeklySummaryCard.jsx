import React from "react";
import { Clock, BookOpen, Target, AlertTriangle, TrendingUp, Calendar, Sparkles } from "lucide-react";
import { useProgress } from "../../context/ProgressContext";
import { formatCategoryLabel } from "../../services/errorLedger";
import { getLocalDateString } from "../../services/streakService";

/**
 * WeeklySummaryCard
 * Displays a 7-day consolidated learning synthesis:
 * 1. Total minutes studied
 * 2. Words learned / mastered
 * 3. Spaced repetition retention rate %
 * 4. Top pedagogical error pattern this week
 */
export function WeeklySummaryCard() {
  const { progress, getCardStats, getWordsLearnedCount, allFlashcards, getTopWeeklyErrors } = useProgress();

  // 1. Calculate minutes studied in the past 7 local days
  const studyTimeMap = progress.studyTime || {};
  let weeklyMinutes = 0;
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateKey = getLocalDateString(d);
    weeklyMinutes += studyTimeMap[dateKey] || 0;
  }

  // 2. Words learned
  const totalWordsLearned = getWordsLearnedCount ? getWordsLearnedCount() : 0;

  // 3. SRS Retention rate
  const cardStats = getCardStats ? getCardStats(allFlashcards) : { retentionRate: 85 };
  const retentionPercent = cardStats.retentionRate || 85;

  // 4. Top error pattern this week from recency-weighted error ledger
  let topErrorPattern = null;
  try {
    const topPatterns = getTopWeeklyErrors ? getTopWeeklyErrors(1) : [];
    if (topPatterns && topPatterns.length > 0) {
      topErrorPattern = topPatterns[0];
    }
  } catch {}

  const topCategoryLabel = topErrorPattern
    ? formatCategoryLabel(topErrorPattern.category)
    : "No recent errors!";

  return (
    <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-indigo-900/40 via-slate-900/60 to-amber-950/30 border border-indigo-500/20 backdrop-blur-md shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
            <Calendar className="w-5 h-5" />
          </span>
          <div>
            <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
              <span>Weekly Learning Summary</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                Past 7 Days
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Consolidated study metrics & retention diagnostics
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
        {/* Metric 1: Minutes Studied */}
        <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1.5">
            <span className="text-xs font-semibold">Study Time</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {weeklyMinutes}
              <span className="text-xs font-semibold text-slate-500 ms-1">min</span>
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
              Across last 7 days
            </div>
          </div>
        </div>

        {/* Metric 2: Words Mastered */}
        <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1.5">
            <span className="text-xs font-semibold">Vocabulary</span>
            <BookOpen className="w-4 h-4 text-emerald-500" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {totalWordsLearned}
              <span className="text-xs font-semibold text-slate-500 ms-1">words</span>
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
              Active in memory
            </div>
          </div>
        </div>

        {/* Metric 3: SRS Retention */}
        <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1.5">
            <span className="text-xs font-semibold">SRS Retention</span>
            <Target className="w-4 h-4 text-indigo-500" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {retentionPercent}%
            </div>
            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>Target: &ge; 85%</span>
            </div>
          </div>
        </div>

        {/* Metric 4: Top Error Pattern */}
        <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1.5">
            <span className="text-xs font-semibold">Top Weak Spot</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div>
            <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate" title={topCategoryLabel}>
              {topCategoryLabel}
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
              {topErrorPattern ? `${topErrorPattern.count} recent mistakes` : "Clean accuracy"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WeeklySummaryCard;
