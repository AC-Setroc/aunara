import { Check, Heart, Plus } from "lucide-react";
import { mediaUrl, titleCase } from "../lib/exercises";
import type { Exercise } from "../types";

interface ExerciseCardProps {
  exercise: Exercise;
  isFavorite: boolean;
  inWorkout: boolean;
  onOpen: () => void;
  onToggleFavorite: () => void;
  onAdd: () => void;
}

export function ExerciseCard({
  exercise,
  isFavorite,
  inWorkout,
  onOpen,
  onToggleFavorite,
  onAdd,
}: ExerciseCardProps) {
  return (
    <article className="exercise-card">
      <button className="card-visual" type="button" onClick={onOpen} aria-label={`Open ${exercise.name}`}>
        <img src={mediaUrl(exercise.image)} alt="" loading="lazy" />
        <span className="body-tag">{titleCase(exercise.body_part)}</span>
        <span className="card-number" aria-hidden="true">#{exercise.id}</span>
      </button>

      <div className="card-copy">
        <button className="card-title" type="button" onClick={onOpen}>
          {titleCase(exercise.name)}
        </button>
        <p>{titleCase(exercise.target)} · {titleCase(exercise.equipment)}</p>
      </div>

      <div className="card-actions">
        <button
          className={`icon-button ${isFavorite ? "is-active" : ""}`}
          type="button"
          onClick={onToggleFavorite}
          aria-label={isFavorite ? `Remove ${exercise.name} from favorites` : `Favorite ${exercise.name}`}
          aria-pressed={isFavorite}
        >
          <Heart size={17} fill={isFavorite ? "currentColor" : "none"} />
        </button>
        <button
          className={`add-button ${inWorkout ? "is-added" : ""}`}
          type="button"
          onClick={onAdd}
          disabled={inWorkout}
        >
          {inWorkout ? <Check size={17} /> : <Plus size={17} />}
          {inWorkout ? "Added" : "Add"}
        </button>
      </div>
    </article>
  );
}
