import { AlertTriangle, Clock, Dumbbell, Info, Pencil, ShieldCheck, UserRound, X } from "lucide-react";
import { exerciseDisplayName, generateAdaptiveTrackWorkout, WEEKDAYS } from "../lib/exercises";
import { techniqueLabel, repetitionCountSuffix, workTargetLabel } from "../lib/workoutPrescription";
import { tr } from "../lib/i18n";
import type { ExerciseReadinessAssessment } from "../lib/wellness";
import type { Exercise, LanguageCode, MovementRestriction, TrainingLimitation, TrainingTrack, Weekday } from "../types";
import { trackFocusLabel } from "./TrainingTracks";

interface InitialRoutineProposalProps {
  language: LanguageCode;
  variant?: "initial" | "track";
  track: TrainingTrack;
  exerciseMap: Map<string, Exercise>;
  exercises?: Exercise[];
  limitations?: TrainingLimitation[];
  healthNotes?: string;
  readiness?: ExerciseReadinessAssessment;
  onOpenExercise: (exercise: Exercise) => void;
  onAccept: () => void;
  onEdit: () => void;
  onReject: () => void;
  onReviewHealth?: () => void;
  onUpdateProposal?: (updatedTrack: TrainingTrack) => void;
}

const RESTRICTION_LABELS: Record<MovementRestriction, [string, string]> = {
  impact: ["impact or jumping", "impacto o saltos"],
  "deep-knee-flexion": ["deep knee flexion", "flexión profunda de rodilla"],
  "hip-hinge": ["hip hinge", "bisagra de cadera"],
  overhead: ["overhead movement", "movimiento sobre la cabeza"],
  push: ["pushing", "empuje"],
  pull: ["pulling", "jalón"],
  rotation: ["trunk rotation", "rotación de tronco"],
  "single-leg-balance": ["single-leg balance", "equilibrio a una pierna"],
};

function hasExcessiveConsecutiveDays(trainingDays: Weekday[], threshold = 4): boolean {
  if (trainingDays.length < threshold) return false;
  const allDays: Weekday[] = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
  const daySet = new Set(trainingDays);
  const circular = [...allDays, ...allDays];
  let consecutive = 0;
  for (const day of circular) {
    if (daySet.has(day)) {
      consecutive += 1;
      if (consecutive >= threshold) return true;
    } else {
      consecutive = 0;
    }
  }
  return false;
}

export function InitialRoutineProposal({
  language,
  variant = "initial",
  track,
  exerciseMap,
  exercises,
  limitations = [],
  healthNotes = "",
  readiness = { level: "ready", reasons: [] },
  onOpenExercise,
  onAccept,
  onEdit,
  onReject,
  onReviewHealth,
  onUpdateProposal,
}: InitialRoutineProposalProps) {
  const isInitial = variant === "initial";
  const heading = isInitial
    ? tr(language, "Review your first routine", "Revisá tu primera rutina")
    : tr(language, "Review suggested routine", "Revisá la rutina sugerida");
  const blocked = readiness.level === "professional-review" || readiness.level === "setup";
  const trainingDays = track.trainingDays && track.trainingDays.length > 0
    ? track.trainingDays
    : WEEKDAYS.slice(0, Math.max(1, track.daysPerWeek));
  const days = WEEKDAYS.filter((day) => trainingDays.includes(day) || track.workout.some((item) => (item.day ?? "monday") === day));
  if (!days.length) days.push(...WEEKDAYS.slice(0, Math.max(1, track.daysPerWeek)));
  const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const dayNamesEs = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
  const dayShortEn = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const dayShortEs = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

  const hasConsecutiveWarning = hasExcessiveConsecutiveDays(trainingDays, 4);

  const handleDaysCountSelect = (count: number) => {
    let newDays = [...trainingDays];
    if (count !== newDays.length) {
      if (count < newDays.length) {
        newDays = newDays.slice(0, count);
      } else {
        const remaining = WEEKDAYS.filter((d) => !newDays.includes(d));
        newDays = [...newDays, ...remaining.slice(0, count - newDays.length)];
      }
    }

    let updatedWorkout = track.workout;
    let updatedAdaptations = track.adaptations ?? [];
    if (exercises && exercises.length > 0) {
      const generated = generateAdaptiveTrackWorkout(
        exercises,
        { ...track, daysPerWeek: count, trainingDays: newDays },
        limitations
      );
      updatedWorkout = generated.workout;
      updatedAdaptations = generated.adaptations;
    }

    onUpdateProposal?.({
      ...track,
      daysPerWeek: count,
      trainingDays: newDays,
      workout: updatedWorkout,
      adaptations: updatedAdaptations,
    });
  };

  const handleSessionMinutesSelect = (minutes: number) => {
    onUpdateProposal?.({
      ...track,
      sessionMinutes: minutes,
    });
  };

  const handleDayToggle = (day: Weekday) => {
    let newDays: Weekday[];
    if (trainingDays.includes(day)) {
      if (trainingDays.length <= 1) return;
      newDays = trainingDays.filter((d) => d !== day);
    } else {
      newDays = [...trainingDays, day];
    }

    let updatedWorkout = track.workout;
    let updatedAdaptations = track.adaptations ?? [];
    if (exercises && exercises.length > 0) {
      const generated = generateAdaptiveTrackWorkout(
        exercises,
        { ...track, daysPerWeek: newDays.length, trainingDays: newDays },
        limitations
      );
      updatedWorkout = generated.workout;
      updatedAdaptations = generated.adaptations;
    }

    onUpdateProposal?.({
      ...track,
      daysPerWeek: newDays.length,
      trainingDays: newDays,
      workout: updatedWorkout,
      adaptations: updatedAdaptations,
    });
  };

  return (
    <div className="initial-proposal-backdrop">
      <section
        className="initial-proposal"
        role="dialog"
        aria-modal="true"
        aria-label={heading}
      >
        <div className="initial-proposal-heading">
          <span><ShieldCheck size={27} /></span>
          <div>
            <p className="eyebrow">{isInitial
              ? tr(language, "Your profile is ready / next step", "Tu perfil está listo / siguiente paso")
              : tr(language, "Suggested route / review before saving", "Ruta sugerida / revisá antes de guardar")}</p>
            <h2>{heading}</h2>
          </div>
        </div>

        <p className="initial-proposal-intro">
          {tr(
            language,
            "We used your goal, available equipment, weekly frequency and session time to prepare this starting point. It is not saved until you choose.",
            "Usamos tu objetivo, equipo disponible, frecuencia semanal y tiempo por sesión para preparar este punto de partida. No se guarda hasta que elijás.",
          )}
        </p>

        <div className="proposal-live-tune">
          <div className="tune-row">
            <span className="tune-label">{tr(language, "Frequency (days per week):", "Frecuencia (días por semana):")}</span>
            <div className="tune-pills" role="group" aria-label={tr(language, "Weekly frequency selector", "Selector de frecuencia semanal")}>
              {[2, 3, 4, 5, 6, 7].map((num) => (
                <button
                  key={num}
                  type="button"
                  className={`tune-pill ${track.daysPerWeek === num ? "is-selected" : ""}`}
                  onClick={() => handleDaysCountSelect(num)}
                >
                  {num}d
                </button>
              ))}
            </div>
          </div>

          <div className="tune-row">
            <span className="tune-label">{tr(language, "Session duration:", "Duración por sesión:")}</span>
            <div className="tune-pills" role="group" aria-label={tr(language, "Session duration selector", "Selector de duración")}>
              {[30, 45, 60, 75, 90].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  className={`tune-pill ${track.sessionMinutes === mins ? "is-selected" : ""}`}
                  onClick={() => handleSessionMinutesSelect(mins)}
                >
                  <Clock size={12} /> {mins} min
                </button>
              ))}
            </div>
          </div>

          {track.daysPerWeek < 7 && (
            <div className="tune-row">
              <span className="tune-label">{tr(language, "Training days (tap to move or toggle):", "Días de entreno (toca para mover o alternar):")}</span>
              <div className="tune-pills" role="group" aria-label={tr(language, "Day distribution selector", "Distribución de días")}>
                {WEEKDAYS.map((day, idx) => {
                  const isDaySelected = trainingDays.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      className={`tune-pill day-pill ${isDaySelected ? "is-selected" : ""}`}
                      onClick={() => handleDayToggle(day)}
                    >
                      {tr(language, dayShortEn[idx], dayShortEs[idx])}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {hasConsecutiveWarning && (
            <div className="proposal-consecutive-alert" role="status">
              <Info size={16} />
              <span>
                {tr(
                  language,
                  "Suggestion: 4 or more consecutive training days may reduce recovery quality. We suggest spacing rest days, though the final choice is yours.",
                  "Sugerencia: 4 o más días de entrenamiento consecutivos pueden sobrecargar la recuperación. Te sugerimos intercalar descansos, pero la palabra final es tuya."
                )}
              </span>
            </div>
          )}
        </div>

        <div className="initial-proposal-summary">
          <div><span>{tr(language, "Goal", "Objetivo")}</span><strong>{trackFocusLabel(track.focus, language)}</strong></div>
          <div><span>{tr(language, "Frequency", "Frecuencia")}</span><strong>{track.daysPerWeek}× {tr(language, "per week", "por semana")}</strong></div>
          <div><span>{tr(language, "Session", "Sesión")}</span><strong>{track.sessionMinutes} min</strong></div>
        </div>

        <div className="initial-proposal-movements">
          <div>
            <h3>{tr(language, "Suggested movements", "Movimientos sugeridos")}</h3>
            <span>{track.workout.length}</span>
          </div>
          {days.map((day) => <section className="proposal-day" key={day} aria-label={tr(language, dayNames[WEEKDAYS.indexOf(day)], dayNamesEs[WEEKDAYS.indexOf(day)])}>
          <h4>{tr(language, dayNames[WEEKDAYS.indexOf(day)], dayNamesEs[WEEKDAYS.indexOf(day)])}{track.dayLabels?.[day] ? ` · ${track.dayLabels[day]}` : ""}</h4>
          {!track.workout.some((item) => (item.day ?? "monday") === day) && <p>{tr(language, "No exercises assigned", "Sin ejercicios asignados")}</p>}
          <ol>
            {track.workout.filter((item) => (item.day ?? "monday") === day).map((item) => {
              const exercise = exerciseMap.get(item.exerciseId);
              return exercise ? (
                <li key={item.id ?? item.exerciseId}>
                  <button
                    type="button"
                    onClick={() => onOpenExercise(exercise)}
                    aria-label={`${tr(language, "View", "Ver")} ${exerciseDisplayName(exercise, language)}`}
                  >
                    <Dumbbell size={15} />
                    <span><strong>{exerciseDisplayName(exercise, language)}</strong><small>{item.prescriptionMode === "special" && item.specialPrescription
                      ? `${item.specialPrescription.rounds} × ${techniqueLabel(item.specialPrescription.technique, language)} · ${item.specialPrescription.blocks.map((block) => block.type === "rest" ? `${block.seconds}s ${tr(language, "rest", "descanso")}` : `${workTargetLabel(block, language)}${block.loadValue !== undefined ? ` / ${block.loadValue} ${block.loadType}` : ""}`).join(" → ")} · ${item.specialPrescription.restBetweenRoundsSeconds}s ${tr(language, "between rounds", "entre rondas")}`
                      : `${item.sets} × ${item.reps}${repetitionCountSuffix(item.repetitionCount, language)}`}</small></span>
                  </button>
                </li>
              ) : null;
            })}
          </ol>
          </section>)}
        </div>

        {track.adaptations?.length ? (
          <section className="proposal-adaptations" aria-label={tr(language, "Applied adaptations", "Adaptaciones aplicadas")}>
            <h3>{tr(language, "What Aunara changed", "Qué cambió Aunara")}</h3>
            <p>{tr(
              language,
              "This automatic filter matches exercise movement tags against the restrictions you saved. It is not a clinical assessment, so review every movement and follow professional guidance.",
              "Este filtro automático compara etiquetas de movimiento con las restricciones que guardaste. No es una valoración clínica: revisá cada ejercicio y seguí las indicaciones profesionales.",
            )}</p>
            <ul>
              {track.adaptations.map((adaptation) => {
                const excluded = exerciseMap.get(adaptation.excludedExerciseId);
                const replacement = adaptation.replacementExerciseId
                  ? exerciseMap.get(adaptation.replacementExerciseId)
                  : null;
                const restrictionText = adaptation.restrictions
                  .map((restriction) => tr(language, ...RESTRICTION_LABELS[restriction]))
                  .join(", ");
                return (
                  <li key={`${adaptation.excludedExerciseId}-${adaptation.replacementExerciseId ?? "removed"}`}>
                    <strong>{excluded ? exerciseDisplayName(excluded, language) : adaptation.excludedExerciseId}</strong>
                    <span>{replacement
                      ? tr(
                        language,
                        `was replaced with ${exerciseDisplayName(replacement, language)} because it matched: ${restrictionText}.`,
                        `se reemplazó por ${exerciseDisplayName(replacement, language)} porque coincidía con: ${restrictionText}.`,
                      )
                      : tr(
                        language,
                        `was removed because it matched ${restrictionText} and no compatible replacement was found.`,
                        `se quitó porque coincidía con ${restrictionText} y no se encontró un reemplazo compatible.`,
                      )}</span>
                  </li>
                );
              })}
            </ul>
          </section>
        ) : null}

        {blocked && (
          <div className="proposal-safety-stop" role="alert">
            <AlertTriangle size={21} />
            <div>
              <strong>{readiness.level === "setup"
                ? tr(language, "Complete your exercise-readiness review first", "Completá primero tu revisión de preparación para el ejercicio")
                : tr(language, "Professional review is recommended before accepting this routine", "Se recomienda valoración profesional antes de aceptar esta rutina")}</strong>
              {readiness.reasons.map((reason) => <span key={reason}>{reason}</span>)}
              {onReviewHealth && (
                <button type="button" onClick={onReviewHealth}>
                  <UserRound size={15} /> {tr(language, "Review health information", "Revisar información de salud")}
                </button>
              )}
            </div>
          </div>
        )}

        {healthNotes.trim() && (
          <p className="initial-proposal-health-note">
            <strong>{tr(language, "Your saved health note needs your review.", "Tu nota de salud guardada necesita tu revisión.")}</strong>{" "}
            {tr(
              language,
              "Aunara does not medically interpret free text or replace professional guidance; open each movement and reject or edit anything that conflicts with your instructions.",
              "Aunara no interpreta médicamente el texto libre ni reemplaza indicaciones profesionales; abrí cada movimiento y rechazá o editá lo que contradiga tus indicaciones.",
            )}
          </p>
        )}

        <p className="initial-proposal-note">
          {tr(
            language,
            "You can accept it as is, edit every movement, or reject it and create another route later.",
            "Podés aceptarla tal como está, editar cada movimiento, o rechazarla y crear otra ruta después.",
          )}
        </p>

        <div className="initial-proposal-actions">
          <button type="button" className="is-secondary" onClick={onReject}><X size={16} /> {tr(language, "Reject proposal", "Rechazar propuesta")}</button>
          <button type="button" className="is-secondary" onClick={onEdit} disabled={blocked}><Pencil size={16} /> {tr(language, "Edit", "Editar")}</button>
          <button type="button" className="is-primary" onClick={onAccept} disabled={blocked}><ShieldCheck size={16} /> {tr(language, "Accept routine", "Aceptar rutina")}</button>
        </div>
      </section>
    </div>
  );
}
