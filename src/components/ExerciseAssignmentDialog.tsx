import { MapPin, Plus, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { exerciseDisplayName, WEEKDAYS } from "../lib/exercises";
import { tr } from "../lib/i18n";
import type { Exercise, LanguageCode, TrainingTrack, Weekday } from "../types";

interface ExerciseAssignmentDialogProps {
  language: LanguageCode;
  exercise: Exercise;
  tracks: TrainingTrack[];
  onClose: () => void;
  onAdd: (trackId: string, day: Weekday) => void;
  onRemove: (trackId: string, itemId: string) => void;
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

export function ExerciseAssignmentDialog({
  language,
  exercise,
  tracks,
  onClose,
  onAdd,
  onRemove,
}: ExerciseAssignmentDialogProps) {
  const [trackId, setTrackId] = useState(tracks[0]?.id ?? "");
  const selectedTrack = tracks.find((track) => track.id === trackId) ?? tracks[0];
  const routeDays = selectedTrack?.trainingDays?.length
    ? selectedTrack.trainingDays
    : WEEKDAYS.slice(0, Math.max(1, Math.min(7, selectedTrack?.daysPerWeek ?? 1)));
  const [day, setDay] = useState<Weekday>(routeDays[0] ?? "monday");
  const placements = useMemo(() => tracks.flatMap((track) => track.workout
    .filter((item) => item.exerciseId === exercise.id)
    .map((item) => ({
      track,
      itemId: item.id ?? item.exerciseId,
      day: item.day ?? track.trainingDays?.[0] ?? "monday" as Weekday,
    }))), [exercise.id, tracks]);

  useEffect(() => {
    if (!routeDays.includes(day)) setDay(routeDays[0] ?? "monday");
  }, [day, routeDays]);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  const displayName = exerciseDisplayName(exercise, language);
  const dayLabel = (value: Weekday) => tr(language, ...DAY_LABELS[value]);

  return (
    <div className="assignment-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="assignment-dialog"
        role="dialog"
        aria-modal="true"
        aria-label={`${tr(language, "Manage", "Gestionar")} ${displayName}`}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button className="close-button" type="button" onClick={onClose} aria-label={tr(language, "Close", "Cerrar")}>
          <X size={19} />
        </button>
        <p className="eyebrow">{tr(language, "Routine placement", "Ubicación en rutinas")}</p>
        <h2>{displayName}</h2>
        <p className="assignment-intro">
          {tr(
            language,
            "Choose exactly which route and day should receive this movement.",
            "Elegí exactamente en qué ruta y día querés agregar este movimiento.",
          )}
        </p>

        {placements.length > 0 && (
          <section className="assignment-existing">
            <h3>{tr(language, "Already included in", "Ya está incluido en")}</h3>
            {placements.map((placement) => (
              <div key={`${placement.track.id}-${placement.itemId}`}>
                <span><MapPin size={15} /><strong>{placement.track.name}</strong> · {dayLabel(placement.day)}</span>
                <button
                  type="button"
                  onClick={() => onRemove(placement.track.id, placement.itemId)}
                  aria-label={`${tr(language, "Remove from", "Quitar de")} ${placement.track.name}, ${dayLabel(placement.day)}`}
                >
                  <Trash2 size={15} /> {tr(language, "Remove", "Quitar")}
                </button>
              </div>
            ))}
          </section>
        )}

        {tracks.length ? (
          <section className="assignment-destination">
            <label>
              <span>{tr(language, "Training route", "Ruta de entrenamiento")}</span>
              <select value={selectedTrack?.id ?? ""} onChange={(event) => setTrackId(event.target.value)}>
                {tracks.map((track) => <option key={track.id} value={track.id}>{track.name}</option>)}
              </select>
            </label>
            <fieldset>
              <legend>{tr(language, "Training day", "Día de entrenamiento")}</legend>
              <div>
                {routeDays.map((routeDay) => (
                  <button
                    key={routeDay}
                    className={day === routeDay ? "is-active" : ""}
                    type="button"
                    aria-pressed={day === routeDay}
                    onClick={() => setDay(routeDay)}
                  >
                    {dayLabel(routeDay)}
                  </button>
                ))}
              </div>
            </fieldset>
            <button
              className="assignment-submit"
              type="button"
              onClick={() => selectedTrack && onAdd(selectedTrack.id, day)}
            >
              <Plus size={17} /> {tr(language, "Add to", "Agregar a")} {selectedTrack?.name}
            </button>
          </section>
        ) : (
          <p className="assignment-empty">
            {tr(language, "Create a training route first; then you can assign this movement to a day.", "Primero creá una ruta de entrenamiento; después podrás asignar este movimiento a un día.")}
          </p>
        )}
      </section>
    </div>
  );
}
