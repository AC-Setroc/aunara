import {
  Activity,
  CalendarDays,
  Droplets,
  Dumbbell,
  Heart,
  Ruler,
  Search,
  ShieldCheck,
  Sparkles,
  Trophy,
  UserRound,
  Utensils,
  X,
} from "lucide-react";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import { searchFoodData, type FoodSearchResult } from "../lib/foodData";
import { tr } from "../lib/i18n";
import {
  createDailyFoodOptions,
  createMacroPlan,
  createRecipeIdeas,
  FOOD_GROUPS,
  FOOD_ITEMS,
  foodName,
  formatFoodServing,
  normalizePreferredIngredients,
} from "../lib/nutritionPlanning";
import { adultBirthDateBounds, calculateAgeFromBirthDate, createWellnessSummary } from "../lib/wellness";
import type { HealthProfile, LanguageCode, TrainingTrack, WeeklyCheckIn } from "../types";
import { ReadinessAndLimitations } from "./ReadinessAndLimitations";
import { trackFocusLabel } from "./TrainingTracks";

interface ProfilePanelProps {
  language?: LanguageCode;
  name: string;
  tracks: TrainingTrack[];
  activeTrackId: string;
  favoriteCount: number;
  healthProfile: HealthProfile;
  checkIns: WeeklyCheckIn[];
  onNameChange: (name: string) => void;
  onHealthProfileChange: (profile: HealthProfile) => void;
  onAddCheckIn: (checkIn: WeeklyCheckIn) => void;
  onOpenTrack: (trackId: string) => void;
  onClose: () => void;
  healthDataConsent?: boolean;
  onRequestHealthConsent?: () => void;
}

type ProfileTab = "overview" | "body" | "checkin";

function optionalNumber(value: string): number | null {
  if (!value.trim()) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function ProfilePanel({
  language = "en",
  name,
  tracks,
  activeTrackId,
  favoriteCount,
  healthProfile,
  checkIns,
  onNameChange,
  onHealthProfileChange,
  onAddCheckIn,
  onOpenTrack,
  onClose,
  healthDataConsent = true,
  onRequestHealthConsent,
}: ProfilePanelProps) {
  const [tab, setTab] = useState<ProfileTab>("overview");
  const [foodQuery, setFoodQuery] = useState("");
  const [foodResults, setFoodResults] = useState<FoodSearchResult[]>([]);
  const [foodLoading, setFoodLoading] = useState(false);
  const [foodError, setFoodError] = useState("");
  const [showMealOptions, setShowMealOptions] = useState(false);
  const [showRecipeIdeas, setShowRecipeIdeas] = useState(false);
  const [checkInSaved, setCheckInSaved] = useState(false);
  const [checkIn, setCheckIn] = useState<WeeklyCheckIn>(() => ({
    id: today(),
    date: today(),
    weightKg: healthProfile.currentWeightKg,
    sleepHours: null,
    energy: 3,
    stress: 3,
    notes: "",
  }));
  const plannedSessions = tracks.reduce((sum, track) => sum + track.daysPerWeek, 0);
  const wellness = useMemo(() => createWellnessSummary(healthProfile, language), [healthProfile, language]);
  const macroPlan = useMemo(() => createMacroPlan(healthProfile), [healthProfile]);
  const nutritionMode = healthProfile.nutritionPlanMode ?? "simple";
  const numberLocale = language === "es" ? "es-CO" : "en-US";
  const calculatedAge = calculateAgeFromBirthDate(healthProfile.birthDate ?? "");
  const birthDateBounds = adultBirthDateBounds();
  const selectedIngredients = normalizePreferredIngredients(healthProfile.preferredIngredients ?? []);
  const recipeIdeas = createRecipeIdeas(selectedIngredients, language);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.body.classList.add("modal-open");
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.classList.remove("modal-open");
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [onClose]);

  function updateHealth<Key extends keyof HealthProfile>(key: Key, value: HealthProfile[Key]) {
    onHealthProfileChange({ ...healthProfile, [key]: value });
  }

  function togglePreferredIngredient(ingredientId: string, checked: boolean) {
    updateHealth(
      "preferredIngredients",
      checked
        ? [...new Set([...selectedIngredients, ingredientId])]
        : selectedIngredients.filter((item) => item !== ingredientId),
    );
  }

  function updateBirthDate(value: string) {
    onHealthProfileChange({
      ...healthProfile,
      birthDate: value,
      ageYears: calculateAgeFromBirthDate(value),
    });
  }

  function saveCheckIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const saved = { ...checkIn, id: checkIn.date };
    onAddCheckIn(saved);
    setCheckInSaved(true);
  }

  async function searchFoods(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFoodError("");
    setFoodLoading(true);
    try {
      setFoodResults(await searchFoodData(foodQuery));
    } catch (error) {
      setFoodResults([]);
      setFoodError(error instanceof Error ? error.message : "Food search is unavailable.");
    } finally {
      setFoodLoading(false);
    }
  }

  return (
    <div className="profile-backdrop" role="presentation" onMouseDown={onClose}>
      <aside
        className="profile-panel"
        role="dialog"
        aria-modal="true"
        aria-label={tr(language, "My profile", "Mi perfil")}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="profile-heading">
          <div className="profile-avatar"><UserRound size={28} /></div>
          <div>
            <p className="eyebrow">{tr(language, "Private field file / 01", "Ficha privada / 01")}</p>
            <h2>{tr(language, "My profile", "Mi perfil")}</h2>
          </div>
          <button className="close-button inline" type="button" onClick={onClose} aria-label={tr(language, "Close profile", "Cerrar perfil")}><X size={20} /></button>
        </div>

        <nav className="profile-tabs" aria-label={tr(language, "Profile sections", "Secciones del perfil")}>
          <button type="button" className={tab === "overview" ? "is-active" : ""} onClick={() => setTab("overview")}>{tr(language, "Overview", "Resumen")}</button>
          <button type="button" className={tab === "body" ? "is-active" : ""} onClick={() => setTab("body")}>{tr(language, "Body and health", "Cuerpo y salud")}</button>
          <button type="button" className={tab === "checkin" ? "is-active" : ""} onClick={() => setTab("checkin")}>{tr(language, "Weekly check-in", "Registro semanal")}</button>
        </nav>

        {tab !== "overview" && !healthDataConsent && (
          <div className="profile-consent-required">
            <ShieldCheck size={24} />
            <h3>{tr(language, "Health authorization is optional", "La autorización de salud es opcional")}</h3>
            <p>{tr(
              language,
              "Body measurements, symptoms, limitations, nutrition preferences and weekly wellbeing check-ins remain unavailable in basic mode.",
              "Las medidas corporales, síntomas, limitaciones, preferencias nutricionales y registros semanales de bienestar permanecen desactivados en el modo básico.",
            )}</p>
            <button type="button" onClick={onRequestHealthConsent}>{tr(language, "Authorize health personalization", "Autorizar personalización de salud")}</button>
          </div>
        )}

        {tab === "overview" && (
          <div className="profile-tab-panel">
            <label className="profile-name-field">
              <span>{tr(language, "Profile name", "Nombre del perfil")}</span>
              <input value={name} onChange={(event) => onNameChange(event.target.value)} placeholder={tr(language, "My profile", "Mi perfil")} />
            </label>

            <div className="profile-stats">
              <div><Dumbbell size={18} /><strong>{tracks.length}</strong><span>{tr(language, "training tracks", "rutas de entrenamiento")}</span></div>
              <div><CalendarDays size={18} /><strong>{plannedSessions}</strong><span>{tr(language, "weekly sessions", "sesiones semanales")}</span></div>
              <div><Heart size={18} /><strong>{favoriteCount}</strong><span>{tr(language, "saved exercises", "ejercicios guardados")}</span></div>
            </div>

            <div className="health-snapshot">
              <div>
                <p className="section-kicker">{tr(language, "Body context", "Contexto corporal")}</p>
                <strong>{healthProfile.currentWeightKg ? `${healthProfile.currentWeightKg} kg` : tr(language, "Not set", "Sin registrar")}</strong>
                <span>{wellness.bmi ? `${tr(language, "BMI", "IMC")} ${wellness.bmi.value} kg/m²` : tr(language, "Add height and weight", "Agregá estatura y peso")}</span>
              </div>
              <div>
                <p className="section-kicker">{tr(language, "Latest recovery", "Recuperación reciente")}</p>
                <strong>{checkIns[0]?.sleepHours ? `${checkIns[0].sleepHours} h ${tr(language, "sleep", "de sueño")}` : tr(language, "No check-in", "Sin registro")}</strong>
                <span>{checkIns[0] ? `${tr(language, "Energy", "Energía")} ${checkIns[0].energy}/5 · ${tr(language, "Stress", "Estrés")} ${checkIns[0].stress}/5` : tr(language, "Log your week", "Registrá tu semana")}</span>
              </div>
              <button type="button" onClick={() => setTab("body")}>{tr(language, "Complete health context", "Completar contexto de salud")} <Ruler size={15} /></button>
            </div>

            <div className="profile-priorities">
              <p className="section-kicker">{tr(language, "Training priorities", "Prioridades de entrenamiento")}</p>
              {tracks.length ? tracks.map((track) => (
                <button key={track.id} type="button" onClick={() => onOpenTrack(track.id)}>
                  <span>{track.kind === "sport" ? <Trophy size={16} /> : <Activity size={16} />}</span>
                  <span><strong>{track.name}</strong><small>{trackFocusLabel(track.focus, language)} · {track.daysPerWeek}× {tr(language, "weekly", "por semana")}</small></span>
                  <em>{track.id === activeTrackId ? tr(language, "Active", "Activa") : tr(language, "Open", "Abrir")}</em>
                </button>
              )) : <p className="profile-empty">{tr(language, "No training tracks yet. Add one from the Training Tracks section.", "Todavía no tenés rutas. Agregá una desde la sección Rutas de entrenamiento.")}</p>}
            </div>
          </div>
        )}

        {healthDataConsent && tab === "body" && (
          <div className="profile-tab-panel">
            <div className="profile-section-intro">
              <p className="section-kicker">{tr(language, "Body & health context", "Contexto de cuerpo y salud")}</p>
              <h3>{tr(language, "Better inputs. Better explanations.", "Mejores datos. Mejores explicaciones.")}</h3>
              <p>{tr(language, "These details add context to routine and nutrition guidance. They do not create a diagnosis or a single “ideal” weight.", "Estos datos dan contexto a la rutina y la orientación nutricional. No generan un diagnóstico ni un único peso “ideal”.")}</p>
            </div>

            <div className="health-form-grid">
              <label className="health-field">
                <span>{tr(language, "Date of birth", "Fecha de nacimiento")}</span>
                <input
                  aria-label={tr(language, "Date of birth", "Fecha de nacimiento")}
                  type="date"
                  min={birthDateBounds.min}
                  max={birthDateBounds.max}
                  value={healthProfile.birthDate ?? ""}
                  onChange={(event) => updateBirthDate(event.target.value)}
                />
                <small>{calculatedAge === null
                  ? tr(language, "Add it to calculate your age", "Agregala para calcular tu edad")
                  : tr(language, `Calculated age: ${calculatedAge}`, `Edad calculada: ${calculatedAge}`)}</small>
              </label>
              <label className="health-field">
                <span>{tr(language, "Metabolic reference", "Referencia metabólica")}</span>
                <select value={healthProfile.metabolicSex} onChange={(event) => updateHealth("metabolicSex", event.target.value as HealthProfile["metabolicSex"])}>
                  <option value="unspecified">{tr(language, "Prefer not to use", "Prefiero no usarla")}</option>
                  <option value="female">{tr(language, "Female equation", "Ecuación femenina")}</option>
                  <option value="male">{tr(language, "Male equation", "Ecuación masculina")}</option>
                </select>
                <small>{tr(language, "Only used for energy estimates.", "Solo se usa para estimaciones de energía.")}</small>
              </label>
              <NumericField label={tr(language, "Height", "Estatura")} accessibleLabel={tr(language, "Height in centimeters", "Estatura en centímetros")} value={healthProfile.heightCm} unit="cm" min={100} max={250} onChange={(value) => updateHealth("heightCm", value)} />
              <NumericField label={tr(language, "Current weight", "Peso actual")} accessibleLabel={tr(language, "Current weight in kilograms", "Peso actual en kilogramos")} value={healthProfile.currentWeightKg} unit="kg" min={30} max={350} step="0.1" onChange={(value) => updateHealth("currentWeightKg", value)} />
              <NumericField label={tr(language, "Goal weight", "Meta de peso")} accessibleLabel={tr(language, "Goal weight in kilograms", "Meta de peso en kilogramos")} value={healthProfile.targetWeightKg} unit="kg" min={30} max={350} step="0.1" onChange={(value) => updateHealth("targetWeightKg", value)} />
              <NumericField label={tr(language, "Waist", "Cintura")} accessibleLabel={tr(language, "Waist circumference in centimeters", "Circunferencia de cintura en centímetros")} value={healthProfile.waistCm} unit="cm" min={40} max={220} step="0.1" onChange={(value) => updateHealth("waistCm", value)} />
              <NumericField label={tr(language, "Body fat (optional)", "Grasa corporal (opcional)")} accessibleLabel={tr(language, "Body fat percentage", "Porcentaje de grasa corporal")} value={healthProfile.bodyFatPercent ?? null} unit="%" min={1} max={70} step="0.1" onChange={(value) => updateHealth("bodyFatPercent", value)} />
              <NumericField label={tr(language, "Muscle (optional)", "Músculo (opcional)")} accessibleLabel={tr(language, "Muscle percentage", "Porcentaje de músculo")} value={healthProfile.musclePercent ?? null} unit="%" min={1} max={80} step="0.1" onChange={(value) => updateHealth("musclePercent", value)} />
              <NumericField label={tr(language, "Visceral fat (optional)", "Grasa visceral (opcional)")} accessibleLabel={tr(language, "Visceral fat level", "Nivel de grasa visceral")} value={healthProfile.visceralFatLevel ?? null} unit={tr(language, "level", "nivel")} min={1} max={60} step="0.1" onChange={(value) => updateHealth("visceralFatLevel", value)} />
              <label className="health-field">
                <span>{tr(language, "Daily activity", "Actividad diaria")}</span>
                <select value={healthProfile.activityLevel} onChange={(event) => updateHealth("activityLevel", event.target.value as HealthProfile["activityLevel"])}>
                  <option value="sedentary">{tr(language, "Mostly seated · little purposeful activity", "Mayormente sentado/a · poca actividad intencional")}</option>
                  <option value="light">{tr(language, "Lightly active · 1–2 active days/week", "Actividad ligera · 1–2 días activos/semana")}</option>
                  <option value="moderate">{tr(language, "Moderately active · 3–5 active days/week", "Actividad moderada · 3–5 días activos/semana")}</option>
                  <option value="very-active">{tr(language, "Very active · 6–7 active days or physical work", "Muy activo/a · 6–7 días activos o trabajo físico")}</option>
                </select>
                <small>{tr(language, "Include work, walking, sport and training.", "Incluí trabajo, caminatas, deporte y entrenamiento.")}</small>
              </label>
              <label className="health-field">
                <span>{tr(language, "Training experience", "Experiencia entrenando")}</span>
                <select value={healthProfile.experience} onChange={(event) => updateHealth("experience", event.target.value as HealthProfile["experience"])}>
                  <option value="beginner">{tr(language, "Beginner", "Principiante")}</option>
                  <option value="intermediate">{tr(language, "Intermediate", "Intermedio")}</option>
                  <option value="advanced">{tr(language, "Advanced", "Avanzado")}</option>
                </select>
              </label>
            </div>

            <ReadinessAndLimitations
              language={language}
              profile={healthProfile}
              onChange={onHealthProfileChange}
            />

            <label className="health-field health-notes">
              <span>{tr(language, "Other health context", "Otro contexto de salud")}</span>
              <textarea
                value={healthProfile.healthNotes}
                onChange={(event) => updateHealth("healthNotes", event.target.value)}
                placeholder={tr(language, "Example: a professional asked me to monitor a specific symptom.", "Ejemplo: un profesional me pidió vigilar un síntoma específico.")}
              />
              <small>{tr(language, "Aunara stores this note but does not medically interpret free text.", "Aunara guarda esta nota, pero no interpreta médicamente el texto libre.")}</small>
            </label>

            <div className="reference-card">
              <div>
                <strong>{wellness.bmi ? `${tr(language, "BMI", "IMC")} ${wellness.bmi.value} kg/m² · ${wellness.bmi.label}` : tr(language, "Reference appears when height and weight are complete", "La referencia aparece al completar estatura y peso")}</strong>
                <p>{tr(language, "BMI means Body Mass Index: weight in kilograms divided by height in metres squared (kg/m²). It describes a weight-to-height ratio; it does not measure body fat or health.", "IMC significa Índice de Masa Corporal: peso en kilogramos dividido por la estatura en metros al cuadrado (kg/m²). Describe una relación entre peso y estatura; no mide la grasa corporal ni la salud.")}</p>
                <p>{tr(language, "BMI does not distinguish bone, muscle, fat distribution, body frame, or training history. It is only a rough numerical ratio—not a diagnosis. Interpret it with body composition, waist trend, performance, recovery, how you feel, and professional assessment when needed.", "El IMC no distingue masa ósea, músculo, distribución de grasa, contextura ni historial de entrenamiento. Es solo una relación numérica aproximada, no un diagnóstico. Interpretalo junto con composición corporal, tendencia de cintura, rendimiento, recuperación, cómo te sentís y valoración profesional cuando sea necesario.")}</p>
              </div>
            </div>
          </div>
        )}

        {healthDataConsent && tab === "checkin" && (
          <div className="profile-tab-panel">
            <div className="profile-section-intro">
              <p className="section-kicker">{tr(language, "Weekly field note", "Nota semanal")}</p>
              <h3>{tr(language, "Recovery changes the plan.", "La recuperación cambia el plan.")}</h3>
              <p>{tr(language, "One calm check-in per week is more useful than reacting to daily fluctuations.", "Un registro tranquilo por semana aporta más que reaccionar a variaciones diarias.")}</p>
            </div>

            <form className="checkin-form" onSubmit={saveCheckIn}>
              <label className="health-field">
                <span>{tr(language, "Date", "Fecha")}</span>
                <input type="date" value={checkIn.date} onChange={(event) => {
                  setCheckInSaved(false);
                  setCheckIn((current) => ({ ...current, date: event.target.value }));
                }} />
              </label>
              <NumericField label={tr(language, "Weight", "Peso")} accessibleLabel={tr(language, "Check-in weight in kilograms", "Peso del registro en kilogramos")} value={checkIn.weightKg} unit="kg" min={30} max={350} step="0.1" onChange={(value) => {
                setCheckInSaved(false);
                setCheckIn((current) => ({ ...current, weightKg: value }));
              }} />
              <NumericField label={tr(language, "Average sleep", "Sueño promedio")} accessibleLabel={tr(language, "Average sleep hours", "Horas promedio de sueño")} value={checkIn.sleepHours} unit={tr(language, "hours", "horas")} min={0} max={14} step="0.1" onChange={(value) => {
                setCheckInSaved(false);
                setCheckIn((current) => ({ ...current, sleepHours: value }));
              }} />
              <RangeField label={tr(language, "Energy", "Energía")} value={checkIn.energy} low={tr(language, "Drained", "Agotado/a")} high={tr(language, "Excellent", "Excelente")} onChange={(value) => {
                setCheckInSaved(false);
                setCheckIn((current) => ({ ...current, energy: value }));
              }} />
              <RangeField label={tr(language, "Stress", "Estrés")} value={checkIn.stress} low={tr(language, "Low", "Bajo")} high={tr(language, "High", "Alto")} onChange={(value) => {
                setCheckInSaved(false);
                setCheckIn((current) => ({ ...current, stress: value }));
              }} />
              <label className="health-field checkin-notes">
                <span>{tr(language, "Notes", "Notas")}</span>
                <textarea value={checkIn.notes} onChange={(event) => {
                  setCheckInSaved(false);
                  setCheckIn((current) => ({ ...current, notes: event.target.value }));
                }} placeholder={tr(language, "Soreness, match load, travel, pain, or anything that changed the week.", "Molestias, partidos, viajes, dolor o cualquier cosa que haya cambiado tu semana.")} />
              </label>
              <button className="save-checkin" type="submit">{checkInSaved ? tr(language, "Check-in saved", "Registro guardado") : tr(language, "Save weekly check-in", "Guardar registro semanal")}</button>
            </form>

            {checkIns.length > 0 && (
              <div className="checkin-history">
                <p className="section-kicker">{tr(language, "Recent notes", "Registros recientes")}</p>
                {checkIns.slice(0, 4).map((item) => (
                  <div key={item.id}>
                    <strong>{item.date}</strong>
                    <span>{item.weightKg ? `${item.weightKg} kg` : tr(language, "No weight", "Sin peso")} · {item.sleepHours ? `${item.sleepHours} h ${tr(language, "sleep", "de sueño")}` : tr(language, "No sleep", "Sin sueño")} · {tr(language, "Energy", "Energía")} {item.energy}/5</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {healthDataConsent && tab === "body" && (
          <div className="profile-tab-panel">
            <div className="profile-section-intro">
              <p className="section-kicker">{tr(language, "Nutrition companion", "Acompañamiento nutricional")}</p>
              <h3>{tr(language, "Ranges, not rigid prescriptions.", "Rangos, no prescripciones rígidas.")}</h3>
              <p>{tr(language, "These are planning estimates for an adult. Medical conditions, pregnancy, eating disorders, or prescribed diets require professional guidance.", "Son estimaciones de planificación para adultos. Condiciones médicas, embarazo, trastornos alimentarios o dietas prescritas requieren acompañamiento profesional.")}</p>
            </div>

            <div className="nutrition-ranges" aria-label={tr(language, "Nutrition planning ranges", "Rangos de planificación nutricional")}>
              <div><Sparkles size={18} /><span>{tr(language, "Protein", "Proteína")}</span><strong>{wellness.proteinGrams ? `${wellness.proteinGrams.min}–${wellness.proteinGrams.max} g` : tr(language, "Add weight", "Agregá tu peso")}</strong><small>{tr(language, "daily planning range", "rango diario de planificación")}</small></div>
              <div><Droplets size={18} /><span>{tr(language, "Fluids", "Líquidos")}</span><strong>{wellness.hydrationLiters ? `${wellness.hydrationLiters.min}–${wellness.hydrationLiters.max} L` : tr(language, "Add weight", "Agregá tu peso")}</strong><small>{tr(language, "starting range; heat and sport add needs", "rango inicial; calor y deporte aumentan las necesidades")}</small></div>
              <div><Utensils size={18} /><span>{tr(language, "Maintenance", "Mantenimiento")}</span><strong>{wellness.maintenanceCalories ? `${wellness.maintenanceCalories.min.toLocaleString()}–${wellness.maintenanceCalories.max.toLocaleString()}` : tr(language, "Add complete body data", "Completá tus datos corporales")}</strong><small>{tr(language, "estimated kcal/day, not a prescription", "kcal/día estimadas, no una prescripción")}</small></div>
            </div>
            <p className="nutrition-method-note">
              {tr(
                language,
                "For physically active adults, the protein range uses 1.4–2.0 g/kg/day. These are grams of the protein nutrient—not grams of food. Needs can differ with clinical context, energy intake and professional guidance.",
                "Para adultos físicamente activos, el rango de proteína usa 1,4–2,0 g/kg/día. Son gramos del nutriente proteína, no gramos de alimento. Las necesidades pueden cambiar según el contexto clínico, la energía consumida y la orientación profesional.",
              )}{" "}
              <a href="https://jissn.biomedcentral.com/articles/10.1186/s12970-017-0177-8" target="_blank" rel="noreferrer">ISSN</a>
              {" · "}
              <a href="https://www.acsm.org/docs/default-source/files-for-resource-library/protein-intake-for-optimal-muscle-maintenance.pdf" target="_blank" rel="noreferrer">ACSM</a>
            </p>

            <section className="nutrition-mode-section" aria-labelledby="nutrition-mode-title">
              <div className="nutrition-mode-heading">
                <p className="section-kicker">{tr(language, "Choose your level of detail", "Elegí cuánto detalle querés")}</p>
                <h4 id="nutrition-mode-title">{tr(language, "Two ways to plan. The same food-first approach.", "Dos formas de planear. El mismo enfoque basado en alimentos.")}</h4>
              </div>
              <div className="nutrition-mode-switch">
                <button
                  type="button"
                  className={nutritionMode === "simple" ? "is-active" : ""}
                  aria-pressed={nutritionMode === "simple"}
                  onClick={() => updateHealth("nutritionPlanMode", "simple")}
                >
                  <strong>{tr(language, "Simple nutrition plan", "Plan nutricional simple")}</strong>
                  <span>{tr(language, "I do not want to measure everything.", "No quiero complicarme midiendo todo.")}</span>
                </button>
                <button
                  type="button"
                  className={nutritionMode === "macros" ? "is-active" : ""}
                  aria-pressed={nutritionMode === "macros"}
                  onClick={() => updateHealth("nutritionPlanMode", "macros")}
                >
                  <strong>{tr(language, "Macro-based nutrition plan", "Plan nutricional basado en macros")}</strong>
                  <span>{tr(language, "I want more precision for my goals.", "Quiero mayor precisión para mis objetivos.")}</span>
                </button>
              </div>
            </section>

            {nutritionMode === "macros" && (
              <section className="macro-plan" aria-labelledby="macro-plan-title">
                <div className="macro-plan-heading">
                  <div>
                    <p className="section-kicker">{tr(language, "Daily starting point", "Punto de partida diario")}</p>
                    <h4 id="macro-plan-title">{tr(language, "A coherent macro target—not three unrelated numbers.", "Una meta coherente de macros, no tres números aislados.")}</h4>
                  </div>
                  <label>
                    <span>{tr(language, "Eating moments", "Momentos de comida")}</span>
                    <select
                      value={healthProfile.macroMealsPerDay ?? 4}
                      onChange={(event) => updateHealth("macroMealsPerDay", Number(event.target.value) as 3 | 4 | 5)}
                    >
                      <option value={3}>3</option>
                      <option value={4}>4</option>
                      <option value={5}>5</option>
                    </select>
                  </label>
                </div>

                {macroPlan ? (
                  <>
                    <div className="macro-target-grid">
                      <article>
                        <span>{tr(language, "Energy base", "Base energética")}</span>
                        <strong>{macroPlan.energyKcal.toLocaleString(numberLocale)} kcal</strong>
                        <small>{macroPlan.maintenanceRange.min.toLocaleString(numberLocale)}–{macroPlan.maintenanceRange.max.toLocaleString(numberLocale)} {tr(language, "estimated maintenance range", "rango estimado de mantenimiento")}</small>
                      </article>
                      <article>
                        <span>{tr(language, "Protein", "Proteína")}</span>
                        <strong>{macroPlan.protein.grams} g</strong>
                        <small>{macroPlan.protein.energyPercent}% · {tr(language, "reference range", "rango de referencia")} {macroPlan.protein.referenceRange.min}–{macroPlan.protein.referenceRange.max} g</small>
                      </article>
                      <article>
                        <span>{tr(language, "Carbohydrates", "Carbohidratos")}</span>
                        <strong>{macroPlan.carbohydrates.grams} g</strong>
                        <small>{macroPlan.carbohydrates.energyPercent}% {tr(language, "of the energy base", "de la base energética")}</small>
                      </article>
                      <article>
                        <span>{tr(language, "Fat", "Grasa")}</span>
                        <strong>{macroPlan.fat.grams} g</strong>
                        <small>{macroPlan.fat.energyPercent}% {tr(language, "of the energy base", "de la base energética")}</small>
                      </article>
                    </div>
                    <div className="macro-per-meal">
                      <strong>{tr(language, "If divided evenly", "Si los distribuís por igual")}</strong>
                      <span>{macroPlan.perMeal.proteinGrams} g {tr(language, "protein", "proteína")} · {macroPlan.perMeal.carbohydrateGrams} g {tr(language, "carbs", "carbohidratos")} · {macroPlan.perMeal.fatGrams} g {tr(language, "fat", "grasa")} {tr(language, "per eating moment", "por momento de comida")}</span>
                    </div>
                    <p className="macro-plan-note">
                      {tr(
                        language,
                        "This first version uses the midpoint of your estimated maintenance range. It does not silently add a calorie deficit or surplus from your goal. Meal distribution is flexible, and personalized sports or clinical nutrition requires a registered nutrition professional.",
                        "Esta primera versión usa el punto medio de tu mantenimiento estimado. No agrega silenciosamente un déficit o superávit por tu objetivo. La distribución entre comidas es flexible, y la nutrición deportiva o clínica personalizada requiere un profesional de nutrición.",
                      )}
                      {" "}
                      <a href="https://odphp.health.gov/our-work/nutrition-physical-activity/dietary-guidelines/current-dietary-guidelines" target="_blank" rel="noreferrer">DGA 2025–2030</a>
                      {" · "}
                      <a href="https://www.nationalacademies.org/read/10872/chapter/7" target="_blank" rel="noreferrer">NASEM</a>
                    </p>
                  </>
                ) : (
                  <div className="macro-plan-missing" role="status">
                    <strong>{tr(language, "Complete the data needed for a macro estimate.", "Completá los datos necesarios para estimar tus macros.")}</strong>
                    <p>{tr(language, "Add date of birth, height, current weight and metabolic reference in Body and health.", "Agregá fecha de nacimiento, estatura, peso actual y referencia metabólica en Cuerpo y salud.")}</p>
                  </div>
                )}
              </section>
            )}

            <div className="nutrition-preferences">
              <label className="health-field">
                <span>{tr(language, "Eating pattern", "Patrón de alimentación")}</span>
                <select value={healthProfile.dietaryPattern} onChange={(event) => updateHealth("dietaryPattern", event.target.value as HealthProfile["dietaryPattern"])}>
                  <option value="omnivore">{tr(language, "Omnivore", "Omnívoro")}</option>
                  <option value="vegetarian">{tr(language, "Vegetarian", "Vegetariano")}</option>
                  <option value="vegan">{tr(language, "Vegan", "Vegano")}</option>
                  <option value="pescatarian">{tr(language, "Pescatarian", "Pescetariano")}</option>
                  <option value="other">{tr(language, "Other", "Otro")}</option>
                </select>
              </label>
              <label className="health-field">
                <span>{tr(language, "Allergies / intolerances", "Alergias / intolerancias")}</span>
                <input value={healthProfile.allergies} onChange={(event) => updateHealth("allergies", event.target.value)} placeholder={tr(language, "Example: peanuts, lactose", "Ejemplo: maní, lactosa")} />
              </label>
            </div>

            <section className="meal-planner">
              <div>
                <p className="section-kicker">{tr(language, "Daily food options", "Opciones alimentarias diarias")}</p>
                <h4>{nutritionMode === "simple"
                  ? tr(language, "Plan quantities by meal, then choose ingredients you enjoy.", "Organizá cantidades por comida y luego elegí ingredientes que te gusten.")
                  : tr(language, "Choose foods you enjoy to build around your macro starting point.", "Elegí alimentos que te gusten para construir alrededor de tu punto de partida de macros.")}</h4>
                <p>{nutritionMode === "simple"
                  ? tr(language, "These are flexible planning references for protein, vegetables and carbohydrates—not a prescribed diet.", "Son referencias flexibles de proteína, vegetales y carbohidratos; no una dieta prescrita.")
                  : tr(language, "The exchange servings help you compare foods; they do not automatically equal your macro targets.", "Las porciones de intercambio te ayudan a comparar alimentos; no equivalen automáticamente a tus metas de macros.")}</p>
              </div>
              <button type="button" onClick={() => setShowMealOptions(true)}>
                {nutritionMode === "simple"
                  ? tr(language, "Create daily food options", "Crear opciones alimentarias diarias")
                  : tr(language, "Choose foods for this plan", "Elegir alimentos para este plan")}
              </button>

              {showMealOptions && (
                <>
                  {nutritionMode === "simple" && (
                    <>
                      <p className="meal-protein-heading">{tr(language, "Protein target per meal", "Meta de proteína por comida")}</p>
                      <p className="meal-protein-explainer">
                      {tr(
                        language,
                        "The number shown is grams of the protein nutrient—not grams of food. It simply divides the daily planning range across four eating moments; adjust the distribution to your appetite and training schedule.",
                        "El número mostrado son gramos del nutriente proteína, no gramos de alimento. Solo distribuye el rango diario entre cuatro momentos de comida; ajustá la distribución según tu apetito y horario de entrenamiento.",
                      )}
                      </p>
                      <div className="protein-food-reference">
                        <strong>{tr(language, "Food-to-nutrient example", "Ejemplo de alimento a nutriente")}</strong>
                        <p>
                          {tr(
                            language,
                            "180 g of cooked lean beef (tenderloin) provide about 55 g of protein.",
                            "180 g de carne magra de res cocida (lomo) aportan aproximadamente 55 g de proteína.",
                          )}
                        </p>
                        <small>
                          {tr(
                            language,
                            "USDA reference: 30.7 g protein per 100 g cooked. The result varies by cut, fat trimming and cooking; raw and cooked weights are not interchangeable.",
                            "Referencia USDA: 30,7 g de proteína por cada 100 g cocidos. El resultado cambia según el corte, la grasa retirada y la cocción; el peso crudo y el cocido no son intercambiables.",
                          )}{" "}
                          <a
                            href="https://fdc.nal.usda.gov/food-details/170641/nutrients"
                            target="_blank"
                            rel="noreferrer"
                          >
                            {tr(language, "USDA FoodData Central source", "Fuente USDA FoodData Central")}
                          </a>
                        </small>
                      </div>
                      <div className="meal-options-grid">
                        {createDailyFoodOptions(healthProfile, language).map((meal) => (
                          <article key={meal.key}>
                            <h4>{meal.name}</h4>
                            <p><strong>{tr(language, "Protein", "Proteína")}:</strong> {meal.proteinTarget}</p>
                            <p><strong>{tr(language, "Vegetables / fruit", "Vegetales / fruta")}:</strong> {meal.vegetables}</p>
                            <p><strong>{tr(language, "Carbohydrates", "Carbohidratos")}:</strong> {meal.carbohydrates}</p>
                          </article>
                        ))}
                      </div>
                    </>
                  )}
                  <div className="ingredient-groups">
                    <div className="ingredient-library-heading">
                      <p>{tr(language, "Complete food list", "Lista completa de alimentos")}</p>
                      <span>{tr(language, "11 food groups · 95 ingredients", "11 grupos alimentarios · 95 ingredientes")}</span>
                    </div>
                    <p>{tr(
                      language,
                      "Open only the groups you want. The serving shown is the reference from your file, not a rigid prescription.",
                      "Desplegá solo los grupos que querás. La porción mostrada es la referencia de tu archivo, no una prescripción rígida.",
                    )}</p>
                    {FOOD_GROUPS.map((group) => {
                      const groupFoods = FOOD_ITEMS.filter((food) => food.group === group.key);
                      const selectedCount = groupFoods.filter((food) => selectedIngredients.includes(food.id)).length;
                      return (
                        <details className="ingredient-group" key={group.key}>
                          <summary>
                            <span>
                              {language === "es" ? group.label.es : group.label.en} · {groupFoods.length}
                            </span>
                            <small>{tr(
                              language,
                              `${selectedCount} selected`,
                              `${selectedCount} ${selectedCount === 1 ? "seleccionado" : "seleccionados"}`,
                            )}</small>
                          </summary>
                          <fieldset className="ingredient-picker">
                            <legend className="sr-only">{language === "es" ? group.label.es : group.label.en}</legend>
                            {groupFoods.map((food) => (
                              <label key={food.id}>
                                <input
                                  type="checkbox"
                                  checked={selectedIngredients.includes(food.id)}
                                  onChange={(event) => togglePreferredIngredient(food.id, event.target.checked)}
                                />
                                <span>
                                  <strong>{foodName(food, language)}</strong>
                                  <small>{formatFoodServing(food, language)}</small>
                                </span>
                              </label>
                            ))}
                          </fieldset>
                        </details>
                      );
                    })}
                  </div>
                  <button
                    type="button"
                    disabled={selectedIngredients.length < 2}
                    onClick={() => setShowRecipeIdeas(true)}
                  >
                    {tr(language, "Create recipe ideas", "Crear ideas de recetas")}
                  </button>
                  {selectedIngredients.length < 2 && (
                    <p className="ingredient-selection-note">
                      {tr(
                        language,
                        "Choose at least two ingredients to create a meal idea.",
                        "Elegí al menos dos ingredientes para crear una idea de comida.",
                      )}
                    </p>
                  )}
                </>
              )}

              {showRecipeIdeas && (
                <div className="recipe-ideas">
                  {recipeIdeas.map((recipe) => (
                    <article key={recipe.name}><h4>{recipe.name}</h4><p>{recipe.description}</p></article>
                  ))}
                </div>
              )}
            </section>

            <form className="food-search" onSubmit={searchFoods}>
              <div>
                <label htmlFor="usda-food-search">{tr(language, "Search USDA foods", "Buscar alimentos en USDA")}</label>
                <p>{tr(language, "Look up ingredients and basic foods in FoodData Central.", "Consultá ingredientes y alimentos básicos en FoodData Central.")}</p>
              </div>
              <div className="food-search-row">
                <span><Search size={17} /><input id="usda-food-search" value={foodQuery} onChange={(event) => setFoodQuery(event.target.value)} placeholder={tr(language, "Oats, banana, salmon…", "Avena, banano, salmón…")} /></span>
                <button type="submit" disabled={foodLoading || !foodQuery.trim()}>{foodLoading ? tr(language, "Searching…", "Buscando…") : tr(language, "Search foods", "Buscar alimentos")}</button>
              </div>
            </form>

            {foodError && <p className="food-error">{foodError}</p>}
            {foodResults.length > 0 && (
              <div className="food-results" aria-live="polite">
                {foodResults.map((food) => (
                  <article key={food.id}>
                    <div><strong>{food.name}</strong><small>{food.dataType} · {tr(language, "values per", "valores por")} {food.serving}</small></div>
                    <dl>
                      <div><dt>kcal</dt><dd>{food.calories ?? "—"}</dd></div>
                      <div><dt>{tr(language, "protein", "proteína")}</dt><dd>{food.proteinGrams === null ? "—" : `${food.proteinGrams} g`}</dd></div>
                      <div><dt>{tr(language, "carbs", "carbohidratos")}</dt><dd>{food.carbohydrateGrams === null ? "—" : `${food.carbohydrateGrams} g`}</dd></div>
                      <div><dt>{tr(language, "fat", "grasa")}</dt><dd>{food.fatGrams === null ? "—" : `${food.fatGrams} g`}</dd></div>
                    </dl>
                  </article>
                ))}
              </div>
            )}

            <p className="profile-note">{tr(language, "Food searches are sent to the USDA FoodData Central service. Your personal information stays on this device unless you sign in to your private cloud account.", "Las búsquedas de alimentos se envían al servicio USDA FoodData Central. Tu información personal permanece privada en tu cuenta.")}</p>
          </div>
        )}

        <button className="profile-done" type="button" onClick={onClose}>{tr(language, "Done", "Listo")}</button>
      </aside>
    </div>
  );
}

interface NumericFieldProps {
  label: string;
  accessibleLabel?: string;
  value: number | null;
  unit: string;
  min: number;
  max: number;
  step?: string;
  onChange: (value: number | null) => void;
}

function NumericField({ label, accessibleLabel, value, unit, min, max, step = "1", onChange }: NumericFieldProps) {
  return (
    <label className="health-field numeric-field">
      <span>{label}</span>
      <span className="numeric-input">
        <input
          aria-label={accessibleLabel ?? label}
          type="number"
          inputMode="decimal"
          value={value ?? ""}
          min={min}
          max={max}
          step={step}
          onChange={(event) => onChange(optionalNumber(event.target.value))}
        />
        <small>{unit}</small>
      </span>
    </label>
  );
}

interface RangeFieldProps {
  label: string;
  value: number;
  low: string;
  high: string;
  onChange: (value: number) => void;
}

function RangeField({ label, value, low, high, onChange }: RangeFieldProps) {
  return (
    <label className="health-field range-field">
      <span>{label} <strong>{value}/5</strong></span>
      <input type="range" min="1" max="5" value={value} onChange={(event) => onChange(Number(event.target.value))} />
      <small><i>{low}</i><i>{high}</i></small>
    </label>
  );
}
