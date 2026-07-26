import type { Exercise, WorkoutItem } from "../types";

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
  "muscle-gain": { sets: 3, reps: 10 },
  "general-fitness": { sets: 3, reps: 12 },
  endurance: { sets: 3, reps: 15 },
  mobility: { sets: 2, reps: 8 },
  "beach-volleyball": { sets: 3, reps: 10 },
  running: { sets: 3, reps: 12 },
  cycling: { sets: 3, reps: 12 },
  "tennis-padel": { sets: 3, reps: 10 },
  soccer: { sets: 3, reps: 10 },
};

export function generateTrackWorkout(
  exercises: Exercise[],
  track: { focus: string; equipment: string },
): WorkoutItem[] {
  const eligible = track.equipment === "bodyweight"
    ? exercises.filter((exercise) => exercise.equipment === "body weight")
    : exercises;
  const preset = TRACK_MOVEMENTS[track.focus];
  const preferredNames = preset
    ? track.equipment === "bodyweight" ? preset.bodyweight : preset.any
    : [];
  const prescription = TRACK_PRESCRIPTIONS[track.focus] ?? { sets: 3, reps: 10 };

  return preferredNames
    .map((name) => eligible.find((exercise) => exercise.name === name))
    .filter((exercise): exercise is Exercise => Boolean(exercise))
    .map((exercise, index) => ({
      exerciseId: exercise.id,
      sets: track.focus === "beach-volleyball" && index === preferredNames.length - 1
        ? 2
        : prescription.sets,
      reps: prescription.reps,
    }));
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
