import type {
  HealthProfile,
  LanguageCode,
  TrainingTrack,
  WeeklyCheckIn,
} from "../types";
import { GENERAL_GOALS, SPORT_FOCUSES } from "../types";
import { SPECIAL_TECHNIQUE_OPTIONS, WORKOUT_STRUCTURE_OPTIONS } from "./workoutPrescription";

export interface RepbookCloudSnapshot {
  schemaVersion: 1;
  profileName: string;
  language: LanguageCode;
  favoriteIds: string[];
  tracks: TrainingTrack[];
  activeTrackId: string;
  healthProfile: HealthProfile;
  checkIns: WeeklyCheckIn[];
  tracksInitialized?: boolean;
}

type SnapshotInput = Omit<RepbookCloudSnapshot, "schemaVersion">;
type UnknownRecord = Record<string, unknown>;

const LANGUAGES: LanguageCode[] = ["en", "es", "it", "tr", "ru", "zh", "hi", "pl", "ko", "fr"];
const TRACK_KINDS = ["goal", "sport"];
const TRACK_FOCUSES = [
  "strength",
  "weight-loss",
  "muscle-gain",
  "general-fitness",
  "endurance",
  "mobility",
  "beach-volleyball",
  "running",
  "cycling",
  "mountain-biking",
  "swimming",
  "tennis-padel",
  "soccer",
];
const EQUIPMENT_PREFERENCES = ["any", "mixed", "bodyweight"];
const METABOLIC_SEXES = ["unspecified", "female", "male"];
const ACTIVITY_LEVELS = ["sedentary", "light", "moderate", "very-active"];
const TRAINING_EXPERIENCE = ["beginner", "intermediate", "advanced"];
const DIETARY_PATTERNS = ["omnivore", "vegetarian", "vegan", "pescatarian", "other"];
const NUTRITION_PLAN_MODES = ["simple", "macros"];
const MACRO_MEALS_PER_DAY = [3, 4, 5];
const WEEKDAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
const MOVEMENT_RESTRICTIONS = ["impact", "deep-knee-flexion", "hip-hinge", "overhead", "push", "pull", "rotation", "single-leg-balance"];
const LIMITATION_AREAS = ["knee", "hip", "lower-back", "shoulder", "elbow-wrist", "ankle-foot", "neck", "other"];
const LIMITATION_SIDES = ["left", "right", "both", "not-applicable"];
const LIMITATION_STATUSES = ["recent", "recovering", "stable"];
const PROFESSIONAL_REVIEWS = ["not-reviewed", "cleared-with-restrictions", "cleared"];

function isRecord(value: unknown): value is UnknownRecord {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isEnumValue(value: unknown, options: readonly string[]): value is string {
  return typeof value === "string" && options.includes(value);
}

function isNullableNumber(value: unknown): value is number | null {
  return value === null || (typeof value === "number" && Number.isFinite(value));
}

function isSpecialPrescription(value: unknown): boolean {
  if (!isRecord(value)) return false;
  return isEnumValue(value.technique, SPECIAL_TECHNIQUE_OPTIONS.map((option) => option.value))
    && typeof value.rounds === "number" && Number.isInteger(value.rounds) && value.rounds >= 1
    && typeof value.restBetweenRoundsSeconds === "number" && Number.isFinite(value.restBetweenRoundsSeconds) && value.restBetweenRoundsSeconds >= 0
    && Array.isArray(value.blocks) && value.blocks.length > 0 && value.blocks.every((block) => {
      if (!isRecord(block) || typeof block.id !== "string") return false;
      if (block.type === "rest") return typeof block.seconds === "number" && Number.isFinite(block.seconds) && block.seconds >= 0;
      return block.type === "work" && isEnumValue(block.target, ["reps", "technical-failure", "amrap", "time"])
        && (block.repetitionCount === undefined || isEnumValue(block.repetitionCount, ["total", "per-side"]))
        && isEnumValue(block.loadType, ["reference-percent", "same", "kg", "bodyweight"])
        && (block.value === undefined || (typeof block.value === "number" && Number.isFinite(block.value) && block.value >= 0))
        && (block.loadValue === undefined || (typeof block.loadValue === "number" && Number.isFinite(block.loadValue) && block.loadValue >= 0))
        && (block.tempo === undefined || typeof block.tempo === "string") && (block.note === undefined || typeof block.note === "string");
    });
}

function isWorkoutItem(value: unknown): boolean {
  if (!isRecord(value)) return false;
  return typeof value.exerciseId === "string"
    && typeof value.sets === "number"
    && Number.isFinite(value.sets)
    && typeof value.reps === "number"
    && Number.isFinite(value.reps)
    && (value.repetitionCount === undefined || isEnumValue(value.repetitionCount, ["total", "per-side"]))
    && (value.id === undefined || typeof value.id === "string")
    && (value.day === undefined || ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].includes(value.day as string))
    && (value.setPlan === undefined || typeof value.setPlan === "string")
    && (value.originalSetPlan === undefined || typeof value.originalSetPlan === "string")
    && (value.prescriptionMode === undefined || isEnumValue(value.prescriptionMode, ["standard", "special"]))
    && (value.specialPrescription === undefined || isSpecialPrescription(value.specialPrescription))
    && (value.structure === undefined || (isRecord(value.structure) && typeof value.structure.id === "string"
      && isEnumValue(value.structure.type, WORKOUT_STRUCTURE_OPTIONS.map((option) => option.value))
      && typeof value.structure.position === "number" && Number.isInteger(value.structure.position) && value.structure.position >= 0
      && typeof value.structure.size === "number" && Number.isInteger(value.structure.size) && value.structure.size >= 1 && value.structure.position < value.structure.size))
    && (value.loadKg === undefined || isNullableNumber(value.loadKg))
    && (value.loadNote === undefined || typeof value.loadNote === "string")
    && (value.notes === undefined || typeof value.notes === "string")
    && (value.loadHistory === undefined || (
      Array.isArray(value.loadHistory)
      && value.loadHistory.every((entry) => (
        isRecord(entry)
        && typeof entry.id === "string"
        && typeof entry.date === "string"
        && isNullableNumber(entry.loadKg)
        && (entry.loadNote === undefined || typeof entry.loadNote === "string")
        && typeof entry.setPlan === "string"
      ))
    ));
}

function isRoutineAdaptation(value: unknown): boolean {
  if (!isRecord(value)) return false;
  return typeof value.excludedExerciseId === "string"
    && (value.replacementExerciseId === null || typeof value.replacementExerciseId === "string")
    && Array.isArray(value.restrictions)
    && value.restrictions.every((item) => MOVEMENT_RESTRICTIONS.includes(item as string));
}

function isTrainingTrack(value: unknown): boolean {
  if (!isRecord(value)) return false;
  return typeof value.id === "string"
    && typeof value.name === "string"
    && isEnumValue(value.kind, TRACK_KINDS)
    && isEnumValue(value.focus, TRACK_FOCUSES)
    && isEnumValue(value.equipment, EQUIPMENT_PREFERENCES)
    && typeof value.sessionMinutes === "number"
    && Number.isFinite(value.sessionMinutes)
    && typeof value.daysPerWeek === "number"
    && Number.isFinite(value.daysPerWeek)
    && (value.trainingDays === undefined || (
      Array.isArray(value.trainingDays)
      && value.trainingDays.length > 0
      && value.trainingDays.every((day) => WEEKDAYS.includes(day as string))
    ))
    && (value.adaptations === undefined || (
      Array.isArray(value.adaptations)
      && value.adaptations.every(isRoutineAdaptation)
    ))
    && Array.isArray(value.workout)
    && value.workout.every(isWorkoutItem);
}

function isReadinessScreen(value: unknown): boolean {
  if (!isRecord(value)) return false;
  return typeof value.confirmed === "boolean"
    && typeof value.chestPain === "boolean"
    && typeof value.dizzinessOrFainting === "boolean"
    && typeof value.medicallySupervisedOnly === "boolean"
    && typeof value.musculoskeletalConcern === "boolean"
    && (value.reviewedAt === undefined || typeof value.reviewedAt === "string");
}

function isTrainingLimitation(value: unknown): boolean {
  if (!isRecord(value)) return false;
  return typeof value.id === "string"
    && isEnumValue(value.area, LIMITATION_AREAS)
    && isEnumValue(value.side, LIMITATION_SIDES)
    && isEnumValue(value.status, LIMITATION_STATUSES)
    && Array.isArray(value.restrictedMovements)
    && value.restrictedMovements.every((item) => MOVEMENT_RESTRICTIONS.includes(item as string))
    && typeof value.professionalGuidance === "string"
    && isEnumValue(value.professionalReview, PROFESSIONAL_REVIEWS)
    && (value.reviewDate === undefined || typeof value.reviewDate === "string");
}

function isHealthProfile(value: unknown): boolean {
  if (!isRecord(value)) return false;
  const validBirthDate = value.birthDate === undefined
    || (typeof value.birthDate === "string" && (value.birthDate === "" || /^\d{4}-\d{2}-\d{2}$/.test(value.birthDate)));
  return validBirthDate
    && (value.goals === undefined || (Array.isArray(value.goals)
      && value.goals.length >= 1 && value.goals.length <= 3
      && new Set(value.goals).size === value.goals.length
      && value.goals.every((goal) => isEnumValue(goal, GENERAL_GOALS))))
    && (value.sport === undefined || value.sport === null || isEnumValue(value.sport, SPORT_FOCUSES))
    && (value.equipmentPreference === undefined || isEnumValue(value.equipmentPreference, EQUIPMENT_PREFERENCES))
    && (value.trainingDaysPerWeek === undefined || (typeof value.trainingDaysPerWeek === "number"
      && Number.isInteger(value.trainingDaysPerWeek) && value.trainingDaysPerWeek >= 1 && value.trainingDaysPerWeek <= 7))
    && (value.sessionMinutes === undefined || (typeof value.sessionMinutes === "number"
      && Number.isFinite(value.sessionMinutes) && value.sessionMinutes >= 15 && value.sessionMinutes <= 180))
    && (value.healthDataMode === undefined || ["personalized", "basic"].includes(value.healthDataMode as string))
    && (value.initialRoutineDecision === undefined || ["accepted", "rejected"].includes(value.initialRoutineDecision as string))
    && isNullableNumber(value.ageYears)
    && isEnumValue(value.metabolicSex, METABOLIC_SEXES)
    && isNullableNumber(value.heightCm)
    && isNullableNumber(value.currentWeightKg)
    && isNullableNumber(value.targetWeightKg)
    && isNullableNumber(value.waistCm)
    && (value.bodyFatPercent === undefined || isNullableNumber(value.bodyFatPercent))
    && (value.musclePercent === undefined || isNullableNumber(value.musclePercent))
    && (value.visceralFatLevel === undefined || isNullableNumber(value.visceralFatLevel))
    && isEnumValue(value.activityLevel, ACTIVITY_LEVELS)
    && isEnumValue(value.experience, TRAINING_EXPERIENCE)
    && isEnumValue(value.dietaryPattern, DIETARY_PATTERNS)
    && (value.nutritionPlanMode === undefined || isEnumValue(value.nutritionPlanMode, NUTRITION_PLAN_MODES))
    && (value.macroMealsPerDay === undefined || (
      typeof value.macroMealsPerDay === "number"
      && MACRO_MEALS_PER_DAY.includes(value.macroMealsPerDay)
    ))
    && typeof value.allergies === "string"
    && typeof value.healthNotes === "string"
    && (value.readinessScreen === undefined || isReadinessScreen(value.readinessScreen))
    && (value.limitations === undefined || (
      Array.isArray(value.limitations)
      && value.limitations.every(isTrainingLimitation)
    ))
    && (value.preferredIngredients === undefined || (
      Array.isArray(value.preferredIngredients)
      && value.preferredIngredients.every((item) => typeof item === "string")
    ));
}

function isWeeklyCheckIn(value: unknown): boolean {
  if (!isRecord(value)) return false;
  return typeof value.id === "string"
    && typeof value.date === "string"
    && isNullableNumber(value.weightKg)
    && isNullableNumber(value.sleepHours)
    && typeof value.energy === "number"
    && Number.isFinite(value.energy)
    && typeof value.stress === "number"
    && Number.isFinite(value.stress)
    && typeof value.notes === "string";
}

export function createRepbookSnapshot(_input: SnapshotInput): RepbookCloudSnapshot {
  return {
    schemaVersion: 1,
    ..._input,
  };
}

export function normalizeRepbookSnapshot(
  value: unknown,
  fallback: RepbookCloudSnapshot,
): RepbookCloudSnapshot {
  if (!isRecord(value)) return fallback;

  const candidate = value;
  const valid = candidate.schemaVersion === 1
    && typeof candidate.profileName === "string"
    && isEnumValue(candidate.language, LANGUAGES)
    && Array.isArray(candidate.favoriteIds)
    && candidate.favoriteIds.every((item) => typeof item === "string")
    && Array.isArray(candidate.tracks)
    && candidate.tracks.every(isTrainingTrack)
    && typeof candidate.activeTrackId === "string"
    && (candidate.tracksInitialized === undefined || typeof candidate.tracksInitialized === "boolean")
    && isHealthProfile(candidate.healthProfile)
    && Array.isArray(candidate.checkIns)
    && candidate.checkIns.every(isWeeklyCheckIn);

  return valid ? candidate as unknown as RepbookCloudSnapshot : fallback;
}

export function selectBootstrapSnapshot(
  local: RepbookCloudSnapshot,
  remote: RepbookCloudSnapshot | null,
): { action: "upload-local" | "use-remote"; snapshot: RepbookCloudSnapshot } {
  return remote
    ? { action: "use-remote", snapshot: remote }
    : { action: "upload-local", snapshot: local };
}
