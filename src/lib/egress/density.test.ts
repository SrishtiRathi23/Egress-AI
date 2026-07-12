import { describe, expect, it } from "vitest";
import {
  areaDensity,
  CRUSH_DENSITY,
  isCrushRisk,
  levelOfService,
  riskBand,
} from "./density";

describe("areaDensity", () => {
  it("divides people by floor area", () => {
    expect(areaDensity(400, 100)).toBe(4);
    expect(areaDensity(0, 100)).toBe(0);
  });

  it("rejects a negative headcount", () => {
    expect(() => areaDensity(-1, 100)).toThrow(RangeError);
  });

  it("rejects a non-positive or non-finite area", () => {
    expect(() => areaDensity(10, 0)).toThrow(RangeError);
    expect(() => areaDensity(10, -5)).toThrow(RangeError);
    expect(() => areaDensity(10, Number.NaN)).toThrow(RangeError);
  });
});

describe("levelOfService", () => {
  it("maps each Fruin queuing band", () => {
    expect(levelOfService(0.5)).toBe("A");
    expect(levelOfService(1.0)).toBe("B");
    expect(levelOfService(1.5)).toBe("C");
    expect(levelOfService(3.0)).toBe("D");
    expect(levelOfService(4.5)).toBe("E");
    expect(levelOfService(6.0)).toBe("F");
  });

  it("treats band boundaries as inclusive upper bounds", () => {
    expect(levelOfService(0.83)).toBe("A");
    expect(levelOfService(5.0)).toBe("E");
  });

  it("rejects invalid densities", () => {
    expect(() => levelOfService(-0.1)).toThrow(RangeError);
    expect(() => levelOfService(Number.POSITIVE_INFINITY)).toThrow(RangeError);
  });
});

describe("riskBand", () => {
  it("maps each operational band", () => {
    expect(riskBand(0.5)).toBe("safe");
    expect(riskBand(1.5)).toBe("comfortable");
    expect(riskBand(2.5)).toBe("moderate");
    expect(riskBand(3.5)).toBe("restricted");
    expect(riskBand(4.5)).toBe("dangerous");
    expect(riskBand(6.0)).toBe("critical");
  });

  it("pins the dangerous boundary to the crush threshold", () => {
    expect(riskBand(CRUSH_DENSITY)).toBe("dangerous");
    expect(CRUSH_DENSITY).toBe(4);
  });

  it("rejects invalid densities", () => {
    expect(() => riskBand(-1)).toThrow(RangeError);
  });
});

describe("isCrushRisk", () => {
  it("is true only at or above the crush threshold", () => {
    expect(isCrushRisk(3.99)).toBe(false);
    expect(isCrushRisk(4)).toBe(true);
    expect(isCrushRisk(7)).toBe(true);
  });

  it("rejects invalid densities", () => {
    expect(() => isCrushRisk(Number.NaN)).toThrow(RangeError);
  });
});
