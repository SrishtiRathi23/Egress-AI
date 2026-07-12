import { describe, expect, it } from "vitest";
import { DEFAULT_MAX_BODY_BYTES, readJsonBody, VISION_MAX_BODY_BYTES } from "./http";

function mockRequest(bodyText: string, contentLength?: string): Request {
  return {
    headers: {
      get: (key: string) =>
        key.toLowerCase() === "content-length" ? (contentLength ?? null) : null,
    },
    json: async () => JSON.parse(bodyText),
  } as unknown as Request;
}

describe("readJsonBody", () => {
  it("parses valid JSON", async () => {
    const result = await readJsonBody(mockRequest(JSON.stringify({ a: 1 })));
    expect(result).toEqual({ ok: true, data: { a: 1 } });
  });

  it("returns a 400 for invalid JSON", async () => {
    const result = await readJsonBody(mockRequest("{not valid"));
    expect(result).toEqual({ ok: false, status: 400, error: "invalid_json" });
  });

  it("returns a 413 when content-length exceeds the cap", async () => {
    const result = await readJsonBody(
      mockRequest("{}", String(DEFAULT_MAX_BODY_BYTES + 1)),
      DEFAULT_MAX_BODY_BYTES,
    );
    expect(result).toEqual({ ok: false, status: 413, error: "payload_too_large" });
  });

  it("allows a body exactly at the cap", async () => {
    const result = await readJsonBody(
      mockRequest("{}", String(DEFAULT_MAX_BODY_BYTES)),
      DEFAULT_MAX_BODY_BYTES,
    );
    expect(result.ok).toBe(true);
  });

  it("parses when no content-length header is present", async () => {
    const result = await readJsonBody(mockRequest(JSON.stringify({ ok: true })));
    expect(result.ok).toBe(true);
  });

  it("gives the vision route a larger cap than the default", () => {
    expect(VISION_MAX_BODY_BYTES).toBeGreaterThan(DEFAULT_MAX_BODY_BYTES);
  });
});
