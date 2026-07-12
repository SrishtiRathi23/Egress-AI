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
  showVenue: boolean;
  onHome: () => void;
  onLocaleChange: (locale: Locale) => void;
  onVenueChange: (networkId: string) => void;
}

function BrandMark() {
  return (
    <svg width="36" height="36" viewBox="0 0 64 64" role="img" aria-label="EgressAI">
      <defs>
        <linearGradient id="barBadge" x1="32" y1="2" x2="32" y2="62" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#141d2f" />
          <stop offset="1" stopColor="#05070d" />
        </linearGradient>
        <linearGradient id="barFlow" x1="16" y1="18" x2="50" y2="46" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#2dd4ee" />
          <stop offset="0.55" stopColor="#38bdf8" />
          <stop offset="1" stopColor="#6366f1" />
        </linearGradient>
        <radialGradient id="barGloss" cx="0.3" cy="0.1" r="0.85">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.18" />
          <stop offset="0.55" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect x="3" y="3" width="58" height="58" rx="16" fill="url(#barBadge)" />
      <rect x="3" y="3" width="58" height="58" rx="16" fill="url(#barGloss)" />
      <rect x="3.75" y="3.75" width="56.5" height="56.5" rx="15.25" fill="none" stroke="url(#barFlow)" strokeWidth="1.1" opacity="0.55" />
      <rect x="15.5" y="17" width="4.6" height="30" rx="2.3" fill="url(#barFlow)" />
      <rect x="43.9" y="17" width="4.6" height="30" rx="2.3" fill="url(#barFlow)" />
      <g fill="none" stroke="url(#barFlow)" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 24 Q31 27.5 39 25.5" strokeWidth="2.1" opacity="0.5" />
        <path d="M21 40 Q31 36.5 39 38.5" strokeWidth="2.1" opacity="0.5" />
        <path d="M22 32 H37" strokeWidth="3.6" />
        <path d="M31.5 26 L40 32 L31.5 38" strokeWidth="3.6" />
      </g>
    </svg>
  );
}

export function AppBar({
  locale,
  networkId,
  venues,
  showVenue,
  onHome,
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
      <button type="button" className="brand-button" onClick={onHome} aria-label={t(locale, "home")}>
        <BrandMark />
        <span style={{ display: "flex", flexDirection: "column", lineHeight: 1.15, textAlign: "start" }}>
          <span style={{ fontWeight: 800, fontSize: "1.05rem", letterSpacing: "-0.01em" }}>
            Egress<span className="brand-text">AI</span>
          </span>
          <span style={{ fontSize: "0.75rem", color: "var(--text-faint)" }}>
            {t(locale, "tagline")}
          </span>
        </span>
      </button>

      {showVenue && (
        <label style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
          <MapPin size={16} aria-hidden="true" color="var(--text-faint)" />
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
      )}

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
