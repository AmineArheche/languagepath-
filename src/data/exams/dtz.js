/**
 * src/data/exams/dtz.js
 *
 * Official DTZ (Deutsch-Test für Zuwanderer) Examination Structure & Dual Scaled Rules
 * Reference: https://www.bamf.de/DE/Themen/Integration/ZugewanderteTeilnehmende/Integrationskurse/Abschlusspruefung/abschlusspruefung-node.html
 * All pass rules and scoring models marked verified: false until user confirmation.
 *
 * KEY DTZ CRITERIA (BAMF Integration Exam):
 * Dual-level scale (A2 / B1 combined).
 * To achieve B1: Must reach B1 in Sprechen AND B1 in at least one written section (Hören/Lesen OR Schreiben).
 * To achieve A2: Must reach A2 in Sprechen AND A2 in at least one written section.
 * Below A2: "Unter A2".
 */

export const dtzExam = {
  id: "dtz",
  name: "DTZ (Deutsch-Test für Zuwanderer)",
  institution: "BAMF / telc gGmbH",
  verified: false,
  source:
    "https://www.bamf.de/DE/Themen/Integration/ZugewanderteTeilnehmende/Integrationskurse/Abschlusspruefung/abschlusspruefung-node.html",
  description:
    "Official final examination of the German integration courses by the Federal Office for Migration and Refugees (BAMF). Dually scales candidates to level A2 or B1.",
  levels: {
    // DTZ is inherently a combined A2-B1 test; we offer both B1 target and A2 target views
    B1: {
      level: "B1",
      title: "Deutsch-Test für Zuwanderer (Ziel: B1 Zertifikat)",
      subtitle: "BAMF Skalierte Integrationsprüfung A2-B1",
      totalDurationMinutes: 100,
      passRules: {
        type: "dtz_combined",
        targetLevel: "B1",
        ruleDescription:
          "B1-Zertifikat erfordert: B1 im Mündlichen (Sprechen) UND B1 in mindestens einem schriftlichen Teil (Hören/Lesen ODER Schreiben).",
        thresholds: {
          hoeren_lesen: { b1: 33, a2: 20, max: 45 },
          schreiben: { b1: 15, a2: 10, max: 20 },
          sprechen: { b1: 75, a2: 50, max: 100 }
        },
        verified: false,
        source: "https://www.bamf.de"
      },
      resultLabels: [
        { label: "B1 Gesamtzertifikat erreicht", description: "Voraussetzung für Einbürgerung und Niederlassungserlaubnis erfüllt." },
        { label: "A2 Zertifikat erreicht", description: "Teilnachweis A2 erworben; Wiederholung zur B1-Einstufung möglich." },
        { label: "Unter A2", description: "Mindestanforderungen für A2 nicht erreicht." }
      ],
      modules: [
        {
          id: "hoeren_lesen",
          title: "Hören & Lesen",
          name: "Hören und Lesen kombiniert (45 Aufgaben)",
          durationMinutes: 45,
          points: 45,
          taskTypes: ["public_messages", "classifieds", "consumer_notices"],
          description: "Alltägliche Durchsagen, Telefonauskünfte, Mietverträge und Arbeitsanzeigen.",
          parts: [
            {
              partNumber: 1,
              title: "Teil 1: Wohnungs- und Nachbarschaftsmeldung",
              instructions: "Lesen Sie den Aushang im Treppenhaus und beantworten Sie die Fragen.",
              text: "Liebe Hausgemeinschaft,\nam kommenden Dienstag, den 14. November, werden zwischen 9:00 und 14:00 Uhr die Hauptwasserleitungen gewartet. In diesem Zeitraum wird das Kalt- und Warmwasser vollständig abgestellt. Bitte halten Sie alle Wasserhähne geschlossen.\nDie Hausverwaltung",
              questions: [
                {
                  id: "dtz-hl-1",
                  question: "Was müssen die Bewohner am Dienstag beachten?",
                  options: [
                    "Das Wasser ist von 9 bis 14 Uhr abgestellt",
                    "Die Heizung wird dauerhaft repariert",
                    "Der Fahrstuhl steht still"
                  ],
                  correctAnswer: 0,
                  points: 22.5,
                  explanation: "Im Aushang steht: Kalt- und Warmwasser wird von 9:00 bis 14:00 Uhr abgestellt."
                },
                {
                  id: "dtz-hl-2",
                  question: "Welche Vorsichtsmaßnahme bittet die Hausverwaltung einzuhalten?",
                  options: [
                    "Alle Wasserhähne geschlossen halten",
                    "Das Haus komplett verlassen",
                    "Den Hausmeister anrufen"
                  ],
                  correctAnswer: 0,
                  points: 22.5,
                  explanation: "Ausdrückliche Anweisung: 'Bitte halten Sie alle Wasserhähne geschlossen.'"
                }
              ]
            }
          ]
        },
        {
          id: "schreiben",
          title: "Schreiben",
          name: "Schriftlicher Ausdruck (Brief / E-Mail)",
          durationMinutes: 30,
          points: 20,
          taskTypes: ["formal_letter_reply"],
          description: "Verfassen eines formellen Schreibens an Behörden, Vermieter oder Arbeitgeber (mind. 4 Leitpunkte).",
          tasks: [
            {
              id: "dtz-w-1",
              title: "Schreiben an die Schulleitung",
              instructions: "Ihr Kind ist krank und kann nicht am Unterricht teilnehmen. Schreiben Sie eine Entschuldigung an die Klassenlehrerin (mind. 40 Wörter).",
              suggestedWordCount: 40,
              promptBulletPoints: [
                "Grund des Fehlens und Dauer der Erkrankung",
                "Hausaufgaben und Unterrichtsmaterialien erfragen",
                "Ärztliches Attest ankündigen",
                "Höfliche Grußformel"
              ]
            }
          ]
        },
        {
          id: "sprechen",
          title: "Sprechen",
          name: "Mündliche Prüfung (DTZ)",
          durationMinutes: 15,
          points: 100,
          taskTypes: ["introduction_with_followup", "photo_description", "collaborative_negotiation"],
          description: "3 Teile: Über sich sprechen, Bild beschreiben und über eigene Erfahrungen berichten, gemeinsam eine Lösung aushandeln.",
          parts: [
            {
              partNumber: 1,
              title: "Teil 2: Bildbeschreibung (Familie & Berufsalltag)",
              promptAudio: "Beschreiben Sie bitte das Bild: Eine Familie kocht gemeinsam in der Küche.",
              guidelines: ["Was sehen Sie auf dem Bild?", "Welche Stimmung herrscht vor?", "Wie ist die Situation bei Ihnen zu Hause?"],
              modelAnswer: "Auf dem Foto sehe ich eine vierköpfige Familie, die zusammen in einer hellen Küche das Abendessen zubereitet..."
            }
          ]
        }
      ]
    },

    A2: {
      level: "A2",
      title: "Deutsch-Test für Zuwanderer (Ziel: A2 Basis)",
      subtitle: "BAMF Skalierte Integrationsprüfung A2-B1",
      totalDurationMinutes: 100,
      passRules: {
        type: "dtz_combined",
        targetLevel: "A2",
        ruleDescription: "A2-Zertifikat erfordert: A2 im Mündlichen UND A2 in mindestens einem schriftlichen Prüfungsteil.",
        thresholds: {
          hoeren_lesen: { b1: 33, a2: 20, max: 45 },
          schreiben: { b1: 15, a2: 10, max: 20 },
          sprechen: { b1: 75, a2: 50, max: 100 }
        },
        verified: false,
        source: "https://www.bamf.de"
      },
      resultLabels: [
        { label: "A2 Zertifikat erreicht", description: "Basis-Sprachkenntnisse nachgewiesen." },
        { label: "B1 übertroffen!", description: "Sie haben die höheren B1-Kriterien erfüllt!" },
        { label: "Unter A2", description: "Unter dem Mindestwert für A2." }
      ],
      modules: [
        {
          id: "hoeren_lesen",
          title: "Hören & Lesen",
          name: "Hören und Lesen kombiniert (45 Aufgaben)",
          durationMinutes: 45,
          points: 45,
          taskTypes: ["public_messages", "classifieds", "consumer_notices"],
          description: "Alltägliche Durchsagen, Telefonauskünfte, Mietverträge und Arbeitsanzeigen.",
          parts: [
            {
              partNumber: 1,
              title: "Teil 1: Wohnungs- und Nachbarschaftsmeldung",
              instructions: "Lesen Sie den Aushang im Treppenhaus und beantworten Sie die Fragen.",
              text: "Liebe Hausgemeinschaft,\nam kommenden Dienstag, den 14. November, werden zwischen 9:00 und 14:00 Uhr die Hauptwasserleitungen gewartet. In diesem Zeitraum wird das Kalt- und Warmwasser vollständig abgestellt. Bitte halten Sie alle Wasserhähne geschlossen.\nDie Hausverwaltung",
              questions: [
                {
                  id: "dtz-hl-1",
                  question: "Was müssen die Bewohner am Dienstag beachten?",
                  options: [
                    "Das Wasser ist von 9 bis 14 Uhr abgestellt",
                    "Die Heizung wird dauerhaft repariert",
                    "Der Fahrstuhl steht still"
                  ],
                  correctAnswer: 0,
                  points: 22.5,
                  explanation: "Im Aushang steht: Kalt- und Warmwasser wird von 9:00 bis 14:00 Uhr abgestellt."
                },
                {
                  id: "dtz-hl-2",
                  question: "Welche Vorsichtsmaßnahme bittet die Hausverwaltung einzuhalten?",
                  options: [
                    "Alle Wasserhähne geschlossen halten",
                    "Das Haus komplett verlassen",
                    "Den Hausmeister anrufen"
                  ],
                  correctAnswer: 0,
                  points: 22.5,
                  explanation: "Ausdrückliche Anweisung: 'Bitte halten Sie alle Wasserhähne geschlossen.'"
                }
              ]
            }
          ]
        },
        {
          id: "schreiben",
          title: "Schreiben",
          name: "Schriftlicher Ausdruck (Brief / E-Mail)",
          durationMinutes: 30,
          points: 20,
          taskTypes: ["formal_letter_reply"],
          description: "Verfassen eines formellen Schreibens an Behörden, Vermieter oder Arbeitgeber (mind. 4 Leitpunkte).",
          tasks: [
            {
              id: "dtz-w-1",
              title: "Schreiben an die Schulleitung",
              instructions: "Ihr Kind ist krank und kann nicht am Unterricht teilnehmen. Schreiben Sie eine Entschuldigung an die Klassenlehrerin (mind. 40 Wörter).",
              suggestedWordCount: 40,
              promptBulletPoints: [
                "Grund des Fehlens und Dauer der Erkrankung",
                "Hausaufgaben und Unterrichtsmaterialien erfragen",
                "Ärztliches Attest ankündigen",
                "Höfliche Grußformel"
              ]
            }
          ]
        },
        {
          id: "sprechen",
          title: "Sprechen",
          name: "Mündliche Prüfung (DTZ)",
          durationMinutes: 15,
          points: 100,
          taskTypes: ["introduction_with_followup", "photo_description", "collaborative_negotiation"],
          description: "3 Teile: Über sich sprechen, Bild beschreiben und über eigene Erfahrungen berichten, gemeinsam eine Lösung aushandeln.",
          parts: [
            {
              partNumber: 1,
              title: "Teil 2: Bildbeschreibung (Familie & Berufsalltag)",
              promptAudio: "Beschreiben Sie bitte das Bild: Eine Familie kocht gemeinsam in der Küche.",
              guidelines: ["Was sehen Sie auf dem Bild?", "Welche Stimmung herrscht vor?", "Wie ist die Situation bei Ihnen zu Hause?"],
              modelAnswer: "Auf dem Foto sehe ich eine vierköpfige Familie, die zusammen in einer hellen Küche das Abendessen zubereitet..."
            }
          ]
        }
      ]
    }
  }
};
