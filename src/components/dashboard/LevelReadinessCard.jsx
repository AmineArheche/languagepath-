import React, { useState } from "react";
import {
  Compass,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Award,
  BookOpen,
  Layers,
  GraduationCap,
  PenTool,
  Headphones,
  Mic
} from "lucide-react";
import { useProgress } from "../../context/ProgressContext";
import { Button } from "../common/Button";

const TARGET_LEVELS = ["A2", "B1", "B2"];

export function LevelReadinessCard({ onNavigateToExams, onNavigateToRoadmap }) {
  const { calculateLevelReadiness } = useProgress();
  const [selectedTarget, setSelectedTarget] = useState("A2");

  const readinessData = calculateLevelReadiness(selectedTarget);
  const { readinessScore, breakdown, currentBaseLevel, wordsCount, targetWords, details } = readinessData;

  let statusLabel = "Auf gutem Weg (In Progress)";
  let statusColor = "text-sky-600 dark:text-sky-400";
  let badgeBg = "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300";

  if (readinessScore >= 85) {
    statusLabel = "Prüfungsbereit (Exam Ready!) 🎉";
    statusColor = "text-emerald-600 dark:text-emerald-400";
    badgeBg = "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300";
  } else if (readinessScore >= 70) {
    statusLabel = "Fast bereit (Strong Foundation) 💪";
    statusColor = "text-amber-600 dark:text-amber-400";
    badgeBg = "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300";
  }

  return (
    <div className="p-5 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 text-slate-100 shadow-sm space-y-6">
      {/* Header & Target Level Picker */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
              <Compass className="w-5 h-5" />
            </span>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Estimated CEFR Readiness Score
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Composite readiness index to advance from {currentBaseLevel} to {selectedTarget}.
          </p>
        </div>

        {/* Target Level Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold">
          {TARGET_LEVELS.map((lvl) => (
            <button
              key={lvl}
              onClick={() => setSelectedTarget(lvl)}
              className={`px-3 py-1 rounded-lg transition-all ${
                selectedTarget === lvl
                  ? "bg-white dark:bg-slate-700 text-purple-700 dark:text-purple-300 shadow-xs font-extrabold"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Goal: {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Main Readiness Gauge */}
      <div className="p-5 rounded-3xl bg-gradient-to-br from-purple-500/10 via-indigo-500/5 to-slate-50 dark:from-purple-950/30 dark:via-indigo-950/20 dark:to-slate-900/40 border border-purple-200/60 dark:border-purple-900/60 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center sm:text-left">
          <span className={`inline-block text-xs font-black px-2.5 py-1 rounded-full ${badgeBg}`}>
            {statusLabel}
          </span>
          <h4 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            Ready to transition to Level {selectedTarget}
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm">
            Weighted across curriculum mastery, grammar accuracy, active vocabulary retention,
            reading score, and Goethe mock exams.
          </p>
        </div>

        {/* Circular / Badge Score */}
        <div className="relative shrink-0 flex items-center justify-center w-28 h-28 rounded-full bg-slate-800 border-4 border-purple-500 shadow-lg shadow-purple-500/10">
          <div className="text-center">
            <span className="text-3xl font-black text-purple-600 dark:text-purple-400 block leading-none">
              {readinessScore}%
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 block">
              Readiness
            </span>
          </div>
        </div>
      </div>

      {/* 6 Real Competencies Sub-Skill Progress Bars */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block">
            CEFR 6-Skill Readiness Profile:
          </span>
          <span className="text-[11px] font-semibold text-slate-400">
            Real Learner Data
          </span>
        </div>

        {/* 1. Vocabulary Retention */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
              <Layers className="w-3.5 h-3.5 text-sky-500" />
              <span>Vocabulary Mastered ({wordsCount}/{targetWords} words)</span>
            </span>
            <span className="font-bold text-slate-900 dark:text-white">
              {breakdown.vocabulary}%
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-sky-500 h-full rounded-full transition-all duration-700"
              style={{ width: `${breakdown.vocabulary}%` }}
            />
          </div>
        </div>

        {/* 2. Grammar Accuracy */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
              <GraduationCap className="w-3.5 h-3.5 text-indigo-500" />
              <span>Grammar Accuracy ({details?.grammarExercises || 0} exercises answered)</span>
            </span>
            <span className="font-bold text-slate-900 dark:text-white">
              {breakdown.grammar}%
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-indigo-500 h-full rounded-full transition-all duration-700"
              style={{ width: `${breakdown.grammar}%` }}
            />
          </div>
        </div>

        {/* 3. Reading Comprehension */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
              <BookOpen className="w-3.5 h-3.5 text-emerald-500" />
              <span>Reading Comprehension ({details?.readingTextsCompleted || 0} texts completed)</span>
            </span>
            <span className="font-bold text-slate-900 dark:text-white">
              {breakdown.reading}%
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-700"
              style={{ width: `${breakdown.reading}%` }}
            />
          </div>
        </div>

        {/* 4. Writing Proficiency */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
              <PenTool className="w-3.5 h-3.5 text-amber-500" />
              <span>Writing Proficiency ({details?.writingSubmissions || 0} essays scored)</span>
            </span>
            <span className="font-bold text-slate-900 dark:text-white">
              {breakdown.writing}%
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-amber-500 h-full rounded-full transition-all duration-700"
              style={{ width: `${breakdown.writing}%` }}
            />
          </div>
        </div>

        {/* 5. Listening Comprehension */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
              <Headphones className="w-3.5 h-3.5 text-rose-500" />
              <span>Listening Comprehension (Hören - {details?.listeningTestsTaken || 0} tests)</span>
            </span>
            <span className="font-bold text-slate-900 dark:text-white">
              {breakdown.listening}%
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-rose-500 h-full rounded-full transition-all duration-700"
              style={{ width: `${breakdown.listening}%` }}
            />
          </div>
        </div>

        {/* 6. Speaking Fluency */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
              <Mic className="w-3.5 h-3.5 text-purple-500" />
              <span>Speaking Fluency (Sprechen - {details?.speakingRecordings || 0} recordings)</span>
            </span>
            <span className="font-bold text-slate-900 dark:text-white">
              {breakdown.speaking}%
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-purple-500 h-full rounded-full transition-all duration-700"
              style={{ width: `${breakdown.speaking}%` }}
            />
          </div>
        </div>
      </div>

      {/* Actionable recommendations */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-2">
        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
          Empfohlene nächste Schritte (Next Steps):
        </span>
        <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1.5">
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
            <span>
              {wordsCount < targetWords
                ? `Learn ${targetWords - wordsCount} more words in Daily Review & Reading`
                : "Vocabulary target achieved! Keep reviewing SRS cards."}
            </span>
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
            <span>
              Achieve &ge; 60/100 points on the Goethe {currentBaseLevel} Mock Exam.
            </span>
          </li>
        </ul>

        {onNavigateToExams && (
          <div className="pt-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={onNavigateToExams}
              className="w-full justify-between"
            >
              <span>Take Goethe {currentBaseLevel} Mock Exam</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
