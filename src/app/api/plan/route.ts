import { NextResponse } from "next/server";
import { buildPlan } from "@/lib/plan-service";
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

  const plan = await buildPlan(parsed.data.networkId, {
    incidentText: parsed.data.incidentText,
    closedGateIds: parsed.data.closedGateIds,
  });
  if (plan === null) {
    return NextResponse.json({ error: "unknown_network" }, { status: 404 });
  }

  return NextResponse.json(plan);
}
