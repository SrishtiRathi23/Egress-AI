import { areaDensity, levelOfService, MAX_DISPLAY_DENSITY, riskBand } from "./density";
import type {
  Assignment,
  EgressNetwork,
  Gate,
  GateSnapshot,
  SimConfig,
  SimResult,
  SimStep,
} from "./types";
import { ensureFiniteNonNegative, ensurePositive } from "./validate";

const EPSILON = 1e-9;

// A seating zone does not empty instantly at the whistle: people rise, file down
// the vomitories and reach the concourse over roughly ten minutes. Spreading each
// zone's release across this window is what makes queue build-up -- and hence
// density and clear-time -- physically realistic rather than a single impossible
// lump landing at one gate.
const RELEASE_WINDOW_MINUTES = 10;

/**
 * One discrete step of a single queue. New arrivals join the existing queue, the
 * gate serves as many as its capacity allows, and the remainder carries over.
 *
 *   throughput = min(queue + arrivals, capacity)
 *   next queue = max(0, queue + arrivals - throughput)
 *
 * Because throughput can never exceed what is waiting, the next queue is always
 * non-negative -- this is the invariant the whole simulation rests on.
 */
export function stepQueue(
  queue: number,
  arrivals: number,
  capacity: number,
): { served: number; queue: number } {
  ensureFiniteNonNegative(queue, "queue");
  ensureFiniteNonNegative(arrivals, "arrivals");
  ensureFiniteNonNegative(capacity, "capacity");
  const waiting = queue + arrivals;
  const served = Math.min(waiting, capacity);
  return { served, queue: waiting - served };
}

/** People a gate can pass in one step: lanes x service-rate x step length. */
export function gateCapacityPerStep(gate: Gate, stepMinutes: number): number {
  ensureFiniteNonNegative(gate.lanes, `gate ${gate.id} lanes`);
  ensureFiniteNonNegative(gate.serviceRatePerLane, `gate ${gate.id} serviceRatePerLane`);
  ensurePositive(stepMinutes, "stepMinutes");
  return gate.lanes * gate.serviceRatePerLane * stepMinutes;
}

/** Floor area of a gate's holding zone, m^2. */
export function gateArea(gate: Gate): number {
  const width = ensurePositive(gate.widthMetres, `gate ${gate.id} widthMetres`);
  const depth = ensurePositive(gate.depthMetres, `gate ${gate.id} depthMetres`);
  return width * depth;
}

/** Minutes for a backlog to clear at a steady rate; null if it never can. */
export function estimateClearMinutes(
  queue: number,
  capacityPerMinute: number,
): number | null {
  ensureFiniteNonNegative(queue, "queue");
  ensureFiniteNonNegative(capacityPerMinute, "capacityPerMinute");
  if (queue <= EPSILON) return 0;
  if (capacityPerMinute <= 0) return null;
  return queue / capacityPerMinute;
}

/** Simulation step at which a walking crowd first reaches its gate (1-indexed). */
function arrivalStep(walkMinutes: number, stepMinutes: number): number {
  return Math.max(1, Math.ceil(walkMinutes / stepMinutes));
}

interface GateState {
  gate: Gate;
  queue: number;
  cleared: number;
  arrivals: number[];
  capacityPerStep: number;
  capacityPerMinute: number;
  area: number;
}

/**
 * Forecast an egress network under a given zone->gate assignment. Returns a
 * per-step timeline of queue length, density, Level of Service and wait for
 * every gate, plus network-level peak density and clearance time.
 */
export function simulate(
  network: EgressNetwork,
  assignment: Assignment,
  config: SimConfig,
): SimResult {
  const stepMinutes = ensurePositive(config.stepMinutes, "stepMinutes");
  const horizonMinutes = ensurePositive(config.horizonMinutes, "horizonMinutes");
  const stepCount = Math.ceil(horizonMinutes / stepMinutes);

  const stateById = new Map<string, GateState>();
  for (const gate of network.gates) {
    stateById.set(gate.id, {
      gate,
      queue: 0,
      cleared: 0,
      arrivals: new Array<number>(stepCount + 1).fill(0),
      capacityPerStep: gateCapacityPerStep(gate, stepMinutes),
      capacityPerMinute: gate.lanes * gate.serviceRatePerLane,
      area: gateArea(gate),
    });
  }

  let totalPeople = 0;
  for (const zone of network.zones) {
    ensureFiniteNonNegative(zone.occupancy, `zone ${zone.id} occupancy`);
    totalPeople += zone.occupancy;

    const gateId = assignment[zone.id];
    if (gateId === undefined) {
      throw new RangeError(`zone ${zone.id} has no gate assignment`);
    }
    const state = stateById.get(gateId);
    if (state === undefined) {
      throw new RangeError(
        `assignment for zone ${zone.id} references unknown gate ${gateId}`,
      );
    }
    const link = network.links.find(
      (candidate) => candidate.zoneId === zone.id && candidate.gateId === gateId,
    );
    if (link === undefined) {
      throw new RangeError(`no link from zone ${zone.id} to assigned gate ${gateId}`);
    }
    ensureFiniteNonNegative(link.walkMinutes, `walkMinutes for ${zone.id}->${gateId}`);

    // Stream the zone's occupancy across the release window, starting when the
    // first walkers reach the gate. Anyone whose slice lands beyond the horizon
    // simply has not arrived yet within the forecast.
    const firstStep = arrivalStep(link.walkMinutes, stepMinutes);
    const releaseSteps = Math.max(1, Math.ceil(RELEASE_WINDOW_MINUTES / stepMinutes));
    const perStep = zone.occupancy / releaseSteps;
    for (let offset = 0; offset < releaseSteps; offset += 1) {
      const step = firstStep + offset;
      if (step <= stepCount) {
        state.arrivals[step] = state.arrivals[step]! + perStep;
      }
    }
  }

  const steps: SimStep[] = [];
  let peakDensity = 0;
  let peakDensityGateId: string | null = null;
  let peakLoad = 0;
  let peakLoadGateId: string | null = null;
  let clearanceMinute: number | null = null;
  let totalCleared = 0;

  for (let k = 1; k <= stepCount; k += 1) {
    const minute = k * stepMinutes;
    const gateSnapshots: GateSnapshot[] = [];

    for (const state of stateById.values()) {
      const { gate } = state;
      // `k` is in [1, stepCount], always a valid index into `arrivals`.
      const inbound = state.arrivals[k]!;
      const { served, queue } = stepQueue(state.queue, inbound, state.capacityPerStep);

      state.queue = queue;
      state.cleared += served;
      totalCleared += served;

      // Uncapped load is the true congestion signal; display density is capped at
      // the physical packing ceiling so the figure shown to operators is real.
      const load = areaDensity(queue, state.area);
      const density = Math.min(load, MAX_DISPLAY_DENSITY);

      gateSnapshots.push({
        gateId: gate.id,
        queue,
        density,
        levelOfService: levelOfService(density),
        riskBand: riskBand(density),
        served,
        cleared: state.cleared,
        estimatedClearMinutes: estimateClearMinutes(queue, state.capacityPerMinute),
      });

      if (density > peakDensity) {
        peakDensity = density;
        peakDensityGateId = gate.id;
      }
      if (load > peakLoad) {
        peakLoad = load;
        peakLoadGateId = gate.id;
      }
    }

    const totalRemaining = totalPeople - totalCleared;
    steps.push({ minute, gates: gateSnapshots, totalRemaining });

    if (clearanceMinute === null && totalRemaining <= EPSILON) {
      clearanceMinute = minute;
    }
  }

  return {
    networkId: network.id,
    assignment,
    steps,
    totalPeople,
    peakDensity,
    peakDensityGateId,
    peakLoad,
    peakLoadGateId,
    clearanceMinute,
  };
}
