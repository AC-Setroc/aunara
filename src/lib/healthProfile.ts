import type { HealthProfile } from "../types";

/** Initial health profile of a fresh install. Shared by App (state defaults) and cloud sync (withheld sensitive fields). */
export const DEFAULT_HEALTH_PROFILE: HealthProfile = {
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
  nutritionPlanMode: "simple",
  macroMealsPerDay: 4,
  allergies: "",
  healthNotes: "",
  readinessScreen: {
    confirmed: false,
    chestPain: false,
    dizzinessOrFainting: false,
    medicallySupervisedOnly: false,
    musculoskeletalConcern: false,
  },
  limitations: [],
};
