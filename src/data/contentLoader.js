/**
 * src/data/contentLoader.js
 *
 * Lazy-loads CEFR curriculum, flashcard decks, grammar exercises, and reading texts
 * on-demand using Vite dynamic imports (`import()`).
 * This prevents bundling all A1-B2 units and vocabulary into the initial SPA entry bundle,
 * keeping the initial download size minimal.
 */

// Cache loaded level modules in memory to prevent duplicate network/chunk requests
const levelCache = new Map();
const datasetCache = new Map();

/**
 * Dynamically loads level curriculum data (A1, A2, B1, B2)
 * @param {string} levelId 'A1' | 'A2' | 'B1' | 'B2'
 */
export async function loadLevelCurriculum(levelId) {
  const norm = levelId.toLowerCase();
  if (levelCache.has(norm)) {
    return levelCache.get(norm);
  }

  let data;
  switch (norm) {
    case "a1": {
      const mod = await import("./levels/a1.js");
      data = mod.a1Data;
      break;
    }
    case "a2": {
      const mod = await import("./levels/a2.js");
      data = mod.a2Data;
      break;
    }
    case "b1": {
      const mod = await import("./levels/b1.js");
      data = mod.b1Data;
      break;
    }
    case "b2": {
      const mod = await import("./levels/b2.js");
      data = mod.b2Data;
      break;
    }
    default:
      throw new Error(`Unsupported level: ${levelId}`);
  }

  levelCache.set(norm, data);
  return data;
}

/**
 * Dynamically loads flashcards for a specific CEFR level
 * @param {string} levelId 'A1' | 'A2' | 'B1' | 'B2'
 */
export async function loadFlashcardsByLevel(levelId) {
  const norm = levelId.toLowerCase();
  const cacheKey = `flashcards_${norm}`;
  if (datasetCache.has(cacheKey)) {
    return datasetCache.get(cacheKey);
  }

  let cards = [];
  switch (norm) {
    case "a1": {
      const mod = await import("./flashcardsA1.json");
      cards = mod.default || mod;
      break;
    }
    case "a2": {
      try {
        const mod = await import("./flashcardsA2.json");
        cards = mod.default || mod;
      } catch {
        cards = [];
      }
      break;
    }
    case "b1": {
      try {
        const mod = await import("./flashcardsB1.json");
        cards = mod.default || mod;
      } catch {
        cards = [];
      }
      break;
    }
    case "b2": {
      try {
        const mod = await import("./flashcardsB2.json");
        cards = mod.default || mod;
      } catch {
        cards = [];
      }
      break;
    }
    default:
      cards = [];
  }

  datasetCache.set(cacheKey, cards);
  return cards;
}

/**
 * Dynamically loads grammar exercises for a specific level
 * @param {string} levelId 'A1' | 'A2' | 'B1' | 'B2'
 */
export async function loadGrammarExercisesByLevel(levelId) {
  const norm = levelId.toLowerCase();
  const cacheKey = `grammar_${norm}`;
  if (datasetCache.has(cacheKey)) {
    return datasetCache.get(cacheKey);
  }

  let exercises = [];
  switch (norm) {
    case "a1": {
      const mod = await import("./grammarExercisesA1.json");
      exercises = mod.default || mod;
      break;
    }
    default:
      exercises = [];
  }

  datasetCache.set(cacheKey, exercises);
  return exercises;
}

/**
 * Dynamically loads reading texts, optionally filtered by level
 * @param {string} [levelId]
 */
export async function loadReadingTexts(levelId) {
  const cacheKey = "reading_all";
  let texts = datasetCache.get(cacheKey);
  if (!texts) {
    const mod = await import("./readingTexts.json");
    texts = mod.default || mod;
    datasetCache.set(cacheKey, texts);
  }

  if (!levelId) return texts;
  return texts.filter((t) => t.level?.toUpperCase() === levelId.toUpperCase());
}

/**
 * Clears dynamic content caches (e.g. for testing or fresh reload)
 */
export function clearContentCache() {
  levelCache.clear();
  datasetCache.clear();
}
