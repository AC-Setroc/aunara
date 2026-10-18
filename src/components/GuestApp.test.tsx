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

function openLogin() {
  fireEvent.click(screen.getByRole("button", { name: "Abrir navegación" }));
  fireEvent.click(screen.getByRole("button", { name: "Ingresar" }));
}

describe("signed-out home", () => {
  it("omits installation help only when already installed", () => {
    vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: true })));
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "Abrir navegación" }));
    expect([...document.querySelectorAll(".navigation-row")].map(row => row.textContent)).toEqual(["Ingresar"]);
  });

  it("goes home from the logo, not from the menu, and keeps help on the existing access panel", () => {
    render(<App />);
    expect(document.getElementById("top")).toBeTruthy();
    const scrollTo = vi.fn();
    vi.stubGlobal("scrollTo", scrollTo);
    fireEvent.click(screen.getByRole("button", { name: "Ir al inicio" }));
    expect(scrollTo).toHaveBeenCalled();
    expect(screen.queryByRole("dialog", { name: "Navegación" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Abrir navegación" }));
    fireEvent.click(screen.getByRole("button", { name: "Ayuda / instalación" }));
    expect(screen.getByRole("button", { name: "Ingresar" })).toBeTruthy();
    expect(screen.getByText("iPhone")).toBeTruthy();
  });
  it("shows only public navigation and hides personal training content", () => {
    render(<App />);

    expect(screen.getByRole("button", { name: "Ir al inicio" })).toBeTruthy();
    expect(screen.queryByRole("link", { name: "Inicio" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Ingresar" })).toBeNull();
    expect(screen.queryByLabelText("Idioma")).toBeNull();
    const row = document.querySelector(".site-header .shared-navigation")!;
    expect(row.children).toHaveLength(2);
    expect(row.lastElementChild).toBe(screen.getByRole("button", { name: "Abrir navegación" }));
    fireEvent.click(screen.getByRole("button", { name: "Abrir navegación" }));
    expect(screen.queryByRole("link", { name: "Inicio" })).toBeNull();
    expect([...document.querySelectorAll(".navigation-row")].map(row => row.textContent)).toEqual([
      "Ingresar", "Ayuda / instalación",
    ]);
    expect(screen.getByRole("button", { name: "Cambiar a inglés" }).getAttribute("tabindex")).toBe("0");
    expect(screen.queryByRole("combobox")).toBeNull();
    expect(screen.queryByRole("link", { name: "Rutas" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Inicio / rutas" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Idioma / configuración" })).toBeNull();
    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByRole("button", { name: "Sign up" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Android installation instructions" })).toBeNull();
    expect(screen.queryByRole("button", { name: "iPhone installation instructions" })).toBeNull();
    expect(screen.queryByRole("heading", { name: "Training tracks" })).toBeNull();
    expect(screen.queryByRole("heading", { name: "Exercise library" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Open profile" })).toBeNull();
  });

  it("uses Spanish as the default instruction language", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "Abrir navegación" }));
    expect(screen.getByRole("button", { name: "Cambiar a inglés" }).textContent).toBe("ES");
    expect(screen.queryByRole("option")).toBeNull();
    expect(screen.getByRole("heading", { name: /Un cuerpo preparado.*para todo lo que te importa/i })).toBeTruthy();
  });

  it("changes the public interface to English from inside the menu", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "Abrir navegación" }));
    const toggle = screen.getByRole("button", { name: "Cambiar a inglés" });
    toggle.focus();
    fireEvent.click(toggle);

    expect(screen.getByRole("dialog", { name: "Navigation" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Log in" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Switch to Spanish" })).toBe(toggle);
    expect(document.activeElement).toBe(toggle);
    expect(localStorage.getItem("repbook-language")).toBe('"en"');
    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.getByRole("heading", { name: /A body ready.*for what matters most/i })).toBeTruthy();
  });

  it("keeps both phone installation guides inside the login panel", () => {
    render(<App />);

    openLogin();
    expect(screen.getByText("Android")).toBeTruthy();
    expect(screen.getByText("iPhone")).toBeTruthy();
  });

  it("uses one login entry while preserving both account choices", () => {
    render(<App />);

    openLogin();
    expect(screen.getAllByRole("button", { name: "Ingresar" })).toHaveLength(1);
    expect(screen.queryByLabelText("Nombre")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Crear cuenta" }));
    expect(screen.getByRole("button", { name: "Crear mi cuenta" })).toBeTruthy();
    expect(screen.getByLabelText("Nombre")).toBeTruthy();
  });
});
