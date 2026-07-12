// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GateCards } from "./GateCards";
import { samplePlan } from "@/test/fixtures";

afterEach(cleanup);

describe("GateCards", () => {
  it("renders a card for every gate with its status", () => {
    render(<GateCards locale="en" plan={samplePlan()} onToggleGate={() => {}} />);
    expect(screen.getByText("North Plaza")).toBeTruthy();
    expect(screen.getByText("South Gate")).toBeTruthy();
    // The closed gate shows the "Not cleared in forecast" label.
    expect(screen.getByText("Not cleared in forecast")).toBeTruthy();
  });

  it("calls onToggleGate with the gate id when a card is clicked", async () => {
    const onToggleGate = vi.fn();
    render(<GateCards locale="en" plan={samplePlan()} onToggleGate={onToggleGate} />);
    await userEvent.click(screen.getByRole("button", { name: /North Plaza/ }));
    expect(onToggleGate).toHaveBeenCalledWith("g-north");
  });
});
