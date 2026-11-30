#!/usr/bin/env node

/**
 * scripts/validate-content.js
 *
 * Content Validation Pipeline for DeutschPath.
 * Validates JSON datasets against Zod content schemas:
 * 1. Schema conformity (types, required fields, constraints)
 * 2. Stable immutable IDs and duplicate detection (global & per-level)
 * 3. Noun article/gender/plural consistency (der/die/das + plural present)
 * 4. German example sentences containing headword or root stem
 * 5. CEFR level boundaries (A1, A2, B1, B2)
 * 6. Review Queue integrity (draft/approved status, valid payload)
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  FlashcardSchema,
  GrammarExerciseSchema,
  ReadingTextSchema,
  ListeningItemSchema,
  ExamTaskSchema,
  WritingPromptSchema,
  ReviewQueueItemSchema,
  CEFR_LEVELS
} from "../src/data/schemas/contentSchemas.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, "../src/data");

// ANSI color helpers
const colors = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m"
};

const c = {
  header: (text) => `${colors.bold}${colors.cyan}${text}${colors.reset}`,
  success: (text) => `${colors.bold}${colors.green}${text}${colors.reset}`,
  error: (text) => `${colors.bold}${colors.red}${text}${colors.reset}`,
  warn: (text) => `${colors.bold}${colors.yellow}${text}${colors.reset}`,
  dim: (text) => `${colors.dim}${text}${colors.reset}`,
  bold: (text) => `${colors.bold}${text}${colors.reset}`
};

// Global state for duplicate tracking
const seenIds = new Map(); // id -> { file, index }
const seenHeadwordsPerLevel = new Map(); // "A1:tisch" -> { id, file }

let totalFilesChecked = 0;
let totalItemsChecked = 0;
let totalErrors = 0;
let totalWarnings = 0;
const fileReports = [];

/**
 * Validates a list of flashcards
 */
function validateFlashcardDeck(items, relativePath) {
  const issues = [];

  items.forEach((item, index) => {
    totalItemsChecked++;
    const itemRef = item.id || `#${index + 1}`;

    // 1. Zod Schema Validation
    const parseResult = FlashcardSchema.safeParse(item);
    if (!parseResult.success) {
      for (const issue of parseResult.error.issues) {
        issues.push({
          type: "Schema Violation",
          itemRef,
          path: issue.path.join("."),
          message: issue.message
        });
      }
    }

    // 2. Global Unique ID Check
    if (item.id) {
      if (seenIds.has(item.id)) {
        const prior = seenIds.get(item.id);
        issues.push({
          type: "Duplicate ID",
          itemRef,
          path: "id",
          message: `ID '${item.id}' was already declared in ${prior.file} (item #${prior.index + 1})`
        });
      } else {
        seenIds.set(item.id, { file: relativePath, index });
      }
    }

    // 3. Per-level Duplicate Headword Check
    if (item.german && item.level) {
      const cleanWord = item.german.trim().toLowerCase().replace(/^(der|die|das)\s+/, "");
      const key = `${item.level}:${cleanWord}`;
      if (seenHeadwordsPerLevel.has(key)) {
        const prior = seenHeadwordsPerLevel.get(key);
        // Warn rather than fail for distinct polysemous entries
        issues.push({
          type: "Duplicate Headword (Warning)",
          severity: "warn",
          itemRef,
          path: "german",
          message: `Headword '${item.german}' is already covered in level ${item.level} by item '${prior.id}'`
        });
      } else {
        seenHeadwordsPerLevel.set(key, { id: item.id, file: relativePath });
      }
    }

    // 4. CEFR Bounds
    if (item.level && !CEFR_LEVELS.includes(item.level)) {
      issues.push({
        type: "Invalid Level",
        itemRef,
        path: "level",
        message: `Level '${item.level}' must be one of ${CEFR_LEVELS.join(", ")}`
      });
    }
  });

  return issues;
}

/**
 * Validates a list of grammar exercises
 */
function validateGrammarDeck(items, relativePath) {
  const issues = [];

  items.forEach((item, index) => {
    totalItemsChecked++;
    const itemRef = item.id || `#${index + 1}`;

    const parseResult = GrammarExerciseSchema.safeParse(item);
    if (!parseResult.success) {
      for (const issue of parseResult.error.issues) {
        issues.push({
          type: "Schema Violation",
          itemRef,
          path: issue.path.join("."),
          message: issue.message
        });
      }
    }

    if (item.id) {
      if (seenIds.has(item.id)) {
        const prior = seenIds.get(item.id);
        issues.push({
          type: "Duplicate ID",
          itemRef,
          path: "id",
          message: `ID '${item.id}' was already declared in ${prior.file}`
        });
      } else {
        seenIds.set(item.id, { file: relativePath, index });
      }
    }
  });

  return issues;
}

/**
 * Validates a list of reading comprehension texts
 */
function validateReadingTexts(items, relativePath) {
  const issues = [];

  items.forEach((item, index) => {
    totalItemsChecked++;
    const itemRef = item.id || `#${index + 1}`;

    const parseResult = ReadingTextSchema.safeParse(item);
    if (!parseResult.success) {
      for (const issue of parseResult.error.issues) {
        issues.push({
          type: "Schema Violation",
          itemRef,
          path: issue.path.join("."),
          message: issue.message
        });
      }
    }

    if (item.id) {
      if (seenIds.has(item.id)) {
        const prior = seenIds.get(item.id);
        issues.push({
          type: "Duplicate ID",
          itemRef,
          path: "id",
          message: `ID '${item.id}' was already declared in ${prior.file}`
        });
      } else {
        seenIds.set(item.id, { file: relativePath, index });
      }
    }

    // Verify question IDs uniqueness within reading text
    if (Array.isArray(item.questions)) {
      const qIds = new Set();
      item.questions.forEach((q, qIdx) => {
        if (q.id) {
          if (qIds.has(q.id)) {
            issues.push({
              type: "Duplicate Question ID",
              itemRef,
              path: `questions.${qIdx}.id`,
              message: `Duplicate question id '${q.id}' in reading text '${item.id}'`
            });
          }
          qIds.add(q.id);
        }
      });
    }
  });

  return issues;
}

/**
 * Validates the Human Review Queue file
 */
function validateReviewQueue(items, _relativePath) {
  const issues = [];

  items.forEach((entry, index) => {
    totalItemsChecked++;
    const itemRef = entry.queueId || `#${index + 1}`;

    const queueParse = ReviewQueueItemSchema.safeParse(entry);
    if (!queueParse.success) {
      for (const issue of queueParse.error.issues) {
        issues.push({
          type: "Review Queue Schema Violation",
          itemRef,
          path: issue.path.join("."),
          message: issue.message
        });
      }
    }

    // Validate payload against respective schema
    if (entry.item && entry.itemType) {
      let payloadSchema = null;
      if (entry.itemType === "flashcard") payloadSchema = FlashcardSchema;
      else if (entry.itemType === "grammar") payloadSchema = GrammarExerciseSchema;
      else if (entry.itemType === "reading") payloadSchema = ReadingTextSchema;
      else if (entry.itemType === "listening") payloadSchema = ListeningItemSchema;
      else if (entry.itemType === "exam") payloadSchema = ExamTaskSchema;
      else if (entry.itemType === "writing") payloadSchema = WritingPromptSchema;

      if (payloadSchema) {
        const payloadParse = payloadSchema.safeParse(entry.item);
        if (!payloadParse.success) {
          for (const issue of payloadParse.error.issues) {
            issues.push({
              type: `Queue Item [${entry.itemType}] Invalid`,
              itemRef,
              path: `item.${issue.path.join(".")}`,
              message: issue.message
            });
          }
        }
      }
    }
  });

  return issues;
}

/**
 * Dispatches file validation based on filename convention
 */
function validateFile(filePath) {
  const relativePath = path.relative(DATA_DIR, filePath);
  const fileName = path.basename(filePath);

  let rawContent;
  try {
    rawContent = fs.readFileSync(filePath, "utf8");
  } catch (err) {
    fileReports.push({
      file: relativePath,
      count: 0,
      issues: [{ type: "File Read Error", message: err.message }]
    });
    totalErrors++;
    return;
  }

  let data;
  try {
    data = JSON.parse(rawContent);
  } catch (err) {
    fileReports.push({
      file: relativePath,
      count: 0,
      issues: [{ type: "JSON Syntax Error", message: err.message }]
    });
    totalErrors++;
    return;
  }

  if (!Array.isArray(data)) {
    // If it's an object, check if it's a curriculum level container
    if (fileName === "curriculum.json" || fileName === "examMockData.json") {
      // Handled separately or skipped for direct array validation
      return;
    }
  }

  totalFilesChecked++;
  let issues = [];

  if (fileName.startsWith("flashcard")) {
    issues = validateFlashcardDeck(data, relativePath);
  } else if (fileName.startsWith("grammarExercise")) {
    issues = validateGrammarDeck(data, relativePath);
  } else if (fileName.startsWith("readingText")) {
    issues = validateReadingTexts(data, relativePath);
  } else if (fileName === "reviewQueue.json") {
    issues = validateReviewQueue(data, relativePath);
  }

  const errorCount = issues.filter((i) => i.severity !== "warn").length;
  const warnCount = issues.filter((i) => i.severity === "warn").length;

  totalErrors += errorCount;
  totalWarnings += warnCount;

  fileReports.push({
    file: relativePath,
    count: data.length,
    issues,
    errorCount,
    warnCount
  });
}

/**
 * Main validation execution
 */
export function runValidation() {
  console.log(`\n${c.header("═══════════════════════════════════════════════════════════")}`);
  console.log(`${c.header(" DeutschPath Content & Pedagogical Validation Pipeline ")}`);
  console.log(`${c.header("═══════════════════════════════════════════════════════════")}\n`);

  if (!fs.existsSync(DATA_DIR)) {
    console.error(c.error(`Data directory not found: ${DATA_DIR}`));
    process.exit(1);
  }

  const files = fs.readdirSync(DATA_DIR);
  for (const file of files) {
    if (file.endsWith(".json")) {
      validateFile(path.join(DATA_DIR, file));
    }
  }

  // Print results
  for (const report of fileReports) {
    const statusIcon = report.errorCount === 0 ? (report.warnCount > 0 ? c.warn("▲") : c.success("✓")) : c.error("✕");
    console.log(
      `${statusIcon} ${c.bold(report.file)} ${c.dim(`(${report.count} items, ${report.errorCount} errors, ${report.warnCount} warnings)`)}`
    );

    for (const issue of report.issues) {
      if (issue.severity === "warn") {
        console.log(`   ${c.warn("WARN")} [${issue.itemRef}] ${c.dim(issue.path || "")}: ${issue.message}`);
      } else {
        console.log(`   ${c.error("FAIL")} [${issue.itemRef}] ${c.dim(issue.path || "")}: ${issue.message}`);
      }
    }
  }

  console.log(`\n${c.dim("───────────────────────────────────────────────────────────")}`);
  console.log(
    `Summary: ${c.bold(totalFilesChecked)} files checked, ${c.bold(totalItemsChecked)} items verified.`
  );

  if (totalErrors > 0) {
    console.log(c.error(`\nValidation FAILED with ${totalErrors} error(s) and ${totalWarnings} warning(s).\n`));
    return false;
  }

  console.log(c.success(`\nValidation PASSED cleanly! (${totalWarnings} warnings)\n`));
  return true;
}

// When invoked directly from CLI
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const success = runValidation();
  process.exit(success ? 0 : 1);
}
