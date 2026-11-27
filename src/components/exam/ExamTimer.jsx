import React, { useState, useEffect } from "react";
import { Clock, Pause, Play, AlertTriangle, CheckSquare } from "lucide-react";
import { Button } from "../common/Button";

export function ExamTimer({
  durationMinutes = 45,
  onTimeUp,
  onFinishEarly,
  activeModuleTitle
}) {
  const [secondsRemaining, setSecondsRemaining] = useState(durationMinutes * 60);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    setSecondsRemaining(durationMinutes * 60);
  }, [durationMinutes]);

  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (onTimeUp) onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPaused, onTimeUp]);

  const totalSeconds = durationMinutes * 60;
  const elapsedSeconds = totalSeconds - secondsRemaining;
  const percentRemaining = Math.max(0, (secondsRemaining / totalSeconds) * 100);

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const isUrgent = secondsRemaining < 300; // Less than 5 mins

  const formattedTime = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  return (
    <div className="sticky top-16 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-md flex flex-wrap items-center justify-between gap-3 mb-6 transition-colors">
      {/* Current Module Info */}
      <div className="flex items-center gap-2.5">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
        <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
          Official Goethe Mock Exam
        </span>
        {activeModuleTitle && (
          <span className="text-xs px-2 py-0.5 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-semibold hidden md:inline-block">
            {activeModuleTitle}
          </span>
        )}
      </div>

      {/* Timer & Controls */}
      <div className="flex items-center gap-3">
        {/* Digital Clock Pill */}
        <div
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-mono text-sm sm:text-base font-black transition-all ${
            isUrgent
              ? "bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-300 dark:border-rose-800 animate-pulse"
              : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700"
          }`}
        >
          <Clock className={`w-4 h-4 ${isUrgent ? "text-rose-600" : "text-amber-500"}`} />
          <span>{formattedTime}</span>
        </div>

        {/* Pause / Resume */}
        <button
          onClick={() => setIsPaused((prev) => !prev)}
          className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
          title={isPaused ? "Resume Exam Timer" : "Pause Exam Timer"}
        >
          {isPaused ? <Play className="w-4 h-4 text-emerald-500" /> : <Pause className="w-4 h-4" />}
        </button>

        {/* Finish Early Button */}
        <Button
          variant="primary"
          size="sm"
          onClick={() => onFinishEarly(elapsedSeconds)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
        >
          <CheckSquare className="w-4 h-4 mr-1.5" />
          Finish & Grade
        </Button>
      </div>

      {/* Progress Bar of time elapsed */}
      <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-1000 ${
            isUrgent ? "bg-rose-500" : "bg-amber-500"
          }`}
          style={{ width: `${percentRemaining}%` }}
        />
      </div>
    </div>
  );
}
