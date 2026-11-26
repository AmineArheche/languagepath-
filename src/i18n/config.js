import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Preload English synchronously to guarantee zero flash and instant fallback availability
import enUi from "../translations/en/ui.json";
import enWords from "../translations/en/words.json";
import enGrammar from "../translations/en/grammar.json";
import enErrors from "../translations/en/errors.json";

export const SUPPORTED_LANGUAGES = [
  { code: "en", name: "English", nativeName: "English", flag: "🇬🇧", dir: "ltr" },
  { code: "fr", name: "French", nativeName: "Français", flag: "🇫🇷", dir: "ltr" },
  { code: "ar", name: "Arabic", nativeName: "العربية", flag: "🇸🇦", dir: "rtl" }
];

export const NAMESPACES = ["ui", "words", "grammar", "errors"];

const translationLoaders = {
  en: {
    ui: () => Promise.resolve({ default: enUi }),
    words: () => Promise.resolve({ default: enWords }),
    grammar: () => Promise.resolve({ default: enGrammar }),
    errors: () => Promise.resolve({ default: enErrors })
  },
  fr: {
    ui: () => import("../translations/fr/ui.json"),
    words: () => import("../translations/fr/words.json"),
    grammar: () => import("../translations/fr/grammar.json"),
    errors: () => import("../translations/fr/errors.json")
  },
  ar: {
    ui: () => import("../translations/ar/ui.json"),
    words: () => import("../translations/ar/words.json"),
    grammar: () => import("../translations/ar/grammar.json"),
    errors: () => import("../translations/ar/errors.json")
  }
};

/**
 * Get initial language from localStorage or default to 'en'
 */
export function getSavedLanguage() {
  if (typeof window === "undefined" || !window.localStorage) return "en";
  try {
    const saved = localStorage.getItem("deutschpath_language");
    if (saved && SUPPORTED_LANGUAGES.some((l) => l.code === saved)) {
      return saved;
    }
  } catch {
    // fallback
  }
  return "en";
}

/**
 * Lazily loads translation files for the specified language
 */
export async function loadLanguageTranslations(lang) {
  const targetLang = SUPPORTED_LANGUAGES.some((l) => l.code === lang) ? lang : "en";
  const loaders = translationLoaders[targetLang];
  if (!loaders) return;

  const results = await Promise.all(
    NAMESPACES.map(async (ns) => {
      if (i18n.hasResourceBundle(targetLang, ns)) return null;
      try {
        const mod = await loaders[ns]();
        const data = mod.default || mod;
        return { ns, data };
      } catch (err) {
        console.warn(`Failed to lazy load translation bundle: ${targetLang}/${ns}`, err);
        return null;
      }
    })
  );

  results.forEach((item) => {
    if (item && item.data) {
      i18n.addResourceBundle(targetLang, item.ns, item.data, true, true);
    }
  });
}

/**
 * Switch language, update document direction (RTL/LTR), and persist to localStorage
 */
export async function setAppLanguage(lang) {
  const target = SUPPORTED_LANGUAGES.some((l) => l.code === lang) ? lang : "en";
  await loadLanguageTranslations(target);
  await i18n.changeLanguage(target);

  const langMeta = SUPPORTED_LANGUAGES.find((l) => l.code === target) || SUPPORTED_LANGUAGES[0];

  try {
    localStorage.setItem("deutschpath_language", target);
    // Keep deutschpath_native_lang in sync for AI services
    localStorage.setItem("deutschpath_native_lang", JSON.stringify(langMeta.name));
  } catch (err) {
    console.warn("Could not save language preference to localStorage:", err);
  }

  if (typeof document !== "undefined") {
    document.documentElement.lang = target;
    document.documentElement.setAttribute("dir", langMeta.dir);
  }

  return target;
}

export function isRTL(lang) {
  const code = lang || i18n.language || "en";
  return code === "ar";
}

// Initial i18next configuration
const initialLang = getSavedLanguage();

i18n.use(initReactI18next).init({
  lng: initialLang,
  fallbackLng: "en",
  ns: NAMESPACES,
  defaultNS: "ui",
  interpolation: {
    escapeValue: false
  },
  resources: {
    en: {
      ui: enUi,
      words: enWords,
      grammar: enGrammar,
      errors: enErrors
    }
  },
  react: {
    useSuspense: false
  }
});

// If initial language is not 'en', kick off lazy loading and set dir
if (typeof document !== "undefined") {
  const isArabic = initialLang === "ar";
  document.documentElement.lang = initialLang;
  document.documentElement.setAttribute("dir", isArabic ? "rtl" : "ltr");
  if (initialLang !== "en") {
    loadLanguageTranslations(initialLang);
  }
}

export default i18n;
