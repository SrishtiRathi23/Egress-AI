import { describe, expect, it } from "vitest";
import { stewardOrders, worstClearMinutes } from "./instructions";
import type { EgressNetwork, GateSnapshot, SimResult, SimStep } from "./types";

function snap(gateId: string, estimatedClearMinutes: number | null): GateSnapshot {
  return {
    gateId,
    queue: 0,
    density: 0,
    levelOfService: "A",
    riskBand: "safe",
    served: 0,
    cleared: 0,
    estimatedClearMinutes,
  };
}

function step(minute: number, gates: GateSnapshot[]): SimStep {
  return { minute, gates, totalRemaining: 0 };
}

function makeResult(steps: SimStep[]): SimResult {
  return {
    networkId: "n",
    assignment: {},
    steps,
    totalPeople: 0,
    peakDensity: 0,
    peakDensityGateId: null,
    peakLoad: 0,
    peakLoadGateId: null,
    clearanceMinute: null,
  };
}

describe("worstClearMinutes", () => {
  it("returns the largest clear time observed for the gate", () => {
    const result = makeResult([
      step(1, [snap("g", 3)]),
      step(2, [snap("g", 7)]),
      step(3, [snap("g", 5)]),
    ]);
    expect(worstClearMinutes(result, "g")).toBe(7);
  });

  it("returns null when the gate never clears", () => {
    const result = makeResult([step(1, [snap("g", 4)]), step(2, [snap("g", null)])]);
    expect(worstClearMinutes(result, "g")).toBeNull();
  });

  it("skips steps that do not include the gate", () => {
    const result = makeResult([step(1, [snap("other", 9)]), step(2, [snap("g", 2)])]);
    expect(worstClearMinutes(result, "g")).toBe(2);
  });

  it("is zero when the gate is always empty", () => {
    const result = makeResult([step(1, [snap("g", 0)]), step(2, [snap("g", 0)])]);
    expect(worstClearMinutes(result, "g")).toBe(0);
  });
});

const NETWORK: EgressNetwork = {
  id: "n",
  name: "n",
  zones: [
    { id: "z1", name: "Zone One", occupancy: 100 },
    { id: "z2", name: "Zone Two", occupancy: 100 },
  ],
  gates: [
    { id: "gA", name: "Gate Alpha", lanes: 8, serviceRatePerLane: 50, widthMetres: 10, depthMetres: 8 },
    { id: "gB", name: "Gate Bravo", lanes: 8, serviceRatePerLane: 50, widthMetres: 10, depthMetres: 8 },
  ],
  links: [],
};

describe("stewardOrders", () => {
  it("emits one order per re-routed zone, with a clear-time estimate", () => {
    const result = makeResult([step(1, [snap("gA", 0), snap("gB", 6)])]);
    const orders = stewardOrders(NETWORK, { z1: "gA", z2: "gA" }, { z1: "gA", z2: "gB" }, result);
    expect(orders).toHaveLength(1);
    expect(orders[0]?.zoneId).toBe("z2");
    expect(orders[0]?.toGateName).toBe("Gate Bravo");
    expect(orders[0]?.message).toBe("Divert Zone Two to Gate Bravo; expected to clear in ~6 min.");
  });

  it("omits the clear-time text when the gate never clears", () => {
    const result = makeResult([step(1, [snap("gB", null)])]);
    const orders = stewardOrders(NETWORK, { z1: "gA", z2: "gA" }, { z1: "gA", z2: "gB" }, result);
    expect(orders[0]?.message).toBe("Divert Zone Two to Gate Bravo.");
    expect(orders[0]?.estimatedClearMinutes).toBeNull();
  });

  it("omits the clear-time text when the backlog is already zero", () => {
    const result = makeResult([step(1, [snap("gB", 0)])]);
    const orders = stewardOrders(NETWORK, { z1: "gA", z2: "gA" }, { z1: "gA", z2: "gB" }, result);
    expect(orders[0]?.message).toBe("Divert Zone Two to Gate Bravo.");
  });

  it("produces no order for zones that did not move", () => {
    const result = makeResult([step(1, [snap("gA", 0), snap("gB", 0)])]);
    const orders = stewardOrders(NETWORK, { z1: "gA", z2: "gB" }, { z1: "gA", z2: "gB" }, result);
    expect(orders).toHaveLength(0);
  });

  it("skips zones missing from either plan", () => {
    const result = makeResult([step(1, [snap("gB", 2)])]);
    const missingBaseline = stewardOrders(NETWORK, { z2: "gA" }, { z1: "gA", z2: "gB" }, result);
    const missingOptimised = stewardOrders(NETWORK, { z1: "gA", z2: "gA" }, { z2: "gB" }, result);
    // z1 is absent from a plan in each case, so only z2 can yield an order.
    expect(missingBaseline.map((o) => o.zoneId)).toEqual(["z2"]);
    expect(missingOptimised.map((o) => o.zoneId)).toEqual(["z2"]);
  });

  it("falls back to the gate id when the gate is unknown", () => {
    const result = makeResult([step(1, [snap("ghost", 0)])]);
    const orders = stewardOrders(NETWORK, { z1: "gA", z2: "gA" }, { z1: "gA", z2: "ghost" }, result);
    expect(orders[0]?.toGateName).toBe("ghost");
    expect(orders[0]?.message).toBe("Divert Zone Two to ghost.");
  });
});
