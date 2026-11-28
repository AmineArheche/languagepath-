import React from "react";
import { GraduationCap, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";
import { useProgress } from "../../context/ProgressContext";
import { Button } from "../common/Button";

export function GrammarAccuracyList({ onNavigateToGrammar }) {
  const { getGrammarTopicStats, getWeakSpots } = useProgress();
  const rawTopics = getGrammarTopicStats ? getGrammarTopicStats() : [];
  const topics = Array.isArray(rawTopics) ? rawTopics : [];
  const weakSpots = getWeakSpots ? getWeakSpots() : [];

  const totalAttempts = topics.reduce((acc, t) => acc + (t.attempts || 0), 0);
  const avgAccuracy = topics.length > 0
    ? Math.round(topics.reduce((acc, t) => acc + (t.accuracy || 0), 0) / topics.length)
    : 100;

  return (
    <div className="p-5 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 text-slate-100 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              <GraduationCap className="w-5 h-5" />
            </span>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Accuracy by Grammar Topic
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Based on completed grammar studio exercises and interactive checks.
          </p>
        </div>

        {/* Global Average Pill */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            {totalAttempts} attempts
          </span>
          <span
            className={`text-xs font-black px-3 py-1 rounded-xl ${
              avgAccuracy >= 80
                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                : avgAccuracy >= 65
                ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
            }`}
          >
            {avgAccuracy}% Avg Accuracy
          </span>
        </div>
      </div>

      {/* Topics List */}
      <div className="space-y-4">
        {topics.map((item) => {
          const isWeak = item.accuracy < 70 && item.attempts > 0;

          return (
            <div
              key={item.key}
              className="p-3.5 rounded-2xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-700/60 space-y-2 hover:border-indigo-400 transition-colors"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {item.label}
                  </span>
                  {isWeak && (
                    <span className="text-[10px] font-black px-1.5 py-0.2 rounded-md bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                      Weak Spot
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {item.attempts > 0 && (
                    <span className="text-[11px] text-slate-400 hidden sm:inline">
                      {item.correct}/{item.attempts} correct
                    </span>
                  )}
                  <span
                    className={`text-xs font-black px-2 py-0.5 rounded-lg ${
                      item.accuracy >= 80
                        ? "text-emerald-600 dark:text-emerald-400"
                        : item.accuracy >= 65
                        ? "text-amber-600 dark:text-amber-400"
                        : "text-rose-600 dark:text-rose-400"
                    }`}
                  >
                    {item.accuracy}%
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-200/70 dark:bg-slate-700/60 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    item.accuracy >= 80
                      ? "bg-emerald-500"
                      : item.accuracy >= 65
                      ? "bg-amber-500"
                      : "bg-rose-500"
                  }`}
                  style={{ width: `${Math.max(5, item.accuracy)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* CTA Button */}
      {onNavigateToGrammar && (
        <div className="pt-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={onNavigateToGrammar}
            className="w-full justify-between"
          >
            <span>Practice Weak Spots in Grammar Studio</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}
