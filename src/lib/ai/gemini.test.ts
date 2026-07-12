import { describe, expect, it } from "vitest";
import type { StewardOrder } from "@/lib/egress";
import {
  buildBriefing,
  estimateDensityAI,
  narrateOrdersAI,
  parseIncidentAI,
} from "./gemini";

// These run with USE_GEMINI unset, so every wrapper must degrade to the
// deterministic engine and report source "fallback".

describe("buildBriefing", () => {
  it("reports a balanced plan when there are no orders", () => {
    const text = buildBriefing([], {
      venueName: "Arlington",
      peakDensity: 2.4,
      clearanceMinute: 8,
    });
    expect(text).toContain("balanced");
    expect(text).toContain("2.4");
  });

  it("lists each diversion under a header", () => {
    const orders: StewardOrder[] = [
      {
        zoneId: "z",
        zoneName: "Zone",
        fromGateId: "a",
        fromGateName: "A",
        toGateId: "b",
        toGateName: "B",
        estimatedClearMinutes: 6,
        message: "Divert Zone to B; expected to clear in ~6 min.",
      },
    ];
    const text = buildBriefing(orders, {
      venueName: "Arlington",
      peakDensity: 3.1,
      clearanceMinute: 9,
    });
    expect(text).toContain("1 diversion");
    expect(text).toContain("Divert Zone to B");
  });
});

describe("AI wrappers fall back deterministically when disabled", () => {
  it("parseIncidentAI uses the keyword parser", async () => {
    const result = await parseIncidentAI("Gate 3 is closed");
    expect(result.source).toBe("fallback");
    expect(result.event).toEqual({ type: "gate_closed", gateRef: "3" });
  });

  it("narrateOrdersAI returns the deterministic briefing", async () => {
    const result = await narrateOrdersAI([], {
      venueName: "Arlington",
      peakDensity: 2,
      clearanceMinute: null,
    });
    expect(result.source).toBe("fallback");
    expect(result.text).toContain("balanced");
  });

  it("estimateDensityAI returns a null reading", async () => {
    const result = await estimateDensityAI("AAAA", "image/png");
    expect(result).toEqual({ density: null, source: "fallback" });
  });
});
