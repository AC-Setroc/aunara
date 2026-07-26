import { describe, expect, it } from "vitest";
import * as exerciseLibrary from "./exercises";
import { filterExercises, mediaUrl, titleCase, uniqueSorted } from "./exercises";
import type { Exercise } from "../types";

const baseExercise: Exercise = {
  id: "0001",
  name: "barbell bench press",
  category: "chest",
  body_part: "chest",
  equipment: "barbell",
  target: "pectorals",
  muscle_group: "upper body",
  secondary_muscles: ["triceps"],
  instructions: { en: "", es: "", it: "", tr: "", ru: "", zh: "", hi: "", pl: "", ko: "", fr: "" },
  instruction_steps: { en: [], es: [], it: [], tr: [], ru: [], zh: [], hi: [], pl: [], ko: [], fr: [] },
  media_id: "media",
  image: "images/a.jpg",
  gif_url: "videos/a.gif",
  attribution: "© Gym visual — https://gymvisual.com/",
  created_at: "2026-01-01T00:00:00Z",
};

const squat: Exercise = {
  ...baseExercise,
  id: "0002",
  name: "bodyweight squat",
  category: "upper legs",
  body_part: "upper legs",
  equipment: "body weight",
  target: "glutes",
  secondary_muscles: ["quadriceps"],
};

const beachVolleyExercises: Exercise[] = [
  { ...squat, id: "0514", name: "jump squat", target: "glutes" },
  { ...squat, id: "3470", name: "forward lunge (male)", target: "glutes" },
  { ...squat, id: "1373", name: "bodyweight standing calf raise", body_part: "lower legs", target: "calves" },
  { ...squat, id: "0276", name: "dead bug", body_part: "waist", target: "abs" },
  { ...squat, id: "0662", name: "push-up", body_part: "chest", target: "pectorals" },
  { ...squat, id: "1271", name: "chest and front of shoulder stretch", body_part: "chest", target: "pectorals" },
  baseExercise,
];

const strengthExercises: Exercise[] = [
  { ...baseExercise, id: "0043", name: "barbell full squat", body_part: "upper legs", target: "glutes" },
  baseExercise,
  { ...baseExercise, id: "0032", name: "barbell deadlift", body_part: "upper legs", target: "glutes" },
  { ...squat, id: "0652", name: "pull-up", body_part: "back", target: "lats" },
  { ...baseExercise, id: "0405", name: "dumbbell seated shoulder press", body_part: "shoulders", target: "delts", equipment: "dumbbell" },
  { ...squat, id: "0276", name: "dead bug", body_part: "waist", target: "abs" },
];

describe("exercise helpers", () => {
  it("searches names and secondary muscles without case sensitivity", () => {
    const results = filterExercises([baseExercise, squat], {
      query: "QUAD",
      bodyPart: "",
      equipment: "",
      favoritesOnly: false,
      favoriteIds: new Set(),
    });
    expect(results.map((exercise) => exercise.id)).toEqual(["0002"]);
  });

  it("combines body-part, equipment, and favorites filters", () => {
    const results = filterExercises([baseExercise, squat], {
      query: "",
      bodyPart: "chest",
      equipment: "barbell",
      favoritesOnly: true,
      favoriteIds: new Set(["0001"]),
    });
    expect(results).toEqual([baseExercise]);
  });

  it("returns sorted unique string values", () => {
    expect(uniqueSorted([squat, baseExercise, squat], "equipment")).toEqual(["barbell", "body weight"]);
  });

  it("builds pinned source media URLs and formats labels", () => {
    expect(mediaUrl("images/a.jpg")).toContain("/7455efae41b330c265e7cd4b78dfa848e7ce5ebd/images/a.jpg");
    expect(titleCase("upper arms")).toBe("Upper Arms");
  });
});

describe("training tracks", () => {
  it("exposes a routine generator for training tracks", () => {
    const library = exerciseLibrary as Record<string, unknown>;
    expect(library.generateTrackWorkout).toBeTypeOf("function");
  });

  it("builds a unique bodyweight routine for a beach-volleyball track", () => {
    const generate = exerciseLibrary.generateTrackWorkout as unknown as (
      exercises: Exercise[],
      track: { focus: string; equipment: string },
    ) => { exerciseId: string; sets: number; reps: number }[];

    const workout = generate(beachVolleyExercises, {
      focus: "beach-volleyball",
      equipment: "bodyweight",
    });

    expect(workout).toHaveLength(6);
    expect(new Set(workout.map((item) => item.exerciseId)).size).toBe(6);
    expect(workout.map((item) => item.exerciseId)).toEqual([
      "0514",
      "3470",
      "1373",
      "0276",
      "0662",
      "1271",
    ]);
    expect(workout.every((item) => item.sets >= 2 && item.reps >= 8)).toBe(true);
  });

  it("uses strength-oriented working sets for a strength goal track", () => {
    const workout = exerciseLibrary.generateTrackWorkout(strengthExercises, {
      focus: "strength",
      equipment: "any",
    });

    expect(workout).toHaveLength(6);
    expect(workout.every((item) => item.sets === 4 && item.reps === 6)).toBe(true);
  });

  it("uses six bodyweight alternatives for an equipment-free strength track", () => {
    const bodyweightStrengthExercises: Exercise[] = [
      ...strengthExercises,
      { ...squat, id: "0514", name: "jump squat" },
      { ...squat, id: "0662", name: "push-up", body_part: "chest", target: "pectorals" },
      { ...squat, id: "0499", name: "inverted row", body_part: "back", target: "upper back" },
      { ...squat, id: "3470", name: "forward lunge (male)" },
    ];
    const workout = exerciseLibrary.generateTrackWorkout(bodyweightStrengthExercises, {
      focus: "strength",
      equipment: "bodyweight",
    });

    expect(workout).toHaveLength(6);
    expect(workout.every((item) => bodyweightStrengthExercises.find((exercise) => exercise.id === item.exerciseId)?.equipment === "body weight")).toBe(true);
  });

  it("exposes an immutable track workout updater", () => {
    const library = exerciseLibrary as Record<string, unknown>;
    expect(library.replaceTrackWorkout).toBeTypeOf("function");
  });

  it("exposes a safe training-track remover", () => {
    const library = exerciseLibrary as Record<string, unknown>;
    expect(library.removeTrainingTrack).toBeTypeOf("function");
  });

  it("selects the neighboring routine after deleting the active track", () => {
    const tracks = [{ id: "strength" }, { id: "beach" }, { id: "mobility" }];

    const result = exerciseLibrary.removeTrainingTrack(tracks, "beach", "beach");

    expect(result.tracks.map((track) => track.id)).toEqual(["strength", "mobility"]);
    expect(result.activeTrackId).toBe("mobility");
  });

  it("keeps the active routine when deleting a different track", () => {
    const tracks = [{ id: "strength" }, { id: "beach" }];

    const result = exerciseLibrary.removeTrainingTrack(tracks, "strength", "beach");

    expect(result.tracks.map((track) => track.id)).toEqual(["strength"]);
    expect(result.activeTrackId).toBe("strength");
  });

  it("leaves no active routine after deleting the final track", () => {
    const result = exerciseLibrary.removeTrainingTrack([{ id: "strength" }], "strength", "strength");

    expect(result.tracks).toEqual([]);
    expect(result.activeTrackId).toBe("");
  });

  it("updates one track without changing a simultaneous alternate track", () => {
    const goalWorkout = [{ exerciseId: "0025", sets: 4, reps: 6 }];
    const sportWorkout = [{ exerciseId: "0514", sets: 3, reps: 10 }];
    const tracks = [
      { id: "goal", name: "Strength", workout: goalWorkout },
      { id: "sport", name: "Beach volleyball", workout: sportWorkout },
    ];
    const nextWorkout = [{ exerciseId: "0032", sets: 4, reps: 6 }];

    const updated = exerciseLibrary.replaceTrackWorkout(tracks, "goal", nextWorkout);

    expect(updated[0].workout).toEqual(nextWorkout);
    expect(updated[1]).toBe(tracks[1]);
    expect(tracks[0].workout).toBe(goalWorkout);
  });

  it("exposes equipment-aware exercise alternatives", () => {
    const library = exerciseLibrary as Record<string, unknown>;
    expect(library.findExerciseAlternatives).toBeTypeOf("function");
  });

  it("suggests same-target bodyweight replacements when equipment is unavailable", () => {
    const pushUp = beachVolleyExercises.find((exercise) => exercise.id === "0662")!;
    const shoulderStretch = beachVolleyExercises.find((exercise) => exercise.id === "1271")!;
    const alternatives = (exerciseLibrary.findExerciseAlternatives as unknown as (
      exercises: Exercise[],
      exercise: Exercise,
      equipment: string,
      limit?: number,
    ) => Exercise[])([baseExercise, pushUp, shoulderStretch], baseExercise, "bodyweight", 3);

    expect(alternatives.map((exercise) => exercise.id)).toContain("0662");
    expect(alternatives.every((exercise) => exercise.id !== baseExercise.id)).toBe(true);
    expect(alternatives.every((exercise) => exercise.equipment === "body weight")).toBe(true);
  });
});
