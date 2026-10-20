import { CalendarDays } from "lucide-react";
import { type FormEvent, useState } from "react";
import { DecimalInput } from "./DecimalInput";
import { tr } from "../lib/i18n";
import type { HealthProfile, LanguageCode, WeeklyCheckIn } from "../types";

interface WeeklyCheckInSectionProps {
  language: LanguageCode;
  healthProfile?: HealthProfile;
  checkIns?: WeeklyCheckIn[];
  onAddCheckIn?: (checkIn: WeeklyCheckIn) => void;
  healthDataConsent?: boolean;
  onRequestHealthConsent?: () => void;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function optionalNumber(value: string): number | null {
  const clean = value.replace(",", ".").replace(/^0+(?=\d)/, "").trim();
  if (!clean || clean === ".") return null;
  const parsed = Number(clean);
  return Number.isFinite(parsed) ? parsed : null;
}

export function WeeklyCheckInSection({
  language,
  healthProfile,
  checkIns = [],
  onAddCheckIn,
  healthDataConsent = false,
  onRequestHealthConsent,
}: WeeklyCheckInSectionProps) {
  const [open, setOpen] = useState(false);
  const [checkInSaved, setCheckInSaved] = useState(false);
  const [checkIn, setCheckIn] = useState<WeeklyCheckIn>(() => ({
    id: today(),
    date: today(),
    weightKg: healthProfile?.currentWeightKg ?? null,
    sleepHours: null,
    energy: 3,
    stress: 3,
    notes: "",
  }));

  function saveCheckIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!onAddCheckIn) return;
    const saved = { ...checkIn, id: checkIn.date };
    onAddCheckIn(saved);
    setCheckInSaved(true);
  }

  return (
    <section className="weekly-checkin-section" aria-labelledby="weekly-checkin-heading">
      <div className="weekly-checkin-header">
        <div>
          <p className="eyebrow">{tr(language, "Weekly recovery / field note", "Recuperación semanal / nota de campo")}</p>
          <h3 id="weekly-checkin-heading">{tr(language, "Weekly check-in", "Registro semanal")}</h3>
        </div>
        <button
          type="button"
          className="weekly-checkin-toggle"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
        >
          <CalendarDays size={18} />
          {open ? tr(language, "Hide check-in", "Ocultar registro") : tr(language, "Log your week", "Registrar semana")}
        </button>
      </div>

      {open && (
        <div className="weekly-checkin-content">
          {!healthDataConsent ? (
            <div className="profile-consent-required">
              <h3>{tr(language, "Health authorization is optional", "La autorización de salud es opcional")}</h3>
              <p>{tr(
                language,
                "Weekly wellbeing check-ins remain unavailable in basic mode.",
                "Los registros semanales de bienestar permanecen desactivados en el modo básico.",
              )}</p>
              {onRequestHealthConsent && (
                <button type="button" onClick={onRequestHealthConsent}>
                  {tr(language, "Authorize health personalization", "Autorizar personalización de salud")}
                </button>
              )}
            </div>
          ) : (
            <>
              <p className="checkin-intro">
                {tr(
                  language,
                  "One calm check-in per week is more useful than reacting to daily fluctuations.",
                  "Un registro tranquilo por semana aporta más que reaccionar a variaciones diarias.",
                )}
              </p>

              <form className="checkin-form" onSubmit={saveCheckIn}>
                <label className="health-field">
                  <span>{tr(language, "Date", "Fecha")}</span>
                  <input
                    type="date"
                    value={checkIn.date}
                    onChange={(event) => {
                      setCheckInSaved(false);
                      setCheckIn((current) => ({ ...current, date: event.target.value }));
                    }}
                  />
                </label>

                <label className="health-field numeric-field">
                  <span>{tr(language, "Weight", "Peso")}</span>
                  <span className="numeric-input">
                    <DecimalInput
                      ariaLabel={tr(language, "Check-in weight in kilograms", "Peso del registro en kilogramos")}
                      value={checkIn.weightKg}
                      min={30}
                      max={350}
                      onChange={(val) => {
                        setCheckInSaved(false);
                        setCheckIn((current) => ({ ...current, weightKg: val }));
                      }}
                    />
                    <small>kg</small>
                  </span>
                </label>

                <label className="health-field numeric-field">
                  <span>{tr(language, "Average sleep", "Sueño promedio")}</span>
                  <span className="numeric-input">
                    <DecimalInput
                      ariaLabel={tr(language, "Average sleep hours", "Horas promedio de sueño")}
                      value={checkIn.sleepHours}
                      min={0}
                      max={14}
                      onChange={(val) => {
                        setCheckInSaved(false);
                        setCheckIn((current) => ({ ...current, sleepHours: val }));
                      }}
                    />
                    <small>{tr(language, "hours", "horas")}</small>
                  </span>
                </label>

                <label className="health-field range-field">
                  <span>{tr(language, "Energy", "Energía")}</span>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    value={checkIn.energy}
                    onChange={(event) => {
                      setCheckInSaved(false);
                      setCheckIn((current) => ({ ...current, energy: Number(event.target.value) }));
                    }}
                  />
                  <div className="range-labels">
                    <span>{tr(language, "Drained", "Agotado/a")}</span>
                    <strong>{checkIn.energy}/5</strong>
                    <span>{tr(language, "Excellent", "Excelente")}</span>
                  </div>
                </label>

                <label className="health-field range-field">
                  <span>{tr(language, "Stress", "Estrés")}</span>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    value={checkIn.stress}
                    onChange={(event) => {
                      setCheckInSaved(false);
                      setCheckIn((current) => ({ ...current, stress: Number(event.target.value) }));
                    }}
                  />
                  <div className="range-labels">
                    <span>{tr(language, "Low", "Bajo")}</span>
                    <strong>{checkIn.stress}/5</strong>
                    <span>{tr(language, "High", "Alto")}</span>
                  </div>
                </label>

                <label className="health-field checkin-notes">
                  <span>{tr(language, "Notes", "Notas")}</span>
                  <textarea
                    value={checkIn.notes}
                    onChange={(event) => {
                      setCheckInSaved(false);
                      setCheckIn((current) => ({ ...current, notes: event.target.value }));
                    }}
                    placeholder={tr(
                      language,
                      "Soreness, match load, travel, pain, or anything that changed the week.",
                      "Molestias, partidos, viajes, dolor o cualquier cosa que haya cambiado tu semana.",
                    )}
                  />
                </label>

                <button className="save-checkin" type="submit">
                  {checkInSaved
                    ? tr(language, "Check-in saved", "Registro guardado")
                    : tr(language, "Save weekly check-in", "Guardar registro semanal")}
                </button>
              </form>

              {checkIns.length > 0 && (
                <div className="checkin-history">
                  <p className="section-kicker">{tr(language, "Recent notes", "Registros recientes")}</p>
                  {checkIns.slice(0, 4).map((item) => (
                    <div key={item.id}>
                      <strong>{item.date}</strong>
                      <span>
                        {item.weightKg ? `${item.weightKg} kg` : tr(language, "No weight", "Sin peso")} ·{" "}
                        {item.sleepHours ? `${item.sleepHours} h ${tr(language, "sleep", "de sueño")}` : tr(language, "No sleep", "Sin sueño")} ·{" "}
                        {tr(language, "Energy", "Energía")} {item.energy}/5
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </section>
  );
}
