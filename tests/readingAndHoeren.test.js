import { describe, it, expect } from "vitest";
import readingTexts from "../src/data/readingTexts.json";
import examMockData from "../src/data/examMockData.json";
import { GERMAN_VOICE_SETUP_TIP } from "../src/hooks/useSpeech";
import { splitGermanSentences } from "../src/utils/textFormatting";

describe("Reading & Hören Enhanced Data and Pedagogical Architecture", () => {
  describe("1. Reading Question Evidence, Rationale & Taxonomy", () => {
    it("should ensure every reading question has valid evidence offsets matching the text content", () => {
      readingTexts.forEach((text) => {
        expect(text.questions.length).toBeGreaterThanOrEqual(1);

        text.questions.forEach((q) => {
          expect(q.evidence).toBeDefined();
          expect(q.evidence.start).toBeGreaterThanOrEqual(0);
          expect(q.evidence.end).toBeGreaterThan(q.evidence.start);
          expect(q.evidence.text).toBeDefined();

          // Verify slice matches evidence.text exactly
          const slicedSpan = text.content.slice(q.evidence.start, q.evidence.end);
          expect(slicedSpan).toBe(q.evidence.text);
        });
      });
    });

    it("should ensure every reading question has distractor rationales for wrong options", () => {
      readingTexts.forEach((text) => {
        text.questions.forEach((q) => {
          expect(q.distractorRationale).toBeDefined();
          expect(typeof q.distractorRationale).toBe("object");

          // For every wrong option index, there must be a rationale explaining why it is wrong
          q.options.forEach((opt, optIdx) => {
            if (optIdx !== q.correctIndex) {
              const rationale =
                q.distractorRationale[optIdx] ||
                q.distractorRationale[String(optIdx)] ||
                q.distractorRationale[opt];
              expect(rationale).toBeDefined();
              expect(typeof rationale).toBe("string");
              expect(rationale.length).toBeGreaterThan(5);
            }
          });
        });
      });
    });

    it("should assign a valid errorCategory to each reading question", () => {
      const allowedCategories = [
        "comprehension-detail",
        "comprehension-keyword-trap",
        "comprehension-negation"
      ];

      readingTexts.forEach((text) => {
        text.questions.forEach((q) => {
          expect(q.errorCategory).toBeDefined();
          expect(allowedCategories).toContain(q.errorCategory);
        });
      });
    });

    it("should provide a clear pedagogical explanation for every question", () => {
      readingTexts.forEach((text) => {
        text.questions.forEach((q) => {
          expect(q.explanation).toBeDefined();
          expect(q.explanation.length).toBeGreaterThan(5);
        });
      });
    });
  });

  describe("2. Hören Audio & Replay Limit Configuration", () => {
    it("should configure maxReplays per exam and part in examMockData", () => {
      examMockData.forEach((exam) => {
        if (exam.modules?.hoeren) {
          expect(exam.modules.hoeren.maxReplays).toBeDefined();
          expect(exam.modules.hoeren.maxReplays).toBeGreaterThanOrEqual(1);

          exam.modules.hoeren.parts?.forEach((part) => {
            expect(part.maxReplays).toBeDefined();
            expect(part.maxReplays).toBeGreaterThanOrEqual(1);
          });
        }
      });
    });

    it("should ensure each Hören question has distractor rationales and errorCategory", () => {
      examMockData.forEach((exam) => {
        exam.modules?.hoeren?.parts?.forEach((part) => {
          part.questions?.forEach((q) => {
            expect(q.errorCategory).toBeDefined();
            expect(q.distractorRationale).toBeDefined();
          });
        });
      });
    });

    it("should extract sentences cleanly from Hören audio scripts for sentence replay", () => {
      const sampleScript =
        "Guten Tag, Herr Schneider. Hier spricht Praxis Dr. Weber. Bitte kommen Sie erst um 15:30 Uhr. Vielen Dank und auf Wiederhören.";
      const sentences = splitGermanSentences(sampleScript);

      expect(sentences).toHaveLength(4);
      expect(sentences[0]).toBe("Guten Tag, Herr Schneider.");
      expect(sentences[1]).toBe("Hier spricht Praxis Dr. Weber.");
      expect(sentences[2]).toBe("Bitte kommen Sie erst um 15:30 Uhr.");
      expect(sentences[3]).toBe("Vielen Dank und auf Wiederhören.");
    });
  });

  describe("3. Speech Fallback Setup Instructions", () => {
    it("should provide actionable de-DE setup instructions for major platforms", () => {
      expect(GERMAN_VOICE_SETUP_TIP.title).toContain("German");
      expect(GERMAN_VOICE_SETUP_TIP.steps.length).toBeGreaterThanOrEqual(3);

      const combined = GERMAN_VOICE_SETUP_TIP.steps.join(" ");
      expect(combined).toContain("Windows");
      expect(combined).toContain("macOS");
      expect(combined).toContain("Chrome");
    });
  });
});
