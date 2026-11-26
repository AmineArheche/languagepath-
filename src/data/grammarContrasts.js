/**
 * src/data/grammarContrasts.js
 *
 * Dedicated Contrast Mode Exercises & Grammatical Opposition Rules for DeutschPath.
 * Targets high-confusion grammatical contrasts:
 * 1. Akkusativ vs. Dativ with Two-Way Prepositions (Wechselpräpositionen: an, auf, in, neben, etc.)
 * 2. Positional Verbs (stellen/stehen, legen/liegen, setzen/sitzen)
 * 3. Personal Pronouns (Akkusativ vs. Dativ: mich/mir, dich/dir, ihn/ihm)
 * 4. Clause Connectors (weil vs. denn vs. deshalb)
 */

export const GRAMMAR_CONTRASTS = [
  // ================= 1. WECHSELPRAEPOSITIONEN: AKKUSATIV VS. DATIV =================
  {
    id: "contrast-wechsel-1",
    theme: "Wechselpräpositionen: Bewegung vs. Ort",
    contrastLabel: "Wohin? (Akkusativ) vs. Wo? (Dativ)",
    ruleExplanation:
      "Wechselpräpositionen (an, auf, hinter, in, neben, über, unter, vor, zwischen) stehen mit dem AKKUSATIV bei einer Bewegung/Richtung (Frage: Wohin?). Bei einem festen Ort oder Stillstand stehen sie mit dem DATIV (Frage: Wo?).",
    pairs: [
      {
        id: "wp-pair-1a",
        caseType: "Akkusativ",
        question: "Wohin legst du das Buch? - Ich lege das Buch auf _____ Tisch.",
        options: ["den", "dem", "der", "das"],
        correctAnswer: "den",
        explanation: "Frage 'Wohin?' (Aktion / Bewegung) -> Akkusativ maskulin: 'auf den Tisch'."
      },
      {
        id: "wp-pair-1b",
        caseType: "Dativ",
        question: "Wo liegt das Buch jetzt? - Das Buch liegt auf _____ Tisch.",
        options: ["dem", "den", "der", "das"],
        correctAnswer: "dem",
        explanation: "Frage 'Wo?' (feste Lage / Zustand) -> Dativ maskulin: 'auf dem Tisch'."
      }
    ]
  },
  {
    id: "contrast-wechsel-2",
    theme: "Verbenpaare: stellen (Akk) vs. stehen (Dat)",
    contrastLabel: "stellen (Richtung) vs. stehen (Ort)",
    ruleExplanation:
      "'stellen' ist ein transitives Verb (Akkusativ, jemand stellt etwas wohin). 'stehen' beschreibt den resultierenden Zustand (Dativ, etwas steht wo).",
    pairs: [
      {
        id: "wp-pair-2a",
        caseType: "Akkusativ",
        question: "Er stellt die Stehlampe in _____ Ecke.",
        options: ["die", "der", "den", "dem"],
        correctAnswer: "die",
        explanation: "'stellen' beschreibt die gerichtete Bewegung (Wohin?) -> Akkusativ feminin: 'in die Ecke'."
      },
      {
        id: "wp-pair-2b",
        caseType: "Dativ",
        question: "Die Stehlampe steht jetzt in _____ Ecke.",
        options: ["der", "die", "den", "dem"],
        correctAnswer: "der",
        explanation: "'stehen' beschreibt den Ruhezustand (Wo?) -> Dativ feminin: 'in der Ecke'."
      }
    ]
  },
  {
    id: "contrast-wechsel-3",
    theme: "Verbenpaare: legen (Akk) vs. liegen (Dat)",
    contrastLabel: "legen (Richtung) vs. liegen (Ort)",
    ruleExplanation:
      "'legen' verlangt Akkusativ (Wohin legen?). 'liegen' verlangt Dativ (Wo liegen?).",
    pairs: [
      {
        id: "wp-pair-3a",
        caseType: "Akkusativ",
        question: "Die Katze legt sich unter _____ Sofa.",
        options: ["das", "dem", "den", "der"],
        correctAnswer: "das",
        explanation: "Bewegung der Katze unter das Möbelstück (Wohin?) -> Akkusativ neutral: 'unter das Sofa'."
      },
      {
        id: "wp-pair-3b",
        caseType: "Dativ",
        question: "Die Katze schläft und liegt unter _____ Sofa.",
        options: ["dem", "das", "den", "der"],
        correctAnswer: "dem",
        explanation: "Fester Schlafplatz (Wo?) -> Dativ neutral: 'unter dem Sofa'."
      }
    ]
  },

  // ================= 2. PRONOMEN: AKKUSATIV VS. DATIV =================
  {
    id: "contrast-pronouns-1",
    theme: "Personalpronomen: mich vs. mir",
    contrastLabel: "Direktes Objekt (Akk) vs. Indirektes Objekt (Dat)",
    ruleExplanation:
      "Akkusativ ('mich') steht als direktes Objekt bei Verben wie 'sehen', 'fragen', 'lieben'. Dativ ('mir') steht bei Verben des Gebens, Helfens oder Befindens ('helfen', 'danken', 'gefallen', 'Wie geht es dir?').",
    pairs: [
      {
        id: "pron-pair-1a",
        caseType: "Akkusativ",
        question: "Siehst du _____ heute Abend im Theater?",
        options: ["mich", "mir", "ich", "mein"],
        correctAnswer: "mich",
        explanation: "'sehen' verlangt ein direktes Akkusativobjekt: 'Siehst du mich?'."
      },
      {
        id: "pron-pair-1b",
        caseType: "Dativ",
        question: "Kannst du _____ bitte bei den Hausaufgaben helfen?",
        options: ["mir", "mich", "ich", "mein"],
        correctAnswer: "mir",
        explanation: "'helfen' regiert ausnahmslos den Dativ: 'Kannst du mir helfen?'."
      }
    ]
  },

  // ================= 3. KONNEKTOREN: WEIL VS. DENN VS. DESHALB =================
  {
    id: "contrast-connectors-1",
    theme: "Kausalverbindungen: weil vs. denn vs. deshalb",
    contrastLabel: "Nebensatz (weil) vs. Hauptsatz (denn) vs. Adverb (deshalb)",
    ruleExplanation:
      "'weil' leitet einen Nebensatz ein (Verb am Satzende!). 'denn' verbindet zwei Hauptsätze auf Position 0 (Verb bleibt auf Position 2). 'deshalb' ist ein Konjunktionaladverb mit Inversion (Verb folgt direkt auf Position 2).",
    pairs: [
      {
        id: "conn-pair-1a",
        caseType: "Nebensatz (Verb-Ende)",
        question: "Ich bleibe zu Hause, _____ ich krank bin.",
        options: ["weil", "denn", "deshalb", "trotzdem"],
        correctAnswer: "weil",
        explanation: "'weil' zwingt das finite Verb ('bin') an das absolute Satzende."
      },
      {
        id: "conn-pair-1b",
        caseType: "Hauptsatz (Position 0)",
        question: "Ich bleibe zu Hause, _____ ich bin krank.",
        options: ["denn", "weil", "deshalb", "obwohl"],
        correctAnswer: "denn",
        explanation: "'denn' steht auf Position 0, gefolgt von Subjekt ('ich') und Verb auf Position 2 ('bin')."
      }
    ]
  }
];
