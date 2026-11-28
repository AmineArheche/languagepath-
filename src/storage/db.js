import { openDB } from "idb";
import { z } from "zod";

export const DB_NAME = "deutschpath_idb";
export const DB_VERSION = 2;
export const CURRENT_SCHEMA_VERSION = 2;
export const ROLLBACK_STORAGE_KEY = "deutschpath_rollback_v1";

let dbPromise = null;

/**
 * Initializes and upgrades the IndexedDB database
 */
export function getDb() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion, newVersion, transaction) {
        // 1. progress: stores core progression metrics
        if (!db.objectStoreNames.contains("progress")) {
          db.createObjectStore("progress", { keyPath: "key" });
        }

        // 2. srsCards: stores per-card SM-2 state
        if (!db.objectStoreNames.contains("srsCards")) {
          const srsStore = db.createObjectStore("srsCards", { keyPath: "cardId" });
          srsStore.createIndex("by_isLeech", "isLeech");
          srsStore.createIndex("by_nextReviewDate", "nextReviewDate");
        }

        // 3. reviewLog: append-only log of every recall event
        if (!db.objectStoreNames.contains("reviewLog")) {
          const logStore = db.createObjectStore("reviewLog", {
            keyPath: "id",
            autoIncrement: true
          });
          logStore.createIndex("by_cardId", "cardId");
          logStore.createIndex("by_timestamp", "timestamp");
        }

        // 4. errorLedger: logs mistakes by category for analytics
        if (!db.objectStoreNames.contains("errorLedger")) {
          const errStore = db.createObjectStore("errorLedger", {
            keyPath: "id",
            autoIncrement: true
          });
          errStore.createIndex("by_topic", "topic");
          errStore.createIndex("by_timestamp", "timestamp");
        }

        // 5. customCards: user-authored vocabulary flashcards
        if (!db.objectStoreNames.contains("customCards")) {
          db.createObjectStore("customCards", { keyPath: "id" });
        }

        // 6. aiCache: offline cache for AI feedback & completions
        if (!db.objectStoreNames.contains("aiCache")) {
          const cacheStore = db.createObjectStore("aiCache", { keyPath: "key" });
          cacheStore.createIndex("by_timestamp", "timestamp");
        }

        // 7. meta: stores schema metadata, migrations, sync state
        if (!db.objectStoreNames.contains("meta")) {
          db.createObjectStore("meta", { keyPath: "key" });
        }

        // 8. users: real client user authentication & account records
        if (!db.objectStoreNames.contains("users")) {
          const usersStore = db.createObjectStore("users", { keyPath: "id" });
          usersStore.createIndex("by_email", "email", { unique: true });
        }

        // 9. userProgress: per-user, per-target-language progression records
        if (!db.objectStoreNames.contains("userProgress")) {
          const upStore = db.createObjectStore("userProgress", { keyPath: "key" });
          upStore.createIndex("by_userId", "userId");
          upStore.createIndex("by_languageId", "languageId");
        }
      }
    });
  }
  return dbPromise;
}

/**
 * Reset and close database connection (useful in test teardowns)
 */
export async function closeDb() {
  if (dbPromise) {
    try {
      const db = await dbPromise;
      db.close();
    } catch (_) {}
    dbPromise = null;
  }
}

export function resetDbConnection() {
  dbPromise = null;
}

/**
 * Multi-tab synchronization via BroadcastChannel
 */
export const syncChannel =
  typeof window !== "undefined" && typeof BroadcastChannel !== "undefined"
    ? new BroadcastChannel("deutschpath_idb_sync")
    : null;

export function broadcastDbChange(type, payload = null) {
  if (syncChannel) {
    try {
      syncChannel.postMessage({ type, payload, timestamp: Date.now() });
    } catch (err) {
      console.warn("Could not broadcast IndexedDB change:", err);
    }
  }
}

/**
 * Zod validation schemas for Backup Export/Import
 */
export const BackupProgressSchema = z
  .object({
    xp: z.number().default(0),
    streak: z.number().default(1),
    lastActiveDate: z.string().default(() => new Date().toISOString().split("T")[0]),
    completedLessons: z.array(z.string()).default([]),
    unitProgress: z.record(z.string(), z.number()).default({}),
    starredCards: z.array(z.string()).default([]),
    genderDrillHighScore: z.number().default(0),
    grammarStats: z.record(z.string(), z.any()).default({}),
    readingScores: z.record(z.string(), z.any()).default({}),
    dailyStudyMinutes: z.record(z.string(), z.number()).default({}),
    examHistory: z.array(z.any()).default([]),
    dailyGoalMinutes: z.number().default(30)
  })
  .passthrough();

export const BackupSchema = z.object({
  app: z.string().default("DeutschPath"),
  schemaVersion: z.number().int().positive().default(1),
  exportDate: z.string().default(() => new Date().toISOString()),
  progress: BackupProgressSchema,
  srsCards: z
    .union([
      z.array(z.object({ cardId: z.string() }).passthrough()),
      z.record(z.string(), z.any())
    ])
    .default([]),
  customCards: z.array(z.object({ id: z.string() }).passthrough()).default([]),
  reviewLog: z.array(z.any()).default([]),
  writingHistory: z.array(z.any()).default([])
});

/**
 * Validates and repairs backup data
 * @param {any} rawData
 * @returns {{ valid: boolean, repaired: boolean, errors: string[], repairs: string[], data: any }}
 */
export function validateAndRepairBackup(rawData) {
  const report = {
    valid: false,
    repaired: false,
    errors: [],
    repairs: [],
    data: null
  };

  if (!rawData || typeof rawData !== "object") {
    report.errors.push("Backup must be a non-null JSON object.");
    return report;
  }

  // Legacy format repair: if missing schemaVersion, infer schemaVersion = 1
  const copy = { ...rawData };
  if (!copy.schemaVersion) {
    copy.schemaVersion = 1;
    report.repairs.push("Assigned missing schemaVersion: 1");
    report.repaired = true;
  }

  // Legacy format repair: if srsCards is stored as an object map instead of an array
  if (copy.srsCards && !Array.isArray(copy.srsCards) && typeof copy.srsCards === "object") {
    copy.srsCards = Object.entries(copy.srsCards).map(([cardId, cardRecord]) => ({
      cardId,
      ...(typeof cardRecord === "object" ? cardRecord : {})
    }));
    report.repairs.push("Converted srsCards key-value dictionary to record array");
    report.repaired = true;
  }

  // If progress is missing but properties are at root level
  if (!copy.progress && (copy.xp !== undefined || copy.completedLessons !== undefined)) {
    copy.progress = {
      xp: copy.xp || 0,
      streak: copy.streak || 1,
      lastActiveDate: copy.lastActiveDate || new Date().toISOString().split("T")[0],
      completedLessons: copy.completedLessons || [],
      unitProgress: copy.unitProgress || {},
      starredCards: copy.starredCards || [],
      genderDrillHighScore: copy.genderDrillHighScore || 0,
      grammarStats: copy.grammarStats || {},
      readingScores: copy.readingScores || {},
      dailyStudyMinutes: copy.dailyStudyMinutes || {},
      examHistory: copy.examHistory || [],
      dailyGoalMinutes: copy.dailyGoalMinutes || 30
    };
    report.repairs.push("Consolidated root progression properties into progress sub-object");
    report.repaired = true;
  }

  const parseResult = BackupSchema.safeParse(copy);

  if (!parseResult.success) {
    parseResult.error.issues.forEach((issue) => {
      report.errors.push(`${issue.path.join(".") || "root"}: ${issue.message}`);
    });
    return report;
  }

  report.valid = true;
  report.data = parseResult.data;
  return report;
}

/**
 * Migration runner: migrates legacy localStorage data to IndexedDB
 * Keeps a one-time rollback copy in localStorage under ROLLBACK_STORAGE_KEY
 */
export async function runMigrations() {
  const db = await getDb();

  const migrationMeta = await db.get("meta", "migratedFromLocalStorage");
  if (migrationMeta?.value) {
    return { migrated: false, reason: "Already migrated" };
  }

  let oldProgressStr = null;
  let oldCardsStr = null;
  let oldWritingStr = null;

  try {
    oldProgressStr = localStorage.getItem("deutschpath_progress_v2");
    oldCardsStr = localStorage.getItem("deutschpath_custom_flashcards_v1");
    oldWritingStr = localStorage.getItem("deutschpath_writing_history_v1");
  } catch (err) {
    console.warn("Could not read localStorage for migration:", err);
  }

  const tx = db.transaction(
    ["progress", "srsCards", "customCards", "reviewLog", "meta"],
    "readwrite"
  );

  let migratedProgress = null;
  let migratedCardsCount = 0;
  let migratedSrsCount = 0;

  if (oldProgressStr || oldCardsStr || oldWritingStr) {
    // 1. Create a one-time rollback copy in localStorage
    try {
      const rollbackPayload = {
        progressV2: oldProgressStr,
        customCardsV1: oldCardsStr,
        writingHistoryV1: oldWritingStr,
        timestamp: new Date().toISOString(),
        version: "pre-indexeddb-migration"
      };
      localStorage.setItem(ROLLBACK_STORAGE_KEY, JSON.stringify(rollbackPayload));
    } catch (rbErr) {
      console.warn("Could not write rollback copy to localStorage:", rbErr);
    }

    // 2. Migrate progress & srsCards
    if (oldProgressStr) {
      try {
        const parsedProgress = JSON.parse(oldProgressStr);
        const { srsCards, ...cleanProgress } = parsedProgress;

        migratedProgress = cleanProgress;
        await tx.objectStore("progress").put({ key: "main", ...cleanProgress });

        if (srsCards && typeof srsCards === "object") {
          for (const [cardId, record] of Object.entries(srsCards)) {
            if (record && typeof record === "object") {
              const fullRecord = { cardId, ...record };
              await tx.objectStore("srsCards").put(fullRecord);
              migratedSrsCount++;

              // Also populate reviewLog if history entries exist
              if (Array.isArray(fullRecord.history)) {
                for (const h of fullRecord.history) {
                  await tx.objectStore("reviewLog").add({
                    cardId,
                    rating: h.rating || "good",
                    timestamp: h.date || new Date().toISOString(),
                    interval: h.interval || 1,
                    lapses: h.lapses || 0,
                    isLeech: !!h.isLeech
                  });
                }
              }
            }
          }
        }
      } catch (pErr) {
        console.error("Error migrating old progress:", pErr);
      }
    }

    // 3. Migrate customCards
    if (oldCardsStr) {
      try {
        const parsedCards = JSON.parse(oldCardsStr);
        if (Array.isArray(parsedCards)) {
          for (const card of parsedCards) {
            if (card && card.id) {
              await tx.objectStore("customCards").put(card);
              migratedCardsCount++;
            }
          }
        }
      } catch (cErr) {
        console.error("Error migrating custom cards:", cErr);
      }
    }
  }

  // Mark migration as completed
  await tx.objectStore("meta").put({ key: "schemaVersion", value: CURRENT_SCHEMA_VERSION });
  await tx.objectStore("meta").put({ key: "migratedFromLocalStorage", value: true });
  await tx.done;

  return {
    migrated: true,
    migratedSrsCount,
    migratedCardsCount,
    hasRollbackCopy: true
  };
}

/**
 * Restores pre-migration rollback data from localStorage if available
 */
export async function restoreRollbackCopy() {
  const raw = localStorage.getItem(ROLLBACK_STORAGE_KEY);
  if (!raw) {
    throw new Error("No rollback copy found in localStorage");
  }

  const payload = JSON.parse(raw);
  const db = await getDb();
  const tx = db.transaction(["progress", "srsCards", "customCards", "meta"], "readwrite");

  await tx.objectStore("progress").clear();
  await tx.objectStore("srsCards").clear();
  await tx.objectStore("customCards").clear();

  if (payload.progressV2) {
    const { srsCards, ...progressData } = JSON.parse(payload.progressV2);
    await tx.objectStore("progress").put({ key: "main", ...progressData });
    if (srsCards) {
      for (const [cardId, rec] of Object.entries(srsCards)) {
        await tx.objectStore("srsCards").put({ cardId, ...rec });
      }
    }
  }

  if (payload.customCardsV1) {
    const cards = JSON.parse(payload.customCardsV1);
    for (const c of cards) {
      await tx.objectStore("customCards").put(c);
    }
  }

  await tx.done;
  broadcastDbChange("RESTORED_ROLLBACK");
  return true;
}

/**
 * Prunes volatile caches (aiCache) and older logs when storage quota is tight
 */
export async function pruneVolatileStorage() {
  try {
    const db = await getDb();
    const tx = db.transaction(["aiCache", "reviewLog"], "readwrite");
    await tx.objectStore("aiCache").clear();

    // Prune review logs older than 90 days if log size exceeds 10,000 entries
    const logStore = tx.objectStore("reviewLog");
    const count = await logStore.count();
    if (count > 5000) {
      const ninetyDaysAgo = new Date(Date.now() - 90 * 86400000).toISOString();
      let cursor = await logStore.index("by_timestamp").openCursor();
      while (cursor && cursor.value.timestamp < ninetyDaysAgo) {
        await cursor.delete();
        cursor = await cursor.continue();
      }
    }
    await tx.done;
  } catch (err) {
    console.warn("Could not prune volatile storage:", err);
  }
}

/**
 * Safe write with QuotaExceededError recovery
 */
export async function safeDbWrite(storeName, record, key = undefined) {
  const db = await getDb();
  try {
    return await db.put(storeName, record, key);
  } catch (err) {
    if (err.name === "QuotaExceededError" || err.message?.toLowerCase().includes("quota")) {
      console.warn("IndexedDB QuotaExceededError encountered. Pruning volatile caches...", err);
      await pruneVolatileStorage();
      try {
        const retryDb = await getDb();
        return await retryDb.put(storeName, record, key);
      } catch (retryErr) {
        console.error("Fatal QuotaExceededError: Could not save after cache prune:", retryErr);
        throw retryErr;
      }
    }
    throw err;
  }
}

/**
 * Persistent storage request & quota estimation
 */
export async function requestStoragePersistence() {
  if (typeof navigator !== "undefined" && navigator.storage?.persist) {
    return await navigator.storage.persist();
  }
  return false;
}

export async function checkStoragePersistence() {
  if (typeof navigator !== "undefined" && navigator.storage?.persisted) {
    return await navigator.storage.persisted();
  }
  return false;
}

export async function getStorageEstimate() {
  if (typeof navigator !== "undefined" && navigator.storage?.estimate) {
    try {
      const { quota, usage } = await navigator.storage.estimate();
      return {
        quotaBytes: quota || 0,
        usageBytes: usage || 0,
        quotaMb: quota ? (quota / (1024 * 1024)).toFixed(1) : "0",
        usageKb: usage ? (usage / 1024).toFixed(1) : "0",
        usageMb: usage ? (usage / (1024 * 1024)).toFixed(2) : "0",
        usagePercent: quota ? ((usage / quota) * 100).toFixed(2) : "0"
      };
    } catch (e) {
      console.warn("Error getting storage estimate:", e);
    }
  }
  return {
    quotaBytes: 0,
    usageBytes: 0,
    quotaMb: "0",
    usageKb: "0",
    usageMb: "0",
    usagePercent: "0"
  };
}

/**
 * =======================================================================
 * REAL CLIENT-SIDE USER AUTHENTICATION & MULTI-LANGUAGE DATABASE API
 * =======================================================================
 */

export const DEFAULT_DEMO_USER_ID = "user-demo-1";

export const INITIAL_DEMO_USER = {
  id: DEFAULT_DEMO_USER_ID,
  name: "Amine",
  email: "amine@languagepath.com",
  password: "password123",
  avatar: "👨‍💻",
  nativeLanguage: "fr",
  activeTargetLanguage: "de",
  enrolledLanguages: ["de", "es", "en", "fr"],
  joinedAt: "2026-01-15",
  dailyGoalMinutes: 30
};

export const INITIAL_DEMO_PROGRESS_MAP = {
  de: {
    xp: 450,
    streak: 5,
    level: "A2",
    wordsLearned: 135,
    retentionRate: 91,
    studyMinutes: 180,
    completedLessons: ["de-u1-l1", "de-u1-l2", "de-u1-l3"],
    unitProgress: { "de-u1": 100, "de-u2": 45 },
    lastActiveDate: new Date().toISOString().split("T")[0]
  },
  es: {
    xp: 210,
    streak: 3,
    level: "A1",
    wordsLearned: 58,
    retentionRate: 88,
    studyMinutes: 75,
    completedLessons: ["es-u1-l1", "es-u1-l2"],
    unitProgress: { "es-u1": 70 },
    lastActiveDate: new Date().toISOString().split("T")[0]
  },
  en: {
    xp: 820,
    streak: 12,
    level: "B2",
    wordsLearned: 310,
    retentionRate: 95,
    studyMinutes: 320,
    completedLessons: ["en-u1-l1", "en-u1-l2", "en-u2-l1", "en-u2-l2"],
    unitProgress: { "en-u1": 100, "en-u2": 85 },
    lastActiveDate: new Date().toISOString().split("T")[0]
  },
  fr: {
    xp: 340,
    streak: 4,
    level: "A2",
    wordsLearned: 95,
    retentionRate: 89,
    studyMinutes: 110,
    completedLessons: ["fr-u1-l1", "fr-u1-l2"],
    unitProgress: { "fr-u1": 100 },
    lastActiveDate: new Date().toISOString().split("T")[0]
  }
};

/**
 * Seeds demo user "Amine" and initial multi-language records into IndexedDB if empty
 */
export async function seedDemoUserIfEmpty() {
  try {
    const db = await getDb();
    if (!db.objectStoreNames.contains("users") || !db.objectStoreNames.contains("userProgress")) {
      return;
    }
    const existing = await db.get("users", DEFAULT_DEMO_USER_ID);
    if (!existing) {
      const tx = db.transaction(["users", "userProgress"], "readwrite");
      await tx.objectStore("users").put(INITIAL_DEMO_USER);
      for (const [langId, prog] of Object.entries(INITIAL_DEMO_PROGRESS_MAP)) {
        await tx.objectStore("userProgress").put({
          key: `${DEFAULT_DEMO_USER_ID}_${langId}`,
          userId: DEFAULT_DEMO_USER_ID,
          languageId: langId,
          ...prog,
          lastUpdated: new Date().toISOString()
        });
      }
      await tx.done;
    }
  } catch (err) {
    console.warn("Could not seed demo user into IndexedDB:", err);
  }
}

/**
 * Real user registration stored directly in IndexedDB
 */
export async function dbRegisterUser(userData) {
  const db = await getDb();
  const tx = db.transaction(["users", "userProgress"], "readwrite");
  const usersStore = tx.objectStore("users");

  const email = (userData.email || "").toLowerCase().trim();
  const emailIndex = usersStore.index("by_email");
  const existing = await emailIndex.get(email);
  if (existing) {
    throw new Error("Un compte existe déjà avec cette adresse email.");
  }

  const userId = userData.id || `user-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const activeTargetLanguage = userData.activeTargetLanguage || "de";
  const enrolledLanguages = userData.enrolledLanguages || [activeTargetLanguage];

  const newUser = {
    id: userId,
    name: userData.name || "Apprenant",
    email,
    password: userData.password || "password123",
    avatar: userData.avatar || "👤",
    nativeLanguage: userData.nativeLanguage || "fr",
    activeTargetLanguage,
    enrolledLanguages,
    dailyGoalMinutes: userData.dailyGoalMinutes || 30,
    createdAt: new Date().toISOString()
  };

  await usersStore.put(newUser);

  // Initialize fresh progress records in IndexedDB for each enrolled language
  const upStore = tx.objectStore("userProgress");
  for (const langId of enrolledLanguages) {
    const key = `${userId}_${langId}`;
    await upStore.put({
      key,
      userId,
      languageId: langId,
      xp: 0,
      streak: 1,
      level: "A1",
      wordsLearned: 0,
      retentionRate: 100,
      completedLessons: [],
      unitProgress: {},
      unlockedOverrides: {},
      srsCards: {},
      starredCards: [],
      readingScores: {},
      grammarStats: {},
      examHistory: [],
      dailyStudyMinutes: {},
      lastActiveDate: new Date().toISOString().split("T")[0],
      lastUpdated: new Date().toISOString()
    });
  }

  await tx.done;
  broadcastDbChange("USERS_UPDATED");
  return newUser;
}

/**
 * Real user login verified against IndexedDB
 */
export async function dbLoginUser(email, password) {
  await seedDemoUserIfEmpty();
  const db = await getDb();
  const usersStore = db.transaction("users", "readonly").objectStore("users");
  const emailIndex = usersStore.index("by_email");
  const user = await emailIndex.get((email || "").toLowerCase().trim());

  if (!user) {
    throw new Error("Aucun compte trouvé avec cette adresse email.");
  }

  if (password && user.password && user.password !== password) {
    throw new Error("Mot de passe incorrect.");
  }

  return user;
}

/**
 * Retrieve user by ID from IndexedDB
 */
export async function dbGetUser(userId) {
  if (!userId) return null;
  const db = await getDb();
  return await db.get("users", userId);
}

/**
 * Update user profile in IndexedDB
 */
export async function dbUpdateUser(userId, updates) {
  const db = await getDb();
  const tx = db.transaction("users", "readwrite");
  const usersStore = tx.objectStore("users");
  const current = await usersStore.get(userId);
  if (!current) throw new Error("Utilisateur introuvable");

  const updated = { ...current, ...updates };
  await usersStore.put(updated);
  await tx.done;
  broadcastDbChange("USERS_UPDATED", { userId });
  return updated;
}

/**
 * Retrieve all registered users
 */
export async function dbGetUsers() {
  const db = await getDb();
  return await db.getAll("users");
}

/**
 * Retrieve user progress for a specific target language
 */
export async function dbGetUserProgress(userId, languageId) {
  if (!userId || !languageId) return null;
  const db = await getDb();
  const key = `${userId}_${languageId}`;
  const record = await db.get("userProgress", key);
  if (record && !Array.isArray(record.completedLessons)) {
    record.completedLessons = [];
  }
  return record;
}

/**
 * Save user progress for a specific target language
 */
export async function dbSaveUserProgress(userId, languageId, progressData) {
  if (!userId || !languageId) return null;
  const db = await getDb();
  const key = `${userId}_${languageId}`;
  const existing = (await db.get("userProgress", key)) || {};

  let safeCompleted = [];
  if (Array.isArray(progressData?.completedLessons)) {
    safeCompleted = progressData.completedLessons;
  } else if (Array.isArray(existing?.completedLessons)) {
    safeCompleted = existing.completedLessons;
  }

  const merged = {
    ...existing,
    ...progressData,
    completedLessons: safeCompleted,
    key,
    userId,
    languageId,
    lastUpdated: new Date().toISOString()
  };
  await safeDbWrite("userProgress", merged);
  broadcastDbChange("PROGRESS_UPDATED", { userId, languageId });
  return merged;
}

/**
 * Retrieve all progress records across all languages for a user
 */
export async function dbGetAllUserLanguageProgresses(userId) {
  if (!userId) return [];
  const db = await getDb();
  const tx = db.transaction("userProgress", "readonly");
  const index = tx.objectStore("userProgress").index("by_userId");
  return await index.getAll(userId);
}
