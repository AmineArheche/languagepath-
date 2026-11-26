/**
 * src/services/errorLedger.js
 *
 * Centralized Error Ledger & Pedagogical Diagnostics Service for DeutschPath.
 * Captures errors across all modules (Grammar, Reading, Hören, Writing, Conversation, Gender Drill)
 * in a unified schema with recency-weighted exponential decay (~14-day half-life).
 *
 * Powers:
 * 1. WeakSpotsView (ranked by recency-weighted error rate, not lifetime average)
 * 2. Auto-creation of "Fix this" SRS cards for vocabulary and gender mistakes
 * 3. Recommendation of 5-item targeted drills from grammarExercises by ruleId
 * 4. Dashboard analytics showing Top 3 Error Patterns This Week with trend arrows
 */

import { getDb, safeDbWrite, broadcastDbChange } from "../storage/db";
import { translateCategoryLabel, translateCategoryRationale } from "./translationService";

/**
 * Shared Category Taxonomy Enum
 */
export const ERROR_CATEGORIES = {
  ARTICLE_GENDER: "article-gender",
  CASE: "case", // subcategories: nom, akk, dat, gen
  VERB_POSITION: "verb-position", // subcategories: V2, verb-end
  CONJUGATION: "conjugation",
  TENSE: "tense", // subcategories: Perfekt, Präteritum
  PREPOSITION: "preposition",
  WORD_ORDER: "word-order", // subcategories: TeKaMoLo
  CONNECTOR: "connector",
  SPELLING: "spelling",
  VOCABULARY: "vocabulary",
  COMPREHENSION_KEYWORD_TRAP: "comprehension-keyword-trap",
  COMPREHENSION_NEGATION: "comprehension-negation",
  COMPREHENSION_DETAIL: "comprehension-detail"
};

export const ERROR_HALF_LIFE_DAYS = 14;

/**
 * Human-readable label mapping for error categories with i18n support
 */
export function formatCategoryLabel(category, lang = null) {
  try {
    const localized = translateCategoryLabel(category, lang);
    if (localized && localized !== category) return localized;
  } catch {
    // fallback
  }
  const map = {
    "article-gender": "Article & Noun Gender",
    "case": "Case Endings (Nom/Akk/Dat/Gen)",
    "verb-position": "Verb Position (V2 / Verb-End)",
    "conjugation": "Verb Conjugation",
    "tense": "Tense (Perfekt / Präteritum)",
    "preposition": "Prepositions & Cases",
    "word-order": "Word Order (TeKaMoLo)",
    "connector": "Conjunctions & Connectors",
    "spelling": "Orthography & Spelling",
    "vocabulary": "Vocabulary Selection",
    "comprehension-keyword-trap": "Comprehension: Keyword Trap",
    "comprehension-negation": "Comprehension: Negation Trap",
    "comprehension-detail": "Comprehension: Detail Matching"
  };
  return map[category] || category || "General Mistake";
}

/**
 * Pedagogical rationale mapping for error categories with i18n support
 */
export function formatCategoryRationale(category, lang = null) {
  try {
    const rationale = translateCategoryRationale(category, lang);
    if (rationale) return rationale;
  } catch {
    // fallback
  }
  return "Review the relevant German grammar rule.";
}

/**
 * Calculates exponential decay recency weight:
 * w(t) = 2^(-t / 14)
 * where t is elapsed days since error occurred.
 *
 * @param {string|number|Date} timestamp
 * @param {Date} [referenceDate=new Date()]
 * @returns {number} Weight in range (0, 1]
 */
export function calculateRecencyWeight(timestamp, referenceDate = new Date()) {
  if (!timestamp) return 1.0;
  const errorTime = new Date(timestamp).getTime();
  const refTime = new Date(referenceDate).getTime();
  const diffDays = Math.max(0, (refTime - errorTime) / (1000 * 60 * 60 * 24));
  return Math.pow(2, -diffDays / ERROR_HALF_LIFE_DAYS);
}

/**
 * Normalizes and validates an error record against the required schema:
 * { id, timestamp, module, level, category, subcategory, learnerText, correct, ruleId, itemId }
 *
 * @param {Object} raw
 * @returns {Object}
 */
export function formatErrorRecord(raw) {
  return {
    id: raw.id || `err-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    timestamp: raw.timestamp || new Date().toISOString(),
    module: raw.module || "grammar", // grammar | reading | hoeren | writing | conversation | gender-drill
    level: raw.level || "A1",
    category: raw.category || ERROR_CATEGORIES.GRAMMAR || "grammar",
    subcategory: raw.subcategory || "general",
    learnerText: String(raw.learnerText || "").trim(),
    correct: String(raw.correct || "").trim(),
    ruleId: raw.ruleId || "general-rule",
    itemId: raw.itemId || "item-unknown",
    // Optional metadata preserved for SRS auto-card creation
    word: raw.word || null,
    english: raw.english || null,
    plural: raw.plural || null,
    article: raw.article || null
  };
}

/**
 * Persists an error into IndexedDB errorLedger store
 * @param {Object} errorInput
 * @returns {Promise<Object>} Formatted error entry
 */
export async function logErrorToStorage(errorInput) {
  const record = formatErrorRecord(errorInput);
  try {
    const db = await getDb();
    await db.add("errorLedger", record);
    broadcastDbChange("ERROR_LOGGED", { id: record.id, category: record.category });
  } catch (err) {
    console.warn("Could not write error to errorLedger store:", err);
  }
  return record;
}

/**
 * Ranks grammar weak spots by recency-weighted error score:
 * sum(w_i) where w_i = 2^(-t_i / 14)
 *
 * @param {Array} errors - Array of error entries
 * @param {Date} [now=new Date()]
 * @returns {Array<{ ruleId: string, category: string, label: string, weightedScore: number, errorCount: number, lastErrorDate: string }>}
 */
export function rankWeakSpotsByRecency(errors = [], now = new Date()) {
  if (!errors || errors.length === 0) return [];

  const groups = new Map();

  for (const err of errors) {
    const key = err.ruleId || err.subcategory || err.category;
    if (!groups.has(key)) {
      groups.set(key, {
        ruleId: err.ruleId || key,
        category: err.category,
        label: err.subcategory && err.subcategory !== "general" ? `${formatCategoryLabel(err.category)} (${err.subcategory})` : formatCategoryLabel(err.category),
        weightedScore: 0,
        errorCount: 0,
        lastErrorDate: err.timestamp,
        sampleMistake: err.learnerText,
        sampleCorrect: err.correct
      });
    }

    const group = groups.get(key);
    const weight = calculateRecencyWeight(err.timestamp, now);
    group.weightedScore += weight;
    group.errorCount += 1;

    if (new Date(err.timestamp).getTime() > new Date(group.lastErrorDate).getTime()) {
      group.lastErrorDate = err.timestamp;
      group.sampleMistake = err.learnerText;
      group.sampleCorrect = err.correct;
    }
  }

  const results = Array.from(groups.values()).map((g) => ({
    ...g,
    weightedScore: Number(g.weightedScore.toFixed(2))
  }));

  // Sort descending by recency-weighted score
  results.sort((a, b) => b.weightedScore - a.weightedScore || b.errorCount - a.errorCount);
  return results;
}

/**
 * Creates an SRS "Fix this" flashcard from a vocabulary or article-gender error
 *
 * @param {Object} errorEntry
 * @returns {Object} Valid Flashcard item
 */
export function createFixThisCard(errorEntry) {
  const isGender = errorEntry.category === ERROR_CATEGORIES.ARTICLE_GENDER;
  const word = errorEntry.word || errorEntry.itemId || errorEntry.correct;
  const cleanWord = String(word).replace(/^(der|die|das)\s+/i, "").trim();

  const slug = cleanWord
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]/g, "");

  const id = `fix-${slug}-${Date.now().toString(36).slice(-4)}`;
  const article = isGender ? errorEntry.correct : (errorEntry.article || null);
  const english = errorEntry.english || `Review mistake: ${cleanWord}`;

  return {
    id,
    level: errorEntry.level || "A1",
    topic: "Fix This (Mistake Review)",
    tags: ["fix-this", errorEntry.category, errorEntry.ruleId || "error-fix"],
    source: "error-ledger-auto",
    reviewedBy: "ai",
    german: cleanWord,
    article: article,
    gender: article === "der" ? "masculine" : article === "die" ? "feminine" : article === "das" ? "neuter" : null,
    english,
    plural: errorEntry.plural || "-",
    exampleDe: `Fix this: Was ist die richtige Form von '${cleanWord}'? (Dein Fehler: '${errorEntry.learnerText}')`,
    exampleEn: `Correct answer: '${errorEntry.correct}'`
  };
}

/**
 * Recommends 5 targeted grammar exercises matching recent weak ruleIds
 *
 * @param {Array} errors - List of errors from errorLedger
 * @param {Array} allGrammarExercises - Full pool of available exercises
 * @param {number} [count=5]
 * @returns {Array} 5 recommended exercises
 */
export function recommendDrillExercises(errors = [], allGrammarExercises = [], count = 5) {
  if (!allGrammarExercises || allGrammarExercises.length === 0) return [];

  const rankedSpots = rankWeakSpotsByRecency(errors);
  const targetKeys = rankedSpots.map((r) => r.ruleId.toLowerCase());

  const matched = [];
  const seenIds = new Set();

  // Match by exercise topic or rule
  for (const key of targetKeys) {
    for (const ex of allGrammarExercises) {
      if (seenIds.has(ex.id)) continue;
      const topic = (ex.topic || "").toLowerCase();
      const topicLabel = (ex.topicLabel || "").toLowerCase();
      if (topic.includes(key) || key.includes(topic) || topicLabel.toLowerCase().includes(key)) {
        matched.push(ex);
        seenIds.add(ex.id);
        if (matched.length >= count) return matched;
      }
    }
  }

  // Fallback: fill remaining with other exercises
  for (const ex of allGrammarExercises) {
    if (!seenIds.has(ex.id)) {
      matched.push(ex);
      seenIds.add(ex.id);
      if (matched.length >= count) break;
    }
  }

  return matched.slice(0, count);
}

/**
 * Calculates top 3 error patterns over the current week (past 7 days)
 * compared to the prior week (7-14 days ago) to determine trend arrows.
 *
 * @param {Array} errors
 * @param {Date} [now=new Date()]
 * @param {number} [topN=3]
 * @returns {Array<{ category: string, label: string, thisWeekCount: number, priorWeekCount: number, trend: 'up'|'down'|'steady', weightedScore: number }>}
 */
export function getTopWeeklyErrorPatterns(errors = [], now = new Date(), topN = 3) {
  const nowMs = now.getTime();
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;
  const SEVEN_DAYS_MS = 7 * ONE_DAY_MS;
  const FOURTEEN_DAYS_MS = 14 * ONE_DAY_MS;

  const currentWeekCounts = {};
  const priorWeekCounts = {};
  const weightedScores = {};

  for (const err of errors) {
    if (!err || !err.timestamp) continue;
    const errTime = new Date(err.timestamp).getTime();
    const ageMs = nowMs - errTime;
    const cat = err.category || ERROR_CATEGORIES.ARTICLE_GENDER;

    // Recency weight
    const weight = calculateRecencyWeight(err.timestamp, now);
    weightedScores[cat] = (weightedScores[cat] || 0) + weight;

    if (ageMs >= 0 && ageMs < SEVEN_DAYS_MS) {
      currentWeekCounts[cat] = (currentWeekCounts[cat] || 0) + 1;
    } else if (ageMs >= SEVEN_DAYS_MS && ageMs < FOURTEEN_DAYS_MS) {
      priorWeekCounts[cat] = (priorWeekCounts[cat] || 0) + 1;
    }
  }

  const allCategories = Array.from(
    new Set([...Object.keys(currentWeekCounts), ...Object.keys(weightedScores)])
  );

  const patterns = allCategories.map((cat) => {
    const thisWeek = currentWeekCounts[cat] || 0;
    const priorWeek = priorWeekCounts[cat] || 0;
    let trend = "steady";
    if (thisWeek > priorWeek) trend = "up";
    else if (thisWeek < priorWeek) trend = "down";

    return {
      category: cat,
      label: formatCategoryLabel(cat),
      thisWeekCount: thisWeek,
      priorWeekCount: priorWeek,
      trend, // 'up' | 'down' | 'steady'
      weightedScore: Number((weightedScores[cat] || 0).toFixed(2))
    };
  });

  // Sort descending by this week's frequency, then weighted score
  patterns.sort((a, b) => b.thisWeekCount - a.thisWeekCount || b.weightedScore - a.weightedScore);
  return patterns.slice(0, topN);
}

/**
 * Backward compatibility alias for getTopWeeklyErrorPatterns
 */
export const getTopErrorPatterns = getTopWeeklyErrorPatterns;
