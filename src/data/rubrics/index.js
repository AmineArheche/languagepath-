import goetheRubric from "./goethe.json";
import telcRubric from "./telc.json";
import osdRubric from "./osd.json";
import dtzRubric from "./dtz.json";
import testdafRubric from "./testdaf.json";

export const RUBRICS = {
  goethe: goetheRubric,
  telc: telcRubric,
  osd: osdRubric,
  dtz: dtzRubric,
  testdaf: testdafRubric
};

// Official Speaking Examination Rubrics (verified: false until confirmed)
export const SPEAKING_RUBRICS = {
  goethe: {
    institution: "Goethe-Institut",
    name: "Goethe-Zertifikat Sprechen",
    verified: false,
    source: "https://www.goethe.de/pro/relaunch/prf/de/Pruefungsordnung.pdf",
    levels: {
      A1: {
        level: "A1",
        moduleName: "Start Deutsch 1 - Mündliche Prüfung",
        maxPoints: 15,
        source: "https://www.goethe.de/pro/relaunch/prf/de/Goethe-Zertifikat_A1_SD1_Modellsatz.pdf",
        verified: false,
        criteria: [
          {
            id: "aufgabenerfuellung",
            name: "Aufgabenerfüllung / Leitpunkte",
            weight: 0.40,
            maxPoints: 6.0,
            description: "Verständliche Umsetzung der mündlichen Aufgabenstellung (Vorstellung, Bitten)."
          },
          {
            id: "fluessigkeit",
            name: "Flüssigkeit & Verständlichkeit",
            weight: 0.30,
            maxPoints: 4.5,
            description: "Flüssiges Sprechtempo (50-80 WPM), geringe Zögerungslaute, sinnvolle Pausen."
          },
          {
            id: "aussprache",
            name: "Aussprache & Intonation (heuristisch)",
            weight: 0.30,
            maxPoints: 4.5,
            description: "Verständliche Aussprache und Satzmelodie (Browser-STT Näherungswert)."
          }
        ]
      },
      A2: {
        level: "A2",
        moduleName: "Goethe-Zertifikat A2 - Sprechen",
        maxPoints: 25,
        source: "https://www.goethe.de/pro/relaunch/prf/de/Goethe-Zertifikat_A2_Modellsatz.pdf",
        verified: false,
        criteria: [
          {
            id: "aufgabenerfuellung",
            name: "Aufgabenbewältigung (Inhalt & Leitpunkte)",
            weight: 0.35,
            maxPoints: 8.75,
            description: "Ausführliche und themenbezogene Äußerungen zu den Fragen."
          },
          {
            id: "interaktion",
            name: "Interaktion & Flüssigkeit",
            weight: 0.25,
            maxPoints: 6.25,
            description: "Angemessenes Sprechtempo (70-100 WPM), strukturierte Satzverbindungen."
          },
          {
            id: "wortschatz",
            name: "Wortschatz & Ausdruck",
            weight: 0.20,
            maxPoints: 5.0,
            description: "Situationsgerechter A2-Alltagswortschatz."
          },
          {
            id: "strukturen_aussprache",
            name: "Strukturen & Aussprache (heuristisch)",
            weight: 0.20,
            maxPoints: 5.0,
            description: "Verb-Zweitstellung, Verbflexion und verständliche Lautung."
          }
        ]
      },
      B1: {
        level: "B1",
        moduleName: "Goethe-Zertifikat B1 - Modul Sprechen",
        maxPoints: 25,
        source: "https://www.goethe.de/pro/relaunch/prf/de/Goethe-Zertifikat_B1_Pruefungsordnung.pdf",
        verified: false,
        criteria: [
          {
            id: "vortrag",
            name: "Kriterium 1: Aufgabenerfüllung / Vortrag",
            weight: 0.30,
            maxPoints: 7.5,
            description: "Strukturierte Präsentation der Leitpunkte und klare persönliche Stellungnahme."
          },
          {
            id: "kohaerenz_fluessigkeit",
            name: "Kriterium 2: Kohärenz & Flüssigkeit",
            weight: 0.25,
            maxPoints: 6.25,
            description: "Gliederung, roter Faden, Sprechtempo (90-130 WPM), Konnektoren."
          },
          {
            id: "wortschatz",
            name: "Kriterium 3: Wortschatzspektrum & -beherrschung",
            weight: 0.25,
            maxPoints: 6.25,
            description: "Differenziertes thematisches Vokabular, Redemittel für Vortrag und Diskussion."
          },
          {
            id: "strukturen_aussprache",
            name: "Kriterium 4: Strukturen & Aussprache (heuristisch)",
            weight: 0.20,
            maxPoints: 5.0,
            description: "Nebensatz-Verbstellung, Tempuskorrektheit und phonetische Verständlichkeit."
          }
        ]
      },
      B2: {
        level: "B2",
        moduleName: "Goethe-Zertifikat B2 - Modul Sprechen",
        maxPoints: 25,
        source: "https://www.goethe.de/pro/relaunch/prf/de/Goethe-Zertifikat_B2_Modellsatz.pdf",
        verified: false,
        criteria: [
          {
            id: "vortrag",
            name: "Kriterium 1: Vortrag & Argumentation",
            weight: 0.30,
            maxPoints: 7.5,
            description: "Überzeugende Entfaltung komplexer Argumente und Abwägen von Standpunkten."
          },
          {
            id: "diskurs_fluessigkeit",
            name: "Kriterium 2: Diskurskompetenz & Flüssigkeit",
            weight: 0.25,
            maxPoints: 6.25,
            description: "Spontane und flüssige Äußerung (110-150 WPM) mit geringen Häsitationen."
          },
          {
            id: "wortschatz",
            name: "Kriterium 3: Wortschatz & Redemittel",
            weight: 0.25,
            maxPoints: 6.25,
            description: "Breites B2-Spektrum, idiomatische Wendungen, präzise Formulierung."
          },
          {
            id: "strukturen_phonetik",
            name: "Kriterium 4: Korrektheit & Phonetik (heuristisch)",
            weight: 0.20,
            maxPoints: 5.0,
            description: "Beherrschung komplexer Satzgefüge (Passiv, Konjunktiv) und deutliche Artikulation."
          }
        ]
      }
    }
  },
  telc: {
    institution: "telc gGmbH",
    name: "telc Deutsch Sprechen",
    verified: false,
    source: "https://www.telc.net/pruefungen/zertifikatspruefungen/deutsch/",
    levels: {
      A1: {
        level: "A1",
        moduleName: "telc Deutsch A1 - Mündliche Prüfung",
        maxPoints: 15,
        source: "https://www.telc.net",
        verified: false,
        criteria: [
          { id: "inhalt", name: "I. Aufgabenbewältigung", weight: 0.40, maxPoints: 6.0, description: "Beantwortung der Prüferfragen." },
          { id: "fluessigkeit", name: "II. Flüssigkeit", weight: 0.30, maxPoints: 4.5, description: "Angemessenes Redetempo." },
          { id: "aussprache", name: "III. Aussprache (heuristisch)", weight: 0.30, maxPoints: 4.5, description: "Allgemeine Verständlichkeit." }
        ]
      },
      A2: {
        level: "A2",
        moduleName: "telc Deutsch A2 - Mündliche Prüfung",
        maxPoints: 15,
        source: "https://www.telc.net",
        verified: false,
        criteria: [
          { id: "inhalt", name: "I. Aufgabenbewältigung", weight: 0.40, maxPoints: 6.0, description: "Gespräch über Alltagsthemen." },
          { id: "sprache", name: "II. Sprachliche Mittel", weight: 0.30, maxPoints: 4.5, description: "A2-Wortschatz und Syntax." },
          { id: "aussprache", name: "III. Aussprache (heuristisch)", weight: 0.30, maxPoints: 4.5, description: "Intonation und Verständlichkeit." }
        ]
      },
      B1: {
        level: "B1",
        moduleName: "telc Deutsch B1 - Mündliche Prüfung",
        maxPoints: 25,
        source: "https://www.telc.net",
        verified: false,
        criteria: [
          { id: "inhalt", name: "Kriterium I: Aufgabenbewältigung", weight: 0.35, maxPoints: 8.75, description: "Präsentation und Problemlösung." },
          { id: "fluessigkeit", name: "Kriterium II: Flüssigkeit & Diskurs", weight: 0.35, maxPoints: 8.75, description: "Interaktives Sprechen." },
          { id: "sprachmittel", name: "Kriterium III: Sprachliche Mittel & Aussprache", weight: 0.30, maxPoints: 7.5, description: "Grammatische Korrektheit und Phonetik." }
        ]
      },
      B2: {
        level: "B2",
        moduleName: "telc Deutsch B2 - Mündliche Prüfung",
        maxPoints: 25,
        source: "https://www.telc.net",
        verified: false,
        criteria: [
          { id: "inhalt", name: "Kriterium I: Aufgabenbewältigung", weight: 0.35, maxPoints: 8.75, description: "Argumentation und Diskussion." },
          { id: "diskurs", name: "Kriterium II: Diskursfähigkeit", weight: 0.35, maxPoints: 8.75, description: "Reaktion auf Einwände und Nuancen." },
          { id: "korrektheit", name: "Kriterium III: Sprachliche Mittel", weight: 0.30, maxPoints: 7.5, description: "Syntaktische Varianz und Aussprache." }
        ]
      }
    }
  },
  osd: {
    institution: "ÖSD",
    name: "ÖSD Sprechen Bewertungskriterien",
    verified: false,
    source: "https://www.osd.at",
    levels: {
      A1: {
        level: "A1",
        moduleName: "ÖSD Zertifikat A1 - Mündliche Prüfung",
        maxPoints: 15,
        source: "https://www.osd.at",
        verified: false,
        criteria: [
          { id: "aufgabe", name: "Kriterium 1: Aufgabenerfüllung", weight: 0.40, maxPoints: 6.0, description: "Alltägliche Sprechakte." },
          { id: "fluessigkeit", name: "Kriterium 2: Flüssigkeit", weight: 0.30, maxPoints: 4.5, description: "Flüssiger Redefluss." },
          { id: "aussprache", name: "Kriterium 3: Aussprache (heuristisch)", weight: 0.30, maxPoints: 4.5, description: "Verständliche Lautung." }
        ]
      },
      A2: {
        level: "A2",
        moduleName: "ÖSD Zertifikat A2 - Mündliche Prüfung",
        maxPoints: 15,
        source: "https://www.osd.at",
        verified: false,
        criteria: [
          { id: "aufgabe", name: "Kriterium 1: Aufgabenerfüllung", weight: 0.40, maxPoints: 6.0, description: "Alltagsgespräche und einfache Fragen." },
          { id: "fluessigkeit", name: "Kriterium 2: Flüssigkeit", weight: 0.30, maxPoints: 4.5, description: "Zusammenhängende Äußerungen." },
          { id: "aussprache", name: "Kriterium 3: Aussprache (heuristisch)", weight: 0.30, maxPoints: 4.5, description: "Verständliche Aussprache und Satzmelodie." }
        ]
      },
      B1: {
        level: "B1",
        moduleName: "ÖSD Zertifikat B1 - Mündliche Prüfung",
        maxPoints: 25,
        source: "https://www.osd.at",
        verified: false,
        criteria: [
          { id: "aufgabe", name: "Kriterium 1: Aufgabenerfüllung", weight: 0.35, maxPoints: 8.75, description: "Vortrag und Dialog." },
          { id: "fluessigkeit", name: "Kriterium 2: Interaktion & Flüssigkeit", weight: 0.35, maxPoints: 8.75, description: "Zusammenhängendes Sprechen." },
          { id: "korrektheit", name: "Kriterium 3: Korrektheit & Aussprache", weight: 0.30, maxPoints: 7.5, description: "Grammatik und Aussprache." }
        ]
      },
      B2: {
        level: "B2",
        moduleName: "ÖSD Zertifikat B2 - Mündliche Prüfung",
        maxPoints: 25,
        source: "https://www.osd.at",
        verified: false,
        criteria: [
          { id: "aufgabe", name: "Kriterium 1: Aufgabenerfüllung & Inhalt", weight: 0.35, maxPoints: 8.75, description: "Komplexe Darstellungen und Argumentation." },
          { id: "fluessigkeit", name: "Kriterium 2: Diskurs & Flüssigkeit", weight: 0.35, maxPoints: 8.75, description: "Spontane und flüssige Interaktion." },
          { id: "korrektheit", name: "Kriterium 3: Formale Korrektheit & Phonetik", weight: 0.30, maxPoints: 7.5, description: "Strukturelle Sicherheit und deutliche Artikulation." }
        ]
      }
    }
  },
  dtz: {
    institution: "BAMF / telc",
    name: "DTZ Mündliche Prüfung",
    verified: false,
    source: "https://www.bamf.de",
    levels: {
      A2: {
        level: "A2",
        moduleName: "DTZ Sprechen (A2-Standard)",
        maxPoints: 20,
        source: "https://www.bamf.de",
        verified: false,
        criteria: [
          { id: "vorgaben", name: "I. Vorgaben / Inhalt", weight: 0.35, maxPoints: 7.0, description: "Leitpunkte beantworten." },
          { id: "fluessigkeit", name: "II. Flüssigkeit", weight: 0.30, maxPoints: 6.0, description: "Verständlicher Redefluss." },
          { id: "aussprache", name: "III. Aussprache & Wortschatz", weight: 0.35, maxPoints: 7.0, description: "Verständliche Phonetik." }
        ]
      },
      B1: {
        level: "B1",
        moduleName: "DTZ Sprechen (B1-Standard)",
        maxPoints: 20,
        source: "https://www.bamf.de",
        verified: false,
        criteria: [
          { id: "vorgaben", name: "I. Vorgaben / Interaktion", weight: 0.35, maxPoints: 7.0, description: "Erfahrungen und Planung." },
          { id: "fluessigkeit", name: "II. Flüssigkeit", weight: 0.30, maxPoints: 6.0, description: "Flüssiges Sprechtempo." },
          { id: "aussprache", name: "III. Korrektheit & Aussprache", weight: 0.35, maxPoints: 7.0, description: "Nebensatzstellung und Lautung." }
        ]
      }
    }
  },
  testdaf: {
    institution: "TestDaF-Institut",
    name: "TestDaF Mündlicher Ausdruck",
    verified: false,
    source: "https://www.testdaf.de",
    levels: {
      B2: {
        level: "B2",
        moduleName: "TestDaF Mündlicher Ausdruck (TDN 3/4)",
        maxPoints: 25,
        source: "https://www.testdaf.de",
        verified: false,
        criteria: [
          { id: "aufgabe", name: "Kriterium 1: Gesamteindruck & Argumentation", weight: 0.30, maxPoints: 7.5, description: "Wissenschaftsorientierte Äußerung." },
          { id: "fluessigkeit", name: "Kriterium 2: Diskurskompetenz & Flüssigkeit", weight: 0.25, maxPoints: 6.25, description: "Souveränes Sprechtempo." },
          { id: "strukturen", name: "Kriterium 3: Sprachliche Realisierung", weight: 0.25, maxPoints: 6.25, description: "Komplexe Satzgefüge." },
          { id: "fachwortschatz", name: "Kriterium 4: Fachwortschatz & Phonetik", weight: 0.20, maxPoints: 5.0, description: "Wissenschaftssprache und Artikulation." }
        ]
      }
    }
  }
};

/**
 * Returns rubric configuration for a specific institution, level, and module.
 *
 * @param {string} [institution="goethe"] - "goethe" | "telc" | "osd" | "dtz" | "testdaf"
 * @param {string} [level="A1"] - "A1" | "A2" | "B1" | "B2"
 * @param {string} [module="writing"] - "writing" | "speaking"
 * @returns {Object} Rubric details with criteria, maxPoints, and source URL
 */
export function getRubric(institution = "goethe", level = "A1", module = "writing") {
  const normInst = (institution || "goethe").toLowerCase().trim();
  const normLevel = (level || "A1").toUpperCase().trim();

  const isSpeaking = module === "speaking";
  const sourcePool = isSpeaking ? SPEAKING_RUBRICS : RUBRICS;

  const rubric = sourcePool[normInst] || sourcePool.goethe;
  const levelRubric = rubric.levels?.[normLevel] || rubric.levels?.A1 || Object.values(rubric.levels)[0];

  return {
    institution: rubric.institution,
    examName: rubric.name,
    verified: false,
    institutionSource: rubric.source,
    level: levelRubric.level,
    moduleName: levelRubric.moduleName,
    maxPoints: levelRubric.maxPoints,
    criteria: levelRubric.criteria,
    source: levelRubric.source
  };
}

export default RUBRICS;
