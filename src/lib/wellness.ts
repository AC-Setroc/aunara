import type { HealthProfile, TrainingTrack, WeeklyCheckIn } from "../types";

export interface WellnessSummary {
  bmi: { value: number; label: string } | null;
  proteinGrams: { min: number; max: number } | null;
  hydrationLiters: { min: number; max: number } | null;
  maintenanceCalories: { min: number; max: number } | null;
  targetDeltaKg: number | null;
}

export interface RoutineAnalysis {
  tone: "ready" | "watch" | "setup";
  headline: string;
  points: string[];
}

const ACTIVITY_FACTORS = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  "very-active": 1.725,
} as const;

const FOCUS_LABELS: Record<string, string> = {
  strength: "Strength",
  "muscle-gain": "Muscle gain",
  "general-fitness": "General fitness",
  endurance: "Endurance",
  mobility: "Mobility",
  "beach-volleyball": "Beach volleyball",
  running: "Running",
  cycling: "Cycling",
  "tennis-padel": "Tennis / padel",
  soccer: "Soccer",
};

function roundTo(value: number, precision = 1): number {
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
}

export function calculateBmi(heightCm: number, weightKg: number): number | null {
  if (!Number.isFinite(heightCm) || !Number.isFinite(weightKg) || heightCm <= 0 || weightKg <= 0) return null;
  return roundTo(weightKg / ((heightCm / 100) ** 2));
}

function bmiLabel(value: number): string {
  if (value < 18.5) return "Below general reference";
  if (value < 25) return "General reference range";
  if (value < 30) return "Above general reference";
  return "Well above general reference";
}

function estimateMaintenanceCalories(profile: HealthProfile): { min: number; max: number } | null {
  const { ageYears, currentWeightKg, heightCm, metabolicSex, activityLevel } = profile;
  if (!ageYears || !currentWeightKg || !heightCm || metabolicSex === "unspecified") return null;

  const sexAdjustment = metabolicSex === "male" ? 5 : -161;
  const restingEnergy = (10 * currentWeightKg) + (6.25 * heightCm) - (5 * ageYears) + sexAdjustment;
  const maintenance = restingEnergy * ACTIVITY_FACTORS[activityLevel];
  return {
    min: Math.round((maintenance * 0.9) / 50) * 50,
    max: Math.round((maintenance * 1.1) / 50) * 50,
  };
}

export function createWellnessSummary(profile: HealthProfile): WellnessSummary {
  const bmiValue = profile.heightCm && profile.currentWeightKg
    ? calculateBmi(profile.heightCm, profile.currentWeightKg)
    : null;
  const weight = profile.currentWeightKg;

  return {
    bmi: bmiValue === null ? null : { value: bmiValue, label: bmiLabel(bmiValue) },
    proteinGrams: weight ? {
      min: Math.round(weight * 1.2),
      max: Math.round(weight * 1.6),
    } : null,
    hydrationLiters: weight ? {
      min: roundTo(weight * 0.03),
      max: roundTo(weight * 0.035),
    } : null,
    maintenanceCalories: estimateMaintenanceCalories(profile),
    targetDeltaKg: weight && profile.targetWeightKg
      ? roundTo(profile.targetWeightKg - weight)
      : null,
  };
}

export function buildRoutineAnalysis(
  track: TrainingTrack,
  profile: HealthProfile,
  checkIn?: WeeklyCheckIn,
): RoutineAnalysis {
  const focus = FOCUS_LABELS[track.focus] ?? track.focus;
  const points = [
    `${focus} is the primary focus across ${track.daysPerWeek} weekly ${track.sessionMinutes}-minute sessions.`,
  ];

  if (!profile.heightCm || !profile.currentWeightKg) {
    points.push("Complete your body profile to add weight, recovery, and nutrition context.");
    return {
      tone: "setup",
      headline: "Add context before personalizing",
      points,
    };
  }

  const lowRecovery = Boolean(
    checkIn
    && ((checkIn.sleepHours !== null && checkIn.sleepHours < 6.5)
      || checkIn.energy <= 2
      || checkIn.stress >= 4),
  );
  if (lowRecovery) {
    points.push("Your latest check-in suggests limited recovery; keep intensity flexible and stop if form deteriorates.");
  } else if (checkIn) {
    points.push("Your latest sleep, energy, and stress check-in supports the planned workload.");
  } else {
    points.push("Add a weekly check-in so the routine can reflect sleep, energy, and stress.");
  }

  const summary = createWellnessSummary(profile);
  if (summary.targetDeltaKg !== null && summary.targetDeltaKg !== 0) {
    points.push("Use gradual body-weight trends alongside performance, waist, and recovery—not a single ideal-weight number.");
  }
  if (profile.healthNotes.trim()) {
    points.push("Review your saved health notes before training and replace any movement that conflicts with professional advice.");
  }

  return {
    tone: lowRecovery ? "watch" : "ready",
    headline: lowRecovery ? "Recovery needs attention" : "Context supports this plan",
    points,
  };
}

export function addWeeklyCheckIn(history: WeeklyCheckIn[], checkIn: WeeklyCheckIn): WeeklyCheckIn[] {
  return [checkIn, ...history.filter((item) => item.id !== checkIn.id)].slice(0, 26);
}
