// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "../App";

vi.mock("../hooks/useCloudSync", () => ({
  useCloudSync: () => ({
    configured: true,
    email: "test@example.com",
    status: "synced",
    healthDataConsent: "granted",
    onboardingCompleted: true,
    completeOnboarding: vi.fn(),
    createAccount: vi.fn(),
    signIn: vi.fn(),
    signOut: vi.fn(),
    clearAuthError: vi.fn(),
    requestPasswordReset: vi.fn(),
  }),
}));

describe("History API Guard and Navigation", () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem("repbook-training-tracks-initialized", "true");
    localStorage.setItem("repbook-health-profile", JSON.stringify({
      onboardingCompleted: true,
      initialRoutineDecision: "accepted",
    }));
    vi.stubGlobal("fetch", vi.fn(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve([
        { id: "0001", name: "Push up", bodyPart: "chest", equipment: "body weight", target: "pectorals", gifUrl: "" },
      ]),
    })));
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("seeds history guard on startup to prevent escaping to dead IP in tab history", () => {
    const replaceStateSpy = vi.spyOn(window.history, "replaceState");
    const pushStateSpy = vi.spyOn(window.history, "pushState");

    render(<App />);

    expect(replaceStateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ aunara: true, guard: true }),
      "",
    );
    expect(pushStateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ aunara: true, section: "home" }),
      "",
    );
  });

  it("traps back-navigation when popping to the guard and re-pushes home", () => {
    const pushStateSpy = vi.spyOn(window.history, "pushState");
    render(<App />);

    pushStateSpy.mockClear();

    // Simulate Safari popping to guard (user hitting Back at root)
    act(() => {
      window.dispatchEvent(new PopStateEvent("popstate", {
        state: { aunara: true, guard: true },
      }));
    });

    expect(pushStateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ aunara: true, section: "home", overlay: null }),
      "",
    );
  });

  it("closes open profile overlay when popstate event arrives", async () => {
    render(<App />);

    // Open profile
    fireEvent.click(screen.getByRole("button", { name: /Open navigation|Abrir navegación/ }));
    fireEvent.click(screen.getByRole("button", { name: /Perfil|Profile/ }));

    expect(screen.getByRole("dialog", { name: /Mi perfil|My profile/ })).toBeTruthy();

    // Simulate browser Back
    act(() => {
      window.dispatchEvent(new PopStateEvent("popstate", {
        state: { aunara: true, section: "home", overlay: null },
      }));
    });

    expect(screen.queryByRole("dialog", { name: /Mi perfil|My profile/ })).toBeNull();
  });

  it("returns to home when popping back from library section", () => {
    render(<App />);

    // Navigate to library
    fireEvent.click(screen.getByRole("button", { name: /Open navigation|Abrir navegación/ }));
    fireEvent.click(screen.getByRole("button", { name: /Biblioteca de ejercicios|Exercise library/ }));

    expect(screen.getByRole("heading", { name: /Biblioteca de ejercicios|Exercise library/ })).toBeTruthy();

    // Simulate browser Back
    act(() => {
      window.dispatchEvent(new PopStateEvent("popstate", {
        state: { aunara: true, section: "home", overlay: null },
      }));
    });

    expect(screen.queryByRole("heading", { name: /Biblioteca de ejercicios|Exercise library/ })).toBeNull();
  });
});
