import type { EgressNetwork } from "./types";

// ---------------------------------------------------------------------------
// Deterministic incident parser. This is the offline fallback for the Gemini
// natural-language path: it extracts the single primary operational event from
// a steward's message using keyword patterns, so the console keeps working with
// no API key. The Gemini path handles nuance and compound events; this never
// throws and always returns a well-typed event.
// ---------------------------------------------------------------------------

export type EgressEvent =
  | { type: "gate_closed"; gateRef: string }
  | { type: "gate_opened"; gateRef: string }
  | { type: "surge"; gateRef: string }
  | { type: "time_to_whistle"; minutes: number }
  | { type: "unknown"; text: string };

const GATE_CLOSED = /\bgate\s*([a-z0-9]+)\b[^.]*\b(?:clos|shut|block|down|jam|seal)/i;
const GATE_OPENED = /\bgate\s*([a-z0-9]+)\b[^.]*\b(?:open|reopen|freed)/i;
const SURGE_THEN_GATE = /\b(?:surge|crush|crowd|packed|bottleneck|pressure)\b[^.]*\bgate\s*([a-z0-9]+)/i;
const GATE_THEN_SURGE = /\bgate\s*([a-z0-9]+)\b[^.]*\b(?:surge|crush|packed|bottleneck)/i;
const TIME_TO_WHISTLE =
  /(\d+)\s*min(?:ute)?s?\b[^.]*\b(?:whistle|full[\s-]?time|final|kick[\s-]?off)/i;

/** Extract the primary operational event from a free-text incident report. */
export function parseIncident(text: string): EgressEvent {
  const closed = GATE_CLOSED.exec(text);
  if (closed) {
    return { type: "gate_closed", gateRef: closed[1]! };
  }
  const opened = GATE_OPENED.exec(text);
  if (opened) {
    return { type: "gate_opened", gateRef: opened[1]! };
  }
  const surgeThenGate = SURGE_THEN_GATE.exec(text);
  if (surgeThenGate) {
    return { type: "surge", gateRef: surgeThenGate[1]! };
  }
  const gateThenSurge = GATE_THEN_SURGE.exec(text);
  if (gateThenSurge) {
    return { type: "surge", gateRef: gateThenSurge[1]! };
  }
  const whistle = TIME_TO_WHISTLE.exec(text);
  if (whistle) {
    return { type: "time_to_whistle", minutes: Number(whistle[1]) };
  }
  return { type: "unknown", text };
}

function matchesGateRef(gate: { id: string; name: string }, ref: string): boolean {
  const needle = ref.toLowerCase();
  const id = gate.id.toLowerCase();
  return id === needle || id.endsWith(needle) || gate.name.toLowerCase().includes(needle);
}

/**
 * Apply a parsed event to a network, returning a new network. A closed gate has
 * its lanes set to zero so the simulator and re-balancer route around it. Events
 * with no structural effect return the network unchanged.
 */
export function applyEvent(network: EgressNetwork, event: EgressEvent): EgressNetwork {
  if (event.type === "gate_closed") {
    return {
      ...network,
      gates: network.gates.map((gate) =>
        matchesGateRef(gate, event.gateRef) ? { ...gate, lanes: 0 } : gate,
      ),
    };
  }
  return network;
}
