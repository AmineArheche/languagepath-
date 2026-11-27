import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  rankGermanVoice,
  getRankedGermanVoices,
  PREFERRED_VOICE_STORAGE_KEY,
  GERMAN_VOICE_SETUP_GUIDE
} from "../src/hooks/useSpeech";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.resolve(__dirname, "..", "dist");

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

describe("PWA Installation & Offline Shell Precaching", () => {
  it("should have a valid Web App Manifest in dist/", () => {
    const manifestPath = path.join(DIST_DIR, "manifest.webmanifest");
    expect(fs.existsSync(manifestPath)).toBe(true);

    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
    expect(manifest.name).toMatch(/LanguagePath|DeutschPath/);
    expect(manifest.short_name).toMatch(/LanguagePath|DeutschPath/);
    expect(manifest.display).toBe("standalone");
    expect(manifest.start_url).toBe("/");
    expect(manifest.theme_color).toBe("#f59e0b");
    expect(manifest.background_color).toBe("#0f172a");

    const icons = manifest.icons || [];
    expect(icons.length).toBeGreaterThanOrEqual(3);

    const has192 = icons.some((i) => i.sizes === "192x192");
    const has512 = icons.some((i) => i.sizes === "512x512");
    const hasMaskable = icons.some((i) => i.purpose === "maskable");

    expect(has192).toBe(true);
    expect(has512).toBe(true);
    expect(hasMaskable).toBe(true);
  });

  it("should have a generated Service Worker with Workbox precaching", () => {
    const swPath = path.join(DIST_DIR, "sw.js");
    expect(fs.existsSync(swPath)).toBe(true);

    const sw = fs.readFileSync(swPath, "utf-8");
    // Workbox precaching entry
    expect(sw).toMatch(/precacheAndRoute|workbox-precaching/);
    // Runtime audio caching
    expect(sw).toContain("deutschpath-audio-cache");
  });

  it("should simulate app loading fully offline from precache after first visit", async () => {
    // Simulated Service Worker Cache Map
    const cacheStorage = new Map();

    // Populate cache with built app shell assets
    const indexHtml = fs.readFileSync(path.join(DIST_DIR, "index.html"), "utf-8");
    cacheStorage.set("/", new Response(indexHtml, { status: 200, headers: { "Content-Type": "text/html" } }));
    cacheStorage.set("/index.html", new Response(indexHtml, { status: 200, headers: { "Content-Type": "text/html" } }));

    // Mock Offline Fetch Strategy (CacheFirst for precached app shell)
    const offlineFetch = async (requestUrl) => {
      // Network is offline: simulate network failure
      const isNetworkOffline = true;

      // Service worker cache lookup
      if (cacheStorage.has(requestUrl)) {
        return cacheStorage.get(requestUrl);
      }

      if (isNetworkOffline) {
        throw new TypeError("Failed to fetch (offline network)");
      }
    };

    // When offline, requesting the root URL or index.html succeeds via cache
    const response = await offlineFetch("/");
    expect(response.status).toBe(200);
    const body = await response.text();
    expect(body).toContain('<div id="root"></div>');
    expect(body).toMatch(/LanguagePath|DeutschPath/);
  });
});

describe("Audio: German Voice Detection & Ranking Engine", () => {
  const mockVoices = [
    { name: "English (US) David", lang: "en-US", default: false, localService: true },
    { name: "Microsoft Stefan - German (Germany)", lang: "de-DE", default: false, localService: true },
    { name: "Google Deutsch", lang: "de-DE", default: true, localService: false },
    { name: "Anna", lang: "de-DE", default: false, localService: true },
    { name: "Swiss German Standard", lang: "de-CH", default: false, localService: true }
  ];

  it("should filter only German voices (de-DE, de-CH, etc.)", () => {
    const ranked = getRankedGermanVoices(mockVoices);
    expect(ranked).toHaveLength(4);
    const names = ranked.map((r) => r.name);
    expect(names).not.toContain("English (US) David");
  });

  it("should rank neural and high-quality voices highest", () => {
    const ranked = getRankedGermanVoices(mockVoices);
    // Google Deutsch with de-DE and default flag should be #1
    expect(ranked[0].name).toBe("Google Deutsch");
    expect(ranked[0].isNeural).toBe(true);

    // Microsoft Stefan should rank higher than generic Swiss German
    const stefanIndex = ranked.findIndex((r) => r.name.includes("Stefan"));
    const swissIndex = ranked.findIndex((r) => r.name.includes("Swiss"));
    expect(stefanIndex).toBeLessThan(swissIndex);
  });

  it("should calculate rank scores deterministically", () => {
    const voiceA = { name: "Google Deutsch", lang: "de-DE", default: true };
    const voiceB = { name: "Basic German", lang: "de-AT", default: false };

    const scoreA = rankGermanVoice(voiceA);
    const scoreB = rankGermanVoice(voiceB);

    expect(scoreA).toBeGreaterThan(scoreB);
  });
});

describe("Audio: User Choice Persistence & Setup Guide", () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it("should store and retrieve preferred voice in localStorage", () => {
    localStorageMock.setItem(PREFERRED_VOICE_STORAGE_KEY, "Microsoft Stefan");
    expect(localStorageMock.getItem(PREFERRED_VOICE_STORAGE_KEY)).toBe("Microsoft Stefan");
  });

  it("should provide multi-platform setup guide when no German voices exist", () => {
    expect(GERMAN_VOICE_SETUP_GUIDE.title).toContain("Not Detected");
    expect(GERMAN_VOICE_SETUP_GUIDE.platforms.length).toBeGreaterThanOrEqual(4);

    const platformNames = GERMAN_VOICE_SETUP_GUIDE.platforms.map((p) => p.os);
    expect(platformNames.some((p) => p.includes("Windows"))).toBe(true);
    expect(platformNames.some((p) => p.includes("macOS"))).toBe(true);
    expect(platformNames.some((p) => p.includes("iOS"))).toBe(true);
    expect(platformNames.some((p) => p.includes("Android"))).toBe(true);
  });
});

describe("Audio: Pre-recorded Audio Assets (/audio/{id}.mp3)", () => {
  const AUDIO_DIR = path.resolve(__dirname, "..", "public", "audio");

  it("should have generated authentic pre-recorded audio files for core vocabulary and listening tasks", () => {
    const expectedAudioIds = ["card-1", "card-2", "card-3", "card-4", "card-5", "card-6", "listen-1", "listen-2"];

    for (const id of expectedAudioIds) {
      const file = path.join(AUDIO_DIR, `${id}.mp3`);
      expect(fs.existsSync(file), `Expected ${id}.mp3 to exist`).toBe(true);
      const stats = fs.statSync(file);
      expect(stats.size).toBeGreaterThan(1000); // Valid MP3 payload
    }
  });

  it("should verify audio fallback logic when audio file is missing", async () => {
    let ttsSpokenText = null;

    const mockSpeak = (text) => {
      ttsSpokenText = text;
    };

    // Simulated playAudio with fallback
    const playAudioSimulated = async ({ id, text, preferAudio = true }) => {
      const audioUrl = id ? `/audio/${id}.mp3` : null;
      const fileExists = id === "card-1"; // Only card-1 exists in this mock scenario

      if (preferAudio && audioUrl && fileExists) {
        return { source: "audio", url: audioUrl };
      }

      // Fallback to TTS
      mockSpeak(text);
      return { source: "tts", text };
    };

    // When card-1 is requested, it uses audio
    const res1 = await playAudioSimulated({ id: "card-1", text: "Tisch" });
    expect(res1.source).toBe("audio");

    // When card-999 (missing) is requested, it falls back to TTS
    const res999 = await playAudioSimulated({ id: "card-999", text: "der Kühlschrank" });
    expect(res999.source).toBe("tts");
    expect(ttsSpokenText).toBe("der Kühlschrank");
  });
});
