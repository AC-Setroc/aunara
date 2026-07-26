import type {
  HealthProfile,
  LanguageCode,
  TrainingTrack,
  WeeklyCheckIn,
} from "../types";

export interface RepbookCloudSnapshot {
  schemaVersion: 1;
  profileName: string;
  language: LanguageCode;
  favoriteIds: string[];
  tracks: TrainingTrack[];
  activeTrackId: string;
  healthProfile: HealthProfile;
  checkIns: WeeklyCheckIn[];
}

type SnapshotInput = Omit<RepbookCloudSnapshot, "schemaVersion">;
type UnknownRecord = Record<string, unknown>;

const LANGUAGES: LanguageCode[] = ["en", "es", "it", "tr", "ru", "zh", "hi", "pl", "ko", "fr"];
const TRACK_KINDS = ["goal", "sport"];
const TRACK_FOCUSES = [
  "strength",
  "muscle-gain",
  "general-fitness",
  "endurance",
  "mobility",
  "beach-volleyball",
  "running",
  "cycling",
  "tennis-padel",
  "soccer",
];
const EQUIPMENT_PREFERENCES = ["any", "bodyweight"];
const METABOLIC_SEXES = ["unspecified", "female", "male"];
const ACTIVITY_LEVELS = ["sedentary", "light", "moderate", "very-active"];
const TRAINING_EXPERIENCE = ["beginner", "intermediate", "advanced"];
const DIETARY_PATTERNS = ["omnivore", "vegetarian", "vegan", "pescatarian", "other"];

function isRecord(value: unknown): value is UnknownRecord {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isEnumValue(value: unknown, options: readonly string[]): value is string {
  return typeof value === "string" && options.includes(value);
}

function isNullableNumber(value: unknown): value is number | null {
  return value === null || (typeof value === "number" && Number.isFinite(value));
}

function isWorkoutItem(value: unknown): boolean {
  if (!isRecord(value)) return false;
  return typeof value.exerciseId === "string"
    && typeof value.sets === "number"
    && Number.isFinite(value.sets)
    && typeof value.reps === "number"
    && Number.isFinite(value.reps);
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
    && Array.isArray(value.workout)
    && value.workout.every(isWorkoutItem);
}

function isHealthProfile(value: unknown): boolean {
  if (!isRecord(value)) return false;
  return isNullableNumber(value.ageYears)
    && isEnumValue(value.metabolicSex, METABOLIC_SEXES)
    && isNullableNumber(value.heightCm)
    && isNullableNumber(value.currentWeightKg)
    && isNullableNumber(value.targetWeightKg)
    && isNullableNumber(value.waistCm)
    && isEnumValue(value.activityLevel, ACTIVITY_LEVELS)
    && isEnumValue(value.experience, TRAINING_EXPERIENCE)
    && isEnumValue(value.dietaryPattern, DIETARY_PATTERNS)
    && typeof value.allergies === "string"
    && typeof value.healthNotes === "string";
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
