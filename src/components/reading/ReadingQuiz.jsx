import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import {
  CheckCircle2,
  XCircle,
  Sparkles,
  RotateCcw,
  HelpCircle,
  Trophy,
  Volume2,
  Award
} from "lucide-react";
import { Button } from "../common/Button";
import { playSound } from "../../utils/soundEffects";
import { useSpeech } from "../../hooks/useSpeech";
import { useProgress } from "../../context/ProgressContext";
import { useExercise } from "../../context/ExerciseContext";

export function ReadingQuiz({ readingText, onQuizCompleted, onHighlightEvidence }) {
  const { recordReadingCompletion, getReadingScore, recordError } = useProgress();
  const exerciseState = useExercise();
  const updateExerciseContext = exerciseState?.updateExerciseContext;
  const { speak } = useSpeech({ lang: "de-DE", rate: 0.9 });

  const questions = readingText?.questions || [];
  const textId = readingText?.id;

  // Stored state: answers { [questionIndex]: selectedOptionIndex }
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [completed, setCompleted] = useState(false);
  const [earnedXp, setEarnedXp] = useState(0);

  // Check past score if any
  const previousRecord = getReadingScore(textId);

  // Reset when text changes
  useEffect(() => {
    setSelectedAnswers({});
    setCompleted(false);
    setEarnedXp(0);
  }, [textId]);

  const handleSelectOption = (qIdx, optIdx) => {
    // If this question is already answered, don't allow changing
    if (selectedAnswers[qIdx] !== undefined) return;

    const question = questions[qIdx];
    const isCorrect = optIdx === question.correctIndex;

    const newAnswers = {
      ...selectedAnswers,
      [qIdx]: optIdx
    };
    setSelectedAnswers(newAnswers);

    // Highlight the evidence span in the passage
    if (question.evidence && onHighlightEvidence) {
      onHighlightEvidence(question.evidence);
    }

    if (updateExerciseContext) {
      updateExerciseContext({
        question: question.question,
        options: question.options,
        correctAnswer: question.options[question.correctIndex],
        userAnswer: question.options[optIdx],
        attemptCount: Object.keys(newAnswers).length
      });
    }

    if (isCorrect) {
      playSound.correct();
    } else {
      playSound.incorrect();
      if (recordError) {
        recordError({
          module: "reading",
          level: readingText?.level || "A1",
          category: question.errorCategory || "comprehension-detail",
          subcategory: "reading-comprehension",
          learnerText: question.options[optIdx] || "",
          correct: question.options[question.correctIndex] || "",
          ruleId: `reading-${question.errorCategory || "comprehension"}`,
          itemId: question.id || `q-${textId}-${qIdx}`
        });
      }
    }

    // Check if all questions are now answered
    if (Object.keys(newAnswers).length === questions.length) {
      let finalScore = 0;
      questions.forEach((q, idx) => {
        if (newAnswers[idx] === q.correctIndex) {
          finalScore += 1;
        }
      });

      setCompleted(true);
      const xp = recordReadingCompletion(textId, finalScore, questions.length);
      setEarnedXp(xp);

      if (finalScore >= 2) {
        playSound.fanfare();
        confetti({ particleCount: 75, spread: 60, origin: { y: 0.8 } });
      }

      if (onQuizCompleted) {
        onQuizCompleted({ score: finalScore, total: questions.length, xp });
      }
    }
  };

  const handleResetQuiz = () => {
    setSelectedAnswers({});
    setCompleted(false);
    setEarnedXp(0);
  };

  const answeredCount = Object.keys(selectedAnswers).length;
  const currentScore = questions.reduce((acc, q, idx) => {
    return acc + (selectedAnswers[idx] === q.correctIndex ? 1 : 0);
  }, 0);

  if (!questions || questions.length === 0) {
    return null;
  }

  return (
    <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-800">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
              <HelpCircle className="w-5 h-5" />
            </span>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Textverständnis (Comprehension Check)
            </h3>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Answer the 3 questions below to test your understanding of the text.
          </p>
        </div>

        {/* Status / Score Pill */}
        <div className="flex items-center gap-2">
          {previousRecord && !completed && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              Previous best: {previousRecord.bestScore}/{previousRecord.total} (
              {previousRecord.bestPercentage}%)
            </span>
          )}
          <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            {answeredCount}/{questions.length} Answered
          </span>
        </div>
      </div>

      {/* Completion Banner */}
      {completed && (
        <div className="mb-6 p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-amber-500 via-amber-600 to-orange-500 text-white shadow-lg shadow-amber-500/20">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-center sm:text-left">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                <Trophy className="w-8 h-8 text-amber-100" />
              </div>
              <div>
                <h4 className="text-lg font-black tracking-tight">
                  {currentScore === questions.length
                    ? "Perfekt! Ausgezeichnet! 🎉"
                    : currentScore >= 2
                      ? "Sehr gut gemacht! 👍"
                      : "Übung macht den Meister! 💪"}
                </h4>
                <p className="text-sm text-amber-100 mt-0.5">
                  You scored <span className="font-extrabold">{currentScore} out of {questions.length}</span> correct
                  {earnedXp > 0 && ` and earned +${earnedXp} XP!`}
                </p>
              </div>
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={handleResetQuiz}
              className="bg-white text-amber-700 hover:bg-amber-50 shadow-sm shrink-0"
            >
              <RotateCcw className="w-4 h-4 mr-1.5" />
              Try Again
            </Button>
          </div>
        </div>
      )}

      {/* Questions List */}
      <div className="space-y-6">
        {questions.map((q, qIdx) => {
          const selectedOpt = selectedAnswers[qIdx];
          const isAnswered = selectedOpt !== undefined;
          const isCorrect = selectedOpt === q.correctIndex;

          return (
            <div
              key={q.id || qIdx}
              className={`p-5 sm:p-6 rounded-3xl border transition-all duration-200 ${!isAnswered
                ? "bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-sm"
                : isCorrect
                  ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800"
                  : "bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800"
                }`}
            >
              {/* Question Top Row */}
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-start gap-2.5">
                  <span className="shrink-0 text-xs font-black px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    Frage {qIdx + 1}
                  </span>
                  <p className="font-bold text-slate-800 dark:text-slate-100 text-base leading-snug">
                    {q.question}
                  </p>
                </div>

                <button
                  onClick={() => speak(q.question)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
                  title="Listen to question"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {q.options.map((option, optIdx) => {
                  const isThisSelected = selectedOpt === optIdx;
                  const isThisCorrect = optIdx === q.correctIndex;

                  let optionStyle =
                    "border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-slate-700 dark:text-slate-200 hover:border-amber-400 dark:hover:border-amber-500 hover:bg-amber-50/30 dark:hover:bg-amber-950/30";

                  if (isAnswered) {
                    if (isThisCorrect) {
                      optionStyle =
                        "border-emerald-500 bg-emerald-100/70 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-100 font-semibold shadow-sm";
                    } else if (isThisSelected) {
                      optionStyle =
                        "border-rose-500 bg-rose-100/70 dark:bg-rose-950/60 text-rose-900 dark:text-rose-100 font-semibold";
                    } else {
                      optionStyle =
                        "border-slate-200/60 dark:border-slate-800/60 bg-transparent text-slate-400 dark:text-slate-500 opacity-60";
                    }
                  }

                  return (
                    <button
                      key={optIdx}
                      disabled={isAnswered}
                      onClick={() => handleSelectOption(qIdx, optIdx)}
                      className={`flex items-center justify-between p-3.5 rounded-2xl border text-sm text-left transition-all active:scale-[0.99] disabled:cursor-default ${optionStyle}`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 bg-white/70 dark:bg-slate-900/60 text-slate-600 dark:text-slate-300">
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span>{option}</span>
                      </div>

                      {isAnswered && (
                        <div>
                          {isThisCorrect && (
                            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                          )}
                          {!isThisCorrect && isThisSelected && (
                            <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Pedagogical Explanation & Distractor Rationale */}
              {isAnswered && (
                <div className="space-y-3 mt-4">
                  {!isCorrect && (
                    <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/80 text-xs sm:text-sm text-rose-900 dark:text-rose-200 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-rose-700 dark:text-rose-300">
                        <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                        <span>Warum "{q.options[selectedOpt]}" falsch ist (Distractor Rationale):</span>
                      </div>
                      <p className="pl-5 text-slate-700 dark:text-slate-300 leading-relaxed">
                        {q.distractorRationale?.[selectedOpt] ||
                          q.distractorRationale?.[String(selectedOpt)] ||
                          q.distractorRationale?.[q.options[selectedOpt]] ||
                          "Diese Option widerspricht den Tatsachen im Lesetext."}
                      </p>
                    </div>
                  )}

                  <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 text-xs sm:text-sm text-emerald-900 dark:text-emerald-200 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-bold text-emerald-700 dark:text-emerald-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>
                          Richtige Antwort ({String.fromCharCode(65 + q.correctIndex)}: "{q.options[q.correctIndex]}"):
                        </span>
                      </div>
                      {q.evidence && (
                        <button
                          type="button"
                          onClick={() => onHighlightEvidence && onHighlightEvidence(q.evidence)}
                          className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 underline hover:no-underline flex items-center gap-1 shrink-0"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                          Beleg im Text hervorheben
                        </button>
                      )}
                    </div>
                    <p className="pl-5 text-slate-700 dark:text-slate-300 leading-relaxed">
                      {q.explanation}
                    </p>
                    {q.evidence?.text && (
                      <p className="pl-5 text-[11px] italic text-slate-500 dark:text-slate-400">
                        Textbeleg: "{q.evidence.text}"
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
