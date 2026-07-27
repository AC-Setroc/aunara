import { Activity, Dumbbell, Minus, Play, Plus, RefreshCw, Trash2, UserRound, X } from "lucide-react";
import { useState } from "react";
import { findExerciseAlternatives, titleCase } from "../lib/exercises";
import type { RoutineAnalysis } from "../lib/wellness";
import type { Exercise, TrainingTrack, WorkoutItem } from "../types";

interface WorkoutPanelProps {
  items: WorkoutItem[];
  exerciseMap: Map<string, Exercise>;
  exercises: Exercise[];
  track: TrainingTrack;
  onClose: () => void;
  onUpdate: (exerciseId: string, field: "sets" | "reps", delta: number) => void;
  onRemove: (exerciseId: string) => void;
  onSwap: (exerciseId: string, replacementId: string) => void;
  onClear: () => void;
  onGenerate: () => void;
  onOpenExercise: (exercise: Exercise) => void;
  analysis: RoutineAnalysis;
  onOpenProfile: () => void;
}

export function WorkoutPanel({
  items,
  exerciseMap,
  exercises,
  track,
  onClose,
  onUpdate,
  onRemove,
  onSwap,
  onClear,
  onGenerate,
  onOpenExercise,
  analysis,
  onOpenProfile,
}: WorkoutPanelProps) {
  const [replacingId, setReplacingId] = useState<string | null>(null);
  const totalSets = items.reduce((sum, item) => sum + item.sets, 0);

  return (
    <aside className="workout-panel" aria-label={`${track.name} workout`}>
      <div className="workout-heading">
        <div>
          <p className="eyebrow">{track.kind === "sport" ? "Sport track" : "Goal track"} · {track.daysPerWeek}× weekly</p>
          <h2>{track.name}</h2>
        </div>
        <button className="close-button inline" type="button" onClick={onClose} aria-label="Close workout">
          <X size={20} />
        </button>
      </div>

      <section className={`routine-analysis is-${analysis.tone}`} aria-label="Routine context">
        <div className="routine-analysis-heading">
          <span>{analysis.tone === "watch" ? <Activity size={17} /> : <UserRound size={17} />}</span>
          <div><p>Why this routine</p><h3>{analysis.headline}</h3></div>
        </div>
        <ul>{analysis.points.map((point) => <li key={point}>{point}</li>)}</ul>
        <button type="button" onClick={onOpenProfile} aria-label="Review health profile">Review health profile</button>
      </section>

      {items.length === 0 ? (
        <div className="empty-workout">
          <Dumbbell size={30} strokeWidth={1.5} />
          <h3>This routine is empty.</h3>
          <p>Start with a suggested routine, then adjust it movement by movement.</p>
          <button className="suggest-routine-button" type="button" onClick={onGenerate}>
            <RefreshCw size={15} /> Suggest this routine
          </button>
        </div>
      ) : (
        <>
          <div className="workout-summary">
            <strong>{items.length}</strong>
            <span>movements</span>
            <i />
            <strong>{totalSets}</strong>
            <span>working sets</span>
          </div>

          <ol className="workout-list">
            {items.map((item, index) => {
              const exercise = exerciseMap.get(item.exerciseId);
              if (!exercise) return null;
              const alternatives = replacingId === item.exerciseId
                ? findExerciseAlternatives(exercises, exercise, track.equipment, 3)
                : [];

              return (
                <li key={item.exerciseId}>
                  <span className="set-order">{String(index + 1).padStart(2, "0")}</span>
                  <div className="workout-item-copy">
                    <h3>{titleCase(exercise.name)}</h3>
                    <p>{titleCase(exercise.target)}</p>
                    <div className="stepper-row">
                      <Stepper
                        label="sets"
                        value={item.sets}
                        onDecrease={() => onUpdate(item.exerciseId, "sets", -1)}
                        onIncrease={() => onUpdate(item.exerciseId, "sets", 1)}
                      />
                      <span className="times">×</span>
                      <Stepper
                        label="reps"
                        value={item.reps}
                        onDecrease={() => onUpdate(item.exerciseId, "reps", -1)}
                        onIncrease={() => onUpdate(item.exerciseId, "reps", 1)}
                      />
                    </div>
                    <div className="workout-item-actions">
                      <button
                        className="demo-trigger"
                        type="button"
                        onClick={() => onOpenExercise(exercise)}
                        aria-label={`View ${titleCase(exercise.name)} demo and steps`}
                      >
                        <Play size={13} /> View demo & steps
                      </button>
                      <button
                        className="swap-trigger"
                        type="button"
                        onClick={() => setReplacingId((current) => current === item.exerciseId ? null : item.exerciseId)}
                      >
                        <RefreshCw size={13} />
                        {replacingId === item.exerciseId ? "Close alternatives" : "Replace movement"}
                      </button>
                    </div>
                    {replacingId === item.exerciseId && (
                      <div className="alternatives-list">
                        <span>{
                          track.equipment === "bodyweight"
                            ? "Bodyweight alternatives"
                            : track.equipment === "mixed" ? "Mixed alternatives" : "Similar movements"
                        }</span>
                        {alternatives.length ? alternatives.map((alternative) => (
                          <button
                            key={alternative.id}
                            type="button"
                            onClick={() => {
                              onSwap(item.exerciseId, alternative.id);
                              setReplacingId(null);
                            }}
                          >
                            <strong>{titleCase(alternative.name)}</strong>
                            <small>{titleCase(alternative.equipment)}</small>
                          </button>
                        )) : <p>No close alternative found in this equipment set.</p>}
                      </div>
                    )}
                  </div>
                  <button
                    className="remove-button"
                    type="button"
                    onClick={() => onRemove(item.exerciseId)}
                    aria-label={`Remove ${exercise.name}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </li>
              );
            })}
          </ol>

          <button className="clear-button" type="button" onClick={onClear}>Clear workout</button>
        </>
      )}
    </aside>
  );
}

interface StepperProps {
  label: string;
  value: number;
  onDecrease: () => void;
  onIncrease: () => void;
}

function Stepper({ label, value, onDecrease, onIncrease }: StepperProps) {
  return (
    <div className="stepper" aria-label={`${value} ${label}`}>
      <button type="button" onClick={onDecrease} aria-label={`Decrease ${label}`}><Minus size={13} /></button>
      <strong>{value}</strong>
      <span>{label}</span>
      <button type="button" onClick={onIncrease} aria-label={`Increase ${label}`}><Plus size={13} /></button>
    </div>
  );
}
