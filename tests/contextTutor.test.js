import "fake-indexeddb/auto";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  ContextTutorResponseSchema,
  generateCacheKey,
  getCachedTutorResponse,
  setCachedTutorResponse,
  getDailyQueryStats,
  incrementDailyQueryCount,
  buildContextTutorPrompt,
  getOfflineTutorFallback,
  queryContextTutor,
  DAILY_AI_QUERY_LIMIT
} from "../src/services/contextTutorService";
import { closeDb, resetDbConnection, DB_NAME } from "../src/storage/db";

// Mock localStorage for test environment
const mockStorage = {};
const localStorageMock = {
  getItem: (key) => mockStorage[key] || null,
  setItem: (key, val) => {
    mockStorage[key] = String(val);
  },
  removeItem: (key) => {
    delete mockStorage[key];
  },
  clear: () => {
    Object.keys(mockStorage).forEach((k) => delete mockStorage[k]);
  }
};
globalThis.localStorage = localStorageMock;

describe("ContextTutor - Service, Schema, Hint Ladder & aiCache", () => {
  beforeEach(async () => {
    localStorageMock.clear();
    await closeDb();
    if (globalThis.indexedDB && globalThis.indexedDB.deleteDatabase) {
      await new Promise((resolve) => {
        const req = globalThis.indexedDB.deleteDatabase(DB_NAME);
        req.onsuccess = () => resolve(true);
        req.onerror = () => resolve(false);
        req.onblocked = () => resolve(false);
      });
    }
    resetDbConnection();
  });

  afterEach(async () => {
    await closeDb();
    vi.restoreAllMocks();
  });

  describe("Zod Schema Validation (ContextTutorResponseSchema)", () => {
    it("should accept valid structured tutor responses", () => {
      const valid = {
        explanation: "Der Artikel ist 'das', weil Substantive auf -chen immer neutral sind.",
        highlightSpans: [{ text: "das Mädchen", start: 10, end: 21 }],
        redemittel: [
          {
            de: "Aus diesem Grund...",
            native: "For this reason...",
            useCase: "Reasoning"
          }
        ],
        newWords: [
          {
            german: "Mädchen",
            article: "das",
            english: "girl",
            plural: "die Mädchen"
          }
        ]
      };

      const parsed = ContextTutorResponseSchema.parse(valid);
      expect(parsed.explanation).toBe(valid.explanation);
      expect(parsed.highlightSpans).toHaveLength(1);
      expect(parsed.redemittel[0].de).toBe("Aus diesem Grund...");
      expect(parsed.newWords[0].german).toBe("Mädchen");
    });

    it("should default empty arrays when optional collections are omitted", () => {
      const minimal = {
        explanation: "Only explanation provided"
      };

      const parsed = ContextTutorResponseSchema.parse(minimal);
      expect(parsed.explanation).toBe("Only explanation provided");
      expect(parsed.highlightSpans).toEqual([]);
      expect(parsed.redemittel).toEqual([]);
      expect(parsed.newWords).toEqual([]);
    });

    it("should fail validation if explanation is missing or empty", () => {
      expect(() => ContextTutorResponseSchema.parse({})).toThrow();
      expect(() => ContextTutorResponseSchema.parse({ explanation: "" })).toThrow();
    });
  });

  describe("Cache Key Generation & IndexedDB aiCache", () => {
    it("should generate deterministic cache keys", () => {
      const ctx = {
        type: "reading",
        level: "A1",
        question: "Wo wohnt Max?",
        passage: "Max wohnt in Berlin."
      };

      const key1 = generateCacheKey(ctx, "hint", "");
      const key2 = generateCacheKey(ctx, "hint", "");
      const keyDiffAction = generateCacheKey(ctx, "rule", "");
      const keyDiffQuery = generateCacheKey(ctx, "hint", "Why not A?");

      expect(key1).toBe(key2);
      expect(key1).not.toBe(keyDiffAction);
      expect(key1).not.toBe(keyDiffQuery);
    });

    it("should write and read from IndexedDB aiCache store", async () => {
      const cacheKey = "ai_cache_test_key_1";
      const payload = {
        explanation: "Cached explanation content",
        highlightSpans: [{ text: "Berlin" }],
        redemittel: [],
        newWords: []
      };

      await setCachedTutorResponse(cacheKey, payload);
      const retrieved = await getCachedTutorResponse(cacheKey);

      expect(retrieved).not.toBeNull();
      expect(retrieved.explanation).toBe("Cached explanation content");
      expect(retrieved.highlightSpans[0].text).toBe("Berlin");
    });

    it("should return null for non-existent cache keys", async () => {
      const result = await getCachedTutorResponse("non_existent_key");
      expect(result).toBeNull();
    });
  });

  describe("Daily Query Meter & Rate-Limit Tracking", () => {
    it("should start with 0 queries and default limit", () => {
      const stats = getDailyQueryStats();
      expect(stats.count).toBe(0);
      expect(stats.limit).toBe(DAILY_AI_QUERY_LIMIT);
    });

    it("should correctly increment daily query count", () => {
      const count1 = incrementDailyQueryCount();
      const count2 = incrementDailyQueryCount();
      expect(count1).toBe(1);
      expect(count2).toBe(2);

      const stats = getDailyQueryStats();
      expect(stats.count).toBe(2);
    });
  });

  describe("Hint Ladder Enforcement (Zero-attempt Answer Lockdown)", () => {
    const unattemptedContext = {
      type: "reading",
      level: "A1",
      question: "Was kauft Anna?",
      passage: "Anna kauft einen Apfel.",
      options: ["Einen Apfel", "Ein Buch", "Eine Zeitung"],
      correctAnswer: "Einen Apfel",
      userAnswer: null,
      userDraft: "",
      attemptCount: 0
    };

    it("should enforce STRICT LOCK in prompt when attemptCount === 0", () => {
      const prompt = buildContextTutorPrompt(unattemptedContext, "full_answer", "", "English");
      expect(prompt).toContain("STRICT LOCK: The learner has NOT attempted this exercise yet");
      expect(prompt).toContain("REFUSE to give the final solution");
    });

    it("should permit solution in prompt when attemptCount > 0", () => {
      const attemptedContext = {
        ...unattemptedContext,
        attemptCount: 1,
        userAnswer: "Ein Buch"
      };
      const prompt = buildContextTutorPrompt(attemptedContext, "full_answer", "", "English");
      expect(prompt).not.toContain("STRICT LOCK");
      expect(prompt).toContain("The learner has attempted the question");
    });

    it("should refuse full answer in getOfflineTutorFallback when attemptCount === 0", () => {
      const fallback = getOfflineTutorFallback(unattemptedContext, "full_answer");
      expect(fallback.explanation).toContain("Versuche zuerst, eine Antwort selbstständig zu wählen");
      expect(fallback.highlightSpans).toEqual([]);
    });

    it("should provide full solution in getOfflineTutorFallback when learner has attempted", () => {
      const attemptedContext = {
        ...unattemptedContext,
        attemptCount: 1,
        userAnswer: "Ein Buch"
      };
      const fallback = getOfflineTutorFallback(attemptedContext, "full_answer");
      expect(fallback.explanation).toContain("The correct answer is \"Einen Apfel\"");
    });
  });

  describe("Offline Fallback by Module Type", () => {
    it("should produce module-appropriate guidance for reading", () => {
      const readingCtx = {
        type: "reading",
        level: "A1",
        question: "Um wie viel Uhr beginnt der Kurs?",
        passage: "Der Kurs beginnt um 9 Uhr.",
        attemptCount: 0
      };

      const hint = getOfflineTutorFallback(readingCtx, "hint");
      expect(hint.explanation).toContain("clues");
      const rule = getOfflineTutorFallback(readingCtx, "rule");
      expect(rule.explanation).toContain("reading comprehension");
    });

    it("should produce module-appropriate guidance and Redemittel for schreiben", () => {
      const writingCtx = {
        type: "schreiben",
        level: "A1",
        question: "Schreibe eine Einladung",
        passage: "Schreibe über Ort, Zeit und Essen.",
        userDraft: "Hallo!",
        attemptCount: 1
      };

      const res = getOfflineTutorFallback(writingCtx, "redemittel");
      expect(res.redemittel.length).toBeGreaterThan(0);
      expect(res.redemittel[0].de).toBeDefined();
      expect(res.redemittel[0].native).toBeDefined();
    });

    it("should produce module-appropriate guidance for hoeren", () => {
      const hoerenCtx = {
        type: "hoeren",
        level: "A2",
        question: "Wo treffen sie sich?",
        passage: "Audio script hidden",
        attemptCount: 1
      };

      const hint = getOfflineTutorFallback(hoerenCtx, "hint");
      expect(hint.explanation).toContain("listening");
      expect(hint.newWords.length).toBeGreaterThan(0);
    });

    it("should produce module-appropriate guidance for grammar", () => {
      const grammarCtx = {
        type: "grammar",
        level: "A1",
        question: "Ich gebe ___ Mann das Buch. (der/den/dem)",
        attemptCount: 0
      };

      const rule = getOfflineTutorFallback(grammarCtx, "rule");
      expect(rule.explanation).toContain("grammar rule");
    });
  });

  describe("queryContextTutor Integration & Caching Pipeline", () => {
    it("should return offline fallback without API key and cache the result", async () => {
      const context = {
        type: "reading",
        level: "A1",
        question: "Was trinkt Peter?",
        passage: "Peter trinkt Tee.",
        options: ["Tee", "Kaffee"],
        correctAnswer: "Tee",
        attemptCount: 1,
        userAnswer: "Kaffee"
      };

      // Call 1: uncached offline
      const res1 = await queryContextTutor({
        context,
        actionType: "hint",
        userQuery: "Why not coffee?"
      });

      expect(res1.isOffline).toBe(true);
      expect(res1.fromCache).toBe(false);
      expect(res1.explanation).toBeDefined();

      // Call 2: should hit IndexedDB aiCache instantly
      const res2 = await queryContextTutor({
        context,
        actionType: "hint",
        userQuery: "Why not coffee?"
      });

      expect(res2.fromCache).toBe(true);
      expect(res2.explanation).toBe(res1.explanation);
    });

    it("should strictly block full_answer before API call if attemptCount === 0", async () => {
      const fetchSpy = vi.spyOn(globalThis, "fetch");

      const context = {
        type: "grammar",
        level: "A1",
        question: "Unattempted question",
        correctAnswer: "Option A",
        attemptCount: 0
      };

      const result = await queryContextTutor({
        context,
        actionType: "full_answer",
        apiKey: "test-fake-key"
      });

      // Fetch should never be called because pre-flight blocked it
      expect(fetchSpy).not.toHaveBeenCalled();
      expect(result.explanation).toContain("Versuche zuerst, eine Antwort selbstständig zu wählen");
    });
  });
});
