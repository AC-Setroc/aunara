import { AlertTriangle, Plus, ShieldCheck, Trash2 } from "lucide-react";
import { assessExerciseReadiness } from "../lib/wellness";
import { tr } from "../lib/i18n";
import type {
  ExerciseReadinessScreen,
  HealthProfile,
  LanguageCode,
  LimitationArea,
  MovementRestriction,
  TrainingLimitation,
} from "../types";

interface ReadinessAndLimitationsProps {
  language: LanguageCode;
  profile: HealthProfile;
  onChange: (profile: HealthProfile) => void;
  required?: boolean;
}

const EMPTY_SCREEN: ExerciseReadinessScreen = {
  confirmed: false,
  chestPain: false,
  dizzinessOrFainting: false,
  medicallySupervisedOnly: false,
  musculoskeletalConcern: false,
};

const AREAS: Array<[LimitationArea, string, string]> = [
  ["knee", "Knee", "Rodilla"],
  ["hip", "Hip", "Cadera"],
  ["lower-back", "Lower back", "Zona lumbar"],
  ["shoulder", "Shoulder", "Hombro"],
  ["elbow-wrist", "Elbow or wrist", "Codo o muñeca"],
  ["ankle-foot", "Ankle or foot", "Tobillo o pie"],
  ["neck", "Neck", "Cuello"],
  ["other", "Other", "Otra"],
];

const MOVEMENTS: Array<[MovementRestriction, string, string]> = [
  ["impact", "Impact and jumping", "Impacto y saltos"],
  ["deep-knee-flexion", "Deep knee flexion", "Flexión profunda de rodilla"],
  ["hip-hinge", "Hip hinge", "Bisagra de cadera"],
  ["overhead", "Overhead movement", "Movimiento sobre la cabeza"],
  ["push", "Pushing", "Empuje"],
  ["pull", "Pulling", "Jalón"],
  ["rotation", "Trunk rotation", "Rotación de tronco"],
  ["single-leg-balance", "Single-leg balance", "Equilibrio a una pierna"],
];

function newLimitation(): TrainingLimitation {
  return {
    id: typeof crypto.randomUUID === "function" ? crypto.randomUUID() : `limitation-${Date.now()}`,
    area: "knee",
    side: "not-applicable",
    status: "recent",
    restrictedMovements: [],
    professionalGuidance: "",
    professionalReview: "not-reviewed",
  };
}

export function ReadinessAndLimitations({
  language,
  profile,
  onChange,
  required = false,
}: ReadinessAndLimitationsProps) {
  const screen = profile.readinessScreen ?? EMPTY_SCREEN;
  const limitations = profile.limitations ?? [];
  const assessment = assessExerciseReadiness(profile, language);

  function updateScreen<Key extends keyof ExerciseReadinessScreen>(
    key: Key,
    value: ExerciseReadinessScreen[Key],
  ) {
    onChange({
      ...profile,
      readinessScreen: {
        ...screen,
        [key]: value,
        reviewedAt: new Date().toISOString().slice(0, 10),
      },
    });
  }

  function updateLimitation(id: string, changes: Partial<TrainingLimitation>) {
    onChange({
      ...profile,
      limitations: limitations.map((item) => item.id === id ? { ...item, ...changes } : item),
    });
  }

  function toggleRestriction(limitation: TrainingLimitation, restriction: MovementRestriction) {
    const selected = limitation.restrictedMovements.includes(restriction);
    updateLimitation(limitation.id, {
      restrictedMovements: selected
        ? limitation.restrictedMovements.filter((item) => item !== restriction)
        : [...limitation.restrictedMovements, restriction],
    });
  }

  return (
    <section className="readiness-section" aria-labelledby="readiness-title">
      <div className="readiness-heading">
        <div>
          <p className="section-kicker">{tr(language, "Training safety context", "Contexto de seguridad para entrenar")}</p>
          <h3 id="readiness-title">{tr(language, "Exercise readiness", "Preparación para el ejercicio")}</h3>
        </div>
        <ShieldCheck size={24} />
      </div>
      <p>{tr(
        language,
        "These questions do not diagnose you. They help Repbook decide whether to suggest normally, adapt movements, or pause the suggestion for professional review.",
        "Estas preguntas no te diagnostican. Le ayudan a Repbook a decidir si sugiere normalmente, adapta movimientos o pausa la sugerencia para una valoración profesional.",
      )}</p>

      <div className="readiness-questions">
        <label>
          <input type="checkbox" checked={screen.chestPain} onChange={(event) => updateScreen("chestPain", event.target.checked)} />
          <span>{tr(language, "I have chest pain or pressure at rest, in daily life, or during activity.", "Tengo dolor o presión en el pecho en reposo, en la vida diaria o durante la actividad.")}</span>
        </label>
        <label>
          <input type="checkbox" checked={screen.dizzinessOrFainting} onChange={(event) => updateScreen("dizzinessOrFainting", event.target.checked)} />
          <span>{tr(language, "I have had unexplained dizziness or fainting.", "He tenido mareo inexplicable o desmayo.")}</span>
        </label>
        <label>
          <input type="checkbox" checked={screen.medicallySupervisedOnly} onChange={(event) => updateScreen("medicallySupervisedOnly", event.target.checked)} />
          <span>{tr(language, "A professional told me to exercise only with medical supervision.", "Un profesional me indicó hacer ejercicio únicamente con supervisión médica.")}</span>
        </label>
        <label>
          <input type="checkbox" checked={screen.musculoskeletalConcern} onChange={(event) => updateScreen("musculoskeletalConcern", event.target.checked)} />
          <span>{tr(language, "I have a current bone, joint, tendon, or muscle concern that activity could worsen.", "Tengo una molestia actual de hueso, articulación, tendón o músculo que la actividad podría empeorar.")}</span>
        </label>
      </div>

      <div className={`readiness-result is-${assessment.level}`}>
        {assessment.level === "professional-review" ? <AlertTriangle size={19} /> : <ShieldCheck size={19} />}
        <div>
          <strong>{assessment.level === "professional-review"
            ? tr(language, "Consult a qualified professional before accepting a suggestion", "Consultá a un profesional idóneo antes de aceptar una sugerencia")
            : assessment.level === "adapt"
              ? tr(language, "Repbook will apply your movement restrictions", "Repbook aplicará tus restricciones de movimiento")
              : assessment.level === "setup"
                ? tr(language, "Confirm this review to continue", "Confirmá esta revisión para continuar")
                : tr(language, "No warning was reported in this review", "No reportaste alertas en esta revisión")}</strong>
          <span>{assessment.reasons[0]}</span>
        </div>
      </div>

      <div className="limitations-heading">
        <div>
          <strong>{tr(language, "Movement limitations", "Limitaciones de movimiento")}</strong>
          <span>{tr(language, "Record only restrictions you understand; professional instructions take priority.", "Registrá solo restricciones que entendás; las indicaciones profesionales tienen prioridad.")}</span>
        </div>
        <button type="button" onClick={() => onChange({ ...profile, limitations: [...limitations, newLimitation()] })}>
          <Plus size={15} /> {tr(language, "Add limitation", "Agregar limitación")}
        </button>
      </div>

      {limitations.map((limitation, index) => (
        <fieldset className="limitation-card" key={limitation.id}>
          <legend>{tr(language, `Limitation ${index + 1}`, `Limitación ${index + 1}`)}</legend>
          <button
            className="remove-limitation"
            type="button"
            onClick={() => onChange({ ...profile, limitations: limitations.filter((item) => item.id !== limitation.id) })}
            aria-label={tr(language, `Remove limitation ${index + 1}`, `Quitar limitación ${index + 1}`)}
          >
            <Trash2 size={15} />
          </button>
          <div className="limitation-grid">
            <label>
              <span>{tr(language, "Affected area", "Zona afectada")}</span>
              <select value={limitation.area} onChange={(event) => updateLimitation(limitation.id, { area: event.target.value as LimitationArea })}>
                {AREAS.map(([value, en, es]) => <option key={value} value={value}>{tr(language, en, es)}</option>)}
              </select>
            </label>
            <label>
              <span>{tr(language, "Side", "Lado")}</span>
              <select value={limitation.side} onChange={(event) => updateLimitation(limitation.id, { side: event.target.value as TrainingLimitation["side"] })}>
                <option value="not-applicable">{tr(language, "Not applicable", "No aplica")}</option>
                <option value="left">{tr(language, "Left", "Izquierdo")}</option>
                <option value="right">{tr(language, "Right", "Derecho")}</option>
                <option value="both">{tr(language, "Both", "Ambos")}</option>
              </select>
            </label>
            <label>
              <span>{tr(language, "Current status", "Estado actual")}</span>
              <select value={limitation.status} onChange={(event) => updateLimitation(limitation.id, { status: event.target.value as TrainingLimitation["status"] })}>
                <option value="recent">{tr(language, "Recent or worsening", "Reciente o empeorando")}</option>
                <option value="recovering">{tr(language, "Recovering", "En recuperación")}</option>
                <option value="stable">{tr(language, "Stable", "Estable")}</option>
              </select>
            </label>
            <label>
              <span>{tr(language, "Professional review", "Valoración profesional")}</span>
              <select value={limitation.professionalReview} onChange={(event) => updateLimitation(limitation.id, { professionalReview: event.target.value as TrainingLimitation["professionalReview"] })}>
                <option value="not-reviewed">{tr(language, "Not reviewed", "Sin valorar")}</option>
                <option value="cleared-with-restrictions">{tr(language, "Cleared with restrictions", "Autorizado con restricciones")}</option>
                <option value="cleared">{tr(language, "Cleared without restrictions", "Autorizado sin restricciones")}</option>
              </select>
            </label>
          </div>
          <div className="restriction-options">
            <span>{tr(language, "Movements to avoid", "Movimientos a evitar")}</span>
            <div>
              {MOVEMENTS.map(([value, en, es]) => (
                <label key={value}>
                  <input
                    type="checkbox"
                    checked={limitation.restrictedMovements.includes(value)}
                    onChange={() => toggleRestriction(limitation, value)}
                  />
                  <span>{tr(language, en, es)}</span>
                </label>
              ))}
            </div>
          </div>
          <label className="professional-guidance">
            <span>{tr(language, "Professional instruction or useful detail", "Indicación profesional o detalle útil")}</span>
            <textarea
              value={limitation.professionalGuidance}
              onChange={(event) => updateLimitation(limitation.id, { professionalGuidance: event.target.value })}
              placeholder={tr(language, "Example: low impact only; stop before painful range.", "Ejemplo: solo bajo impacto; parar antes del rango doloroso.")}
            />
          </label>
        </fieldset>
      ))}

      <label className="readiness-confirmation">
        <input
          type="checkbox"
          required={required}
          checked={screen.confirmed}
          onChange={(event) => updateScreen("confirmed", event.target.checked)}
        />
        <span>{tr(
          language,
          "I reviewed these answers and will update them if my health changes.",
          "Revisé estas respuestas y las actualizaré si cambia mi salud.",
        )}</span>
      </label>
      <p className="readiness-disclaimer">{tr(
        language,
        "If you have warning symptoms, a recent injury, an unexplained limitation, or doubt about safe activity, seek medical or physiotherapy guidance. In an emergency, use local emergency services.",
        "Si tenés síntomas de alerta, una lesión reciente, una limitación sin explicación o dudas sobre actividad segura, buscá orientación médica o de fisioterapia. En una emergencia, usá los servicios locales de urgencias.",
      )}</p>
    </section>
  );
}
