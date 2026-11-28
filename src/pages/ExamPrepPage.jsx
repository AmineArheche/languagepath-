import React, { useState, useMemo } from "react";
import {
  Award,
  Clock,
  BookOpen,
  Headphones,
  PenTool,
  Mic,
  CheckCircle2,
  AlertCircle,
  Play,
  RotateCcw,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Calendar,
  History,
  Layers,
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
  Minus,
  ExternalLink,
  Target,
  Edit3
} from "lucide-react";
import {
  EXAM_INSTITUTIONS,
  getExam,
  getAvailableLevelsForExam,
  evaluateExamAttempt
} from "../data/exams/index";
import { ExamTimer } from "../components/exam/ExamTimer";
import { ExamModuleLesen } from "../components/exam/ExamModuleLesen";
import { ExamModuleHoeren } from "../components/exam/ExamModuleHoeren";
import { ExamModuleSchreiben } from "../components/exam/ExamModuleSchreiben";
import { ExamModuleSprechen } from "../components/exam/ExamModuleSprechen";
import { ExamModuleSprachbausteine } from "../components/exam/ExamModuleSprachbausteine";
import { ExamResultsView } from "../components/exam/ExamResultsView";
import { Button } from "../components/common/Button";
import { Card } from "../components/common/Card";
import { useProgress } from "../context/ProgressContext";
import { useLocalStorage } from "../hooks/useLocalStorage";

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

export function ExamPrepPage() {
  const {
    progress,
    recordExamResult,
    recordError,
    getWeakSpots,
    getExamInstitutions,
    getExamConfig,
    activeTargetLanguage,
    activeCurriculum
  } = useProgress();

  const institutions = useMemo(() => {
    return getExamInstitutions ? getExamInstitutions() : EXAM_INSTITUTIONS;
  }, [getExamInstitutions, activeTargetLanguage]);

  // Selected Exam Institution & CEFR Level
  const [selectedInstitution, setSelectedInstitution] = useLocalStorage("deutschpath_exam_institution", "goethe");
  const [selectedLevel, setSelectedLevel] = useLocalStorage("deutschpath_exam_level", "B1");

  const activeInstId = useMemo(() => {
    const exists = institutions.some((i) => i.id === selectedInstitution);
    return exists ? selectedInstitution : (institutions[0]?.id || "goethe");
  }, [institutions, selectedInstitution]);

  // State: "overview" | "taking" | "results"
  const [examState, setExamState] = useState("overview");

  // Mode: "full_mock" | "single_module"
  const [practiceMode, setPracticeMode] = useState("full_mock");
  const [activeSingleModuleId, setActiveSingleModuleId] = useState(null);

  // Active module tab index/id during examination
  const [activeModuleTab, setActiveModuleTab] = useState("lesen");

  // User answers { [questionOrTaskId]: value }
  const [answers, setAnswers] = useState({});
  const [lastResult, setLastResult] = useState(null);

  // Target exam date countdown
  const [targetExamDate, setTargetExamDate] = useLocalStorage("deutschpath_target_exam_date", "");
  const [isEditingExamDate, setIsEditingExamDate] = useState(false);
  const [examDateInput, setExamDateInput] = useState(targetExamDate);

  // Available levels for selected institution
  const availableLevels = useMemo(() => {
    if (activeTargetLanguage === "de") {
      return getAvailableLevelsForExam(activeInstId);
    }
    const found = institutions.find((i) => i.id === activeInstId);
    return found?.defaultLevels || ["A1", "A2", "B1", "B2"];
  }, [activeInstId, activeTargetLanguage, institutions]);

  // Ensure selectedLevel is valid for current institution
  const currentLevel = useMemo(() => {
    if (availableLevels.includes(selectedLevel)) return selectedLevel;
    return availableLevels[0] || "B1";
  }, [availableLevels, selectedLevel]);

  // Active exam mock configuration
  const currentExam = useMemo(() => {
    if (getExamConfig) {
      return getExamConfig(activeInstId, currentLevel);
    }
    return getExam(activeInstId, currentLevel);
  }, [getExamConfig, activeInstId, currentLevel]);

  const activeModules = currentExam.modules || [];

  // Active module object
  const currentModule = useMemo(() => {
    return activeModules.find((m) => m.id === activeModuleTab) || activeModules[0];
  }, [activeModules, activeModuleTab]);

  // Past exam attempts for selected institution & level
  const pastAttemptsForLevel = useMemo(() => {
    const history = progress.examHistory || [];
    return history.filter(
      (h) =>
        h.level === currentLevel &&
        (!h.examId || h.examId === selectedInstitution || selectedInstitution === "goethe")
    );
  }, [progress.examHistory, currentLevel, selectedInstitution]);

  // 1. Exam Date Countdown calculation
  const countdownStats = useMemo(() => {
    if (!targetExamDate) return null;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const target = new Date(targetExamDate);
    target.setHours(0, 0, 0, 0);

    const diffMs = target - now;
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    return {
      daysRemaining: diffDays,
      targetDateStr: target.toLocaleDateString("de-DE", {
        weekday: "short",
        year: "numeric",
        month: "long",
        day: "numeric"
      }),
      isPast: diffDays < 0,
      isToday: diffDays === 0
    };
  }, [targetExamDate]);

  // 2. Auto Study Plan weighted by weakest module (from errorLedger & weakSpots)
  const studyPlan = useMemo(() => {
    const weakSpots = getWeakSpots ? getWeakSpots() : [];
    const moduleMistakeWeights = {
      lesen: 1,
      hoeren: 1,
      schreiben: 1,
      sprechen: 1,
      sprachbausteine: 1
    };

    // Aggregate from error ledger weak spots
    weakSpots.forEach((spot) => {
      const mod = (spot.module || "").toLowerCase();
      const cat = (spot.category || "").toLowerCase();
      const count = spot.mistakes || 1;

      if (mod === "reading" || mod === "lesen") {
        moduleMistakeWeights.lesen += count;
      } else if (mod === "hoeren" || mod === "listening") {
        moduleMistakeWeights.hoeren += count;
      } else if (mod === "writing" || mod === "schreiben") {
        moduleMistakeWeights.schreiben += count;
      } else if (mod === "sprechen" || mod === "speaking") {
        moduleMistakeWeights.sprechen += count;
      } else if (
        mod === "grammar" ||
        cat.includes("connector") ||
        cat.includes("preposition") ||
        cat.includes("case") ||
        cat.includes("verb-position")
      ) {
        moduleMistakeWeights.sprachbausteine += count * 1.4;
      }
    });

    // Factor in previous exam failure areas
    if (pastAttemptsForLevel.length > 0) {
      const lastAttempt = pastAttemptsForLevel[0];
      if (lastAttempt.moduleScores) {
        Object.values(lastAttempt.moduleScores).forEach((m) => {
          if (!m.passed || m.percentage < 65) {
            const key = m.id.includes("sprach")
              ? "sprachbausteine"
              : m.id.includes("les")
              ? "lesen"
              : m.id.includes("hoer")
              ? "hoeren"
              : m.id.includes("schreib")
              ? "schreiben"
              : "sprechen";
            moduleMistakeWeights[key] = (moduleMistakeWeights[key] || 1) + 6;
          }
        });
      }
    }

    const totalWeight = Object.values(moduleMistakeWeights).reduce((a, b) => a + b, 0);

    const plan = activeModules.map((mod) => {
      const key = mod.id.includes("sprach")
        ? "sprachbausteine"
        : mod.id.includes("les")
        ? "lesen"
        : mod.id.includes("hoer")
        ? "hoeren"
        : mod.id.includes("schreib")
        ? "schreiben"
        : "sprechen";
      const weight = moduleMistakeWeights[key] || 1;
      const percentage = Math.round((weight / totalWeight) * 100);
      const dailyMinutes = Math.max(10, Math.round((percentage / 100) * 60));

      return {
        moduleId: mod.id,
        title: mod.title,
        name: mod.name || mod.title,
        weight,
        percentage,
        dailyMinutes,
        isWeakest: false
      };
    });

    plan.sort((a, b) => b.percentage - a.percentage);
    if (plan.length > 0) {
      plan[0].isWeakest = true;
    }

    return plan;
  }, [getWeakSpots, pastAttemptsForLevel, activeModules]);

  // Handle starting full timed mock
  const handleStartExam = (singleModId = null) => {
    setAnswers({});
    setLastResult(null);

    if (singleModId) {
      setPracticeMode("single_module");
      setActiveSingleModuleId(singleModId);
      setActiveModuleTab(singleModId);
    } else {
      setPracticeMode("full_mock");
      setActiveSingleModuleId(null);
      setActiveModuleTab(activeModules[0]?.id || "lesen");
    }

    setExamState("taking");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleFinishAndGrade = (elapsedSeconds = 1200) => {
    const evalResult = evaluateExamAttempt({
      exam: currentExam.examMeta,
      levelConfig: currentExam,
      answers,
      elapsedSeconds,
      recordError
    });

    recordExamResult(evalResult);
    setLastResult(evalResult);
    setExamState("results");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSaveExamDate = () => {
    setTargetExamDate(examDateInput);
    setIsEditingExamDate(false);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* 1. STATE: TAKING THE EXAM (MOCK OR MODULE DRILL) */}
      {examState === "taking" && (
        <div className="space-y-6">
          {/* Active Sticky Timer */}
          <ExamTimer
            durationMinutes={
              practiceMode === "single_module"
                ? currentModule?.durationMinutes || 30
                : currentExam.totalDurationMinutes || 90
            }
            onTimeUp={() => handleFinishAndGrade((currentExam.totalDurationMinutes || 90) * 60)}
            onFinishEarly={(elapsed) => handleFinishAndGrade(elapsed)}
            activeModuleTitle={`${currentExam.examMeta.name} ${currentLevel} • ${currentModule?.name || currentModule?.title}`}
          />

          {/* Module Selector Tabs (if in full mock mode) */}
          {practiceMode === "full_mock" && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200 dark:border-slate-800">
              {activeModules.map((mod, mIdx) => {
                const Icon = MODULE_ICONS[mod.id] || BookOpen;
                const isActive = activeModuleTab === mod.id;

                return (
                  <button
                    key={mod.id}
                    onClick={() => setActiveModuleTab(mod.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap ${
                      isActive
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                        : "bg-slate-900 text-slate-300 border border-slate-800 hover:border-indigo-400"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>
                      {mIdx + 1}. {mod.title} ({mod.points} Pkt)
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Dynamic Module Content */}
          <div className="pt-2">
            {(currentModule?.id === "lesen" ||
              currentModule?.id === "leseverstehen" ||
              currentModule?.id === "hoeren_lesen") && (
              <ExamModuleLesen
                moduleData={currentModule}
                answers={answers}
                onAnswerChange={handleAnswerChange}
                isSubmitted={false}
              />
            )}

            {currentModule?.id === "sprachbausteine" && (
              <ExamModuleSprachbausteine
                moduleData={currentModule}
                answers={answers}
                onAnswerChange={handleAnswerChange}
                isSubmitted={false}
              />
            )}

            {(currentModule?.id === "hoeren" || currentModule?.id === "hoerverstehen") && (
              <ExamModuleHoeren
                moduleData={currentModule}
                answers={answers}
                onAnswerChange={handleAnswerChange}
                isSubmitted={false}
              />
            )}

            {(currentModule?.id === "schreiben" ||
              currentModule?.id === "schriftlicher_ausdruck") && (
              <ExamModuleSchreiben
                moduleData={currentModule}
                answers={answers}
                onAnswerChange={handleAnswerChange}
                isSubmitted={false}
              />
            )}

            {(currentModule?.id === "sprechen" ||
              currentModule?.id === "muendlicher_ausdruck") && (
              <ExamModuleSprechen
                moduleData={currentModule}
                answers={answers}
                onAnswerChange={handleAnswerChange}
                isSubmitted={false}
                level={currentLevel}
                rubricInstitution={selectedInstitution}
              />
            )}
          </div>

          {/* Module Navigation Footer */}
          <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <Button
              variant="secondary"
              onClick={() => {
                const currentIdx = activeModules.findIndex((m) => m.id === activeModuleTab);
                if (currentIdx > 0) {
                  setActiveModuleTab(activeModules[currentIdx - 1].id);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }
              }}
              disabled={
                practiceMode === "single_module" ||
                activeModules.findIndex((m) => m.id === activeModuleTab) === 0
              }
            >
              Previous Module
            </Button>

            {practiceMode === "full_mock" &&
            activeModules.findIndex((m) => m.id === activeModuleTab) <
              activeModules.length - 1 ? (
              <Button
                variant="primary"
                onClick={() => {
                  const currentIdx = activeModules.findIndex((m) => m.id === activeModuleTab);
                  if (currentIdx < activeModules.length - 1) {
                    setActiveModuleTab(activeModules[currentIdx + 1].id);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                Next Module
                <ChevronRight className="w-4 h-4 ml-1.5" />
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={() => handleFinishAndGrade()}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold"
              >
                <CheckCircle2 className="w-4 h-4 mr-1.5" />
                Finish &amp; Grade Exam
              </Button>
            )}
          </div>
        </div>
      )}

      {/* 2. STATE: EXAM RESULTS VIEW */}
      {examState === "results" && lastResult && (
        <ExamResultsView
          exam={currentExam}
          result={lastResult}
          onRetake={() => handleStartExam(activeSingleModuleId)}
          onBackToExams={() => setExamState("overview")}
        />
      )}

      {/* 3. STATE: OVERVIEW / DASHBOARD */}
      {examState === "overview" && (
        <div className="space-y-8">
          {/* Hero Banner */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-slate-900 text-white p-6 sm:p-8 shadow-xl shadow-indigo-500/10 space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-black uppercase tracking-wider">
              <Award className="w-4 h-4" />
              <span>Data-Driven Examination Engine</span>
            </div>

            <div className="max-w-2xl space-y-2">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight">
                Official {activeCurriculum?.name || "Language"} Exam Preparation
              </h1>
              <p className="text-sm sm:text-base text-indigo-100 font-medium leading-relaxed">
                Realistic timed mock exams and per-module drills for <strong>{activeCurriculum?.exam || "Official Certifications"}</strong> and accredited CEFR certifications.
              </p>
            </div>

            {/* Exam Pass Rules Badge */}
            <div className="pt-2 flex flex-wrap items-center gap-3 text-xs font-bold">
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-black/20 backdrop-blur-sm">
                <ShieldCheck className="w-4 h-4 text-emerald-300" />
                <span>{currentExam.passRules?.ruleDescription}</span>
              </span>
              {currentExam.passRules?.source && (
                <a
                  href={currentExam.passRules.source}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 px-3 py-1.5 rounded-2xl bg-black/20 backdrop-blur-sm text-indigo-200 hover:text-white"
                >
                  <span>Official Regulations</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>

          {/* Target Exam Date Countdown Widget */}
          <Card className="p-5 sm:p-6 space-y-4 border-2 border-indigo-100 dark:border-indigo-950">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base">
                    Official Exam Date Countdown
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Set your registration date to receive an auto-calculated daily study pace.
                  </p>
                </div>
              </div>

              {!isEditingExamDate ? (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setExamDateInput(targetExamDate);
                    setIsEditingExamDate(true);
                  }}
                  icon={Edit3}
                  className="text-xs"
                >
                  {targetExamDate ? "Change Date" : "Set Exam Date"}
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={examDateInput}
                    onChange={(e) => setExamDateInput(e.target.value)}
                    className="px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800 text-white text-xs font-bold"
                  />
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleSaveExamDate}
                    className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    Save
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditingExamDate(false)}
                    className="text-xs"
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>

            {countdownStats ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900">
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    Countdown to {currentExam.examMeta.name} {currentLevel}
                  </span>
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                    {countdownStats.isPast
                      ? "Exam date has passed"
                      : countdownStats.isToday
                      ? "Prüfungstag ist HEUTE! Viel Erfolg!"
                      : `${countdownStats.daysRemaining} Tage verbleibend`}
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Geplanter Termin: {countdownStats.targetDateStr}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="px-4 py-2.5 rounded-2xl bg-slate-900 border border-indigo-800 text-center">
                    <span className="text-[10px] font-bold text-slate-400 block">Daily Target</span>
                    <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">
                      {countdownStats.daysRemaining > 0
                        ? `${Math.max(30, Math.round(900 / Math.max(1, countdownStats.daysRemaining)))} min/d`
                        : "60 min/d"}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 text-xs text-slate-500 flex items-center justify-between">
                <span>No official exam date configured yet. Click "Set Exam Date" above to begin your countdown!</span>
              </div>
            )}
          </Card>

          {/* Institution Selector Pills */}
          <div className="space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400 block">
              1. Select Examination System
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {institutions.map((inst) => {
                const isActive = activeInstId === inst.id;
                return (
                  <button
                    key={inst.id}
                    onClick={() => setSelectedInstitution(inst.id)}
                    className={`p-3.5 rounded-2xl text-left border transition-all ${
                      isActive
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20 scale-[1.02]"
                        : "bg-slate-900 border-slate-800 text-slate-300 hover:border-indigo-400"
                    }`}
                  >
                    <span className="text-sm font-extrabold block truncate">{inst.name}</span>
                    <span className={`text-[10px] block mt-0.5 ${isActive ? "text-indigo-100" : "text-slate-400"}`}>
                      {inst.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* CEFR Level Selector Pills */}
          <div className="space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400 block">
              2. Select CEFR Level for {currentExam.examMeta.name}
            </span>

            <div className="flex flex-wrap items-center gap-2.5">
              {availableLevels.map((lvl) => {
                const isActive = currentLevel === lvl;
                const isStub = lvl === "C1";

                return (
                  <button
                    key={lvl}
                    onClick={() => setSelectedLevel(lvl)}
                    className={`px-4 py-2 rounded-2xl font-black text-xs sm:text-sm transition-all flex items-center gap-2 ${
                      isActive
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20 scale-105"
                        : "bg-slate-900 text-slate-300 border border-slate-800 hover:border-indigo-400"
                    }`}
                  >
                    <span>Level {lvl}</span>
                    {isStub && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-400/20 text-amber-500 font-bold">
                        Stub
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Exam Structure & Actions Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 text-slate-100 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  {currentExam.subtitle}
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                  {currentExam.title}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
                  {currentExam.examMeta.description}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => handleStartExam()}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20 font-extrabold"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Full Timed Mock ({currentExam.totalDurationMinutes} min)
                </Button>
              </div>
            </div>

            {/* Dynamic Modules Grid */}
            <div className="space-y-3">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400 block">
                Modules in this Examination (Click to practice individually):
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {activeModules.map((mod, idx) => {
                  const Icon = MODULE_ICONS[mod.id] || BookOpen;

                  return (
                    <div
                      key={mod.id}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 flex flex-col justify-between gap-3 group hover:border-indigo-400 transition-all"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="p-2 rounded-xl bg-slate-800 text-indigo-400 shadow-2xs">
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className="text-[11px] font-black text-indigo-600 dark:text-indigo-400">
                            {mod.points} Punkte
                          </span>
                        </div>

                        <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">
                          {idx + 1}. {mod.title}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                          {mod.description}
                        </p>
                      </div>

                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleStartExam(mod.id)}
                        className="w-full text-xs font-bold text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors"
                      >
                        Practice Module
                        <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Auto Study Plan Weighted by Weakest Module */}
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 text-slate-100 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-indigo-600" />
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                  Adaptive Study Plan (Weighted by Weakest Module)
                </h3>
              </div>
              <span className="text-xs text-slate-400">
                Generated from Error Ledger &amp; past exam history
              </span>
            </div>

            <div className="space-y-3">
              {studyPlan.map((planItem) => (
                <div
                  key={planItem.moduleId}
                  className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    planItem.isWeakest
                      ? "bg-rose-50/70 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800"
                      : "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                        {planItem.name}
                      </span>
                      {planItem.isWeakest && (
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-rose-500 text-white animate-pulse">
                          Priority #1 Weak Spot
                        </span>
                      )}
                    </div>
                    <div className="w-48 bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${planItem.isWeakest ? "bg-rose-500" : "bg-indigo-600"}`}
                        style={{ width: `${planItem.percentage}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                        Recommended: {planItem.dailyMinutes} min/day
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {planItem.percentage}% error weight
                      </span>
                    </div>

                    <Button
                      variant={planItem.isWeakest ? "primary" : "secondary"}
                      size="sm"
                      onClick={() => handleStartExam(planItem.moduleId)}
                      className="text-xs shrink-0"
                    >
                      Train Module
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Past Attempts Table with Module-Level Trends */}
          {pastAttemptsForLevel.length > 0 && (
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 text-slate-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <History className="w-5 h-5 text-indigo-500" />
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                    Examination History &amp; Module Trends ({currentExam.examMeta.name} {currentLevel})
                  </h3>
                </div>
                <span className="text-xs text-slate-400">
                  {pastAttemptsForLevel.length} Attempt(s) recorded
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px] font-black">
                      <th className="py-2.5 px-3">Datum</th>
                      <th className="py-2.5 px-3">Gesamtpunktzahl</th>
                      <th className="py-2.5 px-3">Module Breakdown</th>
                      <th className="py-2.5 px-3">Ergebnis</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {pastAttemptsForLevel.map((attempt, attIdx) => {
                      const prevAttempt = pastAttemptsForLevel[attIdx + 1];
                      const totalDiff = prevAttempt
                        ? attempt.totalScore - prevAttempt.totalScore
                        : null;

                      return (
                        <tr key={attempt.id || attIdx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <td className="py-3 px-3 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                            {attempt.date ? new Date(attempt.date).toLocaleDateString() : "Vor kurzem"}
                          </td>

                          <td className="py-3 px-3 font-black whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <span
                                className={
                                  attempt.passed
                                    ? "text-emerald-600 dark:text-emerald-400 text-base"
                                    : "text-rose-600 dark:text-rose-400 text-base"
                                }
                              >
                                {attempt.totalScore} / {attempt.maxScore || 100} Pkt
                              </span>

                              {totalDiff !== null && (
                                <span
                                  className={`text-[10px] font-bold flex items-center ${
                                    totalDiff > 0
                                      ? "text-emerald-600"
                                      : totalDiff < 0
                                      ? "text-rose-500"
                                      : "text-slate-400"
                                  }`}
                                >
                                  {totalDiff > 0 ? (
                                    <TrendingUp className="w-3 h-3 mr-0.5" />
                                  ) : totalDiff < 0 ? (
                                    <TrendingDown className="w-3 h-3 mr-0.5" />
                                  ) : (
                                    <Minus className="w-3 h-3 mr-0.5" />
                                  )}
                                  {totalDiff > 0 ? `+${totalDiff}` : totalDiff}
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="py-3 px-3">
                            <div className="flex flex-wrap gap-2 text-xs">
                              {attempt.moduleScores ? (
                                Object.values(attempt.moduleScores).map((m) => (
                                  <span
                                    key={m.id}
                                    className={`px-2 py-0.5 rounded-lg border font-bold ${
                                      m.passed
                                        ? "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                                        : "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-300"
                                    }`}
                                  >
                                    {m.title}: {m.score}/{m.maxPoints}
                                  </span>
                                ))
                              ) : (
                                <span className="text-slate-400">Standard Goethe Scores</span>
                              )}
                            </div>
                          </td>

                          <td className="py-3 px-3">
                            <span
                              className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full ${
                                attempt.passed
                                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                  : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                              }`}
                            >
                              {attempt.grade || (attempt.passed ? "Bestanden" : "Nicht bestanden")}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
