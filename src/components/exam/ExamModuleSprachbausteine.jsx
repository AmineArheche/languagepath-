import React, { useState } from "react";
import {
  Layers,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
  BookOpen,
  ArrowRight
} from "lucide-react";

export function ExamModuleSprachbausteine({
  moduleData,
  answers = {},
  onAnswerChange,
  isSubmitted = false
}) {
  const [activeGapId, setActiveGapId] = useState(null);

  if (!moduleData || !moduleData.parts) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/80 flex items-start gap-3.5">
        <div className="p-2.5 rounded-xl bg-teal-600 text-white shrink-0">
          <Layers className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white text-base">
            {moduleData.title || "Sprachbausteine"} • {moduleData.points} Punkte
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-0.5">
            {moduleData.description ||
              "Testen Sie Grammatik und Wortschatz im authentischen Kontext (Briefe & Sachtexte)."}
          </p>
        </div>
      </div>

      {/* Parts List */}
      {moduleData.parts.map((part, pIdx) => {
        const clozeItems = part.clozeItems || [];

        return (
          <div
            key={pIdx}
            className="p-5 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 text-slate-100 shadow-sm space-y-6"
          >
            {/* Header */}
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-xs font-black text-teal-600 dark:text-teal-400 uppercase tracking-wider">
                  {part.title}
                </span>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                  {part.instructions}
                </p>
              </div>

              {part.wordPool && (
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 w-full">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">
                    Wortauswahl-Pool (Wörter zur Zuordnung):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {part.wordPool.map((word, wIdx) => (
                      <span
                        key={wIdx}
                        className="px-2.5 py-1 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 shadow-2xs"
                      >
                        {word}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Passage Text with Highlighted Gap Indicators */}
            {part.text && (
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 font-serif text-slate-800 dark:text-slate-200 text-sm sm:text-base leading-relaxed whitespace-pre-line select-text">
                {part.text}
              </div>
            )}

            {/* Gap Questions Grid */}
            <div className="space-y-4 pt-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                Lücken bearbeiten &amp; Option auswählen:
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {clozeItems.map((item) => {
                  const selectedIdx = answers[item.id];
                  const isAnswered = selectedIdx !== undefined;
                  const isCorrect = isAnswered && Number(selectedIdx) === Number(item.correctAnswer);

                  return (
                    <div
                      key={item.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        isSubmitted
                          ? isCorrect
                            ? "bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800"
                            : "bg-rose-50/60 dark:bg-rose-950/20 border-rose-300 dark:border-rose-800"
                          : isAnswered
                          ? "bg-teal-50/40 dark:bg-teal-950/20 border-teal-300 dark:border-teal-700"
                          : "bg-slate-900 border-slate-800"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-teal-600 text-white font-mono font-black text-xs flex items-center justify-center">
                            {item.gapNumber}
                          </span>
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            Lücke [{item.gapNumber}]
                          </span>
                        </div>

                        {item.ruleCategory && (
                          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                            {item.ruleCategory}
                          </span>
                        )}
                      </div>

                      {/* Options */}
                      <div className="grid grid-cols-3 gap-2 pt-1">
                        {item.options.map((opt, optIdx) => {
                          const isOptionSelected = Number(selectedIdx) === optIdx;
                          const isOptionCorrect = Number(item.correctAnswer) === optIdx;

                          let btnStyle =
                            "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-teal-400";

                          if (isOptionSelected) {
                            btnStyle = "border-teal-600 bg-teal-600 text-white font-black shadow-2xs";
                          }

                          if (isSubmitted) {
                            if (isOptionCorrect) {
                              btnStyle =
                                "border-emerald-500 bg-emerald-500 text-white font-black";
                            } else if (isOptionSelected && !isCorrect) {
                              btnStyle =
                                "border-rose-500 bg-rose-500 text-white font-black";
                            }
                          }

                          return (
                            <button
                              key={optIdx}
                              disabled={isSubmitted}
                              onClick={() => onAnswerChange(item.id, optIdx)}
                              className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition-all text-center truncate ${btnStyle}`}
                              title={opt}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>

                      {/* Explanation on submit */}
                      {isSubmitted && item.explanation && (
                        <div className="mt-3 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300 leading-relaxed flex items-start gap-1.5">
                          <HelpCircle className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                          <span>{item.explanation}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
