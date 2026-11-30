/**
 * German Noun Gender Suffix Rules & Linguistic Exception Patterns
 * 
 * Used for pedagogical explanations, hints in Gender Drill, and automatic morphological checks.
 */

export const NOUN_GENDER_RULES = [
  // =================== FEMININE (die) ===================
  {
    id: "fem-ung",
    gender: "die",
    suffix: "-ung",
    reliability: "99%",
    description: "Nouns derived from verbs ending in -ung are virtually 100% feminine.",
    examples: [
      { word: "Wohnung", english: "apartment", plural: "die Wohnungen" },
      { word: "Zeitung", english: "newspaper", plural: "die Zeitungen" },
      { word: "Rechnung", english: "bill / invoice", plural: "die Rechnungen" },
      { word: "Übung", english: "exercise", plural: "die Übungen" }
    ],
    exceptions: ["der Sprung" /* root noun, not suffix */]
  },
  {
    id: "fem-heit-keit",
    gender: "die",
    suffix: "-heit / -keit",
    reliability: "100%",
    description: "Abstract nouns formed from adjectives with -heit or -keit are strictly feminine.",
    examples: [
      { word: "Freiheit", english: "freedom", plural: "die Freiheiten" },
      { word: "Krankheit", english: "illness", plural: "die Krankheiten" },
      { word: "Möglichkeit", english: "possibility", plural: "die Möglichkeiten" },
      { word: "Schnelligkeit", english: "speed", plural: "die Schnelligkeiten" }
    ],
    exceptions: []
  },
  {
    id: "fem-schaft",
    gender: "die",
    suffix: "-schaft",
    reliability: "100%",
    description: "Collective and relational nouns ending in -schaft are always feminine.",
    examples: [
      { word: "Freundschaft", english: "friendship", plural: "die Freundschaften" },
      { word: "Mannschaft", english: "team", plural: "die Mannschaften" },
      { word: "Nachbarschaft", english: "neighborhood", plural: "die Nachbarschaften" },
      { word: "Wirtschaft", english: "economy", plural: "die Wirtschaften" }
    ],
    exceptions: []
  },
  {
    id: "fem-ion-taet",
    gender: "die",
    suffix: "-ion / -tät / -ik",
    reliability: "98%",
    description: "Foreign loanwords of Latin/Greek origin with -ion, -tät, -ik are feminine.",
    examples: [
      { word: "Station", english: "station", plural: "die Stationen" },
      { word: "Information", english: "information", plural: "die Informationen" },
      { word: "Universität", english: "university", plural: "die Universitäten" },
      { word: "Musik", english: "music", plural: "-" }
    ],
    exceptions: ["das Stadion", "der Spion"]
  },

  // =================== NEUTER (das) ===================
  {
    id: "neu-chen-lein",
    gender: "das",
    suffix: "-chen / -lein",
    reliability: "100%",
    description: "Diminutives ending in -chen or -lein are grammatically 100% neuter.",
    examples: [
      { word: "Mädchen", english: "girl", plural: "die Mädchen" },
      { word: "Brötchen", english: "bread roll", plural: "die Brötchen" },
      { word: "Häuschen", english: "small house", plural: "die Häuschen" },
      { word: "Fräulein", english: "miss", plural: "die Fräulein" }
    ],
    exceptions: []
  },
  {
    id: "neu-ment-um",
    gender: "das",
    suffix: "-ment / -um",
    reliability: "95%",
    description: "Nouns of Latin or French origin ending in -ment or -um are neuter.",
    examples: [
      { word: "Dokument", english: "document", plural: "die Dokumente" },
      { word: "Instrument", english: "instrument", plural: "die Instrumente" },
      { word: "Zentrum", english: "center", plural: "die Zentren" },
      { word: "Museum", english: "museum", plural: "die Museen" }
    ],
    exceptions: ["der Moment" /* in the sense of time */, "der Zement"]
  },
  {
    id: "neu-nis",
    gender: "das",
    suffix: "-nis",
    reliability: "80%",
    description: "Most nouns ending in -nis are neuter, though a few key feminine exceptions exist.",
    examples: [
      { word: "Ergebnis", english: "result", plural: "die Ergebnisse" },
      { word: "Zeugnis", english: "certificate / report", plural: "die Zeugnisse" },
      { word: "Geheimnis", english: "secret", plural: "die Geheimnisse" }
    ],
    exceptions: [
      "die Erlaubnis (permission)",
      "die Kenntnis (knowledge)",
      "die Finsternis (darkness)"
    ]
  },

  // =================== MASCULINE (der) ===================
  {
    id: "masc-er",
    gender: "der",
    suffix: "-er",
    reliability: "75%",
    description: "Nouns designating male agents, professions, or devices from verbs ending in -er are der.",
    examples: [
      { word: "Lehrer", english: "teacher (m)", plural: "die Lehrer" },
      { word: "Computer", english: "computer", plural: "die Computer" },
      { word: "Fahrer", english: "driver", plural: "die Fahrer" },
      { word: "Kugelschreiber", english: "pen", plural: "die Kugelschreiber" }
    ],
    exceptions: [
      "die Butter (butter)",
      "die Mutter (mother)",
      "die Schwester (sister)",
      "das Fenster (window)",
      "das Zimmer (room)",
      "das Wasser (water)"
    ]
  },
  {
    id: "masc-ling",
    gender: "der",
    suffix: "-ling",
    reliability: "100%",
    description: "Nouns with suffix -ling describing living beings or things are always masculine.",
    examples: [
      { word: "Schmetterling", english: "butterfly", plural: "die Schmetterlinge" },
      { word: "Flüchtling", english: "refugee", plural: "die Flüchtlinge" },
      { word: "Lehrling", english: "apprentice", plural: "die Lehrlinge" },
      { word: "Zwilling", english: "twin", plural: "die Zwillinge" }
    ],
    exceptions: []
  },
  {
    id: "masc-ismus-or",
    gender: "der",
    suffix: "-ismus / -or / -ist",
    reliability: "98%",
    description: "Loanwords and scientific/political concepts ending in -ismus, -or, -ist are masculine.",
    examples: [
      { word: "Optimismus", english: "optimism", plural: "-" },
      { word: "Motor", english: "engine", plural: "die Motoren" },
      { word: "Journalist", english: "journalist", plural: "die Journalisten" },
      { word: "Rezeptor", english: "receptor", plural: "die Rezeptoren" }
    ],
    exceptions: ["das Labor"]
  }
];

/**
 * Matches a noun against suffix rules and returns pedagogical gender analysis
 * @param {string} noun
 * @returns {{ rule: Object|null, predictedGender: 'der'|'die'|'das'|null, isException: boolean, reason: string }}
 */
export function analyzeNounGender(noun) {
  if (!noun || typeof noun !== "string") {
    return { rule: null, predictedGender: null, isException: false, reason: "No noun provided" };
  }

  const clean = noun.trim();

  // Check known exceptions first
  for (const rule of NOUN_GENDER_RULES) {
    for (const exc of rule.exceptions) {
      const excWord = exc.split(" ")[1] || exc;
      if (clean.toLowerCase() === excWord.toLowerCase()) {
        const correctArticle = exc.startsWith("die") ? "die" : exc.startsWith("das") ? "das" : "der";
        return {
          rule,
          predictedGender: correctArticle,
          isException: true,
          reason: `Exception to ${rule.suffix} rule: '${clean}' is ${correctArticle}.`
        };
      }
    }
  }

  // Check suffix rules
  for (const rule of NOUN_GENDER_RULES) {
    const suffixes = rule.suffix.split("/").map((s) => s.trim().replace(/^-/, "").toLowerCase());
    for (const suf of suffixes) {
      if (clean.toLowerCase().endsWith(suf)) {
        return {
          rule,
          predictedGender: rule.gender,
          isException: false,
          reason: `Ends with '${rule.suffix}' -> typically ${rule.gender} (${rule.reliability} reliability).`
        };
      }
    }
  }

  return {
    rule: null,
    predictedGender: null,
    isException: false,
    reason: "No standard suffix rule detected; consult vocabulary dictionary."
  };
}
