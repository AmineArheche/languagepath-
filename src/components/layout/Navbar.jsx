import React from "react";
import { Flame, Zap, Sparkles, User } from "lucide-react";
import { useProgress } from "../../context/ProgressContext";
import { useAuth } from "../../context/AuthContext";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeToggle } from "../common/ThemeToggle";
import { BrandLogo } from "../common/BrandLogo";

export function Navbar({ onNavigate, currentPage, onOpenTasteTest }) {
  const { progress } = useProgress();
  const { user, isAuthenticated, openAuthModal, activeLanguageDetails } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-slate-100">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <div
          onClick={() => onNavigate("roadmap")}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <BrandLogo size="md" />
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-800 flex items-center gap-1 shrink-0">
            <span>{activeLanguageDetails?.flag || "🌍"}</span>
            <span className="hidden sm:inline">{activeLanguageDetails?.name || "A1-B2"}</span>
          </span>
        </div>

        {/* Gamification Stats, Language Switcher, User Profile */}
        <div className="flex items-center gap-2 sm:gap-3.5">
          {/* Target Language Switcher Dropdown */}
          <LanguageSwitcher onNavigateToProfile={() => onNavigate("profile")} />

          {/* 3-Minute Taste Test CTA */}
          {onOpenTasteTest && (
            <button
              onClick={onOpenTasteTest}
              title="Try 3-Minute Diagnostic Taste Test"
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-950/40 border border-indigo-900 text-indigo-400 font-bold text-xs hover:scale-105 transition-transform"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Taste Test</span>
            </button>
          )}

          {/* Streak */}
          <div
            onClick={() => onNavigate("dashboard")}
            title="View Daily Streak in Dashboard"
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-orange-950/40 border border-orange-900 text-orange-400 font-bold text-xs sm:text-sm cursor-pointer hover:scale-105 transition-transform"
          >
            <Flame className="w-4 h-4 fill-orange-500 text-orange-500 animate-pulse" />
            <span>{progress.streak || 1}d</span>
          </div>

          {/* XP */}
          <div
            onClick={() => onNavigate("dashboard")}
            title="View Learning Stats & Readiness"
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-amber-950/40 border border-amber-900 text-amber-400 font-bold text-xs sm:text-sm cursor-pointer hover:scale-105 transition-transform"
          >
            <Zap className="w-4 h-4 fill-amber-500 text-amber-500" />
            <span>{progress.xp || 0} XP</span>
          </div>

          {/* User Account / Profile Button */}
          {isAuthenticated && user ? (
            <button
              onClick={() => onNavigate("profile")}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border transition-all hover:scale-105 ${
                currentPage === "profile"
                  ? "bg-amber-500 text-slate-950 font-black border-amber-400 shadow-md shadow-amber-500/20"
                  : "bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-white font-bold"
              }`}
              title="Mon Profil Client & Progrès Multi-Langues"
            >
              <span className="text-sm" role="img" aria-label="avatar">
                {user.avatar || "👨‍💻"}
              </span>
              <span className="hidden md:inline text-xs truncate max-w-[80px]">
                {user.name}
              </span>
            </button>
          ) : (
            <button
              onClick={() => openAuthModal("login")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20"
            >
              <User className="w-3.5 h-3.5" />
              <span>Connexion</span>
            </button>
          )}

          {/* Theme Switcher */}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
