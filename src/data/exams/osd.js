/**
 * src/data/exams/osd.js
 *
 * Official ÖSD (Österreichisches Sprachdiplom Deutsch) Examination Structure
 * Reference: https://www.osd.at/pruefungen/
 * All pass rules and scoring models marked verified: false until user confirmation.
 */

export const osdExam = {
  id: "osd",
  name: "ÖSD",
  institution: "Österreichisches Sprachdiplom Deutsch",
  verified: false,
  source: "https://www.osd.at/pruefungen/",
  description:
    "Austrian language diploma with focus on pluricentric German (standard varieties in Austria, Germany, and Switzerland). Recognized for visa, settlement, and higher education in Austria, Germany, and Switzerland.",
  levels: {
    A1: {
      level: "A1",
      title: "ÖSD Zertifikat A1",
      subtitle: "Grundstufe Deutsch 1",
      totalDurationMinutes: 70,
      passRules: {
        type: "separate_written_oral",
        minPercentage: 60,
        passScore: 60,
        maxScore: 100,
        writtenOralSeparate: true,
        minWrittenPercentage: 50,
        minOralPercentage: 60,
        ruleDescription: "Schriftlich (mind. 50%) und Mündlich (mind. 60%) müssen beide bestanden werden.",
        verified: false,
        source: "https://www.osd.at"
      },
      resultLabels: [
        { minPercentage: 90, label: "Mit sehr gutem Erfolg bestanden" },
        { minPercentage: 80, label: "Mit gutem Erfolg bestanden" },
        { minPercentage: 60, label: "Bestanden" },
        { minPercentage: 0, label: "Nicht bestanden" }
      ],
      modules: [
        {
          id: "lesen",
          title: "Lesen",
          name: "Leseverstehen (ÖSD A1)",
          durationMinutes: 25,
          points: 30,
          taskTypes: ["personal_notices", "signs"],
          description: "Alltagsnachrichten und Broschüren aus Österreich und Deutschland verstehen.",
          parts: [
            {
              partNumber: 1,
              title: "Teil 1: Wiener Stadtinformation",
              instructions: "Lesen Sie die Information und beantworten Sie die Frage.",
              text: "Öffnungszeiten Tiergarten Schönbrunn: Täglich ab 9:00 Uhr geöffnet. Kinder unter 6 Jahren haben freien Eintritt. Hunde sind im Schlosspark nicht erlaubt.",
              questions: [
                {
                  id: "osd-a1-l-1",
                  question: "Ab wie viel Uhr kann man den Zoo besuchen?",
                  options: ["Ab 8:00 Uhr", "Ab 9:00 Uhr", "Ab 10:00 Uhr"],
                  correctAnswer: 1,
                  points: 30,
                  explanation: "Geöffnet täglich ab 9:00 Uhr."
                }
              ]
            }
          ]
        },
        {
          id: "hoeren",
          title: "Hören",
          name: "Hörverstehen (ÖSD A1)",
          durationMinutes: 15,
          points: 30,
          taskTypes: ["announcements"],
          description: "Durchsagen und Alltagsgespräche erfassen.",
          parts: [
            {
              partNumber: 1,
              title: "Teil 1: Durchsage am Wiener Hauptbahnhof",
              instructions: "Hören Sie die Durchsage.",
              questions: [
                {
                  id: "osd-a1-h-1",
                  question: "Wohin fährt der Railjet auf Bahnsteig 3?",
                  options: ["Nach Salzburg", "Nach Graz", "Nach Innsbruck"],
                  correctAnswer: 0,
                  points: 30,
                  explanation: "Der Railjet fährt nach Salzburg."
                }
              ]
            }
          ]
        },
        {
          id: "schreiben",
          title: "Schreiben",
          name: "Schriftlicher Ausdruck (ÖSD A1)",
          durationMinutes: 20,
          points: 15,
          taskTypes: ["form_filling", "short_email"],
          description: "Ein Formular ausfüllen und eine kurze persönliche E-Mail schreiben.",
          tasks: [
            {
              id: "osd-a1-w-1",
              title: "Hotelanfrage Salzburg",
              instructions: "Schreiben Sie eine kurze Anfrage (ca. 25 Wörter) an die Rezeption.",
              suggestedWordCount: 25,
              promptBulletPoints: ["Anreisedatum", "Zimmer für 2 Personen", "Frühstück inklusive?"]
            }
          ]
        },
        {
          id: "sprechen",
          title: "Sprechen",
          name: "Mündliche Prüfung (ÖSD A1)",
          durationMinutes: 10,
          points: 25,
          taskTypes: ["self_introduction", "role_play"],
          description: "Sich vorstellen und in einem einfachen Alltagsgespräch Auskunft geben.",
          parts: [
            {
              partNumber: 1,
              title: "Sich vorstellen",
              promptAudio: "Grüß Gott! Bitte stellen Sie sich kurz vor.",
              guidelines: ["Name", "Wohnort", "Beruf", "Hobbys"],
              modelAnswer: "Grüß Gott! Mein Name ist Thomas, ich wohne in Wien und arbeite als Koch."
            }
          ]
        }
      ]
    },

    A2: {
      level: "A2",
      title: "ÖSD Zertifikat A2",
      subtitle: "Grundstufe Deutsch 2",
      totalDurationMinutes: 85,
      passRules: {
        type: "separate_written_oral",
        minPercentage: 60,
        passScore: 60,
        maxScore: 100,
        writtenOralSeparate: true,
        minWrittenPercentage: 50,
        minOralPercentage: 60,
        ruleDescription: "Schriftlich (mind. 50%) und Mündlich (mind. 60%) müssen beide getrennt bestanden werden.",
        verified: false,
        source: "https://www.osd.at"
      },
      resultLabels: [
        { minPercentage: 90, label: "Mit sehr gutem Erfolg bestanden" },
        { minPercentage: 80, label: "Mit gutem Erfolg bestanden" },
        { minPercentage: 60, label: "Bestanden" },
        { minPercentage: 0, label: "Nicht bestanden" }
      ],
      modules: [
        {
          id: "lesen",
          title: "Lesen",
          name: "Leseverstehen (ÖSD A2)",
          durationMinutes: 30,
          points: 30,
          taskTypes: ["local_reports", "brochures"],
          description: "Berichte und Anzeigen aus dem österreichischen Raum verstehen.",
          parts: []
        },
        {
          id: "hoeren",
          title: "Hören",
          name: "Hörverstehen (ÖSD A2)",
          durationMinutes: 20,
          points: 30,
          taskTypes: ["radio_announcements"],
          description: "Mitteilungen und Radiomeldungen erfassen.",
          parts: []
        },
        {
          id: "schreiben",
          title: "Schreiben",
          name: "Schriftlicher Ausdruck (ÖSD A2)",
          durationMinutes: 20,
          points: 15,
          taskTypes: ["personal_message"],
          description: "Verfassen einer persönlichen Mitteilung.",
          tasks: []
        },
        {
          id: "sprechen",
          title: "Sprechen",
          name: "Mündliche Prüfung (ÖSD A2)",
          durationMinutes: 15,
          points: 25,
          taskTypes: ["colloquial_exchange"],
          description: "Gespräch über vertraute Situationen führen.",
          parts: []
        }
      ]
    },

    B1: {
      level: "B1",
      title: "ÖSD Zertifikat B1",
      subtitle: "Zertifikat Deutsch (Gemeinschaftsprüfung mit Goethe)",
      totalDurationMinutes: 165,
      passRules: {
        type: "modular_independent",
        minPercentage: 60,
        passScore: 60,
        maxScore: 100,
        ruleDescription: "Jedes Modul (Lesen, Hören, Schreiben, Sprechen) erfordert 60% zum Bestehen.",
        verified: false,
        source: "https://www.osd.at"
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
          name: "Leseverstehen (ÖSD B1)",
          durationMinutes: 65,
          points: 25,
          taskTypes: ["articles", "comments"],
          description: "Texte zu gesellschaftlichen und alltäglichen Themen erfassen.",
          parts: [
            {
              partNumber: 1,
              title: "Teil 1: Umweltinitiativen in Alpenregionen",
              instructions: "Lesen Sie den Text und entscheiden Sie: Richtig oder Falsch?",
              text: "Sanfter Tourismus gewinnt in Tirol an Zuspruch. Wanderer nutzen zunehmend öffentliche Shuttlebusse statt Privatfahrzeuge...",
              questions: [
                {
                  id: "osd-b1-l-1",
                  question: "Der Tourismusverband fördert die Anreise mit Shuttlebussen.",
                  options: ["Richtig", "Falsch"],
                  correctAnswer: 0,
                  points: 25,
                  explanation: "Der Text betont die Förderung öffentlicher Shuttles."
                }
              ]
            }
          ]
        },
        {
          id: "hoeren",
          title: "Hören",
          name: "Hörverstehen (ÖSD B1)",
          durationMinutes: 40,
          points: 25,
          taskTypes: ["interviews", "discussions"],
          description: "Radiosendungen und Interviews mit österreichischer und schweizerischer Färbung verstehen.",
          parts: []
        },
        {
          id: "schreiben",
          title: "Schreiben",
          name: "Schriftlicher Ausdruck (ÖSD B1)",
          durationMinutes: 60,
          points: 25,
          taskTypes: ["forum_post", "personal_letter"],
          description: "Meinungsäußerung im Diskussionsforum und persönliches Schreiben.",
          tasks: []
        },
        {
          id: "sprechen",
          title: "Sprechen",
          name: "Mündliche Prüfung (ÖSD B1)",
          durationMinutes: 15,
          points: 25,
          taskTypes: ["presentation", "agreement"],
          description: "Vortrag über ein Thema und gemeinsame Absprachen treffen.",
          parts: []
        }
      ]
    },

    B2: {
      level: "B2",
      title: "ÖSD Zertifikat B2",
      subtitle: "Mittelstufe Deutsch",
      totalDurationMinutes: 195,
      passRules: {
        type: "separate_written_oral",
        minPercentage: 60,
        passScore: 60,
        maxScore: 100,
        writtenOralSeparate: true,
        minWrittenPercentage: 60,
        minOralPercentage: 60,
        ruleDescription: "Schriftliche (Lesen, Hören, Schreiben) und Mündliche Prüfung separat mit 60% bestehen.",
        verified: false,
        source: "https://www.osd.at"
      },
      resultLabels: [
        { minPercentage: 90, label: "Mit sehr gutem Erfolg bestanden" },
        { minPercentage: 80, label: "Mit gutem Erfolg bestanden" },
        { minPercentage: 60, label: "Bestanden" },
        { minPercentage: 0, label: "Nicht bestanden" }
      ],
      modules: [
        {
          id: "lesen",
          title: "Lesen",
          name: "Leseverstehen (ÖSD B2)",
          durationMinutes: 65,
          points: 25,
          taskTypes: ["reports", "analyses"],
          description: "Anspruchsvolle feuilletonistische und fachliche Texte verstehen.",
          parts: []
        },
        {
          id: "hoeren",
          title: "Hören",
          name: "Hörverstehen (ÖSD B2)",
          durationMinutes: 40,
          points: 25,
          taskTypes: ["panel_debates"],
          description: "Vorträge und Rundfunkbeiträge plurizentrischer Varietäten verstehen.",
          parts: []
        },
        {
          id: "schreiben",
          title: "Schreiben",
          name: "Schriftlicher Ausdruck (ÖSD B2)",
          durationMinutes: 75,
          points: 25,
          taskTypes: ["formal_statement", "essay"],
          description: "Verfassen einer fundierten Stellungnahme.",
          tasks: []
        },
        {
          id: "sprechen",
          title: "Sprechen",
          name: "Mündliche Prüfung (ÖSD B2)",
          durationMinutes: 15,
          points: 25,
          taskTypes: ["colloquium"],
          description: "Strukturierte Argumentation und spontane Reaktionen im Dialog.",
          parts: []
        }
      ]
    },

    C1: {
      level: "C1",
      title: "ÖSD Zertifikat C1 (Stub)",
      subtitle: "Oberstufe Deutsch",
      totalDurationMinutes: 205,
      passRules: {
        type: "separate_written_oral",
        minPercentage: 60,
        passScore: 60,
        maxScore: 100,
        writtenOralSeparate: true,
        minWrittenPercentage: 60,
        minOralPercentage: 60,
        ruleDescription: "C1 Prüfung: Schriftlich und Mündlich getrennt mit jeweils 60% bestehen.",
        verified: false,
        source: "https://www.osd.at"
      },
      resultLabels: [
        { minPercentage: 90, label: "Sehr gut" },
        { minPercentage: 80, label: "Gut" },
        { minPercentage: 60, label: "Bestanden" },
        { minPercentage: 0, label: "Nicht bestanden" }
      ],
      modules: [
        { id: "lesen", title: "Lesen", name: "Leseverstehen C1", durationMinutes: 70, points: 25, parts: [] },
        { id: "hoeren", title: "Hören", name: "Hörverstehen C1", durationMinutes: 40, points: 25, parts: [] },
        { id: "schreiben", title: "Schreiben", name: "Schriftlicher Ausdruck C1", durationMinutes: 80, points: 25, tasks: [] },
        { id: "sprechen", title: "Sprechen", name: "Mündliche Prüfung C1", durationMinutes: 15, points: 25, parts: [] }
      ]
    }
  }
};
