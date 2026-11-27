/**
 * src/data/multilingual/grammarCatalog.js
 *
 * Grammar exercises, rules, and contrastive drills for each target language:
 * German (de), English (en), Spanish (es), French (fr), Arabic (ar), Italian (it).
 */

import germanGrammar from "../grammarExercisesA1.json";

export const englishGrammar = [
  {
    id: "g-en-001",
    topic: "Present Simple vs Present Continuous",
    level: "A1",
    instruction: "Choose the correct form of the verb according to the context.",
    sentence: "Look outside! It _____ right now.",
    options: ["is raining", "rains", "rained", "has rained"],
    correctAnswer: 0,
    explanation: "'Look outside! Right now' indicates an action happening at the moment of speaking -> Present Continuous ('is raining')."
  },
  {
    id: "g-en-002",
    topic: "Present Simple vs Present Continuous",
    level: "A1",
    instruction: "Choose the correct form of the verb for habits.",
    sentence: "She _____ coffee every morning before work.",
    options: ["drinks", "is drinking", "drink", "drank"],
    correctAnswer: 0,
    explanation: "'Every morning' expresses a regular daily habit -> Present Simple with 3rd person singular '-s' ('drinks')."
  },
  {
    id: "g-en-003",
    topic: "Past Simple vs Present Perfect",
    level: "A2",
    instruction: "Select the correct tense for completed past action with a specific time.",
    sentence: "I _____ London three years ago.",
    options: ["visited", "have visited", "am visiting", "visit"],
    correctAnswer: 0,
    explanation: "'Three years ago' specifies a finished past time -> Past Simple ('visited')."
  },
  {
    id: "g-en-004",
    topic: "Past Simple vs Present Perfect",
    level: "A2",
    instruction: "Select the correct tense for life experience with 'ever'.",
    sentence: "Have you ever _____ to Tokyo?",
    options: ["been", "went", "be", "was"],
    correctAnswer: 0,
    explanation: "With 'Have you ever...', use the past participle of 'be' -> 'been'."
  },
  {
    id: "g-en-005",
    topic: "Articles (a / an / the)",
    level: "A1",
    instruction: "Choose the appropriate article.",
    sentence: "She bought _____ umbrella because of the rain.",
    options: ["an", "a", "the", "∅"],
    correctAnswer: 0,
    explanation: "'Umbrella' starts with a vowel sound /ʌ/, so use the indefinite article 'an'."
  },
  {
    id: "g-en-006",
    topic: "Prepositions of Time (in / on / at)",
    level: "A1",
    instruction: "Choose the correct preposition for days of the week.",
    sentence: "Our team meeting takes place _____ Monday morning.",
    options: ["on", "in", "at", "to"],
    correctAnswer: 0,
    explanation: "Use 'on' before specific days of the week ('on Monday morning')."
  },
  {
    id: "g-en-007",
    topic: "First Conditional",
    level: "B1",
    instruction: "Complete the real condition in the future.",
    sentence: "If it rains tomorrow, we _____ stay at home.",
    options: ["will", "would", "had", "are"],
    correctAnswer: 0,
    explanation: "First conditional rule: If + present simple, will + base verb ('we will stay')."
  }
];

export const spanishGrammar = [
  {
    id: "g-es-001",
    topic: "Ser vs Estar",
    level: "A1",
    instruction: "Elige entre Ser y Estar según la cualidad esencial o estado temporal.",
    sentence: "María _____ médica en el hospital central.",
    options: ["es", "está", "son", "están"],
    correctAnswer: 0,
    explanation: "Las profesiones e identidades definitorias usan el verbo SER -> 'es médica'."
  },
  {
    id: "g-es-002",
    topic: "Ser vs Estar",
    level: "A1",
    instruction: "Elige entre Ser y Estar para una ubicación física.",
    sentence: "¿Dónde _____ la estación de tren más cercana?",
    options: ["está", "es", "hay", "tiene"],
    correctAnswer: 0,
    explanation: "La localización espacial de objetos y lugares se expresa con ESTAR -> '¿Dónde está?'."
  },
  {
    id: "g-es-003",
    topic: "Por vs Para",
    level: "A2",
    instruction: "Distingue entre causa/medio y finalidad/destinatario.",
    sentence: "Este regalo es _____ ti, con mucho cariño.",
    options: ["para", "por", "de", "en"],
    correctAnswer: 0,
    explanation: "El destinatario u objetivo final requiere la preposición 'para'."
  },
  {
    id: "g-es-004",
    topic: "Pretérito Indefinido vs Imperfecto",
    level: "A2",
    instruction: "Elige el tiempo verbal adecuado para una acción puntual terminada.",
    sentence: "Ayer _____ una película estupenda en el cine.",
    options: ["vi", "veía", "he visto", "veo"],
    correctAnswer: 0,
    explanation: "'Ayer' marca una acción puntual y concluida en el pasado -> Pretérito Indefinido ('vi')."
  },
  {
    id: "g-es-005",
    topic: "Subjuntivo Presente",
    level: "B1",
    instruction: "Usa el modo subjuntivo para expresar un deseo.",
    sentence: "Espero que tú _____ un viaje maravilloso.",
    options: ["tengas", "tienes", "tuviste", "tendrás"],
    correctAnswer: 0,
    explanation: "'Espero que' exige el presente de subjuntivo -> 'tengas'."
  }
];

export const frenchGrammar = [
  {
    id: "g-fr-001",
    topic: "Passé Composé vs Imparfait",
    level: "A2",
    instruction: "Choisissez le temps approprié pour une description d'état dans le passé.",
    sentence: "Quand j'étais enfant, nous _____ à la campagne.",
    options: ["habitions", "avons habité", "habitons", "habiterons"],
    correctAnswer: 0,
    explanation: "L'imparfait ('habitions') s'utilise pour une habitude ou une situation continue dans le passé."
  },
  {
    id: "g-fr-002",
    topic: "Passé Composé vs Imparfait",
    level: "A2",
    instruction: "Choisissez le temps pour un événement soudain et ponctuel.",
    sentence: "Soudain, le téléphone _____ à sonner.",
    options: ["a commencé", "commençait", "commence", "avait commencé"],
    correctAnswer: 0,
    explanation: "'Soudain' introduit une action ponctuelle et délimitée dans le passé -> Passé composé ('a commencé')."
  },
  {
    id: "g-fr-003",
    topic: "Pronoms Y et EN",
    level: "B1",
    instruction: "Remplacez le lieu introduit par 'à'.",
    sentence: "Tu vas à la bibliothèque ? Oui, j'_____ vais tout de suite.",
    options: ["y", "en", "le", "lui"],
    correctAnswer: 0,
    explanation: "Le pronom adverbial 'y' remplace un complément de lieu introduit par la préposition 'à'."
  },
  {
    id: "g-fr-004",
    topic: "Articles Définis vs Indéfinis",
    level: "A1",
    instruction: "Choisissez l'article adéquat.",
    sentence: "J'aime beaucoup _____ musique classique.",
    options: ["la", "une", "de la", "du"],
    correctAnswer: 0,
    explanation: "Les verbes de goût (aimer, adorer, détester) s'emploient toujours avec l'article défini ('la musique')."
  }
];

export const arabicGrammar = [
  {
    id: "g-ar-001",
    topic: "الجملة الاسمية والجملة الفعلية",
    level: "A1",
    instruction: "اختر الكلمة المناسبة لإكمال الجملة الاسمية.",
    sentence: "الْكِتَابُ _____ وَمُفِيدٌ.",
    options: ["جَدِيدٌ", "جَدِيدًا", "جَدِيدٍ", "الْجَدِيدُ"],
    correctAnswer: 0,
    explanation: "خبر المبتدأ مرفوع بالضمة الظاهرة على آخره -> 'جَدِيدٌ'."
  },
  {
    id: "g-ar-002",
    topic: "حروف الجر والإعراب",
    level: "A1",
    instruction: "حدد حركة الاسم المجرور بعد حرف الجر 'فِي'.",
    sentence: "جَلَسَ الطَّالِبُ فِي _____ الْعِلْمِ.",
    options: ["مَكْتَبَةِ", "مَكْتَبَةُ", "مَكْتَبَةَ", "مَكْتَبَةٌ"],
    correctAnswer: 0,
    explanation: "الاسم بعد حرف الجر يجر بالكسرة -> 'مَكْتَبَةِ'."
  },
  {
    id: "g-ar-003",
    topic: "أدوات التعريف والتنوين",
    level: "A1",
    instruction: "اختر الصيغة الصحيحة للاسم النكرة المنون.",
    sentence: "اشْتَرَيْتُ _____ جَمِيلًا مِنَ الْمَتْجَرِ.",
    options: ["قَلَمًا", "الْقَلَمًا", "قَلَمٌ", "قَلَمٍ"],
    correctAnswer: 0,
    explanation: "مفعول به منصوب بتنوين الفتح -> 'قَلَمًا'."
  }
];

export const italianGrammar = [
  {
    id: "g-it-001",
    topic: "Passato Prossimo (Essere vs Avere)",
    level: "A2",
    instruction: "Scegli l'ausiliare corretto per il verbo di movimento 'andare'.",
    sentence: "Ieri sera noi _____ al cinema insieme.",
    options: ["siamo andati", "abbiamo andato", "siamo andato", "hanno andato"],
    correctAnswer: 0,
    explanation: "I verbi di movimento prendono l'ausiliare essere con accordo del participio passato ('siamo andati')."
  },
  {
    id: "g-it-002",
    topic: "Articoli Determinativi",
    level: "A1",
    instruction: "Scegli l'articolo determinativo maschile singolare davanti a 'sp-'.",
    sentence: "_____ studente legge con grande attenzione.",
    options: ["Lo", "Il", "La", "L'"],
    correctAnswer: 0,
    explanation: "Davanti a 's' impura (s + consonante come 'st'), si usa l'articolo determinativo 'Lo'."
  }
];

export const GRAMMAR_BY_LANGUAGE = {
  de: germanGrammar,
  en: englishGrammar,
  es: spanishGrammar,
  fr: frenchGrammar,
  ar: arabicGrammar,
  it: italianGrammar
};

/**
 * Returns grammar exercises for given target language
 */
export function getGrammarByLanguage(languageId = "de") {
  const norm = (languageId || "de").toLowerCase().trim();
  return GRAMMAR_BY_LANGUAGE[norm] || GRAMMAR_BY_LANGUAGE.de;
}
