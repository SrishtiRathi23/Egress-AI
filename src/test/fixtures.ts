import type { PlanResponse } from "@/lib/plan-types";

/** A representative plan for rendering components under test. */
export function samplePlan(overrides: Partial<PlanResponse> = {}): PlanResponse {
  return {
    networkId: "arlington",
    venueName: "Arlington Stadium",
    venueMeta: { id: "arlington", city: "Arlington, TX", country: "USA", capacity: 80000 },
    event: null,
    eventSource: null,
    baselinePeakDensity: 5.2,
    optimisedPeakDensity: 4.5,
    clearanceMinute: 25,
    totalPeople: 39800,
    orders: [
      {
        zoneId: "z1",
        zoneName: "Lower North 110-118",
        fromGateId: "g-north",
        fromGateName: "North Plaza",
        toGateId: "g-east",
        toGateName: "East Concourse",
        estimatedClearMinutes: 11,
        message: "Divert Lower North 110-118 to East Concourse; expected to clear in ~11 min.",
      },
    ],
    narration: "Arlington Stadium: 1 diversion to hold peak density at 4.5/m².",
    narrationSource: "gemini",
    gates: [
      {
        id: "g-north",
        name: "North Plaza",
        exit: "Plaza",
        lanes: 14,
        closed: false,
        peakDensity: 3.2,
        peakRiskBand: "restricted",
        peakQueue: 4200,
        worstClearMinutes: 9,
      },
      {
        id: "g-south",
        name: "South Gate",
        exit: "Transit",
        lanes: 0,
        closed: true,
        peakDensity: 8,
        peakRiskBand: "critical",
        peakQueue: 16000,
        worstClearMinutes: null,
      },
    ],
    timeline: [
      { minute: 1, peakDensity: 1.2, remaining: 39000 },
      { minute: 10, peakDensity: 4.5, remaining: 22000 },
      { minute: 25, peakDensity: 0, remaining: 0 },
    ],
    closedGateIds: [],
    ...overrides,
  };
}
