import { describe, it, expect } from "vitest";
import {
  EXAMS,
  EXAM_INSTITUTIONS,
  getExam,
  getAvailableLevelsForExam,
  evaluateExamAttempt
} from "../src/data/exams/index";

describe("Data-Driven Exam Architecture & Real Task Formats", () => {
  describe("Exam Declarations & Metadata", () => {
    const institutionIds = ["goethe", "telc", "osd", "dtz", "testdaf"];

    it.each(institutionIds)("exam '%s' must declare valid metadata and verified: false", (id) => {
      const exam = EXAMS[id];
      expect(exam).toBeDefined();
      expect(exam.id).toBe(id);
      expect(exam.name).toBeTruthy();
      expect(exam.institution).toBeTruthy();
      expect(exam.source).toMatch(/^https?:\/\//); // Must have valid official source URL
      expect(exam.verified).toBe(false); // Non-negotiable requirement
      expect(exam.levels).toBeDefined();
    });

    it("should provide C1 stub across major exams so levels A1-C1 are purely data-driven", () => {
      const goetheC1 = getExam("goethe", "C1");
      expect(goetheC1.level).toBe("C1");
      expect(goetheC1.modules.length).toBe(4);
      expect(goetheC1.passRules.verified).toBe(false);

      const telcC1 = getExam("telc", "C1");
      expect(telcC1.level).toBe("C1");
      expect(telcC1.modules.some((m) => m.id === "sprachbausteine")).toBe(true);

      const testdafC1 = getExam("testdaf", "C1");
      expect(testdafC1.level).toBe("C1");
    });

    it("should not hardcode 25 points each for all exams (telc has 75, 30, 45 Pkt)", () => {
      const telcB1 = getExam("telc", "B1");
      const lesenMod = telcB1.modules.find((m) => m.id === "lesen");
      const sbMod = telcB1.modules.find((m) => m.id === "sprachbausteine");
      const schrMod = telcB1.modules.find((m) => m.id === "schreiben");

      expect(lesenMod.points).toBe(75);
      expect(sbMod.points).toBe(30);
      expect(schrMod.points).toBe(45);
      expect(telcB1.passRules.maxScore).toBe(300);
    });
  });

  describe("telc Separate Written vs Oral Pass Evaluation", () => {
    it("should PASS when both written (>=60%) and oral (>=60%) reach threshold", () => {
      const telcB1 = getExam("telc", "B1");

      // Answers producing high written score + passing oral score
      const answers = {
        "telc-b1-l-1": 0, // 37.5
        "telc-b1-l-2": 0, // 37.5 -> 75 on Lesen
        "telc-b1-sb-1": 0, // 3
        "telc-b1-sb-2": 1, // 3
        "telc-b1-sb-3": 0, // 3
        "telc-b1-sb-4": 1, // 3
        "telc-b1-sb-5": 1, // 3 -> 15 on Sprachbausteine
        "telc-b1-h-1": 0,  // 75 on Hoeren
        "telc-b1-w-1": "Hier ist ein langer Brief mit mehr als 80 Wörtern, in dem ich höflich um Auskunft zu Kurszeiten, Preisen und Einstufungstests bitte. Ich habe großes Interesse an einem Abendkurs bei Ihrer Sprachschule.",
        sp_0: { overall: 60 } // 60/75 on Sprechen (80%)
      };

      const result = evaluateExamAttempt({
        exam: telcB1.examMeta,
        levelConfig: telcB1,
        answers,
        elapsedSeconds: 3600
      });

      expect(result.passed).toBe(true);
      expect(result.writtenPart.passed).toBe(true);
      expect(result.oralPart.passed).toBe(true);
      expect(result.grade).toMatch(/Sehr gut|Gut|Befriedigend|Ausreichend/);
    });

    it("should FAIL overall if written passes but oral (<60%) fails (telc regulation)", () => {
      const telcB1 = getExam("telc", "B1");

      const answers = {
        "telc-b1-l-1": 0,
        "telc-b1-l-2": 0,
        "telc-b1-h-1": 0,
        sp_0: { overall: 20 } // 20 out of 75 = 26.6% (< 60% threshold!)
      };

      const result = evaluateExamAttempt({
        exam: telcB1.examMeta,
        levelConfig: telcB1,
        answers,
        elapsedSeconds: 3600
      });

      expect(result.passed).toBe(false);
      expect(result.writtenPart.passed).toBe(true);
      expect(result.oralPart.passed).toBe(false);
      expect(result.grade).toContain("Teilprüfung bestanden (Schriftlich)");
      expect(result.details).toContain("Mündliche Nachprüfung innerhalb von 12 Monaten");
    });
  });

  describe("DTZ Dual Scaled Evaluation (A2 - B1)", () => {
    it("should award B1 certificate when Sprechen >= B1 AND written part >= B1", () => {
      const dtzConfig = getExam("dtz", "B1");

      const answers = {
        "dtz-hl-1": 0, // 22.5
        "dtz-hl-2": 0, // 22.5 -> 45/45 on Hoeren/Lesen (>= 33 B1 threshold)
        sp_0: { overall: 85 } // 85/100 on Sprechen (>= 75 B1 threshold)
      };

      const result = evaluateExamAttempt({
        exam: dtzConfig.examMeta,
        levelConfig: dtzConfig,
        answers,
        elapsedSeconds: 3000
      });

      expect(result.passed).toBe(true);
      expect(result.grade).toContain("B1 Gesamtzertifikat");
    });

    it("should award A2 certificate if candidate meets A2 criteria but misses B1 in Sprechen", () => {
      const dtzConfig = getExam("dtz", "A2");

      const answers = {
        "dtz-hl-1": 0, // 22.5 on Hoeren/Lesen (>= 20 A2 threshold)
        sp_0: { overall: 60 } // 60/100 on Sprechen (>= 50 A2 threshold, but < 75 B1)
      };

      const result = evaluateExamAttempt({
        exam: dtzConfig.examMeta,
        levelConfig: dtzConfig,
        answers,
        elapsedSeconds: 3000
      });

      expect(result.grade).toContain("A2 Zertifikat");
    });

    it("should grade 'Unter A2' if Sprechen or written falls below A2 minimum", () => {
      const dtzConfig = getExam("dtz", "B1");

      const answers = {
        sp_0: { overall: 25 } // Below 50 Pkt
      };

      const result = evaluateExamAttempt({
        exam: dtzConfig.examMeta,
        levelConfig: dtzConfig,
        answers,
        elapsedSeconds: 1500
      });

      expect(result.passed).toBe(false);
      expect(result.grade).toBe("Unter A2");
    });
  });

  describe("TestDaF TDN Scoring (TDN 3 - 5 & University 4x4 Rule)", () => {
    it("should recognize full university admission when candidate achieves TDN 4 or 5 in all 4 parts", () => {
      const testdafB2 = getExam("testdaf", "B2");

      const answers = {
        "tdaf-l-1": 0, // 15
        "tdaf-l-2": 0, // 15 -> 30/30 (100% -> TDN 5)
        "tdaf-h-1": 0, // 25/25 (100% -> TDN 5)
        "tdaf-w-1": { overall: 22 }, // 22/25 = 88% -> TDN 5
        sp_0: { overall: 22 } // 22/25 = 88% -> TDN 5
      };

      const result = evaluateExamAttempt({
        exam: testdafB2.examMeta,
        levelConfig: testdafB2,
        answers,
        elapsedSeconds: 4000
      });

      expect(result.passed).toBe(true);
      expect(result.grade).toMatch(/TDN 4|TDN 5/);
      expect(result.details).toMatch(/Zulassung/);
    });
  });

  describe("telc Sprachbausteine Real Task Format", () => {
    it("should declare valid cloze items with rule categories in telc B1 Sprachbausteine", () => {
      const telcB1 = getExam("telc", "B1");
      const sbModule = telcB1.modules.find((m) => m.id === "sprachbausteine");

      expect(sbModule).toBeDefined();
      expect(sbModule.parts.length).toBe(2);

      const part1 = sbModule.parts[0];
      expect(part1.clozeItems.length).toBe(5);

      part1.clozeItems.forEach((item) => {
        expect(item.id).toBeTruthy();
        expect(item.gapNumber).toBeGreaterThan(0);
        expect(item.options.length).toBe(3);
        expect(item.correctAnswer).toBeDefined();
        expect(["connector", "preposition", "vocabulary", "case"]).toContain(item.ruleCategory);
        expect(item.explanation).toBeTruthy();
      });

      const part2 = sbModule.parts[1];
      expect(Array.isArray(part2.wordPool)).toBe(true);
      expect(part2.wordPool.length).toBeGreaterThan(0);
    });
  });
});
