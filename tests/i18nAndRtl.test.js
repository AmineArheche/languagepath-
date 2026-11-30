import { describe, it, expect, beforeEach, afterEach } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

// Mock localStorage and document for Node testing environment
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => (key in store ? store[key] : null),
    setItem: (key, value) => {
      store[key] = String(value);
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    }
  };
})();

globalThis.localStorage = localStorageMock;

if (typeof document === "undefined") {
  const docElement = {
    lang: "en",
    _attrs: {},
    setAttribute(name, value) {
      this._attrs[name] = value;
    },
    getAttribute(name) {
      return this._attrs[name] || null;
    }
  };
  globalThis.document = {
    documentElement: docElement
  };
}

import i18n, {
  SUPPORTED_LANGUAGES,
  isRTL,
  setAppLanguage,
  loadLanguageTranslations,
  getSavedLanguage
} from "../src/i18n/config";
import {
  getLearnerLanguage,
  getLearnerNativeLanguageName,
  isRTLMode,
  getTranslatedWord,
  getGrammarExplanation,
  getErrorCategoryDetails,
  translateCategoryLabel,
  translateCategoryRationale
} from "../src/services/translationService";
import { formatCategoryLabel, formatCategoryRationale } from "../src/services/errorLedger";
import { buildSystemPrompt } from "../src/services/aiTutorService";
import { getLearnerNativeLanguage } from "../src/services/contextTutorService";
import { GermanText } from "../src/components/common/GermanText";

describe("i18n Configuration & Language Switching", () => {
  beforeEach(async () => {
    localStorage.clear();
    await setAppLanguage("en");
  });

  afterEach(async () => {
    await setAppLanguage("en");
    localStorage.clear();
  });

  it("should have correct supported languages configured", () => {
    expect(SUPPORTED_LANGUAGES).toHaveLength(3);
    const codes = SUPPORTED_LANGUAGES.map((l) => l.code);
    expect(codes).toContain("en");
    expect(codes).toContain("fr");
    expect(codes).toContain("ar");
  });

  it("should detect RTL correctly for Arabic and LTR for others", () => {
    expect(isRTL("ar")).toBe(true);
    expect(isRTL("en")).toBe(false);
    expect(isRTL("fr")).toBe(false);
  });

  it("should switch to French and update document attributes and localStorage", async () => {
    await setAppLanguage("fr");
    expect(i18n.language).toBe("fr");
    expect(getLearnerLanguage()).toBe("fr");
    expect(getLearnerNativeLanguageName()).toBe("French");
    expect(isRTLMode()).toBe(false);

    expect(localStorage.getItem("deutschpath_language")).toBe("fr");
    expect(JSON.parse(localStorage.getItem("deutschpath_native_lang"))).toBe("French");

    if (typeof document !== "undefined") {
      expect(document.documentElement.lang).toBe("fr");
      expect(document.documentElement.getAttribute("dir")).toBe("ltr");
    }
  });

  it("should switch to Arabic and set dir='rtl' on documentElement", async () => {
    await setAppLanguage("ar");
    expect(i18n.language).toBe("ar");
    expect(getLearnerLanguage()).toBe("ar");
    expect(getLearnerNativeLanguageName()).toBe("Arabic");
    expect(isRTLMode()).toBe(true);

    expect(localStorage.getItem("deutschpath_language")).toBe("ar");
    expect(JSON.parse(localStorage.getItem("deutschpath_native_lang"))).toBe("Arabic");

    if (typeof document !== "undefined") {
      expect(document.documentElement.lang).toBe("ar");
      expect(document.documentElement.getAttribute("dir")).toBe("rtl");
    }
  });

  it("should fallback gracefully if an unknown language is passed", async () => {
    await setAppLanguage("es");
    expect(i18n.language).toBe("en");
    expect(getLearnerLanguage()).toBe("en");
  });
});

describe("Data Translations & English Fallback (translationService)", () => {
  beforeEach(async () => {
    await setAppLanguage("en");
  });

  it("should translate vocabulary words in EN, FR, and AR", async () => {
    await loadLanguageTranslations("fr");
    await loadLanguageTranslations("ar");

    expect(getTranslatedWord("Tisch", "en")).toBe("table");
    expect(getTranslatedWord("Tisch", "fr")).toBe("table");
    expect(getTranslatedWord("Tisch", "ar")).toBe("طاولة");

    expect(getTranslatedWord("Katze", "en")).toBe("cat");
    expect(getTranslatedWord("Katze", "fr")).toBe("chat");
    expect(getTranslatedWord("Katze", "ar")).toBe("قطة");
  });

  it("should fallback to English when word translation is not present in target language", async () => {
    // Add a test word only in English
    i18n.addResource("en", "words", "Zaun", "fence");

    const frResult = getTranslatedWord("Zaun", "fr");
    expect(frResult).toBe("fence");
  });

  it("should retrieve localized grammar explanations", async () => {
    await loadLanguageTranslations("fr");
    await loadLanguageTranslations("ar");

    const enExpl = getGrammarExplanation("articles.rule", "en");
    expect(enExpl).toContain("three grammatical genders");

    const frExpl = getGrammarExplanation("articles.rule", "fr");
    expect(frExpl).toContain("trois genres grammaticaux");

    const arExpl = getGrammarExplanation("articles.rule", "ar");
    expect(arExpl).toContain("ثلاثة أجناس نحوية");
  });

  it("should retrieve localized error category details and pedagogical rationales", async () => {
    await loadLanguageTranslations("fr");
    await loadLanguageTranslations("ar");

    const enDetails = getErrorCategoryDetails("article-gender", "en");
    expect(enDetails.label).toBe("Article & Noun Gender");
    expect(enDetails.rationale).toContain("Noun gender in German is grammatical");

    const frDetails = getErrorCategoryDetails("article-gender", "fr");
    expect(frDetails.label).toBe("Article et genre du nom");
    expect(frDetails.rationale).toContain("Le genre en allemand est grammatical");

    const arDetails = getErrorCategoryDetails("article-gender", "ar");
    expect(arDetails.label).toBe("أداة التعريف وجنس الاسم");
    expect(arDetails.rationale).toContain("جنس الاسم في الألمانية نحوي");
  });
});

describe("ErrorLedger & Pedagogical Diagnostics i18n Integration", () => {
  it("should format category label according to active language", async () => {
    await setAppLanguage("en");
    expect(formatCategoryLabel("case")).toBe("Case Endings (Nom/Akk/Dat/Gen)");

    await setAppLanguage("fr");
    expect(formatCategoryLabel("case")).toBe("Déclinaisons des cas (Nom/Acc/Dat/Gén)");

    await setAppLanguage("ar");
    expect(formatCategoryLabel("case")).toBe("حالات الإعراب (الرفع، النصب، الجر، الإضافة)");
  });

  it("should format pedagogical rationale according to active language", async () => {
    await setAppLanguage("en");
    expect(formatCategoryRationale("verb-position")).toContain("Main clauses enforce verb in position 2");

    await setAppLanguage("fr");
    expect(formatCategoryRationale("verb-position")).toContain("La principale impose le verbe en position 2");

    await setAppLanguage("ar");
    expect(formatCategoryRationale("verb-position")).toContain("الجملة الرئيسية تفرض الفعل في الموقع الثاني");
  });
});

describe("AI Tutor & ContextTutor Native Language Feeds", () => {
  it("should feed native language into buildSystemPrompt for AI tutor", () => {
    const scenario = { title: "Café", character: "Waiter", description: "Ordering drinks" };
    const promptFr = buildSystemPrompt("A1", scenario, "French");

    expect(promptFr).toContain("ONE-LINE explanation in French");
    expect(promptFr).toContain("Translation in French of your reply");
    expect(promptFr).toContain("MUST BE 100% IN GERMAN");

    const promptAr = buildSystemPrompt("A1", scenario, "Arabic");
    expect(promptAr).toContain("ONE-LINE explanation in Arabic");
    expect(promptAr).toContain("Translation in Arabic of your reply");
  });

  it("should feed native language into getLearnerNativeLanguage for ContextTutor", async () => {
    await setAppLanguage("fr");
    expect(getLearnerNativeLanguage()).toBe("French");

    await setAppLanguage("ar");
    expect(getLearnerNativeLanguage()).toBe("Arabic");
  });
});

describe("GermanText Component for BiDi & RTL Isolation", () => {
  it("should render German text wrapped in <bdi dir='ltr'> with isolation styling", () => {
    const html = renderToStaticMarkup(
      React.createElement(GermanText, { className: "font-bold" }, "Das Buch liegt auf dem Tisch.")
    );

    expect(html).toContain('dir="ltr"');
    expect(html).toContain('<bdi dir="ltr">Das Buch liegt auf dem Tisch.</bdi>');
    expect(html).toContain("[unicode-bidi:isolate]");
  });

  it("should handle null or undefined children gracefully", () => {
    const html = renderToStaticMarkup(React.createElement(GermanText, null, null));
    expect(html).toBe("");
  });
});
