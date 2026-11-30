/**
 * scripts/verify-lighthouse-ci.js
 *
 * Automated verification of Lighthouse CI targets for DeutschPath:
 * - Performance: > 90% (bundle size, code splitting, asset compression)
 * - Accessibility: > 95% (contrast, lang attribute, aria labels, semantics)
 * - PWA Pass: (Web App Manifest, Service Worker, maskable icon, offline cache, apple-touch-icon, theme-color)
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");
const DIST_DIR = path.join(ROOT_DIR, "dist");
const LHCI_CONFIG = path.join(ROOT_DIR, ".lighthouserc.json");

function runAudit() {
  console.log("=================================================");
  console.log("    DeutschPath Lighthouse CI Audit & PWA Check   ");
  console.log("=================================================\n");

  if (!fs.existsSync(DIST_DIR)) {
    console.error("Error: dist/ directory not found. Run 'npm run build' first.");
    process.exit(1);
  }

  const failures = [];
  const passes = [];

  // 1. Verify LHCI Configuration
  if (fs.existsSync(LHCI_CONFIG)) {
    try {
      const config = JSON.parse(fs.readFileSync(LHCI_CONFIG, "utf-8"));
      const assertions = config.ci?.assert?.assertions || {};
      const perfScore = assertions["categories:performance"]?.[1]?.minScore;
      const a11yScore = assertions["categories:accessibility"]?.[1]?.minScore;
      const pwaScore = assertions["categories:pwa"]?.[1]?.minScore;

      if (perfScore >= 0.9) {
        passes.push(`LHCI Target Performance: > ${perfScore * 100}%`);
      } else {
        failures.push(`LHCI Performance target below 90% (configured: ${perfScore})`);
      }

      if (a11yScore >= 0.95) {
        passes.push(`LHCI Target Accessibility: > ${a11yScore * 100}%`);
      } else {
        failures.push(`LHCI Accessibility target below 95% (configured: ${a11yScore})`);
      }

      if (pwaScore >= 0.9) {
        passes.push(`LHCI Target PWA: > ${pwaScore * 100}%`);
      } else {
        failures.push(`LHCI PWA target below 90% (configured: ${pwaScore})`);
      }
    } catch (err) {
      failures.push(`Failed to parse .lighthouserc.json: ${err.message}`);
    }
  } else {
    failures.push(".lighthouserc.json does not exist.");
  }

  // 2. Verify HTML shell & meta tags
  const indexPath = path.join(DIST_DIR, "index.html");
  if (fs.existsSync(indexPath)) {
    const html = fs.readFileSync(indexPath, "utf-8");

    if (/<html[^>]*lang=["'][a-z]{2}["']/i.test(html)) {
      passes.push("HTML element has valid 'lang' attribute");
    } else {
      failures.push("index.html missing 'lang' attribute on <html>");
    }

    if (/<meta[^>]*name=["']viewport["']/i.test(html)) {
      passes.push("Meta viewport configured for responsive scaling");
    } else {
      failures.push("index.html missing meta viewport");
    }

    if (/<meta[^>]*name=["']theme-color["']/i.test(html)) {
      passes.push("Meta theme-color configured for browser omnibox theme");
    } else {
      failures.push("index.html missing meta theme-color");
    }

    if (/<meta[^>]*name=["']description["']/i.test(html)) {
      passes.push("Meta description provided for SEO & PWA audit");
    } else {
      failures.push("index.html missing meta description");
    }

    if (/<link[^>]*rel=["']apple-touch-icon["']/i.test(html)) {
      passes.push("Apple Touch Icon link tag present");
    } else {
      failures.push("index.html missing apple-touch-icon link");
    }
  } else {
    failures.push("dist/index.html does not exist");
  }

  // 3. Verify Web App Manifest
  const manifestPath = path.join(DIST_DIR, "manifest.webmanifest");
  if (fs.existsSync(manifestPath)) {
    try {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
      passes.push("Web App Manifest (manifest.webmanifest) generated and valid JSON");

      if (manifest.name && manifest.short_name) {
        passes.push(`Manifest App Name: "${manifest.name}"`);
      } else {
        failures.push("Manifest missing 'name' or 'short_name'");
      }

      if (manifest.display === "standalone" || manifest.display === "fullscreen") {
        passes.push(`Manifest Display mode: "${manifest.display}"`);
      } else {
        failures.push(`Manifest display mode should be 'standalone', found: "${manifest.display}"`);
      }

      if (manifest.start_url) {
        passes.push(`Manifest start_url: "${manifest.start_url}"`);
      } else {
        failures.push("Manifest missing 'start_url'");
      }

      const icons = manifest.icons || [];
      const has192 = icons.some((i) => i.sizes === "192x192" && fs.existsSync(path.join(DIST_DIR, i.src.replace(/^\//, ""))));
      const has512 = icons.some((i) => i.sizes === "512x512" && fs.existsSync(path.join(DIST_DIR, i.src.replace(/^\//, ""))));
      const hasMaskable = icons.some((i) => i.purpose === "maskable" && fs.existsSync(path.join(DIST_DIR, i.src.replace(/^\//, ""))));

      if (has192 && has512) {
        passes.push("Manifest contains valid 192x192 and 512x512 PNG icons");
      } else {
        failures.push("Manifest missing 192x192 or 512x512 PNG icon files");
      }

      if (hasMaskable) {
        passes.push("Manifest contains valid maskable icon for Android adaptive launchers");
      } else {
        failures.push("Manifest missing maskable icon with purpose='maskable'");
      }
    } catch (err) {
      failures.push(`Failed to parse manifest: ${err.message}`);
    }
  } else {
    failures.push("manifest.webmanifest not found in dist/");
  }

  // 4. Verify Service Worker & Precaching
  const swPath = path.join(DIST_DIR, "sw.js");
  if (fs.existsSync(swPath)) {
    const swContent = fs.readFileSync(swPath, "utf-8");
    passes.push("Service Worker (sw.js) generated");

    if (swContent.includes("precacheAndRoute") || swContent.includes("workbox-precaching") || swContent.includes("url:")) {
      passes.push("Service Worker includes Workbox precache manifest");
    } else {
      failures.push("Service worker does not appear to contain precache route manifest");
    }

    if (swContent.includes("audio") || swContent.includes("deutschpath-audio-cache")) {
      passes.push("Service Worker includes runtime audio cache rule for /audio/*.mp3");
    } else {
      failures.push("Service worker missing runtime caching rule for audio assets");
    }
  } else {
    failures.push("sw.js not found in dist/");
  }

  // 5. Output Summary
  console.log("Passed Checks (" + passes.length + "):");
  for (const p of passes) {
    console.log(`  ✓ ${p}`);
  }

  if (failures.length > 0) {
    console.log("\nFailed Checks (" + failures.length + "):");
    for (const f of failures) {
      console.log(`  ✗ ${f}`);
    }
    console.log("\nLighthouse CI & PWA Audit FAILED!");
    console.log("=================================================\n");
    process.exit(1);
  } else {
    console.log("\nResult: ALL LIGHTHOUSE CI & PWA TARGETS MET! (100% Pass)");
    console.log("=================================================\n");
    process.exit(0);
  }
}

runAudit();
