import React, { useState, useMemo, useEffect } from "react";
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Sparkles,
  Layers,
  ChevronRight,
  ArrowLeft,
  Volume2,
  HelpCircle,
  Trophy,
  Filter,
  Flame,
  Award
} from "lucide-react";
import fallbackReadingTextsData from "../data/readingTexts.json";
import { InteractiveReader } from "../components/reading/InteractiveReader";
import { ReadingQuiz } from "../components/reading/ReadingQuiz";
import { Button } from "../components/common/Button";
import { Badge } from "../components/common/Badge";
import { useProgress } from "../context/ProgressContext";
import { useExercise } from "../context/ExerciseContext";
import { useLocalStorage } from "../hooks/useLocalStorage";

const LEVELS = ["A1", "A2", "B1", "B2"];

export function ReadingPage() {
  const { getReadingScore, progress, readingTexts: ctxReadingTexts } = useProgress();
  const readingTextsData = ctxReadingTexts && ctxReadingTexts.length > 0 ? ctxReadingTexts : fallbackReadingTextsData;
  const { registerExerciseContext, clearExerciseContext } = useExercise();
  const [selectedLevel, setSelectedLevel] = useLocalStorage("deutschpath_reading_level", "A1");
  const [activeTextId, setActiveTextId] = useState(null);
  const [activeEvidenceSpan, setActiveEvidenceSpan] = useState(null);

  // Filter texts by selected level
  const textsInLevel = useMemo(() => {
    return readingTextsData.filter((t) => t.level === selectedLevel);
  }, [selectedLevel]);

  // Active text object if one is selected
  const activeText = useMemo(() => {
    if (!activeTextId) return null;
    return readingTextsData.find((t) => t.id === activeTextId) || null;
  }, [activeTextId]);

  // Sync with ExerciseContext for AI ContextTutor
  useEffect(() => {
    if (activeText) {
      const q0 = activeText.questions?.[0];
      registerExerciseContext({
        type: "reading",
        level: activeText.level || "A1",
        question: q0?.question || activeText.title,
        passage: activeText.content,
        options: q0?.options || [],
        correctAnswer: q0 ? q0.options[q0.correctIndex] : null,
        userAnswer: null,
        attemptCount: 0
      });
    } else {
      clearExerciseContext();
    }
  }, [activeText, registerExerciseContext, clearExerciseContext]);

  useEffect(() => {
    return () => {
      clearExerciseContext();
    };
  }, [clearExerciseContext]);

  // Overall stats
  const totalTexts = readingTextsData.length;
  const completedTextsCount = useMemo(() => {
    const scores = progress.readingScores || {};
    return Object.keys(scores).filter((id) => scores[id]?.bestScore > 0).length;
  }, [progress.readingScores]);

  const handleSelectText = (textId) => {
    setActiveTextId(textId);
    setActiveEvidenceSpan(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBackToLibrary = () => {
    setActiveTextId(null);
    setActiveEvidenceSpan(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Find next text in same level or next
  const handleNextText = () => {
    const currentIndex = readingTextsData.findIndex((t) => t.id === activeTextId);
    if (currentIndex >= 0 && currentIndex + 1 < readingTextsData.length) {
      const next = readingTextsData[currentIndex + 1];
      setSelectedLevel(next.level);
      setActiveTextId(next.id);
      setActiveEvidenceSpan(null);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      handleBackToLibrary();
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* If reading a specific text */}
      {activeText ? (
        <div className="space-y-6">
          {/* Top navigation bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToLibrary}
              className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Back to Reading Library
            </Button>

            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-black px-2.5 py-1 rounded-xl uppercase tracking-wider ${activeText.level === "A1"
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                  : activeText.level === "A2"
                    ? "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300"
                    : activeText.level === "B1"
                      ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                      : "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300"
                  }`}
              >
                Level {activeText.level}
              </span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {activeText.category}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {activeText.estimatedReadTime}
              </span>
            </div>
          </div>

          {/* Interactive Reader with TTS & Click-to-lookup */}
          <InteractiveReader
            readingText={activeText}
            activeEvidenceSpan={activeEvidenceSpan}
            onClearEvidence={() => setActiveEvidenceSpan(null)}
          />

          {/* 3 Comprehension Questions Quiz */}
          <ReadingQuiz
            readingText={activeText}
            onHighlightEvidence={(evidence) => setActiveEvidenceSpan(evidence)}
          />

          {/* Bottom Next / Return Actions */}
          <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <Button variant="secondary" onClick={handleBackToLibrary}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              All Texts
            </Button>

            <Button variant="primary" onClick={handleNextText}>
              Next Text
              <ChevronRight className="w-4 h-4 ml-1.5" />
            </Button>
          </div>
        </div>
      ) : (
        /* Library List View */
        <div className="space-y-6">
          {/* Hero Banner */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 text-white p-6 sm:p-8 shadow-xl shadow-amber-500/10">
            <div className="relative z-10 max-w-2xl space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-black uppercase tracking-wider">
                <BookOpen className="w-3.5 h-3.5" />
                Graded German Reading (A1 – B2)
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight">
                Leseecke (Reading Library)
              </h1>
              <p className="text-sm sm:text-base text-amber-100 font-medium leading-relaxed">
                Immerse yourself in authentic German texts curated for your level.
                Tap any word for instant meaning and add it to your flashcards,
                listen with native TTS, and test your understanding with comprehension quizzes.
              </p>

              {/* Stats badges */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-black/20 backdrop-blur-sm text-xs font-bold text-white">
                  <BookOpen className="w-4 h-4 text-amber-200" />
                  <span>12 Graded Texts</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-black/20 backdrop-blur-sm text-xs font-bold text-white">
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>{completedTextsCount} Completed</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-black/20 backdrop-blur-sm text-xs font-bold text-white">
                  <Volume2 className="w-4 h-4 text-amber-200" />
                  <span>Native de-DE Audio</span>
                </div>
              </div>
            </div>
          </div>

          {/* Level Selection Tabs */}
          <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
            <div className="flex items-center gap-2">
              {LEVELS.map((lvl) => {
                const countForLevel = readingTextsData.filter((t) => t.level === lvl).length;
                const completedForLevel = readingTextsData
                  .filter((t) => t.level === lvl)
                  .filter((t) => {
                    const rec = getReadingScore(t.id);
                    return rec && rec.bestScore > 0;
                  }).length;

                const isActive = selectedLevel === lvl;

                return (
                  <button
                    key={lvl}
                    onClick={() => setSelectedLevel(lvl)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-sm transition-all duration-200 ${isActive
                      ? "bg-amber-500 text-white shadow-md shadow-amber-500/20 scale-105"
                      : "bg-slate-900 text-slate-300 border border-slate-800 hover:border-amber-400"
                      }`}
                  >
                    <span>Level {lvl}</span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${isActive
                        ? "bg-white/20 text-white"
                        : "bg-slate-800 text-slate-400"
                        }`}
                    >
                      {completedForLevel}/{countForLevel}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Text Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {textsInLevel.map((item) => {
              const scoreRecord = getReadingScore(item.id);
              const isCompleted = scoreRecord && scoreRecord.bestScore > 0;

              return (
                <div
                  key={item.id}
                  data-testid="reading-card"
                  onClick={() => handleSelectText(item.id)}
                  className="group relative flex flex-col justify-between p-5 rounded-3xl bg-slate-900 border border-slate-800 hover:border-amber-500/60 shadow-sm hover:shadow-xl hover:shadow-amber-500/5 transition-all duration-300 cursor-pointer text-left"
                >
                  <div className="space-y-3">
                    {/* Top badging */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-black px-2.5 py-0.5 rounded-lg ${item.level === "A1"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300"
                            : item.level === "A2"
                              ? "bg-sky-100 text-sky-800 dark:bg-sky-950/80 dark:text-sky-300"
                              : item.level === "B1"
                                ? "bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300"
                                : "bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300"
                            }`}
                        >
                          {item.level}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                          {item.category}
                        </span>
                      </div>

                      {isCompleted && (
                        <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>
                            {scoreRecord.bestScore}/{scoreRecord.total}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Titles */}
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                        {item.englishTitle}
                      </p>
                    </div>

                    {/* Excerpt preview */}
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                      {item.content}
                    </p>
                  </div>

                  {/* Card Footer */}
                  <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {item.estimatedReadTime}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <HelpCircle className="w-3.5 h-3.5" />
                        {item.questions.length} questions
                      </span>
                    </div>

                    <span className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      {isCompleted ? "Read again" : "Start reading"}
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
