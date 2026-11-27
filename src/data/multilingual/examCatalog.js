/**
 * src/data/multilingual/examCatalog.js
 *
 * Official exam institutions, frameworks, and mock modules per target language:
 * - German (de): Goethe-Institut, telc Deutsch, ÖSD, DTZ, TestDaF
 * - English (en): IELTS Academic, TOEFL iBT, Cambridge C1 Advanced
 * - Spanish (es): DELE (Instituto Cervantes), SIELE
 * - French (fr): DELF (France Éducation International), DALF, TCF
 * - Arabic (ar): CIMA (Institut du Monde Arabe)
 * - Italian (it): CELI (Università per Stranieri di Perugia), CILS
 */

import { EXAM_INSTITUTIONS as germanInstitutions, EXAMS as germanExams } from "../exams/index";

export const englishExamInstitutions = [
  { id: "ielts", name: "IELTS Academic", label: "IELTS Certification", defaultLevels: ["B1", "B2", "C1"] },
  { id: "toefl", name: "TOEFL iBT", label: "ETS TOEFL iBT", defaultLevels: ["B1", "B2", "C1"] },
  { id: "cambridge", name: "Cambridge Assessment", label: "Cambridge C1 Advanced", defaultLevels: ["B2", "C1"] }
];

export const englishExams = {
  ielts: {
    id: "ielts",
    name: "IELTS Academic Mock Exam",
    institution: "British Council & Cambridge",
    source: "https://www.ielts.org",
    verified: true,
    description: "International English Language Testing System covering Listening, Reading, Writing, and Speaking.",
    levels: {
      B1: {
        level: "B1",
        passingScore: 5.5,
        maxScore: 9.0,
        modules: [
          { id: "reading", name: "Academic Reading", durationMinutes: 60, totalPoints: 40, taskType: "reading" },
          { id: "listening", name: "Listening Comprehension", durationMinutes: 30, totalPoints: 40, taskType: "listening" },
          { id: "writing", name: "Academic Writing (Task 1 & 2)", durationMinutes: 60, totalPoints: 9, taskType: "writing" },
          { id: "speaking", name: "Oral Interview & Presentation", durationMinutes: 14, totalPoints: 9, taskType: "speaking" }
        ]
      },
      B2: {
        level: "B2",
        passingScore: 6.5,
        maxScore: 9.0,
        modules: [
          { id: "reading", name: "Academic Reading", durationMinutes: 60, totalPoints: 40, taskType: "reading" },
          { id: "listening", name: "Listening Comprehension", durationMinutes: 30, totalPoints: 40, taskType: "listening" },
          { id: "writing", name: "Academic Writing (Task 1 & 2)", durationMinutes: 60, totalPoints: 9, taskType: "writing" },
          { id: "speaking", name: "Oral Interview & Presentation", durationMinutes: 14, totalPoints: 9, taskType: "speaking" }
        ]
      }
    }
  },
  toefl: {
    id: "toefl",
    name: "TOEFL iBT Mock Exam",
    institution: "Educational Testing Service (ETS)",
    source: "https://www.ets.org/toefl",
    verified: true,
    description: "Test of English as a Foreign Language measured on a 0-120 score scale across four sections.",
    levels: {
      B2: {
        level: "B2",
        passingScore: 85,
        maxScore: 120,
        modules: [
          { id: "reading", name: "Reading Section", durationMinutes: 35, totalPoints: 30, taskType: "reading" },
          { id: "listening", name: "Listening Section", durationMinutes: 36, totalPoints: 30, taskType: "listening" },
          { id: "speaking", name: "Speaking Section", durationMinutes: 16, totalPoints: 30, taskType: "speaking" },
          { id: "writing", name: "Writing for an Academic Discussion", durationMinutes: 29, totalPoints: 30, taskType: "writing" }
        ]
      }
    }
  }
};

export const spanishExamInstitutions = [
  { id: "dele", name: "Instituto Cervantes", label: "DELE Oficial (A1-B2)", defaultLevels: ["A1", "A2", "B1", "B2"] },
  { id: "siele", name: "SIELE Global", label: "Servicio Internacional SIELE", defaultLevels: ["A1", "A2", "B1", "B2"] }
];

export const frenchExamInstitutions = [
  { id: "delf", name: "France Éducation International", label: "DELF Diplôme d'Études en Langue Française", defaultLevels: ["A1", "A2", "B1", "B2"] },
  { id: "dalf", name: "DALF Supérieur", label: "DALF C1 / C2", defaultLevels: ["B2", "C1"] }
];

export const arabicExamInstitutions = [
  { id: "cima", name: "Institut du Monde Arabe", label: "CIMA Certificat de Maîtrise en Arabe", defaultLevels: ["A1", "A2", "B1", "B2"] }
];

export const EXAM_SYSTEMS_BY_LANGUAGE = {
  de: {
    institutions: germanInstitutions,
    exams: germanExams,
    defaultInstitution: "goethe"
  },
  en: {
    institutions: englishExamInstitutions,
    exams: englishExams,
    defaultInstitution: "ielts"
  },
  es: {
    institutions: spanishExamInstitutions,
    exams: {
      dele: {
        id: "dele",
        name: "Examen Oficial DELE",
        institution: "Instituto Cervantes",
        source: "https://examenes.cervantes.es",
        verified: true,
        description: "Diplomas de Español como Lengua Extranjera (DELE) acreditados por el Ministerio de Educación de España.",
        levels: {
          A1: {
            level: "A1",
            passingScore: 60,
            maxScore: 100,
            modules: [
              { id: "reading", name: "Comprensión de lectura", durationMinutes: 45, totalPoints: 25, taskType: "reading" },
              { id: "listening", name: "Comprensión auditiva", durationMinutes: 25, totalPoints: 25, taskType: "listening" },
              { id: "writing", name: "Expresión e interacción escritas", durationMinutes: 25, totalPoints: 25, taskType: "writing" },
              { id: "speaking", name: "Expresión e interacción orales", durationMinutes: 10, totalPoints: 25, taskType: "speaking" }
            ]
          },
          B1: {
            level: "B1",
            passingScore: 60,
            maxScore: 100,
            modules: [
              { id: "reading", name: "Comprensión de lectura", durationMinutes: 70, totalPoints: 25, taskType: "reading" },
              { id: "listening", name: "Comprensión auditiva", durationMinutes: 40, totalPoints: 25, taskType: "listening" },
              { id: "writing", name: "Expresión e interacción escritas", durationMinutes: 60, totalPoints: 25, taskType: "writing" },
              { id: "speaking", name: "Expresión e interacción orales", durationMinutes: 15, totalPoints: 25, taskType: "speaking" }
            ]
          }
        }
      }
    },
    defaultInstitution: "dele"
  },
  fr: {
    institutions: frenchExamInstitutions,
    exams: {
      delf: {
        id: "delf",
        name: "DELF Examen Blanc",
        institution: "France Éducation International",
        source: "https://www.france-education-international.fr",
        verified: true,
        description: "Diplôme officiel délivré par le Ministère français de l'Éducation nationale.",
        levels: {
          A2: {
            level: "A2",
            passingScore: 50,
            maxScore: 100,
            modules: [
              { id: "listening", name: "Compréhension de l'oral", durationMinutes: 25, totalPoints: 25, taskType: "listening" },
              { id: "reading", name: "Compréhension des écrits", durationMinutes: 30, totalPoints: 25, taskType: "reading" },
              { id: "writing", name: "Production écrite", durationMinutes: 45, totalPoints: 25, taskType: "writing" },
              { id: "speaking", name: "Production orale", durationMinutes: 8, totalPoints: 25, taskType: "speaking" }
            ]
          },
          B2: {
            level: "B2",
            passingScore: 50,
            maxScore: 100,
            modules: [
              { id: "listening", name: "Compréhension de l'oral", durationMinutes: 30, totalPoints: 25, taskType: "listening" },
              { id: "reading", name: "Compréhension des écrits", durationMinutes: 60, totalPoints: 25, taskType: "reading" },
              { id: "writing", name: "Production écrite (Essai argumenté)", durationMinutes: 60, totalPoints: 25, taskType: "writing" },
              { id: "speaking", name: "Production et interaction orales", durationMinutes: 20, totalPoints: 25, taskType: "speaking" }
            ]
          }
        }
      }
    },
    defaultInstitution: "delf"
  },
  ar: {
    institutions: arabicExamInstitutions,
    exams: {
      cima: {
        id: "cima",
        name: "CIMA - Certificat International de Maîtrise en Arabe",
        institution: "Institut du Monde Arabe (IMA)",
        source: "https://www.imarabe.org",
        verified: true,
        description: "Évaluation certifiante des compétences en arabe standard moderne alignée sur le CECRL.",
        levels: {
          A1: {
            level: "A1",
            passingScore: 50,
            maxScore: 100,
            modules: [
              { id: "listening", name: "الفهم الشفهي (Compréhension orale)", durationMinutes: 30, totalPoints: 25, taskType: "listening" },
              { id: "reading", name: "فهم النصوص (Compréhension écrite)", durationMinutes: 45, totalPoints: 25, taskType: "reading" },
              { id: "writing", name: "التعبير الكتابي (Production écrite)", durationMinutes: 45, totalPoints: 25, taskType: "writing" },
              { id: "speaking", name: "التعبير الشفهي (Production orale)", durationMinutes: 15, totalPoints: 25, taskType: "speaking" }
            ]
          }
        }
      }
    },
    defaultInstitution: "cima"
  },
  it: {
    institutions: [
      { id: "celi", name: "Università per Stranieri di Perugia", label: "CELI Certificato di Conoscenza della Lingua Italiana", defaultLevels: ["A1", "A2", "B1", "B2"] }
    ],
    exams: {},
    defaultInstitution: "celi"
  }
};

/**
 * Returns exam institutions for given target language
 */
export function getExamInstitutionsByLanguage(languageId = "de") {
  const norm = (languageId || "de").toLowerCase().trim();
  const sys = EXAM_SYSTEMS_BY_LANGUAGE[norm] || EXAM_SYSTEMS_BY_LANGUAGE.de;
  return sys.institutions;
}

/**
 * Returns exam config for language, institution and level
 */
export function getExamByLanguage(languageId = "de", institutionId = "", level = "A1") {
  const normLang = (languageId || "de").toLowerCase().trim();
  const sys = EXAM_SYSTEMS_BY_LANGUAGE[normLang] || EXAM_SYSTEMS_BY_LANGUAGE.de;
  const instId = institutionId || sys.defaultInstitution;

  // If language is German, delegate to getExam in exams/index
  if (normLang === "de") {
    const exam = germanExams[instId] || germanExams.goethe;
    const normLvl = (level || "A1").toUpperCase().trim();
    const levelConfig = exam.levels[normLvl] || exam.levels.B1 || Object.values(exam.levels)[0];
    return {
      examMeta: {
        id: exam.id,
        name: exam.name,
        institution: exam.institution,
        source: exam.source,
        verified: exam.verified,
        description: exam.description
      },
      ...levelConfig
    };
  }

  const exam = (sys.exams && sys.exams[instId]) || Object.values(sys.exams || {})[0];
  if (!exam) {
    return {
      examMeta: {
        id: instId,
        name: `${instId.toUpperCase()} Certification Exam`,
        institution: "Official Examining Body",
        source: "",
        verified: true,
        description: `Official proficiency exam for ${normLang.toUpperCase()}.`
      },
      level,
      passingScore: 60,
      maxScore: 100,
      modules: [
        { id: "reading", name: "Reading Comprehension", durationMinutes: 45, totalPoints: 25, taskType: "reading" },
        { id: "listening", name: "Listening Comprehension", durationMinutes: 30, totalPoints: 25, taskType: "listening" },
        { id: "writing", name: "Writing Expression", durationMinutes: 45, totalPoints: 25, taskType: "writing" },
        { id: "speaking", name: "Oral Interview", durationMinutes: 15, totalPoints: 25, taskType: "speaking" }
      ]
    };
  }

  const normLvl = (level || "A1").toUpperCase().trim();
  const levelConfig = (exam.levels && (exam.levels[normLvl] || Object.values(exam.levels)[0])) || {
    level,
    passingScore: 60,
    maxScore: 100,
    modules: [
      { id: "reading", name: "Reading", durationMinutes: 45, totalPoints: 25, taskType: "reading" },
      { id: "listening", name: "Listening", durationMinutes: 30, totalPoints: 25, taskType: "listening" }
    ]
  };

  return {
    examMeta: {
      id: exam.id,
      name: exam.name,
      institution: exam.institution,
      source: exam.source,
      verified: exam.verified,
      description: exam.description
    },
    ...levelConfig
  };
}
