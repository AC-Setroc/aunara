import { describe, expect, it } from "vitest";
import { buildPersonalDataExport } from "./privacy";
import type { HealthProfile, TrainingTrack, WeeklyCheckIn } from "../types";
import {
  createRepbookSnapshot,
  normalizeRepbookSnapshot,
  selectBootstrapSnapshot,
} from "./cloudSnapshot";

const healthProfile: HealthProfile = {
  birthDate: "1992-01-01",
  ageYears: 34,
  metabolicSex: "male",
  heightCm: 180,
  currentWeightKg: 82,
  targetWeightKg: 78,
  waistCm: 86,
  activityLevel: "moderate",
  experience: "intermediate",
  dietaryPattern: "omnivore",
  allergies: "",
  healthNotes: "",
};

const track: TrainingTrack = {
  id: "sport-beach-volleyball",
  name: "Beach volleyball",
  kind: "sport",
  focus: "beach-volleyball",
  equipment: "bodyweight",
  sessionMinutes: 45,
  daysPerWeek: 2,
  workout: [{ exerciseId: "0514", sets: 3, reps: 10 }],
};

const checkIn: WeeklyCheckIn = {
  id: "2026-07-26",
  date: "2026-07-26",
  weightKg: 82,
  sleepHours: 7.5,
  energy: 4,
  stress: 2,
  notes: "",
};

describe("cloud snapshots", () => {
  it.each(["invalid", null, 20])("rejects invalid repetition count %j on items and work blocks", (repetitionCount) => {
    const local = createRepbookSnapshot({ profileName: "Synthetic", language: "en", favoriteIds: [], tracks: [track], activeTrackId: track.id, healthProfile, checkIns: [] });
    for (const item of [{ ...track.workout[0], repetitionCount }, { ...track.workout[0], prescriptionMode: "special", specialPrescription: { technique: "custom", rounds: 1, restBetweenRoundsSeconds: 0, blocks: [{ id: "synthetic", type: "work", target: "reps", value: 20, repetitionCount, loadType: "same" }] } }]) {
      expect(normalizeRepbookSnapshot({ ...local, tracks: [{ ...track, workout: [item] }] }, local)).toBe(local);
    }
  });
  it("round-trips total, per-side and absent legacy counts through reload and personal export without rewriting", () => {
    const workout = [track.workout[0], { ...track.workout[0], repetitionCount: "total" as const }, { ...track.workout[0], reps: 20, repetitionCount: "per-side" as const, prescriptionMode: "special" as const, specialPrescription: { technique: "custom" as const, rounds: 1, restBetweenRoundsSeconds: 0, blocks: [{ id: "synthetic", type: "work" as const, target: "reps" as const, value: 20, repetitionCount: "per-side" as const, loadType: "same" as const }] } }];
    const local = createRepbookSnapshot({ profileName: "Synthetic", language: "en", favoriteIds: [], tracks: [{ ...track, workout }], activeTrackId: track.id, healthProfile, checkIns: [] });
    const serialized = JSON.stringify(local);
    const reloaded = normalizeRepbookSnapshot(JSON.parse(serialized), local);
    expect(JSON.stringify(reloaded)).toBe(serialized);
    expect(reloaded.tracks[0].workout[0]).not.toHaveProperty("repetitionCount");
    expect(buildPersonalDataExport({ email: "synthetic@example.invalid", consentStatus: null, snapshot: reloaded }).data.tracks[0].workout).toEqual(workout);
  });
  it("round-trips additive preferences, unknown fields and legacy intent without migration", () => {
    const local = createRepbookSnapshot({ profileName: "Fixture", language: "es", favoriteIds: [], tracks: [track], activeTrackId: track.id, healthProfile, checkIns: [checkIn] });
    for (const preferences of [{ primaryGoal: "strength" }, { primaryGoal: "swimming" }, { primaryGoal: "strength", goals: ["strength", "mobility"], sport: null }, { goals: ["endurance"], sport: "running" }]) {
      const candidate = JSON.parse(JSON.stringify({ ...local, healthProfile: { ...healthProfile, ...preferences, futureField: { preserved: true } } }));
      expect(normalizeRepbookSnapshot(candidate, local)).toEqual(candidate);
    }
  });

  it.each([[], ["strength", "strength"], ["strength", "mobility", "endurance", "weight-loss"], ["swimming"], ["invalid"]].map((goals) => ({ goals })))("rejects invalid goals %j", ({ goals }) => {
    const local = createRepbookSnapshot({ profileName: "Fixture", language: "es", favoriteIds: [], tracks: [], activeTrackId: "", healthProfile, checkIns: [] });
    expect(normalizeRepbookSnapshot({ ...local, healthProfile: { ...healthProfile, goals } }, local)).toBe(local);
  });

  it.each([{ sport: "strength" }, { sport: "unknown" }, { trainingDaysPerWeek: 0 }, { trainingDaysPerWeek: 8 }, { trainingDaysPerWeek: 2.5 }, { sessionMinutes: Infinity }, { sessionMinutes: 14 }, { sessionMinutes: 181 }])("rejects invalid additive preferences %j", (preferences) => {
    const local = createRepbookSnapshot({ profileName: "Fixture", language: "es", favoriteIds: [], tracks: [], activeTrackId: "", healthProfile, checkIns: [] });
    expect(normalizeRepbookSnapshot({ ...local, healthProfile: { ...healthProfile, ...preferences } }, local)).toBe(local);
  });
  it("creates a versioned snapshot from the current local profile", () => {
    const snapshot = createRepbookSnapshot({
      profileName: "Alejandro",
      language: "es",
      favoriteIds: ["0514"],
      tracks: [track],
      activeTrackId: track.id,
      healthProfile,
      checkIns: [checkIn],
    });

    expect(snapshot).toEqual({
      schemaVersion: 1,
      profileName: "Alejandro",
      language: "es",
      favoriteIds: ["0514"],
      tracks: [track],
      activeTrackId: track.id,
      healthProfile,
      checkIns: [checkIn],
    });
  });

  it("persists whether the initial routine suggestion has already been created", () => {
    const snapshot = createRepbookSnapshot({
      profileName: "Alejandro",
      language: "es",
      favoriteIds: [],
      tracks: [],
      activeTrackId: "",
      healthProfile,
      checkIns: [],
      tracksInitialized: true,
    });

    expect(snapshot.tracksInitialized).toBe(true);
  });

  it("preserves structured readiness, limitations, and explained routine adaptations", () => {
    const profileWithLimitations: HealthProfile = {
      ...healthProfile,
      readinessScreen: {
        confirmed: true,
        chestPain: false,
        dizzinessOrFainting: false,
        medicallySupervisedOnly: false,
        musculoskeletalConcern: true,
        reviewedAt: "2026-07-28",
      },
      limitations: [{
        id: "right-knee",
        area: "knee",
        side: "right",
        status: "stable",
        restrictedMovements: ["impact"],
        professionalGuidance: "Low impact only.",
        professionalReview: "cleared-with-restrictions",
      }],
    };
    const adaptedTrack: TrainingTrack = {
      ...track,
      adaptations: [{
        excludedExerciseId: "0514",
        replacementExerciseId: "0276",
        restrictions: ["impact"],
      }],
    };
    const snapshot = createRepbookSnapshot({
      profileName: "Alejandro",
      language: "es",
      favoriteIds: [],
      tracks: [adaptedTrack],
      activeTrackId: adaptedTrack.id,
      healthProfile: profileWithLimitations,
      checkIns: [],
    });

    expect(normalizeRepbookSnapshot(snapshot, createRepbookSnapshot({
      ...snapshot,
      healthProfile,
      tracks: [track],
    }))).toEqual(snapshot);
  });

  it("rejects malformed remote data instead of overwriting valid local data", () => {
    const local = createRepbookSnapshot({
      profileName: "Alejandro",
      language: "es",
      favoriteIds: ["0514"],
      tracks: [track],
      activeTrackId: track.id,
      healthProfile,
      checkIns: [checkIn],
    });

    expect(normalizeRepbookSnapshot({ schemaVersion: 1, tracks: "broken" }, local)).toBe(local);
    expect(normalizeRepbookSnapshot(null, local)).toBe(local);
  });

  it("rejects malformed nested profile, track, and check-in values", () => {
    const local = createRepbookSnapshot({
      profileName: "Alejandro",
      language: "es",
      favoriteIds: ["0514"],
      tracks: [track],
      activeTrackId: track.id,
      healthProfile,
      checkIns: [checkIn],
    });

    expect(normalizeRepbookSnapshot({ ...local, language: "xx" }, local)).toBe(local);
    expect(normalizeRepbookSnapshot({ ...local, tracks: [{ id: 7 }] }, local)).toBe(local);
    expect(normalizeRepbookSnapshot({
      ...local,
      healthProfile: { ...healthProfile, currentWeightKg: "82" },
    }, local)).toBe(local);
    expect(normalizeRepbookSnapshot({
      ...local,
      healthProfile: { ...healthProfile, birthDate: 19920101 },
    }, local)).toBe(local);
    expect(normalizeRepbookSnapshot({
      ...local,
      checkIns: [{ ...checkIn, energy: "high" }],
    }, local)).toBe(local);
  });

  it("uploads local data for a new account and uses cloud data on another device", () => {
    const local = createRepbookSnapshot({
      profileName: "Local profile",
      language: "en",
      favoriteIds: [],
      tracks: [],
      activeTrackId: "",
      healthProfile,
      checkIns: [],
    });
    const remote = createRepbookSnapshot({
      ...local,
      profileName: "Cloud profile",
      language: "es",
      tracks: [track],
      activeTrackId: track.id,
    });

    expect(selectBootstrapSnapshot(local, null)).toEqual({
      action: "upload-local",
      snapshot: local,
    });
    expect(selectBootstrapSnapshot(local, remote)).toEqual({
      action: "use-remote",
      snapshot: remote,
    });
  });
});
