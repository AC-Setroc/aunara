import { describe, expect, it } from "vitest";
import { buildPersonalDataExport } from "./privacy";
import type { HealthProfile, TrainingTrack, WeeklyCheckIn } from "../types";
import { DEFAULT_HEALTH_PROFILE } from "./healthProfile";
import {
  outboundSnapshot,
  reconcileRemoteSnapshot,
  withholdSensitiveData,
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

describe("sensitive health data and consent (SDD-011 H-02)", () => {
  const sensitiveProfile: HealthProfile = {
    ...DEFAULT_HEALTH_PROFILE,
    onboardingCompleted: true,
    primaryGoal: "endurance",
    goals: ["general-fitness"],
    sport: "running",
    equipmentPreference: "bodyweight",
    trainingDaysPerWeek: 4,
    sessionMinutes: 30,
    experience: "intermediate",
    healthDataMode: "personalized",
    birthDate: "1990-05-01",
    ageYears: 36,
    metabolicSex: "male",
    heightCm: 180,
    currentWeightKg: 82,
    targetWeightKg: 78,
    waistCm: 86,
    bodyFatPercent: 18,
    activityLevel: "very-active",
    dietaryPattern: "vegetarian",
    nutritionPlanMode: "macros",
    macroMealsPerDay: 5,
    preferredIngredients: ["lentejas"],
    allergies: "maní",
    healthNotes: "rodilla derecha",
    readinessScreen: { confirmed: true, chestPain: false, dizzinessOrFainting: false, medicallySupervisedOnly: false, musculoskeletalConcern: true },
    limitations: [{ id: "lim-1", area: "knee", side: "right", status: "recovering", restrictedMovements: ["deep-knee-flexion"], professionalGuidance: "", professionalReview: "not-reviewed" }],
  };
  const checkIn: WeeklyCheckIn = { id: "ci-1", date: "2026-10-05", weightKg: 81.5, sleepHours: 7, energy: 4, stress: 2, notes: "" };
  const base = { schemaVersion: 1 as const, profileName: "Alejandro", language: "es" as const, favoriteIds: ["0514"], tracks: [] as TrainingTrack[], activeTrackId: "", tracksInitialized: true };
  const local = { ...base, healthProfile: sensitiveProfile, checkIns: [checkIn] };
  const policy = (consentGranted: boolean) => ({ consentGranted, defaultHealthProfile: DEFAULT_HEALTH_PROFILE });

  it("withholds every sensitive field and all check-ins but keeps non-sensitive preferences and onboarding", () => {
    const withheld = withholdSensitiveData(local, DEFAULT_HEALTH_PROFILE);
    expect(withheld.checkIns).toEqual([]);
    const profile = withheld.healthProfile;
    expect(profile.onboardingCompleted).toBe(true);
    expect(profile.healthDataMode).toBe("personalized");
    expect(profile.primaryGoal).toBe("endurance");
    expect(profile.goals).toEqual(["general-fitness"]);
    expect(profile.sport).toBe("running");
    expect(profile.equipmentPreference).toBe("bodyweight");
    expect(profile.trainingDaysPerWeek).toBe(4);
    expect(profile.sessionMinutes).toBe(30);
    expect(profile.experience).toBe("intermediate");
    expect(profile.birthDate).toBe("");
    expect(profile.ageYears).toBeNull();
    expect(profile.metabolicSex).toBe("unspecified");
    expect(profile.heightCm).toBeNull();
    expect(profile.currentWeightKg).toBeNull();
    expect(profile.targetWeightKg).toBeNull();
    expect(profile.waistCm).toBeNull();
    expect(profile).not.toHaveProperty("bodyFatPercent");
    expect(profile).not.toHaveProperty("preferredIngredients");
    expect(profile.activityLevel).toBe("moderate");
    expect(profile.dietaryPattern).toBe("omnivore");
    expect(profile.nutritionPlanMode).toBe("simple");
    expect(profile.macroMealsPerDay).toBe(4);
    expect(profile.allergies).toBe("");
    expect(profile.healthNotes).toBe("");
    expect(profile.readinessScreen).toEqual(DEFAULT_HEALTH_PROFILE.readinessScreen);
    expect(profile.limitations).toEqual([]);
    expect(JSON.stringify(withheld)).not.toContain("rodilla");
    expect(JSON.stringify(withheld)).not.toContain("maní");
    expect(local.healthProfile.healthNotes).toBe("rodilla derecha");
  });

  it("sends the full snapshot only with granted consent", () => {
    expect(outboundSnapshot(local, policy(true))).toEqual(local);
    expect(outboundSnapshot(local, policy(false))).toEqual(withholdSensitiveData(local, DEFAULT_HEALTH_PROFILE));
  });

  it("keeps local sensitive data and check-ins when consent is not granted, taking the rest from the remote", () => {
    const remote = { ...withholdSensitiveData(local, DEFAULT_HEALTH_PROFILE), profileName: "Otro dispositivo", favoriteIds: ["0001"], healthProfile: { ...withholdSensitiveData(local, DEFAULT_HEALTH_PROFILE).healthProfile, trainingDaysPerWeek: 5 } };
    const reconciled = reconcileRemoteSnapshot(local, remote, policy(false));
    expect(reconciled.profileName).toBe("Otro dispositivo");
    expect(reconciled.favoriteIds).toEqual(["0001"]);
    expect(reconciled.healthProfile.trainingDaysPerWeek).toBe(5);
    expect(reconciled.healthProfile.healthNotes).toBe("rodilla derecha");
    expect(reconciled.healthProfile.bodyFatPercent).toBe(18);
    expect(reconciled.healthProfile.limitations).toEqual(sensitiveProfile.limitations);
    expect(reconciled.checkIns).toEqual([checkIn]);
  });

  it("with granted consent the remote wins, except when the remote carries no sensitive data and the device does", () => {
    const remoteWithData = { ...local, healthProfile: { ...sensitiveProfile, healthNotes: "remoto" }, checkIns: [] };
    expect(reconcileRemoteSnapshot(local, remoteWithData, policy(true))).toEqual(remoteWithData);
    const strippedRemote = withholdSensitiveData(local, DEFAULT_HEALTH_PROFILE);
    const reconciled = reconcileRemoteSnapshot(local, strippedRemote, policy(true));
    expect(reconciled.healthProfile.healthNotes).toBe("rodilla derecha");
    expect(reconciled.checkIns).toEqual([checkIn]);
    const emptyDevice = { ...local, healthProfile: withholdSensitiveData(local, DEFAULT_HEALTH_PROFILE).healthProfile, checkIns: [] };
    expect(reconcileRemoteSnapshot(emptyDevice, strippedRemote, policy(true))).toEqual(strippedRemote);
  });
});

