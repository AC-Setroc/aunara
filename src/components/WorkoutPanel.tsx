import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  Dumbbell,
  Minus,
  Pencil,
  Play,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import { useState } from "react";
import { exerciseDisplayName, exerciseMovementRestrictions, filterExercises, findExerciseAlternatives, titleCase, WEEKDAYS } from "../lib/exercises";
import { tr } from "../lib/i18n";
import type { RoutineAnalysis } from "../lib/wellness";
import type { Exercise, LanguageCode, MovementRestriction, TrainingTrack, Weekday, WorkoutItem } from "../types";

export type WorkoutPanelMode = "view" | "edit" | "training";

interface WorkoutPanelProps {
  language?: LanguageCode;
  initialMode?: WorkoutPanelMode;
  items: WorkoutItem[];
  exerciseMap: Map<string, Exercise>;
  exercises: Exercise[];
  track: TrainingTrack;
  onClose: () => void;
  onUpdate: (exerciseId: string, field: "sets" | "reps", delta: number) => void;
  onUpdateItem?: (itemId: string, changes: Partial<WorkoutItem>) => void;
  onSetDayLabel?: (day: Weekday, label: string) => void;
  onAddExercise?: (exerciseId: string, day: Weekday) => void;
  onLogLoad?: (itemId: string) => void;
  onRemove: (exerciseId: string) => void;
  onSwap: (exerciseId: string, replacementId: string) => void;
  onClear: () => void;
  onGenerate: () => void;
  onOpenExercise: (exercise: Exercise) => void;
  analysis: RoutineAnalysis;
  onOpenProfile: () => void;
  restrictedMovements?: MovementRestriction[];
}

const DAY_LABELS: Record<Weekday, [string, string]> = {
  monday: ["Monday", "Lunes"],
  tuesday: ["Tuesday", "Martes"],
  wednesday: ["Wednesday", "Miércoles"],
  thursday: ["Thursday", "Jueves"],
  friday: ["Friday", "Viernes"],
  saturday: ["Saturday", "Sábado"],
  sunday: ["Sunday", "Domingo"],
};

const JAVASCRIPT_WEEKDAYS: Weekday[] = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

export function WorkoutPanel({
  language = "en",
  initialMode = "view",
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
  restrictedMovements = [],
}: WorkoutPanelProps) {
  const [mode, setMode] = useState<WorkoutPanelMode>(initialMode);
  const [replacingId, setReplacingId] = useState<string | null>(null);
  const [manualBuilderOpen, setManualBuilderOpen] = useState(initialMode === "edit");
  const [sessionCheckOpen, setSessionCheckOpen] = useState(false);
  const [sessionStop, setSessionStop] = useState(false);
  const [sessionSymptoms, setSessionSymptoms] = useState({
    warningSymptom: false,
    movementConcern: false,
  });
  const isManual = track.creationMode === "manual";
  const totalSets = items.reduce((sum, item) => sum + item.sets, 0);
  const orderedItems = [...items].sort((left, right) => (
    WEEKDAYS.indexOf(left.day ?? "monday") - WEEKDAYS.indexOf(right.day ?? "monday")
  ));
  const usedDays = WEEKDAYS.filter((day) => items.some((item) => (item.day ?? "monday") === day));
  const plannedDays = WEEKDAYS.filter((day) => (
    track.trainingDays?.includes(day) || usedDays.includes(day)
  ));
  const routeDays = plannedDays.length
    ? plannedDays
    : WEEKDAYS.slice(0, Math.max(1, Math.min(7, track.daysPerWeek)));
  const calendarDay = JAVASCRIPT_WEEKDAYS[new Date().getDay()];
  const [trainingDay, setTrainingDay] = useState<Weekday>(
    routeDays.includes(calendarDay) ? calendarDay : routeDays[0],
  );
  const dayLabel = (day: Weekday) => tr(language, ...DAY_LABELS[day]);
  const visibleItems = mode === "training"
    ? orderedItems.filter((item) => (item.day ?? "monday") === trainingDay)
    : orderedItems;

  function openSessionCheck() {
    setSessionSymptoms({ warningSymptom: false, movementConcern: false });
    setSessionStop(false);
    setSessionCheckOpen(true);
  }

  function reviewSessionCheck() {
    if (sessionSymptoms.warningSymptom || sessionSymptoms.movementConcern) {
      setSessionStop(true);
      setMode("view");
      return;
    }
    setSessionCheckOpen(false);
    setMode("training");
  }

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

      {items.length > 0 && (
        <div className="workout-mode-actions">
          {mode === "view" ? (
            <>
              <button className="is-primary" type="button" onClick={openSessionCheck}>
                <Play size={16} /> {tr(language, "Start today’s workout", "Iniciar entrenamiento de hoy")}
              </button>
              <button type="button" onClick={() => setMode("edit")}>
                <Pencil size={16} /> {tr(language, "Edit routine", "Editar rutina")}
              </button>
            </>
          ) : (
            <button type="button" onClick={() => {
              setMode("view");
              setReplacingId(null);
            }}>
              <ArrowLeft size={16} /> {tr(language, "Back to routine", "Volver a la rutina")}
            </button>
          )}
        </div>
      )}

      {sessionCheckOpen && (
        <div className="session-check-backdrop">
          <section
            className="session-check"
            role="dialog"
            aria-modal="true"
            aria-label={tr(language, "Check how you feel before starting", "Revisá cómo te sentís antes de empezar")}
          >
            <div className="session-check-heading">
              <span><AlertTriangle size={20} /></span>
              <div>
                <p className="eyebrow">{tr(language, "Session safety check", "Control de seguridad de la sesión")}</p>
                <h3>{tr(language, "Has anything changed today?", "¿Cambió algo hoy?")}</h3>
              </div>
            </div>
            {sessionStop ? (
              <div className="session-stop-message" role="alert">
                <strong>{tr(language, "Do not start this workout.", "No iniciés este entrenamiento.")}</strong>
                <p>{tr(
                  language,
                  "A new or worsening warning symptom should not be solved by an automatic exercise swap. Seek appropriate medical or physiotherapy guidance before resuming.",
                  "Un síntoma de alerta nuevo o que empeora no se debe resolver con un reemplazo automático de ejercicio. Buscá orientación médica o de fisioterapia antes de retomar.",
                )}</p>
                <button type="button" onClick={() => setSessionCheckOpen(false)}>
                  {tr(language, "Close and review my plan", "Cerrar y revisar mi plan")}
                </button>
              </div>
            ) : (
              <>
                <div className="session-check-options">
                  <label>
                    <input
                      type="checkbox"
                      checked={sessionSymptoms.warningSymptom}
                      onChange={(event) => setSessionSymptoms((current) => ({ ...current, warningSymptom: event.target.checked }))}
                    />
                    <span>{tr(
                      language,
                      "I have new chest pain, pressure, dizziness or fainting.",
                      "Tengo dolor o presión nueva en el pecho, mareo o desmayo.",
                    )}</span>
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={sessionSymptoms.movementConcern}
                      onChange={(event) => setSessionSymptoms((current) => ({ ...current, movementConcern: event.target.checked }))}
                    />
                    <span>{tr(
                      language,
                      "I have new or worsening pain, swelling, weakness, or loss of movement.",
                      "Tengo dolor, inflamación, debilidad o pérdida de movimiento nueva o que empeoró.",
                    )}</span>
                  </label>
                </div>
                <p>{tr(
                  language,
                  "If neither applies, continue. During the session, stop and reassess if a warning symptom appears.",
                  "Si ninguna aplica, continuá. Durante la sesión, pará y reevaluá si aparece un síntoma de alerta.",
                )}</p>
                <div className="session-check-actions">
                  <button type="button" onClick={() => setSessionCheckOpen(false)}>{tr(language, "Cancel", "Cancelar")}</button>
                  <button className="is-primary" type="button" onClick={reviewSessionCheck}>{tr(language, "Review my answer", "Revisar mi respuesta")}</button>
                </div>
              </>
            )}
          </section>
        </div>
      )}

      {!isManual && mode === "view" && (
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
                <button className="suggest-routine-button" type="button" onClick={() => {
                  setMode("edit");
                  setManualBuilderOpen(true);
                }}>
                  <Plus size={15} /> {tr(language, "Start creating", "Empezar a crear")}
                </button>
              )}
              {manualBuilderOpen && onAddExercise && (
                <ExerciseAdder
                  language={language}
                  exercises={exercises}
                  equipmentPreference={track.equipment}
                  routeDays={routeDays}
                  restrictedMovements={restrictedMovements}
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
            <strong>{mode === "training" ? visibleItems.length : items.length}</strong>
            <span>{tr(language, "movements", "movimientos")}</span>
            <i />
            <strong>{mode === "training"
              ? visibleItems.reduce((sum, item) => sum + item.sets, 0)
              : totalSets}</strong>
            <span>{tr(language, "working sets", "series de trabajo")}</span>
          </div>

          {mode === "training" && (
            <>
              <section className="training-session-day" aria-label={tr(language, "Workout day", "Día del entrenamiento")}>
                <div>
                  <p>{tr(language, "Today’s session", "Sesión de hoy")}</p>
                  <strong>{dayLabel(trainingDay)}{track.dayLabels?.[trainingDay] ? ` · ${track.dayLabels[trainingDay]}` : ""}</strong>
                </div>
                <div className="compact-day-picker">
                  {routeDays.map((day) => (
                    <button
                      key={day}
                      className={day === trainingDay ? "is-active" : ""}
                      type="button"
                      aria-pressed={day === trainingDay}
                      onClick={() => setTrainingDay(day)}
                    >
                      {dayLabel(day)}
                    </button>
                  ))}
                </div>
              </section>
              <button className="session-symptom-trigger" type="button" onClick={openSessionCheck}>
                <AlertTriangle size={15} /> {tr(language, "I have a new or worsening symptom", "Tengo un síntoma nuevo o que empeoró")}
              </button>
            </>
          )}

          {mode === "edit" && (
            <div className="workout-day-labels">
              {routeDays.map((day) => (
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
          )}

          {mode === "training" && visibleItems.length === 0 ? (
            <div className="empty-training-day">
              <Dumbbell size={24} />
              <strong>{tr(language, "No exercises planned for this day.", "No hay ejercicios planeados para este día.")}</strong>
              <span>{tr(language, "Choose another route day or edit the routine.", "Elegí otro día de la ruta o editá la rutina.")}</span>
            </div>
          ) : (
            <ol className={`workout-list is-${mode}`}>
              {visibleItems.map((item, index) => {
                const exercise = exerciseMap.get(item.exerciseId);
                if (!exercise) return null;
                const itemId = item.id ?? item.exerciseId;
                const exerciseName = exerciseDisplayName(exercise, language);
                const alternatives = replacingId === itemId
                  ? findExerciseAlternatives(exercises, exercise, track.equipment, 3, restrictedMovements)
                  : [];

                return (
                  <li key={itemId}>
                    <span className="set-order">{String(index + 1).padStart(2, "0")}</span>
                    <div className="workout-item-copy">
                      <span className="workout-day-tag">{dayLabel(item.day ?? "monday")}{track.dayLabels?.[item.day ?? "monday"] ? ` · ${track.dayLabels[item.day ?? "monday"]}` : ""}</span>
                      <h3>{exerciseName}</h3>
                      <p>{titleCase(exercise.target)}</p>

                      {mode === "view" && (
                        <div className="workout-plan-summary">
                          <span>{tr(language, "Plan", "Plan")}</span>
                          <strong>{item.setPlan ?? `${item.sets} × ${item.reps}`}</strong>
                          {(item.loadKg !== null && item.loadKg !== undefined) && (
                            <small>{tr(language, "Reference load", "Carga de referencia")}: {item.loadKg} kg</small>
                          )}
                        </div>
                      )}

                      {mode === "edit" && (
                        <div className="workout-prescription-grid">
                          <label>
                            <span>{tr(language, "Training day", "Día de entrenamiento")}</span>
                            <select
                              aria-label={`${tr(language, "Training day for", "Día de entrenamiento para")} ${exerciseName}`}
                              value={item.day ?? routeDays[0]}
                              onChange={(event) => onUpdateItem?.(itemId, { day: event.target.value as Weekday })}
                            >
                              {routeDays.map((day) => <option key={day} value={day}>{dayLabel(day)}</option>)}
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
                            <span>{tr(language, "Reference load (kg)", "Carga de referencia (kg)")}</span>
                            <input
                              aria-label={`${tr(language, "Reference load in kilograms for", "Carga de referencia en kilogramos para")} ${exerciseName}`}
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
                            <span>{tr(language, "Plan note", "Nota del plan")}</span>
                            <input
                              aria-label={`${tr(language, "Plan note for", "Nota del plan para")} ${exerciseName}`}
                              value={item.loadNote ?? ""}
                              placeholder={tr(language, "e.g. two 15 kg dumbbells", "ej. dos mancuernas de 15 kg")}
                              onChange={(event) => onUpdateItem?.(itemId, { loadNote: event.target.value })}
                            />
                          </label>
                        </div>
                      )}

                      {mode === "training" && (
                        <>
                          <div className="workout-prescription-grid training-entry-grid">
                            <label>
                              <span>{tr(language, "Sets completed", "Series realizadas")}</span>
                              <input
                                aria-label={`${tr(language, "Set plan for", "Plan de series para")} ${exerciseName}`}
                                value={item.setPlan ?? `${item.sets} × ${item.reps}`}
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
                            <label className="is-wide">
                              <span>{tr(language, "Session note", "Nota de la sesión")}</span>
                              <input
                                aria-label={`${tr(language, "Load note for", "Nota de carga para")} ${exerciseName}`}
                                value={item.loadNote ?? ""}
                                placeholder={tr(language, "e.g. effort, tempo or equipment used", "ej. esfuerzo, tempo o equipo usado")}
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
                        </>
                      )}

                      {item.loadHistory?.length ? (
                        <small className="load-history-summary">
                          {tr(language, "Last logged load", "Última carga registrada")}: {item.loadHistory.at(-1)?.loadKg ?? "—"} kg · {item.loadHistory.at(-1)?.setPlan}
                        </small>
                      ) : null}

                      {mode === "edit" && (
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
                      )}

                      <div className="workout-item-actions">
                        <button
                          className="demo-trigger"
                          type="button"
                          onClick={() => onOpenExercise(exercise)}
                          aria-label={`${tr(language, "View", "Ver")} ${exerciseName} ${tr(language, "demo and steps", "demostración y pasos")}`}
                        >
                          <Play size={13} /> {tr(language, "View demo & steps", "Ver demostración y pasos")}
                        </button>
                        {mode === "edit" && (
                          <button
                            className="swap-trigger"
                            type="button"
                            onClick={() => setReplacingId((current) => current === itemId ? null : itemId)}
                          >
                            <RefreshCw size={13} />
                            {replacingId === itemId ? tr(language, "Close alternatives", "Cerrar alternativas") : tr(language, "Replace movement", "Reemplazar movimiento")}
                          </button>
                        )}
                      </div>
                      {mode === "edit" && replacingId === itemId && (
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
                    {mode === "edit" && (
                      <button
                        className="remove-button"
                        type="button"
                        onClick={() => onRemove(itemId)}
                        aria-label={`${tr(language, "Remove", "Quitar")} ${exercise.name}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </li>
                );
              })}
            </ol>
          )}

          {mode === "edit" && onAddExercise && (
            <ExerciseAdder
              language={language}
              exercises={exercises}
              equipmentPreference={track.equipment}
              routeDays={routeDays}
              restrictedMovements={restrictedMovements}
              onAddExercise={onAddExercise}
            />
          )}

          {mode === "edit" && (
            <button className="clear-button" type="button" onClick={onClear}>{tr(language, "Clear workout", "Vaciar entrenamiento")}</button>
          )}
        </>
      )}
    </aside>
  );
}

interface ExerciseAdderProps {
  language: LanguageCode;
  exercises: Exercise[];
  equipmentPreference: TrainingTrack["equipment"];
  routeDays: Weekday[];
  restrictedMovements?: MovementRestriction[];
  onAddExercise: (exerciseId: string, day: Weekday) => void;
}

function ExerciseAdder({
  language,
  exercises,
  equipmentPreference,
  routeDays,
  restrictedMovements = [],
  onAddExercise,
}: ExerciseAdderProps) {
  const [query, setQuery] = useState("");
  const [selectedDay, setSelectedDay] = useState<Weekday>(routeDays[0] ?? "monday");
  const matches = filterExercises(exercises, {
    query,
    bodyPart: "",
    equipment: "",
    equipmentPreference,
    favoritesOnly: false,
    favoriteIds: new Set(),
  })
    .filter((exercise) => (
      exerciseMovementRestrictions(exercise).every((restriction) => !restrictedMovements.includes(restriction))
    ))
    .slice(0, 12);
  const dayLabel = (day: Weekday) => tr(language, ...DAY_LABELS[day]);

  return (
    <section className="manual-exercise-adder" aria-label={tr(language, "Add exercises", "Agregar ejercicios")}>
      <div className="manual-adder-heading">
        <div>
          <span>{tr(language, "Add exercises by day", "Agregá ejercicios por día")}</span>
          <strong>{dayLabel(selectedDay)}</strong>
        </div>
        <div className="compact-day-picker">
          {routeDays.map((day) => (
            <button
              key={day}
              className={day === selectedDay ? "is-active" : ""}
              type="button"
              aria-pressed={day === selectedDay}
              onClick={() => setSelectedDay(day)}
            >
              {dayLabel(day)}
            </button>
          ))}
        </div>
      </div>

      <label className="manual-exercise-search">
        <Search size={18} />
        <span className="sr-only">{tr(language, "Search exercises to add", "Buscar ejercicios para agregar")}</span>
        <input
          type="search"
          aria-label={tr(language, "Search exercises to add", "Buscar ejercicios para agregar")}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={tr(
            language,
            "Search name, muscle, type or equipment…",
            "Buscá por nombre, músculo, tipo o equipo…",
          )}
        />
      </label>
      {restrictedMovements.length > 0 && (
        <p className="restriction-filter-note">{tr(
          language,
          "Exercises matching your saved movement restrictions are hidden here. Review your health profile to change this filter.",
          "Acá se ocultan los ejercicios que coinciden con tus restricciones guardadas. Revisá tu perfil de salud para cambiar este filtro.",
        )}</p>
      )}

      <div className="manual-exercise-results">
        {matches.length ? matches.map((exercise) => {
          const exerciseName = exerciseDisplayName(exercise, language);
          return (
            <article key={exercise.id}>
              <div>
                <strong>{exerciseName}</strong>
                <small>{titleCase(exercise.target)} · {titleCase(exercise.category)} · {titleCase(exercise.equipment)}</small>
              </div>
              <button
                type="button"
                aria-label={`${tr(language, "Add", "Agregar")} ${exerciseName} ${tr(language, "to", "a")} ${dayLabel(selectedDay)}`}
                onClick={() => onAddExercise(exercise.id, selectedDay)}
              >
                <Plus size={15} /> {tr(language, "Add", "Agregar")}
              </button>
            </article>
          );
        }) : (
          <p>{tr(language, "No exercises match that search.", "No hay ejercicios que coincidan con esa búsqueda.")}</p>
        )}
      </div>
    </section>
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
