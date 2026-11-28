import React, { useState } from "react";
import confetti from "canvas-confetti";
import { PenTool, CheckCircle2, RotateCcw, Sparkles, AlertCircle } from "lucide-react";
import { Button } from "../common/Button";
import { playSound } from "../../utils/soundEffects";

/**
 * Interactive "Rewrite one paragraph yourself" coaching component.
 * Encourages active recall and deliberate practice instead of passive reading.
 */
export function RewriteParagraphCard({ originalText = "", level = "A1" }) {
  const [rewriteText, setRewriteText] = useState("");
  const [feedback, setFeedback] = useState(null);

  const wordCount = rewriteText.trim() ? rewriteText.trim().split(/\s+/).filter(Boolean).length : 0;

  const handleCheckRevision = (e) => {
    e.preventDefault();
    if (!rewriteText.trim()) return;

    const trimmed = rewriteText.trim();
    const issues = [];
    const praises = [];

    // 1. Check noun capitalization
    const commonNouns = ["haus", "wohnung", "hund", "katze", "tisch", "kaffee", "urlaub", "arbeit", "zeit", "freund", "party", "miete", "brief"];
    const foundUncapped = commonNouns.filter((n) => new RegExp(`\\b${n}\\b`).test(trimmed));
    if (foundUncapped.length > 0) {
      issues.push(`Capitalize nouns: '${foundUncapped.join(", ")}' should be written with a capital letter.`);
    } else {
      praises.push("Nouns are properly capitalized.");
    }

    // 2. Check V2 position
    const v2Mistake = /(?:^|[.!?]\s+)(Heute|Gestern|Morgen|Am\s+\w+|Leider|Im\s+\w+|Danach|Dann)\s+(ich|du|er|sie|es|wir|ihr)\s+([a-zA-ZäöüÄÖÜß]+)/i.test(trimmed);
    if (v2Mistake) {
      issues.push("Remember the Verb-Second (V2) rule: The verb must come immediately after the time word or adverb (e.g. 'Heute gehe ich' not 'Heute ich gehe').");
    } else {
      praises.push("Sentence structure respects German verb position.");
    }

    // 3. Check connectors
    const connectors = ["weil", "obwohl", "dass", "wenn", "deshalb", "trotzdem", "denn", "aber", "und"];
    const usedConnectors = connectors.filter((c) => new RegExp(`\\b${c}\\b`, "i").test(trimmed));
    if (usedConnectors.length > 0) {
      praises.push(`Great connector usage: ${usedConnectors.join(", ")}.`);
    }

    // 4. Accusative masculine check
    if (/\bein (Kaffee|Hund|Tisch|Urlaub|Termin)\b/.test(trimmed)) {
      issues.push("Masculine direct objects require accusative: use 'einen' instead of 'ein'.");
    }

    const isFlawless = issues.length === 0 && wordCount >= 8;

    if (isFlawless) {
      playSound.fanfare();
      confetti({ particleCount: 60, spread: 55, origin: { y: 0.8 } });
      setFeedback({
        type: "success",
        title: "Ausgezeichnet! Excellent Revision!",
        message: "You successfully applied the corrections. Your revised German is natural, grammatically sound, and demonstrates active mastery.",
        praises
      });
    } else {
      playSound.correct();
      setFeedback({
        type: "needs_work",
        title: "Good Practice Attempt!",
        message: issues.length > 0
          ? "You made solid improvements, but keep these points in mind:"
          : "Keep going! Write a complete sentence or paragraph (at least 8-10 words) to test your active recall.",
        issues,
        praises
      });
    }
  };

  const handleReset = () => {
    setRewriteText("");
    setFeedback(null);
  };

  return (
    <div className="p-5 sm:p-6 rounded-3xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-xs shadow-sm">
            <PenTool className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-amber-800 dark:text-amber-300 uppercase tracking-wider">
                Deliberate Practice
              </span>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 dark:bg-amber-900 dark:text-amber-200">
                Level {level}
              </span>
            </div>
            <h4 className="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5">
              Rewrite One Paragraph Yourself
            </h4>
          </div>
        </div>

        <div className="text-xs font-bold text-slate-400">
          {wordCount} Words
        </div>
      </div>

      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
        Active learning beats passive reading. Choose one problematic sentence or paragraph from your text and rewrite it from memory, incorporating the V2 verb position, connector links, and case endings.
      </p>

      {/* Editor Form */}
      <form onSubmit={handleCheckRevision} className="space-y-3">
        <textarea
          rows={3}
          value={rewriteText}
          onChange={(e) => setRewriteText(e.target.value)}
          placeholder="Schreibe hier deinen verbesserten Absatz auf Deutsch..."
          className="w-full p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-amber-300/80 dark:border-amber-800 text-xs sm:text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 leading-relaxed shadow-2xs"
        />

        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleReset}
            icon={RotateCcw}
          >
            Clear
          </Button>

          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={!rewriteText.trim()}
            icon={Sparkles}
            className="bg-amber-600 hover:bg-amber-700 text-white font-extrabold shadow-sm"
          >
            Check My Revision
          </Button>
        </div>
      </form>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl border text-xs space-y-2 animate-in fade-in duration-200 ${
            feedback.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-100"
              : "bg-white dark:bg-slate-900 border-amber-300 dark:border-amber-800 text-slate-800 dark:text-slate-200"
          }`}
        >
          <div className="flex items-center gap-2 font-black text-xs sm:text-sm">
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
            )}
            <span>{feedback.title}</span>
          </div>

          <p className="font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
            {feedback.message}
          </p>

          {feedback.issues && feedback.issues.length > 0 && (
            <ul className="list-disc list-inside space-y-1 text-[11px] text-rose-700 dark:text-rose-300 font-semibold pl-1">
              {feedback.issues.map((iss, i) => (
                <li key={i}>{iss}</li>
              ))}
            </ul>
          )}

          {feedback.praises && feedback.praises.length > 0 && (
            <ul className="list-disc list-inside space-y-0.5 text-[11px] text-emerald-700 dark:text-emerald-300 font-medium pl-1">
              {feedback.praises.map((prs, i) => (
                <li key={i}>{prs}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
