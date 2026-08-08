import { ShieldCheck, X } from "lucide-react";
import { useEffect } from "react";
import {
  DATA_CONTROLLER_EMAIL,
  DATA_CONTROLLER_NAME,
  LEGAL_VERSION,
  PRIVACY_EFFECTIVE_DATE,
} from "../lib/privacy";
import { tr } from "../lib/i18n";
import type { LanguageCode } from "../types";

export type LegalDocument = "privacy" | "terms";

interface LegalPanelProps {
  language: LanguageCode;
  document: LegalDocument;
  onClose: () => void;
}

export function LegalPanel({ language, document, onClose }: LegalPanelProps) {
  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  const title = document === "privacy"
    ? tr(language, "Privacy policy", "Política de privacidad")
    : tr(language, "Terms of use", "Términos de uso");

  return (
    <div className="legal-backdrop" role="presentation">
      <article className="legal-panel" role="dialog" aria-modal="true" aria-labelledby="legal-title">
        <header>
          <span><ShieldCheck size={24} /></span>
          <div>
            <p className="eyebrow">{tr(language, `Version ${LEGAL_VERSION} / effective ${PRIVACY_EFFECTIVE_DATE}`, `Versión ${LEGAL_VERSION} / vigente desde ${PRIVACY_EFFECTIVE_DATE}`)}</p>
            <h2 id="legal-title">{title}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label={tr(language, "Close legal document", "Cerrar documento legal")}><X size={20} /></button>
        </header>

        {document === "privacy" ? (
          <div className="legal-copy">
            <section>
              <h3>{tr(language, "Responsible party and contact", "Responsable y contacto")}</h3>
              <p>{tr(
                language,
                `The controller of Aunara personal data is ${DATA_CONTROLLER_NAME}, Colombia. Privacy requests can be sent to ${DATA_CONTROLLER_EMAIL}.`,
                `El responsable del tratamiento de datos personales de Aunara es ${DATA_CONTROLLER_NAME}, Colombia. Las solicitudes de privacidad se reciben en ${DATA_CONTROLLER_EMAIL}.`,
              )}</p>
            </section>
            <section>
              <h3>{tr(language, "Data and purposes", "Datos y finalidades")}</h3>
              <p>{tr(
                language,
                "Aunara uses account data to authenticate and synchronize the service; routine and performance data to save training plans and progress; and, only with separate authorization, sensitive health data to personalize training, recovery and nutrition references.",
                "Aunara usa los datos de cuenta para autenticar y sincronizar el servicio; los datos de rutinas y rendimiento para guardar planes y progreso; y, únicamente con autorización separada, datos sensibles de salud para personalizar referencias de entrenamiento, recuperación y nutrición.",
              )}</p>
              <p>{tr(
                language,
                "Providing sensitive health data is optional. If you decline, Aunara offers a basic route that does not use body measurements, injuries, symptoms, allergies or wellbeing check-ins.",
                "Entregar datos sensibles de salud es opcional. Si no los autorizás, Aunara ofrece una ruta básica que no usa medidas corporales, lesiones, síntomas, alergias ni registros de bienestar.",
              )}</p>
            </section>
            <section>
              <h3>{tr(language, "Providers and international processing", "Proveedores y tratamiento internacional")}</h3>
              <p>{tr(
                language,
                "Authentication and the personal database use Supabase in the São Paulo, Brazil region. The public web application is delivered through OpenAI Sites. Food searches are sent directly to USDA FoodData Central without attaching the Aunara account identifier.",
                "La autenticación y la base de datos personal usan Supabase en la región de São Paulo, Brasil. La aplicación web pública se entrega mediante OpenAI Sites. Las búsquedas de alimentos se envían directamente a USDA FoodData Central sin adjuntar el identificador de la cuenta de Aunara.",
              )}</p>
            </section>
            <section>
              <h3>{tr(language, "Retention and security", "Conservación y seguridad")}</h3>
              <p>{tr(
                language,
                "Personal content is kept while the account is active or until you delete it. Aunara separates each user's database row and blocks anonymous access. Provider backups may remain for their documented technical rotation period.",
                "El contenido personal se conserva mientras la cuenta esté activa o hasta que lo eliminés. Aunara separa el registro de cada usuario en la base de datos y bloquea el acceso anónimo. Las copias de respaldo de los proveedores pueden permanecer durante su ciclo técnico documentado de rotación.",
              )}</p>
            </section>
            <section>
              <h3>{tr(language, "Your rights", "Tus derechos")}</h3>
              <p>{tr(
                language,
                "You may access, export, correct or delete your data; revoke sensitive-data authorization; ask for proof of authorization; and submit a consultation or claim. Aunara aims to answer consultations within 10 business days and claims within 15 business days.",
                "Podés consultar, exportar, corregir o eliminar tus datos; revocar la autorización de datos sensibles; solicitar prueba de la autorización; y presentar consultas o reclamos. Aunara procura responder consultas en máximo 10 días hábiles y reclamos en máximo 15 días hábiles.",
              )}</p>
              <p>{tr(
                language,
                "If your request is not resolved, you may contact Colombia's Superintendencia de Industria y Comercio.",
                "Si tu solicitud no se resuelve, podés acudir a la Superintendencia de Industria y Comercio de Colombia.",
              )} <a href="https://www.sic.gov.co/" target="_blank" rel="noreferrer">sic.gov.co</a>.</p>
            </section>
          </div>
        ) : (
          <div className="legal-copy">
            <section>
              <h3>{tr(language, "Service scope", "Alcance del servicio")}</h3>
              <p>{tr(
                language,
                "Aunara is a personal wellness and exercise-planning tool for adults. It helps organize routines, loads, preferences and general nutrition references.",
                "Aunara es una herramienta personal de bienestar y planificación de ejercicio para personas adultas. Ayuda a organizar rutinas, cargas, preferencias y referencias generales de nutrición.",
              )}</p>
            </section>
            <section>
              <h3>{tr(language, "Not a clinical service", "No es un servicio clínico")}</h3>
              <p>{tr(
                language,
                "Aunara does not replace a medical, nutritional or physiotherapy diagnosis, prescription, treatment or rehabilitation plan. Stop exercising and seek suitable professional attention when symptoms appear, worsen or create doubt about safe activity.",
                "Aunara no sustituye un diagnóstico, prescripción, tratamiento o plan de rehabilitación médico, nutricional o fisioterapéutico. Suspendé el ejercicio y buscá atención profesional adecuada cuando aparezcan síntomas, empeoren o generen dudas sobre la seguridad de la actividad.",
              )}</p>
            </section>
            <section>
              <h3>{tr(language, "Account responsibilities", "Responsabilidades de la cuenta")}</h3>
              <p>{tr(
                language,
                "You must provide accurate information, protect your password, review suggested movements before performing them and avoid sharing another person's private information without authorization. Aunara is currently intended only for users aged 18 or older.",
                "Debés suministrar información correcta, proteger tu contraseña, revisar los movimientos sugeridos antes de realizarlos y evitar cargar información privada de otra persona sin autorización. Aunara está destinada actualmente solo a personas de 18 años o más.",
              )}</p>
            </section>
            <section>
              <h3>{tr(language, "Availability and changes", "Disponibilidad y cambios")}</h3>
              <p>{tr(
                language,
                "This personal UAT version is provided without a paid subscription or guaranteed availability. Material changes to these terms or the privacy policy will require a new notice and, when appropriate, renewed acceptance.",
                "Esta versión personal de UAT se ofrece sin suscripción paga ni disponibilidad garantizada. Los cambios materiales en estos términos o en la política de privacidad requerirán un nuevo aviso y, cuando corresponda, una nueva aceptación.",
              )}</p>
            </section>
            <section>
              <h3>{tr(language, "Contact and governing law", "Contacto y ley aplicable")}</h3>
              <p>{tr(
                language,
                `Questions can be sent to ${DATA_CONTROLLER_EMAIL}. These terms are governed by Colombian law.`,
                `Las consultas se reciben en ${DATA_CONTROLLER_EMAIL}. Estos términos se rigen por la legislación colombiana.`,
              )}</p>
            </section>
          </div>
        )}
      </article>
    </div>
  );
}
