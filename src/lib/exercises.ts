import type {
  EquipmentPreference,
  Exercise,
  LanguageCode,
  MovementRestriction,
  RoutineAdaptation,
  TrainingLimitation,
  Weekday,
  WorkoutItem,
} from "../types";
import spanishExerciseNames from "../../public/data/exercise-directory/name-overrides.es.json";
import spanishTaxonomy from "../../public/data/exercise-directory/taxonomy.es.json";

export const DATASET_COMMIT = "7455efae41b330c265e7cd4b78dfa848e7ce5ebd";
const MEDIA_ROOT = `https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/${DATASET_COMMIT}`;

export function mediaUrl(path: string): string {
  return `${MEDIA_ROOT}/${path}`;
}

export function normalize(value: string): string {
  return value
    .trim()
    .toLocaleLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export interface ExerciseFilters {
  query: string;
  bodyPart: string;
  equipment: string;
  equipmentPreference?: EquipmentPreference;
  language?: LanguageCode;
  favoritesOnly: boolean;
  favoriteIds: Set<string>;
}

type BodyRegion = "lower-body" | "upper-body";

const BODY_REGION_PARTS: Record<BodyRegion, Set<string>> = {
  "lower-body": new Set(["upper legs", "lower legs"]),
  "upper-body": new Set(["back", "chest", "shoulders", "upper arms", "lower arms"]),
};

const BODY_REGION_ALIASES: Record<BodyRegion, string[]> = {
  "lower-body": ["lower body", "lower-body", "tren inferior", "cuerpo inferior"],
  "upper-body": ["upper body", "upper-body", "tren superior", "cuerpo superior"],
};

function bodyRegionIntent(query: string): BodyRegion | null {
  if (query.length < 3 || query.includes(" ")) return null;
  const matchingRegions = (Object.entries(BODY_REGION_ALIASES) as [BodyRegion, string[]][])
    .filter(([, aliases]) => aliases.some((alias) => normalize(alias).startsWith(query)))
    .map(([region]) => region);
  return matchingRegions.length === 1 ? matchingRegions[0] : null;
}

function belongsToBodyRegion(exercise: Exercise, region: BodyRegion): boolean {
  return BODY_REGION_PARTS[region].has(exercise.body_part);
}

function translatedTaxonomy(value: string): string {
  return spanishTaxonomy[value as keyof typeof spanishTaxonomy] ?? value;
}

const SUPPORT_EQUIPMENT_PATTERN = /\b(?:pull[\s-]?ups?|chin(?:-ups?)?|inverted rows?|hanging|bench|box|chair|lever|rings?|parallel bars?|cage|vertical bar|dip(?:s|ping)?|human flag|skin the cat|balance board|step[\s-]?ups?|stairs|tire|wheel run|hyperextension)\b/i;

export function isEquipmentFreeExercise(exercise: Exercise): boolean {
  return exercise.equipment === "body weight" && !SUPPORT_EQUIPMENT_PATTERN.test(exercise.name);
}

export function exerciseDisplayName(exercise: Exercise, language: LanguageCode): string {
  const spanishName = spanishExerciseNames[exercise.name as keyof typeof spanishExerciseNames];
  if (language === "es" && spanishName) {
    return spanishName;
  }
  return titleCase(exercise.name);
}

export function filterExercises(
  exercises: Exercise[],
  filters: ExerciseFilters,
): Exercise[] {
  const query = normalize(filters.query);
  const regionIntent = bodyRegionIntent(query);

  return exercises.filter((exercise) => {
    if (filters.equipmentPreference === "bodyweight" && !isEquipmentFreeExercise(exercise)) return false;
    if (filters.bodyPart && exercise.body_part !== filters.bodyPart) return false;
    if (filters.equipment && exercise.equipment !== filters.equipment) return false;
    if (filters.favoritesOnly && !filters.favoriteIds.has(exercise.id)) return false;
    if (!query) return true;
    if (regionIntent) return belongsToBodyRegion(exercise, regionIntent);

    const haystack = normalize([
      exercise.name,
      exerciseDisplayName(exercise, "es"),
      exercise.category,
      exercise.target,
      exercise.muscle_group,
      exercise.body_part,
      exercise.equipment,
      ...exercise.secondary_muscles,
      translatedTaxonomy(exercise.category),
      translatedTaxonomy(exercise.target),
      translatedTaxonomy(exercise.muscle_group),
      translatedTaxonomy(exercise.body_part),
      translatedTaxonomy(exercise.equipment),
      ...exercise.secondary_muscles.map(translatedTaxonomy),
    ].join(" "));

    return haystack.includes(query);
  });
}

export function uniqueSorted(exercises: Exercise[], key: keyof Exercise): string[] {
  return Array.from(
    new Set(exercises.map((exercise) => exercise[key]).filter((value): value is string => typeof value === "string")),
  ).sort((a, b) => a.localeCompare(b));
}

export function equipmentOptionsForBodyPart(
  exercises: Exercise[],
  bodyPart: string,
): string[] {
  const matchingExercises = bodyPart
    ? exercises.filter((exercise) => exercise.body_part === bodyPart)
    : exercises;
  return uniqueSorted(matchingExercises, "equipment");
}

export function titleCase(value: string): string {
  return value.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

interface TrackMovementPreset {
  any: string[];
  bodyweight: string[];
}

const BODYWEIGHT_STRENGTH = [
  "jump squat",
  "push-up",
  "forward lunge (male)",
  "dead bug",
  "mountain climber",
  "low glute bridge on floor",
];

const TRACK_MOVEMENTS: Record<string, TrackMovementPreset> = {
  strength: {
    any: [
      "barbell full squat",
      "barbell bench press",
      "barbell deadlift",
      "pull-up",
      "dumbbell seated shoulder press",
      "dead bug",
    ],
    bodyweight: BODYWEIGHT_STRENGTH,
  },
  "weight-loss": {
    any: ["jump squat", "push-up", "pull-up", "forward lunge (male)", "dead bug", "mountain climber"],
    bodyweight: ["jump squat", "push-up", "jack jump (male)", "forward lunge (male)", "dead bug", "mountain climber"],
  },
  "muscle-gain": {
    any: [
      "dumbbell goblet squat",
      "dumbbell bench press",
      "pull-up",
      "dumbbell rear lunge",
      "dumbbell seated shoulder press",
      "dumbbell biceps curl",
    ],
    bodyweight: BODYWEIGHT_STRENGTH,
  },
  "general-fitness": {
    any: ["jump squat", "push-up", "pull-up", "forward lunge (male)", "dead bug", "jump rope"],
    bodyweight: ["jump squat", "push-up", "low glute bridge on floor", "forward lunge (male)", "dead bug", "jack jump (male)"],
  },
  endurance: {
    any: ["jump rope", "jack jump (male)", "astride jumps (male)", "push-up", "jump squat", "dead bug"],
    bodyweight: ["jack jump (male)", "astride jumps (male)", "push-up", "jump squat", "forward lunge (male)", "dead bug"],
  },
  mobility: {
    any: ["world greatest stretch", "spine stretch", "hamstring stretch", "calf stretch with hands against wall", "chest and front of shoulder stretch", "rear deltoid stretch"],
    bodyweight: ["world greatest stretch", "spine stretch", "hamstring stretch", "calf stretch with hands against wall", "chest and front of shoulder stretch", "rear deltoid stretch"],
  },
  "beach-volleyball": {
    any: ["jump squat", "forward lunge (male)", "bodyweight standing calf raise", "dead bug", "push-up", "chest and front of shoulder stretch"],
    bodyweight: ["jump squat", "forward lunge (male)", "bodyweight standing calf raise", "dead bug", "push-up", "chest and front of shoulder stretch"],
  },
  running: {
    any: ["forward lunge (male)", "bodyweight standing calf raise", "single leg bridge with outstretched leg", "dead bug", "runners stretch", "hamstring stretch"],
    bodyweight: ["forward lunge (male)", "bodyweight standing calf raise", "single leg bridge with outstretched leg", "dead bug", "runners stretch", "hamstring stretch"],
  },
  cycling: {
    any: ["jump squat", "forward lunge (male)", "single leg bridge with outstretched leg", "dead bug", "hamstring stretch", "calf stretch with hands against wall"],
    bodyweight: ["jump squat", "forward lunge (male)", "single leg bridge with outstretched leg", "dead bug", "hamstring stretch", "calf stretch with hands against wall"],
  },
  "mountain-biking": {
    any: ["dumbbell step-up", "dumbbell single leg deadlift", "cable standing calf raise", "dead bug", "mountain climber", "hamstring stretch"],
    bodyweight: ["forward lunge (male)", "bodyweight standing calf raise", "single leg bridge with outstretched leg", "dead bug", "mountain climber", "hamstring stretch"],
  },
  swimming: {
    any: ["cable lat pulldown full range of motion", "cable standing shoulder external rotation", "dumbbell rear lateral raise", "swimmer kicks v. 2 (male)", "dead bug", "chest and front of shoulder stretch"],
    bodyweight: ["swimmer kicks v. 2 (male)", "push-up", "dead bug", "rear deltoid stretch", "chest and front of shoulder stretch", "spine stretch"],
  },
  "tennis-padel": {
    any: ["jump squat", "forward lunge (male)", "push-up", "dead bug", "rear deltoid stretch", "chest and front of shoulder stretch"],
    bodyweight: ["jump squat", "forward lunge (male)", "push-up", "dead bug", "rear deltoid stretch", "chest and front of shoulder stretch"],
  },
  soccer: {
    any: ["jump squat", "forward lunge (male)", "bodyweight standing calf raise", "single leg bridge with outstretched leg", "dead bug", "hamstring stretch"],
    bodyweight: ["jump squat", "forward lunge (male)", "bodyweight standing calf raise", "single leg bridge with outstretched leg", "dead bug", "hamstring stretch"],
  },
};

const TRACK_PRESCRIPTIONS: Record<string, { sets: number; reps: number }> = {
  strength: { sets: 4, reps: 6 },
  "weight-loss": { sets: 3, reps: 12 },
  "muscle-gain": { sets: 3, reps: 10 },
  "general-fitness": { sets: 3, reps: 12 },
  endurance: { sets: 3, reps: 15 },
  mobility: { sets: 2, reps: 8 },
  "beach-volleyball": { sets: 3, reps: 10 },
  running: { sets: 3, reps: 12 },
  cycling: { sets: 3, reps: 12 },
  "mountain-biking": { sets: 3, reps: 12 },
  swimming: { sets: 3, reps: 12 },
  "tennis-padel": { sets: 3, reps: 10 },
  soccer: { sets: 3, reps: 10 },
};

export const WEEKDAYS: Weekday[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

export function generateTrackWorkout(
  exercises: Exercise[],
  track: { focus: string; equipment: string; daysPerWeek?: number; trainingDays?: Weekday[] },
): WorkoutItem[] {
  const eligible = track.equipment === "bodyweight"
    ? exercises.filter(isEquipmentFreeExercise)
    : exercises;
  const preset = TRACK_MOVEMENTS[track.focus];
  let preferredNames = preset
    ? track.equipment === "bodyweight" ? preset.bodyweight : preset.any
    : [];
  if (preset && track.equipment === "mixed") {
    const candidates = Array.from(new Set([...preset.any, ...preset.bodyweight]))
      .map((name) => exercises.find((exercise) => exercise.name === name))
      .filter((exercise): exercise is Exercise => Boolean(exercise));
    const equipped = candidates.filter((exercise) => exercise.equipment !== "body weight").slice(0, 3);
    const bodyweight = candidates.filter(isEquipmentFreeExercise).slice(0, 3);
    const selected = [...equipped, ...bodyweight];
    const selectedIds = new Set(selected.map((exercise) => exercise.id));
    preferredNames = [
      ...selected,
      ...candidates.filter((exercise) => !selectedIds.has(exercise.id)),
    ].slice(0, 6).map((exercise) => exercise.name);
  }
  const prescription = TRACK_PRESCRIPTIONS[track.focus] ?? { sets: 3, reps: 10 };

  return preferredNames
    .map((name) => eligible.find((exercise) => exercise.name === name))
    .filter((exercise): exercise is Exercise => Boolean(exercise))
    .map((exercise, index) => {
      const sets = track.focus === "beach-volleyball" && index === preferredNames.length - 1
        ? 2
        : prescription.sets;
      const fallbackDayCount = Math.max(1, Math.min(7, track.daysPerWeek ?? 1));
      const trainingDays = track.trainingDays?.length
        ? track.trainingDays
        : WEEKDAYS.slice(0, fallbackDayCount);
      return {
        id: `${track.focus}-${exercise.id}-${index}`,
        exerciseId: exercise.id,
        sets,
        reps: prescription.reps,
        day: trainingDays[index % trainingDays.length],
        setPlan: `${sets} × ${prescription.reps}`,
        loadKg: null,
        loadHistory: [],
      };
    });
}

const MOVEMENT_PATTERNS: Array<[MovementRestriction, RegExp]> = [
  ["impact", /\b(?:jump|rope|sprint|plyo|mountain climber|burpee|hop)\b/i],
  ["deep-knee-flexion", /\b(?:squat|lunge|leg press|step[\s-]?up|split squat)\b/i],
  ["hip-hinge", /\b(?:deadlift|hip hinge|good morning|back extension|hyperextension)\b/i],
  ["overhead", /\b(?:overhead|shoulder press|military press|handstand)\b/i],
  ["push", /\b(?:push[\s-]?up|press|dip)\b/i],
  ["pull", /\b(?:pull[\s-]?up|chin[\s-]?up|row|pulldown)\b/i],
  ["rotation", /\b(?:rotation|twist|wood chop|russian twist)\b/i],
  ["single-leg-balance", /\b(?:single leg|one leg|lunge|step[\s-]?up)\b/i],
];

export function exerciseMovementRestrictions(exercise: Exercise): MovementRestriction[] {
  const searchable = [
    exercise.name,
    exercise.category,
    exercise.body_part,
    exercise.target,
    exercise.muscle_group,
    ...exercise.secondary_muscles,
  ].join(" ");
  return MOVEMENT_PATTERNS
    .filter(([, pattern]) => pattern.test(searchable))
    .map(([restriction]) => restriction);
}

function eligibleForPreference(exercise: Exercise, equipment: string): boolean {
  return equipment !== "bodyweight" || isEquipmentFreeExercise(exercise);
}

function replacementScore(candidate: Exercise, excluded: Exercise): number {
  let score = 0;
  if (candidate.target === excluded.target) score += 6;
  if (candidate.body_part === excluded.body_part) score += 3;
  if (candidate.muscle_group === excluded.muscle_group) score += 2;
  if (candidate.category === excluded.category) score += 1;
  return score;
}

export function generateAdaptiveTrackWorkout(
  exercises: Exercise[],
  track: { focus: string; equipment: string; daysPerWeek?: number; trainingDays?: Weekday[] },
  limitations: TrainingLimitation[],
): { workout: WorkoutItem[]; adaptations: RoutineAdaptation[] } {
  const workout = generateTrackWorkout(exercises, track);
  const restricted = new Set(limitations.flatMap((limitation) => limitation.restrictedMovements));
  if (!restricted.size) return { workout, adaptations: [] };

  const exerciseById = new Map(exercises.map((exercise) => [exercise.id, exercise]));
  const usedIds = new Set(workout.map((item) => item.exerciseId));
  const adaptations: RoutineAdaptation[] = [];
  const adaptedWorkout = workout.flatMap((item) => {
    const exercise = exerciseById.get(item.exerciseId);
    if (!exercise) return [item];
    const conflicts = exerciseMovementRestrictions(exercise).filter((restriction) => restricted.has(restriction));
    if (!conflicts.length) return [item];

    usedIds.delete(exercise.id);
    const replacement = exercises
      .filter((candidate) => candidate.id !== exercise.id)
      .filter((candidate) => !usedIds.has(candidate.id))
      .filter((candidate) => eligibleForPreference(candidate, track.equipment))
      .filter((candidate) => (
        exerciseMovementRestrictions(candidate).every((restriction) => !restricted.has(restriction))
      ))
      .map((candidate, index) => ({
        candidate,
        index,
        score: replacementScore(candidate, exercise),
      }))
      .filter(({ score }) => score > 0)
      .sort((left, right) => right.score - left.score || left.index - right.index)[0]?.candidate;

    adaptations.push({
      excludedExerciseId: exercise.id,
      replacementExerciseId: replacement?.id ?? null,
      restrictions: conflicts,
    });
    if (!replacement) return [];

    usedIds.add(replacement.id);
    return [{
      ...item,
      id: `${item.id ?? exercise.id}-adapted-${replacement.id}`,
      exerciseId: replacement.id,
    }];
  });

  return { workout: adaptedWorkout, adaptations };
}

function matchesWorkoutItem(item: WorkoutItem, itemId: string): boolean {
  return (item.id ?? item.exerciseId) === itemId;
}

export function updateWorkoutItem(
  workout: WorkoutItem[],
  itemId: string,
  changes: Partial<WorkoutItem>,
): WorkoutItem[] {
  return workout.map((item) => matchesWorkoutItem(item, itemId) ? { ...item, ...changes } : item);
}

export function adjustWorkoutPrescription(
  workout: WorkoutItem[],
  itemId: string,
  field: "sets" | "reps",
  delta: number,
): WorkoutItem[] {
  return workout.map((item) => {
    if (!matchesWorkoutItem(item, itemId)) return item;
    const maximum = field === "sets" ? 12 : 100;
    const nextValue = Math.min(maximum, Math.max(1, item[field] + delta));
    const sets = field === "sets" ? nextValue : item.sets;
    const reps = field === "reps" ? nextValue : item.reps;
    return { ...item, [field]: nextValue, setPlan: `${sets} × ${reps}` };
  });
}

export function logWorkoutLoad(
  workout: WorkoutItem[],
  itemId: string,
  date: string,
): WorkoutItem[] {
  return workout.map((item) => {
    if (!matchesWorkoutItem(item, itemId)) return item;
    const entry = {
      id: `${itemId}-${date}-${item.loadHistory?.length ?? 0}`,
      date,
      loadKg: item.loadKg ?? null,
      loadNote: item.loadNote,
      setPlan: item.setPlan ?? `${item.sets} × ${item.reps}`,
    };
    return { ...item, loadHistory: [...(item.loadHistory ?? []), entry] };
  });
}

export function replaceTrackWorkout<T extends { id: string; workout: WorkoutItem[] }>(
  tracks: T[],
  trackId: string,
  workout: WorkoutItem[],
): T[] {
  return tracks.map((track) => track.id === trackId ? { ...track, workout } : track);
}

export function removeTrainingTrack<T extends { id: string }>(
  tracks: T[],
  activeTrackId: string,
  trackId: string,
): { tracks: T[]; activeTrackId: string } {
  const removedIndex = tracks.findIndex((track) => track.id === trackId);
  if (removedIndex === -1) return { tracks, activeTrackId };

  const remainingTracks = tracks.filter((track) => track.id !== trackId);
  if (activeTrackId !== trackId) return { tracks: remainingTracks, activeTrackId };

  const nextActiveTrack = remainingTracks[removedIndex] ?? remainingTracks[removedIndex - 1];
  return { tracks: remainingTracks, activeTrackId: nextActiveTrack?.id ?? "" };
}

export function findExerciseAlternatives(
  exercises: Exercise[],
  currentExercise: Exercise,
  equipment: string,
  limit = 3,
  restrictedMovements: MovementRestriction[] = [],
): Exercise[] {
  const eligible = equipment === "bodyweight"
    ? exercises.filter(isEquipmentFreeExercise)
    : exercises;
  const restricted = new Set(restrictedMovements);

  return eligible
    .filter((exercise) => exercise.id !== currentExercise.id)
    .filter((exercise) => (
      exerciseMovementRestrictions(exercise).every((restriction) => !restricted.has(restriction))
    ))
    .map((exercise) => ({
      exercise,
      score:
        (exercise.target === currentExercise.target ? 3 : 0)
        + (exercise.muscle_group === currentExercise.muscle_group ? 2 : 0)
        + (exercise.body_part === currentExercise.body_part ? 1 : 0),
    }))
    .filter(({ score }) => score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, limit)
    .map(({ exercise }) => exercise);
}
