import { ArrowLeft, Check, Heart, Plus, X } from "lucide-react";
import { useEffect } from "react";
import { exerciseDisplayName, mediaUrl, titleCase } from "../lib/exercises";
import { tr } from "../lib/i18n";
import type { Exercise, LanguageCode } from "../types";

interface ExerciseDetailProps {
  exercise: Exercise;
  language: LanguageCode;
  origin?: "library" | "proposal" | "workout";
  isFavorite: boolean;
  inWorkout: boolean;
  onClose: () => void;
  onToggleFavorite: () => void;
  onAdd: () => void;
}

export function ExerciseDetail({
  exercise,
  language,
  origin = "library",
  isFavorite,
  inWorkout,
  onClose,
  onToggleFavorite,
  onAdd,
}: ExerciseDetailProps) {
  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.body.classList.add("modal-open");
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.classList.remove("modal-open");
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [onClose]);

  const steps = exercise.instruction_steps[language]?.length
    ? exercise.instruction_steps[language]
    : exercise.instruction_steps.en;
  const instructions = exercise.instructions[language] || exercise.instructions.en;
  const displayName = exerciseDisplayName(exercise, language);
  const backLabel = origin === "workout"
    ? tr(language, "Keep and return to routine", "Conservar y volver a la rutina")
    : origin === "proposal"
      ? tr(language, "Back to proposal", "Volver a la propuesta")
      : tr(language, "Back", "Volver");
  const addLabel = inWorkout
    ? tr(language, "Manage in routines", "Gestionar en rutinas")
    : origin === "workout"
      ? tr(language, "Add to this routine", "Agregar a esta ruta")
      : tr(language, "Add to routine", "Agregar a una ruta");

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="exercise-detail"
        role="dialog"
        aria-modal="true"
        aria-labelledby="exercise-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button className="close-button" type="button" onClick={onClose} aria-label={tr(language, "Close details", "Cerrar detalles")}>
          <X size={20} />
        </button>

        <div className="detail-media">
          <img src={mediaUrl(exercise.gif_url)} alt={`${tr(language, "Animated demonstration of", "Demostración animada de")} ${displayName}`} />
          <a href="https://gymvisual.com/" target="_blank" rel="noreferrer">
            © Gym visual
          </a>
        </div>

        <div className="detail-copy">
          <button className="detail-back-button" type="button" onClick={onClose}>
            <ArrowLeft size={16} /> {backLabel}
          </button>
          <p className="eyebrow">{tr(language, "Movement", "Movimiento")} #{exercise.id} · {titleCase(exercise.body_part)}</p>
          <h2 id="exercise-title">{displayName}</h2>

          <dl className="detail-facts">
            <div><dt>{tr(language, "Target", "Objetivo")}</dt><dd>{titleCase(exercise.target)}</dd></div>
            <div><dt>{tr(language, "Equipment", "Equipo")}</dt><dd>{titleCase(exercise.equipment)}</dd></div>
            <div><dt>{tr(language, "Supports", "Grupo muscular")}</dt><dd>{titleCase(exercise.muscle_group)}</dd></div>
          </dl>

          <div className="instruction-block">
            <p className="section-kicker">{tr(language, "How to perform", "Cómo realizarlo")}</p>
            {steps?.length ? (
              <ol>
                {steps.map((step, index) => <li key={`${exercise.id}-${index}`}>{step}</li>)}
              </ol>
            ) : (
              <p>{instructions}</p>
            )}
          </div>

          {exercise.secondary_muscles.length > 0 && (
            <div className="secondary-list">
              <span>{tr(language, "Also works", "También trabaja")}</span>
              {exercise.secondary_muscles.map((muscle) => (
                <em key={muscle}>{titleCase(muscle)}</em>
              ))}
            </div>
          )}

          <div className="detail-actions">
            <button className="favorite-button" type="button" onClick={onToggleFavorite}>
              <Heart size={18} fill={isFavorite ? "currentColor" : "none"} />
              {isFavorite ? tr(language, "Saved", "Guardado") : tr(language, "Save movement", "Guardar movimiento")}
            </button>
            <button className="primary-button" type="button" onClick={onAdd}>
              {inWorkout ? <Check size={18} /> : <Plus size={18} />}
              {addLabel}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
