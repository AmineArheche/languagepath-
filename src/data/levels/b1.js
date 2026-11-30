export const b1Data = {
  id: "B1",
  title: "B1 • Intermediate",
  tagline: "Achieve conversational independence: connect ideas with 'weil' & 'obwohl', express opinions, and master work life.",
  accentColor: "from-emerald-500 to-teal-500",
  units: [
    {
      id: "b1-u1",
      number: 1,
      title: "Arbeitswelt & Karriere",
      subtitle: "Work, Job Interviews & Professional Life",
      icon: "Briefcase",
      description: "Express your professional experience, discuss goals, and craft emails in a workplace setting.",
      grammarSummary: "Subordinate clauses kick the conjugated verb to the very end! E.g. '... weil ich heute keine Zeit HABE.'",
      lessons: [
        {
          id: "b1-u1-l1",
          title: "Das Vorstellungsgespräch",
          subtitle: "Job interviews and qualifications",
          xp: 40,
          grammarTip: "Conjunctions like 'weil' (because), 'dass' (that), and 'obwohl' (although) send the conjugated verb to the end of the clause.",
          words: [
            { id: "b1-w1", german: "Vorstellungsgespräch", english: "job interview", gender: "das", plural: "die Vorstellungsgespräche", partOfSpeech: "noun", exampleDe: "Morgen habe ich ein wichtiges Vorstellungsgespräch.", exampleEn: "Tomorrow I have an important job interview." },
            { id: "b1-w2", german: "Erfahrung", english: "experience", gender: "die", plural: "die Erfahrungen", partOfSpeech: "noun", exampleDe: "Ich habe fünf Jahre Erfahrung im Marketing.", exampleEn: "I have five years of experience in marketing." },
            { id: "b1-w3", german: "Lebenslauf", english: "resume / CV", gender: "der", plural: "die Lebensläufe", partOfSpeech: "noun", exampleDe: "Bitte senden Sie Ihren Lebenslauf als PDF.", exampleEn: "Please send your resume as a PDF." },
            { id: "b1-w4", german: "obwohl", english: "although / even though", gender: null, partOfSpeech: "conjunction", exampleDe: "Ich arbeite weiter, obwohl ich müde bin.", exampleEn: "I keep working although I am tired." },
            { id: "b1-w5", german: "Bewerbung", english: "application", gender: "die", plural: "die Bewerbungen", partOfSpeech: "noun", exampleDe: "Ich habe meine Bewerbung gestern abgeschickt.", exampleEn: "I sent my application yesterday." },
            { id: "b1-w6", german: "überzeugen", english: "to convince", gender: null, partOfSpeech: "verb", exampleDe: "Er konnte den Chef im Gespräch überzeugen.", exampleEn: "He was able to convince the boss in the interview." }
          ],
          quiz: [
            {
              id: "b1-q1",
              type: "multiple-choice",
              prompt: "Which sentence has correct German word order with 'weil'?",
              options: [
                "Ich lerne Deutsch, weil ich will in Berlin leben.",
                "Ich lerne Deutsch, weil will ich in Berlin leben.",
                "Ich lerne Deutsch, weil ich in Berlin leben will.",
                "Ich lerne Deutsch, weil in Berlin leben will ich."
              ],
              correctIndex: 2,
              explanation: "In subordinate clauses introduced by 'weil', all auxiliary/modal conjugated verbs move to the final position: '...weil ich in Berlin leben will.'"
            },
            {
              id: "b1-q2",
              type: "gender",
              prompt: "What is the article for 'Bewerbung'?",
              word: "Bewerbung",
              correctGender: "die",
              explanation: "All nouns ending in '-ung' are feminine: die Bewerbung."
            },
            {
              id: "b1-q3",
              type: "gender",
              prompt: "What is the article for 'Lebenslauf'?",
              word: "Lebenslauf",
              correctGender: "der",
              explanation: "Compound ending in 'Lauf' (der Lauf): der Lebenslauf."
            }
          ]
        }
      ]
    }
  ]
};
