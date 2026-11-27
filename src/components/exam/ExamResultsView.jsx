import React, { useEffect } from "react";
import confetti from "canvas-confetti";
import {
  Award,
  CheckCircle2,
  XCircle,
  RotateCcw,
  BookOpen,
  Headphones,
  PenTool,
  Mic,
  Clock,
  Sparkles,
  ArrowLeft,
  ChevronRight,
  Layers,
  ShieldCheck,
  AlertCircle
} from "lucide-react";
import { Button } from "../common/Button";
import { playSound } from "../../utils/soundEffects";

const MODULE_ICONS = {
  lesen: BookOpen,
  leseverstehen: BookOpen,
  hoeren: Headphones,
  hoerverstehen: Headphones,
  hoeren_lesen: BookOpen,
  sprachbausteine: Layers,
  schreiben: PenTool,
  schriftlicher_ausdruck: PenTool,
  sprechen: Mic,
  muendlicher_ausdruck: Mic
};

export function ExamResultsView({ exam, result, onRetake, onBackToExams }) {
  const {
    totalScore,
    maxScore = 100,
    percentage = 0,
    passed,
    grade,
    timeSpentSeconds,
    details,
    moduleScores = {},
    writtenPart,
    oralPart,
    institution,
    examName
  } = result;

  useEffect(() => {
    if (passed) {
      playSound.fanfare();
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    } else {
      playSound.incorrect();
    }
  }, [passed]);

  const minutesSpent = Math.max(1, Math.round((timeSpentSeconds || 0) / 60));
  const modulesList = Object.values(moduleScores);

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-2 animate-in fade-in duration-300">
      {/* Certificate / Result Card */}
      <div
        className={`p-6 sm:p-8 rounded-3xl border text-center shadow-xl transition-all ${
          passed
            ? "bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-700 text-white border-emerald-400 shadow-emerald-500/20"
            : "bg-gradient-to-br from-rose-500 via-red-600 to-rose-700 text-white border-rose-400 shadow-rose-500/20"
        }`}
      >
        <div className="max-w-xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-xs font-black uppercase tracking-wider">
            <Award className="w-4 h-4" />
            <span>
              {institution || exam?.institution || "Offizielle"} &bull; {examName || exam?.title || "Prüfung"} {exam?.level}
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
            {passed ? "HERZLICHEN GLÜCKWUNSCH!" : "LEIDER NICHT BESTANDEN"}
          </h2>

          <p className="text-sm sm:text-base text-emerald-100 dark:text-rose-100 font-medium leading-relaxed">
            {details || (passed ? "Sie haben die Modellprüfung erfolgreich bestanden!" : "Weiter üben!")}
          </p>

          {/* Big Score Display */}
          <div className="py-4 flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            <div className="px-6 py-4 rounded-3xl bg-white/15 backdrop-blur-md border border-white/20 text-center min-w-[140px]">
              <span className="text-4xl sm:text-5xl font-black block leading-none">
                {totalScore}
              </span>
              <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-100 mt-1 block">
                von {maxScore} Punkten ({percentage}%)
              </span>
            </div>

            <div className="px-6 py-4 rounded-3xl bg-white/15 backdrop-blur-md border border-white/20 text-center min-w-[140px]">
              <span className="text-lg sm:text-xl font-black block uppercase leading-snug">
                {grade}
              </span>
              <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-100 mt-1 block">
                Ergebnis / Prädikat
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-emerald-100 dark:text-rose-100">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              Bearbeitungszeit: {minutesSpent} Minuten
            </span>
            <span>&bull;</span>
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              {passed ? "+150 XP verdient" : "+50 XP Erfahrung"}
            </span>
          </div>
        </div>
      </div>

      {/* Dual Written / Oral Status if available (telc / ÖSD) */}
      {writtenPart && oralPart && (
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 text-slate-100 space-y-3">
          <span className="text-xs font-black uppercase tracking-wider text-slate-400 block">
            Prüfungsteile im Überblick (Separate Pass-Bedingung)
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className={`p-4 rounded-2xl border ${writtenPart.passed ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800" : "bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800"}`}>
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-sm">1. Schriftliche Prüfung</span>
                <span className={`text-xs font-black px-2 py-0.5 rounded-full ${writtenPart.passed ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"}`}>
                  {writtenPart.passed ? "Bestanden (≥60%)" : "Nicht bestanden"}
                </span>
              </div>
              <div className="text-xl font-black mt-2">
                {writtenPart.score} <span className="text-xs font-normal text-slate-500">/ {writtenPart.maxPoints} Pkt ({writtenPart.percentage}%)</span>
              </div>
            </div>

            <div className={`p-4 rounded-2xl border ${oralPart.passed ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800" : "bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800"}`}>
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-sm">2. Mündliche Prüfung</span>
                <span className={`text-xs font-black px-2 py-0.5 rounded-full ${oralPart.passed ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"}`}>
                  {oralPart.passed ? "Bestanden (≥60%)" : "Nicht bestanden"}
                </span>
              </div>
              <div className="text-xl font-black mt-2">
                {oralPart.score} <span className="text-xs font-normal text-slate-500">/ {oralPart.maxPoints} Pkt ({oralPart.percentage}%)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Module Breakdown Grid */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          Ergebnis nach Prüfungsteilen (Module Breakdown)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {modulesList.map((m) => {
            const Icon = MODULE_ICONS[m.id] || BookOpen;
            const pct = m.percentage || Math.round((m.score / (m.maxPoints || 1)) * 100);

            return (
              <div
                key={m.id}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-100 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-black text-slate-400">
                    Max: {m.maxPoints}
                  </span>
                </div>

                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase truncate block">
                    {m.name || m.title}
                  </span>
                  <div className="text-2xl font-black text-slate-900 dark:text-white">
                    {m.score}{" "}
                    <span className="text-xs font-medium text-slate-400">/ {m.maxPoints}</span>
                  </div>
                </div>

                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      pct >= 60 ? "bg-emerald-500" : "bg-rose-500"
                    }`}
                    style={{ width: `${Math.min(100, pct)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>{pct}%</span>
                  <span className={pct >= 60 ? "text-emerald-600 font-bold" : "text-rose-500 font-bold"}>
                    {pct >= 60 ? "Bestanden" : "Schwäche"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200 dark:border-slate-800">
        <Button
          variant="secondary"
          onClick={onBackToExams}
          icon={ArrowLeft}
        >
          Zurück zur Prüfungsübersicht
        </Button>

        <Button
          variant="primary"
          onClick={onRetake}
          icon={RotateCcw}
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          Prüfung wiederholen
        </Button>
      </div>
    </div>
  );
}
