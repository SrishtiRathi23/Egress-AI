"use client";

import { DoorClosed, MapPinned } from "lucide-react";
import { RISK_BAND_VAR, t, type Locale } from "@/lib/i18n/messages";
import type { GateView, PlanResponse } from "@/lib/plan-types";

interface GateMapProps {
  locale: Locale;
  plan: PlanResponse;
  onToggleGate: (gateId: string) => void;
}

const WIDTH = 800;
const HEIGHT = 520;
const CX = WIDTH / 2;
const CY = HEIGHT / 2;
const RX = 300;
const RY = 190;

interface Placed {
  gate: GateView;
  x: number;
  y: number;
}

function place(gates: GateView[]): Placed[] {
  return gates.map((gate, index) => {
    const angle = (index / gates.length) * Math.PI * 2 - Math.PI / 2;
    return {
      gate,
      x: CX + RX * Math.cos(angle),
      y: CY + RY * Math.sin(angle),
    };
  });
}

export function GateMap({ locale, plan, onToggleGate }: GateMapProps) {
  const placed = place(plan.gates);

  return (
    <section className="card" style={{ padding: "1rem 1rem 0.5rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
        <MapPinned size={16} aria-hidden="true" color="var(--brand)" />
        <h2 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700 }}>{t(locale, "mapTitle")}</h2>
      </div>

      <div className="scroll-x">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          style={{ width: "100%", height: "auto", minWidth: 460 }}
          role="group"
          aria-label={t(locale, "mapTitle")}
        >
          {/* Pitch */}
          <ellipse cx={CX} cy={CY} rx={150} ry={92} fill="color-mix(in oklab, var(--los-safe) 12%, transparent)" stroke="var(--border-strong)" strokeWidth={1.5} />
          <line x1={CX} y1={CY - 92} x2={CX} y2={CY + 92} stroke="var(--border-strong)" strokeWidth={1} opacity={0.6} />
          <circle cx={CX} cy={CY} r={26} fill="none" stroke="var(--border-strong)" strokeWidth={1} opacity={0.6} />

          {placed.map(({ gate, x, y }) => {
            const colour = `var(${RISK_BAND_VAR[gate.peakRiskBand]})`;
            const flowWidth = gate.closed ? 0 : Math.max(1.5, Math.min(9, gate.peakQueue / 900));
            return (
              <g key={`flow-${gate.id}`}>
                <line
                  x1={CX}
                  y1={CY}
                  x2={x}
                  y2={y}
                  stroke={gate.closed ? "var(--los-danger)" : colour}
                  strokeWidth={gate.closed ? 2 : flowWidth}
                  strokeDasharray={gate.closed ? "6 6" : undefined}
                  opacity={gate.closed ? 0.7 : 0.5}
                />
              </g>
            );
          })}

          {placed.map(({ gate, x, y }) => {
            const colour = `var(${RISK_BAND_VAR[gate.peakRiskBand]})`;
            const stateLabel = gate.closed ? t(locale, "closed") : `${gate.peakDensity.toFixed(1)}/m²`;
            return (
              <g
                key={gate.id}
                transform={`translate(${x} ${y})`}
                role="button"
                tabIndex={0}
                aria-label={`${gate.name}: ${stateLabel}. ${t(locale, gate.closed ? "open" : "closed")}.`}
                style={{ cursor: "pointer" }}
                onClick={() => onToggleGate(gate.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onToggleGate(gate.id);
                  }
                }}
              >
                <circle
                  r={30}
                  fill={gate.closed ? "var(--surface-2)" : colour}
                  stroke={gate.closed ? "var(--los-danger)" : "rgba(0,0,0,0.25)"}
                  strokeWidth={gate.closed ? 2 : 1.5}
                  strokeDasharray={gate.closed ? "5 4" : undefined}
                />
                {gate.closed ? (
                  <text textAnchor="middle" dy="0.35em" fontSize={16} fill="var(--los-danger)" fontWeight={700}>
                    ×
                  </text>
                ) : (
                  <text textAnchor="middle" dy="0.35em" fontSize={13} fill="#06121d" fontWeight={800}>
                    {gate.peakDensity.toFixed(1)}
                  </text>
                )}
                <text
                  textAnchor="middle"
                  y={48}
                  fontSize={12}
                  fill="var(--text)"
                  fontWeight={600}
                  stroke="var(--bg)"
                  strokeWidth={3}
                  paintOrder="stroke"
                >
                  {gate.name}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <p style={{ fontSize: "0.78rem", color: "var(--text-faint)", margin: "0 0 0.5rem", display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
        <DoorClosed size={12} aria-hidden="true" /> {t(locale, "mapHint")}
      </p>
    </section>
  );
}
