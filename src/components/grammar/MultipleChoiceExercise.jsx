import React from "react";
import { CheckCircle2, XCircle } from "lucide-react";

export function MultipleChoiceExercise({ exercise, onAnswer, isAnswered, selectedAnswer }) {
  return (
    <div className="space-y-6">
      {/* Question Prompt */}
      <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-center">
        <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400">
          {exercise.topicLabel}
        </span>
        <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-2 leading-relaxed">
          {exercise.prompt}
        </h3>
      </div>

      {/* Options Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {exercise.options.map((opt) => {
          const isSelected = selectedAnswer === opt;
          const isCorrect = opt === exercise.correctAnswer;

          let style =
            "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-600 text-slate-800 dark:text-slate-100";

          if (isAnswered) {
            if (isCorrect) {
              style =
                "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-800 dark:text-emerald-200 font-black shadow-sm";
            } else if (isSelected && !isCorrect) {
              style =
                "bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-rose-800 dark:text-rose-200 font-black shadow-sm";
            } else {
              style = "opacity-40 bg-slate-100 dark:bg-slate-800 border-transparent";
            }
          } else if (isSelected) {
            style =
              "bg-amber-50 dark:bg-amber-950/40 border-amber-500 text-amber-800 dark:text-amber-200 font-bold";
          }

          return (
            <button
              key={opt}
              disabled={isAnswered}
              onClick={() => onAnswer(opt)}
              className={`p-4 rounded-2xl border-2 text-left font-bold text-base transition-all duration-150 active:scale-95 flex items-center justify-between ${style}`}
            >
              <span>{opt}</span>
              {isAnswered && isCorrect && (
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              )}
              {isAnswered && isSelected && !isCorrect && (
                <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
