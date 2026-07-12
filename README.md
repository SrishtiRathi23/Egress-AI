<div align="center">

<img src="docs/assets/hero.svg" alt="EgressAI — predictive crowd-egress command console for the FIFA World Cup 2026" width="880" />

<br />

![Tests](https://img.shields.io/badge/tests-121%20passing-2ea44f?style=flat-square)
![Engine coverage](https://img.shields.io/badge/engine%20coverage-100%25-2ea44f?style=flat-square)
![react-doctor](https://img.shields.io/badge/react--doctor-100%2F100-2ea44f?style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6?style=flat-square)
![Accessibility](https://img.shields.io/badge/WCAG-2.1%20AA-0e7490?style=flat-square)
![Languages](https://img.shields.io/badge/languages-6-6366f1?style=flat-square)

**Forecast the crush before it forms. Divert the crowd before it's too late.**

EgressAI predicts per-gate crowd density in the deadly minutes after full-time and tells stewards
exactly where to send people — a decision made by deterministic, crowd-science-grounded code and
explained in plain language by Gemini.

Google × Hack2skill · PromptWars Virtual · **Main Challenge 04 — Smart Stadiums & Tournament Operations**

</div>

---

<a id="problem"></a>
<img alt="01 — The problem" src="docs/assets/h-01-problem.svg" width="600" />

The most dangerous minutes of any match are the ones **after** the final whistle. When 40,000 people
stand up at once and head for the exits, the concourse becomes a fluid — and when that fluid is forced
through a bottleneck faster than it can pass, people are crushed. It is how the modern era's worst
stadium disasters happened: Hillsborough (1989), the Kanjuruhan Stadium disaster (2022), Itaewon (2022).

Today's tooling is **reactive**. CCTV and density alarms tell an operator there is a crush *once it has
already formed* — when the only options left are bad ones. There has been no tool that looks ten minutes
ahead, per gate, and hands the control room a concrete plan to stop the crush from forming at all.

EgressAI is that tool.

<a id="how"></a>
<img alt="02 — How it works" src="docs/assets/h-02-how.svg" width="600" />

One principle governs the whole system:

> **Generative AI perceives and explains. Deterministic, crowd-science-grounded code decides and executes.**

A language model is never allowed to make the safety-critical call about who to send where. Instead:

1. **Perceive.** A steward radios in — *"gate south is jammed, five to the whistle."* Gemini turns that
   messy sentence into a typed, validated event. (It can also read a gate-camera photo and estimate the
   crowd density it sees.)
2. **Decide.** A pure, discrete-time queue simulation forecasts density and wait at every gate for the
   next hour, and a re-balancer reassigns seating zones to gates to hold peak density down — provably
   never making it worse than the naive plan.
3. **Explain.** Gemini turns the resulting plan into a calm, concrete steward briefing, keeping the exact
   gate names and clear-times the engine computed.

Every AI call has a deterministic fallback and can never throw, so **the app is fully functional with no
API key at all** — the live model is an upgrade, never a dependency. The UI states the source of every
answer honestly: *"Answered by Gemini"* or *"Deterministic engine."*

<a id="science"></a>
<img alt="03 — The science behind it" src="docs/assets/h-03-science.svg" width="600" />

The engine is a **model**, not a live sensor feed — no public API exposes real-time per-gate density for
a stadium; that data lives only in an operator's private CCTV and BIM systems. But the model is grounded
in published, citable crowd-safety science, so its numbers are defensible rather than invented:

| Source | Used for |
| --- | --- |
| **Fruin, *Pedestrian Planning and Design* (1971)** — Level-of-Service for queuing areas | Density bands A–F; the crush-risk threshold at 4 people/m² |
| **Little's Law** — `L = λ · W` | The queue-length ↔ arrival-rate ↔ wait relationship |
| **The Green Guide (SGSA)** — safe egress rates (persons per metre-width per minute) | Gate service-rate calibration |
| **Discrete-time queue dynamics** | `Q(t+Δ) = max(0, Q(t) + inflow − throughput)`, `throughput = min(demand, μ)`, `μ = lanes × service_rate × Δ` |

Two modelling choices make the figures physically honest. Seating zones **stream out over a release
window** rather than arriving at a gate as a single impossible lump. And displayed density is **capped at
a physical packing ceiling of 8 people/m²**, because a crowd cannot compress beyond that — it spills back
upstream instead. The uncapped "load" is kept internally as the continuous objective the re-balancer
minimises, so the optimiser keeps improving even once gates are saturated.

<a id="genai"></a>
<img alt="04 — Generative AI, disclosed" src="docs/assets/h-04-genai.svg" width="600" />

GenAI is central to the product and sits on the operator's critical path. Here is exactly what it does,
why, and where the human-designed code takes over.

| Capability | Tool | Why chosen | What GenAI does | Deterministic fallback (human-designed) |
| --- | --- | --- | --- | --- |
| Incident understanding | Gemini 2.5 Flash (Vertex AI) | Fast, low-cost, structured output | Turns a radio message into a typed event | Keyword parser (`parse-event.ts`) |
| Steward briefing | Gemini 2.5 Flash (Vertex AI) | Natural, calm control-room phrasing | Rewrites the plan diff into a short spoken briefing | Templated briefing (`buildBriefing`) |
| Crowd-density read | Gemini 2.5 Flash (Vertex AI, multimodal) | One model for text and vision | Estimates density from a gate-camera photo | Manual density input |

**Why Vertex AI.** It authenticates via Application Default Credentials, so there is **no API key in the
repository** — a security property, not just a convenience.

**How the prompts evolved.** The parsing prompt moved from free-form to a *strict JSON contract* validated
by Zod; if the model returns anything off-spec, the request silently falls back to the keyword parser. The
narration prompt was constrained to *"max four sentences, no markdown, keep the exact gate names and
clear-times"* after early drafts drifted into flourish.

**GenAI vs. human.** The entire safety-critical core — the queue simulation, the density model, and the
re-balancer — is human-designed and **100% test-covered**. GenAI only perceives and explains around it.

<a id="architecture"></a>
<img alt="05 — Architecture" src="docs/assets/h-05-architecture.svg" width="600" />

```
Firebase Hosting (CDN, static frontend)
   └─ rewrites all paths ─→ Cloud Run (single Next.js standalone container)
        • src/lib/egress       — PURE deterministic engine (100% tested)
        • src/lib/plan-service — orchestration shared by the page and the API
        • /api/plan            — simulate + re-balance + Gemini narration
        • /api/parse-event     — Gemini incident parsing (fallback: keyword parser)
        • /api/vision          — Gemini multimodal density (fallback: manual)
        • Gemini via Vertex AI + Application Default Credentials (no key in repo)
```

Dependencies point inward: the engine imports nothing framework-specific, and the Google SDK is
lazy-imported behind a `server-only` guard only inside the code path that uses it. The home page is
server-rendered from the engine, so the first paint needs no client fetch — and all data fetching happens
in event handlers, never in effects. Full detail in **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)**.

<a id="quality"></a>
<img alt="06 — Quality, tested to the core" src="docs/assets/h-06-quality.svg" width="600" />

| Signal | Status |
| --- | --- |
| Deterministic engine coverage | **100%** statements / branches / functions / lines |
| Tests | **121 passing** — unit, property-based, and component |
| Type safety | Strict TypeScript with `noUncheckedIndexedAccess` |
| Static health | **react-doctor 100/100** |
| Security | CSP + full headers, Zod validation, rate limiting, request-size caps, no secrets |
| Accessibility | WCAG 2.1 AA — keyboard, focus, ARIA, contrast, RTL, reduced motion |

The property tests assert the engine's invariants hold across **thousands of random scenarios**: people
are conserved every step, queues never go negative, throughput never exceeds capacity, no value is ever
`NaN`, Little's-Law bookkeeping stays consistent, and the re-balancer **provably never makes peak load
worse** than the baseline.

```bash
npm run typecheck    # strict TypeScript
npm run lint         # ESLint + jsx-a11y
npm run test         # Vitest
npm run coverage     # engine coverage thresholds (100%)
npm run build        # production build (standalone output for Cloud Run)
```

<a id="security"></a>
<img alt="07 — Security & accessibility" src="docs/assets/h-07-security.svg" width="600" />

Security is enforced in code: a strict Content-Security-Policy and the full security-header set on every
response, Zod validation of **both** requests and AI responses, per-caller rate limiting, request-body
size caps applied before parsing, and no secret ever committed (Vertex uses Application Default
Credentials). See **[docs/SECURITY.md](docs/SECURITY.md)**.

Accessibility is treated as a requirement, not a checkbox — every control is keyboard-operable with a loud
focus ring, colour is never the only signal, motion respects `prefers-reduced-motion`, and Arabic ships
with full right-to-left layout. See **[docs/ACCESSIBILITY.md](docs/ACCESSIBILITY.md)**.

<a id="languages"></a>
<img alt="08 — Six languages" src="docs/assets/h-08-languages.svg" width="600" />

The interface ships in six languages spanning FIFA 2026 host regions and travelling fanbases — **English,
Spanish, Portuguese, French, Arabic (right-to-left), and Hindi.** Fixed UI strings come from a typed,
unit-tested dictionary (no hallucination); only free-text operator input and the AI narration flow through
Gemini.

<a id="start"></a>
<img alt="09 — Getting started" src="docs/assets/h-09-start.svg" width="600" />

```bash
npm install
npm run dev        # http://localhost:3000 — works with NO key (deterministic fallback)
```

To enable live Gemini, copy `.env.example` to `.env.local` and either set `USE_VERTEX=true` with a
`GOOGLE_CLOUD_PROJECT` (authenticated via `gcloud auth application-default login`), or set
`GEMINI_API_KEY` from Google AI Studio. No key is ever committed.

Try it: open the console, type **"gate south is closed"**, and watch a red critical-density zone appear —
then dissolve as the re-balancer diverts the flow and the plan is read back to you.

<a id="deploy"></a>
<img alt="10 — Deployment" src="docs/assets/h-10-deploy.svg" width="600" />

A single container to **Cloud Run**, fronted by **Firebase Hosting** which rewrites all traffic to the
service. The `Dockerfile` builds the Next.js standalone output and listens on `$PORT`. Full commands and
the hard-won gotchas are in **[docs/DEPLOY.md](docs/DEPLOY.md)**.

<a id="structure"></a>
<img alt="11 — Project structure" src="docs/assets/h-11-structure.svg" width="600" />

```
src/
  lib/egress/        deterministic engine (density, simulate, rebalance, instructions, parse-event)
  lib/ai/            Gemini layer (config, schemas, gemini) with deterministic fallbacks
  lib/i18n/          six-language dictionary
  lib/plan-service   server-side orchestration
  lib/http.ts        request-size hardening
  data/venues.ts     illustrative FIFA 2026 host-venue egress models
  app/               Next.js App Router pages and API routes
  components/        the console UI (home dashboard, command bar, gate map, cards, forecast)
docs/                ARCHITECTURE, SECURITY, ACCESSIBILITY, DEPLOY, DESIGN, and the LinkedIn post
```

---

<div align="center">

Built by **Srishti Rathi** for PromptWars Virtual, Challenge 04.
Development was assisted by AI coding tools under human direction and validation; all code is original.

</div>
