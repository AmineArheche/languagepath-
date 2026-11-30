/**
 * scripts/check-translations.js
 *
 * Scans translation catalogs in src/translations across all namespaces:
 * - ui.json
 * - words.json
 * - grammar.json
 * - errors.json
 *
 * Compares target languages (fr, ar) against the source of truth (en).
 * Reports key coverage %, missing keys, and empty translation strings.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, "..");
const TRANSLATIONS_DIR = path.join(ROOT_DIR, "src", "translations");
const SOURCE_LANG = "en";
const TARGET_LANGS = ["fr", "ar"];
const NAMESPACES = ["ui.json", "words.json", "grammar.json", "errors.json"];

/**
 * Recursively flattens a nested object into dot-separated keys
 */
function flattenKeys(obj, prefix = "") {
  const keys = {};
  if (!obj || typeof obj !== "object") return keys;

  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      Object.assign(keys, flattenKeys(value, fullKey));
    } else {
      keys[fullKey] = value;
    }
  }
  return keys;
}

function loadJson(filePath) {
  try {
    if (!fs.existsSync(filePath)) return null;
    const content = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(content);
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err.message);
    return null;
  }
}

function runAudit() {
  console.log("=================================================");
  console.log("      DeutschPath i18n Translation Audit         ");
  console.log("=================================================");
  console.log(`Source Language: ${SOURCE_LANG.toUpperCase()}`);
  console.log(`Target Languages: ${TARGET_LANGS.map((l) => l.toUpperCase()).join(", ")}`);
  console.log(`Namespaces: ${NAMESPACES.join(", ")}\n`);

  let totalEnKeysAll = 0;
  let totalMissingAll = 0;
  const results = [];

  for (const targetLang of TARGET_LANGS) {
    for (const ns of NAMESPACES) {
      const enFile = path.join(TRANSLATIONS_DIR, SOURCE_LANG, ns);
      const targetFile = path.join(TRANSLATIONS_DIR, targetLang, ns);

      const enData = loadJson(enFile);
      const targetData = loadJson(targetFile);

      if (!enData) {
        console.error(`Missing source file: ${enFile}`);
        continue;
      }

      const enFlat = flattenKeys(enData);
      const enKeyCount = Object.keys(enFlat).length;
      totalEnKeysAll += enKeyCount;

      if (!targetData) {
        results.push({
          lang: targetLang,
          ns,
          total: enKeyCount,
          missing: Object.keys(enFlat),
          empty: [],
          coverage: 0,
          fileMissing: true
        });
        totalMissingAll += enKeyCount;
        continue;
      }

      const targetFlat = flattenKeys(targetData);
      const missingKeys = [];
      const emptyKeys = [];

      for (const [key, enVal] of Object.entries(enFlat)) {
        if (!(key in targetFlat)) {
          missingKeys.push(key);
        } else {
          const targetVal = targetFlat[key];
          if (typeof targetVal === "string" && targetVal.trim() === "") {
            emptyKeys.push(key);
          }
        }
      }

      const covered = enKeyCount - missingKeys.length;
      const coverage = Math.round((covered / (enKeyCount || 1)) * 100);
      totalMissingAll += missingKeys.length;

      results.push({
        lang: targetLang,
        ns,
        total: enKeyCount,
        covered,
        missing: missingKeys,
        empty: emptyKeys,
        coverage,
        fileMissing: false
      });
    }
  }

  // Summary output
  console.log("Namespace Summary:");
  console.log("-------------------------------------------------");
  for (const r of results) {
    const status = r.coverage === 100 ? "PASS" : "WARN";
    const bar = r.coverage === 100 ? "✓ 100%" : `${r.coverage}%`;
    console.log(
      `[${status}] ${r.lang.toUpperCase()} | ${r.ns.padEnd(14)} -> ${bar.padEnd(7)} (${r.covered || 0}/${r.total} keys)`
    );

    if (r.missing.length > 0) {
      console.log(`       Missing (${r.missing.length}): ${r.missing.slice(0, 5).join(", ")}${r.missing.length > 5 ? "..." : ""}`);
    }
    if (r.empty.length > 0) {
      console.log(`       Empty (${r.empty.length}): ${r.empty.slice(0, 5).join(", ")}${r.empty.length > 5 ? "..." : ""}`);
    }
  }

  console.log("-------------------------------------------------");
  if (totalMissingAll === 0) {
    console.log("Result: ALL TRANSLATIONS COMPLETE! (100% Coverage across all namespaces)");
    console.log("=================================================\n");
    process.exit(0);
  } else {
    console.warn(`Result: Found ${totalMissingAll} missing key(s) in translation catalogs.`);
    console.log("=================================================\n");
    process.exit(1);
  }
}

runAudit();
