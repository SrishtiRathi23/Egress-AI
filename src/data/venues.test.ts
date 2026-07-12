import { describe, expect, it } from "vitest";
import {
  DEFAULT_SIM_CONFIG,
  getNetwork,
  SAMPLE_NETWORKS,
  VENUE_META,
} from "./venues";
import { rebalance } from "@/lib/egress";

describe("sample venues", () => {
  it("are internally consistent", () => {
    for (const network of SAMPLE_NETWORKS) {
      const zoneIds = new Set(network.zones.map((zone) => zone.id));
      const gateIds = new Set(network.gates.map((gate) => gate.id));

      expect(network.zones.length).toBeGreaterThan(0);
      expect(network.gates.length).toBeGreaterThan(0);

      for (const zone of network.zones) {
        expect(zone.occupancy).toBeGreaterThan(0);
        expect(network.links.some((link) => link.zoneId === zone.id)).toBe(true);
      }
      for (const gate of network.gates) {
        expect(gate.lanes).toBeGreaterThan(0);
        expect(gate.serviceRatePerLane).toBeGreaterThan(0);
        expect(gate.widthMetres).toBeGreaterThan(0);
        expect(gate.depthMetres).toBeGreaterThan(0);
      }
      for (const link of network.links) {
        expect(zoneIds.has(link.zoneId)).toBe(true);
        expect(gateIds.has(link.gateId)).toBe(true);
        expect(link.walkMinutes).toBeGreaterThan(0);
      }
      expect(VENUE_META[network.id]).toBeDefined();
    }
  });

  it("are no worse than baseline once re-balanced", () => {
    for (const network of SAMPLE_NETWORKS) {
      const result = rebalance(network, DEFAULT_SIM_CONFIG);
      expect(result.optimisedPeakLoad).toBeLessThanOrEqual(
        result.baselinePeakLoad + 1e-9,
      );
    }
  });

  it("resolves networks by id", () => {
    expect(getNetwork("arlington")?.name).toBe("Arlington Stadium");
    expect(getNetwork("does-not-exist")).toBeUndefined();
  });
});
