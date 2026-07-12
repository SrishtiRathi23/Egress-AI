import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { clientKey, rateLimit } from "./rate-limit";

describe("rateLimit", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("allows calls up to the limit, then blocks", () => {
    const key = `a-${Math.random()}`;
    expect(rateLimit(key, 3, 1000).ok).toBe(true);
    expect(rateLimit(key, 3, 1000).ok).toBe(true);
    expect(rateLimit(key, 3, 1000).ok).toBe(true);
    const blocked = rateLimit(key, 3, 1000);
    expect(blocked.ok).toBe(false);
    expect(blocked.remaining).toBe(0);
  });

  it("decrements the remaining count", () => {
    const key = `b-${Math.random()}`;
    expect(rateLimit(key, 5, 1000).remaining).toBe(4);
    expect(rateLimit(key, 5, 1000).remaining).toBe(3);
  });

  it("resets once the window elapses", () => {
    const key = `c-${Math.random()}`;
    rateLimit(key, 1, 1000);
    expect(rateLimit(key, 1, 1000).ok).toBe(false);
    vi.setSystemTime(1001);
    expect(rateLimit(key, 1, 1000).ok).toBe(true);
  });
});

describe("clientKey", () => {
  it("uses the first x-forwarded-for entry", () => {
    const request = new Request("http://x", {
      headers: { "x-forwarded-for": "1.2.3.4, 5.6.7.8" },
    });
    expect(clientKey(request)).toBe("1.2.3.4");
  });

  it("falls back to local without the header", () => {
    expect(clientKey(new Request("http://x"))).toBe("local");
  });
});
