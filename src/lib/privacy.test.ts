import { describe, expect, it } from "vitest";
import { createRepbookSnapshot } from "./cloudSnapshot";
import {
  buildPersonalDataExport,
  stripSensitiveHealthData,
} from "./privacy";

const sensitiveProfile = {
  onboardingCompleted: true,
  primaryGoal: "strength" as const,
  equipmentPreference: "mixed" as const,
  trainingDaysPerWeek: 3,
  sessionMinutes: 45,
  birthDate: "1990-01-01",
  ageYears: 36,
  metabolicSex: "male" as const,
  heightCm: 180,
  currentWeightKg: 82,
  targetWeightKg: 78,
  waistCm: 86,
  bodyFatPercent: 20,
  musclePercent: 40,
  visceralFatLevel: 8,
  activityLevel: "moderate" as const,
  experience: "intermediate" as const,
  dietaryPattern: "omnivore" as const,
  allergies: "maní",
  healthNotes: "Dolor de rodilla",
  preferredIngredients: ["Pollo"],
  readinessScreen: {
    confirmed: true,
    chestPain: false,
    dizzinessOrFainting: false,
    medicallySupervisedOnly: false,
    musculoskeletalConcern: true,
  },
  limitations: [{
    id: "knee-1",
    area: "knee" as const,
    side: "left" as const,
    status: "stable" as const,
    restrictedMovements: ["impact" as const],
    professionalGuidance: "",
    professionalReview: "not-reviewed" as const,
  }],
};

describe("privacy controls", () => {
  it("removes sensitive health data while preserving basic routine preferences", () => {
    expect(stripSensitiveHealthData(sensitiveProfile)).toMatchObject({
      onboardingCompleted: true,
      healthDataMode: "basic",
      primaryGoal: "strength",
      equipmentPreference: "mixed",
      trainingDaysPerWeek: 3,
      sessionMinutes: 45,
      birthDate: "",
      ageYears: null,
      heightCm: null,
      currentWeightKg: null,
      targetWeightKg: null,
      waistCm: null,
      bodyFatPercent: null,
      musclePercent: null,
      visceralFatLevel: null,
      allergies: "",
      healthNotes: "",
      preferredIngredients: [],
      limitations: [],
    });
  });

  it("builds a portable export containing the account context and full snapshot", () => {
    const snapshot = createRepbookSnapshot({
      profileName: "Alejandro",
      language: "es",
      favoriteIds: [],
      tracks: [],
      activeTrackId: "",
      healthProfile: sensitiveProfile,
      checkIns: [],
      tracksInitialized: false,
    });

    const exported = buildPersonalDataExport({
      email: "alejandro@example.com",
      consentStatus: "granted",
      snapshot,
      exportedAt: "2026-07-29T12:00:00.000Z",
    });

    expect(exported).toEqual({
      exportVersion: 1,
      exportedAt: "2026-07-29T12:00:00.000Z",
      account: {
        email: "alejandro@example.com",
        healthDataConsent: "granted",
      },
      data: snapshot,
    });
  });
});
