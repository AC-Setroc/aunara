import { Check, ShieldCheck } from "lucide-react";
import { tr } from "../lib/i18n";
import type { LanguageCode } from "../types";

interface ConsentGateProps {
  language: LanguageCode;
  onGrant: () => void;
  onUseBasic: () => void;
  onOpenPrivacy: () => void;
}

export function ConsentGate({
  language,
  onGrant,
  onUseBasic,
  onOpenPrivacy,
}: ConsentGateProps) {
  return (
    <div className="consent-gate-backdrop">
      <section className="consent-gate" role="dialog" aria-modal="true" aria-label={tr(language, "Choose your privacy level", "Elegí tu nivel de privacidad")}>
        <span className="consent-gate-mark"><ShieldCheck size={25} /></span>
        <p className="eyebrow">{tr(language, "Sensitive data / separate authorization", "Datos sensibles / autorización separada")}</p>
        <h2>{tr(language, "Choose how Repbook personalizes.", "Elegí cómo personaliza Repbook.")}</h2>
        <p>{tr(
          language,
          "Health information is optional. You can authorize it for personalized routines and general nutrition references, or continue with a basic route without body measurements, symptoms, injuries, allergies or wellbeing check-ins.",
          "La información de salud es opcional. Podés autorizarla para personalizar rutinas y referencias generales de nutrición, o continuar con una ruta básica sin medidas corporales, síntomas, lesiones, alergias ni registros de bienestar.",
        )}</p>
        <button className="is-primary" type="button" onClick={onGrant}><Check size={17} /> {tr(language, "Authorize health personalization", "Autorizar personalización de salud")}</button>
        <button type="button" onClick={onUseBasic}>{tr(language, "Continue with a basic route", "Continuar con una ruta básica")}</button>
        <button className="is-link" type="button" onClick={onOpenPrivacy}>{tr(language, "Read the Privacy policy", "Leer la Política de privacidad")}</button>
      </section>
    </div>
  );
}
