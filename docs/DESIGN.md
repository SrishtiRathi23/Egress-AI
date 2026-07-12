# EgressAI — Design of Record

**Challenge:** Google × Hack2skill PromptWars Virtual, Main Challenge 04 — *Smart Stadiums & Tournament Operations* (optimise workflows and fan experience for the FIFA World Cup 2026).

**One line:** EgressAI forecasts per-gate crowd density in the minutes after full-time and re-balances flow before a crush can form — a deterministic simulation decides, generative AI perceives and explains.

---

## 1. Why this problem

Post-match egress is where stadium disasters happen: Hillsborough (1989), Kanjuruhan (2022), Itaewon (2022). Existing CCTV is *reactive* — it shows the crush as it forms. Operators have no tool that *predicts* per-gate density ten minutes out and prescribes a concrete re-balancing plan. That prediction-plus-prescription gap is what EgressAI fills.

## 2. Core thesis

> **AI perceives and explains; deterministic, crowd-science-grounded code decides and executes.**

A language model never makes the safety-critical call (who to divert where). It parses messy human input into structured events and narrates the resulting plan. The decision itself comes from a pure, fully-tested simulation.

## 3. Grounding in real crowd science (cited in code + UI)

- **Fruin Level of Service** — pedestrian density bands (A–F). Treat **> 4 people/m² as danger** (crush risk).
- **Little's Law** — `L = λ · W` relates queue length, arrival rate, and wait time.
- **The Green Guide (SGSA)** — safe egress rates in persons per metre-width per minute.
- **Discrete-time queue dynamics** — `Q(t+Δ) = max(0, Q(t) + inflow − throughput)`, `throughput = min(demand, μ)`, `μ = lanes × service_rate × Δ`.

## 4. Domain model (deliberately distinct from any wayfinding/routing app)

An **egress network** is a directed flow:

```
Zones (seating sections, hold people)
   → Gates (bottlenecks: lanes × service-rate, width in metres)
      → Exits (to transit / street)
```

This is a **queue-network / flow-conservation** model, not a shortest-path routing graph. The data (zones, gate widths, service rates) and the algorithms (discrete-time queue simulation, greedy density-minimising re-assignment) share nothing with a pathfinding app.

## 5. Architecture

```
Firebase Hosting (CDN, static frontend)
   └─ rewrites all paths ─→ Cloud Run (single Next.js standalone container)
        • src/lib/egress  — PURE deterministic engine (100% tested)
        • /api/plan        — simulate + Gemini steward instructions (fallback: templated)
        • /api/parse-event — Gemini NL incident → structured event (fallback: keyword parser)
        • /api/vision      — Gemini multimodal density estimate (fallback: manual slider)
        • Gemini via Vertex AI + Application Default Credentials — NO key in the repo
```

Dependencies point inward: the engine imports nothing framework-specific; the Google SDK is lazy-imported only inside the code path that uses it.

## 6. The deterministic engine (`src/lib/egress`) — the score

Pure functions, no side effects, 100% statement/function/line coverage:

- `density.ts` — Fruin LoS classification and risk bands from people/m².
- `simulate.ts` — discrete-time queue simulator; forecasts queue length, density, and wait per gate over an N-minute horizon.
- `rebalance.ts` — greedy re-assignment of zones→gates that minimises peak density, with a walk-time penalty; provably beats nearest-gate assignment.
- `instructions.ts` — deterministic steward orders from the plan diff.
- `parse-event.ts` — keyword incident parser; the fallback for the Gemini path.

**Test invariants** (property-style over thousands of random scenarios): people conserved · queues never negative · throughput ≤ capacity · no NaN · Little's Law holds in steady state · re-balancer lowers peak density · malformed-graph guards.

## 7. GenAI layer (central, via Vertex AI)

Every AI call is wrapped so it **never throws** and always has a deterministic fallback, so the app is fully functional offline / with no key:

1. **Prompt-first ops console** — operator types "Gate 3 just closed, 5 min to whistle" → Gemini → structured event → engine re-simulates.
2. **Steward instruction generation** — Gemini turns sim state into calm, concrete orders.
3. **Multimodal density read** — Gemini estimates crowd density from a gate-camera photo to seed the sim.

## 8. Cross-cutting requirements

- Strict TypeScript (`noUncheckedIndexedAccess`), Zod-validated + rate-limited API routes.
- CSP + security headers; no secrets in the repo (ADC on Vertex).
- WCAG 2.1 AA; multilingual (EN, ES, PT, FR, AR-RTL, HI) via deterministic i18n dictionaries.
- Best-in-class SaaS UI, mobile-first, RTL-aware, light + dark, **no emojis**, SVG favicon wired into tab and app.

## 9. Scoring alignment (verified from the official explainer)

Automatic platform assessment scores six signals — Code Quality, Security, Efficiency, Testing, Accessibility, Problem-Statement Alignment — and **only the final submission counts**. Tool usage (which tools, why, how prompts evolved, GenAI-vs-human split) must be documented in the README and LinkedIn post.

## 10. Originality & anti-plagiarism

The platform flags duplicate **git blobs** (content-identical files) and confirms by manual review. Therefore: fresh `git init` (no forking), every source file original, distinct scaffold identity, original venue data and copy. EgressAI is a different domain, data model, and codebase from any other entry.

## 11. Phase plan (each phase ends green on all gates)

0. **Scaffold & guardrails** ✅ — Next.js 16 + strict TS, CSP, Vitest 100% thresholds on the engine dir, ESLint + jsx-a11y, SVG favicon, theme foundation.
1. Deterministic egress engine + full test suite.
2. Gemini layer + Zod-validated, rate-limited API routes.
3. Prompt-first console UI (map, density cards, command bar, steward orders, incident simulator), i18n, light/dark, RTL.
4. Docs (README with GenAI disclosure, ARCHITECTURE, SECURITY, ACCESSIBILITY, DEPLOY) + LinkedIn post.
5. Deploy — Cloud Run backend + Firebase Hosting frontend.
