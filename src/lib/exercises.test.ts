import { describe, expect, it } from "vitest";
import * as exerciseLibrary from "./exercises";
import {
  exerciseDisplayName,
  filterExercises,
  isEquipmentFreeExercise,
  mediaUrl,
  titleCase,
  uniqueSorted,
} from "./exercises";
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

const curl: Exercise = {
  ...baseExercise,
  id: "0003",
  name: "barbell wrist curl",
  category: "lower arms",
  body_part: "lower arms",
  equipment: "barbell",
  target: "forearms",
  muscle_group: "wrist flexors",
  secondary_muscles: [],
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

const mountainBikeExercises: Exercise[] = [
  { ...squat, id: "3470", name: "forward lunge (male)" },
  { ...squat, id: "1373", name: "bodyweight standing calf raise", body_part: "lower legs", target: "calves" },
  { ...squat, id: "3645", name: "single leg bridge with outstretched leg" },
  { ...squat, id: "0276", name: "dead bug", body_part: "waist", target: "abs" },
  { ...squat, id: "0630", name: "mountain climber", body_part: "cardio", target: "cardiovascular system" },
  { ...squat, id: "1599", name: "hamstring stretch", target: "hamstrings" },
];

const swimmingExercises: Exercise[] = [
  { ...squat, id: "3433", name: "swimmer kicks v. 2 (male)" },
  { ...squat, id: "0662", name: "push-up", body_part: "chest", target: "pectorals" },
  { ...squat, id: "0276", name: "dead bug", body_part: "waist", target: "abs" },
  { ...squat, id: "2122", name: "rear deltoid stretch", body_part: "shoulders", target: "delts" },
  { ...squat, id: "1271", name: "chest and front of shoulder stretch", body_part: "chest", target: "pectorals" },
  { ...squat, id: "1942", name: "spine stretch", body_part: "back", target: "spine" },
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

  it("searches exercise categories as well as names, muscles, and equipment", () => {
    const results = filterExercises([
      baseExercise,
      { ...squat, category: "plyometrics" },
    ], {
      query: "plyometric",
      bodyPart: "",
      equipment: "",
      favoritesOnly: false,
      favoriteIds: new Set(),
    });

    expect(results.map((exercise) => exercise.id)).toEqual(["0002"]);
  });

  it("recognizes a lower-body prefix as a body-region search instead of matching every lower taxonomy", () => {
    const results = filterExercises([baseExercise, squat, curl], {
      query: "low",
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

  it("limits equipment choices to the selected body part", () => {
    expect(exerciseLibrary.equipmentOptionsForBodyPart).toBeTypeOf("function");
    if (typeof exerciseLibrary.equipmentOptionsForBodyPart !== "function") return;

    const equipment = exerciseLibrary.equipmentOptionsForBodyPart(
      [
        baseExercise,
        squat,
        { ...squat, id: "smith-squat", equipment: "smith machine" },
      ],
      "upper legs",
    );

    expect(equipment).toEqual(["body weight", "smith machine"]);
  });

  it("builds pinned source media URLs and formats labels", () => {
    expect(mediaUrl("images/a.jpg")).toContain("/7455efae41b330c265e7cd4b78dfa848e7ce5ebd/images/a.jpg");
    expect(titleCase("upper arms")).toBe("Upper Arms");
  });

  it("uses Spanish display names for movements curated by Repbook", () => {
    expect(exerciseDisplayName({ ...squat, name: "jump squat" }, "es")).toBe("Sentadilla con salto");
    expect(exerciseDisplayName({ ...squat, name: "jump squat" }, "en")).toBe("Jump Squat");
  });

  it("distinguishes floor bodyweight movements from movements that need support equipment", () => {
    expect(isEquipmentFreeExercise({ ...squat, name: "push-up" })).toBe(true);
    expect(isEquipmentFreeExercise({ ...squat, name: "pull-up" })).toBe(false);
    expect(isEquipmentFreeExercise({ ...squat, name: "inverted row" })).toBe(false);
  });

  it("applies the saved no-equipment preference to library results", () => {
    const results = filterExercises([
      { ...squat, id: "push", name: "push-up" },
      { ...squat, id: "pull", name: "pull-up" },
      baseExercise,
    ], {
      query: "",
      bodyPart: "",
      equipment: "",
      equipmentPreference: "bodyweight",
      favoritesOnly: false,
      favoriteIds: new Set(),
    });

    expect(results.map((exercise) => exercise.id)).toEqual(["push"]);
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

  it("replaces suggested movements that conflict with an explicit restriction and explains the change", () => {
    const library = exerciseLibrary as Record<string, unknown>;
    expect(library.generateAdaptiveTrackWorkout).toBeTypeOf("function");
    if (typeof library.generateAdaptiveTrackWorkout !== "function") return;

    const generate = library.generateAdaptiveTrackWorkout as (
      exercises: Exercise[],
      track: { focus: string; equipment: string; daysPerWeek?: number },
      limitations: Array<{
        restrictedMovements: string[];
      }>,
    ) => {
      workout: Array<{ exerciseId: string }>;
      adaptations: Array<{
        excludedExerciseId: string;
        replacementExerciseId: string | null;
        restrictions: string[];
      }>;
    };
    const safeBridge = {
      ...squat,
      id: "safe-bridge",
      name: "low glute bridge on floor",
      target: "glutes",
    };
    const result = generate([...strengthExercises, safeBridge], {
      focus: "strength",
      equipment: "any",
      daysPerWeek: 3,
    }, [{
      restrictedMovements: ["deep-knee-flexion"],
    }]);

    expect(result.workout.map((item) => item.exerciseId)).not.toContain("0043");
    expect(result.workout.map((item) => item.exerciseId)).toContain("safe-bridge");
    expect(result.adaptations).toContainEqual(expect.objectContaining({
      excludedExerciseId: "0043",
      replacementExerciseId: "safe-bridge",
      restrictions: ["deep-knee-flexion"],
    }));
  });

  it("uses strength-oriented working sets for a strength goal track", () => {
    const workout = exerciseLibrary.generateTrackWorkout(strengthExercises, {
      focus: "strength",
      equipment: "any",
    });

    expect(workout).toHaveLength(6);
    expect(workout.every((item) => item.sets === 4 && item.reps === 6)).toBe(true);
  });

  it("builds an editable weight-loss starting routine", () => {
    const workout = exerciseLibrary.generateTrackWorkout([
      { ...squat, id: "0514", name: "jump squat" },
      { ...squat, id: "0662", name: "push-up", body_part: "chest", target: "pectorals" },
      { ...squat, id: "0652", name: "pull-up", body_part: "back", target: "lats" },
      { ...squat, id: "3470", name: "forward lunge (male)" },
      { ...squat, id: "0276", name: "dead bug", body_part: "waist", target: "abs" },
      { ...squat, id: "0630", name: "mountain climber", body_part: "cardio", target: "cardiovascular system" },
    ], {
      focus: "weight-loss",
      equipment: "mixed",
      daysPerWeek: 3,
    });

    expect(workout).toHaveLength(6);
    expect(workout.every((item) => item.id && item.day && item.setPlan)).toBe(true);
  });

  it("schedules suggested exercises only on the days selected for the route", () => {
    const workout = exerciseLibrary.generateTrackWorkout(strengthExercises, {
      focus: "strength",
      equipment: "any",
      daysPerWeek: 3,
      trainingDays: ["monday", "wednesday", "friday"],
    });

    expect(workout.map((item) => item.day)).toEqual([
      "monday",
      "wednesday",
      "friday",
      "monday",
      "wednesday",
      "friday",
    ]);
  });

  it("uses six bodyweight alternatives for an equipment-free strength track", () => {
    const bodyweightStrengthExercises: Exercise[] = [
      ...strengthExercises,
      { ...squat, id: "0514", name: "jump squat" },
      { ...squat, id: "0662", name: "push-up", body_part: "chest", target: "pectorals" },
      { ...squat, id: "3470", name: "forward lunge (male)" },
      { ...squat, id: "0630", name: "mountain climber", body_part: "cardio", target: "cardiovascular system" },
      { ...squat, id: "3013", name: "low glute bridge on floor" },
    ];
    const workout = exerciseLibrary.generateTrackWorkout(bodyweightStrengthExercises, {
      focus: "strength",
      equipment: "bodyweight",
    });

    expect(workout).toHaveLength(6);
    expect(workout.every((item) => {
      const selected = bodyweightStrengthExercises.find((exercise) => exercise.id === item.exerciseId);
      return selected ? isEquipmentFreeExercise(selected) : false;
    })).toBe(true);
    expect(workout.map((item) => item.exerciseId)).not.toContain("0652");
  });

  it("balances a mixed strength routine across equipment and bodyweight movements", () => {
    const mixedStrengthExercises: Exercise[] = [
      ...strengthExercises,
      { ...squat, id: "0514", name: "jump squat" },
      { ...squat, id: "0662", name: "push-up", body_part: "chest", target: "pectorals" },
      { ...squat, id: "3470", name: "forward lunge (male)" },
    ];

    const workout = exerciseLibrary.generateTrackWorkout(mixedStrengthExercises, {
      focus: "strength",
      equipment: "mixed",
    });
    const selectedEquipment = workout.map((item) => (
      mixedStrengthExercises.find((exercise) => exercise.id === item.exerciseId)?.equipment
    ));

    expect(workout).toHaveLength(6);
    expect(selectedEquipment.filter((item) => item === "body weight")).toHaveLength(3);
    expect(selectedEquipment.filter((item) => item !== "body weight")).toHaveLength(3);
  });

  it("builds a bodyweight support routine for mountain biking", () => {
    const workout = exerciseLibrary.generateTrackWorkout(mountainBikeExercises, {
      focus: "mountain-biking",
      equipment: "bodyweight",
    });

    expect(workout).toHaveLength(6);
  });

  it("builds a bodyweight support routine for swimming", () => {
    const workout = exerciseLibrary.generateTrackWorkout(swimmingExercises, {
      focus: "swimming",
      equipment: "bodyweight",
    });

    expect(workout).toHaveLength(6);
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

  it("edits one scheduled exercise and records its load history immutably", () => {
    expect(exerciseLibrary.updateWorkoutItem).toBeTypeOf("function");
    expect(exerciseLibrary.logWorkoutLoad).toBeTypeOf("function");
    if (
      typeof exerciseLibrary.updateWorkoutItem !== "function"
      || typeof exerciseLibrary.logWorkoutLoad !== "function"
    ) return;

    const item = {
      id: "monday-squat",
      exerciseId: "0043",
      sets: 3,
      reps: 8,
      day: "monday" as const,
      setPlan: "3 × 8",
      loadKg: 90,
    };
    const edited = exerciseLibrary.updateWorkoutItem([item], item.id, {
      setPlan: "3 × 8 + 2 al fallo",
      day: "wednesday",
    });
    const logged = exerciseLibrary.logWorkoutLoad(edited, item.id, "2026-07-27");

    expect(edited[0]).toMatchObject({
      day: "wednesday",
      setPlan: "3 × 8 + 2 al fallo",
    });
    expect(logged[0].loadHistory).toEqual([
      expect.objectContaining({ date: "2026-07-27", loadKg: 90 }),
    ]);
    expect(item).not.toHaveProperty("loadHistory");
  });

  it("keeps the stored set plan synchronized with sets and repetitions", () => {
    const adjustPrescription = (exerciseLibrary as unknown as {
      adjustWorkoutPrescription?: (
        workout: Array<{ id: string; exerciseId: string; sets: number; reps: number; setPlan?: string }>,
        itemId: string,
        field: "sets" | "reps",
        delta: number,
      ) => Array<{ sets: number; reps: number; setPlan?: string }>;
    }).adjustWorkoutPrescription;

    expect(adjustPrescription).toBeTypeOf("function");
    if (!adjustPrescription) return;

    const original = [{
      id: "monday-squat",
      exerciseId: "0043",
      sets: 3,
      reps: 10,
      setPlan: "3 × 8",
    }];
    const updated = adjustPrescription(original, "monday-squat", "reps", 1);

    expect(updated[0]).toMatchObject({ sets: 3, reps: 11, setPlan: "3 × 11" });
    expect(original[0]).toMatchObject({ reps: 10, setPlan: "3 × 8" });
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

  it("does not reintroduce a documented restriction through exercise replacement", () => {
    const jumpSquat = { ...squat, id: "jump", name: "jump squat" };
    const bridge = { ...squat, id: "bridge", name: "low glute bridge on floor" };
    const alternatives = exerciseLibrary.findExerciseAlternatives(
      [jumpSquat, bridge],
      { ...squat, id: "current", name: "bodyweight squat" },
      "bodyweight",
      3,
      ["impact"],
    );

    expect(alternatives.map((exercise) => exercise.id)).toEqual(["bridge"]);
  });
});
