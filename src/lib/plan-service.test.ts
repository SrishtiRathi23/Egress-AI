import { describe, expect, it } from "vitest";
import { MAX_DISPLAY_DENSITY } from "@/lib/egress";
import { SAMPLE_NETWORKS } from "@/data/venues";
import { buildPlan } from "./plan-service";

// Runs with Gemini disabled, so parsing/narration use the deterministic path.

describe("buildPlan", () => {
  it("returns null for an unknown venue", async () => {
    expect(await buildPlan("does-not-exist")).toBeNull();
  });

  it("builds a coherent plan for every sample venue", async () => {
    for (const network of SAMPLE_NETWORKS) {
      const plan = await buildPlan(network.id);
      expect(plan).not.toBeNull();
      if (plan === null) continue;
      expect(plan.venueName).toBe(network.name);
      expect(plan.gates).toHaveLength(network.gates.length);
      expect(plan.timeline.length).toBeGreaterThan(0);
      expect(plan.optimisedPeakDensity).toBeLessThanOrEqual(plan.baselinePeakDensity + 1e-9);
      for (const gate of plan.gates) {
        expect(gate.peakDensity).toBeLessThanOrEqual(MAX_DISPLAY_DENSITY + 1e-9);
      }
    }
  });

  it("marks an explicitly closed gate as closed", async () => {
    const plan = await buildPlan("arlington", { closedGateIds: ["g-south"] });
    expect(plan).not.toBeNull();
    if (plan === null) return;
    const south = plan.gates.find((gate) => gate.id === "g-south");
    expect(south?.closed).toBe(true);
    expect(plan.closedGateIds).toContain("g-south");
  });

  it("parses an incident text into a structured event", async () => {
    const plan = await buildPlan("arlington", { incidentText: "gate south is closed" });
    expect(plan?.event).toEqual({ type: "gate_closed", gateRef: "south" });
    expect(plan?.eventSource).toBe("fallback");
  });

  it("produces steward orders when a gate closure forces diversions", async () => {
    const plan = await buildPlan("arlington", { closedGateIds: ["g-south"] });
    expect(plan?.orders.length ?? 0).toBeGreaterThan(0);
    expect(plan?.narration.length ?? 0).toBeGreaterThan(0);
  });
});
