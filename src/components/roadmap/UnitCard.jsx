import React, { useState } from "react";
import {
  Lock,
  Unlock,
  CheckCircle2,
  Play,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Plus,
  BookOpen,
  Handshake,
  Clock,
  Users,
  Utensils,
  Sun,
  ShoppingBag,
  MapPin,
  Smile,
  Train,
  Activity,
  Home,
  History,
  CloudSun,
  Briefcase,
  Shirt,
  PartyPopper,
  Award,
  Cpu,
  Leaf,
  Heart,
  GraduationCap,
  Globe,
  Building,
  Compass,
  Lightbulb,
  MessageSquare,
  Palette,
  Brain,
  Scale
} from "lucide-react";
import { Card } from "../common/Card";
import { LessonNode } from "./LessonNode";
import { useProgress } from "../../context/ProgressContext";

const ICON_MAP = {
  Handshake,
  Clock,
  Users,
  Utensils,
  Sun,
  ShoppingBag,
  MapPin,
  Smile,
  Train,
  Activity,
  Home,
  History,
  CloudSun,
  Briefcase,
  Shirt,
  PartyPopper,
  Award,
  Cpu,
  Leaf,
  Heart,
  GraduationCap,
  Globe,
  Building,
  Compass,
  Lightbulb,
  MessageSquare,
  Palette,
  Brain,
  Scale,
  Sparkles,
  CheckCircle2
};

export function UnitCard({ unit, previousUnitTitle, previousUnitId, onStartLesson }) {
  const {
    getUnitProgress,
    getUnitStatus,
    advanceUnitProgress,
    setUnitProgress,
    getUnitMasteryBreakdown,
    unlockUnitOverride
  } = useProgress();
  const [isExpanded, setIsExpanded] = useState(false);

  const progressPercent = getUnitProgress(unit.id);
  const status = getUnitStatus(unit.id); // "locked" | "in progress" | "completed"
  const isLocked = status === "locked";
  const isCompleted = status === "completed";

  const prevMastery = isLocked && previousUnitId ? getUnitMasteryBreakdown(previousUnitId) : null;

  const IconComponent = ICON_MAP[unit.icon] || BookOpen;

  // Status visual styles
  const statusBadge = {
    locked: {
      label: "Locked",
      className: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700",
      icon: Lock
    },
    "in progress": {
      label: "In Progress",
      className: "bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-700 animate-pulse",
      icon: Play
    },
    completed: {
      label: "Completed",
      className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700",
      icon: CheckCircle2
    }
  }[status];

  const StatusIcon = statusBadge.icon;

  const handleQuickAdvance = (e) => {
    e.stopPropagation();
    advanceUnitProgress(unit.id, 25);
  };

  const handleCompleteUnit = (e) => {
    e.stopPropagation();
    setUnitProgress(unit.id, 100);
  };

  return (
    <Card
      className={`p-5 sm:p-6 mb-5 transition-all duration-300 ${
        isLocked
          ? "opacity-60 bg-slate-100/50 dark:bg-slate-900/40 border-dashed border-slate-300 dark:border-slate-800"
          : isCompleted
          ? "border-emerald-500/40 dark:border-emerald-500/30 shadow-sm"
          : "border-slate-200 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-600 shadow-md"
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        {/* Left Side: Icon & Title */}
        <div className="flex items-start gap-4">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border transition-transform ${
              isLocked
                ? "bg-slate-200/60 dark:bg-slate-800 text-slate-400 border-slate-300 dark:border-slate-700"
                : isCompleted
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
            }`}
          >
            {isLocked ? <Lock className="w-5 h-5" /> : <IconComponent className="w-6 h-6" />}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Unit {unit.unitNumber}
              </span>

              {/* Status Badge */}
              <span
                className={`inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full ${statusBadge.className}`}
              >
                <StatusIcon className="w-3 h-3" />
                <span className="capitalize">{statusBadge.label}</span>
              </span>

              {unit.germanTitle && (
                <span className="text-xs font-medium text-slate-400 dark:text-slate-500 hidden sm:inline">
                  • {unit.germanTitle}
                </span>
              )}
            </div>

            <h3 className="text-lg font-black text-slate-900 dark:text-white leading-snug">
              {unit.title}
            </h3>

            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
              {unit.description}
            </p>
          </div>
        </div>

        {/* Right Side: Quick Action & Controls */}
        <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
          {!isLocked && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleQuickAdvance}
                title="Simulate learning: Add +25% progress"
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-all active:scale-95"
              >
                <Plus className="w-3.5 h-3.5 text-amber-500" />
                <span>+25%</span>
              </button>

              {progressPercent < 100 && (
                <button
                  type="button"
                  onClick={handleCompleteUnit}
                  title="Mark unit 100% complete"
                  className="px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs font-semibold transition-all active:scale-95 border border-emerald-200 dark:border-emerald-800"
                >
                  100%
                </button>
              )}
            </div>
          )}

          {isLocked && (
            <button
              type="button"
              onClick={() => unlockUnitOverride(unit.id)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-amber-500 hover:text-white dark:bg-slate-800 dark:hover:bg-amber-600 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all active:scale-95 border border-slate-300 dark:border-slate-700"
              title="Manual override: unlock this unit now"
            >
              <Unlock className="w-3.5 h-3.5 text-amber-500 hover:text-white" />
              <span>Unlock Override</span>
            </button>
          )}
        </div>
      </div>

      {/* Locked Requirement & Mastery Breakdown Banner */}
      {isLocked && (
        <div className="mt-3.5 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-bold">
              <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>
                Requires ≥70% mastery on previous unit {previousUnitTitle ? `("${previousUnitTitle}")` : ""}.
                {prevMastery && (
                  <span className="ml-1 text-amber-700 dark:text-amber-300">
                    (Current: {prevMastery.total}%)
                  </span>
                )}
              </span>
            </div>

            <button
              type="button"
              onClick={() => unlockUnitOverride(unit.id)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs shadow-xs transition-all active:scale-95 shrink-0 self-start sm:self-auto"
            >
              <Unlock className="w-3 h-3" />
              <span>Unlock Anyway</span>
            </button>
          </div>

          {prevMastery && (
            <div className="flex flex-wrap items-center gap-2 pt-1.5 border-t border-amber-500/20 text-[11px] text-amber-800 dark:text-amber-300">
              <span className="font-semibold text-slate-500 dark:text-slate-400">Mastery Criteria:</span>
              <span className="px-2 py-0.5 rounded bg-white/70 dark:bg-black/20 font-medium">
                Lessons: <strong>{prevMastery.lessonCompletion}%</strong> (40%)
              </span>
              <span className="px-2 py-0.5 rounded bg-white/70 dark:bg-black/20 font-medium">
                Exercises: <strong>{prevMastery.exerciseAccuracy}%</strong> (30%)
              </span>
              <span className="px-2 py-0.5 rounded bg-white/70 dark:bg-black/20 font-medium">
                SRS Retention: <strong>{prevMastery.srsRetention}%</strong> (30%)
              </span>
            </div>
          )}
        </div>
      )}

      {/* Progress Bar Section */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between text-xs font-bold mb-1.5">
          <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
            <span>Progress</span>
            {progressPercent >= 70 && progressPercent < 100 && (
              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-extrabold px-1.5 py-0.2 rounded bg-amber-50 dark:bg-amber-950/40">
                Next Unit Unlocked! (≥70%)
              </span>
            )}
          </span>
          <span
            className={`font-black ${
              isCompleted
                ? "text-emerald-600 dark:text-emerald-400"
                : isLocked
                ? "text-slate-400"
                : "text-amber-600 dark:text-amber-400"
            }`}
          >
            {progressPercent}%
          </span>
        </div>

        {/* The Track with 70% marker */}
        <div className="relative w-full h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isCompleted
                ? "bg-emerald-500"
                : isLocked
                ? "bg-slate-400"
                : "bg-gradient-to-r from-amber-500 to-orange-500"
            }`}
            style={{ width: `${progressPercent}%` }}
          />

          {/* 70% threshold guideline mark */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-slate-400 dark:bg-slate-600 z-10"
            style={{ left: "70%" }}
            title="70% unlock threshold"
          />
        </div>

        <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1">
          <span>0%</span>
          <span className="font-semibold text-slate-500 dark:text-slate-400">
            ▲ 70% to unlock next unit
          </span>
          <span>100%</span>
        </div>
      </div>

      {/* Grammar summary tip */}
      {unit.grammarSummary && !isLocked && (
        <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
          <span className="font-bold text-slate-900 dark:text-slate-100 mr-1.5">
            💡 Grammar:
          </span>
          {unit.grammarSummary}
        </div>
      )}

      {/* Expand/Collapse Lessons Accordion */}
      {!isLocked && unit.lessons && unit.lessons.length > 0 && (
        <div className="mt-3 pt-2">
          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            className="w-full flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 py-1"
          >
            <span>
              {unit.lessons.length} Lesson{unit.lessons.length > 1 ? "s" : ""} Available
            </span>
            <div className="flex items-center gap-1">
              <span>{isExpanded ? "Hide" : "Show"} Lessons</span>
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </button>

          {isExpanded && (
            <div className="mt-3 space-y-2 animate-in fade-in duration-200">
              {unit.lessons.map((lesson) => (
                <LessonNode
                  key={lesson.id}
                  lesson={lesson}
                  isCompleted={progressPercent >= 100}
                  onStartLesson={onStartLesson}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
