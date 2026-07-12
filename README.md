<div align="center">

<img src="src/app/icon.svg" width="76" height="76" alt="EgressAI logo" />

# EgressAI

**Predictive crowd-egress and real-time gate re-balancing for the FIFA World Cup 2026.**

Google x Hack2skill PromptWars Virtual — Main Challenge 04: Smart Stadiums & Tournament Operations

Tests: 121 passing · Engine coverage: 100% · react-doctor: 100/100 · Strict TypeScript · WCAG 2.1 AA

</div>

---

## The problem

The most dangerous fifteen minutes of any match are the ones *after* the final whistle. Post-match egress is where crowd disasters happen — Hillsborough (1989), Kanjuruhan (2022), Itaewon (2022). CCTV is reactive: it shows the crush as it forms. Operators have no tool that *predicts* per-gate density minutes ahead and prescribes a concrete plan to relieve it.

EgressAI is that tool. It forecasts per-gate crowd density ten minutes out and tells stewards exactly where to divert flow — before density spikes.

## The thesis

> **Generative AI perceives and explains. Deterministic, crowd-science-grounded code decides and executes.**

A language model never makes the safety-critical call about who to divert where. Gemini parses a steward's plain-language radio message into a structured event and narrates the resulting plan in calm, concrete language. The decision itself — the simulation and the re-balancing — comes from a pure, fully-tested engine. The app is fully functional with no API key; the live AI is an upgrade, never a dependency.

## Grounded in real crowd science

The engine is a model, not a live sensor feed (no public API exposes real-time per-gate density for stadiums — that data lives only in operators' private systems). But the model is grounded in published, citable crowd-safety science, so its figures are defensible rather than invented:

| Source | Used for |
| --- | --- |
| **Fruin, *Pedestrian Planning and Design* (1971)** — Level-of-Service for queuing areas | Density bands A–F; the crush-risk threshold at 4 people/m² |
| **Little's Law** — `L = λ · W` | The queue-length / arrival-rate / wait relationship |
| **The Green Guide (SGSA)** — safe egress rates (persons per metre-width per minute) | Gate service-rate calibration |
| **Discrete-time queue dynamics** — `Q(t+Δ) = max(0, Q(t) + inflow − throughput)`, `throughput = min(demand, μ)`, `μ = lanes × service_rate × Δ` | The per-gate forecast |

Displayed density is capped at a physical packing ceiling (8 people/m²) because a crowd cannot compress beyond that — it spills back upstream instead. The uncapped "load" is kept internally as the continuous objective the re-balancer minimises.

## Generative AI — usage disclosure

GenAI is central to the product, on the operator's critical path, and every call degrades to a deterministic result so nothing ever breaks. The source of every AI answer is shown honestly in the UI ("Answered by Gemini" versus "Deterministic engine").

| Capability | Tool | Why it was chosen | What GenAI does | Deterministic fallback (human-designed) |
| --- | --- | --- | --- | --- |
| Incident understanding | Gemini 2.5 Flash (Vertex AI) | Fast, low-cost, structured-output support | Turns "gate south is jammed, five to the whistle" into a typed event | Keyword parser (`parse-event.ts`) |
| Steward briefing | Gemini 2.5 Flash (Vertex AI) | Natural, calm control-room phrasing | Rewrites the plan diff into a short spoken briefing | Templated briefing (`buildBriefing`) |
| Crowd-density read | Gemini 2.5 Flash (Vertex AI, multimodal) | One model for text and vision | Estimates density from a gate-camera photo to seed the sim | Manual density input |

**Why Vertex AI:** it authenticates via Application Default Credentials, so there is **no API key in the repository**. **How the prompts evolved:** the parsing prompt moved from free-form to a strict JSON contract validated by Zod (an off-spec response falls back to the keyword parser); the narration prompt was constrained to "max four sentences, no markdown, keep the exact gate names and clear-times" after early drafts drifted. **GenAI versus human:** the entire safety-critical core — the queue simulation, the density model, and the re-balancer — is human-designed and 100% test-covered; GenAI only perceives and explains around it.

## Architecture

```
Firebase Hosting (CDN, static frontend)
   └─ rewrites all paths ─→ Cloud Run (single Next.js standalone container)
        • src/lib/egress   — PURE deterministic engine (100% tested)
        • src/lib/plan-service — orchestration used by the page and the API
        • /api/plan        — simulate + re-balance + Gemini narration
        • /api/parse-event — Gemini incident parsing (fallback: keyword parser)
        • /api/vision      — Gemini multimodal density (fallback: manual)
        • Gemini via Vertex AI + Application Default Credentials (no key in repo)
```

Dependencies point inward: the engine imports nothing framework-specific, and the Google SDK is lazy-imported (behind a `server-only` guard) only inside the code path that uses it. See [ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Quality bar

| Signal | Status |
| --- | --- |
| Deterministic engine coverage | 100% statements / branches / functions / lines |
| Tests | 121 passing (unit, property-based over thousands of random networks, component) |
| Type safety | Strict TypeScript with `noUncheckedIndexedAccess` |
| Static health | react-doctor 100/100 |
| Security | CSP + full security headers, Zod validation, rate limiting, request-size caps, no secrets — see [SECURITY.md](docs/SECURITY.md) |
| Accessibility | WCAG 2.1 AA — keyboard, focus, ARIA, contrast, RTL, reduced motion — see [ACCESSIBILITY.md](docs/ACCESSIBILITY.md) |

The property tests assert the engine's invariants hold across thousands of random scenarios: people are conserved every step, queues never go negative, throughput never exceeds capacity, no value is ever NaN, Little's Law bookkeeping is consistent, and the re-balancer provably never makes peak load worse.

## Multilingual

The interface ships in six languages spanning FIFA 2026 host regions and travelling fanbases — English, Spanish, Portuguese, French, Arabic (right-to-left), and Hindi. Fixed UI strings come from a typed, unit-tested dictionary (no hallucination); only free-text operator input and AI narration flow through Gemini.

## Tech stack

Next.js 16 (App Router) · React 19 · strict TypeScript · Tailwind CSS v4 · Vitest (v8 coverage) · Zod · `@google/genai` (Vertex AI) · lucide-react icons (no emoji anywhere).

## Running locally

```bash
npm install
npm run dev        # http://localhost:3000 — works with NO key (deterministic fallback)
```

To enable live Gemini, copy `.env.example` to `.env.local` and either set `USE_VERTEX=true` with a `GOOGLE_CLOUD_PROJECT` (authenticated via `gcloud auth application-default login`), or set `GEMINI_API_KEY` from Google AI Studio. No key is ever committed.

Quality gates:

```bash
npm run typecheck    # strict TypeScript
npm run lint         # ESLint + jsx-a11y
npm run test         # Vitest
npm run coverage     # engine coverage thresholds (100%)
npm run build        # production build (standalone output for Cloud Run)
```

## Deployment

Cloud Run backend + Firebase Hosting frontend. Full commands and the gotchas are in [DEPLOY.md](docs/DEPLOY.md).

## Project layout

```
src/
  lib/egress/        deterministic engine (density, simulate, rebalance, instructions, parse-event)
  lib/ai/            Gemini layer (config, schemas, gemini) with deterministic fallbacks
  lib/i18n/          six-language dictionary
  lib/plan-service   server-side orchestration
  data/venues.ts     illustrative FIFA 2026 host-venue egress models
  app/               Next.js App Router pages and API routes
  components/        the console UI (home dashboard, command bar, gate map, cards, forecast)
docs/                ARCHITECTURE, SECURITY, ACCESSIBILITY, DEPLOY, DESIGN
```

## Author

Built by Srishti Rathi for PromptWars Virtual, Challenge 04. Development was assisted by AI coding tools with human direction and validation; all code is original.
