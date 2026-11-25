import curriculumData from "./curriculum.json";
import { getCurriculumByLanguage } from "./multilingual/curriculumCatalog";

export const curriculum = curriculumData.levels;

/**
 * Returns array of CEFR levels for the specified language (defaults to 'de')
 */
export function getAllLevels(languageId = "de") {
  const cur = getCurriculumByLanguage(languageId);
  return cur.levels || curriculum;
}

/**
 * Returns a level by ID ('A1', 'A2', 'B1', 'B2') for the specified language
 */
export function getLevelById(levelId, languageId = "de") {
  const levels = getAllLevels(languageId);
  return levels.find((lvl) => lvl.id.toUpperCase() === (levelId || "A1").toUpperCase()) || levels[0];
}

/**
 * Returns all units as a flat sequence across all levels for the specified language
 */
export function getAllUnitsOrdered(languageId = "de") {
  const levels = getAllLevels(languageId);
  const units = [];
  levels.forEach((lvl) => {
    (lvl.units || []).forEach((u) => {
      units.push({
        ...u,
        levelId: lvl.id,
        levelTitle: lvl.title,
        languageId
      });
    });
  });
  return units;
}

/**
 * Returns flat array of all vocabulary across all levels for the specified language
 */
export function getAllWords(languageId = "de") {
  const levels = getAllLevels(languageId);
  const words = [];
  levels.forEach((lvl) => {
    (lvl.units || []).forEach((unit) => {
      (unit.lessons || []).forEach((lesson) => {
        (lesson.words || []).forEach((word) => {
          words.push({
            ...word,
            level: lvl.id,
            unitId: unit.id,
            unitTitle: unit.title,
            lessonId: lesson.id,
            lessonTitle: lesson.title,
            languageId
          });
        });
      });
    });
  });
  return words;
}

/**
 * Finds a lesson by ID across the specified language or all languages
 */
export function getLessonById(lessonId, languageId = "de") {
  const levels = getAllLevels(languageId);
  for (const lvl of levels) {
    for (const unit of lvl.units || []) {
      for (const lesson of unit.lessons || []) {
        if (lesson.id === lessonId) {
          return {
            ...lesson,
            levelId: lvl.id,
            levelTitle: lvl.title,
            unitId: unit.id,
            unitTitle: unit.title,
            unitNumber: unit.unitNumber || unit.number,
            languageId
          };
        }
      }
    }
  }

  // Fallback search across German curriculum if not found
  for (const lvl of curriculum) {
    for (const unit of lvl.units) {
      for (const lesson of unit.lessons) {
        if (lesson.id === lessonId) {
          return {
            ...lesson,
            levelId: lvl.id,
            levelTitle: lvl.title,
            unitId: unit.id,
            unitTitle: unit.title,
            unitNumber: unit.unitNumber || unit.number,
            languageId: "de"
          };
        }
      }
    }
  }
  return null;
}

/**
 * Returns total count of lessons across the specified language
 */
export function getTotalLessonsCount(languageId = "de") {
  const levels = getAllLevels(languageId);
  return levels.reduce((total, lvl) => {
    return total + (lvl.units || []).reduce((uTotal, unit) => uTotal + (unit.lessons || []).length, 0);
  }, 0);
}
