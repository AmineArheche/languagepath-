import React, { useState, useEffect, useRef, useCallback } from "react";
import confetti from "canvas-confetti";
import {
  Sparkles,
  RefreshCw,
  CheckCircle2,
  ArrowRight,
  Layers,
  Keyboard,
  Headphones,
  FileText
} from "lucide-react";
import { FlashcardItem } from "./FlashcardItem";
import { SRSControls } from "./SRSControls";
import { Button } from "../common/Button";
import { useProgress } from "../../context/ProgressContext";
import { playSound } from "../../utils/soundEffects";

export function FlashcardDeck({ cards = [], onCompleteSession, title = "Review Session" }) {
  const { progress, recordSM2Review, toggleStarCard, getCardSM2Record, saveCardMnemonic } = useProgress();

  // Mode: "flip" | "typing" | "cloze" | "listen"
  const [cardMode, setCardMode] = useState("flip");

  // In-session queue (can be expanded dynamically by learning steps)
  const [sessionCards, setSessionCards] = useState(() => [...cards]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [reviewedCount, setReviewedCount] = useState(0);
  const [graduatedCount, setGraduatedCount] = useState(0);

  // Swipe gesture state
  const [swipeX, setSwipeX] = useState(0);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);

  // Sync session cards when input card array changes
  useEffect(() => {
    setSessionCards([...cards]);
    setCurrentIndex(0);
    setIsFlipped(false);
    setSessionCompleted(false);
    setReviewedCount(0);
    setGraduatedCount(0);
  }, [cards]);

  const currentCard = sessionCards[currentIndex];
  const sm2Record = currentCard ? getCardSM2Record(currentCard.id) : null;

  const handleRate = useCallback(
    async (rating) => {
      if (!currentCard) return;

      if (rating === "good" || rating === "easy") {
        playSound.correct();
      } else {
        playSound.incorrect();
      }

      // Record review using in-session learning steps SM-2
      const updated = await recordSM2Review(currentCard.id, rating);
      setReviewedCount((prev) => prev + 1);

      // Handle in-session queue positioning for learning steps
      const newQueue = [...sessionCards];

      if (updated?.state === "learning") {
        if (rating === "again") {
          // Re-insert 3-4 cards later (or end if fewer remain)
          const insertIdx = Math.min(currentIndex + 4, newQueue.length);
          newQueue.splice(insertIdx, 0, currentCard);
        } else if (rating === "good" && updated?.stepIndex === 1) {
          // 10-minute step: append to the end of the session
          newQueue.push(currentCard);
        } else if (rating === "hard") {
          // Repeat step: insert 4 cards later
          const insertIdx = Math.min(currentIndex + 4, newQueue.length);
          newQueue.splice(insertIdx, 0, currentCard);
        }
        setSessionCards(newQueue);
      } else if (updated?.state === "review") {
        // Card graduated!
        setGraduatedCount((prev) => prev + 1);
      }

      // Advance to next card
      if (currentIndex + 1 < newQueue.length) {
        setIsFlipped(false);
        setCurrentIndex((prev) => prev + 1);
      } else {
        setSessionCompleted(true);
        playSound.fanfare();
        confetti({ particleCount: 120, spread: 75, origin: { y: 0.6 } });
      }
    },
    [currentCard, sessionCards, currentIndex, recordSM2Review]
  );

  // Keyboard navigation: Space flips, 1-4 rates
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't intercept if user is typing in an input/textarea
      const tag = e.target?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea") return;

      if (sessionCompleted || !currentCard) return;

      if (e.code === "Space") {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (isFlipped) {
        if (e.key === "1") handleRate("again");
        else if (e.key === "2") handleRate("hard");
        else if (e.key === "3") handleRate("good");
        else if (e.key === "4") handleRate("easy");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFlipped, currentIndex, sessionCompleted, currentCard, handleRate]);

  // Touch Swipe Handlers
  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    startXRef.current = touch.clientX;
    isDraggingRef.current = true;
  };

  const handleTouchMove = (e) => {
    if (!isDraggingRef.current) return;
    const touch = e.touches[0];
    const dx = touch.clientX - startXRef.current;
    setSwipeX(dx);
  };

  const handleTouchEnd = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;

    if (swipeX > 75) {
      // Swiped right -> Good
      handleRate("good");
    } else if (swipeX < -75) {
      // Swiped left -> Again
      handleRate("again");
    }
    setSwipeX(0);
  };

  const handleRestart = () => {
    setSessionCards([...cards]);
    setCurrentIndex(0);
    setIsFlipped(false);
    setSessionCompleted(false);
    setReviewedCount(0);
    setGraduatedCount(0);
  };

  if (!cards.length) {
    return (
      <div className="text-center py-16 px-4 max-w-md mx-auto">
        <div className="w-16 h-16 mx-auto mb-4 rounded-3xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h3 className="text-2xl font-black text-slate-900 dark:text-white">
          No Cards Due Right Now!
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 mb-6">
          You are all caught up for today. The SM-2 spaced repetition scheduler will notify you when cards are ready for review.
        </p>
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800 text-xs font-bold text-slate-300">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Switch tabs above to practice any deck or add your own cards!</span>
        </div>
      </div>
    );
  }

  if (sessionCompleted) {
    return (
      <div className="text-center py-12 px-4 max-w-md mx-auto animate-in zoom-in-95 duration-300">
        <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20">
          <Sparkles className="w-10 h-10" />
        </div>
        <h3 className="text-2xl font-black text-slate-900 dark:text-white">
          Session Complete!
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 mb-6">
          You reviewed <strong>{reviewedCount}</strong> flashcards.{" "}
          {graduatedCount > 0 && <span>Graduated <strong>{graduatedCount}</strong> cards to multi-day intervals!</span>}
        </p>
        <div className="flex gap-3 justify-center">
          <Button variant="secondary" onClick={handleRestart} icon={RefreshCw}>
            Review Again
          </Button>
          {onCompleteSession && (
            <Button variant="primary" onClick={onCompleteSession} icon={ArrowRight}>
              Back to Roadmap
            </Button>
          )}
        </div>
      </div>
    );
  }

  const isStarred = progress.starredCards?.includes(currentCard.id);

  // Mode button definitions
  const modes = [
    { id: "flip", label: "Flip", icon: Layers },
    { id: "typing", label: "Typing", icon: Keyboard },
    { id: "cloze", label: "Cloze", icon: FileText },
    { id: "listen", label: "Listen & Type", icon: Headphones }
  ];

  return (
    <div className="space-y-4">
      {/* Top Bar: Mode Selector & Progress Bar */}
      <div className="max-w-lg mx-auto px-2 space-y-3">
        {/* Mode Selector Segmented Bar */}
        <div className="flex items-center justify-center p-1 rounded-2xl bg-slate-900 border border-slate-800 text-xs">
          {modes.map((m) => {
            const Icon = m.icon;
            const active = cardMode === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => {
                  setCardMode(m.id);
                  setIsFlipped(false);
                }}
                className={`flex-1 py-1.5 px-2 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all ${
                  active
                    ? "bg-slate-800 text-amber-400 border border-slate-700 shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{m.label}</span>
              </button>
            );
          })}
        </div>

        {/* Card Counter & Queue Tracker */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              Card {currentIndex + 1} of {sessionCards.length}
            </span>
            {sm2Record?.state === "learning" && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                Learning ({sm2Record.stepIndex === 0 ? "1m step" : "10m step"})
              </span>
            )}
          </div>

          <div className="w-32 bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-amber-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / sessionCards.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Touch / Swipe Container */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="transition-transform duration-75"
        style={{
          transform: swipeX !== 0 ? `translateX(${swipeX}px) rotate(${swipeX * 0.04}deg)` : undefined
        }}
      >
        <FlashcardItem
          card={currentCard}
          isFlipped={isFlipped}
          onFlip={() => setIsFlipped((prev) => !prev)}
          isStarred={isStarred}
          onToggleStar={toggleStarCard}
          sm2Record={sm2Record}
          cardMode={cardMode}
          onSaveMnemonic={saveCardMnemonic}
          swipeX={swipeX}
        />
      </div>

      {/* SM-2 Rating Actions */}
      <SRSControls
        onRate={handleRate}
        isVisible={isFlipped}
        sm2Record={sm2Record}
      />
    </div>
  );
}
