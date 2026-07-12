import { NextResponse } from "next/server";
import { estimateDensityAI } from "@/lib/ai/gemini";
import { VisionRequestSchema } from "@/lib/ai/schemas";
import { clientKey, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(request: Request): Promise<Response> {
  if (!rateLimit(clientKey(request), 10).ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = VisionRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_request", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const { density, source } = await estimateDensityAI(
    parsed.data.imageBase64,
    parsed.data.mimeType,
  );
  return NextResponse.json({ density, source });
}
