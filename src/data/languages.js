/**
 * src/data/languages.js
 *
 * Multi-Language Learning Catalog for DeutschPath / LinguaPath.
 * Defines supported target languages, CEFR frameworks, starter decks,
 * and language-specific curricula.
 */

export const SUPPORTED_TARGET_LANGUAGES = [
  {
    id: "de",
    code: "de",
    name: "Allemand",
    englishName: "German",
    nativeName: "Deutsch",
    flag: "🇩🇪",
    color: "from-amber-500 to-red-600",
    accent: "amber",
    dir: "ltr",
    tagline: "De l'initiation A1 à la maîtrise professionnelle B2",
    description: "Apprenez l'allemand avec la répétition espacée SM-2, le genre des noms (der/die/das) et la préparation aux examens officiels Goethe et telc.",
    officialExams: ["Goethe-Zertifikat (A1-B2)", "telc Deutsch", "TestDaF", "ÖSD", "DTZ"],
    levels: ["A1", "A2", "B1", "B2"],
    defaultLevel: "A1",
    grammarKeyTopics: ["Nominativ / Akkusativ / Dativ / Genitiv", "Wechselpräpositionen", "Nebensätze (weil, dass, obwohl)", "Passiv & Konjunktiv II"],
    starterDeck: [
      { id: "de-1", target: "Tisch", article: "der", translation: "table", plural: "die Tische", example: "Das Buch liegt auf dem Tisch.", level: "A1" },
      { id: "de-2", target: "Apfel", article: "der", translation: "pomme", plural: "die Äpfel", example: "Ich esse jeden Tag einen Apfel.", level: "A1" },
      { id: "de-3", target: "Wohnung", article: "die", translation: "appartement", plural: "die Wohnungen", example: "Meine Wohnung hat drei Zimmer.", level: "A1" },
      { id: "de-4", target: "Buch", article: "das", translation: "livre", plural: "die Bücher", example: "Er liest ein interessantes Buch.", level: "A1" },
      { id: "de-5", target: "Bahnhof", article: "der", translation: "gare", plural: "die Bahnhöfe", example: "Der Zug kommt am Hauptbahnhof an.", level: "A1" }
    ],
    units: [
      { id: "de-u1", title: "Premiers Pas & Salutations", level: "A1", lessonsCount: 4, xp: 200 },
      { id: "de-u2", title: "Maison & Quotidien", level: "A1", lessonsCount: 5, xp: 250 },
      { id: "de-u3", title: "Nourriture & Restaurants", level: "A1", lessonsCount: 4, xp: 220 },
      { id: "de-u4", title: "Ville & Transports", level: "A2", lessonsCount: 5, xp: 300 }
    ]
  },
  {
    id: "fr",
    code: "fr",
    name: "Français",
    englishName: "French",
    nativeName: "Français",
    flag: "🇫🇷",
    color: "from-blue-600 to-rose-600",
    accent: "sky",
    dir: "ltr",
    tagline: "Maîtrisez la langue française du quotidien aux examens DELF/DALF",
    description: "Développez votre fluidité en français avec un entraînement ciblé sur la conjugaison, les accords, le subjonctif et l'expression orale authentique.",
    officialExams: ["DELF (A1, A2, B1, B2)", "DALF (C1)", "TCF Tout Public", "TEF Canada"],
    levels: ["A1", "A2", "B1", "B2"],
    defaultLevel: "A1",
    grammarKeyTopics: ["Passé Composé vs Imparfait", "Subjonctif Présent", "Pronoms Y et EN", "Accords du Participe Passé"],
    starterDeck: [
      { id: "fr-1", target: "Bonjour", article: "", translation: "Hello / Good morning", plural: "-", example: "Bonjour, comment allez-vous aujourd'hui ?", level: "A1" },
      { id: "fr-2", target: "Maison", article: "la", translation: "house / home", plural: "les maisons", example: "Nous habitons dans une jolie maison près du parc.", level: "A1" },
      { id: "fr-3", target: "Travail", article: "le", translation: "work / job", plural: "les travaux", example: "Il commence son nouveau travail lundi matin.", level: "A1" },
      { id: "fr-4", target: "Café", article: "le", translation: "coffee / café", plural: "les cafés", example: "Prenons un café ensemble sur la terrasse.", level: "A1" },
      { id: "fr-5", target: "Voyage", article: "le", translation: "trip / travel", plural: "les voyages", example: "Le voyage en train dure deux heures.", level: "A1" },
      { id: "fr-6", target: "Voiture", article: "la", translation: "car", plural: "les voitures", example: "Elle conduit sa voiture jusqu'au centre-ville.", level: "A1" },
      { id: "fr-7", target: "Ami", article: "l'", translation: "friend", plural: "les amis", example: "Mon ami d'enfance arrive ce soir.", level: "A1" },
      { id: "fr-8", target: "Ville", article: "la", translation: "city / town", plural: "les villes", example: "Paris est une ville magnifique et vivante.", level: "A1" }
    ],
    units: [
      { id: "fr-u1", title: "Salutations & Premières Conversations", level: "A1", lessonsCount: 4, xp: 200 },
      { id: "fr-u2", title: "La Vie Quotidienne & La Famille", level: "A1", lessonsCount: 4, xp: 220 },
      { id: "fr-u3", title: "Au Café & Commander à Manger", level: "A1", lessonsCount: 5, xp: 260 },
      { id: "fr-u4", title: "Se Déplacer & Voyager en Ville", level: "A2", lessonsCount: 4, xp: 280 }
    ]
  },
  {
    id: "es",
    code: "es",
    name: "Espagnol",
    englishName: "Spanish",
    nativeName: "Español",
    flag: "🇪🇸",
    color: "from-amber-500 to-rose-600",
    accent: "orange",
    dir: "ltr",
    tagline: "Parlez espagnol couramment avec confiance et aisance",
    description: "Apprenez l'espagnol d'Espagne et d'Amérique Latine : maîtrise des verbes Ser vs Estar, du subjonctif, et préparation aux diplômes DELE / SIELE.",
    officialExams: ["DELE (A1-B2)", "SIELE Global", "CCSE"],
    levels: ["A1", "A2", "B1", "B2"],
    defaultLevel: "A1",
    grammarKeyTopics: ["Ser vs Estar", "Por vs Para", "Pretérito Indefinido vs Imperfecto", "Subjuntivo Presente"],
    starterDeck: [
      { id: "es-1", target: "Hola", article: "", translation: "Hello", plural: "-", example: "¡Hola! ¿Cómo estás hoy?", level: "A1" },
      { id: "es-2", target: "Casa", article: "la", translation: "house / home", plural: "las casas", example: "Mi casa tiene un jardín grande y luminoso.", level: "A1" },
      { id: "es-3", target: "Amigo", article: "el", translation: "friend", plural: "los amigos", example: "Voy al cine con mi mejor amigo.", level: "A1" },
      { id: "es-4", target: "Comida", article: "la", translation: "food / meal", plural: "las comidas", example: "La comida mediterránea es deliciosa y sana.", level: "A1" },
      { id: "es-5", target: "Viaje", article: "el", translation: "trip / journey", plural: "los viajes", example: "El viaje a Madrid fue una experiencia increíble.", level: "A1" },
      { id: "es-6", target: "Trabajo", article: "el", translation: "work / job", plural: "los trabajos", example: "Empiezo mi trabajo temprano cada día.", level: "A1" },
      { id: "es-7", target: "Ciudad", article: "la", translation: "city", plural: "las ciudades", example: "Barcelona es una ciudad llena de arte.", level: "A1" },
      { id: "es-8", target: "Libro", article: "el", translation: "book", plural: "los libros", example: "Leo un libro fascinante en español.", level: "A1" }
    ],
    units: [
      { id: "es-u1", title: "Saludos, Presentaciones & Números", level: "A1", lessonsCount: 4, xp: 200 },
      { id: "es-u2", title: "La Familia, La Casa & Rutina", level: "A1", lessonsCount: 4, xp: 240 },
      { id: "es-u3", title: "En el Restaurante & De Compras", level: "A1", lessonsCount: 5, xp: 260 },
      { id: "es-u4", title: "Viajes, Direcciones & Vacaciones", level: "A2", lessonsCount: 4, xp: 290 }
    ]
  },
  {
    id: "en",
    code: "en",
    name: "Anglais",
    englishName: "English",
    nativeName: "English",
    flag: "🇬🇧",
    color: "from-indigo-600 to-rose-600",
    accent: "indigo",
    dir: "ltr",
    tagline: "Perfectionnez votre anglais professionnel, académique et quotidien",
    description: "Acquérez les réflexes natifs : phrasal verbs, fluidité orale, grammaire sans faute et préparation d'élite aux tests IELTS, TOEFL et Cambridge.",
    officialExams: ["IELTS Academic & General", "TOEFL iBT", "Cambridge C1 Advanced", "TOEIC"],
    levels: ["A1", "A2", "B1", "B2"],
    defaultLevel: "A1",
    grammarKeyTopics: ["Present Perfect vs Past Simple", "Conditionals (0, 1, 2, 3 & Mixed)", "Phrasal Verbs Mastery", "Passive Voice & Inversion"],
    starterDeck: [
      { id: "en-1", target: "Welcome", article: "", translation: "Bienvenue", plural: "-", example: "Welcome to our international community!", level: "A1" },
      { id: "en-2", target: "Journey", article: "the", translation: "voyage / périple", plural: "journeys", example: "The journey of a thousand miles begins with a single step.", level: "A1" },
      { id: "en-3", target: "Meeting", article: "the", translation: "réunion / rendez-vous", plural: "meetings", example: "We have an important team meeting at ten.", level: "A1" },
      { id: "en-4", target: "Opportunity", article: "an", translation: "opportunité", plural: "opportunities", example: "Learning languages opens up great career opportunities.", level: "A1" },
      { id: "en-5", target: "Achievement", article: "the", translation: "accomplissement", plural: "achievements", example: "Passing your exam is a proud achievement.", level: "A1" },
      { id: "en-6", target: "Challenge", article: "a", translation: "défi", plural: "challenges", example: "Every challenge helps you grow and improve.", level: "A1" },
      { id: "en-7", target: "Knowledge", article: "", translation: "connaissance", plural: "-", example: "Consistent daily practice builds deep knowledge.", level: "A1" },
      { id: "en-8", target: "Community", article: "the", translation: "communauté", plural: "communities", example: "Join our active language learning community.", level: "A1" }
    ],
    units: [
      { id: "en-u1", title: "Essential Greetings & Daily Interactions", level: "A1", lessonsCount: 4, xp: 200 },
      { id: "en-u2", title: "Describing People, Places & Routines", level: "A1", lessonsCount: 4, xp: 240 },
      { id: "en-u3", title: "Travel, Dining Out & Navigating Transport", level: "A1", lessonsCount: 5, xp: 260 },
      { id: "en-u4", title: "Work, Networking & Digital Communication", level: "A2", lessonsCount: 5, xp: 300 }
    ]
  },
  {
    id: "ar",
    code: "ar",
    name: "Arabe",
    englishName: "Arabic",
    nativeName: "العربية",
    flag: "🇸🇦",
    color: "from-emerald-600 to-teal-700",
    accent: "emerald",
    dir: "rtl",
    tagline: "Découvrez la richesse de la langue arabe standard moderne (Fusha)",
    description: "Apprenez l'arabe pas à pas : écriture, racines trilittères, grammaire fondamentale (Nahw et Sarf) et compréhension de textes authentiques.",
    officialExams: ["CIMA (Certificat International de Maîtrise en Arabe)", "ALPT (Arabic Language Proficiency Test)"],
    levels: ["A1", "A2", "B1", "B2"],
    defaultLevel: "A1",
    grammarKeyTopics: ["الجملة الاسمية والجملة الفعلية", "الإعراب: الضمة والفتحة والكسرة", "الأفعال الثلاثية والمجرد والمزيد", "المضاف والمضاف إليه"],
    starterDeck: [
      { id: "ar-1", target: "مَرْحَبًا", article: "", translation: "Bonjour / Bienvenue", plural: "-", example: "مَرْحَبًا بِكُمْ فِي مَسَارِ تَعَلُّمِ اللُّغَةِ الْعَرَبِيَّةِ.", level: "A1" },
      { id: "ar-2", target: "شُكْرًا", article: "", translation: "Merci", plural: "-", example: "شُكْرًا جَزِيلًا عَلَى مُسَاعَدَتِكَ الْكَرِيمَةِ.", level: "A1" },
      { id: "ar-3", target: "كِتَاب", article: "الـ", translation: "livre", plural: "كُتُب", example: "الْكِتَابُ مَصْدَرٌ قَيِّمٌ لِلْمَعْرِفَةِ وَالْعِلْمِ.", level: "A1" },
      { id: "ar-4", target: "بَيْت", article: "الـ", translation: "maison", plural: "بُيُوت", example: "الْبَيْتُ مَكَانُ الرَّاحَةِ وَالْأَمَانِ.", level: "A1" },
      { id: "ar-5", target: "سَفَر", article: "الـ", translation: "voyage", plural: "أَسْفَار", example: "السَّفَرُ يُوَسِّعُ الْمَدَارِكَ وَيَفْتَحُ آفَاقًا جَدِيدَةً.", level: "A1" },
      { id: "ar-6", target: "عَمَل", article: "الـ", translation: "travail", plural: "أَعْمَال", example: "الْعَمَلُ الصَّالِحُ يُثْمِرُ النَّجَاحَ دَائِمًا.", level: "A1" },
      { id: "ar-7", target: "مَدِينَة", article: "الـ", translation: "ville", plural: "مُدُن", example: "هَذِهِ الْمَدِينَةُ تَارِيخِيَّةٌ وَجَمِيلَةٌ جِدًّا.", level: "A1" },
      { id: "ar-8", target: "صَدِيق", article: "الـ", translation: "ami", plural: "أَصْدِقَاء", example: "الصَّدِيقُ الْمُخْلِصُ كَنْزٌ حَقِيقِيٌّ لَا يُقَدَّرُ بِثَمَنٍ.", level: "A1" }
    ],
    units: [
      { id: "ar-u1", title: "التحيات، التعارف والحروف الأساسية", level: "A1", lessonsCount: 4, xp: 200 },
      { id: "ar-u2", title: "الأسرة والبيت والحياة اليومية", level: "A1", lessonsCount: 4, xp: 230 },
      { id: "ar-u3", title: "في السوق والمطعم والمشتريات", level: "A1", lessonsCount: 5, xp: 260 },
      { id: "ar-u4", title: "السفر، الاتجاهات والأماكن السياحية", level: "A2", lessonsCount: 4, xp: 290 }
    ]
  },
  {
    id: "it",
    code: "it",
    name: "Italien",
    englishName: "Italian",
    nativeName: "Italiano",
    flag: "🇮🇹",
    color: "from-emerald-600 to-red-600",
    accent: "rose",
    dir: "ltr",
    tagline: "Vivez la dolce vita en apprenant la langue italienne",
    description: "Plongez dans l'italien : vocabulaire expressif, grammaire vivante (passato prossimo, congiuntivo) et préparation aux certifications CELI / CILS.",
    officialExams: ["CELI (A1-B2)", "CILS", "PLIDA"],
    levels: ["A1", "A2", "B1", "B2"],
    defaultLevel: "A1",
    grammarKeyTopics: ["Passato Prossimo vs Imperfetto", "Pronomi Diretti e Indiretti", "Preposizioni Articolate", "Congiuntivo Presente"],
    starterDeck: [
      { id: "it-1", target: "Ciao", article: "", translation: "Hello / Bye", plural: "-", example: "Ciao! Piacere di conoscerti.", level: "A1" },
      { id: "it-2", target: "Casa", article: "la", translation: "maison", plural: "le case", example: "La mia casa è accogliente e piena di luce.", level: "A1" },
      { id: "it-3", target: "Amico", article: "l'", translation: "ami", plural: "gli amici", example: "Un vero amico è un tesoro prezioso.", level: "A1" },
      { id: "it-4", target: "Caffè", article: "il", translation: "café", plural: "i caffè", example: "Prendiamo un caffè insieme al bar?", level: "A1" },
      { id: "it-5", target: "Viaggio", article: "il", translation: "voyage", plural: "i viaggi", example: "Il viaggio in Toscana è stato meraviglioso.", level: "A1" },
      { id: "it-6", target: "Lavoro", article: "il", translation: "travail", plural: "i lavori", example: "Amo il mio lavoro e i miei colleghi.", level: "A1" },
      { id: "it-7", target: "Città", article: "la", translation: "ville", plural: "le città", example: "Roma è una città eterna ricca di storia.", level: "A1" },
      { id: "it-8", target: "Libro", article: "il", translation: "livre", plural: "i libri", example: "Questo libro è appassionante ed educativo.", level: "A1" }
    ],
    units: [
      { id: "it-u1", title: "Saluti, Presentazioni & Primi Passi", level: "A1", lessonsCount: 4, xp: 200 },
      { id: "it-u2", title: "La Famiglia, La Casa & La Giornata", level: "A1", lessonsCount: 4, xp: 240 },
      { id: "it-u3", title: "Al Ristorante, Cucina & Caffè", level: "A1", lessonsCount: 5, xp: 260 },
      { id: "it-u4", title: "In Città, Viaggi & Vacanze", level: "A2", lessonsCount: 4, xp: 290 }
    ]
  }
];

export function getLanguageById(id) {
  if (!id) return SUPPORTED_TARGET_LANGUAGES[0];
  return SUPPORTED_TARGET_LANGUAGES.find((l) => l.id.toLowerCase() === id.toLowerCase()) || SUPPORTED_TARGET_LANGUAGES[0];
}

export function getAllLanguages() {
  return SUPPORTED_TARGET_LANGUAGES;
}
