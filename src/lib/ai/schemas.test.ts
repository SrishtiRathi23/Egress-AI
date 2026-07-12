import { describe, expect, it } from "vitest";
import {
  DensityEstimateSchema,
  EgressEventSchema,
  ParseEventRequestSchema,
  PlanRequestSchema,
  VisionRequestSchema,
} from "./schemas";

describe("ParseEventRequestSchema", () => {
  it("accepts and trims a non-empty string", () => {
    const result = ParseEventRequestSchema.safeParse({ text: "  gate closed  " });
    expect(result.success).toBe(true);
    expect(result.success && result.data.text).toBe("gate closed");
  });

  it("rejects an empty string", () => {
    expect(ParseEventRequestSchema.safeParse({ text: "" }).success).toBe(false);
  });

  it("rejects text beyond 500 characters", () => {
    expect(ParseEventRequestSchema.safeParse({ text: "a".repeat(501) }).success).toBe(false);
  });
});

describe("PlanRequestSchema", () => {
  it("accepts a bare networkId", () => {
    expect(PlanRequestSchema.safeParse({ networkId: "arlington" }).success).toBe(true);
  });

  it("accepts closed gate ids and incident text", () => {
    const result = PlanRequestSchema.safeParse({
      networkId: "arlington",
      incidentText: "gate south closed",
      closedGateIds: ["g-south"],
    });
    expect(result.success).toBe(true);
  });

  it("rejects a missing networkId", () => {
    expect(PlanRequestSchema.safeParse({ incidentText: "x" }).success).toBe(false);
  });

  it("rejects more than 20 closed gates", () => {
    const closedGateIds = Array.from({ length: 21 }, (_, i) => `g${i}`);
    expect(PlanRequestSchema.safeParse({ networkId: "a", closedGateIds }).success).toBe(false);
  });
});

describe("VisionRequestSchema", () => {
  it("accepts a supported mime type", () => {
    expect(
      VisionRequestSchema.safeParse({ imageBase64: "AAAA", mimeType: "image/png" }).success,
    ).toBe(true);
  });

  it("rejects an unsupported mime type", () => {
    expect(
      VisionRequestSchema.safeParse({ imageBase64: "AAAA", mimeType: "image/gif" }).success,
    ).toBe(false);
  });
});

describe("EgressEventSchema", () => {
  it("accepts a gate_closed event", () => {
    expect(EgressEventSchema.safeParse({ type: "gate_closed", gateRef: "3" }).success).toBe(true);
  });

  it("accepts a time_to_whistle within range", () => {
    expect(EgressEventSchema.safeParse({ type: "time_to_whistle", minutes: 5 }).success).toBe(true);
  });

  it("rejects minutes beyond the cap", () => {
    expect(EgressEventSchema.safeParse({ type: "time_to_whistle", minutes: 999 }).success).toBe(false);
  });

  it("rejects an unknown discriminator", () => {
    expect(EgressEventSchema.safeParse({ type: "explode", gateRef: "1" }).success).toBe(false);
  });
});

describe("DensityEstimateSchema", () => {
  it("accepts a density within 0-20", () => {
    expect(DensityEstimateSchema.safeParse({ density: 3.5 }).success).toBe(true);
  });

  it("rejects a negative density", () => {
    expect(DensityEstimateSchema.safeParse({ density: -1 }).success).toBe(false);
  });

  it("rejects a density beyond 20", () => {
    expect(DensityEstimateSchema.safeParse({ density: 25 }).success).toBe(false);
  });
});
