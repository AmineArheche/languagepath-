import React, { useState, useEffect } from "react";
import {
  Download,
  Upload,
  RotateCcw,
  Volume2,
  Check,
  AlertTriangle,
  Moon,
  Sun,
  Flame,
  Zap,
  BookOpen,
  Trophy,
  Target,
  Key,
  ShieldCheck,
  ExternalLink,
  Clock,
  Sparkles,
  Gauge,
  Database,
  HardDrive
} from "lucide-react";
import { useProgress } from "../context/ProgressContext";
import { useTheme } from "../context/ThemeContext";
import { useSpeech } from "../hooks/useSpeech";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { useTranslation } from "react-i18next";
import { SUPPORTED_LANGUAGES, setAppLanguage } from "../i18n/config";
import { GermanText } from "../components/common/GermanText";
import { Button } from "../components/common/Button";
import { Card } from "../components/common/Card";
import { Modal } from "../components/common/Modal";
import { Globe, Languages, Bell, VolumeX } from "lucide-react";
import { isSoundEnabled, setSoundEnabled } from "../utils/soundEffects";
import {
  isDailyReminderEnabled,
  setDailyReminderEnabled,
  getDailyReminderTime,
  setDailyReminderTime,
  requestNotificationPermission,
  sendDailyReminderNotification
} from "../services/notificationService";
import {
  requestStoragePersistence,
  checkStoragePersistence,
  getStorageEstimate,
  restoreRollbackCopy,
  ROLLBACK_STORAGE_KEY
} from "../storage/db";

const GOAL_PRESETS = [
  { mins: 15, label: "Casual (15 min)" },
  { mins: 20, label: "Regular (20 min)" },
  { mins: 30, label: "Dedicated (30 min)" },
  { mins: 45, label: "Intensive (45 min)" },
  { mins: 60, label: "Immersive (60 min)" }
];

export function SettingsPage() {
  const {
    progress,
    resetAllProgress,
    exportData,
    importData,
    getCardStats,
    setDailyGoalMinutes,
    getWordsLearnedCount
  } = useProgress();

  const { isDark, toggleTheme } = useTheme();
  const {
    speak,
    playAudio,
    isSpeaking,
    activeSource,
    availableVoices,
    selectVoice,
    germanVoice,
    hasGermanVoice,
    voiceSetupGuide
  } = useSpeech({ lang: "de-DE", rate: 0.95 });

  // Gemini API Key from localStorage
  const [apiKey, setApiKey] = useLocalStorage("deutschpath_gemini_api_key", "");
  const [apiKeyInput, setApiKeyInput] = useState(apiKey || "");
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKeySavedNotice, setApiKeySavedNotice] = useState(false);

  // Configurable Gemini Model Name
  const [geminiModel, setGeminiModel] = useLocalStorage(
    "deutschpath_gemini_model",
    "gemini-1.5-flash"
  );
  const [modelInput, setModelInput] = useState(geminiModel || "gemini-1.5-flash");
  const [modelSavedNotice, setModelSavedNotice] = useState(false);

  // Daily goal
  const currentDailyGoal = progress.dailyGoalMinutes || 30;
  const [customGoalInput, setCustomGoalInput] = useState(String(currentDailyGoal));
  const [goalSavedNotice, setGoalSavedNotice] = useState(false);

  const { t, i18n } = useTranslation(["ui", "words", "grammar", "errors"]);
  const [activeLang, setActiveLang] = useState(i18n.language || "en");
  const [languageChanging, setLanguageChanging] = useState(false);
  const [langNotice, setLangNotice] = useState(null);

  useEffect(() => {
    setActiveLang(i18n.language || "en");
  }, [i18n.language]);

  const handleLanguageChange = async (langCode) => {
    if (langCode === activeLang) return;
    setLanguageChanging(true);
    try {
      await setAppLanguage(langCode);
      setActiveLang(langCode);
      const chosen = SUPPORTED_LANGUAGES.find((l) => l.code === langCode);
      setLangNotice(`Language switched to ${chosen?.nativeName || langCode}`);
      setTimeout(() => setLangNotice(null), 3000);
    } catch (err) {
      console.error("Language change error:", err);
    } finally {
      setLanguageChanging(false);
    }
  };

  // Reset modal
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetSuccessNotice, setResetSuccessNotice] = useState(false);

  // Sound effects toggle (Off by default per SLA requirements)
  const [soundOn, setSoundOn] = useState(isSoundEnabled());

  // Daily reminder via Notification API
  const [reminderEnabled, setReminderEnabled] = useState(isDailyReminderEnabled());
  const [reminderTime, setReminderTimeState] = useState(getDailyReminderTime());
  const [reminderNotice, setReminderNotice] = useState(null);

  // 30-Day Export Reminder state
  const [lastExportTime, setLastExportTime] = useState(() => {
    try {
      return localStorage.getItem("deutschpath_last_export_timestamp");
    } catch {
      return null;
    }
  });

  const daysSinceExport = lastExportTime
    ? Math.floor((Date.now() - Number(lastExportTime)) / (1000 * 60 * 60 * 24))
    : 31;

  const handleToggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
  };

  const handleToggleReminder = async () => {
    if (!reminderEnabled) {
      const perm = await requestNotificationPermission();
      if (perm === "granted") {
        setReminderEnabled(true);
        setDailyReminderEnabled(true);
        setReminderNotice("Daily reminder enabled!");
        setTimeout(() => setReminderNotice(null), 3000);
      } else {
        alert("Please allow notification permissions in your browser to receive daily practice reminders.");
      }
    } else {
      setReminderEnabled(false);
      setDailyReminderEnabled(false);
    }
  };

  const handleTimeChange = (newTime) => {
    setReminderTimeState(newTime);
    setDailyReminderTime(newTime);
  };

  const handleTestNotification = () => {
    const sent = sendDailyReminderNotification();
    if (!sent) {
      alert("Notification was not dispatched. Make sure browser permissions are granted.");
    }
  };

  // Import / Export
  const [importText, setImportText] = useState("");
  const [importStatus, setImportStatus] = useState(null); // { success: boolean, msg: string }

  // IndexedDB Storage & Persistence state
  const [storageEstimate, setStorageEstimate] = useState({
    usageKb: "0",
    usageMb: "0",
    quotaMb: "0",
    usagePercent: "0"
  });
  const [isPersisted, setIsPersisted] = useState(false);
  const [persistNotice, setPersistNotice] = useState(null);
  const [hasRollback, setHasRollback] = useState(false);
  const [rollbackStatus, setRollbackStatus] = useState(null);

  useEffect(() => {
    checkStoragePersistence().then(setIsPersisted);
    getStorageEstimate().then(setStorageEstimate);
    try {
      setHasRollback(!!localStorage.getItem(ROLLBACK_STORAGE_KEY));
    } catch {}
  }, []);

  const handleRequestPersistence = async () => {
    const granted = await requestStoragePersistence();
    setIsPersisted(granted);
    setPersistNotice(
      granted
        ? "Persistent storage granted! Browser will not evict your learning data."
        : "Storage persistence was declined or not supported by this browser."
    );
    setTimeout(() => setPersistNotice(null), 4000);
    getStorageEstimate().then(setStorageEstimate);
  };

  const handleRestoreRollback = async () => {
    try {
      await restoreRollbackCopy();
      setRollbackStatus({ success: true, msg: "Successfully restored pre-migration snapshot!" });
      setTimeout(() => setRollbackStatus(null), 4000);
      getStorageEstimate().then(setStorageEstimate);
    } catch (err) {
      setRollbackStatus({ success: false, msg: `Rollback failed: ${err.message}` });
    }
  };

  // Today's study minutes
  const todayStr = new Date().toISOString().split("T")[0];
  const todayMinutes = progress.dailyStudyMinutes?.[todayStr] || 0;
  const goalPercent = Math.min(100, Math.round((todayMinutes / (currentDailyGoal || 1)) * 100));

  const wordsLearned = getWordsLearnedCount();

  // Save API Key
  const handleSaveApiKey = () => {
    setApiKey(apiKeyInput.trim());
    setApiKeySavedNotice(true);
    setTimeout(() => setApiKeySavedNotice(false), 3000);
  };

  // Save Gemini Model Name
  const handleSaveModel = (newModel = null) => {
    const chosen = (newModel || modelInput || "gemini-1.5-flash").trim();
    setGeminiModel(chosen);
    setModelInput(chosen);
    setModelSavedNotice(true);
    setTimeout(() => setModelSavedNotice(false), 3000);
  };

  // Save Goal
  const handleSelectGoal = (mins) => {
    setDailyGoalMinutes(mins);
    setCustomGoalInput(String(mins));
    setGoalSavedNotice(true);
    setTimeout(() => setGoalSavedNotice(false), 2500);
  };

  const handleCustomGoalSubmit = (e) => {
    e.preventDefault();
    const parsed = parseInt(customGoalInput);
    if (!isNaN(parsed) && parsed >= 5 && parsed <= 180) {
      handleSelectGoal(parsed);
    }
  };

  // Handle JSON Download
  const handleExport = () => {
    const dataStr = exportData();
    const now = Date.now();
    try {
      localStorage.setItem("deutschpath_last_export_timestamp", String(now));
      setLastExportTime(now);
    } catch {}
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `languagepath_backup_${todayStr}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Handle JSON Import from Text
  const handleImport = async () => {
    if (!importText.trim()) return;
    const res = await Promise.resolve(importData(importText));
    if (res.success) {
      const msg = res.repaired
        ? `Data imported with repairs: ${res.repairs.join(", ")}`
        : "Data imported successfully!";
      setImportStatus({ success: true, msg });
      setImportText("");
      getStorageEstimate().then(setStorageEstimate);
    } else {
      setImportStatus({ success: false, msg: `Import failed: ${res.error}` });
    }
  };

  // Handle file input import
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result;
      if (typeof content === "string") {
        const res = await Promise.resolve(importData(content));
        if (res.success) {
          const msg = res.repaired
            ? `Backup restored with repairs: ${res.repairs.join(", ")}`
            : "Backup file restored successfully!";
          setImportStatus({ success: true, msg });
          getStorageEstimate().then(setStorageEstimate);
        } else {
          setImportStatus({ success: false, msg: `Invalid backup file: ${res.error}` });
        }
      }
    };
    reader.readAsText(file);
  };

  // Reset all data
  const handleConfirmReset = () => {
    resetAllProgress();
    setShowResetModal(false);
    setResetSuccessNotice(true);
    setTimeout(() => setResetSuccessNotice(false), 4000);
  };

  return (
    <div className="max-w-4xl mx-auto py-4 px-3 sm:px-6 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Settings & Preferences (Einstellungen)
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Customize your daily learning goal, configure AI tutoring, export backups, and manage your progress.
        </p>
      </div>

      {resetSuccessNotice && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-sm font-bold flex items-center gap-2">
          <Check className="w-5 h-5 text-emerald-500" />
          <span>All progress has been safely reset to default settings.</span>
        </div>
      )}

      {/* 0. Language Settings (UI & Explanations) */}
      <Card className="p-5 sm:p-6 space-y-5 border-amber-500/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              <Languages className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {t("settings.languageTitle", "My Language (UI & Explanations)")}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {t(
                  "settings.languageDesc",
                  "Feeds word translations, grammar explanations, tutor replies, and error rationales while German learning content remains authentic German."
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 self-start sm:self-center">
            <Globe className="w-3.5 h-3.5 text-indigo-500" />
            <span>
              {t("settings.activeLanguage", "Active")}:{" "}
              {SUPPORTED_LANGUAGES.find((l) => l.code === activeLang)?.nativeName ||
                activeLang.toUpperCase()}
            </span>
          </div>
        </div>

        {langNotice && (
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-500" />
            <span>{langNotice}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {SUPPORTED_LANGUAGES.map((lang) => {
            const isSelected = activeLang === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                disabled={languageChanging}
                onClick={() => handleLanguageChange(lang.code)}
                className={`p-4 rounded-2xl border text-start flex flex-col justify-between transition-all duration-200 ${
                  isSelected
                    ? "border-amber-500 bg-amber-50/50 dark:bg-amber-950/30 ring-2 ring-amber-500/20 shadow-sm"
                    : "border-slate-800 hover:border-slate-700 bg-slate-900/60"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl" role="img" aria-label={lang.name}>
                    {lang.flag}
                  </span>
                  {isSelected ? (
                    <span className="p-1 rounded-full bg-amber-500 text-white">
                      <Check className="w-3.5 h-3.5" />
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase">
                      {lang.dir.toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-900 dark:text-white">
                    {lang.nativeName}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {lang.name} • {lang.dir === "rtl" ? t("settings.rtl", "RTL") : t("settings.ltr", "LTR")}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Live Bilingual Preview */}
        <div className="p-4 rounded-2xl bg-slate-100/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
            <span>{t("common.preview", "Live Preview")}:</span>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
              {t("common.germanContentNotice", "German learning content remains in authentic German.")}
            </span>
          </div>

          <div className="text-sm">
            <span className="font-medium text-slate-500 dark:text-slate-400 me-2">German sentence:</span>
            <GermanText className="font-bold text-amber-600 dark:text-amber-400">
              "Das Buch liegt auf dem Tisch."
            </GermanText>
          </div>

          <div className="text-sm text-slate-700 dark:text-slate-300">
            <span className="font-medium text-slate-500 dark:text-slate-400 me-2">Explanation:</span>
            <span>
              {activeLang === "ar"
                ? "في حالة الجر، أداة المذكر der تتحول إلى dem مع حرف الجر auf."
                : activeLang === "fr"
                ? "Au datif avec auf (position), l'article masculin 'der' devient 'dem'."
                : "In the dative case with 'auf' (location), the masculine article 'der' changes to 'dem'."}
            </span>
          </div>
        </div>
      </Card>

      {/* 1. Daily Study Goal Setting */}
      <Card className="p-5 sm:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
              <Target className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Daily Study Goal (Tagesziel)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Set how many minutes you want to study each day to maintain momentum.
              </p>
            </div>
          </div>

          <span className="text-xs font-black px-3 py-1.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800 self-start sm:self-center">
            Current: {currentDailyGoal} min/day
          </span>
        </div>

        {/* Today's Goal Progress Bar */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-700 dark:text-slate-300">
              Today's Progress: {todayMinutes} of {currentDailyGoal} min
            </span>
            <span className="text-amber-600 dark:text-amber-400">{goalPercent}%</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-amber-500 h-full rounded-full transition-all duration-700"
              style={{ width: `${goalPercent}%` }}
            />
          </div>
        </div>

        {/* Presets */}
        <div className="space-y-3">
          <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
            Choose a Goal Preset:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {GOAL_PRESETS.map((preset) => (
              <button
                key={preset.mins}
                onClick={() => handleSelectGoal(preset.mins)}
                className={`p-3 rounded-2xl border text-xs font-bold text-center transition-all ${
                  currentDailyGoal === preset.mins
                    ? "bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-500/20 scale-102"
                    : "bg-slate-800 text-slate-300 border-slate-700 hover:border-amber-400"
                }`}
              >
                <Clock className="w-4 h-4 mx-auto mb-1 opacity-80" />
                <span>{preset.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Custom input */}
        <form onSubmit={handleCustomGoalSubmit} className="flex items-center gap-2 pt-1">
          <input
            type="number"
            min={5}
            max={180}
            value={customGoalInput}
            onChange={(e) => setCustomGoalInput(e.target.value)}
            className="w-32 px-3 py-2 rounded-xl border border-slate-700 bg-slate-800 text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
            placeholder="Custom mins"
          />
          <Button variant="secondary" size="sm" type="submit">
            Save Custom Goal
          </Button>

          {goalSavedNotice && (
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <Check className="w-4 h-4" /> Goal Updated!
            </span>
          )}
        </form>
      </Card>

      {/* 2. AI Tutor & Writing Gemini API Key */}
      <Card className="p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              <Key className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Google Gemini API Key
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Powers the interactive AI German Tutor and Writing Studio feedback.
              </p>
            </div>
          </div>

          <span
            className={`text-xs font-bold px-3 py-1 rounded-full border self-start sm:self-center ${
              apiKey
                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800"
                : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700"
            }`}
          >
            {apiKey ? "✓ Active Key Configured" : "Offline Simulation Mode"}
          </span>
        </div>

        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type={showApiKey ? "text" : "password"}
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder="AIzaSy..."
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowApiKey((prev) => !prev)}
            >
              {showApiKey ? "Hide" : "Show"}
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSaveApiKey}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              Save Key
            </Button>
          </div>

          {apiKeySavedNotice && (
            <div className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5">
              <Check className="w-4 h-4" /> API key saved securely in your browser's localStorage!
            </div>
          )}

          {/* Configurable Gemini Model */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Gemini Model Identifier
              </label>
              <span className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                Active: {geminiModel || "gemini-1.5-flash"}
              </span>
            </div>

            {/* Quick model preset pills */}
            <div className="flex flex-wrap gap-2">
              {[
                { id: "gemini-1.5-flash", label: "1.5 Flash (Recommended)" },
                { id: "gemini-2.0-flash", label: "2.0 Flash" },
                { id: "gemini-1.5-pro", label: "1.5 Pro" }
              ].map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleSaveModel(preset.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    geminiModel === preset.id
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Custom model input */}
            <div className="flex gap-2 pt-1">
              <input
                type="text"
                value={modelInput}
                onChange={(e) => setModelInput(e.target.value)}
                placeholder="gemini-1.5-flash"
                className="flex-1 px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-800 text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSaveModel(modelInput)}
              >
                Set Model
              </Button>
            </div>

            {modelSavedNotice && (
              <div className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                <Check className="w-4 h-4" /> Model name updated to "{geminiModel}"!
              </div>
            )}
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Your key stays 100% private in your browser (Bring-Your-Own-Key model). Never hardcode API keys into public web bundles. Don't have a key?{" "}
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noreferrer"
              className="text-indigo-600 dark:text-indigo-400 font-bold underline inline-flex items-center gap-0.5"
            >
              Get a free Gemini API Key here <ExternalLink className="w-3 h-3" />
            </a>
            . When no key is provided or if network limits (429) occur, LanguagePath gracefully falls back to built-in smart pedagogical offline responses.
          </p>
        </div>
      </Card>

      {/* 3. Appearance & Audio */}
      <Card className="p-5 sm:p-6 space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
          Display & Audio Preferences
        </h2>

        {/* Theme Mode */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="text-sm font-bold text-slate-900 dark:text-white">
              Color Theme
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Switch between Light and Dark interface modes
            </div>
          </div>

          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold text-xs transition-colors hover:bg-slate-200 dark:hover:bg-slate-700"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
            <span>{isDark ? "Dark Mode" : "Light Mode"}</span>
          </button>
        </div>

        {/* Audio Test & Voice Selector */}
        <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>German Speech & Audio (de-DE)</span>
                {activeSource && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 animate-pulse">
                    Playing: {activeSource.toUpperCase()}
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Ranked browser voices with pre-recorded audio fallback
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  speak("Hallo! Herzlich willkommen bei LanguagePath. Alles funktioniert wunderbar.")
                }
                className={isSpeaking && activeSource === "tts" ? "animate-pulse" : ""}
              >
                <Volume2 className="w-4 h-4 mr-1.5 text-amber-500" />
                Test TTS Voice
              </Button>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => playAudio({ id: "card-1", text: "der Tisch" })}
                className={isSpeaking && activeSource === "audio" ? "animate-pulse" : ""}
                title="Plays pre-recorded card-1.mp3 audio asset or falls back to TTS"
              >
                <Sparkles className="w-4 h-4 mr-1.5 text-indigo-500" />
                Test Audio Asset
              </Button>
            </div>
          </div>

          {/* Voice Picker */}
          {hasGermanVoice && availableVoices.length > 0 ? (
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Selected Voice ({availableVoices.length} detected):
              </span>
              <select
                aria-label="Select German voice"
                value={germanVoice?.name || ""}
                onChange={(e) => selectVoice(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-100 font-medium text-xs focus:ring-2 focus:ring-amber-500"
              >
                {availableVoices.map((v) => (
                  <option key={v.name} value={v.name}>
                    {v.name} {v.isNeural ? "⭐ (Neural/Enhanced)" : ""} ({v.lang})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs space-y-2">
              <div className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>{voiceSetupGuide.title}</span>
              </div>
              <p>{voiceSetupGuide.message}</p>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-700 dark:text-slate-300">
                {voiceSetupGuide.platforms.map((p) => (
                  <li key={p.os}>
                    <strong>{p.os}:</strong> {p.steps}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {/* Sound Effects Toggle (Off by default) */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
            <div>
              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                {soundOn ? (
                  <Volume2 className="w-4 h-4 text-emerald-500" />
                ) : (
                  <VolumeX className="w-4 h-4 text-slate-400" />
                )}
                <span>Auditory Feedback (Sound Effects)</span>
              </div>
              <div className="text-slate-500 text-[11px] mt-0.5">
                Sound chimes on answers and milestones (OFF by default for distraction-free study)
              </div>
            </div>
            <button
              type="button"
              onClick={handleToggleSound}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                soundOn
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
              }`}
            >
              {soundOn ? "Sound ON" : "Sound OFF"}
            </button>
          </div>
        </div>
      </Card>

      {/* 3b. Daily Study Reminders (Notification API) */}
      <Card className="p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Bell className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Daily Study Reminders (Opt-In)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Receive gentle browser notifications to maintain your daily streak. 100% private and on-device.
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase self-start sm:self-center">
            Notification API
          </span>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
            <div>
              <div className="font-bold text-slate-900 dark:text-white">
                Daily Practice Notification
              </div>
              <div className="text-slate-500 text-[11px] mt-0.5">
                {reminderEnabled
                  ? "Active: triggers a reminder if you haven't practiced today"
                  : "Disabled (Opt-in required)"}
              </div>
            </div>
            <button
              type="button"
              onClick={handleToggleReminder}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                reminderEnabled
                  ? "bg-amber-500 text-slate-950 font-black shadow-sm"
                  : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
              }`}
            >
              {reminderEnabled ? "Reminders ON" : "Enable Reminders"}
            </button>
          </div>

          {reminderEnabled && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/60 text-xs">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600" />
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Reminder Time:
                </span>
                <input
                  type="time"
                  value={reminderTime}
                  onChange={(e) => handleTimeChange(e.target.value)}
                  className="px-2.5 py-1 rounded-lg border border-slate-700 bg-slate-800 text-slate-100 font-bold"
                />
              </div>

              <Button variant="secondary" size="sm" onClick={handleTestNotification}>
                Test Notification
              </Button>
            </div>
          )}

          {reminderNotice && (
            <div className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5">
              <Check className="w-4 h-4" />
              <span>{reminderNotice}</span>
            </div>
          )}
        </div>
      </Card>

      {/* 4. Backup & Restore (JSON) */}
      <Card className="p-5 sm:p-6 space-y-4">
        {/* 30-Day Backup Alert if overdue */}
        {daysSinceExport >= 30 && (
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs space-y-2">
            <div className="font-bold flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>30-Day Data Backup Reminder (Datensicherung empfohlen)</span>
            </div>
            <p className="leading-relaxed">
              It has been {daysSinceExport} days since your last progress export. Because DeutschPath operates 100% locally in your browser, exporting a backup JSON protects your cards, writing submissions, and streak from being lost if browser storage is cleared.
            </p>
            <Button
              variant="primary"
              size="sm"
              onClick={handleExport}
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs"
            >
              <Download className="w-4 h-4 mr-1.5" />
              Export Backup Now (JSON)
            </Button>
          </div>
        )}
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Data Backup & Export (JSON)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            All your learning stats, custom flashcards, writing submissions, and exam scores are stored safely in browser localStorage. Export your data anytime to keep a backup or transfer to another device.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            variant="primary"
            size="sm"
            onClick={handleExport}
            className="bg-amber-600 hover:bg-amber-700 text-white shadow-sm"
          >
            <Download className="w-4 h-4 mr-1.5" />
            Download Backup JSON
          </Button>

          <label className="cursor-pointer">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors">
              <Upload className="w-4 h-4 text-indigo-500" />
              Upload Backup File (.json)
            </span>
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>

        {/* Paste JSON manually */}
        <div className="pt-2">
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1.5">
            Or paste backup JSON code directly:
          </label>
          <textarea
            rows={2}
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            placeholder='Paste JSON here (e.g. {"progress": {...}, "customCards": [...]})'
            className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
          {importText.trim() && (
            <Button variant="secondary" size="sm" onClick={handleImport} className="mt-2">
              Apply Pasted Data
            </Button>
          )}
        </div>

        {importStatus && (
          <div
            className={`p-3.5 rounded-xl text-xs flex items-center gap-2 border ${
              importStatus.success
                ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 border-emerald-300 dark:border-emerald-800"
                : "bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 border-rose-300 dark:border-rose-800"
            }`}
          >
            {importStatus.success ? (
              <Check className="w-4 h-4 text-emerald-500 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
            )}
            <span>{importStatus.msg}</span>
          </div>
        )}
      </Card>

      {/* 5. IndexedDB Storage & Persistence */}
      <Card className="p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300">
              <Database className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                IndexedDB Storage & Persistence
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                DeutschPath uses high-performance client-side IndexedDB with multi-store isolation.
              </p>
            </div>
          </div>

          <span
            className={`text-xs font-bold px-3 py-1 rounded-full border self-start sm:self-center ${
              isPersisted
                ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200 border-emerald-300 dark:border-emerald-800"
                : "bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-200 border-amber-300 dark:border-amber-800"
            }`}
          >
            {isPersisted ? "✓ Storage: Persistent" : "Storage: Best-Effort"}
          </span>
        </div>

        {/* Quota & Usage Bar */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-700 dark:text-slate-300">
              Storage Usage: {storageEstimate.usageKb} KB used ({storageEstimate.usagePercent}% of {storageEstimate.quotaMb} MB quota)
            </span>
            <span className="text-cyan-700 dark:text-cyan-400 font-mono">
              Schema v1 (IndexedDB)
            </span>
          </div>

          <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
            <div
              className="h-full bg-cyan-600 dark:bg-cyan-500 rounded-full transition-all duration-500"
              style={{
                width: `${Math.max(1, Math.min(100, parseFloat(storageEstimate.usagePercent) || 1))}%`
              }}
            />
          </div>
        </div>

        {/* Actions: Request Persistence & Rollback */}
        <div className="flex flex-wrap items-center gap-3 pt-1">
          {!isPersisted && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRequestPersistence}
              className="border-cyan-300 dark:border-cyan-800 text-cyan-800 dark:text-cyan-200 hover:bg-cyan-50 dark:hover:bg-cyan-950/40"
            >
              <HardDrive className="w-4 h-4 mr-1.5" />
              Request Persistent Storage
            </Button>
          )}

          {hasRollback && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleRestoreRollback}
              className="border-amber-300 text-amber-800 dark:text-amber-200 hover:bg-amber-50 dark:hover:bg-amber-950/40"
            >
              <RotateCcw className="w-4 h-4 mr-1.5 text-amber-600" />
              Restore Pre-Migration Rollback
            </Button>
          )}
        </div>

        {persistNotice && (
          <div className="text-xs text-cyan-700 dark:text-cyan-300 font-bold flex items-center gap-1.5">
            <Check className="w-4 h-4" /> {persistNotice}
          </div>
        )}

        {rollbackStatus && (
          <div
            className={`text-xs font-bold p-3 rounded-xl border flex items-center gap-1.5 ${
              rollbackStatus.success
                ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 border-emerald-300"
                : "bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 border-rose-300"
            }`}
          >
            {rollbackStatus.success ? (
              <Check className="w-4 h-4" />
            ) : (
              <AlertTriangle className="w-4 h-4" />
            )}
            <span>{rollbackStatus.msg}</span>
          </div>
        )}
      </Card>

      {/* 5. Danger Zone: Reset Progress */}
      <Card className="p-5 sm:p-6 border-rose-200 dark:border-rose-950/60 bg-rose-50/20 dark:bg-rose-950/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-rose-600 dark:text-rose-400">
              Reset All Progress
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Reset XP, streaks, completed units, SRS review intervals, and exam attempts to default.
            </p>
          </div>

          <Button
            variant="danger"
            size="sm"
            onClick={() => setShowResetModal(true)}
          >
            <RotateCcw className="w-4 h-4 mr-1.5" />
            Reset Progress
          </Button>
        </div>
      </Card>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        title="Reset Progress Confirmation"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 text-xs sm:text-sm leading-relaxed">
            <span className="font-bold">Caution:</span> This will permanently reset all your completed roadmap units, SM-2 flashcard intervals, writing submissions, and streak in this browser. We recommend downloading a backup JSON first.
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <Button variant="secondary" onClick={() => setShowResetModal(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirmReset}
            >
              Yes, Reset Everything
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
