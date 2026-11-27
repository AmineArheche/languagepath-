import React, { useState } from "react";
import { PenTool, CheckCircle, Sparkles, BookOpen, AlertCircle } from "lucide-react";

export function ExamModuleSchreiben({ moduleData, answers = {}, onAnswerChange, isSubmitted }) {
  const [showModelAnswer, setShowModelAnswer] = useState(false);

  if (!moduleData) return null;

  return (
    <div className="space-y-8">
      {/* Module Overview Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/80 flex items-start gap-3.5">
        <div className="p-2.5 rounded-xl bg-indigo-500 text-white shrink-0">
          <PenTool className="w-5 h-5" />
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

      {/* Writing Tasks */}
      {moduleData.tasks.map((task, tIdx) => {
        const textValue = answers[task.id] || "";
        const wordCount = textValue.trim() ? textValue.trim().split(/\s+/).length : 0;
        const targetWords = task.suggestedWordCount || 30;

        return (
          <div
            key={task.id || tIdx}
            className="p-5 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 text-slate-100 shadow-sm space-y-5"
          >
            {/* Header */}
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                  {task.title}
                </span>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                  {task.instructions}
                </p>
              </div>

              {task.suggestedWordCount && (
                <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  Ziel: ca. {task.suggestedWordCount} Wörter
                </span>
              )}
            </div>

            {/* Context context box if form task */}
            {task.context && (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-700 dark:text-slate-200">
                <span className="font-bold">Angaben zur Person: </span>
                {task.context}
              </div>
            )}

            {/* Form Fields if part 1 */}
            {task.fields && (
              <div className="space-y-3 pt-1">
                {task.fields.map((field, fIdx) => {
                  const fieldKey = `${task.id}_field_${field.key}`;
                  const val = answers[fieldKey] || "";

                  return (
                    <div key={fIdx} className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {field.label}
                      </label>
                      <input
                        type="text"
                        disabled={isSubmitted}
                        value={val}
                        onChange={(e) => onAnswerChange(fieldKey, e.target.value)}
                        placeholder={field.placeholder}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      {isSubmitted && (
                        <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                          Musterlösung: {field.sampleAnswer}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Prompt Bullet Points */}
            {task.promptBulletPoints && (
              <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-800/80 space-y-2">
                <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200">
                  Schreiben Sie zu jedem der folgenden Punkte mindestens einen Satz:
                </span>
                <ul className="space-y-1">
                  {task.promptBulletPoints.map((bp, bIdx) => (
                    <li
                      key={bIdx}
                      className="text-xs text-indigo-800 dark:text-indigo-300 flex items-start gap-2"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                      <span>{bp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Writing Textarea */}
            {task.suggestedWordCount && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>Ihr deutscher Text:</span>
                  <span
                    className={`font-mono font-bold ${
                      wordCount >= targetWords * 0.8
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-amber-600 dark:text-amber-400"
                    }`}
                  >
                    {wordCount} / {targetWords} Wörter
                  </span>
                </div>

                <textarea
                  rows={6}
                  disabled={isSubmitted}
                  value={textValue}
                  onChange={(e) => onAnswerChange(task.id, e.target.value)}
                  placeholder="Schreiben Sie hier Ihren Text auf Deutsch..."
                  className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm sm:text-base leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-sans"
                />
              </div>
            )}

            {/* Model Answer (after submit) */}
            {isSubmitted && task.modelAnswer && (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Goethe-Musterlösung (Model Answer):</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed italic whitespace-pre-line">
                  "{task.modelAnswer}"
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
