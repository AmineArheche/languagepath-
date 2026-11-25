import { describe, it, expect } from "vitest";
import {
  calculateSM2Review,
  createInitialCardRecord,
  getStartOfLocalDay,
  getNextReviewDate,
  isDue,
  isCardDue,
  LEECH_THRESHOLD
} from "./srsEngine";

describe("srsEngine - SM-2 Core Algorithm & Due Logic", () => {
  const TEST_CARD_ID = "fc-test-001";

  describe("Issue 1: Explicit cardId signature and validation", () => {
    it("should retain the explicit cardId when currentRecord is null", () => {
      const result = calculateSM2Review(TEST_CARD_ID, null, "good");
      expect(result.cardId).toBe(TEST_CARD_ID);
      expect(result.cardId).not.toBe("unknown");
    });

    it("should retain the explicit cardId when currentRecord is undefined", () => {
      const result = calculateSM2Review(TEST_CARD_ID, undefined, "good");
      expect(result.cardId).toBe(TEST_CARD_ID);
    });

    it("should throw an error if cardId is omitted or empty", () => {
      expect(() => calculateSM2Review("", null, "good")).toThrow(/cardId is required/);
      expect(() => calculateSM2Review(null, null, "good")).toThrow(/cardId is required/);
    });

    it("should throw an error on invalid rating instead of defaulting to q=4", () => {
      expect(() => calculateSM2Review(TEST_CARD_ID, null, "invalid")).toThrow(
        /Invalid SM-2 rating/
      );
      expect(() => calculateSM2Review(TEST_CARD_ID, null, null)).toThrow(
        /Invalid SM-2 rating/
      );
      expect(() => calculateSM2Review(TEST_CARD_ID, null, "ok")).toThrow(
        /Invalid SM-2 rating/
      );
    });
  });

  describe("Issue 2: Local calendar day due dates & isDue", () => {
    it("should store nextReviewDate as start of local calendar day + interval days", () => {
      const fixedToday = new Date(2026, 10, 23, 14, 30, 0); // 2026-11-23 14:30
      const startOfLocal = getStartOfLocalDay(fixedToday);
      expect(startOfLocal.getHours()).toBe(0);
      expect(startOfLocal.getMinutes()).toBe(0);
      expect(startOfLocal.getSeconds()).toBe(0);

      const nextDateIso = getNextReviewDate(3, fixedToday);
      const nextDate = new Date(nextDateIso);
      expect(nextDate.getDate()).toBe(startOfLocal.getDate() + 3);
      expect(nextDate.getHours()).toBe(0);
      expect(nextDate.getMinutes()).toBe(0);
    });

    it("should correctly assess isDue for cards scheduled for today, past, and future", () => {
      const today = new Date(2026, 10, 23, 15, 0, 0);

      // Card due today (start of today)
      const dueTodayRecord = {
        cardId: TEST_CARD_ID,
        nextReviewDate: new Date(2026, 10, 23, 0, 0, 0).toISOString()
      };
      expect(isDue(dueTodayRecord, today)).toBe(true);
      expect(isCardDue(dueTodayRecord, today)).toBe(true);

      // Overdue card (yesterday)
      const overdueRecord = {
        cardId: TEST_CARD_ID,
        nextReviewDate: new Date(2026, 10, 22, 0, 0, 0).toISOString()
      };
      expect(isDue(overdueRecord, today)).toBe(true);

      // Future card (tomorrow)
      const futureRecord = {
        cardId: TEST_CARD_ID,
        nextReviewDate: new Date(2026, 10, 24, 0, 0, 0).toISOString()
      };
      expect(isDue(futureRecord, today)).toBe(false);
      expect(isCardDue(futureRecord, today)).toBe(false);

      // Unreviewed card (null nextReviewDate) should be due immediately
      expect(isDue(null, today)).toBe(true);
      expect(isDue({}, today)).toBe(true);
    });
  });

  describe("Issue 3: Lapses counter and leech flag", () => {
    it("should initialize lapses to 0 and isLeech to false", () => {
      const initial = createInitialCardRecord(TEST_CARD_ID);
      expect(initial.lapses).toBe(0);
      expect(initial.isLeech).toBe(false);
    });

    it("should increment lapses on rating 'again' (q < 3) and reset repetitions", () => {
      const record1 = calculateSM2Review(TEST_CARD_ID, null, "good");
      expect(record1.repetitions).toBe(1);
      expect(record1.lapses).toBe(0);

      // Fail review with 'again'
      const record2 = calculateSM2Review(TEST_CARD_ID, record1, "again");
      expect(record2.repetitions).toBe(0);
      expect(record2.interval).toBe(1);
      expect(record2.lapses).toBe(1);
      expect(record2.isLeech).toBe(false);
    });

    it("should flag a card as a leech when lapses reach LEECH_THRESHOLD (8)", () => {
      let record = null;
      for (let i = 1; i <= 7; i++) {
        record = calculateSM2Review(TEST_CARD_ID, record, "again");
        expect(record.lapses).toBe(i);
        expect(record.isLeech).toBe(false);
      }

      // 8th failure
      record = calculateSM2Review(TEST_CARD_ID, record, "again");
      expect(record.lapses).toBe(8);
      expect(record.isLeech).toBe(true);

      // Remains a leech on further reviews
      record = calculateSM2Review(TEST_CARD_ID, record, "good");
      expect(record.lapses).toBe(8);
      expect(record.isLeech).toBe(true);
    });
  });

  describe("Issue 7: Mathematical SM-2 Algorithm Verification", () => {
    it("should never let Ease Factor drop below 1.300 (EF floor)", () => {
      let record = null;
      for (let i = 0; i < 20; i++) {
        record = calculateSM2Review(TEST_CARD_ID, record, "again");
      }
      expect(record.easeFactor).toBe(1.3);
    });

    it("should apply hard dampening (1.2x) on 'hard' review for mature card", () => {
      // Build up reps
      let record = calculateSM2Review(TEST_CARD_ID, null, "good"); // rep 1, interval 1
      record = calculateSM2Review(TEST_CARD_ID, record, "good");   // rep 2, interval 6
      const prevInterval = record.interval;

      const hardRecord = calculateSM2Review(TEST_CARD_ID, record, "hard");
      expect(hardRecord.repetitions).toBe(3);
      // Hard: interval = Math.max(interval + 1, Math.round(prevInterval * 1.2))
      expect(hardRecord.interval).toBe(Math.round(prevInterval * 1.2));
    });

    it("should apply easy bonus multiplier on 'easy' review", () => {
      let record = calculateSM2Review(TEST_CARD_ID, null, "good"); // rep 1, interval 1
      record = calculateSM2Review(TEST_CARD_ID, record, "good");   // rep 2, interval 6
      const prevInterval = record.interval;
      const prevEF = record.easeFactor;

      const easyRecord = calculateSM2Review(TEST_CARD_ID, record, "easy");
      // Delta EF for easy (q=5) is +0.10
      const expectedEF = Number((prevEF + 0.1).toFixed(3));
      expect(easyRecord.easeFactor).toBe(expectedEF);
      // Easy: interval = Math.max(interval + 2, Math.round(prevInterval * expectedEF * 1.3))
      expect(easyRecord.interval).toBe(Math.round(prevInterval * expectedEF * 1.3));
    });
  });
});
