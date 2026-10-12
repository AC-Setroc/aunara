// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { NavigationMenu } from "./NavigationMenu";
afterEach(cleanup);
describe("shared navigation", () => {
  it("shares one destination list and restores the trigger focus on Escape and selection", () => {
    const action = vi.fn();
    render(<NavigationMenu language="en" entries={[{ label: "Home", action }]} />);
    const logo = screen.getByRole("button", { name: "Aunara navigation" });
    const hamburger = screen.getByRole("button", { name: "Open navigation" });
    expect(logo.getAttribute("aria-controls")).toBe(hamburger.getAttribute("aria-controls"));
    fireEvent.click(logo);
    expect(logo.getAttribute("aria-expanded")).toBe("true");
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Close navigation" }));
    fireEvent.keyDown(document.activeElement!, { key: "Escape" });
    expect(document.activeElement).toBe(logo);
    fireEvent.click(hamburger);
    fireEvent.click(screen.getByRole("button", { name: "Home" }));
    expect(action).toHaveBeenCalledOnce();
    expect(document.activeElement).toBe(hamburger);
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
