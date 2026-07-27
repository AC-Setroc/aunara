import { Activity, ArrowRight, CalendarDays, Dumbbell, Plus, RefreshCw, Trash2, Trophy, X } from "lucide-react";
import { useState } from "react";
import { tr } from "../lib/i18n";
import type { EquipmentPreference, LanguageCode, TrackFocus, TrackKind, TrainingTrack } from "../types";

export interface NewTrackInput {
  name: string;
  kind: TrackKind;
  focus: TrackFocus;
  equipment: EquipmentPreference;
  sessionMinutes: number;
  daysPerWeek: number;
}

interface TrainingTracksProps {
  language?: LanguageCode;
  tracks: TrainingTrack[];
  activeTrackId: string;
  onOpen: (trackId: string) => void;
  onCreate: (input: NewTrackInput) => void;
  onGenerate: (trackId: string) => void;
  onDelete: (trackId: string) => void;
}

const GOAL_OPTIONS: { value: TrackFocus; label: string }[] = [
  { value: "strength", label: "Strength" },
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
}: TrainingTracksProps) {
  const [creatorOpen, setCreatorOpen] = useState(false);
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
              <button className="track-select" type="button" onClick={() => onOpen(track.id)} aria-pressed={active}>
                <span className="track-index">{tr(language, "TRACK", "RUTA")} / {String(index + 1).padStart(2, "0")}</span>
                <span className="track-kind">
                  {track.kind === "sport" ? <Trophy size={16} /> : <Activity size={16} />}
                  {track.kind === "sport" ? tr(language, "Sport performance", "Rendimiento deportivo") : tr(language, "Personal goal", "Meta personal")}
                </span>
                <strong>{track.name}</strong>
                <span className="track-focus">{trackFocusLabel(track.focus, language)}</span>
                <span className="track-meta">
                  {track.daysPerWeek}× weekly · {track.sessionMinutes} min · {
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
}

function TrackCreator({ language, onClose, onCreate }: TrackCreatorProps) {
  const [kind, setKind] = useState<TrackKind>("goal");
  const [focus, setFocus] = useState<TrackFocus>("strength");
  const [name, setName] = useState("");
  const [equipment, setEquipment] = useState<EquipmentPreference>("any");
  const [sessionMinutes, setSessionMinutes] = useState(45);
  const [daysPerWeek, setDaysPerWeek] = useState(2);
  const focusOptions = kind === "goal" ? GOAL_OPTIONS : SPORT_OPTIONS;

  function chooseKind(nextKind: TrackKind) {
    setKind(nextKind);
    setFocus(nextKind === "goal" ? "strength" : "beach-volleyball");
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onCreate({
      name: name.trim() || trackFocusLabel(focus, language),
      kind,
      focus,
      equipment,
      sessionMinutes,
      daysPerWeek,
    });
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
          <select value={focus} onChange={(event) => setFocus(event.target.value as TrackFocus)}>
            {focusOptions.map((option) => <option key={option.value} value={option.value}>{trackFocusLabel(option.value, language)}</option>)}
          </select>
        </label>

        <label className="creator-field">
          <span>{tr(language, "Routine name", "Nombre de la rutina")}</span>
          <input value={name} onChange={(event) => setName(event.target.value)} placeholder={`${tr(language, "e.g.", "ej.")} ${trackFocusLabel(focus, language)} base`} />
        </label>

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
            <span>{tr(language, "Session", "Sesión")}</span>
            <select value={sessionMinutes} onChange={(event) => setSessionMinutes(Number(event.target.value))}>
              <option value={30}>30 {tr(language, "minutes", "minutos")}</option>
              <option value={45}>45 {tr(language, "minutes", "minutos")}</option>
              <option value={60}>60 {tr(language, "minutes", "minutos")}</option>
            </select>
          </label>
          <label className="creator-field">
            <span>{tr(language, "Weekly", "Semanal")}</span>
            <select value={daysPerWeek} onChange={(event) => setDaysPerWeek(Number(event.target.value))}>
              {[1, 2, 3, 4, 5].map((days) => <option key={days} value={days}>{days} {days === 1 ? tr(language, "day", "día") : tr(language, "days", "días")}</option>)}
            </select>
          </label>
        </div>

        <button className="create-track-button" type="submit">
          <Dumbbell size={18} /> {tr(language, "Create track & suggest routine", "Crear ruta y sugerir rutina")}
        </button>
      </form>
    </div>
  );
}
