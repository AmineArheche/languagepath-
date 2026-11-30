export const b2Data = {
  id: "B2",
  title: "B2 • Upper Intermediate",
  tagline: "Fluent nuance: Konjunktiv II (hypotheticals), Passive voice, debate discourse, and German idioms.",
  accentColor: "from-purple-500 to-indigo-600",
  units: [
    {
      id: "b2-u1",
      number: 1,
      title: "Diskussion & Redewendungen",
      subtitle: "Nuanced Debate & German Idioms",
      icon: "MessageSquare",
      description: "Express nuanced viewpoints, disagree tactfully, and incorporate authentic German idioms into conversation.",
      grammarSummary: "Konjunktiv II expresses wishes, polite requests, and hypothetical conditions ('Wenn ich mehr Zeit hätte, würde ich...').",
      lessons: [
        {
          id: "b2-u1-l1",
          title: "Konjunktiv II & Höflichkeit",
          subtitle: "Hypotheticals and polite diplomacy",
          xp: 50,
          grammarTip: "Use 'hätte' (had), 'wäre' (were), or 'würde + Infinitiv' for other verbs in hypothetical conditions.",
          words: [
            { id: "b2-w1", german: "Standpunkt", english: "point of view / stance", gender: "der", plural: "die Standpunkte", partOfSpeech: "noun", exampleDe: "Aus meiner Sicht ist dieser Standpunkt verständlich.", exampleEn: "From my perspective, this point of view is understandable." },
            { id: "b2-w2", german: "Zusammenhang", english: "context / connection", gender: "der", plural: "die Zusammenhänge", partOfSpeech: "noun", exampleDe: "In diesem Zusammenhang sollten wir die Kosten prüfen.", exampleEn: "In this context, we should review the costs." },
            { id: "b2-w3", german: "Daumen drücken", english: "to cross one's fingers / wish luck", gender: null, partOfSpeech: "idiom", exampleDe: "Ich drücke dir für die Prüfung ganz fest die Daumen!", exampleEn: "I'll keep my fingers crossed for your exam!" },
            { id: "b2-w4", german: "Zwei Fliegen mit einer Klappe schlagen", english: "kill two birds with one stone", gender: null, partOfSpeech: "idiom", exampleDe: "Damit schlagen wir zwei Fliegen mit einer Klappe.", exampleEn: "With that, we kill two birds with one stone." },
            { id: "b2-w5", german: "widersprechen", english: "to contradict / disagree with (+ Dat)", gender: null, partOfSpeech: "verb", exampleDe: "Da muss ich Ihnen leider widersprechen.", exampleEn: "I must unfortunately disagree with you there." }
          ],
          quiz: [
            {
              id: "b2-q1",
              type: "multiple-choice",
              prompt: "What does the German idiom 'Ich drücke dir die Daumen' mean?",
              options: [
                "I am mad at you",
                "I wish you the best of luck",
                "I challenge you to a fight",
                "I don't believe what you say"
              ],
              correctIndex: 1,
              explanation: "'Daumen drücken' literally means pressing thumbs, which is the German equivalent of crossing your fingers for good luck."
            },
            {
              id: "b2-q2",
              type: "multiple-choice",
              prompt: "Which sentence expresses a hypothetical wish correctly in Konjunktiv II?",
              options: [
                "Wenn ich reich bin, kaufe ich ein Schloss.",
                "Wenn ich reich wäre, würde ich ein Schloss kaufen.",
                "Wenn ich reich werde, kaufe ich ein Schloss.",
                "Wenn ich reich gewesen, ich kaufe Schloss."
              ],
              correctIndex: 1,
              explanation: "'wäre' (were) and 'würde kaufen' (would buy) correctly express the hypothetical condition in Konjunktiv II."
            },
            {
              id: "b2-q3",
              type: "gender",
              prompt: "What is the article for 'Zusammenhang'?",
              word: "Zusammenhang",
              correctGender: "der",
              explanation: "Nouns formed from strong verb roots with vowel change are masculine: der Zusammenhang."
            }
          ]
        }
      ]
    }
  ]
};
