"use client";

import { Moon, Sun } from "lucide-react";

function toggleTheme() {
  const root = document.documentElement;
  const next = root.dataset.theme === "light" ? "dark" : "light";
  root.dataset.theme = next;
  try {
    localStorage.setItem("egress-theme", next);
  } catch {
    // Ignore storage failures (private mode); the toggle still applies visually.
  }
}

// Theme is applied by an inline script in the layout before paint (no flash) and
// toggled here purely through the DOM + localStorage. The visible icon is chosen
// by CSS from the data-theme attribute, so there is no React state to hydrate.
export function ThemeToggle({ label }: { label: string }) {
  return (
    <button type="button" className="theme-toggle" onClick={toggleTheme} aria-label={label}>
      <Sun className="icon-sun" size={18} aria-hidden="true" />
      <Moon className="icon-moon" size={18} aria-hidden="true" />
    </button>
  );
}
