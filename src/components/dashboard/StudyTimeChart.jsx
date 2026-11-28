import React, { useState } from "react";
import { Clock, TrendingUp, Plus, Calendar, Flame } from "lucide-react";
import { useProgress } from "../../context/ProgressContext";
import { Button } from "../common/Button";

export function StudyTimeChart() {
  const { getRecentStudyDays, recordStudyTime } = useProgress();
  const [daysCount, setDaysCount] = useState(7); // 7 or 14 days
  const [hoveredDay, setHoveredDay] = useState(null);

  const rawStudyDays = getRecentStudyDays ? getRecentStudyDays(daysCount) : [];
  const studyDays = Array.isArray(rawStudyDays) ? rawStudyDays : [];

  // Compute stats
  const totalMinutes = studyDays.reduce((acc, d) => acc + (d.minutes || 0), 0);
  const avgMinutes = Math.round(totalMinutes / (studyDays.length || 1));
  const maxMinutes = Math.max(...studyDays.map((d) => d.minutes || 0), 60);

  const totalHours = (totalMinutes / 60).toFixed(1);

  // SVG dimensions
  const chartHeight = 160;
  const barWidth = daysCount === 7 ? 28 : 16;
  const gap = daysCount === 7 ? 20 : 8;

  return (
    <div className="p-5 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 text-slate-100 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
              <Clock className="w-5 h-5" />
            </span>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Minutes Studied per Day (Lernzeit)
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Track daily active engagement across vocabulary, reading, grammar & exams.
          </p>
        </div>

        {/* Toggle 7 vs 14 days & Quick Log */}
        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold">
            <button
              onClick={() => setDaysCount(7)}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                daysCount === 7
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setDaysCount(14)}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                daysCount === 14
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              14 Days
            </button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => recordStudyTime(15)}
            className="text-xs text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40"
            title="Log 15 minutes of offline German practice (podcasts/reading)"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            +15m
          </Button>
        </div>
      </div>

      {/* Summary Stat Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Total Time ({daysCount}d)
          </span>
          <span className="text-xl font-black text-slate-900 dark:text-white mt-0.5 block">
            {totalHours}h{" "}
            <span className="text-xs font-medium text-slate-400">({totalMinutes} min)</span>
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Daily Average
          </span>
          <span className="text-xl font-black text-amber-600 dark:text-amber-400 mt-0.5 block">
            {avgMinutes} min{" "}
            <span className="text-xs font-medium text-slate-400">/ day</span>
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 col-span-2 sm:col-span-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Goal Status
          </span>
          <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
            <TrendingUp className="w-4 h-4" />
            {avgMinutes >= 25 ? "Consistent (On Track)" : "Building Habit"}
          </span>
        </div>
      </div>

      {/* SVG Bar Chart */}
      <div className="pt-2">
        <div className="w-full overflow-x-auto pb-2">
          <div className="min-w-[320px] flex items-end justify-between gap-2 h-44 px-2 pt-6 pb-2 border-b border-slate-200/80 dark:border-slate-800">
            {studyDays.map((day, idx) => {
              const heightPct = Math.max(8, (day.minutes / maxMinutes) * 100);
              const isHovered = hoveredDay === idx;
              const isToday = idx === studyDays.length - 1;

              return (
                <div
                  key={day.date}
                  className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
                  onMouseEnter={() => setHoveredDay(idx)}
                  onMouseLeave={() => setHoveredDay(null)}
                >
                  {/* Tooltip on hover */}
                  <div
                    className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md mb-1.5 transition-all ${
                      isHovered
                        ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 opacity-100 scale-105"
                        : "opacity-0 text-slate-400"
                    }`}
                  >
                    {day.minutes}m
                  </div>

                  {/* The Bar */}
                  <div className="w-full max-w-[36px] bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden flex items-end h-full">
                    <div
                      className={`w-full rounded-t-xl transition-all duration-500 ${
                        isToday
                          ? "bg-gradient-to-t from-amber-500 to-amber-400 shadow-sm"
                          : day.minutes >= 30
                          ? "bg-gradient-to-t from-emerald-500 to-teal-400"
                          : day.minutes > 0
                          ? "bg-gradient-to-t from-sky-500 to-indigo-400"
                          : "bg-slate-200 dark:bg-slate-700"
                      }`}
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>

                  {/* Day Label */}
                  <span
                    className={`text-[10px] font-bold mt-2 truncate ${
                      isToday
                        ? "text-amber-600 dark:text-amber-400"
                        : "text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    {day.dayLabel}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-2 px-1">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>&ge; 30 min (Optimal)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
              <span>&lt; 30 min</span>
            </span>
          </div>
          <span>Automatic in-app study tracking</span>
        </div>
      </div>
    </div>
  );
}
