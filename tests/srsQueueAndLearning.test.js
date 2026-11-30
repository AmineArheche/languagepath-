import { describe, it, expect } from "vitest";
import {
  processLearningStepReview,
  buildStudyQueue,
  checkCardAnswer,
  normalizeGermanAnswer,
  createClozeSentence,
  calculateRetentionStats,
  calculateDueForecast,
  interleaveByTheme,
  LEARNING_STEPS_MINUTES,
  LEECH_THRESHOLD
} from "../src/utils/srsEngine";

describe("Enhanced SRS - In-Session Learning Steps & Queue Ordering", () => {
  const TEST_CARD_ID = "fc-a1-wohnen-tisch";

  describe("1. Learning Steps (1m and 10m) & Graduation", () => {
    it("new card starts in learning step 0 (1 minute) on initial rating or 'again'", () => {
      const now = new Date(2026, 10, 23, 10, 0, 0);
      const res = processLearningStepReview(TEST_CARD_ID, null, "again", now);

      expect(res.state).toBe("learning");
      expect(res.stepIndex).toBe(0);
      expect(res.inSessionDueMs).toBe(now.getTime() + LEARNING_STEPS_MINUTES[0] * 60 * 1000);
      expect(res.repetitions).toBe(0);
    });

    it("advances from step 0 (1m) to step 1 (10m) on rating 'good'", () => {
      const now = new Date(2026, 10, 23, 10, 0, 0);
      // Card in step 0
      const step0Card = {
        cardId: TEST_CARD_ID,
        state: "learning",
        stepIndex: 0,
        repetitions: 0
      };

      const res = processLearningStepReview(TEST_CARD_ID, step0Card, "good", now);
      expect(res.state).toBe("learning");
      expect(res.stepIndex).toBe(1);
      expect(res.inSessionDueMs).toBe(now.getTime() + LEARNING_STEPS_MINUTES[1] * 60 * 1000);
    });

    it("repeats current step on rating 'hard'", () => {
      const now = new Date(2026, 10, 23, 10, 0, 0);
      const step1Card = {
        cardId: TEST_CARD_ID,
        state: "learning",
        stepIndex: 1,
        repetitions: 0
      };

      const res = processLearningStepReview(TEST_CARD_ID, step1Card, "hard", now);
      expect(res.state).toBe("learning");
      expect(res.stepIndex).toBe(1);
      expect(res.inSessionDueMs).toBe(now.getTime() + LEARNING_STEPS_MINUTES[1] * 60 * 1000);
    });

    it("resets to step 0 (1m) on rating 'again' from step 1", () => {
      const now = new Date(2026, 10, 23, 10, 0, 0);
      const step1Card = {
        cardId: TEST_CARD_ID,
        state: "learning",
        stepIndex: 1,
        repetitions: 0
      };

      const res = processLearningStepReview(TEST_CARD_ID, step1Card, "again", now);
      expect(res.state).toBe("learning");
      expect(res.stepIndex).toBe(0);
      expect(res.inSessionDueMs).toBe(now.getTime() + LEARNING_STEPS_MINUTES[0] * 60 * 1000);
    });

    it("graduates from step 1 to day intervals (1 day) on rating 'good'", () => {
      const now = new Date(2026, 10, 23, 10, 0, 0);
      const step1Card = {
        cardId: TEST_CARD_ID,
        state: "learning",
        stepIndex: 1,
        repetitions: 0
      };

      const res = processLearningStepReview(TEST_CARD_ID, step1Card, "good", now);
      expect(res.state).toBe("review");
      expect(res.stepIndex).toBeNull();
      expect(res.inSessionDueMs).toBeNull();
      expect(res.repetitions).toBe(1);
      expect(res.interval).toBe(1); // 1 day interval on graduation
    });

    it("graduates immediately to multi-day interval on rating 'easy'", () => {
      const now = new Date(2026, 10, 23, 10, 0, 0);
      const res = processLearningStepReview(TEST_CARD_ID, null, "easy", now);
      expect(res.state).toBe("review");
      expect(res.stepIndex).toBeNull();
      expect(res.interval).toBeGreaterThanOrEqual(3);
    });

    it("graduated card lapses on 'again' and re-enters learning step 0", () => {
      const now = new Date(2026, 10, 23, 10, 0, 0);
      const matureCard = {
        cardId: TEST_CARD_ID,
        state: "review",
        repetitions: 4,
        interval: 16,
        lapses: 2,
        isLeech: false
      };

      const res = processLearningStepReview(TEST_CARD_ID, matureCard, "again", now);
      expect(res.state).toBe("learning");
      expect(res.stepIndex).toBe(0);
      expect(res.repetitions).toBe(0);
      expect(res.lapses).toBe(3);
      expect(res.inSessionDueMs).toBe(now.getTime() + LEARNING_STEPS_MINUTES[0] * 60 * 1000);
    });

    it("flags card as leech when lapses reach LEECH_THRESHOLD (8)", () => {
      const now = new Date(2026, 10, 23, 10, 0, 0);
      const nearLeechCard = {
        cardId: TEST_CARD_ID,
        state: "review",
        repetitions: 2,
        interval: 6,
        lapses: 7,
        isLeech: false
      };

      const res = processLearningStepReview(TEST_CARD_ID, nearLeechCard, "again", now);
      expect(res.lapses).toBe(8);
      expect(res.isLeech).toBe(true);
    });
  });

  describe("2. Daily Limits & Queue Ordering (Due Reviews First, Then New, Interleaved by Theme)", () => {
    const mockCards = [
      { id: "c1", german: "Wohnung", topic: "Wohnen" },
      { id: "c2", german: "Zimmer", topic: "Wohnen" },
      { id: "c3", german: "Miete", topic: "Wohnen" },
      { id: "c4", german: "Büro", topic: "Arbeit" },
      { id: "c5", german: "Chef", topic: "Arbeit" },
      { id: "c6", german: "Kollege", topic: "Arbeit" },
      { id: "c7", german: "Zug", topic: "Reisen" },
      { id: "c8", german: "Gleis", topic: "Reisen" }
    ];

    it("interleaves cards across themes in round-robin fashion", () => {
      const interleaved = interleaveByTheme(mockCards);
      expect(interleaved.length).toBe(mockCards.length);
      // First 3 cards must come from 3 different topics
      const firstThreeTopics = [interleaved[0].topic, interleaved[1].topic, interleaved[2].topic];
      const uniqueTopics = new Set(firstThreeTopics);
      expect(uniqueTopics.size).toBe(3);
    });

    it("orders due reviews first, followed by new cards", () => {
      const today = new Date(2026, 10, 23, 12, 0, 0);
      const srsMap = {
        c1: { cardId: "c1", repetitions: 2, lastReviewed: "2026-11-20T00:00:00Z", nextReviewDate: "2026-11-23T00:00:00Z" }, // Due
        c4: { cardId: "c4", repetitions: 1, lastReviewed: "2026-11-20T00:00:00Z", nextReviewDate: "2026-11-23T00:00:00Z" }, // Due
        c7: { cardId: "c7", repetitions: 3, lastReviewed: "2026-11-20T00:00:00Z", nextReviewDate: "2026-11-30T00:00:00Z" }  // Not due
        // c2, c3, c5, c6, c8 are new
      };

      const { queue, dueCount, newCount } = buildStudyQueue(mockCards, srsMap, { today });

      expect(dueCount).toBe(2);
      expect(newCount).toBe(5);
      expect(queue.length).toBe(7);

      // First 2 cards must be the due cards (c1, c4)
      const dueIds = new Set(["c1", "c4"]);
      expect(dueIds.has(queue[0].id)).toBe(true);
      expect(dueIds.has(queue[1].id)).toBe(true);

      // Remaining cards must be new cards
      const newIds = queue.slice(2).map((c) => c.id);
      expect(newIds).toContain("c2");
      expect(newIds).toContain("c3");
      expect(newIds).toContain("c5");
      expect(newIds).toContain("c6");
      expect(newIds).toContain("c8");
    });

    it("enforces newCardsLimit (default 15) and maxReviewsLimit", () => {
      const today = new Date(2026, 10, 23, 12, 0, 0);
      const srsMap = {
        c1: { cardId: "c1", repetitions: 2, lastReviewed: "2026-11-20T00:00:00Z", nextReviewDate: "2026-11-23T00:00:00Z" },
        c4: { cardId: "c4", repetitions: 1, lastReviewed: "2026-11-20T00:00:00Z", nextReviewDate: "2026-11-23T00:00:00Z" }
      };

      const { queue, dueCount, newCount } = buildStudyQueue(mockCards, srsMap, {
        newCardsLimit: 2,
        maxReviewsLimit: 1,
        today
      });

      expect(dueCount).toBe(1); // Capped by maxReviewsLimit = 1
      expect(newCount).toBe(2); // Capped by newCardsLimit = 2
      expect(queue.length).toBe(3);
    });
  });

  describe("3. Card Modes, Typing Normalization & Umlaut Alternatives", () => {
    const cardWithArticle = {
      german: "Tisch",
      article: "der",
      english: "table"
    };

    const cardWithUmlaut = {
      german: "Küche",
      article: "die",
      english: "kitchen"
    };

    it("accepts exact match with article ('der Tisch')", () => {
      const res = checkCardAnswer("der Tisch", cardWithArticle);
      expect(res.isCorrect).toBe(true);
    });

    it("accepts umlaut alternative ('die Kueche' for 'die Küche')", () => {
      const res = checkCardAnswer("die Kueche", cardWithUmlaut);
      expect(res.isCorrect).toBe(true);
    });

    it("accepts 'ae' for 'ä' and 'ss' for 'ß'", () => {
      expect(normalizeGermanAnswer("Äpfel")).toBe("aepfel");
      expect(normalizeGermanAnswer("Straße")).toBe("strasse");
      expect(normalizeGermanAnswer("schön")).toBe("schoen");
    });

    it("flags missing article when learner types only the noun stem", () => {
      const res = checkCardAnswer("Tisch", cardWithArticle);
      expect(res.isCorrect).toBe(false);
      expect(res.headwordCorrect).toBe(true);
      expect(res.articleMissing).toBe(true);
    });
  });

  describe("4. Cloze Sentence Generation", () => {
    it("replaces headword with cloze gap [ _____ ] in German sentence", () => {
      const { clozeText } = createClozeSentence("Das Buch liegt auf dem Tisch.", "Tisch");
      expect(clozeText).toBe("Das Buch liegt auf dem [ _____ ].");
    });

    it("matches inflected or plural headword stems", () => {
      const { clozeText } = createClozeSentence("Hier stehen drei Tische.", "Tisch");
      expect(clozeText).toBe("Hier stehen drei [ _____ ].");
    });
  });

  describe("5. Retention Analytics & 14-Day Due Forecast", () => {
    it("computes retention rate and maturity distribution", () => {
      const reviewLog = [
        { cardId: "c1", rating: "good" },
        { cardId: "c2", rating: "again" },
        { cardId: "c3", rating: "easy" },
        { cardId: "c4", rating: "good" }
      ];

      const srsMap = {
        c1: { cardId: "c1", interval: 25, repetitions: 4, lapses: 0, isLeech: false }, // Mature
        c2: { cardId: "c2", interval: 5, repetitions: 2, lapses: 1, isLeech: false },  // Young
        c3: { cardId: "c3", interval: 0, repetitions: 0, lapses: 0, state: "learning" }, // Learning
        c4: { cardId: "c4", interval: 2, repetitions: 1, lapses: 8, isLeech: true }     // Leech & Young
      };

      const stats = calculateRetentionStats(reviewLog, srsMap);
      expect(stats.totalReviews).toBe(4);
      expect(stats.successReviews).toBe(3);
      expect(stats.retentionRate).toBe(75); // 3 / 4 = 75%
      expect(stats.maturity.mature).toBe(1);
      expect(stats.maturity.young).toBe(2);
      expect(stats.maturity.learning).toBe(1);
      expect(stats.maturity.leeches).toBe(1);
    });

    it("forecasts due cards for each of the next 14 calendar days", () => {
      const today = new Date(2026, 10, 23, 0, 0, 0);
      const tomorrow = new Date(2026, 10, 24, 0, 0, 0);
      const day3 = new Date(2026, 10, 26, 0, 0, 0);

      const srsMap = {
        c1: { cardId: "c1", nextReviewDate: today.toISOString() },
        c2: { cardId: "c2", nextReviewDate: tomorrow.toISOString() },
        c3: { cardId: "c3", nextReviewDate: day3.toISOString() }
      };

      const forecast = calculateDueForecast(srsMap, 14, today);
      expect(forecast.length).toBe(14);
      expect(forecast[0].label).toBe("Today");
      expect(forecast[0].dueCount).toBe(1);
      expect(forecast[1].label).toBe("Tomorrow");
      expect(forecast[1].dueCount).toBe(1);
      expect(forecast[3].dueCount).toBe(1); // Day 3
      expect(forecast[2].dueCount).toBe(0); // Day 2 has none
    });
  });
});
