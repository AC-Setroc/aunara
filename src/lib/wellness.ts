import { tr } from "./i18n";
import type { HealthProfile, LanguageCode, TrainingTrack, WeeklyCheckIn } from "../types";

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
  "weight-loss": "Weight loss",
  "muscle-gain": "Muscle gain",
  "general-fitness": "General fitness",
  endurance: "Endurance",
  mobility: "Mobility",
  "beach-volleyball": "Beach volleyball",
  running: "Running",
  cycling: "Cycling",
  "mountain-biking": "Mountain biking (MTB)",
  swimming: "Swimming",
  "tennis-padel": "Tennis / padel",
  soccer: "Soccer",
};

function roundTo(value: number, precision = 1): number {
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
}

export function calculateAgeFromBirthDate(birthDate: string, referenceDate = new Date()): number | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(birthDate);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const parsed = new Date(year, month - 1, day);
  if (
    parsed.getFullYear() !== year
    || parsed.getMonth() !== month - 1
    || parsed.getDate() !== day
  ) return null;

  let age = referenceDate.getFullYear() - year;
  const birthdayHasPassed = referenceDate.getMonth() > month - 1
    || (referenceDate.getMonth() === month - 1 && referenceDate.getDate() >= day);
  if (!birthdayHasPassed) age -= 1;

  return age >= 0 ? age : null;
}

function formatInputDate(value: Date): string {
  return [
    value.getFullYear(),
    String(value.getMonth() + 1).padStart(2, "0"),
    String(value.getDate()).padStart(2, "0"),
  ].join("-");
}

export function adultBirthDateBounds(referenceDate = new Date()): { min: string; max: string } {
  const max = new Date(referenceDate.getFullYear() - 18, referenceDate.getMonth(), referenceDate.getDate());
  const min = new Date(referenceDate.getFullYear() - 101, referenceDate.getMonth(), referenceDate.getDate() + 1);
  return { min: formatInputDate(min), max: formatInputDate(max) };
}

export function calculateBmi(heightCm: number, weightKg: number): number | null {
  if (!Number.isFinite(heightCm) || !Number.isFinite(weightKg) || heightCm <= 0 || weightKg <= 0) return null;
  return roundTo(weightKg / ((heightCm / 100) ** 2));
}

function bmiLabel(value: number, language: LanguageCode): string {
  void value;
  return tr(language, "Numerical reference only", "Solo referencia numérica");
}

function estimateMaintenanceCalories(profile: HealthProfile): { min: number; max: number } | null {
  const { currentWeightKg, heightCm, metabolicSex, activityLevel } = profile;
  const ageYears = profile.birthDate
    ? calculateAgeFromBirthDate(profile.birthDate) ?? profile.ageYears
    : profile.ageYears;
  if (!ageYears || !currentWeightKg || !heightCm || metabolicSex === "unspecified") return null;

  const sexAdjustment = metabolicSex === "male" ? 5 : -161;
  const restingEnergy = (10 * currentWeightKg) + (6.25 * heightCm) - (5 * ageYears) + sexAdjustment;
  const maintenance = restingEnergy * ACTIVITY_FACTORS[activityLevel];
  return {
    min: Math.round((maintenance * 0.9) / 50) * 50,
    max: Math.round((maintenance * 1.1) / 50) * 50,
  };
}

function proteinPlanningFactors(profile: HealthProfile): { min: number; max: number } {
  const trainingFocusedGoals = new Set([
    "strength",
    "weight-loss",
    "muscle-gain",
    "endurance",
    "beach-volleyball",
    "running",
    "cycling",
    "mountain-biking",
    "swimming",
    "tennis-padel",
    "soccer",
  ]);
  const physicallyActive = profile.activityLevel === "moderate"
    || profile.activityLevel === "very-active"
    || (profile.primaryGoal ? trainingFocusedGoals.has(profile.primaryGoal) : false);

  return physicallyActive
    ? { min: 1.4, max: 2 }
    : { min: 1.2, max: 1.6 };
}

export function createWellnessSummary(profile: HealthProfile, language: LanguageCode = "en"): WellnessSummary {
  const bmiValue = profile.heightCm && profile.currentWeightKg
    ? calculateBmi(profile.heightCm, profile.currentWeightKg)
    : null;
  const weight = profile.currentWeightKg;
  const proteinFactors = proteinPlanningFactors(profile);

  return {
    bmi: bmiValue === null ? null : { value: bmiValue, label: bmiLabel(bmiValue, language) },
    proteinGrams: weight ? {
      min: Math.round(weight * proteinFactors.min),
      max: Math.round(weight * proteinFactors.max),
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
  language: LanguageCode = "en",
): RoutineAnalysis {
  const focus = language === "en"
    ? FOCUS_LABELS[track.focus] ?? track.focus
    : ({
      strength: "Fuerza",
      "weight-loss": "Pérdida de peso",
      "muscle-gain": "Ganancia muscular",
      "general-fitness": "Condición física general",
      endurance: "Resistencia",
      mobility: "Movilidad",
      "beach-volleyball": "Vóley playa",
      running: "Running",
      cycling: "Ciclismo",
      "mountain-biking": "Ciclismo de montaña (MTB)",
      swimming: "Natación",
      "tennis-padel": "Tenis / pádel",
      soccer: "Fútbol",
    }[track.focus] ?? track.focus);
  const points = [
    tr(
      language,
      `${focus} is the primary focus across ${track.daysPerWeek} weekly ${track.sessionMinutes}-minute sessions.`,
      `${focus} es el foco principal en ${track.daysPerWeek} sesiones semanales de ${track.sessionMinutes} minutos.`,
    ),
  ];

  if (!profile.heightCm || !profile.currentWeightKg) {
    points.push(tr(language, "Complete your body profile to add weight, recovery, and nutrition context.", "Completá tu perfil corporal para agregar contexto de peso, recuperación y nutrición."));
    return {
      tone: "setup",
      headline: tr(language, "Add context before personalizing", "Agregá contexto antes de personalizar"),
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
    points.push(tr(language, "Your latest check-in suggests limited recovery; keep intensity flexible and stop if form deteriorates.", "Tu registro reciente sugiere recuperación limitada; mantené la intensidad flexible y pará si se deteriora la técnica."));
  } else if (checkIn) {
    points.push(tr(language, "Your latest sleep, energy, and stress check-in supports the planned workload.", "Tu registro reciente de sueño, energía y estrés respalda la carga planeada."));
  } else {
    points.push(tr(language, "Add a weekly check-in so the routine can reflect sleep, energy, and stress.", "Agregá un registro semanal para que la rutina refleje sueño, energía y estrés."));
  }

  const summary = createWellnessSummary(profile, language);
  if (summary.targetDeltaKg !== null && summary.targetDeltaKg !== 0) {
    points.push(tr(language, "Use gradual body-weight trends alongside performance, waist, and recovery—not a single ideal-weight number.", "Usá tendencias graduales de peso junto con rendimiento, cintura y recuperación; no un único número de peso ideal."));
  }
  if (profile.healthNotes.trim()) {
    points.push(tr(language, "Review your saved health notes before training and replace any movement that conflicts with professional advice.", "Revisá tus notas de salud antes de entrenar y reemplazá cualquier movimiento que contradiga indicaciones profesionales."));
  }

  return {
    tone: lowRecovery ? "watch" : "ready",
    headline: lowRecovery
      ? tr(language, "Recovery needs attention", "Tu recuperación necesita atención")
      : tr(language, "Context supports this plan", "Tu contexto respalda este plan"),
    points,
  };
}

export function addWeeklyCheckIn(history: WeeklyCheckIn[], checkIn: WeeklyCheckIn): WeeklyCheckIn[] {
  return [checkIn, ...history.filter((item) => item.id !== checkIn.id)].slice(0, 26);
}
