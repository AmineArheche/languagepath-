import React from "react";
import { CheckCircle2, AlertCircle, Sparkles, ArrowRight } from "lucide-react";

export function CorrectionBox({ correction }) {
  if (!correction) return null;

  const hasErrors = correction.hasErrors !== false && correction.original !== correction.corrected;

  return (
    <div
      className={`mt-2 p-3.5 rounded-2xl text-xs transition-all animate-in fade-in slide-in-from-top-1 duration-200 border ${
        hasErrors
          ? "bg-amber-50/90 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-950 dark:text-amber-200"
          : "bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200"
      }`}
    >
      <div className="flex items-center gap-1.5 font-extrabold text-[11px] uppercase tracking-wider mb-1.5">
        {hasErrors ? (
          <>
            <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span className="text-amber-700 dark:text-amber-300">Grammar Feedback & Correction</span>
          </>
        ) : (
          <>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-emerald-700 dark:text-emerald-300">Perfekt! No Grammar Mistakes</span>
          </>
        )}
      </div>

      {hasErrors && (
        <div className="space-y-1 my-1.5 font-medium">
          <div className="flex items-baseline gap-1 text-slate-500 dark:text-slate-400 line-through">
            <span>You:</span>
            <span>"{correction.original}"</span>
          </div>

          <div className="flex items-baseline gap-1.5 font-bold text-emerald-700 dark:text-emerald-300">
            <ArrowRight className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
            <span>Korrektur: "{correction.corrected}"</span>
          </div>
        </div>
      )}

      {/* One line explanation in English */}
      {correction.explanation && (
        <div className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 leading-relaxed border-t border-slate-200/60 dark:border-slate-800 pt-1.5">
          <strong className="text-slate-800 dark:text-slate-200 mr-1">Why:</strong>
          {correction.explanation}
        </div>
      )}
    </div>
  );
}
