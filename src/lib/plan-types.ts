import type { EgressEvent, RiskBand, StewardOrder } from "@/lib/egress";
import type { AiSource } from "@/lib/ai/config";
import type { VenueMeta } from "@/data/venues";

// Shared view model returned by the plan service. Kept free of any server-only
// import so client components can import these types directly.

export interface GateView {
  id: string;
  name: string;
  exit?: string;
  lanes: number;
  closed: boolean;
  /** Peak DISPLAY density at this gate over the forecast, persons/m^2. */
  peakDensity: number;
  peakRiskBand: RiskBand;
  /** Peak backlog at this gate over the forecast, people. */
  peakQueue: number;
  /** Worst backlog-clear time, or null if the gate never clears. */
  worstClearMinutes: number | null;
}

export interface TimelinePoint {
  minute: number;
  peakDensity: number;
  remaining: number;
}

export interface PlanResponse {
  networkId: string;
  venueName: string;
  venueMeta: VenueMeta | null;
  event: EgressEvent | null;
  eventSource: AiSource | null;
  baselinePeakDensity: number;
  optimisedPeakDensity: number;
  clearanceMinute: number | null;
  totalPeople: number;
  orders: StewardOrder[];
  narration: string;
  narrationSource: AiSource;
  gates: GateView[];
  timeline: TimelinePoint[];
  closedGateIds: string[];
}

export interface PlanOptions {
  incidentText?: string;
  closedGateIds?: string[];
}
