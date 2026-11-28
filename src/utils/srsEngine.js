/**
 * SuperMemo SM-2 Spaced-Repetition Algorithm Implementation
 * Enhanced with:
 * - In-session learning steps (1m and 10m) before graduation to day intervals
 * - Daily limits (new cards/day, max reviews/day)
 * - Interleaved queue ordering by theme
 * - Leech tracking and mnemonic prompt threshold (>= 8 lapses)
 * - Card mode checking with umlaut alternative normalization (ae/oe/ue/ss)
 * - Retention analytics and 14-day due forecast
 */

export const SM2_QUALITIES = {
  again: 1,
  hard: 3,
  good: 4,
  easy: 5
};

export const LEECH_THRESHOLD = 8;
export const LEARNING_STEPS_MINUTES = [1, 10]; // Step 0: 1m, Step 1: 10m
export const DEFAULT_NEW_CARDS_PER_DAY = 15;
export const DEFAULT_MAX_REVIEWS_PER_DAY = 100;

/**
 * Returns a Date set to the start of the local calendar day (00:00:00.000)
 * @param {Date|string|number} [date=new Date()]
 * @returns {Date}
 */
export function getStartOfLocalDay(date = new Date()) {
  const d = new Date(date);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
}

/**
 * Calculates next review timestamp as the start of the local calendar day + interval days
 * @param {number} interval
 * @param {Date|string|number} [fromDate=new Date()]
 * @returns {string} ISO string
 */
export function getNextReviewDate(interval, fromDate = new Date()) {
  const startOfLocal = getStartOfLocalDay(fromDate);
  startOfLocal.setDate(startOfLocal.getDate() + interval);
  return startOfLocal.toISOString();
}

/**
 * Creates initial SM-2 review metadata for a card
 * @param {string} cardId
 * @returns {Object}
 */
export function createInitialCardRecord(cardId) {
  if (!cardId) {
    throw new Error("cardId is required to create an initial card record");
  }
  return {
    cardId,
    repetitions: 0,
    interval: 0,
    easeFactor: 2.5,
    lapses: 0,
    isLeech: false,
    state: "new", // "new" | "learning" | "review"
    stepIndex: 0, // 0 = 1m, 1 = 10m, null when graduated
    mnemonic: null,
    nextReviewDate: getStartOfLocalDay().toISOString(),
    inSessionDueMs: null,
    lastReviewed: null,
    history: []
  };
}

/**
 * Calculates updated SM-2 parameters and next review date (pure SM-2 day intervals)
 * @param {string} cardId - Explicit card identifier
 * @param {Object|null|undefined} currentRecord - Existing card SM-2 state
 * @param {'again' | 'hard' | 'good' | 'easy'} rating - User performance rating
 * @returns {Object} updated record
 */
export function calculateSM2Review(cardId, currentRecord, rating) {
  if (!cardId) {
    throw new Error("cardId is required for calculateSM2Review");
  }

  if (!rating || typeof rating !== "string" || !(rating in SM2_QUALITIES)) {
    throw new Error(
      `Invalid SM-2 rating: "${rating}". Expected one of: ${Object.keys(SM2_QUALITIES).join(", ")}`
    );
  }

  const record = currentRecord
    ? { ...currentRecord, cardId }
    : createInitialCardRecord(cardId);

  const q = SM2_QUALITIES[rating];
  const now = new Date();

  let repetitions = record.repetitions || 0;
  let interval = record.interval || 0;
  let easeFactor = typeof record.easeFactor === "number" ? record.easeFactor : 2.5;
  let lapses = record.lapses || 0;

  // 1. Calculate new Ease Factor (EF)
  const deltaEF = 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02);
  easeFactor = Math.max(1.3, Number((easeFactor + deltaEF).toFixed(3)));

  // 2. Calculate interval, repetitions, and lapses based on quality
  if (q < 3) {
    // Again / Failed
    repetitions = 0;
    interval = 1;
    lapses += 1;
  } else {
    // Correct (Hard, Good, Easy)
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = q === 3 ? 3 : 6;
    } else {
      if (q === 3) {
        // Hard: 1.2x dampening
        interval = Math.max(interval + 1, Math.round(interval * 1.2));
      } else if (q === 4) {
        // Good: standard EF progression
        interval = Math.max(interval + 1, Math.round(interval * easeFactor));
      } else if (q === 5) {
        // Easy: 1.3x bonus multiplier
        interval = Math.max(interval + 2, Math.round(interval * easeFactor * 1.3));
      }
    }
    repetitions += 1;
  }

  const isLeech = lapses >= LEECH_THRESHOLD;
  const nextReviewDate = getNextReviewDate(interval, now);

  record.repetitions = repetitions;
  record.interval = interval;
  record.easeFactor = easeFactor;
  record.lapses = lapses;
  record.isLeech = isLeech;
  record.lastReviewed = now.toISOString();
  record.nextReviewDate = nextReviewDate;

  if (!record.history) record.history = [];
  record.history.push({
    date: now.toISOString(),
    rating,
    interval,
    easeFactor,
    lapses,
    isLeech
  });

  return record;
}

/**
 * Processes a card review with in-session learning steps:
 * Learning steps: [1, 10] minutes
 * - If card is in learning (new or failed):
 *   - 'again': reset to step 0 (1 min delay in-session).
 *   - 'hard': repeat current step (1 min or 10 min).
 *   - 'good':
 *       - if step 0 -> advance to step 1 (10 min delay in-session).
 *       - if step 1 -> graduate! calls calculateSM2Review with 1-day interval.
 *   - 'easy': immediately graduate to day interval (e.g. 4 days).
 * - If card is in review (graduated):
 *   - 'again': lapses! lapses += 1, card falls back into learning step 0 (1 min delay).
 *   - 'hard', 'good', 'easy': standard SM-2 calculation.
 *
 * @param {string} cardId
 * @param {Object|null} currentRecord
 * @param {'again' | 'hard' | 'good' | 'easy'} rating
 * @param {Date} [now=new Date()]
 * @returns {Object}
 */
export function processLearningStepReview(cardId, currentRecord, rating, now = new Date()) {
  const record = currentRecord ? { ...currentRecord, cardId } : createInitialCardRecord(cardId);
  const q = SM2_QUALITIES[rating];
  if (!q) {
    throw new Error(`Invalid SM-2 rating: "${rating}"`);
  }

  const nowMs = now.getTime();
  const isLearning = record.state === "learning" || (!record.lastReviewed && record.repetitions === 0);

  if (isLearning) {
    if (rating === "again") {
      const lapses = (record.lapses || 0) + (record.repetitions > 0 ? 1 : 0);
      const isLeech = lapses >= LEECH_THRESHOLD;
      return {
        ...record,
        cardId,
        state: "learning",
        stepIndex: 0,
        inSessionDueMs: nowMs + LEARNING_STEPS_MINUTES[0] * 60 * 1000,
        nextReviewDate: new Date(nowMs + LEARNING_STEPS_MINUTES[0] * 60 * 1000).toISOString(),
        lapses,
        isLeech,
        lastReviewed: now.toISOString()
      };
    }

    if (rating === "hard") {
      const stepIdx = record.stepIndex || 0;
      const mins = LEARNING_STEPS_MINUTES[stepIdx];
      return {
        ...record,
        cardId,
        state: "learning",
        stepIndex: stepIdx,
        inSessionDueMs: nowMs + mins * 60 * 1000,
        nextReviewDate: new Date(nowMs + mins * 60 * 1000).toISOString(),
        lastReviewed: now.toISOString()
      };
    }

    if (rating === "good") {
      const currentStep = record.stepIndex || 0;
      if (currentStep === 0) {
        // Advance to step 1 (10 minutes)
        return {
          ...record,
          cardId,
          state: "learning",
          stepIndex: 1,
          inSessionDueMs: nowMs + LEARNING_STEPS_MINUTES[1] * 60 * 1000,
          nextReviewDate: new Date(nowMs + LEARNING_STEPS_MINUTES[1] * 60 * 1000).toISOString(),
          lastReviewed: now.toISOString()
        };
      } else {
        // Graduate from Step 1 to Day Interval (1 day)
        const graduated = calculateSM2Review(cardId, { ...record, repetitions: 0, interval: 0 }, "good");
        return {
          ...graduated,
          state: "review",
          stepIndex: null,
          inSessionDueMs: null
        };
      }
    }

    if (rating === "easy") {
      // Immediately graduate with bonus interval (4 days)
      const graduated = calculateSM2Review(cardId, { ...record, repetitions: 0, interval: 0 }, "easy");
      const interval = 4;
      return {
        ...graduated,
        interval,
        nextReviewDate: getNextReviewDate(interval, now),
        state: "review",
        stepIndex: null,
        inSessionDueMs: null
      };
    }
  }

  // Card was already in "review" state
  if (rating === "again") {
    // Lapse! Re-enter learning steps at step 0 (1 min)
    const lapses = (record.lapses || 0) + 1;
    const isLeech = lapses >= LEECH_THRESHOLD;
    return {
      ...record,
      cardId,
      state: "learning",
      stepIndex: 0,
      repetitions: 0,
      interval: 0,
      lapses,
      isLeech,
      inSessionDueMs: nowMs + LEARNING_STEPS_MINUTES[0] * 60 * 1000,
      nextReviewDate: new Date(nowMs + LEARNING_STEPS_MINUTES[0] * 60 * 1000).toISOString(),
      lastReviewed: now.toISOString()
    };
  }

  // Standard graduated review (hard, good, easy)
  const sm2Result = calculateSM2Review(cardId, record, rating);
  return {
    ...sm2Result,
    state: "review",
    stepIndex: null,
    inSessionDueMs: null
  };
}

/**
 * Checks if a card is due on or before the given calendar day
 * @param {Object} record - Card SM-2 record
 * @param {Date|string|number} [today=new Date()] - Reference calendar day
 * @returns {boolean}
 */
export function isDue(record, today = new Date()) {
  if (!record || !record.nextReviewDate) return true;
  const compareDate = new Date(today);
  const endOfToday = new Date(
    compareDate.getFullYear(),
    compareDate.getMonth(),
    compareDate.getDate(),
    23,
    59,
    59,
    999
  );
  return new Date(record.nextReviewDate) <= endOfToday;
}

export function isCardDue(cardRecord, today = new Date()) {
  return isDue(cardRecord, today);
}

/**
 * Estimates the upcoming interval for each rating option
 */
export function getEstimatedIntervals(record) {
  const currentInterval = record?.interval || 0;
  const currentReps = record?.repetitions || 0;
  const currentEF = record?.easeFactor || 2.5;
  const state = record?.state || (currentReps > 0 ? "review" : "new");
  const stepIndex = record?.stepIndex ?? 0;

  if (state === "learning" || state === "new") {
    return {
      again: "1m",
      hard: stepIndex === 0 ? "1m" : "10m",
      good: stepIndex === 0 ? "10m" : "1d",
      easy: "4d"
    };
  }

  return {
    again: "1m",
    hard: currentReps === 0 ? "1d" : `${Math.max(1, Math.round(currentInterval * 1.2))}d`,
    good: currentReps === 0 ? "1d" : currentReps === 1 ? "6d" : `${Math.round(currentInterval * currentEF)}d`,
    easy: currentReps === 0 ? "4d" : currentReps === 1 ? "7d" : `${Math.round(currentInterval * currentEF * 1.3)}d`
  };
}

/**
 * Interleaves an array of items grouped by their theme/topic.
 * Uses round-robin selection to prevent blocked theme practice.
 *
 * @param {Array} items
 * @returns {Array}
 */
export function interleaveByTheme(items) {
  if (!items || items.length <= 1) return items ? [...items] : [];

  const groups = new Map();
  for (const item of items) {
    const theme = item.topic || item.unit || item.category || "General";
    if (!groups.has(theme)) {
      groups.set(theme, []);
    }
    groups.get(theme).push(item);
  }

  const result = [];
  const groupIterators = Array.from(groups.values());
  let hasMore = true;
  let index = 0;

  while (hasMore) {
    hasMore = false;
    for (const group of groupIterators) {
      if (index < group.length) {
        result.push(group[index]);
        hasMore = true;
      }
    }
    index++;
  }

  return result;
}

/**
 * Builds the daily study queue respecting daily limits:
 * - Order: Due reviews first, then New cards.
 * - Both due reviews and new cards are interleaved by theme.
 *
 * @param {Array} allCards - Full inventory of flashcards
 * @param {Object} srsMap - Record map { [cardId]: SM2Record }
 * @param {Object} [options]
 * @param {number} [options.newCardsLimit=15] - Max new cards per day
 * @param {number} [options.maxReviewsLimit=100] - Max reviews per day
 * @param {Date|string|number} [options.today=new Date()]
 * @returns {{ queue: Array, dueCount: number, newCount: number, totalDueUncapped: number, totalNewUncapped: number }}
 */
export function buildStudyQueue(allCards = [], srsMap = {}, options = {}) {
  const {
    newCardsLimit = DEFAULT_NEW_CARDS_PER_DAY,
    maxReviewsLimit = DEFAULT_MAX_REVIEWS_PER_DAY,
    today = new Date()
  } = options;

  const dueReviews = [];
  const newCards = [];

  for (const card of allCards) {
    const record = srsMap[card.id];
    if (record && record.lastReviewed) {
      if (isDue(record, today)) {
        dueReviews.push(card);
      }
    } else {
      newCards.push(card);
    }
  }

  // Apply daily limits
  const limitedDue = dueReviews.slice(0, maxReviewsLimit);
  const limitedNew = newCards.slice(0, newCardsLimit);

  // Interleave each subgroup by theme
  const interleavedDue = interleaveByTheme(limitedDue);
  const interleavedNew = interleaveByTheme(limitedNew);

  return {
    queue: [...interleavedDue, ...interleavedNew],
    dueCount: limitedDue.length,
    newCount: limitedNew.length,
    totalDueUncapped: dueReviews.length,
    totalNewUncapped: newCards.length
  };
}

/**
 * Normalizes German input string, accepting umlaut alternatives (ae/oe/ue/ss)
 * and stripping extra whitespace and punctuation.
 *
 * @param {string} input
 * @returns {string}
 */
export function normalizeGermanAnswer(input) {
  if (!input || typeof input !== "string") return "";
  return input
    .trim()
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[.,/#!$%^&*;:{}=\-_`~()?]/g, "")
    .replace(/\s+/g, " ");
}

/**
 * Checks learner's typed answer against card headword and article.
 * Accepts exact matches and standard umlaut alternatives (ae/oe/ue).
 *
 * @param {string} userInput
 * @param {Object} card
 * @returns {{ isCorrect: boolean, headwordCorrect: boolean, articleMissing: boolean, expected: string }}
 */
export function checkCardAnswer(userInput, card) {
  const rawWord = card.word || card.german || "";
  const normUser = normalizeGermanAnswer(userInput);
  const normHeadword = normalizeGermanAnswer(rawWord);
  const normArticle = card.article ? normalizeGermanAnswer(card.article) : "";
  const expectedFull = normArticle ? `${normArticle} ${normHeadword}` : normHeadword;

  const isExactWithArticle = normUser === expectedFull;
  const isHeadwordOnly = normUser === normHeadword;

  const isCorrect = card.article ? isExactWithArticle : isHeadwordOnly;
  const articleMissing = Boolean(card.article && isHeadwordOnly);

  return {
    isCorrect,
    headwordCorrect: isExactWithArticle || isHeadwordOnly,
    articleMissing,
    expected: card.article ? `${card.article} ${rawWord}` : rawWord
  };
}

/**
 * Generates a cloze-deleted sentence from example sentence and headword.
 *
 * @param {string} exampleDe
 * @param {string} headword
 * @returns {{ clozeText: string, targetWord: string }}
 */
export function createClozeSentence(exampleDe, headword) {
  if (!exampleDe || !headword) {
    return { clozeText: exampleDe || "", targetWord: headword || "" };
  }

  const cleanHeadword = headword.trim().replace(/^(der|die|das|el|la|los|las|le|un|une|the|a|an)\s+/i, "");
  const regex = new RegExp(`\\b${cleanHeadword}[a-zäöüßéèêëàâôîïûùçñ]*\\b`, "gi");

  let matchFound = false;
  const clozeText = exampleDe.replace(regex, () => {
    matchFound = true;
    return "[ _____ ]";
  });

  return {
    clozeText: matchFound ? clozeText : `[ _____ ]: ${exampleDe}`,
    targetWord: cleanHeadword
  };
}

/**
 * Calculates retention stats from review logs and card records
 *
 * @param {Array} reviewLog - Array of { rating, timestamp, cardId }
 * @param {Object} srsMap - Record map
 * @returns {Object}
 */
export function calculateRetentionStats(reviewLog = [], srsMap = {}) {
  const totalReviews = reviewLog.length;
  let successReviews = 0;

  const ratingCounts = { again: 0, hard: 0, good: 0, easy: 0 };
  for (const entry of reviewLog) {
    if (entry.rating in ratingCounts) {
      ratingCounts[entry.rating]++;
    }
    if (entry.rating === "good" || entry.rating === "easy" || entry.rating === "hard") {
      successReviews++;
    }
  }

  const retentionRate = totalReviews > 0 ? Math.round((successReviews / totalReviews) * 100) : 0;

  // Cards by Maturity
  let learningCount = 0;
  let youngCount = 0;
  let matureCount = 0;
  let leechCount = 0;

  for (const cardId in srsMap) {
    const rec = srsMap[cardId];
    if (rec.isLeech || rec.lapses >= LEECH_THRESHOLD) {
      leechCount++;
    }
    if (rec.repetitions === 0 || rec.state === "learning" || rec.interval < 1) {
      learningCount++;
    } else if (rec.interval < 21) {
      youngCount++;
    } else {
      matureCount++;
    }
  }

  return {
    totalReviews,
    successReviews,
    retentionRate,
    ratingCounts,
    maturity: {
      learning: learningCount,
      young: youngCount,
      mature: matureCount,
      leeches: leechCount
    }
  };
}

/**
 * Computes card review forecast for the next N days (default 14 days)
 *
 * @param {Object} srsMap - Record map
 * @param {number} [daysCount=14]
 * @param {Date|string|number} [startDate=new Date()]
 * @returns {Array<{ dayIndex: number, dateStr: string, label: string, dueCount: number }>}
 */
export function calculateDueForecast(srsMap = {}, daysCount = 14, startDate = new Date()) {
  const forecast = [];
  const startLocal = getStartOfLocalDay(startDate);

  const dayBuckets = new Array(daysCount).fill(0);

  for (const cardId in srsMap) {
    const rec = srsMap[cardId];
    if (!rec || !rec.nextReviewDate) continue;

    const cardDueDate = getStartOfLocalDay(rec.nextReviewDate);
    const diffTime = cardDueDate.getTime() - startLocal.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays >= 0 && diffDays < daysCount) {
      dayBuckets[diffDays]++;
    } else if (diffDays < 0) {
      // Overdue cards are due today (day 0)
      dayBuckets[0]++;
    }
  }

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  for (let i = 0; i < daysCount; i++) {
    const current = new Date(startLocal);
    current.setDate(current.getDate() + i);

    const label = i === 0 ? "Today" : i === 1 ? "Tomorrow" : `${dayNames[current.getDay()]} ${current.getDate()}`;

    forecast.push({
      dayIndex: i,
      dateStr: current.toISOString().split("T")[0],
      label,
      dueCount: dayBuckets[i]
    });
  }

  return forecast;
}
