/**
 * src/data/multilingual/flashcardsCatalog.js
 *
 * Provides starter SRS vocabulary flashcard decks for all target languages:
 * German (de), English (en), Spanish (es), French (fr), Arabic (ar), Italian (it).
 */

import germanCards from "../flashcardsA1.json";

export const englishFlashcards = [
  { id: "fc-en-001", word: "Welcome", translation: "Bienvenue", partOfSpeech: "exclamation", phonetic: "/ˈwel.kəm/", example: "Welcome to our language community!", level: "A1" },
  { id: "fc-en-002", word: "Journey", article: "the", translation: "Voyage / Périple", partOfSpeech: "noun", phonetic: "/ˈdʒɜː.ni/", example: "The journey of learning begins today.", level: "A1" },
  { id: "fc-en-003", word: "Meeting", article: "the", translation: "Réunion / Rencontre", partOfSpeech: "noun", phonetic: "/ˈmiː.tɪŋ/", example: "We scheduled an introductory meeting.", level: "A1" },
  { id: "fc-en-004", word: "Opportunity", article: "an", translation: "Opportunité", partOfSpeech: "noun", phonetic: "/ˌɒp.əˈtʃuː.nə.ti/", example: "Learning languages brings great opportunity.", level: "A1" },
  { id: "fc-en-005", word: "Achievement", article: "an", translation: "Réalisation / Succès", partOfSpeech: "noun", phonetic: "/əˈtʃiːv.mənt/", example: "Passing your test is a great achievement.", level: "A1" },
  { id: "fc-en-006", word: "Challenge", article: "a", translation: "Défi", partOfSpeech: "noun", phonetic: "/ˈtʃæl.ɪndʒ/", example: "Every challenge makes you stronger.", level: "A1" },
  { id: "fc-en-007", word: "Knowledge", article: "", translation: "Connaissance", partOfSpeech: "noun", phonetic: "/ˈnɒl.ɪdʒ/", example: "Knowledge expands your horizons.", level: "A1" },
  { id: "fc-en-008", word: "Community", article: "the", translation: "Communauté", partOfSpeech: "noun", phonetic: "/kəˈmjuː.nə.ti/", example: "Join an active learners community.", level: "A1" },
  { id: "fc-en-009", word: "Breakfast", article: "the", translation: "Petit-déjeuner", partOfSpeech: "noun", phonetic: "/ˈbrek.fəst/", example: "Enjoy a healthy breakfast every morning.", level: "A1" },
  { id: "fc-en-010", word: "Station", article: "the", translation: "Gare / Station", partOfSpeech: "noun", phonetic: "/ˈsteɪ.ʃən/", example: "The train station is nearby.", level: "A1" },
  { id: "fc-en-011", word: "Schedule", article: "the", translation: "Emploi du temps / Calendrier", partOfSpeech: "noun", phonetic: "/ˈʃedʒ.uːl/", example: "Check your daily study schedule.", level: "A1" },
  { id: "fc-en-012", word: "Friend", article: "a", translation: "Ami(e)", partOfSpeech: "noun", phonetic: "/frend/", example: "She is a kind friend.", level: "A1" },
  { id: "fc-en-013", word: "Improvement", article: "an", translation: "Amélioration", partOfSpeech: "noun", phonetic: "/ɪmˈpruːv.mənt/", example: "Noticeable improvement happens every day.", level: "A2" },
  { id: "fc-en-014", word: "Perspective", article: "a", translation: "Perspective", partOfSpeech: "noun", phonetic: "/pəˈspek.tɪv/", example: "Travel opens up a new perspective.", level: "A2" },
  { id: "fc-en-015", word: "Collaboration", article: "the", translation: "Collaboration", partOfSpeech: "noun", phonetic: "/kəˌlæb.əˈreɪ.ʃən/", example: "Collaboration drives innovation.", level: "B1" }
];

export const spanishFlashcards = [
  { id: "fc-es-001", word: "Hola", translation: "Bonjour / Salut", partOfSpeech: "interjección", phonetic: "/ˈo.la/", example: "¡Hola! ¿Cómo estás hoy?", level: "A1" },
  { id: "fc-es-002", word: "Casa", article: "la", translation: "Maison", partOfSpeech: "sustantivo", phonetic: "/ˈka.sa/", example: "Mi casa tiene mucha luz natural.", level: "A1" },
  { id: "fc-es-003", word: "Amigo", article: "el", translation: "Ami", partOfSpeech: "sustantivo", phonetic: "/aˈmi.ɣo/", example: "Un amigo sincero es un tesoro.", level: "A1" },
  { id: "fc-es-004", word: "Comida", article: "la", translation: "Nourriture / Repas", partOfSpeech: "sustantivo", phonetic: "/koˈmi.ða/", example: "La comida casera es la mejor.", level: "A1" },
  { id: "fc-es-005", word: "Viaje", article: "el", translation: "Voyage", partOfSpeech: "sustantivo", phonetic: "/ˈbja.xe/", example: "El viaje a Barcelona fue inolvidable.", level: "A1" },
  { id: "fc-es-006", word: "Trabajo", article: "el", translation: "Travail", partOfSpeech: "sustantivo", phonetic: "/tɾaˈβa.xo/", example: "Empiezo mi trabajo temprano.", level: "A1" },
  { id: "fc-es-007", word: "Ciudad", article: "la", translation: "Ville", partOfSpeech: "sustantivo", phonetic: "/θjuˈðað/", example: "Esta ciudad tiene historia y vida.", level: "A1" },
  { id: "fc-es-008", word: "Libro", article: "el", translation: "Livre", partOfSpeech: "sustantivo", phonetic: "/ˈli.βɾo/", example: "Leo un libro en español cada noche.", level: "A1" },
  { id: "fc-es-009", word: "Café", article: "el", translation: "Café", partOfSpeech: "sustantivo", phonetic: "/kaˈfe/", example: "¿Nos tomamos un café juntos?", level: "A1" },
  { id: "fc-es-010", word: "Desafío", article: "el", translation: "Défi", partOfSpeech: "sustantivo", phonetic: "/de.saˈfi.o/", example: "Afrontamos cada nuevo desafío con energía.", level: "A2" },
  { id: "fc-es-011", word: "Esperanza", article: "la", translation: "Espoir", partOfSpeech: "sustantivo", phonetic: "/es.peˈɾan.θa/", example: "La esperanza nunca se pierde.", level: "A2" },
  { id: "fc-es-012", word: "Recuerdo", article: "el", translation: "Souvenir", partOfSpeech: "sustantivo", phonetic: "/reˈkweɾ.ðo/", example: "Guardo un recuerdo precioso de España.", level: "A2" }
];

export const frenchFlashcards = [
  { id: "fc-fr-001", word: "Bonjour", translation: "Hello / Good morning", partOfSpeech: "interjection", phonetic: "/bɔ̃.ʒuʁ/", example: "Bonjour, comment allez-vous ?", level: "A1" },
  { id: "fc-fr-002", word: "Maison", article: "la", translation: "House / Home", partOfSpeech: "nom", phonetic: "/mɛ.zɔ̃/", example: "Notre maison est près du parc.", level: "A1" },
  { id: "fc-fr-003", word: "Ami", article: "l'", translation: "Friend", partOfSpeech: "nom", phonetic: "/a.mi/", example: "Mon ami arrive ce soir.", level: "A1" },
  { id: "fc-fr-004", word: "Café", article: "le", translation: "Coffee / Café", partOfSpeech: "nom", phonetic: "/ka.fe/", example: "Prenons un café en terrasse.", level: "A1" },
  { id: "fc-fr-005", word: "Voyage", article: "le", translation: "Trip / Travel", partOfSpeech: "nom", phonetic: "/vwa.jaʒ/", example: "Le voyage en train est agréable.", level: "A1" },
  { id: "fc-fr-006", word: "Travail", article: "le", translation: "Work / Job", partOfSpeech: "nom", phonetic: "/tʁa.vaj/", example: "Il aime beaucoup son nouveau travail.", level: "A1" },
  { id: "fc-fr-007", word: "Ville", article: "la", translation: "City / Town", partOfSpeech: "nom", phonetic: "/vil/", example: "Paris est une ville magnifique.", level: "A1" },
  { id: "fc-fr-008", word: "Livre", article: "le", translation: "Book", partOfSpeech: "nom", phonetic: "/livʁ/", example: "Je lis un livre passionnant.", level: "A1" },
  { id: "fc-fr-009", word: "Souvenir", article: "le", translation: "Memory", partOfSpeech: "nom", phonetic: "/suv.niʁ/", example: "Un très beau souvenir d'enfance.", level: "A2" },
  { id: "fc-fr-010", word: "Défi", article: "le", translation: "Challenge", partOfSpeech: "nom", phonetic: "/de.fi/", example: "Relever ce défi nous fait progresser.", level: "A2" },
  { id: "fc-fr-011", word: "Réussite", article: "la", translation: "Success", partOfSpeech: "nom", phonetic: "/ʁe.y.sit/", example: "La persévérance mène à la réussite.", level: "B1" }
];

export const arabicFlashcards = [
  { id: "fc-ar-001", word: "مَرْحَبًا", translation: "Bonjour / Bienvenue", partOfSpeech: "اسم / تحية", phonetic: "Marhaban", example: "مَرْحَبًا بِكُمْ فِي هَذَا التَّطْبِيقِ.", level: "A1" },
  { id: "fc-ar-002", word: "شُكْرًا", translation: "Merci", partOfSpeech: "اسم / امتنان", phonetic: "Shukran", example: "شُكْرًا جَزِيلًا عَلَى الْمُسَاعَدَةِ.", level: "A1" },
  { id: "fc-ar-003", word: "كِتَاب", article: "الـ", translation: "Livre", partOfSpeech: "اسم", phonetic: "Kitab", example: "الْكِتَابُ مَنْبَعُ الْفَائِدَةِ وَالْعِلْمِ.", level: "A1" },
  { id: "fc-ar-004", word: "بَيْت", article: "الـ", translation: "Maison", partOfSpeech: "اسم", phonetic: "Bayt", example: "الْبَيْتُ مَوْطِنُ الطُّمَأْنِينَةِ.", level: "A1" },
  { id: "fc-ar-005", word: "سَفَر", article: "الـ", translation: "Voyage", partOfSpeech: "اسم", phonetic: "Safar", example: "السَّفَرُ يَزِيدُ مِنْ مَعْلُومَاتِ الْإِنْسَانِ.", level: "A1" },
  { id: "fc-ar-006", word: "عَمَل", article: "الـ", translation: "Travail", partOfSpeech: "اسم", phonetic: "'Amal", example: "الْعَمَلُ الْمُتْقَنُ يُحَقِّقُ النَّجَاحَ.", level: "A1" },
  { id: "fc-ar-007", word: "مَدِينَة", article: "الـ", translation: "Ville", partOfSpeech: "اسم", phonetic: "Madinah", example: "الْمَدِينَةُ تَنْبِضُ بِالْحَيَاةِ.", level: "A1" },
  { id: "fc-ar-008", word: "صَدِيق", article: "الـ", translation: "Ami", partOfSpeech: "اسم", phonetic: "Sadeeq", example: "الصَّدِيقُ الْوَفِيُّ نِعْمَةٌ عَظِيمَةٌ.", level: "A1" },
  { id: "fc-ar-009", word: "قَهْوَة", article: "الـ", translation: "Café", partOfSpeech: "اسم", phonetic: "Qahwah", example: "رَائِحَةُ الْقَهْوَةِ الْعَرَبِيَّةِ طَيِّبَةٌ.", level: "A1" },
  { id: "fc-ar-010", word: "مَعْرِفَة", article: "الـ", translation: "Connaissance", partOfSpeech: "اسم", phonetic: "Ma'rifah", example: "الْمَعْرِفَةُ قُوَّةٌ لِصَاحِبِهَا.", level: "A2" }
];

export const italianFlashcards = [
  { id: "fc-it-001", word: "Ciao", translation: "Hello / Bye", partOfSpeech: "interiezione", phonetic: "/ˈtʃa.o/", example: "Ciao! Benvenuti a Roma.", level: "A1" },
  { id: "fc-it-002", word: "Casa", article: "la", translation: "Maison", partOfSpeech: "sostantivo", phonetic: "/ˈka.sa/", example: "La nostra casa è molto luminosa.", level: "A1" },
  { id: "fc-it-003", word: "Amico", article: "l'", translation: "Ami", partOfSpeech: "sostantivo", phonetic: "/aˈmi.ko/", example: "Il mio caro amico vive a Venezia.", level: "A1" },
  { id: "fc-it-004", word: "Caffè", article: "il", translation: "Café", partOfSpeech: "sostantivo", phonetic: "/kafˈfɛ/", example: "Prendiamo un buon caffè espresso?", level: "A1" },
  { id: "fc-it-005", word: "Viaggio", article: "il", translation: "Voyage", partOfSpeech: "sostantivo", phonetic: "/ˈvjad.dʒo/", example: "Il viaggio in treno è stato comodo.", level: "A1" },
  { id: "fc-it-006", word: "Lavoro", article: "il", translation: "Travail", partOfSpeech: "sostantivo", phonetic: "/laˈvo.ro/", example: "Amo il mio lavoro ogni giorno di più.", level: "A1" },
  { id: "fc-it-007", word: "Città", article: "la", translation: "Ville", partOfSpeech: "sostantivo", phonetic: "/tʃitˈta/", example: "Firenze è una città d'arte splendida.", level: "A1" },
  { id: "fc-it-008", word: "Libro", article: "il", translation: "Livre", partOfSpeech: "sostantivo", phonetic: "/ˈli.bro/", example: "Questo libro è davvero appassionante.", level: "A1" },
  { id: "fc-it-009", word: "Sfida", article: "la", translation: "Défi", partOfSpeech: "sostantivo", phonetic: "/ˈsfi.da/", example: "Accettare ogni nuova sfida ci fortifica.", level: "A2" },
  { id: "fc-it-010", word: "Successo", article: "il", translation: "Succès", partOfSpeech: "sostantivo", phonetic: "/sutˈtʃɛs.so/", example: "Il lavoro costante porta sempre al successo.", level: "A2" }
];

export const FLASHCARDS_BY_LANGUAGE = {
  de: germanCards,
  en: englishFlashcards,
  es: spanishFlashcards,
  fr: frenchFlashcards,
  ar: arabicFlashcards,
  it: italianFlashcards
};

/**
 * Returns starter flashcard deck for given target language
 */
export function getFlashcardsByLanguage(languageId = "de") {
  const norm = (languageId || "de").toLowerCase().trim();
  return FLASHCARDS_BY_LANGUAGE[norm] || FLASHCARDS_BY_LANGUAGE.de;
}
