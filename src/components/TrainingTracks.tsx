import { Activity, ArrowRight, CalendarDays, Dumbbell, Plus, RefreshCw, Trash2, Trophy, X } from "lucide-react";
import { useState } from "react";
import type { EquipmentPreference, TrackFocus, TrackKind, TrainingTrack } from "../types";

export interface NewTrackInput {
  name: string;
  kind: TrackKind;
  focus: TrackFocus;
  equipment: EquipmentPreference;
  sessionMinutes: number;
  daysPerWeek: number;
}

interface TrainingTracksProps {
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

export function trackFocusLabel(focus: TrackFocus): string {
  return [...GOAL_OPTIONS, ...SPORT_OPTIONS].find((option) => option.value === focus)?.label ?? focus;
}

export function TrainingTracks({
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
          <p className="eyebrow">One profile / multiple priorities</p>
          <h2 id="tracks-title">Training tracks</h2>
        </div>
        <div className={`weekly-load ${plannedDays > 5 ? "is-high" : ""}`}>
          <CalendarDays size={18} />
          <span><strong>{plannedDays}</strong> planned sessions</span>
          <small>{plannedDays > 5 ? "Review recovery between tracks" : `Across ${tracks.length} ${tracks.length === 1 ? "track" : "tracks"}`}</small>
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
                aria-label={`Delete ${track.name}`}
              >
                <Trash2 size={15} />
              </button>
              <button className="track-select" type="button" onClick={() => onOpen(track.id)} aria-pressed={active}>
                <span className="track-index">TRACK / {String(index + 1).padStart(2, "0")}</span>
                <span className="track-kind">
                  {track.kind === "sport" ? <Trophy size={16} /> : <Activity size={16} />}
                  {track.kind === "sport" ? "Sport performance" : "Personal goal"}
                </span>
                <strong>{track.name}</strong>
                <span className="track-focus">{trackFocusLabel(track.focus)}</span>
                <span className="track-meta">
                  {track.daysPerWeek}× weekly · {track.sessionMinutes} min · {
                    track.equipment === "bodyweight"
                      ? "Bodyweight"
                      : track.equipment === "mixed" ? "Mixed" : "All equipment"
                  }
                </span>
                <span className="track-status">
                  {active ? "Open active routine" : "Switch & open routine"}
                  <ArrowRight size={16} />
                </span>
              </button>
              <button className="track-generate" type="button" onClick={() => onGenerate(track.id)}>
                <RefreshCw size={14} />
                {track.workout.length ? "Refresh suggestions" : "Suggest a routine"}
              </button>
              <span className="track-count">{track.workout.length} movements</span>
            </article>
          );
        })}

        <button className="new-track-card" type="button" onClick={() => setCreatorOpen(true)}>
          <Plus size={24} />
          <strong>Add another track</strong>
          <span>Goal or sport</span>
        </button>
      </div>

      <p className="track-guidance">
        Suggestions are a starting point. Keep the tracks distinct, but review the combined weekly load and adjust around practice, matches, and recovery.
      </p>

      {creatorOpen && (
        <TrackCreator
          onClose={() => setCreatorOpen(false)}
          onCreate={(input) => {
            onCreate(input);
            setCreatorOpen(false);
          }}
        />
      )}

      {deletingTrack && (
        <TrackDeleteDialog
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
  track: TrainingTrack;
  onClose: () => void;
  onDelete: () => void;
}

function TrackDeleteDialog({ track, onClose, onDelete }: TrackDeleteDialogProps) {
  return (
    <div className="track-modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="track-delete-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-track-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <p className="eyebrow">Remove training track</p>
        <h3 id="delete-track-title">Delete {track.name}?</h3>
        <p>This removes its routine from this device. Your other tracks, saved exercises, and exercise library stay untouched.</p>
        <div className="delete-dialog-actions">
          <button type="button" onClick={onClose}>Keep track</button>
          <button className="danger" type="button" onClick={onDelete}>Delete track</button>
        </div>
      </section>
    </div>
  );
}

interface TrackCreatorProps {
  onClose: () => void;
  onCreate: (input: NewTrackInput) => void;
}

function TrackCreator({ onClose, onCreate }: TrackCreatorProps) {
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
      name: name.trim() || trackFocusLabel(focus),
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
        <button className="close-button inline" type="button" onClick={onClose} aria-label="Close track creator"><X size={20} /></button>
        <p className="eyebrow">New training track</p>
        <h3>What are we training for?</h3>

        <div className="kind-switch" role="group" aria-label="Track type">
          <button className={kind === "goal" ? "is-active" : ""} type="button" onClick={() => chooseKind("goal")}>
            <Activity size={17} /> Personal goal
          </button>
          <button className={kind === "sport" ? "is-active" : ""} type="button" onClick={() => chooseKind("sport")}>
            <Trophy size={17} /> Sport
          </button>
        </div>

        <label className="creator-field">
          <span>{kind === "goal" ? "Goal" : "Sport"}</span>
          <select value={focus} onChange={(event) => setFocus(event.target.value as TrackFocus)}>
            {focusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>

        <label className="creator-field">
          <span>Routine name</span>
          <input value={name} onChange={(event) => setName(event.target.value)} placeholder={`e.g. ${trackFocusLabel(focus)} base`} />
        </label>

        <div className="creator-row">
          <label className="creator-field">
            <span>Equipment</span>
            <select value={equipment} onChange={(event) => setEquipment(event.target.value as EquipmentPreference)}>
              <option value="any">All equipment</option>
              <option value="mixed">Mixed</option>
              <option value="bodyweight">Bodyweight only</option>
            </select>
          </label>
          <label className="creator-field">
            <span>Session</span>
            <select value={sessionMinutes} onChange={(event) => setSessionMinutes(Number(event.target.value))}>
              <option value={30}>30 minutes</option>
              <option value={45}>45 minutes</option>
              <option value={60}>60 minutes</option>
            </select>
          </label>
          <label className="creator-field">
            <span>Weekly</span>
            <select value={daysPerWeek} onChange={(event) => setDaysPerWeek(Number(event.target.value))}>
              {[1, 2, 3, 4, 5].map((days) => <option key={days} value={days}>{days} {days === 1 ? "day" : "days"}</option>)}
            </select>
          </label>
        </div>

        <button className="create-track-button" type="submit">
          <Dumbbell size={18} /> Create track & suggest routine
        </button>
      </form>
    </div>
  );
}
