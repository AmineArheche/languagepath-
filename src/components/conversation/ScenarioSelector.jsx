import React from "react";
import { Coffee, Briefcase, Activity, Train, MessageCircle, Sparkles, Check } from "lucide-react";
import { SCENARIOS } from "../../services/aiTutorService";

const ICON_MAP = {
  Coffee,
  Briefcase,
  Activity,
  Train,
  MessageCircle
};

export function ScenarioSelector({
  selectedLevel,
  onSelectLevel,
  selectedScenarioId,
  onSelectScenario
}) {
  return (
    <div className="space-y-4 p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
      {/* Level Selection Tabs */}
      <div>
        <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-2">
          <span>Choose Your CEFR Level:</span>
          <span className="text-[11px] text-amber-600 dark:text-amber-400">
            {selectedLevel === "A1" && "A1: Short 3-6 word sentences, simple present"}
            {selectedLevel === "A2" && "A2: Basic compound sentences, Perfekt past"}
            {selectedLevel === "B1" && "B1: Subordinate clauses, weil/obwohl"}
            {selectedLevel === "B2" && "B2: Nuanced debate, Konjunktiv II, idioms"}
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {["A1", "A2", "B1", "B2"].map((lvl) => (
            <button
              key={lvl}
              type="button"
              onClick={() => onSelectLevel(lvl)}
              className={`py-2 px-3 rounded-xl font-extrabold text-sm transition-all text-center ${
                selectedLevel === lvl
                  ? "bg-amber-500 text-white shadow-md shadow-amber-500/20 scale-102"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Scenario Selection Grid */}
      <div>
        <div className="text-xs font-bold text-slate-400 mb-2">
          Choose Conversation Scenario:
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {SCENARIOS.map((scenario) => {
            const Icon = ICON_MAP[scenario.icon] || MessageCircle;
            const isSelected = selectedScenarioId === scenario.id;

            return (
              <button
                key={scenario.id}
                type="button"
                onClick={() => onSelectScenario(scenario.id)}
                className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                  isSelected
                    ? "bg-amber-50 dark:bg-amber-950/40 border-amber-500 text-slate-900 dark:text-white shadow-sm ring-1 ring-amber-500/50"
                    : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700"
                }`}
              >
                <div>
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center mb-2 ${
                      isSelected
                        ? "bg-amber-500 text-white"
                        : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="font-extrabold text-xs truncate">
                    {scenario.title.split("(")[0].trim()}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate mt-0.5">
                    {scenario.badge}
                  </div>
                </div>

                {isSelected && (
                  <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-0.5 mt-2">
                    <Check className="w-3 h-3" /> Active
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
