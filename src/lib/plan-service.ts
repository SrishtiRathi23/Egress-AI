import "server-only";
import {
  applyEvent,
  rebalance,
  riskBand,
  simulate,
  stewardOrders,
  worstClearMinutes,
  type EgressEvent,
  type EgressNetwork,
} from "@/lib/egress";
import type { AiSource } from "@/lib/ai/config";
import { narrateOrdersAI, parseIncidentAI } from "@/lib/ai/gemini";
import { DEFAULT_SIM_CONFIG, getNetwork, VENUE_META } from "@/data/venues";
import type { GateView, PlanOptions, PlanResponse, TimelinePoint } from "@/lib/plan-types";

/** Close a set of gates by zeroing their lanes; returns a new network. */
function closeGates(network: EgressNetwork, closed: Set<string>): EgressNetwork {
  if (closed.size === 0) {
    return network;
  }
  return {
    ...network,
    gates: network.gates.map((gate) =>
      closed.has(gate.id) ? { ...gate, lanes: 0 } : gate,
    ),
  };
}

/**
 * The single source of truth for a forecast: applies any incident, closes any
 * gates, runs the deterministic re-balancer and simulator, and shapes the result
 * for the UI. Shared by the /api/plan route and the server-rendered first paint.
 */
export async function buildPlan(
  networkId: string,
  options: PlanOptions = {},
): Promise<PlanResponse | null> {
  const base = getNetwork(networkId);
  if (base === undefined) {
    return null;
  }

  let network = base;
  let event: EgressEvent | null = null;
  let eventSource: AiSource | null = null;

  if (options.incidentText) {
    const parsed = await parseIncidentAI(options.incidentText);
    event = parsed.event;
    eventSource = parsed.source;
    network = applyEvent(network, parsed.event);
  }

  network = closeGates(network, new Set(options.closedGateIds ?? []));

  const plan = rebalance(network, DEFAULT_SIM_CONFIG);
  const result = simulate(network, plan.optimised, DEFAULT_SIM_CONFIG);
  const orders = stewardOrders(network, plan.baseline, plan.optimised, result);
  const narration = await narrateOrdersAI(orders, {
    venueName: network.name,
    peakDensity: plan.optimisedPeakDensity,
    clearanceMinute: result.clearanceMinute,
  });

  const gates: GateView[] = network.gates.map((gate) => {
    let peakDensity = 0;
    let peakQueue = 0;
    for (const step of result.steps) {
      const snapshot = step.gates.find((candidate) => candidate.gateId === gate.id);
      if (snapshot === undefined) {
        continue;
      }
      if (snapshot.density > peakDensity) {
        peakDensity = snapshot.density;
      }
      if (snapshot.queue > peakQueue) {
        peakQueue = snapshot.queue;
      }
    }
    return {
      id: gate.id,
      name: gate.name,
      exit: gate.exit,
      lanes: gate.lanes,
      closed: gate.lanes === 0,
      peakDensity,
      peakRiskBand: riskBand(peakDensity),
      peakQueue,
      worstClearMinutes: worstClearMinutes(result, gate.id),
    };
  });

  const timeline: TimelinePoint[] = result.steps.map((step) => {
    let peak = 0;
    for (const snapshot of step.gates) {
      if (snapshot.density > peak) {
        peak = snapshot.density;
      }
    }
    return { minute: step.minute, peakDensity: peak, remaining: step.totalRemaining };
  });

  return {
    networkId: network.id,
    venueName: network.name,
    venueMeta: VENUE_META[network.id] ?? null,
    event,
    eventSource,
    baselinePeakDensity: plan.baselinePeakDensity,
    optimisedPeakDensity: plan.optimisedPeakDensity,
    clearanceMinute: result.clearanceMinute,
    totalPeople: result.totalPeople,
    orders,
    narration: narration.text,
    narrationSource: narration.source,
    gates,
    timeline,
    closedGateIds: network.gates.reduce<string[]>((ids, gate) => {
      if (gate.lanes === 0) {
        ids.push(gate.id);
      }
      return ids;
    }, []),
  };
}
