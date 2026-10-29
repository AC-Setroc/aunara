import React, { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Award,
  BarChart2,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Dumbbell,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  X,
} from "lucide-react";
import type {
  Exercise,
  LanguageCode,
  TrainingTrack,
  WorkoutItem,
  WorkoutLimiterTag,
} from "../types";
import {
  aggregateTrackAnalytics,
  calculateEntryVolume,
  estimateOneRepMax,
  getPersonalRecords,
} from "../lib/workoutAnalytics";
import { exerciseDisplayName } from "../lib/exercises";
import { TrendChart } from "./TrendChart";

export interface ProgressPanelProps {
  language?: LanguageCode;
  tracks: TrainingTrack[];
  activeTrack: TrainingTrack | null;
  exerciseMap: Map<string, Exercise>;
  onClose: () => void;
  onSelectTrack?: (trackId: string) => void;
}

type ProgressTab = "overview" | "exercises" | "fatigue";

const LIMITER_LABELS: Record<WorkoutLimiterTag, { es: string; en: string }> = {
  "muscular-failure": { es: "Fallo muscular", en: "Muscular failure" },
  cardiovascular: { es: "Falta de aire / Cardio", en: "Cardiovascular / Breathing" },
  "joint-discomfort": { es: "Molestia articular", en: "Joint discomfort" },
  "excessive-load": { es: "Carga excesiva", en: "Excessive load" },
  "time-constraint": { es: "Falta de tiempo", en: "Time constraint" },
};

const MUSCLE_GROUP_LABELS: Record<string, { es: string; en: string }> = {
  chest: { es: "Pecho", en: "Chest" },
  back: { es: "Espalda", en: "Back" },
  legs: { es: "Piernas", en: "Legs" },
  shoulders: { es: "Hombros", en: "Shoulders" },
  arms: { es: "Brazos", en: "Arms" },
  core: { es: "Core / Abdominales", en: "Core / Abs" },
  cardio: { es: "Cardiovascular", en: "Cardio" },
  general: { es: "General / Mixto", en: "General / Mixed" },
};

export function ProgressPanel({
  language = "es",
  tracks,
  activeTrack,
  exerciseMap,
  onClose,
  onSelectTrack,
}: ProgressPanelProps) {
  const [selectedTrackId, setSelectedTrackId] = useState<string>(activeTrack?.id ?? tracks[0]?.id ?? "");
  const [activeTab, setActiveTab] = useState<ProgressTab>("overview");
  const [weeksCount, setWeeksCount] = useState<number>(4);

  const currentTrack = useMemo(() => {
    return tracks.find((t) => t.id === selectedTrackId) ?? activeTrack ?? tracks[0] ?? null;
  }, [tracks, selectedTrackId, activeTrack]);

  // Aggregate analytics for current track
  const analytics = useMemo(() => {
    if (!currentTrack) return null;
    return aggregateTrackAnalytics(currentTrack, exerciseMap, {
      weeksCount: weeksCount === 0 ? 12 : weeksCount,
    });
  }, [currentTrack, exerciseMap, weeksCount]);

  // Selected exercise for "exercises" tab
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>(
    currentTrack?.workout[0]?.exerciseId ?? ""
  );

  const selectedWorkoutItem = useMemo(() => {
    if (!currentTrack) return null;
    return currentTrack.workout.find((item) => item.exerciseId === selectedExerciseId) ?? currentTrack.workout[0] ?? null;
  }, [currentTrack, selectedExerciseId]);

  const selectedExercise = selectedWorkoutItem
    ? exerciseMap.get(selectedWorkoutItem.exerciseId)
    : null;

  const exercisePRs = useMemo(() => {
    if (!selectedWorkoutItem) return null;
    return getPersonalRecords(selectedWorkoutItem.loadHistory ?? []);
  }, [selectedWorkoutItem]);

  const tr = (es: string, en: string) => (language === "es" ? es : en);

  // Overall Adherence calculation across current track's weekly history
  const overallAdherence = useMemo(() => {
    if (!analytics) return null;
    const weeksWithAdherence = analytics.weeklyHistory.filter((w) => w.adherencePercent !== null);
    if (weeksWithAdherence.length === 0) return null;
    const sum = weeksWithAdherence.reduce((acc, w) => acc + (w.adherencePercent ?? 0), 0);
    return Math.round((sum / weeksWithAdherence.length) * 10) / 10;
  }, [analytics]);

  if (!currentTrack || !analytics) {
    return (
      <aside className="progress-panel" aria-label={tr("Progreso y Analítica BI", "Progress & BI Analytics")}>
        <div className="progress-panel-header">
          <h2>{tr("Progreso y Analítica BI", "Progress & BI Analytics")}</h2>
          <button
            type="button"
            className="close-button inline"
            onClick={onClose}
            aria-label={tr("Cerrar analítica BI", "Close BI analytics")}
          >
            <X size={20} />
          </button>
        </div>
        <div className="empty-chart">
          <p>{tr("No hay rutas activas para analizar.", "No active tracks to analyze.")}</p>
        </div>
      </aside>
    );
  }

  // Prepare Chart Data: Weekly Tonnage
  const weeklyTonnageData = analytics.weeklyHistory.map((w) => ({
    label: w.weekLabel,
    value: w.tonnageKg,
    tooltipText: `${w.weekLabel}: ${w.tonnageKg.toLocaleString()} kg (${w.sessionsCount} ${tr("sesiones", "sessions")})`,
  }));

  // Prepare Chart Data: Muscle Group Breakdown
  const muscleGroupData = Object.entries(analytics.muscleGroupDistribution)
    .filter(([_, data]) => data.tonnageKg > 0)
    .map(([group, data]) => {
      const label = MUSCLE_GROUP_LABELS[group]?.[language === "es" ? "es" : "en"] ?? group;
      const pct = analytics.totalTrackTonnage > 0
        ? Math.round((data.tonnageKg / analytics.totalTrackTonnage) * 100)
        : 0;
      return {
        label,
        value: data.tonnageKg,
        secondary: `${pct}%`,
      };
    })
    .sort((a, b) => b.value - a.value);

  // Prepare Chart Data: Limiter Distribution
  const limiterChartData = (Object.keys(LIMITER_LABELS) as WorkoutLimiterTag[]).map((tag) => {
    const label = LIMITER_LABELS[tag][language === "es" ? "es" : "en"];
    const count = analytics.limiterDistribution.counts[tag];
    const pct = analytics.limiterDistribution.percentages[tag];
    return {
      label,
      value: count,
      secondary: `${pct}%`,
      isAlert: tag === "joint-discomfort" && count > 0,
    };
  });

  // Prepare Chart Data: Progression for Selected Exercise
  const exerciseProgressionData = (selectedWorkoutItem?.loadHistory ?? [])
    .filter((entry) => entry.loadKg !== null && entry.loadKg !== undefined)
    .map((entry) => {
      let reps = 8;
      if (entry.setsDetail && entry.setsDetail.length > 0) {
        const lastSet = entry.setsDetail.at(-1);
        if (lastSet?.actualReps) reps = lastSet.actualReps;
      } else if (typeof entry.repsCompleted === "number") {
        reps = entry.repsCompleted;
      }
      const e1rm = estimateOneRepMax(entry.loadKg, reps);

      return {
        label: entry.date.slice(5), // "10-26"
        value: entry.loadKg ?? 0,
        secondary: e1rm ? `1RM ~${e1rm.e1rm}kg` : undefined,
      };
    });

  return (
    <aside className="progress-panel" aria-label={tr("Progreso y Analítica BI", "Progress & BI Analytics")}>
      {/* Header */}
      <div className="progress-panel-header">
        <div>
          <p className="eyebrow">{currentTrack.name} · {tr("Inteligencia de Entrenamiento", "Training Intelligence")}</p>
          <h2>{tr("Progreso y Analítica BI", "Progress & BI Analytics")}</h2>
        </div>
        <button
          type="button"
          className="close-button inline"
          onClick={onClose}
          aria-label={tr("Cerrar analítica BI", "Close BI analytics")}
        >
          <X size={20} />
        </button>
      </div>

      {/* Control bar: Track selection and time range */}
      <div className="progress-controls-bar">
        {tracks.length > 1 && (
          <div className="progress-track-selector">
            <label htmlFor="bi-track-select" className="sr-only">
              {tr("Ruta activa", "Active track")}
            </label>
            <div className="select-wrapper">
              <select
                id="bi-track-select"
                value={currentTrack.id}
                onChange={(e) => {
                  setSelectedTrackId(e.target.value);
                  onSelectTrack?.(e.target.value);
                }}
              >
                {tracks.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="select-arrow" />
            </div>
          </div>
        )}

        <div className="progress-time-pills" role="radiogroup" aria-label={tr("Rango de tiempo", "Time range")}>
          <button
            type="button"
            className={`pill-button ${weeksCount === 4 ? "is-active" : ""}`}
            onClick={() => setWeeksCount(4)}
          >
            {tr("4 Semanas", "4 Weeks")}
          </button>
          <button
            type="button"
            className={`pill-button ${weeksCount === 8 ? "is-active" : ""}`}
            onClick={() => setWeeksCount(8)}
          >
            {tr("8 Semanas", "8 Weeks")}
          </button>
          <button
            type="button"
            className={`pill-button ${weeksCount === 12 ? "is-active" : ""}`}
            onClick={() => setWeeksCount(12)}
          >
            {tr("12 Semanas", "12 Weeks")}
          </button>
          <button
            type="button"
            className={`pill-button ${weeksCount === 0 ? "is-active" : ""}`}
            onClick={() => setWeeksCount(0)}
          >
            {tr("Todo", "All")}
          </button>
        </div>
      </div>

      {/* Top Level KPIs */}
      <div className="progress-kpi-grid">
        <div className="progress-kpi-card">
          <div className="kpi-icon-wrap">
            <Dumbbell size={20} />
          </div>
          <div className="kpi-body">
            <span className="kpi-label">{tr("Volumen acumulado", "Accumulated volume")}</span>
            <strong className="kpi-value">
              {analytics.totalTrackTonnage.toLocaleString()} <span className="kpi-unit">kg</span>
            </strong>
            <span className="kpi-subtext">
              {analytics.totalLoggedSessions} {tr("sesiones registradas", "logged sessions")}
            </span>
          </div>
        </div>

        <div className="progress-kpi-card">
          <div className="kpi-icon-wrap">
            <TrendingUp size={20} />
          </div>
          <div className="kpi-body">
            <span className="kpi-label">{tr("Adherencia al volumen", "Volume adherence")}</span>
            <strong className="kpi-value">
              {overallAdherence !== null ? `${overallAdherence}%` : "—"}
            </strong>
            <span className="kpi-subtext">
              {tr("Repeticiones reales vs meta", "Actual vs target reps")}
            </span>
          </div>
        </div>

        <div className="progress-kpi-card">
          <div className="kpi-icon-wrap">
            <Award size={20} />
          </div>
          <div className="kpi-body">
            <span className="kpi-label">{tr("Récords Personales (PRs)", "Personal Records (PRs)")}</span>
            <strong className="kpi-value">
              {Object.values(analytics.exerciseSummaries).filter((s) => s.prs.maxLoadKg !== null).length}
            </strong>
            <span className="kpi-subtext">
              {tr("En ejercicios de esta ruta", "Across this track")}
            </span>
          </div>
        </div>

        <div className={`progress-kpi-card ${analytics.jointDiscomfortCount > 0 ? "is-alert" : ""}`}>
          <div className="kpi-icon-wrap">
            {analytics.jointDiscomfortCount > 0 ? <ShieldAlert size={20} /> : <ShieldCheck size={20} />}
          </div>
          <div className="kpi-body">
            <span className="kpi-label">{tr("Estado articular", "Joint status")}</span>
            <strong className="kpi-value">
              {analytics.jointDiscomfortCount > 0
                ? `${analytics.jointDiscomfortCount} ${tr("alertas", "alerts")}`
                : tr("Óptimo", "Optimal")}
            </strong>
            <span className="kpi-subtext">
              {analytics.jointDiscomfortCount > 0
                ? tr("Molestia registrada en series", "Discomfort logged in sets")
                : tr("Cero molestias articulares", "Zero joint issues")}
            </span>
          </div>
        </div>
      </div>

      {/* Segmented control navigation */}
      <div className="progress-tab-bar" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "overview"}
          className={`progress-tab-button ${activeTab === "overview" ? "is-active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          <BarChart2 size={16} /> {tr("Resumen General", "Overview")}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "exercises"}
          className={`progress-tab-button ${activeTab === "exercises" ? "is-active" : ""}`}
          onClick={() => setActiveTab("exercises")}
        >
          <Dumbbell size={16} /> {tr("Por Ejercicio", "By Exercise")}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "fatigue"}
          className={`progress-tab-button ${activeTab === "fatigue" ? "is-active" : ""}`}
          onClick={() => setActiveTab("fatigue")}
        >
          <Activity size={16} /> {tr("Auditoría de Fatiga", "Fatigue Audit")}
        </button>
      </div>

      {/* Tab Content */}
      <div className="progress-tab-content">
        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="progress-overview-section">
            <div className="progress-charts-row">
              <TrendChart
                title={tr("Volumen Semanal Acumulado", "Weekly Accumulated Volume")}
                subtitle={tr("Tonelaje total levantado por semana", "Total tonnage lifted per week")}
                data={weeklyTonnageData}
                type="bar"
                unit="kg"
                emptyMessage={tr("Aún no hay sesiones registradas en este periodo", "No logged sessions in this period")}
              />

              <TrendChart
                title={tr("Distribución por Grupo Muscular", "Muscle Group Distribution")}
                subtitle={tr("Volumen de trabajo según zona anatómica", "Work volume by anatomical zone")}
                data={muscleGroupData}
                type="horizontal-bar"
                unit="kg"
                emptyMessage={tr("Sin registros musculares", "No muscle records")}
              />
            </div>

            {/* Notable PRs Highlights */}
            <div className="progress-prs-block">
              <h3 className="section-title">
                <Award size={18} /> {tr("Récords Personales Activos", "Active Personal Records")}
              </h3>
              <div className="prs-chips-grid">
                {currentTrack.workout.map((item) => {
                  const ex = exerciseMap.get(item.exerciseId);
                  const pr = getPersonalRecords(item.loadHistory ?? []);
                  if (!pr.maxLoadKg) return null;

                  return (
                    <div key={item.exerciseId} className="pr-chip-card">
                      <div className="pr-chip-header">
                        <strong>{ex ? exerciseDisplayName(ex, language) : item.exerciseId}</strong>
                        <span className="pr-chip-date">{pr.maxLoadKg.date}</span>
                      </div>
                      <div className="pr-chip-body">
                        <span className="pr-chip-stat">
                          {tr("Carga máx:", "Max load:")} <strong>{pr.maxLoadKg.value} kg</strong> ({pr.maxLoadKg.reps ?? 8} reps)
                        </span>
                        {pr.maxEstimated1RM && (
                          <span className="pr-chip-stat">
                            1RM est: <strong>{pr.maxEstimated1RM.value} kg</strong>
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: EXERCISES */}
        {activeTab === "exercises" && (
          <div className="progress-exercises-section">
            <div className="exercise-selector-bar">
              <label htmlFor="exercise-bi-select">
                {tr("Seleccionar ejercicio:", "Select exercise:")}
              </label>
              <div className="select-wrapper">
                <select
                  id="exercise-bi-select"
                  value={selectedExerciseId}
                  onChange={(e) => setSelectedExerciseId(e.target.value)}
                >
                  {currentTrack.workout.map((item) => {
                    const ex = exerciseMap.get(item.exerciseId);
                    return (
                      <option key={item.exerciseId} value={item.exerciseId}>
                        {ex ? exerciseDisplayName(ex, language) : item.exerciseId}
                      </option>
                    );
                  })}
                </select>
                <ChevronDown size={14} className="select-arrow" />
              </div>
            </div>

            {selectedWorkoutItem && selectedExercise && exercisePRs && (
              <div className="exercise-bi-detail">
                {/* Exercise Headline Info */}
                <div className="exercise-bi-header-card">
                  <div>
                    <h4>{exerciseDisplayName(selectedExercise, language)}</h4>
                    <p className="exercise-bi-taxonomy">
                      {MUSCLE_GROUP_LABELS[selectedExercise.muscle_group]?.[language === "es" ? "es" : "en"] ?? selectedExercise.muscle_group} · {selectedExercise.equipment}
                    </p>
                  </div>
                  <div className="exercise-bi-stats">
                    <div>
                      <span>{tr("Carga Máxima", "Max Load")}</span>
                      <strong>{exercisePRs.maxLoadKg ? `${exercisePRs.maxLoadKg.value} kg` : "—"}</strong>
                    </div>
                    <div>
                      <span>{tr("1RM Estimada", "Estimated 1RM")}</span>
                      <strong>{exercisePRs.maxEstimated1RM ? `${exercisePRs.maxEstimated1RM.value} kg` : "—"}</strong>
                    </div>
                    <div>
                      <span>{tr("Volumen Total", "Total Volume")}</span>
                      <strong>{exercisePRs.totalLifetimeTonnage.toLocaleString()} kg</strong>
                    </div>
                  </div>
                </div>

                {/* Progression Chart */}
                <TrendChart
                  title={tr("Progresión de Carga (kg)", "Load Progression (kg)")}
                  subtitle={tr("Cargas máximas levantadas en cada sesión", "Max loads lifted per session")}
                  data={exerciseProgressionData}
                  type="line"
                  unit="kg"
                  emptyMessage={tr("Aún no hay cargas registradas para este movimiento", "No loads logged for this movement yet")}
                />

                {/* Session by session history log table */}
                <div className="exercise-history-table-wrapper">
                  <h5>{tr("Historial Serie a Serie", "Set-by-Set History")}</h5>
                  {(!selectedWorkoutItem.loadHistory || selectedWorkoutItem.loadHistory.length === 0) ? (
                    <p className="no-history-text">{tr("Sin sesiones registradas aún.", "No logged sessions yet.")}</p>
                  ) : (
                    <div className="exercise-history-table">
                      {selectedWorkoutItem.loadHistory.slice().reverse().map((entry) => {
                        const vol = calculateEntryVolume(entry);
                        return (
                          <div key={entry.id} className="history-entry-row">
                            <div className="history-entry-meta">
                              <span className="history-date">{entry.date}</span>
                              <span className="history-volume">{vol.tonnageKg} kg {tr("vol.", "vol.")}</span>
                              {entry.effort && <span className="history-effort">{entry.effort}</span>}
                            </div>

                            <div className="history-entry-sets">
                              {entry.setsDetail && entry.setsDetail.length > 0 ? (
                                <div className="sets-badges-list">
                                  {entry.setsDetail.map((s) => (
                                    <div
                                      key={s.setNumber}
                                      className={`set-badge ${s.completed ? "is-completed" : "is-incomplete"} ${s.limiterTag === "joint-discomfort" ? "is-alert" : ""}`}
                                    >
                                      <span className="set-num">S{s.setNumber}:</span>
                                      <span className="set-reps">{s.actualReps ?? 0}r</span>
                                      {s.loadKg !== null && <span className="set-kg">@{s.loadKg}k</span>}
                                      {s.limiterTag && (
                                        <span className="set-limiter-tag">
                                          {LIMITER_LABELS[s.limiterTag]?.[language === "es" ? "es" : "en"]}
                                        </span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="legacy-sets-summary">
                                  {entry.loadKg ? `${entry.loadKg} kg · ` : ""}
                                  {entry.repsCompleted ? `${entry.repsCompleted} reps · ` : ""}
                                  {entry.setPlan}
                                </div>
                              )}
                              {entry.loadNote && <p className="history-note">“{entry.loadNote}”</p>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: FATIGUE AUDIT */}
        {activeTab === "fatigue" && (
          <div className="progress-fatigue-section">
            <div className="fatigue-intro-card">
              <h4>{tr("Auditoría de Fatiga y Limitantes", "Fatigue & Limiters Audit")}</h4>
              <p>
                {tr(
                  "Taxonomía de 1 toque registrada en cada serie donde no se alcanzó la meta. Te ayuda a entender con precisión qué frena tu rendimiento para ajustar el estímulo sin dañar tus articulaciones.",
                  "1-tap taxonomy logged whenever a target was not met. Helps you understand what limits your performance so you can adjust stimulus without risking joint health."
                )}
              </p>
            </div>

            {/* Limiter distribution chart */}
            <TrendChart
              title={tr("Frecuencia de Factores Limitantes", "Limiter Factors Frequency")}
              subtitle={tr("Motivos registrados al interrumpir o finalizar series", "Reasons logged when ending or modifying sets")}
              data={limiterChartData}
              type="horizontal-bar"
              unit={tr("series", "sets")}
            />

            {/* Smart Honest Feedback */}
            <div className="fatigue-diagnostic-card">
              <h5>{tr("Diagnóstico Objetivo", "Objective Diagnostic")}</h5>
              {analytics.limiterDistribution.totalTaggedSets === 0 ? (
                <p className="diagnostic-text">
                  <CheckCircle2 size={18} className="text-success" />{" "}
                  {tr(
                    "No hay desviaciones ni fallos registrados en este periodo. Todas las series se completaron conforme al plan.",
                    "No deviations or failures logged in this period. All sets were completed according to plan."
                  )}
                </p>
              ) : (
                <div className="diagnostic-summary">
                  {analytics.limiterDistribution.counts["muscular-failure"] > 0 && (
                    <div className="diagnostic-point">
                      <strong>{tr("Estímulo mecánico efectivo:", "Effective mechanical stimulus:")}</strong>{" "}
                      {tr(
                        `El ${analytics.limiterDistribution.percentages["muscular-failure"]}% de las series finalizadas antes de la meta correspondieron a fallo muscular concéntrico directo, lo que indica un estímulo de hipertrofia de alta calidad.`,
                        `${analytics.limiterDistribution.percentages["muscular-failure"]}% of unfinished sets reached direct concentric muscular failure, indicating high quality hypertrophy stimulus.`
                      )}
                    </div>
                  )}

                  {analytics.limiterDistribution.counts["excessive-load"] > 0 && (
                    <div className="diagnostic-point">
                      <strong>{tr("Ajuste de sobrecarga sugerido:", "Suggested overload adjustment:")}</strong>{" "}
                      {tr(
                        `Se detectó sobrecarga excesiva en ${analytics.limiterDistribution.counts["excessive-load"]} series. Recomendamos pausar progresiones agresivas o reducir un 5% la carga para priorizar control excéntrico y rango completo.`,
                        `Excessive load detected in ${analytics.limiterDistribution.counts["excessive-load"]} sets. We suggest pausing aggressive progressions or reducing weight by 5% to preserve eccentric control and full ROM.`
                      )}
                    </div>
                  )}

                  {analytics.limiterDistribution.counts["cardiovascular"] > 0 && (
                    <div className="diagnostic-point">
                      <strong>{tr("Capacidad cardiovascular:", "Cardiovascular capacity:")}</strong>{" "}
                      {tr(
                        `Falta de aire reportada en ${analytics.limiterDistribution.counts["cardiovascular"]} series. Si ocurre en superseries o biseries, aumentá 15-30 segundos el descanso intra-bloque.`,
                        `Shortness of breath reported in ${analytics.limiterDistribution.counts["cardiovascular"]} sets. If happening on supersets/bisets, increase intra-block rest by 15-30 seconds.`
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Joint discomfort alerts section */}
            {analytics.limiterDistribution.jointAlerts.length > 0 && (
              <div className="joint-alerts-card">
                <div className="alert-card-header">
                  <AlertTriangle size={20} className="text-alert" />
                  <h5>{tr("Alertas de Molestia Articular Registradas", "Logged Joint Discomfort Alerts")}</h5>
                </div>
                <p className="alert-card-desc">
                  {tr(
                    "Las siguientes series fueron detenidas por molestia articular. Monitoreá estas articulaciones antes de incrementar volumen o carga.",
                    "The following sets were stopped due to joint discomfort. Monitor these joints before increasing volume or load."
                  )}
                </p>
                <div className="joint-alerts-list">
                  {analytics.limiterDistribution.jointAlerts.map((alert, idx) => (
                    <div key={idx} className="joint-alert-item">
                      <span className="alert-date">{alert.date}</span>
                      <span className="alert-detail">
                        {tr("Serie", "Set")} {alert.setNumber ?? 1}
                        {alert.loadKg ? ` @ ${alert.loadKg} kg` : ""} ({alert.actualReps ?? 0} reps)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Branding */}
      <div className="progress-panel-footer">
        <span>{tr("Desarrollado por AC Setroc", "Developed by AC Setroc")}</span>
      </div>
    </aside>
  );
}
