// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HomeView, type HomeVenue } from "./HomeView";

afterEach(cleanup);

const venues: HomeVenue[] = [
  { id: "arlington", name: "Arlington Stadium", city: "Arlington, TX", capacity: 80000 },
  { id: "atlanta", name: "Peachtree Dome", city: "Atlanta, GA", capacity: 71000 },
];

describe("HomeView", () => {
  it("renders the hero, capabilities and venue cards", () => {
    render(<HomeView locale="en" venues={venues} onOpenConsole={() => {}} onSelectVenue={() => {}} />);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toContain("fifteen minutes");
    expect(screen.getByText("How it works")).toBeTruthy();
    expect(screen.getByText("Arlington Stadium")).toBeTruthy();
    expect(screen.getByText("Peachtree Dome")).toBeTruthy();
  });

  it("calls onOpenConsole from the hero CTA", async () => {
    const onOpenConsole = vi.fn();
    render(<HomeView locale="en" venues={venues} onOpenConsole={onOpenConsole} onSelectVenue={() => {}} />);
    await userEvent.click(screen.getByRole("button", { name: /open the console/i }));
    expect(onOpenConsole).toHaveBeenCalledTimes(1);
  });

  it("calls onSelectVenue with the venue id when a card is clicked", async () => {
    const onSelectVenue = vi.fn();
    render(<HomeView locale="en" venues={venues} onOpenConsole={() => {}} onSelectVenue={onSelectVenue} />);
    await userEvent.click(screen.getByRole("button", { name: /Arlington Stadium/ }));
    expect(onSelectVenue).toHaveBeenCalledWith("arlington");
  });

  it("localises to Spanish", () => {
    render(<HomeView locale="es" venues={venues} onOpenConsole={() => {}} onSelectVenue={() => {}} />);
    expect(screen.getByText("Cómo funciona")).toBeTruthy();
  });
});
