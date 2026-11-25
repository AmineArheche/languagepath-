import React, { useState, useEffect } from "react";
import { Star, RotateCw, Volume2, Sparkles, BookOpen, Layers, Check, X, Edit3, Lightbulb, AlertTriangle } from "lucide-react";
import { AudioButton } from "../common/AudioButton";
import { Badge } from "../common/Badge";
import { playSound } from "../../utils/soundEffects";
import { checkCardAnswer, createClozeSentence } from "../../utils/srsEngine";

export function FlashcardItem({
  card,
  isFlipped,
  onFlip,
  isStarred,
  onToggleStar,
  sm2Record,
  cardMode = "flip", // "flip" | "typing" | "cloze" | "listen"
  onSaveMnemonic,
  swipeX = 0
}) {
  const [typedInput, setTypedInput] = useState("");
  const [evalResult, setEvalResult] = useState(null); // { isCorrect, headwordCorrect, articleMissing, expected }
  const [isEditingMnemonic, setIsEditingMnemonic] = useState(false);
  const [mnemonicDraft, setMnemonicDraft] = useState(sm2Record?.mnemonic || "");

  // Reset local typing state on card change or flip back
  useEffect(() => {
    setTypedInput("");
    setEvalResult(null);
    setIsEditingMnemonic(false);
    setMnemonicDraft(sm2Record?.mnemonic || "");
  }, [card?.id, sm2Record?.mnemonic]);

  const handleFlip = () => {
    playSound.flip();
    onFlip();
  };

  const handleCheckTypedAnswer = (e) => {
    if (e) e.preventDefault();
    if (!typedInput.trim()) return;

    const result = checkCardAnswer(typedInput, card);
    setEvalResult(result);

    if (result.isCorrect) {
      playSound.correct();
    } else {
      playSound.incorrect();
    }

    if (!isFlipped) {
      onFlip(); // Flip to show complete explanation & rating buttons
    }
  };

  const handleSaveMnemonicSubmit = (e) => {
    e.preventDefault();
    if (onSaveMnemonic) {
      onSaveMnemonic(card.id, mnemonicDraft);
    }
    setIsEditingMnemonic(false);
  };

  const article = card.article?.toLowerCase();

  // Gender color styling (WCAG AAA compliant text tokens)
  const genderStyles = {
    der: {
      tag: "m.",
      borderFront: "border-blue-400 dark:border-blue-600 shadow-blue-500/10",
      borderBack: "border-blue-400 dark:border-blue-600",
      badgeClass: "bg-blue-700 text-white shadow-sm shadow-blue-500/20",
      glowColor: "from-blue-500/15 via-transparent to-transparent",
      accentText: "text-blue-700 dark:text-blue-300"
    },
    die: {
      tag: "f.",
      borderFront: "border-rose-400 dark:border-rose-600 shadow-rose-500/10",
      borderBack: "border-rose-400 dark:border-rose-600",
      badgeClass: "bg-rose-700 text-white shadow-sm shadow-rose-500/20",
      glowColor: "from-rose-500/15 via-transparent to-transparent",
      accentText: "text-red-700 dark:text-red-300"
    },
    das: {
      tag: "n.",
      borderFront: "border-emerald-400 dark:border-emerald-600 shadow-emerald-500/10",
      borderBack: "border-emerald-400 dark:border-emerald-600",
      badgeClass: "bg-emerald-800 text-white shadow-sm shadow-emerald-500/20",
      glowColor: "from-emerald-500/15 via-transparent to-transparent",
      accentText: "text-emerald-800 dark:text-emerald-300"
    }
  }[article] || {
    tag: "expr.",
    borderFront: "border-slate-200 dark:border-slate-800 shadow-slate-500/5",
    borderBack: "border-amber-500/40",
    badgeClass: "bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-100",
    glowColor: "from-amber-500/10 via-transparent to-transparent",
    accentText: "text-amber-700 dark:text-amber-300"
  };

  const intervalDays = sm2Record?.interval || 0;
  const reps = sm2Record?.repetitions || 0;
  const easeFactor = sm2Record?.easeFactor || 2.5;
  const isLeech = sm2Record?.isLeech || (sm2Record?.lapses || 0) >= 8;

  // Cloze data
  const cloze = createClozeSentence(card.exampleDe, card.german);

  // Dynamic swipe styling
  const swipeGlow =
    swipeX > 40
      ? "ring-4 ring-emerald-500/40 shadow-emerald-500/20"
      : swipeX < -40
      ? "ring-4 ring-rose-500/40 shadow-rose-500/20"
      : "";

  return (
    <div className="w-full max-w-lg mx-auto perspective-1000 select-none">
      <div
        onClick={cardMode === "flip" ? handleFlip : undefined}
        className={`relative w-full min-h-[420px] sm:min-h-[460px] rounded-3xl transition-transform duration-500 transform-style-3d shadow-xl ${
          cardMode === "flip" ? "cursor-pointer" : ""
        } ${isFlipped ? "rotate-y-180" : ""} ${swipeGlow}`}
      >
        {/* Visual Swipe Direction Badges */}
        {swipeX > 50 && (
          <div className="absolute top-6 left-6 z-30 px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-black text-xs shadow-lg animate-in fade-in duration-150 flex items-center gap-1.5">
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Good (Swipe Right)</span>
          </div>
        )}
        {swipeX < -50 && (
          <div className="absolute top-6 right-6 z-30 px-3 py-1.5 rounded-xl bg-rose-600 text-white font-black text-xs shadow-lg animate-in fade-in duration-150 flex items-center gap-1.5">
            <X className="w-4 h-4 stroke-[3]" />
            <span>Again (Swipe Left)</span>
          </div>
        )}

        {/* ================= FRONT OF CARD ================= */}
        <div
          className={`absolute inset-0 backface-hidden bg-slate-900 border-2 ${genderStyles.borderFront} rounded-3xl p-6 sm:p-8 flex flex-col justify-between overflow-hidden`}
        >
          {/* Subtle gender glow accent */}
          <div
            className={`absolute top-0 right-0 left-0 h-32 bg-gradient-to-b ${genderStyles.glowColor} pointer-events-none rounded-t-3xl`}
          />

          {/* Top metadata row */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                {card.level || "A1"}
              </span>

              {card.unit && (
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 max-w-[140px] truncate">
                  {card.unit}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              {/* Leech Flag Badge */}
              {isLeech && (
                <span
                  className="text-[10px] font-bold text-amber-800 dark:text-amber-200 bg-amber-100 dark:bg-amber-950 px-2 py-0.5 rounded-md border border-amber-300 dark:border-amber-700 flex items-center gap-1"
                  title={`Leech card: ${sm2Record?.lapses || 8}+ lapses.`}
                >
                  <AlertTriangle className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                  Leech ({sm2Record?.lapses || 8} lapses)
                </span>
              )}

              {/* SM-2 status badge */}
              <span
                className="text-[10px] font-bold text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-200/60 dark:border-slate-700/60"
                title={`Repetitions: ${reps} | Interval: ${intervalDays}d | Ease: ${easeFactor}`}
              >
                {intervalDays === 0 ? (sm2Record?.state === "learning" ? "Learning" : "New") : `${intervalDays}d`}
              </span>

              <button
                type="button"
                onClick={() => onToggleStar(card.id)}
                className={`p-1.5 rounded-xl transition-colors ${
                  isStarred
                    ? "text-amber-500 bg-amber-50 dark:bg-amber-950/60"
                    : "text-slate-300 dark:text-slate-600 hover:text-slate-500"
                }`}
              >
                <Star className={`w-4 h-4 ${isStarred ? "fill-amber-500" : ""}`} />
              </button>
            </div>
          </div>

          {/* ================= CARD CONTENT BY MODE ================= */}
          <div className="relative z-10 my-auto py-3 text-center">
            {/* 1. FLIP MODE (Standard) */}
            {cardMode === "flip" && (
              <>
                {article ? (
                  <div className="inline-block mb-2">
                    <span
                      className={`text-sm font-black uppercase px-3 py-1 rounded-xl tracking-wider inline-flex items-center gap-1.5 ${genderStyles.badgeClass}`}
                    >
                      <span className="font-mono text-xs opacity-85 lowercase font-semibold">
                        [{genderStyles.tag}]
                      </span>
                      <span>{article}</span>
                    </span>
                  </div>
                ) : (
                  <div className="text-xs font-semibold text-slate-400 dark:text-slate-500 mb-2">
                    (Expression / Word)
                  </div>
                )}

                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
                  {card.german}
                </h2>

                {card.plural && card.plural !== "-" && (
                  <p className="text-xs sm:text-sm font-semibold text-slate-400 dark:text-slate-500">
                    Plural: <span className="font-bold text-slate-600 dark:text-slate-300">{card.plural}</span>
                  </p>
                )}

                <div className="mt-4 flex justify-center" onClick={(e) => e.stopPropagation()}>
                  <AudioButton
                    text={`${card.article ? card.article + " " : ""}${card.german}`}
                    size="lg"
                  />
                </div>
              </>
            )}

            {/* 2. TYPING MODE (Spelling + Article with Umlaut Alternatives) */}
            {cardMode === "typing" && (
              <div onClick={(e) => e.stopPropagation()} className="w-full max-w-sm mx-auto space-y-3">
                <div className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  Type in German with article:
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                  "{card.english}"
                </h3>

                <form onSubmit={handleCheckTypedAnswer} className="space-y-2 pt-2">
                  <input
                    type="text"
                    value={typedInput}
                    onChange={(e) => setTypedInput(e.target.value)}
                    placeholder={card.article ? "e.g. der Tisch (or der tisch)..." : "e.g. bitte..."}
                    className="w-full px-4 py-3 rounded-2xl border-2 border-slate-700 bg-slate-800 text-white font-bold text-center focus:outline-none focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500"
                    autoFocus
                  />
                  <div className="text-[10px] text-slate-400">
                    Umlaut alternatives (<kbd className="font-mono">ae</kbd>, <kbd className="font-mono">oe</kbd>, <kbd className="font-mono">ue</kbd>, <kbd className="font-mono">ss</kbd>) accepted!
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs uppercase tracking-wider transition-all"
                  >
                    Check & Reveal (Press Enter)
                  </button>
                </form>
              </div>
            )}

            {/* 3. CLOZE MODE (Sentence Gap) */}
            {cardMode === "cloze" && (
              <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md mx-auto space-y-3">
                <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Fill in the missing headword:
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-left">
                  <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-relaxed">
                    {cloze.clozeText}
                  </p>
                  <p className="text-xs text-slate-400 mt-2 italic">
                    Meaning: "{card.english}"
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleFlip}
                    className="py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs"
                  >
                    Reveal Answer & Context
                  </button>
                </div>
              </div>
            )}

            {/* 4. LISTEN & TYPE MODE (TTS Transcription) */}
            {cardMode === "listen" && (
              <div onClick={(e) => e.stopPropagation()} className="w-full max-w-sm mx-auto space-y-3">
                <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Listen & Transcribe in German:
                </div>

                <div className="py-2 flex justify-center">
                  <AudioButton
                    text={`${card.article ? card.article + " " : ""}${card.german}`}
                    size="lg"
                  />
                </div>

                <form onSubmit={handleCheckTypedAnswer} className="space-y-2">
                  <input
                    type="text"
                    value={typedInput}
                    onChange={(e) => setTypedInput(e.target.value)}
                    placeholder="Type what you hear..."
                    className="w-full px-4 py-3 rounded-2xl border-2 border-slate-700 bg-slate-800 text-white font-bold text-center focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider"
                  >
                    Check Transcription
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Bottom Flip / Swipe Hint */}
          <div className="relative z-10 flex items-center justify-between text-xs font-semibold text-slate-400 dark:text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="flex items-center gap-1">
              <RotateCw className="w-3.5 h-3.5" />
              <span>Click or Space to flip</span>
            </span>
            <span className="hidden sm:inline text-[11px] text-slate-400 opacity-80">
              Swipe: ➔ Good &bull; ⬅ Again
            </span>
          </div>
        </div>

        {/* ================= BACK OF CARD ================= */}
        <div
          className={`absolute inset-0 backface-hidden rotate-y-180 bg-slate-900 text-white dark:bg-slate-950 border-2 ${genderStyles.borderBack} rounded-3xl p-6 sm:p-8 flex flex-col justify-between overflow-y-auto shadow-2xl`}
        >
          {/* Top Row on Back */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {article && (
                <span className={`text-xs font-black uppercase px-2.5 py-0.5 rounded-lg ${genderStyles.badgeClass}`}>
                  [{genderStyles.tag}] {article}
                </span>
              )}
              <span className="text-sm font-bold text-slate-300">
                {card.german}
              </span>
              {card.plural && card.plural !== "-" && (
                <span className="text-xs text-slate-400">({card.plural})</span>
              )}
            </div>

            <div onClick={(e) => e.stopPropagation()}>
              <AudioButton
                text={`${card.article ? card.article + " " : ""}${card.german}`}
                size="md"
              />
            </div>
          </div>

          {/* Typing Feedback Banner if applicable */}
          {evalResult && (
            <div className="my-2" onClick={(e) => e.stopPropagation()}>
              <div
                className={`p-3 rounded-xl border text-xs font-bold text-center ${
                  evalResult.isCorrect
                    ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-300"
                    : "bg-rose-950/60 border-rose-500/40 text-rose-300"
                }`}
              >
                {evalResult.isCorrect ? (
                  <span>✓ Richtig! Matches "{evalResult.expected}"</span>
                ) : (
                  <div>
                    <span>✕ Not quite. Target: <strong>{evalResult.expected}</strong></span>
                    {evalResult.articleMissing && (
                      <div className="text-[11px] text-amber-300 mt-0.5">
                        💡 Remember the grammatical article ({card.article})!
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Center Meaning & Example */}
          <div className="my-auto py-2 text-center">
            <div className="text-[11px] uppercase font-extrabold text-amber-400 tracking-wider mb-1">
              English Meaning
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white mb-3">
              {card.english}
            </h3>

            {/* Example sentence with audio */}
            {card.exampleDe && (
              <div className="mt-2 p-3.5 rounded-2xl bg-white/5 border border-white/10 text-left">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold text-amber-300">Beispiel (Example):</span>
                  <div onClick={(e) => e.stopPropagation()}>
                    <AudioButton text={card.exampleDe} size="sm" />
                  </div>
                </div>
                <p className="text-sm font-semibold text-slate-100">{card.exampleDe}</p>
                {card.exampleEn && (
                  <p className="text-xs text-slate-400 mt-1 italic">{card.exampleEn}</p>
                )}
              </div>
            )}

            {/* Leech Mnemonic Anchor Section */}
            {(isLeech || sm2Record?.mnemonic) && (
              <div className="mt-3 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-left" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-extrabold text-amber-400 flex items-center gap-1">
                    <Lightbulb className="w-3.5 h-3.5" />
                    Personal Mnemonic Anchor
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsEditingMnemonic(!isEditingMnemonic)}
                    className="text-[10px] text-amber-300 hover:text-white flex items-center gap-1"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>{sm2Record?.mnemonic ? "Edit" : "Add"}</span>
                  </button>
                </div>

                {isEditingMnemonic ? (
                  <form onSubmit={handleSaveMnemonicSubmit} className="space-y-1.5 mt-1">
                    <textarea
                      value={mnemonicDraft}
                      onChange={(e) => setMnemonicDraft(e.target.value)}
                      placeholder="e.g. 'Der Tisch: Imagine a teacher (der) standing on the table...'"
                      rows={2}
                      className="w-full p-2 text-xs rounded-xl bg-slate-800 text-white border border-amber-500/40 focus:outline-none"
                    />
                    <div className="flex justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => setIsEditingMnemonic(false)}
                        className="px-2 py-1 text-[10px] text-slate-400 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-3 py-1 text-[10px] bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg"
                      >
                        Save Mnemonic
                      </button>
                    </div>
                  </form>
                ) : sm2Record?.mnemonic ? (
                  <p className="text-xs text-amber-200 italic font-medium">
                    "{sm2Record.mnemonic}"
                  </p>
                ) : (
                  <p className="text-[11px] text-amber-300/80">
                    This card has lapsed {sm2Record?.lapses || 8} times. Click "Add" above to attach a memory hook!
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Bottom Flip hint */}
          <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
            <span className="flex items-center gap-1">
              <RotateCw className="w-3.5 h-3.5" />
              <span>Click to flip back</span>
            </span>
            <span className="text-[11px] text-slate-400">
              Keys: 1 Again &bull; 2 Hard &bull; 3 Good &bull; 4 Easy
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
