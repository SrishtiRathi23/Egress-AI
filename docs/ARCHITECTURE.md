# Architecture

EgressAI is a single Next.js application. Its guiding rule is a strict dependency
direction: **everything points inward toward a pure, framework-free engine.**

## Layers

```
UI (React client components)
   │  fetches in event handlers only, never in effects
   ▼
API routes (/api/plan, /api/parse-event, /api/vision)
   │  Zod-validated, rate-limited, body-size-capped
   ▼
plan-service (server-only orchestration)
   ├─→ egress engine (pure, 100% tested)   ← the decision
   └─→ ai/gemini (lazy Google SDK)          ← the perception + explanation
```

### 1. The deterministic engine — `src/lib/egress`

Pure functions with no side effects and no framework imports. This is the
safety-critical core and the only directory held to 100% coverage.

- `density.ts` — Fruin Level-of-Service bands, risk bands, and the crush / packing thresholds.
- `simulate.ts` — a discrete-time queue simulator. The one-step primitive `stepQueue` is extracted so the core invariant (queues never go negative) is testable in isolation. Zone occupancy streams out over a release window rather than arriving as a single impossible lump.
- `rebalance.ts` — a hill-climb re-assignment of zones to gates that starts from the nearest-gate baseline and only ever accepts a move that strictly lowers peak load, so the result is provably never worse than the baseline.
- `instructions.ts` — turns the plan diff into concrete steward orders.
- `parse-event.ts` — a keyword incident parser and the network mutation for a gate closure. This is the deterministic fallback for the Gemini parsing path.

### 2. The AI layer — `src/lib/ai`

- `config.ts` — reads environment to decide whether the live path is enabled and how it authenticates (Vertex ADC or an API key). No secrets are hard-coded.
- `schemas.ts` — Zod schemas that validate both incoming requests and outgoing AI responses. The AI-output schemas double as the contract the model is asked to fill.
- `gemini.ts` — the boundary. Every function catches all failures, degrades to a deterministic result, and tags the source. The Google SDK is `await import`-ed lazily and guarded with `server-only` so it never enters a client bundle.

### 3. Orchestration — `src/lib/plan-service.ts`

`buildPlan` composes the pieces: apply any incident or gate closure, re-balance,
simulate the optimised plan, derive per-gate views and a forecast timeline,
generate steward orders, and narrate them. It is used by **both** the `/api/plan`
route and the server-rendered home page, so the first paint needs no client fetch.

### 4. The UI — `src/components`

Client components. The app opens on a **home dashboard** (hero, capabilities,
venue picker), then enters the operational **console** (command bar, gate map,
density cards, steward orders, forecast). All data fetching happens in event
handlers — never in a `useEffect` — which keeps the render pure and the static
analyzer happy.

## Key decisions

- **Server-rendered first paint.** The page is `force-dynamic` and computes the initial plan on the server, so there is no loading spinner and no fetch-in-effect.
- **Load, not capped density, as the optimisation target.** Once gates saturate, the displayed density flattens at the packing ceiling; the uncapped load keeps a continuous gradient for the re-balancer to descend.
- **Structured gate closures alongside natural language.** The console can close a gate by a direct structured request (language-independent, always works offline) as well as by a Gemini-parsed sentence.
