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
  it("does not migrate legacy sport on open and preserves it after choosing general goals", () => {
    const { change, request } = setup();
    expect(change).not.toHaveBeenCalled();
    expect((screen.getByLabelText(/¿Entrenás para un deporte/) as HTMLSelectElement).value).toBe("beach-volleyball");
    const save = screen.getByRole("button", { name: "Guardar preferencias de entrenamiento" }) as HTMLButtonElement;
    expect(save.disabled).toBe(true);
    fireEvent.click(screen.getByRole("checkbox", { name: "Fuerza" }));
    fireEvent.click(screen.getByRole("checkbox", { name: "Movilidad" }));
    fireEvent.change(screen.getByLabelText("Días de entrenamiento por semana"), { target: { value: "4" } });
    fireEvent.change(screen.getByLabelText("Minutos por sesión"), { target: { value: "60" } });
    fireEvent.click(save);
    expect(change).toHaveBeenCalledWith(expect.objectContaining({ goals: ["strength", "mobility"], primaryGoal: "strength", sport: "beach-volleyball", trainingDaysPerWeek: 4, sessionMinutes: 60, healthNotes: "", currentWeightKg: null }));
    expect(request).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Cuerpo y salud" }));
    expect(screen.queryByLabelText("Fecha de nacimiento")).toBeNull();
  });
  it("keeps invalid drafts local and preserves unedited health and unknown fields on save", () => {
    const withHealth = { ...profile, primaryGoal: "strength" as const, healthNotes: "original note", currentWeightKg: 82, futureField: "retained" };
    const { change } = setup(withHealth, true);
    const save = screen.getByRole("button", { name: "Guardar preferencias de entrenamiento" }) as HTMLButtonElement;
    fireEvent.click(screen.getByRole("checkbox", { name: "Fuerza" }));
    expect(save.disabled).toBe(true);
    expect(change).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("checkbox", { name: "Resistencia" }));
    fireEvent.change(screen.getByLabelText("Minutos por sesión"), { target: { value: "181" } });
    expect(save.disabled).toBe(true);
    fireEvent.change(screen.getByLabelText("Minutos por sesión"), { target: { value: "45" } });
    fireEvent.click(save);
    expect(change).toHaveBeenCalledWith(expect.objectContaining({ healthNotes: "original note", currentWeightKg: 82, futureField: "retained" }));
  });
});
