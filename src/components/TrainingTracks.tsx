import { Activity, ArrowRight, CalendarDays, Dumbbell, Pencil, Plus, RefreshCw, Trash2, Trophy, X } from "lucide-react";
import { useState } from "react";
import { WEEKDAYS } from "../lib/exercises";
import { tr } from "../lib/i18n";
import type { EquipmentPreference, LanguageCode, TrackCreationMode, TrackFocus, TrackKind, TrainingTrack, Weekday } from "../types";

export interface NewTrackInput {
  name: string;
  kind: TrackKind;
  focus: TrackFocus;
  equipment: EquipmentPreference;
  sessionMinutes: number;
  daysPerWeek: number;
  trainingDays: Weekday[];
  creationMode: TrackCreationMode;
}

interface TrainingTracksProps {
  language?: LanguageCode;
  tracks: TrainingTrack[];
  activeTrackId: string;
  onOpen: (trackId: string) => void;
  onCreate: (input: NewTrackInput) => void;
  onGenerate: (trackId: string) => void;
  onDelete: (trackId: string) => void;
  onEdit?: (trackId: string, changes: Partial<TrainingTrack>) => void;
}

const GOAL_OPTIONS: { value: TrackFocus; label: string }[] = [
  { value: "strength", label: "Strength" },
  { value: "weight-loss", label: "Weight loss" },
  { value: "muscle-gain", label: "Muscle gain" },
  { value: "general-fitness", label: "General fitness" },
  { value: "endurance", label: "Endurance" },
  { value: "mobility", label: "Mobility" },
];

const SPORT_OPTIONS: { value: TrackFocus; label: string }[] = [
  { value: "beach-volleyball", label: "Beach volleyball" },
  { value: "running", label: "Running" },
  { value: "cycling", label: "Cycling" },
  { value: "mountain-biking", label: "Mountain biking (MTB)" },
  { value: "swimming", label: "Swimming" },
  { value: "tennis-padel", label: "Tennis / padel" },
  { value: "soccer", label: "Soccer" },
];

const SPANISH_FOCUS_LABELS: Record<TrackFocus, string> = {
  strength: "Fuerza",
  "weight-loss": "Pérdida de peso",
  "muscle-gain": "Ganancia muscular",
  "general-fitness": "Condición física general",
  endurance: "Resistencia",
  mobility: "Movilidad",
  "beach-volleyball": "Vóley playa",
  running: "Running",
  cycling: "Ciclismo",
  "mountain-biking": "Ciclismo de montaña (MTB)",
  swimming: "Natación",
  "tennis-padel": "Tenis / pádel",
  soccer: "Fútbol",
};

const WEEKDAY_LABELS: Record<Weekday, [string, string]> = {
  monday: ["Monday", "Lunes"],
  tuesday: ["Tuesday", "Martes"],
  wednesday: ["Wednesday", "Miércoles"],
  thursday: ["Thursday", "Jueves"],
  friday: ["Friday", "Viernes"],
  saturday: ["Saturday", "Sábado"],
  sunday: ["Sunday", "Domingo"],
};

export function trackFocusLabel(focus: TrackFocus, language: LanguageCode = "en"): string {
  return language === "en"
    ? [...GOAL_OPTIONS, ...SPORT_OPTIONS].find((option) => option.value === focus)?.label ?? focus
    : SPANISH_FOCUS_LABELS[focus];
}

export function TrainingTracks({
  language = "en",
  tracks,
  activeTrackId,
  onOpen,
  onCreate,
  onGenerate,
  onDelete,
  onEdit,
}: TrainingTracksProps) {
  const [creatorOpen, setCreatorOpen] = useState(false);
  const [editingTrack, setEditingTrack] = useState<TrainingTrack | null>(null);
  const [deletingTrack, setDeletingTrack] = useState<TrainingTrack | null>(null);
  const plannedDays = tracks.reduce((sum, track) => sum + track.daysPerWeek, 0);

  return (
    <section className="tracks-section" aria-labelledby="tracks-title">
      <div className="tracks-heading">
        <div>
          <p className="eyebrow">{tr(language, "One profile / multiple priorities", "Un perfil / múltiples prioridades")}</p>
          <h2 id="tracks-title">{tr(language, "Training tracks", "Rutas de entrenamiento")}</h2>
        </div>
        <div className={`weekly-load ${plannedDays > 5 ? "is-high" : ""}`}>
          <CalendarDays size={18} />
          <span><strong>{plannedDays}</strong> {tr(language, "planned sessions", "sesiones planeadas")}</span>
          <small>{plannedDays > 5 ? tr(language, "Review recovery between tracks", "Revisá la recuperación entre rutas") : `${tr(language, "Across", "En")} ${tracks.length} ${tracks.length === 1 ? tr(language, "track", "ruta") : tr(language, "tracks", "rutas")}`}</small>
        </div>
      </div>

      <div className="tracks-grid">
        {tracks.map((track, index) => {
          const active = track.id === activeTrackId;
          return (
            <article className={`track-card ${active ? "is-active" : ""}`} key={track.id}>
              <button
                className="track-delete"
                type="button"
                onClick={() => setDeletingTrack(track)}
                aria-label={`${tr(language, "Delete", "Eliminar")} ${track.name}`}
              >
                <Trash2 size={15} />
              </button>
              <button
                className="track-edit"
                type="button"
                onClick={() => setEditingTrack(track)}
                aria-label={`${tr(language, "Edit", "Editar")} ${track.name}`}
              >
                <Pencil size={15} />
              </button>
              <button className="track-select" type="button" onClick={() => onOpen(track.id)} aria-pressed={active}>
                <span className="track-index">{tr(language, "TRACK", "RUTA")} / {String(index + 1).padStart(2, "0")}</span>
                <span className="track-kind">
                  {track.kind === "sport" ? <Trophy size={16} /> : <Activity size={16} />}
                  {track.kind === "sport" ? tr(language, "Sport performance", "Rendimiento deportivo") : tr(language, "Personal goal", "Meta personal")}
                </span>
                <strong>{track.name}</strong>
                <span className="track-focus">{trackFocusLabel(track.focus, language)}</span>
                <span className="track-meta">
                  {track.daysPerWeek}× {tr(language, "weekly", "por semana")} · {track.sessionMinutes} min · {
                    track.equipment === "bodyweight"
                      ? tr(language, "Bodyweight", "Autocarga")
                      : track.equipment === "mixed" ? tr(language, "Mixed", "Mixto") : tr(language, "All equipment", "Todo el equipo")
                  }
                </span>
                <span className="track-status">
                  {active ? tr(language, "Open active routine", "Abrir rutina activa") : tr(language, "Switch & open routine", "Cambiar y abrir rutina")}
                  <ArrowRight size={16} />
                </span>
              </button>
              <button className="track-generate" type="button" onClick={() => onGenerate(track.id)}>
                <RefreshCw size={14} />
                {track.workout.length ? tr(language, "Refresh suggestions", "Actualizar sugerencias") : tr(language, "Suggest a routine", "Sugerir una rutina")}
              </button>
              <span className="track-count">{track.workout.length} {tr(language, "movements", "movimientos")}</span>
            </article>
          );
        })}

        <button className="new-track-card" type="button" onClick={() => setCreatorOpen(true)}>
          <Plus size={24} />
          <strong>{tr(language, "Add another track", "Agregar otra ruta")}</strong>
          <span>{tr(language, "Goal or sport", "Meta o deporte")}</span>
        </button>
      </div>

      <p className="track-guidance">
        {tr(language, "Suggestions are a starting point. Keep the tracks distinct, but review the combined weekly load and adjust around practice, matches, and recovery.", "Las sugerencias son un punto de partida. Mantené las rutas separadas, revisá la carga semanal combinada y ajustá según prácticas, partidos y recuperación.")}
      </p>

      {creatorOpen && (
        <TrackCreator
          language={language}
          onClose={() => setCreatorOpen(false)}
          onCreate={(input) => {
            onCreate(input);
            setCreatorOpen(false);
          }}
        />
      )}

      {editingTrack && (
        <TrackCreator
          language={language}
          initialTrack={editingTrack}
          onClose={() => setEditingTrack(null)}
          onCreate={() => undefined}
          onSave={(changes) => {
            onEdit?.(editingTrack.id, changes);
            setEditingTrack(null);
          }}
        />
      )}

      {deletingTrack && (
        <TrackDeleteDialog
          language={language}
          track={deletingTrack}
          onClose={() => setDeletingTrack(null)}
          onDelete={() => {
            onDelete(deletingTrack.id);
            setDeletingTrack(null);
          }}
        />
      )}
    </section>
  );
}

interface TrackDeleteDialogProps {
  language: LanguageCode;
  track: TrainingTrack;
  onClose: () => void;
  onDelete: () => void;
}

function TrackDeleteDialog({ language, track, onClose, onDelete }: TrackDeleteDialogProps) {
  return (
    <div className="track-modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="track-delete-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-track-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <p className="eyebrow">{tr(language, "Remove training track", "Eliminar ruta de entrenamiento")}</p>
        <h3 id="delete-track-title">{tr(language, "Delete", "¿Eliminar")} {track.name}?</h3>
        <p>{tr(language, "This removes its routine from this device. Your other tracks, saved exercises, and exercise library stay untouched.", "Esto elimina su rutina. Tus otras rutas, ejercicios guardados y la biblioteca permanecen intactos.")}</p>
        <div className="delete-dialog-actions">
          <button type="button" onClick={onClose}>{tr(language, "Keep track", "Conservar ruta")}</button>
          <button className="danger" type="button" onClick={onDelete}>{tr(language, "Delete track", "Eliminar ruta")}</button>
        </div>
      </section>
    </div>
  );
}

interface TrackCreatorProps {
  language: LanguageCode;
  onClose: () => void;
  onCreate: (input: NewTrackInput) => void;
  initialTrack?: TrainingTrack;
  onSave?: (changes: Partial<TrainingTrack>) => void;
}

function TrackCreator({ language, onClose, onCreate, initialTrack, onSave }: TrackCreatorProps) {
  const [kind, setKind] = useState<TrackKind>(initialTrack?.kind ?? "goal");
  const [focus, setFocus] = useState<TrackFocus>(initialTrack?.focus ?? "strength");
  const [name, setName] = useState(initialTrack?.name ?? "");
  const [equipment, setEquipment] = useState<EquipmentPreference>(initialTrack?.equipment ?? "any");
  const [sessionMinutes, setSessionMinutes] = useState(initialTrack?.sessionMinutes ?? 45);
  const [trainingDays, setTrainingDays] = useState<Weekday[]>(
    initialTrack?.trainingDays?.length
      ? initialTrack.trainingDays
      : WEEKDAYS.slice(0, initialTrack?.daysPerWeek ?? 2),
  );
  const [creationMode, setCreationMode] = useState<TrackCreationMode>(initialTrack?.creationMode ?? "suggested");
  const focusOptions = kind === "goal" ? GOAL_OPTIONS : SPORT_OPTIONS;
  const editing = Boolean(initialTrack);

  function chooseKind(nextKind: TrackKind) {
    setKind(nextKind);
    setFocus(nextKind === "goal" ? "strength" : "beach-volleyball");
  }

  function toggleTrainingDay(day: Weekday) {
    setTrainingDays((current) => {
      if (current.includes(day)) {
        return current.length === 1 ? current : current.filter((item) => item !== day);
      }
      return WEEKDAYS.filter((item) => item === day || current.includes(item));
    });
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const input = {
      name: name.trim() || trackFocusLabel(focus, language),
      kind,
      focus,
      equipment,
      sessionMinutes,
      daysPerWeek: trainingDays.length,
      trainingDays,
      creationMode,
    };
    if (editing) {
      onSave?.(input);
      return;
    }
    onCreate(input);
  }

  return (
    <div className="track-modal-backdrop" role="presentation" onMouseDown={onClose}>
      <form className="track-creator" onSubmit={submit} onMouseDown={(event) => event.stopPropagation()}>
        <button className="close-button inline" type="button" onClick={onClose} aria-label={tr(language, "Close track creator", "Cerrar creación de ruta")}><X size={20} /></button>
        <p className="eyebrow">{tr(language, "New training track", "Nueva ruta de entrenamiento")}</p>
        <h3>{tr(language, "What are we training for?", "¿Para qué vamos a entrenar?")}</h3>

        <div className="kind-switch" role="group" aria-label="Track type">
          <button className={kind === "goal" ? "is-active" : ""} type="button" onClick={() => chooseKind("goal")}>
            <Activity size={17} /> {tr(language, "Personal goal", "Meta personal")}
          </button>
          <button className={kind === "sport" ? "is-active" : ""} type="button" onClick={() => chooseKind("sport")}>
            <Trophy size={17} /> {tr(language, "Sport", "Deporte")}
          </button>
        </div>

        <label className="creator-field">
          <span>{kind === "goal" ? tr(language, "Goal", "Meta") : tr(language, "Sport", "Deporte")}</span>
          <select aria-label={kind === "goal" ? tr(language, "Goal", "Meta") : tr(language, "Sport", "Deporte")} value={focus} onChange={(event) => setFocus(event.target.value as TrackFocus)}>
            {focusOptions.map((option) => <option key={option.value} value={option.value}>{trackFocusLabel(option.value, language)}</option>)}
          </select>
        </label>

        <label className="creator-field">
          <span>{tr(language, "Routine name", "Nombre de la rutina")}</span>
          <input aria-label={tr(language, "Routine name", "Nombre de la rutina")} value={name} onChange={(event) => setName(event.target.value)} placeholder={`${tr(language, "e.g.", "ej.")} ${trackFocusLabel(focus, language)} base`} />
        </label>

        {!editing && (
          <div className="kind-switch creation-mode-switch" role="group" aria-label={tr(language, "Routine creation mode", "Modo de creación de rutina")}>
            <button className={creationMode === "suggested" ? "is-active" : ""} type="button" onClick={() => setCreationMode("suggested")}>
              {tr(language, "Suggested routine", "Rutina sugerida")}
            </button>
            <button className={creationMode === "manual" ? "is-active" : ""} type="button" onClick={() => setCreationMode("manual")}>
              {tr(language, "Manual routine", "Rutina manual")}
            </button>
          </div>
        )}

        <div className="creator-row">
          <label className="creator-field">
            <span>{tr(language, "Equipment", "Equipo")}</span>
            <select value={equipment} onChange={(event) => setEquipment(event.target.value as EquipmentPreference)}>
              <option value="any">{tr(language, "All equipment", "Todo el equipo")}</option>
              <option value="mixed">{tr(language, "Mixed", "Mixto")}</option>
              <option value="bodyweight">{tr(language, "Bodyweight only", "Solo autocarga")}</option>
            </select>
          </label>
          <label className="creator-field">
            <span>{tr(language, "Session minutes", "Minutos por sesión")}</span>
            <input
              aria-label={tr(language, "Session minutes", "Minutos por sesión")}
              type="number"
              min={15}
              max={240}
              step={5}
              value={sessionMinutes}
              onChange={(event) => setSessionMinutes(Number(event.target.value))}
            />
          </label>
        </div>

        <fieldset className="training-day-picker">
          <legend>{tr(language, "Training days", "Días de entrenamiento")}</legend>
          <p>{tr(language, "Choose the days this route will use.", "Elegí los días que va a usar esta ruta.")}</p>
          <div>
            {WEEKDAYS.map((day) => (
              <button
                key={day}
                className={trainingDays.includes(day) ? "is-active" : ""}
                type="button"
                aria-pressed={trainingDays.includes(day)}
                onClick={() => toggleTrainingDay(day)}
              >
                {tr(language, ...WEEKDAY_LABELS[day])}
              </button>
            ))}
          </div>
        </fieldset>

        <button className="create-track-button" type="submit">
          <Dumbbell size={18} /> {
            editing
              ? tr(language, "Save track changes", "Guardar cambios de la ruta")
              : creationMode === "manual"
                ? tr(language, "Create manual track", "Crear ruta manual")
                : tr(language, "Create track & suggest routine", "Crear ruta y sugerir rutina")
          }
        </button>
      </form>
    </div>
  );
}
