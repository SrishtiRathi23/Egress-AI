import "server-only";
import { parseIncident, type EgressEvent, type StewardOrder } from "@/lib/egress";
import { geminiSettings, type AiSource } from "./config";
import { DensityEstimateSchema, EgressEventSchema } from "./schemas";

// ---------------------------------------------------------------------------
// The generative-AI boundary. Gemini PERCEIVES (parses messy language, reads a
// photo) and EXPLAINS (writes the briefing); the deterministic engine always
// DECIDES. Every function here catches all failures and degrades to a
// deterministic result, tagging the source so the UI can be honest about it.
// The Google SDK is imported lazily so the offline path never loads it.
// ---------------------------------------------------------------------------

type GenAiClient = {
  models: {
    generateContent: (args: {
      model: string;
      contents: unknown;
      config?: Record<string, unknown>;
    }) => Promise<{ text?: string }>;
  };
};

async function createClient(): Promise<GenAiClient> {
  const settings = geminiSettings();
  const { GoogleGenAI } = await import("@google/genai");
  if (settings.useVertex) {
    return new GoogleGenAI({
      vertexai: true,
      project: settings.project,
      location: settings.location,
    }) as unknown as GenAiClient;
  }
  return new GoogleGenAI({ apiKey: settings.apiKey }) as unknown as GenAiClient;
}

function parseJson(text: string | undefined): unknown {
  if (!text) throw new Error("empty model response");
  // Models sometimes wrap JSON in a ```json fence; strip it defensively.
  const cleaned = text.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  return JSON.parse(cleaned);
}

export interface ParsedIncident {
  event: EgressEvent;
  source: AiSource;
}

const PARSE_SYSTEM = `You convert a stadium steward's short radio message into one JSON event.
Return ONLY JSON, one of:
{"type":"gate_closed","gateRef":"<gate label>"}
{"type":"gate_opened","gateRef":"<gate label>"}
{"type":"surge","gateRef":"<gate label>"}
{"type":"time_to_whistle","minutes":<integer>}
{"type":"unknown","text":"<original text>"}
gateRef is the bare gate label the steward said (e.g. "3", "north"). Pick the single most operationally important event.`;

export async function parseIncidentAI(text: string): Promise<ParsedIncident> {
  const deterministic = parseIncident(text);
  const settings = geminiSettings();
  if (!settings.enabled) {
    return { event: deterministic, source: "fallback" };
  }
  try {
    const client = await createClient();
    const response = await client.models.generateContent({
      model: settings.model,
      contents: `${PARSE_SYSTEM}\n\nMessage: ${text}`,
      config: { temperature: 0, responseMimeType: "application/json" },
    });
    const event = EgressEventSchema.parse(parseJson(response.text));
    return { event, source: "gemini" };
  } catch {
    return { event: deterministic, source: "fallback" };
  }
}

export interface BriefingContext {
  venueName: string;
  peakDensity: number;
  clearanceMinute: number | null;
}

/** Deterministic briefing used when Gemini is off or fails. */
export function buildBriefing(orders: StewardOrder[], context: BriefingContext): string {
  if (orders.length === 0) {
    return `${context.venueName}: gate plan is balanced, no diversions required. Peak holding density ${context.peakDensity.toFixed(1)}/m².`;
  }
  const header = `${context.venueName}: ${orders.length} diversion${orders.length > 1 ? "s" : ""} to hold peak density at ${context.peakDensity.toFixed(1)}/m².`;
  return [header, ...orders.map((order) => `- ${order.message}`)].join("\n");
}

export interface NarratedPlan {
  text: string;
  source: AiSource;
}

export async function narrateOrdersAI(
  orders: StewardOrder[],
  context: BriefingContext,
): Promise<NarratedPlan> {
  const deterministic = buildBriefing(orders, context);
  const settings = geminiSettings();
  if (!settings.enabled) {
    return { text: deterministic, source: "fallback" };
  }
  try {
    const client = await createClient();
    const response = await client.models.generateContent({
      model: settings.model,
      contents: `You are a calm stadium control-room announcer. Turn these steward diversions into a short, plain briefing (max 4 sentences, no emojis, no markdown). Keep the exact gate names and clear-time figures.\n\nVenue: ${context.venueName}\nPeak density: ${context.peakDensity.toFixed(1)} people/m²\nDiversions:\n${orders.map((o) => o.message).join("\n")}`,
      config: { temperature: 0.3 },
    });
    const text = response.text?.trim();
    if (!text) throw new Error("empty model response");
    return { text, source: "gemini" };
  } catch {
    return { text: deterministic, source: "fallback" };
  }
}

export interface DensityReading {
  density: number | null;
  source: AiSource;
}

export async function estimateDensityAI(
  imageBase64: string,
  mimeType: string,
): Promise<DensityReading> {
  const settings = geminiSettings();
  if (!settings.enabled) {
    return { density: null, source: "fallback" };
  }
  try {
    const client = await createClient();
    const response = await client.models.generateContent({
      model: settings.model,
      contents: [
        {
          role: "user",
          parts: [
            {
              text: 'Estimate the crowd density at the gate in this photo, in people per square metre. Respond ONLY as JSON: {"density": <number 0-20>}.',
            },
            { inlineData: { mimeType, data: imageBase64 } },
          ],
        },
      ],
      config: { temperature: 0, responseMimeType: "application/json" },
    });
    const reading = DensityEstimateSchema.parse(parseJson(response.text));
    return { density: reading.density, source: "gemini" };
  } catch {
    return { density: null, source: "fallback" };
  }
}
