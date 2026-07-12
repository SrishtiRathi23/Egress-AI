import { describe, expect, it } from "vitest";
import {
  EXAMPLES,
  isRtl,
  LOCALES,
  LOCALE_META,
  MESSAGES,
  RISK_BAND_KEY,
  RISK_BAND_VAR,
  t,
  type MessageKey,
} from "./messages";

const ALL_KEYS = Object.keys(MESSAGES.en) as MessageKey[];

describe("i18n dictionary", () => {
  it("defines every key in every locale with a non-empty string", () => {
    for (const locale of LOCALES) {
      for (const key of ALL_KEYS) {
        const value = MESSAGES[locale][key];
        expect(typeof value).toBe("string");
        expect(value.length).toBeGreaterThan(0);
      }
    }
  });

  it("has no locale with missing or extra keys", () => {
    for (const locale of LOCALES) {
      expect(Object.keys(MESSAGES[locale]).sort()).toEqual([...ALL_KEYS].sort());
    }
  });

  it("marks only Arabic as right-to-left", () => {
    expect(isRtl("ar")).toBe(true);
    expect(isRtl("en")).toBe(false);
    expect(LOCALE_META.ar.dir).toBe("rtl");
  });

  it("resolves a message via t()", () => {
    expect(t("en", "analyse")).toBe("Analyse");
    expect(t("es", "analyse")).toBe("Analizar");
  });

  it("provides example prompts for every locale", () => {
    for (const locale of LOCALES) {
      expect(EXAMPLES[locale].length).toBeGreaterThanOrEqual(3);
    }
  });

  it("maps every risk band to a real key and colour token", () => {
    for (const band of ["safe", "comfortable", "moderate", "restricted", "dangerous", "critical"] as const) {
      expect(ALL_KEYS).toContain(RISK_BAND_KEY[band]);
      expect(RISK_BAND_VAR[band]).toMatch(/^--los-/);
    }
  });
});
