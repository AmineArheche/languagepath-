import React from "react";
import { BookOpen, CheckCircle2, XCircle, FileText, Check } from "lucide-react";

export function ExamModuleLesen({ moduleData, answers = {}, onAnswerChange, isSubmitted }) {
  if (!moduleData) return null;

  return (
    <div className="space-y-8">
      {/* Module Overview Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 flex items-start gap-3.5">
        <div className="p-2.5 rounded-xl bg-amber-500 text-white shrink-0">
          <BookOpen className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white text-base">
            {moduleData.title} • {moduleData.points} Punkte
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-0.5">
            {moduleData.description}
          </p>
        </div>
      </div>

      {/* Parts List */}
      {moduleData.parts.map((part, pIdx) => (
        <div
          key={pIdx}
          className="p-5 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 text-slate-100 shadow-sm space-y-5"
        >
          {/* Part Header */}
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <span className="text-xs font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              {part.title}
            </span>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-1">
              {part.instructions}
            </p>
          </div>

          {/* Reading Passage or Signs */}
          {part.text && (
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 font-serif text-slate-800 dark:text-slate-200 text-sm sm:text-base leading-relaxed whitespace-pre-line select-text">
              {part.text}
            </div>
          )}

          {/* Situation & Ads (for matching parts) */}
          {part.situation && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 text-xs sm:text-sm font-medium text-sky-900 dark:text-sky-200">
                <span className="font-bold">Ihre Situation:</span> {part.situation}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {part.options?.map((opt, oIdx) => (
                  <div
                    key={oIdx}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm"
                  >
                    <span className="font-black text-amber-600 dark:text-amber-400 mr-1.5">
                      {opt.letter}:
                    </span>
                    <span className="text-slate-700 dark:text-slate-300">{opt.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Part 3 Signs */}
          {part.items && (
            <div className="space-y-6">
              {part.items.map((item, itemIdx) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-3"
                >
                  <div className="p-3 rounded-xl bg-amber-100/60 dark:bg-amber-950/60 border border-amber-300/80 dark:border-amber-800 font-mono text-xs sm:text-sm text-slate-800 dark:text-slate-200 whitespace-pre-line">
                    {item.sign}
                  </div>

                  <div className="pt-2">
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-2">
                      {item.question}
                    </p>
                    <div className="flex items-center gap-3">
                      {item.options.map((opt, optIdx) => {
                        const isSelected = answers[item.id] === optIdx;
                        const isCorrect = item.correctAnswer === optIdx;

                        let style =
                          "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-amber-500";
                        if (isSelected) {
                          style = "border-amber-500 bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 font-bold";
                        }
                        if (isSubmitted) {
                          if (isCorrect) {
                            style = "border-emerald-500 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-100 font-bold";
                          } else if (isSelected) {
                            style = "border-rose-500 bg-rose-100 dark:bg-rose-950/80 text-rose-900 dark:text-rose-100 font-bold";
                          }
                        }

                        return (
                          <button
                            key={optIdx}
                            disabled={isSubmitted}
                            onClick={() => onAnswerChange(item.id, optIdx)}
                            className={`px-4 py-2 rounded-xl border text-xs sm:text-sm font-semibold transition-all ${style}`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>

                    {isSubmitted && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                        💡 {item.explanation}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Standard Questions in part */}
          {part.questions && (
            <div className="space-y-4 pt-2">
              {part.questions.map((q, qIdx) => {
                const selected = answers[q.id];
                const isCorrect = selected === q.correctAnswer;

                return (
                  <div
                    key={q.id || qIdx}
                    className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {qIdx + 1}. {q.question}
                      </p>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 shrink-0">
                        {q.points} Pkt
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {q.options.map((opt, optIdx) => {
                        const isSelected = selected === optIdx;
                        const isThisCorrect = optIdx === q.correctAnswer;

                        let btnStyle =
                          "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-amber-400";
                        if (isSelected) {
                          btnStyle = "border-amber-500 bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 font-bold";
                        }
                        if (isSubmitted) {
                          if (isThisCorrect) {
                            btnStyle = "border-emerald-500 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-100 font-bold";
                          } else if (isSelected) {
                            btnStyle = "border-rose-500 bg-rose-100 dark:bg-rose-950/80 text-rose-900 dark:text-rose-100 font-bold";
                          }
                        }

                        return (
                          <button
                            key={optIdx}
                            disabled={isSubmitted}
                            onClick={() => onAnswerChange(q.id, optIdx)}
                            className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs sm:text-sm text-left transition-all ${btnStyle}`}
                          >
                            <span className="w-5 h-5 rounded-md text-[11px] font-bold flex items-center justify-center shrink-0 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <span>{opt}</span>
                          </button>
                        );
                      })}
                    </div>

                    {isSubmitted && (
                      <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-300">
                        <span className="font-bold">Erklärung: </span>
                        {q.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
