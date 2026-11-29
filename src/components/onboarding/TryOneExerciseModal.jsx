import React, { useState } from "react";
import {
  Compass,
  Award,
  Globe,
  Calendar,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Zap,
  Target,
  BookOpen,
  X,
  Volume2
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { SUPPORTED_LANGUAGES, setAppLanguage } from "../../i18n/config";
import { GermanText } from "../common/GermanText";
import { triggerCelebration } from "../../utils/celebration";
import { playSound } from "../../utils/soundEffects";
import { getLocalDateString } from "../../services/streakService";

export const ONBOARDING_STORAGE_KEYS = {
  COMPLETED: "deutschpath_onboarded",
  PRIMARY_GOAL: "deutschpath_primary_goal",
  TARGET_EXAM_DATE: "deutschpath_target_exam_date",
  WEAKEST_SKILL: "deutschpath_onboarding_weakest_skill"
};

const TASTE_TEST_ITEMS = [
  {
    id: "item-vocab",
    skill: "vocabulary-gender",
    skillLabel: "Noun Gender Intuition",
    promptDe: "Welcher Artikel gehört zu diesem Wort?",
    word: "Tisch",
    wordTranslation: "table",
    options: [
      { id: "der", label: "der Tisch (masculine)", isCorrect: true },
      { id: "die", label: "die Tisch (feminine)", isCorrect: false },
      { id: "das", label: "das Tisch (neuter)", isCorrect: false }
    ],
    explanation: "'Tisch' is masculine in German, taking the definite article 'der'."
  },
  {
    id: "item-grammar",
    skill: "grammar-cases",
    skillLabel: "Morphosyntax & Case Endings",
    promptDe: "Ergänzen Sie die Lücke (Akkusativ):",
    sentence: "Ich bestelle _____ Kaffee.",
    hint: "'Kaffee' is masculine and functions as the direct object.",
    options: [
      { id: "einen", label: "einen", isCorrect: true },
      { id: "ein", label: "ein", isCorrect: false },
      { id: "eine", label: "eine", isCorrect: false },
      { id: "einem", label: "einem", isCorrect: false }
    ],
    explanation: "Because 'Kaffee' is masculine and the direct object of 'bestellen', it takes the Accusative case: 'einen'."
  },
  {
    id: "item-reading",
    skill: "reading-comprehension",
    skillLabel: "Passage Detail Extraction",
    passage:
      "Sehr geehrte Fahrgäste, der ICE 574 nach Hamburg Hauptbahnhof hat heute ca. 20 Minuten Verspätung wegen einer Reparatur an der Weiche.",
    question: "Warum hat der Zug Verspätung?",
    options: [
      { id: "wetter", label: "Wegen schlechten Wetters", isCorrect: false },
      { id: "reparatur", label: "Wegen einer Reparatur an der Weiche", isCorrect: true },
      { id: "ziel", label: "Weil der Zug nach Berlin fährt", isCorrect: false }
    ],
    explanation: "The announcement explicitly states: 'wegen einer Reparatur an der Weiche' (due to a switch point repair)."
  }
];

export function TryOneExerciseModal({ isOpen, onClose, onNavigate }) {
  const { t, i18n } = useTranslation("ui");
  const [step, setStep] = useState(1); // 1: Language, 2: Goal, 3: Taste Test, 4: 7-Day Plan Result

  // Step 1: Language
  const [selectedLang, setSelectedLang] = useState(i18n.language || "en");

  // Step 2: Goal
  const [goalType, setGoalType] = useState("general"); // 'general' | 'exam'
  const [selectedExam, setSelectedExam] = useState("goethe-b1");
  const [examDate, setExamDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 60);
    return getLocalDateString(d);
  });

  // Step 3: Taste Test Interactive State
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { [itemId]: selectedOptionId }
  const [itemEvaluated, setItemEvaluated] = useState(false);

  if (!isOpen) return null;

  const currentItem = TASTE_TEST_ITEMS[currentItemIndex];

  const handleSelectLanguage = async (langCode) => {
    setSelectedLang(langCode);
    await setAppLanguage(langCode);
    setStep(2);
  };

  const handleConfirmGoal = () => {
    try {
      localStorage.setItem(ONBOARDING_STORAGE_KEYS.PRIMARY_GOAL, goalType);
      if (goalType === "exam") {
        localStorage.setItem(ONBOARDING_STORAGE_KEYS.TARGET_EXAM_DATE, examDate);
      }
    } catch {}
    setStep(3);
  };

  const handleSelectOption = (optionId) => {
    if (itemEvaluated) return;
    setAnswers((prev) => ({ ...prev, [currentItem.id]: optionId }));
    setItemEvaluated(true);

    const isCorrect = currentItem.options.find((o) => o.id === optionId)?.isCorrect;
    if (isCorrect) {
      playSound.correct();
    } else {
      playSound.incorrect();
    }
  };

  const handleNextTasteItem = () => {
    if (currentItemIndex < TASTE_TEST_ITEMS.length - 1) {
      setCurrentItemIndex((prev) => prev + 1);
      setItemEvaluated(false);
    } else {
      // Completed all items -> calculate diagnosis
      triggerCelebration({ particleCount: 80, spread: 60 });
      setStep(4);
    }
  };

  // Step 4 diagnostics calculation
  let correctCount = 0;
  let weakestSkill = "vocabulary-gender";
  let weakestSkillLabel = "Noun Gender Intuition";

  TASTE_TEST_ITEMS.forEach((item) => {
    const userPick = answers[item.id];
    const isRight = item.options.find((o) => o.id === userPick)?.isCorrect;
    if (isRight) {
      correctCount++;
    } else {
      weakestSkill = item.skill;
      weakestSkillLabel = item.skillLabel;
    }
  });

  const handleFinishOnboarding = () => {
    try {
      localStorage.setItem(ONBOARDING_STORAGE_KEYS.COMPLETED, "true");
      localStorage.setItem(ONBOARDING_STORAGE_KEYS.WEAKEST_SKILL, weakestSkill);
    } catch {}
    onClose();
    if (onNavigate) {
      onNavigate(weakestSkill.includes("grammar") ? "grammar" : "roadmap");
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Try One Exercise Onboarding Flow"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in"
    >
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 my-8">
        {/* Close Button */}
        <button
          onClick={handleFinishOnboarding}
          aria-label="Skip Taste Test"
          className="absolute top-5 end-5 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Step Indicator Header */}
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500 border-b border-slate-100 dark:border-slate-800 pb-3">
          <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold">
            <Sparkles className="w-4 h-4" />
            <span>3-Minute Diagnostic Test</span>
          </span>
          <span>Step {step} of 4</span>
        </div>

        {/* STEP 1: CHOOSE LANGUAGE */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                Welcome to LanguagePath! 🌍
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Choose your native or preferred interface language. You can learn German, English, Spanish, French, Arabic, or Italian at your own pace.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              {SUPPORTED_LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleSelectLanguage(lang.code)}
                  className={`p-4 rounded-2xl border text-start flex flex-col justify-between transition-all hover:scale-105 ${
                    selectedLang === lang.code
                      ? "border-amber-500 bg-amber-50/50 dark:bg-amber-950/30 ring-2 ring-amber-500/20 shadow-md"
                      : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40"
                  }`}
                >
                  <span className="text-3xl mb-2" role="img" aria-label={lang.name}>
                    {lang.flag}
                  </span>
                  <div>
                    <div className="font-bold text-sm text-slate-900 dark:text-white">
                      {lang.nativeName}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      {lang.name}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: CHOOSE GOAL */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                What is your primary German goal?
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Your goal personalizes your daily mission generator and pacing.
              </p>
            </div>

            <div className="space-y-3 pt-1">
              <button
                type="button"
                onClick={() => setGoalType("general")}
                className={`w-full p-4 rounded-2xl border text-start flex items-start gap-3.5 transition-all ${
                  goalType === "general"
                    ? "border-amber-500 bg-amber-50/40 dark:bg-amber-950/30 ring-2 ring-amber-500/20"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-slate-50/50 dark:bg-slate-800/40"
                }`}
              >
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    General Fluency & Travel
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Conversational intuition, everyday life in Germany, and cultural fluency at a steady pace.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setGoalType("exam")}
                className={`w-full p-4 rounded-2xl border text-start flex items-start gap-3.5 transition-all ${
                  goalType === "exam"
                    ? "border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/30 ring-2 ring-indigo-500/20"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-slate-50/50 dark:bg-slate-800/40"
                }`}
              >
                <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    Official Exam Certification
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Timed mock tests, rubric writing evaluation, and targeted pass strategies (Goethe, Telc, DTZ).
                  </p>

                  {goalType === "exam" && (
                    <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">
                          TARGET EXAM
                        </label>
                        <select
                          value={selectedExam}
                          onChange={(e) => setSelectedExam(e.target.value)}
                          className="w-full text-xs p-2 rounded-lg border border-slate-700 bg-slate-800 text-white font-semibold"
                        >
                          <option value="goethe-a1">Goethe-Zertifikat A1</option>
                          <option value="goethe-a2">Goethe-Zertifikat A2</option>
                          <option value="goethe-b1">Goethe-Zertifikat B1</option>
                          <option value="goethe-b2">Goethe-Zertifikat B2</option>
                          <option value="telc-b1">telc Deutsch B1</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">
                          EXAM DATE
                        </label>
                        <input
                          type="date"
                          value={examDate}
                          onChange={(e) => setExamDate(e.target.value)}
                          className="w-full text-xs p-2 rounded-lg border border-slate-700 bg-slate-800 text-white font-semibold"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </button>
            </div>

            <button
              type="button"
              onClick={handleConfirmGoal}
              className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 transition-all"
            >
              <span>Continue to 3-Min Taste Test</span>
              <ArrowRight className="w-4 h-4 rtl:rotate-180" />
            </button>
          </div>
        )}

        {/* STEP 3: TASTE TEST EXERCISE (3 Items) */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-bold text-slate-700 dark:text-slate-300">
                Question {currentItemIndex + 1} of {TASTE_TEST_ITEMS.length}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold">
                {currentItem.skillLabel}
              </span>
            </div>

            {/* Exercise Content */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="text-xs font-semibold text-slate-500">
                {currentItem.promptDe || currentItem.question}
              </div>

              {currentItem.word && (
                <div className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <GermanText>"{currentItem.word}"</GermanText>
                  <span className="text-xs font-medium text-slate-500">
                    ({currentItem.wordTranslation})
                  </span>
                </div>
              )}

              {currentItem.sentence && (
                <div className="text-base font-bold text-slate-800 dark:text-slate-100">
                  <GermanText>{currentItem.sentence}</GermanText>
                  {currentItem.hint && (
                    <div className="text-[11px] font-normal text-slate-500 mt-1">
                      💡 {currentItem.hint}
                    </div>
                  )}
                </div>
              )}

              {currentItem.passage && (
                <div className="text-xs text-slate-300 p-3 rounded-xl bg-slate-900 border border-slate-700/60 leading-relaxed font-serif">
                  <GermanText>{currentItem.passage}</GermanText>
                </div>
              )}
            </div>

            {/* Options */}
            <div className="space-y-2">
              {currentItem.options.map((option) => {
                const isSelected = answers[currentItem.id] === option.id;
                let optionClass =
                  "border-slate-800 hover:border-slate-700 bg-slate-900";

                if (itemEvaluated) {
                  if (option.isCorrect) {
                    optionClass = "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-200";
                  } else if (isSelected) {
                    optionClass = "border-rose-500 bg-rose-50/50 dark:bg-rose-950/30 text-rose-800 dark:text-rose-200";
                  }
                } else if (isSelected) {
                  optionClass = "border-amber-500 bg-amber-50/30";
                }

                return (
                  <button
                    key={option.id}
                    type="button"
                    disabled={itemEvaluated}
                    onClick={() => handleSelectOption(option.id)}
                    className={`w-full p-3 rounded-xl border text-start text-xs font-semibold flex items-center justify-between transition-all ${optionClass}`}
                  >
                    <span>{option.label}</span>
                    {itemEvaluated && option.isCorrect && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    )}
                    {itemEvaluated && isSelected && !option.isCorrect && (
                      <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explanation & Next CTA */}
            {itemEvaluated && (
              <div className="space-y-3 pt-2">
                <div className="p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900 text-xs text-indigo-950 dark:text-indigo-200 leading-relaxed">
                  <span className="font-bold me-1">Explanation:</span>
                  {currentItem.explanation}
                </div>

                <button
                  type="button"
                  onClick={handleNextTasteItem}
                  className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20"
                >
                  <span>
                    {currentItemIndex < TASTE_TEST_ITEMS.length - 1
                      ? "Next Question"
                      : "View Diagnosis & 7-Day Plan"}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* STEP 4: DIAGNOSTIC RESULT & 7-DAY PLAN */}
        {step === 4 && (
          <div className="space-y-5">
            <div>
              <div className="flex items-center gap-2 text-xs font-black px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 w-fit mb-2">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Test Completed ({correctCount}/{TASTE_TEST_ITEMS.length} Correct)</span>
              </div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                Your Personalized 7-Day Plan
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Targeting your primary weak spot:{" "}
                <span className="font-bold text-amber-600 dark:text-amber-400">
                  {weakestSkillLabel}
                </span>
              </p>
            </div>

            {/* 7-Day Roadmap Timeline */}
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {[
                { day: "Day 1", task: "Noun Gender Rules & Speed Drill (-ung, -heit, -chen)", icon: Zap },
                { day: "Day 2", task: "Accusative Direct Objects & V2 Word Order", icon: Target },
                { day: "Day 3", task: "Graded Reading & Sentence Audio Shadowing", icon: BookOpen },
                { day: "Day 4", task: "Dative Case Mastery with Two-Way Prepositions", icon: Compass },
                { day: "Day 5", task: "Goethe / Telc Format Practice Module", icon: Award },
                { day: "Day 6", task: "AI Tutor Interactive Conversation Roleplay", icon: Sparkles },
                { day: "Day 7", task: "Consolidated Spaced Repetition Review & Unit Mastery", icon: CheckCircle2 }
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.day}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center gap-3 text-xs"
                  >
                    <span className="font-black text-[11px] text-amber-600 dark:text-amber-400 min-w-[42px]">
                      {item.day}
                    </span>
                    <Icon className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      {item.task}
                    </span>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={handleFinishOnboarding}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02]"
            >
              <span>Start Your 7-Day Plan</span>
              <ArrowRight className="w-4 h-4 rtl:rotate-180" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default TryOneExerciseModal;
