import { AlertTriangle, Dumbbell, Pencil, ShieldCheck, UserRound, X } from "lucide-react";
import { exerciseDisplayName } from "../lib/exercises";
import { tr } from "../lib/i18n";
import type { ExerciseReadinessAssessment } from "../lib/wellness";
import type { Exercise, LanguageCode, MovementRestriction, TrainingTrack } from "../types";
import { trackFocusLabel } from "./TrainingTracks";

interface InitialRoutineProposalProps {
  language: LanguageCode;
  variant?: "initial" | "track";
  track: TrainingTrack;
  exerciseMap: Map<string, Exercise>;
  healthNotes?: string;
  readiness?: ExerciseReadinessAssessment;
  onOpenExercise: (exercise: Exercise) => void;
  onAccept: () => void;
  onEdit: () => void;
  onReject: () => void;
  onReviewHealth?: () => void;
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

export function InitialRoutineProposal({
  language,
  variant = "initial",
  track,
  exerciseMap,
  healthNotes = "",
  readiness = { level: "ready", reasons: [] },
  onOpenExercise,
  onAccept,
  onEdit,
  onReject,
  onReviewHealth,
}: InitialRoutineProposalProps) {
  const isInitial = variant === "initial";
  const heading = isInitial
    ? tr(language, "Review your first routine", "Revisá tu primera rutina")
    : tr(language, "Review suggested routine", "Revisá la rutina sugerida");
  const blocked = readiness.level === "professional-review" || readiness.level === "setup";
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
          <ol>
            {track.workout.map((item) => {
              const exercise = exerciseMap.get(item.exerciseId);
              return exercise ? (
                <li key={item.id ?? item.exerciseId}>
                  <button
                    type="button"
                    onClick={() => onOpenExercise(exercise)}
                    aria-label={`${tr(language, "View", "Ver")} ${exerciseDisplayName(exercise, language)}`}
                  >
                    <Dumbbell size={15} />
                    <span><strong>{exerciseDisplayName(exercise, language)}</strong><small>{item.setPlan ?? `${item.sets} × ${item.reps}`}</small></span>
                  </button>
                </li>
              ) : null;
            })}
          </ol>
        </div>

        {track.adaptations?.length ? (
          <section className="proposal-adaptations" aria-label={tr(language, "Applied adaptations", "Adaptaciones aplicadas")}>
            <h3>{tr(language, "What Repbook changed", "Qué cambió Repbook")}</h3>
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
              "Repbook does not medically interpret free text or replace professional guidance; open each movement and reject or edit anything that conflicts with your instructions.",
              "Repbook no interpreta médicamente el texto libre ni reemplaza indicaciones profesionales; abrí cada movimiento y rechazá o editá lo que contradiga tus indicaciones.",
            )}
          </p>
        )}

        <p className="initial-proposal-note">
          {tr(
            language,
            "You can accept it as is, accept it and edit every movement, or reject it and create another route later.",
            "Podés aceptarla tal como está, aceptarla y editar cada movimiento, o rechazarla y crear otra ruta después.",
          )}
        </p>

        <div className="initial-proposal-actions">
          <button type="button" className="is-secondary" onClick={onReject}><X size={16} /> {tr(language, "Reject proposal", "Rechazar propuesta")}</button>
          <button type="button" className="is-secondary" onClick={onEdit} disabled={blocked}><Pencil size={16} /> {tr(language, "Accept and edit", "Aceptar y editar")}</button>
          <button type="button" className="is-primary" onClick={onAccept} disabled={blocked}><ShieldCheck size={16} /> {tr(language, "Accept routine", "Aceptar rutina")}</button>
        </div>
      </section>
    </div>
  );
}
