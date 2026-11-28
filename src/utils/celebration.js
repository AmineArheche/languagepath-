import confetti from "canvas-confetti";
import { isSoundEnabled, playSound } from "./soundEffects";

/**
 * Checks whether user has enabled prefers-reduced-motion in OS/browser
 */
export function isPrefersReducedMotion() {
  if (typeof window !== "undefined" && window.matchMedia) {
    try {
      return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch {}
  }
  if (typeof globalThis !== "undefined" && globalThis.matchMedia) {
    try {
      return globalThis.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch {}
  }
  return false;
}

/**
 * Triggers celebration particles respecting prefers-reduced-motion
 * and plays audio fanfare only when sound is explicitly enabled by the user.
 */
export function triggerCelebration(options = {}) {
  // 1. Play sound only if user explicitly turned sound ON
  if (options.sound !== false && isSoundEnabled()) {
    playSound.fanfare();
  }

  // 2. Strict accessibility guard: Suppress canvas confetti if prefers-reduced-motion is active
  if (isPrefersReducedMotion()) {
    return { suppressed: true, reason: "prefers-reduced-motion" };
  }

  // 3. Fire confetti
  try {
    confetti({
      particleCount: options.particleCount || 75,
      spread: options.spread || 60,
      origin: options.origin || { y: 0.65 },
      colors: options.colors || ["#f59e0b", "#e11d48", "#4f46e5", "#10b981", "#fbbf24"],
      disableForReducedMotion: true,
      ...options
    });
    return { suppressed: false };
  } catch {
    return { suppressed: true, reason: "canvas-unavailable" };
  }
}

export default triggerCelebration;
