// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../hooks/useCloudSync", () => ({
  useCloudSync: () => ({
    configured: true,
    email: null,
    status: "local",
    createAccount: vi.fn(),
    signIn: vi.fn(),
    signOut: vi.fn(),
  }),
}));

import App from "../App";

beforeEach(() => {
  localStorage.clear();
  vi.stubGlobal("fetch", vi.fn(() => new Promise(() => undefined)));
});

afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.unstubAllGlobals();
});

describe("signed-out home", () => {
  it("shows only public navigation and hides personal training content", () => {
    render(<App />);

    expect(screen.getByRole("link", { name: "Repbook home" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Home" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Log in" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Sign up" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Android installation instructions" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "iPhone installation instructions" })).toBeTruthy();
    expect(screen.queryByRole("heading", { name: "Training tracks" })).toBeNull();
    expect(screen.queryByRole("heading", { name: "Exercise library" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Open profile" })).toBeNull();
  });

  it("uses Spanish as the default instruction language", () => {
    render(<App />);

    expect((screen.getByLabelText("Instruction language") as HTMLSelectElement).value).toBe("es");
  });

  it("opens the requested phone instructions from each device icon", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "Android installation instructions" }));
    expect(screen.getByText("Android").closest("article")?.classList.contains("is-current")).toBe(true);

    fireEvent.click(screen.getByRole("button", { name: "Close access panel" }));
    fireEvent.click(screen.getByRole("button", { name: "iPhone installation instructions" }));
    expect(screen.getByText("iPhone").closest("article")?.classList.contains("is-current")).toBe(true);
  });

  it("opens log in and sign up in the corresponding account mode", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "Log in" }));
    expect(screen.getByRole("button", { name: "Sign in" })).toBeTruthy();
    expect(screen.queryByLabelText("Name")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Close access panel" }));
    fireEvent.click(screen.getByRole("button", { name: "Sign up" }));
    expect(screen.getByRole("button", { name: "Create my account" })).toBeTruthy();
    expect(screen.getByLabelText("Name")).toBeTruthy();
  });
});
