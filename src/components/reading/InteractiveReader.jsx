import React, { useState } from "react";
import { Volume2, VolumeX, Gauge, Sparkles, BookOpen, AlertCircle, X } from "lucide-react";
import { useSpeech } from "../../hooks/useSpeech";
import { WordInspectorModal } from "./WordInspectorModal";
import { Button } from "../common/Button";
import { useExercise } from "../../context/ExerciseContext";

// Common German word translations dictionary fallback for words not in the text's specific glossary
const COMMON_DICTIONARY = {
  hallo: { english: "hello", article: null },
  mein: { english: "my", article: null },
  name: { english: "name", article: "der", plural: "die Namen" },
  ist: { english: "is", article: null },
  und: { english: "and", article: null },
  ich: { english: "I", article: null },
  seit: { english: "since / for", article: null },
  einem: { english: "a / one (dative)", article: null },
  monat: { english: "month", article: "der", plural: "die Monate" },
  in: { english: "in / into", article: null },
  berlin: { english: "Berlin", article: null },
  tag: { english: "day", article: "der", plural: "die Tage" },
  beginnt: { english: "begins / starts", article: null },
  um: { english: "at / around", article: null },
  sieben: { english: "seven", article: null },
  uhr: { english: "o'clock / clock", article: "die", plural: "die Uhren" },
  stehe: { english: "stand / get up", article: null },
  auf: { english: "up / on", article: null },
  trinke: { english: "drink", article: null },
  einen: { english: "a / one (accusative masculine)", article: null },
  heißen: { english: "hot", article: null },
  der: { english: "the (masculine)", article: null },
  die: { english: "the (feminine/plural)", article: null },
  das: { english: "the (neuter)", article: null },
  danach: { english: "afterwards / then", article: null },
  esse: { english: "eat", article: null },
  ein: { english: "a / an", article: null },
  mit: { english: "with", article: null },
  butter: { english: "butter", article: "die" },
  marmelade: { english: "jam / marmalade", article: "die" },
  acht: { english: "eight", article: null },
  nehme: { english: "take", article: null },
  zum: { english: "to the", article: null },
  lese: { english: "read", article: null },
  deutsches: { english: "German", article: null },
  buch: { english: "book", article: "das", plural: "die Bücher" },
  kurs: { english: "course / class", article: "der", plural: "die Kurse" },
  neun: { english: "nine", article: null },
  meine: { english: "my (feminine)", article: null },
  heißt: { english: "is called", article: null },
  frau: { english: "Mrs. / woman", article: "die", plural: "die Frauen" },
  sie: { english: "she / they", article: null },
  sehr: { english: "very", article: null },
  nett: { english: "nice / kind", article: null },
  wir: { english: "we", article: null },
  lernen: { english: "learn / study", article: null },
  neue: { english: "new", article: null },
  wörter: { english: "words", article: "die" },
  üben: { english: "practice", article: null },
  nach: { english: "after / to", article: null },
  dem: { english: "the (dative)", article: null },
  meinen: { english: "my (dative plural)", article: null },
  freunden: { english: "friends", article: "die" },
  park: { english: "park", article: "der", plural: "die Parks" },
  zu: { english: "to / too", article: null },
  mittag: { english: "noon / midday", article: "der" },
  wetter: { english: "weather", article: "das" },
  heute: { english: "today", article: null },
  sonnig: { english: "sunny", article: null },
  warm: { english: "warm", article: null },
  abend: { english: "evening", article: "der", plural: "die Abende" },
  gehe: { english: "go / walk", article: null },
  einkaufen: { english: "to shop / grocery shopping", article: null },
  koche: { english: "cook", article: null },
  eine: { english: "a (feminine)", article: null },
  leckere: { english: "delicious", article: null },
  wunderbare: { english: "wonderful", article: null },
  stadt: { english: "city", article: "die", plural: "die Städte" }
};

export function InteractiveReader({
  readingText,
  activeEvidenceSpan = null,
  onClearEvidence
}) {
  const { speak, stop, isSpeaking, hasGermanVoice, voiceSetupTip } = useSpeech();
  const exerciseState = useExercise();
  const activeHighlightSpans = exerciseState?.activeHighlightSpans || [];
  const highlightPassageSpans = exerciseState?.highlightPassageSpans;
  const [speechRate, setSpeechRate] = useState(1.0); // 1.0 (normal) or 0.75 (slow)
  const [inspectedWord, setInspectedWord] = useState(null);
  const [showVoiceTip, setShowVoiceTip] = useState(false);

  // Compute effective highlight span (either explicit evidence span or AI ContextTutor highlight)
  let effectiveSpan = activeEvidenceSpan;
  if (!effectiveSpan && activeHighlightSpans && activeHighlightSpans.length > 0) {
    const item = activeHighlightSpans[0];
    const targetText = typeof item === "string" ? item : item?.text;
    if (targetText && readingText?.content) {
      const idx = readingText.content.toLowerCase().indexOf(targetText.toLowerCase());
      if (idx !== -1) {
        effectiveSpan = {
          start: idx,
          end: idx + targetText.length,
          text: readingText.content.slice(idx, idx + targetText.length),
          isAiTutor: true
        };
      }
    }
  }

  const handleClearHighlight = () => {
    if (onClearEvidence) onClearEvidence();
    if (highlightPassageSpans) highlightPassageSpans([]);
  };

  const handleTogglePlay = () => {
    if (isSpeaking) {
      stop();
    } else {
      speak(readingText.content, { rate: speechRate });
    }
  };

  const handleSpeedChange = (rate) => {
    setSpeechRate(rate);
    if (isSpeaking) {
      stop();
      speak(readingText.content, { rate });
    }
  };

  // Click on word handler (tap, not hover)
  const handleWordClick = (rawWord, sentenceContext) => {
    // Strip trailing punctuation like .,!?:;"'()
    const cleanWord = rawWord.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g, "").trim();
    if (!cleanWord) return;

    const lowerClean = cleanWord.toLowerCase();

    // 1. Look in text's dedicated vocabulary glossary
    const definedVocab =
      readingText.vocabulary?.[cleanWord] ||
      readingText.vocabulary?.[lowerClean];

    // 2. Fallback to common dictionary
    const fallbackVocab = COMMON_DICTIONARY[lowerClean];

    const finalVocab = definedVocab || fallbackVocab || {
      english: `Word: ${cleanWord}`,
      article: null,
      plural: null
    };

    setInspectedWord({
      cleanWord,
      sentence: sentenceContext,
      ...finalVocab
    });
  };

  // Split content into sentences and tokens
  const sentences = readingText.content.match(/[^.!?]+[.!?]+/g) || [readingText.content];

  // Helper to render interactive words within a text segment
  const renderInteractiveWords = (textSegment, sentenceContext = readingText.content, keyPrefix = "tok") => {
    if (!textSegment) return null;
    const tokens = textSegment.split(" ");
    return tokens.map((token, tIdx) => {
      if (!token) return " ";
      const clean = token.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g, "");
      const isVocabularyTerm =
        clean &&
        (readingText.vocabulary?.[clean] ||
          readingText.vocabulary?.[clean.toLowerCase()]);

      return (
        <span
          key={`${keyPrefix}-${tIdx}`}
          role="button"
          tabIndex={0}
          onClick={() => handleWordClick(token, sentenceContext)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleWordClick(token, sentenceContext);
            }
          }}
          className={`inline-block mx-0.5 px-1 py-0.5 rounded-lg cursor-pointer transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-amber-400 ${isVocabularyTerm
            ? "text-amber-800 dark:text-amber-200 font-bold underline decoration-amber-400 decoration-2 underline-offset-4 hover:bg-amber-100 dark:hover:bg-amber-950/60"
            : "hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-amber-600 dark:hover:text-amber-400"
            }`}
          title="Tap to inspect word translation & add to deck"
        >
          {token}
        </span>
      );
    });
  };

  return (
    <div className="space-y-4">
      {/* Voice Warning Banner (if no German voice detected in browser) */}
      {!hasGermanVoice && (
        <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold">
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>{voiceSetupTip.title}</span>
            </div>
            <button
              onClick={() => setShowVoiceTip(!showVoiceTip)}
              className="text-[11px] font-black underline hover:no-underline"
            >
              {showVoiceTip ? "Hide Tip" : "Setup Instructions"}
            </button>
          </div>
          {showVoiceTip && (
            <ul className="list-disc list-inside space-y-1 pl-1 text-[11px] text-slate-700 dark:text-slate-300">
              {voiceSetupTip.steps.map((step, idx) => (
                <li key={idx}>{step}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Audio Playback Toolbar with Slow / Normal Toggle */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button
            variant={isSpeaking ? "danger" : "primary"}
            size="md"
            onClick={handleTogglePlay}
            icon={isSpeaking ? VolumeX : Volume2}
            className={isSpeaking ? "animate-pulse" : ""}
          >
            {isSpeaking ? "Stop Audio" : "Listen (de-DE)"}
          </Button>

          {/* Speed Toggle (Slow / Normal) */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold">
            <span className="text-[10px] text-slate-400 uppercase px-2 font-black flex items-center gap-1">
              <Gauge className="w-3 h-3" />
              Speed:
            </span>
            <button
              type="button"
              onClick={() => handleSpeedChange(0.75)}
              className={`px-2.5 py-1 rounded-lg transition-all ${speechRate === 0.75
                ? "bg-amber-500 text-white shadow-2xs font-extrabold"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
            >
              0.75x
            </button>
            <button
              type="button"
              onClick={() => handleSpeedChange(1.0)}
              className={`px-2.5 py-1 rounded-lg transition-all ${speechRate === 1.0
                ? "bg-amber-500 text-white shadow-2xs font-extrabold"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
            >
              1.0x
            </button>
          </div>
        </div>

        <div className="text-xs text-slate-400 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Tap any word below for translation & deck addition</span>
        </div>
      </div>

      {/* Active Evidence / AI Tutor Span Callout */}
      {effectiveSpan && effectiveSpan.start !== undefined && (
        <div className="flex items-center justify-between p-3 rounded-2xl bg-amber-100/70 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800/80 text-xs">
          <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-semibold">
            <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
            <span>
              {effectiveSpan.isAiTutor
                ? "AI Tutor passage reference:"
                : "Evidence for answered question highlighted below:"}{" "}
              <strong className="underline">"{effectiveSpan.text}"</strong>
            </span>
          </div>
          <button
            onClick={handleClearHighlight}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            title="Clear Highlight"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Interactive Text Display */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm leading-loose text-base sm:text-lg font-medium text-slate-800 dark:text-slate-100 select-text">
        {effectiveSpan && effectiveSpan.start !== undefined ? (
          <div>
            {renderInteractiveWords(
              readingText.content.slice(0, effectiveSpan.start),
              readingText.content,
              "before"
            )}
            <mark className="bg-amber-200/90 dark:bg-amber-950/90 text-amber-950 dark:text-amber-100 px-2 py-1 rounded-xl border-2 border-amber-400 dark:border-amber-500 shadow-sm mx-1 inline">
              <span className="text-[10px] font-black uppercase tracking-wider bg-amber-500 text-white px-1.5 py-0.5 rounded mr-1.5 inline-block">
                {effectiveSpan.isAiTutor ? "AI Tutor" : "Evidence"}
              </span>
              {renderInteractiveWords(
                readingText.content.slice(effectiveSpan.start, effectiveSpan.end),
                readingText.content,
                "evidence"
              )}
            </mark>
            {renderInteractiveWords(
              readingText.content.slice(effectiveSpan.end),
              readingText.content,
              "after"
            )}
          </div>
        ) : (
          sentences.map((sentence, sIdx) => (
            <span key={sIdx} className="mr-1.5 inline">
              {renderInteractiveWords(sentence.trim(), sentence.trim(), `s-${sIdx}`)}
            </span>
          ))
        )}
      </div>

      {/* Word Inspector Modal */}
      <WordInspectorModal
        isOpen={Boolean(inspectedWord)}
        onClose={() => setInspectedWord(null)}
        wordData={inspectedWord}
        readingTitle={readingText.title}
        readingLevel={readingText.level}
      />
    </div>
  );
}
