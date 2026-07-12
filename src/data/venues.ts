import type { EgressNetwork, SimConfig } from "@/lib/egress";

// ---------------------------------------------------------------------------
// Illustrative egress models for FIFA World Cup 2026 host venues. Gate widths,
// lane counts and service rates are plausible operational figures, NOT surveyed
// floor data (which lives only in each operator's private systems) -- the app
// labels them as a model in the UI. The venues here are intentionally different
// from any other project's dataset. Numbers are original.
// ---------------------------------------------------------------------------

export interface VenueMeta {
  id: string;
  city: string;
  country: string;
  /** Approximate seated capacity, for display context. */
  capacity: number;
}

export const ARLINGTON: EgressNetwork = {
  id: "arlington",
  name: "Arlington Stadium",
  zones: [
    { id: "z-low-n", name: "Lower North 110-118", occupancy: 8200 },
    { id: "z-low-s", name: "Lower South 130-138", occupancy: 7600 },
    { id: "z-club", name: "Club Level 200s", occupancy: 4200 },
    { id: "z-upp-n", name: "Upper North 320-334", occupancy: 9400 },
    { id: "z-upp-s", name: "Upper South 340-354", occupancy: 8800 },
    { id: "z-suites", name: "Field Suites", occupancy: 1600 },
  ],
  gates: [
    { id: "g-north", name: "North Plaza", lanes: 10, serviceRatePerLane: 50, widthMetres: 12, depthMetres: 8, exit: "Plaza" },
    { id: "g-east", name: "East Concourse", lanes: 8, serviceRatePerLane: 48, widthMetres: 10, depthMetres: 7, exit: "Concourse" },
    { id: "g-south", name: "South Gate", lanes: 12, serviceRatePerLane: 50, widthMetres: 14, depthMetres: 9, exit: "Transit" },
    { id: "g-west", name: "West Ramp", lanes: 6, serviceRatePerLane: 45, widthMetres: 8, depthMetres: 6, exit: "Parking" },
  ],
  links: [
    { zoneId: "z-low-n", gateId: "g-north", walkMinutes: 2 },
    { zoneId: "z-low-n", gateId: "g-east", walkMinutes: 4 },
    { zoneId: "z-low-n", gateId: "g-west", walkMinutes: 5 },
    { zoneId: "z-low-s", gateId: "g-south", walkMinutes: 2 },
    { zoneId: "z-low-s", gateId: "g-east", walkMinutes: 4 },
    { zoneId: "z-low-s", gateId: "g-west", walkMinutes: 5 },
    { zoneId: "z-club", gateId: "g-east", walkMinutes: 3 },
    { zoneId: "z-club", gateId: "g-north", walkMinutes: 4 },
    { zoneId: "z-club", gateId: "g-south", walkMinutes: 4 },
    { zoneId: "z-upp-n", gateId: "g-north", walkMinutes: 5 },
    { zoneId: "z-upp-n", gateId: "g-west", walkMinutes: 6 },
    { zoneId: "z-upp-n", gateId: "g-east", walkMinutes: 7 },
    { zoneId: "z-upp-s", gateId: "g-south", walkMinutes: 5 },
    { zoneId: "z-upp-s", gateId: "g-west", walkMinutes: 6 },
    { zoneId: "z-upp-s", gateId: "g-east", walkMinutes: 7 },
    { zoneId: "z-suites", gateId: "g-north", walkMinutes: 3 },
    { zoneId: "z-suites", gateId: "g-south", walkMinutes: 3 },
  ],
};

export const ATLANTA: EgressNetwork = {
  id: "atlanta",
  name: "Peachtree Dome",
  zones: [
    { id: "z-field-n", name: "Field North 101-109", occupancy: 6800 },
    { id: "z-field-s", name: "Field South 121-129", occupancy: 6400 },
    { id: "z-mezz", name: "Mezzanine 200s", occupancy: 5200 },
    { id: "z-upper-e", name: "Upper East 315-327", occupancy: 8600 },
    { id: "z-upper-w", name: "Upper West 335-347", occupancy: 8100 },
  ],
  gates: [
    { id: "g-a", name: "Gate A Marietta", lanes: 9, serviceRatePerLane: 50, widthMetres: 11, depthMetres: 8, exit: "Rail" },
    { id: "g-b", name: "Gate B Northside", lanes: 7, serviceRatePerLane: 48, widthMetres: 9, depthMetres: 7, exit: "Street" },
    { id: "g-c", name: "Gate C Mangum", lanes: 11, serviceRatePerLane: 50, widthMetres: 13, depthMetres: 9, exit: "Plaza" },
  ],
  links: [
    { zoneId: "z-field-n", gateId: "g-a", walkMinutes: 2 },
    { zoneId: "z-field-n", gateId: "g-b", walkMinutes: 4 },
    { zoneId: "z-field-s", gateId: "g-c", walkMinutes: 2 },
    { zoneId: "z-field-s", gateId: "g-b", walkMinutes: 4 },
    { zoneId: "z-mezz", gateId: "g-b", walkMinutes: 3 },
    { zoneId: "z-mezz", gateId: "g-a", walkMinutes: 4 },
    { zoneId: "z-mezz", gateId: "g-c", walkMinutes: 4 },
    { zoneId: "z-upper-e", gateId: "g-a", walkMinutes: 5 },
    { zoneId: "z-upper-e", gateId: "g-c", walkMinutes: 6 },
    { zoneId: "z-upper-w", gateId: "g-c", walkMinutes: 5 },
    { zoneId: "z-upper-w", gateId: "g-a", walkMinutes: 6 },
  ],
};

export const SAMPLE_NETWORKS: readonly EgressNetwork[] = [ARLINGTON, ATLANTA];

export const VENUE_META: Record<string, VenueMeta> = {
  arlington: { id: "arlington", city: "Arlington, TX", country: "USA", capacity: 80000 },
  atlanta: { id: "atlanta", city: "Atlanta, GA", country: "USA", capacity: 71000 },
};

/** Default 30-minute forecast at 1-minute resolution. */
export const DEFAULT_SIM_CONFIG: SimConfig = {
  horizonMinutes: 30,
  stepMinutes: 1,
};

export function getNetwork(id: string): EgressNetwork | undefined {
  return SAMPLE_NETWORKS.find((network) => network.id === id);
}
