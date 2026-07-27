import { describe, expect, it, vi } from "vitest";
import type { HealthProfile, TrainingTrack, WeeklyCheckIn } from "../types";
import {
  addWeeklyCheckIn,
  buildRoutineAnalysis,
  calculateBmi,
  createWellnessSummary,
} from "./wellness";

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
  id: "goal-strength",
  name: "Strength base",
  kind: "goal",
  focus: "strength",
  equipment: "any",
  sessionMinutes: 45,
  daysPerWeek: 2,
  workout: [],
};

describe("wellness calculations", () => {
  it("calculates BMI only from plausible adult measurements", () => {
    expect(calculateBmi(180, 82)).toBe(25.3);
    expect(calculateBmi(0, 82)).toBeNull();
    expect(calculateBmi(180, 0)).toBeNull();
  });

  it("creates planning ranges from a complete health profile", () => {
    const summary = createWellnessSummary(healthProfile);

    expect(summary.bmi?.value).toBe(25.3);
    expect(summary.proteinGrams).toEqual({ min: 98, max: 131 });
    expect(summary.hydrationLiters).toEqual({ min: 2.5, max: 2.9 });
    expect(summary.maintenanceCalories?.min).toBeLessThan(summary.maintenanceCalories?.max ?? 0);
    expect(summary.targetDeltaKg).toBe(-4);
  });

  it("calculates age from birth date before this year's birthday", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-27T12:00:00"));
    const fromBirthDate = createWellnessSummary({
      ...healthProfile,
      birthDate: "1990-07-28",
      ageYears: null,
    });
    const fromAge = createWellnessSummary({
      ...healthProfile,
      birthDate: "",
      ageYears: 35,
    });
    vi.useRealTimers();

    expect(fromBirthDate.maintenanceCalories).toEqual(fromAge.maintenanceCalories);
  });

  it("increments calculated age on the birthday", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-27T12:00:00"));
    const fromBirthDate = createWellnessSummary({
      ...healthProfile,
      birthDate: "1990-07-27",
      ageYears: null,
    });
    const fromAge = createWellnessSummary({
      ...healthProfile,
      birthDate: "",
      ageYears: 36,
    });
    vi.useRealTimers();

    expect(fromBirthDate.maintenanceCalories).toEqual(fromAge.maintenanceCalories);
  });

  it("avoids inventing nutrition targets when body data is missing", () => {
    const summary = createWellnessSummary({
      ...healthProfile,
      heightCm: null,
      currentWeightKg: null,
    });

    expect(summary.bmi).toBeNull();
    expect(summary.proteinGrams).toBeNull();
    expect(summary.hydrationLiters).toBeNull();
    expect(summary.maintenanceCalories).toBeNull();
  });
});

describe("health-aware routine analysis", () => {
  it("flags low recovery without changing the saved routine", () => {
    const checkIn: WeeklyCheckIn = {
      id: "2026-07-26",
      date: "2026-07-26",
      weightKg: 81.5,
      sleepHours: 5.5,
      energy: 2,
      stress: 4,
      notes: "",
    };

    const analysis = buildRoutineAnalysis(track, healthProfile, checkIn);

    expect(analysis.tone).toBe("watch");
    expect(analysis.points.join(" ")).toContain("recovery");
    expect(analysis.points.join(" ")).toContain("Strength");
  });

  it("asks for body data when the profile is incomplete", () => {
    const analysis = buildRoutineAnalysis(track, {
      ...healthProfile,
      heightCm: null,
      currentWeightKg: null,
    });

    expect(analysis.tone).toBe("setup");
    expect(analysis.points.join(" ")).toContain("body profile");
  });
});

describe("weekly check-ins", () => {
  it("replaces the same date and keeps the newest 26 entries", () => {
    const older = Array.from({ length: 26 }, (_, index): WeeklyCheckIn => ({
      id: `old-${index}`,
      date: `2026-01-${String(index + 1).padStart(2, "0")}`,
      weightKg: 82,
      sleepHours: 7,
      energy: 3,
      stress: 3,
      notes: "",
    }));
    const updated: WeeklyCheckIn = {
      ...older[0],
      weightKg: 81,
      sleepHours: 8,
    };

    const result = addWeeklyCheckIn(older, updated);

    expect(result).toHaveLength(26);
    expect(result[0]).toEqual(updated);
    expect(result.filter((item) => item.id === updated.id)).toHaveLength(1);
  });
});
