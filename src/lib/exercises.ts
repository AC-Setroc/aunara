import type { Exercise, Weekday, WorkoutItem } from "../types";

export const DATASET_COMMIT = "7455efae41b330c265e7cd4b78dfa848e7ce5ebd";
const MEDIA_ROOT = `https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/${DATASET_COMMIT}`;

export function mediaUrl(path: string): string {
  return `${MEDIA_ROOT}/${path}`;
}

export function normalize(value: string): string {
  return value.trim().toLocaleLowerCase();
}

export interface ExerciseFilters {
  query: string;
  bodyPart: string;
  equipment: string;
  favoritesOnly: boolean;
  favoriteIds: Set<string>;
}

export function filterExercises(
  exercises: Exercise[],
  filters: ExerciseFilters,
): Exercise[] {
  const query = normalize(filters.query);

  return exercises.filter((exercise) => {
    if (filters.bodyPart && exercise.body_part !== filters.bodyPart) return false;
    if (filters.equipment && exercise.equipment !== filters.equipment) return false;
    if (filters.favoritesOnly && !filters.favoriteIds.has(exercise.id)) return false;
    if (!query) return true;

    const haystack = [
      exercise.name,
      exercise.category,
      exercise.target,
      exercise.muscle_group,
      exercise.body_part,
      exercise.equipment,
      ...exercise.secondary_muscles,
    ]
      .join(" ")
      .toLocaleLowerCase();

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
  "pull-up",
  "inverted row",
  "forward lunge (male)",
  "dead bug",
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
    bodyweight: ["jump squat", "push-up", "pull-up", "forward lunge (male)", "dead bug", "jack jump (male)"],
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
    ? exercises.filter((exercise) => exercise.equipment === "body weight")
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
    const bodyweight = candidates.filter((exercise) => exercise.equipment === "body weight").slice(0, 3);
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
): Exercise[] {
  const eligible = equipment === "bodyweight"
    ? exercises.filter((exercise) => exercise.equipment === "body weight")
    : exercises;

  return eligible
    .filter((exercise) => exercise.id !== currentExercise.id)
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
