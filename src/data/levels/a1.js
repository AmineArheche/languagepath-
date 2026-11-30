export const a1Data = {
  id: "A1",
  title: "A1 • Absolute Beginner",
  tagline: "First steps into German: greetings, daily life, and foundational sentence structure.",
  accentColor: "from-amber-500 to-orange-500",
  units: [
    {
      id: "a1-u1",
      number: 1,
      title: "Begrüßungen & Vorstellung",
      subtitle: "Greetings & Self-Introductions",
      icon: "UserCheck",
      description: "Learn to introduce yourself, say hello and goodbye, and ask how someone is doing.",
      grammarSummary: "German has formal ('Sie') and informal ('du') forms of address. Conjugate regular verbs with -e, -st, -t, -en, -t, -en.",
      lessons: [
        {
          id: "a1-u1-l1",
          title: "Hallo & Tschüss",
          subtitle: "Basic greetings and farewells",
          xp: 25,
          grammarTip: "Use 'du' with friends, family, and children. Use 'Sie' (always capitalized) in professional and polite contexts.",
          words: [
            { id: "a1-w1", german: "Hallo", english: "Hello", gender: null, partOfSpeech: "interjection", exampleDe: "Hallo! Wie geht es dir?", exampleEn: "Hello! How are you?" },
            { id: "a1-w2", german: "Guten Tag", english: "Good day / Hello", gender: null, partOfSpeech: "phrase", exampleDe: "Guten Tag, Herr Müller!", exampleEn: "Good day, Mr. Müller!" },
            { id: "a1-w3", german: "Auf Wiedersehen", english: "Goodbye (formal)", gender: null, partOfSpeech: "phrase", exampleDe: "Auf Wiedersehen und danke!", exampleEn: "Goodbye and thank you!" },
            { id: "a1-w4", german: "Tschüss", english: "Bye (informal)", gender: null, partOfSpeech: "interjection", exampleDe: "Tschüss! Bis morgen!", exampleEn: "Bye! See you tomorrow!" },
            { id: "a1-w5", german: "Name", english: "Name", gender: "der", plural: "die Namen", partOfSpeech: "noun", exampleDe: "Mein Name ist Lukas.", exampleEn: "My name is Lukas." },
            { id: "a1-w6", german: "Bitte", english: "Please / You're welcome", gender: null, partOfSpeech: "adverb", exampleDe: "Ein Wasser, bitte.", exampleEn: "One water, please." },
            { id: "a1-w7", german: "Danke", english: "Thank you", gender: null, partOfSpeech: "phrase", exampleDe: "Danke schön für die Hilfe.", exampleEn: "Thank you very much for the help." }
          ],
          quiz: [
            {
              id: "a1-q1",
              type: "multiple-choice",
              prompt: "How do you politely say 'Goodbye' to a bank clerk or doctor?",
              options: ["Tschüss", "Auf Wiedersehen", "Guten Morgen", "Gute Nacht"],
              correctIndex: 1,
              explanation: "'Auf Wiedersehen' is the standard polite farewell, while 'Tschüss' is informal."
            },
            {
              id: "a1-q2",
              type: "gender",
              prompt: "What is the grammatical gender of 'Name'?",
              word: "Name",
              correctGender: "der",
              explanation: "It is 'der Name' (plural: die Namen)."
            },
            {
              id: "a1-q3",
              type: "fill-blank",
              prompt: "Complete the polite sentence: 'Ein Wasser, _____.'",
              options: ["bitte", "danke", "hallo", "gut"],
              correctIndex: 0,
              explanation: "'Bitte' means 'please' when ordering."
            }
          ]
        },
        {
          id: "a1-u1-l2",
          title: "Wer bist du?",
          subtitle: "Verb 'sein' (to be) & introductions",
          xp: 30,
          grammarTip: "The irregular verb 'sein': ich bin, du bist, er/sie/es ist, wir sind, ihr seid, sie/Sie sind.",
          words: [
            { id: "a1-w8", german: "sein", english: "to be", gender: null, partOfSpeech: "verb", exampleDe: "Ich bin Student in Berlin.", exampleEn: "I am a student in Berlin." },
            { id: "a1-w9", german: "heißen", english: "to be called", gender: null, partOfSpeech: "verb", exampleDe: "Ich heiße Anna.", exampleEn: "My name is Anna." },
            { id: "a1-w10", german: "kommen", english: "to come", gender: null, partOfSpeech: "verb", exampleDe: "Ich komme aus Deutschland.", exampleEn: "I come from Germany." },
            { id: "a1-w11", german: "Land", english: "country", gender: "das", plural: "die Länder", partOfSpeech: "noun", exampleDe: "Deutschland ist ein schönes Land.", exampleEn: "Germany is a beautiful country." },
            { id: "a1-w12", german: "Stadt", english: "city", gender: "die", plural: "die Städte", partOfSpeech: "noun", exampleDe: "Berlin ist eine große Stadt.", exampleEn: "Berlin is a big city." },
            { id: "a1-w13", german: "Freund", english: "friend (male)", gender: "der", plural: "die Freunde", partOfSpeech: "noun", exampleDe: "Das ist mein Freund Peter.", exampleEn: "This is my friend Peter." }
          ],
          quiz: [
            {
              id: "a1-q4",
              type: "multiple-choice",
              prompt: "Select the correct form: 'Woher _____ du?'",
              options: ["komme", "kommst", "kommt", "kommen"],
              correctIndex: 1,
              explanation: "With pronoun 'du', regular verbs take the ending -st (du kommst)."
            },
            {
              id: "a1-q5",
              type: "multiple-choice",
              prompt: "Select the correct form: 'Wir _____ glücklich.'",
              options: ["bin", "bist", "ist", "sind"],
              correctIndex: 3,
              explanation: "'Wir' conjugates with 'sind' (wir sind)."
            },
            {
              id: "a1-q6",
              type: "gender",
              prompt: "What is the grammatical gender of 'Stadt'?",
              word: "Stadt",
              correctGender: "die",
              explanation: "It is 'die Stadt' (plural: die Städte)."
            }
          ]
        }
      ]
    },
    {
      id: "a1-u2",
      number: 2,
      title: "Essen & Trinken",
      subtitle: "Food, Drinks & Restaurant Orders",
      icon: "Utensils",
      description: "Learn essential vocabulary for ordering food, grocery shopping, and express likes/dislikes.",
      grammarSummary: "Accusative case for direct objects: masculine 'der' changes to 'den' / 'einen'!",
      lessons: [
        {
          id: "a1-u2-l1",
          title: "Im Restaurant",
          subtitle: "Ordering food and asking for the bill",
          xp: 30,
          grammarTip: "Notice the accusative shift: 'Ich möchte den Kaffee' (masculine), but 'Ich möchte die Suppe' (feminine) and 'Ich möchte das Wasser' (neuter).",
          words: [
            { id: "a1-w14", german: "Kaffee", english: "coffee", gender: "der", plural: "die Kaffees", partOfSpeech: "noun", exampleDe: "Ich trinke morgens einen Kaffee.", exampleEn: "I drink a coffee in the morning." },
            { id: "a1-w15", german: "Suppe", english: "soup", gender: "die", plural: "die Suppen", partOfSpeech: "noun", exampleDe: "Die Suppe schmeckt sehr gut.", exampleEn: "The soup tastes very good." },
            { id: "a1-w16", german: "Wasser", english: "water", gender: "das", plural: "-", partOfSpeech: "noun", exampleDe: "Ein Glas Wasser mit Kohlensäure.", exampleEn: "A glass of sparkling water." },
            { id: "a1-w17", german: "Rechnung", english: "bill / check", gender: "die", plural: "die Rechnungen", partOfSpeech: "noun", exampleDe: "Die Rechnung, bitte!", exampleEn: "The bill, please!" },
            { id: "a1-w18", german: "schmecken", english: "to taste", gender: null, partOfSpeech: "verb", exampleDe: "Das Essen schmeckt lecker.", exampleEn: "The food tastes delicious." },
            { id: "a1-w19", german: "lecker", english: "delicious", gender: null, partOfSpeech: "adjective", exampleDe: "Die Brezel ist so lecker!", exampleEn: "The pretzel is so delicious!" }
          ],
          quiz: [
            {
              id: "a1-q7",
              type: "multiple-choice",
              prompt: "How do you ask for the check in a restaurant?",
              options: ["Die Rechnung, bitte!", "Wo ist der Tisch?", "Ich habe Hunger.", "Guten Appetit!"],
              correctIndex: 0,
              explanation: "'Die Rechnung, bitte!' is the standard way to ask for the bill."
            },
            {
              id: "a1-q8",
              type: "gender",
              prompt: "What is the article for 'Rechnung'?",
              word: "Rechnung",
              correctGender: "die",
              explanation: "All nouns ending in '-ung' are 100% feminine: die Rechnung."
            }
          ]
        }
      ]
    }
  ]
};
