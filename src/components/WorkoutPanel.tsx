import { Activity, Dumbbell, Minus, Play, Plus, RefreshCw, Trash2, UserRound, X } from "lucide-react";
import { useState } from "react";
import { findExerciseAlternatives, titleCase, WEEKDAYS } from "../lib/exercises";
import { tr } from "../lib/i18n";
import type { RoutineAnalysis } from "../lib/wellness";
import type { Exercise, LanguageCode, TrainingTrack, Weekday, WorkoutItem } from "../types";

interface WorkoutPanelProps {
  language?: LanguageCode;
  items: WorkoutItem[];
  exerciseMap: Map<string, Exercise>;
  exercises: Exercise[];
  track: TrainingTrack;
  onClose: () => void;
  onUpdate: (exerciseId: string, field: "sets" | "reps", delta: number) => void;
  onUpdateItem?: (itemId: string, changes: Partial<WorkoutItem>) => void;
  onSetDayLabel?: (day: Weekday, label: string) => void;
  onAddExercise?: (exerciseId: string) => void;
  onLogLoad?: (itemId: string) => void;
  onRemove: (exerciseId: string) => void;
  onSwap: (exerciseId: string, replacementId: string) => void;
  onClear: () => void;
  onGenerate: () => void;
  onOpenExercise: (exercise: Exercise) => void;
  analysis: RoutineAnalysis;
  onOpenProfile: () => void;
}

export function WorkoutPanel({
  language = "en",
  items,
  exerciseMap,
  exercises,
  track,
  onClose,
  onUpdate,
  onUpdateItem,
  onSetDayLabel,
  onAddExercise,
  onLogLoad,
  onRemove,
  onSwap,
  onClear,
  onGenerate,
  onOpenExercise,
  analysis,
  onOpenProfile,
}: WorkoutPanelProps) {
  const [replacingId, setReplacingId] = useState<string | null>(null);
  const [manualBuilderOpen, setManualBuilderOpen] = useState(false);
  const [exerciseToAdd, setExerciseToAdd] = useState(exercises[0]?.id ?? "");
  const isManual = track.creationMode === "manual";
  const totalSets = items.reduce((sum, item) => sum + item.sets, 0);
  const orderedItems = [...items].sort((left, right) => (
    WEEKDAYS.indexOf(left.day ?? "monday") - WEEKDAYS.indexOf(right.day ?? "monday")
  ));
  const usedDays = WEEKDAYS.filter((day) => items.some((item) => (item.day ?? "monday") === day));
  const dayLabel = (day: Weekday) => {
    const labels: Record<Weekday, [string, string]> = {
      monday: ["Monday", "Lunes"],
      tuesday: ["Tuesday", "Martes"],
      wednesday: ["Wednesday", "Miércoles"],
      thursday: ["Thursday", "Jueves"],
      friday: ["Friday", "Viernes"],
      saturday: ["Saturday", "Sábado"],
      sunday: ["Sunday", "Domingo"],
    };
    return tr(language, ...labels[day]);
  };

  return (
    <aside className="workout-panel" aria-label={`${track.name} ${tr(language, "workout", "entrenamiento")}`}>
      <div className="workout-heading">
        <div>
          <p className="eyebrow">{track.kind === "sport" ? tr(language, "Sport track", "Ruta deportiva") : tr(language, "Goal track", "Ruta de meta")} · {track.daysPerWeek}× {tr(language, "weekly", "por semana")}</p>
          <h2>{track.name}</h2>
        </div>
        <button className="close-button inline" type="button" onClick={onClose} aria-label={tr(language, "Close workout", "Cerrar entrenamiento")}>
          <X size={20} />
        </button>
      </div>

      {!isManual && (
        <section className={`routine-analysis is-${analysis.tone}`} aria-label={tr(language, "Routine context", "Contexto de la rutina")}>
          <div className="routine-analysis-heading">
            <span>{analysis.tone === "watch" ? <Activity size={17} /> : <UserRound size={17} />}</span>
            <div><p>{tr(language, "Why this routine", "Por qué esta rutina")}</p><h3>{analysis.headline}</h3></div>
          </div>
          <ul>{analysis.points.map((point) => <li key={point}>{point}</li>)}</ul>
          <button type="button" onClick={onOpenProfile} aria-label={tr(language, "Review health profile", "Revisar perfil de salud")}>{tr(language, "Review health profile", "Revisar perfil de salud")}</button>
        </section>
      )}

      {items.length === 0 ? (
        <div className="empty-workout">
          <Dumbbell size={30} strokeWidth={1.5} />
          <h3>{tr(language, "This routine is empty.", "Esta rutina está vacía.")}</h3>
          {isManual ? (
            <>
              <p>{tr(language, "Build it exercise by exercise. Repbook will not add suggested movements to this manual route.", "Armala ejercicio por ejercicio. Repbook no agregará movimientos sugeridos a esta ruta manual.")}</p>
              {!manualBuilderOpen && (
                <button className="suggest-routine-button" type="button" onClick={() => setManualBuilderOpen(true)}>
                  <Plus size={15} /> {tr(language, "Start creating", "Empezar a crear")}
                </button>
              )}
              {manualBuilderOpen && onAddExercise && (
                <ExerciseAdder
                  language={language}
                  exercises={exercises}
                  exerciseToAdd={exerciseToAdd}
                  onExerciseChange={setExerciseToAdd}
                  onAddExercise={onAddExercise}
                />
              )}
            </>
          ) : (
            <>
              <p>{tr(language, "Start with a suggested routine, then adjust it movement by movement.", "Empezá con una rutina sugerida y ajustala movimiento por movimiento.")}</p>
              <button className="suggest-routine-button" type="button" onClick={onGenerate}>
                <RefreshCw size={15} /> {tr(language, "Suggest this routine", "Sugerir esta rutina")}
              </button>
            </>
          )}
        </div>
      ) : (
        <>
          <div className="workout-summary">
            <strong>{items.length}</strong>
            <span>{tr(language, "movements", "movimientos")}</span>
            <i />
            <strong>{totalSets}</strong>
            <span>{tr(language, "working sets", "series de trabajo")}</span>
          </div>

          <div className="workout-day-labels">
            {usedDays.map((day) => (
              <label key={day}>
                <span>{dayLabel(day)}</span>
                <input
                  aria-label={`${tr(language, "Day focus", "Enfoque del día")} ${dayLabel(day)}`}
                  value={track.dayLabels?.[day] ?? ""}
                  placeholder={tr(language, "e.g. Lower body", "ej. Tren inferior")}
                  onChange={(event) => onSetDayLabel?.(day, event.target.value)}
                />
              </label>
            ))}
          </div>

          <ol className="workout-list">
            {orderedItems.map((item, index) => {
              const exercise = exerciseMap.get(item.exerciseId);
              if (!exercise) return null;
              const itemId = item.id ?? item.exerciseId;
              const exerciseName = titleCase(exercise.name);
              const alternatives = replacingId === itemId
                ? findExerciseAlternatives(exercises, exercise, track.equipment, 3)
                : [];

              return (
                <li key={itemId}>
                  <span className="set-order">{String(index + 1).padStart(2, "0")}</span>
                  <div className="workout-item-copy">
                    <span className="workout-day-tag">{dayLabel(item.day ?? "monday")}{track.dayLabels?.[item.day ?? "monday"] ? ` · ${track.dayLabels?.[item.day ?? "monday"]}` : ""}</span>
                    <h3>{exerciseName}</h3>
                    <p>{titleCase(exercise.target)}</p>
                    <div className="workout-prescription-grid">
                      <label>
                        <span>{tr(language, "Training day", "Día de entrenamiento")}</span>
                        <select
                          aria-label={`${tr(language, "Training day for", "Día de entrenamiento para")} ${exerciseName}`}
                          value={item.day ?? "monday"}
                          onChange={(event) => onUpdateItem?.(itemId, { day: event.target.value as Weekday })}
                        >
                          {WEEKDAYS.map((day) => <option key={day} value={day}>{dayLabel(day)}</option>)}
                        </select>
                      </label>
                      <label>
                        <span>{tr(language, "Set plan", "Plan de series")}</span>
                        <input
                          aria-label={`${tr(language, "Set plan for", "Plan de series para")} ${exerciseName}`}
                          value={item.setPlan ?? `${item.sets} × ${item.reps}`}
                          placeholder={tr(language, "e.g. 3 × 8 + 3 to failure", "ej. 3 × 8 + 3 al fallo")}
                          onChange={(event) => onUpdateItem?.(itemId, { setPlan: event.target.value })}
                        />
                      </label>
                      <label>
                        <span>{tr(language, "Load (kg)", "Carga (kg)")}</span>
                        <input
                          aria-label={`${tr(language, "Load in kilograms for", "Carga en kilogramos para")} ${exerciseName}`}
                          type="number"
                          min={0}
                          step={0.5}
                          value={item.loadKg ?? ""}
                          onChange={(event) => onUpdateItem?.(itemId, {
                            loadKg: event.target.value === "" ? null : Number(event.target.value),
                          })}
                        />
                      </label>
                      <label>
                        <span>{tr(language, "Load note", "Nota de carga")}</span>
                        <input
                          aria-label={`${tr(language, "Load note for", "Nota de carga para")} ${exerciseName}`}
                          value={item.loadNote ?? ""}
                          placeholder={tr(language, "e.g. two 15 kg dumbbells", "ej. dos mancuernas de 15 kg")}
                          onChange={(event) => onUpdateItem?.(itemId, { loadNote: event.target.value })}
                        />
                      </label>
                    </div>
                    <button
                      className="log-load-button"
                      type="button"
                      onClick={() => onLogLoad?.(itemId)}
                      aria-label={`${tr(language, "Log today’s load for", "Registrar la carga de hoy para")} ${exerciseName}`}
                    >
                      {tr(language, "Log today’s load", "Registrar carga de hoy")}
                    </button>
                    {item.loadHistory?.length ? (
                      <small className="load-history-summary">
                        {tr(language, "Last logged load", "Última carga registrada")}: {item.loadHistory.at(-1)?.loadKg ?? "—"} kg · {item.loadHistory.at(-1)?.setPlan}
                      </small>
                    ) : null}
                    <div className="stepper-row">
                      <Stepper
                        language={language}
                        label={tr(language, "sets", "series")}
                        value={item.sets}
                        onDecrease={() => onUpdate(itemId, "sets", -1)}
                        onIncrease={() => onUpdate(itemId, "sets", 1)}
                      />
                      <span className="times">×</span>
                      <Stepper
                        language={language}
                        label={tr(language, "reps", "repeticiones")}
                        value={item.reps}
                        onDecrease={() => onUpdate(itemId, "reps", -1)}
                        onIncrease={() => onUpdate(itemId, "reps", 1)}
                      />
                    </div>
                    <div className="workout-item-actions">
                      <button
                        className="demo-trigger"
                        type="button"
                        onClick={() => onOpenExercise(exercise)}
                        aria-label={`${tr(language, "View", "Ver")} ${titleCase(exercise.name)} ${tr(language, "demo and steps", "demostración y pasos")}`}
                      >
                        <Play size={13} /> {tr(language, "View demo & steps", "Ver demostración y pasos")}
                      </button>
                      <button
                        className="swap-trigger"
                        type="button"
                        onClick={() => setReplacingId((current) => current === itemId ? null : itemId)}
                      >
                        <RefreshCw size={13} />
                        {replacingId === itemId ? tr(language, "Close alternatives", "Cerrar alternativas") : tr(language, "Replace movement", "Reemplazar movimiento")}
                      </button>
                    </div>
                    {replacingId === itemId && (
                      <div className="alternatives-list">
                        <span>{
                          track.equipment === "bodyweight"
                            ? tr(language, "Bodyweight alternatives", "Alternativas de autocarga")
                            : track.equipment === "mixed" ? tr(language, "Mixed alternatives", "Alternativas mixtas") : tr(language, "Similar movements", "Movimientos similares")
                        }</span>
                        {alternatives.length ? alternatives.map((alternative) => (
                          <button
                            key={alternative.id}
                            type="button"
                            onClick={() => {
                              onSwap(itemId, alternative.id);
                              setReplacingId(null);
                            }}
                          >
                            <strong>{titleCase(alternative.name)}</strong>
                            <small>{titleCase(alternative.equipment)}</small>
                          </button>
                        )) : <p>{tr(language, "No close alternative found in this equipment set.", "No encontramos una alternativa cercana con este equipo.")}</p>}
                      </div>
                    )}
                  </div>
                  <button
                    className="remove-button"
                    type="button"
                    onClick={() => onRemove(itemId)}
                    aria-label={`${tr(language, "Remove", "Quitar")} ${exercise.name}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </li>
              );
            })}
          </ol>

          {onAddExercise && (
            <ExerciseAdder
              language={language}
              exercises={exercises}
              exerciseToAdd={exerciseToAdd}
              onExerciseChange={setExerciseToAdd}
              onAddExercise={onAddExercise}
            />
          )}

          <button className="clear-button" type="button" onClick={onClear}>{tr(language, "Clear workout", "Vaciar entrenamiento")}</button>
        </>
      )}
    </aside>
  );
}

interface ExerciseAdderProps {
  language: LanguageCode;
  exercises: Exercise[];
  exerciseToAdd: string;
  onExerciseChange: (exerciseId: string) => void;
  onAddExercise: (exerciseId: string) => void;
}

function ExerciseAdder({
  language,
  exercises,
  exerciseToAdd,
  onExerciseChange,
  onAddExercise,
}: ExerciseAdderProps) {
  return (
    <div className="manual-exercise-adder">
      <label>
        <span>{tr(language, "Add another exercise", "Agregar otro ejercicio")}</span>
        <select value={exerciseToAdd} onChange={(event) => onExerciseChange(event.target.value)}>
          {exercises.map((exercise) => <option key={exercise.id} value={exercise.id}>{titleCase(exercise.name)} · {titleCase(exercise.equipment)}</option>)}
        </select>
      </label>
      <button type="button" onClick={() => exerciseToAdd && onAddExercise(exerciseToAdd)}>
        <Plus size={15} /> {tr(language, "Add exercise", "Agregar ejercicio")}
      </button>
    </div>
  );
}

interface StepperProps {
  language: LanguageCode;
  label: string;
  value: number;
  onDecrease: () => void;
  onIncrease: () => void;
}

function Stepper({ language, label, value, onDecrease, onIncrease }: StepperProps) {
  return (
    <div className="stepper" aria-label={`${value} ${label}`}>
      <button type="button" onClick={onDecrease} aria-label={`${tr(language, "Decrease", "Disminuir")} ${label}`}><Minus size={13} /></button>
      <strong>{value}</strong>
      <span>{label}</span>
      <button type="button" onClick={onIncrease} aria-label={`${tr(language, "Increase", "Aumentar")} ${label}`}><Plus size={13} /></button>
    </div>
  );
}
