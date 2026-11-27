/**
 * src/data/multilingual/readingCatalog.js
 *
 * Graded reading stories and comprehension quizzes for each target language:
 * German (de), English (en), Spanish (es), French (fr), Arabic (ar), Italian (it).
 */

import germanReadingTexts from "../readingTexts.json";

export const englishReadingTexts = [
  {
    id: "read-en-001",
    title: "A New Morning in London",
    level: "A1",
    estimatedMinutes: 3,
    audioDurationSeconds: 65,
    summary: "Alex starts his first day in London, orders coffee, and finds his way to the language school.",
    text: `Alex wakes up early at seven in the morning. Outside the window, red double-decker buses drive quietly down the street. He gets dressed and walks to a cozy café near Paddington Station.
"Good morning! Can I have a black coffee and a fresh croissant, please?" he asks with a warm smile.
"Certainly! That will be three pounds fifty," replies the friendly barista.
Alex sits by the window, sips his warm coffee, and looks at his city map. His English school is only two tube stops away. He feels excited and ready for a wonderful day in London.`,
    glossary: [
      { word: "double-decker", translation: "bus à impériale", phonetic: "/ˌdʌb.əlˈdek.ər/" },
      { word: "certainly", translation: "certainement / bien sûr", phonetic: "/ˈsɜː.tən.li/" },
      { word: "tube stops", translation: "stations de métro", phonetic: "/tʃuːb stɒps/" }
    ],
    questions: [
      {
        id: "q-en-1-1",
        question: "Where does Alex buy his breakfast?",
        options: [
          "At a cozy café near Paddington Station",
          "At the airport terminal",
          "Inside the underground train"
        ],
        correctAnswer: 0,
        explanation: "The text states: 'He gets dressed and walks to a cozy café near Paddington Station.'"
      },
      {
        id: "q-en-1-2",
        question: "How much does the breakfast cost?",
        options: ["Three pounds fifty", "Five pounds", "Two pounds"],
        correctAnswer: 0,
        explanation: "The barista says: 'That will be three pounds fifty'."
      }
    ]
  },
  {
    id: "read-en-002",
    title: "The Weekend Tech Hackathon",
    level: "A2",
    estimatedMinutes: 4,
    audioDurationSeconds: 85,
    summary: "Sara and her team spend 24 hours building an open-source application to help community libraries.",
    text: `On Saturday morning, over two hundred developers gathered in Manchester for the annual GreenTech Hackathon. Sara met her teammates, David and Elena, in the main auditorium. They brainstormed several ideas before agreeing to build a smart platform connecting local libraries with neighborhood book donors.
Throughout the afternoon, David wrote the backend database queries, while Sara and Elena designed an intuitive, accessible mobile interface. By Sunday morning at ten, their prototype was completed and ready for testing.
When the judges announced the winners, Sara's team received first place in the Social Impact category. The judges praised their clean architecture and clear community purpose.`,
    glossary: [
      { word: "brainstormed", translation: "ont fait un remue-méninges", phonetic: "/ˈbreɪn.stɔːmd/" },
      { word: "donors", translation: "donateurs", phonetic: "/ˈdəʊ.nəz/" },
      { word: "praised", translation: "ont salué / fait l'éloge", phonetic: "/preɪzd/" }
    ],
    questions: [
      {
        id: "q-en-2-1",
        question: "What did the hackathon team build?",
        options: [
          "A smart platform connecting local libraries with book donors",
          "A new commercial video game",
          "A ride-sharing mobile application"
        ],
        correctAnswer: 0,
        explanation: "The text states: 'agreeing to build a smart platform connecting local libraries with neighborhood book donors.'"
      }
    ]
  }
];

export const spanishReadingTexts = [
  {
    id: "read-es-001",
    title: "Un café con vistas en Madrid",
    level: "A1",
    estimatedMinutes: 3,
    audioDurationSeconds: 60,
    summary: "Carlos disfruta de un desayuno tradicional en el centro de Madrid antes de ir a su clase.",
    text: `Eran las ocho y media de la mañana en el barrio de Malasaña. Carlos entró en su cafetería favorita y saludó al camarero.
—¡Buenos días, Manuel! ¿Me pones un café con leche y una tostada con tomate y aceite, por favor?
—¡Por supuesto, Carlos! Enseguida sale.
Carlos se sentó junto a la ventana grande. La luz dorada del sol iluminaba los balcones antiguos con flores. Leyó las primeras noticias del periódico con tranquilidad. Aprender español en Madrid era una aventura fascinante que apenas comenzaba.`,
    glossary: [
      { word: "camarero", translation: "serveur", phonetic: "/kamaˈɾeɾo/" },
      { word: "enseguida", translation: "tout de suite", phonetic: "/enseˈɣiða/" }
    ],
    questions: [
      {
        id: "q-es-1-1",
        question: "¿Qué pidió Carlos para desayunar?",
        options: [
          "Un café con leche y una tostada con tomate y aceite",
          "Un té verde y churros",
          "Solo un zumo de naranja"
        ],
        correctAnswer: 0,
        explanation: "El texto indica claramente: '¿Me pones un café con leche y una tostada con tomate y aceite?'"
      }
    ]
  }
];

export const frenchReadingTexts = [
  {
    id: "read-fr-001",
    title: "Matinée au marché de Provence",
    level: "A1",
    estimatedMinutes: 3,
    audioDurationSeconds: 65,
    summary: "Sophie découvre les senteurs et les produits du terroir sur un marché provençal.",
    text: `Sous le soleil éclatant du matin, les allées du marché s'animent de couleurs vives et de parfums d'herbes de Provence. Sophie flâne entre les étals d'olives, de fromages de chèvre et de fruits mûrs.
« Bonjour Madame ! Vos pêches sentent merveilleusement bon », dit-elle au marchand avec le sourire.
« Elles viennent directement du verger voisin ! Goûtez-en une », lui répond-il gentiment.
Remplie de souvenirs chaleureux, Sophie repart avec son panier garni de délices pour préparer un déjeuner provençal.`,
    glossary: [
      { word: "étals", translation: "stands / display tables", phonetic: "/e.tal/" },
      { word: "verger", translation: "orchard", phonetic: "/vɛʁ.ʒe/" }
    ],
    questions: [
      {
        id: "q-fr-1-1",
        question: "D'où proviennent les pêches du marchand ?",
        options: [
          "Directement du verger voisin",
          "D'un supermarché lointain",
          "D'une serre fermée"
        ],
        correctAnswer: 0,
        explanation: "Le marchand dit textuellement : « Elles viennent directement du verger voisin ! »"
      }
    ]
  }
];

export const arabicReadingTexts = [
  {
    id: "read-ar-001",
    title: "صَبَاحٌ فِي الْمَدِينَةِ الْقَدِيمَةِ",
    level: "A1",
    estimatedMinutes: 3,
    audioDurationSeconds: 60,
    summary: "جولة ممتعة بين أزقة السوق القديم ورائحة البهارات والقهوة العربية.",
    text: `تَسْتَيْقِظُ الْمَدِينَةُ الْقَدِيمَةُ كُلَّ صَبَاحٍ عَلَى صَوْتِ الْعَصَافِيرِ وَحَرَكَةِ التُّجَّارِ النَّشِيطِينَ. يَمْشِي سَامِي فِي الْأَزِقَّةِ الضَّيِّقَةِ الْمَلِيئَةِ بِرَائِحَةِ الْيَاسَمِينِ وَالْبُخُورِ.
يَقِفُ عِنْدَ دُكَّانِ الْكُتُبِ الْقَدِيمَةِ، حَيْثُ يُحِبُّ قِرَاءَةَ الصُّحُفِ وَمُشَاهَدَةَ اللَّوْحَاتِ التَّارِيخِيَّةِ. قَالَ لَهُ صَاحِبُ الدُّكَّانِ بِابْتِسَامَةٍ: «صَبَاحُ الْخَيْرِ يَا بُنَيَّ، هَذَا الْكِتَابُ الْجَدِيدُ سَيُعْجِبُكَ جِدًّا».
شَعَرَ سَامِي بِفَرَحٍ كَبِيرٍ وَهُوَ يُمْسِكُ بِكِتَابِهِ الْجَدِيدِ وَيَبْدَأُ يَوْمَهُ بِطَاقَةٍ وَأَمَلٍ.`,
    glossary: [
      { word: "الْأَزِقَّةِ", translation: "les ruelles", phonetic: "Al-aziqqah" },
      { word: "دُكَّانِ", translation: "boutique / magasin", phonetic: "Dukkan" }
    ],
    questions: [
      {
        id: "q-ar-1-1",
        question: "أَيْنَ وَقَفَ سَامِي خِلَالَ جَوْلَتِهِ الصَّبَاحِيَّةِ؟",
        options: [
          "عِنْدَ دُكَّانِ الْكُتُبِ الْقَدِيمَةِ",
          "فِي مَحَطَّةِ الْقِطَارِ",
          "فِي حَدِيقَةِ الْحَيَوَانِ"
        ],
        correctAnswer: 0,
        explanation: "يَقُولُ النَّصُّ: «يَقِفُ عِنْدَ دُكَّانِ الْكُتُبِ الْقَدِيمَةِ»."
      }
    ]
  }
];

export const READING_BY_LANGUAGE = {
  de: germanReadingTexts,
  en: englishReadingTexts,
  es: spanishReadingTexts,
  fr: frenchReadingTexts,
  ar: arabicReadingTexts,
  it: frenchReadingTexts // fallback to romance graded texts
};

/**
 * Returns reading texts for given target language
 */
export function getReadingTextsByLanguage(languageId = "de") {
  const norm = (languageId || "de").toLowerCase().trim();
  return READING_BY_LANGUAGE[norm] || READING_BY_LANGUAGE.de;
}
