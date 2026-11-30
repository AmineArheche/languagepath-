import React, { useState, useEffect, useRef } from "react";
import {
  Bot,
  Sparkles,
  HelpCircle,
  Lightbulb,
  BookOpen,
  CheckCircle2,
  Lock,
  Unlock,
  Send,
  Plus,
  Check,
  ChevronRight,
  ChevronDown,
  X,
  Gauge,
  Layers,
  ArrowRight,
  Zap,
  CornerDownLeft
} from "lucide-react";
import { useExercise } from "../../context/ExerciseContext";
import { useProgress } from "../../context/ProgressContext";
import {
  queryContextTutor,
  getDailyQueryStats
} from "../../services/contextTutorService";
import { Button } from "../common/Button";
import { Badge } from "../common/Badge";
import { playSound } from "../../utils/soundEffects";

export function ContextTutor({ className = "" }) {
  const {
    exerciseContext,
    insertTextAtCursor,
    highlightPassageSpans
  } = useExercise();

  const { addCustomFlashcard, allFlashcards } = useProgress();

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("ladder"); // "ladder" | "chips" | "chat"
  const [ladderStep, setLadderStep] = useState(null); // "hint" | "rule" | "full_answer"
  const [customQuery, setCustomQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [tutorResult, setTutorResult] = useState(null);
  const [insertedRedemittel, setInsertedRedemittel] = useState({});
  const [addedWords, setAddedWords] = useState({});
  const [dailyStats, setDailyStats] = useState(getDailyQueryStats());

  const debounceTimerRef = useRef(null);

  // Auto-refresh daily query stats when opened
  useEffect(() => {
    if (isOpen) {
      setDailyStats(getDailyQueryStats());
    }
  }, [isOpen]);

  if (!exerciseContext) {
    return null;
  }

  const attemptCount = exerciseContext.attemptCount || 0;
  const hasAttempted =
    attemptCount > 0 ||
    Boolean(exerciseContext.userAnswer) ||
    Boolean(exerciseContext.userDraft);

  const handleQuery = async (actionType, queryText = "") => {
    if (isLoading) return;

    setIsLoading(true);
    setLadderStep(actionType);

    try {
      const res = await queryContextTutor({
        context: exerciseContext,
        actionType,
        userQuery: queryText
      });

      setTutorResult(res);
      setDailyStats(getDailyQueryStats());

      // If response includes passage highlights, trigger highlight in passage
      if (res.highlightSpans && res.highlightSpans.length > 0) {
        highlightPassageSpans(res.highlightSpans);
      }
    } catch (err) {
      console.warn("ContextTutor query error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (!customQuery.trim() || isLoading) return;
    const text = customQuery.trim();
    setCustomQuery("");
    handleQuery("custom", text);
  };

  const handleInsertRedemittel = (phraseDe, idx) => {
    const success = insertTextAtCursor(phraseDe);
    setInsertedRedemittel((prev) => ({ ...prev, [idx]: true }));
    playSound.correct();
    setTimeout(() => {
      setInsertedRedemittel((prev) => ({ ...prev, [idx]: false }));
    }, 2500);
  };

  const handleAddNewWord = (word, idx) => {
    addCustomFlashcard({
      german: word.german,
      article: word.article || null,
      english: word.english,
      plural: word.plural || "-",
      exampleDe: exerciseContext.passage
        ? exerciseContext.passage.slice(0, 100)
        : `Lerne das Wort: ${word.german}`,
      exampleEn: "",
      level: exerciseContext.level || "A1",
      unit: `Tutor: ${exerciseContext.type}`
    });

    setAddedWords((prev) => ({ ...prev, [idx]: true }));
    playSound.correct();
  };

  const moduleColor =
    exerciseContext.type === "reading"
      ? "amber"
      : exerciseContext.type === "hoeren"
      ? "sky"
      : exerciseContext.type === "schreiben"
      ? "indigo"
      : "emerald";

  return (
    <>
      {/* Floating Trigger Pill */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className={`fixed bottom-20 md:bottom-6 right-5 z-40 flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-xs shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-105 active:scale-95 transition-all ${className}`}
          title="Open AI Context Tutor"
        >
          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <span>Ask Tutor</span>
          <span className="px-1.5 py-0.5 rounded-md bg-white/20 text-[10px] font-black uppercase">
            {exerciseContext.level}
          </span>
        </button>
      )}

      {/* Slide-out Tutor Panel */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="AI Context Tutor"
          className="fixed bottom-20 md:bottom-6 right-3 sm:right-6 w-[94vw] sm:w-[440px] max-h-[85vh] z-50 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200"
        >
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-extrabold text-sm leading-tight">
                    Context AI Tutor
                  </h3>
                  <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-white/20 uppercase">
                    {exerciseContext.level}
                  </span>
                </div>
                <p className="text-[11px] text-indigo-100 flex items-center gap-1">
                  <span>Modul: {exerciseContext.type}</span>
                  <span>•</span>
                  <span>
                    {hasAttempted ? "1 Attempt logged" : "Not attempted yet"}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Daily Queries Meter */}
              <div
                className="text-[10px] font-bold px-2 py-1 rounded-lg bg-black/20 text-indigo-100"
                title="Requests today. Cached queries are free & instant."
              >
                {dailyStats.count}/{dailyStats.limit} used
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-xl hover:bg-white/20 transition-colors text-white"
                title="Close Tutor"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Context Snippet Preview */}
          <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 flex items-center justify-between shrink-0">
            <span className="truncate max-w-[280px] font-medium">
              "{exerciseContext.question || exerciseContext.passage?.slice(0, 50) || "Exercise active"}"
            </span>
            <span
              className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                hasAttempted
                  ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300"
                  : "bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300"
              }`}
            >
              {hasAttempted ? "Attempted ✓" : "Attempt first"}
            </span>
          </div>

          {/* Scrollable Content Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* 1. HINT LADDER: Hint -> Rule -> Full Answer */}
            <div className="space-y-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5" />
                Pedagogical Hint Ladder
              </span>

              <div className="grid grid-cols-3 gap-1.5">
                {/* 1. Hint */}
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleQuery("hint", "Give me a guiding hint")}
                  className={`p-2.5 rounded-2xl border text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all ${
                    ladderStep === "hint"
                      ? "border-amber-500 bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 shadow-sm"
                      : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-amber-400"
                  }`}
                >
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  <span>1. Hint</span>
                </button>

                {/* 2. Rule */}
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleQuery("rule", "Explain the underlying rule")}
                  className={`p-2.5 rounded-2xl border text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all ${
                    ladderStep === "rule"
                      ? "border-sky-500 bg-sky-50 dark:bg-sky-950/60 text-sky-900 dark:text-sky-200 shadow-sm"
                      : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-sky-400"
                  }`}
                >
                  <BookOpen className="w-4 h-4 text-sky-500" />
                  <span>2. Rule</span>
                </button>

                {/* 3. Full Answer (Strictly Locked if attemptCount === 0) */}
                <button
                  type="button"
                  disabled={!hasAttempted || isLoading}
                  onClick={() => handleQuery("full_answer", "Reveal the full answer")}
                  className={`p-2.5 rounded-2xl border text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all ${
                    !hasAttempted
                      ? "border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/40 text-slate-400 cursor-not-allowed opacity-60"
                      : ladderStep === "full_answer"
                      ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 shadow-sm"
                      : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-emerald-400"
                  }`}
                  title={
                    !hasAttempted
                      ? "Locked: Make your first attempt before unlocking the full answer!"
                      : "Reveal complete solution"
                  }
                >
                  {hasAttempted ? (
                    <Unlock className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Lock className="w-4 h-4 text-slate-400" />
                  )}
                  <span>3. Solution</span>
                </button>
              </div>

              {!hasAttempted && (
                <p className="text-[10px] text-slate-400 italic text-center">
                  🔒 Step 3 unlocks after you make your first attempt at the question.
                </p>
              )}
            </div>

            {/* 2. QUICK CHIPS */}
            <div className="space-y-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                Quick Questions
              </span>

              <div className="flex flex-wrap gap-1.5">
                {/* Option distractor chips */}
                {exerciseContext.options &&
                  exerciseContext.options.slice(0, 3).map((opt, oIdx) => {
                    const letter = String.fromCharCode(65 + oIdx);
                    return (
                      <button
                        key={oIdx}
                        disabled={isLoading}
                        onClick={() =>
                          handleQuery(
                            "why_not",
                            `Explain why Option ${letter} ("${opt}") is not the correct choice.`
                          )
                        }
                        className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                      >
                        Why not {letter}?
                      </button>
                    );
                  })}

                {/* Explain this word */}
                <button
                  disabled={isLoading}
                  onClick={() =>
                    handleQuery("explain_word", "Explain the key vocabulary and idioms in this context.")
                  }
                  className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  Explain Key Words
                </button>

                {/* Give me a Redemittel */}
                <button
                  disabled={isLoading}
                  onClick={() =>
                    handleQuery(
                      "redemittel",
                      "Provide authentic Redemittel sentence starters for this task."
                    )
                  }
                  className="px-2.5 py-1 rounded-xl text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition-colors"
                >
                  + Give Redemittel
                </button>
              </div>
            </div>

            {/* Loading Indicator */}
            {isLoading && (
              <div className="p-5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900 flex items-center justify-center gap-3 text-xs font-bold text-indigo-700 dark:text-indigo-300">
                <Bot className="w-5 h-5 animate-bounce text-indigo-600" />
                <span>Thinking in German & analyzing context...</span>
              </div>
            )}

            {/* 3. TUTOR RESPONSE SECTION */}
            {tutorResult && !isLoading && (
              <div className="space-y-4 pt-1">
                {/* Explanation Card */}
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      Tutor Feedback
                    </span>
                    {tutorResult.fromCache && (
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 text-[10px]">
                        Instant Cache ⚡
                      </span>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-100 leading-relaxed">
                    {tutorResult.explanation}
                  </p>

                  {/* Highlights found in passage */}
                  {tutorResult.highlightSpans &&
                    tutorResult.highlightSpans.length > 0 && (
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-700/80 text-xs">
                        <span className="font-bold text-slate-400 text-[10px] uppercase block mb-1">
                          Passage Evidence:
                        </span>
                        {tutorResult.highlightSpans.map((h, hIdx) => (
                          <div
                            key={hIdx}
                            className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs italic"
                          >
                            "{h.text}"
                          </div>
                        ))}
                      </div>
                    )}
                </div>

                {/* Redemittel Cards with Insert Button */}
                {tutorResult.redemittel && tutorResult.redemittel.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider block">
                      Useful Redemittel (Sentence Starters):
                    </span>

                    <div className="space-y-2">
                      {tutorResult.redemittel.map((r, rIdx) => {
                        const isInserted = insertedRedemittel[rIdx];

                        return (
                          <div
                            key={rIdx}
                            className="p-3 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/80 flex items-center justify-between gap-2"
                          >
                            <div>
                              <div className="flex items-center gap-1.5 mb-0.5">
                                <span className="text-[10px] font-black uppercase px-1.5 py-0.2 rounded bg-indigo-200 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200">
                                  {r.useCase}
                                </span>
                              </div>
                              <p className="text-xs font-bold text-slate-900 dark:text-white">
                                {r.de}
                              </p>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                {r.native}
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleInsertRedemittel(r.de, rIdx)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1 shrink-0 transition-all ${
                                isInserted
                                  ? "bg-emerald-600 text-white"
                                  : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs"
                              }`}
                              title="Insert into Schreiben text editor at cursor"
                            >
                              {isInserted ? (
                                <>
                                  <Check className="w-3 h-3" />
                                  <span>Inserted ✓</span>
                                </>
                              ) : (
                                <>
                                  <CornerDownLeft className="w-3 h-3" />
                                  <span>Insert</span>
                                </>
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* New Vocabulary Cards with 1-Tap Add to Deck */}
                {tutorResult.newWords && tutorResult.newWords.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider block">
                      Recommended Vocabulary:
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {tutorResult.newWords.map((w, wIdx) => {
                        const isAdded =
                          addedWords[wIdx] ||
                          allFlashcards.some(
                            (c) =>
                              c.german?.toLowerCase() ===
                              w.german?.toLowerCase()
                          );

                        return (
                          <div
                            key={wIdx}
                            className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs"
                          >
                            <div>
                              <div className="font-bold text-slate-900 dark:text-white">
                                {w.article ? `${w.article} ` : ""}
                                {w.german}
                              </div>
                              <div className="text-[10px] text-slate-400">
                                {w.english}
                              </div>
                            </div>

                            <button
                              type="button"
                              disabled={isAdded}
                              onClick={() => handleAddNewWord(w, wIdx)}
                              className={`p-1.5 rounded-lg transition-all ${
                                isAdded
                                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                                  : "bg-slate-200 dark:bg-slate-700 hover:bg-indigo-600 hover:text-white text-slate-700 dark:text-slate-200"
                              }`}
                              title={
                                isAdded ? "In Deck" : "Add to Flashcard Deck"
                              }
                            >
                              {isAdded ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                              ) : (
                                <Plus className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Bottom Custom Question Input */}
          <form
            onSubmit={handleCustomSubmit}
            className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              value={customQuery}
              onChange={(e) => setCustomQuery(e.target.value)}
              placeholder="Ask anything about this task..."
              className="flex-1 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 text-xs text-slate-900 dark:text-white outline-none transition-all"
            />
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={!customQuery.trim() || isLoading}
              icon={Send}
              className="bg-indigo-600 hover:bg-indigo-700 text-white shrink-0"
            />
          </form>
        </div>
      )}
    </>
  );
}
