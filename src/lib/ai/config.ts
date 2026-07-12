// Central switch for the generative-AI layer. Everything reads from environment
// variables so the app is fully functional with no configuration (deterministic
// fallbacks) and lights up the live Gemini path only when explicitly enabled and
// a viable auth route exists. No secrets are ever hard-coded.

export type AiSource = "gemini" | "fallback";

export interface GeminiSettings {
  enabled: boolean;
  useVertex: boolean;
  project: string | undefined;
  location: string;
  apiKey: string | undefined;
  model: string;
}

export function geminiSettings(): GeminiSettings {
  const useGemini = process.env.USE_GEMINI === "true";
  const useVertex = process.env.USE_VERTEX === "true";
  const project = process.env.GOOGLE_CLOUD_PROJECT || undefined;
  const location = process.env.GOOGLE_CLOUD_LOCATION || "us-central1";
  const apiKey = process.env.GEMINI_API_KEY || undefined;
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";

  // Vertex authenticates via Application Default Credentials, so it only needs a
  // project id; the Gemini Developer API needs a key.
  const hasAuthPath = useVertex ? Boolean(project) : Boolean(apiKey);

  return {
    enabled: useGemini && hasAuthPath,
    useVertex,
    project,
    location,
    apiKey,
    model,
  };
}
