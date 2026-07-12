import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "EgressAI - Predictive Crowd Egress Console",
    template: "%s · EgressAI",
  },
  description:
    "EgressAI forecasts per-gate crowd density in the minutes after full-time and re-balances flow before a crush can form. Grounded in Fruin Level-of-Service, Little's Law, and Green Guide egress rates.",
  applicationName: "EgressAI",
  authors: [{ name: "Srishti" }],
  keywords: [
    "crowd egress",
    "stadium operations",
    "queue simulation",
    "Fruin level of service",
    "FIFA World Cup 2026",
  ],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6ece2" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

// Applies the saved (or OS-preferred) theme before first paint, so there is no
// flash and no React state to hydrate for theming.
const themeScript = `(function(){try{var t=localStorage.getItem('egress-theme');if(t!=='light'&&t!=='dark'){t=window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';}document.documentElement.dataset.theme=t;}catch(e){}})();`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        {children}
      </body>
    </html>
  );
}
