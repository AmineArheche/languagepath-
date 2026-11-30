#!/usr/bin/env node

/**
 * scripts/generate-content.js
 *
 * Dev-time content generation tool for DeutschPath using Gemini AI.
 * Generates CEFR-aligned vocabulary, grammar exercises, and reading texts.
 * All generated items are placed in a Human Review Queue (src/data/reviewQueue.json)
 * with status "draft".
 *
 * Items must be approved before being promoted to production data decks!
 *
 * Usage:
 *   node scripts/generate-content.js --level A1 --theme Wohnen --count 10 --type flashcard
 *   node scripts/generate-content.js --status
 *   node scripts/generate-content.js --approve <queueId>
 *   node scripts/generate-content.js --approve-all
 *   node scripts/generate-content.js --promote
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  FlashcardSchema,
  GrammarExerciseSchema,
  ReadingTextSchema,
  ListeningItemSchema,
  ExamTaskSchema,
  WritingPromptSchema
} from "../src/data/schemas/contentSchemas.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, "../src/data");
const QUEUE_FILE = path.join(DATA_DIR, "reviewQueue.json");

// Parse CLI flags
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    level: "A1",
    theme: "Wohnen",
    type: "flashcard",
    count: 10,
    status: false,
    approve: null,
    approveAll: false,
    promote: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--level" && args[i + 1]) options.level = args[++i].toUpperCase();
    else if (arg === "--theme" && args[i + 1]) options.theme = args[++i];
    else if (arg === "--type" && args[i + 1]) options.type = args[++i].toLowerCase();
    else if (arg === "--count" && args[i + 1]) options.count = parseInt(args[++i], 10);
    else if (arg === "--status") options.status = true;
    else if (arg === "--approve" && args[i + 1]) options.approve = args[++i];
    else if (arg === "--approve-all") options.approveAll = true;
    else if (arg === "--promote") options.promote = true;
  }

  return options;
}

// Load or initialize review queue
function loadQueue() {
  if (!fs.existsSync(QUEUE_FILE)) {
    return [];
  }
  try {
    const content = fs.readFileSync(QUEUE_FILE, "utf8");
    return JSON.parse(content);
  } catch {
    return [];
  }
}

function saveQueue(queue) {
  fs.writeFileSync(QUEUE_FILE, JSON.stringify(queue, null, 2) + "\n", "utf8");
}

/**
 * Offline Heuristic Generator (used when GEMINI_API_KEY is not set or offline)
 */
function generateOfflineItems(level, theme, type, count) {
  console.log(`[Offline Generator] Creating curated CEFR items for Level: ${level}, Theme: ${theme}, Type: ${type}`);
  
  const items = [];
  const themeLower = theme.toLowerCase();

  if (type === "flashcard") {
    const bank = {
      wohnen: [
        { german: "Wohnung", article: "die", gender: "feminine", english: "apartment / flat", plural: "die Wohnungen", exampleDe: "Unsere neue Wohnung hat einen großen Balkon.", exampleEn: "Our new apartment has a large balcony." },
        { german: "Zimmer", article: "das", gender: "neuter", english: "room", plural: "die Zimmer", exampleDe: "Das Zimmer ist hell und ruhig.", exampleEn: "The room is bright and quiet." },
        { german: "Küche", article: "die", gender: "feminine", english: "kitchen", plural: "die Küchen", exampleDe: "In der Küche kochen wir zusammen.", exampleEn: "In the kitchen we cook together." },
        { german: "Badezimmer", article: "das", gender: "neuter", english: "bathroom", plural: "die Badezimmer", exampleDe: "Das Badezimmer hat eine moderne Dusche.", exampleEn: "The bathroom has a modern shower." },
        { german: "Miete", article: "die", gender: "feminine", english: "rent", plural: "die Mieten", exampleDe: "Wie hoch ist die Miete im Monat?", exampleEn: "How high is the rent per month?" },
        { german: "Schlüssel", article: "der", gender: "masculine", english: "key", plural: "die Schlüssel", exampleDe: "Hier ist der Schlüssel für die Haustür.", exampleEn: "Here is the key to the front door." },
        { german: "Nachbar", article: "der", gender: "masculine", english: "neighbor (m)", plural: "die Nachbarn", exampleDe: "Mein Nachbar ist sehr freundlich und hilfsbereit.", exampleEn: "My neighbor is very friendly and helpful." },
        { german: "Möbel", article: "die", gender: "feminine", english: "furniture", plural: "die Möbel", exampleDe: "Wir kaufen neue Möbel für das Wohnzimmer.", exampleEn: "We are buying new furniture for the living room." },
        { german: "Fenster", article: "das", gender: "neuter", english: "window", plural: "die Fenster", exampleDe: "Bitte öffne das Fenster kurz zum Lüften.", exampleEn: "Please open the window briefly to air out." },
        { german: "Bett", article: "das", gender: "neuter", english: "bed", plural: "die Betten", exampleDe: "Das Bett im Schlafzimmer ist sehr bequem.", exampleEn: "The bed in the bedroom is very comfortable." }
      ],
      arbeit: [
        { german: "Beruf", article: "der", gender: "masculine", english: "profession / occupation", plural: "die Berufe", exampleDe: "Was bist du von Beruf?", exampleEn: "What is your profession?" },
        { german: "Arbeit", article: "die", gender: "feminine", english: "work / job", plural: "-", exampleDe: "Die Arbeit im Büro macht mir viel Spaß.", exampleEn: "Working in the office is a lot of fun for me." },
        { german: "Chef", article: "der", gender: "masculine", english: "boss / manager (m)", plural: "die Chefs", exampleDe: "Mein Chef leitet die heutige Besprechung.", exampleEn: "My boss is leading today's meeting." },
        { german: "Kollege", article: "der", gender: "masculine", english: "colleague (m)", plural: "die Kollegen", exampleDe: "Ich spreche mit meinem Kollegen über das Projekt.", exampleEn: "I am speaking with my colleague about the project." },
        { german: "Büro", article: "das", gender: "neuter", english: "office", plural: "die Büros", exampleDe: "Unser Büro liegt direkt am Marktplatz.", exampleEn: "Our office is located right by the marketplace." },
        { german: "Pause", article: "die", gender: "feminine", english: "break / recess", plural: "die Pausen", exampleDe: "Um 12 Uhr machen wir eine halbe Stunde Pause.", exampleEn: "At 12 o'clock we take a half-hour break." },
        { german: "Gehalt", article: "das", gender: "neuter", english: "salary", plural: "die Gehälter", exampleDe: "Das Gehalt wird immer am Monatsende überwiesen.", exampleEn: "The salary is always transferred at the end of the month." },
        { german: "Termin", article: "der", gender: "masculine", english: "appointment", plural: "die Termine", exampleDe: "Haben wir heute einen wichtigen Termin?", exampleEn: "Do we have an important appointment today?" },
        { german: "E-Mail", article: "die", gender: "feminine", english: "email", plural: "die E-Mails", exampleDe: "Ich habe Ihnen die E-Mail soeben geschickt.", exampleEn: "I have just sent you the email." },
        { german: "Feierabend", article: "der", gender: "masculine", english: "end of workday", plural: "-", exampleDe: "Endlich Feierabend! Ich gehe jetzt nach Hause.", exampleEn: "Finally off work! I am going home now." }
      ]
    };

    const sourceList = bank[themeLower] || bank.wohnen;
    const requested = sourceList.slice(0, count);

    requested.forEach((w) => {
      const slug = w.german.toLowerCase().replace(/[^a-z0-9]/g, "");
      items.push({
        id: `fc-${level.toLowerCase()}-${themeLower}-${slug}`,
        level,
        topic: theme,
        tags: [themeLower, "core-vocabulary", `cefr-${level.toLowerCase()}`],
        source: "offline-pedagogical-matrix",
        reviewedBy: "ai",
        ...w
      });
    });
  } else if (type === "grammar") {
    // Generate sample grammar items
    items.push({
      id: `gr-${level.toLowerCase()}-${themeLower}-01`,
      level,
      topic: theme,
      tags: [themeLower, "grammar-drill"],
      source: "offline-pedagogical-matrix",
      reviewedBy: "ai",
      type: "fill-blank",
      topicLabel: `${theme} Prepositions`,
      prompt: `Ich wohne in _____ schönen Wohnung. (Dativ, feminine)`,
      options: ["einer", "eine", "einen", "einem"],
      correctAnswer: "einer",
      explanation: "In Dative singular, feminine indefinite article changes to 'einer' ('in einer Wohnung')."
    });
  } else if (type === "reading") {
    items.push({
      id: `read-${level.toLowerCase()}-${themeLower}-01`,
      level,
      topic: theme,
      tags: [themeLower, "reading-comprehension"],
      source: "offline-pedagogical-matrix",
      reviewedBy: "ai",
      title: `Das Leben in der neuen Wohnung`,
      englishTitle: `Life in the New Apartment`,
      category: theme,
      estimatedReadTime: "2 min",
      content: `Hallo! Mein Name ist Sarah. Letzte Woche bin ich in eine neue Wohnung in Frankfurt gezogen. Die Wohnung hat zwei Zimmer, eine Küche und ein helles Bad. Vom Balkon aus kann ich einen schönen Park sehen. Mein Nachbar Herr Klein hat mir beim Tragen der Möbel geholfen. Ich fühle mich hier schon sehr wohl!`,
      vocabulary: {
        "Wohnung": { english: "apartment", article: "die", plural: "die Wohnungen" },
        "Balkon": { english: "balcony", article: "der", plural: "die Balkone" },
        "Möbel": { english: "furniture", article: "die", plural: "die Möbel" }
      },
      questions: [
        {
          id: `q-${level.toLowerCase()}-${themeLower}-1`,
          question: `In welcher Stadt wohnt Sarah jetzt?`,
          options: ["In Berlin", "In Frankfurt", "In München", "In Hamburg"],
          correctIndex: 1,
          explanation: `Der Text sagt: 'Letzte Woche bin ich in eine neue Wohnung in Frankfurt gezogen.'`
        },
        {
          id: `q-${level.toLowerCase()}-${themeLower}-2`,
          question: `Wer hat Sarah beim Möbeltragen geholfen?`,
          options: ["Ihr Bruder", "Ihr Chef", "Herr Klein", "Die Vermieterin"],
          correctIndex: 2,
          explanation: `Der Text sagt: 'Mein Nachbar Herr Klein hat mir beim Tragen der Möbel geholfen.'`
        }
      ]
    });
  }

  return items;
}

/**
 * Calls Gemini API at dev-time
 */
async function callGemini(apiKey, level, theme, type, count) {
  const model = process.env.VITE_GEMINI_MODEL || "gemini-2.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const prompt = `You are a CEFR-certified German language teacher and lexicographer creating instructional items for DeutschPath.
Target CEFR Level: ${level}
Thematic Domain: ${theme}
Item Type: ${type}
Count: ${count} items.

Strict Pedagogical Constraints:
1. Every noun MUST include:
   - "article": "der" | "die" | "das"
   - "gender": "masculine" | "feminine" | "neuter"
   - "plural": authentic German plural form with article (e.g. "die Tische") or "-" if uncountable
2. Every item MUST have:
   - "id": lowercase hyphenated string e.g. "fc-${level.toLowerCase()}-${theme.toLowerCase()}-wort"
   - "level": "${level}"
   - "topic": "${theme}"
   - "tags": array of descriptive lowercase tags
   - "exampleDe": authentic sentence naturally containing the exact headword or inflected form
   - "exampleEn": precise English translation
3. Return ONLY a valid JSON array of objects. No markdown formatting, no code fences, no commentary.`;

  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.2,
      responseMimeType: "application/json"
    }
  };

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API HTTP ${response.status}: ${errorText}`);
  }

  const result = await response.json();
  const rawText = result.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) throw new Error("Empty response from Gemini API");

  return JSON.parse(rawText);
}

/**
 * Generation Controller
 */
async function generate(options) {
  const { level, theme, type, count } = options;
  console.log(`\nDrafting ${count} ${type} items for ${level} [${theme}]...`);

  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  let rawItems = [];

  if (apiKey) {
    try {
      console.log(`Connecting to Gemini API with model: ${process.env.VITE_GEMINI_MODEL || "gemini-2.5-flash"}...`);
      rawItems = await callGemini(apiKey, level, theme, type, count);
    } catch (err) {
      console.warn(`[Gemini API Warning]: ${err.message}. Falling back to offline pedagogical generator.`);
      rawItems = generateOfflineItems(level, theme, type, count);
    }
  } else {
    console.log(`[Info] No GEMINI_API_KEY detected in environment. Using offline curated generator.`);
    rawItems = generateOfflineItems(level, theme, type, count);
  }

  // Pre-validate generated items
  const queue = loadQueue();
  let accepted = 0;
  let rejected = 0;

  for (const item of rawItems) {
    let schema = FlashcardSchema;
    if (type === "grammar") schema = GrammarExerciseSchema;
    else if (type === "reading") schema = ReadingTextSchema;
    else if (type === "listening") schema = ListeningItemSchema;
    else if (type === "exam") schema = ExamTaskSchema;
    else if (type === "writing") schema = WritingPromptSchema;

    const parseResult = schema.safeParse(item);
    if (!parseResult.success) {
      console.error(`✕ Rejected invalid item [${item.german || item.id}]:`, parseResult.error.issues);
      rejected++;
      continue;
    }

    const queueId = `q-${type}-${level.toLowerCase()}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    const queueEntry = {
      queueId,
      itemType: type,
      status: "draft",
      draftedAt: new Date().toISOString(),
      reviewedAt: null,
      reviewerNotes: "",
      item: parseResult.data
    };

    queue.push(queueEntry);
    accepted++;
  }

  saveQueue(queue);
  console.log(`\n✓ Successfully queued ${accepted} item(s) to ${QUEUE_FILE} (status: draft). Rejected: ${rejected}.\n`);
}

/**
 * Queue Management: Displays summary
 */
function showStatus() {
  const queue = loadQueue();
  console.log(`\n═════════════════════════════════════════════════`);
  console.log(` DeutschPath Content Review Queue Status`);
  console.log(` File: ${QUEUE_FILE}`);
  console.log(`═════════════════════════════════════════════════\n`);

  const drafts = queue.filter((i) => i.status === "draft");
  const approved = queue.filter((i) => i.status === "approved");
  const rejected = queue.filter((i) => i.status === "rejected");

  console.log(`Total in Queue: ${queue.length}`);
  console.log(`  • Drafts (pending review): ${drafts.length}`);
  console.log(`  • Approved (ready to ship): ${approved.length}`);
  console.log(`  • Rejected: ${rejected.length}\n`);

  if (drafts.length > 0) {
    console.log(`Pending Drafts:`);
    drafts.slice(0, 5).forEach((d) => {
      console.log(`  [${d.queueId}] ${d.itemType} | ${d.item.level} | ${d.item.topic} | "${d.item.german || d.item.prompt || d.item.title}"`);
    });
    if (drafts.length > 5) {
      console.log(`  ... and ${drafts.length - 5} more drafts`);
    }
  }
}

/**
 * Queue Management: Approve
 */
function approveItem(queueId) {
  const queue = loadQueue();
  const entry = queue.find((i) => i.queueId === queueId);
  if (!entry) {
    console.error(`Item '${queueId}' not found in review queue.`);
    return;
  }
  entry.status = "approved";
  entry.reviewedAt = new Date().toISOString();
  saveQueue(queue);
  console.log(`✓ Approved item [${queueId}] (${entry.item.german || entry.item.id})`);
}

function approveAll() {
  const queue = loadQueue();
  let count = 0;
  queue.forEach((entry) => {
    if (entry.status === "draft") {
      entry.status = "approved";
      entry.reviewedAt = new Date().toISOString();
      count++;
    }
  });
  saveQueue(queue);
  console.log(`✓ Approved all ${count} draft items in the queue.`);
}

/**
 * Queue Management: Promote Approved Items into Production Data Decks
 */
function promoteApproved() {
  const queue = loadQueue();
  const approved = queue.filter((i) => i.status === "approved");

  if (approved.length === 0) {
    console.log(`No approved items found to promote. Review drafts and approve them first.`);
    return;
  }

  console.log(`\nPromoting ${approved.length} approved items into production datasets...`);
  const remaining = queue.filter((i) => i.status !== "approved");

  let promotedFlashcards = 0;
  let promotedGrammar = 0;
  let promotedReading = 0;

  for (const entry of approved) {
    const item = { ...entry.item, reviewedBy: "human" };

    if (entry.itemType === "flashcard") {
      const targetFile = path.join(DATA_DIR, `flashcards${item.level}.json`);
      let deck = [];
      if (fs.existsSync(targetFile)) {
        deck = JSON.parse(fs.readFileSync(targetFile, "utf8"));
      }
      // Check duplicate ID
      if (!deck.some((d) => d.id === item.id)) {
        deck.push(item);
        fs.writeFileSync(targetFile, JSON.stringify(deck, null, 2) + "\n", "utf8");
        promotedFlashcards++;
      }
    } else if (entry.itemType === "grammar") {
      const targetFile = path.join(DATA_DIR, `grammarExercises${item.level}.json`);
      let deck = [];
      if (fs.existsSync(targetFile)) {
        deck = JSON.parse(fs.readFileSync(targetFile, "utf8"));
      }
      if (!deck.some((d) => d.id === item.id)) {
        deck.push(item);
        fs.writeFileSync(targetFile, JSON.stringify(deck, null, 2) + "\n", "utf8");
        promotedGrammar++;
      }
    } else if (entry.itemType === "reading") {
      const targetFile = path.join(DATA_DIR, "readingTexts.json");
      let texts = [];
      if (fs.existsSync(targetFile)) {
        texts = JSON.parse(fs.readFileSync(targetFile, "utf8"));
      }
      if (!texts.some((t) => t.id === item.id)) {
        texts.push(item);
        fs.writeFileSync(targetFile, JSON.stringify(texts, null, 2) + "\n", "utf8");
        promotedReading++;
      }
    }
  }

  saveQueue(remaining);
  console.log(`\nPromotion complete:`);
  console.log(`  • Flashcards added: ${promotedFlashcards}`);
  console.log(`  • Grammar exercises added: ${promotedGrammar}`);
  console.log(`  • Reading texts added: ${promotedReading}`);
  console.log(`  • Remaining items in queue: ${remaining.length}\n`);
}

// CLI Execution
async function main() {
  const options = parseArgs();

  if (options.status) {
    showStatus();
  } else if (options.approve) {
    approveItem(options.approve);
  } else if (options.approveAll) {
    approveAll();
  } else if (options.promote) {
    promoteApproved();
  } else {
    await generate(options);
  }
}

main().catch((err) => {
  console.error("Generator Error:", err);
  process.exit(1);
});
