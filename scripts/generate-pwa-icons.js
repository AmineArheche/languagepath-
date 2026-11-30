/**
 * scripts/generate-pwa-icons.js
 *
 * Generates crisp, compliant PNG and SVG PWA icons using Node.js built-in zlib.
 * Produces:
 * - public/pwa-192x192.png
 * - public/pwa-512x512.png
 * - public/pwa-maskable-512x512.png
 * - public/apple-touch-icon.png
 * - public/favicon.svg
 */

import fs from "fs";
import path from "path";
import zlib from "zlib";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PUBLIC_DIR = path.resolve(__dirname, "..", "public");

// Precompute CRC32 table
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    if (c & 1) c = 0xedb88320 ^ (c >>> 1);
    else c = c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const typeBuf = Buffer.from(type, "ascii");
  const lengthBuf = Buffer.alloc(4);
  lengthBuf.writeUInt32BE(data.length, 0);

  const crcData = Buffer.concat([typeBuf, data]);
  const crc = crc32(crcData);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc, 0);

  return Buffer.concat([lengthBuf, typeBuf, data, crcBuf]);
}

function createPng(width, height, getPixel) {
  const rowLength = 1 + width * 4;
  const rawData = Buffer.alloc(rowLength * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowLength;
    rawData[rowOffset] = 0; // Filter type 0 (None)
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = getPixel(x, y, width, height);
      const pixelOffset = rowOffset + 1 + x * 4;
      rawData[pixelOffset] = r;
      rawData[pixelOffset + 1] = g;
      rawData[pixelOffset + 2] = b;
      rawData[pixelOffset + 3] = a;
    }
  }

  const deflated = zlib.deflateSync(rawData);
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // 8-bit depth
  ihdr[9] = 6; // RGBA color type
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  return Buffer.concat([
    signature,
    makeChunk("IHDR", ihdr),
    makeChunk("IDAT", deflated),
    makeChunk("IEND", Buffer.alloc(0))
  ]);
}

/**
 * Procedural rendering for DeutschPath App Badge:
 * - Gradient background: from #f59e0b (Amber) via #e11d48 (Rose) to #4f46e5 (Indigo)
 * - German flag tricolor bar (Schwarz - Rot - Gold) at bottom
 * - Stylized "DP" shield emblem in center
 */
function getIconPixel(x, y, width, height, isMaskable = false) {
  const nx = x / width;
  const ny = y / height;

  // Background gradient: Amber (245, 158, 11) -> Rose (225, 29, 72) -> Indigo (79, 70, 229)
  let bgR, bgG, bgB;
  const t = (nx + ny) / 2;
  if (t < 0.5) {
    const factor = t / 0.5;
    bgR = Math.round(245 * (1 - factor) + 225 * factor);
    bgG = Math.round(158 * (1 - factor) + 29 * factor);
    bgB = Math.round(11 * (1 - factor) + 72 * factor);
  } else {
    const factor = (t - 0.5) / 0.5;
    bgR = Math.round(225 * (1 - factor) + 79 * factor);
    bgG = Math.round(29 * (1 - factor) + 70 * factor);
    bgB = Math.round(72 * (1 - factor) + 229 * factor);
  }

  // Rounded corners for non-maskable icons
  if (!isMaskable) {
    const radius = width * 0.22;
    let dist = 0;
    if (x < radius && y < radius) dist = Math.hypot(radius - x, radius - y);
    else if (x > width - radius && y < radius) dist = Math.hypot(x - (width - radius), radius - y);
    else if (x < radius && y > height - radius) dist = Math.hypot(radius - x, y - (height - radius));
    else if (x > width - radius && y > height - radius)
      dist = Math.hypot(x - (width - radius), y - (height - radius));

    if (dist > radius) {
      return [0, 0, 0, 0]; // Transparent outside rounded corner
    }
  }

  // Inner badge circle / rounded shield in safe zone (between 0.2 and 0.8)
  const cx = width / 2;
  const cy = height / 2;
  const r = width * 0.38;
  const distFromCenter = Math.hypot(x - cx, y - cy);

  // German Tricolor Accent Stripe near bottom (y between 0.82 and 0.92)
  if (ny >= 0.84 && ny <= 0.92 && nx >= 0.2 && nx <= 0.8) {
    const stripeT = (nx - 0.2) / 0.6;
    if (stripeT < 0.33) {
      return [20, 20, 20, 255]; // Black
    } else if (stripeT < 0.66) {
      return [220, 38, 38, 255]; // Red
    } else {
      return [250, 204, 21, 255]; // Gold
    }
  }

  // White inner DP emblem / letter strokes
  // Left 'D' stroke
  const dLeft = width * 0.32;
  const dRight = width * 0.48;
  const dTop = height * 0.32;
  const dBottom = height * 0.68;
  const stroke = width * 0.055;

  // D vertical bar
  if (x >= dLeft && x <= dLeft + stroke && y >= dTop && y <= dBottom) {
    return [255, 255, 255, 255];
  }
  // D top bar
  if (x >= dLeft && x <= dRight - stroke && y >= dTop && y <= dTop + stroke) {
    return [255, 255, 255, 255];
  }
  // D bottom bar
  if (x >= dLeft && x <= dRight - stroke && y >= dBottom - stroke && y <= dBottom) {
    return [255, 255, 255, 255];
  }
  // D right arc
  const dArcRadius = (dBottom - dTop) / 2;
  const dArcCenterY = (dTop + dBottom) / 2;
  const dDist = Math.hypot(x - (dRight - stroke), y - dArcCenterY);
  if (x >= dRight - stroke && dDist <= dArcRadius && dDist >= dArcRadius - stroke) {
    return [255, 255, 255, 255];
  }

  // Right 'P' stroke
  const pLeft = width * 0.54;
  const pRight = width * 0.70;
  const pTop = height * 0.32;
  const pMid = height * 0.52;
  const pBottom = height * 0.68;

  // P vertical bar
  if (x >= pLeft && x <= pLeft + stroke && y >= pTop && y <= pBottom) {
    return [255, 255, 255, 255];
  }
  // P top bar
  if (x >= pLeft && x <= pRight - stroke && y >= pTop && y <= pTop + stroke) {
    return [255, 255, 255, 255];
  }
  // P mid bar
  if (x >= pLeft && x <= pRight - stroke && y >= pMid - stroke && y <= pMid) {
    return [255, 255, 255, 255];
  }
  // P right loop
  const pArcRadius = (pMid - pTop) / 2;
  const pArcCenterY = (pTop + pMid) / 2;
  const pDist = Math.hypot(x - (pRight - stroke), y - pArcCenterY);
  if (x >= pRight - stroke && pDist <= pArcRadius && pDist >= pArcRadius - stroke) {
    return [255, 255, 255, 255];
  }

  // Slight inner shadow/border ring around shield
  if (Math.abs(distFromCenter - r) < 2) {
    return [255, 255, 255, 120];
  }

  return [bgR, bgG, bgB, 255];
}

function generateIcons() {
  if (!fs.existsSync(PUBLIC_DIR)) {
    fs.mkdirSync(PUBLIC_DIR, { recursive: true });
  }

  console.log("Generating PWA Icon Assets in public/...");

  // 192x192 PNG
  const png192 = createPng(192, 192, (x, y, w, h) => getIconPixel(x, y, w, h, false));
  fs.writeFileSync(path.join(PUBLIC_DIR, "pwa-192x192.png"), png192);
  console.log("✓ pwa-192x192.png (192x192)");

  // 512x512 PNG
  const png512 = createPng(512, 512, (x, y, w, h) => getIconPixel(x, y, w, h, false));
  fs.writeFileSync(path.join(PUBLIC_DIR, "pwa-512x512.png"), png512);
  console.log("✓ pwa-512x512.png (512x512)");

  // 512x512 Maskable PNG
  const pngMaskable = createPng(512, 512, (x, y, w, h) => getIconPixel(x, y, w, h, true));
  fs.writeFileSync(path.join(PUBLIC_DIR, "pwa-maskable-512x512.png"), pngMaskable);
  console.log("✓ pwa-maskable-512x512.png (512x512 maskable)");

  // 180x180 Apple Touch Icon
  const appleIcon = createPng(180, 180, (x, y, w, h) => getIconPixel(x, y, w, h, false));
  fs.writeFileSync(path.join(PUBLIC_DIR, "apple-touch-icon.png"), appleIcon);
  console.log("✓ apple-touch-icon.png (180x180)");

  // SVG Vector Icon
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f59e0b" />
      <stop offset="50%" stop-color="#e11d48" />
      <stop offset="100%" stop-color="#4f46e5" />
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="112" fill="url(#grad)" />
  <circle cx="256" cy="256" r="195" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="4" />
  <!-- D -->
  <path d="M 164 164 L 220 164 C 270 164 270 348 220 348 L 164 348 Z M 192 192 L 192 320 L 216 320 C 248 320 248 192 216 192 Z" fill="#ffffff" />
  <!-- P -->
  <path d="M 276 164 L 332 164 C 372 164 372 266 332 266 L 304 266 L 304 348 L 276 348 Z M 304 192 L 304 238 L 328 238 C 348 238 348 192 328 192 Z" fill="#ffffff" />
  <!-- German Flag Accent -->
  <rect x="120" y="430" width="90.6" height="30" rx="4" fill="#111827" />
  <rect x="210.6" y="430" width="90.6" height="30" rx="4" fill="#ef4444" />
  <rect x="301.2" y="430" width="90.6" height="30" rx="4" fill="#fbbf24" />
</svg>`;

  fs.writeFileSync(path.join(PUBLIC_DIR, "favicon.svg"), svgContent);
  console.log("✓ favicon.svg");

  console.log("All PWA icons successfully generated!\n");
}

generateIcons();
