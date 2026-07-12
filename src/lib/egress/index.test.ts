import { describe, expect, it } from "vitest";
import * as engine from "./index";

describe("engine barrel", () => {
  it("re-exports the full public API", () => {
    expect(typeof engine.simulate).toBe("function");
    expect(typeof engine.rebalance).toBe("function");
    expect(typeof engine.nearestGateAssignment).toBe("function");
    expect(typeof engine.stewardOrders).toBe("function");
    expect(typeof engine.worstClearMinutes).toBe("function");
    expect(typeof engine.parseIncident).toBe("function");
    expect(typeof engine.applyEvent).toBe("function");
    expect(typeof engine.levelOfService).toBe("function");
    expect(typeof engine.riskBand).toBe("function");
    expect(typeof engine.isCrushRisk).toBe("function");
    expect(typeof engine.areaDensity).toBe("function");
    expect(typeof engine.stepQueue).toBe("function");
    expect(typeof engine.gateArea).toBe("function");
    expect(typeof engine.gateCapacityPerStep).toBe("function");
    expect(typeof engine.estimateClearMinutes).toBe("function");
    expect(engine.CRUSH_DENSITY).toBe(4);
  });
});
