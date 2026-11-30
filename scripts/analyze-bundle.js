/**
 * scripts/analyze-bundle.js
 * Analyzes Vite production build assets in dist/assets,
 * calculates uncompressed and gzip sizes, and verifies that
 * all chunks comply with the performance budget (<= 250 KB gzip).
 */

import fs from "fs";
import path from "path";
import zlib from "zlib";

const ASSETS_DIR = path.resolve(process.cwd(), "dist", "assets");
const MAX_GZIP_BUDGET_KB = 250;

console.log("=================================================");
console.log("       DeutschPath Production Bundle Analysis    ");
console.log("=================================================");
console.log(`Gzip Budget per Chunk: <= ${MAX_GZIP_BUDGET_KB} KB\n`);

if (!fs.existsSync(ASSETS_DIR)) {
  console.error("Error: dist/assets directory not found. Please run 'npm run build' first.");
  process.exit(1);
}

const files = fs.readdirSync(ASSETS_DIR);
const assetStats = [];
let totalRawBytes = 0;
let totalGzipBytes = 0;
let violations = [];

for (const file of files) {
  if (file.endsWith(".js") || file.endsWith(".css")) {
    const filePath = path.join(ASSETS_DIR, file);
    const content = fs.readFileSync(filePath);
    const rawBytes = content.length;
    const gzipBytes = zlib.gzipSync(content).length;

    totalRawBytes += rawBytes;
    totalGzipBytes += gzipBytes;

    const rawKB = rawBytes / 1024;
    const gzipKB = gzipBytes / 1024;

    assetStats.push({
      file,
      rawKB,
      gzipKB,
      isOverBudget: gzipKB > MAX_GZIP_BUDGET_KB
    });

    if (gzipKB > MAX_GZIP_BUDGET_KB) {
      violations.push({ file, gzipKB });
    }
  }
}

// Sort descending by gzip size
assetStats.sort((a, b) => b.gzipKB - a.gzipKB);

console.log("Asset Name".padEnd(45) + "Raw Size".padEnd(15) + "Gzip Size".padEnd(15) + "Status");
console.log("-".repeat(85));

for (const stat of assetStats) {
  const statusStr = stat.isOverBudget
    ? `[FAIL] > ${MAX_GZIP_BUDGET_KB} KB`
    : `[PASS] <= ${MAX_GZIP_BUDGET_KB} KB`;
  console.log(
    stat.file.padEnd(45) +
    `${stat.rawKB.toFixed(1)} KB`.padEnd(15) +
    `${stat.gzipKB.toFixed(1)} KB`.padEnd(15) +
    statusStr
  );
}

console.log("-".repeat(85));
console.log(`Total Assets Checked : ${assetStats.length}`);
console.log(`Total Raw Size       : ${(totalRawBytes / 1024).toFixed(1)} KB`);
console.log(`Total Gzip Size      : ${(totalGzipBytes / 1024).toFixed(1)} KB`);
console.log("=================================================");

if (violations.length > 0) {
  console.error(`\n[BUDGET EXCEEDED] ${violations.length} chunk(s) exceed the ${MAX_GZIP_BUDGET_KB} KB gzip threshold:`);
  violations.forEach((v) => {
    console.error(`  - ${v.file}: ${v.gzipKB.toFixed(1)} KB gzip`);
  });
  process.exit(1);
} else {
  console.log(`\nResult: ALL CHUNKS SATISFY THE <= ${MAX_GZIP_BUDGET_KB} KB GZIP BUDGET! (100% Pass)`);
  process.exit(0);
}
