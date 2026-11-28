import React from "react";
import { useTranslation } from "react-i18next";
import {
  BarChart3,
  Map,
  Award,
  Layers,
  Gamepad2,
  BookOpen,
  BookMarked,
  Settings,
  Trophy,
  GraduationCap,
  MessageSquare,
  PenTool,
  Mic,
  User
} from "lucide-react";
import { useProgress } from "../../context/ProgressContext";
import { getAllUnitsOrdered } from "../../data/curriculum";

export function Sidebar({ currentPage, onNavigate }) {
  const { t } = useTranslation("ui");
  const {
    progress,
    getUnitStatus,
    allFlashcards,
    getDueCards,
    getWeakSpots,
    activeTargetLanguage,
    drillConfig,
    orderedUnits: ctxOrderedUnits
  } = useProgress();

  const orderedUnits = ctxOrderedUnits || getAllUnitsOrdered();
  const totalUnits = orderedUnits.length;
  const completedUnits = orderedUnits.filter((u) => getUnitStatus(u.id) === "completed").length;
  const progressPercent = Math.round((completedUnits / (totalUnits || 1)) * 100);

  const dueCount = getDueCards ? getDueCards(allFlashcards).length : 0;
  const weakSpotsList = getWeakSpots ? getWeakSpots() : [];
  const mistakeCount = Array.isArray(weakSpotsList)
    ? weakSpotsList.reduce((acc, s) => acc + (s.mistakes || 0), 0)
    : 0;

  const examLabels = {
    de: { label: "Goethe Exam Prep", desc: "Goethe & telc (A1–B2)" },
    en: { label: "IELTS & TOEFL Prep", desc: "Academic Mocks (B1–C1)" },
    es: { label: "Preparación DELE", desc: "Exámenes Oficiales (A1–B2)" },
    fr: { label: "Préparation DELF", desc: "Examens Blancs (A1–B2)" },
    ar: { label: "اختبارات CIMA", desc: "نماذج اختبارات الكفاءة" },
    it: { label: "Certificazione CELI", desc: "Esami Ufficiali (A1–B2)" }
  };
  const activeExam = examLabels[activeTargetLanguage] || examLabels.de;

  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      description: "Streak, charts & readiness",
      icon: BarChart3
    },
    { id: "roadmap", label: "Learning Path", description: "A1 to B2 journey", icon: Map },
    {
      id: "exam",
      label: activeExam.label,
      description: activeExam.desc,
      icon: Award
    },
    {
      id: "reading",
      label: "Reading Library",
      description: "Graded Texts & Audio",
      icon: BookMarked
    },
    {
      id: "writing",
      label: "Writing Studio",
      description: "AI Review & Model Answers",
      icon: PenTool
    },
    {
      id: "speaking",
      label: "Speaking Studio",
      description: "Oral Exam & Shadowing",
      icon: Mic
    },
    {
      id: "conversation",
      label: "AI Tutor Chat",
      description: "Roleplay & Corrections",
      icon: MessageSquare
    },
    {
      id: "practice",
      label: "Review Today",
      description: "SM-2 Flashcards",
      icon: Layers,
      badge: dueCount > 0 ? `${dueCount} due` : null
    },
    {
      id: "grammar",
      label: "Grammar Studio",
      description: "Exercises & Weak Spots",
      icon: GraduationCap,
      badge: mistakeCount > 0 ? `${mistakeCount} weak` : null
    },
    {
      id: "gender",
      label: drillConfig?.sidebarLabel || "der / die / das",
      description: drillConfig?.sidebarDesc || "Gender speed trainer",
      icon: Gamepad2
    },
    { id: "dictionary", label: "Vocabulary Bank", description: "Search all levels", icon: BookOpen },
    { id: "profile", label: "Mon Profil Client", description: "Multi-Langues & Progrès", icon: User },
    { id: "settings", label: "Settings & Backup", description: "Progress & preferences", icon: Settings }
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 shrink-0 p-4 border-e border-slate-200/80 dark:border-slate-800 min-h-[calc(100vh-4rem)]">
      <div className="space-y-1.5 mb-6">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          const translatedLabel =
            item.id === "gender"
              ? (drillConfig?.sidebarLabel || item.label)
              : item.id === "exam"
                ? activeExam.label
                : t(`nav.${item.id}`, { defaultValue: item.label });
          const translatedDesc =
            item.id === "gender"
              ? (drillConfig?.sidebarDesc || item.description)
              : item.id === "exam"
                ? activeExam.desc
                : t(`nav.${item.id}Desc`, { defaultValue: item.description });

          return (
            <button
              key={item.id}
              data-nav={item.id}
              data-testid={`nav-${item.id}`}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-2xl text-start transition-all duration-200 ${isActive
                ? "bg-amber-500 text-white font-semibold shadow-md shadow-amber-500/20"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100"
                }`}
            >
              <div
                className={`p-2 rounded-xl shrink-0 ${isActive
                  ? "bg-white/20 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                  }`}
              >
                <Icon className="w-4 h-4" />
              </div>

              <div className="flex-1 min-w-0 text-start">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-sm font-semibold truncate leading-tight">
                    {translatedLabel}
                  </span>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-full ${isActive
                        ? "bg-white text-amber-600"
                        : "bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300"
                        }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
                <div
                  className={`text-[11px] truncate ${isActive ? "text-amber-100" : "text-slate-400 dark:text-slate-500"
                    }`}
                >
                  {translatedDesc}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Progress Milestone Widget */}
      <div className="mt-auto p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-rose-500/5 to-indigo-500/10 border border-amber-500/20 dark:border-amber-500/30">
        <div className="flex items-center gap-2 mb-2 text-amber-600 dark:text-amber-400 font-bold text-xs">
          <Trophy className="w-4 h-4" />
          <span>Curriculum Mastery</span>
        </div>
        <div className="flex items-baseline justify-between mb-1.5">
          <span className="text-xl font-extrabold text-slate-800 dark:text-slate-100">
            {completedUnits}/{totalUnits} Units
          </span>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {progressPercent}%
          </span>
        </div>
        <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-amber-500 to-rose-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </aside>
  );
}
