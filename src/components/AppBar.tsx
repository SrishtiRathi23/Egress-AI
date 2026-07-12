"use client";

import { Languages, MapPin } from "lucide-react";
import { LOCALES, LOCALE_META, t, type Locale } from "@/lib/i18n/messages";
import { ThemeToggle } from "./ThemeToggle";

interface VenueOption {
  id: string;
  name: string;
}

interface AppBarProps {
  locale: Locale;
  networkId: string;
  venues: VenueOption[];
  onLocaleChange: (locale: Locale) => void;
  onVenueChange: (networkId: string) => void;
}

function BrandMark() {
  return (
    <svg width="34" height="34" viewBox="0 0 32 32" role="img" aria-label="EgressAI">
      <defs>
        <linearGradient id="barBrand" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#22d3ee" />
          <stop offset="1" stopColor="#4f46e5" />
        </linearGradient>
      </defs>
      <rect x="1.5" y="1.5" width="29" height="29" rx="8" fill="#070b11" />
      <rect x="1.5" y="1.5" width="29" height="29" rx="8" fill="none" stroke="url(#barBrand)" strokeWidth="1.5" opacity="0.55" />
      <rect x="7.6" y="8" width="2.6" height="16" rx="1.3" fill="url(#barBrand)" />
      <rect x="21.8" y="8" width="2.6" height="16" rx="1.3" fill="url(#barBrand)" />
      <path d="M11 16 H19 M16 12 L20 16 L16 20" fill="none" stroke="url(#barBrand)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function AppBar({
  locale,
  networkId,
  venues,
  onLocaleChange,
  onVenueChange,
}: AppBarProps) {
  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        gap: "1rem",
        flexWrap: "wrap",
        paddingBottom: "1.25rem",
        borderBottom: "1px solid var(--border)",
        marginBottom: "1.5rem",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.65rem", marginInlineEnd: "auto" }}>
        <BrandMark />
        <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.15 }}>
          <span style={{ fontWeight: 800, fontSize: "1.05rem", letterSpacing: "-0.01em" }}>
            Egress<span className="brand-text">AI</span>
          </span>
          <span style={{ fontSize: "0.75rem", color: "var(--text-faint)" }}>
            {t(locale, "tagline")}
          </span>
        </div>
      </div>

      <label style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
        <MapPin size={16} aria-hidden="true" color="var(--text-faint)" />
        <span className="sr-only-label" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
          {t(locale, "venue")}
        </span>
        <select
          className="field"
          style={{ width: "auto" }}
          value={networkId}
          onChange={(event) => onVenueChange(event.target.value)}
          aria-label={t(locale, "venue")}
        >
          {venues.map((venue) => (
            <option key={venue.id} value={venue.id}>
              {venue.name}
            </option>
          ))}
        </select>
      </label>

      <label style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
        <Languages size={16} aria-hidden="true" color="var(--text-faint)" />
        <select
          className="field"
          style={{ width: "auto" }}
          value={locale}
          onChange={(event) => onLocaleChange(event.target.value as Locale)}
          aria-label={t(locale, "language")}
        >
          {LOCALES.map((code) => (
            <option key={code} value={code}>
              {LOCALE_META[code].label}
            </option>
          ))}
        </select>
      </label>

      <ThemeToggle label={t(locale, "theme")} />
    </header>
  );
}
