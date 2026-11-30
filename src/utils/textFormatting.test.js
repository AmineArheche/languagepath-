import { describe, it, expect } from "vitest";
import { getGenderDetails, GENDER_CONTRAST_TOKENS } from "./textFormatting";

// Standard WCAG Relative Luminance calculation
function getLuminance(hex) {
  const cleanHex = hex.replace("#", "");
  const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255;

  const toLinear = (c) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

function getContrastRatio(hex1, hex2) {
  const l1 = getLuminance(hex1);
  const l2 = getLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

describe("textFormatting - WCAG AA/AAA Contrast & Non-Colour Cues (Issue 6)", () => {
  const LIGHT_BG = "#FFFFFF";
  const DARK_BG = "#0F172A";

  it("should have Maskulin (der) contrast ratio >= 7.0:1 (AAA) on both #FFFFFF and #0F172A", () => {
    const der = GENDER_CONTRAST_TOKENS.der;
    const lightRatio = getContrastRatio(der.lightText, LIGHT_BG);
    const darkRatio = getContrastRatio(der.darkText, DARK_BG);

    expect(lightRatio).toBeGreaterThanOrEqual(7.0);
    expect(darkRatio).toBeGreaterThanOrEqual(7.0);
    expect(der.tag).toBe("m.");
    expect(der.cue).toBe("der");
  });

  it("should have Feminin (die) contrast ratio >= 7.0:1 (AAA) on both #FFFFFF and #0F172A", () => {
    const die = GENDER_CONTRAST_TOKENS.die;
    const lightRatio = getContrastRatio(die.lightText, LIGHT_BG);
    const darkRatio = getContrastRatio(die.darkText, DARK_BG);

    expect(lightRatio).toBeGreaterThanOrEqual(7.0);
    expect(darkRatio).toBeGreaterThanOrEqual(7.0);
    expect(die.tag).toBe("f.");
    expect(die.cue).toBe("die");
  });

  it("should have Neutrum (das) contrast ratio >= 7.0:1 (AAA) on both #FFFFFF and #0F172A", () => {
    const das = GENDER_CONTRAST_TOKENS.das;
    const lightRatio = getContrastRatio(das.lightText, LIGHT_BG);
    const darkRatio = getContrastRatio(das.darkText, DARK_BG);

    expect(lightRatio).toBeGreaterThanOrEqual(7.0);
    expect(darkRatio).toBeGreaterThanOrEqual(7.0);
    expect(das.tag).toBe("n.");
    expect(das.cue).toBe("das");
  });

  it("should have Plural (die/pl.) contrast ratio >= 7.0:1 (AAA) on both #FFFFFF and #0F172A", () => {
    const plural = GENDER_CONTRAST_TOKENS.plural;
    const lightRatio = getContrastRatio(plural.lightText, LIGHT_BG);
    const darkRatio = getContrastRatio(plural.darkText, DARK_BG);

    expect(lightRatio).toBeGreaterThanOrEqual(7.0);
    expect(darkRatio).toBeGreaterThanOrEqual(7.0);
    expect(plural.tag).toBe("pl.");
    expect(plural.cue).toBe("die (pl.)");
  });

  it("getGenderDetails should provide non-colour cues and contrast-safe styles", () => {
    const detailsDer = getGenderDetails("der");
    expect(detailsDer.tag).toBe("m.");
    expect(detailsDer.colorClass).toContain("text-blue-800");

    const detailsDie = getGenderDetails("die");
    expect(detailsDie.tag).toBe("f.");
    expect(detailsDie.colorClass).toContain("text-red-800");

    const detailsDas = getGenderDetails("das");
    expect(detailsDas.tag).toBe("n.");
    expect(detailsDas.colorClass).toContain("text-emerald-800");

    const detailsPlural = getGenderDetails("plural");
    expect(detailsPlural.tag).toBe("pl.");
    expect(detailsPlural.colorClass).toContain("text-purple-800");
  });
});
