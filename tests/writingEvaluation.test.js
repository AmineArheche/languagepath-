import { describe, it, expect } from "vitest";
import {
  evaluateWriting,
  generateOfflineWritingEvaluation,
  WritingEvaluationSchema,
  WRITING_TASKS
} from "../src/services/aiWritingService";
import { RUBRICS, getRubric } from "../src/data/rubrics/index";

describe("Writing Evaluation - Rubrics, Output Schema, & Offline Engine", () => {
  describe("1. Official Rubric Datasets (Issue 1)", () => {
    const institutions = ["goethe", "telc", "osd", "dtz", "testdaf"];

    it("should load all 5 official rubric files", () => {
      institutions.forEach((inst) => {
        expect(RUBRICS[inst]).toBeDefined();
        expect(RUBRICS[inst].institution).toBeDefined();
        expect(RUBRICS[inst].source).toMatch(/^https?:\/\//);
        expect(RUBRICS[inst].verified).toBe(false);
      });
    });

    it("should leave verified: false on all rubric levels until confirmed", () => {
      institutions.forEach((inst) => {
        const rubric = RUBRICS[inst];
        expect(rubric.verified).toBe(false);
        Object.values(rubric.levels).forEach((lvl) => {
          expect(lvl.verified).toBe(false);
          expect(lvl.source).toMatch(/^https?:\/\//);
          expect(lvl.maxPoints).toBeGreaterThan(0);
          expect(lvl.criteria.length).toBeGreaterThan(0);
          lvl.criteria.forEach((c) => {
            expect(c.maxPoints).toBeGreaterThan(0);
            expect(c.weight).toBeGreaterThan(0);
          });
        });
      });
    });

    it("should resolve correct rubric configuration via getRubric()", () => {
      const goetheA1 = getRubric("goethe", "A1");
      expect(goetheA1.institution).toContain("Goethe");
      expect(goetheA1.level).toBe("A1");
      expect(goetheA1.maxPoints).toBe(15);
      expect(goetheA1.verified).toBe(false);

      const goetheB1 = getRubric("goethe", "B1");
      expect(goetheB1.maxPoints).toBe(25);
      expect(goetheB1.criteria).toHaveLength(4);

      const telcB2 = getRubric("telc", "B2");
      expect(telcB2.institution).toContain("telc");
      expect(telcB2.maxPoints).toBe(25);
    });
  });

  describe("2. Output Schema Validation (Issue 2 & 6)", () => {
    it("should validate complete output schema with taskPoints, criteria, overall, and estimateOnly", () => {
      const payload = {
        taskPoints: [
          { required: "Grund des Schreibens", covered: true, evidence: "Ich interessiere mich für die Wohnung" },
          { required: "Mietkosten", covered: true, evidence: "Wie hoch ist die Miete?" }
        ],
        criteria: [
          { name: "Aufgabenerfüllung", score: 5.5, max: 6.0, evidence: "All points touched", fix: "Add more details" },
          { name: "Kohärenz", score: 2.5, max: 3.0, evidence: "Good flow", fix: "Use more connectors" }
        ],
        overall: 8.0,
        score: 8.0,
        estimateOnly: true,
        feedback: "Gut gemacht!",
        correctedText: "Sehr geehrter Herr Meyer...",
        mistakes: []
      };

      const parsed = WritingEvaluationSchema.parse(payload);
      expect(parsed.overall).toBe(8.0);
      expect(parsed.estimateOnly).toBe(true);
      expect(parsed.taskPoints).toHaveLength(2);
      expect(parsed.criteria).toHaveLength(2);
    });

    it("should reject payload where estimateOnly is not true", () => {
      const invalid = {
        taskPoints: [],
        criteria: [],
        overall: 10,
        estimateOnly: false
      };

      expect(() => WritingEvaluationSchema.parse(invalid)).toThrow();
    });
  });

  describe("3. Offline Fallback Heuristics ('Basic Check' - Issue 5)", () => {
    it("should flag word count shortfall vs minimum requirement", () => {
      const shortText = "Hallo, ich will eine Wohnung.";
      const task = WRITING_TASKS.A1[0];

      const res = generateOfflineWritingEvaluation({
        level: "A1",
        taskTitle: task.title,
        taskPrompt: task.prompt,
        requiredPoints: task.requiredPoints,
        targetWords: task.targetWords,
        userText: shortText
      });

      expect(res.isOffline).toBe(true);
      expect(res.estimateOnly).toBe(true);
      expect(res.apiWarning).toContain("Basic Check");
      expect(res.feedback).toMatch(/contains 5 words/i);
    });

    it("should detect V2 word order violation with regex (e.g. 'Heute ich gehe')", () => {
      const text = "Sehr geehrter Herr Meyer, heute ich gehe zum Bahnhof und ich suche eine Wohnung.";
      const task = WRITING_TASKS.A1[0];

      const res = generateOfflineWritingEvaluation({
        level: "A1",
        taskTitle: task.title,
        taskPrompt: task.prompt,
        requiredPoints: task.requiredPoints,
        targetWords: task.targetWords,
        userText: text
      });

      const v2Mistake = res.mistakes.find(
        (m) => m.category === "verb-position" && m.subcategory === "V2"
      );
      expect(v2Mistake).toBeDefined();
      expect(v2Mistake.explanation).toContain("Verb-Second (V2) rule");
      expect(v2Mistake.corrected).toContain("heute gehe ich");
    });

    it("should detect verb-final violation in subordinate clauses (e.g. 'weil ich habe keine Zeit')", () => {
      const text = "Ich kann morgen nicht kommen, weil ich habe keine Zeit.";
      const task = WRITING_TASKS.A2[1];

      const res = generateOfflineWritingEvaluation({
        level: "A2",
        taskTitle: task.title,
        taskPrompt: task.prompt,
        requiredPoints: task.requiredPoints,
        targetWords: task.targetWords,
        userText: text
      });

      const verbEndMistake = res.mistakes.find(
        (m) => m.category === "verb-position" && m.subcategory === "verb-end"
      );
      expect(verbEndMistake).toBeDefined();
      expect(verbEndMistake.explanation).toContain("verb-final");
      expect(verbEndMistake.corrected).toContain("weil ich keine Zeit habe");
    });

    it("should detect inconsistency between formal 'Sie' and informal 'du'", () => {
      const mixedText = "Sehr geehrter Herr Müller, können Sie mir bitte helfen? Ich danke dir herzlich.";
      const task = WRITING_TASKS.A2[1];

      const res = generateOfflineWritingEvaluation({
        level: "A2",
        taskTitle: task.title,
        taskPrompt: task.prompt,
        requiredPoints: task.requiredPoints,
        targetWords: task.targetWords,
        userText: mixedText
      });

      const addressMistake = res.mistakes.find(
        (m) => m.subcategory === "register-consistency"
      );
      expect(addressMistake).toBeDefined();
      expect(addressMistake.explanation).toContain("Address register conflict");
    });

    it("should reward greeting, closing, and connectors in criteria scores", () => {
      const goodText =
        "Sehr geehrte Damen und Herren,\n\nich interessiere mich sehr für die Wohnung, weil die Lage wunderbar ist. Außerdem möchte ich gerne wissen, wie hoch die Nebenkosten sind. Hätten Sie Zeit für eine Besichtigung?\n\nMit freundlichen Grüßen,\nMax Mustermann";
      const task = WRITING_TASKS.A1[0];

      const res = generateOfflineWritingEvaluation({
        level: "A1",
        taskTitle: task.title,
        taskPrompt: task.prompt,
        requiredPoints: task.requiredPoints,
        targetWords: task.targetWords,
        userText: goodText
      });

      expect(res.overall).toBeGreaterThan(10);
      const coherence = res.criteria.find((c) => c.name.toLowerCase().includes("gestaltung") || c.name.toLowerCase().includes("kohärenz"));
      expect(coherence).toBeDefined();
      expect(coherence.score).toBeGreaterThan(0);
    });
  });

  describe("4. Integration via evaluateWriting()", () => {
    it("should fall back gracefully to offline heuristic check without API key", async () => {
      const task = WRITING_TASKS.A1[0];
      const result = await evaluateWriting({
        level: "A1",
        taskTitle: task.title,
        taskPrompt: task.prompt,
        requiredPoints: task.requiredPoints,
        targetWords: task.targetWords,
        userText: "Lieber Thomas, ich lade dich zu meiner Party ein. Sie beginnt um 19 Uhr.",
        rubricInstitution: "goethe"
      });

      expect(result).toBeDefined();
      expect(result.overall).toBeGreaterThan(0);
      expect(result.score).toBe(result.overall); // backward compatibility
      expect(result.estimateOnly).toBe(true);
      expect(result.isOffline).toBe(true);
      expect(result.taskPoints).toBeDefined();
      expect(result.criteria).toBeDefined();
    });
  });
});
