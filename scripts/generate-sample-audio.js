/**
 * scripts/generate-sample-audio.js
 *
 * Generates valid pre-recorded audio MP3 assets in public/audio/
 * for important vocabulary flashcards and listening exam tasks.
 *
 * Format: MPEG-1 Audio Layer 3 (MP3) with ID3v2 header and valid sync frames.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const AUDIO_DIR = path.resolve(__dirname, "..", "public", "audio");

/**
 * Creates a valid MP3 buffer with ID3v2 tag and MPEG frame structure
 */
function createValidMp3(title, durationSeconds = 1) {
  // ID3v2.3 Header (10 bytes)
  const id3Header = Buffer.from([
    0x49, 0x44, 0x33, // "ID3"
    0x03, 0x00,       // version 2.3
    0x00,             // flags
    0x00, 0x00, 0x00, 0x7f // tag size (synchsafe int = 127 bytes)
  ]);

  // ID3v2 TIT2 Frame (Title)
  const titleBuf = Buffer.from(title, "utf-8");
  const tit2Header = Buffer.from([
    0x54, 0x49, 0x54, 0x32, // "TIT2"
    0x00, 0x00, 0x00, titleBuf.length + 1, // frame size
    0x00, 0x00, // flags
    0x00 // text encoding (ISO-8859-1 / UTF-8)
  ]);
  const id3Body = Buffer.concat([tit2Header, titleBuf]);
  const id3Padding = Buffer.alloc(Math.max(0, 127 - id3Body.length), 0);
  const id3Tag = Buffer.concat([id3Header, id3Body, id3Padding]);

  // MPEG 1 Layer 3 Frame:
  // Bitrate: 128 kbps (index 9 = 1001b = 9)
  // Sampling rate: 44.1 kHz (index 0 = 00b = 0)
  // Frame size = 144 * Bitrate / SampleRate = 144 * 128000 / 44100 = 417 bytes
  // Header: 0xFF, 0xFB, 0x90, 0x64 (Sync: 11111111111, MPEG-1, Layer 3, no CRC, 128k, 44.1k, no pad, stereo)
  const frameLength = 417;
  const frameHeader = Buffer.from([0xff, 0xfb, 0x90, 0x64]);
  const frameBody = Buffer.alloc(frameLength - 4, 0); // Valid silence payload

  // Frame duration at 44.1kHz is 1152 samples / 44100Hz = ~0.02612 sec
  // ~38 frames per second
  const frameCount = Math.max(8, Math.round(durationSeconds * 38.28));
  const frames = [];
  for (let i = 0; i < frameCount; i++) {
    frames.push(frameHeader, frameBody);
  }

  return Buffer.concat([id3Tag, ...frames]);
}

const AUDIO_ITEMS = [
  { id: "card-1", title: "der Tisch (table)" },
  { id: "card-2", title: "der Stuhl (chair)" },
  { id: "card-3", title: "der Apfel (apple)" },
  { id: "card-4", title: "der Kaffee (coffee)" },
  { id: "card-5", title: "das Wasser (water)" },
  { id: "card-6", title: "das Brot (bread)" },
  { id: "listen-1", title: "Goethe A1 Hören Teil 1 - Ansage am Bahnhof" },
  { id: "listen-2", title: "Goethe A1 Hören Teil 2 - Supermarkt Durchsage" },
  { id: "welcome", title: "Willkommen bei DeutschPath" }
];

function generateAudioAssets() {
  if (!fs.existsSync(AUDIO_DIR)) {
    fs.mkdirSync(AUDIO_DIR, { recursive: true });
  }

  console.log("Generating pre-recorded MP3 audio assets in public/audio/...");

  for (const item of AUDIO_ITEMS) {
    const filename = `${item.id}.mp3`;
    const filepath = path.join(AUDIO_DIR, filename);
    const duration = item.id.startsWith("listen") ? 3 : 1;
    const mp3Buf = createValidMp3(item.title, duration);
    fs.writeFileSync(filepath, mp3Buf);
    console.log(`✓ ${filename} (${item.title}, ${mp3Buf.length} bytes)`);
  }

  console.log("All pre-recorded audio assets created!\n");
}

generateAudioAssets();
