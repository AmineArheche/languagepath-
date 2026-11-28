import { z } from "zod";
import { getRubric } from "../data/rubrics/index.js";

/**
 * Output Schema for Writing Evaluation
 * Strictly conforms to:
 * { taskPoints:[{required, covered, evidence}], criteria:[{name, score, max, evidence, fix}], overall, estimateOnly:true }
 */
export const WritingEvaluationSchema = z.object({
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
  // Additional fields for complete UI rendering & backward compatibility
  score: z.number().optional(),
  rubricInstitution: z.string().default("goethe"),
  rubricMaxPoints: z.number().default(25),
  isOffline: z.boolean().default(false),
  correctedText: z.string().default(""),
  mistakes: z
    .array(
      z.object({
        type: z.string().default("grammar"),
        category: z.string().default("case"),
        subcategory: z.string().default("general"),
        original: z.string().min(1),
        corrected: z.string().min(1),
        explanation: z.string().default("")
      })
    )
    .default([]),
  modelAnswer: z
    .object({
      level: z.string().default("A2"),
      text: z.string().default(""),
      translation: z.string().default("")
    })
    .optional(),
  feedback: z.string().default(""),
  apiWarning: z.string().optional()
});

export const WRITING_TASKS = {
  A1: [
    {
      id: "a1-landlord",
      title: "Email to a Landlord",
      prompt: "Write a short polite email to a landlord inquiring about an apartment for rent. Ask about rent, location, and a viewing appointment.",
      targetWords: "30 - 50 words",
      requiredPoints: [
        "Grund des Schreibens (Interesse an der Wohnung)",
        "Frage nach monatlicher Miete und Nebenkosten",
        "Termin für Wohnungsbesichtigung erfragen"
      ],
      hints: [
        "Sehr geehrter Herr...",
        "Ich interessiere mich für die Wohnung.",
        "Wie hoch ist die Miete?",
        "Haben Sie Zeit für eine Besichtigung?",
        "Mit freundlichen Grüßen"
      ]
    },
    {
      id: "a1-birthday",
      title: "Birthday Party Invitation",
      prompt: "Write an informal invitation to a friend for your birthday party on Saturday. Mention time, place, and what to bring.",
      targetWords: "30 - 50 words",
      requiredPoints: [
        "Einladung zur Geburtstagsparty am Samstag",
        "Angabe von Uhrzeit und Ort der Feier",
        "Bitte um Mitbringen von Snacks oder Getränken"
      ],
      hints: [
        "Liebe/Lieber...",
        "Ich habe am Samstag Geburtstag.",
        "Die Party beginnt um 19 Uhr.",
        "Bring bitte gute Laune mit!",
        "Liebe Grüße"
      ]
    },
    {
      id: "a1-profile",
      title: "Personal Profile Introduction",
      prompt: "Write a short personal introduction introducing yourself: name, age, city, languages spoken, and your favorite hobbies.",
      targetWords: "35 - 55 words",
      requiredPoints: [
        "Name, Alter und Wohnort",
        "Gesprochene Sprachen",
        "Hobbys und Freizeitbeschäftigungen"
      ],
      hints: [
        "Mein Name ist...",
        "Ich bin ... Jahre alt.",
        "Ich wohne in...",
        "In meiner Freizeit lese ich gern..."
      ]
    },
    {
      id: "a1-routine",
      title: "Describe Your Daily Routine",
      prompt: "Describe your typical daily schedule from waking up in the morning to going to bed at night.",
      targetWords: "35 - 55 words",
      requiredPoints: [
        "Aufstehen und Frühstück am Morgen",
        "Arbeit oder Studium im Tagesverlauf",
        "Abendgestaltung und Schlafenszeit"
      ],
      hints: [
        "Ich stehe um 7 Uhr auf.",
        "Zum Frühstück esse ich...",
        "Um 18 Uhr habe ich Feierabend.",
        "Am Abend schaue ich fern."
      ]
    }
  ],
  A2: [
    {
      id: "a2-holiday",
      title: "Describe Your Last Holiday",
      prompt: "Write a short report describing your last vacation. Mention where you traveled, what the weather was like, and what activities you did (using the Perfekt past tense).",
      targetWords: "60 - 90 words",
      requiredPoints: [
        "Reiseziel und Verkehrsmittel (im Perfekt)",
        "Wetter und Unterkunft",
        "Aktivitäten vor Ort und persönlicher Eindruck"
      ],
      hints: [
        "Letzten Sommer bin ich nach ... gefahren.",
        "Das Wetter war herrlich.",
        "Wir haben Sehenswürdigkeiten besichtigt.",
        "Es hat viel Spaß gemacht."
      ]
    },
    {
      id: "a2-sick",
      title: "Sick Leave Email to Boss",
      prompt: "Write a polite email to your supervisor explaining that you are sick, cannot come to work for two days, and have a doctor's certificate.",
      targetWords: "50 - 80 words",
      requiredPoints: [
        "Krankmeldung und voraussichtliche Ausfalldauer",
        "Hinweis auf das ärztliche Attest (im Anhang)",
        "Information über dringende Aufgaben oder Vertretung"
      ],
      hints: [
        "Sehr geehrte/r Frau/Herr...",
        "Leider bin ich krank geworden.",
        "Der Arzt hat mich bis Freitag krankgeschrieben.",
        "Das Attest sende ich im Anhang."
      ]
    },
    {
      id: "a2-complaint",
      title: "Customer Delivery Complaint",
      prompt: "Write an email to an online shop complaining that your ordered package arrived damaged or is missing an item.",
      targetWords: "50 - 80 words",
      requiredPoints: [
        "Nennung der Bestellnummer und des Artikels",
        "Genaue Schilderung der Beschädigung oder des Fehlers",
        "Aufforderung zu Ersatzlieferung oder Geldrückerstattung"
      ],
      hints: [
        "Sehr geehrte Damen und Herren,",
        "Meine Bestellnummer lautet...",
        "Leider ist das Paket beschädigt angekommen.",
        "Ich bitte um Umtausch oder Rückerstattung."
      ]
    }
  ],
  B1: [
    {
      id: "B1-application",
      title: "Job Application Cover Letter",
      prompt: "Write a formal cover letter for an internship or job opening. Describe your experience, motivation, and why you are suitable for the team.",
      targetWords: "100 - 140 words",
      requiredPoints: [
        "Bezugnahme auf die ausgeschriebene Stelle",
        "Einschlägige Qualifikationen und bisherige Berufserfahrung",
        "Motivation für das Unternehmen und Bitte um persönliches Gespräch"
      ],
      hints: [
        "Bewerbung als...",
        "Mit großem Interesse habe ich Ihre Anzeige gelesen.",
        "Während meines Studiums habe ich Erfahrung gesammelt...",
        "Über eine Einladung freue ich mich."
      ]
    },
    {
      id: "B1-forum",
      title: "Forum Post: Home Office vs Office",
      prompt: "Write a balanced contribution to an online forum discussing the pros and cons of working from home compared to working in an office.",
      targetWords: "100 - 150 words",
      requiredPoints: [
        "Eigene Meinung zu Homeoffice vs. Büroarbeit",
        "Vor- und Nachteile beider Arbeitsmodelle",
        "Eigene Erfahrungen und zusammenfassende Schlussfolgerung"
      ],
      hints: [
        "Meiner Meinung nach...",
        "Einerseits spart man Fahrzeit, andererseits...",
        "Ein weiterer Aspekt ist...",
        "Zusammenfassend lässt sich sagen..."
      ]
    },
    {
      id: "B1-repair",
      title: "Formal Defect Notice to Landlord",
      prompt: "Write a formal letter to your landlord reporting a heating breakdown or water leakage, requesting immediate repair within a set deadline.",
      targetWords: "90 - 130 words",
      requiredPoints: [
        "Genaue Mängelanzeige (Heizungsausfall/Wasserschaden)",
        "Beeinträchtigung des Wohnalltags",
        "Setzen einer angemessenen Frist zur Reparatur"
      ],
      hints: [
        "Mängelanzeige:",
        "Hiermit muss ich Ihnen mitteilen, dass...",
        "Die Heizung funktioniert seit drei Tagen nicht.",
        "Ich bitte um Behebung bis zum..."
      ]
    }
  ],
  B2: [
    {
      id: "B2-essay",
      title: "Essay: AI in Education",
      prompt: "Write a structured argumentative essay on whether AI tools should be integrated into university curricula. Provide arguments, counterarguments, and a conclusion.",
      targetWords: "150 - 220 words",
      requiredPoints: [
        "Einleitung zur aktuellen Debatte um KI im Bildungswesen",
        "Chancen und didaktischer Nutzen intelligenter Systeme",
        "Risiken für wissenschaftliche Integrität und Selbstständigkeit",
        "Eigene begründete Synthese und Zukunftsausblick"
      ],
      hints: [
        "In der heutigen Debatte steht die Frage im Raum...",
        "Befürworter argumentieren, dass...",
        "Dem ist jedoch entgegenzuhalten, dass...",
        "Abschließend plädiere ich für..."
      ]
    },
    {
      id: "B2-complaint",
      title: "Formal Travel Agency Compensation Request",
      prompt: "Write a nuanced formal complaint letter to a travel agency describing ruined holiday conditions (construction noise, canceled flights) and requesting financial compensation.",
      targetWords: "140 - 200 words",
      requiredPoints: [
        "Detaillierte Rüge der Reisemängel gegenüber der Buchungsbeschreibung",
        "Nachweis der erfolglosen Reklamation vor Ort",
        "Geltendmachung einer konkreten Preisminderung mit Fristsetzung"
      ],
      hints: [
        "Forderung einer Reisepreisminderung",
        "Entgegen der Hotelbeschreibung...",
        "Dies stellte einen erheblichen Mangel dar.",
        "Ich erwarte eine Stellungnahme sowie Erstattung von..."
      ]
    }
  ]
};

export function getHigherLevel(level) {
  switch (level?.toUpperCase()) {
    case "A1":
      return "A2";
    case "A2":
      return "B1";
    case "B1":
      return "B2";
    case "B2":
      return "C1";
    default:
      return "B1";
  }
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
  } catch {
    // fallback to env or default
  }
  if (typeof import.meta !== "undefined" && import.meta.env?.VITE_GEMINI_MODEL) {
    return import.meta.env.VITE_GEMINI_MODEL.trim();
  }
  return "gemini-1.5-flash";
}

/**
 * Builds system prompt for Gemini conforming strictly to the requested schema and CEFR rubrics.
 */
export function buildWritingSystemPrompt(level, taskTitle, taskPrompt, requiredPoints = [], rubricInstitution = "goethe") {
  const higherLevel = getHigherLevel(level);
  const rubric = getRubric(rubricInstitution, level);

  const criteriaInstructions = rubric.criteria
    .map(
      (c) =>
        `- "${c.name}" (Max ${c.maxPoints} Pkt, weight ${c.weight}): ${c.description}`
    )
    .join("\n");

  const requiredPointsList = requiredPoints && requiredPoints.length > 0
    ? requiredPoints.map((pt, i) => `${i + 1}. "${pt}"`).join("\n")
    : "1. Address all key aspects of the prompt.";

  return `You are an expert CEFR German language examiner certified in ${rubric.institution} (${rubric.examName}) scoring.
Evaluate the student's written text for CEFR Level ${level} using the official examination criteria.

TASK SPECIFICATION:
- Task: "${taskTitle}"
- Prompt: "${taskPrompt}"
- Target Level: ${level}
- Rubric: ${rubric.moduleName} (Total Max Points: ${rubric.maxPoints})
- Required Task Points (Leitpunkte):
${requiredPointsList}

RUBRIC CRITERIA:
${criteriaInstructions}

CRITICAL INSTRUCTIONS:
1. REQUIRED CONTENT CHECKLIST (taskPoints):
   For each required task point above, determine:
   - "required": the exact prompt point
   - "covered": boolean (true if reasonably addressed, false if omitted/inadequate)
   - "evidence": brief exact quote from the user's text proving coverage, or "" if not covered
2. CRITERIA EVALUATION (criteria):
   Evaluate every rubric criterion listed above:
   - "name": criterion name
   - "score": objective score awarded (between 0.0 and max)
   - "max": max points for this criterion
   - "evidence": specific observation or quote from the text
   - "fix": concrete actionable tip on how to gain points here
3. OVERALL SCORE:
   - Sum of the scores across all criteria (scale 0.0 to ${rubric.maxPoints}).
   - Always mark "estimateOnly": true (AI scores are estimates only).
4. MISTAKES & ERROR TAXONOMY:
   Extract and classify each mistake into the DeutschPath error taxonomy:
   - "type": "grammar" | "vocabulary" | "spelling" | "word order"
   - "category": "case" | "verb-position" | "conjugation" | "tense" | "preposition" | "word-order" | "connector" | "spelling" | "vocabulary" | "article-gender"
   - "subcategory": specific sub-rule (e.g. "V2", "verb-end", "akkusativ", "dative", "TeKaMoLo", "capitalization")
   - "original": exact error from the text
   - "corrected": corrected German word/phrase
   - "explanation": concise explanation in English of why it is wrong and how to fix it
5. CORRECTED TEXT:
   Provide the full, fluent German text with all mistakes corrected while maintaining the student's original tone.
6. MODEL ANSWER (CEFR+1):
   Provide a model answer to the same task written strictly at Level ${higherLevel} with an English translation.

OUTPUT SCHEMA (Must be valid JSON matching this exact structure):
{
  "taskPoints": [
    { "required": "Point description", "covered": true, "evidence": "Quote from text" }
  ],
  "criteria": [
    { "name": "Criterion name", "score": 6.5, "max": 7.5, "evidence": "Observation", "fix": "Actionable advice" }
  ],
  "overall": 21.5,
  "estimateOnly": true,
  "feedback": "Encouraging overall feedback in English...",
  "correctedText": "Full corrected German text...",
  "mistakes": [
    {
      "type": "grammar",
      "category": "case",
      "subcategory": "akkusativ",
      "original": "ich habe ein Hund",
      "corrected": "ich habe einen Hund",
      "explanation": "'Hund' is masculine accusative after 'haben', requiring 'einen'."
    }
  ],
  "modelAnswer": {
    "level": "${higherLevel}",
    "text": "Model answer at level ${higherLevel}...",
    "translation": "English translation..."
  }
}`;
}

/**
 * Intelligent Offline Heuristic Writing Evaluation ("Basic Check")
 *
 * Implements 5 concrete linguistic checks:
 * 1. Word count vs task minimum
 * 2. Connector count (coordinating & subordinating)
 * 3. V2 (Verb-Second) and verb-end subordinate clause checks via regex
 * 4. Greeting & Closing formula present
 * 5. Formal 'Sie' vs informal 'du' address consistency
 *
 * Clearly labeled as "basic check" with estimateOnly: true.
 */
export function generateOfflineWritingEvaluation({
  level = "A1",
  taskTitle = "Writing Task",
  taskPrompt = "",
  requiredPoints = [],
  targetWords = "30 - 50 words",
  userText = "",
  rubricInstitution = "goethe"
}) {
  const higherLevel = getHigherLevel(level);
  const rubric = getRubric(rubricInstitution, level);
  const words = userText.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  // 1. Word count vs minimum requirement
  let minWords = 30;
  const wordMatch = targetWords.match(/(\d+)\s*-\s*(\d+)/);
  if (wordMatch) {
    minWords = parseInt(wordMatch[1], 10);
  } else if (level === "A2") minWords = 50;
  else if (level === "B1") minWords = 90;
  else if (level === "B2") minWords = 140;

  const wordShortfall = wordCount < minWords;
  const wordRatio = Math.min(1.0, wordCount / minWords);

  // 2. Connector detection
  const CONNECTORS = [
    "und", "oder", "aber", "denn", "weil", "da", "dass", "wenn", "obwohl",
    "trotzdem", "deshalb", "daher", "jedoch", "sondern", "während", "sodass", "damit"
  ];
  const detectedConnectors = [];
  CONNECTORS.forEach((c) => {
    const regex = new RegExp(`\\b${c}\\b`, "i");
    if (regex.test(userText)) {
      detectedConnectors.push(c);
    }
  });

  // 3. Greeting and Closing detection
  const hasGreeting = /\b(Sehr geehrte[rn]?|Liebe[r]?|Hallo|Guten Tag|Guten Morgen|Hi)\b/i.test(userText);
  const hasClosing = /\b(Mit freundlichen Grüßen|Viele Grüße|Liebe Grüße|Herzliche Grüße|Bis bald|Dein[e]?\b|Ihr[e]?\b)/i.test(userText);

  // 4. Formal vs Informal address consistency
  const formalMatches = userText.match(/\b(Sie|Ihnen|Ihr|Ihre|Ihrem|Ihren|Ihres)\b/g) || [];
  const informalMatches = userText.match(/\b(du|dir|dich|dein|deine|deinem|deinen|deiner|deines|ihr|euch|euer|eure)\b/gi) || [];
  const hasAddressConflict = formalMatches.length > 0 && informalMatches.length > 0;

  const mistakes = [];
  let correctedText = userText;

  // Rule A: V2 check (Clause begins with adverbial/time expression followed by subject instead of verb)
  const v2Regex = /\b(Heute|Gestern|Morgen|Am\s+\w+|Leider|Im\s+\w+|Danach|Dann|Zuerst|Später|Außerdem|Deshalb)\s+(ich|du|er|sie|es|wir|ihr)\s+([a-zA-ZäöüÄÖÜß]+)\b/gi;
  let v2Match;
  while ((v2Match = v2Regex.exec(userText)) !== null) {
    const adverb = v2Match[1];
    const subject = v2Match[2];
    const verb = v2Match[3];
    const originalPhrase = `${adverb} ${subject} ${verb}`;
    const fixedPhrase = `${adverb} ${verb} ${subject}`;

    mistakes.push({
      type: "word order",
      category: "verb-position",
      subcategory: "V2",
      original: originalPhrase,
      corrected: fixedPhrase,
      explanation: `Verb-Second (V2) rule: In German, when a sentence starts with an adverbial phrase ('${adverb}'), the finite verb must come in position 2, followed by the subject ('${fixedPhrase}').`
    });
    correctedText = correctedText.replace(originalPhrase, fixedPhrase);
  }

  // Rule B: Subordinate clause verb-end check (e.g. "weil ich habe keine Zeit")
  const verbEndRegex = /\b(weil|obwohl|dass|wenn|als|während|da|sodass)\s+([^,.!?]+?)\b(bin|bist|ist|sind|seid|war|hat|habe|haben|hatte|wird|werden|kann|können|muss|müssen|will|wollen|möchte|möchten)\b([^,.!?]+)/gi;
  let verbEndMatch;
  while ((verbEndMatch = verbEndRegex.exec(userText)) !== null) {
    const conj = verbEndMatch[1];
    const middle = verbEndMatch[2].trim();
    const verb = verbEndMatch[3].trim();
    const rest = verbEndMatch[4].trim();

    // If there are words after the verb in the same clause, verb was not placed at the end
    if (rest.length > 0 && !/^(nicht|schon|auch)$/i.test(rest)) {
      const originalClause = `${conj} ${middle} ${verb} ${rest}`;
      const fixedClause = `${conj} ${middle} ${rest} ${verb}`;

      mistakes.push({
        type: "word order",
        category: "verb-position",
        subcategory: "verb-end",
        original: originalClause,
        corrected: fixedClause,
        explanation: `Subordinate clause verb-final rule: In clauses introduced by '${conj}', the conjugated verb ('${verb}') must move to the very end of the clause.`
      });
      correctedText = correctedText.replace(originalClause, fixedClause);
    }
  }

  // Rule C: Formal vs informal consistency
  if (hasAddressConflict) {
    mistakes.push({
      type: "grammar",
      category: "connector",
      subcategory: "register-consistency",
      original: `Mixed address: "${formalMatches[0]}" vs "${informalMatches[0]}"`,
      corrected: formalMatches.length >= informalMatches.length ? "Use formal 'Sie/Ihnen' consistently" : "Use informal 'du/dir' consistently",
      explanation: "Address register conflict: Avoid mixing formal ('Sie') and informal ('du') pronouns in the same correspondence."
    });
  }

  // Rule D: Common noun capitalization
  const commonNouns = [
    "haus", "wohnung", "hund", "katze", "tisch", "kaffee", "urlaub", "arbeit", "zeit", "freund", "mutter", "vater", "auto", "buch", "brief", "tag", "party", "miete", "termin", "problem"
  ];
  commonNouns.forEach((noun) => {
    const reg = new RegExp(`\\b${noun}\\b`, "g");
    if (reg.test(userText)) {
      const cap = noun.charAt(0).toUpperCase() + noun.slice(1);
      mistakes.push({
        type: "spelling",
        category: "spelling",
        subcategory: "capitalization",
        original: noun,
        corrected: cap,
        explanation: `All German nouns must be capitalized: '${cap}'.`
      });
      correctedText = correctedText.replace(reg, cap);
    }
  });

  // Rule E: Common accusative masculine article mistakes
  const accErrors = [
    { wrong: "ein Kaffee", right: "einen Kaffee" },
    { wrong: "ein Hund", right: "einen Hund" },
    { wrong: "ein Tisch", right: "einen Tisch" },
    { wrong: "ein Urlaub", right: "einen Urlaub" },
    { wrong: "ein Termin", right: "einen Termin" }
  ];
  accErrors.forEach(({ wrong, right }) => {
    if (userText.includes(wrong)) {
      mistakes.push({
        type: "grammar",
        category: "case",
        subcategory: "akkusativ",
        original: wrong,
        corrected: right,
        explanation: "Masculine nouns require the accusative indefinite article 'einen' when used as direct objects."
      });
      correctedText = correctedText.replace(new RegExp(wrong, "g"), right);
    }
  });

  // 5. Evaluate Task Points (Leitpunkte)
  const taskPoints = (requiredPoints && requiredPoints.length > 0 ? requiredPoints : [
    "Inhaltliche Erfüllung der Schreibabsicht",
    "Angemessene Textlänge und Wortwahl",
    "Formale Anrede und Abschluss"
  ]).map((req) => {
    const lowerReq = req.toLowerCase();
    let covered = false;
    let evidence = "";

    if (lowerReq.includes("anrede") || lowerReq.includes("gruß") || lowerReq.includes("abschluss")) {
      covered = hasGreeting || hasClosing;
      evidence = hasGreeting ? "Greeting / closing formula detected in text." : "";
    } else if (wordCount >= minWords * 0.7) {
      covered = true;
      evidence = `Addressed within the text (${wordCount} words).`;
    } else {
      covered = false;
      evidence = `Text may be too short (${wordCount}/${minWords} words) to adequately cover this point.`;
    }

    return {
      required: req,
      covered,
      evidence
    };
  });

  // 6. Evaluate Criteria mapped to the active Rubric
  const criteria = rubric.criteria.map((c) => {
    let scoreMultiplier = 0.85;

    if (c.id === "aufgabenerfuellung" || c.id === "inhalt" || c.id === "vorgaben") {
      // Impacted by word count shortfall and task point coverage
      const coveredCount = taskPoints.filter((tp) => tp.covered).length;
      const coverageRatio = taskPoints.length > 0 ? coveredCount / taskPoints.length : 1.0;
      scoreMultiplier = 0.5 * wordRatio + 0.5 * coverageRatio;
    } else if (c.id === "kohaerenz" || c.id === "textsorte" || c.id === "kommunikation") {
      // Impacted by connectors and greeting/closing
      let bonus = 0.7;
      if (detectedConnectors.length >= 2) bonus += 0.2;
      if (hasGreeting) bonus += 0.05;
      if (hasClosing) bonus += 0.05;
      scoreMultiplier = Math.min(1.0, bonus);
    } else if (c.id === "strukturen" || c.id === "korrektheit") {
      // Impacted by detected syntax and grammar mistakes
      const penalty = mistakes.length * 0.08;
      scoreMultiplier = Math.max(0.4, 1.0 - penalty);
    } else if (c.id === "wortschatz" || c.id === "sprache") {
      scoreMultiplier = wordShortfall ? 0.7 : 0.85;
    }

    const calculatedScore = Number((c.maxPoints * scoreMultiplier).toFixed(1));

    let evidence = `Evaluated based on ${wordCount} words`;
    let fix = "Maintain clear grammatical sentence structure.";

    if (c.id.includes("aufgab") || c.id.includes("inhalt") || c.id.includes("vorgab")) {
      evidence = `${wordCount} words written vs ${minWords} minimum required.`;
      fix = wordShortfall
        ? `Expand your text by at least ${minWords - wordCount} words to fully develop all points.`
        : "All content points adequately touched upon.";
    } else if (c.id.includes("kohaer") || c.id.includes("kommunik")) {
      evidence = detectedConnectors.length > 0
        ? `Used connectors: ${detectedConnectors.join(", ")}.`
        : "Few or no connective words detected.";
      fix = detectedConnectors.length < 2
        ? "Add logical connectors such as 'weil', 'obwohl', or 'deshalb' to link sentences smoothly."
        : "Good use of connectors to maintain text flow.";
    } else if (c.id.includes("struktur") || c.id.includes("korrekt")) {
      evidence = mistakes.length > 0
        ? `Identified ${mistakes.length} structural or grammatical issues.`
        : "No major structural errors detected in basic scan.";
      fix = mistakes.length > 0
        ? "Review verb-second (V2) placement and verb-final position in subordinate clauses."
        : "Continue practicing complex clause structures.";
    }

    return {
      name: c.name,
      score: calculatedScore,
      max: c.maxPoints,
      evidence,
      fix
    };
  });

  const overall = Number(
    criteria.reduce((sum, item) => sum + item.score, 0).toFixed(1)
  );

  const modelAnswers = {
    A2: {
      text: "Sehr geehrter Herr Schneider,\n\nich habe Ihre Anzeige für die 2-Zimmer-Wohnung in Berlin gelesen und interessiere mich sehr dafür. Ich arbeite als Softwareentwickler in Vollzeit und suche eine ruhige Wohnung ab dem 1. November. Wie hoch sind die Nebenkosten und wann wäre eine Wohnungsbesichtigung möglich?\n\nMit freundlichen Grüßen,\nDavid Schmidt",
      translation: "Dear Mr. Schneider,\n\nI read your listing for the 2-room apartment in Berlin and am very interested. I work as a full-time software developer and am looking for a quiet apartment starting November 1st. What are the utility costs and when would a viewing appointment be possible?\n\nBest regards,\nDavid Schmidt"
    },
    B1: {
      text: "Liebe Anna,\n\nletzten Monat habe ich mit meiner Familie einen wundervollen Urlaub im Schwarzwald verbracht. Wir sind mit dem Zug dorthin gefahren und haben eine gemütliche Ferienwohnung gemietet. Obwohl es am ersten Tag geregnet hat, konnten wir herrliche Wanderungen unternehmen und lokale Spezialitäten genießen. Der Ausflug hat uns sehr gut getan!\n\nHerzliche Grüße,\nDavid",
      translation: "Dear Anna,\n\nLast month I spent a wonderful holiday in the Black Forest with my family. We traveled there by train and rented a cozy holiday apartment. Although it rained on the first day, we were able to go on wonderful hikes and enjoy local specialties. The trip did us a lot of good!\n\nWarm regards,\nDavid"
    },
    B2: {
      text: "Sehr geehrte Damen und Herren,\n\nmit großem Interesse bewerbe ich mich um die ausgeschriebene Position als Projektmanager in Ihrem Hause. Durch meine mehrjährige Berufserfahrung in internationalen Teams bin ich mit agilen Arbeitsmethoden bestens vertraut. Ich zeichne mich durch ausgeprägte Kommunikationsstärke und strukturierte Problemlösungskompetenz aus. Über die Gelegenheit, mich Ihnen in einem persönlichen Gespräch vorzustellen, würde ich mich sehr freuen.\n\nMit freundlichen Grüßen,\nDavid Schmidt",
      translation: "Dear Sir or Madam,\n\nWith great interest, I am applying for the advertised position as Project Manager at your firm. Through several years of professional experience in international teams, I am thoroughly well-versed in agile work methodologies. I stand out through strong communication skills and structured problem-solving competence. I would be delighted to introduce myself in a personal interview.\n\nSincerely yours,\nDavid Schmidt"
    },
    C1: {
      text: "Die fortschreitende Integration künstlicher Intelligenz in den Hochschulalltag markiert einen fundamentalen Paradigmenwechsel im Bildungswesen. Einerseits eröffnet der zielgerichtete Einsatz intelligenter Assistenzsysteme beispiellose Möglichkeiten zur Individualisierung von Lernprozessen. Andererseits bedarf es eines fundierten regulatorischen Rahmens, um akademische Integrität und die kritische Reflexionsfähigkeit der Studierenden nachhaltig zu gewährleisten.",
      translation: "The progressive integration of artificial intelligence into everyday university life marks a fundamental paradigm shift in education. On the one hand, the targeted use of intelligent assistance systems opens up unprecedented opportunities for individualized learning. On the other hand, a sound regulatory framework is indispensable to sustainably safeguard academic integrity and students' critical reasoning capabilities."
    }
  };

  const modelAns = modelAnswers[higherLevel] || modelAnswers.A2;

  const result = {
    taskPoints,
    criteria,
    overall,
    score: overall, // backward compatibility
    estimateOnly: true,
    isOffline: true,
    rubricInstitution,
    rubricMaxPoints: rubric.maxPoints,
    feedback: wordShortfall
      ? `Offline Basic Check: Your submission contains ${wordCount} words (minimum target: ${minWords}). Check the V2 verb position, connector usage, and ensure all prompt bullet points are thoroughly answered.`
      : `Offline Basic Check: Good effort! You met the minimum word count (${wordCount} words) and utilized ${detectedConnectors.length} connectors. Review the highlighted corrections below.`,
    correctedText,
    mistakes,
    modelAnswer: {
      level: higherLevel,
      text: modelAns.text,
      translation: modelAns.translation
    },
    apiWarning: "Offline Heuristic Evaluation (Basic Check). Scores are automated estimates and not certified exam results."
  };

  return WritingEvaluationSchema.parse(result);
}

/**
 * Main evaluation entrypoint
 */
export async function evaluateWriting({
  apiKey,
  modelName,
  level = "A1",
  taskTitle = "Writing Task",
  taskPrompt = "",
  requiredPoints = [],
  targetWords = "30 - 50 words",
  userText = "",
  rubricInstitution = "goethe"
}) {
  const activeKey =
    apiKey ||
    (typeof import.meta !== "undefined" && import.meta.env?.VITE_GEMINI_API_KEY) ||
    "";

  // Fallback to offline evaluation if no key is configured
  if (!activeKey || activeKey.trim() === "" || activeKey.includes("your_")) {
    return generateOfflineWritingEvaluation({
      level,
      taskTitle,
      taskPrompt,
      requiredPoints,
      targetWords,
      userText,
      rubricInstitution
    });
  }

  const activeModel = getActiveGeminiModel(modelName);
  const systemPrompt = buildWritingSystemPrompt(level, taskTitle, taskPrompt, requiredPoints, rubricInstitution);

  try {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(activeModel)}:generateContent?key=${activeKey}`;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `Student Level: ${level}\nTask: ${taskTitle}\nPrompt: ${taskPrompt}\nRubric Institution: ${rubricInstitution}\n\nStudent's Written Text:\n"""\n${userText}\n"""\n\nPlease evaluate this text and return the JSON feedback matching the exact schema.`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.3,
          response_mime_type: "application/json"
        }
      })
    });

    if (!response.ok) {
      let warnMessage = `Gemini evaluation error (HTTP ${response.status}). Using offline basic check.`;
      if (response.status === 404) {
        warnMessage = `Gemini model '${activeModel}' not found (HTTP 404). Check model in Settings. Evaluated with offline pedagogical engine.`;
      } else if (response.status === 429) {
        warnMessage = "Gemini API rate limit exceeded (HTTP 429). Evaluated with offline pedagogical engine.";
      }
      console.warn(warnMessage);
      const fallback = generateOfflineWritingEvaluation({
        level,
        taskTitle,
        taskPrompt,
        requiredPoints,
        targetWords,
        userText,
        rubricInstitution
      });
      return {
        ...fallback,
        apiWarning: warnMessage
      };
    }

    const data = await response.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const cleanJson = candidateText.replace(/^```json\s*/, "").replace(/\s*```$/, "").trim();
    const parsed = JSON.parse(cleanJson);

    // Ensure estimateOnly is true and score matches overall
    parsed.estimateOnly = true;
    if (parsed.overall !== undefined) {
      parsed.score = parsed.overall;
    }

    return WritingEvaluationSchema.parse(parsed);
  } catch (err) {
    console.warn("Exception during writing evaluation:", err);
    return generateOfflineWritingEvaluation({
      level,
      taskTitle,
      taskPrompt,
      requiredPoints,
      targetWords,
      userText,
      rubricInstitution
    });
  }
}
