import React, { useState, useEffect, useCallback } from "react";
import confetti from "canvas-confetti";
import { Trophy, Flame, HelpCircle, RotateCcw, ArrowRight, BookOpen } from "lucide-react";
import { derDieDasBank, genderRules } from "../../data/derDieDasSeed";
import { NOUN_GENDER_RULES, analyzeNounGender } from "../../data/nounGenderRules";
import { useProgress } from "../../context/ProgressContext";
import { AudioButton } from "../common/AudioButton";
import { Button } from "../common/Button";
import { playSound } from "../../utils/soundEffects";
import { Modal } from "../common/Modal";

export function GenderDrill() {
  const { progress, recordGenderDrillScore, recordError, drillConfig, activeTargetLanguage } = useProgress();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [shuffledBank, setShuffledBank] = useState([]);
  const [lastAnswer, setLastAnswer] = useState(null); // { selected, isCorrect, correctGender, hint, suffixAnalysis }
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  // Shuffle questions on mount or language switch
  useEffect(() => {
    resetGame();
  }, [activeTargetLanguage, drillConfig]);

  const resetGame = () => {
    const rawItems = (drillConfig?.items && drillConfig.items.length > 0)
      ? drillConfig.items.map((item) => ({
          word: item.word,
          gender: item.answer,
          translation: item.translation,
          hint: item.rule
        }))
      : derDieDasBank;

    const shuffled = [...rawItems].sort(() => 0.5 - Math.random());
    setShuffledBank(shuffled);
    setCurrentIndex(0);
    setScore(0);
    setStreak(0);
    setLastAnswer(null);
    setGameOver(false);
  };

  const currentItem = shuffledBank[currentIndex];

  const handleGuess = useCallback(
    (guessedGender) => {
      if (!currentItem || lastAnswer) return;

      const isCorrect = guessedGender.toLowerCase() === currentItem.gender.toLowerCase();
      const suffixAnalysis = analyzeNounGender(currentItem.word);

      if (isCorrect) {
        playSound.correct();
        const newStreak = streak + 1;
        setStreak(newStreak);
        setScore((prev) => prev + 10 + Math.min(newStreak * 2, 20));

        if (newStreak % 10 === 0) {
          confetti({ particleCount: 50, spread: 60 });
        }
      } else {
        playSound.incorrect();
        setStreak(0);

        // Re-queue the noun to the end of the session so learner practices it again
        setShuffledBank((prev) => [...prev, currentItem]);

        if (recordError) {
          recordError({
            module: "gender-drill",
            level: "A1",
            category: "article-gender",
            subcategory: currentItem.gender,
            learnerText: guessedGender,
            correct: currentItem.gender,
            ruleId: suffixAnalysis?.rule?.id || "noun-gender",
            itemId: currentItem.id || currentItem.word,
            word: currentItem.word,
            english: currentItem.english,
            plural: currentItem.plural
          });
        }
      }

      setLastAnswer({
        selected: guessedGender,
        isCorrect,
        correctGender: currentItem.gender,
        hint: currentItem.hint,
        suffixAnalysis
      });
    },
    [currentItem, lastAnswer, streak, recordError]
  );

  const handleNextWord = useCallback(() => {
    if (currentIndex + 1 < shuffledBank.length) {
      setCurrentIndex((prev) => prev + 1);
      setLastAnswer(null);
    } else {
      setGameOver(true);
      recordGenderDrillScore(score);
      playSound.fanfare();
      confetti({ particleCount: 100, spread: 70 });
    }
  }, [currentIndex, shuffledBank.length, score, recordGenderDrillScore]);

  // Keyboard controls: 1/r = der, 2/e = die, 3/s = das, Enter/Space = Next
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (showRulesModal) return;

      if (lastAnswer) {
        if (e.code === "Space" || e.key === "Enter") {
          e.preventDefault();
          handleNextWord();
        }
        return;
      }

      const key = e.key.toLowerCase();
      if (key === "1" || key === "r") handleGuess("der");
      else if (key === "2" || key === "e") handleGuess("die");
      else if (key === "3" || key === "s") handleGuess("das");
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lastAnswer, showRulesModal, handleGuess, handleNextWord]);

  if (!currentItem) return null;

  return (
    <div className="max-w-xl mx-auto py-4 px-2">
      {/* Top Bar: Streak, High Score, Rules button */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 font-bold text-sm">
            <Flame className="w-4 h-4 fill-orange-500" />
            <span>Streak: {streak}</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 font-bold text-sm">
            <Trophy className="w-4 h-4" />
            <span>Best: {progress.genderDrillHighScore || 0}</span>
          </div>
        </div>

        <button
          onClick={() => setShowRulesModal(true)}
          className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
        >
          <HelpCircle className="w-4 h-4" />
          <span>Rules Guide</span>
        </button>
      </div>

      {gameOver ? (
        <div className="text-center py-12 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl">
          <Trophy className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">
            Drill Complete!
          </h2>
          <p className="text-lg font-bold text-amber-600 dark:text-amber-400 mt-2">
            Final Score: {score} Points
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-6">
            You've built stronger intuition for German gender patterns!
          </p>
          <Button variant="primary" onClick={resetGame} icon={RotateCcw}>
            Play Again
          </Button>
        </div>
      ) : (
        /* Active Game Arena */
        <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl text-center">
          <div className="text-xs uppercase font-extrabold text-slate-400 dark:text-slate-500 tracking-wider mb-2">
            Question {currentIndex + 1} of {shuffledBank.length}
          </div>

          {/* Word Display */}
          <div className="py-6">
            <h1 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
              {currentItem.word}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
              meaning: <span className="font-semibold italic">"{currentItem.english}"</span>
              {currentItem.plural && currentItem.plural !== "-" && (
                <span className="ml-2 text-xs">({currentItem.plural})</span>
              )}
            </p>
            <div className="mt-3 flex justify-center">
              <AudioButton text={currentItem.word} size="md" />
            </div>
          </div>

          {/* Feedback & Hint when answered */}
          {lastAnswer ? (
            <div className="my-6 animate-in zoom-in-95 duration-200">
              <div
                className={`p-4 rounded-2xl border text-center ${
                  lastAnswer.isCorrect
                    ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 text-emerald-800 dark:text-emerald-200"
                    : "bg-rose-50 dark:bg-rose-950/40 border-rose-300 text-rose-800 dark:text-rose-200"
                }`}
              >
                <div className="text-base font-extrabold mb-1">
                  {lastAnswer.isCorrect ? "Richtig! ✓" : "Falsch! ✕"} It's{" "}
                  <span className="uppercase underline font-mono">{lastAnswer.correctGender}</span>{" "}
                  {currentItem.word}
                </div>

                {/* Suffix Rule or Semantic Tip */}
                {lastAnswer.suffixAnalysis && lastAnswer.suffixAnalysis.rule ? (
                  <div className="mt-3 p-3.5 rounded-2xl bg-amber-500/10 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 text-left space-y-2 text-slate-800 dark:text-slate-200">
                    <div className="flex items-center justify-between flex-wrap gap-1">
                      <span className="inline-flex items-center gap-1.5 text-xs font-black px-2.5 py-0.5 rounded-full bg-amber-500 text-white uppercase tracking-wider">
                        {lastAnswer.suffixAnalysis.isException
                          ? `⚠️ Ausnahme: -${lastAnswer.suffixAnalysis.rule.suffix}`
                          : `💡 Suffix-Regel: -${lastAnswer.suffixAnalysis.rule.suffix} → ${lastAnswer.suffixAnalysis.rule.gender}`}
                      </span>
                      {!lastAnswer.isCorrect && (
                        <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300">
                          🔁 Noun Re-queued
                        </span>
                      )}
                    </div>

                    <p className="text-xs font-semibold leading-relaxed">
                      {lastAnswer.suffixAnalysis.reason}
                    </p>

                    {lastAnswer.suffixAnalysis.rule.examples && lastAnswer.suffixAnalysis.rule.examples.length > 0 && (
                      <div className="text-[11px] text-slate-600 dark:text-slate-400 pt-1 border-t border-amber-500/20">
                        <span className="font-bold text-slate-800 dark:text-slate-200">Rule Examples: </span>
                        {lastAnswer.suffixAnalysis.rule.examples.join(", ")}
                      </div>
                    )}

                    {!lastAnswer.isCorrect && (
                      <p className="text-[10px] text-amber-600 dark:text-amber-400 italic">
                        This noun has been added to the end of your queue to practice again!
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="mt-2 text-xs bg-white/60 dark:bg-black/20 p-2 rounded-xl text-center">
                    {lastAnswer.hint && (
                      <p className="font-medium">
                        💡 <span className="font-bold">Pattern hint:</span> {lastAnswer.hint}
                      </p>
                    )}
                    {!lastAnswer.isCorrect && (
                      <p className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold mt-1">
                        🔁 Re-queued: You'll see this noun again before finishing.
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-4 flex justify-center">
                <Button variant="primary" size="lg" onClick={handleNextWord} icon={ArrowRight}>
                  Next Word (Press Space)
                </Button>
              </div>
            </div>
          ) : (
            /* Dynamic Choice Buttons according to active target language */
            <div className={`grid grid-cols-${Math.min((drillConfig?.options || ["der", "die", "das"]).length, 3)} gap-3 sm:gap-4 my-6`}>
              {(drillConfig?.options || ["der", "die", "das"]).map((opt, idx) => {
                const colorClasses = [
                  "bg-blue-700 hover:bg-blue-800 focus:ring-blue-400/50 shadow-blue-500/25",
                  "bg-rose-700 hover:bg-rose-800 focus:ring-rose-400/50 shadow-rose-500/25",
                  "bg-emerald-800 hover:bg-emerald-900 focus:ring-emerald-400/50 shadow-emerald-500/25"
                ][idx % 3];

                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => handleGuess(opt)}
                    className={`py-5 px-3 rounded-2xl active:scale-95 text-white font-extrabold text-xl shadow-lg transition-all flex flex-col items-center justify-center gap-1 focus:outline-none focus:ring-4 ${colorClasses}`}
                  >
                    <span className="font-mono text-xl">{opt}</span>
                    <span className="text-[10px] uppercase font-bold opacity-75">(Key {idx + 1})</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Rules Modal Guide */}
      <Modal
        isOpen={showRulesModal}
        onClose={() => setShowRulesModal(false)}
        title="German Gender Rules & Suffix Reference"
      >
        <div className="space-y-6 text-sm text-slate-600 dark:text-slate-300 max-h-[70vh] overflow-y-auto pr-1">
          {/* Section 1: Standard Ending Suffix Rules */}
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary-500" />
              High-Frequency Suffix Rules & Reliability
            </h3>
            <div className="space-y-3">
              {NOUN_GENDER_RULES.map((rule) => (
                <div
                  key={rule.id}
                  className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-xs"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                      {rule.suffix} → <span className="uppercase underline font-bold">{rule.gender}</span>
                    </span>
                    <span className="px-2 py-0.5 rounded font-mono font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px]">
                      {rule.reliability}
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 mb-1.5">{rule.description}</p>
                  <div className="text-[11px] text-slate-500">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Examples:</span>{" "}
                    {rule.examples.map((e) => `${rule.gender} ${e.word}`).join(", ")}
                  </div>
                  {rule.exceptions.length > 0 && (
                    <div className="text-[10px] text-rose-600 dark:text-rose-400 mt-1">
                      <span className="font-semibold">Key exceptions:</span> {rule.exceptions.join(", ")}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: General Semantic Categories */}
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white mb-2">
              General Semantic Categories
            </h3>
            <div className="space-y-3">
              {genderRules.map((ruleSet) => (
                <div
                  key={ruleSet.gender}
                  className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60"
                >
                  <h4 className="font-extrabold text-sm mb-1.5 text-slate-900 dark:text-white flex items-center gap-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        ruleSet.gender === "der"
                          ? "bg-blue-500"
                          : ruleSet.gender === "die"
                          ? "bg-rose-500"
                          : "bg-emerald-500"
                      }`}
                    />
                    {ruleSet.label}
                  </h4>
                  <ul className="space-y-1 text-xs">
                    {ruleSet.rules.map((r, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-amber-500 font-bold">•</span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
