import React, { useState, useMemo, useEffect } from "react";
import {
  Layers,
  Star,
  Clock,
  Plus,
  Sparkles,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Sliders,
  CheckCircle2,
  Calendar
} from "lucide-react";
import { FlashcardDeck } from "../components/flashcards/FlashcardDeck";
import { AddFlashcardModal } from "../components/flashcards/AddFlashcardModal";
import { Button } from "../components/common/Button";
import { useProgress } from "../context/ProgressContext";

export function PracticePage({ onNavigate }) {
  const {
    allFlashcards,
    customCards,
    getDueCards,
    getStudyQueue,
    fetchSrsStats,
    updateSrsSettings,
    addCustomFlashcard,
    progress,
    drillConfig
  } = useProgress();

  const [activeTab, setActiveTab] = useState("due"); // "due" | "all" | "custom" | "starred" | "A1" | "stats"
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [srsMetrics, setSrsMetrics] = useState({ stats: null, forecast: [] });

  // Load stats when stats tab or page loads
  useEffect(() => {
    let mounted = true;
    if (fetchSrsStats) {
      fetchSrsStats().then((data) => {
        if (mounted && data) {
          setSrsMetrics(data);
        }
      });
    }
    return () => {
      mounted = false;
    };
  }, [progress.srsCards, activeTab, fetchSrsStats]);

  // Daily limits from progress settings
  const newCardsLimit = progress.srsSettings?.newCardsLimit ?? 15;
  const maxReviewsLimit = progress.srsSettings?.maxReviewsLimit ?? 100;

  // Study Queue for today (due reviews first, then new, interleaved by theme)
  const studyQueueResult = useMemo(() => {
    return getStudyQueue(allFlashcards);
  }, [allFlashcards, getStudyQueue, progress.srsCards, newCardsLimit, maxReviewsLimit]);

  const dueCards = useMemo(() => getDueCards(allFlashcards), [allFlashcards, progress.srsCards, getDueCards]);

  // Filtered card list based on active tab
  const displayedCards = useMemo(() => {
    switch (activeTab) {
      case "due":
        return studyQueueResult.queue;
      case "custom":
        return customCards;
      case "starred":
        return allFlashcards.filter((c) => progress.starredCards?.includes(c.id));
      case "A1":
        return allFlashcards.filter((c) => c.level === "A1");
      case "all":
      default:
        return allFlashcards;
    }
  }, [activeTab, allFlashcards, studyQueueResult.queue, customCards, progress.starredCards]);

  const handleLimitsChange = (field, value) => {
    const num = Math.max(1, parseInt(value, 10) || 1);
    updateSrsSettings({ [field]: num });
  };

  const { stats, forecast } = srsMetrics;
  const maxForecastDue = Math.max(...(forecast.map((d) => d.dueCount) || [1]), 1);

  return (
    <div className="max-w-4xl mx-auto py-4 px-3 sm:px-6 space-y-6">
      {/* Top Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 text-slate-100 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                Spaced Repetition
              </span>
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-indigo-950/80 text-indigo-300 border border-indigo-800/60">
                SuperMemo SM-2 + 1m/10m Steps
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Vocabulary Studio
            </h1>

            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-lg">
              Spaced repetition schedules reviews at expanding intervals, using in-session 1-minute and 10-minute steps to cement new and lapsed vocabulary before graduation.
            </p>
          </div>

          {/* Queue & Add Card Button */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="px-5 py-3 rounded-2xl bg-amber-950/40 border border-amber-900/80 text-center">
              <div className="text-2xl sm:text-3xl font-black text-amber-400">
                {studyQueueResult.queue.length}
              </div>
              <div className="text-[10px] font-extrabold uppercase tracking-wide text-slate-400">
                Today's Queue ({studyQueueResult.dueCount} Due, {studyQueueResult.newCount} New)
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              onClick={() => setIsAddModalOpen(true)}
              icon={Plus}
              className="shadow-lg shadow-amber-500/25"
            >
              Add Card
            </Button>
          </div>
        </div>

        {/* Gender / Article Color Code Guide Banner */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 font-bold text-slate-400">
            <span>{drillConfig?.sidebarLabel || "Articles"}:</span>
            {(drillConfig?.options || ["der", "die", "das"]).map((opt) => (
              <span key={opt} className="px-2 py-0.5 rounded-md bg-indigo-950 text-indigo-300 border border-indigo-800 text-[11px] font-mono">
                {opt}
              </span>
            ))}
          </div>

          <div className="text-slate-400 text-[11px]">
            {allFlashcards.length} Total Cards ({customCards.length} Custom)
          </div>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab("due")}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-black shrink-0 transition-all ${
            activeTab === "due"
              ? "bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20"
              : "bg-slate-800/80 border border-slate-700/60 text-slate-300 hover:text-white hover:bg-slate-700"
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Today's Queue ({studyQueueResult.queue.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("stats")}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-black shrink-0 transition-all ${
            activeTab === "stats"
              ? "bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20"
              : "bg-slate-800/80 border border-slate-700/60 text-slate-300 hover:text-white hover:bg-slate-700"
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Stats & 14-Day Forecast</span>
        </button>

        <button
          onClick={() => setActiveTab("all")}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold shrink-0 transition-all ${
            activeTab === "all"
              ? "bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20"
              : "bg-slate-800/80 border border-slate-700/60 text-slate-300 hover:text-white hover:bg-slate-700"
          }`}
        >
          All Cards ({allFlashcards.length})
        </button>

        <button
          onClick={() => setActiveTab("A1")}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold shrink-0 transition-all ${
            activeTab === "A1"
              ? "bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20"
              : "bg-slate-800/80 border border-slate-700/60 text-slate-300 hover:text-white hover:bg-slate-700"
          }`}
        >
          Starter Deck (50)
        </button>

        {customCards.length > 0 && (
          <button
            onClick={() => setActiveTab("custom")}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-bold shrink-0 transition-all ${
              activeTab === "custom"
                ? "bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20"
                : "bg-slate-800/80 border border-slate-700/60 text-slate-300 hover:text-white hover:bg-slate-700"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>My Cards ({customCards.length})</span>
          </button>
        )}

        <button
          onClick={() => setActiveTab("starred")}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-bold shrink-0 transition-all ${
            activeTab === "starred"
              ? "bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20"
              : "bg-slate-800/80 border border-slate-700/60 text-slate-300 hover:text-white hover:bg-slate-700"
          }`}
        >
          <Star className="w-3.5 h-3.5" />
          <span>Starred ({progress.starredCards?.length || 0})</span>
        </button>
      </div>

      {/* ================= STATS & FORECAST VIEW ================= */}
      {activeTab === "stats" ? (
        <div className="space-y-6">
          {/* Top Row: Retention Rate & Daily Limits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Retention Rate */}
            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  Memory Retention Rate
                </span>
                <div className="text-4xl font-black text-white mt-2">
                  {stats?.totalReviews > 0 ? `${stats.retentionRate}%` : "—"}
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Based on {stats?.totalReviews || 0} reviews in your IndexedDB review log.
                </p>
              </div>

              {stats?.totalReviews > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-800 grid grid-cols-4 gap-1 text-center text-[10px]">
                  <div>
                    <span className="text-rose-500 font-bold block">{stats.ratingCounts.again}</span>
                    <span className="text-slate-400">Again</span>
                  </div>
                  <div>
                    <span className="text-orange-500 font-bold block">{stats.ratingCounts.hard}</span>
                    <span className="text-slate-400">Hard</span>
                  </div>
                  <div>
                    <span className="text-blue-500 font-bold block">{stats.ratingCounts.good}</span>
                    <span className="text-slate-400">Good</span>
                  </div>
                  <div>
                    <span className="text-emerald-500 font-bold block">{stats.ratingCounts.easy}</span>
                    <span className="text-slate-400">Easy</span>
                  </div>
                </div>
              )}
            </div>

            {/* Maturity Breakdown */}
            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-sm md:col-span-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                Card Maturity Distribution
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60">
                  <span className="text-xs font-semibold text-slate-400 block">
                    Learning / New
                  </span>
                  <span className="text-2xl font-black text-white mt-1 block">
                    {stats?.maturity?.learning ?? 0}
                  </span>
                  <span className="text-[10px] text-slate-400">in 1m/10m steps</span>
                </div>

                <div className="p-3 rounded-2xl bg-amber-950/40 border border-amber-900/60">
                  <span className="text-xs font-semibold text-amber-400 block">
                    Young Cards
                  </span>
                  <span className="text-2xl font-black text-amber-300 mt-1 block">
                    {stats?.maturity?.young ?? 0}
                  </span>
                  <span className="text-[10px] text-amber-400/80">interval &lt; 21d</span>
                </div>

                <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-900/60">
                  <span className="text-xs font-semibold text-emerald-400 block">
                    Mature Cards
                  </span>
                  <span className="text-2xl font-black text-emerald-300 mt-1 block">
                    {stats?.maturity?.mature ?? 0}
                  </span>
                  <span className="text-[10px] text-emerald-400/80">interval &ge; 21d</span>
                </div>

                <div className="p-3 rounded-2xl bg-rose-950/40 border border-rose-900/60">
                  <span className="text-xs font-semibold text-rose-400 block flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Leech Cards
                  </span>
                  <span className="text-2xl font-black text-rose-300 mt-1 block">
                    {stats?.maturity?.leeches ?? 0}
                  </span>
                  <span className="text-[10px] text-rose-400/80">&ge; 8 lapses</span>
                </div>
              </div>

              {/* Daily Limit Controls */}
              <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <Sliders className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-bold text-slate-300">Daily Queue Limits:</span>
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-1.5 text-slate-400">
                    <span>New / day:</span>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={newCardsLimit}
                      onChange={(e) => handleLimitsChange("newCardsLimit", e.target.value)}
                      className="w-14 px-2 py-1 rounded-lg border border-slate-700 bg-slate-800 text-center font-bold text-white"
                    />
                  </label>

                  <label className="flex items-center gap-1.5 text-slate-400">
                    <span>Max reviews / day:</span>
                    <input
                      type="number"
                      min={5}
                      max={500}
                      value={maxReviewsLimit}
                      onChange={(e) => handleLimitsChange("maxReviewsLimit", e.target.value)}
                      className="w-16 px-2 py-1 rounded-lg border border-slate-700 bg-slate-800 text-center font-bold text-white"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* 14-Day Due Forecast Chart */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-500" />
                  14-Day Review Workload Forecast
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Projected card reviews per day according to SM-2 interval scheduling.
                </p>
              </div>
            </div>

            {/* Interactive Forecast Bar Chart */}
            <div className="grid grid-cols-7 sm:grid-cols-14 gap-2 items-end h-44 pt-6 pb-2">
              {forecast.map((day) => {
                const heightPercent = Math.max(8, Math.round((day.dueCount / maxForecastDue) * 100));
                return (
                  <div key={day.dayIndex} className="flex flex-col items-center gap-1.5 h-full justify-end group">
                    <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 opacity-90">
                      {day.dueCount}
                    </span>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-lg h-28 flex items-end overflow-hidden p-0.5">
                      <div
                        className={`w-full rounded-md transition-all duration-300 ${
                          day.dayIndex === 0
                            ? "bg-amber-500 group-hover:bg-amber-600"
                            : "bg-indigo-500 group-hover:bg-indigo-600"
                        }`}
                        style={{ height: `${heightPercent}%` }}
                      />
                    </div>
                    <span className="text-[9px] font-semibold text-slate-400 truncate max-w-[42px] text-center">
                      {day.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* The Flashcard Deck View */
        <FlashcardDeck
          key={activeTab} // remount deck when tab switches
          cards={displayedCards}
          title={activeTab === "due" ? "Today's Queue" : "Flashcard Practice"}
          onCompleteSession={() => onNavigate("roadmap")}
        />
      )}

      {/* Add Flashcard Modal Dialog */}
      <AddFlashcardModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddCard={addCustomFlashcard}
      />
    </div>
  );
}
