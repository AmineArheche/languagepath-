/**
 * src/data/exams/telc.js
 *
 * Official telc Deutsch Examination Structure & Scoring Rules
 * Reference: https://www.telc.net/pruefungen/zertifikatspruefungen/deutsch/
 * All pass rules and scoring models marked verified: false until user confirmation.
 *
 * KEY TELC REGULATION:
 * Written Exam (Lesen + Sprachbausteine + Hören + Schreiben = 225 Pkt) and
 * Oral Exam (Sprechen = 75 Pkt) MUST EACH be passed separately with at least 60%!
 */

export const telcExam = {
  id: "telc",
  name: "telc Deutsch",
  institution: "telc gGmbH",
  verified: false,
  source: "https://www.telc.net/pruefungen/zertifikatspruefungen/deutsch/",
  description:
    "The European Language Certificates (telc) emphasize communicative competence and everyday language elements (Sprachbausteine). Recognized throughout Germany and Europe for naturalization, vocational training, and employment.",
  levels: {
    A1: {
      level: "A1",
      title: "telc Deutsch A1",
      subtitle: "Start ins Deutsche",
      totalDurationMinutes: 70,
      passRules: {
        type: "separate_written_oral",
        minPercentage: 60,
        passScore: 60,
        maxScore: 100,
        writtenOralSeparate: true,
        minWrittenPercentage: 60,
        minOralPercentage: 60,
        ruleDescription: "Schriftliche Prüfung und Mündliche Prüfung müssen jeweils mit mind. 60% separat bestanden werden.",
        verified: false,
        source: "https://www.telc.net"
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
          name: "Leseverstehen (telc)",
          durationMinutes: 25,
          points: 30,
          taskTypes: ["personal_notes", "public_signs"],
          description: "Alltagsnachrichten und Schilder verstehen.",
          parts: [
            {
              partNumber: 1,
              title: "Teil 1: E-Mail von Freunden",
              instructions: "Lesen Sie die E-Mail und entscheiden Sie: Richtig oder Falsch?",
              text: "Hallo Laura,\nwir treffen uns am Freitag um 19 Uhr im Café Central. Lukas kommt auch mit. Bitte bring deinen Laptop mit, wir wollen die Reisefotos anschauen.\nBis Freitag,\nSophie",
              questions: [
                {
                  id: "telc-a1-l-1",
                  question: "Das Treffen findet am Freitagabend statt.",
                  options: ["Richtig", "Falsch"],
                  correctAnswer: 0,
                  points: 15,
                  explanation: "19 Uhr am Freitag ist Freitagabend."
                },
                {
                  id: "telc-a1-l-2",
                  question: "Laura soll Kuchen für alle mitbringen.",
                  options: ["Richtig", "Falsch"],
                  correctAnswer: 1,
                  points: 15,
                  explanation: "Sophie bittet um den Laptop, nicht um Kuchen."
                }
              ]
            }
          ]
        },
        {
          id: "hoeren",
          title: "Hören",
          name: "Hörverstehen (telc)",
          durationMinutes: 20,
          points: 30,
          taskTypes: ["short_dialogues"],
          description: "Kurze Durchsagen und Dialoge verstehen.",
          parts: [
            {
              partNumber: 1,
              title: "Teil 1: Durchsage am Gleis",
              instructions: "Hören Sie die Durchsage und wählen Sie die richtige Antwort.",
              questions: [
                {
                  id: "telc-a1-h-1",
                  question: "Auf welchem Gleis fährt der ICE nach Frankfurt ein?",
                  options: ["Gleis 4", "Gleis 7", "Gleis 12"],
                  correctAnswer: 1,
                  points: 30,
                  explanation: "Die Durchsage kündigt Gleis 7 an."
                }
              ]
            }
          ]
        },
        {
          id: "schreiben",
          title: "Schreiben",
          name: "Schriftlicher Ausdruck (telc)",
          durationMinutes: 15,
          points: 15,
          taskTypes: ["form_filling", "short_sms"],
          description: "Formular ausfüllen und eine kurze Nachricht schreiben.",
          tasks: [
            {
              id: "telc-a1-w-1",
              title: "Anmeldeformular Fitnessstudio",
              instructions: "Tragen Sie die fehlenden 3 Angaben ein.",
              fields: [
                { key: "familienname", label: "Familienname", placeholder: "z.B. Schmidt", sampleAnswer: "Schmidt" },
                { key: "geburtsort", label: "Geburtsort", placeholder: "z.B. Wien", sampleAnswer: "Wien" }
              ]
            }
          ]
        },
        {
          id: "sprechen",
          title: "Sprechen",
          name: "Mündliche Prüfung (telc)",
          durationMinutes: 10,
          points: 25,
          taskTypes: ["introduction", "asking_questions"],
          description: "Sich vorstellen und nach Informationen fragen.",
          parts: [
            {
              partNumber: 1,
              title: "Teil 1: Sich vorstellen",
              promptAudio: "Guten Tag, bitte stellen Sie sich kurz vor.",
              guidelines: ["Name", "Alter", "Land", "Wohnort", "Beruf"],
              modelAnswer: "Guten Tag! Mein Name ist Stefan Müller, ich bin 28 Jahre alt und wohne in Frankfurt."
            }
          ]
        }
      ]
    },

    A2: {
      level: "A2",
      title: "telc Deutsch A2",
      subtitle: "Alltags- und Berufskompetenz",
      totalDurationMinutes: 85,
      passRules: {
        type: "separate_written_oral",
        minPercentage: 60,
        passScore: 60,
        maxScore: 100,
        writtenOralSeparate: true,
        minWrittenPercentage: 60,
        minOralPercentage: 60,
        ruleDescription: "Schriftliche Prüfung (Lesen, Hören, Schreiben) und Mündliche Prüfung separat mit mind. 60% bestehen.",
        verified: false,
        source: "https://www.telc.net"
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
          name: "Leseverstehen (telc)",
          durationMinutes: 30,
          points: 30,
          taskTypes: ["notices", "emails"],
          description: "Alltagstexte und Ankündigungen verstehen.",
          parts: [
            {
              partNumber: 1,
              title: "Teil 1: Wohnungsanzeige",
              instructions: "Lesen Sie die Anzeige und beantworten Sie die Fragen.",
              text: "Helle 2-Zimmer-Wohnung in Hamburg-Altona ab 1. Mai frei. 65 qm, Einbauküche, Balkon, Kaltmiete 750 Euro zzgl. 150 Euro Nebenkosten. Keine Haustiere.",
              questions: [
                {
                  id: "telc-a2-l-1",
                  question: "Wie hoch ist die Warmmiete insgesamt?",
                  options: ["750 Euro", "800 Euro", "900 Euro"],
                  correctAnswer: 2,
                  points: 15,
                  explanation: "750 Kaltmiete + 150 Nebenkosten = 900 Euro Warmmiete."
                },
                {
                  id: "telc-a2-l-2",
                  question: "Darf der Mieter eine Katze mitbringen?",
                  options: ["Ja", "Nein", "Nur nach Absprache"],
                  correctAnswer: 1,
                  points: 15,
                  explanation: "In der Anzeige steht explizit: Keine Haustiere."
                }
              ]
            }
          ]
        },
        {
          id: "hoeren",
          title: "Hören",
          name: "Hörverstehen (telc)",
          durationMinutes: 20,
          points: 30,
          taskTypes: ["phone_messages", "conversations"],
          description: "Anrufbeantworter und Beratungsgespräche verstehen.",
          parts: [
            {
              partNumber: 1,
              title: "Teil 1: Arztpraxis Anrufbeantworter",
              instructions: "Hören Sie die Praxisnachricht und wählen Sie die richtige Antwort.",
              questions: [
                {
                  id: "telc-a2-h-1",
                  question: "Wann hat die Arztpraxis am Mittwoch geöffnet?",
                  options: ["Nur vormittags von 8 bis 12 Uhr", "Den ganzen Tag", "Geschlossen"],
                  correctAnswer: 0,
                  points: 30,
                  explanation: "Mittwochs nur Vormittagssprechstunde von 8 bis 12 Uhr."
                }
              ]
            }
          ]
        },
        {
          id: "schreiben",
          title: "Schreiben",
          name: "Schriftlicher Ausdruck (telc)",
          durationMinutes: 20,
          points: 15,
          taskTypes: ["personal_letter"],
          description: "Persönliche Mitteilung oder Entschuldigung verfassen.",
          tasks: [
            {
              id: "telc-a2-w-1",
              title: "Terminabsage beim Zahnarzt",
              instructions: "Schreiben Sie eine kurze E-Mail (mind. 30 Wörter) zur Terminverschiebung.",
              suggestedWordCount: 30,
              promptBulletPoints: ["Grund der Absage", "Bitte um neuen Termin", "Telefonische Erreichbarkeit"]
            }
          ]
        },
        {
          id: "sprechen",
          title: "Sprechen",
          name: "Mündliche Prüfung (telc)",
          durationMinutes: 15,
          points: 25,
          taskTypes: ["experiences", "cooperation"],
          description: "Über persönliche Erfahrungen sprechen und ein Treffen vereinbaren.",
          parts: [
            {
              partNumber: 1,
              title: "Gemeinsam einen Ausflug planen",
              promptAudio: "Planen Sie zusammen mit Ihrem Partner einen Kinobesuch.",
              guidelines: ["Filmgenre", "Kino & Uhrzeit", "Treffpunkt"],
              modelAnswer: "Hallo! Wollen wir am Samstag zusammen ins Kino gehen? Welchen Film möchtest du sehen?"
            }
          ]
        }
      ]
    },

    B1: {
      level: "B1",
      title: "telc Deutsch B1 / Zertifikat Deutsch",
      subtitle: "Offizielle Struktur mit Sprachbausteinen (300 Pkt Gesamt)",
      totalDurationMinutes: 165,
      passRules: {
        type: "separate_written_oral",
        minPercentage: 60,
        passScore: 180,
        maxScore: 300,
        writtenOralSeparate: true,
        minWrittenScore: 135,
        maxWrittenScore: 225,
        minOralScore: 45,
        maxOralScore: 75,
        ruleDescription:
          "Schriftlich (mind. 135 von 225 Pkt = 60%) UND Mündlich (mind. 45 von 75 Pkt = 60%) müssen BEIDE getrennt bestanden werden!",
        verified: false,
        source: "https://www.telc.net/pruefungen/zertifikatspruefungen/deutsch/detail/zertifikat-deutsch-telc-deutsch-b1.html"
      },
      resultLabels: [
        { minPercentage: 90, label: "Sehr gut (1)" },
        { minPercentage: 80, label: "Gut (2)" },
        { minPercentage: 70, label: "Befriedigend (3)" },
        { minPercentage: 60, label: "Ausreichend (4)" },
        { minPercentage: 0, label: "Nicht bestanden" }
      ],
      modules: [
        {
          id: "lesen",
          title: "Lesen",
          name: "Leseverstehen (telc B1)",
          durationMinutes: 60,
          points: 75,
          taskTypes: ["global_matching", "detail_reading", "situational_ads"],
          description: "Drei Teile: Zuordnung von Titeln, Detailfragen zu Reportagen und Anzeigenabgleich.",
          parts: [
            {
              partNumber: 1,
              title: "Teil 1: Passende Überschriften finden",
              instructions: "Lesen Sie die Kurzberichte und ordnen Sie die passende Überschrift zu.",
              text: "Immer mehr Menschen in Deutschland entscheiden sich für Carsharing statt eines eigenen PKW. Besonders in Ballungsräumen spart das Parkgebühren und Unterhaltskosten...",
              questions: [
                {
                  id: "telc-b1-l-1",
                  question: "Welche Aussage fasst den Kern des Berichts zusammen?",
                  options: [
                    "Mobilitätswandel: Autoverzicht im urbanen Raum nimmt zu",
                    "Autokäufe erreichen neuen Rekordstand",
                    "Fahrradwege verdrängen Parkplätze"
                  ],
                  correctAnswer: 0,
                  points: 37.5,
                  explanation: "Der Bericht hebt die Zunahme von Carsharing und den Verzicht auf eigene PKWs hervor."
                },
                {
                  id: "telc-b1-l-2",
                  question: "Welcher Hauptgrund für Carsharing wird im Text genannt?",
                  options: [
                    "Kosteneinsparungen und Parkplatzproblematik",
                    "Höhere Geschwindigkeiten",
                    "Kostenlose Benzingutscheine"
                  ],
                  correctAnswer: 0,
                  points: 37.5,
                  explanation: "Ersparnis bei Parkgebühren und Unterhaltskosten werden ausdrücklich angeführt."
                }
              ]
            }
          ]
        },
        {
          id: "sprachbausteine",
          title: "Sprachbausteine",
          name: "Sprachbausteine (Grammatik & Wortschatz im Kontext)",
          durationMinutes: 30,
          points: 30,
          taskTypes: ["cloze_multiple_choice", "cloze_word_pool"],
          description:
            "Der typische telc-Prüfungsteil: Teil 1 Brief-Lückentext (3-fach Multiple Choice) und Teil 2 Text-Lückentext (Wortschatz-Auswahlpool a-j).",
          parts: [
            {
              partNumber: 1,
              title: "Teil 1: Lückentext im Brief (Grammatik & Konnektoren)",
              instructions: "Wählen Sie für jede Lücke (1-5) die grammatisch und stilistisch passende Option (a, b oder c).",
              text: "Sehr geehrte Frau Dr. Weber,\nich schreibe Ihnen, [1] ich meinen gestrigen Behandlungstermin leider versäumt habe. Ich lag mit hohem Fieber im Bett [2] konnte die Praxis telefonisch nicht erreichen. [3] ich wieder genesen bin, möchte ich Sie um einen neuen Termin bitten. Ich habe nächste Woche [4] Montag und Mittwoch Zeit. Bitte teilen Sie mir mit, [5] ein Termin bei Ihnen frei ist.\nMit freundlichen Grüßen,\nMarc Becker",
              clozeItems: [
                {
                  id: "telc-b1-sb-1",
                  gapNumber: 1,
                  options: ["weil", "denn", "obwohl"],
                  correctAnswer: 0,
                  points: 3,
                  ruleCategory: "connector",
                  explanation: "'weil' leitet einen Kausalsatz mit Verb-Endstellung ('versäumt habe') ein."
                },
                {
                  id: "telc-b1-sb-2",
                  gapNumber: 2,
                  options: ["aber", "und", "sondern"],
                  correctAnswer: 1,
                  points: 3,
                  ruleCategory: "connector",
                  explanation: "'und' verbindet die beiden gleichrangigen Hauptsätze additiv."
                },
                {
                  id: "telc-b1-sb-3",
                  gapNumber: 3,
                  options: ["Sobald", "Damit", "Ob"],
                  correctAnswer: 0,
                  points: 3,
                  ruleCategory: "connector",
                  explanation: "'Sobald' drückt eine temporale Unmittelbarkeit aus ('Sobald ich genesen bin')."
                },
                {
                  id: "telc-b1-sb-4",
                  gapNumber: 4,
                  options: ["an", "am", "im"],
                  correctAnswer: 1,
                  points: 3,
                  ruleCategory: "preposition",
                  explanation: "Wochentage verlangen die temporale Präposition 'am' (an + dem)."
                },
                {
                  id: "telc-b1-sb-5",
                  gapNumber: 5,
                  options: ["wann", "ob", "warum"],
                  correctAnswer: 1,
                  points: 3,
                  ruleCategory: "connector",
                  explanation: "Indirekte Ja/Nein-Frage erfordert 'ob' ('ob ein Termin frei ist')."
                }
              ]
            },
            {
              partNumber: 2,
              title: "Teil 2: Lückentext im Artikel (Lexik & Kollokationen)",
              instructions: "Wählen Sie für jede Lücke das passende Wort aus dem Wortpool (a-h).",
              text: "Klimaschutz fängt im Alltag an. Experten [6] dazu, den Fleischkonsum zu reduzieren und mehr regionale Produkte zu kaufen. Wer Energie sparen will, sollte elektrische Geräte komplett [7], anstatt sie im Standby-Modus zu lassen. Auch beim Heizen lässt sich viel Geld [8], wenn man regelmäßig stoßlüftet. Jeder Einzelne kann somit einen spürbaren Beitrag zum Umweltschutz [9].",
              wordPool: ["a) raten", "b) ausschalten", "c) sparen", "d) leisten", "e) finden", "f) hoffen", "g) zerstören", "h) vermuten"],
              clozeItems: [
                {
                  id: "telc-b1-sb-6",
                  gapNumber: 6,
                  options: ["a) raten", "b) ausschalten", "c) sparen", "d) leisten"],
                  correctAnswer: 0,
                  points: 3,
                  ruleCategory: "vocabulary",
                  explanation: "Kollokation: 'Experten raten dazu...'."
                },
                {
                  id: "telc-b1-sb-7",
                  gapNumber: 7,
                  options: ["a) raten", "b) ausschalten", "c) sparen", "d) leisten"],
                  correctAnswer: 1,
                  points: 3,
                  ruleCategory: "vocabulary",
                  explanation: "Geräte 'ausschalten' statt im Standby-Betrieb zu lassen."
                },
                {
                  id: "telc-b1-sb-8",
                  gapNumber: 8,
                  options: ["a) raten", "b) ausschalten", "c) sparen", "d) leisten"],
                  correctAnswer: 2,
                  points: 4.5,
                  ruleCategory: "vocabulary",
                  explanation: "Geld 'sparen' durch effizientes Heizen."
                },
                {
                  id: "telc-b1-sb-9",
                  gapNumber: 9,
                  options: ["a) raten", "b) ausschalten", "c) sparen", "d) leisten"],
                  correctAnswer: 3,
                  points: 4.5,
                  ruleCategory: "vocabulary",
                  explanation: "Feste Wendung (Nomen-Verb-Gefüge): 'einen Beitrag leisten'."
                }
              ]
            }
          ]
        },
        {
          id: "hoeren",
          title: "Hören",
          name: "Hörverstehen (telc B1)",
          durationMinutes: 30,
          points: 75,
          taskTypes: ["news", "interviews", "daily_dialogues"],
          description: "Nachrichten, Meinungsäußerungen und Durchsagen verstehen.",
          parts: [
            {
              partNumber: 1,
              title: "Teil 1: Radiobericht zu nachhaltigem Konsum",
              instructions: "Hören Sie den Beitrag und beantworten Sie die Frage.",
              questions: [
                {
                  id: "telc-b1-h-1",
                  question: "Welches Ziel verfolgt die vorgestellte Bürgerinitiative?",
                  options: [
                    "Verpackungsfreien Einkauf in Supermärkten fördern",
                    "Autos in Innenstädten komplett verbieten",
                    "Strompreise staatlich deckeln"
                  ],
                  correctAnswer: 0,
                  points: 75,
                  explanation: "Die Initiative engagiert sich für unverpackte Lebensmittel."
                }
              ]
            }
          ]
        },
        {
          id: "schreiben",
          title: "Schreiben",
          name: "Schriftlicher Ausdruck (telc B1)",
          durationMinutes: 30,
          points: 45,
          taskTypes: ["personal_or_semi_formal_letter"],
          description: "Wahl zwischen einem privaten Brief oder einem halbformellen Antwortschreiben (mind. 80 Wörter).",
          tasks: [
            {
              id: "telc-b1-w-1",
              title: "Halbformeller Brief: Bitte um Information zu einem Sprachkurs",
              instructions: "Schreiben Sie einen Brief an die Sprachschule (ca. 80 Wörter).",
              suggestedWordCount: 80,
              promptBulletPoints: [
                "Grund des Schreibens",
                "Eigene Deutschkenntnisse und Lernziele",
                "Frage nach Kurszeiten, Kosten und Gruppengröße",
                "Möglichkeit eines Einstufungstests"
              ]
            }
          ]
        },
        {
          id: "sprechen",
          title: "Sprechen",
          name: "Mündliche Prüfung (telc B1)",
          durationMinutes: 15,
          points: 75,
          taskTypes: ["presentation", "dialogue", "problem_solving"],
          description: "Drei Teile: Kontaktaufnahme / Kennenlernen, Gespräch über ein Thema, gemeinsame Problemlösung.",
          parts: [
            {
              partNumber: 1,
              title: "Teil 1: Ein Thema präsentieren",
              promptAudio: "Bitte stellen Sie Ihrem Partner ein Thema aus Ihrem Berufs- oder Studienalltag vor.",
              guidelines: ["Thema nennen", "Eigene Erfahrungen schildern", "Vor- und Nachteile abwägen", "Fazit ziehen"],
              modelAnswer: "Guten Tag! Ich möchte heute über das Thema 'Lebenslanges Lernen' sprechen..."
            }
          ]
        }
      ]
    },

    B2: {
      level: "B2",
      title: "telc Deutsch B2",
      subtitle: "Allgemeinsprachliche & berufliche Handlungsfähigkeit",
      totalDurationMinutes: 185,
      passRules: {
        type: "separate_written_oral",
        minPercentage: 60,
        passScore: 180,
        maxScore: 300,
        writtenOralSeparate: true,
        minWrittenScore: 135,
        maxWrittenScore: 225,
        minOralScore: 45,
        maxOralScore: 75,
        ruleDescription: "Schriftlich (mind. 135 Pkt) und Mündlich (mind. 45 Pkt) müssen getrennt bestanden werden.",
        verified: false,
        source: "https://www.telc.net/pruefungen/zertifikatspruefungen/deutsch/detail/telc-deutsch-b2.html"
      },
      resultLabels: [
        { minPercentage: 90, label: "Sehr gut (1)" },
        { minPercentage: 80, label: "Gut (2)" },
        { minPercentage: 70, label: "Befriedigend (3)" },
        { minPercentage: 60, label: "Ausreichend (4)" },
        { minPercentage: 0, label: "Nicht bestanden" }
      ],
      modules: [
        {
          id: "lesen",
          title: "Lesen",
          name: "Leseverstehen (telc B2)",
          durationMinutes: 60,
          points: 75,
          taskTypes: ["abstract_matching", "in_depth_article", "regulations"],
          description: "Detaillierte Fachartikel, Glossen und institutionelle Richtlinien verstehen.",
          parts: [
            {
              partNumber: 1,
              title: "Teil 1: Artikel über Arbeitsmarkt und Automatisierung",
              instructions: "Lesen Sie den Beitrag und markieren Sie die richtige Option.",
              text: "Die fortschreitende Digitalisierung verändert Arbeitsstrukturen fundamental...",
              questions: [
                {
                  id: "telc-b2-l-1",
                  question: "Welche Qualifikationen gewinnen laut Institut künftig an Bedeutung?",
                  options: [
                    "Analytisches Denken und soziale Problemlösungskompetenz",
                    "Monotone mechanische Fertigkeiten",
                    "Ausschließlich Programmierkenntnisse"
                  ],
                  correctAnswer: 0,
                  points: 75,
                  explanation: "Kreative und zwischenmenschliche Kompetenzen bleiben schwer automatisierbar."
                }
              ]
            }
          ]
        },
        {
          id: "sprachbausteine",
          title: "Sprachbausteine",
          name: "Sprachbausteine B2",
          durationMinutes: 30,
          points: 30,
          taskTypes: ["advanced_cloze_multiple_choice", "advanced_collocations"],
          description: "Präzise Idiomatik, Passiversatzformen und gehobene Syntax.",
          parts: [
            {
              partNumber: 1,
              title: "Teil 1: Beschwerdebrief und Regressanspruch",
              instructions: "Wählen Sie für jede Lücke die korrekte Option.",
              text: "Sehr geehrte Damen und Herren,\nbezugnehmend [1] Ihre Lieferung vom 12. d. M. müssen wir rügen, dass die Ware erhebliche Mängel aufweist. [2] der Transportschäden ist ein Weiterverkauf ausgeschlossen. Wir fordern Sie [3] auf, umgehend Ersatz zu liefern.",
              clozeItems: [
                {
                  id: "telc-b2-sb-1",
                  gapNumber: 1,
                  options: ["auf", "an", "über"],
                  correctAnswer: 0,
                  points: 10,
                  ruleCategory: "preposition",
                  explanation: "Feste Wendung: 'bezugnehmend auf' (+ Akkusativ)."
                },
                {
                  id: "telc-b2-sb-2",
                  gapNumber: 2,
                  options: ["Infolge", "Trotz", "Während"],
                  correctAnswer: 0,
                  points: 10,
                  ruleCategory: "preposition",
                  explanation: "'Infolge' drückt die kausale Folge aus (+ Genitiv)."
                },
                {
                  id: "telc-b2-sb-3",
                  gapNumber: 3,
                  options: ["daher", "deshalb", "nämlich"],
                  correctAnswer: 0,
                  points: 10,
                  ruleCategory: "connector",
                  explanation: "Konsekutiver Anschluss: 'daher'."
                }
              ]
            }
          ]
        },
        {
          id: "hoeren",
          title: "Hören",
          name: "Hörverstehen (telc B2)",
          durationMinutes: 30,
          points: 75,
          taskTypes: ["interviews", "panel_arguments"],
          description: "Komplexe Vorträge und Rundfunkinterviews verstehen.",
          parts: [
            {
              partNumber: 1,
              title: "Teil 1: Fachinterview zu New Work",
              instructions: "Entscheiden Sie: Richtig oder Falsch?",
              questions: [
                {
                  id: "telc-b2-h-1",
                  question: "Der Referent empfiehlt eine strikte Trennung von Arbeitszeit und Freizeit.",
                  options: ["Richtig", "Falsch"],
                  correctAnswer: 0,
                  points: 75,
                  explanation: "Er betont den Gesundheitsschutz durch klare Abgrenzung."
                }
              ]
            }
          ]
        },
        {
          id: "schreiben",
          title: "Schreiben",
          name: "Schriftlicher Ausdruck (telc B2)",
          durationMinutes: 45,
          points: 45,
          taskTypes: ["formal_letter_of_complaint", "inquiry"],
          description: "Verfassen eines ausführlichen formellen Schreibens (mind. 150 Wörter).",
          tasks: [
            {
              id: "telc-b2-w-1",
              title: "Beschwerdebrief an Reiseveranstalter",
              instructions: "Verfassen Sie einen sachlichen Beschwerdebrief über Mängel im Hotel (mind. 150 Wörter).",
              suggestedWordCount: 150,
              promptBulletPoints: [
                "Reisedaten und gebuchte Leistungen",
                "Konkrete Mängel vor Ort (Lärm, Sauberkeit, Verpflegung)",
                "Erfolglose Reklamation bei der Reiseleitung",
                "Forderung nach Preisminderung und Fristsetzung"
              ]
            }
          ]
        },
        {
          id: "sprechen",
          title: "Sprechen",
          name: "Mündliche Prüfung (telc B2)",
          durationMinutes: 15,
          points: 75,
          taskTypes: ["monologue_presentation", "controversial_discussion"],
          description: "Strukturierter Vortrag, Diskussion über einen kontroversen Text und gemeinsame Problemlösung.",
          parts: [
            {
              partNumber: 1,
              title: "Teil 1: Präsentation eines Buches oder Films",
              promptAudio: "Präsentieren Sie Ihrem Prüfungspartner ein Buch oder ein Kulturereignis.",
              guidelines: ["Inhalt und Protagonisten", "Zentrale Thematik", "Persönliche Empfehlung"],
              modelAnswer: "Ich möchte Ihnen gerne den Roman vorstellen..."
            }
          ]
        }
      ]
    },

    C1: {
      level: "C1",
      title: "telc Deutsch C1 Hochschule (Stub)",
      subtitle: "Akademischer Hochschulzugangsnachweis",
      totalDurationMinutes: 210,
      passRules: {
        type: "separate_written_oral",
        minPercentage: 60,
        passScore: 128,
        maxScore: 214,
        writtenOralSeparate: true,
        minWrittenPercentage: 60,
        minOralPercentage: 60,
        ruleDescription: "Schriftliche (Lesen, Sprachbausteine, Hören, Schreiben) und Mündliche Prüfung separat mit 60% bestehen.",
        verified: false,
        source: "https://www.telc.net/pruefungen/zertifikatspruefungen/deutsch/detail/telc-deutsch-c1-hochschule.html"
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
          name: "Leseverstehen C1",
          durationMinutes: 70,
          points: 48,
          taskTypes: ["academic_essays"],
          description: "Wissenschaftliche Fachtexte analysieren.",
          parts: []
        },
        {
          id: "sprachbausteine",
          title: "Sprachbausteine",
          name: "Sprachbausteine C1",
          durationMinutes: 20,
          points: 22,
          taskTypes: ["cloze_academic"],
          description: "Wissenschaftssprachliche Strukturen und Nominalisierungen.",
          parts: []
        },
        {
          id: "hoeren",
          title: "Hören",
          name: "Hörverstehen C1",
          durationMinutes: 40,
          points: 48,
          taskTypes: ["lectures"],
          description: "Hochschulvorlesungen und Seminardiskussionen folgen.",
          parts: []
        },
        {
          id: "schreiben",
          title: "Schreiben",
          name: "Schriftlicher Ausdruck C1",
          durationMinutes: 70,
          points: 48,
          taskTypes: ["argumentative_essay"],
          description: "Akademische Textproduktion mit Grafikbeschreibung.",
          tasks: []
        },
        {
          id: "sprechen",
          title: "Sprechen",
          name: "Mündliche Prüfung C1",
          durationMinutes: 15,
          points: 48,
          taskTypes: ["academic_discourse"],
          description: "Wissenschaftlicher Vortrag und Fachdebatte.",
          parts: []
        }
      ]
    }
  }
};
