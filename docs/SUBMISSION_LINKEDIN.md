# LinkedIn submission post

---

I built a system that predicts the deadly fifteen minutes after full-time — and tells stewards where to send the crowd before the crush forms.

It's called EgressAI, my entry for the Google x Hack2skill PromptWars Challenge on Smart Stadiums for the FIFA World Cup 2026.

The problem is real and it kills people. The most dangerous part of a match is the egress right after the whistle — Hillsborough, Kanjuruhan, Itaewon. CCTV only shows the crush once it has already formed. There was no tool that predicts per-gate density minutes ahead and prescribes a concrete plan.

The one lesson that shaped everything:

**Let the model perceive and explain. Let deterministic, crowd-science-grounded code decide.**

An AI should never be the thing that decides who to evacuate where. So in EgressAI, Gemini reads a steward's plain-language message ("gate south is jammed, five to the whistle") and turns the plan into a calm spoken briefing — but the actual decision comes from a pure simulation grounded in real crowd science: Fruin's Level-of-Service density thresholds, Little's Law, and the Green Guide's safe egress rates. Every AI call has a deterministic fallback, so the whole thing works with no API key at all.

The tools, and why:
- Gemini 2.5 Flash on Vertex AI — for incident understanding, the steward briefing, and reading a gate-camera photo. Vertex because it authenticates with Application Default Credentials, so there is zero API key in the repository.
- Cloud Run + Firebase Hosting — a single container behind a CDN.
- I built it with an AI coding assistant, directing and validating every step.

How the prompts evolved: the parsing prompt went from free-form to a strict JSON contract validated by Zod — if the model returns anything off-spec, the request quietly falls back to a keyword parser. The briefing prompt got constrained to "four sentences, no markdown, keep the exact gate names and clear-times" after early versions drifted.

What GenAI did versus what I designed: the entire safety-critical core — the queue simulation, the density model, and the re-balancer that provably never makes peak density worse — is human-designed and 100% test-covered. GenAI only perceives and explains around it.

The result: strict TypeScript, 100% engine coverage across 121 tests, a static-health score of 100/100, WCAG 2.1 AA, six languages including right-to-left Arabic, and a live Gemini layer that degrades gracefully to a fully-functional offline engine.

The sixty-second demo opens on the command bar: type "gate south is closed", watch a red critical-density zone appear — and dissolve as the re-balancer diverts the flow and Gemini reads out the new plan.

#PromptWars #BuildWithAI #Gemini #CloudRun #CrowdSafety #FIFAWorldCup2026
