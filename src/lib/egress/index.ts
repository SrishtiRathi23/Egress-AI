// Public surface of the deterministic egress engine.
export type {
  Zone,
  Gate,
  ZoneGateLink,
  EgressNetwork,
  Assignment,
  SimConfig,
  GateSnapshot,
  SimStep,
  SimResult,
} from "./types";
export type { LevelOfService, RiskBand } from "./density";
export {
  CRUSH_DENSITY,
  MAX_DISPLAY_DENSITY,
  areaDensity,
  levelOfService,
  riskBand,
  isCrushRisk,
} from "./density";
export {
  stepQueue,
  gateCapacityPerStep,
  gateArea,
  estimateClearMinutes,
  simulate,
} from "./simulate";
export {
  nearestGateAssignment,
  rebalance,
  type RebalanceResult,
} from "./rebalance";
export { stewardOrders, worstClearMinutes, type StewardOrder } from "./instructions";
export {
  parseIncident,
  applyEvent,
  type EgressEvent,
} from "./parse-event";
