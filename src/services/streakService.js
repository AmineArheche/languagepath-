/**
 * src/services/streakService.js
 *
 * Pedagogical Streak & Motivation Management Service for DeutschPath.
 * Features:
 * 1. Strict Local-Date Normalization: Eliminates UTC midnight boundary bugs across international timezones.
 * 2. 4-Hour Post-Midnight Grace Period: Night owls practicing between 00:00 and 04:00 maintain consecutive continuity.
 * 3. Weekly Streak Freeze Protection: 1 automatic freeze per calendar week protecting streaks on missed days.
 */

/**
 * Returns YYYY-MM-DD formatted strictly according to the client's LOCAL timezone
 */
export function getLocalDateString(date = new Date()) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Returns the ISO week identifier (e.g. "2026-W48") based on local calendar dates
 */
export function getLocalISOWeekString(date = new Date()) {
  const d = new Date(date);
  // Thursday in current week decides the year (ISO 8601)
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  const weekNumber = 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
  return `${d.getFullYear()}-W${String(weekNumber).padStart(2, "0")}`;
}

/**
 * Computes calendar day difference between two local date strings (YYYY-MM-DD)
 */
export function getCalendarDaysDiff(dateStr1, dateStr2) {
  if (!dateStr1 || !dateStr2) return Infinity;
  const [y1, m1, d1] = dateStr1.split("-").map(Number);
  const [y2, m2, d2] = dateStr2.split("-").map(Number);
  const utc1 = Date.UTC(y1, m1 - 1, d1);
  const utc2 = Date.UTC(y2, m2 - 1, d2);
  return Math.round((utc2 - utc1) / 86400000);
}

/**
 * Evaluates user activity and calculates updated streak, freeze status, and transition rationale
 */
export function evaluateStreakUpdate({
  currentStreak = 1,
  lastActiveDate = null,
  lastActiveTimestamp = null,
  streakFreeze = null,
  activityDate = new Date()
}) {
  const today = getLocalDateString(activityDate);
  const currentWeek = getLocalISOWeekString(activityDate);
  const currentHour = new Date(activityDate).getHours();

  // Initialize or replenish weekly streak freeze
  let activeFreeze = streakFreeze ? { ...streakFreeze } : {
    available: 1,
    lastResetWeek: currentWeek,
    lastUsedDate: null
  };

  if (activeFreeze.lastResetWeek !== currentWeek) {
    activeFreeze = {
      available: 1,
      lastResetWeek: currentWeek,
      lastUsedDate: activeFreeze.lastUsedDate || null
    };
  }

  // 1. Same-day practice
  if (lastActiveDate === today) {
    return {
      streak: Math.max(1, currentStreak),
      lastActiveDate: today,
      lastActiveTimestamp: new Date(activityDate).getTime(),
      streakFreeze: activeFreeze,
      status: "same-day",
      message: "Practice recorded for today!"
    };
  }

  // First time practice
  if (!lastActiveDate) {
    return {
      streak: 1,
      lastActiveDate: today,
      lastActiveTimestamp: new Date(activityDate).getTime(),
      streakFreeze: activeFreeze,
      status: "initial",
      message: "First practice streak started!"
    };
  }

  const daysDiff = getCalendarDaysDiff(lastActiveDate, today);

  // 2. Consecutive day practice (practiced yesterday)
  if (daysDiff === 1) {
    return {
      streak: (currentStreak || 0) + 1,
      lastActiveDate: today,
      lastActiveTimestamp: new Date(activityDate).getTime(),
      streakFreeze: activeFreeze,
      status: "consecutive",
      message: `Streak increased to ${(currentStreak || 0) + 1} days!`
    };
  }

  // 3. Grace Period:
  // If 2 calendar days elapsed, but current local time is before 04:00 AM (night owl grace period)
  // or within 36 hours from the last practice timestamp:
  const msElapsed = lastActiveTimestamp ? new Date(activityDate).getTime() - Number(lastActiveTimestamp) : Infinity;
  const isNightOwlGrace = daysDiff === 2 && currentHour < 4;
  const is36HourGrace = msElapsed <= 36 * 3600 * 1000;

  if (isNightOwlGrace || is36HourGrace) {
    return {
      streak: (currentStreak || 0) + 1,
      lastActiveDate: today,
      lastActiveTimestamp: new Date(activityDate).getTime(),
      streakFreeze: activeFreeze,
      status: "grace-period",
      message: `Night Owl Grace Period applied! Streak extended to ${(currentStreak || 0) + 1} days.`
    };
  }

  // 4. Missed Day: Check Streak Freeze Protection
  if (activeFreeze.available > 0) {
    const d = new Date(activityDate);
    d.setDate(d.getDate() - 1);
    const missedDate = getLocalDateString(d);

    return {
      streak: (currentStreak || 0) + 1,
      lastActiveDate: today,
      lastActiveTimestamp: new Date(activityDate).getTime(),
      streakFreeze: {
        available: 0,
        lastResetWeek: currentWeek,
        lastUsedDate: missedDate
      },
      status: "freeze-protected",
      message: `Weekly Streak Freeze activated for ${missedDate}! Your ${(currentStreak || 0) + 1}-day streak is protected.`
    };
  }

  // 5. Missed Day without Streak Freeze -> Reset streak to 1
  return {
    streak: 1,
    lastActiveDate: today,
    lastActiveTimestamp: new Date(activityDate).getTime(),
    streakFreeze: activeFreeze,
    status: "streak-reset",
    message: "Streak reset to 1 day after inactivity."
  };
}
