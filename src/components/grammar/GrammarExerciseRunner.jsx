import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import { CheckCircle2, XCircle, ArrowRight, RotateCcw, Sparkles, BookOpen } from "lucide-react";
import { FillInBlankExercise } from "./FillInBlankExercise";
import { MultipleChoiceExercise } from "./MultipleChoiceExercise";
import { SentenceOrderExercise } from "./SentenceOrderExercise";
import { Button } from "../common/Button";
import { ProgressBar } from "../common/ProgressBar";
import { useProgress } from "../../context/ProgressContext";
import { useExercise } from "../../context/ExerciseContext";
import { playSound } from "../../utils/soundEffects";

export function GrammarExerciseRunner({ exercises = [], onFinish, title = "Grammar Practice" }) {
  const { recordGrammarAttempt, recordError } = useProgress();
  const exerciseState = useExercise();
  const registerExerciseContext = exerciseState?.registerExerciseContext;
  const clearExerciseContext = exerciseState?.clearExerciseContext;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const currentExercise = exercises[currentIndex];

  // Register active grammar exercise with ExerciseContext for ContextTutor
  useEffect(() => {
    if (!registerExerciseContext || !currentExercise) return;
    registerExerciseContext({
      type: "grammar",
      level: currentExercise.level || "A1",
      question: currentExercise.prompt || currentExercise.topicLabel || "Grammar Exercise",
      passage: currentExercise.explanation || "",
      options: currentExercise.options || [],
      correctAnswer: Array.isArray(currentExercise.correctOrder)
        ? currentExercise.correctOrder.join(" ")
        : String(currentExercise.correctAnswer || ""),
      userAnswer:
        selectedAnswer !== null
          ? (Array.isArray(selectedAnswer) ? selectedAnswer.join(" ") : String(selectedAnswer))
          : null,
      attemptCount: isAnswered ? 1 : 0
    });
  }, [currentExercise, selectedAnswer, isAnswered, registerExerciseContext]);

  useEffect(() => {
    return () => {
      if (clearExerciseContext) clearExerciseContext();
    };
  }, [clearExerciseContext]);

  const handleAnswer = (answer) => {
    if (isAnswered || !currentExercise) return;

    setSelectedAnswer(answer);
    setIsAnswered(true);

    let correct = false;
    if (currentExercise.type === "sentence-order") {
      correct =
        JSON.stringify(answer) === JSON.stringify(currentExercise.correctOrder);
    } else {
      correct = answer === currentExercise.correctAnswer;
    }

    setIsCorrect(correct);

    if (correct) {
      playSound.correct();
      setScore((prev) => prev + 1);
    } else {
      playSound.incorrect();
    }

    // Record mistake/accuracy tracking in ProgressContext
    recordGrammarAttempt(currentExercise.topic, currentExercise.topicLabel, correct);

    if (!correct && recordError) {
      const topic = (currentExercise.topic || "").toLowerCase();
      let category = "case";
      let subcategory = topic;

      if (topic.includes("article") || topic.includes("gender")) {
        category = "article-gender";
      } else if (topic.includes("sentence-order") || topic.includes("v2")) {
        category = "verb-position";
        subcategory = "V2";
      } else if (topic.includes("verb") || topic.includes("conjugat")) {
        category = "conjugation";
      } else if (topic.includes("prep")) {
        category = "preposition";
      } else if (topic.includes("tense") || topic.includes("perfekt")) {
        category = "tense";
        subcategory = "Perfekt";
      } else if (topic.includes("connect") || topic.includes("weil") || topic.includes("obwohl")) {
        category = "connector";
      }

      recordError({
        module: "grammar",
        level: currentExercise.level || "A1",
        category,
        subcategory,
        learnerText: Array.isArray(answer) ? answer.join(" ") : String(answer || ""),
        correct: Array.isArray(currentExercise.correctOrder)
          ? currentExercise.correctOrder.join(" ")
          : String(currentExercise.correctAnswer || ""),
        ruleId: currentExercise.topic || "grammar",
        itemId: currentExercise.id
      });
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < exercises.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
      setIsCorrect(false);
    } else {
      setIsCompleted(true);
      playSound.fanfare();
      confetti({ particleCount: 100, spread: 70 });
      if (onFinish) onFinish();
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setIsCorrect(false);
    setScore(0);
    setIsCompleted(false);
  };

  if (!exercises.length) {
    return (
      <div className="text-center py-16 px-4">
        <p className="text-slate-500">No exercises found for this category.</p>
      </div>
    );
  }

  if (isCompleted) {
    const accuracy = Math.round((score / exercises.length) * 100);
    return (
      <div className="text-center py-12 px-4 max-w-md mx-auto animate-in zoom-in-95 duration-300">
        <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20">
          <Sparkles className="w-10 h-10" />
        </div>
        <h3 className="text-2xl font-black text-slate-900 dark:text-white">
          Grammar Session Complete!
        </h3>
        <p className="text-lg font-bold text-amber-600 dark:text-amber-400 mt-2">
          Score: {score} / {exercises.length} ({accuracy}%)
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-6">
          Your mistakes have been logged to update your personalized Weak Spots dashboard.
        </p>
        <div className="flex gap-3 justify-center">
          <Button variant="secondary" onClick={handleRestart} icon={RotateCcw}>
            Practice Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Exercise Progress Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
            Exercise {currentIndex + 1} of {exercises.length}
          </span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase">
            {currentExercise.type.replace("-", " ")}
          </span>
        </div>
        <div className="w-36 bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
          <div
            className="bg-amber-500 h-full rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / exercises.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Exercise Body */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md">
        {currentExercise.type === "fill-blank" && (
          <FillInBlankExercise
            exercise={currentExercise}
            onAnswer={handleAnswer}
            isAnswered={isAnswered}
            selectedAnswer={selectedAnswer}
          />
        )}

        {currentExercise.type === "multiple-choice" && (
          <MultipleChoiceExercise
            exercise={currentExercise}
            onAnswer={handleAnswer}
            isAnswered={isAnswered}
            selectedAnswer={selectedAnswer}
          />
        )}

        {currentExercise.type === "sentence-order" && (
          <SentenceOrderExercise
            exercise={currentExercise}
            onAnswer={handleAnswer}
            isAnswered={isAnswered}
          />
        )}

        {/* Instant Feedback & English Explanation */}
        {isAnswered && (
          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 animate-in fade-in duration-200 space-y-4">
            <div
              className={`p-4 rounded-2xl border text-left ${
                isCorrect
                  ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200"
                  : "bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200"
              }`}
            >
              <div className="flex items-center gap-2 font-black text-base mb-1">
                {isCorrect ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>Richtig! (Correct)</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-rose-600" />
                    <span>Falsch (Incorrect)</span>
                  </>
                )}
              </div>

              {/* Explanation of WHY the answer is right or wrong in English */}
              <div className="text-xs sm:text-sm mt-2 leading-relaxed">
                <span className="font-extrabold mr-1">Why:</span>
                {currentExercise.explanation}
              </div>
            </div>

            <div className="flex justify-end">
              <Button variant="primary" size="lg" onClick={handleNext} icon={ArrowRight}>
                {currentIndex + 1 < exercises.length ? "Continue" : "View Results"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
