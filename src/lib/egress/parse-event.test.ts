import { describe, expect, it } from "vitest";
import { applyEvent, parseIncident } from "./parse-event";
import { gateCapacityPerStep } from "./simulate";
import type { EgressNetwork } from "./types";

describe("parseIncident", () => {
  it("detects a closed gate", () => {
    expect(parseIncident("Heads up, Gate 3 is closed")).toEqual({
      type: "gate_closed",
      gateRef: "3",
    });
  });

  it("detects a reopened gate", () => {
    expect(parseIncident("gate 5 has reopened")).toEqual({
      type: "gate_opened",
      gateRef: "5",
    });
  });

  it("detects a surge described before the gate", () => {
    expect(parseIncident("surge building at gate 2")).toEqual({
      type: "surge",
      gateRef: "2",
    });
  });

  it("detects a surge described after the gate", () => {
    expect(parseIncident("gate 4 is completely packed")).toEqual({
      type: "surge",
      gateRef: "4",
    });
  });

  it("detects minutes to the whistle", () => {
    expect(parseIncident("about 5 minutes to full time")).toEqual({
      type: "time_to_whistle",
      minutes: 5,
    });
  });

  it("returns unknown for text it cannot classify", () => {
    expect(parseIncident("everything looks calm")).toEqual({
      type: "unknown",
      text: "everything looks calm",
    });
  });
});

function network(): EgressNetwork {
  return {
    id: "n",
    name: "n",
    zones: [{ id: "z", name: "Z", occupancy: 100 }],
    gates: [
      { id: "g-north", name: "North Plaza", lanes: 10, serviceRatePerLane: 50, widthMetres: 12, depthMetres: 8 },
      { id: "g-3", name: "Marietta", lanes: 8, serviceRatePerLane: 48, widthMetres: 10, depthMetres: 7 },
    ],
    links: [{ zoneId: "z", gateId: "g-north", walkMinutes: 2 }],
  };
}

function lanesOf(net: EgressNetwork, gateId: string): number {
  return net.gates.find((g) => g.id === gateId)?.lanes ?? -1;
}

describe("applyEvent", () => {
  it("closes a gate matched by exact id", () => {
    const next = applyEvent(network(), { type: "gate_closed", gateRef: "g-north" });
    expect(lanesOf(next, "g-north")).toBe(0);
    expect(gateCapacityPerStep(next.gates[0]!, 1)).toBe(0);
  });

  it("closes a gate matched by id suffix", () => {
    const next = applyEvent(network(), { type: "gate_closed", gateRef: "3" });
    expect(lanesOf(next, "g-3")).toBe(0);
    expect(lanesOf(next, "g-north")).toBe(10);
  });

  it("closes a gate matched by name substring", () => {
    const next = applyEvent(network(), { type: "gate_closed", gateRef: "marietta" });
    expect(lanesOf(next, "g-3")).toBe(0);
  });

  it("leaves the network unchanged when no gate matches", () => {
    const next = applyEvent(network(), { type: "gate_closed", gateRef: "zzz" });
    expect(lanesOf(next, "g-north")).toBe(10);
    expect(lanesOf(next, "g-3")).toBe(8);
  });

  it("returns the network unchanged for events with no structural effect", () => {
    const original = network();
    expect(applyEvent(original, { type: "time_to_whistle", minutes: 5 })).toBe(original);
  });
});
