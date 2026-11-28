import React, { useState, useMemo } from "react";
import {
  Mic,
  Award,
  Volume2,
  ExternalLink,
  Layers,
  Sparkles,
  History,
  CheckCircle2,
  AlertCircle,
  Clock,
  BookOpen,
  Settings,
  HelpCircle,
  RotateCcw,
  PlusCircle,
  Lightbulb
} from "lucide-react";
import examMockData from "../data/examMockData.json";
import { ExamModuleSprechen } from "../components/exam/ExamModuleSprechen";
import { SPEAKING_TASKS } from "../services/aiSpeakingService";
import { getRubric, SPEAKING_RUBRICS } from "../data/rubrics/index";
import { Button } from "../components/common/Button";
import { Card } from "../components/common/Card";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { useSpeech } from "../hooks/useSpeech";
import { useProgress } from "../context/ProgressContext";

const LANG_BCP47 = {
  de: "de-DE",
  es: "es-ES",
  fr: "fr-FR",
  en: "en-US",
  it: "it-IT",
  ar: "ar-SA"
};

const LEVELS = ["A1", "A2", "B1", "B2"];

const LEVEL_DESCRIPTIONS = {
  A1: "Everyday intro, questions with cards & simple requests (15 Pkt)",
  A2: "Weekend anecdotes, collaborative planning & daily routines (25 Pkt)",
  B1: "Structured monologic presentation & opinion argumentation (25 Pkt)",
  B2: "Academic or professional speech & complex debate (25 Pkt)"
};

const INSTITUTIONS = [
  { id: "goethe", name: "Goethe-Institut", label: "Goethe-Zertifikat" },
  { id: "telc", name: "telc Deutsch", label: "telc Certificate" },
  { id: "osd", name: "ÖSD", label: "Österreichisches Sprachdiplom" },
  { id: "dtz", name: "DTZ", label: "Deutsch-Test für Zuwanderer" },
  { id: "testdaf", name: "TestDaF", label: "Test Deutsch als Fremdsprache" }
];

const ORAL_REDEMITTEL = {
  A1: [
    { de: "Guten Tag, mein Name ist... Ich komme aus...", en: "Hello, my name is... I come from..." },
    { de: "Könnten Sie das bitte wiederholen?", en: "Could you please repeat that?" },
    { de: "Entschuldigung, wie viel kostet das?", en: "Excuse me, how much does this cost?" },
    { de: "Könnten Sie mir bitte helfen?", en: "Could you please help me?" }
  ],
  A2: [
    { de: "Am letzten Wochenende habe ich... gemacht.", en: "Last weekend I did..." },
    { de: "Wie wäre es, wenn wir am Samstag...?", en: "How about if we... on Saturday?" },
    { de: "Das ist eine gute Idee! Was meinst du dazu?", en: "That's a good idea! What do you think?" },
    { de: "Ich bin der Meinung, dass...", en: "I am of the opinion that..." }
  ],
  B1: [
    { de: "Das Thema meiner heutigen Präsentation lautet...", en: "The topic of my presentation today is..." },
    { de: "Einerseits bietet dies Vorteile, andererseits...", en: "On the one hand this offers advantages, on the other..." },
    { de: "In meinem Heimatland ist die Situation so, dass...", en: "In my home country the situation is that..." },
    { de: "Zusammenfassend möchte ich betonen, dass...", en: "In conclusion I would like to emphasize that..." }
  ],
  B2: [
    { de: "Es lässt sich kaum bestreiten, dass...", en: "It can hardly be denied that..." },
    { de: "Ein entscheidender Gesichtspunkt hierbei ist...", en: "A decisive aspect here is..." },
    { de: "Aus betriebswirtschaftlicher Sicht empfiehlt es sich...", en: "From a business perspective it is advisable..." },
    { de: "Daraus lässt sich die Schlussfolgerung ziehen, dass...", en: "From this one can draw the conclusion that..." }
  ]
};

const ORAL_REDEMITTEL_BY_LANG = {
  de: ORAL_REDEMITTEL,
  es: {
    A1: [
      { de: "Hola, me llamo... Soy de...", en: "Hello, my name is... I am from..." },
      { de: "¿Podría repetir eso, por favor?", en: "Could you please repeat that?" },
      { de: "Disculpe, ¿cuánto cuesta esto?", en: "Excuse me, how much does this cost?" },
      { de: "¿Podría ayudarme, por favor?", en: "Could you please help me?" }
    ],
    A2: [
      { de: "El fin de semana pasado hice...", en: "Last weekend I did..." },
      { de: "¿Qué te parece si el sábado...?", en: "How about if we... on Saturday?" },
      { de: "¡Es una buena idea! ¿Qué opinas?", en: "That's a good idea! What do you think?" },
      { de: "En mi opinión...", en: "In my opinion..." }
    ],
    B1: [
      { de: "El tema de mi presentación de hoy es...", en: "The topic of my presentation today is..." },
      { de: "Por un lado esto tiene ventajas, pero por otro...", en: "On the one hand this has advantages, but on the other..." },
      { de: "En mi país de origen la situación es...", en: "In my home country the situation is..." },
      { de: "En resumen, me gustaría destacar que...", en: "In summary I would like to highlight that..." }
    ],
    B2: [
      { de: "Es indiscutible que...", en: "It is indisputable that..." },
      { de: "Un aspecto decisivo en esto es...", en: "A decisive aspect here is..." },
      { de: "Desde una perspectiva práctica conviene...", en: "From a practical perspective it is advisable..." },
      { de: "De ello se puede concluir que...", en: "From this one can conclude that..." }
    ]
  },
  fr: {
    A1: [
      { de: "Bonjour, je m'appelle... Je viens de...", en: "Hello, my name is... I come from..." },
      { de: "Pourriez-vous répéter, s'il vous plaît ?", en: "Could you please repeat that?" },
      { de: "Pardon, combien cela coûte-t-il ?", en: "Excuse me, how much does this cost?" },
      { de: "Pourriez-vous m'aider, s'il vous plaît ?", en: "Could you please help me?" }
    ],
    A2: [
      { de: "Le week-end dernier, j'ai fait...", en: "Last weekend I did..." },
      { de: "Et si on allait... samedi ?", en: "How about if we... on Saturday?" },
      { de: "C'est une très bonne idée ! Qu'en penses-tu ?", en: "That's a great idea! What do you think?" },
      { de: "À mon avis...", en: "In my opinion..." }
    ],
    B1: [
      { de: "Le sujet de ma présentation aujourd'hui est...", en: "The topic of my presentation today is..." },
      { de: "D'un côté cela présente des avantages, mais d'un autre...", en: "On the one hand this presents advantages, but on the other..." },
      { de: "Dans mon pays d'origine, la situation est...", en: "In my home country the situation is..." },
      { de: "En conclusion, je tiens à souligner que...", en: "In conclusion I would like to emphasize that..." }
    ],
    B2: [
      { de: "Il est indéniable que...", en: "It cannot be denied that..." },
      { de: "Un élément déterminant réside dans...", en: "A decisive aspect lies in..." },
      { de: "D'un point de vue stratégique, il convient de...", en: "From a strategic point of view it is appropriate to..." },
      { de: "On peut en tirer la conclusion que...", en: "One can draw the conclusion that..." }
    ]
  },
  en: {
    A1: [
      { de: "Hello, my name is... I come from...", en: "Hello, my name is... I come from..." },
      { de: "Could you please repeat that?", en: "Could you please repeat that?" },
      { de: "Excuse me, how much does this cost?", en: "Excuse me, how much does this cost?" },
      { de: "Could you please help me?", en: "Could you please help me?" }
    ],
    A2: [
      { de: "Last weekend I visited...", en: "Last weekend I visited..." },
      { de: "How about we meet on Saturday?", en: "How about we meet on Saturday?" },
      { de: "That sounds like a great plan!", en: "That sounds like a great plan!" },
      { de: "In my personal opinion...", en: "In my personal opinion..." }
    ],
    B1: [
      { de: "The focus of my presentation today is...", en: "The focus of my presentation today is..." },
      { de: "While there are clear benefits, there are also drawbacks...", en: "While there are clear benefits, there are also drawbacks..." },
      { de: "In my experience, the general trend shows...", en: "In my experience, the general trend shows..." },
      { de: "To sum up my main points...", en: "To sum up my main points..." }
    ],
    B2: [
      { de: "It is widely recognized that...", en: "It is widely recognized that..." },
      { de: "A paramount factor in this discussion is...", en: "A paramount factor in this discussion is..." },
      { de: "From a systemic perspective, one must consider...", en: "From a systemic perspective, one must consider..." },
      { de: "Consequently, the evidence strongly suggests that...", en: "Consequently, the evidence strongly suggests that..." }
    ]
  }
};

export function SpeakingStudioPage({ onNavigate }) {
  const { activeTargetLanguage, activeCurriculum } = useProgress?.() || {};
  const speechLang = LANG_BCP47[activeTargetLanguage] || "de-DE";
  const langName = activeCurriculum?.name || activeCurriculum?.languageName || "German";
  const { speak } = useSpeech({ lang: speechLang, rate: 0.95 });

  const [selectedLevel, setSelectedLevel] = useLocalStorage("deutschpath_speaking_level", "A1");
  const [selectedRubric, setSelectedRubric] = useLocalStorage("deutschpath_speaking_rubric", "goethe");
  const [cloudConsent, setCloudConsent] = useLocalStorage("deutschpath_cloud_audio_consent", false);
  const [geminiApiKey] = useLocalStorage("deutschpath_gemini_api_key", "");

  // Mode: "simulation" (official mock parts) | "drills" (task library) | "custom" (user prompt)
  const [activeMode, setActiveMode] = useState("simulation");
  const [selectedDrillId, setSelectedDrillId] = useState(null);

  // Custom task state
  const [customTitle, setCustomTitle] = useState("Mein Lieblingsthema");
  const [customPrompt, setCustomPrompt] = useState("Bitte sprechen Sie 2 Minuten frei über Ihr Thema.");
  const [customGuidelineInput, setCustomGuidelineInput] = useState("Einleitung\nHauptargumente\nEigenes Fazit");

  // Speaking history
  const [speakingHistory, setSpeakingHistory] = useLocalStorage("deutschpath_speaking_history_v1", []);

  // Compute active rubric
  const rubricDetails = useMemo(() => {
    return getRubric(selectedRubric, selectedLevel, "speaking");
  }, [selectedRubric, selectedLevel]);

  // Current tasks from library for selected level
  const drillTasks = useMemo(() => {
    return SPEAKING_TASKS[selectedLevel] || SPEAKING_TASKS.A1;
  }, [selectedLevel]);

  // Compute moduleData passed to ExamModuleSprechen
  const moduleData = useMemo(() => {
    if (activeMode === "simulation") {
      const examMock = examMockData.find((e) => e.level === selectedLevel) || examMockData[0];
      return (
        examMock.modules.sprechen || {
          title: `Mündliche Prüfung (${selectedLevel})`,
          parts: drillTasks
        }
      );
    }

    if (activeMode === "drills") {
      const activeTask = drillTasks.find((t) => t.id === selectedDrillId) || drillTasks[0];
      return {
        title: `${activeTask.title} (${selectedLevel})`,
        parts: [activeTask]
      };
    }

    // Custom mode
    const customGuidelines = customGuidelineInput
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    return {
      title: customTitle || "Freies Sprechen",
      parts: [
        {
          partNumber: 1,
          title: customTitle || "Freies Sprechen",
          promptAudio: customPrompt,
          guidelines: customGuidelines.length > 0 ? customGuidelines : ["Einleitung", "Hauptteil", "Fazit"],
          modelAnswer: "Hier ist ein passender Beispielsatz für die mündliche Präsentation."
        }
      ]
    };
  }, [activeMode, selectedLevel, drillTasks, selectedDrillId, customTitle, customPrompt, customGuidelineInput]);

  const handleSpeakingAnswerChange = (partKey, data) => {
    if (data?.overall !== undefined) {
      const record = {
        id: `spk_${Date.now()}`,
        timestamp: new Date().toISOString(),
        level: selectedLevel,
        rubricInstitution: selectedRubric,
        taskTitle: moduleData?.title || "Speaking Task",
        overall: data.overall,
        wpm: data.metrics?.wordsPerMinute || 0,
        fillers: data.metrics?.fillers?.count || 0,
        transcriptPreview: data.transcript?.slice(0, 80) || ""
      };
      setSpeakingHistory((prev) => [record, ...(prev || [])].slice(0, 20));
    }
  };

  const redemittelList =
    ORAL_REDEMITTEL_BY_LANG[activeTargetLanguage]?.[selectedLevel] ||
    ORAL_REDEMITTEL[selectedLevel] ||
    ORAL_REDEMITTEL.A1;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Studio Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 text-white shadow-xl shadow-rose-500/15 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-black uppercase tracking-wider backdrop-blur-xs">
            <Mic className="w-3.5 h-3.5" />
            <span>Oral Exam &amp; Shadowing Studio</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{langName} Speaking Studio</h1>
          <p className="text-xs sm:text-sm text-rose-50 max-w-xl leading-relaxed">
            Practice realistic CEFR oral exam formats. Real-time {langName} speech transcription, local acoustic metrics (WPM, pause gaps, fillers), official exam rubrics, and 0.75x shadowing drills.
          </p>
        </div>

        {/* Audio Privacy & STT Status Pill */}
        <div className="flex flex-col gap-2 p-4 rounded-2xl bg-black/20 backdrop-blur-md border border-white/20 text-xs shrink-0 max-w-xs">
          <div className="flex items-center justify-between gap-2">
            <span className="font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
              <span>Microphone Capture</span>
            </span>
            <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-white/20">
              Zero-Backend
            </span>
          </div>
          <p className="text-[11px] text-rose-100 leading-snug">
            Processed locally via browser Web Speech API ({speechLang}). Optional Gemini audio fallback requires explicit consent.
          </p>
        </div>
      </div>

      {/* 1. CEFR Level Selector */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-400">
            Target CEFR Examination Level
          </h2>
          <span className="text-xs font-medium text-slate-500">
            {LEVEL_DESCRIPTIONS[selectedLevel]}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {LEVELS.map((lvl) => {
            const isActive = selectedLevel === lvl;
            return (
              <button
                key={lvl}
                onClick={() => setSelectedLevel(lvl)}
                className={`p-3.5 rounded-2xl text-left border transition-all ${
                  isActive
                    ? "bg-rose-500 text-white border-rose-500 shadow-md shadow-rose-500/20 scale-[1.02]"
                    : "bg-slate-900 border-slate-800 text-slate-300 hover:border-rose-400"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-lg font-black">{lvl}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isActive ? "bg-white/20 text-white" : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {lvl === "A1" ? "15 Pkt" : "25 Pkt"}
                  </span>
                </div>
                <p className={`text-[11px] mt-1 line-clamp-1 ${isActive ? "text-rose-100" : "text-slate-400"}`}>
                  {LEVEL_DESCRIPTIONS[lvl]}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Official Exam Rubric Selector */}
      <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-rose-600 dark:text-rose-400">
              Official Oral Examination Rubric
            </span>
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 mt-0.5">
              {rubricDetails.institution} &bull; {rubricDetails.moduleName || rubricDetails.examName}
            </h3>
          </div>

          {rubricDetails.source && (
            <a
              href={rubricDetails.source}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline"
            >
              <span>Official Guidelines &amp; Criteria</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

        {/* Institution Selector Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {INSTITUTIONS.map((inst) => {
            const isActive = selectedRubric === inst.id;
            return (
              <button
                key={inst.id}
                onClick={() => setSelectedRubric(inst.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? "bg-rose-500 text-white shadow-2xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {inst.name}
              </button>
            );
          })}
        </div>

        {/* Criteria Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 pt-1">
          {rubricDetails.criteria?.map((c) => (
            <div
              key={c.id}
              className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-slate-800 dark:text-slate-200 truncate">
                  {c.name}
                </span>
                <span className="text-[10px] font-black text-rose-600 dark:text-rose-400 shrink-0 ml-1">
                  {c.maxPoints} Pkt
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                {c.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Mode Selection & Practice Task Chooser */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          <button
            onClick={() => setActiveMode("simulation")}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-extrabold transition-all ${
              activeMode === "simulation"
                ? "bg-rose-500 text-white shadow-sm"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Full Exam Simulation ({selectedLevel})</span>
          </button>

          <button
            onClick={() => setActiveMode("drills")}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-extrabold transition-all ${
              activeMode === "drills"
                ? "bg-rose-500 text-white shadow-sm"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Oral Task Drills ({drillTasks.length})</span>
          </button>

          <button
            onClick={() => setActiveMode("custom")}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-extrabold transition-all ${
              activeMode === "custom"
                ? "bg-rose-500 text-white shadow-sm"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Custom Topic</span>
          </button>
        </div>

        {/* Drill Task List if drills mode is active */}
        {activeMode === "drills" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {drillTasks.map((t) => {
              const isSelected = (selectedDrillId || drillTasks[0]?.id) === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setSelectedDrillId(t.id)}
                  className={`p-4 rounded-2xl text-left border transition-all ${
                    isSelected
                      ? "bg-rose-50 dark:bg-rose-950/30 border-rose-400 text-slate-900 dark:text-white ring-2 ring-rose-400/20"
                      : "bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700"
                  }`}
                >
                  <span className="text-[10px] font-black uppercase tracking-wider text-rose-500 block">
                    {t.theme || "Speaking Drill"}
                  </span>
                  <h4 className="text-sm font-extrabold mt-0.5 line-clamp-1">{t.title}</h4>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {t.promptAudio}
                  </p>
                </button>
              );
            })}
          </div>
        )}

        {/* Custom Topic Form if custom mode is active */}
        {activeMode === "custom" && (
          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
              Configure Custom Oral Task
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">
                  Task Title:
                </label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  placeholder="e.g. Mein Traumberuf"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">
                  Examiner Spoken Prompt:
                </label>
                <input
                  type="text"
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  placeholder="e.g. Bitte beschreiben Sie..."
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">
                Leitpunkte (One guideline per line):
              </label>
              <textarea
                value={customGuidelineInput}
                onChange={(e) => setCustomGuidelineInput(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                placeholder="Punkt 1&#10;Punkt 2&#10;Fazit"
              />
            </div>
          </div>
        )}
      </div>

      {/* 4. Interactive Speaking Module Workspace */}
      <ExamModuleSprechen
        key={`${selectedLevel}_${selectedRubric}_${activeMode}_${selectedDrillId || "default"}`}
        moduleData={moduleData}
        level={selectedLevel}
        rubricInstitution={selectedRubric}
        onAnswerChange={handleSpeakingAnswerChange}
      />

      {/* 5. CEFR Oral Redemittel Cheatsheet */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
              Essential Oral Redemittel &bull; Level {selectedLevel}
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            Tap audio to hear native pronunciation
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {redemittelList.map((item, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 text-xs"
            >
              <div>
                <span className="font-bold text-slate-900 dark:text-slate-100 block">
                  "{item.de}"
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 block">
                  {item.en}
                </span>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => speak(item.de)}
                icon={Volume2}
                className="shrink-0 p-2 text-slate-600 dark:text-slate-300 hover:text-rose-600"
                aria-label={`Listen to: ${item.de}`}
              />
            </div>
          ))}
        </div>
      </div>

      {/* 6. Speaking Practice Log / History */}
      {speakingHistory && speakingHistory.length > 0 && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-slate-500" />
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                Recent Speaking Sessions
              </h3>
            </div>
            <button
              onClick={() => setSpeakingHistory([])}
              className="text-xs text-slate-400 hover:text-rose-500"
            >
              Clear Log
            </button>
          </div>

          <div className="space-y-2">
            {speakingHistory.slice(0, 5).map((entry) => (
              <div
                key={entry.id}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900 dark:text-slate-100">
                      {entry.taskTitle}
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
                      {entry.level}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 italic truncate max-w-md">
                    "{entry.transcriptPreview}..."
                  </p>
                </div>

                <div className="flex items-center gap-4 text-xs font-bold text-slate-600 dark:text-slate-300">
                  <span>{entry.wpm} WPM</span>
                  <span>{entry.fillers} Fillers</span>
                  <div className="px-2.5 py-1 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-black">
                    {entry.overall} Pkt
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Audio Privacy & Settings Help Card */}
      <Card className="p-5 text-xs text-slate-500 dark:text-slate-400 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
            <Settings className="w-3.5 h-3.5 text-slate-500" />
            <span>Audio STT Privacy &amp; Consent</span>
          </div>
          <p className="text-[11px]">
            DeutschPath enforces zero silent audio uploads. All default speech recognition runs locally in your browser. Cloud transcription requires your explicit toggle and API key.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <input
              id="global-cloud-consent"
              type="checkbox"
              checked={cloudConsent}
              onChange={(e) => setCloudConsent(e.target.checked)}
              className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500"
            />
            <label htmlFor="global-cloud-consent" className="font-bold text-slate-700 dark:text-slate-300 select-none cursor-pointer">
              Allow Cloud STT
            </label>
          </div>

          {onNavigate && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onNavigate("settings")}
              className="text-xs"
            >
              Open Settings
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
