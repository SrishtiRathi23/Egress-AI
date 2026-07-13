"use client";

import { useCallback, useRef, useState } from "react";
import { TriangleAlert } from "lucide-react";
import { isRtl, t, type Locale } from "@/lib/i18n/messages";
import type { PlanResponse } from "@/lib/plan-types";
import { AppBar } from "./AppBar";
import { CommandBar } from "./CommandBar";
import { ForecastTimeline } from "./ForecastTimeline";
import { GateCards } from "./GateCards";
import { GateMap } from "./GateMap";
import { HomeView } from "./HomeView";
import { OrdersPanel } from "./OrdersPanel";
import { StatusStrip } from "./StatusStrip";

interface VenueOption {
  id: string;
  name: string;
  city: string;
  capacity: number;
}

type View = "home" | "console";

interface ConsoleProps {
  initialPlan: PlanResponse;
  initialNetworkId: string;
  venues: VenueOption[];
}

interface RunOptions {
  incidentText?: string;
  closedGateIds: string[];
}

export function Console({ initialPlan, initialNetworkId, venues }: ConsoleProps) {
  const [view, setView] = useState<View>("home");
  const [locale, setLocale] = useState<Locale>("en");
  const [networkId, setNetworkId] = useState(initialNetworkId);
  const [plan, setPlan] = useState(initialPlan);
  const [command, setCommand] = useState("");
  // Closed gates are only ever read and written inside handlers (the rendered
  // state comes from plan.gates), so a ref avoids needless re-renders.
  const closedGateIds = useRef<string[]>(initialPlan.closedGateIds);
  const [loading, setLoading] = useState(false);
  const [errored, setErrored] = useState(false);

  // All data fetching happens in event handlers, never in an effect.
  const runPlan = useCallback(async (id: string, options: RunOptions) => {
    setLoading(true);
    setErrored(false);
    try {
      const response = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          networkId: id,
          incidentText: options.incidentText || undefined,
          closedGateIds: options.closedGateIds,
        }),
      });
      if (!response.ok) {
        throw new Error(`plan request failed: ${response.status}`);
      }
      const data = (await response.json()) as PlanResponse;
      setPlan(data);
      closedGateIds.current = data.closedGateIds;
    } catch {
      setErrored(true);
    } finally {
      setLoading(false);
    }
  }, []);

  function handleLocale(next: Locale) {
    setLocale(next);
    if (typeof document !== "undefined") {
      document.documentElement.lang = next;
      document.documentElement.dir = isRtl(next) ? "rtl" : "ltr";
    }
  }

  function handleVenueChange(id: string) {
    setNetworkId(id);
    setCommand("");
    void runPlan(id, { closedGateIds: [] });
  }

  function handleSubmit() {
    void runPlan(networkId, { incidentText: command, closedGateIds: closedGateIds.current });
  }

  function handleExample(text: string) {
    setCommand(text);
    void runPlan(networkId, { incidentText: text, closedGateIds: closedGateIds.current });
  }

  function handleReset() {
    setCommand("");
    void runPlan(networkId, { closedGateIds: [] });
  }

  const handleToggleGate = useCallback((gateId: string) => {
    const current = closedGateIds.current;
    const next = current.includes(gateId)
      ? current.filter((id) => id !== gateId)
      : [...current, gateId];
    void runPlan(networkId, { incidentText: command || undefined, closedGateIds: next });
  }, [networkId, command, runPlan]);

  function handleOpenConsole() {
    setView("console");
  }

  function handleSelectVenueFromHome(id: string) {
    setView("console");
    if (id !== networkId) {
      handleVenueChange(id);
    }
  }

  function handleHome() {
    setView("home");
  }

  return (
    <div dir={isRtl(locale) ? "rtl" : "ltr"} className="app-shell">
      <AppBar
        locale={locale}
        networkId={networkId}
        venues={venues}
        showVenue={view === "console"}
        onHome={handleHome}
        onLocaleChange={handleLocale}
        onVenueChange={handleVenueChange}
      />

      {view === "home" ? (
        <HomeView
          locale={locale}
          venues={venues}
          onOpenConsole={handleOpenConsole}
          onSelectVenue={handleSelectVenueFromHome}
        />
      ) : (
      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        <CommandBar
          locale={locale}
          value={command}
          loading={loading}
          onChange={setCommand}
          onSubmit={handleSubmit}
          onExample={handleExample}
          onReset={handleReset}
        />

        {errored && (
          <p
            role="alert"
            className="card"
            style={{ margin: 0, padding: "0.75rem 1rem", color: "var(--los-danger)", display: "inline-flex", alignItems: "center", gap: "0.5rem", fontSize: "0.9rem" }}
          >
            <TriangleAlert size={16} aria-hidden="true" />
            {t(locale, "error")}
          </p>
        )}

        <div style={{ opacity: loading ? 0.6 : 1, transition: "opacity 0.15s ease", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <StatusStrip locale={locale} plan={plan} />

          <div className="console-grid">
            <div className="console-left">
              <GateMap locale={locale} plan={plan} onToggleGate={handleToggleGate} />
              <ForecastTimeline locale={locale} plan={plan} />
            </div>
            <OrdersPanel locale={locale} plan={plan} />
          </div>

          <GateCards locale={locale} plan={plan} onToggleGate={handleToggleGate} />
        </div>
      </div>
      )}
    </div>
  );
}
