/**
 * src/components/layout/LanguageSwitcher.jsx
 *
 * Fast Target Language Switcher dropdown for Navbar & Header.
 * Allows instant switching between enrolled learning languages (DE, FR, ES, EN, AR, IT)
 * and adding a new language.
 */

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Plus, Check, Globe, Sparkles } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export function LanguageSwitcher({ onNavigateToProfile }) {
  const {
    activeLanguageDetails,
    enrolledLanguagesList,
    availableLanguagesToEnroll,
    switchTargetLanguage,
    enrollNewLanguage,
    languagesProgress
  } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
        setShowAddMenu(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleSelectLanguage = (langId) => {
    switchTargetLanguage(langId);
    setIsOpen(false);
    setShowAddMenu(false);
  };

  const handleEnrollLanguage = (langId) => {
    enrollNewLanguage(langId);
    setIsOpen(false);
    setShowAddMenu(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Switcher Pill Button */}
      <button
        type="button"
        onClick={() => {
          setIsOpen((prev) => !prev);
          setShowAddMenu(false);
        }}
        className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-800 border border-slate-700/80 text-white font-bold text-xs transition-all hover:scale-105 active:scale-95 shadow-sm"
        title="Changer la langue d'apprentissage active"
        aria-label="Sélecteur de langue d'apprentissage"
      >
        <span className="text-base" role="img" aria-label={activeLanguageDetails.name}>
          {activeLanguageDetails.flag}
        </span>
        <span className="hidden sm:inline font-extrabold text-xs">
          {activeLanguageDetails.name}
        </span>
        <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-amber-500/20 text-amber-300 font-mono">
          {languagesProgress[activeLanguageDetails.id]?.level || "A1"}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-2 border-b border-slate-800 text-[11px] font-bold text-slate-400 flex items-center justify-between">
            <span className="uppercase tracking-wider">Langue d'apprentissage</span>
            <span className="text-[10px] text-amber-400 font-normal">Active</span>
          </div>

          {/* Enrolled Languages List */}
          <div className="py-1 space-y-1">
            {enrolledLanguagesList.map((lang) => {
              const isActive = lang.id === activeLanguageDetails.id;
              const stats = languagesProgress[lang.id] || { level: "A1", xp: 0 };

              return (
                <button
                  key={lang.id}
                  type="button"
                  onClick={() => handleSelectLanguage(lang.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors ${
                    isActive
                      ? "bg-slate-800 text-amber-400 font-extrabold border border-slate-700"
                      : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl" role="img" aria-label={lang.name}>
                      {lang.flag}
                    </span>
                    <div className="text-left">
                      <div className="font-bold">{lang.name}</div>
                      <div className="text-[10px] text-slate-400 font-normal">
                        Niveau {stats.level} &bull; {stats.xp} XP
                      </div>
                    </div>
                  </div>

                  {isActive && <Check className="w-4 h-4 text-amber-400" />}
                </button>
              );
            })}
          </div>

          {/* Add Another Language Section */}
          <div className="pt-2 border-t border-slate-800 mt-1">
            {!showAddMenu ? (
              <button
                type="button"
                onClick={() => setShowAddMenu(true)}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-amber-400" />
                <span>Ajouter une langue...</span>
              </button>
            ) : (
              <div className="space-y-1 animate-in fade-in">
                <span className="text-[10px] font-bold text-slate-400 px-3 uppercase tracking-wider block mb-1">
                  Choisir une nouvelle langue :
                </span>
                {availableLanguagesToEnroll.length === 0 ? (
                  <p className="text-[11px] text-slate-500 px-3 py-1">
                    Toutes les langues sont déjà dans votre profil !
                  </p>
                ) : (
                  availableLanguagesToEnroll.map((lang) => (
                    <button
                      key={lang.id}
                      type="button"
                      onClick={() => handleEnrollLanguage(lang.id)}
                      className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition-colors text-left"
                    >
                      <span className="text-lg">{lang.flag}</span>
                      <span className="font-bold">{lang.name}</span>
                      <span className="text-[10px] text-slate-500 ml-auto">+ Débuter</span>
                    </button>
                  ))
                )}
              </div>
            )}

            {onNavigateToProfile && (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onNavigateToProfile();
                }}
                className="w-full text-center py-2 text-[11px] font-bold text-amber-400 hover:underline block border-t border-slate-800/80 mt-1"
              >
                Voir tout le profil &amp; statistiques &rarr;
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
