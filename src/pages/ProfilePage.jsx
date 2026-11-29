/**
 * src/pages/ProfilePage.jsx
 *
 * User Profile & Multi-Language Hub:
 * - Displays client information (Name, Email, Avatar, Joined Date)
 * - Highlights active target learning language with current stats
 * - Multi-Language Progress Grid showing individual progress per language (DE, FR, ES, EN, AR, IT)
 * - Instant 1-click language switching
 * - Add/Enroll new target languages
 * - Sleek dark slate aesthetic
 */

import React, { useState } from "react";
import {
  User,
  Mail,
  Flame,
  Zap,
  BookOpen,
  Award,
  Globe,
  Clock,
  Layers,
  ArrowRight,
  Plus,
  CheckCircle2,
  Settings,
  LogOut,
  Sparkles,
  Shield,
  Edit2,
  TrendingUp
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { SUPPORTED_TARGET_LANGUAGES } from "../data/languages";
import { Button } from "../components/common/Button";

export function ProfilePage({ onNavigate }) {
  const {
    user,
    isAuthenticated,
    openAuthModal,
    logout,
    activeTargetLanguage,
    activeLanguageDetails,
    enrolledLanguagesList,
    availableLanguagesToEnroll,
    languagesProgress,
    globalStats,
    switchTargetLanguage,
    enrollNewLanguage,
    updateProfile
  } = useAuth();

  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(user?.name || "");
  const [avatarInput, setAvatarInput] = useState(user?.avatar || "👨‍💻");

  const avatarOptions = ["👨‍💻", "👩‍🎓", "🚀", "🌟", "🌍", "🦊", "⚡", "🦁", "🎯", "🦉"];

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center space-y-5 animate-in fade-in">
        <div className="w-16 h-16 rounded-3xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto border border-amber-500/20">
          <User className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-white">Profil Utilisateur</h2>
        <p className="text-sm text-slate-400">
          Connectez-vous ou créez un compte gratuit pour sauvegarder votre progression multi-langues et synchroniser vos révisions.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Button variant="primary" size="lg" onClick={() => openAuthModal("login")}>
            Se Connecter
          </Button>
          <Button variant="secondary" size="lg" onClick={() => openAuthModal("signup")}>
            Créer un compte
          </Button>
        </div>
      </div>
    );
  }

  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (nameInput.trim()) {
      updateProfile({ name: nameInput.trim(), avatar: avatarInput });
      setIsEditingName(false);
    }
  };

  const activeProgress = languagesProgress[activeTargetLanguage] || {
    xp: 0,
    streak: 1,
    level: "A1",
    wordsLearned: 0,
    retentionRate: 100,
    studyMinutes: 0,
    completedLessons: 0
  };

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6 space-y-8 animate-in fade-in duration-200">
      {/* 1. USER PROFILE HEADER CARD */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl text-slate-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-5">
            {/* Avatar Pill */}
            <div className="relative group">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-600 p-0.5 shadow-lg shadow-amber-500/20">
                <div className="w-full h-full rounded-[22px] bg-slate-950 flex items-center justify-center text-4xl">
                  {user.avatar || "👨‍💻"}
                </div>
              </div>
            </div>

            {/* User Meta */}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {user.name}
                </h1>
                <button
                  type="button"
                  onClick={() => setIsEditingName((prev) => !prev)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  title="Modifier le nom"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                <Mail className="w-3.5 h-3.5" />
                <span>{user.email}</span>
                <span>&bull;</span>
                <span>Membre depuis {user.joinedAt || "2026"}</span>
              </p>

              {/* Badges row */}
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  Polyglotte ({enrolledLanguagesList.length} langues)
                </span>
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 flex items-center gap-1">
                  <Shield className="w-3 h-3 text-indigo-400" />
                  Compte Vérifié
                </span>
              </div>
            </div>
          </div>

          {/* Quick Action / Logout */}
          <div className="flex items-center gap-3 shrink-0">
            <Button
              variant="secondary"
              size="sm"
              onClick={logout}
              icon={LogOut}
              className="text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 border-rose-900/60"
            >
              Déconnexion
            </Button>
          </div>
        </div>

        {/* Editable Name & Avatar Drawer */}
        {isEditingName && (
          <form onSubmit={handleSaveProfile} className="mt-6 pt-5 border-t border-slate-800 space-y-4 animate-in fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Nom ou pseudo :
                </label>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Choisir un Avatar :
                </label>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {avatarOptions.map((av) => (
                    <button
                      key={av}
                      type="button"
                      onClick={() => setAvatarInput(av)}
                      className={`text-xl p-1.5 rounded-xl border transition-all ${
                        avatarInput === av
                          ? "bg-amber-500/20 border-amber-500 ring-2 ring-amber-500/20"
                          : "bg-slate-800 border-slate-700 hover:bg-slate-700"
                      }`}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-1">
              <Button variant="secondary" size="sm" onClick={() => setIsEditingName(false)}>
                Annuler
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Enregistrer les modifications
              </Button>
            </div>
          </form>
        )}

        {/* Global Statistics Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800">
          <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-center">
            <div className="flex items-center justify-center gap-1.5 text-amber-400 mb-1">
              <Zap className="w-4 h-4 fill-amber-500" />
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Total XP</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-white">{globalStats.totalXp}</div>
            <span className="text-[10px] text-slate-400">toutes langues confondues</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-center">
            <div className="flex items-center justify-center gap-1.5 text-orange-400 mb-1">
              <Flame className="w-4 h-4 fill-orange-500" />
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Série Max</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-white">{globalStats.maxStreak} jours</div>
            <span className="text-[10px] text-slate-400">régularité active</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-center">
            <div className="flex items-center justify-center gap-1.5 text-sky-400 mb-1">
              <Layers className="w-4 h-4" />
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Mots Appris</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-white">{globalStats.totalWordsLearned}</div>
            <span className="text-[10px] text-slate-400">mémorisés en SRS</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-center">
            <div className="flex items-center justify-center gap-1.5 text-indigo-400 mb-1">
              <Globe className="w-4 h-4" />
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Langues</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-white">{globalStats.totalLanguages}</div>
            <span className="text-[10px] text-slate-400">en apprentissage</span>
          </div>
        </div>
      </div>

      {/* 2. ACTIVE LANGUAGE HIGHLIGHT BANNER */}
      <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-950 border-2 border-amber-500/50 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] uppercase tracking-wider">
                Langue Active Actuelle
              </span>
              <span className="text-xs text-slate-400 font-semibold">
                Toutes les leçons &amp; révisions affichent cette langue
              </span>
            </div>

            <div className="flex items-center gap-3 mt-1">
              <span className="text-4xl" role="img" aria-label={activeLanguageDetails.name}>
                {activeLanguageDetails.flag}
              </span>
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-white">
                  {activeLanguageDetails.name} ({activeLanguageDetails.nativeName})
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-0.5 max-w-xl">
                  {activeLanguageDetails.description}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Nav to Roadmap / Flashcards */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="px-5 py-3 rounded-2xl bg-amber-950/40 border border-amber-900/80 text-center">
              <div className="text-2xl font-black text-amber-400">
                Niveau {activeProgress.level}
              </div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                {activeProgress.xp} XP acquis
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              onClick={() => onNavigate && onNavigate("roadmap")}
              icon={ArrowRight}
              className="shadow-lg shadow-amber-500/25"
            >
              Continuer l'étude
            </Button>
          </div>
        </div>
      </div>

      {/* 3. MULTI-LANGUAGE PROGRESS GRID ("Mes Langues d'Apprentissage") */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black text-white flex items-center gap-2">
              <Globe className="w-5 h-5 text-amber-400" />
              <span>Mes Langues d'Apprentissage</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Consultez vos progrès individuels et basculez en 1 clic d'une langue à l'autre.
            </p>
          </div>
          <span className="text-xs font-bold text-slate-400 px-3 py-1 rounded-full bg-slate-800 border border-slate-700">
            {enrolledLanguagesList.length} activée(s)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {enrolledLanguagesList.map((lang) => {
            const isActive = lang.id === activeTargetLanguage;
            const progress = languagesProgress[lang.id] || {
              xp: 0,
              streak: 1,
              level: "A1",
              wordsLearned: 0,
              retentionRate: 100,
              studyMinutes: 0,
              completedLessons: 0
            };

            return (
              <div
                key={lang.id}
                className={`p-6 rounded-3xl border transition-all duration-200 flex flex-col justify-between space-y-5 ${
                  isActive
                    ? "bg-slate-900 border-amber-500/70 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/30"
                    : "bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900"
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl" role="img" aria-label={lang.name}>
                      {lang.flag}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-lg font-black text-white">{lang.name}</h4>
                        <span className="text-xs text-slate-400">({lang.nativeName})</span>
                      </div>
                      <span className="text-xs text-slate-400 line-clamp-1">
                        {lang.tagline}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                      isActive
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                        : "bg-slate-800 text-slate-400 border border-slate-700"
                    }`}
                  >
                    {isActive ? "✓ En cours" : "En pause"}
                  </span>
                </div>

                {/* Metrics Breakdown */}
                <div className="grid grid-cols-3 gap-2 py-3 px-3.5 rounded-2xl bg-slate-800/50 border border-slate-800 text-center">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Niveau</span>
                    <span className="text-base font-black text-amber-400">{progress.level}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">XP Acquis</span>
                    <span className="text-base font-black text-white">{progress.xp}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Mots Appris</span>
                    <span className="text-base font-black text-sky-400">{progress.wordsLearned}</span>
                  </div>
                </div>

                {/* Exam Target & Retention Info */}
                <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80 pt-3">
                  <span className="flex items-center gap-1.5 truncate max-w-[200px]">
                    <Award className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span>{lang.officialExams?.[0] || "Examen officiel"}</span>
                  </span>
                  <span className="font-bold text-emerald-400">
                    {progress.retentionRate}% Rétention
                  </span>
                </div>

                {/* Switch Language Action Button */}
                <div>
                  {isActive ? (
                    <Button
                      variant="secondary"
                      size="md"
                      disabled
                      className="w-full justify-center bg-slate-800 text-amber-300 border-amber-500/30 cursor-default opacity-90"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2 text-amber-400" />
                      <span>Langue Actuellement Active</span>
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      size="md"
                      onClick={() => switchTargetLanguage(lang.id)}
                      className="w-full justify-center shadow-md hover:scale-[1.02] transition-transform"
                    >
                      <span>Basculer sur l'apprentissage du {lang.name}</span>
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. DISCOVER & ENROLL IN MORE LANGUAGES */}
      {availableLanguagesToEnroll.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-slate-800">
          <div>
            <h3 className="text-xl font-black text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-amber-400" />
              <span>Découvrir d'autres langues à apprendre</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Ajoutez une nouvelle langue à votre parcours en 1 clic. Vous pourrez basculer entre elles à tout moment.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableLanguagesToEnroll.map((lang) => (
              <div
                key={lang.id}
                className="p-5 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl" role="img" aria-label={lang.name}>
                      {lang.flag}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                      Niveaux A1–B2
                    </span>
                  </div>
                  <h4 className="text-base font-black text-white">
                    {lang.name} ({lang.nativeName})
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                    {lang.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 font-medium">
                    {lang.officialExams?.[0] || "Examens disponibles"}
                  </span>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => enrollNewLanguage(lang.id)}
                    icon={Plus}
                    className="text-amber-400 hover:text-white hover:bg-amber-500"
                  >
                    Commencer
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
