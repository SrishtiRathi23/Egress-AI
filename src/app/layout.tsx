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
    { media: "(prefers-color-scheme: light)", color: "#f5f8fc" },
    { media: "(prefers-color-scheme: dark)", color: "#070b11" },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
