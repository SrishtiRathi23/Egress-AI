"use client";

import type { FormEvent } from "react";
import { RotateCcw, Send, Sparkles } from "lucide-react";
import { EXAMPLES, t, type Locale } from "@/lib/i18n/messages";

interface CommandBarProps {
  locale: Locale;
  value: string;
  loading: boolean;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onExample: (text: string) => void;
  onReset: () => void;
}

export function CommandBar({
  locale,
  value,
  loading,
  onChange,
  onSubmit,
  onExample,
  onReset,
}: CommandBarProps) {
  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onSubmit();
  }

  return (
    <section
      className="card"
      style={{ padding: "clamp(1.1rem, 2.5vw, 1.6rem)", display: "flex", flexDirection: "column", gap: "0.9rem" }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <Sparkles size={18} aria-hidden="true" color="var(--brand)" />
        <h2 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 700 }}>
          {t(locale, "commandTitle")}
        </h2>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
        <input
          className="field"
          style={{ flex: "1 1 18rem" }}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={t(locale, "commandPlaceholder")}
          aria-label={t(locale, "commandTitle")}
          disabled={loading}
        />
        <button type="submit" className="btn btn-primary" disabled={loading}>
          <Send size={16} aria-hidden="true" />
          {loading ? `${t(locale, "analysing")}…` : t(locale, "analyse")}
        </button>
        <button type="button" className="btn btn-ghost" onClick={onReset} disabled={loading}>
          <RotateCcw size={16} aria-hidden="true" />
          {t(locale, "reset")}
        </button>
      </form>

      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
        <span style={{ fontSize: "0.75rem", color: "var(--text-faint)", fontWeight: 600 }}>
          {t(locale, "tryLabel")}
        </span>
        {EXAMPLES[locale].map((example) => (
          <button
            key={example}
            type="button"
            className="pill"
            style={{ cursor: "pointer" }}
            onClick={() => onExample(example)}
            disabled={loading}
          >
            {example}
          </button>
        ))}
      </div>
    </section>
  );
}
