import React, { useState } from "react";
import confetti from "canvas-confetti";
import {
  BookOpen,
  ArrowRight,
  SpellCheck,
  Shuffle,
  Bookmark,
  Layers,
  Sparkles,
  Check,
  Plus
} from "lucide-react";
import { useProgress } from "../../context/ProgressContext";
import { formatCategoryLabel } from "../../services/errorLedger";
import { playSound } from "../../utils/soundEffects";
import { Button } from "../common/Button";

/**
 * Mistakes List mapped to the DeutschPath centralized error taxonomy.
 * Provides a 1-click "Make Cards from My Mistakes" button to feed the SRS queue.
 */
export function MistakesList({ mistakes = [], level = "A1" }) {
  const { addCustomFlashcard } = useProgress();
  const [createdCount, setCreatedCount] = useState(null);

  if (!mistakes || mistakes.length === 0) {
    return (
      <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs font-bold text-center">
        No grammatical or spelling mistakes detected in your writing! Outstanding work.
      </div>
    );
  }

  // Group mistakes according to the shared error taxonomy
  const groups = {};

  mistakes.forEach((m) => {
    let cat = (m.category || m.type || "case").toLowerCase();
    // Normalize aliases
    if (cat === "grammar") cat = "case";
    if (cat === "word order") cat = "verb-position";

    if (!groups[cat]) {
      groups[cat] = {
        category: cat,
        label: formatCategoryLabel(cat),
        items: []
      };
    }
    groups[cat].items.push(m);
  });

  const handleMakeCards = () => {
    let count = 0;
    mistakes.forEach((m, idx) => {
      const cleanGerman = m.corrected || m.original;
      const cleanWrong = m.original;

      addCustomFlashcard({
        german: cleanGerman,
        article: m.category === "article-gender" ? (m.corrected.match(/^(der|die|das)\b/i)?.[0]?.toLowerCase() || null) : null,
        english: `Correction: ${cleanWrong} ➔ ${cleanGerman}`,
        plural: "-",
        exampleDe: `Fehlerkorrektur (${formatCategoryLabel(m.category || m.type)}): '${cleanWrong}' ist falsch. Richtig: '${cleanGerman}'`,
        exampleEn: m.explanation || "Review this writing mistake in context.",
        level,
        unit: `Schreiben: ${m.category || "Mistake"}`
      });
      count++;
    });

    setCreatedCount(count);
    playSound.correct();
    confetti({ particleCount: 50, spread: 50, origin: { y: 0.8 } });
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case "article-gender":
      case "case":
        return BookOpen;
      case "verb-position":
      case "word-order":
        return Shuffle;
      case "spelling":
        return SpellCheck;
      case "vocabulary":
        return Bookmark;
      default:
        return Layers;
    }
  };

  const getCategoryBadgeColor = (category) => {
    switch (category) {
      case "article-gender":
        return "border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300";
      case "case":
        return "border-blue-300 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20 text-blue-800 dark:text-blue-300";
      case "verb-position":
      case "word-order":
        return "border-purple-300 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/20 text-purple-800 dark:text-purple-300";
      case "spelling":
        return "border-rose-300 dark:border-rose-800 bg-rose-50/50 dark:bg-rose-950/20 text-rose-800 dark:text-rose-300";
      case "vocabulary":
        return "border-amber-300 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300";
      default:
        return "border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 text-slate-800 dark:text-slate-300";
    }
  };

  return (
    <div className="space-y-4">
      {/* Action Header with "Make cards from my mistakes" button */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-100 dark:border-slate-800">
        <div className="text-xs font-bold text-slate-400">
          <span>Detailed Diagnostics Grouped by Taxonomy ({mistakes.length} Issues):</span>
        </div>

        {/* Make cards from my mistakes Button */}
        <div>
          {createdCount !== null ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold shadow-2xs">
              <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{createdCount} Flashcards Added to Deck!</span>
            </div>
          ) : (
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleMakeCards}
              icon={Plus}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold shadow-sm"
              title="Auto-create spaced-repetition flashcards from these specific writing errors"
            >
              Make Cards from My Mistakes
            </Button>
          )}
        </div>
      </div>

      {/* Categorized Mistake Cards */}
      <div className="space-y-4">
        {Object.entries(groups).map(([catKey, group]) => {
          const Icon = getCategoryIcon(catKey);
          const colorClass = getCategoryBadgeColor(catKey);

          return (
            <div
              key={catKey}
              className={`p-4 rounded-2xl border ${colorClass} space-y-3 shadow-2xs`}
            >
              <div className="flex items-center justify-between font-extrabold text-xs">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{group.label}</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-white dark:bg-slate-900 text-[10px] font-bold shadow-2xs">
                  {group.items.length} {group.items.length === 1 ? "item" : "items"}
                </span>
              </div>

              <div className="space-y-2 pt-1">
                {group.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-white/95 dark:bg-slate-900/95 border border-slate-200/80 dark:border-slate-800 text-xs space-y-1 shadow-2xs"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="line-through text-slate-400 font-medium">
                        "{item.original}"
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span className="font-bold text-emerald-700 dark:text-emerald-300">
                        "{item.corrected}"
                      </span>
                      {item.subcategory && (
                        <span className="text-[10px] font-black uppercase px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                          {item.subcategory}
                        </span>
                      )}
                    </div>

                    {item.explanation && (
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed pt-0.5">
                        <strong className="text-slate-800 dark:text-slate-200 not-italic">Rule: </strong>
                        {item.explanation}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
