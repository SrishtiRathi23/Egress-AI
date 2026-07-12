import { NextResponse } from "next/server";
import { buildPlan } from "@/lib/plan-service";
import { PlanRequestSchema } from "@/lib/ai/schemas";
import { readJsonBody } from "@/lib/http";
import { clientKey, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(request: Request): Promise<Response> {
  if (!rateLimit(clientKey(request), 20).ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const body = await readJsonBody(request);
  if (!body.ok) {
    return NextResponse.json({ error: body.error }, { status: body.status });
  }

  const parsed = PlanRequestSchema.safeParse(body.data);
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
