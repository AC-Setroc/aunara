// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../hooks/useCloudSync", () => ({
  useCloudSync: () => ({
    configured: true,
    email: "new-athlete@example.com",
    status: "synced",
    pendingVerification: null,
    createAccount: vi.fn(),
    verifyAccount: vi.fn(),
    resendVerification: vi.fn(),
    signIn: vi.fn(),
    signOut: vi.fn(),
  }),
}));

import App from "../App";

beforeEach(() => {
  localStorage.clear();
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
    ok: true,
    json: vi.fn().mockResolvedValue([]),
  }));
});

afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.unstubAllGlobals();
});

describe("mandatory starting profile", () => {
  it("blocks training until the user completes the personal context", async () => {
    render(<App />);

    expect(screen.getByRole("dialog", { name: "Conocé tu punto de partida" })).toBeTruthy();
    expect(screen.queryByRole("heading", { name: "Rutas de entrenamiento" })).toBeNull();
    expect(screen.getByRole("option", { name: "Pérdida de peso" })).toBeTruthy();
    expect(screen.getByRole("option", { name: /Actividad moderada.*3–5 días/ })).toBeTruthy();

    const birthDate = `${new Date().getFullYear() - 36}-01-01`;
    fireEvent.change(screen.getByLabelText("Fecha de nacimiento"), { target: { value: birthDate } });
    fireEvent.change(screen.getByLabelText("Estatura en centímetros"), { target: { value: "180" } });
    fireEvent.change(screen.getByLabelText("Peso actual en kilogramos"), { target: { value: "82" } });
    fireEvent.change(screen.getByLabelText("Objetivo principal"), { target: { value: "strength" } });
    fireEvent.change(screen.getByLabelText("Días de entrenamiento por semana"), { target: { value: "3" } });
    fireEvent.change(screen.getByLabelText("Minutos por sesión"), { target: { value: "45" } });
    fireEvent.click(screen.getByRole("button", { name: "Guardar y continuar" }));

    await waitFor(() => {
      expect(screen.queryByRole("dialog", { name: "Conocé tu punto de partida" })).toBeNull();
    });
    const storedProfile = JSON.parse(localStorage.getItem("repbook-health-profile") ?? "{}");
    expect(storedProfile).toMatchObject({
      onboardingCompleted: true,
      birthDate,
      ageYears: 36,
    });
  });
});
