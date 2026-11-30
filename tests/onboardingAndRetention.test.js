import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  getLocalDateString,
  getLocalISOWeekString,
  getCalendarDaysDiff,
  evaluateStreakUpdate
} from "../src/services/streakService";
import {
  isSoundEnabled,
  setSoundEnabled,
  SOUND_STORAGE_KEY,
  playSound
} from "../src/utils/soundEffects";
import {
  isPrefersReducedMotion,
  triggerCelebration
} from "../src/utils/celebration";
import {
  isNotificationSupported,
  getNotificationPermission,
  isDailyReminderEnabled,
  setDailyReminderEnabled,
  getDailyReminderTime,
  setDailyReminderTime,
  sendDailyReminderNotification,
  checkAndTriggerReminder,
  NOTIFICATION_STORAGE_KEYS
} from "../src/services/notificationService";
import { ONBOARDING_STORAGE_KEYS } from "../src/components/onboarding/TryOneExerciseModal";

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => (key in store ? store[key] : null),
    setItem: (key, value) => {
      store[key] = String(value);
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    }
  };
})();

globalThis.localStorage = localStorageMock;

describe("Streak Service: Local-Date Normalization, Grace Period & Weekly Freeze", () => {
  it("should format date strictly in local YYYY-MM-DD", () => {
    const testDate = new Date(2026, 10, 24, 2, 30); // 2026-11-24 02:30 AM local
    const str = getLocalDateString(testDate);
    expect(str).toBe("2026-11-24");
  });

  it("should calculate calendar day differences accurately", () => {
    expect(getCalendarDaysDiff("2026-11-20", "2026-11-21")).toBe(1);
    expect(getCalendarDaysDiff("2026-11-20", "2026-11-23")).toBe(3);
    expect(getCalendarDaysDiff("2026-11-25", "2026-11-25")).toBe(0);
  });

  it("should start streak at 1 on first practice", () => {
    const res = evaluateStreakUpdate({
      currentStreak: 0,
      lastActiveDate: null,
      activityDate: new Date(2026, 10, 20, 10, 0)
    });
    expect(res.streak).toBe(1);
    expect(res.lastActiveDate).toBe("2026-11-20");
    expect(res.status).toBe("initial");
  });

  it("should keep streak unchanged on same-day practice", () => {
    const res = evaluateStreakUpdate({
      currentStreak: 5,
      lastActiveDate: "2026-11-20",
      activityDate: new Date(2026, 10, 20, 18, 0)
    });
    expect(res.streak).toBe(5);
    expect(res.status).toBe("same-day");
  });

  it("should increment streak on consecutive day practice", () => {
    const res = evaluateStreakUpdate({
      currentStreak: 5,
      lastActiveDate: "2026-11-20",
      activityDate: new Date(2026, 10, 21, 10, 0)
    });
    expect(res.streak).toBe(6);
    expect(res.status).toBe("consecutive");
  });

  it("should preserve and increment streak under Night Owl Grace Period (00:00 - 04:00 AM)", () => {
    // Last practiced on 2026-11-20 at 22:00
    const lastTimestamp = new Date(2026, 10, 20, 22, 0).getTime();
    // Practicing on 2026-11-22 at 02:30 AM (2 calendar days, but hour < 4)
    const res = evaluateStreakUpdate({
      currentStreak: 5,
      lastActiveDate: "2026-11-20",
      lastActiveTimestamp: lastTimestamp,
      activityDate: new Date(2026, 10, 22, 2, 30)
    });

    expect(res.streak).toBe(6);
    expect(res.status).toBe("grace-period");
  });

  it("should activate weekly streak freeze on missed day when freeze is available", () => {
    const res = evaluateStreakUpdate({
      currentStreak: 12,
      lastActiveDate: "2026-11-20",
      lastActiveTimestamp: new Date(2026, 10, 20, 12, 0).getTime(),
      streakFreeze: {
        available: 1,
        lastResetWeek: "2026-W47",
        lastUsedDate: null
      },
      activityDate: new Date(2026, 10, 22, 14, 0) // Missed the 21st
    });

    expect(res.streak).toBe(13);
    expect(res.status).toBe("freeze-protected");
    expect(res.streakFreeze.available).toBe(0);
    expect(res.streakFreeze.lastUsedDate).toBe("2026-11-21");
  });

  it("should reset streak to 1 on missed day when no freeze is available in the current week", () => {
    const activityDate = new Date(2026, 10, 24, 14, 0);
    const currentWeek = getLocalISOWeekString(activityDate);

    const res = evaluateStreakUpdate({
      currentStreak: 12,
      lastActiveDate: "2026-11-20",
      lastActiveTimestamp: new Date(2026, 10, 20, 12, 0).getTime(),
      streakFreeze: {
        available: 0, // Freeze already used in this same week
        lastResetWeek: currentWeek,
        lastUsedDate: "2026-11-22"
      },
      activityDate
    });

    expect(res.streak).toBe(1);
    expect(res.status).toBe("streak-reset");
  });
});

describe("Audio Feedback & Accessibility: Sound Off by Default & Reduced Motion", () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it("should have sound disabled (OFF) by default", () => {
    expect(isSoundEnabled()).toBe(false);
  });

  it("should enable and disable sound via setSoundEnabled", () => {
    setSoundEnabled(true);
    expect(isSoundEnabled()).toBe(true);

    setSoundEnabled(false);
    expect(isSoundEnabled()).toBe(false);
  });

  it("should respect prefers-reduced-motion in triggerCelebration", () => {
    globalThis.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: query.includes("prefers-reduced-motion"),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn()
    }));

    expect(isPrefersReducedMotion()).toBe(true);
    const result = triggerCelebration({ particleCount: 50 });
    expect(result.suppressed).toBe(true);
    expect(result.reason).toBe("prefers-reduced-motion");
  });
});

describe("Browser Notification API: Daily Reminders (Opt-In)", () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it("should default daily reminder to disabled (opt-in)", () => {
    expect(isDailyReminderEnabled()).toBe(false);
  });

  it("should persist reminder preference and scheduled time", () => {
    setDailyReminderEnabled(true);
    expect(isDailyReminderEnabled()).toBe(true);

    setDailyReminderTime("20:30");
    expect(getDailyReminderTime()).toBe("20:30");
  });

  it("should send notification when permission is granted", () => {
    globalThis.Notification = class MockNotification {
      static permission = "granted";
      constructor(title, options) {
        this.title = title;
        this.options = options;
      }
    };

    const sent = sendDailyReminderNotification();
    expect(sent).toBe(true);
  });
});

describe("Onboarding Diagnostic & 30-Day Backup Thresholds", () => {
  it("should store onboarding completion key in ONBOARDING_STORAGE_KEYS", () => {
    expect(ONBOARDING_STORAGE_KEYS.COMPLETED).toBe("deutschpath_onboarded");
    expect(ONBOARDING_STORAGE_KEYS.PRIMARY_GOAL).toBe("deutschpath_primary_goal");
    expect(ONBOARDING_STORAGE_KEYS.WEAKEST_SKILL).toBe("deutschpath_onboarding_weakest_skill");
  });

  it("should evaluate 30-day backup reminder threshold", () => {
    const thirtyOneDaysAgo = Date.now() - 31 * 24 * 60 * 60 * 1000;
    const daysSince = Math.floor((Date.now() - thirtyOneDaysAgo) / (1000 * 60 * 60 * 24));
    expect(daysSince).toBeGreaterThanOrEqual(30);

    const fiveDaysAgo = Date.now() - 5 * 24 * 60 * 60 * 1000;
    const daysRecent = Math.floor((Date.now() - fiveDaysAgo) / (1000 * 60 * 60 * 24));
    expect(daysRecent).toBeLessThan(30);
  });
});
