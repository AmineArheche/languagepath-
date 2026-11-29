import React, { useState } from "react";
import confetti from "canvas-confetti";
import {
  Compass,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
  ArrowRight,
  RotateCcw,
  BookOpen,
  Award,
  Layers,
  X
} from "lucide-react";
import {
  PLACEMENT_QUESTIONS,
  evaluatePlacementTest
} from "../../data/placementQuestions";
import { useProgress } from "../../context/ProgressContext";
import { Button } from "../common/Button";
import { Card } from "../common/Card";
import { playSound } from "../../utils/soundEffects";

export function PlacementTestModal({ isOpen, onClose, onComplete, customQuestions }) {
  const { placementQuestions: ctxQuestions } = useProgress();
  const questions = customQuestions || ctxQuestions || PLACEMENT_QUESTIONS;

  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState([]); // [{ questionId, answerIndex, isCorrect }]
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [testResult, setTestResult] = useState(null);

  if (!isOpen) return null;

  const currentQ = questions[currentIdx] || questions[0];

  const handleSelectOption = (optIdx) => {
    if (isAnswerSubmitted) return;
    setSelectedOpt(optIdx);
    setIsAnswerSubmitted(true);

    const isCorrect = optIdx === currentQ.correctAnswer;
    if (isCorrect) {
      playSound.correct();
    } else {
      playSound.incorrect();
    }

    const updatedAnswers = [
      ...answers,
      {
        questionId: currentQ.id,
        answerIndex: optIdx,
        isCorrect
      }
    ];
    setAnswers(updatedAnswers);
  };

  const handleNextQuestion = () => {
    if (currentIdx + 1 < questions.length) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedOpt(null);
      setIsAnswerSubmitted(false);
    } else {
      const result = evaluatePlacementTest(answers);
      setTestResult(result);
      playSound.fanfare();
      confetti({ particleCount: 80, spread: 60 });
    }
  };

  const handleApplyResult = () => {
    if (onComplete && testResult) {
      onComplete(testResult);
    }
    onClose();
  };

  const handleSkip = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Close / Skip button */}
        <button
          onClick={handleSkip}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Close Placement Test"
        >
          <X className="w-5 h-5" />
        </button>

        {!testResult ? (
          <>
            {/* Header & Progress */}
            <div className="space-y-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-extrabold text-xs uppercase tracking-wider">
                  <Compass className="w-3.5 h-3.5" />
                  <span>Adaptive Einstufungstest (Placement Test)</span>
                </div>
                <button
                  onClick={handleSkip}
                  className="text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  Skip Test (Start at Unit 1)
                </button>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Frage {currentIdx + 1} von {questions.length}</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400 uppercase">
                  Niveau {currentQ.difficulty} &bull; {currentQ.category}
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${((currentIdx + 1) / questions.length) * 100}%`
                  }}
                />
              </div>
            </div>

            {/* Passage if Reading */}
            {currentQ.passage && (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-serif leading-relaxed text-slate-800 dark:text-slate-200">
                {currentQ.passage}
              </div>
            )}

            {/* Question Prompt */}
            <div className="space-y-2">
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-snug">
                {currentQ.question}
              </h3>
            </div>

            {/* Options Grid */}
            <div className="space-y-2.5">
              {currentQ.options.map((opt, optIdx) => {
                const isSelected = selectedOpt === optIdx;
                const isCorrect = optIdx === currentQ.correctAnswer;

                let btnStyle =
                  "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:border-indigo-400";

                if (isSelected) {
                  btnStyle = "border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 font-bold";
                }

                if (isAnswerSubmitted) {
                  if (isCorrect) {
                    btnStyle = "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-100 font-bold";
                  } else if (isSelected && !isCorrect) {
                    btnStyle = "border-rose-500 bg-rose-50 dark:bg-rose-950/60 text-rose-900 dark:text-rose-100 font-bold";
                  }
                }

                return (
                  <button
                    key={optIdx}
                    disabled={isAnswerSubmitted}
                    onClick={() => handleSelectOption(optIdx)}
                    className={`w-full p-4 rounded-2xl border text-sm sm:text-base text-left flex items-center justify-between gap-3 transition-all ${btnStyle}`}
                  >
                    <span>{opt}</span>
                    {isAnswerSubmitted && isCorrect && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    )}
                    {isAnswerSubmitted && isSelected && !isCorrect && (
                      <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explanation & Next Button */}
            {isAnswerSubmitted && (
              <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-800/80 space-y-3 animate-in fade-in">
                <div className="text-xs text-indigo-900 dark:text-indigo-200 leading-relaxed flex items-start gap-2">
                  <HelpCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                  <span>{currentQ.explanation}</span>
                </div>

                <div className="flex justify-end pt-1">
                  <Button
                    variant="primary"
                    size="md"
                    onClick={handleNextQuestion}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold"
                  >
                    <span>{currentIdx + 1 === questions.length ? "Ergebnis ansehen" : "Nächste Frage"}</span>
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          /* RESULT SCREEN */
          <div className="text-center space-y-6 py-2">
            <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-slate-900 text-white space-y-3">
              <span className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-white/20">
                Einstufungsergebnis (Placement Result)
              </span>

              <h2 className="text-3xl sm:text-4xl font-black">
                Niveau {testResult.recommendedLevel}
              </h2>

              <p className="text-sm text-indigo-100 max-w-md mx-auto leading-relaxed">
                {testResult.levelDescription}
              </p>

              <div className="pt-2 text-xs font-bold text-indigo-200">
                {testResult.correctCount} von {testResult.total} Fragen richtig beantwortet ({testResult.scorePercent}%)
              </div>
            </div>

            {/* Recommended Unit Box */}
            <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-left space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-400 block">
                Empfohlener Startpunkt im Lernpfad:
              </span>
              <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                {testResult.recommendedUnitTitle}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Wir schalten alle vorherigen Einheiten automatisch für Sie frei, damit Sie direkt auf Ihrem tatsächlichen Sprachniveau einsteigen können.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 justify-center pt-2">
              <Button
                variant="primary"
                size="lg"
                onClick={handleApplyResult}
                className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold shadow-md"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Empfohlene Einheit starten ({testResult.recommendedUnitTitle.split(":")[0]})
              </Button>

              <Button
                variant="secondary"
                size="md"
                onClick={handleSkip}
                className="w-full sm:w-auto text-xs"
              >
                Ganz von vorne beginnen (Unit 1)
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
