import {
  Apple,
  Bot,
  Check,
  Cloud,
  Download,
  Eye,
  EyeOff,
  FileDown,
  LockKeyhole,
  LogOut,
  Mail,
  Pencil,
  ShieldX,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";
import type { InstallGuide } from "../lib/install";
import { tr } from "../lib/i18n";
import type { HealthDataConsentStatus, LanguageCode } from "../types";
import type { LegalDocument } from "./LegalPanel";

export interface CloudAccessState {
  configured: boolean;
  email: string | null;
  status: "local" | "syncing" | "synced" | "error";
  message?: string;
  pendingVerification?: PendingVerification | null;
  healthDataConsent?: HealthDataConsentStatus | null;
}

export interface CreateAccountInput {
  name: string;
  email: string;
  password: string;
  acceptedLegal: boolean;
  healthDataConsent: boolean;
}

export interface VerifyAccountInput {
  email: string;
  token: string;
}

export interface PendingVerification {
  name: string;
  email: string;
}

export type PasswordSignInInput = Pick<CreateAccountInput, "email" | "password">;
export type AccessMode = "create" | "sign-in";

interface AccessPanelProps {
  language?: LanguageCode;
  cloud: CloudAccessState;
  profileName: string;
  installGuide: InstallGuide;
  onCreateAccount: (input: CreateAccountInput) => void;
  onVerifyAccount?: (input: VerifyAccountInput) => void;
  onResendVerification?: (email: string) => void;
  onSignIn: (input: PasswordSignInInput) => void;
  onSignOut: () => void;
  onInstall: (() => void) | null;
  onClose: () => void;
  initialMode?: AccessMode;
  onOpenLegal?: (document: LegalDocument) => void;
  onExportData?: () => void;
  onEditData?: () => void;
  onChangeHealthConsent?: (status: HealthDataConsentStatus) => void;
  onDeleteData?: () => void;
  onDeleteAccount?: () => void;
}

const STATUS_LABELS: Record<CloudAccessState["status"], string> = {
  local: "Saved on this device",
  syncing: "Saving changes…",
  synced: "Saved across devices",
  error: "Sync needs attention",
};

function statusLabel(language: LanguageCode, status: CloudAccessState["status"]): string {
  if (language === "en") return STATUS_LABELS[status];
  return {
    local: "Guardado en este dispositivo",
    syncing: "Guardando cambios…",
    synced: "Guardado en todos tus dispositivos",
    error: "La sincronización necesita atención",
  }[status];
}

export function AccessPanel({
  language = "en",
  cloud,
  profileName,
  installGuide,
  onCreateAccount,
  onVerifyAccount,
  onResendVerification,
  onSignIn,
  onSignOut,
  onInstall,
  onClose,
  initialMode = "create",
  onOpenLegal,
  onExportData,
  onEditData,
  onChangeHealthConsent,
  onDeleteData,
  onDeleteAccount,
}: AccessPanelProps) {
  const [mode, setMode] = useState<AccessMode>(initialMode);
  const [name, setName] = useState(() => {
    const normalizedProfileName = profileName.trim().toLocaleLowerCase();
    return normalizedProfileName === "my profile" || normalizedProfileName === "mi perfil"
      ? ""
      : profileName;
  });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [acceptedLegal, setAcceptedLegal] = useState(false);
  const [healthDataConsent, setHealthDataConsent] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");

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

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedName = name.trim();
    const normalizedEmail = email.trim();
    if (!normalizedEmail || !password) return;
    if (mode === "create") {
      if (!normalizedName || !acceptedLegal) return;
      onCreateAccount({
        name: normalizedName,
        email: normalizedEmail,
        password,
        acceptedLegal,
        healthDataConsent,
      });
      return;
    }
    onSignIn({ email: normalizedEmail, password });
  }

  function verifyAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const token = verificationCode.trim();
    if (!cloud.pendingVerification || !/^\d{6}$/.test(token)) return;
    onVerifyAccount?.({
      email: cloud.pendingVerification.email,
      token,
    });
  }

  return (
    <div className="access-backdrop" role="presentation" onMouseDown={onClose}>
      <aside
        className="access-panel"
        role="dialog"
        aria-modal="true"
        aria-label={tr(language, "Access Repbook anywhere", "Accedé a Repbook desde cualquier lugar")}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="access-heading">
          <div className="access-mark"><Cloud size={25} /></div>
          <div>
            <p className="eyebrow">{tr(language, "Private account / any device", "Cuenta privada / cualquier dispositivo")}</p>
            <h2>{tr(language, "Use Repbook anywhere", "Usá Repbook donde querás")}</h2>
          </div>
          <button className="close-button inline" type="button" onClick={onClose} aria-label={tr(language, "Close access panel", "Cerrar acceso")}><X size={20} /></button>
        </div>

        <section className="access-section" aria-labelledby="cloud-access-title">
          <p className="section-kicker">{tr(language, "01 / Cloud account", "01 / Cuenta en la nube")}</p>
          <h3 id="cloud-access-title">{tr(language, "Your data follows your sign-in.", "Tus datos viajan con tu cuenta.")}</h3>
          {!cloud.configured ? (
            <div className="access-status is-local">
              <Cloud size={19} />
              <div><strong>{tr(language, "Cloud setup is being prepared.", "Estamos preparando la conexión en la nube.")}</strong><span>{tr(language, "Your current data remains safely on this device.", "Tus datos actuales permanecen seguros en este dispositivo.")}</span></div>
            </div>
          ) : cloud.email ? (
            <div className={`access-account is-${cloud.status}`}>
              <div>
                <span>{tr(language, "Signed in as", "Sesión iniciada como")}</span>
                <strong>{cloud.email}</strong>
                <small>{cloud.message ?? statusLabel(language, cloud.status)}</small>
              </div>
              <button type="button" onClick={onSignOut}><LogOut size={15} /> {tr(language, "Sign out", "Cerrar sesión")}</button>
            </div>
          ) : cloud.pendingVerification ? (
            <form className="access-login account-verification" onSubmit={verifyAccount}>
              <div className="verification-account">
                <span>{tr(language, "Account created for", "Cuenta creada para")}</span>
                <strong>{cloud.pendingVerification.name}</strong>
                <small>{cloud.pendingVerification.email}</small>
              </div>
              <p>{tr(
                language,
                "Open the confirmation link in your email. This account will activate automatically. If your email includes a six-digit code, you can enter it below.",
                "Abrí el enlace de confirmación que te enviamos al correo. La cuenta se activará automáticamente. Si tu correo incluye un código de seis dígitos, también podés ingresarlo abajo.",
              )}</p>
              <label>
                <span>{tr(language, "Confirmation code", "Código de confirmación")}</span>
                <span>
                  <Mail size={17} />
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(event) => setVerificationCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    pattern="\d{6}"
                    maxLength={6}
                    aria-label={tr(language, "Six-digit confirmation code", "Código de confirmación de seis dígitos")}
                    placeholder="000000"
                    required
                  />
                </span>
              </label>
              <button type="submit" disabled={cloud.status === "syncing" || verificationCode.length !== 6}>{tr(language, "Confirm account", "Confirmar cuenta")}</button>
              <button
                className="verification-resend"
                type="button"
                onClick={() => onResendVerification?.(cloud.pendingVerification!.email)}
                disabled={cloud.status === "syncing"}
              >
                {tr(language, "Resend confirmation email", "Reenviar correo de confirmación")}
              </button>
              {cloud.message && <small className={`access-message is-${cloud.status}`}>{cloud.message}</small>}
            </form>
          ) : (
            <form className="access-login" onSubmit={submit}>
              <div className="access-mode" role="group" aria-label={tr(language, "Account access choice", "Opciones de acceso")}>
                <button className={mode === "create" ? "is-active" : ""} type="button" onClick={() => setMode("create")}>{tr(language, "Create account", "Crear cuenta")}</button>
                <button className={mode === "sign-in" ? "is-active" : ""} type="button" onClick={() => setMode("sign-in")}>{tr(language, "I already have an account", "Ya tengo una cuenta")}</button>
              </div>
              {mode === "create" && (
                <label>
                  <span>{tr(language, "Name", "Nombre")}</span>
                  <span><UserRound size={17} /><input type="text" value={name} onChange={(event) => setName(event.target.value)} placeholder={tr(language, "Your name", "Tu nombre")} autoComplete="name" required /></span>
                </label>
              )}
              <label>
                <span>{tr(language, "Email address", "Correo electrónico")}</span>
                <span><Mail size={17} /><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" autoComplete="email" required /></span>
              </label>
              <label>
                <span>{tr(language, "Password", "Contraseña")}</span>
                <span className="password-input">
                  <LockKeyhole size={17} />
                  <input type={passwordVisible ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} minLength={8} autoComplete={mode === "create" ? "new-password" : "current-password"} required />
                  <button
                    type="button"
                    onClick={() => setPasswordVisible((current) => !current)}
                    aria-label={passwordVisible ? tr(language, "Hide password", "Ocultar contraseña") : tr(language, "Show password", "Mostrar contraseña")}
                  >
                    {passwordVisible ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </span>
              </label>
              {mode === "create" && (
                <div className="legal-consents">
                  <label>
                    <input
                      type="checkbox"
                      checked={acceptedLegal}
                      onChange={(event) => setAcceptedLegal(event.target.checked)}
                      aria-label={tr(
                        language,
                        "I accept the Terms of use and confirm I read the Privacy policy",
                        "Acepto los Términos de uso y confirmo que leí la Política de privacidad",
                      )}
                      required
                    />
                    <span>{tr(language, "I accept the", "Acepto los")}</span>
                    <button type="button" onClick={() => onOpenLegal?.("terms")}>{tr(language, "Terms of use", "Términos de uso")}</button>
                    <span>{tr(language, "and confirm I read the", "y confirmo que leí la")}</span>
                    <button type="button" onClick={() => onOpenLegal?.("privacy")}>{tr(language, "Privacy policy", "Política de privacidad")}</button>.
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={healthDataConsent}
                      onChange={(event) => setHealthDataConsent(event.target.checked)}
                      aria-label={tr(
                        language,
                        "I authorize Repbook to use sensitive health data for personalization",
                        "Autorizo a Repbook a usar datos sensibles de salud para personalizar mi experiencia",
                      )}
                    />
                    <span>{tr(
                      language,
                      "Optional: I authorize sensitive health data for personalized routines, recovery and nutrition references.",
                      "Opcional: autorizo datos sensibles de salud para personalizar rutinas, recuperación y referencias nutricionales.",
                    )}</span>
                  </label>
                  <small>{tr(
                    language,
                    "You can create an account without health authorization and use a basic route.",
                    "Podés crear la cuenta sin autorizar datos de salud y usar una ruta básica.",
                  )}</small>
                </div>
              )}
              <button type="submit" disabled={cloud.status === "syncing" || (mode === "create" && !acceptedLegal)}>{mode === "create" ? tr(language, "Create my account", "Crear mi cuenta") : tr(language, "Sign in", "Ingresar")}</button>
              {cloud.message && <small className={`access-message is-${cloud.status}`}>{cloud.message}</small>}
              <small>{mode === "create" ? tr(language, "This account will include your profile, health context, tracks, routines, favorites, and weekly check-ins.", "Esta cuenta incluirá tu perfil, contexto de salud, rutas, rutinas, favoritos y registros semanales.") : tr(language, "Use the email and password from your Repbook account.", "Usá el correo y la contraseña de tu cuenta de Repbook.")}</small>
            </form>
          )}
        </section>

        {cloud.email && (
          <section className="access-section privacy-center" aria-labelledby="privacy-center-title">
            <p className="section-kicker">{tr(language, "02 / Privacy center", "02 / Centro de privacidad")}</p>
            <h3 id="privacy-center-title">{tr(language, "Your data. Your decisions.", "Tus datos. Tus decisiones.")}</h3>
            <p>{tr(
              language,
              "Export or correct your information, change sensitive-data authorization, or remove stored data.",
              "Exportá o corregí tu información, cambiá la autorización de datos sensibles o eliminá los datos guardados.",
            )}</p>
            <div className="privacy-actions">
              <button type="button" onClick={onExportData}><FileDown size={16} /> {tr(language, "Export my data", "Exportar mis datos")}</button>
              <button type="button" onClick={onEditData}><Pencil size={16} /> {tr(language, "Correct my data", "Corregir mis datos")}</button>
              {cloud.healthDataConsent === "granted" ? (
                <button type="button" onClick={() => onChangeHealthConsent?.("revoked")}><ShieldX size={16} /> {tr(language, "Revoke health-data consent", "Revocar autorización de datos de salud")}</button>
              ) : (
                <button type="button" onClick={() => onChangeHealthConsent?.("granted")}><Check size={16} /> {tr(language, "Authorize health-data use", "Autorizar uso de datos de salud")}</button>
              )}
              <button className="is-danger" type="button" onClick={onDeleteData}><Trash2 size={16} /> {tr(language, "Delete my stored data", "Eliminar mis datos guardados")}</button>
            </div>
            <div className="account-deletion">
              <strong>{tr(language, "Delete account permanently", "Eliminar cuenta permanentemente")}</strong>
              <p>{tr(
                language,
                "This removes the account and its Repbook data. Type DELETE to confirm.",
                "Esto elimina la cuenta y sus datos de Repbook. Escribí ELIMINAR para confirmar.",
              )}</p>
              <input
                type="text"
                value={deleteConfirmation}
                onChange={(event) => setDeleteConfirmation(event.target.value)}
                aria-label={tr(language, "Type DELETE to confirm", "Escribí ELIMINAR para confirmar")}
              />
              <button
                className="is-danger"
                type="button"
                disabled={deleteConfirmation !== tr(language, "DELETE", "ELIMINAR")}
                onClick={onDeleteAccount}
              >
                <Trash2 size={16} /> {tr(language, "Delete my account permanently", "Eliminar mi cuenta permanentemente")}
              </button>
            </div>
          </section>
        )}

        <section className="access-section" aria-labelledby="install-title">
          <p className="section-kicker">{tr(language, cloud.email ? "03 / Install" : "02 / Install", cloud.email ? "03 / Instalación" : "02 / Instalación")}</p>
          <h3 id="install-title">{tr(language, "One app. Both phones.", "Una app para ambos teléfonos.")}</h3>
          {installGuide === "installed" && (
            <div className="install-ready"><Check size={18} /> {tr(language, "Installed on this device", "Instalada en este dispositivo")}</div>
          )}
          {onInstall && installGuide !== "installed" && (
            <button className="install-action" type="button" onClick={onInstall}><Download size={17} /> {tr(language, "Install Repbook now", "Instalar Repbook ahora")}</button>
          )}
          <div className="install-guides">
            <article className={installGuide === "android" ? "is-current" : ""}>
              <Bot size={20} />
              <div><strong>Android</strong><p>{tr(language, "Open Repbook in Chrome, tap the menu, then choose “Install app” or “Add to Home screen”.", "Abrí Repbook en Chrome, tocá el menú y elegí “Instalar aplicación” o “Agregar a pantalla principal”.")}</p></div>
            </article>
            <article className={installGuide === "ios" ? "is-current" : ""}>
              <Apple size={20} />
              <div><strong>iPhone</strong><p>{tr(language, "Open Repbook in Safari, tap Share, then choose “Add to Home Screen”.", "Abrí Repbook en Safari, tocá Compartir y elegí “Agregar a pantalla de inicio”.")}</p></div>
            </article>
          </div>
        </section>

        <p className="access-privacy">{tr(language, "Health information stays private to the signed-in account. Repbook never uses the public exercise library to expose personal data.", "Tu información de salud permanece privada en tu cuenta. Repbook nunca usa la biblioteca pública de ejercicios para exponer datos personales.")}</p>
        <div className="access-legal-links">
          <button type="button" onClick={() => onOpenLegal?.("privacy")}>{tr(language, "Privacy policy", "Política de privacidad")}</button>
          <button type="button" onClick={() => onOpenLegal?.("terms")}>{tr(language, "Terms of use", "Términos de uso")}</button>
        </div>
        <button className="profile-done" type="button" onClick={onClose}>{tr(language, "Done", "Listo")}</button>
      </aside>
    </div>
  );
}
