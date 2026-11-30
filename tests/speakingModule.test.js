import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  computeSpeakingMetrics,
  transcribeAudioWithGemini,
  computeShadowingAccuracy,
  generateOfflineSpeakingEvaluation,
  SpeakingEvaluationSchema,
  SPEAKING_TASKS
} from "../src/services/aiSpeakingService";
import { getRubric, SPEAKING_RUBRICS } from "../src/data/rubrics/index";

describe("Speaking Module - aiSpeakingService & Metrics", () => {
  describe("computeSpeakingMetrics", () => {
    it("should calculate correct Words Per Minute (WPM) based on duration", () => {
      // 20 words in 10 seconds -> (20 / 10) * 60 = 120 WPM
      const transcript = "Ich heiße Maria und ich komme aus Spanien. Jetzt wohne ich in Berlin und lerne Deutsch an der Universität.";
      const metrics = computeSpeakingMetrics(transcript, 10);

      expect(metrics.wordCount).toBe(19);
      expect(metrics.wordsPerMinute).toBe(Math.round((19 / 10) * 60)); // 114 WPM
      expect(metrics.durationSeconds).toBe(10);
    });

    it("should handle empty or whitespace-only transcript without dividing by zero", () => {
      const metrics = computeSpeakingMetrics("   ", 0);
      expect(metrics.wordCount).toBe(0);
      expect(metrics.wordsPerMinute).toBe(0);
      expect(metrics.sentenceCount).toBe(1);
      expect(metrics.averageSentenceLength).toBe(0);
    });

    it("should detect pause count from timestamp gaps >= 1.2s", () => {
      const transcript = "Hallo ich bin Stefan. Ich wohne in München.";
      const timestamps = [
        { start: 0.0, end: 1.5 },
        { start: 3.0, end: 4.2 }, // gap = 3.0 - 1.5 = 1.5s (>= 1.2s -> pause!)
        { start: 4.5, end: 5.5 }, // gap = 4.5 - 4.2 = 0.3s (< 1.2s -> not a pause)
        { start: 7.0, end: 8.0 }  // gap = 7.0 - 5.5 = 1.5s (>= 1.2s -> pause!)
      ];

      const metrics = computeSpeakingMetrics(transcript, 8, timestamps);
      expect(metrics.pauseCount).toBe(2);
    });

    it("should detect German filler words (äh, ähm, mhm, etc.) accurately and case-insensitively", () => {
      const transcript = "Guten Tag, Äh ich möchte mich vorstellen. Ähm mein Name ist Lucas und mhm ich lerne Deutsch.";
      const metrics = computeSpeakingMetrics(transcript, 15);

      expect(metrics.fillers.count).toBe(3);
      expect(metrics.fillers.words).toContain("äh");
      expect(metrics.fillers.words).toContain("ähm");
      expect(metrics.fillers.words).toContain("mhm");
    });

    it("should calculate average sentence length accurately", () => {
      const transcript = "Ich lerne Deutsch. Das ist sehr interessant.";
      const metrics = computeSpeakingMetrics(transcript, 5);

      expect(metrics.sentenceCount).toBe(2);
      expect(metrics.wordCount).toBe(7);
      expect(metrics.averageSentenceLength).toBe(3.5);
    });

    it("should detect subordinate clauses introduced by German subjunctions", () => {
      const transcript = "Ich freue mich, weil ich heute Zeit habe, obwohl das Wetter schlecht ist.";
      const metrics = computeSpeakingMetrics(transcript, 10);

      expect(metrics.subordinateClausesUsed.count).toBe(2);
      expect(metrics.subordinateClausesUsed.list).toContain("weil");
      expect(metrics.subordinateClausesUsed.list).toContain("obwohl");
    });

    it("should score 100% verb-end accuracy when finite verbs are placed at the end of Nebensätze", () => {
      const transcript = "Ich lerne Deutsch, weil ich in Deutschland arbeiten möchte.";
      const metrics = computeSpeakingMetrics(transcript, 10);

      expect(metrics.verbEndAccuracy.total).toBe(1);
      expect(metrics.verbEndAccuracy.correct).toBe(1);
      expect(metrics.verbEndAccuracy.accuracyPercent).toBe(100);
    });

    it("should penalize verb-end accuracy when finite verb is placed early in Nebensatz (V2 error in Nebensatz)", () => {
      // In German: "weil ich habe keine Zeit" is ungrammatical (finite verb 'habe' placed in position 2 instead of end)
      const transcript = "Ich komme nicht, weil ich habe keine Zeit.";
      const metrics = computeSpeakingMetrics(transcript, 10);

      expect(metrics.verbEndAccuracy.total).toBe(1);
      expect(metrics.verbEndAccuracy.correct).toBe(0);
      expect(metrics.verbEndAccuracy.accuracyPercent).toBe(0);
    });
  });

  describe("transcribeAudioWithGemini - Privacy & Consent Gates", () => {
    it("should throw an explicit error if user consent has not been granted (never upload audio silently)", async () => {
      const dummyBlob = new Blob(["fake-audio"], { type: "audio/webm" });

      // Explicitly pass hasConsent = false and mock localStorage without consent
      await expect(
        transcribeAudioWithGemini(dummyBlob, "test-api-key", "gemini-1.5-flash", false)
      ).rejects.toThrow(/Explicit user consent is required/i);
    });

    it("should throw an error when API key is missing even if consent is given", async () => {
      const dummyBlob = new Blob(["fake-audio"], { type: "audio/webm" });

      await expect(
        transcribeAudioWithGemini(dummyBlob, "", "gemini-1.5-flash", true)
      ).rejects.toThrow(/Gemini API key is required/i);
    });
  });

  describe("computeShadowingAccuracy", () => {
    it("should return 100% accuracy when student transcript matches model sentence", () => {
      const model = "Guten Tag, mein Name ist Martin und ich wohne in Berlin.";
      const student = "Guten Tag mein Name ist Martin und ich wohne in Berlin";

      const res = computeShadowingAccuracy(model, student);
      expect(res.accuracyPercent).toBe(100);
      expect(res.matchCount).toBe(res.totalWords);
      expect(res.diffWords.every((w) => w.matched)).toBe(true);
    });

    it("should calculate partial match percentage and provide word diffs for discrepancies", () => {
      const model = "Ich möchte gerne ein Glas Wasser bestellen.";
      const student = "Ich möchte ein Glas Tee";

      const res = computeShadowingAccuracy(model, student);
      expect(res.totalWords).toBe(7);
      // matched: ich, möchte, ein, glas (4 of 7 = 57%)
      expect(res.matchCount).toBe(4);
      expect(res.accuracyPercent).toBe(57);

      const wasserDiff = res.diffWords.find((w) => w.word === "wasser");
      expect(wasserDiff.matched).toBe(false);
    });

    it("should handle empty or whitespace input gracefully", () => {
      const res = computeShadowingAccuracy("", "");
      expect(res.accuracyPercent).toBe(0);
      expect(res.totalWords).toBe(0);
    });
  });

  describe("generateOfflineSpeakingEvaluation", () => {
    it("should produce a valid evaluation conforming to SpeakingEvaluationSchema with estimateOnly: true", () => {
      const evalRes = generateOfflineSpeakingEvaluation({
        transcript: "Guten Tag, ich heiße Maria. Ich komme aus Spanien und ich wohne jetzt in Köln.",
        level: "A1",
        taskTitle: "Sich vorstellen",
        rubricInstitution: "goethe",
        durationSeconds: 15
      });

      // Strict Zod schema check
      const parsed = SpeakingEvaluationSchema.parse(evalRes);
      expect(parsed.estimateOnly).toBe(true);
      expect(parsed.isOffline).toBe(true);
      expect(parsed.overall).toBeGreaterThan(0);
      expect(parsed.criteria.length).toBeGreaterThan(0);
      expect(parsed.rubricMaxPoints).toBe(15); // Goethe A1 oral is 15 Pkt
      expect(parsed.pronunciationDisclaimer).toContain("Browser speech recognition transcribes words phonetically");
      expect(parsed.correctedSentence).toBeTruthy();
    });

    it("should evaluate criteria against official telc B1 speaking rubric with 25 max points", () => {
      const evalRes = generateOfflineSpeakingEvaluation({
        transcript: "Mein Thema ist Urlaub im eigenen Land. Das hat viele Vorteile, weil man weniger Geld ausgibt.",
        level: "B1",
        taskTitle: "Präsentation",
        rubricInstitution: "telc",
        durationSeconds: 25
      });

      expect(evalRes.rubricInstitution).toBe("telc");
      expect(evalRes.rubricMaxPoints).toBe(25);
      expect(evalRes.overall).toBeLessThanOrEqual(25);
    });
  });

  describe("Official Speaking Rubrics Integration", () => {
    const fullRangeInstitutions = ["goethe", "telc", "osd"];

    it.each(fullRangeInstitutions)("should provide valid speaking rubric for %s across A1-B2", (inst) => {
      const rubricA1 = getRubric(inst, "A1", "speaking");
      expect(rubricA1.institution).toBeTruthy();
      expect(rubricA1.maxPoints).toBeGreaterThan(0);
      expect(rubricA1.criteria.length).toBeGreaterThan(0);
      expect(rubricA1.verified).toBe(false); // labeled verified: false as required

      const rubricB2 = getRubric(inst, "B2", "speaking");
      expect(rubricB2.level).toBe("B2");
      expect(rubricB2.criteria.length).toBeGreaterThan(0);
      expect(rubricB2.verified).toBe(false);
    });

    it("should provide valid DTZ speaking rubrics for integration exam levels (A2 and B1)", () => {
      const dtzA2 = getRubric("dtz", "A2", "speaking");
      expect(dtzA2.level).toBe("A2");
      expect(dtzA2.maxPoints).toBe(20);
      expect(dtzA2.criteria.length).toBe(3);

      const dtzB1 = getRubric("dtz", "B1", "speaking");
      expect(dtzB1.level).toBe("B1");
      expect(dtzB1.maxPoints).toBe(20);
      expect(dtzB1.criteria.length).toBe(3);
    });

    it("should provide valid TestDaF speaking rubric for academic level (B2)", () => {
      const testdafB2 = getRubric("testdaf", "B2", "speaking");
      expect(testdafB2.level).toBe("B2");
      expect(testdafB2.maxPoints).toBe(25);
      expect(testdafB2.criteria.length).toBe(4);
    });
  });

  describe("SPEAKING_TASKS Library", () => {
    const levels = ["A1", "A2", "B1", "B2"];

    it.each(levels)("should provide authentic speaking tasks for %s with required fields", (lvl) => {
      const tasks = SPEAKING_TASKS[lvl];
      expect(Array.isArray(tasks)).toBe(true);
      expect(tasks.length).toBeGreaterThan(0);

      tasks.forEach((task) => {
        expect(task.id).toBeTruthy();
        expect(task.title).toBeTruthy();
        expect(task.promptAudio).toBeTruthy();
        expect(Array.isArray(task.guidelines)).toBe(true);
        expect(task.guidelines.length).toBeGreaterThan(0);
        expect(task.modelAnswer).toBeTruthy();
      });
    });
  });
});
