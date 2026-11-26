import React, { useState } from "react";
import { CheckCircle2, XCircle, Sparkles } from "lucide-react";
import { AudioButton } from "../common/AudioButton";

export function FillInBlankExercise({ exercise, onAnswer, isAnswered, selectedAnswer }) {
  const parts = exercise.prompt.split("_____");

  return (
    <div className="space-y-6">
      {/* Prompt sentence with styled blank */}
      <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-center">
        <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400">
          {exercise.topicLabel}
        </span>

        <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-3 leading-relaxed">
          {parts[0]}
          <span
            className={`inline-block px-3 py-1 mx-1.5 rounded-xl border-b-4 font-black transition-all ${
              selectedAnswer
                ? isAnswered
                  ? selectedAnswer === exercise.correctAnswer
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-200 border-emerald-500"
                    : "bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-200 border-rose-500"
                  : "bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-200 border-amber-500"
                : "border-slate-400 dark:border-slate-500 bg-white dark:bg-slate-900 text-slate-400 min-w-[90px]"
            }`}
          >
            {selectedAnswer || "_____"}
          </span>
          {parts[1]}
        </div>
      </div>

      {/* Choice Options */}
      <div>
        <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 text-center">
          Choose the correct word:
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {exercise.options.map((opt) => {
            const isSelected = selectedAnswer === opt;
            const isCorrect = opt === exercise.correctAnswer;

            let buttonStyle =
              "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-600 text-slate-800 dark:text-slate-100";

            if (isAnswered) {
              if (isCorrect) {
                buttonStyle =
                  "bg-emerald-500 text-white border-emerald-600 font-black shadow-md shadow-emerald-500/20";
              } else if (isSelected && !isCorrect) {
                buttonStyle =
                  "bg-rose-500 text-white border-rose-600 font-black shadow-md shadow-rose-500/20";
              } else {
                buttonStyle = "opacity-40 bg-slate-100 dark:bg-slate-800 border-transparent";
              }
            } else if (isSelected) {
              buttonStyle =
                "bg-amber-500 text-white border-amber-600 font-bold shadow-md shadow-amber-500/20";
            }

            return (
              <button
                key={opt}
                disabled={isAnswered}
                onClick={() => onAnswer(opt)}
                className={`py-3.5 px-4 rounded-2xl border-2 font-bold text-base transition-all duration-150 active:scale-95 flex items-center justify-center gap-2 ${buttonStyle}`}
              >
                <span>{opt}</span>
                {isAnswered && isCorrect && <CheckCircle2 className="w-4 h-4 shrink-0" />}
                {isAnswered && isSelected && !isCorrect && (
                  <XCircle className="w-4 h-4 shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
