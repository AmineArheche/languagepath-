export const a2Data = {
  id: "A2",
  title: "A2 • Elementary",
  tagline: "Build everyday confidence: past tense (Perfekt), travel directions, doctor visits, and modal verbs.",
  accentColor: "from-blue-500 to-cyan-500",
  units: [
    {
      id: "a2-u1",
      number: 1,
      title: "Reisen & Unterwegs",
      subtitle: "Travel, Trains & Directions",
      icon: "Train",
      description: "Navigate train stations, buy tickets, and ask for directions in a German-speaking city.",
      grammarSummary: "Two-way prepositions (Wechselpräpositionen): in, an, auf, unter, über take Accusative for movement (wohin?) and Dative for position (wo?).",
      lessons: [
        {
          id: "a2-u1-l1",
          title: "Am Bahnhof",
          subtitle: "Train station announcements & tickets",
          xp: 35,
          grammarTip: "Dative masculine changes 'der' to 'dem'. E.g. 'am Bahnhof' = 'an dem Bahnhof'.",
          words: [
            { id: "a2-w1", german: "Bahnhof", english: "train station", gender: "der", plural: "die Bahnhöfe", partOfSpeech: "noun", exampleDe: "Der Zug kommt am Hauptbahnhof an.", exampleEn: "The train arrives at the main station." },
            { id: "a2-w2", german: "Gleis", english: "platform / track", gender: "das", plural: "die Gleise", partOfSpeech: "noun", exampleDe: "Der ICE nach München fährt auf Gleis 4 ab.", exampleEn: "The ICE to Munich departs on track 4." },
            { id: "a2-w3", german: "Fahrkarte", english: "ticket", gender: "die", plural: "die Fahrkarten", partOfSpeech: "noun", exampleDe: "Haben Sie eine gültige Fahrkarte?", exampleEn: "Do you have a valid ticket?" },
            { id: "a2-w4", german: "Verspätung", english: "delay", gender: "die", plural: "die Verspätungen", partOfSpeech: "noun", exampleDe: "Der Zug hat leider 15 Minuten Verspätung.", exampleEn: "The train unfortunately has a 15-minute delay." },
            { id: "a2-w5", german: "umsteigen", english: "to change trains", gender: null, partOfSpeech: "verb", exampleDe: "Wir müssen in Frankfurt umsteigen.", exampleEn: "We have to change trains in Frankfurt." },
            { id: "a2-w6", german: "abfahren", english: "to depart", gender: null, partOfSpeech: "verb", exampleDe: "Wann fährt der Bus ab?", exampleEn: "When does the bus depart?" }
          ],
          quiz: [
            {
              id: "a2-q1",
              type: "multiple-choice",
              prompt: "What does 'Der Zug hat 20 Minuten Verspätung' mean?",
              options: ["The train arrives in 20 minutes", "The train is 20 minutes late", "The train leaves 20 minutes early", "The train trip takes 20 minutes"],
              correctIndex: 1,
              explanation: "'Verspätung' means delay: the train is 20 minutes late."
            },
            {
              id: "a2-q2",
              type: "gender",
              prompt: "What is the article for 'Gleis' (track/platform)?",
              word: "Gleis",
              correctGender: "das",
              explanation: "It is 'das Gleis' (plural: die Gleise)."
            },
            {
              id: "a2-q3",
              type: "multiple-choice",
              prompt: "Complete: 'Wir müssen in Köln _____.'",
              options: ["einsteigen", "umsteigen", "aussehen", "abholen"],
              correctIndex: 1,
              explanation: "'umsteigen' means to change trains or switch connections."
            }
          ]
        },
        {
          id: "a2-u1-l2",
          title: "Das Perfekt (Past Tense)",
          subtitle: "Talking about yesterday and past experiences",
          xp: 40,
          grammarTip: "Perfekt is formed with 'haben' or 'sein' + Partizip II (ge-...-t / ge-...-en). Verbs of motion or change of state use 'sein' (ich bin gefahren, ich bin gegangen).",
          words: [
            { id: "a2-w7", german: "gestern", english: "yesterday", gender: null, partOfSpeech: "adverb", exampleDe: "Gestern habe ich ein Buch gelesen.", exampleEn: "Yesterday I read a book." },
            { id: "a2-w8", german: "gemacht", english: "done / made", gender: null, partOfSpeech: "verb", exampleDe: "Was hast du am Wochenende gemacht?", exampleEn: "What did you do on the weekend?" },
            { id: "a2-w9", german: "gegangen", english: "gone / walked", gender: null, partOfSpeech: "verb", exampleDe: "Ich bin gestern ins Kino gegangen.", exampleEn: "I went to the cinema yesterday." },
            { id: "a2-w10", german: "Urlaub", english: "vacation / holiday", gender: "der", plural: "die Urlaube", partOfSpeech: "noun", exampleDe: "Wir haben Urlaub in den Bergen gemacht.", exampleEn: "We took a vacation in the mountains." }
          ],
          quiz: [
            {
              id: "a2-q4",
              type: "multiple-choice",
              prompt: "Which auxiliary verb is used for verbs of motion like 'fahren' and 'gehen' in Perfekt?",
              options: ["haben", "sein", "werden", "können"],
              correctIndex: 1,
              explanation: "Verbs of movement and state changes use 'sein' (e.g., 'Ich bin gefahren')."
            },
            {
              id: "a2-q5",
              type: "gender",
              prompt: "What is the article for 'Urlaub'?",
              word: "Urlaub",
              correctGender: "der",
              explanation: "It is 'der Urlaub'."
            }
          ]
        }
      ]
    }
  ]
};
