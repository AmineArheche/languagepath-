import { z } from "zod";
import { getRubric } from "../data/rubrics/index.js";
import { splitGermanSentences } from "../utils/textFormatting.js";

export const SpeakingEvaluationSchema = z.object({
  taskPoints: z
    .array(
      z.object({
        required: z.string().min(1),
        covered: z.boolean(),
        evidence: z.string().default("")
      })
    )
    .default([]),
  criteria: z
    .array(
      z.object({
        name: z.string().min(1),
        score: z.number().min(0),
        max: z.number().min(0),
        evidence: z.string().default(""),
        fix: z.string().default("")
      })
    )
    .default([]),
  overall: z.number().min(0),
  estimateOnly: z.literal(true).default(true),
  feedback: z.string().default(""),
  correctedSentence: z.string().default(""),
  pronunciationDisclaimer: z.string().default(
    "Browser speech recognition transcribes words phonetically and cannot measure true German accent, stress, or phonetics. Pronunciation and fluency scores are heuristic approximations."
  ),
  isOffline: z.boolean().default(false),
  rubricInstitution: z.string().default("goethe"),
  rubricMaxPoints: z.number().default(25),
  apiWarning: z.string().optional()
});

/**
 * Computes all local linguistic and acoustic speech metrics
 *
 * @param {string} transcript - Captured spoken German text
 * @param {number} durationSeconds - Total speaking duration in seconds
 * @param {Array<{start: number, end: number}>} [timestamps=[]] - Speech chunk timestamps
 * @returns {Object} Speaking metrics object
 */
export function computeSpeakingMetrics(transcript = "", durationSeconds = 0, timestamps = []) {
  const cleanText = transcript.trim();
  const words = cleanText ? cleanText.split(/\s+/).filter(Boolean) : [];
  const wordCount = words.length;

  // 1. Words per Minute (WPM)
  const safeDuration = Math.max(1, durationSeconds);
  const wordsPerMinute = wordCount > 0 ? Math.round((wordCount / safeDuration) * 60) : 0;

  // 2. Pause count (from timestamps or gaps)
  let pauseCount = 0;
  if (timestamps && timestamps.length > 1) {
    for (let i = 1; i < timestamps.length; i++) {
      const gap = timestamps[i].start - timestamps[i - 1].end;
      if (gap >= 1.2) {
        pauseCount++;
      }
    }
  } else {
    // Heuristic pause detection from ellipsis and hesitation punctuation
    const pauseMatches = cleanText.match(/(\.{3}|…|,|-|\s{2,})/g);
    pauseCount = pauseMatches ? pauseMatches.length : 0;
  }

  // 3. German hesitation markers / fillers (äh, ähm, mhm, uh, er, öh, hm)
  // Use token-based matching to avoid ASCII \b word-boundary issues with German umlauts (Ä, ä, Ö, ö)
  const fillerWordSet = new Set(["äh", "ähm", "mhm", "uh", "er", "öh", "hm"]);
  const tokens = cleanText.toLowerCase().replace(/[.,!?;:()]/g, " ").split(/\s+/).filter(Boolean);
  const matchedFillers = tokens.filter((t) => fillerWordSet.has(t));
  const fillers = {
    count: matchedFillers.length,
    words: matchedFillers
  };

  // 4. Average sentence length
  const sentences = splitGermanSentences(cleanText);
  const sentenceCount = sentences.length > 0 ? sentences.length : 1;
  const averageSentenceLength = Number((wordCount / sentenceCount).toFixed(1));

  // 5. Subordinate clauses used (introduced by weil, obwohl, dass, wenn, als, da, während, damit, sodass, ob)
  const subjunctions = ["weil", "obwohl", "dass", "wenn", "als", "während", "da", "damit", "sodass", "ob", "nachdem", "bevor"];
  const subClauseRegex = new RegExp(`\\b(${subjunctions.join("|")})\\s+([^,.!?]+)`, "gi");
  const detectedClauses = [];
  let clauseMatch;
  while ((clauseMatch = subClauseRegex.exec(cleanText)) !== null) {
    detectedClauses.push({
      subjunction: clauseMatch[1].toLowerCase(),
      clauseText: `${clauseMatch[1]} ${clauseMatch[2].trim()}`
    });
  }

  // 6. Verb-end accuracy in Nebensätze
  // Checks if the finite verb is placed at the end of the subordinate clause
  const finiteVerbRegex = /\b(bin|bist|ist|sind|seid|war|waren|hat|habe|haben|hatte|hatten|wird|werden|wurde|wurden|kann|können|konnte|muss|müssen|musste|will|wollen|wollte|möchte|möchten|soll|sollen)\b/i;

  let correctVerbEndCount = 0;
  detectedClauses.forEach((cl) => {
    const clauseWords = cl.clauseText.split(/\s+/).filter(Boolean);
    if (clauseWords.length >= 3) {
      const lastTwoWords = clauseWords.slice(-2).join(" ");
      const verbMatch = finiteVerbRegex.test(lastTwoWords);
      if (verbMatch) {
        correctVerbEndCount++;
      }
    }
  });

  const totalNebensaetze = detectedClauses.length;
  const verbEndAccuracy = {
    total: totalNebensaetze,
    correct: correctVerbEndCount,
    accuracyPercent: totalNebensaetze > 0 ? Math.round((correctVerbEndCount / totalNebensaetze) * 100) : 100
  };

  return {
    wordCount,
    durationSeconds: safeDuration,
    wordsPerMinute,
    pauseCount,
    fillers,
    sentenceCount,
    averageSentenceLength,
    subordinateClausesUsed: {
      count: totalNebensaetze,
      list: detectedClauses.map((c) => c.subjunction)
    },
    verbEndAccuracy
  };
}

/**
 * Transcribes audio blob using Gemini 1.5 Flash multimodal endpoint.
 * STRICT PRIVACY REQUIREMENT: Validates explicit user consent; never uploads audio silently.
 */
export async function transcribeAudioWithGemini(audioBlob, apiKey, modelName = "gemini-1.5-flash", hasConsent = false) {
  const isConsentStored = typeof localStorage !== "undefined" && localStorage.getItem("deutschpath_cloud_audio_consent") === "true";
  const permitted = hasConsent || isConsentStored;

  if (!permitted) {
    throw new Error(
      "Cloud audio transcription blocked: Explicit user consent is required before transmitting microphone audio to external APIs. Please enable the consent toggle."
    );
  }

  if (!apiKey || apiKey.trim() === "" || apiKey.includes("your_")) {
    throw new Error("Gemini API key is required for cloud audio transcription. Add your key in Settings.");
  }

  // Convert Blob to Base64
  const arrayBuffer = await audioBlob.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64Audio = btoa(binary);

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(modelName)}:generateContent?key=${apiKey}`;

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [
            {
              inline_data: {
                mime_type: audioBlob.type || "audio/webm",
                data: base64Audio
              }
            },
            {
              text: "Transcribe this spoken German audio accurately into standard German text. Include any spoken hesitation fillers like 'äh' or 'ähm' verbatim. Output ONLY the raw German transcription text without markdown quotes or commentary."
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.1
      }
    })
  });

  if (!res.ok) {
    throw new Error(`Gemini audio transcription failed: HTTP ${res.status}`);
  }

  const data = await res.json();
  const transcript = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
  return { transcript };
}

/**
 * Computes word-level shadowing accuracy between model sentence and student recording
 */
export function computeShadowingAccuracy(modelSentence = "", recordedTranscript = "") {
  const cleanModel = modelSentence.trim().toLowerCase().replace(/[.,!?;:()]/g, "");
  const cleanRec = recordedTranscript.trim().toLowerCase().replace(/[.,!?;:()]/g, "");

  const modelTokens = cleanModel.split(/\s+/).filter(Boolean);
  const recTokens = cleanRec.split(/\s+/).filter(Boolean);

  if (modelTokens.length === 0) {
    return { matchCount: 0, totalWords: 0, accuracyPercent: 0, diffWords: [] };
  }

  const recSet = new Set(recTokens);
  let matchCount = 0;
  const diffWords = modelTokens.map((w) => {
    const isMatched = recSet.has(w);
    if (isMatched) matchCount++;
    return { word: w, matched: isMatched };
  });

  const accuracyPercent = Math.min(100, Math.round((matchCount / modelTokens.length) * 100));

  return {
    matchCount,
    totalWords: modelTokens.length,
    accuracyPercent,
    diffWords
  };
}

/**
 * Offline Heuristic Speaking Evaluation ("Basic Check")
 */
export function generateOfflineSpeakingEvaluation({
  transcript = "",
  level = "A1",
  taskTitle = "Mündliche Prüfung",
  guidelines = [],
  rubricInstitution = "goethe",
  durationSeconds = 0,
  metrics = null
}) {
  const rubric = getRubric(rubricInstitution, level, "speaking");
  const computedMetrics = metrics || computeSpeakingMetrics(transcript, durationSeconds);

  const wordCount = computedMetrics.wordCount;
  const wpm = computedMetrics.wordsPerMinute;
  const fillers = computedMetrics.fillers.count;
  const pauses = computedMetrics.pauseCount;
  const clauses = computedMetrics.subordinateClausesUsed.count;
  const verbEndAcc = computedMetrics.verbEndAccuracy.accuracyPercent;

  // 1. Task Points Coverage
  const taskPoints = (guidelines && guidelines.length > 0
    ? guidelines
    : ["Persönliche Vorstellung / Meinungsäußerung", "Beantwortung der Leitfragen", "Sprechflüssigkeit"]
  ).map((guide) => {
    const isCovered = wordCount >= 15;
    return {
      required: guide,
      covered: isCovered,
      evidence: isCovered
        ? `Delivered within spoken response (${wordCount} words, ${wpm} WPM).`
        : `Spoken output was brief (${wordCount} words). Elaborate further.`
    };
  });

  // Target WPM by level
  let targetMinWpm = 50;
  let targetMaxWpm = 85;
  if (level === "A2") { targetMinWpm = 70; targetMaxWpm = 105; }
  else if (level === "B1") { targetMinWpm = 90; targetMaxWpm = 135; }
  else if (level === "B2") { targetMinWpm = 110; targetMaxWpm = 155; }

  // 2. Criteria Evaluation
  const criteria = rubric.criteria.map((c) => {
    let multiplier = 0.85;

    if (c.id.includes("aufgab") || c.id.includes("inhalt") || c.id.includes("vorgab")) {
      multiplier = wordCount >= 25 ? 0.95 : Math.max(0.4, wordCount / 25);
    } else if (c.id.includes("fluessig") || c.id.includes("interakt") || c.id.includes("diskurs")) {
      // Impacted by WPM and filler frequency
      let paceScore = 0.85;
      if (wpm >= targetMinWpm && wpm <= targetMaxWpm) paceScore = 1.0;
      else if (wpm < targetMinWpm) paceScore = Math.max(0.4, wpm / targetMinWpm);

      const fillerDeduction = Math.min(0.2, fillers * 0.04);
      multiplier = Math.max(0.4, paceScore - fillerDeduction);
    } else if (c.id.includes("struktur") || c.id.includes("korrekt")) {
      // Impacted by verb-end accuracy in subordinate clauses
      multiplier = clauses > 0 ? (verbEndAcc / 100) * 0.9 + 0.1 : 0.8;
    } else if (c.id.includes("wortschatz") || c.id.includes("sprache")) {
      multiplier = wordCount > 30 ? 0.9 : 0.75;
    } else if (c.id.includes("aussprache") || c.id.includes("phonetik")) {
      // Browser STT approximation
      multiplier = 0.85;
    }

    const score = Number((c.maxPoints * multiplier).toFixed(1));

    let evidence = `Pace: ${wpm} WPM, ${wordCount} words spoken.`;
    let fix = "Maintain steady speaking cadence.";

    if (c.id.includes("fluessig")) {
      evidence = `${wpm} WPM (target: ${targetMinWpm}-${targetMaxWpm}), ${fillers} filler words (${computedMetrics.fillers.words.join(", ") || "none"}).`;
      fix = wpm < targetMinWpm
        ? `Try to increase speaking flow toward ${targetMinWpm} WPM with fewer pauses.`
        : "Good pacing! Reduce hesitation sounds like 'äh' or 'ähm'.";
    } else if (c.id.includes("struktur")) {
      evidence = `${clauses} subordinate clause(s) used; verb-end accuracy: ${verbEndAcc}%.`;
      fix = clauses === 0
        ? "Incorporate connectors like 'weil' or 'obwohl' with verb-final placement to show higher CEFR range."
        : "Ensure finite verbs stay at the end of 'weil' and 'dass' clauses.";
    }

    return {
      name: c.name,
      score,
      max: c.maxPoints,
      evidence,
      fix
    };
  });

  const overall = Number(criteria.reduce((sum, item) => sum + item.score, 0).toFixed(1));

  // Corrected sentence starter for shadowing mode
  const correctedSentence = transcript
    ? transcript
        .replace(/\bheute ich\b/i, "heute gehe ich")
        .replace(/\bweil ich habe\b/i, "weil ich Zeit habe")
        .trim()
    : "Guten Tag! Ich möchte Ihnen gerne meine Meinung zu diesem Thema vorstellen.";

  return SpeakingEvaluationSchema.parse({
    taskPoints,
    criteria,
    overall,
    estimateOnly: true,
    isOffline: true,
    rubricInstitution,
    rubricMaxPoints: rubric.maxPoints,
    feedback: `Offline Basic Check: You spoke ${wordCount} words at ${wpm} WPM with ${fillers} filler pauses. Review the metric breakdown and practice with Shadowing mode below.`,
    correctedSentence,
    pronunciationDisclaimer: "Browser speech recognition transcribes words phonetically and cannot measure true German accent, stress, or phonetics. Pronunciation and fluency scores are heuristic approximations.",
    apiWarning: "Offline Heuristic Evaluation (Basic Check). Scores are automated estimates."
  });
}

/**
 * Main evaluation entry point for oral exam responses
 */
export async function evaluateSpeaking({
  transcript = "",
  level = "A1",
  taskTitle = "Mündliche Prüfung",
  promptAudio = "",
  guidelines = [],
  rubricInstitution = "goethe",
  durationSeconds = 0,
  metrics = null,
  apiKey = ""
}) {
  const activeKey =
    apiKey ||
    (typeof localStorage !== "undefined" &&
      JSON.parse(localStorage.getItem("deutschpath_gemini_api_key") || '""')) ||
    (typeof import.meta !== "undefined" && import.meta.env?.VITE_GEMINI_API_KEY) ||
    "";

  if (!activeKey || activeKey.trim() === "" || activeKey.includes("your_") || !transcript.trim()) {
    return generateOfflineSpeakingEvaluation({
      transcript,
      level,
      taskTitle,
      guidelines,
      rubricInstitution,
      durationSeconds,
      metrics
    });
  }

  const rubric = getRubric(rubricInstitution, level, "speaking");
  const computedMetrics = metrics || computeSpeakingMetrics(transcript, durationSeconds);

  const prompt = `You are a certified CEFR German oral examiner evaluating a student's spoken German for ${rubric.institution} (${rubric.examName}) at Level ${level}.

TASK CONTEXT:
- Task: "${taskTitle}"
- Prompt / Examiner Statement: "${promptAudio || "Oral examination"}"
- Guidelines / Leitpunkte: ${JSON.stringify(guidelines)}
- Rubric Max Points: ${rubric.maxPoints} Pkt
- Candidate's Spoken Transcript: """${transcript}"""
- Candidate Speech Metrics:
  - Duration: ${computedMetrics.durationSeconds}s
  - Words Spoken: ${computedMetrics.wordCount} words
  - Words Per Minute: ${computedMetrics.wordsPerMinute} WPM
  - Fillers: ${computedMetrics.fillers.count} (${computedMetrics.fillers.words.join(", ")})
  - Subordinate Clauses: ${computedMetrics.subordinateClausesUsed.count}
  - Verb-end accuracy: ${computedMetrics.verbEndAccuracy.accuracyPercent}%

CRITERIA:
${rubric.criteria.map((c) => `- "${c.name}" (Max ${c.maxPoints} Pkt): ${c.description}`).join("\n")}

Respond ONLY with valid JSON conforming strictly to:
{
  "taskPoints": [{ "required": "string", "covered": boolean, "evidence": "string" }],
  "criteria": [{ "name": "string", "score": number, "max": number, "evidence": "string", "fix": "string" }],
  "overall": number,
  "estimateOnly": true,
  "feedback": "Encouraging examiner feedback...",
  "correctedSentence": "A polished German sentence from the candidate's speech suitable for shadowing practice",
  "pronunciationDisclaimer": "Browser speech recognition transcribes words phonetically and cannot measure true German accent, stress, or phonetics. Pronunciation and fluency scores are heuristic approximations."
}`;

  try {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${activeKey}`;
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          response_mime_type: "application/json"
        }
      })
    });

    if (!res.ok) {
      throw new Error(`Gemini evaluation error: HTTP ${res.status}`);
    }

    const data = await res.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const cleanJson = rawText.replace(/^```json\s*/, "").replace(/\s*```$/, "").trim();
    const parsed = JSON.parse(cleanJson);
    parsed.estimateOnly = true;
    parsed.rubricInstitution = rubricInstitution;
    parsed.rubricMaxPoints = rubric.maxPoints;

    return SpeakingEvaluationSchema.parse(parsed);
  } catch (err) {
    console.warn("Falling back to offline speaking evaluation:", err);
    return generateOfflineSpeakingEvaluation({
      transcript,
      level,
      taskTitle,
      guidelines,
      rubricInstitution,
      durationSeconds,
      metrics: computedMetrics
    });
  }
}

/**
 * Curated library of CEFR oral exam tasks & topics across levels A1-B2
 */
export const SPEAKING_TASKS = {
  A1: [
    {
      id: "a1_sprechen_vorstellung",
      title: "Teil 1: Sich persönlich vorstellen",
      theme: "Kennenlernen & Biografie",
      promptAudio: "Guten Tag! Willkommen zur mündlichen Prüfung. Bitte stellen Sie sich kurz vor.",
      guidelines: [
        "Name und Vorname",
        "Alter und Herkunft",
        "Wohnort in Deutschland",
        "Berufliche Tätigkeit / Studium",
        "Sprachkenntnisse und Hobbys"
      ],
      modelAnswer: "Guten Tag! Mein Name ist Alex Martin. Ich bin 26 Jahre alt und komme aus Frankreich, aber ich wohne jetzt in Berlin. Ich arbeite als Softwareentwickler. In meiner Freizeit spiele ich gerne Gitarre und koche."
    },
    {
      id: "a1_sprechen_einkaufen",
      title: "Teil 2: Um Informationen bitten (Thema: Einkaufen)",
      theme: "Alltag & Besorgungen",
      promptAudio: "Bitte stellen Sie Ihrem Prüfungspartner eine Frage zum Thema Einkaufen mit der Wortkarte 'Öffnungszeiten'.",
      guidelines: [
        "Verwenden Sie eine Höflichkeitsformel",
        "Fragen Sie präzise nach den Öffnungszeiten",
        "Reagieren Sie angemessen auf die Antwort"
      ],
      modelAnswer: "Entschuldigung, bis wie viel Uhr hat der Supermarkt heute geöffnet?",
      partnerResponse: "Der Supermarkt hat heute bis 20 Uhr geöffnet."
    },
    {
      id: "a1_sprechen_bitten",
      title: "Teil 3: Eine Bitte formulieren (Alltagssituation)",
      theme: "Bitten & Aufforderungen",
      promptAudio: "Bitte formulieren Sie eine höfliche Bitte mit der Bildkarte: Ein Glas Wasser.",
      guidelines: [
        "Nutzen Sie 'Könnten Sie bitte...' oder 'Darf ich...'",
        "Nennen Sie den Gegenstand deutlich",
        "Bedanken Sie sich anschließend"
      ],
      modelAnswer: "Könnten Sie mir bitte ein Glas Wasser bringen? Vielen Dank!",
      partnerResponse: "Ja natürlich, sehr gerne! Hier ist Ihr Wasser."
    }
  ],
  A2: [
    {
      id: "a2_sprechen_wochenende",
      title: "Teil 1: Über das vergangene Wochenende berichten",
      theme: "Freizeit & Erlebnisse",
      promptAudio: "Erzählen Sie bitte: Was haben Sie am vergangenen Wochenende gemacht? Berichten Sie im Perfekt.",
      guidelines: [
        "Was haben Sie unternommen?",
        "Mit wem waren Sie zusammen?",
        "Wie war das Wetter und wie hat es Ihnen gefallen?"
      ],
      modelAnswer: "Am letzten Wochenende habe ich meine Freunde in Köln besucht. Am Samstag sind wir am Rhein spazieren gegangen und haben abends in einem typischen Brauhaus gegessen. Das Wetter war sehr schön und sonnig."
    },
    {
      id: "a2_sprechen_ausflug",
      title: "Teil 2: Gemeinsam etwas planen (Ausflug am Samstag)",
      theme: "Planung & Absprachen",
      promptAudio: "Sie möchten zusammen mit Ihrem Partner einen Tagesausflug am Samstag machen. Machen Sie Vorschläge zu Ziel und Verkehrsmitteln.",
      guidelines: [
        "Ziel vorschlagen (See, Berg, Stadt)",
        "Verkehrsmittel auswählen (Zug, Fahrrad)",
        "Uhrzeit und Treffpunkt vereinbaren"
      ],
      modelAnswer: "Wie wäre es, wenn wir am Samstag mit dem Zug an den Bodensee fahren? Wir könnten dort ein Boot mieten und Fahrräder ausleihen. Was meinst du?",
      partnerResponse: "Das ist eine tolle Idee! Um wie viel Uhr wollen wir am Hauptbahnhof starten?"
    }
  ],
  B1: [
    {
      id: "b1_sprechen_urlaub",
      title: "Teil 1: Präsentation: Urlaub im eigenen Land oder Fernreise?",
      theme: "Reisen, Gesellschaft & Ökologie",
      promptAudio: "Bitte halten Sie eine Präsentation (ca. 2-3 Minuten) über das Thema: Urlaub im eigenen Land oder Fernreisen?",
      guidelines: [
        "Eigene Erfahrungen schildern",
        "Situation im Heimatland beschreiben",
        "Vor- und Nachteile strukturieren (Einerseits... andererseits)",
        "Persönliche Meinung und Fazit formulieren"
      ],
      modelAnswer: "Mein Thema heute ist: Urlaub im eigenen Land oder Fernreisen? Früher bin ich oft weit geflogen, aber in den letzten Jahren schätze ich Urlaube in der näheren Umgebung immer mehr. Der große Vorteil von Reisen im eigenen Land ist die Umweltfreundlichkeit und die geringere Reisezeit. Außerdem spart man oft Geld. Allerdings bieten Fernreisen die Möglichkeit, völlig fremde Kulturen und Sprachen kennenzulernen. Mein Fazit: Eine gesunde Mischung ist optimal."
    },
    {
      id: "b1_sprechen_smartphones",
      title: "Teil 2: Präsentation: Brauchen Kinder Smartphones an der Schule?",
      theme: "Bildung & Digitalisierung",
      promptAudio: "Bitte halten Sie eine kurze Präsentation zum Thema: Sollte man Smartphones an Schulen verbieten oder im Unterricht nutzen?",
      guidelines: [
        "Einführung in die Fragestellung",
        "Chancen für digitales Lernen",
        "Ablenkung und Risiken",
        "Eigene Bewertung und Vorschlag"
      ],
      modelAnswer: "Das Thema Smartphones an Schulen wird kontrovers diskutiert. Einerseits ermöglichen mobile Geräte einen schnellen Zugang zu digitalen Lernmaterialien und Recherchen im Unterricht. Andererseits besteht die erhebliche Gefahr der Ablenkung und von Cybermobbing auf dem Schulhof. Meiner Meinung nach sollten Smartphones im Unterricht nur gezielt für pädagogische Aufgaben freigegeben werden."
    }
  ],
  B2: [
    {
      id: "b2_sprechen_wirtschaft",
      title: "Teil 1: Vortrag: Bedeutung von Fremdsprachenkenntnissen in der Wirtschaft",
      theme: "Arbeitswelt & Globalisierung",
      promptAudio: "Bitte halten Sie einen strukturierten Vortrag (ca. 3 Minuten) über die Relevanz mehrsprachiger Kompetenzen im internationalen Wirtschaftsleben.",
      guidelines: [
        "Problemaufriss und gesellschaftliche Relevanz",
        "Konkrete Beispiele aus internationalen Unternehmen",
        "Vergleich mit maschinellen Übersetzungstools (KI)",
        "Synthese und Ausblick"
      ],
      modelAnswer: "In einer zunehmend vernetzten Weltwirtschaft stellen fundierte Fremdsprachenkenntnisse einen unschätzbaren Wettbewerbsvorteil dar. Auch wenn moderne KI-Übersetzungstools enorme Fortschritte erzielen, können sie zwischenmenschliche Nuancen, kulturelle Kontexte und nonverbale Kommunikation in Verhandlungen nicht ersetzen. Mehrsprachige Mitarbeiter fungieren als Brückenbauer zwischen verschiedenen Unternehmenskulturen und tragen maßgeblich zum Vertrauensaufbau bei internationalen Kooperationen bei."
    },
    {
      id: "b2_sprechen_homeoffice",
      title: "Teil 2: Diskussion & Monolog: Vor- und Nachteile des Homeoffice",
      theme: "Neue Arbeitsformen",
      promptAudio: "Stellen Sie Ihre fundierte Position zur Debatte über Remote Work versus Präsenzpflicht im Büro dar.",
      guidelines: [
        "Flexibilität versus Teamzusammenhalt",
        "Auswirkungen auf Produktivität und psychische Gesundheit",
        "Hybride Modelle als Kompromiss"
      ],
      modelAnswer: "Die Debatte um das Arbeiten im Homeoffice berührt fundamentale Aspekte moderner Arbeitskultur. Während Mitarbeiter von wegfallenden Pendelzeiten und einer besseren Vereinbarkeit von Familie und Beruf profitieren, leiden bisweilen der spontane Wissensaustausch und das Zugehörigkeitsgefühl im Team. Daher erweisen sich hybride Vereinbarungen in der Praxis meist als der nachhaltigste Weg."
    }
  ]
};
