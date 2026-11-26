import React, { useState } from "react";
import confetti from "canvas-confetti";
import {
  Split,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  BookOpen,
  Award
} from "lucide-react";
import { GRAMMAR_CONTRASTS } from "../../data/grammarContrasts";
import { useProgress } from "../../context/ProgressContext";
import { Button } from "../common/Button";
import { Card } from "../common/Card";
import { playSound } from "../../utils/soundEffects";

export function GrammarContrastRunner({ onFinish }) {
  const { recordGrammarAttempt, recordError } = useProgress();

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentIdx, setCurrentIdx] = useState(0);
  const [currentPairIdx, setCurrentPairIdx] = useState(0); // 0 = First sentence, 1 = Second sentence
  const [answersState, setAnswersState] = useState({}); // { [pairId]: { selected, isCorrect } }
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  // Filter contrasts based on category
  const filteredContrasts = GRAMMAR_CONTRASTS.filter((item) => {
    if (selectedCategory === "all") return true;
    if (selectedCategory === "wechsel") return item.id.includes("wechsel");
    if (selectedCategory === "pronouns") return item.id.includes("pronouns");
    if (selectedCategory === "connectors") return item.id.includes("connectors");
    return true;
  });

  const currentContrast = filteredContrasts[currentIdx] || filteredContrasts[0];
  const currentPair = currentContrast?.pairs?.[currentPairIdx];

  const handleSelectOption = (option) => {
    if (!currentPair) return;
    if (answersState[currentPair.id]) return; // already answered

    const isCorrect = option === currentPair.correctAnswer;
    if (isCorrect) {
      playSound.correct();
      setScore((prev) => prev + 15);
    } else {
      playSound.incorrect();
      if (recordError) {
        let category = "case";
        if (currentContrast.id.includes("connectors")) category = "connector";
        else if (currentContrast.id.includes("wechsel")) category = "preposition";

        recordError({
          module: "grammar-contrast",
          level: "A2",
          category,
          subcategory: currentPair.caseType || "contrast",
          learnerText: option,
          correct: currentPair.correctAnswer,
          ruleId: currentContrast.id,
          itemId: currentPair.id
        });
      }
    }

    recordGrammarAttempt("grammar-contrast", "Grammar Contrasts", isCorrect);

    setAnswersState((prev) => ({
      ...prev,
      [currentPair.id]: {
        selected: option,
        isCorrect
      }
    }));
  };

  const handleNext = () => {
    if (!currentContrast) return;

    if (currentPairIdx === 0 && currentContrast.pairs.length > 1) {
      setCurrentPairIdx(1);
    } else {
      if (currentIdx + 1 < filteredContrasts.length) {
        setCurrentIdx((prev) => prev + 1);
        setCurrentPairIdx(0);
      } else {
        setIsFinished(true);
        playSound.fanfare();
        confetti({ particleCount: 70, spread: 60 });
      }
    }
  };

  const handleReset = (cat = selectedCategory) => {
    setSelectedCategory(cat);
    setCurrentIdx(0);
    setCurrentPairIdx(0);
    setAnswersState({});
    setScore(0);
    setIsFinished(false);
  };

  if (!currentContrast) return null;

  return (
    <div className="space-y-6">
      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: "all", label: `All Contrasts (${GRAMMAR_CONTRASTS.length})` },
          { id: "wechsel", label: "Wechselpräpositionen & Verben" },
          { id: "pronouns", label: "Akkusativ vs. Dativ Pronomen" },
          { id: "connectors", label: "Satzverbinder (weil / denn / deshalb)" }
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleReset(cat.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all ${
              selectedCategory === cat.id
                ? "bg-indigo-600 text-white shadow-sm"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {isFinished ? (
        /* Results Screen */
        <Card className="p-8 sm:p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
            <Award className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">
            Contrast Session Complete!
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
            You've practiced distinguishing minimal grammatical pairs (Akkusativ vs. Dativ, positional verbs, and clause connectors).
          </p>
          <div className="text-xl font-black text-indigo-600 dark:text-indigo-400">
            Total Score: {score} XP
          </div>

          <div className="pt-4 flex justify-center gap-3">
            <Button variant="primary" onClick={() => handleReset(selectedCategory)} icon={RotateCcw}>
              Practice Again
            </Button>
            {onFinish && (
              <Button variant="secondary" onClick={onFinish}>
                Exit Contrast Mode
              </Button>
            )}
          </div>
        </Card>
      ) : (
        /* Active Contrast Runner */
        <div className="space-y-5">
          {/* Progress & Contrast Title */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                <Split className="w-4 h-4" />
              </span>
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Contrast {currentIdx + 1} of {filteredContrasts.length}
                </span>
                <h3 className="font-black text-slate-900 dark:text-white text-base">
                  {currentContrast.theme}
                </h3>
              </div>
            </div>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-extrabold text-xs">
              {currentContrast.contrastLabel}
            </span>
          </div>

          {/* Contrast Pedagogical Rule Box */}
          <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-800 text-xs text-indigo-950 dark:text-indigo-200 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-indigo-900 dark:text-indigo-100">
              <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span>Die Kontrast-Regel (The Contrast Rule):</span>
            </div>
            <p className="leading-relaxed pl-5 font-medium">
              {currentContrast.ruleExplanation}
            </p>
          </div>

          {/* Side-by-Side / Step-by-Step Exercise Pair */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentContrast.pairs.map((pair, pIdx) => {
              const pairAnswer = answersState[pair.id];
              const isCurrentActive = pIdx === currentPairIdx;
              const isPassed = pairAnswer !== undefined;

              return (
                <div
                  key={pair.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    isCurrentActive
                      ? "bg-white dark:bg-slate-900 border-indigo-500 shadow-md ring-2 ring-indigo-500/20"
                      : isPassed
                      ? pairAnswer.isCorrect
                        ? "bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/60"
                        : "bg-rose-50/40 dark:bg-rose-950/20 border-rose-300 dark:border-rose-800/60"
                      : "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-60 pointer-events-none"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                        pair.caseType === "Akkusativ"
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                          : pair.caseType === "Dativ"
                          ? "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300"
                          : "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300"
                      }`}
                    >
                      Teil {pIdx + 1}: {pair.caseType || "Option"}
                    </span>

                    {pairAnswer && (
                      <span className="flex items-center gap-1 text-xs font-bold">
                        {pairAnswer.isCorrect ? (
                          <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4" /> Richtig!
                          </span>
                        ) : (
                          <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1">
                            <XCircle className="w-4 h-4" /> Falsch
                          </span>
                        )}
                      </span>
                    )}
                  </div>

                  <p className="font-black text-slate-900 dark:text-white text-base leading-snug mb-4">
                    {pair.question}
                  </p>

                  {/* Multiple Choice Options */}
                  <div className="grid grid-cols-2 gap-2">
                    {pair.options.map((opt) => {
                      let btnStyle =
                        "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-indigo-400";

                      if (pairAnswer) {
                        if (opt === pair.correctAnswer) {
                          btnStyle = "bg-emerald-500 text-white border-emerald-500 font-extrabold";
                        } else if (opt === pairAnswer.selected && !pairAnswer.isCorrect) {
                          btnStyle = "bg-rose-500 text-white border-rose-500 font-extrabold";
                        } else {
                          btnStyle = "opacity-40 bg-slate-100 dark:bg-slate-800 border-slate-200";
                        }
                      }

                      return (
                        <button
                          key={opt}
                          type="button"
                          disabled={!isCurrentActive || isPassed}
                          onClick={() => handleSelectOption(opt)}
                          className={`py-2.5 px-3 rounded-xl border text-sm font-bold transition-all text-center ${btnStyle}`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>

                  {/* Immediate Explanation */}
                  {pairAnswer && (
                    <div className="mt-3.5 p-3 rounded-xl bg-slate-100/70 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 space-y-1">
                      <span className="font-bold text-slate-900 dark:text-white block">
                        💡 Erklärung:
                      </span>
                      <p>{pair.explanation}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Action Row */}
          {answersState[currentPair?.id] && (
            <div className="flex justify-end pt-2">
              <Button variant="primary" size="lg" onClick={handleNext} icon={ArrowRight}>
                {currentPairIdx === 0 ? "Next Part of Contrast" : "Next Contrast"}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
