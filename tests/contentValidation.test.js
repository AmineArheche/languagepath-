import { describe, it, expect, beforeEach } from "vitest";
import {
  FlashcardSchema,
  GrammarExerciseSchema,
  ReadingTextSchema,
  validateItem
} from "../src/data/schemas/contentSchemas";
import { analyzeNounGender, NOUN_GENDER_RULES } from "../src/data/nounGenderRules";
import {
  loadLevelCurriculum,
  loadFlashcardsByLevel,
  loadReadingTexts,
  clearContentCache
} from "../src/data/contentLoader";

describe("Content Schemas & Linguistic Validation", () => {
  describe("FlashcardSchema", () => {
    it("validates a standard noun flashcard successfully", () => {
      const validNoun = {
        id: "fc-a1-wohnen-tisch",
        level: "A1",
        topic: "Wohnen",
        tags: ["furniture", "wohnen"],
        source: "deutschpath-core",
        reviewedBy: "human",
        german: "Tisch",
        article: "der",
        gender: "masculine",
        english: "table",
        plural: "die Tische",
        exampleDe: "Das Buch liegt auf dem Tisch.",
        exampleEn: "The book is lying on the table."
      };

      const result = FlashcardSchema.safeParse(validNoun);
      expect(result.success).toBe(true);
    });

    it("rejects mismatched article and grammatical gender", () => {
      const mismatched = {
        id: "fc-a1-mismatch",
        level: "A1",
        topic: "Wohnen",
        german: "Tisch",
        article: "der",
        gender: "feminine", // mismatch! der is masculine
        english: "table",
        plural: "die Tische",
        exampleDe: "Das Buch liegt auf dem Tisch.",
        exampleEn: "The book is lying on the table."
      };

      const result = FlashcardSchema.safeParse(mismatched);
      expect(result.success).toBe(false);
      const err = result.error.issues.find((i) => i.path.includes("gender"));
      expect(err).toBeDefined();
      expect(err.message).toContain("Article 'der' does not match gender 'feminine'");
    });

    it("rejects nouns with articles that omit plural forms", () => {
      const noPlural = {
        id: "fc-a1-no-plural",
        level: "A1",
        topic: "Wohnen",
        german: "Stuhl",
        article: "der",
        gender: "masculine",
        english: "chair",
        plural: "", // missing
        exampleDe: "Ich sitze auf dem Stuhl.",
        exampleEn: "I sit on the chair."
      };

      const result = FlashcardSchema.safeParse(noPlural);
      expect(result.success).toBe(false);
      const err = result.error.issues.find((i) => i.path.includes("plural"));
      expect(err).toBeDefined();
      expect(err.message).toContain("must specify a plural form");
    });

    it("rejects example sentence that does not contain the headword or stem", () => {
      const unrelatedExample = {
        id: "fc-a1-unrelated",
        level: "A1",
        topic: "Food",
        german: "Apfel",
        article: "der",
        gender: "masculine",
        english: "apple",
        plural: "die Äpfel",
        exampleDe: "Das Auto fährt sehr schnell auf der Straße.", // No apple!
        exampleEn: "The car drives very fast on the street."
      };

      const result = FlashcardSchema.safeParse(unrelatedExample);
      expect(result.success).toBe(false);
      const err = result.error.issues.find((i) => i.path.includes("exampleDe"));
      expect(err).toBeDefined();
      expect(err.message).toContain("must contain the headword 'Apfel'");
    });

    it("accepts example sentence containing inflected stem or umlauted plural", () => {
      const inflected = {
        id: "fc-a1-inflected",
        level: "A1",
        topic: "Food",
        german: "Apfel",
        article: "der",
        gender: "masculine",
        english: "apple",
        plural: "die Äpfel",
        exampleDe: "Ich esse gern frische Äpfel.", // Plural form Äpfel contains stem
        exampleEn: "I like to eat fresh apples."
      };

      const result = FlashcardSchema.safeParse(inflected);
      expect(result.success).toBe(true);
    });

    it("rejects invalid CEFR levels outside A1-B2", () => {
      const badLevel = {
        id: "fc-c1-advanced",
        level: "C1", // DeutschPath targets A1-B2
        topic: "Academic",
        german: "Wissenschaft",
        article: "die",
        gender: "feminine",
        english: "science",
        plural: "die Wissenschaften",
        exampleDe: "Die Wissenschaft macht Fortschritte.",
        exampleEn: "Science makes progress."
      };

      const result = FlashcardSchema.safeParse(badLevel);
      expect(result.success).toBe(false);
    });
  });

  describe("GrammarExerciseSchema", () => {
    it("validates multiple-choice and fill-blank exercises", () => {
      const validExercise = {
        id: "gr-a1-articles-1",
        level: "A1",
        topic: "Articles",
        topicLabel: "Definite Articles",
        prompt: "Das ist _____ Tisch.",
        options: ["der", "die", "das", "den"],
        correctAnswer: "der",
        explanation: "'Tisch' is masculine Nominative."
      };

      const result = GrammarExerciseSchema.safeParse(validExercise);
      expect(result.success).toBe(true);
    });

    it("rejects exercise when correctAnswer is not included in options", () => {
      const invalidAnswer = {
        id: "gr-a1-bad-opt",
        level: "A1",
        topic: "Articles",
        topicLabel: "Definite Articles",
        prompt: "Das ist _____ Haus.",
        options: ["der", "die", "den"], // "das" is missing
        correctAnswer: "das",
        explanation: "'Haus' is neuter."
      };

      const result = GrammarExerciseSchema.safeParse(invalidAnswer);
      expect(result.success).toBe(false);
      const err = result.error.issues.find((i) => i.path.includes("correctAnswer"));
      expect(err).toBeDefined();
    });

    it("validates sentence-order exercise with words and correctOrder", () => {
      const sentenceOrder = {
        id: "gr-a1-order-1",
        type: "sentence-order",
        level: "A1",
        topic: "Syntax",
        topicLabel: "Verb Second Position",
        prompt: "Reorder the words into a statement:",
        words: ["trinke", "Ich", "Kaffee"],
        correctOrder: ["Ich", "trinke", "Kaffee"],
        explanation: "Verb occupies position 2."
      };

      const result = GrammarExerciseSchema.safeParse(sentenceOrder);
      expect(result.success).toBe(true);
    });
  });

  describe("ReadingTextSchema", () => {
    it("validates reading passage with comprehension questions", () => {
      const text = {
        id: "read-a1-test",
        level: "A1",
        topic: "Daily Life",
        title: "Mein Morgen",
        englishTitle: "My Morning",
        content: "Guten Morgen! Jeden Tag trinke ich um sieben Uhr einen Kaffee und lese die Zeitung.",
        questions: [
          {
            id: "q1",
            question: "Was trinkt er morgens?",
            options: ["Tee", "Kaffee", "Milch"],
            correctIndex: 1,
            explanation: "Er trinkt Kaffee."
          }
        ]
      };

      const result = ReadingTextSchema.safeParse(text);
      expect(result.success).toBe(true);
    });
  });
});

describe("Noun Gender Rules & Linguistic Morphology", () => {
  it("correctly identifies feminine suffix patterns (-ung, -heit, -keit, -schaft, -ion)", () => {
    expect(analyzeNounGender("Wohnung").predictedGender).toBe("die");
    expect(analyzeNounGender("Freiheit").predictedGender).toBe("die");
    expect(analyzeNounGender("Möglichkeit").predictedGender).toBe("die");
    expect(analyzeNounGender("Freundschaft").predictedGender).toBe("die");
    expect(analyzeNounGender("Station").predictedGender).toBe("die");
    expect(analyzeNounGender("Universität").predictedGender).toBe("die");
  });

  it("correctly identifies neuter suffix patterns (-chen, -lein, -ment, -um)", () => {
    expect(analyzeNounGender("Mädchen").predictedGender).toBe("das");
    expect(analyzeNounGender("Brötchen").predictedGender).toBe("das");
    expect(analyzeNounGender("Dokument").predictedGender).toBe("das");
    expect(analyzeNounGender("Zentrum").predictedGender).toBe("das");
  });

  it("correctly identifies masculine suffix patterns (-er, -ling, -ismus, -or)", () => {
    expect(analyzeNounGender("Schmetterling").predictedGender).toBe("der");
    expect(analyzeNounGender("Optimismus").predictedGender).toBe("der");
    expect(analyzeNounGender("Motor").predictedGender).toBe("der");
  });

  it("identifies documented linguistic exceptions", () => {
    // "der Sprung" ends in -ung but is a masculine root noun
    const sprung = analyzeNounGender("Sprung");
    expect(sprung.isException).toBe(true);
    expect(sprung.predictedGender).toBe("der");

    // "das Fenster" ends in -er but is neuter
    const fenster = analyzeNounGender("Fenster");
    expect(fenster.isException).toBe(true);
    expect(fenster.predictedGender).toBe("das");
  });
});

describe("Dynamic Content Loader", () => {
  beforeEach(() => {
    clearContentCache();
  });

  it("lazy-loads A1 curriculum dynamically", async () => {
    const a1 = await loadLevelCurriculum("A1");
    expect(a1).toBeDefined();
    expect(a1.id).toBe("A1");
    expect(a1.units.length).toBeGreaterThan(0);
  });

  it("lazy-loads A1 flashcards dynamically", async () => {
    const flashcards = await loadFlashcardsByLevel("A1");
    expect(Array.isArray(flashcards)).toBe(true);
    expect(flashcards.length).toBe(50);
  });

  it("lazy-loads reading texts filtered by level", async () => {
    const a1Texts = await loadReadingTexts("A1");
    expect(Array.isArray(a1Texts)).toBe(true);
    expect(a1Texts.length).toBeGreaterThan(0);
    expect(a1Texts.every((t) => t.level === "A1")).toBe(true);
  });
});
