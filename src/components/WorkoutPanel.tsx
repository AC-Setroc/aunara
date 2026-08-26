import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  Check,
  ChevronLeft,
  Dumbbell,
  Info,
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
import { useEffect, useState } from "react";
import { exerciseDisplayName, exerciseMovementRestrictions, filterExercises, findExerciseAlternatives, titleCase, WEEKDAYS } from "../lib/exercises";
import { tr } from "../lib/i18n";
import {
  createSpecialPrescription,
  localizedOptionLabel,
  SPECIAL_TECHNIQUE_OPTIONS,
  techniqueLabel,
  WORKOUT_STRUCTURE_OPTIONS,
  workoutStructureSlotCount,
} from "../lib/workoutPrescription";
import type { RoutineAnalysis } from "../lib/wellness";
import type {
  Exercise,
  LanguageCode,
  MovementRestriction,
  SpecialTechniqueKind,
  SpecialWorkoutPrescription,
  TrainingTrack,
  Weekday,
  WorkoutItem,
  WorkoutStructureType,
  WorkoutTechniqueBlock,
} from "../types";

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
  onAddStructure?: (type: WorkoutStructureType, exerciseIds: string[], day: Weekday) => void;
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
  onAddStructure,
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
              <p>{tr(language, "Build it exercise by exercise. Aunara will not add suggested movements to this manual route.", "Armala ejercicio por ejercicio. Aunara no agregará movimientos sugeridos a esta ruta manual.")}</p>
              {!manualBuilderOpen && (
                <button className="suggest-routine-button" type="button" onClick={() => {
                  setMode("edit");
                  setManualBuilderOpen(true);
                }}>
                  <Plus size={15} /> {tr(language, "Start creating", "Empezar a crear")}
                </button>
              )}
              {manualBuilderOpen && (onAddExercise || onAddStructure) && (
                <ExerciseAdder
                  language={language}
                  exercises={exercises}
                  equipmentPreference={track.equipment}
                  routeDays={routeDays}
                  restrictedMovements={restrictedMovements}
                  onAddExercise={onAddExercise}
                  onAddStructure={onAddStructure}
                  onOpenExercise={onOpenExercise}
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
                      {item.structure && item.structure.size > 1 && (
                        <span className="workout-structure-tag">
                          {workoutStructureLabel(item.structure.type, language)} · {item.structure.position + 1}/{item.structure.size}
                        </span>
                      )}
                      <span className="workout-day-tag">{dayLabel(item.day ?? "monday")}{track.dayLabels?.[item.day ?? "monday"] ? ` · ${track.dayLabels[item.day ?? "monday"]}` : ""}</span>
                      <h3>{exerciseName}</h3>
                      <p>{titleCase(exercise.target)}</p>

                      {mode === "view" && (
                        <div className="workout-plan-summary">
                          <span>{tr(language, "Plan", "Plan")}</span>
                          <strong>{workoutPlanLabel(item, language)}</strong>
                          {(item.loadKg !== null && item.loadKg !== undefined) && (
                            <small>{tr(language, "Reference load", "Carga de referencia")}: {item.loadKg} kg</small>
                          )}
                        </div>
                      )}

                      {mode === "edit" && (
                        <div className="prescription-mode-switch" aria-label={tr(language, "Set format", "Formato de trabajo")}>
                          <button
                            className={(item.prescriptionMode ?? "standard") === "standard" ? "is-active" : ""}
                            type="button"
                            onClick={() => onUpdateItem?.(itemId, { prescriptionMode: "standard" })}
                          >
                            {tr(language, "Standard sets", "Reps. por serie")}
                          </button>
                          <button
                            className={item.prescriptionMode === "special" ? "is-active" : ""}
                            type="button"
                            onClick={() => onUpdateItem?.(itemId, {
                              prescriptionMode: "special",
                              specialPrescription: item.specialPrescription ?? createSpecialPrescription("rest-pause"),
                            })}
                          >
                            {tr(language, "Special configuration", "Configuración especial")}
                          </button>
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
                          <div className="workout-prescription-readout">
                            <span>{tr(language, "Set plan", "Plan de series")}</span>
                            <output
                              aria-label={`${tr(language, "Set plan for", "Plan de series para")} ${exerciseName}`}
                            >{workoutPlanLabel(item, language)}</output>
                            <small>{item.prescriptionMode === "special"
                              ? tr(language, "The sequence is configured below.", "La secuencia se configura abajo.")
                              : tr(language, "Adjust it with the controls below.", "Ajustalo con los controles inferiores.")}</small>
                          </div>
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

                      {mode === "edit" && item.prescriptionMode === "special" && (
                        <SpecialTechniqueEditor
                          language={language}
                          prescription={item.specialPrescription ?? createSpecialPrescription("rest-pause")}
                          onChange={(specialPrescription) => onUpdateItem?.(itemId, { specialPrescription })}
                        />
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

                      {mode === "edit" && item.prescriptionMode !== "special" && (
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
                            label={tr(language, "repetitions", "repeticiones")}
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

          {mode === "edit" && (onAddExercise || onAddStructure) && (
            <ExerciseAdder
              language={language}
              exercises={exercises}
              equipmentPreference={track.equipment}
              routeDays={routeDays}
              restrictedMovements={restrictedMovements}
              onAddExercise={onAddExercise}
              onAddStructure={onAddStructure}
              onOpenExercise={onOpenExercise}
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
  onAddExercise?: (exerciseId: string, day: Weekday) => void;
  onAddStructure?: (type: WorkoutStructureType, exerciseIds: string[], day: Weekday) => void;
  onOpenExercise: (exercise: Exercise) => void;
}

function ExerciseAdder({
  language,
  exercises,
  equipmentPreference,
  routeDays,
  restrictedMovements = [],
  onAddExercise,
  onAddStructure,
  onOpenExercise,
}: ExerciseAdderProps) {
  const [structureType, setStructureType] = useState<WorkoutStructureType | null>(null);
  const [queries, setQueries] = useState<string[]>([]);
  const [selectedExercises, setSelectedExercises] = useState<Array<Exercise | null>>([]);
  const [activeSlot, setActiveSlot] = useState(0);
  const [visibleCount, setVisibleCount] = useState(40);
  const [selectedDay, setSelectedDay] = useState<Weekday>(routeDays[0] ?? "monday");
  const dayLabel = (day: Weekday) => tr(language, ...DAY_LABELS[day]);
  const structureOption = WORKOUT_STRUCTURE_OPTIONS.find((option) => option.value === structureType);
  const slotCount = structureType ? workoutStructureSlotCount(structureType) : 0;
  const activeQuery = queries[activeSlot] ?? "";
  const selectedIds = new Set(selectedExercises.flatMap((exercise, index) => (
    exercise && index !== activeSlot ? [exercise.id] : []
  )));
  const matches = structureType ? filterExercises(exercises, {
    query: activeQuery,
    bodyPart: "",
    equipment: "",
    equipmentPreference,
    language,
    favoritesOnly: false,
    favoriteIds: new Set(),
  }).filter((exercise) => (
    !selectedIds.has(exercise.id)
    && exerciseMovementRestrictions(exercise).every((restriction) => !restrictedMovements.includes(restriction))
  )) : [];

  useEffect(() => setVisibleCount(40), [activeQuery, activeSlot, structureType]);

  function chooseStructure(type: WorkoutStructureType) {
    const count = workoutStructureSlotCount(type);
    setStructureType(type);
    setQueries(Array.from({ length: count }, () => ""));
    setSelectedExercises(Array.from({ length: count }, () => null));
    setActiveSlot(0);
  }

  function chooseExercise(exercise: Exercise, index: number) {
    setSelectedExercises((current) => current.map((value, slot) => slot === index ? exercise : value));
    setQueries((current) => current.map((value, slot) => slot === index ? exerciseDisplayName(exercise, language) : value));
    const nextEmpty = selectedExercises.findIndex((value, slot) => slot > index && !value);
    if (nextEmpty >= 0) setActiveSlot(nextEmpty);
  }

  function updateQuery(index: number, value: string) {
    setQueries((current) => current.map((query, slot) => slot === index ? value : query));
    setSelectedExercises((current) => current.map((exercise, slot) => slot === index ? null : exercise));
    setActiveSlot(index);
  }

  function addSelectedStructure() {
    if (!structureType || selectedExercises.some((exercise) => !exercise)) return;
    const exerciseIds = selectedExercises.flatMap((exercise) => exercise ? [exercise.id] : []);
    if (onAddStructure) onAddStructure(structureType, exerciseIds, selectedDay);
    else exerciseIds.forEach((exerciseId) => onAddExercise?.(exerciseId, selectedDay));
    setStructureType(null);
    setQueries([]);
    setSelectedExercises([]);
  }

  return (
    <section className="manual-exercise-adder" aria-label={tr(language, "Add exercises", "Agregar ejercicios")}>
      {!structureType ? (
        <div className="structure-choice">
          <div>
            <span>{tr(language, "Add to the routine", "Agregar a la rutina")}</span>
            <strong>{tr(language, "Choose a training structure", "Elegí una estructura de trabajo")}</strong>
          </div>
          <div className="structure-choice-grid">
            {WORKOUT_STRUCTURE_OPTIONS.map((option) => (
              <button key={option.value} type="button" onClick={() => chooseStructure(option.value)}>
                {localizedOptionLabel(option, language)}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className="structure-builder-heading">
            <button type="button" onClick={() => setStructureType(null)}>
              <ChevronLeft size={16} /> {tr(language, "Structures", "Estructuras")}
            </button>
            <div>
              <span>{tr(language, "Building", "Armando")}</span>
              <strong>{structureOption ? localizedOptionLabel(structureOption, language) : structureType}</strong>
            </div>
          </div>

          <div className="manual-adder-heading">
            <div>
              <span>{tr(language, "Training day", "Día de entrenamiento")}</span>
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

          <div className="structure-slots">
            {Array.from({ length: slotCount }, (_, index) => {
              const selectedExercise = selectedExercises[index];
              return (
                <section className={`structure-slot ${activeSlot === index ? "is-active" : ""}`} key={index}>
                  <label className="manual-exercise-search">
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <Search size={17} />
                    <input
                      type="search"
                      aria-label={`${tr(language, "Search exercise", "Buscar ejercicio")} ${index + 1}`}
                      value={queries[index] ?? ""}
                      onFocus={() => setActiveSlot(index)}
                      onChange={(event) => updateQuery(index, event.target.value)}
                      placeholder={tr(language, "Name, muscle, type or equipment…", "Nombre, músculo, tipo o equipo…")}
                    />
                    {selectedExercise && <Check size={17} aria-hidden="true" />}
                  </label>
                  {selectedExercise && (
                    <button className="selected-exercise-preview" type="button" onClick={() => onOpenExercise(selectedExercise)}>
                      <Play size={13} /> {tr(language, "View preview", "Ver preview")}
                    </button>
                  )}
                </section>
              );
            })}
          </div>

          {restrictedMovements.length > 0 && (
            <p className="restriction-filter-note">{tr(
              language,
              "Exercises matching your saved movement restrictions are hidden here. Review your health profile to change this filter.",
              "Acá se ocultan los ejercicios que coinciden con tus restricciones guardadas. Revisá tu perfil de salud para cambiar este filtro.",
            )}</p>
          )}

          {!selectedExercises[activeSlot] && (
            <div className="manual-exercise-results">
              <p className="exercise-result-count">
                {matches.length.toLocaleString()} {tr(language, "matching movements", "movimientos encontrados")}
              </p>
              {matches.length ? matches.slice(0, visibleCount).map((exercise) => {
                const exerciseName = exerciseDisplayName(exercise, language);
                return (
                  <article key={exercise.id}>
                    <button
                      className="manual-exercise-preview"
                      type="button"
                      aria-label={`${tr(language, "View", "Ver")} ${exerciseName} ${tr(language, "demo and steps", "demostración y pasos")}`}
                      onClick={() => onOpenExercise(exercise)}
                    >
                      <span>
                        <strong>{exerciseName}</strong>
                        <small>{titleCase(exercise.target)} · {titleCase(exercise.category)} · {titleCase(exercise.equipment)}</small>
                      </span>
                      <Play size={14} aria-hidden="true" />
                    </button>
                    <button
                      className="manual-exercise-add"
                      type="button"
                      aria-label={`${tr(language, "Select", "Seleccionar")} ${exerciseName} ${tr(language, "as exercise", "como ejercicio")} ${activeSlot + 1}`}
                      onClick={() => chooseExercise(exercise, activeSlot)}
                    >
                      <Plus size={15} /> {tr(language, "Select", "Seleccionar")}
                    </button>
                  </article>
                );
              }) : (
                <p>{tr(language, "No exercises match that search.", "No hay ejercicios que coincidan con esa búsqueda.")}</p>
              )}
              {visibleCount < matches.length && (
                <button className="manual-results-more" type="button" onClick={() => setVisibleCount((current) => current + 40)}>
                  {tr(language, "Show 40 more", "Mostrar 40 más")} · {matches.length - visibleCount} {tr(language, "remaining", "restantes")}
                </button>
              )}
            </div>
          )}

          <button
            className="structure-add-submit"
            type="button"
            disabled={selectedExercises.some((exercise) => !exercise)}
            onClick={addSelectedStructure}
          >
            <Plus size={16} /> {tr(language, "Add", "Agregar")} {structureOption ? localizedOptionLabel(structureOption, language).toLocaleLowerCase() : structureType}
          </button>
        </>
      )}
    </section>
  );
}

function workoutStructureLabel(type: WorkoutStructureType, language: LanguageCode): string {
  const option = WORKOUT_STRUCTURE_OPTIONS.find((candidate) => candidate.value === type);
  return option ? localizedOptionLabel(option, language) : type;
}

function workoutPlanLabel(item: WorkoutItem, language: LanguageCode): string {
  if (item.prescriptionMode === "special" && item.specialPrescription) {
    return `${item.specialPrescription.rounds} × ${techniqueLabel(item.specialPrescription.technique, language)}`;
  }
  return `${item.sets} × ${item.reps}`;
}

function nextBlockId(type: WorkoutTechniqueBlock["type"]): string {
  const suffix = typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `${type}-${suffix}`;
}

interface SpecialTechniqueEditorProps {
  language: LanguageCode;
  prescription: SpecialWorkoutPrescription;
  onChange: (prescription: SpecialWorkoutPrescription) => void;
}

function SpecialTechniqueEditor({ language, prescription, onChange }: SpecialTechniqueEditorProps) {
  function updateBlock(index: number, changes: Partial<WorkoutTechniqueBlock>) {
    onChange({
      ...prescription,
      blocks: prescription.blocks.map((block, blockIndex) => (
        blockIndex === index ? { ...block, ...changes } as WorkoutTechniqueBlock : block
      )),
    });
  }

  function removeBlock(index: number) {
    if (prescription.blocks.length <= 1) return;
    onChange({ ...prescription, blocks: prescription.blocks.filter((_, blockIndex) => blockIndex !== index) });
  }

  function addWorkBlock() {
    onChange({
      ...prescription,
      blocks: [...prescription.blocks, {
        id: nextBlockId("work"),
        type: "work",
        target: "reps",
        value: 8,
        loadType: "same",
      }],
    });
  }

  function addRestBlock() {
    onChange({
      ...prescription,
      blocks: [...prescription.blocks, { id: nextBlockId("rest"), type: "rest", seconds: 10 }],
    });
  }

  return (
    <section className="special-technique-editor" aria-label={tr(language, "Special set configuration", "Configuración especial de series")}>
      <div className="special-technique-heading">
        <div>
          <span>{tr(language, "Technique", "Técnica")}</span>
          <strong>{techniqueLabel(prescription.technique, language)}</strong>
        </div>
        <Info size={18} aria-hidden="true" />
      </div>

      <div className="technique-option-list">
        {SPECIAL_TECHNIQUE_OPTIONS.map((option) => (
          <button
            key={option.value}
            className={prescription.technique === option.value ? "is-active" : ""}
            type="button"
            aria-pressed={prescription.technique === option.value}
            onClick={() => onChange(createSpecialPrescription(option.value as SpecialTechniqueKind))}
          >
            <strong>{localizedOptionLabel(option, language)}</strong>
            <span>{language === "es" ? option.description?.[1] : option.description?.[0]}</span>
          </button>
        ))}
      </div>

      <div className="special-round-settings">
        <label>
          <span>{tr(language, "Repeat sequence", "Repetir secuencia")}</span>
          <input
            type="number"
            min={1}
            max={12}
            value={prescription.rounds}
            onChange={(event) => onChange({ ...prescription, rounds: Math.max(1, Number(event.target.value) || 1) })}
          />
          <small>{tr(language, "rounds", "series")}</small>
        </label>
        <label>
          <span>{tr(language, "Rest between full rounds", "Descanso entre series completas")}</span>
          <input
            type="number"
            min={0}
            step={5}
            value={prescription.restBetweenRoundsSeconds}
            onChange={(event) => onChange({ ...prescription, restBetweenRoundsSeconds: Math.max(0, Number(event.target.value) || 0) })}
          />
          <small>{tr(language, "seconds", "segundos")}</small>
        </label>
      </div>

      <div className="technique-block-list">
        {prescription.blocks.map((block, index) => (
          <article className={`technique-block is-${block.type}`} key={block.id}>
            <header>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{block.type === "work" ? tr(language, "Work", "Trabajo") : tr(language, "Rest", "Descanso")}</strong>
              <button
                type="button"
                onClick={() => removeBlock(index)}
                disabled={prescription.blocks.length <= 1}
                aria-label={`${tr(language, "Remove block", "Quitar bloque")} ${index + 1}`}
              >
                <Trash2 size={14} />
              </button>
            </header>

            {block.type === "rest" ? (
              <label>
                <span>{tr(language, "Duration", "Duración")}</span>
                <div><input type="number" min={0} step={5} value={block.seconds} onChange={(event) => updateBlock(index, { seconds: Math.max(0, Number(event.target.value) || 0) })} /><small>{tr(language, "seconds", "segundos")}</small></div>
              </label>
            ) : (
              <div className="work-block-fields">
                <label>
                  <span>{tr(language, "Target", "Objetivo")}</span>
                  <select value={block.target} onChange={(event) => updateBlock(index, { target: event.target.value as typeof block.target })}>
                    <option value="reps">{tr(language, "Exact repetitions", "Repeticiones exactas")}</option>
                    <option value="technical-failure">{tr(language, "Technical failure", "Fallo técnico")}</option>
                    <option value="amrap">AMRAP</option>
                    <option value="time">{tr(language, "Time", "Tiempo")}</option>
                  </select>
                </label>
                {(block.target === "reps" || block.target === "time") && (
                  <label>
                    <span>{block.target === "time" ? tr(language, "Seconds", "Segundos") : tr(language, "Repetitions", "Repeticiones")}</span>
                    <input type="number" min={1} value={block.value ?? 1} onChange={(event) => updateBlock(index, { value: Math.max(1, Number(event.target.value) || 1) })} />
                  </label>
                )}
                <label>
                  <span>{tr(language, "Load", "Carga")}</span>
                  <select value={block.loadType} onChange={(event) => updateBlock(index, { loadType: event.target.value as typeof block.loadType })}>
                    <option value="reference-percent">{tr(language, "% of reference load", "% de carga de referencia")}</option>
                    <option value="same">{tr(language, "Same previous load", "Misma carga anterior")}</option>
                    <option value="kg">{tr(language, "Exact kilograms", "Kilogramos exactos")}</option>
                    <option value="bodyweight">{tr(language, "Bodyweight", "Autocarga")}</option>
                  </select>
                </label>
                {(block.loadType === "reference-percent" || block.loadType === "kg") && (
                  <label>
                    <span>{block.loadType === "kg" ? "kg" : "%"}</span>
                    <input type="number" min={0} step={block.loadType === "kg" ? 0.5 : 5} value={block.loadValue ?? 0} onChange={(event) => updateBlock(index, { loadValue: Math.max(0, Number(event.target.value) || 0) })} />
                  </label>
                )}
                <label>
                  <span>{tr(language, "Tempo (optional)", "Tempo (opcional)")}</span>
                  <input value={block.tempo ?? ""} placeholder="3-1-1" onChange={(event) => updateBlock(index, { tempo: event.target.value })} />
                </label>
                <label className="is-wide">
                  <span>{tr(language, "Block note (optional)", "Nota del bloque (opcional)")}</span>
                  <input value={block.note ?? ""} onChange={(event) => updateBlock(index, { note: event.target.value })} />
                </label>
              </div>
            )}
          </article>
        ))}
      </div>

      <div className="technique-block-actions">
        <button type="button" onClick={addWorkBlock}><Plus size={14} /> {tr(language, "Add work block", "Agregar bloque de trabajo")}</button>
        <button type="button" onClick={addRestBlock}><Plus size={14} /> {tr(language, "Add rest", "Agregar descanso")}</button>
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
