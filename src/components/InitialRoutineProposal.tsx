import { Dumbbell, Pencil, ShieldCheck, X } from "lucide-react";
import { titleCase } from "../lib/exercises";
import { tr } from "../lib/i18n";
import type { Exercise, LanguageCode, TrainingTrack } from "../types";
import { trackFocusLabel } from "./TrainingTracks";

interface InitialRoutineProposalProps {
  language: LanguageCode;
  track: TrainingTrack;
  exerciseMap: Map<string, Exercise>;
  onAccept: () => void;
  onEdit: () => void;
  onReject: () => void;
}

export function InitialRoutineProposal({
  language,
  track,
  exerciseMap,
  onAccept,
  onEdit,
  onReject,
}: InitialRoutineProposalProps) {
  return (
    <div className="initial-proposal-backdrop">
      <section
        className="initial-proposal"
        role="dialog"
        aria-modal="true"
        aria-label={tr(language, "Review your first routine", "Revisá tu primera rutina")}
      >
        <div className="initial-proposal-heading">
          <span><ShieldCheck size={27} /></span>
          <div>
            <p className="eyebrow">{tr(language, "Your profile is ready / next step", "Tu perfil está listo / siguiente paso")}</p>
            <h2>{tr(language, "Review your first routine", "Revisá tu primera rutina")}</h2>
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
                  <Dumbbell size={15} />
                  <span><strong>{titleCase(exercise.name)}</strong><small>{item.setPlan ?? `${item.sets} × ${item.reps}`}</small></span>
                </li>
              ) : null;
            })}
          </ol>
        </div>

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
