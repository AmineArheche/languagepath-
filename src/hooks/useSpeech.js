import { useState, useEffect, useCallback, useRef } from "react";

export const PREFERRED_VOICE_STORAGE_KEY = "deutschpath_preferred_voice_de";

export const GERMAN_VOICE_SETUP_GUIDE = {
  title: "German (de-DE) Speech Voice Not Detected",
  message:
    "Your browser or operating system does not currently have a native German text-to-speech voice installed.",
  platforms: [
    {
      os: "Windows 10 / 11",
      steps: "Windows Settings → Time & Language → Speech → Manage voices → Add voices → Select 'German (Germany)'."
    },
    {
      os: "macOS",
      steps: "System Settings → Accessibility → Spoken Content → System Voice → Manage Voices → Search 'German' and click Download."
    },
    {
      os: "iOS / iPadOS",
      steps: "Settings → Accessibility → Spoken Content → Voices → German → Select German (Germany) and download enhanced quality."
    },
    {
      os: "Android",
      steps: "Settings → System → Languages & Input → Text-to-speech output → Preferred engine gear icon → Install voice data → German."
    },
    {
      os: "Recommended Browsers",
      steps: "Google Chrome and Microsoft Edge include built-in neural German voices (Google Deutsch, Microsoft Stefan, Microsoft Katja) out of the box."
    }
  ]
};

// Legacy tip export for backward compatibility
export const GERMAN_VOICE_SETUP_TIP = {
  title: GERMAN_VOICE_SETUP_GUIDE.title,
  message: GERMAN_VOICE_SETUP_GUIDE.message,
  steps: GERMAN_VOICE_SETUP_GUIDE.platforms.map((p) => `${p.os}: ${p.steps}`)
};

/**
 * Calculates a pedagogical quality score for a SpeechSynthesisVoice
 */
export function rankGermanVoice(voice) {
  if (!voice) return 0;
  let score = 0;
  const name = (voice.name || "").toLowerCase();
  const lang = (voice.lang || "").toLowerCase();

  // Primary locale boost: exact de-DE preferred over de-AT / de-CH
  if (lang === "de-de" || lang === "de_de") {
    score += 35;
  } else if (lang.startsWith("de")) {
    score += 15;
  }

  // Quality heuristics based on modern browser neural & enhanced voice labels
  if (name.includes("google") || name.includes("neural") || name.includes("natural")) {
    score += 50;
  } else if (name.includes("online") || name.includes("microsoft")) {
    score += 40;
  } else if (name.includes("premium") || name.includes("enhanced")) {
    score += 35;
  } else if (
    name.includes("stefan") ||
    name.includes("katja") ||
    name.includes("amala") ||
    name.includes("conrad") ||
    name.includes("anna") ||
    name.includes("yannick") ||
    name.includes("petra")
  ) {
    score += 25;
  }

  if (voice.default) score += 10;
  if (voice.localService) score += 5;

  return score;
}

/**
 * Filters and ranks German voices
 */
export function getRankedGermanVoices(voices = []) {
  return voices
    .filter((v) => {
      const lang = (v.lang || "").toLowerCase();
      return lang.startsWith("de") || lang.includes("de-de");
    })
    .map((v) => ({
      voice: v,
      name: v.name,
      lang: v.lang,
      score: rankGermanVoice(v),
      isNeural: /google|natural|neural|online|microsoft/i.test(v.name),
      isDefault: Boolean(v.default)
    }))
    .sort((a, b) => b.score - a.score);
}

export function useSpeech({
  lang = "de-DE",
  rate: defaultRate = 0.95,
  pitch: defaultPitch = 1.0
} = {}) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeSource, setActiveSource] = useState(null); // 'audio' | 'tts' | null
  const [availableVoices, setAvailableVoices] = useState([]);
  const [germanVoice, setGermanVoice] = useState(null);
  const [hasGermanVoice, setHasGermanVoice] = useState(true);
  const [isSupported, setIsSupported] = useState(false);

  const currentAudioRef = useRef(null);

  // Load and rank voices
  const refreshVoices = useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    const rawVoices = window.speechSynthesis.getVoices();
    if (!rawVoices || rawVoices.length === 0) return;

    const ranked = getRankedGermanVoices(rawVoices);
    setAvailableVoices(ranked);
    setHasGermanVoice(ranked.length > 0);

    // Retrieve saved user preference
    let preferredName = null;
    try {
      preferredName = localStorage.getItem(PREFERRED_VOICE_STORAGE_KEY);
    } catch {
      // ignore
    }

    let chosen = null;
    if (preferredName) {
      const match = ranked.find((r) => r.name === preferredName || r.voice.voiceURI === preferredName);
      if (match) chosen = match.voice;
    }

    // Default to the top-ranked voice
    if (!chosen && ranked.length > 0) {
      chosen = ranked[0].voice;
    }

    setGermanVoice(chosen);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      setIsSupported(true);
      refreshVoices();

      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = refreshVoices;
      }
    }
  }, [refreshVoices]);

  // Allow user to select and remember a preferred voice
  const selectVoice = useCallback(
    (voiceUriOrName) => {
      const match = availableVoices.find(
        (r) => r.name === voiceUriOrName || r.voice.voiceURI === voiceUriOrName
      );
      if (match) {
        setGermanVoice(match.voice);
        try {
          localStorage.setItem(PREFERRED_VOICE_STORAGE_KEY, match.name);
        } catch {
          // ignore
        }
      }
    },
    [availableVoices]
  );

  // Stop both active audio and TTS
  const stop = useCallback(() => {
    if (currentAudioRef.current) {
      try {
        currentAudioRef.current.pause();
        currentAudioRef.current.currentTime = 0;
      } catch {}
      currentAudioRef.current = null;
    }

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }

    setIsSpeaking(false);
    setActiveSource(null);
  }, []);

  // Standard TTS speak
  const speak = useCallback(
    (text, { rate = defaultRate, pitch = defaultPitch, onStart, onEnd, onError, voice } = {}) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window) || !text) return;

      try {
        stop();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        utterance.rate = rate;
        utterance.pitch = pitch;

        const activeVoice = voice || germanVoice;
        if (activeVoice) {
          utterance.voice = activeVoice;
        }

        utterance.onstart = () => {
          setIsSpeaking(true);
          setActiveSource("tts");
          if (onStart) onStart();
        };

        utterance.onend = () => {
          setIsSpeaking(false);
          setActiveSource(null);
          if (onEnd) onEnd();
        };

        utterance.onerror = (err) => {
          setIsSpeaking(false);
          setActiveSource(null);
          if (onError) onError(err);
        };

        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn("Speech synthesis error:", err);
        setIsSpeaking(false);
        setActiveSource(null);
      }
    },
    [germanVoice, defaultRate, defaultPitch, lang, stop]
  );

  /**
   * Dual-mode Audio Player:
   * Prefers authentic pre-recorded audio file (/audio/{id}.mp3 or audioUrl) when available/cached,
   * with seamless instant fallback to ranked German TTS when missing or offline.
   */
  const playAudio = useCallback(
    async ({
      id,
      audioUrl,
      text,
      rate = defaultRate,
      pitch = defaultPitch,
      preferAudio = true,
      onStart,
      onEnd,
      onError
    } = {}) => {
      stop();

      const candidateUrl = audioUrl || (id ? `/audio/${id}.mp3` : null);

      if (preferAudio && candidateUrl && typeof window !== "undefined" && typeof Audio !== "undefined") {
        try {
          const audio = new Audio(candidateUrl);
          currentAudioRef.current = audio;

          audio.onplay = () => {
            setIsSpeaking(true);
            setActiveSource("audio");
            if (onStart) onStart();
          };

          audio.onended = () => {
            setIsSpeaking(false);
            setActiveSource(null);
            currentAudioRef.current = null;
            if (onEnd) onEnd();
          };

          audio.onerror = () => {
            // Audio file failed (404 or missing) -> Fallback to ranked TTS
            currentAudioRef.current = null;
            if (text) {
              speak(text, { rate, pitch, onStart, onEnd, onError });
            } else {
              setIsSpeaking(false);
              setActiveSource(null);
              if (onError) onError(new Error(`Failed to load audio: ${candidateUrl}`));
            }
          };

          await audio.play();
          return;
        } catch (err) {
          // Playback promise rejected (e.g. 404 or un-cached) -> Fallback to TTS
          currentAudioRef.current = null;
          if (text) {
            speak(text, { rate, pitch, onStart, onEnd, onError });
            return;
          }
        }
      }

      // No audio file specified or audio not preferred -> Use TTS
      if (text) {
        speak(text, { rate, pitch, onStart, onEnd, onError });
      }
    },
    [defaultRate, defaultPitch, speak, stop]
  );

  return {
    speak,
    playAudio,
    stop,
    isSpeaking,
    activeSource,
    isSupported,
    hasGermanVoice,
    germanVoice,
    availableVoices,
    selectVoice,
    voiceSetupTip: GERMAN_VOICE_SETUP_TIP,
    voiceSetupGuide: GERMAN_VOICE_SETUP_GUIDE
  };
}

export default useSpeech;
