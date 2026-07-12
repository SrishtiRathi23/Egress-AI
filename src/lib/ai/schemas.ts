import { z } from "zod";

// Zod schemas validate every API request body and every AI response before it is
// trusted. The AI-output schemas double as the contract Gemini is asked to fill;
// if the model returns anything off-spec, parsing fails and the caller falls back
// to the deterministic engine.

export const ParseEventRequestSchema = z.object({
  text: z.string().trim().min(1).max(500),
});

export const EgressEventSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("gate_closed"), gateRef: z.string().min(1).max(40) }),
  z.object({ type: z.literal("gate_opened"), gateRef: z.string().min(1).max(40) }),
  z.object({ type: z.literal("surge"), gateRef: z.string().min(1).max(40) }),
  z.object({ type: z.literal("time_to_whistle"), minutes: z.number().int().min(0).max(240) }),
  z.object({ type: z.literal("unknown"), text: z.string().max(500) }),
]);

export const PlanRequestSchema = z.object({
  networkId: z.string().min(1).max(60),
  incidentText: z.string().trim().max(500).optional(),
  horizonMinutes: z.number().int().positive().max(180).optional(),
  stepMinutes: z.number().int().positive().max(10).optional(),
});

export const VisionRequestSchema = z.object({
  imageBase64: z.string().min(1).max(8_000_000),
  mimeType: z.enum(["image/png", "image/jpeg", "image/webp"]),
});

export const DensityEstimateSchema = z.object({
  density: z.number().nonnegative().max(20),
});

export type ParseEventRequest = z.infer<typeof ParseEventRequestSchema>;
export type PlanRequest = z.infer<typeof PlanRequestSchema>;
export type VisionRequest = z.infer<typeof VisionRequestSchema>;
