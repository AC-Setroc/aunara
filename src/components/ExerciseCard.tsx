import { Check, Heart, Plus } from "lucide-react";
import { exerciseDisplayName, exerciseTaxonomyLabel, isExerciseNamePending, mediaUrl } from "../lib/exercises";
import { tr } from "../lib/i18n";
import type { Exercise, LanguageCode } from "../types";

interface ExerciseCardProps {
  language?: LanguageCode;
  exercise: Exercise;
  isFavorite: boolean;
  inWorkout: boolean;
  onOpen: () => void;
  onToggleFavorite: () => void;
  onAdd: () => void;
}

export function ExerciseCard({
  language = "en",
  exercise,
  isFavorite,
  inWorkout,
  onOpen,
  onToggleFavorite,
  onAdd,
}: ExerciseCardProps) {
  const displayName = exerciseDisplayName(exercise, language);
  return (
    <article className="exercise-card">
      <button className="card-visual" type="button" onClick={onOpen} aria-label={`${tr(language, "Open", "Abrir")} ${displayName}`}>
        <img src={mediaUrl(exercise.image)} alt="" loading="lazy" />
        <span className="body-tag">{exerciseTaxonomyLabel(exercise.body_part, language)}</span>
        <span className="card-number" aria-hidden="true">#{exercise.id}</span>
      </button>

      <div className="card-copy">
        <button className="card-title" type="button" onClick={onOpen}>
          {displayName}
        </button>
        {isExerciseNamePending(exercise, language) && <small className="translation-pending">Nombre en inglés · traducción pendiente</small>}
        <p>{exerciseTaxonomyLabel(exercise.target, language)} · {exerciseTaxonomyLabel(exercise.equipment, language)}</p>
      </div>

      <div className="card-actions">
        <button
          className={`icon-button ${isFavorite ? "is-active" : ""}`}
          type="button"
          onClick={onToggleFavorite}
          aria-label={isFavorite ? `${tr(language, "Remove", "Quitar")} ${displayName} ${tr(language, "from favorites", "de favoritos")}` : `${tr(language, "Favorite", "Guardar")} ${displayName}`}
          aria-pressed={isFavorite}
        >
          <Heart size={17} fill={isFavorite ? "currentColor" : "none"} />
        </button>
        <button
          className={`add-button ${inWorkout ? "is-added" : ""}`}
          type="button"
          onClick={onAdd}
        >
          {inWorkout ? <Check size={17} /> : <Plus size={17} />}
          {inWorkout ? tr(language, "Manage", "Gestionar") : tr(language, "Add", "Agregar")}
        </button>
      </div>
    </article>
  );
}
