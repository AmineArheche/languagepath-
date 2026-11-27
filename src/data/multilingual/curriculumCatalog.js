/**
 * src/data/multilingual/curriculumCatalog.js
 *
 * Multilingual Curriculum Engine providing structured CEFR levels (A1, A2, B1, B2),
 * units, lessons, and vocabulary for all supported target languages:
 * German (de), English (en), Spanish (es), French (fr), Arabic (ar), Italian (it).
 */

import germanCurriculumData from "../curriculum.json";

// English Curriculum
export const englishCurriculum = {
  languageId: "en",
  languageName: "English",
  flag: "🇬🇧",
  levels: [
    {
      id: "A1",
      title: "A1 • Breakthrough & Beginner",
      tagline: "Master foundational everyday communication: introductions, daily routines, food, and basic travel.",
      units: [
        {
          id: "en-u1",
          number: 1,
          title: "Greetings, Introductions & First Contact",
          description: "Say hello, introduce yourself, ask where someone is from, and count up to 100.",
          xp: 200,
          lessons: [
            {
              id: "en-u1-l1",
              title: "Hello & Personal Info",
              description: "Learn to introduce your name, age, and nationality.",
              xp: 50,
              words: [
                { id: "en-w1", word: "Welcome", translation: "Bienvenue", phonetic: "/ˈwel.kəm/", partOfSpeech: "exclamation", example: "Welcome to our learning journey!", englishSentence: "Welcome to our learning journey!" },
                { id: "en-w2", word: "Hello", translation: "Bonjour / Salut", phonetic: "/həˈləʊ/", partOfSpeech: "interjection", example: "Hello, my name is Alex.", englishSentence: "Hello, my name is Alex." },
                { id: "en-w3", word: "Friend", translation: "Ami(e)", phonetic: "/frend/", partOfSpeech: "noun", example: "She is my best friend from university.", englishSentence: "She is my best friend from university." },
                { id: "en-w4", word: "Country", translation: "Pays", phonetic: "/ˈkʌn.tri/", partOfSpeech: "noun", example: "Which country do you come from?", englishSentence: "Which country do you come from?" }
              ]
            },
            {
              id: "en-u1-l2",
              title: "Numbers & Dates",
              description: "Master counting, days of the week, and phone numbers.",
              xp: 50,
              words: [
                { id: "en-w5", word: "Today", translation: "Aujourd'hui", phonetic: "/təˈdeɪ/", partOfSpeech: "noun/adverb", example: "Today is a great day to learn.", englishSentence: "Today is a great day to learn." },
                { id: "en-w6", word: "Tomorrow", translation: "Demain", phonetic: "/təˈmɒr.əʊ/", partOfSpeech: "noun/adverb", example: "We will meet again tomorrow morning.", englishSentence: "We will meet again tomorrow morning." },
                { id: "en-w7", word: "Number", translation: "Numéro / Nombre", phonetic: "/ˈnʌm.bər/", partOfSpeech: "noun", example: "What is your phone number?", englishSentence: "What is your phone number?" }
              ]
            },
            {
              id: "en-u1-l3",
              title: "Family & People",
              description: "Talk about your relatives, colleagues, and friends.",
              xp: 50,
              words: [
                { id: "en-w8", word: "Family", translation: "Famille", phonetic: "/ˈfæm.əl.i/", partOfSpeech: "noun", example: "My family lives in London.", englishSentence: "My family lives in London." },
                { id: "en-w9", word: "Parent", translation: "Parent", phonetic: "/ˈpeə.rənt/", partOfSpeech: "noun", example: "Both of my parents are teachers.", englishSentence: "Both of my parents are teachers." },
                { id: "en-w10", word: "Child", translation: "Enfant", phonetic: "/tʃaɪld/", partOfSpeech: "noun", example: "The child is playing in the garden.", englishSentence: "The child is playing in the garden." }
              ]
            },
            {
              id: "en-u1-l4",
              title: "Review & Conversation",
              description: "Put all basic introductions together in full dialogs.",
              xp: 50,
              words: [
                { id: "en-w11", word: "Meeting", translation: "Rencontre / Réunion", phonetic: "/ˈmiː.tɪŋ/", partOfSpeech: "noun", example: "Nice meeting you today!", englishSentence: "Nice meeting you today!" },
                { id: "en-w12", word: "Conversation", translation: "Conversation", phonetic: "/ˌkɒn.vəˈseɪ.ʃən/", partOfSpeech: "noun", example: "We had a lively conversation.", englishSentence: "We had a lively conversation." }
              ]
            }
          ]
        },
        {
          id: "en-u2",
          number: 2,
          title: "Everyday Life & Routines",
          description: "Describe daily schedules, times of day, habits, and hobbies.",
          xp: 220,
          lessons: [
            {
              id: "en-u2-l1",
              title: "Morning Routine",
              description: "Waking up, having breakfast, and commuting to work.",
              xp: 55,
              words: [
                { id: "en-w13", word: "Morning", translation: "Matin", phonetic: "/ˈmɔː.nɪŋ/", partOfSpeech: "noun", example: "I drink black coffee every morning.", englishSentence: "I drink black coffee every morning." },
                { id: "en-w14", word: "Breakfast", translation: "Petit-déjeuner", phonetic: "/ˈbrek.fəst/", partOfSpeech: "noun", example: "Breakfast is ready on the table.", englishSentence: "Breakfast is ready on the table." },
                { id: "en-w15", word: "Routine", translation: "Routine", phonetic: "/ruːˈtiːn/", partOfSpeech: "noun", example: "A solid routine helps you succeed.", englishSentence: "A solid routine helps you succeed." }
              ]
            },
            {
              id: "en-u2-l2",
              title: "Work & Hobbies",
              description: "Discuss what you do for a living and what you enjoy in your free time.",
              xp: 55,
              words: [
                { id: "en-w16", word: "Work", translation: "Travail / Travailler", phonetic: "/wɜːk/", partOfSpeech: "verb/noun", example: "I work for an innovative company.", englishSentence: "I work for an innovative company." },
                { id: "en-w17", word: "Hobby", translation: "Passe-temps", phonetic: "/ˈhɒb.i/", partOfSpeech: "noun", example: "Photography is my favorite hobby.", englishSentence: "Photography is my favorite hobby." },
                { id: "en-w18", word: "Weekend", translation: "Week-end", phonetic: "/ˌwiːkˈend/", partOfSpeech: "noun", example: "What are your plans for the weekend?", englishSentence: "What are your plans for the weekend?" }
              ]
            }
          ]
        },
        {
          id: "en-u3",
          number: 3,
          title: "Food, Drinks & Restaurants",
          description: "Order dishes, navigate menus, supermarket shopping, and express dietary tastes.",
          xp: 240,
          lessons: [
            {
              id: "en-u3-l1",
              title: "At the Café",
              description: "Ordering coffee, tea, pastries, and asking for the bill.",
              xp: 60,
              words: [
                { id: "en-w19", word: "Coffee", translation: "Café", phonetic: "/ˈkɒf.i/", partOfSpeech: "noun", example: "Can I have an espresso please?", englishSentence: "Can I have an espresso please?" },
                { id: "en-w20", word: "Restaurant", translation: "Restaurant", phonetic: "/ˈres.trɒnt/", partOfSpeech: "noun", example: "This restaurant serves delicious pasta.", englishSentence: "This restaurant serves delicious pasta." },
                { id: "en-w21", word: "Bill", translation: "L'addition", phonetic: "/bɪl/", partOfSpeech: "noun", example: "Could we have the bill, please?", englishSentence: "Could we have the bill, please?" }
              ]
            }
          ]
        },
        {
          id: "en-u4",
          number: 4,
          title: "City, Directions & Travel",
          description: "Ask for directions, take trains, check into hotels, and explore a new city.",
          xp: 250,
          lessons: [
            {
              id: "en-u4-l1",
              title: "Navigating the City",
              description: "Ask where landmarks are, follow turn-by-turn directions.",
              xp: 65,
              words: [
                { id: "en-w22", word: "Station", translation: "Gare / Station", phonetic: "/ˈsteɪ.ʃən/", partOfSpeech: "noun", example: "The central station is five minutes away.", englishSentence: "The central station is five minutes away." },
                { id: "en-w23", word: "Street", translation: "Rue", phonetic: "/striːt/", partOfSpeech: "noun", example: "Walk down this street and turn left.", englishSentence: "Walk down this street and turn left." },
                { id: "en-w24", word: "Airport", translation: "Aéroport", phonetic: "/ˈeə.pɔːt/", partOfSpeech: "noun", example: "We arrived at the airport early.", englishSentence: "We arrived at the airport early." }
              ]
            }
          ]
        }
      ]
    },
    {
      id: "A2",
      title: "A2 • Elementary English",
      tagline: "Communicate in past and future tenses, share experiences, handle shopping, and describe health.",
      units: [
        {
          id: "en-u5",
          number: 5,
          title: "Past Experiences & Travel Memories",
          description: "Talk about your last vacation, recount past events, and describe places you visited.",
          xp: 280,
          lessons: [
            {
              id: "en-u5-l1",
              title: "Holiday Stories",
              description: "Use past simple to describe where you went and what you did.",
              xp: 70,
              words: [
                { id: "en-w25", word: "Journey", translation: "Voyage / Trajet", phonetic: "/ˈdʒɜː.ni/", partOfSpeech: "noun", example: "The train journey took three hours.", englishSentence: "The train journey took three hours." },
                { id: "en-w26", word: "Vacation", translation: "Vacances", phonetic: "/veɪˈkeɪ.ʃən/", partOfSpeech: "noun", example: "We spent our summer vacation in Spain.", englishSentence: "We spent our summer vacation in Spain." }
              ]
            }
          ]
        },
        {
          id: "en-u6",
          number: 6,
          title: "Workplace & Career Communication",
          description: "Write professional emails, schedule meetings, and discuss job responsibilities.",
          xp: 300,
          lessons: [
            {
              id: "en-u6-l1",
              title: "Office Correspondence",
              description: "Format emails, invite colleagues, and reply to inquiries.",
              xp: 75,
              words: [
                { id: "en-w27", word: "Opportunity", translation: "Opportunité", phonetic: "/ˌɒp.əˈtʃuː.nə.ti/", partOfSpeech: "noun", example: "This role is an exciting opportunity.", englishSentence: "This role is an exciting opportunity." },
                { id: "en-w28", word: "Achievement", translation: "Réalisation / Succès", phonetic: "/əˈtʃiːv.mənt/", partOfSpeech: "noun", example: "Finishing the project on time was a big achievement.", englishSentence: "Finishing the project on time was a big achievement." }
              ]
            }
          ]
        }
      ]
    },
    {
      id: "B1",
      title: "B1 • Intermediate Fluency",
      tagline: "Express opinions, debate ideas, use phrasal verbs, and handle unpredictable travel and work situations.",
      units: [
        {
          id: "en-u7",
          number: 7,
          title: "Opinions, Debates & Modern Life",
          description: "Agree and disagree politely, express nuanced perspectives on technology and society.",
          xp: 340,
          lessons: [
            {
              id: "en-u7-l1",
              title: "Debating Ideas",
              description: "Use persuasive connectors and contrast opinions.",
              xp: 85,
              words: [
                { id: "en-w29", word: "Challenge", translation: "Défi", phonetic: "/ˈtʃæl.ɪndʒ/", partOfSpeech: "noun", example: "Embracing a challenge leads to growth.", englishSentence: "Embracing a challenge leads to growth." },
                { id: "en-w30", word: "Breakthrough", translation: "Percée / Découverte majeure", phonetic: "/ˈbreɪk.θruː/", partOfSpeech: "noun", example: "Scientists made a medical breakthrough.", englishSentence: "Scientists made a medical breakthrough." }
              ]
            }
          ]
        }
      ]
    },
    {
      id: "B2",
      title: "B2 • Upper Intermediate & Professional",
      tagline: "Achieve professional and academic proficiency: negotiations, complex texts, idioms, and exam mastery.",
      units: [
        {
          id: "en-u8",
          number: 8,
          title: "Professional Negotiation & Academic Mastery",
          description: "Deliver presentations, negotiate agreements, and master nuanced register and idioms.",
          xp: 400,
          lessons: [
            {
              id: "en-u8-l1",
              title: "Advanced Presentations",
              description: "Structure keynote speeches and engage an international audience.",
              xp: 100,
              words: [
                { id: "en-w31", word: "Perspective", translation: "Perspective / Point de vue", phonetic: "/pəˈspek.tɪv/", partOfSpeech: "noun", example: "It is important to consider multiple perspectives.", englishSentence: "It is important to consider multiple perspectives." },
                { id: "en-w32", word: "Collaboration", translation: "Collaboration", phonetic: "/kəˌlæb.əˈreɪ.ʃən/", partOfSpeech: "noun", example: "International collaboration solves complex challenges.", englishSentence: "International collaboration solves complex challenges." }
              ]
            }
          ]
        }
      ]
    }
  ]
};

// Spanish Curriculum
export const spanishCurriculum = {
  languageId: "es",
  languageName: "Español",
  flag: "🇪🇸",
  levels: [
    {
      id: "A1",
      title: "A1 • Inicial y Básico",
      tagline: "Domina los conceptos básicos: saludos, presentaciones, la familia, la comida y la ciudad.",
      units: [
        {
          id: "es-u1",
          number: 1,
          title: "Saludos, Presentaciones y Primeros Pasos",
          description: "Aprende a saludar, decir tu nombre, tu profesión y de dónde eres.",
          xp: 200,
          lessons: [
            {
              id: "es-u1-l1",
              title: "¡Hola! ¿Cómo te llamas?",
              description: "Presentaciones formales e informales en español.",
              xp: 50,
              words: [
                { id: "es-w1", word: "Hola", translation: "Bonjour / Salut", phonetic: "/ˈo.la/", partOfSpeech: "interjección", example: "¡Hola! ¿Cómo estás hoy?", englishSentence: "Hello! How are you today?" },
                { id: "es-w2", word: "Amigo", article: "el", translation: "Ami", phonetic: "/aˈmi.ɣo/", partOfSpeech: "sustantivo", example: "Mi amigo vive en Madrid.", englishSentence: "My friend lives in Madrid." },
                { id: "es-w3", word: "Casa", article: "la", translation: "Maison", phonetic: "/ˈka.sa/", partOfSpeech: "sustantivo", example: "Nuestra casa es muy bonita y tranquila.", englishSentence: "Our house is very pretty and quiet." }
              ]
            },
            {
              id: "es-u1-l2",
              title: "Los Números y el Tiempo",
              description: "Aprende a contar, pedir la hora y los días de la semana.",
              xp: 50,
              words: [
                { id: "es-w4", word: "Hoy", translation: "Aujourd'hui", phonetic: "/oj/", partOfSpeech: "adverbio", example: "Hoy hace un día soleado estupendo.", englishSentence: "Today is a great sunny day." },
                { id: "es-w5", word: "Mañana", translation: "Demain / Matin", phonetic: "/maˈɲa.na/", partOfSpeech: "adverbio/sustantivo", example: "Mañana salimos temprano de viaje.", englishSentence: "Tomorrow we leave early on a trip." }
              ]
            }
          ]
        },
        {
          id: "es-u2",
          number: 2,
          title: "La Familia, la Casa y la Rutina",
          description: "Describe a tu familia, las habitaciones de la casa y tu día a día.",
          xp: 220,
          lessons: [
            {
              id: "es-u2-l1",
              title: "Mi Día a Día",
              description: "Verbos reflexivos de la rutina: levantarse, ducharse, desayunar.",
              xp: 55,
              words: [
                { id: "es-w6", word: "Trabajo", article: "el", translation: "Travail", phonetic: "/tɾaˈβa.xo/", partOfSpeech: "sustantivo", example: "Me encanta mi nuevo trabajo.", englishSentence: "I love my new job." },
                { id: "es-w7", word: "Comida", article: "la", translation: "Nourriture / Repas", phonetic: "/koˈmi.ða/", partOfSpeech: "sustantivo", example: "La comida mediterránea es deliciosa.", englishSentence: "Mediterranean food is delicious." }
              ]
            }
          ]
        },
        {
          id: "es-u3",
          number: 3,
          title: "En el Restaurante y de Compras",
          description: "Pedir comida típica, preguntar precios y comprar en el mercado.",
          xp: 240,
          lessons: [
            {
              id: "es-u3-l1",
              title: "De Tapas en el Bar",
              description: "Pide tapas, bebidas y la cuenta con soltura.",
              xp: 60,
              words: [
                { id: "es-w8", word: "Café", article: "el", translation: "Café", phonetic: "/kaˈfe/", partOfSpeech: "sustantivo", example: "¿Tomamos un café con leche juntos?", englishSentence: "Shall we have a coffee with milk together?" },
                { id: "es-w9", word: "Cuenta", article: "la", translation: "L'addition", phonetic: "/ˈkwen.ta/", partOfSpeech: "sustantivo", example: "Camarero, ¿la cuenta, por favor?", englishSentence: "Waiter, the bill please?" }
              ]
            }
          ]
        },
        {
          id: "es-u4",
          number: 4,
          title: "Viajes, Direcciones y la Ciudad",
          description: "Desplazarse en metro, pedir indicaciones y visitar lugares emblemáticos.",
          xp: 260,
          lessons: [
            {
              id: "es-u4-l1",
              title: "Descubriendo la Ciudad",
              description: "Indicaciones para llegar al centro histórico.",
              xp: 65,
              words: [
                { id: "es-w10", word: "Ciudad", article: "la", translation: "Ville", phonetic: "/θjuˈðað/", partOfSpeech: "sustantivo", example: "Barcelona es una ciudad maravillosa.", englishSentence: "Barcelona is a wonderful city." },
                { id: "es-w11", word: "Viaje", article: "el", translation: "Voyage", phonetic: "/ˈbja.xe/", partOfSpeech: "sustantivo", example: "El viaje en tren fue muy cómodo.", englishSentence: "The train journey was very comfortable." }
              ]
            }
          ]
        }
      ]
    },
    {
      id: "A2",
      title: "A2 • Elemental y Pasados",
      tagline: "Habla del pasado (indefinido e imperfecto), expresa planes futuros y habla de salud.",
      units: [
        {
          id: "es-u5",
          number: 5,
          title: "Relatar Experiencias Pasadas",
          description: "Diferencia entre Pretérito Indefinido y Pretérito Imperfecto.",
          xp: 280,
          lessons: [
            {
              id: "es-u5-l1",
              title: "Vacaciones Inolvidables",
              description: "Cuenta qué hiciste durante tus últimas vacaciones.",
              xp: 70,
              words: [
                { id: "es-w12", word: "Recuerdo", article: "el", translation: "Souvenir", phonetic: "/reˈkweɾ.ðo/", partOfSpeech: "sustantivo", example: "Tengo un gran recuerdo de Andalucía.", englishSentence: "I have a great memory of Andalusia." }
              ]
            }
          ]
        }
      ]
    },
    {
      id: "B1",
      title: "B1 • Intermedio",
      tagline: "Usa el Subjuntivo presente, expresa hipótesis, dudas y opiniones argumentadas.",
      units: [
        {
          id: "es-u6",
          number: 6,
          title: "El Mundo del Subjuntivo",
          description: "Deseos, emociones, opiniones y recomendaciones con subjuntivo.",
          xp: 320,
          lessons: [
            {
              id: "es-u6-l1",
              title: "Expresar Deseos",
              description: "Quiero que vengas, espero que tengas un buen viaje.",
              xp: 80,
              words: [
                { id: "es-w13", word: "Esperanza", article: "la", translation: "Espoir", phonetic: "/es.peˈɾan.θa/", partOfSpeech: "sustantivo", example: "Tenemos la esperanza de mejorar cada día.", englishSentence: "We have hope to improve every day." }
              ]
            }
          ]
        }
      ]
    },
    {
      id: "B2",
      title: "B2 • Avanzado y Profesional",
      tagline: "Fluidez natural, argumentación compleja, modismos y preparación para el DELE B2.",
      units: [
        {
          id: "es-u7",
          number: 7,
          title: "Debates y Argumentación Profesional",
          description: "Defender puntos de vista, negociar y escribir ensayos estructurados.",
          xp: 380,
          lessons: [
            {
              id: "es-u7-l1",
              title: "Negociaciones",
              description: "Expresiones formales de diplomacia y persuasión.",
              xp: 95,
              words: [
                { id: "es-w14", word: "Desafío", article: "el", translation: "Défi", phonetic: "/de.saˈfi.o/", partOfSpeech: "sustantivo", example: "Superar este desafío nos fortalece.", englishSentence: "Overcoming this challenge makes us stronger." }
              ]
            }
          ]
        }
      ]
    }
  ]
};

// French Curriculum
export const frenchCurriculum = {
  languageId: "fr",
  languageName: "Français",
  flag: "🇫🇷",
  levels: [
    {
      id: "A1",
      title: "A1 • Débutant & Découverte",
      tagline: "Saluer, se présenter, commander au restaurant, parler de sa famille et de ses loisirs.",
      units: [
        {
          id: "fr-u1",
          number: 1,
          title: "Salutations & Premières Conversations",
          description: "Apprenez à saluer poliment, donner votre nom et votre nationalité.",
          xp: 200,
          lessons: [
            {
              id: "fr-u1-l1",
              title: "Bonjour, enchanté !",
              description: "Les salutations du matin au soir et les formules de politesse.",
              xp: 50,
              words: [
                { id: "fr-w1", word: "Bonjour", translation: "Hello / Good morning", phonetic: "/bɔ̃.ʒuʁ/", partOfSpeech: "interjection", example: "Bonjour, comment allez-vous aujourd'hui ?", englishSentence: "Hello, how are you today?" },
                { id: "fr-w2", word: "Ami", article: "l'", translation: "Friend", phonetic: "/a.mi/", partOfSpeech: "nom", example: "Mon ami habite près du musée.", englishSentence: "My friend lives near the museum." },
                { id: "fr-w3", word: "Maison", article: "la", translation: "House", phonetic: "/mɛ.zɔ̃/", partOfSpeech: "nom", example: "Notre maison a un grand jardin fleuri.", englishSentence: "Our house has a large flower garden." }
              ]
            }
          ]
        },
        {
          id: "fr-u2",
          number: 2,
          title: "La Vie Quotidienne & Le Travail",
          description: "Parlez de vos horaires, vos repas et votre journée de travail.",
          xp: 220,
          lessons: [
            {
              id: "fr-u2-l1",
              title: "Une Journée Type",
              description: "Du réveil au coucher, découvrez le vocabulaire de la journée.",
              xp: 55,
              words: [
                { id: "fr-w4", word: "Travail", article: "le", translation: "Work", phonetic: "/tʁa.vaj/", partOfSpeech: "nom", example: "Il commence son travail à neuf heures.", englishSentence: "He starts his work at nine o'clock." },
                { id: "fr-w5", word: "Café", article: "le", translation: "Coffee / Café", phonetic: "/ka.fe/", partOfSpeech: "nom", example: "Prendre un café en terrasse est un plaisir.", englishSentence: "Having a coffee on a terrace is a pleasure." }
              ]
            }
          ]
        },
        {
          id: "fr-u3",
          number: 3,
          title: "Au Restaurant & En Ville",
          description: "Commander des plats traditionnels, demander l'addition et s'orienter.",
          xp: 240,
          lessons: [
            {
              id: "fr-u3-l1",
              title: "À Table !",
              description: "Commander le plat du jour et choisir son dessert.",
              xp: 60,
              words: [
                { id: "fr-w6", word: "Repas", article: "le", translation: "Meal", phonetic: "/ʁə.pa/", partOfSpeech: "nom", example: "Le repas en famille est un moment chaleureux.", englishSentence: "The family meal is a warm moment." },
                { id: "fr-w7", word: "Ville", article: "la", translation: "City", phonetic: "/vil/", partOfSpeech: "nom", example: "Paris est une ville magnifique.", englishSentence: "Paris is a magnificent city." }
              ]
            }
          ]
        },
        {
          id: "fr-u4",
          number: 4,
          title: "Transports & Voyages",
          description: "Prendre le train, réserver une chambre d'hôtel et explorer les régions.",
          xp: 260,
          lessons: [
            {
              id: "fr-u4-l1",
              title: "En Route pour l'Aventure",
              description: "Acheter un billet de train et trouver son quai de départ.",
              xp: 65,
              words: [
                { id: "fr-w8", word: "Voyage", article: "le", translation: "Trip / Travel", phonetic: "/vwa.jaʒ/", partOfSpeech: "nom", example: "Le voyage en train traverse de superbes paysages.", englishSentence: "The train journey crosses gorgeous landscapes." }
              ]
            }
          ]
        }
      ]
    },
    {
      id: "A2",
      title: "A2 • Survie & Récit au Passé",
      tagline: "Racontez vos souvenirs au passé composé et à l'imparfait, donnez des conseils et décrivez vos projets.",
      units: [
        {
          id: "fr-u5",
          number: 5,
          title: "Souvenirs de Vacances & Récit",
          description: "Maîtrisez le Passé Composé et l'Imparfait pour raconter des histoires vivantes.",
          xp: 280,
          lessons: [
            {
              id: "fr-u5-l1",
              title: "Mon Dernier Voyage",
              description: "Utiliser avoir et être au passé composé avec les verbes d'action.",
              xp: 70,
              words: [
                { id: "fr-w9", word: "Souvenir", article: "le", translation: "Memory", phonetic: "/suv.niʁ/", partOfSpeech: "nom", example: "J'ai gardé un merveilleux souvenir de ce voyage.", englishSentence: "I kept a wonderful memory of this trip." }
              ]
            }
          ]
        }
      ]
    },
    {
      id: "B1",
      title: "B1 • Seuil d'Autonomie",
      tagline: "Exprimez votre opinion, défendez vos idées, maniez les pronoms relatifs et le subjonctif.",
      units: [
        {
          id: "fr-u6",
          number: 6,
          title: "Exprimer son Point de Vue & Débattre",
          description: "Donner son avis, nuancer et argumenter avec conviction.",
          xp: 320,
          lessons: [
            {
              id: "fr-u6-l1",
              title: "Le Débat d'Idées",
              description: "Connecteurs logiques : cependant, par conséquent, bien que.",
              xp: 80,
              words: [
                { id: "fr-w10", word: "Défi", article: "le", translation: "Challenge", phonetic: "/de.fi/", partOfSpeech: "nom", example: "Relever ce défi demande de la persévérance.", englishSentence: "Meeting this challenge requires perseverance." }
              ]
            }
          ]
        }
      ]
    },
    {
      id: "B2",
      title: "B2 • Maîtrise Avancée & DELF B2",
      tagline: "Aisance spontanée, textes argumentatifs, registre soutenu et préparation au DELF B2.",
      units: [
        {
          id: "fr-u7",
          number: 7,
          title: "Communication Professionnelle & Société",
          description: "Rédiger des synthèses, participer à des réunions complexes et analyser l'actualité.",
          xp: 380,
          lessons: [
            {
              id: "fr-u7-l1",
              title: "La Négociation",
              description: "Diplomatie verbale et argumentation solide.",
              xp: 95,
              words: [
                { id: "fr-w11", word: "Réussite", article: "la", translation: "Success", phonetic: "/ʁe.y.sit/", partOfSpeech: "nom", example: "Le travail d'équipe garantit la réussite du projet.", englishSentence: "Teamwork ensures the success of the project." }
              ]
            }
          ]
        }
      ]
    }
  ]
};

// Arabic Curriculum (العربية)
export const arabicCurriculum = {
  languageId: "ar",
  languageName: "العربية",
  flag: "🇸🇦",
  levels: [
    {
      id: "A1",
      title: "A1 • المستوى المبتدئ والأساسي",
      tagline: "تعلم الحروف، التحيات، التعريف بالنفس، والأسرة والحياة اليومية.",
      units: [
        {
          id: "ar-u1",
          number: 1,
          title: "التحيات، التعارف والحروف الأولى",
          description: "ألقِ التحية، قدم نفسك وعرف باسمك وبلدك بلغة عربية فصحى جميلة.",
          xp: 200,
          lessons: [
            {
              id: "ar-u1-l1",
              title: "مرحبًا بكم",
              description: "عبارات الترحيب والمجاملة اليومية.",
              xp: 50,
              words: [
                { id: "ar-w1", word: "مَرْحَبًا", translation: "Bonjour / Bienvenue", phonetic: "Marhaban", partOfSpeech: "اسم / تحية", example: "مَرْحَبًا بِكُمْ فِي هَذَا الْمَسَارِ التَّعْلِيمِيِّ.", englishSentence: "Welcome to this learning path." },
                { id: "ar-w2", word: "شُكْرًا", translation: "Merci", phonetic: "Shukran", partOfSpeech: "اسم / امتنان", example: "شُكْرًا جَزِيلًا عَلَى لُطْفِكَ.", englishSentence: "Thank you very much for your kindness." },
                { id: "ar-w3", word: "كِتَاب", article: "الـ", translation: "Livre", phonetic: "Kitab", partOfSpeech: "اسم", example: "الْكِتَابُ خَيْرُ جَلِيسٍ فِي الزَّمَانِ.", englishSentence: "The book is the best companion in time." }
              ]
            }
          ]
        },
        {
          id: "ar-u2",
          number: 2,
          title: "البيت، الأسرة والحياة اليومية",
          description: "تعرف على أفراد الأسرة، غرف المنزل والأنشطة اليومية المعتادة.",
          xp: 220,
          lessons: [
            {
              id: "ar-u2-l1",
              title: "يومي في البيت",
              description: "الأفعال اليومية في صيغة المضارع البسيط.",
              xp: 55,
              words: [
                { id: "ar-w4", word: "بَيْت", article: "الـ", translation: "Maison", phonetic: "Bayt", partOfSpeech: "اسم", example: "بَيْتُنَا دَافِئٌ وَمُمْتَلِئٌ بِالسَّعَادَةِ.", englishSentence: "Our house is warm and full of happiness." },
                { id: "ar-w5", word: "عَمَل", article: "الـ", translation: "Travail", phonetic: "'Amal", partOfSpeech: "اسم", example: "يَبْدَأُ الْعَمَلُ كُلَّ صَبَاحٍ بِنَشَاطٍ.", englishSentence: "Work begins every morning with energy." }
              ]
            }
          ]
        },
        {
          id: "ar-u3",
          number: 3,
          title: "في المطعم والسوق والمشتريات",
          description: "طلب الأطعمة العربية الشهية والشراء في الأسواق التقليدية.",
          xp: 240,
          lessons: [
            {
              id: "ar-u3-l1",
              title: "المأكولات والمشروبات",
              description: "أسماء الأطعمة والمشروبات والتعبير عن الذوق.",
              xp: 60,
              words: [
                { id: "ar-w6", word: "قَهْوَة", article: "الـ", translation: "Café", phonetic: "Qahwah", partOfSpeech: "اسم", example: "تَفَضَّلْ قَهْوَةً عَرَبِيَّةً أَصِيلَةً.", englishSentence: "Please enjoy an authentic Arabic coffee." }
              ]
            }
          ]
        },
        {
          id: "ar-u4",
          number: 4,
          title: "السفر، الاتجاهات والمدينة",
          description: "السؤال عن الأماكن وسياحة المدن التاريخية العربية.",
          xp: 260,
          lessons: [
            {
              id: "ar-u4-l1",
              title: "رحلة إلى المدينة",
              description: "استخدام أسماء الإشارة والاتجاهات.",
              xp: 65,
              words: [
                { id: "ar-w7", word: "مَدِينَة", article: "الـ", translation: "Ville", phonetic: "Madinah", partOfSpeech: "اسم", example: "هَذِهِ الْمَدِينَةُ الْعَرِيقَةُ تَأْسِرُ الْقُلُوبَ.", englishSentence: "This ancient city captivates hearts." },
                { id: "ar-w8", word: "سَفَر", article: "الـ", translation: "Voyage", phonetic: "Safar", partOfSpeech: "اسم", example: "السَّفَرُ يُعَلِّمُ الْإِنْسَانَ خِبْرَاتٍ جَدِيدَةً.", englishSentence: "Travel teaches human new experiences." }
              ]
            }
          ]
        }
      ]
    },
    {
      id: "A2",
      title: "A2 • المستوى الأساسي المتقدم",
      tagline: "تحدث عن الماضي، استخدام الأفعال المزيدة، والحديث عن الصحة والطقس.",
      units: [
        {
          id: "ar-u5",
          number: 5,
          title: "ذكريات وسياحة وسفر",
          description: "صرف الفعل الماضي واستخدام أدوات الربط في السرد القصصي.",
          xp: 280,
          lessons: [
            {
              id: "ar-u5-l1",
              title: "رحلتي الماضية",
              description: "سرد أحداث الرحلة بالتفصيل.",
              xp: 70,
              words: [
                { id: "ar-w9", word: "صَدِيق", article: "الـ", translation: "Ami", phonetic: "Sadeeq", partOfSpeech: "اسم", example: "رَافَقَنِي صَدِيقِي فِي جَمِيعِ رِحْلَاتِي.", englishSentence: "My friend accompanied me on all my travels." }
              ]
            }
          ]
        }
      ]
    },
    {
      id: "B1",
      title: "B1 • المستوى المتوسط والاستقلالية",
      tagline: "إبداء الرأي، قراءة مقالات إخبارية، وفهم نصوص فصحى متنوعة.",
      units: [
        {
          id: "ar-u6",
          number: 6,
          title: "الحوار الثقافي والتعبير عن الرأي",
          description: "استخدام أسلوب التفضيل والمقارنة وحروف الجر بدقة.",
          xp: 320,
          lessons: [
            {
              id: "ar-u6-l1",
              title: "نقاش فكري وثقافي",
              description: "التعبير عن وجهة النظر باحترام ورصانة.",
              xp: 80,
              words: [
                { id: "ar-w10", word: "مَعْرِفَة", article: "الـ", translation: "Connaissance", phonetic: "Ma'rifah", partOfSpeech: "اسم", example: "طَلَبُ الْمَعْرِفَةِ مَسِيرَةٌ لَا تَنْتَهِي.", englishSentence: "The pursuit of knowledge is an endless journey." }
              ]
            }
          ]
        }
      ]
    },
    {
      id: "B2",
      title: "B2 • الطلاقة المتقدمة والاحترافية",
      tagline: "تحليل النصوص الأدبية، الكتابة الصحفية، والإعداد لاختبار CIMA.",
      units: [
        {
          id: "ar-u7",
          number: 7,
          title: "البلاغة والخطاب المعاصر",
          description: "فهم الاستعارات والتراكيب البيانية في الإعلام والأدب.",
          xp: 380,
          lessons: [
            {
              id: "ar-u7-l1",
              title: "الإعلام المعاصر",
              description: "قراءة وتحليل المقالات الصحفية.",
              xp: 95,
              words: [
                { id: "ar-w11", word: "إِنْجَاز", article: "الـ", translation: "Accomplissement", phonetic: "Injaz", partOfSpeech: "اسم", example: "هَذَا الْإِنْجَازُ نَتِيجَةُ عَمَلٍ دَؤُوبٍ.", englishSentence: "This achievement is the result of tireless work." }
              ]
            }
          ]
        }
      ]
    }
  ]
};

// Italian Curriculum
export const italianCurriculum = {
  languageId: "it",
  languageName: "Italiano",
  flag: "🇮🇹",
  levels: [
    {
      id: "A1",
      title: "A1 • Principiante Assoluto",
      tagline: "Saluti, presentazioni, famiglia, ristorante, cibo e trasporti in Italia.",
      units: [
        {
          id: "it-u1",
          number: 1,
          title: "Saluti, Presentazioni & Primi Passi",
          description: "Impara a presentarti, dire la tua provenienza e contare fino a 100.",
          xp: 200,
          lessons: [
            {
              id: "it-u1-l1",
              title: "Ciao! Piacere di conoscerti",
              description: "Formule di cortesia e saluti amichevoli.",
              xp: 50,
              words: [
                { id: "it-w1", word: "Ciao", translation: "Hello / Bye", phonetic: "/ˈtʃa.o/", partOfSpeech: "interiezione", example: "Ciao! Benvenuti in Italia.", englishSentence: "Hello! Welcome to Italy." },
                { id: "it-w2", word: "Amico", article: "l'", translation: "Ami", phonetic: "/aˈmi.ko/", partOfSpeech: "sostantivo", example: "Il mio amico abita a Firenze.", englishSentence: "My friend lives in Florence." },
                { id: "it-w3", word: "Casa", article: "la", translation: "Maison", phonetic: "/ˈka.sa/", partOfSpeech: "sostantivo", example: "La mia casa è molto accogliente.", englishSentence: "My house is very welcoming." }
              ]
            }
          ]
        },
        {
          id: "it-u2",
          number: 2,
          title: "Al Ristorante, Caffè & Cucina",
          description: "Ordinare pasta, espresso e pizza nei migliori locali italiani.",
          xp: 220,
          lessons: [
            {
              id: "it-u2-l1",
              title: "Un Caffè al Bar",
              description: "La cultura dell'espresso italiano e le ordinazioni.",
              xp: 55,
              words: [
                { id: "it-w4", word: "Caffè", article: "il", translation: "Café", phonetic: "/kafˈfɛ/", partOfSpeech: "sostantivo", example: "Prendiamo un caffè insieme?", englishSentence: "Shall we have a coffee together?" },
                { id: "it-w5", word: "Conto", article: "il", translation: "L'addition", phonetic: "/ˈkon.to/", partOfSpeech: "sostantivo", example: "Cameriere, ci porta il conto per favore?", englishSentence: "Waiter, could you bring us the bill please?" }
              ]
            }
          ]
        },
        {
          id: "it-u3",
          number: 3,
          title: "In Città & Viaggi",
          description: "Muoversi a Roma, Milano e Venezia con i treni e gli autobus.",
          xp: 240,
          lessons: [
            {
              id: "it-u3-l1",
              title: "Alla Stazione",
              description: "Biglietti, binari e coincidenze ferroviarie.",
              xp: 60,
              words: [
                { id: "it-w6", word: "Città", article: "la", translation: "Ville", phonetic: "/tʃitˈta/", partOfSpeech: "sostantivo", example: "Roma è una città eterna.", englishSentence: "Rome is an eternal city." },
                { id: "it-w7", word: "Viaggio", article: "il", translation: "Voyage", phonetic: "/ˈvjad.dʒo/", partOfSpeech: "sostantivo", example: "Buon viaggio a tutti voi!", englishSentence: "Have a good trip everyone!" }
              ]
            }
          ]
        },
        {
          id: "it-u4",
          number: 4,
          title: "Lavoro, Hobby & Tempo Libero",
          description: "Parlare delle proprie passioni e della propria professione.",
          xp: 260,
          lessons: [
            {
              id: "it-u4-l1",
              title: "Il Mio Lavoro",
              description: "Descrivere mansioni e colleghi.",
              xp: 65,
              words: [
                { id: "it-w8", word: "Lavoro", article: "il", translation: "Travail", phonetic: "/laˈvo.ro/", partOfSpeech: "sostantivo", example: "Amo il mio lavoro ogni giorno di più.", englishSentence: "I love my work more every day." }
              ]
            }
          ]
        }
      ]
    },
    {
      id: "A2",
      title: "A2 • Elementare & Passato",
      tagline: "Passato prossimo, imperfetto, descrizioni ed esperienze di vita.",
      units: [
        {
          id: "it-u5",
          number: 5,
          title: "Vacanze & Bei Ricordi",
          description: "Uso del passato prossimo con essere e avere.",
          xp: 280,
          lessons: [
            {
              id: "it-u5-l1",
              title: "Il Mio Ultimo Viaggio",
              description: "Raccontare aneddoti ed emozioni.",
              xp: 70,
              words: [
                { id: "it-w9", word: "Ricordo", article: "il", translation: "Souvenir", phonetic: "/riˈkɔr.do/", partOfSpeech: "sostantivo", example: "Un ricordo indimenticabile della Toscana.", englishSentence: "An unforgettable memory of Tuscany." }
              ]
            }
          ]
        }
      ]
    },
    {
      id: "B1",
      title: "B1 • Autonomia & Congiuntivo",
      tagline: "Esprimere opinioni, dubbi, desideri ed ipotesi con il congiuntivo.",
      units: [
        {
          id: "it-u6",
          number: 6,
          title: "Opinioni & Cultura Italiana",
          description: "Discutere di cinema, arte e temi d'attualità.",
          xp: 320,
          lessons: [
            {
              id: "it-u6-l1",
              title: "Esprimere la Propria Opinione",
              description: "Penso che, credo che, mi sembra che...",
              xp: 80,
              words: [
                { id: "it-w10", word: "Sfida", article: "la", translation: "Défi", phonetic: "/ˈsfi.da/", partOfSpeech: "sostantivo", example: "Ogni nuova sfida ci rende migliori.", englishSentence: "Every new challenge makes us better." }
              ]
            }
          ]
        }
      ]
    },
    {
      id: "B2",
      title: "B2 • Padronanza & Certificazione CILS",
      tagline: "Competenza professionale, sintassi raffinata e preparazione all'esame CILS B2.",
      units: [
        {
          id: "it-u7",
          number: 7,
          title: "Negoziazione & Lingua Specialistica",
          description: "Discorsi accademici e comunicazione formale.",
          xp: 380,
          lessons: [
            {
              id: "it-u7-l1",
              title: "Successo Professionale",
              description: "Presentazioni e riunioni d'alto livello.",
              xp: 95,
              words: [
                { id: "it-w11", word: "Successo", article: "il", translation: "Succès", phonetic: "/sutˈtʃɛs.so/", partOfSpeech: "sostantivo", example: "La determinazione porta sempre al successo.", englishSentence: "Determination always leads to success." }
              ]
            }
          ]
        }
      ]
    }
  ]
};

// German curriculum wrapper
export const germanCurriculum = {
  languageId: "de",
  languageName: "Allemand",
  flag: "🇩🇪",
  levels: germanCurriculumData.levels
};

// Registry of curricula
export const CURRICULA_BY_LANGUAGE = {
  de: germanCurriculum,
  en: englishCurriculum,
  es: spanishCurriculum,
  fr: frenchCurriculum,
  ar: arabicCurriculum,
  it: italianCurriculum
};

/**
 * Returns curriculum for a given language ID ('de', 'en', 'es', 'fr', 'ar', 'it')
 */
export function getCurriculumByLanguage(languageId = "de") {
  const norm = (languageId || "de").toLowerCase().trim();
  return CURRICULA_BY_LANGUAGE[norm] || CURRICULA_BY_LANGUAGE.de;
}

/**
 * Returns flat list of all ordered units for a language
 */
export function getUnitsByLanguage(languageId = "de") {
  const cur = getCurriculumByLanguage(languageId);
  const result = [];
  (cur.levels || []).forEach((lvl) => {
    (lvl.units || []).forEach((u) => {
      result.push({
        ...u,
        levelId: lvl.id,
        levelTitle: lvl.title,
        languageId: cur.languageId
      });
    });
  });
  return result;
}

/**
 * Returns all vocabulary items for a given language
 */
export function getWordsByLanguage(languageId = "de") {
  const cur = getCurriculumByLanguage(languageId);
  const words = [];
  (cur.levels || []).forEach((lvl) => {
    (lvl.units || []).forEach((u) => {
      (u.lessons || []).forEach((l) => {
        (l.words || []).forEach((w) => {
          words.push({
            ...w,
            languageId: cur.languageId,
            level: lvl.id,
            unitId: u.id,
            unitTitle: u.title,
            lessonId: l.id,
            lessonTitle: l.title
          });
        });
      });
    });
  });
  return words;
}
