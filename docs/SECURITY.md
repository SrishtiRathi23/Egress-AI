# Security

EgressAI is defensive by default. The posture below is enforced in code, not just
documented.

## No secrets in the repository

The live AI path authenticates to Vertex AI via **Application Default
Credentials** — there is no API key in the source tree. `.env.local` (which may
hold a project id or an optional AI Studio key) is gitignored and never
committed. `.env.example` documents the variables with empty values.

## Transport and browser hardening — `next.config.ts`

A strict Content-Security-Policy and a full set of security headers are applied
to every response:

- `Content-Security-Policy`: `default-src 'self'`, `object-src 'none'`, `frame-ancestors 'none'`, `base-uri 'self'`, `form-action 'self'`. `'unsafe-eval'` is allowed **only** in development (React Fast Refresh) and dropped in production, where `upgrade-insecure-requests` is added.
- `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`.
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`.
- `Strict-Transport-Security` with a two-year max-age and preload.

## Input validation — `src/lib/ai/schemas.ts`

Every API request body is validated with Zod before it is used, and **every AI
response is validated too** — an off-spec model output fails the schema and the
request falls back to the deterministic engine rather than trusting unstructured
text. Fields are length- and range-bounded (incident text to 500 characters,
whistle minutes to 240, density estimates to 0–20, and so on).

## Request-size and rate limiting

- `src/lib/http.ts` caps the request body **before** parsing (32 KB for the JSON
  routes, ~11 MB for the image-bearing vision route), returning `413` for
  oversized payloads and `400` for malformed JSON — an oversized body can never
  force an unbounded read.
- `src/lib/rate-limit.ts` applies a fixed-window per-caller limit to every route
  (`429` when exceeded). It is per-instance; a horizontally-scaled deployment
  would back it with a shared store such as Redis or Firestore.

## Fail-safe AI boundary

Every Gemini call is wrapped so it can never throw. On any error — network,
auth, quota, or a malformed response — the request degrades to the deterministic
result and the UI honestly labels the source. The Google SDK is lazy-imported
behind a `server-only` guard so it cannot be bundled into client code.

## Known limitations

- The in-memory rate limiter and the `content-length` size check are best-effort
  per-instance defenses; production hardening would add a shared limiter and a
  streaming body cap for chunked requests without a declared length.
- Venue data is an illustrative model, not real-time sensor data; the app labels
  it as such and never presents it as a live feed.
