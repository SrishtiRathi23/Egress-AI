import type { ReactNode } from "react";

function BrandMark() {
  return (
    <svg
      width="44"
      height="44"
      viewBox="0 0 32 32"
      role="img"
      aria-label="EgressAI logo"
    >
      <defs>
        <linearGradient
          id="heroBrand"
          x1="0"
          y1="0"
          x2="32"
          y2="32"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#22d3ee" />
          <stop offset="1" stopColor="#4f46e5" />
        </linearGradient>
      </defs>
      <rect x="1.5" y="1.5" width="29" height="29" rx="8" fill="#070b11" />
      <rect
        x="1.5"
        y="1.5"
        width="29"
        height="29"
        rx="8"
        fill="none"
        stroke="url(#heroBrand)"
        strokeWidth="1.5"
        opacity="0.55"
      />
      <rect x="7.6" y="8" width="2.6" height="16" rx="1.3" fill="url(#heroBrand)" />
      <rect x="21.8" y="8" width="2.6" height="16" rx="1.3" fill="url(#heroBrand)" />
      <path
        d="M11 16 H19 M16 12 L20 16 L16 20"
        fill="none"
        stroke="url(#heroBrand)"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function GroundingPill({ children }: { children: ReactNode }) {
  return <span className="pill">{children}</span>;
}

const RISK_BANDS: ReadonlyArray<{ label: string; varName: string }> = [
  { label: "Safe", varName: "--los-safe" },
  { label: "Comfortable", varName: "--los-comfort" },
  { label: "Moderate", varName: "--los-moderate" },
  { label: "Restricted", varName: "--los-restricted" },
  { label: "Dangerous", varName: "--los-danger" },
  { label: "Critical", varName: "--los-critical" },
];

export default function HomePage() {
  return (
    <main className="flow-field" style={{ minHeight: "100dvh" }}>
      <div
        style={{
          maxWidth: "72rem",
          margin: "0 auto",
          padding: "clamp(2rem, 6vw, 5rem) 1.5rem",
          display: "flex",
          flexDirection: "column",
          gap: "2.5rem",
        }}
      >
        <header
          style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}
        >
          <BrandMark />
          <span
            style={{ fontSize: "1.15rem", fontWeight: 700, letterSpacing: "-0.01em" }}
          >
            Egress<span className="brand-text">AI</span>
          </span>
        </header>

        <section
          className="card"
          style={{
            padding: "clamp(1.75rem, 4vw, 3rem)",
            display: "flex",
            flexDirection: "column",
            gap: "1.5rem",
          }}
        >
          <span className="pill" style={{ alignSelf: "flex-start" }}>
            PromptWars · Challenge 04 — Smart Stadiums &amp; Tournament Operations
          </span>

          <h1
            style={{
              fontSize: "clamp(2rem, 5.5vw, 3.5rem)",
              lineHeight: 1.05,
              fontWeight: 800,
              letterSpacing: "-0.02em",
              margin: 0,
              maxWidth: "20ch",
            }}
          >
            Solve the deadly{" "}
            <span className="brand-text">fifteen minutes</span> after full-time.
          </h1>

          <p
            style={{
              fontSize: "clamp(1rem, 2.2vw, 1.2rem)",
              color: "var(--text-muted)",
              maxWidth: "60ch",
              margin: 0,
              lineHeight: 1.6,
            }}
          >
            EgressAI forecasts per-gate crowd density ten minutes out and tells
            stewards exactly where to divert flow — before a crush can form. A
            deterministic simulation decides; generative AI reads the incident and
            explains the plan in plain language.
          </p>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.6rem",
              alignItems: "center",
            }}
          >
            <span
              style={{
                fontSize: "0.8rem",
                color: "var(--text-faint)",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              Grounded in
            </span>
            <GroundingPill>Fruin Level of Service</GroundingPill>
            <GroundingPill>Little&apos;s Law</GroundingPill>
            <GroundingPill>Green Guide egress rates</GroundingPill>
          </div>
        </section>

        <section
          aria-label="Level of Service density bands"
          style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
        >
          <span
            style={{
              fontSize: "0.8rem",
              color: "var(--text-faint)",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            Density risk scale (people / m²)
          </span>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
              gap: "0.5rem",
            }}
          >
            {RISK_BANDS.map((band) => (
              <div
                key={band.label}
                className="card"
                style={{
                  padding: "0.75rem 0.9rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.6rem",
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    width: "0.85rem",
                    height: "0.85rem",
                    borderRadius: "3px",
                    background: `var(${band.varName})`,
                    flexShrink: 0,
                  }}
                />
                <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>
                  {band.label}
                </span>
              </div>
            ))}
          </div>
        </section>

        <footer
          style={{
            fontSize: "0.85rem",
            color: "var(--text-faint)",
            borderTop: "1px solid var(--border)",
            paddingTop: "1.25rem",
          }}
        >
          Foundation online — the deterministic egress engine and live console
          arrive in the next build phases.
        </footer>
      </div>
    </main>
  );
}
