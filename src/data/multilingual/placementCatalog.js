/**
 * src/data/multilingual/placementCatalog.js
 *
 * 12 Adaptive Placement Test questions per target language to benchmark
 * the user's initial CEFR level (A1 -> B2) and recommend the optimal starting unit.
 */

import { PLACEMENT_QUESTIONS as germanPlacement } from "../placementQuestions";

export const englishPlacement = [
  {
    id: "place-en-1",
    stage: 1,
    difficulty: "A1.1",
    category: "grammar",
    question: "This is _____ interesting book.",
    options: ["an", "a", "the", "one"],
    correctAnswer: 0,
    explanation: "'Interesting' starts with a vowel sound /ɪ/ -> use 'an'."
  },
  {
    id: "place-en-2",
    stage: 1,
    difficulty: "A1.1",
    category: "vocabulary",
    question: "What is the opposite of 'expensive'?",
    options: ["cheap", "fast", "heavy", "far"],
    correctAnswer: 0,
    explanation: "The antonym of 'expensive' is 'cheap'."
  },
  {
    id: "place-en-3",
    stage: 1,
    difficulty: "A1.2",
    category: "reading",
    passage: "City Library Opening Hours: Monday to Friday 09:00 - 19:00. Saturday 10:00 - 14:00. Closed on Sunday.",
    question: "When can you visit the library on Sunday?",
    options: ["The library is closed on Sunday", "From 10:00 to 14:00", "All day from 09:00"],
    correctAnswer: 0,
    explanation: "The notice explicitly states: 'Closed on Sunday'."
  },
  {
    id: "place-en-4",
    stage: 2,
    difficulty: "A1.2",
    category: "grammar",
    question: "Every morning she _____ at 7:00 AM.",
    options: ["wakes up", "is waking up", "woke up", "wake up"],
    correctAnswer: 0,
    explanation: "Habitual routines require Present Simple 3rd person singular '-s' ('wakes up')."
  },
  {
    id: "place-en-5",
    stage: 2,
    difficulty: "A2.1",
    category: "grammar",
    question: "Yesterday they _____ to the museum by train.",
    options: ["went", "go", "have gone", "gone"],
    correctAnswer: 0,
    explanation: "'Yesterday' marks completed past action -> irregular past simple 'went'."
  },
  {
    id: "place-en-6",
    stage: 2,
    difficulty: "A2.2",
    category: "vocabulary",
    question: "Which phrasal verb means 'to cancel an event'?",
    options: ["call off", "give up", "look for", "turn down"],
    correctAnswer: 0,
    explanation: "'Call off' means to cancel an event."
  },
  {
    id: "place-en-7",
    stage: 3,
    difficulty: "B1.1",
    category: "grammar",
    question: "If I _____ more free time, I would travel around the world.",
    options: ["had", "have", "would have", "will have"],
    correctAnswer: 0,
    explanation: "Second conditional (unreal present): If + past simple ('had'), would + verb."
  },
  {
    id: "place-en-8",
    stage: 3,
    difficulty: "B1.2",
    category: "reading",
    passage: "Remote work offers flexible schedules, but studies indicate that clear boundaries between personal life and work hours are crucial to avoid burnout.",
    question: "What is essential for remote workers to prevent burnout?",
    options: [
      "Clear boundaries between personal and work time",
      "Working longer hours without breaks",
      "Avoiding all digital communication"
    ],
    correctAnswer: 0,
    explanation: "The passage notes that 'clear boundaries between personal life and work hours are crucial'."
  },
  {
    id: "place-en-9",
    stage: 3,
    difficulty: "B2.1",
    category: "grammar",
    question: "Hardly had the meeting started _____ the power went out.",
    options: ["when", "than", "then", "as"],
    correctAnswer: 0,
    explanation: "Negative inversion pairing: 'Hardly had ... when ...'."
  },
  {
    id: "place-en-10",
    stage: 4,
    difficulty: "B2.2",
    category: "vocabulary",
    question: "What does the idiom 'hit the nail on the head' mean?",
    options: [
      "To describe exactly what is causing a situation",
      "To make an accidental mistake",
      "To build something with tools"
    ],
    correctAnswer: 0,
    explanation: "'To hit the nail on the head' means to be completely accurate or describe a situation precisely."
  },
  {
    id: "place-en-11",
    stage: 4,
    difficulty: "B2.2",
    category: "grammar",
    question: "The director insisted that all reports _____ submitted before Friday.",
    options: ["be", "are", "were", "been"],
    correctAnswer: 0,
    explanation: "Mandative subjunctive in formal English: 'insisted that all reports be submitted'."
  },
  {
    id: "place-en-12",
    stage: 4,
    difficulty: "B2+",
    category: "reading",
    passage: "Technological innovation in linguistic modeling has accelerated, yet human nuance and cultural resonance remain irreplaceable in diplomacy.",
    question: "What does the text conclude about diplomatic translation?",
    options: [
      "Human nuance and cultural resonance remain irreplaceable",
      "Linguistic models have made human translators obsolete",
      "Cultural factors have no impact on international diplomacy"
    ],
    correctAnswer: 0,
    explanation: "The text states explicitly that 'human nuance and cultural resonance remain irreplaceable'."
  }
];

export const spanishPlacement = [
  {
    id: "place-es-1",
    stage: 1,
    difficulty: "A1.1",
    category: "grammar",
    question: "Ella _____ de España.",
    options: ["es", "está", "son", "están"],
    correctAnswer: 0,
    explanation: "Para el origen o nacionalidad se usa el verbo SER -> 'es de España'."
  },
  {
    id: "place-es-2",
    stage: 1,
    difficulty: "A1.1",
    category: "vocabulary",
    question: "¿Cuál es el opuesto de 'fácil'?",
    options: ["difícil", "rápido", "caro", "alto"],
    correctAnswer: 0,
    explanation: "El antónimo de 'fácil' es 'difícil'."
  },
  {
    id: "place-es-3",
    stage: 1,
    difficulty: "A1.2",
    category: "reading",
    passage: "Museo del Prado: Abierto de lunes a sábado de 10:00 a 20:00. Domingos de 10:00 a 19:00. Entrada gratuita las dos últimas horas.",
    question: "¿Cuándo es gratuita la entrada al museo?",
    options: ["Las dos últimas horas de cada día", "Todo el día los domingos", "Los lunes por la mañana"],
    correctAnswer: 0,
    explanation: "El texto dice: 'Entrada gratuita las dos últimas horas'."
  },
  {
    id: "place-es-4",
    stage: 2,
    difficulty: "A1.2",
    category: "grammar",
    question: "Ayer nosotros _____ paella en Valencia.",
    options: ["comimos", "comemos", "comíamos", "han comido"],
    correctAnswer: 0,
    explanation: "'Ayer' requiere el Pretérito Indefinido puntual -> 'comimos'."
  },
  {
    id: "place-es-5",
    stage: 2,
    difficulty: "A2.1",
    category: "grammar",
    question: "Este libro es _____ estudiar gramática.",
    options: ["para", "por", "de", "en"],
    correctAnswer: 0,
    explanation: "Finalidad u objetivo -> 'para'."
  },
  {
    id: "place-es-6",
    stage: 3,
    difficulty: "B1.1",
    category: "grammar",
    question: "Dudo que ellos _____ a tiempo hoy.",
    options: ["lleguen", "llegan", "llegaron", "llegarán"],
    correctAnswer: 0,
    explanation: "La duda ('Dudo que...') exige el Presente de Subjuntivo -> 'lleguen'."
  }
];

export const frenchPlacement = [
  {
    id: "place-fr-1",
    stage: 1,
    difficulty: "A1.1",
    category: "grammar",
    question: "Je cherche _____ clé de la maison.",
    options: ["la", "le", "les", "un"],
    correctAnswer: 0,
    explanation: "'Clé' est un nom féminin -> 'la clé'."
  },
  {
    id: "place-fr-2",
    stage: 1,
    difficulty: "A1.1",
    category: "vocabulary",
    question: "Quel est le contraire de 'grand' ?",
    options: ["petit", "rapide", "chaud", "cher"],
    correctAnswer: 0,
    explanation: "L'antonyme de 'grand' est 'petit'."
  },
  {
    id: "place-fr-3",
    stage: 2,
    difficulty: "A2.1",
    category: "grammar",
    question: "Hier soir, nous _____ au restaurant.",
    options: ["sommes allés", "avons allé", "allons", "allions"],
    correctAnswer: 0,
    explanation: "Le verbe 'aller' se conjugue avec l'auxiliaire être et s'accorde en genre et nombre -> 'sommes allés'."
  },
  {
    id: "place-fr-4",
    stage: 3,
    difficulty: "B1.1",
    category: "grammar",
    question: "Il faut que vous _____ vos devoirs.",
    options: ["fassiez", "faites", "ferez", "feriez"],
    correctAnswer: 0,
    explanation: "L'obligation impersonnelle 'Il faut que' exige le subjonctif présent du verbe faire -> 'fassiez'."
  }
];

export const PLACEMENT_BY_LANGUAGE = {
  de: germanPlacement,
  en: englishPlacement,
  es: spanishPlacement,
  fr: frenchPlacement,
  ar: englishPlacement, // adaptive fallback
  it: spanishPlacement
};

/**
 * Returns placement questions for given target language
 */
export function getPlacementQuestionsByLanguage(languageId = "de") {
  const norm = (languageId || "de").toLowerCase().trim();
  return PLACEMENT_BY_LANGUAGE[norm] || PLACEMENT_BY_LANGUAGE.de;
}
