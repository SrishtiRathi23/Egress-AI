"use client";

import { LineChart } from "lucide-react";
import { CRUSH_DENSITY, MAX_DISPLAY_DENSITY } from "@/lib/egress";
import { t, type Locale } from "@/lib/i18n/messages";
import type { PlanResponse } from "@/lib/plan-types";

interface ForecastTimelineProps {
  locale: Locale;
  plan: PlanResponse;
}

const WIDTH = 800;
const HEIGHT = 220;
const PAD_X = 44;
const PAD_Y = 20;

export function ForecastTimeline({ locale, plan }: ForecastTimelineProps) {
  const points = plan.timeline;
  const lastMinute = points.at(-1)?.minute ?? 1;
  const innerW = WIDTH - PAD_X * 2;
  const innerH = HEIGHT - PAD_Y * 2;

  const xFor = (minute: number) => PAD_X + (minute / lastMinute) * innerW;
  const yFor = (density: number) =>
    PAD_Y + innerH - (Math.min(density, MAX_DISPLAY_DENSITY) / MAX_DISPLAY_DENSITY) * innerH;

  const line = points.map((p) => `${xFor(p.minute)},${yFor(p.peakDensity)}`).join(" ");
  const area =
    points.length > 0
      ? `M ${xFor(points[0]!.minute)},${PAD_Y + innerH} L ${line.split(" ").join(" L ")} L ${xFor(lastMinute)},${PAD_Y + innerH} Z`
      : "";
  const dangerY = yFor(CRUSH_DENSITY);

  return (
    <section className="card" style={{ padding: "1rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
        <LineChart size={16} aria-hidden="true" color="var(--brand)" />
        <h2 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700 }}>{t(locale, "forecastTitle")}</h2>
      </div>

      <div className="scroll-x">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} style={{ width: "100%", height: "auto", minWidth: 460 }} role="img" aria-label={t(locale, "forecastTitle")}>
          <defs>
            <linearGradient id="forecastFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="var(--brand)" stopOpacity="0.35" />
              <stop offset="1" stopColor="var(--brand)" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Y grid at 0, crush threshold, and max */}
          {[0, CRUSH_DENSITY, MAX_DISPLAY_DENSITY].map((value) => (
            <g key={value}>
              <line x1={PAD_X} y1={yFor(value)} x2={WIDTH - PAD_X} y2={yFor(value)} stroke="var(--border)" strokeWidth={1} />
              <text x={PAD_X - 8} y={yFor(value) + 4} textAnchor="end" fontSize={11} fill="var(--text-faint)">
                {value}
              </text>
            </g>
          ))}

          {/* Crush-risk threshold */}
          <line x1={PAD_X} y1={dangerY} x2={WIDTH - PAD_X} y2={dangerY} stroke="var(--los-danger)" strokeWidth={1.5} strokeDasharray="6 5" opacity={0.8} />
          <text x={WIDTH - PAD_X} y={dangerY - 6} textAnchor="end" fontSize={11} fill="var(--los-danger)" fontWeight={600}>
            {t(locale, "riskDangerous")} ({CRUSH_DENSITY}/m²)
          </text>

          {area && <path d={area} fill="url(#forecastFill)" />}
          {points.length > 0 && <polyline points={line} fill="none" stroke="var(--brand)" strokeWidth={2.5} strokeLinejoin="round" />}

          {/* X axis end labels */}
          <text x={PAD_X} y={HEIGHT - 4} fontSize={11} fill="var(--text-faint)">0 {t(locale, "min")}</text>
          <text x={WIDTH - PAD_X} y={HEIGHT - 4} textAnchor="end" fontSize={11} fill="var(--text-faint)">
            {lastMinute} {t(locale, "min")}
          </text>
        </svg>
      </div>
    </section>
  );
}
