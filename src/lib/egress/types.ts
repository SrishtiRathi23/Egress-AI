import type { LevelOfService, RiskBand } from "./density";

// ---------------------------------------------------------------------------
// Domain model: an egress NETWORK is a directed flow of people from seating
// zones, through gates (the physical bottleneck), to the outside. This is a
// queue / flow-conservation model -- deliberately NOT a shortest-path routing
// graph -- so the state that matters is "how many people are where" over time.
// ---------------------------------------------------------------------------

/** A seating section that holds people waiting to egress. */
export interface Zone {
  id: string;
  name: string;
  /** People currently in this zone awaiting egress at the whistle (t = 0). */
  occupancy: number;
}

/** A gate: the egress bottleneck. Throughput is lanes x service-rate. */
export interface Gate {
  id: string;
  name: string;
  /** Parallel egress lanes (turnstiles / open leaves). Zero means closed. */
  lanes: number;
  /**
   * Sustainable pedestrian throughput per lane, persons/lane/minute. Derived
   * from the Green Guide safe egress rate (~82 persons/metre-width/minute) for a
   * typical lane width; a single turnstile lane clears roughly 45-55/min.
   */
  serviceRatePerLane: number;
  /** Width of the gate holding area, metres (for the density calculation). */
  widthMetres: number;
  /** Depth of the gate holding area, metres (for the density calculation). */
  depthMetres: number;
  /** Optional concourse / exit grouping label for display. */
  exit?: string;
}

/** A permitted zone -> gate route with its walking time. */
export interface ZoneGateLink {
  zoneId: string;
  gateId: string;
  /** Walking time from the zone to this gate, minutes. */
  walkMinutes: number;
}

/** A complete egress network for one venue. */
export interface EgressNetwork {
  id: string;
  name: string;
  zones: Zone[];
  gates: Gate[];
  links: ZoneGateLink[];
}

/** Which gate each zone is routed to: zoneId -> gateId. */
export type Assignment = Record<string, string>;

/** Discrete-time simulation configuration. */
export interface SimConfig {
  /** How far ahead to forecast, minutes. */
  horizonMinutes: number;
  /** Length of each simulation step, minutes. */
  stepMinutes: number;
}

/** State of a single gate at one simulation step. */
export interface GateSnapshot {
  gateId: string;
  /** People waiting in the gate holding area. */
  queue: number;
  /** Crowd density in the holding area, persons/m^2. */
  density: number;
  levelOfService: LevelOfService;
  riskBand: RiskBand;
  /** People passed through the gate during this step. */
  served: number;
  /** Cumulative people cleared through this gate so far. */
  cleared: number;
  /** Minutes for the current backlog to clear, or null if it never will. */
  estimatedClearMinutes: number | null;
}

/** A single discrete step of the forecast. */
export interface SimStep {
  /** Elapsed minutes since the whistle. */
  minute: number;
  gates: GateSnapshot[];
  /** People still inside the network (in transit or queued). */
  totalRemaining: number;
}

/** The full forecast produced by the simulator. */
export interface SimResult {
  networkId: string;
  assignment: Assignment;
  steps: SimStep[];
  totalPeople: number;
  /** Highest DISPLAY density (capped at MAX_DISPLAY_DENSITY) at any gate/step. */
  peakDensity: number;
  peakDensityGateId: string | null;
  /**
   * Highest UNCAPPED load (backlog / holding area) at any gate/step. This is the
   * continuous congestion signal the re-balancer minimises -- unlike the capped
   * display density, it keeps discriminating once gates saturate.
   */
  peakLoad: number;
  peakLoadGateId: string | null;
  /** Minute at which everyone has cleared, or null if not within the horizon. */
  clearanceMinute: number | null;
}
