import { NextResponse } from "next/server";
import { parseIncidentAI } from "@/lib/ai/gemini";
import { ParseEventRequestSchema } from "@/lib/ai/schemas";
import { clientKey, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(request: Request): Promise<Response> {
  if (!rateLimit(clientKey(request), 30).ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = ParseEventRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_request", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const { event, source } = await parseIncidentAI(parsed.data.text);
  return NextResponse.json({ event, source });
}
