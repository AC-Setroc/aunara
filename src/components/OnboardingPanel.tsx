import { Activity, Dumbbell, HeartPulse, ShieldCheck } from "lucide-react";
import { type FormEvent, useMemo, useState } from "react";
import { tr } from "../lib/i18n";
import { stripSensitiveHealthData } from "../lib/privacy";
import { adultBirthDateBounds, calculateAgeFromBirthDate } from "../lib/wellness";
import { GENERAL_GOALS, SPORT_FOCUSES, type GeneralGoal, type EquipmentPreference, type HealthProfile, type LanguageCode, type SportFocus } from "../types";
import { trackFocusLabel } from "./TrainingTracks";
import { ReadinessAndLimitations } from "./ReadinessAndLimitations";

interface OnboardingPanelProps {
  language: LanguageCode;
  name: string;
  profile: HealthProfile;
  onComplete: (profile: HealthProfile) => void;
  healthDataConsent?: boolean;
  onRequestHealthConsent?: () => void;
}

function optionalNumber(value: string): number | null {
  if (!value.trim()) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

// Reading legacy intent never writes a migration or invents a general goal for a sport.
export function profileGoals(profile: HealthProfile): GeneralGoal[] {
  if (profile.goals) return profile.goals;
  return GENERAL_GOALS.includes(profile.primaryGoal as GeneralGoal) ? [profile.primaryGoal as GeneralGoal] : [];
}

export function profileSport(profile: HealthProfile): SportFocus | null {
  if (profile.sport !== undefined) return profile.sport;
  return SPORT_FOCUSES.includes(profile.primaryGoal as SportFocus) ? profile.primaryGoal as SportFocus : null;
}

export function validTrainingPreferences(profile: HealthProfile): boolean {
  const goals = profileGoals(profile);
  return goals.length >= 1 && goals.length <= 3 && new Set(goals).size === goals.length
    && goals.every((goal) => GENERAL_GOALS.includes(goal))
    && Number.isInteger(profile.trainingDaysPerWeek) && profile.trainingDaysPerWeek! >= 1 && profile.trainingDaysPerWeek! <= 7
    && Number.isFinite(profile.sessionMinutes) && profile.sessionMinutes! >= 15 && profile.sessionMinutes! <= 180;
}

export function GoalPreferences({ language, profile, onChange }: { language: LanguageCode; profile: HealthProfile; onChange: (profile: HealthProfile) => void }) {
  const goals = profileGoals(profile);
  return <>
    <fieldset className="goal-preferences">
      <legend>{tr(language, "Training goals (choose 1–3)", "Objetivos de entrenamiento (elegí 1–3)")}</legend>
      {GENERAL_GOALS.map((goal) => <label key={goal}>
        <input type="checkbox" checked={goals.includes(goal)} disabled={!goals.includes(goal) && goals.length >= 3} onChange={(event) => {
          const next = event.target.checked ? [...goals, goal] : goals.filter((value) => value !== goal);
          onChange({ ...profile, goals: next, primaryGoal: next[0] ?? profile.primaryGoal, sport: profileSport(profile) });
        }} />
        <span>{trackFocusLabel(goal, language)}</span>
      </label>)}
      {!goals.length && <small>{tr(language, "Choose a general goal before saving.", "Elegí un objetivo general antes de guardar.")}</small>}
    </fieldset>
    <label className="health-field"><span>{tr(language, "Are you training for a particular sport? (optional)", "¿Entrenás para un deporte en particular? (opcional)")}</span>
      <select value={profileSport(profile) ?? ""} onChange={(event) => onChange({ ...profile, sport: event.target.value ? event.target.value as SportFocus : null })}>
        <option value="">{tr(language, "None", "Ninguno")}</option>
        {SPORT_FOCUSES.map((sport) => <option key={sport} value={sport}>{trackFocusLabel(sport, language)}</option>)}
      </select>
    </label>
  </>;
}

export function OnboardingPanel({
  language,
  name,
  profile,
  onComplete,
  healthDataConsent = true,
  onRequestHealthConsent,
}: OnboardingPanelProps) {
  const [draft, setDraft] = useState<HealthProfile>({
    ...profile,
    goals: profile.goals,
    equipmentPreference: profile.equipmentPreference ?? "mixed",
    trainingDaysPerWeek: profile.trainingDaysPerWeek ?? 3,
    sessionMinutes: profile.sessionMinutes ?? 45,
    birthDate: profile.birthDate ?? "",
  });
  const calculatedAge = calculateAgeFromBirthDate(draft.birthDate ?? "");
  const birthDateBounds = adultBirthDateBounds();
  const basicReady = validTrainingPreferences(draft);
  const ready = basicReady && (!healthDataConsent || (
    calculatedAge !== null
    && calculatedAge >= 18
    && calculatedAge <= 100
    && draft.heightCm !== null
    && draft.currentWeightKg !== null
    && draft.readinessScreen?.confirmed === true
  ));
  const orientation = useMemo(() => {
    const experience = draft.experience === "beginner"
      ? tr(language, "a gradual start with technique-first sessions", "un inicio gradual, priorizando la técnica")
      : tr(language, "a progressive workload you can sustain", "una carga progresiva que podás sostener");
    const equipment = draft.equipmentPreference === "bodyweight"
      ? tr(language, "bodyweight movements", "movimientos con tu propio peso")
      : draft.equipmentPreference === "mixed"
        ? tr(language, "a mix of available equipment and bodyweight alternatives", "una mezcla de equipo disponible y alternativas de autocarga")
        : tr(language, "the equipment available to you", "el equipo que tengás disponible");
    return tr(
      language,
      `Your first route will favor ${experience}, using ${equipment}. We will use your check-ins to adjust effort—not to diagnose you.`,
      `Tu primera ruta favorecerá ${experience}, usando ${equipment}. Usaremos tus registros para ajustar el esfuerzo, no para diagnosticarte.`,
    );
  }, [draft.equipmentPreference, draft.experience, language]);

  function update<Key extends keyof HealthProfile>(key: Key, value: HealthProfile[Key]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function updateBirthDate(value: string) {
    setDraft((current) => ({
      ...current,
      birthDate: value,
      ageYears: calculateAgeFromBirthDate(value),
    }));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!ready) return;
    onComplete(healthDataConsent
      ? { ...draft, goals: profileGoals(draft), sport: profileSport(draft), onboardingCompleted: true, healthDataMode: "personalized" }
      : stripSensitiveHealthData({ ...draft, goals: profileGoals(draft), sport: profileSport(draft), onboardingCompleted: true }));
  }

  return (
    <div className="onboarding-backdrop">
      <section className="onboarding-panel" role="dialog" aria-modal="true" aria-label={tr(language, "Know your starting point", "Conocé tu punto de partida")}>
        <header>
          <div className="onboarding-mark"><HeartPulse size={26} /></div>
          <div>
            <p className="eyebrow">{tr(language, "Required setup / private", "Configuración obligatoria / privada")}</p>
            <h2>{tr(language, "Know your starting point", "Conocé tu punto de partida")}</h2>
            <p>{tr(language, `Hi ${name || "there"}. Tell us enough to shape a safer, more useful first route.`, `Hola${name ? `, ${name}` : ""}. Contanos lo necesario para armarte una primera ruta más útil y prudente.`)}</p>
          </div>
        </header>

        <form onSubmit={submit}>
          {!healthDataConsent && (
            <div className="basic-route-notice">
              <ShieldCheck size={21} />
              <div>
                <strong>{tr(language, "Basic route without sensitive health data", "Ruta básica sin datos sensibles de salud")}</strong>
                <p>{tr(
                  language,
                  "We will only use your goal, available equipment, experience and schedule. Body measurements, injuries, symptoms, allergies and wellbeing check-ins will remain empty.",
                  "Solo usaremos tu objetivo, equipo disponible, experiencia y horario. Las medidas corporales, lesiones, síntomas, alergias y registros de bienestar permanecerán vacíos.",
                )}</p>
                <button type="button" onClick={onRequestHealthConsent}>{tr(language, "Authorize health personalization", "Autorizar personalización de salud")}</button>
              </div>
            </div>
          )}
          <div className="onboarding-grid">
            {healthDataConsent && <label className="health-field">
              <span>{tr(language, "Date of birth", "Fecha de nacimiento")}</span>
              <input
                aria-label={tr(language, "Date of birth", "Fecha de nacimiento")}
                type="date"
                min={birthDateBounds.min}
                max={birthDateBounds.max}
                value={draft.birthDate ?? ""}
                onChange={(event) => updateBirthDate(event.target.value)}
                required
              />
              <small>{calculatedAge === null
                ? tr(language, "Used to calculate your age", "Se usa para calcular tu edad")
                : tr(language, `Calculated age: ${calculatedAge}`, `Edad calculada: ${calculatedAge}`)}</small>
            </label>}
            {healthDataConsent && <label className="health-field">
              <span>{tr(language, "Height", "Estatura")}</span>
              <input aria-label={tr(language, "Height in centimeters", "Estatura en centímetros")} type="number" min="100" max="250" value={draft.heightCm ?? ""} onChange={(event) => update("heightCm", optionalNumber(event.target.value))} required />
              <small>cm</small>
            </label>}
            {healthDataConsent && <label className="health-field">
              <span>{tr(language, "Current weight", "Peso actual")}</span>
              <input aria-label={tr(language, "Current weight in kilograms", "Peso actual en kilogramos")} type="number" min="30" max="350" step="0.1" value={draft.currentWeightKg ?? ""} onChange={(event) => update("currentWeightKg", optionalNumber(event.target.value))} required />
              <small>kg</small>
            </label>}
            {healthDataConsent && <label className="health-field">
              <span>{tr(language, "Goal weight (optional)", "Meta de peso (opcional)")}</span>
              <input type="number" min="30" max="350" step="0.1" value={draft.targetWeightKg ?? ""} onChange={(event) => update("targetWeightKg", optionalNumber(event.target.value))} />
              <small>kg</small>
            </label>}
            <GoalPreferences language={language} profile={draft} onChange={setDraft} />
            <label className="health-field">
              <span>{tr(language, "Available equipment", "Equipo disponible")}</span>
              <select value={draft.equipmentPreference} onChange={(event) => update("equipmentPreference", event.target.value as EquipmentPreference)}>
                <option value="mixed">{tr(language, "Mixed", "Mixto")}</option>
                <option value="bodyweight">{tr(language, "Bodyweight only", "Solo autocarga")}</option>
                <option value="any">{tr(language, "All equipment", "Todo el equipo")}</option>
              </select>
            </label>
            {healthDataConsent && <label className="health-field">
              <span>{tr(language, "Daily activity", "Actividad diaria")}</span>
              <select value={draft.activityLevel} onChange={(event) => update("activityLevel", event.target.value as HealthProfile["activityLevel"])}>
                <option value="sedentary">{tr(language, "Mostly seated · little purposeful activity", "Mayormente sentado/a · poca actividad intencional")}</option>
                <option value="light">{tr(language, "Lightly active · 1–2 active days/week", "Actividad ligera · 1–2 días activos/semana")}</option>
                <option value="moderate">{tr(language, "Moderately active · 3–5 active days/week", "Actividad moderada · 3–5 días activos/semana")}</option>
                <option value="very-active">{tr(language, "Very active · 6–7 active days or physical work", "Muy activo/a · 6–7 días activos o trabajo físico")}</option>
              </select>
              <small>{tr(language, "Count work, walking, sport and training—not only gym sessions.", "Contá trabajo, caminatas, deporte y entrenamientos; no solo el gimnasio.")}</small>
            </label>}
            <label className="health-field">
              <span>{tr(language, "Training experience", "Experiencia entrenando")}</span>
              <select value={draft.experience} onChange={(event) => update("experience", event.target.value as HealthProfile["experience"])}>
                <option value="beginner">{tr(language, "Beginner", "Principiante")}</option>
                <option value="intermediate">{tr(language, "Intermediate", "Intermedio")}</option>
                <option value="advanced">{tr(language, "Advanced", "Avanzado")}</option>
              </select>
            </label>
            <label className="health-field">
              <span>{tr(language, "Training days per week", "Días de entrenamiento por semana")}</span>
              <input aria-label={tr(language, "Training days per week", "Días de entrenamiento por semana")} type="number" min="1" max="7" value={draft.trainingDaysPerWeek ?? ""} onChange={(event) => update("trainingDaysPerWeek", optionalNumber(event.target.value) ?? undefined)} required />
            </label>
            <label className="health-field">
              <span>{tr(language, "Minutes per session", "Minutos por sesión")}</span>
              <input aria-label={tr(language, "Minutes per session", "Minutos por sesión")} type="number" min="15" max="180" step="5" value={draft.sessionMinutes ?? ""} onChange={(event) => update("sessionMinutes", optionalNumber(event.target.value) ?? undefined)} required />
            </label>
          </div>

          {healthDataConsent && <ReadinessAndLimitations
            language={language}
            profile={draft}
            onChange={setDraft}
            required
          />}

          {healthDataConsent && <label className="health-field health-notes">
            <span>{tr(language, "Other health context (optional)", "Otro contexto de salud (opcional)")}</span>
            <textarea value={draft.healthNotes} onChange={(event) => update("healthNotes", event.target.value)} placeholder={tr(language, "Example: a professional asked me to monitor a specific symptom.", "Ejemplo: un profesional me pidió vigilar un síntoma específico.")} />
          </label>}

          <div className="onboarding-orientation">
            <Activity size={20} />
            <div><strong>{tr(language, "Your starting orientation", "Tu orientación inicial")}</strong><p>{orientation}</p></div>
          </div>
          <div className="onboarding-disclaimer"><ShieldCheck size={17} /> {tr(language, "Aunara provides training guidance, not a medical, nutritional, or physiotherapy diagnosis.", "Aunara te orienta para entrenar; no reemplaza un diagnóstico médico, nutricional ni fisioterapéutico.")}</div>
          <button className="onboarding-submit" type="submit" disabled={!ready}><Dumbbell size={17} /> {healthDataConsent
            ? tr(language, "Save and continue", "Guardar y continuar")
            : tr(language, "Continue with a basic route", "Continuar con una ruta básica")}</button>
        </form>
      </section>
    </div>
  );
}
