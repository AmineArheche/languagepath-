import React from "react";
import { AlertTriangle, CheckCircle2, RotateCcw, Target, Sparkles, TrendingUp, Zap } from "lucide-react";
import { useProgress } from "../../context/ProgressContext";
import { Button } from "../common/Button";
import { Card } from "../common/Card";

export function WeakSpotsView({ onStartDrill }) {
  const { getWeakSpots, getRecentWeakSpots, getRecommendedDrill, resetGrammarStats } = useProgress();

  const recentWeakSpots = getRecentWeakSpots();
  const recommendedDrill = getRecommendedDrill(5);
  const legacyWeakSpots = getWeakSpots();

  // Prefer recent errorLedger spots (ranked by recency-weighted score, ~14-day half-life)
  const hasRecentSpots = recentWeakSpots.length > 0;
  const activeTroubleTopics = legacyWeakSpots.filter((s) => s.mistakes > 0);
  const hasAnySpots = hasRecentSpots || activeTroubleTopics.length > 0;

  const handleStartTargetedDrill = () => {
    if (onStartDrill) {
      onStartDrill(recommendedDrill);
    }
  };

  return (
    <div className="space-y-6">
      {/* Weak Spots Summary Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-rose-500/10 via-amber-500/10 to-indigo-500/10 border border-rose-500/20 dark:border-rose-500/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-black uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1">
                <Target className="w-3.5 h-3.5" />
                Adaptive Pedagogical Diagnostics
              </span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              Grammar Weak Spots
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-lg">
              Ranked dynamically by recency-weighted error score (14-day exponential decay). Errors made today count more than errors from last month.
            </p>
          </div>

          {hasAnySpots && (
            <Button
              variant="danger"
              size="lg"
              onClick={handleStartTargetedDrill}
              icon={Zap}
              className="shadow-lg shadow-rose-500/20"
            >
              Start 5-Item Targeted Drill
            </Button>
          )}
        </div>
      </div>

      {/* Weak spots list */}
      {!hasAnySpots ? (
        <Card className="p-10 text-center">
          <div className="w-16 h-16 rounded-3xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            No Critical Weak Spots Detected!
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto mb-6">
            You haven't recorded significant mistakes yet, or all recent errors have decayed past the review window.
          </p>
          <Button variant="primary" onClick={handleStartTargetedDrill} icon={Sparkles}>
            Practice General Grammar
          </Button>
        </Card>
      ) : hasRecentSpots ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 px-1">
            <span className="flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-rose-500" />
              Topics Ranked by Recency-Weighted Error Score (14-Day Half-Life):
            </span>
            <button
              onClick={resetGrammarStats}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              Reset Mistake Logs
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {recentWeakSpots.map((spot, index) => (
              <div
                key={spot.ruleId}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 flex items-center justify-center text-[10px] font-black">
                        #{index + 1}
                      </span>
                      {spot.category}
                    </span>
                    <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300">
                      Score: {spot.weightedScore}
                    </span>
                  </div>

                  <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                    {spot.label}
                  </h4>

                  <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mt-2">
                    <div>
                      Logged Errors: <strong className="text-rose-600">{spot.errorCount}</strong>
                    </div>
                    <div>
                      Last Error:{" "}
                      <strong className="text-slate-700 dark:text-slate-300">
                        {new Date(spot.lastErrorDate).toLocaleDateString()}
                      </strong>
                    </div>
                  </div>

                  {spot.sampleMistake && (
                    <div className="mt-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs space-y-1">
                      <div className="text-rose-600 dark:text-rose-400">
                        <span className="font-bold">Dein Fehler:</span> "{spot.sampleMistake}"
                      </div>
                      <div className="text-emerald-600 dark:text-emerald-400">
                        <span className="font-bold">Richtig:</span> "{spot.sampleCorrect}"
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-semibold text-[11px]">
                    14-day exponential decay weight
                  </span>
                  <button
                    onClick={handleStartTargetedDrill}
                    className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Drill Topic &rarr;
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Fallback to legacy grammarStats if recent errors are empty */
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 px-1">
            <span>Topics Ranked by Error Frequency:</span>
            <button
              onClick={resetGrammarStats}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              Reset Mistake Logs
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {activeTroubleTopics.map((topicStat) => (
              <div
                key={topicStat.topic}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                      {topicStat.topic}
                    </span>
                    <span className="text-xs font-black px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300">
                      {topicStat.errorRate}% Error Rate
                    </span>
                  </div>

                  <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                    {topicStat.topicLabel}
                  </h4>

                  <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mt-3">
                    <div>
                      Mistakes: <strong className="text-rose-600">{topicStat.mistakes}</strong>
                    </div>
                    <div>
                      Correct: <strong className="text-emerald-600">{topicStat.correct}</strong>
                    </div>
                    <div>
                      Total Attempts: <strong>{topicStat.attempts}</strong>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between text-[11px] font-bold text-slate-500 mb-1">
                    <span>Accuracy</span>
                    <span>{topicStat.accuracy}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        topicStat.accuracy >= 70 ? "bg-emerald-500" : "bg-rose-500"
                      }`}
                      style={{ width: `${topicStat.accuracy}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
