/**
 * src/components/auth/AuthModal.jsx
 *
 * Modal for User Authentication & Registration:
 * - Connexion (Sign In)
 * - Inscription (Sign Up with preferred language choice)
 * - 1-Click Instant Demo User Access
 * - Sleek dark slate styling (no blinding white surfaces)
 */

import React, { useState } from "react";
import {
  X,
  LogIn,
  UserPlus,
  Sparkles,
  Mail,
  Lock,
  User,
  Globe,
  CheckCircle2,
  AlertCircle,
  ArrowRight
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { SUPPORTED_TARGET_LANGUAGES } from "../../data/languages";
import { Button } from "../common/Button";
import { BrandLogo } from "../common/BrandLogo";

export function AuthModal() {
  const {
    isAuthModalOpen,
    authModalMode,
    closeAuthModal,
    openAuthModal,
    login,
    signup,
    loginAsDemo,
    authError
  } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [nativeLanguage, setNativeLanguage] = useState("fr");
  const [targetLanguage, setTargetLanguage] = useState("de");
  const [loading, setLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    const res = login(email, password);
    setLoading(false);
    if (res.success) {
      setEmail("");
      setPassword("");
    }
  };

  const handleSignupSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    const res = signup({
      name,
      email,
      password,
      nativeLanguage,
      targetLanguage
    });
    setLoading(false);
    if (res.success) {
      setName("");
      setEmail("");
      setPassword("");
    }
  };

  const handleDemoClick = () => {
    loginAsDemo();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Fenêtre d'authentification"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in"
    >
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 my-8 text-slate-100">
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <BrandLogo iconOnly size="lg" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-2">
            {authModalMode === "login" ? "Bon retour sur LanguagePath !" : "Rejoignez LanguagePath"}
          </h2>
          <p className="text-xs text-slate-400">
            {authModalMode === "login"
              ? "Connectez-vous pour retrouver votre progression multi-langues"
              : "Créez votre profil et apprenez plusieurs langues à votre rythme"}
          </p>
        </div>

        {/* Tab Switcher: Connexion / Inscription */}
        <div className="flex p-1 rounded-2xl bg-slate-800 border border-slate-700/60 text-xs font-bold">
          <button
            type="button"
            onClick={() => openAuthModal("login")}
            className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              authModalMode === "login"
                ? "bg-slate-700 text-amber-400 font-black shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>Connexion</span>
          </button>
          <button
            type="button"
            onClick={() => openAuthModal("signup")}
            className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              authModalMode === "signup"
                ? "bg-slate-700 text-amber-400 font-black shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Inscription</span>
          </button>
        </div>

        {/* Error Alert */}
        {authError && (
          <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs flex items-center gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{authError}</span>
          </div>
        )}

        {/* 1-Click Demo Login Banner */}
        <button
          type="button"
          onClick={handleDemoClick}
          className="w-full p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 text-amber-300 flex items-center justify-between text-xs font-bold transition-all group"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Accès rapide : Tester avec le compte Démo (Amine)</span>
          </div>
          <ArrowRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
        </button>

        {/* MODE 1: LOGIN FORM */}
        {authModalMode === "login" && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Adresse Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nom@exemple.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Mot de Passe
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={loading}
              className="w-full justify-center shadow-lg shadow-amber-500/25 mt-2"
            >
              <LogIn className="w-4 h-4 mr-2" />
              <span>Se Connecter</span>
            </Button>
          </form>
        )}

        {/* MODE 2: SIGNUP FORM */}
        {authModalMode === "signup" && (
          <form onSubmit={handleSignupSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Nom complet ou pseudo *
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Sarah Martin"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Adresse Email *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="sarah@exemple.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Mot de Passe *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="6 caractères minimum"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">
                  Langue d'explication
                </label>
                <select
                  value={nativeLanguage}
                  onChange={(e) => setNativeLanguage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="fr">🇫🇷 Français</option>
                  <option value="ar">🇸🇦 العربية</option>
                  <option value="en">🇬🇧 English</option>
                  <option value="es">🇪🇸 Español</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">
                  Langue à apprendre
                </label>
                <select
                  value={targetLanguage}
                  onChange={(e) => setTargetLanguage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  {SUPPORTED_TARGET_LANGUAGES.map((lang) => (
                    <option key={lang.id} value={lang.id}>
                      {lang.flag} {lang.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={loading}
              className="w-full justify-center shadow-lg shadow-amber-500/25 mt-3"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              <span>Créer mon compte</span>
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
