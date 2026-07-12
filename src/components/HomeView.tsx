"use client";

import type { ReactNode } from "react";
import { ArrowRight, Building2, MessagesSquare, Radar, Shuffle } from "lucide-react";
import { t, type Locale } from "@/lib/i18n/messages";

export interface HomeVenue {
  id: string;
  name: string;
  city: string;
  capacity: number;
}

interface HomeViewProps {
  locale: Locale;
  venues: HomeVenue[];
  onOpenConsole: () => void;
  onSelectVenue: (id: string) => void;
}

function Capability({
  icon,
  title,
  body,
}: {
  icon: ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="card" style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
      <span className="cap-icon" aria-hidden="true">
        {icon}
      </span>
      <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 700 }}>{title}</h3>
      <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.92rem", lineHeight: 1.55 }}>{body}</p>
    </div>
  );
}

export function HomeView({ locale, venues, onOpenConsole, onSelectVenue }: HomeViewProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      <section className="card home-hero" style={{ padding: "clamp(1.5rem, 4vw, 2.75rem)", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        <span className="pill" style={{ alignSelf: "flex-start" }}>
          PromptWars · Challenge 04 — Smart Stadiums &amp; Tournament Operations
        </span>
        <h1 style={{ margin: 0, fontSize: "clamp(1.9rem, 5vw, 3rem)", lineHeight: 1.05, fontWeight: 800, letterSpacing: "-0.02em", maxWidth: "18ch" }}>
          Solve the deadly <span className="brand-text">fifteen minutes</span> after full-time.
        </h1>
        <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "clamp(1rem, 2.2vw, 1.15rem)", maxWidth: "60ch", lineHeight: 1.6 }}>
          {t(locale, "heroBody")}
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", alignItems: "center" }}>
          <button type="button" className="btn btn-primary" onClick={onOpenConsole}>
            {t(locale, "openConsole")}
            <ArrowRight size={16} aria-hidden="true" />
          </button>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", alignItems: "center" }}>
            <span style={{ fontSize: "0.78rem", color: "var(--text-faint)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              {t(locale, "groundedIn")}
            </span>
            <span className="pill">Fruin Level of Service</span>
            <span className="pill">Little&apos;s Law</span>
            <span className="pill">Green Guide</span>
          </div>
        </div>
      </section>

      <section style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
        <h2 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 700 }}>{t(locale, "howItWorks")}</h2>
        <div className="home-grid-3">
          <Capability icon={<Radar size={20} />} title={t(locale, "capPredict")} body={t(locale, "capPredictBody")} />
          <Capability icon={<Shuffle size={20} />} title={t(locale, "capDecide")} body={t(locale, "capDecideBody")} />
          <Capability icon={<MessagesSquare size={20} />} title={t(locale, "capExplain")} body={t(locale, "capExplainBody")} />
        </div>
      </section>

      <section style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
        <h2 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 700 }}>{t(locale, "chooseVenue")}</h2>
        <div className="home-venue-grid">
          {venues.map((venue) => (
            <button key={venue.id} type="button" className="card venue-card" onClick={() => onSelectVenue(venue.id)}>
              <span className="cap-icon" aria-hidden="true">
                <Building2 size={18} />
              </span>
              <span style={{ fontSize: "1.05rem", fontWeight: 700 }}>{venue.name}</span>
              <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>{venue.city}</span>
              <span style={{ fontSize: "0.8rem", color: "var(--text-faint)" }}>
                {t(locale, "capacity")}: {venue.capacity.toLocaleString(locale)}
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", color: "var(--brand)", fontSize: "0.85rem", fontWeight: 600, marginTop: "0.25rem" }}>
                {t(locale, "enterVenue")}
                <ArrowRight size={14} aria-hidden="true" />
              </span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
