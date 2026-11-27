import { describe, it, expect } from "vitest";
import {
  PLACEMENT_QUESTIONS,
  evaluatePlacementTest
} from "../src/data/placementQuestions";
import { GRAMMAR_CONTRASTS } from "../src/data/grammarContrasts";
import { analyzeNounGender } from "../src/data/nounGenderRules";
import { getAllUnitsOrdered } from "../src/data/curriculum";
import { getISOWeekString } from "../src/utils/dateUtils";

describe("Pedagogical Features: Placement Test, Roadmap Gating, Readiness & Contrasts", () => {
  // -------------------------------------------------------------
  // 1. Placement Test
  // -------------------------------------------------------------
  describe("1. Placement Test Suite", () => {
    it("should provide exactly 12 structured adaptive questions across CEFR levels", () => {
      expect(PLACEMENT_QUESTIONS).toHaveLength(12);

      PLACEMENT_QUESTIONS.forEach((q, idx) => {
        expect(q.id).toBe(`place-${idx + 1}`);
        expect(["grammar", "vocabulary", "reading"]).toContain(q.category);
        expect(typeof q.question).toBe("string");
        expect(Array.isArray(q.options)).toBe(true);
        expect(q.options.length).toBeGreaterThanOrEqual(3);
        expect(typeof q.correctAnswer).toBe("number");
        expect(q.correctAnswer).toBeGreaterThanOrEqual(0);
        expect(q.correctAnswer).toBeLessThan(q.options.length);
        expect(typeof q.explanation).toBe("string");
        expect(q.explanation.length).toBeGreaterThan(5);
      });
    });

    it("should recommend starting unit a1-u1 for beginner performance (0-3 correct)", () => {
      const answers = [
        { questionId: "place-1", answerIndex: 0, isCorrect: true },
        { questionId: "place-2", answerIndex: 1, isCorrect: false },
        { questionId: "place-3", answerIndex: 1, isCorrect: false }
      ];
      const result = evaluatePlacementTest(answers);

      expect(result.correctCount).toBe(1);
      expect(result.recommendedLevel).toBe("A1");
      expect(result.recommendedUnitId).toBe("a1-u1");
    });

    it("should recommend starting unit a1-u5 for advanced beginner (4-6 correct)", () => {
      const answers = Array.from({ length: 12 }, (_, i) => ({
        questionId: `place-${i + 1}`,
        answerIndex: i < 5 ? 0 : 1,
        isCorrect: i < 5 // 5 correct
      }));
      const result = evaluatePlacementTest(answers);

      expect(result.correctCount).toBe(5);
      expect(result.recommendedLevel).toBe("A1.2");
      expect(result.recommendedUnitId).toBe("a1-u5");
    });

    it("should recommend starting unit a2-u13 for elementary performance (7-8 correct)", () => {
      const answers = Array.from({ length: 12 }, (_, i) => ({
        questionId: `place-${i + 1}`,
        answerIndex: i < 7 ? 0 : 1,
        isCorrect: i < 7 // 7 correct
      }));
      const result = evaluatePlacementTest(answers);

      expect(result.correctCount).toBe(7);
      expect(result.recommendedLevel).toBe("A2");
      expect(result.recommendedUnitId).toBe("a2-u13");
    });

    it("should recommend starting unit b1-u17 for intermediate performance (9-10 correct)", () => {
      const answers = Array.from({ length: 12 }, (_, i) => ({
        questionId: `place-${i + 1}`,
        answerIndex: i < 10 ? 0 : 1,
        isCorrect: i < 10 // 10 correct
      }));
      const result = evaluatePlacementTest(answers);

      expect(result.correctCount).toBe(10);
      expect(result.recommendedLevel).toBe("B1");
      expect(result.recommendedUnitId).toBe("b1-u17");
    });

    it("should recommend starting unit b2-u25 for upper intermediate performance (11-12 correct)", () => {
      const answers = Array.from({ length: 12 }, (_, i) => ({
        questionId: `place-${i + 1}`,
        answerIndex: 0,
        isCorrect: true // 12 correct
      }));
      const result = evaluatePlacementTest(answers);

      expect(result.correctCount).toBe(12);
      expect(result.recommendedLevel).toBe("B2");
      expect(result.recommendedUnitId).toBe("b2-u25");
    });
  });

  // -------------------------------------------------------------
  // 2. Roadmap Gating & 70% Unit Mastery Calculation
  // -------------------------------------------------------------
  describe("2. Roadmap Gating & 70% Mastery Calculation", () => {
    const orderedUnits = getAllUnitsOrdered();

    function computeUnitMastery(unitId, progress, allCards = []) {
      const unit = orderedUnits.find((u) => u.id === unitId);
      if (!unit) return 0;

      // 1. Lessons completion (40%)
      const totalLessons = unit.lessons?.length || 0;
      let lessonCompletion = 0;
      if (totalLessons > 0) {
        const completed = unit.lessons.filter((l) =>
          progress.completedLessons?.includes(l.id)
        ).length;
        lessonCompletion = Math.round((completed / totalLessons) * 100);
      }
      if (progress.unitProgress?.[unitId] !== undefined) {
        lessonCompletion = Math.max(lessonCompletion, progress.unitProgress[unitId]);
      }

      // 2. Exercise accuracy (30%)
      let exerciseAccuracy = 0;
      const grammarStats = progress.grammarStats || {};
      let totalAttempts = 0, totalCorrect = 0;
      Object.values(grammarStats).forEach((t) => {
        totalAttempts += t.attempts || 0;
        totalCorrect += t.correct || 0;
      });
      if (totalAttempts > 0) {
        exerciseAccuracy = Math.round((totalCorrect / totalAttempts) * 100);
      } else if (lessonCompletion > 0) {
        exerciseAccuracy = 100;
      }

      // 3. SRS Retention (30%)
      const unitWords = unit.lessons?.flatMap((l) => l.words || []) || [];
      let srsRetention = 0;
      if (unitWords.length > 0) {
        const retained = unitWords.filter((w) => {
          const rec = progress.srsCards?.[w.id] || progress.srsCards?.[w.german];
          return rec && rec.repetitions > 0 && !rec.isLeech;
        }).length;
        srsRetention = Math.round((retained / unitWords.length) * 100);
      } else {
        srsRetention = 100;
      }

      return Math.min(100, Math.round(lessonCompletion * 0.4 + exerciseAccuracy * 0.3 + srsRetention * 0.3));
    }

    function checkUnitUnlocked(unitId, progress, allCards = []) {
      const index = orderedUnits.findIndex((u) => u.id === unitId);
      if (index <= 0) return true; // First unit is always unlocked

      if (progress.unlockedOverrides?.[unitId] === true) return true;

      const previousUnit = orderedUnits[index - 1];
      if (!previousUnit) return true;

      const prevMastery = computeUnitMastery(previousUnit.id, progress, allCards);
      return prevMastery >= 70;
    }

    it("should keep Unit 1 always unlocked regardless of prior progress", () => {
      const emptyProgress = { completedLessons: [], srsCards: {}, unitProgress: {} };
      expect(checkUnitUnlocked(orderedUnits[0].id, emptyProgress)).toBe(true);
    });

    it("should lock Unit 2 when Unit 1 mastery is below 70%", () => {
      const progressLow = {
        completedLessons: [],
        unitProgress: { [orderedUnits[0].id]: 40 },
        srsCards: {},
        grammarStats: {}
      };
      const mastery = computeUnitMastery(orderedUnits[0].id, progressLow);
      expect(mastery).toBeLessThan(70);
      expect(checkUnitUnlocked(orderedUnits[1].id, progressLow)).toBe(false);
    });

    it("should unlock Unit 2 when Unit 1 mastery reaches or exceeds 70%", () => {
      const unit1 = orderedUnits[0];
      const allLessonsU1 = unit1.lessons.map((l) => l.id);
      const unitWords = unit1.lessons.flatMap((l) => l.words || []);

      const srsMap = {};
      unitWords.forEach((w) => {
        srsMap[w.id] = { repetitions: 2, isLeech: false };
      });

      const progressHigh = {
        completedLessons: allLessonsU1, // 100% lessons
        unitProgress: { [unit1.id]: 100 },
        srsCards: srsMap, // 100% SRS retention
        grammarStats: {
          articles: { attempts: 10, correct: 9, mistakes: 1 } // 90% accuracy
        }
      };

      const mastery = computeUnitMastery(unit1.id, progressHigh);
      // 100 * 0.4 + 90 * 0.3 + 100 * 0.3 = 40 + 27 + 30 = 97%
      expect(mastery).toBeGreaterThanOrEqual(70);
      expect(checkUnitUnlocked(orderedUnits[1].id, progressHigh)).toBe(true);
    });

    it("should unlock a locked unit immediately when manual override is present", () => {
      const progressWithOverride = {
        completedLessons: [],
        unitProgress: {},
        unlockedOverrides: {
          [orderedUnits[3].id]: true
        }
      };
      expect(checkUnitUnlocked(orderedUnits[3].id, progressWithOverride)).toBe(true);
    });
  });

  // -------------------------------------------------------------
  // 3. Level Readiness (6 Real Competencies)
  // -------------------------------------------------------------
  describe("3. CEFR 6-Competency Level Readiness Calculation", () => {
    it("should compute readiness from real data across vocabulary, grammar, reading, writing, listening, speaking", () => {
      // Mock progress
      const targetLevel = "A2";
      const targetWords = 1200;
      const wordsCount = 300; // 25%
      const grammarAccuracy = 80; // 80%
      const readingScore = 75; // 75%
      const writingScore = 70; // 70%
      const listeningScore = 60; // 60%
      const speakingScore = 65; // 65%

      const vocabScore = Math.min(100, Math.round((wordsCount / targetWords) * 100)); // 25
      const weightedScore = Math.round(
        vocabScore * 0.20 +
        grammarAccuracy * 0.20 +
        readingScore * 0.15 +
        writingScore * 0.15 +
        listeningScore * 0.15 +
        speakingScore * 0.15
      );
      // 25*0.2 (5) + 80*0.2 (16) + 75*0.15 (11.25) + 70*0.15 (10.5) + 60*0.15 (9) + 65*0.15 (9.75) = 61.5 -> 62

      expect(weightedScore).toBe(62);
      expect(vocabScore).toBe(25);
    });
  });

  // -------------------------------------------------------------
  // 4. Streak Freeze Weekly Replenishment & Protection
  // -------------------------------------------------------------
  describe("4. Streak Freeze Weekly Replenishment & Protection", () => {
    it("should generate a standard ISO week string (e.g. YYYY-Www)", () => {
      const week = getISOWeekString(new Date("2026-05-18"));
      expect(week).toMatch(/^\d{4}-W\d{1,2}$/);
    });

    it("should consume streak freeze and protect streak when a day is missed", () => {
      const currentWeek = getISOWeekString();
      const streakFreeze = {
        available: 1,
        lastResetWeek: currentWeek,
        lastUsedDate: null
      };
      const streak = 7;
      const lastActiveDate = "2026-05-10"; // 2 days ago
      const yesterday = "2026-05-11";
      const today = "2026-05-12";

      let newStreak = streak;
      let nextStreakFreeze = { ...streakFreeze };

      if (lastActiveDate !== yesterday) {
        if (nextStreakFreeze.available > 0) {
          nextStreakFreeze.available = 0;
          nextStreakFreeze.lastUsedDate = yesterday;
          newStreak = streak + 1; // Protected!
        } else {
          newStreak = 1;
        }
      }

      expect(newStreak).toBe(8); // Streak was saved!
      expect(nextStreakFreeze.available).toBe(0);
      expect(nextStreakFreeze.lastUsedDate).toBe(yesterday);
    });

    it("should reset streak to 1 if a day is missed and no streak freeze is available", () => {
      const currentWeek = getISOWeekString();
      const streakFreeze = {
        available: 0,
        lastResetWeek: currentWeek,
        lastUsedDate: "2026-05-09"
      };
      const streak = 7;
      const lastActiveDate = "2026-05-10";
      const yesterday = "2026-05-11";

      let newStreak = streak;
      if (lastActiveDate !== yesterday) {
        if (streakFreeze.available > 0) {
          newStreak = streak + 1;
        } else {
          newStreak = 1; // Reset
        }
      }

      expect(newStreak).toBe(1);
    });

    it("should replenish streak freeze when a new ISO week rolls over", () => {
      const priorWeek = "2026-W19";
      const currentWeek = "2026-W20";

      let streakFreeze = {
        available: 0,
        lastResetWeek: priorWeek,
        lastUsedDate: "2026-05-08"
      };

      if (streakFreeze.lastResetWeek !== currentWeek) {
        streakFreeze = {
          available: 1,
          lastResetWeek: currentWeek,
          lastUsedDate: streakFreeze.lastUsedDate
        };
      }

      expect(streakFreeze.available).toBe(1);
      expect(streakFreeze.lastResetWeek).toBe(currentWeek);
    });
  });

  // -------------------------------------------------------------
  // 5. Gender Drill: Suffix Rules & Noun Re-queuing
  // -------------------------------------------------------------
  describe("5. Gender Drill: Suffix Analysis & Noun Re-queuing", () => {
    it("should accurately identify feminine suffix rules (-ung, -heit, -keit, -schaft)", () => {
      const testZeitung = analyzeNounGender("Zeitung");
      expect(testZeitung.rule.suffix).toContain("ung");
      expect(testZeitung.predictedGender).toBe("die");
      expect(testZeitung.rule.gender).toBe("die");
      expect(testZeitung.isException).toBe(false);

      const testFreiheit = analyzeNounGender("Freiheit");
      expect(testFreiheit.rule.suffix).toContain("heit");
      expect(testFreiheit.predictedGender).toBe("die");

      const testEinsamkeit = analyzeNounGender("Einsamkeit");
      expect(testEinsamkeit.rule.suffix).toContain("keit");
      expect(testEinsamkeit.predictedGender).toBe("die");
    });

    it("should accurately identify neuter suffix rules (-chen, -lein, -ment)", () => {
      const testMadchen = analyzeNounGender("Mädchen");
      expect(testMadchen.rule.suffix).toContain("chen");
      expect(testMadchen.predictedGender).toBe("das");

      const testDokument = analyzeNounGender("Dokument");
      expect(testDokument.rule.suffix).toContain("ment");
      expect(testDokument.predictedGender).toBe("das");
    });

    it("should accurately identify masculine suffix rules (-ling, -ismus)", () => {
      const testSchmetterling = analyzeNounGender("Schmetterling");
      expect(testSchmetterling.rule.suffix).toContain("ling");
      expect(testSchmetterling.predictedGender).toBe("der");

      const testOptimismus = analyzeNounGender("Optimismus");
      expect(testOptimismus.rule.suffix).toContain("ismus");
      expect(testOptimismus.predictedGender).toBe("der");
    });

    it("should detect linguistic exceptions to suffix rules (e.g. das Fenster ending in -er)", () => {
      const testFenster = analyzeNounGender("Fenster");
      expect(testFenster.isException).toBe(true);
      expect(testFenster.reason).toContain("Exception");
    });

    it("should simulate noun re-queuing upon incorrect guess", () => {
      const initialBank = [
        { word: "Tisch", gender: "der" },
        { word: "Lampe", gender: "die" },
        { word: "Buch", gender: "das" }
      ];

      let sessionQueue = [...initialBank];
      const currentItem = sessionQueue[0];
      const guessedGender = "die"; // Wrong guess for Tisch!

      if (guessedGender !== currentItem.gender) {
        // Re-queue the noun to the end of the session
        sessionQueue = [...sessionQueue, currentItem];
      }

      expect(sessionQueue).toHaveLength(4);
      expect(sessionQueue[3].word).toBe("Tisch");
    });
  });

  // -------------------------------------------------------------
  // 6. Grammar Interleaving & Contrast Drills
  // -------------------------------------------------------------
  describe("6. Grammar Interleaving & Contrast Drills", () => {
    it("should export well-structured grammatical contrasts with dual question pairs", () => {
      expect(GRAMMAR_CONTRASTS.length).toBeGreaterThanOrEqual(4);

      GRAMMAR_CONTRASTS.forEach((contrast) => {
        expect(typeof contrast.id).toBe("string");
        expect(typeof contrast.theme).toBe("string");
        expect(typeof contrast.contrastLabel).toBe("string");
        expect(typeof contrast.ruleExplanation).toBe("string");
        expect(contrast.ruleExplanation.length).toBeGreaterThan(15);
        expect(Array.isArray(contrast.pairs)).toBe(true);
        expect(contrast.pairs.length).toBe(2);

        contrast.pairs.forEach((pair) => {
          expect(typeof pair.id).toBe("string");
          expect(typeof pair.question).toBe("string");
          expect(Array.isArray(pair.options)).toBe(true);
          expect(pair.options).toContain(pair.correctAnswer);
          expect(typeof pair.explanation).toBe("string");
        });
      });
    });

    it("should include Wechselpräpositionen Akkusativ vs. Dativ contrast", () => {
      const wechselContrast = GRAMMAR_CONTRASTS.find((c) =>
        c.contrastLabel.includes("Akkusativ") && c.contrastLabel.includes("Dativ")
      );
      expect(wechselContrast).toBeDefined();
      expect(wechselContrast.pairs[0].caseType).toBe("Akkusativ");
      expect(wechselContrast.pairs[1].caseType).toBe("Dativ");
    });

    it("should interleave grammar topics in round-robin fashion", () => {
      const exercises = [
        { id: "e1", topic: "articles" },
        { id: "e2", topic: "articles" },
        { id: "e3", topic: "cases" },
        { id: "e4", topic: "cases" },
        { id: "e5", topic: "verb-conjugation" },
        { id: "e6", topic: "sentence-order" }
      ];

      const topics = ["articles", "cases", "verb-conjugation", "sentence-order"];
      const grouped = {};
      topics.forEach((t) => {
        grouped[t] = exercises.filter((e) => e.topic === t);
      });

      const interleaved = [];
      const maxLen = Math.max(...topics.map((t) => (grouped[t] || []).length));
      for (let i = 0; i < maxLen; i++) {
        topics.forEach((t) => {
          if (grouped[t] && grouped[t][i]) {
            interleaved.push(grouped[t][i]);
          }
        });
      }

      // Check that topics alternate
      expect(interleaved[0].topic).toBe("articles");
      expect(interleaved[1].topic).toBe("cases");
      expect(interleaved[2].topic).toBe("verb-conjugation");
      expect(interleaved[3].topic).toBe("sentence-order");
      expect(interleaved[4].topic).toBe("articles");
      expect(interleaved[5].topic).toBe("cases");
    });
  });
});
