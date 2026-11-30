import React from "react";
import { CheckCircle2, Play, Sparkles } from "lucide-react";
import { Badge } from "../common/Badge";

export function LessonNode({ lesson, isCompleted, onStartLesson }) {
  return (
    <div
      onClick={() => onStartLesson(lesson.id)}
      className={`group relative flex items-center justify-between p-4 rounded-2xl border transition-all duration-200 cursor-pointer ${
        isCompleted
          ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/60 hover:border-emerald-300 dark:hover:border-emerald-800"
          : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-600 hover:shadow-md"
      }`}
    >
      <div className="flex items-center gap-3.5 min-w-0">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
            isCompleted
              ? "bg-emerald-500 text-white shadow-sm shadow-emerald-500/20"
              : "bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
          }`}
        >
          {isCompleted ? (
            <CheckCircle2 className="w-5 h-5" />
          ) : (
            <Play className="w-4 h-4 fill-amber-500 text-amber-500 ml-0.5" />
          )}
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
              {lesson.title}
            </h4>
            {isCompleted && (
              <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80">
                Done
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
            {lesson.subtitle} • {lesson.words.length} words
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <span className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1 bg-amber-50 dark:bg-amber-950/40 px-2 py-1 rounded-lg border border-amber-200/60 dark:border-amber-900/40">
          <Sparkles className="w-3 h-3" />+{lesson.xp} XP
        </span>
      </div>
    </div>
  );
}
