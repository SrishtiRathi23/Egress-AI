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
  baselinePeakDensity: number;
  optimisedPeakDensity: number;
}

/**
 * Re-assign zones to gates to minimise peak holding-area density. The search
 * starts from the nearest-gate baseline and only ever accepts a move that
 * strictly reduces the simulated peak density, so the optimised plan is
 * guaranteed to be at least as safe as the baseline -- never worse.
 */
export function rebalance(network: EgressNetwork, config: SimConfig): RebalanceResult {
  const baseline = nearestGateAssignment(network);
  let current: Assignment = { ...baseline };
  let bestPeak = simulate(network, current, config).peakDensity;
  const baselinePeak = bestPeak;

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
        const peak = simulate(network, candidate, config).peakDensity;
        if (peak < bestPeak - IMPROVEMENT_EPSILON) {
          current = candidate;
          bestPeak = peak;
          improved = true;
        }
      }
    }
  }

  return {
    baseline,
    optimised: current,
    baselinePeakDensity: baselinePeak,
    optimisedPeakDensity: bestPeak,
  };
}
