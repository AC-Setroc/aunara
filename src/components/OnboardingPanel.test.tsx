// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { HealthProfile } from "../types";
import { OnboardingPanel } from "./OnboardingPanel";

afterEach(cleanup);

const profile: HealthProfile = {
  onboardingCompleted: false,
  primaryGoal: "strength",
  equipmentPreference: "mixed",
  trainingDaysPerWeek: 3,
  sessionMinutes: 45,
  birthDate: "",
  ageYears: null,
  metabolicSex: "unspecified",
  heightCm: null,
  currentWeightKg: null,
  targetWeightKg: null,
  waistCm: null,
  activityLevel: "moderate",
  experience: "beginner",
  dietaryPattern: "omnivore",
  allergies: "",
  healthNotes: "",
};

describe("privacy-aware onboarding", () => {
  it("allows 1–3 general goals, blocks zero/four and asks for sport separately", () => {
    const onComplete = vi.fn();
    render(<OnboardingPanel language="es" name="Fixture" profile={profile} healthDataConsent={false} onComplete={onComplete} />);
    const save = screen.getByRole("button", { name: "Continuar con una ruta básica" }) as HTMLButtonElement;
    fireEvent.click(screen.getByRole("checkbox", { name: "Fuerza" }));
    expect(save.disabled).toBe(true);
    fireEvent.click(save);
    expect(onComplete).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("checkbox", { name: "Movilidad" }));
    expect(save.disabled).toBe(false);
    fireEvent.click(screen.getByRole("checkbox", { name: "Resistencia" }));
    fireEvent.click(screen.getByRole("checkbox", { name: "Fuerza" }));
    expect((screen.getByRole("checkbox", { name: "Pérdida de peso" }) as HTMLInputElement).disabled).toBe(true);
    expect(screen.queryByRole("checkbox", { name: "Natación" })).toBeNull();
    fireEvent.change(screen.getByLabelText(/¿Entrenás para un deporte/), { target: { value: "swimming" } });
    fireEvent.click(save);
    expect(onComplete).toHaveBeenCalledWith(expect.objectContaining({ goals: ["mobility", "endurance", "strength"], primaryGoal: "mobility", sport: "swimming" }));
  });
  it("offers a basic route without collecting sensitive health data", () => {
    const onComplete = vi.fn();
    render(<OnboardingPanel
      language="es"
      name="Alejandro"
      profile={profile}
      healthDataConsent={false}
      onRequestHealthConsent={vi.fn()}
      onComplete={onComplete}
    />);

    expect(screen.queryByLabelText("Fecha de nacimiento")).toBeNull();
    expect(screen.queryByLabelText("Peso actual en kilogramos")).toBeNull();
    expect(screen.getByRole("checkbox", { name: "Fuerza" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Continuar con una ruta básica" }));

    expect(onComplete).toHaveBeenCalledWith(expect.objectContaining({
      onboardingCompleted: true,
      healthDataMode: "basic",
      birthDate: "",
      currentWeightKg: null,
      healthNotes: "",
    }));
  });

  it("lets the person request health personalization instead", () => {
    const onRequestHealthConsent = vi.fn();
    render(<OnboardingPanel
      language="es"
      name="Alejandro"
      profile={profile}
      healthDataConsent={false}
      onRequestHealthConsent={onRequestHealthConsent}
      onComplete={vi.fn()}
    />);

    fireEvent.click(screen.getByRole("button", { name: "Autorizar personalización de salud" }));
    expect(onRequestHealthConsent).toHaveBeenCalledOnce();
  });
});
