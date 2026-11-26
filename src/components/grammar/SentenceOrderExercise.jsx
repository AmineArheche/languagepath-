import React, { useState, useEffect } from "react";
import { ArrowLeft, ArrowRight, RotateCcw, Check, Sparkles } from "lucide-react";
import { Button } from "../common/Button";

export function SentenceOrderExercise({ exercise, onAnswer, isAnswered }) {
  // Available word bank vs ordered sentence
  const [bankWords, setBankWords] = useState([]);
  const [orderedWords, setOrderedWords] = useState([]);

  useEffect(() => {
    // Initialize or reset words
    setBankWords(exercise.words.map((w, i) => ({ id: `${w}-${i}`, text: w })));
    setOrderedWords([]);
  }, [exercise]);

  // Tap word in bank -> move to sentence
  const handleSelectWord = (wordObj) => {
    if (isAnswered) return;
    setBankWords((prev) => prev.filter((w) => w.id !== wordObj.id));
    setOrderedWords((prev) => [...prev, wordObj]);
  };

  // Tap word in sentence -> move back to bank
  const handleRemoveWord = (wordObj) => {
    if (isAnswered) return;
    setOrderedWords((prev) => prev.filter((w) => w.id !== wordObj.id));
    setBankWords((prev) => [...prev, wordObj]);
  };

  // Move word left in sentence
  const handleMoveLeft = (index, e) => {
    e.stopPropagation();
    if (isAnswered || index === 0) return;
    setOrderedWords((prev) => {
      const copy = [...prev];
      const temp = copy[index - 1];
      copy[index - 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
  };

  // Move word right in sentence
  const handleMoveRight = (index, e) => {
    e.stopPropagation();
    if (isAnswered || index === orderedWords.length - 1) return;
    setOrderedWords((prev) => {
      const copy = [...prev];
      const temp = copy[index + 1];
      copy[index + 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
  };

  const handleResetOrder = () => {
    if (isAnswered) return;
    setBankWords(exercise.words.map((w, i) => ({ id: `${w}-${i}`, text: w })));
    setOrderedWords([]);
  };

  const handleSubmit = () => {
    const userSentence = orderedWords.map((w) => w.text);
    onAnswer(userSentence);
  };

  const isComplete = bankWords.length === 0 && orderedWords.length > 0;
  const isCorrect =
    isAnswered &&
    JSON.stringify(orderedWords.map((w) => w.text)) === JSON.stringify(exercise.correctOrder);

  return (
    <div className="space-y-6">
      {/* Exercise Prompt */}
      <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-center">
        <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400">
          {exercise.topicLabel}
        </span>
        <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mt-1">
          {exercise.prompt}
        </h3>
      </div>

      {/* Target Sentence Drop Slot */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-400 px-1">
          <span>Constructed Sentence:</span>
          {!isAnswered && orderedWords.length > 0 && (
            <button
              onClick={handleResetOrder}
              className="flex items-center gap-1 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>

        <div
          className={`min-h-[90px] p-4 rounded-3xl border-2 transition-all flex flex-wrap items-center gap-2.5 ${
            isAnswered
              ? isCorrect
                ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500"
                : "bg-rose-50 dark:bg-rose-950/40 border-rose-500"
              : orderedWords.length === 0
              ? "border-dashed border-slate-300 dark:border-slate-700 bg-slate-100/40 dark:bg-slate-900/40 justify-center"
              : "border-amber-400/80 dark:border-amber-600 bg-white dark:bg-slate-900 shadow-sm"
          }`}
        >
          {orderedWords.length === 0 ? (
            <div className="text-xs text-slate-400 font-semibold select-none">
              Tap words below to arrange them into this sentence
            </div>
          ) : (
            orderedWords.map((wordObj, idx) => (
              <div
                key={wordObj.id}
                onClick={() => handleRemoveWord(wordObj)}
                className={`group relative flex items-center gap-1.5 px-3 py-2 rounded-2xl font-bold text-sm select-none cursor-pointer shadow-sm transition-all ${
                  isAnswered
                    ? isCorrect
                      ? "bg-emerald-500 text-white"
                      : "bg-rose-500 text-white"
                    : "bg-amber-500 text-white hover:bg-amber-600 active:scale-95"
                }`}
                title={!isAnswered ? "Tap to remove" : ""}
              >
                {/* Position Badge */}
                <span className="text-[10px] font-black opacity-75">
                  #{idx + 1}
                </span>

                <span>{wordObj.text}</span>

                {/* Move Left / Right Arrows when constructing */}
                {!isAnswered && orderedWords.length > 1 && (
                  <div
                    className="flex items-center gap-0.5 ml-1 opacity-80 group-hover:opacity-100"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {idx > 0 && (
                      <button
                        type="button"
                        onClick={(e) => handleMoveLeft(idx, e)}
                        className="p-0.5 rounded hover:bg-white/20"
                        title="Move left"
                      >
                        <ArrowLeft className="w-3 h-3" />
                      </button>
                    )}
                    {idx < orderedWords.length - 1 && (
                      <button
                        type="button"
                        onClick={(e) => handleMoveRight(idx, e)}
                        className="p-0.5 rounded hover:bg-white/20"
                        title="Move right"
                      >
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Available Word Bank */}
      {!isAnswered && (
        <div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Available Words:
          </div>
          <div className="flex flex-wrap gap-2.5">
            {bankWords.map((wordObj) => (
              <button
                key={wordObj.id}
                type="button"
                onClick={() => handleSelectWord(wordObj)}
                className="px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-500 text-slate-800 dark:text-slate-100 font-bold text-sm shadow-sm transition-all active:scale-95"
              >
                {wordObj.text}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Check Order Action */}
      {!isAnswered && (
        <div className="flex justify-center pt-2">
          <Button
            variant="primary"
            size="lg"
            disabled={!isComplete}
            onClick={handleSubmit}
            icon={Check}
          >
            Check Sentence Order
          </Button>
        </div>
      )}

      {/* Correct Order Reveal on Mistake */}
      {isAnswered && !isCorrect && (
        <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
          <span className="font-bold text-slate-700 dark:text-slate-200">
            Correct German Order:
          </span>
          <div className="text-sm font-black text-emerald-600 dark:text-emerald-400 mt-1">
            "{exercise.correctOrder.join(" ")}"
          </div>
        </div>
      )}
    </div>
  );
}
