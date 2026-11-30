import { describe, it, expect } from "vitest";
import {
  ERROR_CATEGORIES,
  calculateRecencyWeight,
  formatErrorRecord,
  rankWeakSpotsByRecency,
  createFixThisCard,
  recommendDrillExercises,
  getTopWeeklyErrorPatterns,
  formatCategoryLabel,
  ERROR_HALF_LIFE_DAYS
} from "../src/services/errorLedger";

describe("errorLedger Service & Pedagogical Diagnostics Pipeline", () => {
  describe("1. Category Taxonomy (Shared Enum)", () => {
    it("should export all 13 required categories in the shared taxonomy", () => {
      const requiredTaxonomy = [
        "article-gender",
        "case",
        "verb-position",
        "conjugation",
        "tense",
        "preposition",
        "word-order",
        "connector",
        "spelling",
        "vocabulary",
        "comprehension-keyword-trap",
        "comprehension-negation",
        "comprehension-detail"
      ];

      const exportedValues = Object.values(ERROR_CATEGORIES);
      requiredTaxonomy.forEach((cat) => {
        expect(exportedValues).toContain(cat);
      });
      expect(exportedValues.length).toBe(13);
    });

    it("should format readable labels for every category", () => {
      expect(formatCategoryLabel("article-gender")).toContain("Article & Noun Gender");
      expect(formatCategoryLabel("word-order")).toContain("TeKaMoLo");
      expect(formatCategoryLabel("verb-position")).toContain("V2");
      expect(formatCategoryLabel("comprehension-negation")).toContain("Negation Trap");
    });
  });

  describe("2. Error Record Normalization & Schema Validation", () => {
    it("should format raw errors into the mandatory 10-field schema", () => {
      const raw = {
        module: "grammar",
        level: "A1",
        category: ERROR_CATEGORIES.CASE,
        subcategory: "akkusativ",
        learnerText: "Ich sehe der Hund",
        correct: "Ich sehe den Hund",
        ruleId: "cases-accusative",
        itemId: "ex-a1-12"
      };

      const record = formatErrorRecord(raw);
      expect(record.id).toMatch(/^err-/);
      expect(record.timestamp).toBeDefined();
      expect(record.module).toBe("grammar");
      expect(record.level).toBe("A1");
      expect(record.category).toBe("case");
      expect(record.subcategory).toBe("akkusativ");
      expect(record.learnerText).toBe("Ich sehe der Hund");
      expect(record.correct).toBe("Ich sehe den Hund");
      expect(record.ruleId).toBe("cases-accusative");
      expect(record.itemId).toBe("ex-a1-12");
    });

    it("should provide safe defaults for omitted fields", () => {
      const record = formatErrorRecord({});
      expect(record.id).toBeDefined();
      expect(record.timestamp).toBeDefined();
      expect(record.module).toBe("grammar");
      expect(record.level).toBe("A1");
      expect(record.learnerText).toBe("");
      expect(record.correct).toBe("");
      expect(record.ruleId).toBe("general-rule");
      expect(record.itemId).toBe("item-unknown");
    });
  });

  describe("3. Exponential Decay Recency Weighting (~14-Day Half-Life)", () => {
    it("should verify half-life is 14 days", () => {
      expect(ERROR_HALF_LIFE_DAYS).toBe(14);
    });

    it("should assign weight 1.0 to errors occurring right now", () => {
      const now = new Date("2026-11-23T12:00:00Z");
      const weight = calculateRecencyWeight(now.toISOString(), now);
      expect(weight).toBeCloseTo(1.0, 5);
    });

    it("should decay weight to exactly 0.5 after 14 days", () => {
      const now = new Date("2026-11-23T12:00:00Z");
      const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
      const weight = calculateRecencyWeight(fourteenDaysAgo.toISOString(), now);
      expect(weight).toBeCloseTo(0.5, 4);
    });

    it("should decay weight to exactly 0.25 after 28 days", () => {
      const now = new Date("2026-11-23T12:00:00Z");
      const twentyEightDaysAgo = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000);
      const weight = calculateRecencyWeight(twentyEightDaysAgo.toISOString(), now);
      expect(weight).toBeCloseTo(0.25, 4);
    });

    it("should decay weight to exactly 0.125 after 42 days", () => {
      const now = new Date("2026-11-23T12:00:00Z");
      const fortyTwoDaysAgo = new Date(now.getTime() - 42 * 24 * 60 * 60 * 1000);
      const weight = calculateRecencyWeight(fortyTwoDaysAgo.toISOString(), now);
      expect(weight).toBeCloseTo(0.125, 4);
    });
  });

  describe("4. Recency-Weighted Weak Spots Ranking", () => {
    it("should rank recent mistakes higher than older mistakes even if older has higher raw count", () => {
      const now = new Date("2026-11-23T12:00:00Z");
      const fortyDaysAgo = new Date(now.getTime() - 40 * 24 * 60 * 60 * 1000).toISOString();
      const today = now.toISOString();

      // Old topic: 6 errors 40 days ago (raw count = 6, weight = 6 * 2^(-40/14) ≈ 6 * 0.138 ≈ 0.83)
      const oldErrors = Array.from({ length: 6 }).map((_, i) => ({
        id: `err-old-${i}`,
        timestamp: fortyDaysAgo,
        category: ERROR_CATEGORIES.PREPOSITION,
        ruleId: "prepositions-dativ",
        learnerText: "mit der Bus",
        correct: "mit dem Bus"
      }));

      // Recent topic: 2 errors today (raw count = 2, weight = 2 * 1.0 = 2.0)
      const recentErrors = Array.from({ length: 2 }).map((_, i) => ({
        id: `err-rec-${i}`,
        timestamp: today,
        category: ERROR_CATEGORIES.VERB_POSITION,
        ruleId: "verb-position-v2",
        learnerText: "Heute ich gehe ins Kino",
        correct: "Heute gehe ich ins Kino"
      }));

      const ranked = rankWeakSpotsByRecency([...oldErrors, ...recentErrors], now);

      expect(ranked.length).toBe(2);
      // The recent topic MUST be ranked #1 despite fewer total errors
      expect(ranked[0].ruleId).toBe("verb-position-v2");
      expect(ranked[0].weightedScore).toBeGreaterThan(ranked[1].weightedScore);
      expect(ranked[0].errorCount).toBe(2);
      expect(ranked[1].ruleId).toBe("prepositions-dativ");
      expect(ranked[1].errorCount).toBe(6);
    });

    it("should track the latest mistake and correct samples for diagnostics", () => {
      const now = new Date("2026-11-23T12:00:00Z");
      const errors = [
        {
          id: "err-1",
          timestamp: new Date(now.getTime() - 2 * 86400000).toISOString(),
          category: ERROR_CATEGORIES.CASE,
          ruleId: "cases-akk",
          learnerText: "der Tisch",
          correct: "den Tisch"
        },
        {
          id: "err-2",
          timestamp: now.toISOString(),
          category: ERROR_CATEGORIES.CASE,
          ruleId: "cases-akk",
          learnerText: "ein Hund",
          correct: "einen Hund"
        }
      ];

      const ranked = rankWeakSpotsByRecency(errors, now);
      expect(ranked[0].sampleMistake).toBe("ein Hund");
      expect(ranked[0].sampleCorrect).toBe("einen Hund");
    });
  });

  describe("5. Auto-Creation of 'Fix This' SRS Cards", () => {
    it("should generate a valid Flashcard item from an article-gender mistake", () => {
      const errorEntry = {
        category: ERROR_CATEGORIES.ARTICLE_GENDER,
        subcategory: "das",
        word: "Mädchen",
        learnerText: "die",
        correct: "das",
        ruleId: "suffix-chen-das",
        itemId: "maedchen",
        english: "girl",
        plural: "die Mädchen"
      };

      const card = createFixThisCard(errorEntry);
      expect(card.id).toMatch(/^fix-maedchen-/);
      expect(card.german).toBe("Mädchen");
      expect(card.article).toBe("das");
      expect(card.gender).toBe("neuter");
      expect(card.tags).toContain("fix-this");
      expect(card.tags).toContain("article-gender");
      expect(card.tags).toContain("suffix-chen-das");
      expect(card.exampleDe).toContain("Dein Fehler: 'die'");
      expect(card.exampleEn).toContain("das");
    });

    it("should generate a valid Flashcard item from a vocabulary mistake", () => {
      const errorEntry = {
        category: ERROR_CATEGORIES.VOCABULARY,
        subcategory: "word-choice",
        word: "Bekanntschaft",
        learnerText: "Freundschaft",
        correct: "Bekanntschaft",
        ruleId: "vocabulary-friends",
        itemId: "vocab-12",
        english: "acquaintance"
      };

      const card = createFixThisCard(errorEntry);
      expect(card.german).toBe("Bekanntschaft");
      expect(card.tags).toContain("fix-this");
      expect(card.tags).toContain("vocabulary");
      expect(card.exampleDe).toContain("Dein Fehler: 'Freundschaft'");
    });

    it("should strip leading articles when cleaning the headword", () => {
      const errorEntry = {
        category: ERROR_CATEGORIES.ARTICLE_GENDER,
        correct: "der",
        word: "der Tisch",
        learnerText: "das"
      };
      const card = createFixThisCard(errorEntry);
      expect(card.german).toBe("Tisch");
      expect(card.article).toBe("der");
    });
  });

  describe("6. 5-Item Targeted Drill Recommendations", () => {
    const exercisePool = [
      { id: "ex-1", topic: "cases", topicLabel: "Cases (Nom / Akk / Dat)" },
      { id: "ex-2", topic: "cases", topicLabel: "Cases (Nom / Akk / Dat)" },
      { id: "ex-3", topic: "verb-conjugation", topicLabel: "Present Tense Conjugation" },
      { id: "ex-4", topic: "verb-conjugation", topicLabel: "Present Tense Conjugation" },
      { id: "ex-5", topic: "sentence-order", topicLabel: "Sentence Structure & V2" },
      { id: "ex-6", topic: "sentence-order", topicLabel: "Sentence Structure & V2" },
      { id: "ex-7", topic: "prepositions", topicLabel: "Two-way Prepositions" }
    ];

    it("should recommend exactly 5 exercises targeting user's recent errors", () => {
      const errors = [
        {
          timestamp: new Date().toISOString(),
          category: ERROR_CATEGORIES.CASE,
          ruleId: "cases",
          learnerText: "der Hund",
          correct: "den Hund"
        }
      ];

      const drill = recommendDrillExercises(errors, exercisePool, 5);
      expect(drill.length).toBe(5);
      // The first exercises should match the target 'cases' topic
      expect(drill[0].topic).toBe("cases");
      expect(drill[1].topic).toBe("cases");
      // Distinct IDs
      const uniqueIds = new Set(drill.map((d) => d.id));
      expect(uniqueIds.size).toBe(5);
    });

    it("should fall back gracefully to fill 5 items if fewer match target rule", () => {
      const errors = [
        {
          timestamp: new Date().toISOString(),
          category: ERROR_CATEGORIES.CONNECTOR,
          ruleId: "connectors-weil",
          learnerText: "weil ich bin müde",
          correct: "weil ich müde bin"
        }
      ];

      const drill = recommendDrillExercises(errors, exercisePool, 5);
      expect(drill.length).toBe(5);
    });
  });

  describe("7. Top 3 Error Patterns This Week & Trend Arrows", () => {
    const now = new Date("2026-11-23T12:00:00Z");

    it("should detect trend: 'up' when errors increased compared to prior week", () => {
      // 3 errors this week (0-7 days ago), 1 error prior week (7-14 days ago)
      const errors = [
        {
          timestamp: new Date(now.getTime() - 1 * 86400000).toISOString(),
          category: ERROR_CATEGORIES.ARTICLE_GENDER
        },
        {
          timestamp: new Date(now.getTime() - 2 * 86400000).toISOString(),
          category: ERROR_CATEGORIES.ARTICLE_GENDER
        },
        {
          timestamp: new Date(now.getTime() - 3 * 86400000).toISOString(),
          category: ERROR_CATEGORIES.ARTICLE_GENDER
        },
        {
          timestamp: new Date(now.getTime() - 10 * 86400000).toISOString(),
          category: ERROR_CATEGORIES.ARTICLE_GENDER
        }
      ];

      const patterns = getTopWeeklyErrorPatterns(errors, now, 3);
      expect(patterns.length).toBe(1);
      expect(patterns[0].category).toBe("article-gender");
      expect(patterns[0].thisWeekCount).toBe(3);
      expect(patterns[0].priorWeekCount).toBe(1);
      expect(patterns[0].trend).toBe("up");
    });

    it("should detect trend: 'down' when errors decreased compared to prior week", () => {
      // 1 error this week, 4 errors prior week
      const errors = [
        {
          timestamp: new Date(now.getTime() - 2 * 86400000).toISOString(),
          category: ERROR_CATEGORIES.VERB_POSITION
        },
        {
          timestamp: new Date(now.getTime() - 8 * 86400000).toISOString(),
          category: ERROR_CATEGORIES.VERB_POSITION
        },
        {
          timestamp: new Date(now.getTime() - 9 * 86400000).toISOString(),
          category: ERROR_CATEGORIES.VERB_POSITION
        },
        {
          timestamp: new Date(now.getTime() - 11 * 86400000).toISOString(),
          category: ERROR_CATEGORIES.VERB_POSITION
        }
      ];

      const patterns = getTopWeeklyErrorPatterns(errors, now, 3);
      expect(patterns[0].category).toBe("verb-position");
      expect(patterns[0].thisWeekCount).toBe(1);
      expect(patterns[0].priorWeekCount).toBe(3);
      expect(patterns[0].trend).toBe("down");
    });

    it("should detect trend: 'steady' when frequency is identical", () => {
      const errors = [
        {
          timestamp: new Date(now.getTime() - 2 * 86400000).toISOString(),
          category: ERROR_CATEGORIES.SPELLING
        },
        {
          timestamp: new Date(now.getTime() - 9 * 86400000).toISOString(),
          category: ERROR_CATEGORIES.SPELLING
        }
      ];

      const patterns = getTopWeeklyErrorPatterns(errors, now, 3);
      expect(patterns[0].category).toBe("spelling");
      expect(patterns[0].thisWeekCount).toBe(1);
      expect(patterns[0].priorWeekCount).toBe(1);
      expect(patterns[0].trend).toBe("steady");
    });

    it("should limit output to top N patterns (default 3)", () => {
      const errors = [
        { timestamp: now.toISOString(), category: ERROR_CATEGORIES.ARTICLE_GENDER },
        { timestamp: now.toISOString(), category: ERROR_CATEGORIES.CASE },
        { timestamp: now.toISOString(), category: ERROR_CATEGORIES.VERB_POSITION },
        { timestamp: now.toISOString(), category: ERROR_CATEGORIES.PREPOSITION },
        { timestamp: now.toISOString(), category: ERROR_CATEGORIES.CONJUGATION }
      ];

      const patterns = getTopWeeklyErrorPatterns(errors, now, 3);
      expect(patterns.length).toBe(3);
    });
  });
});
