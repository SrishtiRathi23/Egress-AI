"use client";

import type { ReactNode } from "react";
import { ArrowRight, Clock, ShieldAlert, Split, Users } from "lucide-react";
import { riskBand } from "@/lib/egress";
import { RISK_BAND_KEY, RISK_BAND_VAR, t, type Locale } from "@/lib/i18n/messages";
import type { PlanResponse } from "@/lib/plan-types";

interface StatusStripProps {
  locale: Locale;
  plan: PlanResponse;
}

function Tile({ children }: { children: ReactNode }) {
  return (
    <div className="card metric" style={{ minWidth: 0 }}>
      {children}
    </div>
  );
}

export function StatusStrip({ locale, plan }: StatusStripProps) {
  const afterBand = riskBand(plan.optimisedPeakDensity);
  const afterColour = `var(${RISK_BAND_VAR[afterBand]})`;
  const clearance =
    plan.clearanceMinute === null
      ? t(locale, "notWithin")
      : `${plan.clearanceMinute} ${t(locale, "min")}`;

  return (
    <section
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: "0.75rem",
      }}
    >
      <Tile>
        <span className="metric-label" style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
          <ShieldAlert size={13} aria-hidden="true" /> {t(locale, "peakDensity")}
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ fontSize: "1rem", color: "var(--text-faint)", textDecoration: "line-through" }}>
            {plan.baselinePeakDensity.toFixed(1)}
          </span>
          <ArrowRight size={16} aria-hidden="true" color="var(--text-faint)" />
          <span className="metric-value" style={{ color: afterColour }}>
            {plan.optimisedPeakDensity.toFixed(1)}
          </span>
          <span style={{ fontSize: "0.8rem", color: "var(--text-faint)" }}>/m²</span>
        </span>
        <span style={{ fontSize: "0.75rem", color: afterColour, fontWeight: 600 }}>
          {t(locale, RISK_BAND_KEY[afterBand])}
        </span>
      </Tile>

      <Tile>
        <span className="metric-label" style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
          <Clock size={13} aria-hidden="true" /> {t(locale, "clearance")}
        </span>
        <span className="metric-value">{clearance}</span>
      </Tile>

      <Tile>
        <span className="metric-label" style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
          <Split size={13} aria-hidden="true" /> {t(locale, "diversions")}
        </span>
        <span className="metric-value">{plan.orders.length}</span>
      </Tile>

      <Tile>
        <span className="metric-label" style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
          <Users size={13} aria-hidden="true" /> {t(locale, "people")}
        </span>
        <span className="metric-value">{plan.totalPeople.toLocaleString()}</span>
      </Tile>
    </section>
  );
}
