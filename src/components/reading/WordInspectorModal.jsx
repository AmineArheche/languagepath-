import React, { useState, useEffect } from "react";
import { Plus, Check, Tag } from "lucide-react";
import { Modal } from "../common/Modal";
import { Button } from "../common/Button";
import { AudioButton } from "../common/AudioButton";
import { Badge } from "../common/Badge";
import { useProgress } from "../../context/ProgressContext";
import { playSound } from "../../utils/soundEffects";

export function WordInspectorModal({
  isOpen,
  onClose,
  wordData,
  readingTitle = "Reading",
  readingLevel = "A1"
}) {
  const { addCustomFlashcard, allFlashcards, recordTappedWord } = useProgress();
  const [isAdded, setIsAdded] = useState(false);

  const rawWord = wordData?.cleanWord || wordData?.word;

  // Automatically remember tapped words for future SRS reviews
  useEffect(() => {
    if (isOpen && wordData && recordTappedWord) {
      recordTappedWord({
        cleanWord: rawWord,
        article: wordData.article || null,
        english: wordData.english || "",
        plural: wordData.plural || "-",
        sentence: wordData.sentence || "",
        level: readingLevel
      });
    }
    setIsAdded(false);
  }, [isOpen, rawWord, wordData, readingLevel, recordTappedWord]);

  if (!wordData) return null;

  const isAlreadyInDeck =
    isAdded ||
    allFlashcards.some(
      (c) => c.german?.toLowerCase() === rawWord?.toLowerCase()
    );

  const handleAddFlashcard = () => {
    addCustomFlashcard({
      german: rawWord,
      article: wordData.article || null,
      english: wordData.english || "Word from reading",
      plural: wordData.plural || "-",
      exampleDe: wordData.sentence || `Beispiel: ${rawWord}`,
      exampleEn: "",
      level: readingLevel,
      unit: `Reading: ${readingTitle}`,
      tags: ["reading-word", readingLevel]
    });

    setIsAdded(true);
    playSound.correct();
  };

  const genderLabel =
    wordData.article === "der"
      ? "Maskulin (der)"
      : wordData.article === "die"
      ? "Feminin (die)"
      : wordData.article === "das"
      ? "Neutral (das)"
      : null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Vocabulary Word Inspector"
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        {/* Word Display Box */}
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-center">
          <div className="flex items-center justify-center gap-2 mb-2 flex-wrap">
            {wordData.article ? (
              <Badge gender={wordData.article} size="sm">
                <span className="font-black">{genderLabel}</span>
              </Badge>
            ) : (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                Wort
              </span>
            )}
            <span className="inline-flex items-center gap-1 text-[11px] font-black px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 uppercase">
              <Tag className="w-3 h-3" />
              CEFR {readingLevel}
            </span>
          </div>

          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {wordData.article ? `${wordData.article} ` : ""}
            {rawWord}
          </h2>

          {wordData.plural && wordData.plural !== "-" && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Plural: <span className="font-bold text-slate-700 dark:text-slate-200">{wordData.plural}</span>
            </p>
          )}

          <div className="mt-3 flex justify-center">
            <AudioButton
              text={`${wordData.article ? wordData.article + " " : ""}${rawWord}`}
              size="md"
            />
          </div>
        </div>

        {/* Translation Card */}
        <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60">
          <span className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-300 tracking-wider block mb-1">
            English Translation:
          </span>
          <p className="text-lg font-black text-slate-900 dark:text-white">
            {wordData.english}
          </p>
        </div>

        {/* Context Sentence */}
        {wordData.sentence && (
          <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
            <span className="font-bold text-slate-400 text-[10px] uppercase block">
              Context in this text:
            </span>
            <p className="italic text-slate-700 dark:text-slate-300">
              "{wordData.sentence}"
            </p>
          </div>
        )}

        {/* Action Button: Add to Flashcards */}
        <div className="pt-2 flex justify-end gap-2.5">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>

          <Button
            variant={isAlreadyInDeck ? "secondary" : "primary"}
            disabled={isAlreadyInDeck}
            onClick={handleAddFlashcard}
            icon={isAlreadyInDeck ? Check : Plus}
          >
            {isAlreadyInDeck ? "In Flashcards ✓" : "Add to Deck"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
