import type { Assignment, EgressNetwork, SimResult } from "./types";

/** A concrete, plain-language order for a steward to act on. */
export interface StewardOrder {
  zoneId: string;
  zoneName: string;
  fromGateId: string;
  fromGateName: string;
  toGateId: string;
  toGateName: string;
  estimatedClearMinutes: number | null;
  message: string;
}

function gateName(network: EgressNetwork, gateId: string): string {
  const gate = network.gates.find((candidate) => candidate.id === gateId);
  return gate === undefined ? gateId : gate.name;
}

/**
 * Worst backlog-clear time observed for a gate across the forecast, or null if
 * the gate never clears within the horizon (e.g. it is closed). Exported for
 * direct testing of its defensive branches.
 */
export function worstClearMinutes(result: SimResult, gateId: string): number | null {
  let worst = 0;
  for (const step of result.steps) {
    const snapshot = step.gates.find((candidate) => candidate.gateId === gateId);
    if (snapshot === undefined) {
      continue;
    }
    if (snapshot.estimatedClearMinutes === null) {
      return null;
    }
    if (snapshot.estimatedClearMinutes > worst) {
      worst = snapshot.estimatedClearMinutes;
    }
  }
  return worst;
}

/**
 * Turn the difference between the baseline and optimised plans into steward
 * orders -- one per zone that has been re-routed to a different gate.
 */
export function stewardOrders(
  network: EgressNetwork,
  baseline: Assignment,
  optimised: Assignment,
  result: SimResult,
): StewardOrder[] {
  const orders: StewardOrder[] = [];
  for (const zone of network.zones) {
    const fromGateId = baseline[zone.id];
    const toGateId = optimised[zone.id];
    if (fromGateId === undefined || toGateId === undefined) {
      continue;
    }
    if (fromGateId === toGateId) {
      continue;
    }

    const toGateName = gateName(network, toGateId);
    const clear = worstClearMinutes(result, toGateId);
    const clearText =
      clear !== null && clear > 0
        ? `; expected to clear in ~${Math.ceil(clear)} min`
        : "";

    orders.push({
      zoneId: zone.id,
      zoneName: zone.name,
      fromGateId,
      fromGateName: gateName(network, fromGateId),
      toGateId,
      toGateName,
      estimatedClearMinutes: clear,
      message: `Divert ${zone.name} to ${toGateName}${clearText}.`,
    });
  }
  return orders;
}
