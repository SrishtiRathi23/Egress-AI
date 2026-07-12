"use client";

import { CircleCheck, Radio, Sparkles } from "lucide-react";
import type { AiSource } from "@/lib/ai/config";
import { t, type Locale } from "@/lib/i18n/messages";
import type { PlanResponse } from "@/lib/plan-types";

interface OrdersPanelProps {
  locale: Locale;
  plan: PlanResponse;
}

function SourceBadge({ source, locale }: { source: AiSource; locale: Locale }) {
  const isGemini = source === "gemini";
  return (
    <span className={isGemini ? "badge badge-ai" : "badge"}>
      <Sparkles size={12} aria-hidden="true" />
      {t(locale, isGemini ? "gemini" : "deterministic")}
    </span>
  );
}

export function OrdersPanel({ locale, plan }: OrdersPanelProps) {
  return (
    <section className="card" style={{ padding: "1rem", display: "flex", flexDirection: "column", gap: "0.85rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", justifyContent: "space-between", flexWrap: "wrap" }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
          <Radio size={16} aria-hidden="true" color="var(--brand)" />
          <h2 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700 }}>{t(locale, "ordersTitle")}</h2>
        </span>
        <SourceBadge source={plan.narrationSource} locale={locale} />
      </div>

      <p
        style={{
          margin: 0,
          fontSize: "0.9rem",
          lineHeight: 1.55,
          color: "var(--text-muted)",
          whiteSpace: "pre-line",
          borderInlineStart: "3px solid var(--brand)",
          paddingInlineStart: "0.75rem",
        }}
      >
        {plan.narration}
      </p>

      {plan.orders.length === 0 ? (
        <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--los-safe)", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
          <CircleCheck size={15} aria-hidden="true" />
          {t(locale, "balanced")}
        </p>
      ) : (
        <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {plan.orders.map((order) => (
            <li
              key={order.zoneId}
              style={{
                fontSize: "0.85rem",
                padding: "0.6rem 0.75rem",
                borderRadius: 10,
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
              }}
            >
              {order.message}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
