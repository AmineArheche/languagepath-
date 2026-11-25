import React from "react";
import { RotateCcw, ThumbsUp, Zap, Sparkles } from "lucide-react";
import { getEstimatedIntervals } from "../../utils/srsEngine";

export function SRSControls({ onRate, isVisible = true, sm2Record = null }) {
  if (!isVisible) {
    return (
      <div className="h-16 flex items-center justify-center text-xs font-semibold text-slate-400 dark:text-slate-500">
        Flip the card to reveal SM-2 rating options
      </div>
    );
  }

  const intervals = getEstimatedIntervals(sm2Record);

  const buttons = [
    {
      id: "again",
      label: "Again",
      subtext: `< ${intervals.again}`,
      badge: intervals.again,
      color: "bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/25",
      key: "1",
      icon: RotateCcw
    },
    {
      id: "hard",
      label: "Hard",
      subtext: `~ ${intervals.hard}`,
      badge: intervals.hard,
      color: "bg-orange-500 hover:bg-orange-600 text-white shadow-orange-500/25",
      key: "2",
      icon: ThumbsUp
    },
    {
      id: "good",
      label: "Good",
      subtext: `+ ${intervals.good}`,
      badge: intervals.good,
      color: "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/25",
      key: "3",
      icon: Zap
    },
    {
      id: "easy",
      label: "Easy",
      subtext: `+ ${intervals.easy}`,
      badge: intervals.easy,
      color: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/25",
      key: "4",
      icon: Sparkles
    }
  ];

  return (
    <div className="space-y-2 max-w-lg mx-auto animate-in fade-in slide-in-from-bottom-2 duration-200">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {buttons.map((btn) => {
          const Icon = btn.icon;
          return (
            <button
              key={btn.id}
              onClick={() => onRate(btn.id)}
              className={`flex flex-col items-center justify-center py-3 px-2 rounded-2xl shadow-md transition-all duration-150 active:scale-95 ${btn.color}`}
            >
              <div className="flex items-center gap-1.5 font-black text-sm">
                <Icon className="w-3.5 h-3.5" />
                <span>{btn.label}</span>
              </div>
              <span className="text-[10px] font-bold opacity-80 mt-0.5">
                Next: {btn.badge}
              </span>
            </button>
          );
        })}
      </div>

      <div className="text-center text-[11px] text-slate-400 dark:text-slate-500 font-medium">
        Keyboard hotkeys: <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[10px]">1</kbd> Again &bull; <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[10px]">2</kbd> Hard &bull; <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[10px]">3</kbd> Good &bull; <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[10px]">4</kbd> Easy
      </div>
    </div>
  );
}
