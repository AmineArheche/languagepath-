import React, { useMemo, useEffect } from "react";
import { checkAndTriggerReminder } from "../services/notificationService";
import {
  Flame,
  Layers,
  Clock,
  Compass,
  Award,
  Zap,
  TrendingUp,
  TrendingDown,
  Minus,
  GraduationCap,
  BookOpen,
  Calendar,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  AlertTriangle
} from "lucide-react";
import { useProgress } from "../context/ProgressContext";
import { StudyTimeChart } from "../components/dashboard/StudyTimeChart";
import { GrammarAccuracyList } from "../components/dashboard/GrammarAccuracyList";
import { LevelReadinessCard } from "../components/dashboard/LevelReadinessCard";
import { DailyMissionCard } from "../components/dashboard/DailyMissionCard";
import { WeeklySummaryCard } from "../components/dashboard/WeeklySummaryCard";
import { Button } from "../components/common/Button";

export function DashboardPage({ onNavigate }) {
  const {
    progress,
    getWordsLearnedCount,
    allFlashcards,
    getDueCards,
    calculateLevelReadiness,
    getTopWeeklyErrors,
    getRecommendedDrill
  } = useProgress();

  const wordsLearned = getWordsLearnedCount();
  const readinessA2 = calculateLevelReadiness("A2");
  const dueCardsCount = getDueCards().length;
  const topWeeklyErrors = getTopWeeklyErrors(3);
  const recommendedDrill = getRecommendedDrill(5);

  // Daily goal & today's study minutes
  const todayStr = new Date().toISOString().split("T")[0];
  const todayMinutes = progress.dailyStudyMinutes?.[todayStr] || 0;
  const dailyGoal = progress.dailyGoalMinutes || 30;
  const goalProgressPct = Math.min(100, Math.round((todayMinutes / (dailyGoal || 1)) * 100));

  useEffect(() => {
    try {
      checkAndTriggerReminder(todayMinutes > 0);
    } catch {}
  }, [todayMinutes]);

  // Gender breakdown of flashcards
  const genderBreakdown = useMemo(() => {
    let der = 0, die = 0, das = 0;
    allFlashcards.forEach((c) => {
      const art = c.article?.toLowerCase();
      if (art === "der") der++;
      else if (art === "die") die++;
      else if (art === "das") das++;
    });
    return { der, die, das };
  }, [allFlashcards]);

  // Streak days of week pills (Mon - Sun)
  const daysOfWeek = ["M", "T", "W", "T", "F", "S", "S"];
  const currentDayIndex = (new Date().getDay() + 6) % 7; // 0 = Mon, 6 = Sun

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
      {/* Top Welcome & Summary Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 text-xs font-black uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Learning Analytics & Readiness
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Willkommen zurück! (Dashboard)
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track your German fluency journey across daily streak, vocabulary growth, grammar accuracy, and Goethe exam readiness.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onNavigate && onNavigate("practice")}
          >
            <Layers className="w-4 h-4 mr-1.5 text-amber-500" />
            {dueCardsCount > 0 ? `${dueCardsCount} Cards Due` : "Flashcards"}
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => onNavigate && onNavigate("exam")}
            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20"
          >
            <Award className="w-4 h-4 mr-1.5" />
            Goethe Exam Prep
          </Button>
        </div>
      </div>

      {/* 4 Core KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Daily Streak */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-2xl bg-orange-950/60 text-orange-400">
              <Flame className="w-6 h-6 fill-orange-500 text-orange-500" />
            </div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Streak
            </span>
          </div>

          <div>
            <div className="text-3xl font-black text-white">
              {progress.streak || 1}{" "}
              <span className="text-sm font-semibold text-slate-400">Tage (Days)</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Daily German practice streak
            </p>
          </div>

          {/* Weekday status dots */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            {daysOfWeek.map((day, idx) => {
              const isPastOrToday = idx <= currentDayIndex;
              return (
                <div key={idx} className="flex flex-col items-center gap-1">
                  <span className="text-[10px] font-bold text-slate-400">{day}</span>
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${
                      isPastOrToday
                        ? "bg-orange-500 text-white shadow-xs"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {isPastOrToday ? "✓" : ""}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Words Learned */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-2xl bg-sky-950/60 text-sky-400">
              <Layers className="w-6 h-6 text-sky-500" />
            </div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Vocabulary
            </span>
          </div>

          <div>
            <div className="text-3xl font-black text-white">
              {wordsLearned}{" "}
              <span className="text-sm font-semibold text-slate-400">Wörter</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Learned & reviewed in SRS deck
            </p>
          </div>

          {/* Gender breakdown badges */}
          <div className="flex items-center gap-2 pt-2 border-t border-slate-800 text-[10px] font-black">
            <span className="px-2 py-0.5 rounded-md bg-blue-950/80 text-blue-300">
              der: {genderBreakdown.der}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-rose-950/80 text-rose-300">
              die: {genderBreakdown.die}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-emerald-950/80 text-emerald-300">
              das: {genderBreakdown.das}
            </span>
          </div>
        </div>

        {/* 3. Daily Goal & Active Minutes */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-2xl bg-amber-950/60 text-amber-400">
              <Zap className="w-6 h-6 fill-amber-500 text-amber-500" />
            </div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Daily Goal
            </span>
          </div>

          <div>
            <div className="text-3xl font-black text-white">
              {todayMinutes} / {dailyGoal}{" "}
              <span className="text-sm font-semibold text-slate-400">min</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {goalProgressPct}% of daily target ({progress.xp || 0} XP earned)
            </p>
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <div className="w-24 bg-slate-700 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-amber-500 h-full rounded-full transition-all"
                style={{ width: `${goalProgressPct}%` }}
              />
            </div>
            <button
              onClick={() => onNavigate && onNavigate("settings")}
              className="text-amber-400 font-bold hover:underline text-[11px]"
            >
              Adjust Goal &rarr;
            </button>
          </div>
        </div>

        {/* 4. Estimated Readiness for Next Level */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-2xl bg-purple-950/60 text-purple-400">
              <Compass className="w-6 h-6 text-purple-500" />
            </div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Readiness
            </span>
          </div>

          <div>
            <div className="text-3xl font-black text-purple-400">
              {readinessA2.readinessScore}%
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Estimated readiness for Level A2
            </p>
          </div>

          <div className="pt-2 border-t border-slate-800 text-xs font-semibold text-purple-300 flex items-center justify-between">
            <span>Next CEFR Goal</span>
            <span className="font-bold">Goethe A2</span>
          </div>
        </div>
      </div>

      {/* Daily Mission Card */}
      <DailyMissionCard onNavigate={onNavigate} />

      {/* Weekly Learning Summary Card (Minutes, Words, Retention, Top Error) */}
      <WeeklySummaryCard />

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Study Time Chart & Grammar Accuracy (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Minutes studied per day chart */}
          <StudyTimeChart />

          {/* Accuracy by grammar topic */}
          <GrammarAccuracyList
            onNavigateToGrammar={() => onNavigate && onNavigate("grammar")}
          />
        </div>

        {/* Right Column: Level Readiness Card & Goethe Exam CTA (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Estimated Readiness Score card */}
          <LevelReadinessCard
            onNavigateToExams={() => onNavigate && onNavigate("exam")}
            onNavigateToRoadmap={() => onNavigate && onNavigate("roadmap")}
          />

          {/* Top 3 Error Patterns This Week with Trend Arrows */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 text-slate-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                    Top Error Patterns This Week
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Week-over-week trends & recency scores
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                Weekly Diagnostic
              </span>
            </div>

            {topWeeklyErrors.length === 0 ? (
              <div className="py-4 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  No active mistake patterns this week!
                </p>
                <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                  Keep practicing to maintain your streak and solidify grammatical accuracy.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {topWeeklyErrors.map((item, idx) => {
                  let trendBadge = null;
                  if (item.trend === "up") {
                    trendBadge = (
                      <span className="inline-flex items-center gap-1 text-[11px] font-black px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300">
                        <TrendingUp className="w-3 h-3 text-rose-600 dark:text-rose-400" />
                        ↑ Increasing
                      </span>
                    );
                  } else if (item.trend === "down") {
                    trendBadge = (
                      <span className="inline-flex items-center gap-1 text-[11px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                        <TrendingDown className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        ↓ Decreasing
                      </span>
                    );
                  } else {
                    trendBadge = (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        <Minus className="w-3 h-3 text-slate-400" />
                        → Steady
                      </span>
                    );
                  }

                  return (
                    <div
                      key={item.category}
                      className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-[10px] font-black flex items-center justify-center">
                            #{idx + 1}
                          </span>
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            {item.label}
                          </span>
                        </div>
                        {trendBadge}
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pl-7">
                        <span>
                          <strong>{item.thisWeekCount}</strong> this week (vs.{" "}
                          <strong>{item.priorWeekCount}</strong> last week)
                        </span>
                        <span className="font-semibold text-slate-400">
                          Recency: {item.weightedScore}
                        </span>
                      </div>
                    </div>
                  );
                })}

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onNavigate && onNavigate("grammar")}
                  className="w-full text-xs font-bold justify-between mt-2"
                >
                  <span className="flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    Targeted 5-Item Drill ({recommendedDrill.length} available)
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                </Button>
              </div>
            )}
          </div>

          {/* Goethe Exam Prep Quick Banner */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-900 to-slate-900 text-white shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-white/20 backdrop-blur-sm">
                <Award className="w-6 h-6 text-amber-300" />
              </div>
              <div>
                <h3 className="font-bold text-base leading-tight">
                  Goethe-Zertifikat Mock Tests
                </h3>
                <p className="text-xs text-indigo-200">
                  Timed simulated exams with 4 modules & score
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Test your proficiency in all four sections: <strong>Lesen</strong>, <strong>Hören</strong> (with native audio), <strong>Schreiben</strong>, and <strong>Sprechen</strong>.
            </p>

            <Button
              variant="primary"
              size="sm"
              onClick={() => onNavigate && onNavigate("exam")}
              className="w-full bg-indigo-500 hover:bg-indigo-600 text-white justify-between shadow-md"
            >
              <span>Take a Timed Mock Exam</span>
              <ArrowRight className="w-4 h-4 ml-1 rtl:rotate-180" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
