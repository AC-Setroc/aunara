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
  fireEvent.click(screen.getByRole("button", { name: "Ingresar / crear cuenta" }));
}

describe("signed-out home", () => {
  it("shows only public navigation and hides personal training content", () => {
    render(<App />);

    expect(screen.getByRole("button", { name: "Navegación de Aunara" })).toBeTruthy();
    expect(screen.queryByRole("link", { name: "Inicio" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Ingresar" })).toBeNull();
    expect(screen.getByRole("button", { name: "Cambiar a inglés" })).toBeTruthy();
    const row = document.querySelector(".site-header .shared-navigation")!;
    expect(row.lastElementChild).toBe(screen.getByRole("button", { name: "Abrir navegación" }));
    fireEvent.click(screen.getByRole("button", { name: "Abrir navegación" }));
    expect(screen.getByRole("button", { name: "Ingresar / crear cuenta" })).toBeTruthy();
    expect(screen.queryByLabelText("Idioma")).toBeNull();
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

    expect(screen.getByRole("button", { name: "Cambiar a inglés" }).textContent?.trim()).toBe("ES");
    expect(screen.getByRole("heading", { name: /Un cuerpo preparado.*para todo lo que te importa/i })).toBeTruthy();
  });

  it("changes the public interface to English via the header language toggle", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "Cambiar a inglés" }));

    expect(screen.getByRole("button", { name: "Switch to Spanish" }).textContent?.trim()).toBe("EN");
    expect(screen.getByRole("heading", { name: /A body ready.*for what matters most/i })).toBeTruthy();
  });

  it("keeps phone installation guides in the help panel, separate from login", () => {
    render(<App />);

    openLogin();
    expect(screen.queryByText("Android")).toBeNull();
    expect(screen.queryByText("iPhone")).toBeNull();

    fireEvent.keyDown(window, { key: "Escape" });
    fireEvent.click(screen.getByRole("button", { name: "Abrir navegación" }));
    fireEvent.click(screen.getByRole("button", { name: "Ayuda / instalación" }));
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
