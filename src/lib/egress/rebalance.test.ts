import { describe, expect, it } from "vitest";
import { ARLINGTON, ATLANTA, DEFAULT_SIM_CONFIG } from "@/data/venues";
import { mulberry32, randomNetwork } from "@/test/network-factory";
import { nearestGateAssignment, rebalance } from "./rebalance";
import { simulate } from "./simulate";
import type { EgressNetwork, SimConfig } from "./types";

const CONFIG: SimConfig = { horizonMinutes: 40, stepMinutes: 1 };

describe("nearestGateAssignment", () => {
  it("routes each zone to its lowest-walk gate", () => {
    const assignment = nearestGateAssignment(ARLINGTON);
    expect(assignment["z-low-n"]).toBe("g-north"); // 2 min beats 4 and 5
    expect(assignment["z-low-s"]).toBe("g-south");
  });

  it("throws for a zone with no permitted gates", () => {
    const broken: EgressNetwork = {
      id: "b",
      name: "b",
      zones: [{ id: "z", name: "Z", occupancy: 10 }],
      gates: [{ id: "g", name: "G", lanes: 4, serviceRatePerLane: 50, widthMetres: 8, depthMetres: 6 }],
      links: [],
    };
    expect(() => nearestGateAssignment(broken)).toThrow(RangeError);
  });
});

describe("rebalance", () => {
  it("never produces a worse peak load than the baseline", () => {
    for (const network of [ARLINGTON, ATLANTA]) {
      const result = rebalance(network, DEFAULT_SIM_CONFIG);
      expect(result.optimisedPeakLoad).toBeLessThanOrEqual(
        result.baselinePeakLoad + 1e-9,
      );
      // The reported baseline load matches an independent simulation.
      const baselineLoad = simulate(network, result.baseline, DEFAULT_SIM_CONFIG).peakLoad;
      expect(result.baselinePeakLoad).toBeCloseTo(baselineLoad, 9);
    }
  });

  it("strictly lowers peak density when the baseline overloads a gate", () => {
    // Two zones both nearest to the same small gate; a bigger gate sits slightly
    // further away. Re-balancing must move load off the bottleneck.
    const network: EgressNetwork = {
      id: "squeeze",
      name: "squeeze",
      zones: [
        { id: "z1", name: "Z1", occupancy: 6000 },
        { id: "z2", name: "Z2", occupancy: 6000 },
      ],
      gates: [
        { id: "small", name: "Small", lanes: 3, serviceRatePerLane: 40, widthMetres: 4, depthMetres: 4 },
        { id: "big", name: "Big", lanes: 14, serviceRatePerLane: 55, widthMetres: 16, depthMetres: 10 },
      ],
      links: [
        { zoneId: "z1", gateId: "small", walkMinutes: 1 },
        { zoneId: "z1", gateId: "big", walkMinutes: 2 },
        { zoneId: "z2", gateId: "small", walkMinutes: 1 },
        { zoneId: "z2", gateId: "big", walkMinutes: 2 },
      ],
    };
    const result = rebalance(network, CONFIG);
    expect(result.optimisedPeakLoad).toBeLessThan(result.baselinePeakLoad);
  });

  it("returns the baseline unchanged when it is already optimal", () => {
    // A single zone has only one gate: no move is possible.
    const network: EgressNetwork = {
      id: "trivial",
      name: "trivial",
      zones: [{ id: "z", name: "Z", occupancy: 1000 }],
      gates: [{ id: "g", name: "G", lanes: 10, serviceRatePerLane: 50, widthMetres: 12, depthMetres: 9 }],
      links: [{ zoneId: "z", gateId: "g", walkMinutes: 1 }],
    };
    const result = rebalance(network, CONFIG);
    expect(result.optimised).toEqual(result.baseline);
  });

  it("stays no worse than baseline across many random networks", () => {
    const rng = mulberry32(7);
    for (let trial = 0; trial < 120; trial += 1) {
      const network = randomNetwork(rng, `r${trial}`);
      const result = rebalance(network, CONFIG);
      expect(result.optimisedPeakLoad).toBeLessThanOrEqual(
        result.baselinePeakLoad + 1e-9,
      );
    }
  });
});
