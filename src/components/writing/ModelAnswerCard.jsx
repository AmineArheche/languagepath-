import React, { useState } from "react";
import { Sparkles, HelpCircle, Volume2, ArrowUpRight } from "lucide-react";
import { AudioButton } from "../common/AudioButton";

export function ModelAnswerCard({ modelAnswer, userLevel }) {
  const [showTranslation, setShowTranslation] = useState(false);

  if (!modelAnswer) return null;

  return (
    <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-indigo-50/80 via-purple-50/40 to-amber-50/40 dark:from-indigo-950/40 dark:via-purple-950/30 dark:to-slate-900 border border-indigo-200 dark:border-indigo-900/60 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-indigo-700 dark:text-indigo-300 uppercase tracking-wider">
                Model Answer (+1 Level Up)
              </span>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-200 text-indigo-900 dark:bg-indigo-900 dark:text-indigo-200">
                Level {modelAnswer.level} (from {userLevel})
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Study how a higher CEFR level structures this exact response with richer connectors.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <AudioButton text={modelAnswer.text} size="sm" />
        </div>
      </div>

      {/* German Model Text */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-indigo-100 dark:border-indigo-900/40 text-sm font-medium text-slate-900 dark:text-slate-100 leading-relaxed whitespace-pre-wrap">
        {modelAnswer.text}
      </div>

      {/* Translation Toggle */}
      {modelAnswer.translation && (
        <div>
          <button
            type="button"
            onClick={() => setShowTranslation((prev) => !prev)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>{showTranslation ? "Hide English Translation" : "Show English Translation"}</span>
          </button>

          {showTranslation && (
            <div className="mt-2.5 p-3.5 rounded-xl bg-white/70 dark:bg-slate-900/70 border border-indigo-100 dark:border-indigo-900/40 text-xs text-slate-600 dark:text-slate-300 italic whitespace-pre-wrap leading-relaxed animate-in fade-in duration-150">
              "{modelAnswer.translation}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}
