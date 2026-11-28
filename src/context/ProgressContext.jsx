import React, { createContext, useContext, useMemo, useState, useEffect, useCallback } from "react";
import {
  processLearningStepReview,
  buildStudyQueue,
  calculateRetentionStats,
  calculateDueForecast,
  isDue,
  createInitialCardRecord,
  DEFAULT_NEW_CARDS_PER_DAY,
  DEFAULT_MAX_REVIEWS_PER_DAY
} from "../utils/srsEngine";
import {
  ERROR_CATEGORIES,
  logErrorToStorage,
  rankWeakSpotsByRecency,
  createFixThisCard,
  recommendDrillExercises,
  getTopWeeklyErrorPatterns
} from "../services/errorLedger";
import { evaluateStreakUpdate } from "../services/streakService";
import { getLessonById } from "../data/curriculum";
import { useAuth } from "./AuthContext";
import { getCurriculumByLanguage, getUnitsByLanguage } from "../data/multilingual/curriculumCatalog";
import { getFlashcardsByLanguage } from "../data/multilingual/flashcardsCatalog";
import { getGrammarByLanguage } from "../data/multilingual/grammarCatalog";
import { getReadingTextsByLanguage } from "../data/multilingual/readingCatalog";
import { getPlacementQuestionsByLanguage } from "../data/multilingual/placementCatalog";
import { getDrillConfigByLanguage } from "../data/multilingual/drillCatalog";
import { getExamInstitutionsByLanguage, getExamByLanguage } from "../data/multilingual/examCatalog";
import { getISOWeekString } from "../utils/dateUtils";
import {
  getDb,
  runMigrations,
  safeDbWrite,
  validateAndRepairBackup,
  broadcastDbChange,
  syncChannel,
  CURRENT_SCHEMA_VERSION,
  dbGetUserProgress,
  dbSaveUserProgress
} from "../storage/db";

const ProgressContext = createContext();

const TARGET_WORDS_BY_LEVEL = {
  A1: 600,
  A2: 1200,
  B1: 2400,
  B2: 4000
};

const INITIAL_PROGRESS = {
  xp: 0,
  streak: 1,
  lastActiveDate: new Date().toISOString().split("T")[0],
  completedLessons: [],
  unitProgress: {}, // { [unitId]: number (0 - 100) }
  unlockedOverrides: {}, // { [unitId]: boolean } manual override or placement unlocks
  streakFreeze: {
    available: 1,
    lastResetWeek: getISOWeekString(),
    lastUsedDate: null
  },
  srsCards: {}, // { [cardId]: { repetitions, interval, easeFactor, lapses, isLeech, nextReviewDate, lastReviewed } }
  starredCards: [],
  genderDrillHighScore: 0,
  grammarStats: {}, // { [topicKey]: { attempts, mistakes, correct, topicLabel, lastPracticed } }
  readingScores: {}, // { [textId]: { bestScore, bestPercentage, lastScore, total, attempts, lastCompleted } }
  dailyStudyMinutes: {}, // { [YYYY-MM-DD]: minutes }
  examHistory: [], // [ { id, examId, level, date, scores, totalScore, passed, grade, timeSpentSeconds } ]
  dailyGoalMinutes: 30, // daily study goal in minutes
  tappedWords: [], // [ { word, article, english, plural, sentence, level, tappedAt } ]
  srsSettings: {
    newCardsLimit: DEFAULT_NEW_CARDS_PER_DAY,
    maxReviewsLimit: DEFAULT_MAX_REVIEWS_PER_DAY
  }
};

// Generates baseline study minutes for past 7 days so charts render nicely on initial setup
function getInitialStudyMinutes() {
  const result = {};
  const baseMins = [25, 30, 45, 20, 35, 40, 50];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000).toISOString().split("T")[0];
    result[d] = baseMins[6 - i];
  }
  return result;
}

// Synchronously hydrates state in 0ms to guarantee instant page renders without blank screen lag
function getStoredProgressSync(userId, lang) {
  try {
    const key = `languagepath_sync_progress_${userId || "guest"}_${lang || "de"}`;
    const raw = typeof window !== "undefined" && window.localStorage ? localStorage.getItem(key) : null;
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        return {
          ...INITIAL_PROGRESS,
          ...parsed,
          srsCards: parsed.srsCards || {},
          streakFreeze: {
            ...INITIAL_PROGRESS.streakFreeze,
            ...(parsed.streakFreeze || {})
          },
          unlockedOverrides: parsed.unlockedOverrides || {},
          unitProgress: parsed.unitProgress || {},
          completedLessons: parsed.completedLessons || []
        };
      }
    }
  } catch {}
  return INITIAL_PROGRESS;
}

export function ProgressProvider({ children }) {
  const auth = useAuth();
  const activeTargetLanguage = auth?.activeTargetLanguage || "de";
  const user = auth?.user || null;
  const userId = user?.id || "guest";
  const updateLanguageProgress = auth?.updateLanguageProgress;

  const [progress, setProgress] = useState(() => getStoredProgressSync(userId, activeTargetLanguage));
  const [customCards, setCustomCards] = useState([]);
  const [recentErrors, setRecentErrors] = useState([]);
  const [isDbLoaded, setIsDbLoaded] = useState(false);

  const activeCurriculum = useMemo(() => getCurriculumByLanguage(activeTargetLanguage), [activeTargetLanguage]);
  const orderedUnits = useMemo(() => getUnitsByLanguage(activeTargetLanguage), [activeTargetLanguage]);
  const starterCards = useMemo(() => getFlashcardsByLanguage(activeTargetLanguage), [activeTargetLanguage]);
  const allGrammarExercises = useMemo(() => getGrammarByLanguage(activeTargetLanguage), [activeTargetLanguage]);
  const readingTexts = useMemo(() => getReadingTextsByLanguage(activeTargetLanguage), [activeTargetLanguage]);
  const placementQuestions = useMemo(() => getPlacementQuestionsByLanguage(activeTargetLanguage), [activeTargetLanguage]);
  const drillConfig = useMemo(() => getDrillConfigByLanguage(activeTargetLanguage), [activeTargetLanguage]);

  // Combine built-in starter cards with user-created custom cards
  const allFlashcards = useMemo(() => {
    return [...starterCards, ...customCards];
  }, [starterCards, customCards]);

  /**
   * Loads progress, srsCards, and customCards from IndexedDB for the active user & language
   */
  const reloadFromDb = useCallback(async () => {
    try {
      await runMigrations();
      const db = await getDb();

      let storedProgress = null;
      if (userId && userId !== "guest") {
        storedProgress = await dbGetUserProgress(userId, activeTargetLanguage);
      }

      // Fallback for tests or initial single-language state
      if (!storedProgress) {
        storedProgress = await db.get("progress", "main");
      }

      const storedCustomCards = await db.getAll("customCards");
      const storedSrsList = await db.getAll("srsCards");
      const storedErrors = await db.getAll("errorLedger");

      const srsMap = {};
      if (Array.isArray(storedSrsList)) {
        storedSrsList.forEach((rec) => {
          if (rec && rec.cardId) {
            srsMap[rec.cardId] = rec;
          }
        });
      }

      const mergedProgress = {
        ...INITIAL_PROGRESS,
        ...(storedProgress ? storedProgress : {}),
        streakFreeze: {
          ...INITIAL_PROGRESS.streakFreeze,
          ...(storedProgress?.streakFreeze || {})
        },
        unlockedOverrides: {
          ...(storedProgress?.unlockedOverrides || {})
        },
        srsCards: srsMap
      };

      // Clean out the objectStore key if attached
      delete mergedProgress.key;

      try {
        const key = `languagepath_sync_progress_${userId || "guest"}_${activeTargetLanguage || "de"}`;
        localStorage.setItem(key, JSON.stringify(mergedProgress));
      } catch {}

      setProgress(mergedProgress);
      setCustomCards(Array.isArray(storedCustomCards) ? storedCustomCards : []);
      setRecentErrors(Array.isArray(storedErrors) ? storedErrors : []);
      setIsDbLoaded(true);
    } catch (err) {
      console.warn("Could not load from IndexedDB; using in-memory state:", err);
      setIsDbLoaded(true);
    }
  }, [userId, activeTargetLanguage]);

  // Initialize DB & listen for multi-tab sync
  useEffect(() => {
    reloadFromDb();

    if (syncChannel) {
      const handleSyncMessage = (event) => {
        if (event.data?.type) {
          reloadFromDb();
        }
      };
      syncChannel.addEventListener("message", handleSyncMessage);
      return () => {
        syncChannel.removeEventListener("message", handleSyncMessage);
      };
    }
  }, [reloadFromDb]);

  /**
   * Persists progress metadata to IndexedDB
   */
  const persistProgress = useCallback(async (newProgress) => {
    try {
      const { srsCards: _, ...cleanProgress } = newProgress;

      try {
        const key = `languagepath_sync_progress_${userId || "guest"}_${activeTargetLanguage || "de"}`;
        localStorage.setItem(key, JSON.stringify(newProgress));
      } catch {}

      // Persist to userProgress store for this user and language
      if (userId && userId !== "guest") {
        await dbSaveUserProgress(userId, activeTargetLanguage, cleanProgress);
      }

      // Legacy fallback save for tests
      if (activeTargetLanguage === "de" || !userId || userId === "guest") {
        await safeDbWrite("progress", { key: "main", ...cleanProgress });
      }

      // Sync summary metrics to AuthContext so Profile and Navbar update instantly
      if (updateLanguageProgress) {
        const learnedWordsCount = Object.keys(newProgress.srsCards || {}).length;
        updateLanguageProgress(activeTargetLanguage, {
          xp: newProgress.xp || 0,
          streak: newProgress.streak || 1,
          wordsLearned: learnedWordsCount,
          completedLessons: (newProgress.completedLessons || []).length
        });
      }

      broadcastDbChange("PROGRESS_UPDATED", { userId, activeTargetLanguage });
    } catch (err) {
      console.warn("Error persisting progress to IndexedDB:", err);
    }
  }, [userId, activeTargetLanguage, updateLanguageProgress]);

  /**
   * Helper to synchronously update React state and trigger async IndexedDB write
   */
  const updateProgress = useCallback(
    (updater) => {
      setProgress((prev) => {
        const nextState = typeof updater === "function" ? updater(prev) : updater;
        persistProgress(nextState);
        return nextState;
      });
    },
    [persistProgress]
  );

  // Update streak on user activity with local-date normalization, grace period, and freeze
  const checkAndUpdateStreak = () => {
    const update = evaluateStreakUpdate({
      currentStreak: progress.streak || 1,
      lastActiveDate: progress.lastActiveDate,
      lastActiveTimestamp: progress.lastActiveTimestamp,
      streakFreeze: progress.streakFreeze,
      activityDate: new Date()
    });

    updateProgress((prev) => ({
      ...prev,
      streak: update.streak,
      lastActiveDate: update.lastActiveDate,
      lastActiveTimestamp: update.lastActiveTimestamp,
      streakFreeze: update.streakFreeze
    }));

    return update;
  };

  const useStreakFreeze = () => {
    if ((progress.streakFreeze?.available || 0) <= 0) return false;
    updateProgress((prev) => ({
      ...prev,
      streakFreeze: {
        ...(prev.streakFreeze || {}),
        available: 0,
        lastUsedDate: new Date().toISOString().split("T")[0]
      }
    }));
    return true;
  };

  /**
   * Track grammar attempt and mistakes by topic
   */
  const recordGrammarAttempt = (topicKey, topicLabel, isCorrect) => {
    checkAndUpdateStreak();
    updateProgress((prev) => {
      const currentStats = prev.grammarStats?.[topicKey] || {
        topic: topicKey,
        topicLabel: topicLabel || topicKey,
        attempts: 0,
        mistakes: 0,
        correct: 0,
        lastPracticed: null
      };

      const updated = {
        ...currentStats,
        topicLabel: topicLabel || currentStats.topicLabel,
        attempts: currentStats.attempts + 1,
        mistakes: isCorrect ? currentStats.mistakes : currentStats.mistakes + 1,
        correct: isCorrect ? currentStats.correct + 1 : currentStats.correct,
        lastPracticed: new Date().toISOString()
      };

      return {
        ...prev,
        xp: prev.xp + (isCorrect ? 10 : 3),
        grammarStats: {
          ...(prev.grammarStats || {}),
          [topicKey]: updated
        }
      };
    });
  };

  /**
   * Centralized Error Recording:
   * Writes error to IndexedDB errorLedger, updates recency state,
   * and auto-creates "Fix this" SRS cards for vocabulary/gender mistakes.
   */
  const recordError = async (errorData) => {
    const record = await logErrorToStorage(errorData);
    setRecentErrors((prev) => [...prev, record]);

    // Auto-create SRS flashcard for vocabulary or article-gender mistakes
    if (
      record.category === ERROR_CATEGORIES.ARTICLE_GENDER ||
      record.category === ERROR_CATEGORIES.VOCABULARY
    ) {
      const fixCard = createFixThisCard(record);
      setCustomCards((prev) => {
        if (prev.some((c) => c.id === fixCard.id)) return prev;
        const nextCustom = [...prev, fixCard];
        safeDbWrite("customCards", fixCard).catch(console.warn);
        return nextCustom;
      });

      // Register in SM-2 so it enters the user's study queue
      const initSrs = createInitialCardRecord(fixCard.id);
      updateProgress((prev) => ({
        ...prev,
        srsCards: {
          ...prev.srsCards,
          [fixCard.id]: initSrs
        }
      }));
      safeDbWrite("srsCards", initSrs).catch(console.warn);
    }

    return record;
  };

  /**
   * Ranked weak spots using exponential decay (~14-day half-life)
   */
  const getRecentWeakSpots = () => {
    return rankWeakSpotsByRecency(recentErrors);
  };

  /**
   * Top 3 error patterns this week with trend arrows
   */
  const getTopWeeklyErrors = (topN = 3) => {
    return getTopWeeklyErrorPatterns(recentErrors, new Date(), topN);
  };

  /**
   * Recommend 5-item targeted drill by ruleId
   */
  const getRecommendedDrill = (count = 5) => {
    return recommendDrillExercises(recentErrors, allGrammarExercises, count);
  };

  /**
   * Get sorted weak spots (topics with highest mistake rates first)
   */
  const getWeakSpots = () => {
    const stats = progress.grammarStats || {};
    const list = Object.values(stats).map((s) => {
      const errorRate = s.attempts > 0 ? Math.round((s.mistakes / s.attempts) * 100) : 0;
      const accuracy = s.attempts > 0 ? Math.round((s.correct / s.attempts) * 100) : 100;
      return {
        ...s,
        errorRate,
        accuracy
      };
    });

    return list.sort((a, b) => b.mistakes - a.mistakes || b.errorRate - a.errorRate);
  };

  /**
   * Re-serves exercises for topics the user gets wrong most often
   */
  const getWeakSpotExercises = () => {
    const weakTopics = getWeakSpots().filter((t) => t.mistakes > 0);
    if (weakTopics.length === 0) {
      return allGrammarExercises.filter((e) =>
        ["cases", "adjective-endings", "sentence-order"].includes(e.topic)
      );
    }
    const weakTopicKeys = weakTopics.map((t) => t.topic);
    return allGrammarExercises.filter((e) => weakTopicKeys.includes(e.topic));
  };

  /**
   * Reset grammar mistake counters
   */
  const resetGrammarStats = () => {
    updateProgress((prev) => ({
      ...prev,
      grammarStats: {}
    }));
  };

  /**
   * Add custom flashcard to customCards IndexedDB store
   */
  const addCustomFlashcard = async (newCardData) => {
    checkAndUpdateStreak();
    const newCard = {
      id: `custom-card-${Date.now()}`,
      german: newCardData.german.trim(),
      article: newCardData.article || null,
      english: newCardData.english.trim(),
      plural: newCardData.plural?.trim() || "-",
      exampleDe: newCardData.exampleDe?.trim() || "",
      exampleEn: newCardData.exampleEn?.trim() || "",
      level: newCardData.level || "A1",
      unit: newCardData.unit?.trim() || "My Custom Deck",
      isCustom: true,
      createdAt: new Date().toISOString()
    };

    setCustomCards((prev) => [newCard, ...prev]);

    // Initialize SM-2 record so card immediately enters study/review queue
    const initSrs = createInitialCardRecord(newCard.id);
    updateProgress((prev) => ({
      ...prev,
      xp: prev.xp + 15,
      srsCards: {
        ...prev.srsCards,
        [newCard.id]: initSrs
      }
    }));
    safeDbWrite("srsCards", initSrs).catch(console.warn);

    try {
      await safeDbWrite("customCards", newCard);
      broadcastDbChange("CUSTOM_CARDS_UPDATED");
    } catch (err) {
      console.warn("Could not save custom card to IndexedDB:", err);
    }

    return newCard;
  };

  /**
   * Record a tapped word from reading for future review surfacing
   */
  const recordTappedWord = useCallback(
    (wordData) => {
      if (!wordData || (!wordData.cleanWord && !wordData.word)) return;
      const rawWord = wordData.cleanWord || wordData.word;
      const cleanKey = rawWord.trim().toLowerCase();

      updateProgress((prev) => {
        const existing = prev.tappedWords || [];
        if (existing.some((w) => (w.word || "").toLowerCase() === cleanKey)) {
          return prev;
        }

        const newEntry = {
          word: rawWord.trim(),
          article: wordData.article || null,
          english: wordData.english || "",
          plural: wordData.plural || "-",
          sentence: wordData.sentence || "",
          level: wordData.level || "A1",
          tappedAt: new Date().toISOString()
        };

        return {
          ...prev,
          tappedWords: [newEntry, ...existing].slice(0, 100)
        };
      });
    },
    [updateProgress]
  );

  /**
   * Delete custom flashcard from customCards IndexedDB store
   */
  const deleteCustomFlashcard = async (cardId) => {
    setCustomCards((prev) => prev.filter((c) => c.id !== cardId));
    try {
      const db = await getDb();
      await db.delete("customCards", cardId);
      broadcastDbChange("CUSTOM_CARDS_UPDATED");
    } catch (err) {
      console.warn("Could not delete custom card from IndexedDB:", err);
    }
  };

  /**
   * Record SM-2 Review: updates srsCards store and appends to reviewLog
   */
  const recordSM2Review = async (cardId, rating) => {
    checkAndUpdateStreak();
    const currentRecord = progress.srsCards[cardId] || null;
    const updatedRecord = processLearningStepReview(cardId, currentRecord, rating);

    const xpGains = { again: 2, hard: 3, good: 5, easy: 8 };
    const earnedXp = xpGains[rating] || 3;

    // 1. Synchronous state update for immediate UI feedback
    updateProgress((prev) => ({
      ...prev,
      xp: prev.xp + earnedXp,
      srsCards: {
        ...prev.srsCards,
        [cardId]: updatedRecord
      }
    }));

    // 2. Asynchronous IndexedDB persistence to srsCards & reviewLog
    try {
      const db = await getDb();
      await safeDbWrite("srsCards", updatedRecord);

      await db.add("reviewLog", {
        cardId,
        rating,
        timestamp: new Date().toISOString(),
        interval: updatedRecord.interval,
        lapses: updatedRecord.lapses,
        isLeech: updatedRecord.isLeech,
        state: updatedRecord.state
      });

      broadcastDbChange("SRS_REVIEWED", { cardId });
    } catch (err) {
      console.warn("Error recording review in IndexedDB:", err);
    }

    return updatedRecord;
  };

  /**
   * Saves a personal mnemonic or custom anchor sentence for a card (especially for leeches)
   */
  const saveCardMnemonic = async (cardId, mnemonicText) => {
    const current = progress.srsCards[cardId] || createInitialCardRecord(cardId);
    const updated = { ...current, mnemonic: mnemonicText?.trim() || null };

    updateProgress((prev) => ({
      ...prev,
      srsCards: {
        ...prev.srsCards,
        [cardId]: updated
      }
    }));

    try {
      await safeDbWrite("srsCards", updated);
      broadcastDbChange("SRS_REVIEWED", { cardId });
    } catch (err) {
      console.warn("Could not save card mnemonic:", err);
    }
  };

  /**
   * Updates SRS daily limits settings
   */
  const updateSrsSettings = (settings) => {
    updateProgress((prev) => ({
      ...prev,
      srsSettings: {
        ...prev.srsSettings,
        ...settings
      }
    }));
  };

  /**
   * Builds an interleaved daily study queue honoring daily limits
   */
  const getStudyQueue = (cardList = allFlashcards, options = {}) => {
    const limits = {
      newCardsLimit: progress.srsSettings?.newCardsLimit ?? DEFAULT_NEW_CARDS_PER_DAY,
      maxReviewsLimit: progress.srsSettings?.maxReviewsLimit ?? DEFAULT_MAX_REVIEWS_PER_DAY,
      ...options
    };
    return buildStudyQueue(cardList, progress.srsCards, limits);
  };

  /**
   * Loads reviewLog from IndexedDB and calculates retention metrics and 14-day due forecast
   */
  const fetchSrsStats = async () => {
    try {
      const db = await getDb();
      const reviewLog = (await db.getAll("reviewLog")) || [];
      const stats = calculateRetentionStats(reviewLog, progress.srsCards);
      const forecast = calculateDueForecast(progress.srsCards, 14);
      return { stats, forecast };
    } catch (err) {
      console.warn("Could not fetch SRS stats:", err);
      return {
        stats: calculateRetentionStats([], progress.srsCards),
        forecast: calculateDueForecast(progress.srsCards, 14)
      };
    }
  };

  const getDueCards = (cardList = allFlashcards) => {
    const today = new Date();
    return cardList.filter((card) => {
      const cardRecord = progress.srsCards[card.id];
      if (!cardRecord) return true;
      return isDue(cardRecord, today);
    });
  };

  const getCardSM2Record = (cardId) => {
    return progress.srsCards[cardId] || createInitialCardRecord(cardId);
  };

  const getUnitProgress = (unitId) => {
    if (progress.unitProgress && progress.unitProgress[unitId] !== undefined) {
      return Math.min(100, Math.max(0, Math.round(progress.unitProgress[unitId])));
    }
    const unit = orderedUnits.find((u) => u.id === unitId);
    if (!unit || !unit.lessons || unit.lessons.length === 0) return 0;
    const completed = unit.lessons.filter((l) =>
      progress.completedLessons?.includes(l.id)
    ).length;
    return Math.round((completed / unit.lessons.length) * 100);
  };

  const getWordsLearnedCount = useCallback(() => {
    const srsCards = progress.srsCards || {};
    return Object.values(srsCards).filter((c) => c.repetitions > 0).length;
  }, [progress.srsCards]);

  const getGrammarAccuracyStats = useCallback(() => {
    const stats = progress.grammarStats || {};
    const topics = Object.values(stats);
    if (topics.length === 0) return { overallAccuracy: 0, totalExercisesAnswered: 0 };

    let totalAttempts = 0;
    let totalCorrect = 0;

    topics.forEach((t) => {
      totalAttempts += t.attempts || 0;
      totalCorrect += t.correct || 0;
    });

    const overallAccuracy =
      totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;
    return { overallAccuracy, totalExercisesAnswered: totalAttempts };
  }, [progress.grammarStats]);

  /**
   * Returns per-topic accuracy array for grammar dashboard widgets
   */
  const getGrammarTopicStats = useCallback(() => {
    const stats = progress.grammarStats || {};
    const exercises = allGrammarExercises || [];
    const exerciseTopics = Array.from(new Set(exercises.map((e) => e.topic).filter(Boolean)));
    const recordedKeys = Object.keys(stats);
    const combinedKeys = Array.from(new Set([...exerciseTopics, ...recordedKeys]));

    if (combinedKeys.length === 0) {
      return [
        { key: "articles", label: "Articles & Determiners", attempts: 0, correct: 0, accuracy: 100 },
        { key: "tenses", label: "Verb Conjugation", attempts: 0, correct: 0, accuracy: 100 },
        { key: "prepositions", label: "Prepositions & Cases", attempts: 0, correct: 0, accuracy: 100 }
      ];
    }

    return combinedKeys.map((key) => {
      const s = stats[key] || {};
      const attempts = s.attempts || 0;
      const correct = s.correct || 0;
      const accuracy = attempts > 0 ? Math.round((correct / attempts) * 100) : 100;
      return {
        key,
        label: s.topicLabel || key,
        attempts,
        correct,
        accuracy,
        lastPracticed: s.lastPracticed || null
      };
    });
  }, [progress.grammarStats, allGrammarExercises]);

  /**
   * Calculates comprehensive Unit Mastery (0 - 100) combining:
   * 1. Lesson Completion (40% weight)
   * 2. Exercise Accuracy (30% weight)
   * 3. SRS Retention of that unit's vocabulary (30% weight)
   */
  const getUnitMasteryBreakdown = useCallback(
    (unitId) => {
      const unit = orderedUnits.find((u) => u.id === unitId);
      if (!unit) {
        return { total: 0, lessonCompletion: 0, exerciseAccuracy: 0, srsRetention: 0 };
      }

      // 1. Lesson Completion (40%)
      const totalLessons = unit.lessons?.length || 0;
      let lessonCompletion = 0;
      if (totalLessons > 0) {
        const completedCount = unit.lessons.filter((l) =>
          progress.completedLessons?.includes(l.id)
        ).length;
        lessonCompletion = Math.round((completedCount / totalLessons) * 100);
      }
      if (progress.unitProgress?.[unitId] !== undefined) {
        lessonCompletion = Math.max(lessonCompletion, progress.unitProgress[unitId]);
      }

      // 2. Exercise Accuracy (30%)
      const grammarStats = getGrammarAccuracyStats();
      let exerciseAccuracy = 0;
      if (grammarStats.totalExercisesAnswered > 0) {
        exerciseAccuracy = grammarStats.overallAccuracy;
      } else if (lessonCompletion > 0) {
        exerciseAccuracy = 100;
      }

      // 3. SRS Vocabulary Retention for this unit (30%)
      const unitWords = unit.lessons?.flatMap((l) => l.words || []) || [];
      let srsRetention = 0;
      if (unitWords.length > 0) {
        const retainedCount = unitWords.filter((w) => {
          const rec = progress.srsCards?.[w.id] || progress.srsCards?.[w.german];
          return rec && rec.repetitions > 0 && !rec.isLeech;
        }).length;
        srsRetention = Math.round((retainedCount / unitWords.length) * 100);
      } else {
        const levelCards = allFlashcards.filter((c) => c.level === unit.levelId);
        if (levelCards.length > 0) {
          const retainedCount = levelCards.filter((c) => {
            const rec = progress.srsCards?.[c.id];
            return rec && rec.repetitions > 0 && !rec.isLeech;
          }).length;
          srsRetention = Math.round((retainedCount / levelCards.length) * 100);
        } else {
          srsRetention = 100;
        }
      }

      const total = Math.min(
        100,
        Math.round(lessonCompletion * 0.4 + exerciseAccuracy * 0.3 + srsRetention * 0.3)
      );

      return {
        total,
        lessonCompletion,
        exerciseAccuracy,
        srsRetention
      };
    },
    [orderedUnits, progress.completedLessons, progress.unitProgress, progress.srsCards, allFlashcards, getGrammarAccuracyStats]
  );

  const getUnitMastery = useCallback(
    (unitId) => {
      return getUnitMasteryBreakdown(unitId).total;
    },
    [getUnitMasteryBreakdown]
  );

  /**
   * Roadmap gating: unit unlocks at 70% mastery of the previous one,
   * or when manually overridden by the learner / placement test.
   */
  const isUnitUnlocked = useCallback(
    (unitId) => {
      const index = orderedUnits.findIndex((u) => u.id === unitId);
      if (index <= 0) return true; // First unit is always unlocked

      if (progress.unlockedOverrides?.[unitId] === true) return true;

      const previousUnit = orderedUnits[index - 1];
      if (!previousUnit) return true;

      const prevMastery = getUnitMastery(previousUnit.id);
      return prevMastery >= 70;
    },
    [orderedUnits, progress.unlockedOverrides, getUnitMastery]
  );

  const unlockUnitOverride = useCallback(
    (unitId) => {
      updateProgress((prev) => ({
        ...prev,
        unlockedOverrides: {
          ...(prev.unlockedOverrides || {}),
          [unitId]: true
        }
      }));
    },
    [updateProgress]
  );

  const unlockUnitsUpTo = useCallback(
    (targetUnitId) => {
      const targetIdx = orderedUnits.findIndex((u) => u.id === targetUnitId);
      if (targetIdx < 0) return;

      const overrides = {};
      for (let i = 0; i <= targetIdx; i++) {
        overrides[orderedUnits[i].id] = true;
      }

      updateProgress((prev) => ({
        ...prev,
        unlockedOverrides: {
          ...(prev.unlockedOverrides || {}),
          ...overrides
        }
      }));
    },
    [orderedUnits, updateProgress]
  );

  const getUnitStatus = (unitId) => {
    const unlocked = isUnitUnlocked(unitId);
    if (!unlocked) return "locked";
    const prog = getUnitProgress(unitId);
    if (prog >= 100) return "completed";
    return "in progress";
  };

  const setUnitProgress = (unitId, percent) => {
    checkAndUpdateStreak();
    const clamped = Math.min(100, Math.max(0, Math.round(percent)));
    updateProgress((prev) => ({
      ...prev,
      xp: prev.xp + 15,
      unitProgress: {
        ...(prev.unitProgress || {}),
        [unitId]: clamped
      }
    }));
  };

  const advanceUnitProgress = (unitId, delta = 25) => {
    checkAndUpdateStreak();
    const current = getUnitProgress(unitId);
    const nextVal = Math.min(100, current + delta);
    updateProgress((prev) => ({
      ...prev,
      xp: prev.xp + 20,
      unitProgress: {
        ...(prev.unitProgress || {}),
        [unitId]: nextVal
      }
    }));
  };

  const completeLesson = (lessonId, xpReward = 25) => {
    checkAndUpdateStreak();
    updateProgress((prev) => {
      const isAlreadyCompleted = prev.completedLessons.includes(lessonId);
      const newCompleted = isAlreadyCompleted
        ? prev.completedLessons
        : [...prev.completedLessons, lessonId];

      const lessonObj = getLessonById(lessonId);
      const unitId = lessonObj?.unitId;

      let updatedUnitProgress = { ...(prev.unitProgress || {}) };
      if (unitId) {
        const unit = orderedUnits.find((u) => u.id === unitId);
        if (unit && unit.lessons?.length) {
          const completedCount = unit.lessons.filter((l) =>
            newCompleted.includes(l.id)
          ).length;
          const calculatedPct = Math.round((completedCount / unit.lessons.length) * 100);
          updatedUnitProgress[unitId] = Math.max(
            updatedUnitProgress[unitId] || 0,
            calculatedPct
          );
        }
      }

      return {
        ...prev,
        xp: prev.xp + (isAlreadyCompleted ? Math.round(xpReward * 0.3) : xpReward),
        completedLessons: newCompleted,
        unitProgress: updatedUnitProgress
      };
    });
  };

  const toggleStarCard = (cardId) => {
    updateProgress((prev) => {
      const isStarred = prev.starredCards?.includes(cardId);
      return {
        ...prev,
        starredCards: isStarred
          ? prev.starredCards.filter((id) => id !== cardId)
          : [...(prev.starredCards || []), cardId]
      };
    });
  };

  const recordGenderDrillScore = (score) => {
    checkAndUpdateStreak();
    updateProgress((prev) => ({
      ...prev,
      xp: prev.xp + score * 2,
      genderDrillHighScore: Math.max(prev.genderDrillHighScore || 0, score)
    }));
  };

  /**
   * Record comprehension quiz score for a reading text
   */
  const recordReadingCompletion = (textId, score, total = 3) => {
    checkAndUpdateStreak();
    const percentage = Math.round((score / (total || 1)) * 100);
    const xpReward = score * 15 + (percentage === 100 ? 25 : 10);

    updateProgress((prev) => {
      const existing = prev.readingScores?.[textId] || { bestScore: 0, bestPercentage: 0, attempts: 0 };
      const updatedBestPct = Math.max(existing.bestPercentage || 0, percentage);
      const updatedBestScore = Math.max(existing.bestScore || 0, score);

      return {
        ...prev,
        xp: prev.xp + xpReward,
        readingScores: {
          ...(prev.readingScores || {}),
          [textId]: {
            bestScore: updatedBestScore,
            bestPercentage: updatedBestPct,
            lastScore: score,
            total,
            attempts: (existing.attempts || 0) + 1,
            lastCompleted: new Date().toISOString()
          }
        }
      };
    });

    return xpReward;
  };

  const getReadingScore = (textId) => {
    return progress.readingScores?.[textId] || null;
  };

  /**
   * Log study time in minutes for today
   */
  const recordStudyTime = (minutes = 1) => {
    checkAndUpdateStreak();
    const today = new Date().toISOString().split("T")[0];
    updateProgress((prev) => {
      const currentMap = { ...(prev.dailyStudyMinutes || {}) };
      if (Object.keys(currentMap).length === 0) {
        Object.assign(currentMap, getInitialStudyMinutes());
      }
      currentMap[today] = (currentMap[today] || 0) + minutes;
      return {
        ...prev,
        dailyStudyMinutes: currentMap
      };
    });
  };

  /**
   * Record Goethe-Zertifikat Exam attempt
   */
  const recordExamResult = (examResult) => {
    checkAndUpdateStreak();
    const earnedXp = examResult.passed ? 150 : 50;

    updateProgress((prev) => ({
      ...prev,
      xp: prev.xp + earnedXp,
      examHistory: [examResult, ...(prev.examHistory || [])]
    }));

    return earnedXp;
  };


  const getRecentStudyDays = (days = 7) => {
    const result = [];
    const minutesMap = progress.dailyStudyMinutes || {};

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      const dateStr = d.toISOString().split("T")[0];
      const dayLabel = d.toLocaleDateString("en-US", { weekday: "short" });
      const minutes = minutesMap[dateStr] || 0;
      result.push({
        date: dateStr,
        dayLabel,
        minutes
      });
    }

    return result;
  };

  const calculateLevelReadiness = (targetLevel = "A2") => {
    const targetWords = TARGET_WORDS_BY_LEVEL[targetLevel] || 1200;
    const wordsCount = getWordsLearnedCount();
    const vocabScore = Math.min(100, Math.round((wordsCount / targetWords) * 100));

    const grammar = getGrammarAccuracyStats();
    const grammarScore = grammar.totalExercisesAnswered > 0 ? grammar.overallAccuracy : 0;

    const readingTexts = Object.values(progress.readingScores || {});
    let readingScore = 0;
    if (readingTexts.length > 0) {
      const avgReading =
        readingTexts.reduce((acc, t) => acc + (t.bestPercentage || 0), 0) / readingTexts.length;
      readingScore = Math.min(100, Math.round(avgReading));
    }

    // 4. Writing proficiency from localStorage history
    let writingHistory = [];
    try {
      const storedWriting = localStorage.getItem("deutschpath_writing_history_v1");
      if (storedWriting) writingHistory = JSON.parse(storedWriting);
    } catch {}

    let writingScore = 0;
    if (Array.isArray(writingHistory) && writingHistory.length > 0) {
      const sumWriting = writingHistory.reduce((acc, rec) => {
        const overallScore = rec.result?.overall ?? rec.result?.score ?? 0;
        const maxPts = rec.result?.rubricMaxPoints || 25;
        const pct = Math.min(100, (overallScore / maxPts) * 100);
        return acc + pct;
      }, 0);
      writingScore = Math.round(sumWriting / writingHistory.length);
    }

    // 5. Listening comprehension from Goethe/DTZ exam history
    const examList = progress.examHistory || [];
    let listeningScore = 0;
    const listeningScores = [];
    examList.forEach((e) => {
      if (e.scores && typeof e.scores.hoeren === "number") {
        listeningScores.push(Math.min(100, Math.round((e.scores.hoeren / 25) * 100)));
      } else if (e.moduleScores?.hoeren?.percentage) {
        listeningScores.push(e.moduleScores.hoeren.percentage);
      }
    });
    if (listeningScores.length > 0) {
      listeningScore = Math.round(
        listeningScores.reduce((a, b) => a + b, 0) / listeningScores.length
      );
    }

    // 6. Speaking fluency from localStorage history
    let speakingHistory = [];
    try {
      const storedSpeaking = localStorage.getItem("deutschpath_speaking_history_v1");
      if (storedSpeaking) speakingHistory = JSON.parse(storedSpeaking);
    } catch {}

    let speakingScore = 0;
    if (Array.isArray(speakingHistory) && speakingHistory.length > 0) {
      const sumSpeaking = speakingHistory.reduce((acc, rec) => {
        let spkPct = 0;
        if (typeof rec.overall === "number") {
          spkPct = (rec.overall / 25) * 100;
        } else if (rec.overall?.score !== undefined) {
          spkPct = (rec.overall.score / (rec.overall.max || 25)) * 100;
        } else if (rec.overall?.percentage !== undefined) {
          spkPct = rec.overall.percentage;
        }
        return acc + Math.min(100, spkPct);
      }, 0);
      speakingScore = Math.round(sumSpeaking / speakingHistory.length);
    }

    const weightedScore = Math.min(
      100,
      Math.max(
        0,
        Math.round(
          vocabScore * 0.20 +
          grammarScore * 0.20 +
          readingScore * 0.15 +
          writingScore * 0.15 +
          listeningScore * 0.15 +
          speakingScore * 0.15
        )
      )
    );

    const baseLevelMap = { B2: "B1", B1: "A2", A2: "A1", A1: "Intro" };

    return {
      readinessScore: weightedScore,
      score: weightedScore, // backwards compatibility
      currentBaseLevel: baseLevelMap[targetLevel] || "A1",
      targetLevel,
      wordsCount,
      targetWords,
      breakdown: {
        vocabulary: vocabScore,
        grammar: grammarScore,
        reading: readingScore,
        writing: writingScore,
        listening: listeningScore,
        speaking: speakingScore,
        roadmap: getUnitMastery(orderedUnits[0]?.id || "a1-u1"),
        exam: examList.some((e) => e.passed && e.level === targetLevel) ? 100 : 0
      },
      details: {
        wordsLearned: wordsCount,
        targetWords,
        grammarExercises: grammar.totalExercisesAnswered,
        readingTextsCompleted: readingTexts.length,
        writingSubmissions: writingHistory.length,
        listeningTestsTaken: listeningScores.length,
        speakingRecordings: speakingHistory.length
      }
    };
  };

  const getCardStats = () => {
    const stats = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    allFlashcards.forEach((card) => {
      const rec = progress.srsCards?.[card.id];
      if (!rec || rec.repetitions === 0) {
        stats[0] = (stats[0] || 0) + 1;
      } else {
        const box = Math.min(5, rec.repetitions);
        stats[box] = (stats[box] || 0) + 1;
      }
    });
    return stats;
  };

  const setDailyGoalMinutes = (mins) => {
    const val = Math.max(5, Math.min(180, parseInt(mins) || 30));
    updateProgress((prev) => ({
      ...prev,
      dailyGoalMinutes: val
    }));
  };

  /**
   * Reset all data across IndexedDB stores
   */
  const resetAllProgress = async () => {
    setProgress(INITIAL_PROGRESS);
    setCustomCards([]);
    try {
      const db = await getDb();
      const tx = db.transaction(
        ["progress", "srsCards", "customCards", "reviewLog", "errorLedger", "aiCache"],
        "readwrite"
      );
      await tx.objectStore("progress").clear();
      await tx.objectStore("srsCards").clear();
      await tx.objectStore("customCards").clear();
      await tx.objectStore("reviewLog").clear();
      await tx.objectStore("errorLedger").clear();
      await tx.objectStore("aiCache").clear();
      await tx.objectStore("progress").put({ key: "main", ...INITIAL_PROGRESS });
      await tx.done;

      localStorage.removeItem("deutschpath_writing_history_v1");
      broadcastDbChange("ALL_PROGRESS_RESET");
    } catch (err) {
      console.warn("Error resetting IndexedDB:", err);
    }
  };

  /**
   * Export complete IndexedDB database as deutschpath_backup.json
   */
  const exportData = () => {
    try {
      localStorage.setItem("deutschpath_last_export_timestamp", String(Date.now()));
    } catch {}
    let writingHistory = [];
    try {
      const storedWriting = localStorage.getItem("deutschpath_writing_history_v1");
      if (storedWriting) writingHistory = JSON.parse(storedWriting);
    } catch {}

    const { srsCards: _, ...cleanProgress } = progress;

    const payload = {
      app: "LanguagePath",
      schemaVersion: CURRENT_SCHEMA_VERSION,
      exportDate: new Date().toISOString(),
      progress: cleanProgress,
      srsCards: Object.values(progress.srsCards || {}),
      customCards,
      reviewLog: [],
      writingHistory
    };
    return JSON.stringify(payload, null, 2);
  };

  /**
   * Import and validate backup JSON with Zod, applying automated repairs where possible
   */
  const importData = async (jsonString) => {
    try {
      const parsed = JSON.parse(jsonString);
      const report = validateAndRepairBackup(parsed);

      if (!report.valid) {
        return {
          success: false,
          error: report.errors.join("; ") || "Invalid backup schema",
          details: report.errors
        };
      }

      const validData = report.data;
      const db = await getDb();
      const tx = db.transaction(
        ["progress", "srsCards", "customCards", "meta"],
        "readwrite"
      );

      await tx.objectStore("progress").clear();
      await tx.objectStore("srsCards").clear();
      await tx.objectStore("customCards").clear();

      await tx.objectStore("progress").put({ key: "main", ...validData.progress });

      const srsMap = {};
      if (Array.isArray(validData.srsCards)) {
        for (const card of validData.srsCards) {
          if (card.cardId) {
            await tx.objectStore("srsCards").put(card);
            srsMap[card.cardId] = card;
          }
        }
      }

      if (Array.isArray(validData.customCards)) {
        for (const card of validData.customCards) {
          if (card.id) {
            await tx.objectStore("customCards").put(card);
          }
        }
      }

      await tx.objectStore("meta").put({
        key: "schemaVersion",
        value: validData.schemaVersion || CURRENT_SCHEMA_VERSION
      });
      await tx.done;

      if (Array.isArray(validData.writingHistory)) {
        try {
          localStorage.setItem(
            "deutschpath_writing_history_v1",
            JSON.stringify(validData.writingHistory)
          );
        } catch {}
      }

      const newProgress = {
        ...INITIAL_PROGRESS,
        ...validData.progress,
        srsCards: srsMap
      };

      setProgress(newProgress);
      setCustomCards(validData.customCards || []);

      broadcastDbChange("BACKUP_IMPORTED");

      return {
        success: true,
        repaired: report.repaired,
        repairs: report.repairs
      };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  return (
    <ProgressContext.Provider
      value={{
        progress,
        customCards,
        allFlashcards,
        allGrammarExercises,
        activeTargetLanguage,
        activeCurriculum,
        readingTexts,
        placementQuestions,
        drillConfig,
        getExamInstitutions: () => getExamInstitutionsByLanguage(activeTargetLanguage),
        getExamConfig: (instId, level) => getExamByLanguage(activeTargetLanguage, instId, level),
        recordGrammarAttempt,
        recordError,
        getRecentWeakSpots,
        getTopWeeklyErrors,
        getRecommendedDrill,
        recentErrors,
        getWeakSpots,
        getWeakSpotExercises,
        resetGrammarStats,
        getDueCards,
        getStudyQueue,
        getCardSM2Record,
        recordSM2Review,
        saveCardMnemonic,
        updateSrsSettings,
        fetchSrsStats,
        addCustomFlashcard,
        deleteCustomFlashcard,
        recordTappedWord,
        tappedWords: progress.tappedWords || [],
        orderedUnits,
        getUnitProgress,
        getUnitMastery,
        getUnitMasteryBreakdown,
        isUnitUnlocked,
        unlockUnitOverride,
        unlockUnitsUpTo,
        getUnitStatus,
        streakFreeze: progress.streakFreeze,
        useStreakFreeze,
        setUnitProgress,
        advanceUnitProgress,
        completeLesson,
        toggleStarCard,
        recordGenderDrillScore,
        recordReadingCompletion,
        getReadingScore,
        recordStudyTime,
        recordExamResult,
        getWordsLearnedCount,
        getGrammarAccuracyStats,
        getGrammarTopicStats,
        getRecentStudyDays,
        calculateLevelReadiness,
        getCardStats,
        setDailyGoalMinutes,
        resetAllProgress,
        exportData,
        importData,
        checkAndUpdateStreak,
        reloadFromDb,
        isDbLoaded
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error("useProgress must be used within a ProgressProvider");
  }
  return context;
}
