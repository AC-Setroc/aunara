import { describe, expect, it } from "vitest";
import {
  calculateSetVolume,
  calculateEntryVolume,
  estimateOneRepMax,
  getPersonalRecords,
  calculateAdherenceIndex,
  aggregateLimiterDistribution,
  aggregateWeeklyMetrics,
  aggregateTrackAnalytics,
} from "./workoutAnalytics";
import type {
  Exercise,
  TrainingTrack,
  WorkoutItem,
  WorkoutLoadEntry,
  WorkoutSetDetail,
} from "../types";

describe("workoutAnalytics - Pure BI Engine", () => {
  describe("calculateSetVolume", () => {
    it("calculates volume as loadKg * actualReps for completed sets", () => {
      const set: WorkoutSetDetail = {
        setNumber: 1,
        targetReps: 8,
        actualReps: 8,
        loadKg: 50,
        completed: true,
      };
      expect(calculateSetVolume(set)).toBe(400);
    });

    it("returns 0 for uncompleted sets without actual reps", () => {
      const set: WorkoutSetDetail = {
        setNumber: 2,
        targetReps: 8,
        actualReps: null,
        loadKg: 50,
        completed: false,
      };
      expect(calculateSetVolume(set)).toBe(0);
    });

    it("handles bodyweight sets (null loadKg) by returning 0 tonnage", () => {
      const set: WorkoutSetDetail = {
        setNumber: 1,
        targetReps: 15,
        actualReps: 14,
        loadKg: null,
        completed: true,
      };
      expect(calculateSetVolume(set)).toBe(0);
    });
  });

  describe("calculateEntryVolume", () => {
    it("calculates total volume and reps from atomic setsDetail", () => {
      const entry: WorkoutLoadEntry = {
        id: "press-1",
        date: "2026-10-26",
        loadKg: 50,
        setPlan: "3 × 8",
        effort: "Alto",
        repsCompleted: 7,
        setsDetail: [
          { setNumber: 1, targetReps: 8, actualReps: 8, loadKg: 50, completed: true },
          { setNumber: 2, targetReps: 8, actualReps: 8, loadKg: 50, completed: true },
          { setNumber: 3, targetReps: 8, actualReps: 7, loadKg: 50, completed: true, limiterTag: "muscular-failure" },
        ],
      };

      const result = calculateEntryVolume(entry);
      expect(result.tonnageKg).toBe(50 * (8 + 8 + 7)); // 1150 kg
      expect(result.totalReps).toBe(23);
      expect(result.completedSetsCount).toBe(3);
    });

    it("supports differing loads across series (e.g. Peck Deck 66/72/72 kg)", () => {
      const entry: WorkoutLoadEntry = {
        id: "peck-deck-1",
        date: "2026-10-26",
        loadKg: 72,
        setPlan: "3 × 8-12",
        setsDetail: [
          { setNumber: 1, targetReps: 12, actualReps: 12, loadKg: 66, completed: true },
          { setNumber: 2, targetReps: 8, actualReps: 8, loadKg: 72, completed: true },
          { setNumber: 3, targetReps: 8, actualReps: 8, loadKg: 72, completed: true, limiterTag: "muscular-failure" },
        ],
      };

      const result = calculateEntryVolume(entry);
      expect(result.tonnageKg).toBe(66 * 12 + 72 * 8 + 72 * 8); // 792 + 576 + 576 = 1944 kg
      expect(result.totalReps).toBe(28);
      expect(result.completedSetsCount).toBe(3);
    });

    it("gracefully falls back on legacy entries without setsDetail", () => {
      const legacyEntry: WorkoutLoadEntry = {
        id: "legacy-1",
        date: "2026-09-15",
        loadKg: 60,
        setPlan: "3 × 8",
        repsCompleted: "8/8/8",
      };

      const result = calculateEntryVolume(legacyEntry);
      expect(result.totalReps).toBe(24);
      expect(result.tonnageKg).toBe(60 * 24); // 1440 kg
      expect(result.completedSetsCount).toBe(3);
    });
  });

  describe("estimateOneRepMax (Epley)", () => {
    it("returns null for non-positive load or reps", () => {
      expect(estimateOneRepMax(null, 8)).toBeNull();
      expect(estimateOneRepMax(0, 8)).toBeNull();
      expect(estimateOneRepMax(60, null)).toBeNull();
      expect(estimateOneRepMax(60, 0)).toBeNull();
    });

    it("returns exact load for a single rep (1RM test)", () => {
      const res = estimateOneRepMax(100, 1);
      expect(res).not.toBeNull();
      expect(res?.e1rm).toBe(100);
      expect(res?.isReliable).toBe(true);
    });

    it("computes Epley accurately: load * (1 + reps / 30) for reps <= 10", () => {
      // 60 kg for 8 reps -> 60 * (1 + 8/30) = 60 * (1.2666...) = 76.0 kg
      const res = estimateOneRepMax(60, 8);
      expect(res).not.toBeNull();
      expect(res?.e1rm).toBe(76);
      expect(res?.isReliable).toBe(true);
    });

    it("marks formula as non-reliable for reps > 10", () => {
      const res = estimateOneRepMax(50, 15);
      expect(res).not.toBeNull();
      expect(res?.isReliable).toBe(false);
      expect(res?.e1rm).toBe(75);
    });
  });

  describe("getPersonalRecords", () => {
    const history: WorkoutLoadEntry[] = [
      {
        id: "session-1",
        date: "2026-10-12",
        loadKg: 50,
        setPlan: "3 × 8",
        setsDetail: [
          { setNumber: 1, targetReps: 8, actualReps: 8, loadKg: 50, completed: true },
          { setNumber: 2, targetReps: 8, actualReps: 8, loadKg: 50, completed: true },
          { setNumber: 3, targetReps: 8, actualReps: 8, loadKg: 50, completed: true },
        ],
      },
      {
        id: "session-2",
        date: "2026-10-19",
        loadKg: 55,
        setPlan: "3 × 8",
        setsDetail: [
          { setNumber: 1, targetReps: 8, actualReps: 8, loadKg: 55, completed: true },
          { setNumber: 2, targetReps: 8, actualReps: 7, loadKg: 55, completed: true },
          { setNumber: 3, targetReps: 8, actualReps: 6, loadKg: 55, completed: true },
        ],
      },
      {
        id: "session-3",
        date: "2026-10-26",
        loadKg: 60,
        setPlan: "3 × 8",
        setsDetail: [
          { setNumber: 1, targetReps: 8, actualReps: 8, loadKg: 60, completed: true },
          { setNumber: 2, targetReps: 8, actualReps: 8, loadKg: 60, completed: true },
          { setNumber: 3, targetReps: 8, actualReps: 8, loadKg: 60, completed: true },
        ],
      },
    ];

    it("identifies highest absolute load, highest e1RM, and session volume PR", () => {
      const prs = getPersonalRecords(history);
      expect(prs.maxLoadKg).toEqual({
        value: 60,
        date: "2026-10-26",
        reps: 8,
      });
      // 60 kg x 8 reps -> 76 kg e1RM
      expect(prs.maxEstimated1RM?.value).toBe(76);
      expect(prs.maxEstimated1RM?.date).toBe("2026-10-26");
      // Session 3 volume: 60 * 24 = 1440 kg
      expect(prs.maxSessionVolume).toEqual({
        value: 1440,
        date: "2026-10-26",
      });
      expect(prs.totalLifetimeTonnage).toBe(
        50 * 24 + 55 * 21 + 60 * 24
      ); // 1200 + 1155 + 1440 = 3795
      expect(prs.totalSessions).toBe(3);
    });

    it("returns null PRs for empty history", () => {
      const prs = getPersonalRecords([]);
      expect(prs.maxLoadKg).toBeNull();
      expect(prs.maxEstimated1RM).toBeNull();
      expect(prs.maxSessionVolume).toBeNull();
      expect(prs.totalLifetimeTonnage).toBe(0);
      expect(prs.totalSessions).toBe(0);
    });
  });

  describe("calculateAdherenceIndex", () => {
    it("calculates ratio of actual reps to planned reps", () => {
      const entry: WorkoutLoadEntry = {
        id: "entry-1",
        date: "2026-10-26",
        loadKg: 50,
        setPlan: "3 × 8",
        setsDetail: [
          { setNumber: 1, targetReps: 8, actualReps: 8, loadKg: 50, completed: true },
          { setNumber: 2, targetReps: 8, actualReps: 8, loadKg: 50, completed: true },
          { setNumber: 3, targetReps: 8, actualReps: 7, loadKg: 50, completed: true },
        ],
      };

      // Planned = 24, Actual = 23 -> 23/24 * 100 = 95.8%
      const adherence = calculateAdherenceIndex(entry);
      expect(adherence).toBeCloseTo(95.8, 1);
    });
  });

  describe("aggregateLimiterDistribution", () => {
    it("counts occurrences and flags joint discomfort events", () => {
      const history: WorkoutLoadEntry[] = [
        {
          id: "s1",
          date: "2026-10-20",
          loadKg: 50,
          setPlan: "3 × 8",
          setsDetail: [
            { setNumber: 1, targetReps: 8, actualReps: 8, loadKg: 50, completed: true },
            { setNumber: 2, targetReps: 8, actualReps: 8, loadKg: 50, completed: true },
            { setNumber: 3, targetReps: 8, actualReps: 6, loadKg: 50, completed: true, limiterTag: "muscular-failure" },
          ],
        },
        {
          id: "s2",
          date: "2026-10-26",
          loadKg: 55,
          setPlan: "3 × 8",
          setsDetail: [
            { setNumber: 1, targetReps: 8, actualReps: 8, loadKg: 55, completed: true },
            { setNumber: 2, targetReps: 8, actualReps: 5, loadKg: 55, completed: true, limiterTag: "joint-discomfort" },
            { setNumber: 3, targetReps: 8, actualReps: 5, loadKg: 55, completed: true, limiterTag: "excessive-load" },
          ],
        },
      ];

      const result = aggregateLimiterDistribution(history);
      expect(result.counts["muscular-failure"]).toBe(1);
      expect(result.counts["joint-discomfort"]).toBe(1);
      expect(result.counts["excessive-load"]).toBe(1);
      expect(result.counts["cardiovascular"]).toBe(0);
      expect(result.counts["time-constraint"]).toBe(0);
      expect(result.totalTaggedSets).toBe(3);

      expect(result.jointAlerts).toHaveLength(1);
      expect(result.jointAlerts[0].date).toBe("2026-10-26");
      expect(result.jointAlerts[0].setNumber).toBe(2);
    });
  });

  describe("aggregateWeeklyMetrics", () => {
    it("groups sessions by calendar week without inventing data for empty weeks", () => {
      const history: WorkoutLoadEntry[] = [
        {
          id: "w1-s1",
          date: "2026-10-12",
          loadKg: 50,
          setPlan: "3 × 8",
          setsDetail: [
            { setNumber: 1, targetReps: 8, actualReps: 8, loadKg: 50, completed: true },
          ],
        },
        {
          id: "w1-s2",
          date: "2026-10-14",
          loadKg: 50,
          setPlan: "3 × 8",
          setsDetail: [
            { setNumber: 1, targetReps: 8, actualReps: 8, loadKg: 50, completed: true },
          ],
        },
        {
          id: "w2-s1",
          date: "2026-10-26",
          loadKg: 60,
          setPlan: "3 × 8",
          setsDetail: [
            { setNumber: 1, targetReps: 8, actualReps: 8, loadKg: 60, completed: true },
          ],
        },
      ];

      // Request 3 weeks ending at 2026-10-28
      const weeks = aggregateWeeklyMetrics(history, {
        weeksCount: 3,
        now: new Date("2026-10-28T12:00:00Z"),
      });

      expect(weeks).toHaveLength(3);
      // Week 1 (Oct 12-18): 2 sessions, tonnage 50*8 + 50*8 = 800
      const week1 = weeks.find((w) => w.hasData && w.tonnageKg === 800);
      expect(week1).toBeDefined();
      expect(week1?.sessionsCount).toBe(2);

      // Week 2 (Oct 19-25): gap week (no sessions)
      const gapWeek = weeks.find((w) => !w.hasData);
      expect(gapWeek).toBeDefined();
      expect(gapWeek?.sessionsCount).toBe(0);
      expect(gapWeek?.tonnageKg).toBe(0);

      // Week 3 (Oct 26-Nov 1): 1 session, tonnage 60*8 = 480
      const week3 = weeks.find((w) => w.hasData && w.tonnageKg === 480);
      expect(week3).toBeDefined();
      expect(week3?.sessionsCount).toBe(1);
    });
  });

  describe("aggregateTrackAnalytics", () => {
    it("aggregates volume, PRs, and fatigue across multiple workout items", () => {
      const dummyInstructions = { en: "", es: "", it: "", tr: "", ru: "", zh: "", hi: "", pl: "", ko: "", fr: "" };
      const dummySteps = { en: [], es: [], it: [], tr: [], ru: [], zh: [], hi: [], pl: [], ko: [], fr: [] };

      const exerciseMap = new Map<string, Exercise>([
        [
          "0025",
          {
            id: "0025",
            name: "barbell bench press",
            category: "strength",
            body_part: "chest",
            muscle_group: "chest",
            equipment: "barbell",
            instructions: dummyInstructions,
            instruction_steps: dummySteps,
            secondary_muscles: ["triceps"],
            target: "pectorals",
            media_id: "0025",
            image: "",
            gif_url: "",
            attribution: "",
            created_at: "",
          },
        ],
        [
          "0047",
          {
            id: "0047",
            name: "incline bench press",
            category: "strength",
            body_part: "chest",
            muscle_group: "chest",
            equipment: "barbell",
            instructions: dummyInstructions,
            instruction_steps: dummySteps,
            secondary_muscles: ["shoulders"],
            target: "upper chest",
            media_id: "0047",
            image: "",
            gif_url: "",
            attribution: "",
            created_at: "",
          },
        ],
      ]);

      const items: WorkoutItem[] = [
        {
          id: "item-1",
          exerciseId: "0025",
          sets: 3,
          reps: 8,
          loadHistory: [
            {
              id: "h1",
              date: "2026-10-26",
              loadKg: 60,
              setPlan: "3 × 8",
              setsDetail: [
                { setNumber: 1, targetReps: 8, actualReps: 8, loadKg: 60, completed: true },
                { setNumber: 2, targetReps: 8, actualReps: 8, loadKg: 60, completed: true },
                { setNumber: 3, targetReps: 8, actualReps: 8, loadKg: 60, completed: true },
              ],
            },
          ],
        },
        {
          id: "item-2",
          exerciseId: "0047",
          sets: 3,
          reps: 8,
          loadHistory: [
            {
              id: "h2",
              date: "2026-10-26",
              loadKg: 50,
              setPlan: "3 × 8",
              setsDetail: [
                { setNumber: 1, targetReps: 8, actualReps: 8, loadKg: 50, completed: true },
                { setNumber: 2, targetReps: 8, actualReps: 8, loadKg: 50, completed: true },
                { setNumber: 3, targetReps: 8, actualReps: 7, loadKg: 50, completed: true, limiterTag: "muscular-failure" },
              ],
            },
          ],
        },
      ];

      const track: TrainingTrack = {
        id: "track-test",
        name: "Test Track",
        kind: "goal",
        focus: "strength",
        equipment: "any",
        sessionMinutes: 60,
        daysPerWeek: 3,
        workout: items,
      };

      const result = aggregateTrackAnalytics(track, exerciseMap, {
        now: new Date("2026-10-28T12:00:00Z"),
      });

      // Total tonnage: 60*24 (1440) + 50*23 (1150) = 2590 kg
      expect(result.totalTrackTonnage).toBe(2590);
      expect(result.totalLoggedSessions).toBe(2);
      expect(result.muscleGroupDistribution["chest"]?.tonnageKg).toBe(2590);
      expect(result.limiterDistribution.counts["muscular-failure"]).toBe(1);
    });
  });
});
