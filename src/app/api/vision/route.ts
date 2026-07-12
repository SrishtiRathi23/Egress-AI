import { NextResponse } from "next/server";
import { estimateDensityAI } from "@/lib/ai/gemini";
import { VisionRequestSchema } from "@/lib/ai/schemas";
import { readJsonBody, VISION_MAX_BODY_BYTES } from "@/lib/http";
import { clientKey, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(request: Request): Promise<Response> {
  if (!rateLimit(clientKey(request), 10).ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const body = await readJsonBody(request, VISION_MAX_BODY_BYTES);
  if (!body.ok) {
    return NextResponse.json({ error: body.error }, { status: body.status });
  }

  const parsed = VisionRequestSchema.safeParse(body.data);
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
