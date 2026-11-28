import React, { useState, useMemo } from "react";
import { BookOpen, Target, Shuffle, Split } from "lucide-react";
import { useProgress } from "../context/ProgressContext";
import { GrammarExerciseRunner } from "../components/grammar/GrammarExerciseRunner";
import { GrammarContrastRunner } from "../components/grammar/GrammarContrastRunner";
import { WeakSpotsView } from "../components/grammar/WeakSpotsView";

export function GrammarPage() {
  const { allGrammarExercises, getWeakSpotExercises, getWeakSpots, activeCurriculum } = useProgress();

  const [activeTab, setActiveTab] = useState("practice"); // "practice" | "interleaved" | "contrast" | "weakspots"
  const [selectedTopic, setSelectedTopic] = useState("all");
  const [isDrillingWeakSpots, setIsDrillingWeakSpots] = useState(false);
  const [customDrillExercises, setCustomDrillExercises] = useState(null);

  const rawWeakSpots = getWeakSpots ? getWeakSpots() : [];
  const weakSpots = Array.isArray(rawWeakSpots) ? rawWeakSpots : [];
  const mistakeCount = weakSpots.reduce((acc, s) => acc + (s.mistakes || 0), 0);

  // Interleaving generator: mixes diverse topics in round-robin sequence
  const interleavedExercises = useMemo(() => {
    const topics = Array.from(new Set(allGrammarExercises.map((e) => e.topic).filter(Boolean)));
    const grouped = {};
    topics.forEach((t) => {
      grouped[t] = allGrammarExercises.filter((e) => e.topic === t);
    });

    const result = [];
    const maxLen = Math.max(...topics.map((t) => (grouped[t] || []).length), 0);
    for (let i = 0; i < maxLen; i++) {
      topics.forEach((t) => {
        if (grouped[t] && grouped[t][i]) {
          result.push(grouped[t][i]);
        }
      });
    }
    return result;
  }, [allGrammarExercises]);

  // Exercises to practice
  const exercisesToRun = useMemo(() => {
    if (customDrillExercises && customDrillExercises.length > 0) {
      return customDrillExercises;
    }
    if (isDrillingWeakSpots) {
      return getWeakSpotExercises();
    }
    if (activeTab === "interleaved") {
      return interleavedExercises;
    }
    if (selectedTopic === "all") {
      return allGrammarExercises;
    }
    return allGrammarExercises.filter((e) => e.topic === selectedTopic);
  }, [allGrammarExercises, selectedTopic, isDrillingWeakSpots, getWeakSpotExercises, customDrillExercises, activeTab, interleavedExercises]);

  const handleStartWeakSpotDrill = (recommendedExercises) => {
    if (Array.isArray(recommendedExercises) && recommendedExercises.length > 0) {
      setCustomDrillExercises(recommendedExercises);
    } else {
      setCustomDrillExercises(null);
    }
    setIsDrillingWeakSpots(true);
    setActiveTab("practice");
  };

  const handleFinishSession = () => {
    setIsDrillingWeakSpots(false);
    setCustomDrillExercises(null);
  };

  return (
    <div className="max-w-4xl mx-auto py-4 px-3 sm:px-6 space-y-6">
      {/* Top Header & Tab Switch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Grammar Studio & Exercises
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {activeCurriculum?.languageName ? `Entraînement grammatical actif et règles clés pour le ${activeCurriculum.languageName}.` : "Maîtrisez la grammaire avec entraînement ciblé et points faibles."}
          </p>
        </div>

        {/* 4 Mode Tabs: All Exercises, Interleaved, Contrast Mode, Weak Spots */}
        <div className="flex flex-wrap gap-1.5 p-1.5 rounded-2xl bg-slate-900 border border-slate-800">
          <button
            onClick={() => {
              setActiveTab("practice");
              setIsDrillingWeakSpots(false);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "practice" && !isDrillingWeakSpots
                ? "bg-slate-800 text-amber-400 font-bold border border-slate-700 shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Practice</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("interleaved");
              setIsDrillingWeakSpots(false);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "interleaved"
                ? "bg-amber-500 text-white shadow-sm"
                : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            }`}
            title="Mix and alternate between diverse grammar topics"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>Interleaved Mode</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("contrast");
              setIsDrillingWeakSpots(false);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "contrast"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            }`}
            title="Direct contrast between grammatical pairs (Akkusativ vs. Dativ, etc.)"
          >
            <Split className="w-3.5 h-3.5" />
            <span>Contrast Mode</span>
          </button>

          <button
            onClick={() => setActiveTab("weakspots")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "weakspots"
                ? "bg-slate-800 text-amber-400 font-bold border border-slate-700 shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Target className="w-3.5 h-3.5 text-rose-500" />
            <span>Weak Spots</span>
            {mistakeCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-black">
                {mistakeCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Tab Contents */}
      {activeTab === "weakspots" ? (
        <WeakSpotsView onStartDrill={handleStartWeakSpotDrill} />
      ) : activeTab === "contrast" ? (
        <GrammarContrastRunner onFinish={() => setActiveTab("practice")} />
      ) : (
        <div className="space-y-6">
          {/* Active Mode Notice */}
          {isDrillingWeakSpots ? (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-800 dark:text-rose-200 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold">
                <Target className="w-4 h-4 text-rose-500" />
                <span>Targeted Drill Mode: Re-serving your highest mistake grammar topics</span>
              </div>
              <button
                onClick={() => setIsDrillingWeakSpots(false)}
                className="text-xs font-bold underline hover:no-underline"
              >
                Exit Drill
              </button>
            </div>
          ) : activeTab === "interleaved" ? (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold">
                <Shuffle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>
                  <strong>Interleaved Practice Mode:</strong> Exercises alternate between articles, cases, verb forms, and word order to train rapid cognitive retrieval.
                </span>
              </div>
              <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500 text-white">
                {interleavedExercises.length} Mixed Items
              </span>
            </div>
          ) : (
            /* Topic Filter Pills */
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {[
                { id: "all", label: "All Topics" },
                { id: "articles", label: "Articles" },
                { id: "verb-conjugation", label: "Verb Conjugation" },
                { id: "adjective-endings", label: "Adjective Endings" },
                { id: "cases", label: "Cases (Nom/Akk/Dat)" },
                { id: "sentence-order", label: "Sentence Order (V2)" }
              ].map((topic) => (
                <button
                  key={topic.id}
                  onClick={() => setSelectedTopic(topic.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all ${
                    selectedTopic === topic.id
                      ? "bg-amber-500 text-white shadow-sm"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {topic.label}
                </button>
              ))}
            </div>
          )}

          {/* Interactive Exercise Runner */}
          <GrammarExerciseRunner
            key={`${selectedTopic}-${isDrillingWeakSpots}-${activeTab}`}
            exercises={exercisesToRun}
            onFinish={handleFinishSession}
          />
        </div>
      )}
    </div>
  );
}
