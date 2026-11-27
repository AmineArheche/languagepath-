/**
 * src/data/multilingual/drillCatalog.js
 *
 * Configures the fast-paced grammatical speed drill for each language:
 * - German: der / die / das (Noun Gender Speed Drill)
 * - English: a / an / the (Definite, Indefinite, Zero Article Drill)
 * - Spanish: el / la / los / las (Gender & Plural Article Drill)
 * - French: le / la / les / l' (Genre et Articles Définis)
 * - Arabic: التعريف والتنوين (Al- / Tanween Speed Drill)
 * - Italian: il / lo / la / l' (Articoli Determinativi)
 */

export const DRILL_CONFIG_BY_LANGUAGE = {
  de: {
    id: "gender",
    title: "der / die / das Trainer",
    sidebarLabel: "der / die / das",
    sidebarDesc: "Entraîneur rapide de genres",
    bannerTitle: "Entraîneur Rapide de Genres Allemands",
    bannerSubtitle: "Développez des automatismes instantanés sur der, die et das avec détection des suffixes.",
    options: ["der", "die", "das"],
    colors: {
      der: "bg-blue-600 hover:bg-blue-500 text-white",
      die: "bg-rose-600 hover:bg-rose-500 text-white",
      das: "bg-emerald-600 hover:bg-emerald-500 text-white"
    },
    items: [
      { word: "Tisch", answer: "der", rule: "Les meubles et objets simples d'atelier sont souvent masculins.", translation: "table" },
      { word: "Wohnung", answer: "die", rule: "Les noms terminés par -ung sont toujours féminins à 100%.", translation: "appartement" },
      { word: "Buch", answer: "das", rule: "Les objets de savoir et neutres d'origine germanique.", translation: "livre" },
      { word: "Mädchen", answer: "das", rule: "Les diminutifs en -chen et -lein sont toujours neutres.", translation: "fille" },
      { word: "Zeitung", answer: "die", rule: "Suffixe -ung -> toujours 'die'.", translation: "journal" },
      { word: "Freiheit", answer: "die", rule: "Suffixes -heit et -keit -> toujours féminin.", translation: "liberté" },
      { word: "Universität", answer: "die", rule: "Suffixe -tät -> toujours féminin.", translation: "université" },
      { word: "Computer", answer: "der", rule: "Noms d'emprunt en -er décrivant un agent ou appareil -> souvent 'der'.", translation: "ordinateur" }
    ]
  },
  en: {
    id: "articles",
    title: "a / an / the Speed Drill",
    sidebarLabel: "a / an / the",
    sidebarDesc: "Articles & Rapid Reflexes",
    bannerTitle: "English Articles & Determiners Drill",
    bannerSubtitle: "Master rapid natural selection between 'a', 'an', and 'the'.",
    options: ["a", "an", "the"],
    colors: {
      a: "bg-indigo-600 hover:bg-indigo-500 text-white",
      an: "bg-violet-600 hover:bg-violet-500 text-white",
      the: "bg-amber-600 hover:bg-amber-500 text-white"
    },
    items: [
      { word: "umbrella", answer: "an", rule: "Begins with vowel sound /ʌ/ -> use 'an'.", translation: "parapluie" },
      { word: "university", answer: "a", rule: "Begins with consonant sound /j/ (you) -> use 'a', not 'an'.", translation: "université" },
      { word: "hour", answer: "an", rule: "Silent 'h', starts with vowel sound /aʊ/ -> use 'an'.", translation: "heure" },
      { word: "sun", answer: "the", rule: "Unique celestial object in the solar system -> use 'the'.", translation: "soleil" },
      { word: "European city", answer: "a", rule: "Begins with consonant glide sound /j/ -> use 'a European'.", translation: "ville européenne" },
      { word: "honest answer", answer: "an", rule: "Silent 'h' in 'honest' -> vowel sound -> use 'an'.", translation: "réponse honnête" },
      { word: "moon", answer: "the", rule: "Unique celestial object -> use 'the moon'.", translation: "lune" },
      { word: "challenge", answer: "a", rule: "Consonant sound /tʃ/ -> use 'a challenge'.", translation: "défi" }
    ]
  },
  es: {
    id: "gender",
    title: "el / la / los / las Trainer",
    sidebarLabel: "el / la / los / las",
    sidebarDesc: "Género y Artículos Rápidos",
    bannerTitle: "Entrenador de Artículos y Género en Español",
    bannerSubtitle: "Identifica instantáneamente el género de los sustantivos y las excepciones.",
    options: ["el", "la"],
    colors: {
      el: "bg-blue-600 hover:bg-blue-500 text-white",
      la: "bg-rose-600 hover:bg-rose-500 text-white"
    },
    items: [
      { word: "casa", answer: "la", rule: "La mayoría de las palabras terminadas en -a son femeninas.", translation: "maison" },
      { word: "problema", answer: "el", rule: "Excepción de origen griego en -ma -> masculino ('el problema').", translation: "problème" },
      { word: "día", answer: "el", rule: "Excepción común terminada en -a -> masculino ('el día').", translation: "jour" },
      { word: "mano", answer: "la", rule: "Excepción común terminada en -o -> femenino ('la mano').", translation: "main" },
      { word: "estación", answer: "la", rule: "Las palabras en -ción y -sión son siempre femeninas.", translation: "gare" },
      { word: "mapa", answer: "el", rule: "Excepción masculina terminada en -a -> 'el mapa'.", translation: "carte" }
    ]
  },
  fr: {
    id: "gender",
    title: "le / la / l' Entraîneur",
    sidebarLabel: "le / la / l'",
    sidebarDesc: "Genre et Articles Définis",
    bannerTitle: "Entraîneur de Genre en Français",
    bannerSubtitle: "Développez les bons automatismes sur le masculin et le féminin en français.",
    options: ["le", "la"],
    colors: {
      le: "bg-blue-600 hover:bg-blue-500 text-white",
      la: "bg-rose-600 hover:bg-rose-500 text-white"
    },
    items: [
      { word: "maison", answer: "la", rule: "Nom féminin courant.", translation: "house" },
      { word: "problème", answer: "le", rule: "Terminaison en -ème d'origine grecque -> masculin ('le problème').", translation: "problem" },
      { word: "nation", answer: "la", rule: "Suffixe -tion -> toujours féminin.", translation: "nation" },
      { word: "voyage", answer: "le", rule: "Suffixe -age -> presque toujours masculin ('le voyage').", translation: "trip" },
      { word: "voiture", answer: "la", rule: "Suffixe -ure -> très majoritairement féminin.", translation: "car" },
      { word: "musée", answer: "le", rule: "Exception en -ée -> masculin ('le musée').", translation: "museum" }
    ]
  },
  ar: {
    id: "articles",
    title: "تدريب التعريف والتنوين",
    sidebarLabel: "التعريف والتنوين",
    sidebarDesc: "سرعة التمييز الإعرابي",
    bannerTitle: "تدريب سريع على التعريف والتنوين",
    bannerSubtitle: "ميز بين الأسماء المعرفة بـ (الـ) والأسماء المنكرة باللغة العربية.",
    options: ["الـ (مُعَرَّف)", "تنوين (مُنَكَّر)"],
    colors: {
      "الـ (مُعَرَّف)": "bg-emerald-600 hover:bg-emerald-500 text-white",
      "تنوين (مُنَكَّر)": "bg-teal-600 hover:bg-teal-500 text-white"
    },
    items: [
      { word: "الْكِتَابُ", answer: "الـ (مُعَرَّف)", rule: "اتصلت به أداة التعريف 'الـ'.", translation: "le livre" },
      { word: "كِتَابٌ", answer: "تنوين (مُنَكَّر)", rule: "اسم نكرة منون بالضمتين.", translation: "un livre" },
      { word: "الْمَدِينَةُ", answer: "الـ (مُعَرَّف)", rule: "اسم معرف بالألف واللام.", translation: "la ville" },
      { word: "سَفَرًا", answer: "تنوين (مُنَكَّر)", rule: "اسم نكرة منون بتنوين الفتح.", translation: "un voyage" }
    ]
  },
  it: {
    id: "gender",
    title: "il / la / lo Trainer",
    sidebarLabel: "il / la / lo",
    sidebarDesc: "Articoli & Genere Rapido",
    bannerTitle: "Allenatore di Articoli Determinativi Italiani",
    bannerSubtitle: "Sviluppa riflessi immediati sugli articoli maschili e femminili.",
    options: ["il", "la"],
    colors: {
      il: "bg-blue-600 hover:bg-blue-500 text-white",
      la: "bg-rose-600 hover:bg-rose-500 text-white"
    },
    items: [
      { word: "casa", answer: "la", rule: "Terminazione in -a -> femminile.", translation: "maison" },
      { word: "libro", answer: "il", rule: "Terminazione in -o -> maschile singolare.", translation: "livre" },
      { word: "tavolo", answer: "il", rule: "Sostantivo maschile regolare.", translation: "table" },
      { word: "città", answer: "la", rule: "Sostantivo femminile indeclinabile.", translation: "ville" }
    ]
  }
};

/**
 * Returns drill config for given target language
 */
export function getDrillConfigByLanguage(languageId = "de") {
  const norm = (languageId || "de").toLowerCase().trim();
  return DRILL_CONFIG_BY_LANGUAGE[norm] || DRILL_CONFIG_BY_LANGUAGE.de;
}
