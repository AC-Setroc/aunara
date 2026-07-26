import { Check, Heart, Plus, X } from "lucide-react";
import { useEffect } from "react";
import { mediaUrl, titleCase } from "../lib/exercises";
import type { Exercise, LanguageCode } from "../types";

interface ExerciseDetailProps {
  exercise: Exercise;
  language: LanguageCode;
  isFavorite: boolean;
  inWorkout: boolean;
  onClose: () => void;
  onToggleFavorite: () => void;
  onAdd: () => void;
}

export function ExerciseDetail({
  exercise,
  language,
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

  const steps = exercise.instruction_steps[language];

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="exercise-detail"
        role="dialog"
        aria-modal="true"
        aria-labelledby="exercise-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button className="close-button" type="button" onClick={onClose} aria-label="Close details">
          <X size={20} />
        </button>

        <div className="detail-media">
          <img src={mediaUrl(exercise.gif_url)} alt={`Animated demonstration of ${exercise.name}`} />
          <a href="https://gymvisual.com/" target="_blank" rel="noreferrer">
            © Gym visual
          </a>
        </div>

        <div className="detail-copy">
          <p className="eyebrow">Movement #{exercise.id} · {titleCase(exercise.body_part)}</p>
          <h2 id="exercise-title">{titleCase(exercise.name)}</h2>

          <dl className="detail-facts">
            <div><dt>Target</dt><dd>{titleCase(exercise.target)}</dd></div>
            <div><dt>Equipment</dt><dd>{titleCase(exercise.equipment)}</dd></div>
            <div><dt>Supports</dt><dd>{titleCase(exercise.muscle_group)}</dd></div>
          </dl>

          <div className="instruction-block">
            <p className="section-kicker">How to perform</p>
            {steps?.length ? (
              <ol>
                {steps.map((step, index) => <li key={`${exercise.id}-${index}`}>{step}</li>)}
              </ol>
            ) : (
              <p>{exercise.instructions[language]}</p>
            )}
          </div>

          {exercise.secondary_muscles.length > 0 && (
            <div className="secondary-list">
              <span>Also works</span>
              {exercise.secondary_muscles.map((muscle) => (
                <em key={muscle}>{titleCase(muscle)}</em>
              ))}
            </div>
          )}

          <div className="detail-actions">
            <button className="favorite-button" type="button" onClick={onToggleFavorite}>
              <Heart size={18} fill={isFavorite ? "currentColor" : "none"} />
              {isFavorite ? "Saved" : "Save movement"}
            </button>
            <button className="primary-button" type="button" onClick={onAdd} disabled={inWorkout}>
              {inWorkout ? <Check size={18} /> : <Plus size={18} />}
              {inWorkout ? "In today’s workout" : "Add to workout"}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
