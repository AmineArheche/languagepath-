import React, { useState } from "react";
import confetti from "canvas-confetti";
import { CheckCircle2, XCircle, ArrowRight, Sparkles, RotateCcw } from "lucide-react";
import { Button } from "../common/Button";
import { ProgressBar } from "../common/ProgressBar";
import { playSound } from "../../utils/soundEffects";

export function QuizEngine({ questions = [], xpReward = 25, onComplete }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const currentQ = questions[currentIndex];

  const handleSelectOption = (idx) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);

    const isCorrect =
      currentQ.type === "gender"
        ? currentQ.options
          ? idx === currentQ.correctIndex
          : idx.toLowerCase() === currentQ.correctGender.toLowerCase()
        : idx === currentQ.correctIndex;

    if (isCorrect) {
      playSound.correct();
      setScore((prev) => prev + 1);
    } else {
      playSound.incorrect();
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setIsFinished(true);
      playSound.fanfare();
      confetti({ particleCount: 90, spread: 60 });
      if (onComplete) {
        onComplete(score, questions.length);
      }
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setIsFinished(false);
  };

  if (isFinished) {
    const percentage = Math.round((score / (questions.length || 1)) * 100);
    const passed = percentage >= 60;

    return (
      <div className="text-center py-8 px-4 max-w-md mx-auto">
        <div
          className={`w-16 h-16 mx-auto mb-4 rounded-3xl flex items-center justify-center ${
            passed
              ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400"
              : "bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400"
          }`}
        >
          {passed ? <CheckCircle2 className="w-8 h-8" /> : <XCircle className="w-8 h-8" />}
        </div>

        <h3 className="text-2xl font-black text-slate-900 dark:text-white">
          {passed ? "Lesson Quiz Mastered!" : "Good Try! Keep Practicing"}
        </h3>

        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-4">
          You scored {score} out of {questions.length} ({percentage}%)
        </p>

        {passed && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-extrabold text-sm mb-6">
            <Sparkles className="w-4 h-4 fill-amber-500 text-amber-500" />
            <span>+{xpReward} XP Earned</span>
          </div>
        )}

        <div className="flex gap-3 justify-center">
          <Button variant="secondary" onClick={handleRestart} icon={RotateCcw}>
            Retake Quiz
          </Button>
        </div>
      </div>
    );
  }

  if (!currentQ) return null;

  return (
    <div className="max-w-md mx-auto py-4">
      {/* Quiz Progress */}
      <div className="mb-4">
        <ProgressBar
          value={currentIndex + 1}
          max={questions.length}
          label={`Question ${currentIndex + 1} of ${questions.length}`}
          showPercentage={false}
          color="bg-amber-500"
        />
      </div>

      {/* Prompt Card */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm mb-4">
        <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
          {currentQ.type.replace("-", " ")}
        </span>
        <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-1">
          {currentQ.prompt}
        </h4>
        {currentQ.word && (
          <div className="text-2xl font-black text-center my-3 text-slate-900 dark:text-white">
            "{currentQ.word}"
          </div>
        )}
      </div>

      {/* Options */}
      {currentQ.type === "gender" && !currentQ.options ? (
        <div className="grid grid-cols-3 gap-3 mb-4">
          {["der", "die", "das"].map((g) => {
            const isCorrect = g.toLowerCase() === currentQ.correctGender.toLowerCase();
            const isChosen = selectedOption === g;

            let btnColor = "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100";
            if (isAnswered) {
              if (isCorrect) btnColor = "bg-emerald-500 text-white";
              else if (isChosen) btnColor = "bg-rose-500 text-white";
            }

            return (
              <button
                key={g}
                disabled={isAnswered}
                onClick={() => handleSelectOption(g)}
                className={`py-4 rounded-2xl font-extrabold text-lg transition-all active:scale-95 ${btnColor}`}
              >
                {g}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="space-y-2.5 mb-4">
          {currentQ.options?.map((opt, idx) => {
            const isCorrect = idx === currentQ.correctIndex;
            const isChosen = selectedOption === idx;

            let style =
              "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-amber-400";
            if (isAnswered) {
              if (isCorrect) {
                style = "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-800 dark:text-emerald-200 font-bold";
              } else if (isChosen) {
                style = "bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-rose-800 dark:text-rose-200 font-bold";
              }
            }

            return (
              <button
                key={idx}
                disabled={isAnswered}
                onClick={() => handleSelectOption(idx)}
                className={`w-full p-4 text-left rounded-2xl border-2 transition-all flex items-center justify-between ${style}`}
              >
                <span className="text-sm font-medium">{opt}</span>
                {isAnswered && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />}
                {isAnswered && isChosen && !isCorrect && <XCircle className="w-5 h-5 text-rose-500 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}

      {/* Explanation & Next Button */}
      {isAnswered && (
        <div className="space-y-3 animate-in fade-in duration-200">
          {currentQ.explanation && (
            <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 text-xs text-slate-600 dark:text-slate-300">
              <span className="font-bold text-slate-900 dark:text-slate-100">Explanation: </span>
              {currentQ.explanation}
            </div>
          )}

          <Button variant="primary" size="lg" className="w-full" onClick={handleNext} icon={ArrowRight}>
            {currentIndex + 1 < questions.length ? "Continue" : "Finish Quiz"}
          </Button>
        </div>
      )}
    </div>
  );
}
