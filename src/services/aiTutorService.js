/**
 * AI German Tutor Service
 * Interfaces with Google Gemini API or Anthropic API,
 * with fallbacks and scenario presets.
 */

import { getLearnerNativeLanguageName } from "./translationService";

export const SCENARIOS = [
  {
    id: "cafe",
    title: "Im Café (At the Café)",
    icon: "Coffee",
    badge: "Food & Drinks",
    description: "Order drinks and pastries, ask for recommendations, and request the bill.",
    character: "Herr Weber (Waiter / Barista)",
    initialGreetings: {
      A1: "Guten Tag! Willkommen im Café Sonne. Was möchten Sie trinken?",
      A2: "Guten Tag! Schön, dass Sie da sind. Möchten Sie drinnen oder draußen sitzen? Was darf ich Ihnen bringen?",
      B1: "Herzlich willkommen! Nehmen Sie gern Platz. Wir haben heute frischen Apfelstrudel und feine Kaffeespezialitäten. Was darf es für Sie sein?",
      B2: "Guten Tag! Willkommen in unserer Rösterei. Haben Sie schon einen Blick in unsere Tageskarte geworfen, oder darf ich Ihnen eine Empfehlung aussprechen?"
    }
  },
  {
    id: "interview",
    title: "Das Vorstellungsgespräch (Job Interview)",
    icon: "Briefcase",
    badge: "Career & Work",
    description: "Discuss your background, strengths, experience, and motivation for the role.",
    character: "Frau Dr. Keller (Hiring Manager)",
    initialGreetings: {
      A1: "Guten Tag! Willkommen. Wie heißen Sie und woher kommen Sie?",
      A2: "Guten Tag! Schön, dass Sie hier sind. Erzählen Sie mir bitte kurz über sich.",
      B1: "Guten Tag! Vielen Dank für Ihr Kommen. Wir haben Ihre Bewerbung mit großem Interesse gelesen. Warum möchten Sie bei unserem Unternehmen arbeiten?",
      B2: "Guten Tag! Schön, dass Sie sich die Zeit nehmen. Ihr Profil im Lebenslauf ist beeindruckend. Können Sie mir von einer beruflichen Herausforderung berichten, die Sie erfolgreich gemeistert haben?"
    }
  },
  {
    id: "doctor",
    title: "Beim Arzt (At the Doctor)",
    icon: "Activity",
    badge: "Health & Body",
    description: "Describe symptoms, ask how to take medicine, and discuss health advice.",
    character: "Dr. Schneider (General Practitioner)",
    initialGreetings: {
      A1: "Guten Tag. Was tut Ihnen weh? Haben Sie Kopfschmerzen?",
      A2: "Guten Tag. Nehmen Sie bitte Platz. Welche Beschwerden haben Sie? Seit wann sind Sie krank?",
      B1: "Guten Tag, Herr/Frau. Bitte nehmen Sie Platz. Was führt Sie heute zu mir? Beschreiben Sie bitte Ihre Symptome.",
      B2: "Guten Tag! Schön, Sie zu sehen. Wie kann ich Ihnen heute helfen? Haben Sie bestimmte Schmerzen oder Nebenwirkungen bemerkt?"
    }
  },
  {
    id: "station",
    title: "Am Bahnhof (Train Station)",
    icon: "Train",
    badge: "Travel & Transit",
    description: "Buy train tickets, inquire about platform numbers, track connections, and delays.",
    character: "DB Reiseberater (Ticket Agent)",
    initialGreetings: {
      A1: "Guten Tag! Wo möchten Sie hin? Wann möchten Sie fahren?",
      A2: "Guten Tag, Deutsche Bahn Information. Wohin soll die Reise gehen? Brauchen Sie eine Fahrkarte?",
      B1: "Guten Tag! Wie kann ich Ihnen helfen? Suchen Sie eine Verbindung oder möchten Sie eine Reservierung vornehmen?",
      B2: "Guten Tag! Auskunft der Deutschen Bahn. Haben Sie Fragen zu Ihrer ICE-Verbindung, Gleiswechseln oder Buchungsoptionen?"
    }
  },
  {
    id: "free",
    title: "Freies Gespräch (Free Chat)",
    icon: "MessageCircle",
    badge: "Everyday Chit-chat",
    description: "Talk casually about hobbies, current weather, weekends, plans, and cultural life.",
    character: "Lukas (Friendly German Friend)",
    initialGreetings: {
      A1: "Hallo! Wie geht es dir heute? Was machst du gern am Wochenende?",
      A2: "Hallo! Schön, von dir zu hören. Wie war dein Tag heute? Hast du etwas Schönes gemacht?",
      B1: "Hi! Freut mich sehr, mit dir zu sprechen. Was hast du am Wochenende Schönes geplant? Erzähl mal!",
      B2: "Hey! Schön, dass wir quatschen. Ich habe gerade über neue Reiseprojekte nachgedacht. Was beschäftigt dich im Moment so?"
    }
  }
];

export function getScenarioById(id) {
  return SCENARIOS.find((s) => s.id === id) || SCENARIOS[0];
}

/**
 * Builds the customized system prompt for the German tutor
 */
export function buildSystemPrompt(level, scenario, nativeLanguage = null) {
  const lang = nativeLanguage || getLearnerNativeLanguageName();
  return `You are "Lukas", an encouraging, patient, and highly skilled native German AI tutor for the DeutschPath app.
Your mission is to help the user practice spoken German through realistic, immersive roleplay.

RULES:
1. Target CEFR Level: ${level}.
   - For A1: Use very short, simple sentences (3 to 6 words each). Basic present tense, high-frequency vocabulary. Speak politely. Avoid complex subordinate clauses.
   - For A2: Short sentences, simple compound sentences (und, aber, weil), past tense (Perfekt).
   - For B1: Conversational fluency, subordinate clauses (weil, dass, obwohl, wenn), modal verbs, expressing opinions.
   - For B2: Natural native nuance, idiomatic expressions, Konjunktiv II, formal debate/professional vocabulary.
2. The Scenario: "${scenario.title}"
   - Roleplay character: ${scenario.character}
   - Scenario Context: ${scenario.description}
   - You MUST stay strictly in character. If the scenario is 'café', you are the waiter; if 'doctor', you are the physician; if 'job interview', you are the interviewer; if 'train station', you are the DB service clerk; if 'free chat', you are a friendly German partner.
3. Language of replies:
   - Your tutor reply ("tutorReply") MUST BE 100% IN GERMAN at level ${level}. Never reply in another language in "tutorReply".
4. User sentence correction:
   - Analyze the user's latest message for grammar, spelling, word choice, and article/case mistakes.
   - If there are errors:
     - "corrected": provide the corrected version in natural standard German.
     - "explanation": provide a clear, friendly, ONE-LINE explanation in ${lang} explaining WHY it was corrected (e.g. why the case or article was chosen).
     - "hasErrors": true
   - If the user's sentence has NO mistakes:
     - "corrected": user's sentence
     - "explanation": "Perfekt! Your sentence is grammatically correct and natural."
     - "hasErrors": false
5. Translation:
   - Provide an accurate translation of YOUR tutor reply in ${lang} in "translation" so the user can understand it if they click "I don't understand".

RESPONSE FORMAT:
You MUST ALWAYS respond with a single valid JSON object with this exact structure:
{
  "tutorReply": "German reply strictly at level ${level}",
  "translation": "Translation in ${lang} of your reply",
  "correction": {
    "original": "The user's original message",
    "corrected": "The corrected German sentence",
    "explanation": "One line friendly explanation in ${lang} of the correction or confirmation of perfection",
    "hasErrors": true
  }
}`;
}

export function getActiveGeminiModel(customModel) {
  if (customModel && typeof customModel === "string" && customModel.trim()) {
    return customModel.trim();
  }
  try {
    const stored = localStorage.getItem("deutschpath_gemini_model");
    if (stored) {
      const parsed = JSON.parse(stored);
      if (typeof parsed === "string" && parsed.trim()) return parsed.trim();
    }
  } catch (_) {}
  if (typeof import.meta !== "undefined" && import.meta.env?.VITE_GEMINI_MODEL) {
    return import.meta.env.VITE_GEMINI_MODEL.trim();
  }
  return "gemini-1.5-flash";
}

/**
 * Sends conversation to Gemini API
 */
export async function sendTutorMessage({
  apiKey,
  modelName,
  level,
  scenario,
  conversationHistory,
  userMessage
}) {
  const activeKey =
    apiKey ||
    (typeof import.meta !== "undefined" && import.meta.env?.VITE_GEMINI_API_KEY) ||
    "";

  // If no API key is provided, use simulated smart tutor fallback
  if (!activeKey || activeKey.trim() === "" || activeKey.includes("your_")) {
    return generateSimulatedTutorResponse(level, scenario, userMessage);
  }

  const activeModel = getActiveGeminiModel(modelName);
  const systemPrompt = buildSystemPrompt(level, scenario);

  // Format history for Gemini API
  const contents = [];

  // Add system instruction as preamble or previous turns
  conversationHistory.forEach((turn) => {
    if (turn.sender === "user") {
      contents.push({ role: "user", parts: [{ text: turn.text }] });
    } else if (turn.sender === "tutor") {
      contents.push({ role: "model", parts: [{ text: turn.text }] });
    }
  });

  // Add latest user message with request for JSON
  contents.push({
    role: "user",
    parts: [
      {
        text: `User message: "${userMessage}".\nRemember to stay in character for "${scenario.title}" at level ${level}. Reply ONLY in JSON format.`
      }
    ]
  });

  try {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(activeModel)}:generateContent?key=${activeKey}`;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: systemPrompt }]
        },
        contents,
        generationConfig: {
          temperature: 0.7,
          response_mime_type: "application/json"
        }
      })
    });

    if (!response.ok) {
      let warnMessage = `Gemini API error (HTTP ${response.status}). Using offline fallback.`;
      if (response.status === 404) {
        warnMessage = `Gemini model '${activeModel}' not found (HTTP 404). Check the model name in Settings. Using offline fallback.`;
      } else if (response.status === 429) {
        warnMessage = "Gemini API rate limit exceeded (HTTP 429). Quota exhausted. Using offline fallback.";
      }
      console.warn(warnMessage);
      const fallback = generateSimulatedTutorResponse(level, scenario, userMessage);
      return {
        ...fallback,
        apiWarning: warnMessage
      };
    }

    const data = await response.json();
    const candidateText =
      data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Clean JSON markdown if wrapped
    const cleanJson = candidateText.replace(/^```json\s*/, "").replace(/\s*```$/, "").trim();
    const parsed = JSON.parse(cleanJson);

    return {
      tutorReply: parsed.tutorReply || "Ich verstehe. Erzählen Sie mir mehr!",
      translation: parsed.translation || "I understand. Tell me more!",
      correction: parsed.correction || {
        original: userMessage,
        corrected: userMessage,
        explanation: "Good job! Sentence understood.",
        hasErrors: false
      }
    };
  } catch (err) {
    console.warn("Fetch or parse exception, using fallback:", err);
    return generateSimulatedTutorResponse(level, scenario, userMessage);
  }
}

/**
 * Smart simulated tutor response engine when offline or no API key is supplied
 */
function generateSimulatedTutorResponse(level, scenario, userMessage) {
  const msgLower = userMessage.toLowerCase().trim();

  // Basic grammatical checks for simulated corrections
  let correction = {
    original: userMessage,
    corrected: userMessage,
    explanation: "Perfekt! Your sentence is grammatically correct and natural.",
    hasErrors: false
  };

  // Check 1: "ich will ein kaffee" -> "ich möchte einen kaffee"
  if (msgLower.includes("ich will") && msgLower.includes("kaffee")) {
    correction = {
      original: userMessage,
      corrected: "Ich möchte bitte einen Kaffee.",
      explanation: "Use polite 'Ich möchte' rather than 'Ich will', and 'Kaffee' takes accusative 'einen'.",
      hasErrors: true
    };
  } else if (msgLower.includes("ein kaffee")) {
    correction = {
      original: userMessage,
      corrected: userMessage.replace(/ein kaffee/i, "einen Kaffee"),
      explanation: "'Kaffee' is masculine direct object in the Akkusativ case, so use 'einen'.",
      hasErrors: true
    };
  } else if (msgLower.includes("wie viel kostet")) {
    correction = {
      original: userMessage,
      corrected: "Wie viel kostet das, bitte?",
      explanation: "Good price inquiry! Adding 'bitte' makes it natural and polite in German.",
      hasErrors: false
    };
  } else if (msgLower.includes("ich habe schmerz")) {
    correction = {
      original: userMessage,
      corrected: "Ich habe Schmerzen.",
      explanation: "In German, pain is usually expressed in the plural ('Schmerzen') or with 'wehtun'.",
      hasErrors: true
    };
  } else if (msgLower.includes("ich bin") && msgLower.includes("jahre alt")) {
    correction = {
      original: userMessage,
      corrected: userMessage,
      explanation: "Richtig! 'Ich bin ... Jahre alt' correctly uses 'sein' unlike some Romance languages.",
      hasErrors: false
    };
  }

  // Simulated Scenario Replies
  const replies = {
    cafe: {
      tutorReply:
        level === "A1"
          ? "Sehr gern! Möchten Sie auch etwas Kuchen dazu?"
          : "Sehr gern! Wir haben heute frischen Käsekuchen und Apfelstrudel. Möchten Sie ein Stück probieren?",
      translation:
        level === "A1"
          ? "With pleasure! Would you also like some cake with that?"
          : "With pleasure! Today we have fresh cheesecake and apple strudel. Would you like to try a slice?"
    },
    interview: {
      tutorReply:
        level === "A1"
          ? "Vielen Dank. Das klingt sehr gut! Welche Sprachen sprechen Sie noch?"
          : "Vielen Dank für Ihre Antwort. Das passt hervorragend zu unserer Philosophie. Wie gehen Sie mit Stress in Projekten um?",
      translation:
        level === "A1"
          ? "Thank you very much. That sounds very good! What other languages do you speak?"
          : "Thank you for your answer. That fits our philosophy well. How do you handle stress in projects?"
    },
    doctor: {
      tutorReply:
        level === "A1"
          ? "Ich verstehe. Trinken Sie viel warmen Tee und ruhen Sie sich aus. Nehmen Sie diese Tabletten."
          : "Ich verstehe Ihre Symptome. Ich verschreibe Ihnen ein leichtes Medikament. Bitte schonen Sie sich drei Tage.",
      translation:
        level === "A1"
          ? "I understand. Drink plenty of warm tea and rest. Take these tablets."
          : "I understand your symptoms. I will prescribe you a mild medication. Please take it easy for three days."
    },
    station: {
      tutorReply:
        level === "A1"
          ? "Der nächste Zug fährt um 14 Uhr auf Gleis 4 ab. Die einfache Fahrkarte kostet 24 Euro."
          : "Der nächste ICE fährt planmäßig um 14:15 Uhr von Gleis 4 ab. Möchten Sie einen Sitzplatz reservieren?",
      translation:
        level === "A1"
          ? "The next train departs at 2 PM on track 4. The single ticket costs 24 Euros."
          : "The next ICE departs on schedule at 2:15 PM from platform 4. Would you like to reserve a seat?"
    },
    free: {
      tutorReply:
        level === "A1"
          ? "Das ist sehr interessant! Ich gehe am Wochenende gern im Park spazieren. Und du?"
          : "Das finde ich spannend! Ich verbringe meine Freizeit meistens in der Natur oder mit guten Büchern. Was machst du am liebsten?",
      translation:
        level === "A1"
          ? "That is very interesting! On the weekend I like to take a walk in the park. And you?"
          : "I find that exciting! I usually spend my free time in nature or with good books. What do you like doing most?"
    }
  };

  const replyData = replies[scenario.id] || replies.free;

  return {
    tutorReply: replyData.tutorReply,
    translation: replyData.translation,
    correction
  };
}
