import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  Check,
  ChevronDown,
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
import { exerciseDisplayName, exerciseMovementRestrictions, exerciseTaxonomyLabel, isExerciseNamePending, filterExercises, findExerciseAlternatives, WEEKDAYS } from "../lib/exercises";
import { tr } from "../lib/i18n";
import {
  createSpecialPrescription,
  isFreeLegacySetPlan,
  isValidManualPrescription,
  localizedOptionLabel,
  repetitionCountSuffix,
  workTargetLabel,
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
  WorkTargetType,
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
  onAddStructure?: (type: WorkoutStructureType, exerciseIds: string[], day: Weekday, prescriptions?: Partial<WorkoutItem>[]) => void;
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

interface RoutineBlock {
  id: string;
  day: Weekday;
  type: WorkoutStructureType;
  items: WorkoutItem[];
}

function groupItemsIntoBlocks(dayItems: WorkoutItem[]): RoutineBlock[] {
  const blocks: RoutineBlock[] = [];
  let currentGroup: { id: string; type: WorkoutStructureType; items: WorkoutItem[] } | null = null;

  for (const item of dayItems) {
    const structure = item.structure;
    if (structure && structure.size > 1) {
      if (currentGroup && currentGroup.id === structure.id) {
        currentGroup.items.push(item);
      } else {
        if (currentGroup) {
          blocks.push({
            id: currentGroup.id,
            day: currentGroup.items[0]?.day ?? "monday",
            type: currentGroup.type,
            items: currentGroup.items,
          });
        }
        currentGroup = { id: structure.id, type: structure.type, items: [item] };
      }
    } else {
      if (currentGroup) {
        blocks.push({
          id: currentGroup.id,
          day: currentGroup.items[0]?.day ?? "monday",
          type: currentGroup.type,
          items: currentGroup.items,
        });
        currentGroup = null;
      }
      blocks.push({
        id: item.id ?? item.exerciseId,
        day: item.day ?? "monday",
        type: "single",
        items: [item],
      });
    }
  }
  if (currentGroup) {
    blocks.push({
      id: currentGroup.id,
      day: currentGroup.items[0]?.day ?? "monday",
      type: currentGroup.type,
      items: currentGroup.items,
    });
  }
  return blocks;
}

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
  const initialDay = routeDays.includes(calendarDay) ? calendarDay : routeDays[0];
  const [trainingDay, setTrainingDay] = useState<Weekday>(initialDay);
  const [openDay, setOpenDay] = useState<Weekday | null>(initialDay);
  const [openBlockId, setOpenBlockId] = useState<string | null>(null);
  const [addingToDay, setAddingToDay] = useState<Weekday | null>(null);
  const dayLabel = (day: Weekday) => tr(language, ...DAY_LABELS[day]);
  const visibleItems = mode === "training" || mode === "edit"
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

      <div className="workout-mode-actions">
        {mode === "view" ? (
          <>
            {items.length > 0 && (
              <button className="is-primary" type="button" onClick={openSessionCheck}>
                <Play size={16} /> {tr(language, "Start today’s workout", "Iniciar entrenamiento de hoy")}
              </button>
            )}
            <button
              className={items.length > 0 ? "" : "is-primary"}
              type="button"
              onClick={() => {
                setMode("edit");
                setOpenDay(trainingDay);
                setOpenBlockId(null);
                setAddingToDay(null);
              }}
            >
              <Pencil size={16} /> {tr(language, "Edit routine", "Editar rutina")}
            </button>
          </>
        ) : (
          <button type="button" onClick={() => {
            setMode("view");
            setReplacingId(null);
            setOpenBlockId(null);
            setAddingToDay(null);
          }}>
            <ArrowLeft size={16} /> {tr(language, "Back to routine", "Volver a la rutina")}
          </button>
        )}
      </div>

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
                  <button className="is-primary" type="button" onClick={reviewSessionCheck}>{tr(language, "Accept", "Aceptar")}</button>
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

      {items.length === 0 && mode === "view" ? (
        <div className="empty-workout">
          <Dumbbell size={30} strokeWidth={1.5} />
          <h3>{tr(language, "This routine is empty.", "Esta rutina está vacía.")}</h3>
          {isManual ? (
            <>
              <p>{tr(language, "Build it exercise by exercise. Aunara will not add suggested movements to this manual route.", "Armala ejercicio por ejercicio. Aunara no agregará movimientos sugeridos a esta ruta manual.")}</p>
              <button
                className="suggest-routine-button"
                type="button"
                onClick={() => {
                  setMode("edit");
                  setManualBuilderOpen(true);
                }}
              >
                <Plus size={15} /> {tr(language, "Start creating", "Empezar a crear")}
              </button>
            </>
          ) : (
            <>
              <p>{tr(language, "Start with a suggested routine, then adjust it movement by movement.", "Empezá con una rutina sugerida y ajustala movimiento por movimiento.")}</p>
              <div className="empty-workout-actions">
                <button
                  className="suggest-routine-button"
                  type="button"
                  onClick={onGenerate}
                >
                  <RefreshCw size={15} /> {tr(language, "Suggest this routine", "Sugerir esta rutina")}
                </button>
                <button
                  className="suggest-routine-button is-secondary"
                  type="button"
                  onClick={() => {
                    setMode("edit");
                    setManualBuilderOpen(true);
                  }}
                >
                  <Plus size={15} /> {tr(language, "Start creating", "Empezar a crear")}
                </button>
              </div>
            </>
          )}
        </div>
      ) : manualBuilderOpen && items.length === 0 && (onAddExercise || onAddStructure) ? (
        <ExerciseAdder
          language={language}
          exercises={exercises}
          equipmentPreference={track.equipment}
          routeDays={routeDays}
          initialDay={trainingDay}
          showDayPicker={routeDays.length > 1}
          restrictedMovements={restrictedMovements}
          onAddExercise={onAddExercise}
          onAddStructure={(type, exerciseIds, targetDay, prescriptions) => {
            onAddStructure?.(type, exerciseIds, targetDay, prescriptions);
            setManualBuilderOpen(false);
            setAddingToDay(null);
            setOpenDay(targetDay);
          }}
          onOpenExercise={onOpenExercise}
          onFinish={() => {
            setManualBuilderOpen(false);
            setAddingToDay(null);
          }}
        />
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

          {mode === "training" && visibleItems.length === 0 ? (
            <div className="empty-training-day">
              <Dumbbell size={24} />
              <strong>{tr(language, "No exercises planned for this day.", "No hay ejercicios planeados para este día.")}</strong>
              <span>{tr(language, "Choose another route day or edit the routine.", "Elegí otro día de la ruta o editá la rutina.")}</span>
            </div>
          ) : mode === "training" ? (
            <ol className={`workout-list is-${mode}`}>
              {visibleItems.map((item, index) => {
                const exercise = exerciseMap.get(item.exerciseId);
                if (!exercise) return null;
                const itemId = item.id ?? item.exerciseId;
                const exerciseName = exerciseDisplayName(exercise, language);

                return (
                  <li key={itemId}>
                    <span className="set-order">{String(index + 1).padStart(2, "0")}</span>
                    <div className="workout-item-copy">
                      {item.structure && item.structure.size > 1 && (
                        <span className="workout-structure-tag">
                          {workoutStructureLabel(item.structure.type, language)} · {item.structure.position + 1}/{item.structure.size}
                        </span>
                      )}
                      <h3>{exerciseName}</h3>
                      <p>{exerciseTaxonomyLabel(exercise.target, language)}</p>
                      {isExerciseNamePending(exercise, language) && <small className="translation-pending">Nombre en inglés · traducción pendiente</small>}

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
                            onFocus={(event) => event.target.select()}
                            onChange={(event) => {
                              const clean = event.target.value.replace(/^0+(?=\d)/, "");
                              const numStr = clean.replace(",", ".");
                              event.target.value = clean;
                              onUpdateItem?.(itemId, {
                                loadKg: numStr === "" ? null : Number(numStr),
                              });
                            }}
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

                      {item.loadHistory?.length ? (
                        <small className="load-history-summary">
                          {tr(language, "Last logged load", "Última carga registrada")}: {item.loadHistory.at(-1)?.loadKg ?? "—"} kg · {item.loadHistory.at(-1)?.setPlan}
                        </small>
                      ) : null}

                      <div className="workout-item-actions">
                        <button
                          className="demo-trigger"
                          type="button"
                          onClick={() => onOpenExercise(exercise)}
                          aria-label={`${tr(language, "View", "Ver")} ${exerciseName} ${tr(language, "demo and steps", "demostración y pasos")}`}
                        >
                          <Play size={13} /> {tr(language, "View demo & steps", "Ver demostración y pasos")}
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          ) : (
            <div className="routine-days-container">
              {routeDays.map((day) => {
                const dayItems = items.filter((item) => (item.day ?? "monday") === day);
                const blocks = groupItemsIntoBlocks(dayItems);
                const isDayOpen = openDay === day;

                return (
                  <details
                    key={day}
                    className="routine-day-accordion"
                    open={isDayOpen}
                  >
                    <summary
                      className="routine-day-summary"
                      onClick={(event) => {
                        event.preventDefault();
                        const nextDay = openDay === day ? null : day;
                        setOpenDay(nextDay);
                        if (nextDay) setTrainingDay(nextDay);
                        setAddingToDay(null);
                      }}
                    >
                      <div className="routine-day-heading">
                        <strong className="routine-day-title">{dayLabel(day)}</strong>
                        {track.dayLabels?.[day] && <span className="routine-day-focus">{track.dayLabels[day]}</span>}
                      </div>
                      <div className="routine-day-summary-right">
                        <span className="routine-day-badge">
                          {dayItems.length} {dayItems.length === 1 ? tr(language, "exercise", "ejercicio") : tr(language, "exercises", "ejercicios")}
                        </span>
                        <ChevronDown size={18} className={`accordion-chevron ${isDayOpen ? "is-expanded" : ""}`} />
                      </div>
                    </summary>

                    <div className="routine-day-content">
                      {mode === "edit" && onSetDayLabel && (
                        <label className="day-focus-label">
                          <span>{tr(language, "Day focus", "Enfoque del día")}</span>
                          <input
                            value={track.dayLabels?.[day] ?? ""}
                            placeholder={tr(language, "e.g. Upper body, Pull, Core…", "ej. Tren superior, Tracción, Core…")}
                            onChange={(event) => onSetDayLabel(day, event.target.value)}
                          />
                        </label>
                      )}

                      {dayItems.length === 0 ? (
                        <p className="routine-day-empty">
                          {tr(language, "No exercises planned for this day yet.", "No hay ejercicios planeados para este día todavía.")}
                        </p>
                      ) : (
                        <div className="routine-blocks-list">
                          {blocks.map((block, blockIndex) => {
                            const blockLetter = String.fromCharCode(65 + blockIndex);
                            const exerciseNames = block.items
                              .map((item) => {
                                const ex = exerciseMap.get(item.exerciseId);
                                return ex ? exerciseDisplayName(ex, language) : "";
                              })
                              .filter(Boolean)
                              .join(" + ");

                            const planSummary = block.items.length === 1
                              ? workoutPlanLabel(block.items[0], language)
                              : `${block.items[0]?.sets ?? 3} ${tr(language, "series", "series")}`;

                            const isBlockOpen = openBlockId === block.id;

                            return (
                              <details key={block.id} className="routine-block-card" open={isBlockOpen}>
                                <summary
                                  className="routine-block-summary"
                                  onClick={(event) => {
                                    event.preventDefault();
                                    setOpenBlockId((current) => current === block.id ? null : block.id);
                                  }}
                                >
                                  <div className="routine-block-summary-left">
                                    <span className="routine-block-order-badge">
                                      {tr(language, `Block ${blockLetter}`, `Bloque ${blockLetter}`)}
                                    </span>
                                    {block.items.length > 1 && (
                                      <span className="routine-structure-badge">
                                        {workoutStructureLabel(block.type, language)} ({block.items.length})
                                      </span>
                                    )}
                                    <strong className="routine-block-names" title={exerciseNames}>
                                      {exerciseNames}
                                    </strong>
                                  </div>
                                  <div className="routine-block-summary-right">
                                    <span className="routine-block-plan-tag">{planSummary}</span>
                                    <ChevronDown size={16} className={`accordion-chevron ${isBlockOpen ? "is-expanded" : ""}`} />
                                  </div>
                                </summary>

                                <ol className={`workout-list is-${mode} routine-block-items`}>
                                  {block.items.map((item, itemIndex) => {
                                    const exercise = exerciseMap.get(item.exerciseId);
                                    if (!exercise) return null;
                                    const itemId = item.id ?? item.exerciseId;
                                    const exerciseName = exerciseDisplayName(exercise, language);
                                    const alternatives = replacingId === itemId
                                      ? findExerciseAlternatives(exercises, exercise, track.equipment, 3, restrictedMovements)
                                      : [];

                                    return (
                                      <li key={itemId} className="routine-exercise-card">
                                        <div className="workout-item-header">
                                          <div className="workout-item-title-group">
                                            {block.items.length > 1 && (
                                              <span className="set-order">{blockLetter}{itemIndex + 1}</span>
                                            )}
                                            <div>
                                              <h3>{exerciseName}</h3>
                                              <p className="exercise-taxonomy-text">{exerciseTaxonomyLabel(exercise.target, language)}</p>
                                              {isExerciseNamePending(exercise, language) && (
                                                <small className="translation-pending">Nombre en inglés · traducción pendiente</small>
                                              )}
                                            </div>
                                          </div>
                                          {mode === "edit" && (
                                            <button
                                              className="remove-button"
                                              type="button"
                                              onClick={() => {
                                                if (item.structure && item.structure.size > 1 && !window.confirm(tr(language, "Remove this member and dissolve its group? The other members keep their IDs and history as single sets.", "¿Quitar este miembro y desarmar su grupo? Los demás conservan sus IDs e historial como monoserie."))) return;
                                                onRemove(itemId);
                                              }}
                                              aria-label={`${tr(language, "Remove", "Quitar")} ${exercise.name}`}
                                            >
                                              <Trash2 size={16} />
                                            </button>
                                          )}
                                        </div>

                                        <div className="workout-item-copy">
                                          {mode !== "edit" && (
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
                                                  specialPrescription: item.specialPrescription ?? prescriptionWithCount("rest-pause", item.repetitionCount),
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
                                                  onChange={(event) => {
                                                    if (item.structure && item.structure.size > 1 && !window.confirm(tr(language, "Move this entire group to the selected day? All members keep their history.", "¿Mover este grupo completo al día elegido? Todos sus miembros conservan su historial."))) return;
                                                    onUpdateItem?.(itemId, { day: event.target.value as Weekday });
                                                  }}
                                                >
                                                  {routeDays.map((d) => <option key={d} value={d}>{dayLabel(d)}</option>)}
                                                </select>
                                              </label>
                                              <label>
                                                <span>{tr(language, "Reference load (kg)", "Carga de referencia (kg)")}</span>
                                                <input
                                                  aria-label={`${tr(language, "Reference load in kilograms for", "Carga de referencia en kilogramos para")} ${exerciseName}`}
                                                  type="number"
                                                  min={0}
                                                  step={0.5}
                                                  value={item.loadKg ?? ""}
                                                  onFocus={(event) => event.target.select()}
                                                  onChange={(event) => {
                                                    const clean = event.target.value.replace(/^0+(?=\d)/, "");
                                                    event.target.value = clean;
                                                    onUpdateItem?.(itemId, {
                                                      loadKg: clean === "" ? null : Number(clean),
                                                    });
                                                  }}
                                                />
                                              </label>
                                              <label className="is-wide">
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

                                          {mode === "edit" && (item.originalSetPlan || isFreeLegacySetPlan(item.setPlan)) && (
                                            <small className="original-plan-note">{tr(language, "Original plan note", "Nota original del plan")}: {item.originalSetPlan ?? item.setPlan}</small>
                                          )}

                                          {mode === "edit" && item.prescriptionMode === "special" && (
                                            <SpecialTechniqueEditor
                                              language={language}
                                              prescription={item.specialPrescription ?? createSpecialPrescription("rest-pause")}
                                              onChange={(specialPrescription) => onUpdateItem?.(itemId, { specialPrescription })}
                                            />
                                          )}

                                          {mode === "edit" && item.prescriptionMode !== "special" && (
                                            <div className="stepper-row">
                                              <Stepper
                                                language={language}
                                                label={tr(language, "sets", "series")}
                                                value={item.sets}
                                                onDecrease={() => onUpdate(itemId, "sets", -1)}
                                                onIncrease={() => onUpdate(itemId, "sets", 1)}
                                              />
                                              <label>
                                                {tr(language, "Repetition count", "Conteo de repeticiones")}
                                                <select
                                                  aria-label={`${tr(language, "Repetition count for", "Conteo de repeticiones para")} ${exerciseName}`}
                                                  value={item.repetitionCount ?? "total"}
                                                  onChange={(event) => onUpdateItem?.(itemId, { repetitionCount: event.target.value as WorkoutItem["repetitionCount"] })}
                                                >
                                                  <option value="total">{tr(language, "Total", "Total")}</option>
                                                  <option value="per-side">{tr(language, "Per side", "Por lado")}</option>
                                                </select>
                                              </label>
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
                                                  <strong>{exerciseDisplayName(alternative, language)}</strong>
                                                  <small>{exerciseTaxonomyLabel(alternative.equipment, language)}</small>
                                                </button>
                                              )) : <p>{tr(language, "No close alternative found in this equipment set.", "No encontramos una alternativa cercana con este equipo.")}</p>}
                                            </div>
                                          )}
                                        </div>
                                      </li>
                                    );
                                  })}
                                </ol>

                                {mode === "edit" && (
                                  <div className="routine-block-footer">
                                    <button
                                      type="button"
                                      className="done-block-button"
                                      onClick={() => setOpenBlockId(null)}
                                    >
                                      <Check size={14} /> {tr(language, "Done with block", "Listo con este bloque")}
                                    </button>
                                  </div>
                                )}
                              </details>
                            );
                          })}
                        </div>
                      )}

                      {mode === "edit" && (onAddExercise || onAddStructure) && addingToDay !== day && (
                        <button
                          className="add-block-button"
                          type="button"
                          onClick={() => {
                            setTrainingDay(day);
                            setAddingToDay(day);
                            setOpenBlockId(null);
                          }}
                        >
                          <Plus size={15} /> {tr(language, "Add exercise or block", "Agregar ejercicio o bloque")}
                        </button>
                      )}

                      {mode === "edit" && (onAddExercise || onAddStructure) && addingToDay === day && (
                        <ExerciseAdder
                          language={language}
                          exercises={exercises}
                          equipmentPreference={track.equipment}
                          routeDays={routeDays}
                          initialDay={day}
                          restrictedMovements={restrictedMovements}
                          onAddExercise={onAddExercise}
                          onAddStructure={(type, exerciseIds, targetDay, prescriptions) => {
                            onAddStructure?.(type, exerciseIds, targetDay, prescriptions);
                            setAddingToDay(null);
                            setOpenBlockId(null);
                          }}
                          onOpenExercise={onOpenExercise}
                          onFinish={() => {
                            setAddingToDay(null);
                          }}
                        />
                      )}
                    </div>
                  </details>
                );
              })}
            </div>
          )}

          {mode === "edit" && (
            <div className="workout-edit-footer">
              <button
                className="finish-day-button finish-edition-button is-primary"
                type="button"
                onClick={() => {
                  setAddingToDay(null);
                  setOpenBlockId(null);
                  setMode("view");
                }}
              >
                <Check size={18} /> {tr(language, "Finish editing", "Finalizar edición")}
              </button>
              {items.length > 0 && (
                <button className="clear-button clear-workout-button" type="button" onClick={onClear}>
                  <Trash2 size={16} /> {tr(language, "Clear workout", "Vaciar entrenamiento")}
                </button>
              )}
            </div>
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
  initialDay?: Weekday;
  showDayPicker?: boolean;
  restrictedMovements?: MovementRestriction[];
  onAddExercise?: (exerciseId: string, day: Weekday) => void;
  onAddStructure?: (type: WorkoutStructureType, exerciseIds: string[], day: Weekday, prescriptions?: Partial<WorkoutItem>[]) => void;
  onOpenExercise: (exercise: Exercise) => void;
  onFinish?: () => void;
}

function ExerciseAdder({
  language,
  exercises,
  equipmentPreference,
  routeDays,
  initialDay,
  showDayPicker = false,
  restrictedMovements = [],
  onAddExercise,
  onAddStructure,
  onOpenExercise,
  onFinish,
}: ExerciseAdderProps) {
  const [structureType, setStructureType] = useState<WorkoutStructureType | null>(null);
  const [step, setStep] = useState(0);
  const [prescriptions, setPrescriptions] = useState<Partial<WorkoutItem>[]>([{ sets: 3, reps: 10, prescriptionMode: "standard" }]);
  const [queries, setQueries] = useState<string[]>([""]);
  const [selectedExercises, setSelectedExercises] = useState<Array<Exercise | null>>([null]);
  const [activeSlot, setActiveSlot] = useState(0);
  const [visibleCount, setVisibleCount] = useState(40);
  const [selectedDay, setSelectedDay] = useState<Weekday>(initialDay ?? routeDays[0] ?? "monday");
  const dayLabel = (day: Weekday) => tr(language, ...DAY_LABELS[day]);
  const structureOption = WORKOUT_STRUCTURE_OPTIONS.find((option) => option.value === structureType);
  const slotCount = selectedExercises.length;
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
  useEffect(() => setSelectedDay(initialDay ?? routeDays[0] ?? "monday"), [initialDay, routeDays]);

  function updatePrescription(index: number, changes: Partial<WorkoutItem>) {
    setPrescriptions((current) => current.map((value, slot) => slot === index ? { ...value, ...changes } : value));
  }
  function changeTarget(index: number, target: WorkTargetType) {
    const current = prescriptions[index];
    updatePrescription(index, target === "reps" ? { prescriptionMode: "standard" } : {
      prescriptionMode: "special",
      specialPrescription: { technique: "custom", rounds: current.sets ?? 3, restBetweenRoundsSeconds: 0,
        blocks: [{ id: `member-${index}-target`, type: "work", target, ...(target === "time" ? { value: current.reps ?? 10 } : {}), loadType: "same" }] },
    });
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
    if (!structureType || selectedExercises.some((exercise) => !exercise) || workoutStructureSlotCount(structureType) !== selectedExercises.length || !prescriptions.every(isValidManualPrescription)) return;
    const exerciseIds = selectedExercises.flatMap((exercise) => exercise ? [exercise.id] : []);
    if (!onAddStructure) return;
    onAddStructure(structureType, exerciseIds, selectedDay, prescriptions);
    setStructureType(null);
    setQueries([""]);
    setSelectedExercises([null]);
    setPrescriptions([{ sets: 3, reps: 10, prescriptionMode: "standard" }]);
    setStep(0);
    onFinish?.();
  }

  return (
    <section className="manual-exercise-adder" aria-label={tr(language, "Add exercises", "Agregar ejercicios")}>
      <div className="manual-adder-heading">
        <div className="manual-adder-heading-top">
          <div>
            <span>{tr(language, "Structure → exercises → sets and technique", "Estructura → ejercicios → series y técnica")}</span>
          </div>
          {onFinish && (
            <button
              className="manual-adder-cancel"
              type="button"
              onClick={onFinish}
              aria-label={tr(language, "Cancel", "Cancelar")}
            >
              <X size={15} />
              <span>{tr(language, "Cancel", "Cancelar")}</span>
            </button>
          )}
        </div>
      </div>

      {showDayPicker && routeDays.length > 1 && (
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
      )}

      {step === 0 && (
        <div className="structure-choice">
          <div className="structure-choice-heading">
            <span>{tr(language, "Step 1 of 3", "Paso 1 de 3")}</span>
            <strong>{tr(language, "Choose a training structure", "Elegí una estructura de trabajo")}</strong>
          </div>
          <div className="structure-choice-grid">
            {WORKOUT_STRUCTURE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  const count = workoutStructureSlotCount(option.value);
                  setStructureType(option.value);
                  setSelectedExercises(Array(count).fill(null));
                  setQueries(Array(count).fill(""));
                  setPrescriptions(Array.from({ length: count }, () => ({ sets: 3, reps: 10, prescriptionMode: "standard" })));
                  setActiveSlot(0);
                  setStep(1);
                }}
              >
                {localizedOptionLabel(option, language)}
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 1 && (
        <>
          <div className="structure-builder-heading">
            <button type="button" onClick={() => { setStep(0); setStructureType(null); }}>
              <ChevronLeft size={16} /> {tr(language, "Back", "Volver")}
            </button>
            <div>
              <span>{tr(language, "Building", "Armando")}</span>
              <strong>{structureOption ? localizedOptionLabel(structureOption, language) : structureType}</strong>
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
                        <small>{exerciseTaxonomyLabel(exercise.target, language)} · {exerciseTaxonomyLabel(exercise.category, language)} · {exerciseTaxonomyLabel(exercise.equipment, language)}</small>
                        {isExerciseNamePending(exercise, language) && <small className="translation-pending">Nombre en inglés · traducción pendiente</small>}
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
            onClick={() => setStep(2)}
          >
            <Plus size={16} /> {tr(language, "Configure sets and repetitions", "Configurar series y repeticiones")}
          </button>
        </>
      )}

      {step === 2 && (
        <div className="member-prescriptions">
          <div className="structure-builder-heading">
            <button type="button" onClick={() => setStep(1)}>
              <ChevronLeft size={16} /> {tr(language, "Back", "Volver")}
            </button>
            <div>
              <span>{tr(language, "Building", "Armando")}</span>
              <strong>{structureOption ? localizedOptionLabel(structureOption, language) : structureType}</strong>
            </div>
          </div>
          {selectedExercises.map((exercise, index) => {
            const name = exercise ? exerciseDisplayName(exercise, language) : String(index + 1);
            const prescription = prescriptions[index];
            const block = prescription.specialPrescription?.blocks.find((block) => block.type === "work");
            const target = prescription.prescriptionMode === "special" && block?.type === "work" ? block.target : "reps";
            return (
              <fieldset key={index} className="special-round-settings">
                <legend>{name}</legend>
                <label>
                  {tr(language, "Sets", "Series")}
                  <input
                    aria-label={selectedExercises.length === 1 ? tr(language, "Sets", "Series") : `${tr(language, "Sets for", "Series para")} ${name}`}
                    type="number"
                    min="1"
                    max="12"
                    value={prescription.sets === 0 ? "" : (prescription.sets ?? "")}
                    onFocus={(event) => event.target.select()}
                    onChange={(event) => {
                      const clean = event.target.value.replace(/^0+(?=\d)/, "");
                      event.target.value = clean;
                      const parsed = clean === "" ? 0 : Number(clean);
                      updatePrescription(index, {
                        sets: parsed,
                        ...(prescription.specialPrescription ? { specialPrescription: { ...prescription.specialPrescription, rounds: parsed } } : {}),
                      });
                    }}
                  />
                </label>
                <label>
                  {tr(language, "Target", "Objetivo")}
                  <select
                    aria-label={`${tr(language, "Target for", "Objetivo para")} ${name}`}
                    value={target}
                    onChange={(event) => changeTarget(index, event.target.value as WorkTargetType)}
                  >
                    <option value="reps">{tr(language, "Exact repetitions", "Repeticiones exactas")}</option>
                    <option value="technical-failure">{tr(language, "Technical failure", "Fallo técnico")}</option>
                    <option value="time">{tr(language, "Time", "Tiempo")}</option>
                    <option value="amrap">AMRAP</option>
                  </select>
                </label>
                {(target === "reps" || target === "time") && (
                  <label>
                    {target === "time" ? tr(language, "Seconds", "Segundos") : tr(language, "Repetitions", "Repeticiones")}
                    <input
                      aria-label={selectedExercises.length === 1 ? (target === "time" ? tr(language, "Seconds", "Segundos") : tr(language, "Repetitions", "Repeticiones")) : `${target === "time" ? tr(language, "Seconds for", "Segundos para") : tr(language, "Repetitions for", "Repeticiones para")} ${name}`}
                      type="number"
                      min="1"
                      max={target === "reps" ? 100 : undefined}
                      value={
                        (target === "time" ? block?.value : prescription.reps) === 0
                          ? ""
                          : ((target === "time" ? block?.value : prescription.reps) ?? "")
                      }
                      onFocus={(event) => event.target.select()}
                      onChange={(event) => {
                        const clean = event.target.value.replace(/^0+(?=\d)/, "");
                        event.target.value = clean;
                        const parsed = clean === "" ? 0 : Number(clean);
                        updatePrescription(
                          index,
                          target === "time" && prescription.specialPrescription
                            ? {
                                specialPrescription: {
                                  ...prescription.specialPrescription,
                                  blocks: prescription.specialPrescription.blocks.map((value) =>
                                    value.type === "work" ? { ...value, value: parsed } : value,
                                  ),
                                },
                              }
                            : { reps: parsed },
                        );
                      }}
                    />
                  </label>
                )}
                {target === "reps" && (
                  <label>
                    {tr(language, "Repetition count", "Conteo de repeticiones")}
                    <select
                      aria-label={`${tr(language, "Repetition count for", "Conteo de repeticiones para")} ${name}`}
                      value={prescription.repetitionCount ?? "total"}
                      onChange={(event) => updatePrescription(index, { repetitionCount: event.target.value as WorkoutItem["repetitionCount"] })}
                    >
                      <option value="total">{tr(language, "Total", "Total")}</option>
                      <option value="per-side">{tr(language, "Per side", "Por lado")}</option>
                    </select>
                  </label>
                )}
              </fieldset>
            );
          })}
          <div className="manual-adder-actions">
            <button
              className="is-primary"
              type="button"
              disabled={!prescriptions.every(isValidManualPrescription)}
              onClick={addSelectedStructure}
            >
              {tr(language, "Save and continue", "Guardar y continuar")}
            </button>
            {onFinish && (
              <button
                className="finish-day-button is-secondary"
                type="button"
                onClick={() => {
                  if (prescriptions.every(isValidManualPrescription)) {
                    addSelectedStructure();
                  }
                  onFinish();
                }}
              >
                {tr(language, "Finish day routine", "Finalizar rutina del día")}
              </button>
            )}
          </div>
        </div>
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
    return `${item.specialPrescription.rounds} × ${techniqueLabel(item.specialPrescription.technique, language)} · ${item.specialPrescription.blocks.map((block) => block.type === "work" ? workTargetLabel(block, language) : `${block.seconds}s`).join(" → ")}`;
  }
  return `${item.sets} × ${item.reps}${repetitionCountSuffix(item.repetitionCount, language)}`;
}

function prescriptionWithCount(technique: SpecialTechniqueKind, count: WorkoutItem["repetitionCount"]): SpecialWorkoutPrescription {
  const next = createSpecialPrescription(technique);
  return count === undefined ? next : { ...next, blocks: next.blocks.map((block) => block.type === "work" ? { ...block, repetitionCount: count } : block) };
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
            onClick={() => {
              const workBlocks = prescription.blocks.filter((block) => block.type === "work");
              let workIndex = 0;
              const next = createSpecialPrescription(option.value as SpecialTechniqueKind);
              onChange({ ...next, blocks: next.blocks.map((block) => {
                if (block.type !== "work") return block;
                const count = workBlocks[workIndex++]?.repetitionCount;
                return count === undefined ? block : { ...block, repetitionCount: count };
              }) });
            }}
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
            value={prescription.rounds === 0 ? "" : prescription.rounds}
            onFocus={(event) => event.target.select()}
            onChange={(event) => {
              const clean = event.target.value.replace(/^0+(?=\d)/, "");
              event.target.value = clean;
              onChange({ ...prescription, rounds: clean === "" ? 1 : Math.max(1, Number(clean)) });
            }}
          />
          <small>{tr(language, "rounds", "series")}</small>
        </label>
        <label>
          <span>{tr(language, "Rest between full rounds", "Descanso entre series completas")}</span>
          <input
            type="number"
            min={0}
            step={5}
            value={prescription.restBetweenRoundsSeconds === 0 ? "" : prescription.restBetweenRoundsSeconds}
            onFocus={(event) => event.target.select()}
            onChange={(event) => {
              const clean = event.target.value.replace(/^0+(?=\d)/, "");
              event.target.value = clean;
              onChange({ ...prescription, restBetweenRoundsSeconds: clean === "" ? 0 : Math.max(0, Number(clean)) });
            }}
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
                <div>
                  <input
                    type="number"
                    min={0}
                    step={5}
                    value={block.seconds === 0 ? "" : block.seconds}
                    onFocus={(event) => event.target.select()}
                    onChange={(event) => {
                      const clean = event.target.value.replace(/^0+(?=\d)/, "");
                      event.target.value = clean;
                      updateBlock(index, { seconds: clean === "" ? 0 : Math.max(0, Number(clean)) });
                    }}
                  />
                  <small>{tr(language, "seconds", "segundos")}</small>
                </div>
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
                    <input
                      type="number"
                      min={1}
                      value={block.value === 0 ? "" : (block.value ?? 1)}
                      onFocus={(event) => event.target.select()}
                      onChange={(event) => {
                        const clean = event.target.value.replace(/^0+(?=\d)/, "");
                        event.target.value = clean;
                        updateBlock(index, { value: clean === "" ? 1 : Math.max(1, Number(clean)) });
                      }}
                    />
                  </label>
                )}
                {block.target === "reps" && <label><span>{tr(language, "Repetition count", "Conteo de repeticiones")}</span><select aria-label={`${tr(language, "Repetition count for block", "Conteo de repeticiones del bloque")} ${index + 1}`} value={block.repetitionCount ?? "total"} onChange={(event) => updateBlock(index, { repetitionCount: event.target.value as typeof block.repetitionCount })}><option value="total">{tr(language, "Total", "Total")}</option><option value="per-side">{tr(language, "Per side", "Por lado")}</option></select></label>}
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
                    <input
                      type="number"
                      min={0}
                      step={block.loadType === "kg" ? 0.5 : 5}
                      value={block.loadValue === 0 ? "" : (block.loadValue ?? 0)}
                      onFocus={(event) => event.target.select()}
                      onChange={(event) => {
                        const clean = event.target.value.replace(/^0+(?=\d)/, "");
                        event.target.value = clean;
                        updateBlock(index, { loadValue: clean === "" ? 0 : Math.max(0, Number(clean)) });
                      }}
                    />
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
