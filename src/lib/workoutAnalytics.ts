import type {
  Exercise,
  TrainingTrack,
  WorkoutItem,
  WorkoutLimiterTag,
  WorkoutLoadEntry,
  WorkoutSetDetail,
} from "../types";

export interface SetVolumeResult {
  tonnageKg: number;
  totalReps: number;
  completedSetsCount: number;
}

export interface EstimatedOneRepMax {
  e1rm: number;
  formula: string;
  isReliable: boolean;
}

export interface PersonalRecordItem<T = number> {
  value: T;
  date: string;
  reps?: number;
  loadKg?: number;
}

export interface PersonalRecords {
  maxLoadKg: PersonalRecordItem | null;
  maxEstimated1RM: PersonalRecordItem | null;
  maxSessionVolume: PersonalRecordItem | null;
  totalLifetimeTonnage: number;
  totalRepsCompleted: number;
  totalSessions: number;
}

export interface LimiterDistribution {
  counts: Record<WorkoutLimiterTag, number>;
  percentages: Record<WorkoutLimiterTag, number>;
  totalTaggedSets: number;
  jointAlerts: {
    date: string;
    exerciseId?: string;
    loadKg?: number | null;
    actualReps?: number | null;
    setNumber?: number;
  }[];
}

export interface WeeklyMetricsSummary {
  weekKey: string; // e.g. "2026-W43"
  weekLabel: string; // e.g. "19 - 25 Oct"
  startDate: string; // ISO string
  endDate: string; // ISO string
  hasData: boolean;
  tonnageKg: number;
  totalReps: number;
  sessionsCount: number;
  adherencePercent: number | null;
  topLimiter: WorkoutLimiterTag | null;
}

export interface MuscleGroupVolume {
  tonnageKg: number;
  totalReps: number;
  setsCount: number;
  exerciseCount: number;
}

export interface ExerciseSummary {
  exerciseId: string;
  exerciseName?: string;
  totalTonnage: number;
  prs: PersonalRecords;
  lastLoggedDate: string | null;
  lastLoadKg: number | null;
  lastReps: string | number | null;
}

export interface TrackAnalytics {
  trackId: string;
  trackName: string;
  totalTrackTonnage: number;
  totalLoggedSessions: number;
  weeklyHistory: WeeklyMetricsSummary[];
  muscleGroupDistribution: Record<string, MuscleGroupVolume>;
  exerciseSummaries: Record<string, ExerciseSummary>;
  limiterDistribution: LimiterDistribution;
  jointDiscomfortCount: number;
}

/**
 * Calculates volume (tonnage) in kg for a single set: loadKg * actualReps.
 * Only positive actualReps count toward volume. If load is null (bodyweight), tonnage is 0.
 */
export function calculateSetVolume(set: WorkoutSetDetail): number {
  if (!set.completed && (set.actualReps == null || set.actualReps <= 0)) {
    return 0;
  }
  const load = set.loadKg ?? 0;
  const reps = set.actualReps ?? 0;
  return Math.max(0, load * reps);
}

/**
 * Helper to parse numbers from legacy string rep records (e.g. "8/8/7" or "12-10-8").
 */
function parseRepsFromString(repsStr: string): number[] {
  const parts = repsStr.split(/[/,-]/).map((p) => parseInt(p.trim(), 10));
  const valid = parts.filter((n) => !Number.isNaN(n) && n > 0);
  return valid;
}

/**
 * Calculates total volume (tonnage) and reps for a workout entry.
 * Prioritizes atomic setsDetail. Degrades gracefully to consolidated loadKg & repsCompleted.
 */
export function calculateEntryVolume(entry: WorkoutLoadEntry): SetVolumeResult {
  if (entry.setsDetail && entry.setsDetail.length > 0) {
    let tonnage = 0;
    let totalReps = 0;
    let completedSetsCount = 0;

    for (const set of entry.setsDetail) {
      if (set.completed || (set.actualReps != null && set.actualReps > 0)) {
        completedSetsCount += 1;
        const reps = set.actualReps ?? 0;
        const load = set.loadKg ?? 0;
        tonnage += load * reps;
        totalReps += reps;
      }
    }

    return {
      tonnageKg: Math.round(tonnage * 10) / 10,
      totalReps,
      completedSetsCount,
    };
  }

  // Fallback for legacy records
  const load = entry.loadKg ?? 0;
  let totalReps = 0;
  let completedSetsCount = 1;

  if (typeof entry.repsCompleted === "number") {
    // If setPlan is "3 × 8", try extracting sets count
    const matchSets = entry.setPlan?.match(/^(\d+)\s*[×xX]/);
    if (matchSets) {
      const parsedSets = parseInt(matchSets[1], 10);
      if (parsedSets > 0 && entry.repsCompleted <= 15) {
        completedSetsCount = parsedSets;
        totalReps = parsedSets * entry.repsCompleted;
      } else {
        totalReps = entry.repsCompleted;
      }
    } else {
      totalReps = entry.repsCompleted;
    }
  } else if (typeof entry.repsCompleted === "string") {
    const parsed = parseRepsFromString(entry.repsCompleted);
    if (parsed.length > 0) {
      completedSetsCount = parsed.length;
      totalReps = parsed.reduce((sum, n) => sum + n, 0);
    }
  } else {
    // Attempt parsing from setPlan "3 × 8"
    const match = entry.setPlan?.match(/(\d+)\s*[×xX]\s*(\d+)/);
    if (match) {
      const s = parseInt(match[1], 10);
      const r = parseInt(match[2], 10);
      completedSetsCount = s;
      totalReps = s * r;
    }
  }

  return {
    tonnageKg: Math.round(load * totalReps * 10) / 10,
    totalReps,
    completedSetsCount,
  };
}

/**
 * Calculates estimated 1 Repetition Maximum using Epley's formula:
 * e1RM = load * (1 + reps / 30).
 * Marked as reliable for reps <= 10.
 */
export function estimateOneRepMax(
  loadKg: number | null | undefined,
  reps: number | null | undefined
): EstimatedOneRepMax | null {
  if (loadKg == null || loadKg <= 0 || reps == null || reps <= 0) {
    return null;
  }
  if (reps === 1) {
    return {
      e1rm: Math.round(loadKg * 10) / 10,
      formula: "Direct (1 rep)",
      isReliable: true,
    };
  }

  const raw1RM = loadKg * (1 + reps / 30);
  const rounded = Math.round(raw1RM * 10) / 10;

  return {
    e1rm: rounded,
    formula: "Epley: carga × (1 + reps / 30)",
    isReliable: reps <= 10,
  };
}

/**
 * Calculates Personal Records (PRs) from an exercise's load history.
 */
export function getPersonalRecords(history: WorkoutLoadEntry[]): PersonalRecords {
  let maxLoadKg: PersonalRecordItem | null = null;
  let maxEstimated1RM: PersonalRecordItem | null = null;
  let maxSessionVolume: PersonalRecordItem | null = null;
  let totalLifetimeTonnage = 0;
  let totalRepsCompleted = 0;

  for (const entry of history) {
    const entryVol = calculateEntryVolume(entry);
    totalLifetimeTonnage += entryVol.tonnageKg;
    totalRepsCompleted += entryVol.totalReps;

    // Session volume PR
    if (!maxSessionVolume || entryVol.tonnageKg > maxSessionVolume.value) {
      if (entryVol.tonnageKg > 0) {
        maxSessionVolume = {
          value: entryVol.tonnageKg,
          date: entry.date,
        };
      }
    }

    // Individual sets PRs
    if (entry.setsDetail && entry.setsDetail.length > 0) {
      for (const set of entry.setsDetail) {
        if (!set.completed && (set.actualReps == null || set.actualReps <= 0)) {
          continue;
        }
        const load = set.loadKg ?? 0;
        const reps = set.actualReps ?? 0;

        if (load > 0) {
          if (!maxLoadKg || load > maxLoadKg.value) {
            maxLoadKg = {
              value: load,
              date: entry.date,
              reps,
            };
          }

          const e1rm = estimateOneRepMax(load, reps);
          if (e1rm && (!maxEstimated1RM || e1rm.e1rm > maxEstimated1RM.value)) {
            maxEstimated1RM = {
              value: e1rm.e1rm,
              date: entry.date,
              loadKg: load,
              reps,
            };
          }
        }
      }
    } else if (entry.loadKg && entry.loadKg > 0) {
      // Legacy entry check
      const load = entry.loadKg;
      let reps = 8;
      if (typeof entry.repsCompleted === "number") reps = entry.repsCompleted;
      else if (typeof entry.repsCompleted === "string") {
        const parsed = parseRepsFromString(entry.repsCompleted);
        if (parsed.length > 0) reps = parsed[0];
      }

      if (!maxLoadKg || load > maxLoadKg.value) {
        maxLoadKg = {
          value: load,
          date: entry.date,
          reps,
        };
      }

      const e1rm = estimateOneRepMax(load, reps);
      if (e1rm && (!maxEstimated1RM || e1rm.e1rm > maxEstimated1RM.value)) {
        maxEstimated1RM = {
          value: e1rm.e1rm,
          date: entry.date,
          loadKg: load,
          reps,
        };
      }
    }
  }

  return {
    maxLoadKg,
    maxEstimated1RM,
    maxSessionVolume,
    totalLifetimeTonnage: Math.round(totalLifetimeTonnage * 10) / 10,
    totalRepsCompleted,
    totalSessions: history.length,
  };
}

/**
 * Calculates volume adherence percentage for an entry: (actualReps / targetReps) * 100.
 */
export function calculateAdherenceIndex(entry: WorkoutLoadEntry): number | null {
  if (!entry.setsDetail || entry.setsDetail.length === 0) {
    return null;
  }

  let totalTarget = 0;
  let totalActual = 0;

  for (const set of entry.setsDetail) {
    totalTarget += set.targetReps;
    if (set.completed || (set.actualReps != null && set.actualReps > 0)) {
      totalActual += set.actualReps ?? 0;
    }
  }

  if (totalTarget <= 0) return null;
  return Math.round((totalActual / totalTarget) * 1000) / 10;
}

/**
 * Aggregates limiter tags and flags joint-discomfort events.
 */
export function aggregateLimiterDistribution(history: WorkoutLoadEntry[]): LimiterDistribution {
  const counts: Record<WorkoutLimiterTag, number> = {
    "muscular-failure": 0,
    cardiovascular: 0,
    "joint-discomfort": 0,
    "excessive-load": 0,
    "time-constraint": 0,
  };

  const jointAlerts: LimiterDistribution["jointAlerts"] = [];
  let totalTaggedSets = 0;

  for (const entry of history) {
    if (entry.setsDetail) {
      for (const set of entry.setsDetail) {
        if (set.limiterTag && set.limiterTag in counts) {
          counts[set.limiterTag] += 1;
          totalTaggedSets += 1;

          if (set.limiterTag === "joint-discomfort") {
            jointAlerts.push({
              date: entry.date,
              loadKg: set.loadKg,
              actualReps: set.actualReps,
              setNumber: set.setNumber,
            });
          }
        }
      }
    }
  }

  const percentages: Record<WorkoutLimiterTag, number> = {
    "muscular-failure": totalTaggedSets > 0 ? Math.round((counts["muscular-failure"] / totalTaggedSets) * 100) : 0,
    cardiovascular: totalTaggedSets > 0 ? Math.round((counts.cardiovascular / totalTaggedSets) * 100) : 0,
    "joint-discomfort": totalTaggedSets > 0 ? Math.round((counts["joint-discomfort"] / totalTaggedSets) * 100) : 0,
    "excessive-load": totalTaggedSets > 0 ? Math.round((counts["excessive-load"] / totalTaggedSets) * 100) : 0,
    "time-constraint": totalTaggedSets > 0 ? Math.round((counts["time-constraint"] / totalTaggedSets) * 100) : 0,
  };

  return {
    counts,
    percentages,
    totalTaggedSets,
    jointAlerts,
  };
}

/**
 * Gets the start of the ISO week (Monday at 00:00:00).
 */
function getStartOfWeek(date: Date): Date {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay();
  const diff = d.getUTCDate() - day + (day === 0 ? -6 : 1); // Monday is start
  d.setUTCDate(diff);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

/**
 * Generates ISO week label and range.
 */
function formatWeekLabel(monday: Date): { label: string; weekKey: string } {
  const sunday = new Date(monday);
  sunday.setUTCDate(monday.getUTCDate() + 6);

  const monthsEs = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  const startDay = monday.getUTCDate();
  const endDay = sunday.getUTCDate();
  const endMonth = monthsEs[sunday.getUTCMonth()];

  const label = `${startDay} - ${endDay} ${endMonth}`;
  const year = monday.getUTCFullYear();
  const weekNumber = Math.ceil(
    ((monday.getTime() - new Date(Date.UTC(year, 0, 1)).getTime()) / 86400000 + 1) / 7
  );
  const weekKey = `${year}-W${String(weekNumber).padStart(2, "0")}`;

  return { label, weekKey };
}

/**
 * Aggregates weekly training metrics over a continuous timeline.
 * Accurately marks gap weeks with `hasData: false` instead of inventing zeros or interpolating.
 */
export function aggregateWeeklyMetrics(
  history: WorkoutLoadEntry[],
  options?: { weeksCount?: number; now?: Date }
): WeeklyMetricsSummary[] {
  const weeksCount = options?.weeksCount ?? 6;
  const now = options?.now ?? new Date();

  // Determine standard weeks list ending with the current week
  const currentWeekMonday = getStartOfWeek(now);
  const weeks: WeeklyMetricsSummary[] = [];

  for (let i = weeksCount - 1; i >= 0; i--) {
    const monday = new Date(currentWeekMonday);
    monday.setUTCDate(currentWeekMonday.getUTCDate() - i * 7);
    const sunday = new Date(monday);
    sunday.setUTCDate(monday.getUTCDate() + 6);
    sunday.setUTCHours(23, 59, 59, 999);

    const { label, weekKey } = formatWeekLabel(monday);

    weeks.push({
      weekKey,
      weekLabel: label,
      startDate: monday.toISOString().slice(0, 10),
      endDate: sunday.toISOString().slice(0, 10),
      hasData: false,
      tonnageKg: 0,
      totalReps: 0,
      sessionsCount: 0,
      adherencePercent: null,
      topLimiter: null,
    });
  }

  // Map entries into weeks
  const limiterOccurrencesPerWeek = new Map<string, Record<WorkoutLimiterTag, number>>();
  const adherenceListPerWeek = new Map<string, number[]>();

  for (const entry of history) {
    if (!entry.date) continue;
    const entryDate = new Date(`${entry.date}T12:00:00Z`);

    // Find corresponding week
    const targetWeek = weeks.find((w) => {
      const s = new Date(`${w.startDate}T00:00:00Z`);
      const e = new Date(`${w.endDate}T23:59:59Z`);
      return entryDate >= s && entryDate <= e;
    });

    if (targetWeek) {
      targetWeek.hasData = true;
      targetWeek.sessionsCount += 1;

      const vol = calculateEntryVolume(entry);
      targetWeek.tonnageKg += vol.tonnageKg;
      targetWeek.totalReps += vol.totalReps;

      const adh = calculateAdherenceIndex(entry);
      if (adh !== null) {
        if (!adherenceListPerWeek.has(targetWeek.weekKey)) {
          adherenceListPerWeek.set(targetWeek.weekKey, []);
        }
        adherenceListPerWeek.get(targetWeek.weekKey)!.push(adh);
      }

      // Track limiters
      if (entry.setsDetail) {
        for (const set of entry.setsDetail) {
          if (set.limiterTag) {
            if (!limiterOccurrencesPerWeek.has(targetWeek.weekKey)) {
              limiterOccurrencesPerWeek.set(targetWeek.weekKey, {
                "muscular-failure": 0,
                cardiovascular: 0,
                "joint-discomfort": 0,
                "excessive-load": 0,
                "time-constraint": 0,
              });
            }
            const counts = limiterOccurrencesPerWeek.get(targetWeek.weekKey)!;
            counts[set.limiterTag] = (counts[set.limiterTag] ?? 0) + 1;
          }
        }
      }
    }
  }

  // Finalize averages and top limiter
  for (const week of weeks) {
    week.tonnageKg = Math.round(week.tonnageKg * 10) / 10;
    const adhList = adherenceListPerWeek.get(week.weekKey);
    if (adhList && adhList.length > 0) {
      const sum = adhList.reduce((acc, v) => acc + v, 0);
      week.adherencePercent = Math.round((sum / adhList.length) * 10) / 10;
    }

    const limiters = limiterOccurrencesPerWeek.get(week.weekKey);
    if (limiters) {
      let maxCount = 0;
      let top: WorkoutLimiterTag | null = null;
      for (const [tag, count] of Object.entries(limiters) as [WorkoutLimiterTag, number][]) {
        if (count > maxCount) {
          maxCount = count;
          top = tag;
        }
      }
      week.topLimiter = top;
    }
  }

  return weeks;
}

/**
 * Aggregates complete analytics for an entire TrainingTrack.
 */
export function aggregateTrackAnalytics(
  track: TrainingTrack,
  exerciseMap: Map<string, Exercise>,
  options?: { weeksCount?: number; now?: Date }
): TrackAnalytics {
  const allEntries: WorkoutLoadEntry[] = [];
  const muscleGroupDistribution: Record<string, MuscleGroupVolume> = {};
  const exerciseSummaries: Record<string, ExerciseSummary> = {};

  for (const item of track.workout) {
    const exercise = exerciseMap.get(item.exerciseId);
    const muscleGroup = exercise?.muscle_group ?? "general";
    const history = item.loadHistory ?? [];

    allEntries.push(...history);

    // Exercise PRs
    const prs = getPersonalRecords(history);
    const lastEntry = history.at(-1);

    exerciseSummaries[item.exerciseId] = {
      exerciseId: item.exerciseId,
      exerciseName: exercise?.name,
      totalTonnage: prs.totalLifetimeTonnage,
      prs,
      lastLoggedDate: lastEntry?.date ?? null,
      lastLoadKg: lastEntry?.loadKg ?? null,
      lastReps: lastEntry?.repsCompleted ?? null,
    };

    // Muscle group aggregation
    if (!muscleGroupDistribution[muscleGroup]) {
      muscleGroupDistribution[muscleGroup] = {
        tonnageKg: 0,
        totalReps: 0,
        setsCount: 0,
        exerciseCount: 0,
      };
    }

    muscleGroupDistribution[muscleGroup].exerciseCount += 1;
    muscleGroupDistribution[muscleGroup].tonnageKg += prs.totalLifetimeTonnage;
    muscleGroupDistribution[muscleGroup].totalReps += prs.totalRepsCompleted;
    muscleGroupDistribution[muscleGroup].setsCount += history.reduce((sum, e) => {
      return sum + (e.setsDetail?.length ?? item.sets);
    }, 0);
  }

  // Weekly history across track
  const weeklyHistory = aggregateWeeklyMetrics(allEntries, options);
  const limiterDistribution = aggregateLimiterDistribution(allEntries);

  return {
    trackId: track.id,
    trackName: track.name,
    totalTrackTonnage: Math.round(
      Object.values(muscleGroupDistribution).reduce((sum, m) => sum + m.tonnageKg, 0) * 10
    ) / 10,
    totalLoggedSessions: allEntries.length,
    weeklyHistory,
    muscleGroupDistribution,
    exerciseSummaries,
    limiterDistribution,
    jointDiscomfortCount: limiterDistribution.jointAlerts.length,
  };
}
