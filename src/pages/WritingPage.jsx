import React, { useState, useEffect, useRef } from "react";
import { triggerCelebration } from "../utils/celebration";
import {
  PenTool,
  Sparkles,
  BookOpen,
  History,
  CheckCircle2,
  AlertCircle,
  Trophy,
  RotateCcw,
  Send,
  Calendar,
  Layers,
  ChevronRight,
  ExternalLink
} from "lucide-react";
import {
  WRITING_TASKS,
  evaluateWriting,
  getHigherLevel
} from "../services/aiWritingService";
import { DiffHighlighter } from "../components/writing/DiffHighlighter";
import { MistakesList } from "../components/writing/MistakesList";
import { ModelAnswerCard } from "../components/writing/ModelAnswerCard";
import { RewriteParagraphCard } from "../components/writing/RewriteParagraphCard";
import { getRubric } from "../data/rubrics/index.js";
import { Button } from "../components/common/Button";
import { Card } from "../components/common/Card";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { useProgress } from "../context/ProgressContext";
import { useExercise } from "../context/ExerciseContext";
import { playSound } from "../utils/soundEffects";

export function WritingPage() {
  const { checkAndUpdateStreak, recordError, activeTargetLanguage, activeCurriculum } = useProgress();
  const langName = activeCurriculum?.name || activeCurriculum?.languageName || "German";
  const exerciseState = useExercise();
  const registerExerciseContext = exerciseState?.registerExerciseContext;
  const clearExerciseContext = exerciseState?.clearExerciseContext;
  const registerTextInserter = exerciseState?.registerTextInserter;
  const textareaRef = useRef(null);

  const [level, setLevel] = useLocalStorage("deutschpath_writing_level", "A1");
  const [apiKey] = useLocalStorage("deutschpath_gemini_api_key", "");
  const [rubricInstitution, setRubricInstitution] = useLocalStorage("deutschpath_writing_rubric", "goethe");

  const activeRubric = getRubric(rubricInstitution, level);

  // Past submissions history
  const [history, setHistory] = useLocalStorage("deutschpath_writing_history_v1", []);

  const [activeTab, setActiveTab] = useState("write"); // "write" | "history"

  // Current selected task
  const currentTasks = WRITING_TASKS[level] || WRITING_TASKS.A1;
  const [selectedTaskId, setSelectedTaskId] = useState(currentTasks[0].id);
  const selectedTask = currentTasks.find((t) => t.id === selectedTaskId) || currentTasks[0];

  const [userText, setUserText] = useState("");
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationError, setEvaluationError] = useState(null);
  const [evaluationResult, setEvaluationResult] = useState(null);

  const wordCount = userText.trim() ? userText.trim().split(/\s+/).length : 0;

  // Register Redemittel inserter targeting the writing textarea at cursor
  useEffect(() => {
    if (!registerTextInserter) return;
    const unregister = registerTextInserter((phrase) => {
      if (!textareaRef.current) {
        setUserText((prev) => (prev ? `${prev} ${phrase}` : phrase));
        return;
      }
      const el = textareaRef.current;
      const start = el.selectionStart ?? el.value.length;
      const end = el.selectionEnd ?? el.value.length;
      const before = el.value.slice(0, start);
      const after = el.value.slice(end);
      const needsSpaceBefore = before.length > 0 && !/\s$/.test(before);
      const needsSpaceAfter = after.length > 0 && !/^\s/.test(after);
      const insertion = (needsSpaceBefore ? " " : "") + phrase + (needsSpaceAfter ? " " : "");
      const newText = before + insertion + after;
      setUserText(newText);
      setTimeout(() => {
        el.focus();
        const newPos = start + insertion.length;
        el.setSelectionRange(newPos, newPos);
      }, 40);
    });
    return unregister;
  }, [registerTextInserter]);

  // Sync active writing context with ExerciseContext for ContextTutor
  useEffect(() => {
    if (!registerExerciseContext || !selectedTask) return;
    registerExerciseContext({
      type: "schreiben",
      level,
      question: selectedTask.title,
      passage: selectedTask.prompt,
      options: selectedTask.hints || [],
      userDraft: userText,
      attemptCount: userText.trim().length > 10 ? 1 : 0
    });
  }, [level, selectedTask, userText, registerExerciseContext]);

  useEffect(() => {
    return () => {
      if (clearExerciseContext) clearExerciseContext();
    };
  }, [clearExerciseContext]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userText.trim() || isEvaluating) return;

    checkAndUpdateStreak();
    setIsEvaluating(true);
    setEvaluationError(null);

    try {
      const result = await evaluateWriting({
        apiKey,
        level,
        taskTitle: selectedTask.title,
        taskPrompt: selectedTask.prompt,
        requiredPoints: selectedTask.requiredPoints || [],
        targetWords: selectedTask.targetWords || "30 - 50 words",
        userText,
        rubricInstitution,
        targetLanguage: langName
      });

      setEvaluationResult(result);

      if (result.apiWarning) {
        setEvaluationError(result.apiWarning);
      }

      const scoreThreshold = (result.rubricMaxPoints || 25) * 0.7;
      if (result.overall >= scoreThreshold || (result.score || 0) >= 7.0) {
        triggerCelebration({ particleCount: 80, spread: 60 });
      } else {
        playSound.correct();
      }

      // Record mistakes to errorLedger using centralized taxonomy
      if (result.mistakes && Array.isArray(result.mistakes) && recordError) {
        result.mistakes.forEach((m, idx) => {
          recordError({
            module: "schreiben",
            level,
            category: m.category || "case",
            subcategory: m.subcategory || m.type || "general",
            learnerText: m.original,
            correct: m.corrected,
            ruleId: `schreiben-${m.category || m.type || "general"}`,
            itemId: `writing-${selectedTask.id}-${idx}`,
            word: m.category === "vocabulary" ? m.corrected : undefined
          });
        });
      }

      // Save submission to history
      const record = {
        id: `submission-${Date.now()}`,
        date: new Date().toLocaleDateString("de-DE", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        }),
        level,
        taskTitle: selectedTask.title,
        taskPrompt: selectedTask.prompt,
        userText,
        wordCount,
        result
      };

      setHistory((prev) => [record, ...prev]);
    } catch (err) {
      console.error("Evaluation error:", err);
      setEvaluationError(
        err.message ||
          "Could not analyze text. Please verify your internet connection or check your API key."
      );
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleStartNewText = () => {
    setUserText("");
    setEvaluationResult(null);
  };

  const handleViewHistoricalSubmission = (record) => {
    setLevel(record.level);
    setUserText(record.userText);
    setEvaluationResult(record.result);
    setActiveTab("write");
  };

  // Average score across history
  const averageScore = history.length
    ? (
        history.reduce((acc, h) => acc + (h.result?.score || 0), 0) / history.length
      ).toFixed(1)
    : "0.0";

  return (
    <div className="max-w-4xl mx-auto py-4 px-3 sm:px-6 space-y-6">
      {/* Top Header & Tab Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <PenTool className="w-6 h-6 text-amber-500" />
            <span>{langName} Writing Studio</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Write authentic {langName} compositions, emails and essays. Get corrections with diffs, mistake breakdowns, scoring, and higher-level model answers.
          </p>
        </div>

        {/* Tab switch between Write and History */}
        <div className="flex gap-2 p-1.5 rounded-2xl bg-slate-900 border border-slate-800">
          <button
            onClick={() => setActiveTab("write")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "write"
                ? "bg-slate-800 text-amber-400 font-bold border border-slate-700 shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>Write & Evaluate</span>
          </button>

          <button
            onClick={() => setActiveTab("history")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "history"
                ? "bg-slate-800 text-amber-400 font-bold border border-slate-700 shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>My Texts History ({history.length})</span>
          </button>
        </div>
      </div>

      {activeTab === "history" ? (
        /* History View */
        <div className="space-y-4">
          {/* History Stats Banner */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Writing Progress Tracker
              </span>
              <h2 className="text-xl font-black text-white mt-1">
                {history.length} Texts Submitted
              </h2>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="text-xs text-slate-400 font-medium">Average Score</span>
                <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
                  {averageScore} / 10
                </div>
              </div>
            </div>
          </div>

          {history.length === 0 ? (
            <Card className="p-12 text-center">
              <PenTool className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">
                No Past Submissions Yet
              </h3>
              <p className="text-xs text-slate-400 mt-1 mb-4">
                Pick a writing prompt and submit your first German text to track your progress over time!
              </p>
              <Button variant="primary" onClick={() => setActiveTab("write")}>
                Start Writing Now
              </Button>
            </Card>
          ) : (
            <div className="space-y-3">
              {history.map((record) => (
                <div
                  key={record.id}
                  onClick={() => handleViewHistoricalSubmission(record)}
                  className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-400 cursor-pointer shadow-sm transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300">
                        {record.level}
                      </span>
                      <h4 className="font-extrabold text-base text-slate-900 dark:text-white">
                        {record.taskTitle}
                      </h4>
                      <span className="text-xs text-slate-400">&bull; {record.date}</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 italic">
                      "{record.userText}"
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                    <div className="text-right">
                      <span className="text-base font-black text-amber-600 dark:text-amber-400">
                        {record.result?.score || 0} / 10
                      </span>
                      <div className="text-[10px] text-slate-400">
                        {record.wordCount} words
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Writing Editor & Evaluation View */
        <div className="space-y-6">
          {/* Level Selector */}
          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-sm space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-2">
                <span>Select Target CEFR Level:</span>
                <span className="text-amber-600 dark:text-amber-400">
                  Model answer will be level {getHigherLevel(level)}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {["A1", "A2", "B1", "B2"].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => {
                      setLevel(lvl);
                      setEvaluationResult(null);
                    }}
                    className={`py-2 px-3 rounded-xl font-black text-sm transition-all text-center ${
                      level === lvl
                        ? "bg-amber-500 text-white shadow-md shadow-amber-500/20 scale-102"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Task Selector for Current Level */}
            <div>
              <div className="text-xs font-bold text-slate-400 mb-2">
                Choose a Task for Level {level}:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {currentTasks.map((task) => (
                  <button
                    key={task.id}
                    type="button"
                    onClick={() => {
                      setSelectedTaskId(task.id);
                      setEvaluationResult(null);
                    }}
                    className={`p-3.5 rounded-2xl border text-left transition-all ${
                      selectedTaskId === task.id
                        ? "bg-amber-50 dark:bg-amber-950/40 border-amber-500 text-slate-900 dark:text-white ring-1 ring-amber-500/50 shadow-sm"
                        : "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700"
                    }`}
                  >
                    <div className="font-extrabold text-sm">{task.title}</div>
                    <div className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                      {task.prompt}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Task Details & Hints */}
            <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-900 dark:text-amber-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-black text-sm text-slate-900 dark:text-white">
                  {selectedTask.title}
                </span>
                <span className="font-bold text-amber-700 dark:text-amber-300">
                  Target Length: {selectedTask.targetWords}
                </span>
              </div>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                {selectedTask.prompt}
              </p>

              {/* Hints */}
              {selectedTask.hints && (
                <div className="pt-2 border-t border-amber-200/60 dark:border-amber-900/40">
                  <span className="font-bold text-[11px] uppercase tracking-wider block mb-1">
                    Helpful German Phrases to Include:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedTask.hints.map((hint, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-amber-800 font-mono text-[11px]"
                      >
                        {hint}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Required Leitpunkte */}
              {selectedTask.requiredPoints && (
                <div className="pt-2 border-t border-amber-200/60 dark:border-amber-900/40">
                  <span className="font-bold text-[11px] uppercase tracking-wider block mb-1 text-amber-900 dark:text-amber-200">
                    Required Task Points (Leitpunkte):
                  </span>
                  <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-700 dark:text-slate-300 font-medium pl-1">
                    {selectedTask.requiredPoints.map((pt, i) => (
                      <li key={i}>{pt}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Rubric Framework Selection */}
              <div className="pt-2 border-t border-amber-200/60 dark:border-amber-900/40 flex flex-wrap items-center justify-between gap-2">
                <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <span>Scoring Rubric:</span>
                  <span className="text-amber-800 dark:text-amber-300 font-extrabold">{activeRubric.institution} ({activeRubric.maxPoints} Pkt)</span>
                  <span className="text-[10px] text-slate-400 font-mono">(verified: false)</span>
                </div>

                <div className="flex flex-wrap gap-1">
                  {[
                    { id: "goethe", label: "Goethe" },
                    { id: "telc", label: "telc" },
                    { id: "osd", label: "ÖSD" },
                    { id: "dtz", label: "DTZ" },
                    { id: "testdaf", label: "TestDaF" }
                  ].map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setRubricInstitution(r.id)}
                      className={`px-2 py-0.5 rounded-lg text-[11px] font-bold transition-all ${
                        rubricInstitution === r.id
                          ? "bg-amber-600 text-white shadow-2xs font-extrabold"
                          : "bg-slate-900 text-slate-300 border border-slate-800 hover:border-amber-400"
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Text Editor Form */}
          <form
            onSubmit={handleSubmit}
            className="p-5 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-sm space-y-4"
          >
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Your German Text (Schreibe hier auf Deutsch):
              </label>
              <div className="text-xs font-bold text-slate-400 flex items-center gap-2">
                <span>{wordCount} Words</span>
                <span>&bull;</span>
                <span>{userText.length} Characters</span>
              </div>
            </div>

            <textarea
              ref={textareaRef}
              rows={8}
              required
              value={userText}
              onChange={(e) => setUserText(e.target.value)}
              placeholder={`Write your German text for "${selectedTask.title}" here...\n\nExample starter: ${selectedTask.hints?.[0] || "Sehr geehrte..."}`}
              className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 leading-relaxed"
            />

            <div className="flex items-center justify-between pt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleStartNewText}
                icon={RotateCcw}
              >
                Clear Text
              </Button>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={!userText.trim() || isEvaluating}
                icon={isEvaluating ? Sparkles : Send}
                className={isEvaluating ? "animate-pulse" : ""}
              >
                {isEvaluating ? "Analyzing with AI Tutor..." : "Submit for AI Evaluation"}
              </Button>
            </div>
          </form>

          {/* Evaluation Error Alert */}
          {evaluationError && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs sm:text-sm flex items-start gap-3 shadow-sm">
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Evaluation Notice: </span>
                <span>{evaluationError}</span>
              </div>
            </div>
          )}

          {/* Evaluating Loading State Card */}
          {isEvaluating && (
            <div className="p-8 rounded-3xl bg-slate-900 border border-amber-800/80 shadow-md text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center animate-spin">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                AI Tutor is Reviewing Your German Writing...
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                Analyzing grammar cases, sentence word order, vocabulary accuracy, and generating higher-level model answers.
              </p>
            </div>
          )}

          {/* AI Evaluation Results Showcase */}
          {evaluationResult && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Score & Overall Feedback Banner (Always labeled as Estimates) */}
              <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white shadow-xl shadow-amber-500/15">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/20">
                        {activeRubric.institution} Rubric &bull; Level {level}
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-black/20 text-amber-100 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 text-amber-300" />
                        AI Score Estimate (Unofficial)
                      </span>
                      {evaluationResult.isOffline && (
                        <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/25 text-white">
                          Basic Check (Offline)
                        </span>
                      )}
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-black">
                      Evaluation Completed
                    </h2>

                    <p className="text-xs sm:text-sm text-amber-50 max-w-lg leading-relaxed">
                      {evaluationResult.feedback}
                    </p>

                    {activeRubric.source && (
                      <div className="pt-1">
                        <a
                          href={activeRubric.source}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-100 hover:text-white underline hover:no-underline"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>View official scoring guide ({activeRubric.institution})</span>
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Estimated Score Badge */}
                  <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 shrink-0 min-w-[130px] text-center">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-100">
                      Estimated Score
                    </span>
                    <div className="text-3xl sm:text-4xl font-black mt-0.5">
                      {evaluationResult.overall}
                      <span className="text-base opacity-80 font-bold">
                        /{evaluationResult.rubricMaxPoints || activeRubric.maxPoints || 25}
                      </span>
                    </div>
                    <span className="text-[9px] font-bold text-amber-100 opacity-90 mt-0.5">
                      (estimate only)
                    </span>
                  </div>
                </div>
              </div>

              {/* 1. REQUIRED-CONTENT CHECKLIST (Leitpunkte) */}
              <Card className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-amber-500" />
                    <span>1. Required-Content Checklist (Leitpunkte)</span>
                  </h3>
                  <span className="text-xs font-bold text-slate-400">
                    {evaluationResult.taskPoints?.filter((p) => p.covered).length || 0} of {evaluationResult.taskPoints?.length || 0} Covered
                  </span>
                </div>

                <div className="space-y-2.5">
                  {evaluationResult.taskPoints && evaluationResult.taskPoints.length > 0 ? (
                    evaluationResult.taskPoints.map((tp, pIdx) => (
                      <div
                        key={pIdx}
                        className={`p-3.5 rounded-2xl border text-xs flex items-start gap-3 transition-all ${
                          tp.covered
                            ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/60"
                            : "bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60"
                        }`}
                      >
                        <div className="mt-0.5 shrink-0">
                          {tp.covered ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-rose-500" />
                          )}
                        </div>
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 dark:text-white">
                              {tp.required}
                            </span>
                            <span
                              className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                                tp.covered
                                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200"
                                  : "bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200"
                              }`}
                            >
                              {tp.covered ? "Covered ✓" : "Omitted / Incomplete"}
                            </span>
                          </div>
                          {tp.evidence && (
                            <p className="text-[11px] text-slate-600 dark:text-slate-300 italic">
                              Evidence: "{tp.evidence}"
                            </p>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-slate-400 italic">No specific task points registered.</div>
                  )}
                </div>
              </Card>

              {/* 2. CRITERIA WITH EVIDENCE */}
              <Card className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <Layers className="w-5 h-5 text-indigo-500" />
                    <span>2. Examination Criteria Breakdown</span>
                  </h3>
                  <span className="text-xs font-bold text-slate-400">
                    {activeRubric.institution} Standard
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {evaluationResult.criteria && evaluationResult.criteria.map((crit, cIdx) => {
                    const ratio = crit.max > 0 ? (crit.score / crit.max) * 100 : 0;
                    return (
                      <div
                        key={cIdx}
                        className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-slate-900 dark:text-white text-xs sm:text-sm">
                            {crit.name}
                          </span>
                          <span className="font-black text-amber-600 dark:text-amber-400">
                            {crit.score} / {crit.max} Pkt
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-amber-500 to-emerald-500 h-full rounded-full transition-all"
                            style={{ width: `${Math.min(100, Math.max(5, ratio))}%` }}
                          />
                        </div>

                        {crit.evidence && (
                          <p className="text-[11px] text-slate-600 dark:text-slate-300">
                            <strong className="text-slate-800 dark:text-slate-200 not-italic">Observation: </strong>
                            {crit.evidence}
                          </p>
                        )}

                        {crit.fix && (
                          <p className="text-[11px] text-indigo-700 dark:text-indigo-300 font-medium">
                            <strong className="text-indigo-900 dark:text-indigo-200 not-italic">Fix: </strong>
                            {crit.fix}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* 3. DIFF HIGHLIGHTER (Word-Level) */}
              <Card className="p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    <span>3. Word-Level Text Corrections</span>
                  </h3>
                </div>
                <DiffHighlighter
                  originalText={userText}
                  correctedText={evaluationResult.correctedText}
                  mistakes={evaluationResult.mistakes}
                />
              </Card>

              {/* 4. MISTAKES LIST MAPPED TO ERROR TAXONOMY */}
              <Card className="p-6 space-y-3">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-500" />
                  <span>4. Diagnostics & SRS Card Generator</span>
                </h3>
                <MistakesList mistakes={evaluationResult.mistakes} level={level} />
              </Card>

              {/* 5. REWRITE ONE PARAGRAPH YOURSELF */}
              <RewriteParagraphCard originalText={userText} level={level} />

              {/* 6. MODEL ANSWER ONE LEVEL HIGHER */}
              <ModelAnswerCard
                modelAnswer={evaluationResult.modelAnswer}
                userLevel={level}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
