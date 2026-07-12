import { ensureFiniteNonNegative, ensurePositive } from "./validate";

// ---------------------------------------------------------------------------
// Crowd-density model, grounded in J.J. Fruin's "Pedestrian Planning and Design"
// (1971) Level-of-Service framework for queuing / waiting areas. Densities are
// expressed in persons per square metre (the original tables are in ft^2/person;
// the boundaries below are the standard SI conversions). A density at or above
// CRUSH_DENSITY is where progressive crowd collapse and compressive asphyxia
// become a genuine risk -- the figure repeatedly cited in post-incident analyses
// (Hillsborough, Love Parade, Itaewon).
// ---------------------------------------------------------------------------

export type LevelOfService = "A" | "B" | "C" | "D" | "E" | "F";

export type RiskBand =
  | "safe"
  | "comfortable"
  | "moderate"
  | "restricted"
  | "dangerous"
  | "critical";

/** Persons/m^2 at or above which crush injury becomes a real risk (Fruin LoS F). */
export const CRUSH_DENSITY = 4;

/** Crowd density (persons/m^2) for a given headcount over a floor area. */
export function areaDensity(people: number, areaSquareMetres: number): number {
  ensureFiniteNonNegative(people, "people");
  ensurePositive(areaSquareMetres, "areaSquareMetres");
  return people / areaSquareMetres;
}

/** Fruin queuing-area Level of Service for a crowd density in persons/m^2. */
export function levelOfService(density: number): LevelOfService {
  ensureFiniteNonNegative(density, "density");
  if (density <= 0.83) return "A";
  if (density <= 1.11) return "B";
  if (density <= 1.66) return "C";
  if (density <= 3.33) return "D";
  if (density <= 5.0) return "E";
  return "F";
}

/**
 * Product-facing risk band for a crowd density in persons/m^2. Distinct from the
 * academic Fruin scale: these are the six operational bands the console colours,
 * with the "dangerous" boundary pinned to CRUSH_DENSITY.
 */
export function riskBand(density: number): RiskBand {
  ensureFiniteNonNegative(density, "density");
  if (density < 1) return "safe";
  if (density < 2) return "comfortable";
  if (density < 3) return "moderate";
  if (density < CRUSH_DENSITY) return "restricted";
  if (density < 5) return "dangerous";
  return "critical";
}

/** True when a density is at or beyond the crush-risk threshold. */
export function isCrushRisk(density: number): boolean {
  ensureFiniteNonNegative(density, "density");
  return density >= CRUSH_DENSITY;
}
