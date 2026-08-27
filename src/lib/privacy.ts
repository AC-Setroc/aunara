import type { RepbookCloudSnapshot } from "./cloudSnapshot";
import type { HealthDataConsentStatus, HealthProfile } from "../types";

export const LEGAL_VERSION = "1.0";
export const PRIVACY_EFFECTIVE_DATE = "2026-07-29";
export const DATA_CONTROLLER_NAME = "Alejandro Cortés Burgos";
export const DATA_CONTROLLER_EMAIL = "alejandro@ac-setroc.com";

interface PersonalDataExportInput {
  email: string;
  consentStatus: HealthDataConsentStatus | null;
  snapshot: RepbookCloudSnapshot;
  exportedAt?: string;
}

export function stripSensitiveHealthData(profile: HealthProfile): HealthProfile {
  return {
    ...profile,
    healthDataMode: "basic",
    birthDate: "",
    ageYears: null,
    metabolicSex: "unspecified",
    heightCm: null,
    currentWeightKg: null,
    targetWeightKg: null,
    waistCm: null,
    bodyFatPercent: null,
    musclePercent: null,
    visceralFatLevel: null,
    activityLevel: "moderate",
    dietaryPattern: "omnivore",
    nutritionPlanMode: "simple",
    macroMealsPerDay: 4,
    allergies: "",
    healthNotes: "",
    preferredIngredients: [],
    readinessScreen: {
      confirmed: false,
      chestPain: false,
      dizzinessOrFainting: false,
      medicallySupervisedOnly: false,
      musculoskeletalConcern: false,
    },
    limitations: [],
  };
}

export function buildPersonalDataExport({
  email,
  consentStatus,
  snapshot,
  exportedAt = new Date().toISOString(),
}: PersonalDataExportInput) {
  return {
    exportVersion: 1 as const,
    exportedAt,
    account: {
      email,
      healthDataConsent: consentStatus,
    },
    data: snapshot,
  };
}
