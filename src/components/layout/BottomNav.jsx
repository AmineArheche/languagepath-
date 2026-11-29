import React from "react";
import { useTranslation } from "react-i18next";
import { BarChart3, Map, Award, BookMarked, Layers, GraduationCap, Settings, User } from "lucide-react";
import { useProgress } from "../../context/ProgressContext";

export function BottomNav({ currentPage, onNavigate }) {
  const { t } = useTranslation("ui");
  const { allFlashcards, getDueCards, getWeakSpots } = useProgress();
  const dueCount = getDueCards(allFlashcards).length;
  const mistakeCount = getWeakSpots().reduce((acc, s) => acc + s.mistakes, 0);

  const navItems = [
    { id: "dashboard", label: "Stats", icon: BarChart3 },
    { id: "roadmap", label: "Roadmap", icon: Map },
    { id: "exam", label: "Exams", icon: Award },
    { id: "reading", label: "Reading", icon: BookMarked },
    {
      id: "practice",
      label: "Review",
      icon: Layers,
      badge: dueCount > 0 ? dueCount : null
    },
    {
      id: "grammar",
      label: "Grammar",
      icon: GraduationCap,
      badge: mistakeCount > 0 ? mistakeCount : null
    },
    { id: "profile", label: "Profil", icon: User },
    { id: "settings", label: "Settings", icon: Settings }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 md:hidden py-1 px-1">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          const translatedLabel = t(`nav.${item.id}`, { defaultValue: item.label });

          return (
            <button
              key={item.id}
              data-nav={item.id}
              data-testid={`nav-${item.id}`}
              onClick={() => onNavigate(item.id)}
              className={`relative flex flex-col items-center gap-0.5 py-1 px-1.5 rounded-xl transition-all duration-150 min-w-[42px] ${
                isActive
                  ? "text-amber-500 font-bold scale-105"
                  : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? "stroke-[2.5]" : "stroke-[1.8]"}`} />
                {item.badge && (
                  <span className="absolute -top-1 -right-2 px-1 py-0.2 rounded-full bg-amber-500 text-white font-black text-[9px] min-w-[14px] text-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] tracking-tight">{translatedLabel}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
