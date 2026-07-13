"use client";

import { DoorClosed, DoorOpen } from "lucide-react";
import { RISK_BAND_KEY, RISK_BAND_VAR, t, type Locale } from "@/lib/i18n/messages";
import type { GateView, PlanResponse } from "@/lib/plan-types";

interface GateCardsProps {
  locale: Locale;
  plan: PlanResponse;
  onToggleGate: (gateId: string) => void;
}

function clearLabel(gate: GateView, locale: Locale): string {
  if (gate.closed || gate.worstClearMinutes === null) {
    return t(locale, "notWithin");
  }
  return `${t(locale, "clearsIn")} ${Math.ceil(gate.worstClearMinutes)} ${t(locale, "min")}`;
}

import { memo } from "react";

export const GateCards = memo(function GateCards({ locale, plan, onToggleGate }: GateCardsProps) {
  return (
    <section>
      <h2 style={{ fontSize: "0.95rem", fontWeight: 700, margin: "0 0 0.6rem" }}>
        {t(locale, "gatesTitle")}
      </h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))",
          gap: "0.75rem",
        }}
      >
        {plan.gates.map((gate) => {
          const colour = `var(${RISK_BAND_VAR[gate.peakRiskBand]})`;
          return (
            <button
              key={gate.id}
              type="button"
              className="card gate-card"
              onClick={() => onToggleGate(gate.id)}
              style={gate.closed ? { borderColor: "var(--los-danger)" } : undefined}
              aria-label={`${gate.name}. ${t(locale, gate.closed ? "open" : "closed")}.`}
            >
              <span style={{ height: 4, background: gate.closed ? "var(--los-danger)" : colour }} />
              <span style={{ padding: "0.85rem 0.95rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <span style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem" }}>
                  <span style={{ fontWeight: 700, fontSize: "0.92rem" }}>{gate.name}</span>
                  <span className="badge" style={{ borderColor: gate.closed ? "var(--los-danger)" : "var(--border-strong)" }}>
                    {gate.closed ? (
                      <DoorClosed size={12} aria-hidden="true" />
                    ) : (
                      <DoorOpen size={12} aria-hidden="true" />
                    )}
                    {t(locale, gate.closed ? "closed" : "open")}
                  </span>
                </span>

                <span style={{ display: "flex", alignItems: "baseline", gap: "0.4rem" }}>
                  <span style={{ fontSize: "1.7rem", fontWeight: 800, color: gate.closed ? "var(--text-faint)" : colour }}>
                    {gate.peakDensity.toFixed(1)}
                  </span>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-faint)" }}>/m²</span>
                  <span style={{ marginInlineStart: "auto", fontSize: "0.78rem", fontWeight: 600, color: colour }}>
                    {t(locale, RISK_BAND_KEY[gate.peakRiskBand])}
                  </span>
                </span>

                <span style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", color: "var(--text-muted)" }}>
                  <span>
                    {t(locale, "queue")}: {Math.round(gate.peakQueue).toLocaleString()}
                  </span>
                  <span>{clearLabel(gate, locale)}</span>
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
});
