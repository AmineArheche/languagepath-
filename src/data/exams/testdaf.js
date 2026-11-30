/**
 * src/data/exams/testdaf.js
 *
 * Official TestDaF (Test Deutsch als Fremdsprache) Examination Structure & TDN Scoring Rules
 * Reference: https://www.testdaf.de
 * All pass rules and scoring models marked verified: false until user confirmation.
 *
 * TESTDAF SCORING ARCHITECTURE:
 * Graded into TestDaF-Niveaustufen (TDN 3, 4, 5).
 * TDN 4 in all 4 sections (4x4 rule) is the universal threshold for German university admissions.
 */

export const testdafExam = {
  id: "testdaf",
  name: "TestDaF",
  institution: "TestDaF-Institut",
  verified: false,
  source: "https://www.testdaf.de",
  description:
    "The standardized academic German examination for international university applicants. Evaluates whether students possess the necessary academic language proficiency (TDN 3–5) for undergraduate and graduate studies in Germany.",
  levels: {
    B2: {
      level: "B2",
      title: "TestDaF (Akademische Hochschulprüfung)",
      subtitle: "Einstufung nach TDN-Stufen (TDN 3 - 5)",
      totalDurationMinutes: 195,
      passRules: {
        type: "testdaf_tdn",
        ruleDescription:
          "Bewertung in TestDaF-Niveaustufen (TDN 3, 4, 5). Für die uneingeschränkte Hochschulzulassung ist in der Regel mindestens TDN 4 in allen 4 Teilprüfungen (4x4) erforderlich.",
        tdnThresholds: {
          tdn5: 80, // >= 80%
          tdn4: 65, // 65-79% (Hochschulreife)
          tdn3: 50  // 50-64% (Eingeschränkte Zulassung / Studienkolleg)
        },
        verified: false,
        source: "https://www.testdaf.de"
      },
      resultLabels: [
        { label: "TDN 5 (Spitzenniveau / C1.1)", description: "Hervorragende akademische Sprachkompetenz; übertrifft die Mindestzulassung." },
        { label: "TDN 4 (Hochschulzugang / B2.2)", description: "Vollständige Erfüllung der Hochschulzulassungsvoraussetzungen (4x4)." },
        { label: "TDN 3 (Teilzulassung / B2.1)", description: "Akademische Grundkompetenz; Zulassung zu Vorbereitungskursen oder Studienkollegs." },
        { label: "Unter TDN 3", description: "Akademische Sprachkompetenz noch nicht nachgewiesen." }
      ],
      modules: [
        {
          id: "leseverstehen",
          title: "Leseverstehen",
          name: "Leseverstehen (3 Fachtexte, 30 Aufgaben)",
          durationMinutes: 60,
          points: 30,
          taskTypes: ["study_guide_matching", "journalistic_article", "scientific_paper"],
          description: "Kurztexte aus dem Hochschulalltag, journalistische Berichte und ein wissenschaftlicher Fachaufsatz.",
          parts: [
            {
              partNumber: 1,
              title: "Text 1: Lehrveranstaltungen & Seminarwahl",
              instructions: "Lesen Sie den Fachtext und beantworten Sie die Fragen.",
              text: "Interdisziplinäre Ringvorlesungen erfreuen sich an deutschen Universitäten wachsender Beliebtheit. Sie bieten Studierenden die Möglichkeit, Phänomene des Klimawandels aus physikalischer, ökonomischer und soziologischer Perspektive zeitgleich zu beleuchten...",
              questions: [
                {
                  id: "tdaf-l-1",
                  question: "Welchen methodischen Vorzug bieten Ringvorlesungen laut Text?",
                  options: [
                    "Die synchrone Betrachtung eines Themas aus multiplen Fachdisziplinen",
                    "Geringere Prüfungsanforderungen",
                    "Ausschließlich digitale Vorlesungsaufzeichnungen"
                  ],
                  correctAnswer: 0,
                  points: 15,
                  explanation: "Der Text betont die zeitgleiche Beleuchtung aus physikalischer, ökonomischer und soziologischer Perspektive."
                },
                {
                  id: "tdaf-l-2",
                  question: "An welche Zielgruppe richtet sich dieses Format primär?",
                  options: [
                    "Studierende aller Fachrichtungen mit Interesse an vernetztem Denken",
                    "Ausschließlich Doktoranden der Meteorologie",
                    "Schülerpraktikanten"
                  ],
                  correctAnswer: 0,
                  points: 15,
                  explanation: "Das Angebot fördert fächerübergreifendes, interdisziplinäres Arbeiten."
                }
              ]
            }
          ]
        },
        {
          id: "hoerverstehen",
          title: "Hörverstehen",
          name: "Hörverstehen (3 Hörtexte, 25 Aufgaben)",
          durationMinutes: 40,
          points: 25,
          taskTypes: ["campus_dialogue", "radio_interview", "academic_lecture"],
          description: "Campus-Alltagsdialog (1x hören), Radiointerview (1x hören) und Vorlesungsmitschnitt (2x hören).",
          parts: [
            {
              partNumber: 1,
              title: "Teil 1: Sprechstunde beim Studienberater",
              instructions: "Hören Sie das Gespräch und wählen Sie die richtige Antwort.",
              questions: [
                {
                  id: "tdaf-h-1",
                  question: "Welche Frist muss die Studentin für die BAföG-Verlängerung wahren?",
                  options: ["Bis zum 15. Juli", "Bis zum 30. September", "Bis zum Semesterbeginn"],
                  correctAnswer: 0,
                  points: 25,
                  explanation: "Der Berater nennt den 15. Juli als Ausschlussfrist."
                }
              ]
            }
          ]
        },
        {
          id: "schriftlicher_ausdruck",
          title: "Schreiben",
          name: "Schriftlicher Ausdruck (Grafikbeschreibung & Erörterung)",
          durationMinutes: 60,
          points: 25,
          taskTypes: ["statistical_graph_analysis", "academic_argumentation"],
          description: "Strukturierte Grafikbeschreibung (Daten trends, Maxima) und dialektische Argumentation zu einem Hochschulthema.",
          tasks: [
            {
              id: "tdaf-w-1",
              title: "Akademischer Essay: Studiengebühren an staatlichen Hochschulen",
              instructions: "Beschreiben Sie die statistischen Daten und erörtern Sie Argumente für und wider Studienbeiträge (mind. 200 Wörter).",
              suggestedWordCount: 200,
              promptBulletPoints: [
                "Einführung in die Fragestellung und Bezug zur Grafik",
                "Präzise Beschreibung der Eckdaten und Tendenzen",
                "Gegenüberstellung von Pro- und Contra-Argumenten",
                "Situation im Heimatland und persönliche begründete Stellungnahme"
              ]
            }
          ]
        },
        {
          id: "muendlicher_ausdruck",
          title: "Sprechen",
          name: "Mündlicher Ausdruck (7 computergestützte Aufgaben)",
          durationMinutes: 35,
          points: 25,
          taskTypes: ["study_consultation", "graph_interpretation", "debate_contribution"],
          description: "7 computergestützte Sprechsituationen mit strikten Vorbereitungs- und Sprechzeiten.",
          parts: [
            {
              partNumber: 1,
              title: "Aufgabe 4: Stellungnahme in einer universitären Diskussion",
              promptAudio: "In einem Seminar diskutieren Ihre Kommilitonen über die Einführung einer Anwesenheitspflicht. Bitte nehmen Sie begründet Stellung.",
              guidelines: [
                "Vor- und Nachteile von Anwesenheitspflichten abwägen",
                "Auswirkungen auf eigenverantwortliches Lernen darstellen",
                "Einen realistischen Kompromissvorschlag formulieren"
              ],
              modelAnswer: "Ich vertrete die Auffassung, dass die Universität in erster Linie ein Ort eigenverantwortlichen wissenschaftlichen Arbeitens sein sollte..."
            }
          ]
        }
      ]
    },

    C1: {
      level: "C1",
      title: "TestDaF (Spitzenniveau TDN 5 / C1 Stub)",
      subtitle: "Akademische Spitzenqualifikation",
      totalDurationMinutes: 195,
      passRules: {
        type: "testdaf_tdn",
        ruleDescription: "TDN 5 in allen Teilbereichen (C1.1)",
        tdnThresholds: { tdn5: 80, tdn4: 65, tdn3: 50 },
        verified: false,
        source: "https://www.testdaf.de"
      },
      resultLabels: [
        { label: "TDN 5 Exzellenz erreicht", description: "Uneingeschränkte Eignung für Promotionsstudiengänge." }
      ],
      modules: [
        { id: "leseverstehen", title: "Lesen", name: "Leseverstehen (TDN 5)", durationMinutes: 60, points: 30, parts: [] },
        { id: "hoerverstehen", title: "Hören", name: "Hörverstehen (TDN 5)", durationMinutes: 40, points: 25, parts: [] },
        { id: "schriftlicher_ausdruck", title: "Schreiben", name: "Schreiben (TDN 5)", durationMinutes: 60, points: 25, tasks: [] },
        { id: "muendlicher_ausdruck", title: "Sprechen", name: "Sprechen (TDN 5)", durationMinutes: 35, points: 25, parts: [] }
      ]
    }
  }
};
