/**
 * src/data/exams/goethe.js
 *
 * Official Goethe-Institut Examination Structure & Scoring Rules
 * Reference: https://www.goethe.de/pro/relaunch/prf/de/Pruefungsordnung.pdf
 * All pass rules and scoring models marked verified: false until user confirmation.
 */

import examMockData from "../examMockData.json";

const a1Mock = examMockData.find((e) => e.level === "A1")?.modules || {};
const a2Mock = examMockData.find((e) => e.level === "A2")?.modules || {};
const b1Mock = examMockData.find((e) => e.level === "B1")?.modules || {};
const b2Mock = examMockData.find((e) => e.level === "B2")?.modules || {};

export const goetheExam = {
  id: "goethe",
  name: "Goethe-Zertifikat",
  institution: "Goethe-Institut",
  verified: false,
  source: "https://www.goethe.de/pro/relaunch/prf/de/Pruefungsordnung.pdf",
  description:
    "Globally recognized German certification by the Goethe-Institut for residence, university admissions, and international career recognition.",
  levels: {
    A1: {
      level: "A1",
      title: "Goethe-Zertifikat A1: Start Deutsch 1",
      subtitle: "Offizielles Modellprüfungsformat",
      totalDurationMinutes: 65,
      passRules: {
        type: "overall_percentage",
        minPercentage: 60,
        passScore: 60,
        maxScore: 100,
        ruleDescription: "Mindestens 60 von 100 Punkten (60%) insgesamt erforderlich.",
        verified: false,
        source: "https://www.goethe.de/pro/relaunch/prf/de/Goethe-Zertifikat_A1_SD1_Modellsatz.pdf"
      },
      resultLabels: [
        { minPercentage: 90, label: "Sehr gut" },
        { minPercentage: 80, label: "Gut" },
        { minPercentage: 70, label: "Befriedigend" },
        { minPercentage: 60, label: "Ausreichend" },
        { minPercentage: 0, label: "Nicht bestanden" }
      ],
      modules: [
        {
          id: "lesen",
          title: "Lesen",
          name: "Leseverstehen",
          durationMinutes: 25,
          points: 25,
          taskTypes: ["personal_emails", "classified_ads", "public_signs"],
          description: "Kurze persönliche E-Mails, Anzeigen und Schilder im Alltag verstehen.",
          ...a1Mock.lesen
        },
        {
          id: "hoeren",
          title: "Hören",
          name: "Hörverstehen",
          durationMinutes: 20,
          points: 25,
          taskTypes: ["short_dialogues", "public_announcements", "telephone_messages"],
          description: "Alltagsgespräche, Durchsagen und Telefonnachrichten verstehen.",
          ...a1Mock.hoeren
        },
        {
          id: "schreiben",
          title: "Schreiben",
          name: "Schriftlicher Ausdruck",
          durationMinutes: 15,
          points: 25,
          taskTypes: ["form_filling", "short_email"],
          description: "Formular ausfüllen und eine kurze persönliche Notiz verfassen.",
          ...a1Mock.schreiben
        },
        {
          id: "sprechen",
          title: "Sprechen",
          name: "Mündliche Prüfung",
          durationMinutes: 15,
          points: 25,
          taskTypes: ["introduction", "information_request", "polite_requests"],
          description: "Sich vorstellen, einfache Fragen stellen und Bitten formulieren.",
          ...a1Mock.sprechen
        }
      ]
    },

    A2: {
      level: "A2",
      title: "Goethe-Zertifikat A2",
      subtitle: "Offizielles Modellprüfungsformat",
      totalDurationMinutes: 105,
      passRules: {
        type: "overall_percentage",
        minPercentage: 60,
        passScore: 60,
        maxScore: 100,
        ruleDescription: "Mindestens 60 von 100 Punkten (60%) insgesamt erforderlich.",
        verified: false,
        source: "https://www.goethe.de/pro/relaunch/prf/de/Goethe-Zertifikat_A2_Modellsatz.pdf"
      },
      resultLabels: [
        { minPercentage: 90, label: "Sehr gut" },
        { minPercentage: 80, label: "Gut" },
        { minPercentage: 70, label: "Befriedigend" },
        { minPercentage: 60, label: "Ausreichend" },
        { minPercentage: 0, label: "Nicht bestanden" }
      ],
      modules: [
        {
          id: "lesen",
          title: "Lesen",
          name: "Leseverstehen",
          durationMinutes: 30,
          points: 25,
          taskTypes: ["newspaper_reports", "website_navigation", "formal_emails"],
          description: "Artikel, Anzeigen und Briefe zu vertrauten Themen verstehen.",
          ...a2Mock.lesen
        },
        {
          id: "hoeren",
          title: "Hören",
          name: "Hörverstehen",
          durationMinutes: 30,
          points: 25,
          taskTypes: ["radio_announcements", "conversations", "interviews"],
          description: "Alltagsgespräche, Radiobeiträge und Durchsagen im Detail verstehen.",
          ...a2Mock.hoeren
        },
        {
          id: "schreiben",
          title: "Schreiben",
          name: "Schriftlicher Ausdruck",
          durationMinutes: 30,
          points: 25,
          taskTypes: ["social_message", "formal_email"],
          description: "Kurze Mitteilungen und eine persönliche E-Mail mit Redemitteln verfassen.",
          ...a2Mock.schreiben
        },
        {
          id: "sprechen",
          title: "Sprechen",
          name: "Mündliche Prüfung",
          durationMinutes: 15,
          points: 25,
          taskTypes: ["anecdote", "joint_planning"],
          description: "Über das Wochenende berichten und gemeinsam einen Ausflug planen.",
          ...a2Mock.sprechen
        }
      ]
    },

    B1: {
      level: "B1",
      title: "Goethe-Zertifikat B1",
      subtitle: "Modulare Modellprüfung (4 unabhängige Module)",
      totalDurationMinutes: 165,
      passRules: {
        type: "modular_independent",
        minPercentage: 60,
        passScore: 60,
        maxScore: 100,
        ruleDescription: "Modulare Prüfung: Jedes Modul erfordert mindestens 60% (15 von 25 Pkt) zum Bestehen.",
        verified: false,
        source: "https://www.goethe.de/pro/relaunch/prf/de/Goethe-Zertifikat_B1_Pruefungsordnung.pdf"
      },
      resultLabels: [
        { minPercentage: 90, label: "Sehr gut" },
        { minPercentage: 80, label: "Gut" },
        { minPercentage: 70, label: "Befriedigend" },
        { minPercentage: 60, label: "Ausreichend" },
        { minPercentage: 0, label: "Nicht bestanden" }
      ],
      modules: [
        {
          id: "lesen",
          title: "Lesen",
          name: "Leseverstehen",
          durationMinutes: 65,
          points: 25,
          taskTypes: ["blog_articles", "press_texts", "advertisements", "opinion_comments"],
          description: "Umfangreiche Sachtexte, Kommentare und Richtlinien verstehen.",
          ...b1Mock.lesen
        },
        {
          id: "hoeren",
          title: "Hören",
          name: "Hörverstehen",
          durationMinutes: 40,
          points: 25,
          taskTypes: ["news_broadcasts", "presentations", "discussions"],
          description: "Längere Vorträge, Diskussionen und Radiosendungen verstehen.",
          ...b1Mock.hoeren
        },
        {
          id: "schreiben",
          title: "Schreiben",
          name: "Schriftlicher Ausdruck",
          durationMinutes: 60,
          points: 25,
          taskTypes: ["personal_email", "forum_comment", "formal_letter"],
          description: "Drei Texte: Persönliche E-Mail, Forumsbeitrag und formelle Entschuldigung.",
          ...b1Mock.schreiben
        },
        {
          id: "sprechen",
          title: "Sprechen",
          name: "Mündliche Prüfung",
          durationMinutes: 15,
          points: 25,
          taskTypes: ["presentation", "joint_event_planning"],
          description: "Präsentation zu einem Alltagsthema halten und auf Fragen reagieren.",
          ...b1Mock.sprechen
        }
      ]
    },

    B2: {
      level: "B2",
      title: "Goethe-Zertifikat B2",
      subtitle: "Modulare Prüfung für Studium und Beruf",
      totalDurationMinutes: 195,
      passRules: {
        type: "modular_independent",
        minPercentage: 60,
        passScore: 60,
        maxScore: 100,
        ruleDescription: "Modulare Prüfung: Jedes Modul erfordert mindestens 60% zum Bestehen.",
        verified: false,
        source: "https://www.goethe.de/pro/relaunch/prf/de/Goethe-Zertifikat_B2_Pruefungsordnung.pdf"
      },
      resultLabels: [
        { minPercentage: 90, label: "Sehr gut" },
        { minPercentage: 80, label: "Gut" },
        { minPercentage: 70, label: "Befriedigend" },
        { minPercentage: 60, label: "Ausreichend" },
        { minPercentage: 0, label: "Nicht bestanden" }
      ],
      modules: [
        {
          id: "lesen",
          title: "Lesen",
          name: "Leseverstehen",
          durationMinutes: 65,
          points: 25,
          taskTypes: ["editorial_articles", "scientific_excerpts", "regulations"],
          description: "Anspruchsvolle Kommentare, Fachartikel und Standpunkte erfassen.",
          ...b2Mock.lesen
        },
        {
          id: "hoeren",
          title: "Hören",
          name: "Hörverstehen",
          durationMinutes: 40,
          points: 25,
          taskTypes: ["interviews", "academic_talks", "panel_discussions"],
          description: "Komplexe Gespräche, Vorträge und Meinungsstreits verstehen.",
          ...b2Mock.hoeren
        },
        {
          id: "schreiben",
          title: "Schreiben",
          name: "Schriftlicher Ausdruck",
          durationMinutes: 75,
          points: 25,
          taskTypes: ["discursive_essay", "formal_workplace_letter"],
          description: "Differenzierte Stellungnahme und formelle geschäftliche Nachricht.",
          ...b2Mock.schreiben
        },
        {
          id: "sprechen",
          title: "Sprechen",
          name: "Mündliche Prüfung",
          durationMinutes: 15,
          points: 25,
          taskTypes: ["monologue_vortrag", "controversial_discussion"],
          description: "Strukturierter Vortrag und argumentative Diskussion.",
          ...b2Mock.sprechen
        }
      ]
    },

    C1: {
      level: "C1",
      title: "Goethe-Zertifikat C1",
      subtitle: "Fach- & Hochschulreife Nachweis (Stub)",
      totalDurationMinutes: 205,
      passRules: {
        type: "modular_independent",
        minPercentage: 60,
        passScore: 60,
        maxScore: 100,
        ruleDescription: "C1 Modulare Prüfung: Jedes Modul erfordert mindestens 60% zum Bestehen.",
        verified: false,
        source: "https://www.goethe.de/pro/relaunch/prf/de/Goethe-Zertifikat_C1_Pruefungsordnung.pdf"
      },
      resultLabels: [
        { minPercentage: 90, label: "Sehr gut" },
        { minPercentage: 80, label: "Gut" },
        { minPercentage: 70, label: "Befriedigend" },
        { minPercentage: 60, label: "Ausreichend" },
        { minPercentage: 0, label: "Nicht bestanden" }
      ],
      modules: [
        {
          id: "lesen",
          title: "Lesen",
          name: "Leseverstehen (C1)",
          durationMinutes: 70,
          points: 25,
          taskTypes: ["scientific_essays", "literary_excerpts"],
          description: "Komplexe wissenschaftliche und gesellschaftspolitische Abhandlungen erfassen.",
          parts: [
            {
              partNumber: 1,
              title: "Teil 1: Wissenschaftlicher Fachtext",
              instructions: "Lesen Sie den Text und beantworten Sie die Multiple-Choice-Fragen.",
              text: "Die Digitalisierung der Hochschullehre eröffnet neue epistemische Zugänge, birgt jedoch die Gefahr einer Fragmentierung des Diskurses...",
              questions: [
                {
                  id: "c1-l-1",
                  question: "Welche Kernhypothese vertritt der Autor bezüglich digitaler Lehrformate?",
                  options: [
                    "Sie ersetzen die Präsenzuniversität vollständig",
                    "Sie erweitern Zugänge, erfordern jedoch neue didaktische Rahmungen",
                    "Sie mindern nachweislich das kognitive Leistungsvermögen"
                  ],
                  correctAnswer: 1,
                  points: 12.5,
                  explanation: "Der Autor betont die komplementäre Funktion bei didaktischer Neukonzeption."
                },
                {
                  id: "c1-l-2",
                  question: "Worin besteht die genannte 'Fragmentierung des Diskurses'?",
                  options: [
                    "In der asynchronen Vereinzelung von Studierenden ohne Diskussionsraum",
                    "In technischen Serverausfällen",
                    "In mangelnden fremdsprachlichen Kompetenzen"
                  ],
                  correctAnswer: 0,
                  points: 12.5,
                  explanation: "Asynchrone Isolation verringert kollaborative Diskurse."
                }
              ]
            }
          ]
        },
        {
          id: "hoeren",
          title: "Hören",
          name: "Hörverstehen (C1)",
          durationMinutes: 40,
          points: 25,
          taskTypes: ["academic_colloquium", "radio_feature"],
          description: "Anspruchsvolle Fachvorträge und Podiumsdiskussionen im Originaltempo verstehen.",
          parts: [
            {
              partNumber: 1,
              title: "Teil 1: Radiofeature zu erneuerbaren Energien",
              instructions: "Hören Sie den Beitrag und markieren Sie die richtige Option.",
              questions: [
                {
                  id: "c1-h-1",
                  question: "Welche Herausforderung bei der Netzstabilität wird hervorgehoben?",
                  options: ["Mangelnde Speicherkapazitäten", "Hohe Leitungsverluste", "Bürokratische Hürden"],
                  correctAnswer: 0,
                  points: 12.5,
                  explanation: "Die Speicherkapazität ist der kritische Engpass bei Volatilität."
                },
                {
                  id: "c1-h-2",
                  question: "Welchen Lösungsansatz empfiehlt die Expertin?",
                  options: ["Wasserstoffbasierte Langzeitspeicher", "Rückkehr zu Kernenergie", "Drosselung der Industrie"],
                  correctAnswer: 0,
                  points: 12.5,
                  explanation: "Wasserstoff fungiert als saisonaler Speicher."
                }
              ]
            }
          ]
        },
        {
          id: "schreiben",
          title: "Schreiben",
          name: "Schriftlicher Ausdruck (C1)",
          durationMinutes: 80,
          points: 25,
          taskTypes: ["critical_essay", "statistical_commentary"],
          description: "Verfassen eines elaborierten Essays mit Gegenüberstellung dialektischer Argumente.",
          tasks: [
            {
              id: "c1-w-1",
              title: "Freie Erörterung: Künstliche Intelligenz im akademischen Publizieren",
              instructions: "Verfassen Sie einen wohlstrukturierten Aufsatz (mind. 250 Wörter).",
              suggestedWordCount: 250,
              promptBulletPoints: [
                "Einfluss von generativer KI auf wissenschaftliche Redlichkeit",
                "Chancen für Effizienzsteigerung bei Literaturrecherchen",
                "Notwendige regulatorische Leitlinien für Forschungsinstitute",
                "Eigene begründete Schlussfolgerung"
              ]
            }
          ]
        },
        {
          id: "sprechen",
          title: "Sprechen",
          name: "Mündliche Prüfung (C1)",
          durationMinutes: 15,
          points: 25,
          taskTypes: ["academic_presentation", "collegial_debate"],
          description: "Akademischer Vortrag mit anschließender Fachdiskussion.",
          parts: [
            {
              partNumber: 1,
              title: "Vortrag: Ethik und Verantwortung in der biotechnologischen Forschung",
              promptAudio: "Bitte halten Sie einen 4-minütigen Vortrag über bioethische Grundsätze.",
              guidelines: [
                "Definition des Spannungsfeldes zwischen Innovation und Vorsorgeprinzip",
                "Beispiele aus der Geneditierung (CRISPR)",
                "Internationale Standardisierung",
                "Persönliche ethische Bewertung"
              ],
              modelAnswer: "Die exponentielle Entwicklung biotechnologischer Verfahren wie CRISPR-Cas9 zwingt uns zu einer kontinuierlichen ethischen Reflexion..."
            }
          ]
        }
      ]
    }
  }
};
