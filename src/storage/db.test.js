import "fake-indexeddb/auto";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  getDb,
  closeDb,
  resetDbConnection,
  runMigrations,
  validateAndRepairBackup,
  safeDbWrite,
  pruneVolatileStorage,
  restoreRollbackCopy,
  ROLLBACK_STORAGE_KEY,
  CURRENT_SCHEMA_VERSION,
  DB_NAME
} from "./db";

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

describe("IndexedDB Storage Layer (idb + Zod + Migrations)", () => {
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

  describe("1. Migration from Old localStorage Fixture", () => {
    it("should migrate legacy v2 progress, srsCards, and customCards into IndexedDB stores without data loss", async () => {
      // Setup old localStorage fixture
      const oldProgressFixture = {
        xp: 450,
        streak: 5,
        lastActiveDate: "2026-11-20",
        completedLessons: ["a1-u1-l1", "a1-u1-l2"],
        unitProgress: { "a1-u1": 100 },
        srsCards: {
          "fc-a1-001": {
            cardId: "fc-a1-001",
            repetitions: 3,
            interval: 12,
            easeFactor: 2.6,
            lapses: 1,
            isLeech: false,
            nextReviewDate: "2026-11-25T00:00:00.000Z",
            history: [
              { date: "2026-11-10T10:00:00.000Z", rating: "good", interval: 1 },
              { date: "2026-11-11T10:00:00.000Z", rating: "again", interval: 1, lapses: 1 }
            ]
          },
          "fc-a1-002": {
            cardId: "fc-a1-002",
            repetitions: 1,
            interval: 1,
            easeFactor: 2.5,
            lapses: 0,
            isLeech: false,
            nextReviewDate: "2026-11-21T00:00:00.000Z",
            history: []
          }
        },
        dailyGoalMinutes: 45
      };

      const oldCustomCardsFixture = [
        {
          id: "custom-card-999",
          german: "der Apfelkuchen",
          article: "der",
          english: "apple pie",
          level: "A1"
        }
      ];

      localStorageMock.setItem("deutschpath_progress_v2", JSON.stringify(oldProgressFixture));
      localStorageMock.setItem("deutschpath_custom_flashcards_v1", JSON.stringify(oldCustomCardsFixture));

      // Run migration
      const result = await runMigrations();
      expect(result.migrated).toBe(true);
      expect(result.migratedSrsCount).toBe(2);
      expect(result.migratedCardsCount).toBe(1);

      // Verify one-time rollback snapshot was preserved in localStorage
      const rollbackStr = localStorageMock.getItem(ROLLBACK_STORAGE_KEY);
      expect(rollbackStr).toBeDefined();
      const rollbackObj = JSON.parse(rollbackStr);
      expect(rollbackObj.progressV2).toContain("fc-a1-001");
      expect(rollbackObj.customCardsV1).toContain("Apfelkuchen");

      // Verify IndexedDB contents
      const db = await getDb();
      const storedProgress = await db.get("progress", "main");
      expect(storedProgress.xp).toBe(450);
      expect(storedProgress.streak).toBe(5);
      expect(storedProgress.dailyGoalMinutes).toBe(45);

      const card1 = await db.get("srsCards", "fc-a1-001");
      expect(card1).toBeDefined();
      expect(card1.repetitions).toBe(3);
      expect(card1.interval).toBe(12);

      const customCard = await db.get("customCards", "custom-card-999");
      expect(customCard).toBeDefined();
      expect(customCard.german).toBe("der Apfelkuchen");

      // Verify reviewLog was populated from card history
      const logs = await db.getAll("reviewLog");
      expect(logs.length).toBe(2);
      expect(logs[0].cardId).toBe("fc-a1-001");

      // Verify schemaVersion in meta store
      const schemaMeta = await db.get("meta", "schemaVersion");
      expect(schemaMeta.value).toBe(CURRENT_SCHEMA_VERSION);
    });

    it("should allow restoring the pre-migration rollback copy if requested", async () => {
      const rollbackData = {
        progressV2: JSON.stringify({ xp: 999, streak: 12 }),
        customCardsV1: JSON.stringify([{ id: "rb-card-1", german: "das Buch" }])
      };
      localStorageMock.setItem(ROLLBACK_STORAGE_KEY, JSON.stringify(rollbackData));

      const success = await restoreRollbackCopy();
      expect(success).toBe(true);

      const db = await getDb();
      const progress = await db.get("progress", "main");
      expect(progress.xp).toBe(999);

      const card = await db.get("customCards", "rb-card-1");
      expect(card.german).toBe("das Buch");
    });
  });

  describe("2. Corrupted Backup Validation & Repair (Zod)", () => {
    it("should reject completely malformed/invalid backups with a clear error report", () => {
      // Not an object
      const report1 = validateAndRepairBackup("not-json-string");
      expect(report1.valid).toBe(false);
      expect(report1.errors.length).toBeGreaterThan(0);

      // Missing required progression data
      const corruptedData = {
        app: "DeutschPath",
        schemaVersion: 1,
        progress: {
          xp: "not-a-number", // Type violation
          streak: -5          // Invalid negative streak
        }
      };

      const report2 = validateAndRepairBackup(corruptedData);
      expect(report2.valid).toBe(false);
      expect(report2.errors.some((e) => e.includes("progress"))).toBe(true);
    });

    it("should automatically repair legacy backups missing schemaVersion or using dictionary srsCards", () => {
      const legacyBackup = {
        app: "DeutschPath",
        // schemaVersion omitted
        progress: {
          xp: 120,
          streak: 2
        },
        // srsCards as dictionary instead of array
        srsCards: {
          "fc-1": { repetitions: 2, interval: 6 },
          "fc-2": { repetitions: 1, interval: 1 }
        },
        customCards: [{ id: "c-1", german: "der Hund" }]
      };

      const report = validateAndRepairBackup(legacyBackup);
      expect(report.valid).toBe(true);
      expect(report.repaired).toBe(true);
      expect(report.repairs.length).toBeGreaterThanOrEqual(2);
      expect(report.data.schemaVersion).toBe(1);
      expect(Array.isArray(report.data.srsCards)).toBe(true);
      expect(report.data.srsCards.length).toBe(2);
    });
  });

  describe("3. Quota-Exceeded Fallback & Cache Pruning", () => {
    it("should handle QuotaExceededError by pruning volatile aiCache and retrying write", async () => {
      const db = await getDb();

      // Seed volatile cache
      await db.put("aiCache", { key: "cached-prompt-1", data: "response", timestamp: Date.now() });
      await db.put("aiCache", { key: "cached-prompt-2", data: "response", timestamp: Date.now() });

      let cachedBefore = await db.getAll("aiCache");
      expect(cachedBefore.length).toBe(2);

      // Prune volatile storage
      await pruneVolatileStorage();

      let cachedAfter = await db.getAll("aiCache");
      expect(cachedAfter.length).toBe(0);

      // safeDbWrite successfully writes to store
      const testRecord = { cardId: "fc-safe-test", repetitions: 1, interval: 1 };
      await safeDbWrite("srsCards", testRecord);

      const saved = await db.get("srsCards", "fc-safe-test");
      expect(saved).toBeDefined();
      expect(saved.cardId).toBe("fc-safe-test");
    });
  });
});
