/**
 * src/services/notificationService.js
 *
 * Browser Notification API integration for daily opt-in study reminders.
 * Operates 100% locally on-device without any push server or third-party tracking.
 */

import { getLocalDateString } from "./streakService";

export const NOTIFICATION_STORAGE_KEYS = {
  ENABLED: "deutschpath_daily_reminder_enabled",
  TIME: "deutschpath_daily_reminder_time",
  LAST_FIRED_DATE: "deutschpath_reminder_last_fired_date"
};

function getStorage() {
  if (typeof window !== "undefined" && window.localStorage) return window.localStorage;
  if (typeof globalThis !== "undefined" && globalThis.localStorage) return globalThis.localStorage;
  return null;
}

export function isNotificationSupported() {
  return (
    (typeof window !== "undefined" && "Notification" in window) ||
    (typeof globalThis !== "undefined" && "Notification" in globalThis)
  );
}

export function getNotificationPermission() {
  if (!isNotificationSupported()) return "unsupported";
  const NotificationClass = typeof Notification !== "undefined" ? Notification : globalThis.Notification;
  return NotificationClass ? NotificationClass.permission : "unsupported";
}

export async function requestNotificationPermission() {
  if (!isNotificationSupported()) return "unsupported";
  try {
    const NotificationClass = typeof Notification !== "undefined" ? Notification : globalThis.Notification;
    const permission = await NotificationClass.requestPermission();
    return permission;
  } catch (err) {
    console.warn("Notification permission request error:", err);
    return "denied";
  }
}

export function isDailyReminderEnabled() {
  const storage = getStorage();
  if (!storage) return false;
  try {
    return storage.getItem(NOTIFICATION_STORAGE_KEYS.ENABLED) === "true";
  } catch {
    return false;
  }
}

export function setDailyReminderEnabled(enabled) {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.setItem(NOTIFICATION_STORAGE_KEYS.ENABLED, String(Boolean(enabled)));
  } catch {}
}

export function getDailyReminderTime() {
  const storage = getStorage();
  if (!storage) return "19:00";
  try {
    return storage.getItem(NOTIFICATION_STORAGE_KEYS.TIME) || "19:00";
  } catch {
    return "19:00";
  }
}

export function setDailyReminderTime(time) {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.setItem(NOTIFICATION_STORAGE_KEYS.TIME, time);
  } catch {}
}

export function sendDailyReminderNotification() {
  if (!isNotificationSupported()) {
    return false;
  }
  const NotificationClass = typeof Notification !== "undefined" ? Notification : globalThis.Notification;
  if (!NotificationClass || NotificationClass.permission !== "granted") {
    return false;
  }

  try {
    new NotificationClass("LanguagePath - Time to Practice! 🌍", {
      body: "Keep your daily streak alive! 15 minutes of practice today will keep your memory fresh.",
      icon: "/pwa-192x192.png",
      badge: "/pwa-192x192.png",
      tag: "languagepath-daily-reminder"
    });
    return true;
  } catch (err) {
    console.warn("Failed to dispatch notification:", err);
    return false;
  }
}

/**
 * Checks whether daily reminder conditions are met and fires a notification
 */
export function checkAndTriggerReminder(hasStudiedToday = false) {
  if (!isNotificationSupported() || !isDailyReminderEnabled()) return false;
  if (Notification.permission !== "granted") return false;
  if (hasStudiedToday) return false;

  const today = getLocalDateString();
  const lastFired = localStorage.getItem(NOTIFICATION_STORAGE_KEYS.LAST_FIRED_DATE);
  if (lastFired === today) return false; // Already notified today

  const reminderTime = getDailyReminderTime(); // e.g. "19:00"
  const [remHour, remMin] = reminderTime.split(":").map(Number);
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const targetMinutes = remHour * 60 + remMin;

  if (currentMinutes >= targetMinutes) {
    const sent = sendDailyReminderNotification();
    if (sent) {
      try {
        localStorage.setItem(NOTIFICATION_STORAGE_KEYS.LAST_FIRED_DATE, today);
      } catch {}
    }
    return sent;
  }

  return false;
}
