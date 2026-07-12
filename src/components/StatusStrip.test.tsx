// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { StatusStrip } from "./StatusStrip";
import { samplePlan } from "@/test/fixtures";

afterEach(cleanup);

describe("StatusStrip", () => {
  it("shows the before/after peak density and the diversion count", () => {
    render(<StatusStrip locale="en" plan={samplePlan()} />);
    expect(screen.getByText("5.2")).toBeTruthy();
    expect(screen.getByText("4.5")).toBeTruthy();
    expect(screen.getByText("25 min")).toBeTruthy();
    expect(screen.getByText("39,800")).toBeTruthy();
  });

  it("reports when the crowd does not clear within the forecast", () => {
    render(<StatusStrip locale="en" plan={samplePlan({ clearanceMinute: null })} />);
    expect(screen.getByText("Not cleared in forecast")).toBeTruthy();
  });
});
