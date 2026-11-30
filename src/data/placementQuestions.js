/**
 * src/data/placementQuestions.js
 *
 * 12 Adaptive Placement Test Questions spanning CEFR A1.1 through B1.2 / B2.
 * Covers Grammar, Vocabulary, and Short Reading Comprehension.
 *
 * Adaptive routing maps performance to the optimal starting unit in DeutschPath curriculum.
 */

export const PLACEMENT_QUESTIONS = [
  // 1. A1.1 - Basic Definite Article (Grammar)
  {
    id: "place-1",
    stage: 1,
    difficulty: "A1.1",
    category: "grammar",
    question: "Das ist _____ Stuhl.",
    options: ["der", "die", "das", "den"],
    correctAnswer: 0,
    explanation: "'Stuhl' ist maskulin im Nominativ (Subjekt von 'sein') -> 'der'."
  },
  // 2. A1.1 - Basic Everyday Vocabulary
  {
    id: "place-2",
    stage: 1,
    difficulty: "A1.1",
    category: "vocabulary",
    question: "Wie heißt das Gegenteil von 'groß'?",
    options: ["klein", "schnell", "alt", "schön"],
    correctAnswer: 0,
    explanation: "Das Antonym von 'groß' ist 'klein'."
  },
  // 3. A1.2 - Short Reading Comprehension
  {
    id: "place-3",
    stage: 1,
    difficulty: "A1.2",
    category: "reading",
    passage: "Bäckerei Schmidt: Montag bis Freitag von 06:30 bis 18:00 Uhr geöffnet. Samstag von 07:00 bis 12:00 Uhr. Sonntag geschlossen.",
    question: "Wann kann man am Sonntag frische Brötchen kaufen?",
    options: [
      "Am Sonntag ist die Bäckerei geschlossen",
      "Von 07:00 bis 12:00 Uhr",
      "Den ganzen Tag ab 06:30 Uhr"
    ],
    correctAnswer: 0,
    explanation: "Im Text steht ausdrücklich: 'Sonntag geschlossen'."
  },
  // 4. A1.2 - Akkusativ Direct Object (Grammar)
  {
    id: "place-4",
    stage: 2,
    difficulty: "A1.2",
    category: "grammar",
    question: "Ich trinke morgens gerne _____ Kaffee.",
    options: ["einen", "ein", "eine", "einem"],
    correctAnswer: 0,
    explanation: "'Kaffee' ist maskulin. Als Akkusativobjekt von 'trinken' heißt es 'einen Kaffee'."
  },
  // 5. A2.1 - Modal Verb Conjugation (Grammar)
  {
    id: "place-5",
    stage: 2,
    difficulty: "A2.1",
    category: "grammar",
    question: "Wir _____ heute leider nicht kommen, weil wir arbeiten müssen.",
    options: ["können", "kann", "könnt", "konnten"],
    correctAnswer: 0,
    explanation: "1. Person Plural (wir) von 'können' im Präsens ist 'können'."
  },
  // 6. A2.1 - Collocations & Work Vocabulary
  {
    id: "place-6",
    stage: 2,
    difficulty: "A2.1",
    category: "vocabulary",
    question: "Frau Weber arbeitet bei Siemens. Was ist das richtige Nomen?",
    options: [
      "Sie hat eine neue Arbeitsstelle gefunden",
      "Sie hat einen neuen Urlaub gemacht",
      "Sie hat einen neuen Stift gekocht"
    ],
    correctAnswer: 0,
    explanation: "'Arbeitsstelle finden' ist die korrekte berufliche Kollokation."
  },
  // 7. A2.2 - Dativ Preposition (Grammar)
  {
    id: "place-7",
    stage: 3,
    difficulty: "A2.2",
    category: "grammar",
    question: "Ich fahre jeden Morgen mit _____ U-Bahn zur Arbeit.",
    options: ["der", "die", "das", "dem"],
    correctAnswer: 0,
    explanation: "Die Präposition 'mit' verlangt immer den Dativ. Feminin Dativ: 'der' (mit der U-Bahn)."
  },
  // 8. A2.2 - Short Reading Notice
  {
    id: "place-8",
    stage: 3,
    difficulty: "A2.2",
    category: "reading",
    passage: "Sehr geehrte Fahrgäste, wegen Gleisbauarbeiten hält der Regionalexpress RE 5 heute nicht in Bingen. Bitte nutzen Sie die Busse des Schienenersatzverkehrs ab Vorplatz.",
    question: "Wie kommen Fahrgäste heute nach Bingen?",
    options: [
      "Mit dem Schienenersatzverkehr per Bus",
      "Mit dem normalen Regionalexpress RE 5",
      "Gar nicht, die Verbindung fällt ersatzlos aus"
    ],
    correctAnswer: 0,
    explanation: "Fahrgäste sollen die Ersatzbusse ab Bahnhofsvorplatz nutzen."
  },
  // 9. B1.1 - Subordinate Clause with 'weil' (Verb-End Position)
  {
    id: "place-9",
    stage: 3,
    difficulty: "B1.1",
    category: "grammar",
    question: "Welcher Satz ist grammatisch korrekt?",
    options: [
      "Er lernt Deutsch, weil er in Deutschland arbeiten möchte.",
      "Er lernt Deutsch, weil er möchte in Deutschland arbeiten.",
      "Er lernt Deutsch, weil möchte er in Deutschland arbeiten."
    ],
    correctAnswer: 0,
    explanation: "In Nebensätzen mit 'weil' steht das finite Verb ('möchte') ganz am Ende."
  },
  // 10. B1.1 - Wechselpräpositionen (Akkusativ vs. Dativ)
  {
    id: "place-10",
    stage: 4,
    difficulty: "B1.1",
    category: "grammar",
    question: "Wohin stellst du das Glas? - Ich stelle das Glas auf _____ Tisch.",
    options: ["den", "dem", "der", "das"],
    correctAnswer: 0,
    explanation: "Frage 'Wohin?' (Richtung / Bewegung) verlangt den Akkusativ: 'auf den Tisch'."
  },
  // 11. B1.2 - Connectors & Contrast Vocabulary
  {
    id: "place-11",
    stage: 4,
    difficulty: "B1.2",
    category: "vocabulary",
    question: "Es regnete in Strömen, _____ gingen wir im Park spazieren.",
    options: ["trotzdem", "obwohl", "weil", "denn"],
    correctAnswer: 0,
    explanation: "'trotzdem' ist ein konzessives Adverb mit Inversion (Verb auf Position 2: 'gingen wir')."
  },
  // 12. B2.1 - Advanced Reading & Konjunktiv II / Formal German
  {
    id: "place-12",
    stage: 4,
    difficulty: "B2.1",
    category: "reading",
    passage: "In Anbetracht der aktuellen Marktentwicklung empfiehlt die Geschäftsleitung, die Investitionen in hybride Arbeitsmodelle zu verstetigen. Würden die Mittel gekürzt, stünde die Zukunftsfähigkeit des Unternehmens auf dem Spiel.",
    question: "Was befürchtet die Geschäftsleitung bei einer Budgetkürzung?",
    options: [
      "Gefährdung der langfristigen Wettbewerbsfähigkeit",
      "Sofortige Schließung aller Auslandsfilialen",
      "Rückkehr zu reiner Präsenzarbeit ohne Mehrkosten"
    ],
    correctAnswer: 0,
    explanation: "'auf dem Spiel stehen' bedeutet eine existentielle Gefährdung der Zukunftsfähigkeit."
  }
];

/**
 * Calculates adaptive placement result and recommended starting unit
 * @param {Array<{ questionId: string, answerIndex: number, isCorrect: boolean }>} answers
 * @returns {Object} Placement result with level, starting unit id and title
 */
export function evaluatePlacementTest(answers = []) {
  const correctCount = answers.filter((a) => a.isCorrect).length;
  const total = answers.length || 12;
  const scorePercent = Math.round((correctCount / total) * 100);

  let recommendedLevel = "A1";
  let recommendedUnitId = "a1-u1";
  let recommendedUnitTitle = "Unit 1: Willkommen & Grundlagen";
  let levelDescription = "Absolute Beginner: Begin with foundational German alphabet, greetings, and present tense.";

  if (correctCount >= 11) {
    recommendedLevel = "B2";
    recommendedUnitId = "b2-u25";
    recommendedUnitTitle = "Unit 25: Gesellschaft & Medien";
    levelDescription = "Upper Intermediate: Ready for professional, academic, and complex argumentative German.";
  } else if (correctCount >= 9) {
    recommendedLevel = "B1";
    recommendedUnitId = "b1-u17";
    recommendedUnitTitle = "Unit 17: Reisen & Mobilität";
    levelDescription = "Intermediate: You have solid basic grammar; jump straight into complex clauses and B1 topics.";
  } else if (correctCount >= 7) {
    recommendedLevel = "A2";
    recommendedUnitId = "a2-u13";
    recommendedUnitTitle = "Unit 13: Arbeit & Alltag";
    levelDescription = "Elementary: You master basic articles and can focus on Dativ, Perfekt, and daily workplace topics.";
  } else if (correctCount >= 4) {
    recommendedLevel = "A1.2";
    recommendedUnitId = "a1-u5";
    recommendedUnitTitle = "Unit 5: Essen & Trinken";
    levelDescription = "Advanced Beginner: You understand basic introductions; continue from restaurant and shopping dialogues.";
  }

  return {
    correctCount,
    total,
    scorePercent,
    recommendedLevel,
    recommendedUnitId,
    recommendedUnitTitle,
    levelDescription
  };
}
