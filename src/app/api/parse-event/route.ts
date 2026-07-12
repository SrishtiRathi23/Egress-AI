import { NextResponse } from "next/server";
import { parseIncidentAI } from "@/lib/ai/gemini";
import { ParseEventRequestSchema } from "@/lib/ai/schemas";
import { readJsonBody } from "@/lib/http";
import { clientKey, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(request: Request): Promise<Response> {
  if (!rateLimit(clientKey(request), 30).ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const body = await readJsonBody(request);
  if (!body.ok) {
    return NextResponse.json({ error: body.error }, { status: body.status });
  }

  const parsed = ParseEventRequestSchema.safeParse(body.data);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_request", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const { event, source } = await parseIncidentAI(parsed.data.text);
  return NextResponse.json({ event, source });
}
