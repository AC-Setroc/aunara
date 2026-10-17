// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { HealthProfile } from "../types";
import { ProfilePanel } from "./ProfilePanel";

afterEach(cleanup);
const profile: HealthProfile = { primaryGoal: "beach-volleyball", onboardingCompleted: true, ageYears: null, metabolicSex: "unspecified", heightCm: null, currentWeightKg: null, targetWeightKg: null, waistCm: null, activityLevel: "moderate", experience: "beginner", dietaryPattern: "omnivore", allergies: "", healthNotes: "" };
function setup(healthProfile = profile, healthDataConsent = false) {
  const change = vi.fn();
  const request = vi.fn();
  render(<ProfilePanel language="es" name="Fixture" tracks={[]} activeTrackId="" favoriteCount={0} healthProfile={healthProfile} checkIns={[]} onNameChange={vi.fn()} onHealthProfileChange={change} onAddCheckIn={vi.fn()} onOpenTrack={vi.fn()} onClose={vi.fn()} healthDataConsent={healthDataConsent} onRequestHealthConsent={request} />);
  return { change, request };
}
describe("training preference editing", () => {
  it("does not migrate legacy sport on open and applies valid preferences as they change, preserving the sport", () => {
    const { change, request } = setup();
    expect(change).not.toHaveBeenCalled();
    expect((screen.getByLabelText(/¿Entrenás para un deporte/) as HTMLSelectElement).value).toBe("beach-volleyball");
    expect(screen.queryByRole("button", { name: "Guardar preferencias de entrenamiento" })).toBeNull();
    fireEvent.click(screen.getByRole("checkbox", { name: "Fuerza" }));
    fireEvent.click(screen.getByRole("checkbox", { name: "Movilidad" }));
    fireEvent.change(screen.getByLabelText("Días de entrenamiento por semana"), { target: { value: "4" } });
    fireEvent.change(screen.getByLabelText("Minutos por sesión"), { target: { value: "60" } });
    expect(change).toHaveBeenLastCalledWith(expect.objectContaining({ goals: ["strength", "mobility"], primaryGoal: "strength", sport: "beach-volleyball", trainingDaysPerWeek: 4, sessionMinutes: 60, healthNotes: "" }));
    expect(request).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Cuerpo y salud" }));
    expect(screen.queryByLabelText("Fecha de nacimiento")).toBeNull();
  });
  it("keeps invalid values local without persisting them and preserves unedited health and unknown fields", () => {
    const withHealth = { ...profile, primaryGoal: "strength" as const, goals: ["strength" as const], trainingDaysPerWeek: 3, sessionMinutes: 45, healthNotes: "original note", currentWeightKg: 82, futureField: "retained" };
    const { change } = setup(withHealth, true);
    fireEvent.change(screen.getByLabelText("Minutos por sesión"), { target: { value: "181" } });
    expect(change).not.toHaveBeenCalled();
    expect((screen.getByLabelText("Minutos por sesión") as HTMLInputElement).value).toBe("181");
    expect(screen.getByRole("status").textContent).toMatch(/Minutos por sesión|entre 15 y 180/);
    fireEvent.change(screen.getByLabelText("Minutos por sesión"), { target: { value: "50" } });
    expect(change).toHaveBeenCalledTimes(1);
    expect(change).toHaveBeenLastCalledWith(expect.objectContaining({ sessionMinutes: 50, healthNotes: "original note", currentWeightKg: 82, futureField: "retained" }));
  });
  it("offers exactly one training-experience control and persists it immediately (UAT13-22)", () => {
    const withPrefs = { ...profile, primaryGoal: "strength" as const, goals: ["strength" as const], trainingDaysPerWeek: 3, sessionMinutes: 45 };
    const { change } = setup(withPrefs, true);
    expect(screen.getAllByLabelText("Experiencia entrenando")).toHaveLength(1);
    fireEvent.change(screen.getByLabelText("Experiencia entrenando"), { target: { value: "intermediate" } });
    expect(change).toHaveBeenLastCalledWith(expect.objectContaining({ experience: "intermediate" }));
    fireEvent.click(screen.getByRole("button", { name: "Cuerpo y salud" }));
    expect(screen.queryByLabelText("Experiencia entrenando")).toBeNull();
  });
  it("reflects an external profile change instead of keeping a stale draft", () => {
    const withPrefs = { ...profile, primaryGoal: "strength" as const, goals: ["strength" as const], trainingDaysPerWeek: 3, sessionMinutes: 45 };
    const change = vi.fn();
    const view = render(<ProfilePanel language="es" name="Fixture" tracks={[]} activeTrackId="" favoriteCount={0} healthProfile={withPrefs} checkIns={[]} onNameChange={vi.fn()} onHealthProfileChange={change} onAddCheckIn={vi.fn()} onOpenTrack={vi.fn()} onClose={vi.fn()} healthDataConsent={true} />);
    expect((screen.getByLabelText("Experiencia entrenando") as HTMLSelectElement).value).toBe("beginner");
    view.rerender(<ProfilePanel language="es" name="Fixture" tracks={[]} activeTrackId="" favoriteCount={0} healthProfile={{ ...withPrefs, experience: "advanced" }} checkIns={[]} onNameChange={vi.fn()} onHealthProfileChange={change} onAddCheckIn={vi.fn()} onOpenTrack={vi.fn()} onClose={vi.fn()} healthDataConsent={true} />);
    expect((screen.getByLabelText("Experiencia entrenando") as HTMLSelectElement).value).toBe("advanced");
  });
});

describe("signing out from the profile (SDD-012)", () => {
  it("shows Salir only when a sign-out handler exists and closes the profile before signing out", () => {
    const onClose = vi.fn(); const onSignOut = vi.fn();
    const base = { language: "es" as const, name: "Fixture", tracks: [], activeTrackId: "", favoriteCount: 0, healthProfile: profile, checkIns: [], onNameChange: vi.fn(), onHealthProfileChange: vi.fn(), onAddCheckIn: vi.fn(), onOpenTrack: vi.fn(), onClose };
    const view = render(<ProfilePanel {...base} />);
    expect(screen.queryByRole("button", { name: "Salir" })).toBeNull();
    view.rerender(<ProfilePanel {...base} onSignOut={onSignOut} />);
    fireEvent.click(screen.getByRole("button", { name: "Salir" }));
    expect(onClose).toHaveBeenCalledOnce();
    expect(onSignOut).toHaveBeenCalledOnce();
    expect(screen.getByRole("button", { name: "Listo" })).toBeTruthy();
  });
});
