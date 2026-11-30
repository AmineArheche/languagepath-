/**
 * src/services/translationService.js
 *
 * Provides translation utilities for data fields:
 * - Vocabulary translations (words.json)
 * - Grammar explanations (grammar.json)
 * - Pedagogical error rationales & category labels (errors.json)
 *
 * Integrates with i18next with automatic fallback to English when translations are missing.
 */

import i18n, { isRTL, SUPPORTED_LANGUAGES } from "../i18n/config";

/**
 * Returns the currently active language code ('en', 'fr', 'ar')
 */
export function getLearnerLanguage() {
  if (i18n && i18n.language) {
    const code = i18n.language.slice(0, 2).toLowerCase();
    if (SUPPORTED_LANGUAGES.some((l) => l.code === code)) return code;
  }
  try {
    const stored = localStorage.getItem("deutschpath_language");
    if (stored && SUPPORTED_LANGUAGES.some((l) => l.code === stored)) return stored;
  } catch {
    // fallback
  }
  return "en";
}

/**
 * Returns the descriptive English name of the learner's native language (e.g. 'French', 'Arabic', 'English')
 * Useful for Gemini prompt instructions.
 */
export function getLearnerNativeLanguageName() {
  const code = getLearnerLanguage();
  const found = SUPPORTED_LANGUAGES.find((l) => l.code === code);
  return found ? found.name : "English";
}

/**
 * Checks whether current layout direction is RTL
 */
export function isRTLMode() {
  return isRTL(getLearnerLanguage());
}

/**
 * Translates a German word to the learner's language
 * Falls back to English if missing in target language
 */
export function getTranslatedWord(germanWord, targetLang = null) {
  if (!germanWord) return "";
  const lang = targetLang || getLearnerLanguage();

  // Try target language
  const translation = i18n.t(germanWord, {
    ns: "words",
    lng: lang,
    defaultValue: null
  });

  if (translation && translation !== germanWord) {
    return translation;
  }

  // Fallback to English
  if (lang !== "en") {
    const enFallback = i18n.t(germanWord, {
      ns: "words",
      lng: "en",
      defaultValue: null
    });
    if (enFallback) return enFallback;
  }

  return "";
}

/**
 * Retrieves a grammar explanation from grammar.json
 * Supports dot-notation keys (e.g. "articles.rule", "exercises.gram-1")
 */
export function getGrammarExplanation(keyPath, targetLang = null) {
  if (!keyPath) return "";
  const lang = targetLang || getLearnerLanguage();

  const explanation = i18n.t(keyPath, {
    ns: "grammar",
    lng: lang,
    defaultValue: null
  });

  if (explanation && explanation !== keyPath) {
    return explanation;
  }

  // Fallback to English
  if (lang !== "en") {
    const enFallback = i18n.t(keyPath, {
      ns: "grammar",
      lng: "en",
      defaultValue: null
    });
    if (enFallback && enFallback !== keyPath) return enFallback;
  }

  return "";
}

/**
 * Retrieves the localized label, description, and pedagogical rationale for an error category
 */
export function getErrorCategoryDetails(category, targetLang = null) {
  if (!category) {
    return {
      label: "General Mistake",
      description: "Unclassified learning mistake",
      rationale: "Review the rule and practice similar examples."
    };
  }

  const lang = targetLang || getLearnerLanguage();

  const details = i18n.t(`categories.${category}`, {
    ns: "errors",
    lng: lang,
    returnObjects: true,
    defaultValue: null
  });

  if (details && typeof details === "object" && details.label) {
    return details;
  }

  // Fallback to English
  if (lang !== "en") {
    const enDetails = i18n.t(`categories.${category}`, {
      ns: "errors",
      lng: "en",
      returnObjects: true,
      defaultValue: null
    });
    if (enDetails && typeof enDetails === "object" && enDetails.label) {
      return enDetails;
    }
  }

  return {
    label: category,
    description: "Grammar or vocabulary mistake",
    rationale: "Review the relevant German grammar rule."
  };
}

/**
 * Localized label for an error category
 */
export function translateCategoryLabel(category, targetLang = null) {
  const details = getErrorCategoryDetails(category, targetLang);
  return details?.label || category;
}

/**
 * Localized pedagogical rationale for an error category
 */
export function translateCategoryRationale(category, targetLang = null) {
  const details = getErrorCategoryDetails(category, targetLang);
  return details?.rationale || "";
}
