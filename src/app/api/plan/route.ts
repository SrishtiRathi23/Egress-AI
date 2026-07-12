import { NextResponse } from "next/server";
import { DEFAULT_SIM_CONFIG, getNetwork, VENUE_META } from "@/data/venues";
import { applyEvent, rebalance, simulate, stewardOrders } from "@/lib/egress";
import type { EgressEvent } from "@/lib/egress";
import { narrateOrdersAI, parseIncidentAI } from "@/lib/ai/gemini";
import type { AiSource } from "@/lib/ai/config";
import { PlanRequestSchema } from "@/lib/ai/schemas";
import { clientKey, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(request: Request): Promise<Response> {
  if (!rateLimit(clientKey(request), 20).ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = PlanRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_request", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const baseNetwork = getNetwork(parsed.data.networkId);
  if (baseNetwork === undefined) {
    return NextResponse.json({ error: "unknown_network" }, { status: 404 });
  }

  const config = {
    horizonMinutes: parsed.data.horizonMinutes ?? DEFAULT_SIM_CONFIG.horizonMinutes,
    stepMinutes: parsed.data.stepMinutes ?? DEFAULT_SIM_CONFIG.stepMinutes,
  };

  let network = baseNetwork;
  let event: EgressEvent | null = null;
  let eventSource: AiSource | null = null;
  if (parsed.data.incidentText) {
    const parsedIncident = await parseIncidentAI(parsed.data.incidentText);
    event = parsedIncident.event;
    eventSource = parsedIncident.source;
    network = applyEvent(network, parsedIncident.event);
  }

  const plan = rebalance(network, config);
  const result = simulate(network, plan.optimised, config);
  const orders = stewardOrders(network, plan.baseline, plan.optimised, result);
  const narration = await narrateOrdersAI(orders, {
    venueName: network.name,
    peakDensity: plan.optimisedPeakDensity,
    clearanceMinute: result.clearanceMinute,
  });

  return NextResponse.json({
    networkId: network.id,
    venue: { name: network.name, meta: VENUE_META[network.id] ?? null },
    event,
    eventSource,
    baselinePeakDensity: plan.baselinePeakDensity,
    optimisedPeakDensity: plan.optimisedPeakDensity,
    clearanceMinute: result.clearanceMinute,
    orders,
    narration: narration.text,
    narrationSource: narration.source,
    gates: network.gates,
    steps: result.steps,
  });
}
