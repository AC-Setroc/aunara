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
    expect(screen.getByLabelText("Objetivo principal")).toBeTruthy();
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
