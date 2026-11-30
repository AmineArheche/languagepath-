import { z } from "zod";
import { getDb, safeDbWrite } from "../storage/db";

export const DAILY_AI_QUERY_LIMIT = 50;

/**
 * Zod Schema for ContextTutor structured output
 */
export const ContextTutorResponseSchema = z.object({
  explanation: z.string().min(1, "Explanation is required"),
  highlightSpans: z
    .array(
      z.object({
        start: z.number().int().optional(),
        end: z.number().int().optional(),
        text: z.string().min(1)
      })
    )
    .default([]),
  redemittel: z
    .array(
      z.object({
        de: z.string().min(1),
        native: z.string().min(1),
        useCase: z.string().default("general")
      })
    )
    .default([]),
  newWords: z
    .array(
      z.object({
        german: z.string().min(1),
        article: z.enum(["der", "die", "das"]).nullable().optional(),
        english: z.string().min(1),
        plural: z.string().default("-")
      })
    )
    .default([])
});

/**
 * Simple deterministic hash for cache keys
 */
export function generateCacheKey(context, actionType, userQuery = "") {
  const qStr = `${context.type}_${context.level}_${context.question || ""}_${(context.passage || "").slice(0, 80)}_${actionType}_${userQuery}`;
  let hash = 0;
  for (let i = 0; i < qStr.length; i++) {
    hash = (hash << 5) - hash + qStr.charCodeAt(i);
    hash |= 0;
  }
  return `ai_cache_${Math.abs(hash).toString(36)}`;
}

/**
 * Retrieves cached response from IndexedDB aiCache store
 */
export async function getCachedTutorResponse(cacheKey) {
  try {
    const db = await getDb();
    const entry = await db.get("aiCache", cacheKey);
    if (entry && entry.response) {
      return entry.response;
    }
  } catch (err) {
    console.warn("Could not read from aiCache:", err);
  }
  return null;
}

/**
 * Writes response to IndexedDB aiCache store
 */
export async function setCachedTutorResponse(cacheKey, response) {
  try {
    await safeDbWrite("aiCache", {
      key: cacheKey,
      response,
      timestamp: Date.now()
    });
  } catch (err) {
    console.warn("Could not write to aiCache:", err);
  }
}

/**
 * Tracks daily AI queries for rate-limit friendly meter
 */
export function getDailyQueryStats() {
  const today = new Date().toISOString().split("T")[0];
  try {
    const raw = localStorage.getItem("deutschpath_ai_queries_today");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.date === today) {
        return { date: today, count: parsed.count || 0, limit: DAILY_AI_QUERY_LIMIT };
      }
    }
  } catch {
    // ignore corrupted localStorage read
  }
  return { date: today, count: 0, limit: DAILY_AI_QUERY_LIMIT };
}

export function incrementDailyQueryCount() {
  const stats = getDailyQueryStats();
  const next = { date: stats.date, count: stats.count + 1 };
  try {
    localStorage.setItem("deutschpath_ai_queries_today", JSON.stringify(next));
  } catch {
    // ignore localStorage quota error
  }
  return next.count;
}

/**
 * Get active native language setting
 */
export function getLearnerNativeLanguage() {
  try {
    const stored = localStorage.getItem("deutschpath_native_lang");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (typeof parsed === "string" && parsed.trim()) return parsed.trim();
      } catch {
        if (typeof stored === "string" && stored.trim()) return stored.trim();
      }
    }
  } catch {
    // fallback to English
  }
  return "English";
}

/**
 * Constructs the system prompt for ContextTutor
 */
export function buildContextTutorPrompt(context, actionType, userQuery = "", nativeLanguage = "English") {
  const attemptCount = context.attemptCount || 0;
  const hasAttempted = attemptCount > 0 || Boolean(context.userAnswer) || Boolean(context.userDraft);

  return `You are "DeutschPath ContextTutor", an expert CEFR-certified German language teacher.
You assist a student practicing German at CEFR Level ${context.level || "A1"}.

EXERCISE CONTEXT:
- Module Type: ${context.type || "general"}
- CEFR Level: ${context.level || "A1"}
- Question / Prompt: "${context.question || ""}"
- Relevant Passage / Audio Script: "${(context.passage || "").slice(0, 600)}"
- Options: ${JSON.stringify(context.options || [])}
- Learner's Selected Answer: "${context.userAnswer || "Not answered yet"}"
- Learner's Written Draft: "${context.userDraft || ""}"
- Attempt Count: ${attemptCount}
- Learner's Native Language: ${nativeLanguage}

CRITICAL PEDAGOGICAL RULES:
1. HINT LADDER RULE:
   - If the action is "hint": Provide a helpful clue or leading question without revealing the answer.
   - If the action is "rule": Explain the underlying German grammar or reading comprehension rule clearly.
   - If the action is "full_answer":
     ${
       !hasAttempted
         ? "STRICT LOCK: The learner has NOT attempted this exercise yet (attemptCount = 0). You must REFUSE to give the final solution. Tell them kindly in " +
           nativeLanguage +
           " to try choosing or writing an answer first before unlocking the full solution!"
         : "The learner has attempted the question. Provide the complete solution with full grammatical breakdown."
     }
2. LANGUAGE & LEVEL BOUNDARIES:
   - Write all explanations, distractor rationales, and translations in the learner's native language (${nativeLanguage}).
   - Any German example sentences or vocabulary you introduce MUST be strictly capped at CEFR Level ${context.level || "A1"}.
3. REDEMITTEL (Useful Phrases):
   - Provide 1 to 3 authentic, level-appropriate German phrases ("Redemittel") directly useful for this task.
   - For each Redemittel, supply:
     - "de": the exact German sentence or phrase starter
     - "native": natural translation in ${nativeLanguage}
     - "useCase": brief label (e.g., "Opinion", "Reasoning", "Greeting", "Describing routine")
4. NEW WORDS:
   - Extract 1 to 3 key vocabulary words from the context.
   - Supply: "german" (clean headword), "article" ("der", "die", "das" or null), "english", "plural".
5. HIGHLIGHT SPANS:
   - If answering why an option is right or wrong, identify the exact substring evidence in the passage that proves it.
   - Supply "text" with the exact matching phrase.

ACTION REQUESTED:
Action Type: ${actionType}
User Query: "${userQuery}"

You MUST respond strictly in valid JSON matching this schema:
{
  "explanation": "Clear explanation in ${nativeLanguage}...",
  "highlightSpans": [{ "text": "exact substring in passage" }],
  "redemittel": [{ "de": "German phrase", "native": "Translation in ${nativeLanguage}", "useCase": "Usage label" }],
  "newWords": [{ "german": "Word", "article": "der|die|das|null", "english": "English", "plural": "die Words" }]
}`;
}

/**
 * Offline rule-based fallback generator when no API key or network fails
 */
export function getOfflineTutorFallback(context, actionType, _userQuery = "") {
  const attemptCount = context.attemptCount || 0;
  const hasAttempted = attemptCount > 0 || Boolean(context.userAnswer) || Boolean(context.userDraft);
  const level = context.level || "A1";

  if (actionType === "full_answer" && !hasAttempted) {
    return {
      explanation:
        "Versuche zuerst, eine Antwort selbstständig zu wählen! (Please make your first attempt before unlocking the full answer).",
      highlightSpans: [],
      redemittel: [
        {
          de: "Ich bin mir nicht sicher, aber...",
          native: "I am not sure, but...",
          useCase: "Expressing uncertainty"
        }
      ],
      newWords: []
    };
  }

  // Pre-configured pedagogical responses by module type
  if (context.type === "reading") {
    let explanation = `Notice the key keywords in the question: "${context.question}". Match them directly with the corresponding sentence in the passage.`;
    if (actionType === "hint") {
      explanation = `Look closely at the passage for clues related to "${context.question}". Pay special attention to time, numbers, or action verbs.`;
    } else if (actionType === "rule") {
      explanation = `In German reading comprehension, always eliminate options that contradict facts in the text. Watch out for negation words like 'nicht', 'kein', or 'leider'.`;
    } else if (actionType === "full_answer") {
      explanation = context.correctAnswer
        ? `The correct answer is "${context.correctAnswer}". This is directly supported by the passage evidence.`
        : "Compare the text statements against each option carefully.";
    }

    return {
      explanation,
      highlightSpans: context.passage ? [{ text: context.passage.slice(0, 40) }] : [],
      redemittel: [
        {
          de: "Im Text steht, dass...",
          native: "In the text it states that...",
          useCase: "Citing text evidence"
        },
        {
          de: "Daraus folgt, dass...",
          native: "From this it follows that...",
          useCase: "Drawing conclusions"
        }
      ],
      newWords: [
        {
          german: "Verständnis",
          article: "das",
          english: "comprehension / understanding",
          plural: "-"
        }
      ]
    };
  }

  if (context.type === "schreiben") {
    return {
      explanation:
        "For writing tasks at this level, ensure your sentences follow the V2 rule (verb in second position) in main clauses and verb-last in subordinate clauses with 'weil' or 'dass'.",
      highlightSpans: [],
      redemittel: [
        {
          de: "Sehr geehrte Damen und Herren,",
          native: "Dear Sir or Madam,",
          useCase: "Formal letter salutation"
        },
        {
          de: "Ich schreibe Ihnen, weil...",
          native: "I am writing to you because...",
          useCase: "Stating purpose of email"
        },
        {
          de: "Mit freundlichen Grüßen",
          native: "Sincerely / Best regards",
          useCase: "Formal sign-off"
        }
      ],
      newWords: [
        {
          german: "Nachricht",
          article: "die",
          english: "message",
          plural: "die Nachrichten"
        }
      ]
    };
  }

  if (context.type === "hoeren") {
    return {
      explanation:
        actionType === "hint"
          ? "In listening exercises, listen for key numbers, station platforms, and times. Key details are often repeated in official announcements."
          : "Focus on signal words: 'Achtung', 'nicht von Gleis X, sondern...', and time shifts like 'verschoben auf'.",
      highlightSpans: [],
      redemittel: [
        {
          de: "Könnten Sie das bitte wiederholen?",
          native: "Could you please repeat that?",
          useCase: "Asking for repetition"
        }
      ],
      newWords: [
        {
          german: "Durchsage",
          article: "die",
          english: "announcement",
          plural: "die Durchsagen"
        }
      ]
    };
  }

  // Grammar fallback
  return {
    explanation:
      actionType === "hint"
        ? `Consider which case is required by the verb or preposition in "${context.question}".`
        : `German grammar rule: Verify subject-verb agreement and whether the verb governs nominative, accusative, or dative.`,
    highlightSpans: [],
    redemittel: [
      {
        de: "Meiner Meinung nach...",
        native: "In my opinion...",
        useCase: "Expressing an opinion"
      }
    ],
    newWords: [
      {
        german: "Regel",
        article: "die",
        english: "rule",
        plural: "die Regeln"
      }
    ]
  };
}

/**
 * Main query function for ContextTutor:
 * 1. Checks IndexedDB aiCache
 * 2. If not cached, queries Gemini API with structured JSON output
 * 3. Validates with Zod, retrying once on parse failure
 * 4. Falls back to static offline pedagogical engine
 * 5. Caches valid responses in IndexedDB
 */
export async function queryContextTutor({
  context,
  actionType = "hint", // "hint" | "rule" | "full_answer" | "why_not" | "explain_word" | "redemittel" | "custom"
  userQuery = "",
  apiKey = ""
}) {
  const nativeLanguage = getLearnerNativeLanguage();
  const cacheKey = generateCacheKey(context, actionType, userQuery);

  // 1. Check IndexedDB aiCache
  const cachedResponse = await getCachedTutorResponse(cacheKey);
  if (cachedResponse) {
    return {
      ...cachedResponse,
      fromCache: true
    };
  }

  // Enforce Hint Ladder in pre-flight: never give full answer before attempt
  const attemptCount = context.attemptCount || 0;
  const hasAttempted = attemptCount > 0 || Boolean(context.userAnswer) || Boolean(context.userDraft);
  if (actionType === "full_answer" && !hasAttempted) {
    const refusal = getOfflineTutorFallback(context, actionType, userQuery);
    return { ...refusal, fromCache: false };
  }

  const activeKey =
    apiKey ||
    (typeof localStorage !== "undefined" &&
      JSON.parse(localStorage.getItem("deutschpath_gemini_api_key") || '""')) ||
    "";

  // If no API key, return offline rule-based fallback
  if (!activeKey || activeKey.trim() === "" || activeKey.includes("your_")) {
    const offlineResult = getOfflineTutorFallback(context, actionType, userQuery);
    await setCachedTutorResponse(cacheKey, offlineResult);
    return {
      ...offlineResult,
      fromCache: false,
      isOffline: true
    };
  }

  const prompt = buildContextTutorPrompt(context, actionType, userQuery, nativeLanguage);

  // Helper to execute single API attempt
  const executeApiCall = async (retryPromptSuffix = "") => {
    const model = "gemini-1.5-flash";
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${activeKey}`;

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt + (retryPromptSuffix ? `\n\n${retryPromptSuffix}` : "") }]
          }
        ],
        generationConfig: {
          temperature: 0.3,
          response_mime_type: "application/json"
        }
      })
    });

    if (!res.ok) {
      throw new Error(`Gemini API error: HTTP ${res.status}`);
    }

    const data = await res.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const cleanJson = rawText.replace(/^```json\s*/, "").replace(/\s*```$/, "").trim();
    const parsed = JSON.parse(cleanJson);
    return ContextTutorResponseSchema.parse(parsed);
  };

  try {
    let result;
    try {
      // First attempt
      result = await executeApiCall();
    } catch (firstErr) {
      console.warn("First ContextTutor attempt failed, retrying once:", firstErr);
      // Retry once with explicit schema reminder
      result = await executeApiCall(
        "RETRY INSTRUCTION: Output ONLY valid JSON matching: { explanation: string, highlightSpans: [], redemittel: [], newWords: [] }"
      );
    }

    incrementDailyQueryCount();
    await setCachedTutorResponse(cacheKey, result);

    return {
      ...result,
      fromCache: false
    };
  } catch (finalErr) {
    console.warn("Gemini ContextTutor failed, using pedagogical fallback:", finalErr);
    const fallback = getOfflineTutorFallback(context, actionType, userQuery);
    return {
      ...fallback,
      fromCache: false,
      apiWarning: "Could not reach Gemini tutor. Showing verified offline explanation."
    };
  }
}
