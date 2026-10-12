import { ShieldCheck, X } from "lucide-react";
import { useEffect, useRef } from "react";
import {
  DATA_CONTROLLER_EMAIL,
  DATA_CONTROLLER_NAME,
  LEGAL_VERSION,
  PRIVACY_EFFECTIVE_DATE,
} from "../lib/privacy";
import { tr } from "../lib/i18n";
import type { LanguageCode } from "../types";

export type LegalDocument = "privacy" | "terms" | "cookies";

interface LegalPanelProps {
  language: LanguageCode;
  document: LegalDocument;
  onClose: () => void;
  returnFocusTo?: HTMLElement | null;
}

export function LegalPanel({ language, document, onClose, returnFocusTo }: LegalPanelProps) {
  const panelRef = useRef<HTMLElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const dom = window.document;
    const previousFocus = returnFocusTo ?? (dom.activeElement instanceof HTMLElement ? dom.activeElement : null);
    const panel = panelRef.current;
    if (!panel) return;

    // Isolate sibling branches only: signup stays mounted underneath this layer.
    const siblings: { element: HTMLElement; wasInert: boolean }[] = [];
    let branch: HTMLElement | null = backdropRef.current;
    while (branch && branch !== dom.body) {
      for (const sibling of Array.from(branch.parentElement?.children ?? [])) {
        if (sibling !== branch && sibling instanceof HTMLElement) {
          siblings.push({ element: sibling, wasInert: sibling.hasAttribute("inert") });
          sibling.setAttribute("inert", "");
        }
      }
      branch = branch.parentElement;
    }
    const previousOverflow = dom.body.style.overflow;
    dom.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const confineFocus = (event: FocusEvent) => {
      if (event.target instanceof Node && !panel.contains(event.target)) closeRef.current?.focus();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        // Capture before underlying panels' window listeners see Escape.
        event.stopImmediatePropagation();
        onCloseRef.current();
      } else if (event.key === "Tab") {
        const controls = Array.from(panel.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        )).filter((element) => {
          if (element.tabIndex < 0 || element.matches(":disabled, input[type='hidden']")) return false;
          let ancestor: HTMLElement | null = element;
          while (ancestor && panel.contains(ancestor)) {
            const style = window.getComputedStyle(ancestor);
            if (ancestor.hidden || ancestor.hasAttribute("inert") || ancestor.getAttribute("aria-hidden") === "true"
              || style.display === "none" || style.visibility === "hidden" || style.visibility === "collapse") return false;
            ancestor = ancestor.parentElement;
          }
          return true;
        });
        // Cycle explicitly: Safari's default Tab policy may skip links/buttons.
        event.preventDefault();
        event.stopImmediatePropagation();
        const current = controls.indexOf(dom.activeElement as HTMLElement);
        const next = current < 0
          ? (event.shiftKey ? controls.length - 1 : 0)
          : (current + (event.shiftKey ? -1 : 1) + controls.length) % controls.length;
        (controls[next] ?? closeRef.current)?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown, true);
    dom.addEventListener("focusin", confineFocus, true);
    return () => {
      window.removeEventListener("keydown", onKeyDown, true);
      dom.removeEventListener("focusin", confineFocus, true);
      for (const { element, wasInert } of siblings) {
        if (!wasInert) element.removeAttribute("inert");
      }
      dom.body.style.overflow = previousOverflow;
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, []);

  const title = document === "privacy"
    ? tr(language, "Privacy policy", "Política de privacidad")
    : document === "terms"
      ? tr(language, "Terms of use", "Términos de uso")
      : tr(language, "Cookies and storage", "Cookies y almacenamiento");

  return (
    <div className="legal-backdrop" role="presentation" ref={backdropRef}>
      <article className="legal-panel" role="dialog" aria-modal="true" aria-labelledby="legal-title" ref={panelRef}>
        <header>
          <span><ShieldCheck size={24} /></span>
          <div>
            <p className="eyebrow">{document === "cookies" ? tr(language, "Device storage information", "Información sobre almacenamiento en el dispositivo") : tr(language, `Version ${LEGAL_VERSION} / effective ${PRIVACY_EFFECTIVE_DATE}`, `Versión ${LEGAL_VERSION} / vigente desde ${PRIVACY_EFFECTIVE_DATE}`)}</p>
            <h2 id="legal-title">{title}</h2>
          </div>
          <button type="button" ref={closeRef} onClick={onClose} aria-label={tr(language, "Close legal document", "Cerrar documento legal")}><X size={20} /></button>
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
                "Authentication and the personal database use Supabase in the São Paulo, Brazil region. The public web application is delivered through GitHub Pages. Food searches are sent directly to USDA FoodData Central without attaching the Aunara account identifier.",
                "La autenticación y la base de datos personal usan Supabase en la región de São Paulo, Brasil. La aplicación web pública se entrega mediante GitHub Pages. Las búsquedas de alimentos se envían directamente a USDA FoodData Central sin adjuntar el identificador de la cuenta de Aunara.",
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
        ) : document === "cookies" ? (
          <div className="legal-copy">
            <section>
              <h3>{tr(language, "Preferences and app data", "Preferencias y datos de la app")}</h3>
              <p>{tr(language,
                "Aunara uses localStorage in this browser to keep language, preferences, routines and app state on your device. Some stored content may include personal data, depending on what you provide and your separate health-data authorization. See the privacy policy for purposes and rights.",
                "Aunara usa localStorage de este navegador para guardar idioma, preferencias, rutinas y estado de la app en tu dispositivo. Parte del contenido guardado puede incluir datos personales, según lo que suministrés y tu autorización separada de datos de salud. Consultá la política de privacidad para conocer finalidades y derechos.",
              )}</p>
            </section>
            <section>
              <h3>{tr(language, "Session and offline resources", "Sesión y recursos sin conexión")}</h3>
              <p>{tr(language,
                "Supabase manages authentication and persists session information in browser storage when you sign in. Aunara's service worker uses the Cache API to keep app resources and responses for offline use. The public application is hosted on GitHub Pages. Availability and retention depend on the browser, session lifecycle and existing cache updates; there is no single fixed retention period for all storage.",
                "Supabase gestiona la autenticación y conserva información de sesión en el almacenamiento del navegador cuando ingresás. El service worker de Aunara usa Cache API para conservar recursos y respuestas de la app para uso sin conexión. La aplicación pública se aloja en GitHub Pages. La disponibilidad y duración dependen del navegador, del ciclo de sesión y de las actualizaciones de caché existentes; no hay un plazo fijo único para todo el almacenamiento.",
              )}</p>
            </section>
            <section>
              <h3>{tr(language, "This informational notice", "Este aviso informativo")}</h3>
              <p>{tr(language,
                "Understood stores only a recognition marker (aunara-storage-notice-v1) on your device so this version of the notice does not appear again. It is not acceptance of terms or authorization to process health data. If storage is blocked, you can close the notice for this visit, but it may reappear later.",
                "Entendido guarda solo una marca de reconocimiento (aunara-storage-notice-v1) en tu dispositivo para que esta versión del aviso no vuelva a aparecer. No es aceptación de términos ni autorización para tratar datos de salud. Si el almacenamiento está bloqueado, podés cerrar el aviso durante esta visita, pero puede reaparecer después.",
              )}</p>
            </section>
            <section>
              <h3>{tr(language, "Browser controls and limitations", "Controles del navegador y limitaciones")}</h3>
              <p>{tr(language,
                "You can inspect and remove cookies, local storage and cached resources using your browser's site-data settings. Removing them may lose local preferences or app data, sign you out and limit offline use. This window does not delete data or offer optional tracking switches. Describing technical storage does not mean all personal-data processing is exempt from authorization; this notice does not certify the absence of cookies in providers or infrastructure.",
                "Podés consultar y eliminar cookies, almacenamiento local y recursos en caché desde los ajustes de datos del sitio de tu navegador. Eliminarlos puede hacerte perder preferencias o datos locales de la app, cerrar tu sesión y limitar el uso sin conexión. Esta ventana no borra datos ni ofrece interruptores de rastreo opcional. Describir almacenamiento técnico no significa que todo tratamiento de datos personales esté exento de autorización; este aviso no certifica ausencia de cookies en proveedores o infraestructura.",
              )}</p>
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
