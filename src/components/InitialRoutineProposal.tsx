import { Dumbbell, Pencil, ShieldCheck, X } from "lucide-react";
import { exerciseDisplayName } from "../lib/exercises";
import { tr } from "../lib/i18n";
import type { Exercise, LanguageCode, TrainingTrack } from "../types";
import { trackFocusLabel } from "./TrainingTracks";

interface InitialRoutineProposalProps {
  language: LanguageCode;
  variant?: "initial" | "track";
  track: TrainingTrack;
  exerciseMap: Map<string, Exercise>;
  healthNotes?: string;
  onOpenExercise: (exercise: Exercise) => void;
  onAccept: () => void;
  onEdit: () => void;
  onReject: () => void;
}

export function InitialRoutineProposal({
  language,
  variant = "initial",
  track,
  exerciseMap,
  healthNotes = "",
  onOpenExercise,
  onAccept,
  onEdit,
  onReject,
}: InitialRoutineProposalProps) {
  const isInitial = variant === "initial";
  const heading = isInitial
    ? tr(language, "Review your first routine", "Revisá tu primera rutina")
    : tr(language, "Review suggested routine", "Revisá la rutina sugerida");
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
          <button type="button" className="is-secondary" onClick={onEdit}><Pencil size={16} /> {tr(language, "Accept and edit", "Aceptar y editar")}</button>
          <button type="button" className="is-primary" onClick={onAccept}><ShieldCheck size={16} /> {tr(language, "Accept routine", "Aceptar rutina")}</button>
        </div>
      </section>
    </div>
  );
}
