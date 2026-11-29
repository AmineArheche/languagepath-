import React, { useState } from "react";
import { Sparkles, Trophy, BookOpen, Layers, Gamepad2, Unlock, RotateCcw, CheckCircle2, ShieldCheck, Compass } from "lucide-react";
import { getAllLevels, getLevelById, getAllUnitsOrdered } from "../data/curriculum";
import { LevelSelector } from "../components/roadmap/LevelSelector";
import { UnitCard } from "../components/roadmap/UnitCard";
import { PlacementTestModal } from "../components/placement/PlacementTestModal";
import { useProgress } from "../context/ProgressContext";

export function RoadmapPage({ onSelectLesson, onNavigate }) {
  const {
    progress,
    getUnitProgress,
    getUnitStatus,
    setUnitProgress,
    resetAllProgress,
    unlockUnitsUpTo,
    activeTargetLanguage,
    activeCurriculum,
    drillConfig,
    orderedUnits: ctxOrderedUnits
  } = useProgress();

  const levels = activeCurriculum?.levels || getAllLevels(activeTargetLanguage);
  const orderedUnits = ctxOrderedUnits || getAllUnitsOrdered(activeTargetLanguage);
  const [selectedLevelId, setSelectedLevelId] = useState("A1");
  const [isPlacementOpen, setIsPlacementOpen] = useState(false);

  const currentLevel = levels.find((lvl) => lvl.id.toUpperCase() === (selectedLevelId || "A1").toUpperCase()) || levels[0];

  // Calculate statistics for the current selected level
  const levelUnits = currentLevel.units || [];
  const completedInLevel = levelUnits.filter((u) => getUnitStatus(u.id) === "completed").length;
  const inProgressInLevel = levelUnits.filter((u) => getUnitStatus(u.id) === "in progress").length;
  const lockedInLevel = levelUnits.filter((u) => getUnitStatus(u.id) === "locked").length;

  const totalLevelProgress = Math.round(
    levelUnits.reduce((acc, u) => acc + getUnitProgress(u.id), 0) / (levelUnits.length || 1)
  );

  return (
    <div className="max-w-4xl mx-auto py-4 px-3 sm:px-6 space-y-6">
      {/* Hero Learning Path Banner */}
      <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white shadow-xl shadow-amber-500/15">
        <div className="relative z-10 max-w-xl">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              {activeCurriculum?.languageName || "Langue"} &bull; Level {currentLevel.id}
            </span>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-900/40 border border-white/20">
              {levelUnits.length} Structured Units
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight mb-2">
            {currentLevel.title}
          </h1>

          <p className="text-sm sm:text-base text-amber-50 leading-relaxed mb-5">
            {currentLevel.tagline}
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate("practice")}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm shadow-md transition-all active:scale-95"
            >
              <Layers className="w-4 h-4 text-amber-600" />
              <span>Vocabulaire Flashcards</span>
            </button>
            <button
              onClick={() => onNavigate("gender")}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900/40 hover:bg-slate-900/60 backdrop-blur-md text-white font-bold text-xs sm:text-sm transition-all active:scale-95 border border-white/20"
            >
              <Gamepad2 className="w-4 h-4 text-rose-300" />
              <span>{drillConfig?.title || "Entraîneur Rapide"}</span>
            </button>
            <button
              onClick={() => setIsPlacementOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600/90 hover:bg-indigo-600 text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 border border-indigo-400/40"
            >
              <Compass className="w-4 h-4 text-amber-300" />
              <span>Test de Niveau ({activeCurriculum?.languageName || "Placement"})</span>
            </button>
          </div>
        </div>

        {/* Ambient Glow */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
      </div>

      {/* Level Milestone Tabs (A1, A2, B1, B2) */}
      <div>
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Select CEFR Level ({levels.length} Levels &bull; {orderedUnits.length} Units)
          </span>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Current Level: {totalLevelProgress}% Complete
          </span>
        </div>

        <LevelSelector
          levels={levels}
          selectedLevelId={selectedLevelId}
          onSelectLevel={setSelectedLevelId}
        />
      </div>

      {/* Level Stats Bar: Completed / In Progress / Locked */}
      <div className="grid grid-cols-3 gap-3 p-3.5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm text-center">
        <div className="flex flex-col items-center">
          <span className="text-xs font-bold text-slate-400">Completed</span>
          <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
            {completedInLevel} / 8
          </span>
        </div>
        <div className="flex flex-col items-center border-x border-slate-100 dark:border-slate-800">
          <span className="text-xs font-bold text-slate-400">In Progress</span>
          <span className="text-lg font-black text-amber-600 dark:text-amber-400">
            {inProgressInLevel} / 8
          </span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-xs font-bold text-slate-400">Locked</span>
          <span className="text-lg font-black text-slate-400 dark:text-slate-500">
            {lockedInLevel} / 8
          </span>
        </div>
      </div>

      {/* Unlock Notice Banner */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-200 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <span>
            <strong>Progression Rule:</strong> Each unit unlocks automatically once the previous one reaches at least <strong>70% mastery</strong> (Lessons 40% + Exercises 30% + SRS retention 30%).
          </span>
        </div>

        {/* Quick Demo Helper */}
        <button
          type="button"
          onClick={() => {
            // Quick test: mark unit 1 to 75% so unit 2 unlocks!
            if (levelUnits[0]) {
              setUnitProgress(levelUnits[0].id, 75);
            }
          }}
          className="text-[11px] font-bold text-amber-700 dark:text-amber-300 underline hover:no-underline"
        >
          Simulate Unit 1 at 75%
        </button>
      </div>

      {/* 8 Units of Selected Level */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-lg font-black text-slate-900 dark:text-white">
            Level {currentLevel.id} Units ({levelUnits.length} Total)
          </h2>
          <span className="text-xs text-slate-400">
            Stored in <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">/src/data/curriculum.json</code>
          </span>
        </div>

        {levelUnits.map((unit, index) => {
          // Find preceding unit in ordered sequence for unlock tooltips
          const overallIndex = orderedUnits.findIndex((u) => u.id === unit.id);
          const previousUnit = overallIndex > 0 ? orderedUnits[overallIndex - 1] : null;

          return (
            <UnitCard
              key={unit.id}
              unit={unit}
              previousUnitTitle={previousUnit ? previousUnit.title : null}
              previousUnitId={previousUnit ? previousUnit.id : null}
              onStartLesson={onSelectLesson}
            />
          );
        })}
      </div>

      {/* Placement Test Adaptive Modal */}
      <PlacementTestModal
        isOpen={isPlacementOpen}
        onClose={() => setIsPlacementOpen(false)}
        onComplete={(result) => {
          if (result && result.recommendedUnitId) {
            unlockUnitsUpTo(result.recommendedUnitId);
            if (result.recommendedLevel) {
              const base = result.recommendedLevel.slice(0, 2);
              if (["A1", "A2", "B1", "B2"].includes(base)) {
                setSelectedLevelId(base);
              }
            }
          }
        }}
      />
    </div>
  );
}
