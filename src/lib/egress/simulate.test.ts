import { describe, expect, it } from "vitest";
import { mulberry32, randomNetwork } from "@/test/network-factory";
import { MAX_DISPLAY_DENSITY } from "./density";
import { nearestGateAssignment } from "./rebalance";
import {
  estimateClearMinutes,
  gateArea,
  gateCapacityPerStep,
  simulate,
  stepQueue,
} from "./simulate";
import type { Assignment, EgressNetwork, Gate, SimConfig } from "./types";

const CONFIG: SimConfig = { horizonMinutes: 40, stepMinutes: 1 };

function gate(overrides: Partial<Gate> = {}): Gate {
  return {
    id: "g",
    name: "Gate",
    lanes: 10,
    serviceRatePerLane: 50,
    widthMetres: 10,
    depthMetres: 8,
    ...overrides,
  };
}

describe("stepQueue", () => {
  it("serves everyone when capacity is sufficient", () => {
    expect(stepQueue(0, 80, 100)).toEqual({ served: 80, queue: 0 });
  });

  it("carries the overflow when capacity is exceeded", () => {
    expect(stepQueue(50, 100, 120)).toEqual({ served: 120, queue: 30 });
  });

  it("never produces a negative queue", () => {
    expect(stepQueue(0, 0, 100).queue).toBe(0);
  });

  it("rejects invalid inputs", () => {
    expect(() => stepQueue(-1, 0, 10)).toThrow(RangeError);
    expect(() => stepQueue(0, Number.NaN, 10)).toThrow(RangeError);
    expect(() => stepQueue(0, 0, -10)).toThrow(RangeError);
  });
});

describe("gateCapacityPerStep", () => {
  it("multiplies lanes, service rate and step length", () => {
    expect(gateCapacityPerStep(gate({ lanes: 10, serviceRatePerLane: 50 }), 1)).toBe(500);
  });

  it("is zero for a closed gate", () => {
    expect(gateCapacityPerStep(gate({ lanes: 0 }), 2)).toBe(0);
  });

  it("rejects a non-positive step length", () => {
    expect(() => gateCapacityPerStep(gate(), 0)).toThrow(RangeError);
  });

  it("rejects negative lane or rate figures", () => {
    expect(() => gateCapacityPerStep(gate({ lanes: -1 }), 1)).toThrow(RangeError);
    expect(() => gateCapacityPerStep(gate({ serviceRatePerLane: -1 }), 1)).toThrow(RangeError);
  });
});

describe("gateArea", () => {
  it("multiplies width by depth", () => {
    expect(gateArea(gate({ widthMetres: 10, depthMetres: 8 }))).toBe(80);
  });

  it("rejects non-positive dimensions", () => {
    expect(() => gateArea(gate({ widthMetres: 0 }))).toThrow(RangeError);
    expect(() => gateArea(gate({ depthMetres: -1 }))).toThrow(RangeError);
  });
});

describe("estimateClearMinutes", () => {
  it("is zero for an empty queue", () => {
    expect(estimateClearMinutes(0, 100)).toBe(0);
  });

  it("is null for a backlog behind a closed gate", () => {
    expect(estimateClearMinutes(500, 0)).toBeNull();
  });

  it("divides backlog by throughput otherwise", () => {
    expect(estimateClearMinutes(500, 100)).toBe(5);
  });

  it("rejects invalid inputs", () => {
    expect(() => estimateClearMinutes(-1, 100)).toThrow(RangeError);
    expect(() => estimateClearMinutes(100, -1)).toThrow(RangeError);
  });
});

function singleGateNetwork(occupancy: number, gateOverrides: Partial<Gate> = {}): {
  network: EgressNetwork;
  assignment: Assignment;
} {
  const network: EgressNetwork = {
    id: "n",
    name: "n",
    zones: [{ id: "z", name: "Z", occupancy }],
    gates: [gate(gateOverrides)],
    links: [{ zoneId: "z", gateId: "g", walkMinutes: 0 }],
  };
  return { network, assignment: { z: "g" } };
}

describe("simulate", () => {
  it("clears a solvable crowd and reports the clearance minute", () => {
    const { network, assignment } = singleGateNetwork(1500, {
      lanes: 10,
      serviceRatePerLane: 50,
    });
    const result = simulate(network, assignment, CONFIG);
    expect(result.totalPeople).toBe(1500);
    // Streamed over the 10-minute release window at 150/min, well under the
    // 500/min gate capacity, so it clears as it arrives -- at minute 10.
    expect(result.clearanceMinute).toBe(10);
    expect(result.steps.at(-1)?.totalRemaining).toBeCloseTo(0, 6);
  });

  it("conserves people at every step (cleared + remaining = total)", () => {
    const { network, assignment } = singleGateNetwork(1234);
    const result = simulate(network, assignment, CONFIG);
    for (const step of result.steps) {
      const cleared = step.gates.reduce((sum, g) => sum + g.cleared, 0);
      expect(cleared + step.totalRemaining).toBeCloseTo(result.totalPeople, 6);
    }
  });

  it("never clears a backlog behind a closed gate", () => {
    const { network, assignment } = singleGateNetwork(2000, { lanes: 0 });
    const result = simulate(network, assignment, CONFIG);
    expect(result.clearanceMinute).toBeNull();
    expect(result.peakDensityGateId).toBe("g");
    expect(result.steps.at(-1)?.gates[0]?.estimatedClearMinutes).toBeNull();
  });

  it("leaves people in transit when their walk exceeds the horizon", () => {
    const network: EgressNetwork = {
      id: "n",
      name: "n",
      zones: [{ id: "z", name: "Z", occupancy: 100 }],
      gates: [gate()],
      links: [{ zoneId: "z", gateId: "g", walkMinutes: 999 }],
    };
    const result = simulate(network, { z: "g" }, { horizonMinutes: 5, stepMinutes: 1 });
    expect(result.clearanceMinute).toBeNull();
    expect(result.steps.at(-1)?.totalRemaining).toBe(100);
  });

  it("throws when a zone has no assignment", () => {
    const { network } = singleGateNetwork(100);
    expect(() => simulate(network, {}, CONFIG)).toThrow(RangeError);
  });

  it("throws when the assignment references an unknown gate", () => {
    const { network } = singleGateNetwork(100);
    expect(() => simulate(network, { z: "ghost" }, CONFIG)).toThrow(RangeError);
  });

  it("throws when the assigned gate has no link from the zone", () => {
    const network: EgressNetwork = {
      id: "n",
      name: "n",
      zones: [{ id: "z", name: "Z", occupancy: 100 }],
      gates: [gate({ id: "g" }), gate({ id: "g2" })],
      links: [{ zoneId: "z", gateId: "g", walkMinutes: 1 }],
    };
    expect(() => simulate(network, { z: "g2" }, CONFIG)).toThrow(RangeError);
  });

  it("rejects a non-positive horizon or step", () => {
    const { network, assignment } = singleGateNetwork(100);
    expect(() => simulate(network, assignment, { horizonMinutes: 0, stepMinutes: 1 })).toThrow();
    expect(() => simulate(network, assignment, { horizonMinutes: 10, stepMinutes: 0 })).toThrow();
  });

  it("holds core invariants across many random scenarios", () => {
    const rng = mulberry32(20260712);
    for (let trial = 0; trial < 400; trial += 1) {
      const network = randomNetwork(rng, `n${trial}`);
      const assignment = nearestGateAssignment(network);
      const result = simulate(network, assignment, CONFIG);
      const total = network.zones.reduce((s, z) => s + z.occupancy, 0);
      expect(result.totalPeople).toBeCloseTo(total, 6);

      for (const step of result.steps) {
        expect(Number.isFinite(step.totalRemaining)).toBe(true);
        expect(step.totalRemaining).toBeGreaterThanOrEqual(-1e-6);
        for (const snap of step.gates) {
          expect(snap.queue).toBeGreaterThanOrEqual(-1e-9);
          expect(Number.isFinite(snap.queue)).toBe(true);
          expect(Number.isFinite(snap.density)).toBe(true);
          expect(snap.density).toBeGreaterThanOrEqual(0);
          expect(snap.density).toBeLessThanOrEqual(MAX_DISPLAY_DENSITY + 1e-9);
          expect(snap.cleared).toBeLessThanOrEqual(total + 1e-6);
          const capacity = gateCapacityPerStep(
            network.gates.find((g) => g.id === snap.gateId)!,
            CONFIG.stepMinutes,
          );
          expect(snap.served).toBeLessThanOrEqual(capacity + 1e-6);
        }
      }
    }
  });

  it("reproduces Little's Law person-minutes in a pure drain (L = lambda W)", () => {
    // Drain 1000 people at 100/min; the FIFO wait sum must equal the queue
    // integral the simulator's primitive accumulates.
    const capacity = 100;
    const population = 1000;
    let queue = population;
    let personMinutes = 0;
    let minute = 0;
    while (queue > 1e-9 && minute < 100) {
      minute += 1;
      personMinutes += queue; // people waiting through this minute
      queue = stepQueue(queue, 0, capacity).queue;
    }
    let expectedWaitSum = 0;
    for (let person = 1; person <= population; person += 1) {
      expectedWaitSum += Math.ceil(person / capacity);
    }
    expect(personMinutes).toBeCloseTo(expectedWaitSum, 6);
  });
});
