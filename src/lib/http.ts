// Shared request hardening for the API routes. Bodies are size-capped BEFORE
// parsing so an oversized payload can't force an unbounded read, and JSON parse
// failures are turned into a clean 400 rather than a thrown 500.

export type BodyResult =
  | { ok: true; data: unknown }
  | { ok: false; status: number; error: string };

/** Default request-body cap for the small JSON routes (32 KB). */
export const DEFAULT_MAX_BODY_BYTES = 32_768;

/** Larger cap for the image-bearing vision route (~11 MB of base64). */
export const VISION_MAX_BODY_BYTES = 11_000_000;

export async function readJsonBody(
  request: Request,
  maxBytes: number = DEFAULT_MAX_BODY_BYTES,
): Promise<BodyResult> {
  const declaredLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > maxBytes) {
    return { ok: false, status: 413, error: "payload_too_large" };
  }
  try {
    const data = await request.json();
    return { ok: true, data };
  } catch {
    return { ok: false, status: 400, error: "invalid_json" };
  }
}
