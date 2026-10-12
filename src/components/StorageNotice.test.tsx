// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { STORAGE_NOTICE_KEY, StorageNotice } from "./StorageNotice";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  localStorage.clear();
});

describe("informational storage notice", () => {
  it.each(["es", "en"] as const)("is non-modal, offers information and persists only recognition (%s)", (language) => {
    localStorage.setItem("repbook-health-profile", "unchanged");
    const onLearnMore = vi.fn();
    const view = render(<StorageNotice language={language} onLearnMore={onLearnMore} />);
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(screen.getByRole("complementary")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: language === "es" ? "Más información" : "Learn more" }));
    expect(onLearnMore).toHaveBeenCalledOnce();
    expect(localStorage.getItem(STORAGE_NOTICE_KEY)).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: language === "es" ? "Entendido" : "Understood" }));
    expect(screen.queryByRole("complementary")).toBeNull();
    expect(localStorage.getItem(STORAGE_NOTICE_KEY)).toBe("1");
    expect(localStorage.getItem("repbook-health-profile")).toBe("unchanged");
    expect(localStorage.length).toBe(2);
    view.unmount();
    render(<StorageNotice language={language} onLearnMore={onLearnMore} />);
    expect(screen.queryByRole("complementary")).toBeNull();
  });

  it("ignores unrecognized values without treating them as consent", () => {
    localStorage.setItem(STORAGE_NOTICE_KEY, "invalid");
    render(<StorageNotice language="en" onLearnMore={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Understood" })).toBeTruthy();
  });

  it("dismisses for the current visit when both reads and writes throw", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw new Error("denied"); });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("denied"); });
    const view = render(<StorageNotice language="en" onLearnMore={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Understood" }));
    expect(screen.queryByRole("complementary")).toBeNull();
    view.rerender(<StorageNotice language="es" onLearnMore={vi.fn()} />);
    expect(screen.queryByRole("complementary")).toBeNull();
    view.unmount();
    render(<StorageNotice language="es" onLearnMore={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Entendido" })).toBeTruthy();
  });
});
