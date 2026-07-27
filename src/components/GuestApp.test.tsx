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

    expect(screen.getByRole("link", { name: "Inicio de Repbook" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Inicio" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Ingresar" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Sign up" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Android installation instructions" })).toBeNull();
    expect(screen.queryByRole("button", { name: "iPhone installation instructions" })).toBeNull();
    expect(screen.queryByRole("heading", { name: "Training tracks" })).toBeNull();
    expect(screen.queryByRole("heading", { name: "Exercise library" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Open profile" })).toBeNull();
  });

  it("uses Spanish as the default instruction language", () => {
    render(<App />);

    expect((screen.getByLabelText("Idioma") as HTMLSelectElement).value).toBe("es");
    expect(screen.getByRole("option", { name: "Español" })).toBeTruthy();
    expect(screen.getByRole("option", { name: "English" })).toBeTruthy();
    expect(screen.getAllByRole("option")).toHaveLength(2);
    expect(screen.getByRole("heading", { name: /Entrená conintención/i })).toBeTruthy();
  });

  it("changes the public interface to English", () => {
    render(<App />);

    fireEvent.change(screen.getByLabelText("Idioma"), { target: { value: "en" } });

    expect(screen.getByRole("heading", { name: /Train withintention/i })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Login" })).toBeTruthy();
  });

  it("keeps both phone installation guides inside the login panel", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "Ingresar" }));
    expect(screen.getByText("Android")).toBeTruthy();
    expect(screen.getByText("iPhone")).toBeTruthy();
  });

  it("uses one login entry while preserving both account choices", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "Ingresar" }));
    expect(screen.getAllByRole("button", { name: "Ingresar" })).toHaveLength(2);
    expect(screen.queryByLabelText("Nombre")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Crear cuenta" }));
    expect(screen.getByRole("button", { name: "Crear mi cuenta" })).toBeTruthy();
    expect(screen.getByLabelText("Nombre")).toBeTruthy();
  });
});
