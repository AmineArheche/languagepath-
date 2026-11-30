import React from "react";
import { useProgress } from "../../context/ProgressContext";

export function LevelSelector({ levels, selectedLevelId, onSelectLevel }) {
  const { getUnitProgress, getUnitStatus } = useProgress();

  return (
    <div className="flex gap-2 p-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-x-auto">
      {levels.map((lvl) => {
        const isSelected = lvl.id === selectedLevelId;

        // Calculate average unit progress in this level
        const units = lvl.units || [];
        const avgProgress = Math.round(
          units.reduce((acc, u) => acc + getUnitProgress(u.id), 0) / (units.length || 1)
        );
        const completedUnitsCount = units.filter((u) => getUnitStatus(u.id) === "completed").length;
        const isLevelFullyDone = completedUnitsCount === units.length && units.length > 0;

        return (
          <button
            key={lvl.id}
            onClick={() => onSelectLevel(lvl.id)}
            className={`flex-1 min-w-[80px] py-2.5 px-3 rounded-xl transition-all duration-200 text-center relative ${
              isSelected
                ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-white/50 dark:hover:bg-slate-800/50"
            }`}
          >
            <div className="flex items-center justify-center gap-1.5">
              <span className="text-sm font-extrabold">{lvl.id}</span>
              {isLevelFullyDone && <span className="text-emerald-500 text-xs">✓</span>}
            </div>
            <div className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
              {avgProgress}% done
            </div>
          </button>
        );
      })}
    </div>
  );
}
