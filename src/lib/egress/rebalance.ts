import { simulate } from "./simulate";
import type { Assignment, EgressNetwork, SimConfig } from "./types";

// A hill-climb bound: each accepted move strictly lowers peak density, so the
// search always terminates; this cap is a belt-and-suspenders guard.
const MAX_SWEEPS = 64;
const IMPROVEMENT_EPSILON = 1e-9;

/** Assign every zone to its nearest permitted gate (the naive baseline plan). */
export function nearestGateAssignment(network: EgressNetwork): Assignment {
  const assignment: Assignment = {};
  for (const zone of network.zones) {
    const links = network.links.filter((link) => link.zoneId === zone.id);
    const firstLink = links[0];
    if (firstLink === undefined) {
      throw new RangeError(`zone ${zone.id} has no permitted gate links`);
    }
    let nearest = firstLink;
    for (const link of links) {
      if (link.walkMinutes < nearest.walkMinutes) {
        nearest = link;
      }
    }
    assignment[zone.id] = nearest.gateId;
  }
  return assignment;
}

export interface RebalanceResult {
  baseline: Assignment;
  optimised: Assignment;
  /** Uncapped peak load: the objective that is minimised. */
  baselinePeakLoad: number;
  optimisedPeakLoad: number;
  /** Capped display densities for the before/after story. */
  baselinePeakDensity: number;
  optimisedPeakDensity: number;
}

/**
 * Re-assign zones to gates to minimise the peak gate load. The search starts
 * from the nearest-gate baseline and only ever accepts a move that strictly
 * reduces the simulated peak load, so the optimised plan is guaranteed to be at
 * least as safe as the baseline -- never worse. Load (rather than the capped
 * display density) is the objective so the search keeps improving even once
 * gates are saturated.
 */
export function rebalance(network: EgressNetwork, config: SimConfig): RebalanceResult {
  const baseline = nearestGateAssignment(network);
  const baselineResult = simulate(network, baseline, config);

  let current: Assignment = { ...baseline };
  let bestLoad = baselineResult.peakLoad;

  let improved = true;
  let sweeps = 0;
  while (improved && sweeps < MAX_SWEEPS) {
    sweeps += 1;
    improved = false;
    for (const zone of network.zones) {
      const options = network.links.filter((link) => link.zoneId === zone.id);
      for (const option of options) {
        if (option.gateId === current[zone.id]) {
          continue;
        }
        const candidate: Assignment = { ...current, [zone.id]: option.gateId };
        const load = simulate(network, candidate, config).peakLoad;
        if (load < bestLoad - IMPROVEMENT_EPSILON) {
          current = candidate;
          bestLoad = load;
          improved = true;
        }
      }
    }
  }

  const optimisedResult = simulate(network, current, config);
  return {
    baseline,
    optimised: current,
    baselinePeakLoad: baselineResult.peakLoad,
    optimisedPeakLoad: optimisedResult.peakLoad,
    baselinePeakDensity: baselineResult.peakDensity,
    optimisedPeakDensity: optimisedResult.peakDensity,
  };
}
