import {
  Apple,
  Bot,
  Check,
  Cloud,
  CloudOff,
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
import { type FormEvent, useEffect, useRef, useState } from "react";
import type { InstallGuide } from "../lib/install";
import { tr } from "../lib/i18n";
import type { HealthDataConsentStatus, LanguageCode } from "../types";
import type { LegalDocument } from "./LegalPanel";

export interface CloudAccessState {
  configured: boolean;
  email: string | null;
  status: "local" | "syncing" | "synced" | "error";
  message?: string;
  authErrorKind?: "credentials" | "user_not_found" | "invalid_password";
  pendingVerification?: PendingVerification | null;
  existingAccountEmail?: string | null;
  passwordRecoveryState?: "requested" | "ready" | null;
  healthDataConsent?: HealthDataConsentStatus | null;
  syncDisabled?: boolean;
  isBootstrapped?: boolean;
  onboardingCompleted?: boolean;
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
  name?: string;
  email: string;
}

export type PasswordSignInInput = Pick<CreateAccountInput, "email" | "password">;
export type AccessMode = "create" | "sign-in" | "help";

interface AccessPanelProps {
  language?: LanguageCode;
  cloud: CloudAccessState;
  profileName: string;
  installGuide: InstallGuide;
  onCreateAccount: (input: CreateAccountInput) => void;
  onVerifyAccount?: (input: VerifyAccountInput) => void;
  onResendVerification?: (email: string) => void;
  onUseExistingAccount?: () => void;
  onClearPendingVerification?: () => void;
  onClearAuthError?: () => void;
  onRequestPasswordReset?: (email: string) => void;
  onUpdatePassword?: (password: string) => void;
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
  onResumeSync?: () => void;
  onDeleteAccount?: () => void;
  dataSummary?: { profile: boolean; routes: number; favorites: number; checkIns: number; health: boolean };
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
  onResendVerification,
  onUseExistingAccount,
  onClearPendingVerification,
  onClearAuthError,
  onRequestPasswordReset,
  onUpdatePassword,
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
  onResumeSync,
  onDeleteAccount,
  dataSummary,
}: AccessPanelProps) {
  const [mode, setMode] = useState<AccessMode>(initialMode);
  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);
  const [name, setName] = useState(() => {
    const normalizedProfileName = profileName.trim().toLocaleLowerCase();
    return normalizedProfileName === "my profile" || normalizedProfileName === "mi perfil"
      ? ""
      : profileName;
  });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [acceptedLegal, setAcceptedLegal] = useState(false);
  const [healthDataConsent, setHealthDataConsent] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteSubmitted, setDeleteSubmitted] = useState(false);
  const deletionTrigger = useRef<HTMLButtonElement>(null);
  const deletionPanel = useRef<HTMLDivElement>(null);
  const [emailInvalid, setEmailInvalid] = useState(false);
  const emailInput = useRef<HTMLInputElement>(null);
  const conflictRecovery = useRef<HTMLButtonElement>(null);

  function validatedEmail(candidate = email): string | null {
    const value = candidate.trim();
    // Aunara accepts public domains; this is not a claim about all RFC addresses.
    const valid = /^[^\s@]+@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,63}$/i.test(value);
    setEmailInvalid(!valid);
    if (!valid) (emailInput.current ?? conflictRecovery.current)?.focus();
    return valid ? value : null;
  }

  function changeMode(nextMode: AccessMode) {
    if (nextMode === "create") {
      onClearPendingVerification?.();
    }
    if (nextMode === mode && (!cloud.pendingVerification || nextMode !== "create")) return;
    setMode(nextMode);
    setEmailInvalid(false);
    onClearAuthError?.();
  }

  function requestRecovery(candidate = email) {
    if (cloud.status === "syncing") return;
    const value = validatedEmail(candidate);
    if (value) onRequestPasswordReset?.(value);
  }

  const recoveryMessage = tr(language,
    "Recovery request processed. This does not confirm that an email was sent or delivered. If you receive the instructions, check your inbox and spam folder. If they do not arrive, you can try again later.",
    "Solicitud de recuperación procesada. Esto no confirma que el correo se haya enviado o entregado. Si recibís las instrucciones, revisá tu bandeja de entrada y spam. Si no llegan, podés intentar nuevamente más tarde.");
  const accessMessage = cloud.message ?? (cloud.passwordRecoveryState === "requested" && cloud.status === "local" ? recoveryMessage : undefined);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !deleteOpen) onClose();
    };
    document.body.classList.add("modal-open");
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.classList.remove("modal-open");
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [onClose, deleteOpen]);

  function closeDeletion() {
    if (deleteSubmitted || cloud.status === "syncing") return;
    setDeleteOpen(false);
    setDeleteConfirmation("");
    deletionTrigger.current?.focus();
  }
  useEffect(() => { setDeleteConfirmation(""); }, [language, deleteOpen]);
  useEffect(() => {
    // The existing handler retains the account on error. Release the local
    // double-submit latch so the person can cancel or explicitly retry.
    if (cloud.status === "error") setDeleteSubmitted(false);
  }, [cloud.status]);
  useEffect(() => {
    if (!deleteOpen) return;
    deletionPanel.current?.querySelector<HTMLButtonElement>("button")?.focus();
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); event.stopImmediatePropagation(); closeDeletion(); }
      if (event.key !== "Tab") return;
      const controls = deletionPanel.current?.querySelectorAll<HTMLElement>("button:not(:disabled), input");
      if (!controls?.length) return;
      const first = controls[0]; const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    window.addEventListener("keydown", handleKey, true);
    return () => window.removeEventListener("keydown", handleKey, true);
  }, [deleteOpen, deleteSubmitted, cloud.status]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedName = name.trim();
    const normalizedEmail = validatedEmail();
    if (!normalizedEmail || password.length < 8 || cloud.status === "syncing") return;
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

  function useExistingAccount() {
    if (!cloud.existingAccountEmail) return;
    setEmail(cloud.existingAccountEmail);
    setPassword("");
    setPasswordConfirmation("");
    setMode("sign-in");
    onUseExistingAccount?.();
  }

  function submitNewPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (password.length < 8 || password !== passwordConfirmation) return;
    onUpdatePassword?.(password);
  }

  return (
    <div className="access-backdrop" role="presentation" onMouseDown={onClose}>
      <aside
        className="access-panel"
        role="dialog"
        aria-modal="true"
        aria-label={mode === "help" ? tr(language, "Help and installation", "Ayuda e instalación") : tr(language, "Access Aunara anywhere", "Accedé a Aunara desde cualquier lugar")}
        onMouseDown={(event) => event.stopPropagation()}
      >
        {mode === "help" ? (
          <>
            <div className="access-heading">
              <div className="access-mark"><Download size={25} /></div>
              <div>
                <p className="eyebrow">{tr(language, "Help & Installation", "Ayuda e instalación")}</p>
                <h2>{tr(language, "One app. Both phones.", "Una app para ambos teléfonos.")}</h2>
              </div>
              <button className="close-button inline" type="button" onClick={onClose} aria-label={tr(language, "Close", "Cerrar")}><X size={20} /></button>
            </div>
            <section className="access-section" aria-labelledby="install-title">
              {installGuide === "installed" && (
                <div className="install-ready"><Check size={18} /> {tr(language, "Installed on this device", "Instalada en este dispositivo")}</div>
              )}
              {onInstall && installGuide !== "installed" && (
                <button className="install-action" type="button" onClick={onInstall}><Download size={17} /> {tr(language, "Install Aunara now", "Instalar Aunara ahora")}</button>
              )}
              <div className="install-guides">
                <article>
                  <div className="install-device-badge"><Apple size={18} /></div>
                  <div><strong>iPhone</strong><p>{tr(language, "Open Aunara in Safari, tap the Share button (square with arrow), then select “Add to Home Screen”.", "Abrí Aunara en Safari, tocá el botón Compartir (cuadrado con flecha) y elegí “Agregar a pantalla de inicio”.")}</p></div>
                </article>
                <article>
                  <div className="install-device-badge"><Bot size={18} /></div>
                  <div><strong>Android</strong><p>{tr(language, "Open Aunara in Chrome, tap the menu (three dots) and select “Add to Home screen” or “Install app”.", "Abrí Aunara en Chrome, tocá el menú (tres puntos) y elegí “Agregar a pantalla principal” o “Instalar aplicación”.")}</p></div>
                </article>
              </div>
              {installGuide === "desktop" && <p>{tr(language, "On desktop, look for an install icon in the browser address bar.", "En computadoras, buscá el ícono de instalación en la barra de direcciones del navegador.")}</p>}
            </section>
          </>
        ) : (
          <>
        <div className="access-heading">
          <div className={`access-mark ${cloud.healthDataConsent === "granted" && !cloud.syncDisabled ? "is-synced" : "is-disconnected"}`}>
            {cloud.healthDataConsent === "granted" && !cloud.syncDisabled ? <Cloud size={25} /> : <CloudOff size={25} />}
          </div>
          <div>
            <p className="eyebrow">{tr(language, "Private account / any device", "Cuenta privada / cualquier dispositivo")}</p>
            <h2>{tr(language, "Use Aunara anywhere", "Usá Aunara donde querás")}</h2>
          </div>
          <button className="close-button inline" type="button" onClick={onClose} aria-label={tr(language, "Close access panel", "Cerrar acceso")}><X size={20} /></button>
        </div>

        <section className="access-section" aria-labelledby="cloud-access-title">
          <p className="section-kicker">{tr(language, "Cloud account", "Cuenta en la nube")}</p>
          <h3 id="cloud-access-title">{tr(language, "Your data follows your sign-in.", "Tus datos viajan con tu cuenta.")}</h3>
          {!cloud.configured ? (
            <div className="access-status is-local">
              <Cloud size={19} />
              <div><strong>{tr(language, "Cloud setup is being prepared.", "Estamos preparando la conexión en la nube.")}</strong><span>{tr(language, "Your current data remains safely on this device.", "Tus datos actuales permanecen seguros en este dispositivo.")}</span></div>
            </div>
          ) : cloud.passwordRecoveryState === "ready" ? (
            <form className="access-login password-recovery" onSubmit={submitNewPassword}>
              <div className="verification-account">
                <span>{tr(language, "Password recovery for", "Recuperación de contraseña para")}</span>
                <strong>{cloud.email ?? cloud.existingAccountEmail}</strong>
              </div>
              <p>{tr(
                language,
                "Create a new password for your Aunara account.",
                "Creá una contraseña nueva para tu cuenta de Aunara.",
              )}</p>
              <label>
                <span>{tr(language, "New password", "Nueva contraseña")}</span>
                <span className="password-input">
                  <LockKeyhole size={17} />
                  <input
                    type={passwordVisible ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    minLength={8}
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setPasswordVisible((current) => !current)}
                    aria-label={passwordVisible ? tr(language, "Hide password", "Ocultar contraseña") : tr(language, "Show password", "Mostrar contraseña")}
                  >
                    {passwordVisible ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </span>
              </label>
              <label>
                <span>{tr(language, "Confirm new password", "Confirmá la contraseña nueva")}</span>
                <span>
                  <LockKeyhole size={17} />
                  <input
                    type={passwordVisible ? "text" : "password"}
                    value={passwordConfirmation}
                    onChange={(event) => setPasswordConfirmation(event.target.value)}
                    minLength={8}
                    autoComplete="new-password"
                    required
                  />
                </span>
              </label>
              <button
                type="submit"
                disabled={cloud.status === "syncing" || password.length < 8 || password !== passwordConfirmation}
              >
                {tr(language, "Save new password", "Guardar nueva contraseña")}
              </button>
              {cloud.message && <small className={`access-message is-${cloud.status}`}>{cloud.message}</small>}
            </form>
          ) : cloud.email ? (
            <div className={`access-account is-${cloud.status}`}>
              <div>
                <span>{tr(language, "Signed in as", "Sesión iniciada como")}</span>
                <strong>{cloud.email}</strong>
                <small>{cloud.message ?? statusLabel(language, cloud.status)}</small>
              </div>
              <button type="button" onClick={onSignOut}><LogOut size={15} /> {tr(language, "Sign out", "Cerrar sesión")}</button>
            </div>
          ) : cloud.existingAccountEmail ? (
            <div className="account-conflict" role="alert">
              <div className="verification-account">
                <span>{tr(language, "Account already registered", "Cuenta ya registrada")}</span>
                <strong>{cloud.existingAccountEmail}</strong>
              </div>
              <h4>{tr(
                language,
                "This email is already registered. Would you like to recover your password?",
                "Este correo ya está registrado. ¿Querés recuperar tu contraseña?",
              )}</h4>
              <div className="account-conflict-actions">
                <button type="button" onClick={useExistingAccount} disabled={cloud.status === "syncing"}>
                  {tr(language, "Sign in here", "Iniciar sesión aquí")}
                </button>
                <button
                  type="button"
                  ref={conflictRecovery}
                  aria-describedby={emailInvalid ? "access-email-error" : undefined}
                  onClick={() => requestRecovery(cloud.existingAccountEmail!)}
                  disabled={cloud.status === "syncing"}
                >
                  {tr(language, "Recover password", "Recuperar contraseña")}
                </button>
              </div>
              {emailInvalid && <small id="access-email-error" className="access-message is-error" role="alert">{tr(language, "Enter a complete public email address, such as you@example.com, without spaces.", "Ingresá un correo público completo, como vos@example.com, sin espacios.")}</small>}
              {accessMessage && <small className={`access-message is-${cloud.status}`} role="status">{accessMessage}</small>}
            </div>
          ) : (mode === "create" && cloud.pendingVerification) ? (
            <div className="access-login account-verification">
              <div className="verification-account">
                <span>{tr(language, "Account created for", "Cuenta creada para")}</span>
                {cloud.pendingVerification.name && <strong>{cloud.pendingVerification.name}</strong>}
                <small>{cloud.pendingVerification.email}</small>
              </div>
              <p>{tr(
                language,
                "Open the confirmation link in your email to confirm your account and return to Aunara.",
                "Abrí el enlace de confirmación del correo para confirmar tu cuenta y volver a Aunara.",
              )}</p>
              <button
                className="verification-resend"
                type="button"
                onClick={() => onResendVerification?.(cloud.pendingVerification!.email)}
                disabled={cloud.status === "syncing"}
              >
                {tr(language, "Resend confirmation email", "Reenviar correo de confirmación")}
              </button>
              <div className="verification-actions">
                <button
                  className="verification-action-primary"
                  type="button"
                  onClick={() => {
                    const verifiedEmail = cloud.pendingVerification?.email ?? "";
                    onClearPendingVerification?.();
                    if (verifiedEmail) setEmail(verifiedEmail);
                    changeMode("sign-in");
                  }}
                >
                  {tr(language, "Already confirmed your email? Sign in here", "¿Ya confirmaste tu correo? Ingresá acá")}
                </button>
                <button
                  className="verification-action-secondary"
                  type="button"
                  onClick={() => {
                    onClearPendingVerification?.();
                    setEmail("");
                    changeMode("create");
                  }}
                >
                  {tr(language, "Register with a different email", "Registrarme con otro correo")}
                </button>
              </div>
              {cloud.message && <small className={`access-message is-${cloud.status}`}>{cloud.message}</small>}
            </div>
          ) : (
            <form className="access-login" onSubmit={submit}>
              <div className="access-mode" role="group" aria-label={tr(language, "Account access choice", "Opciones de acceso")}>
                <button className={mode === "create" ? "is-active" : ""} type="button" onClick={() => changeMode("create")}>{tr(language, "Create account", "Crear cuenta")}</button>
                <button className={mode === "sign-in" ? "is-active" : ""} type="button" onClick={() => changeMode("sign-in")}>{tr(language, "I already have an account", "Ya tengo una cuenta")}</button>
              </div>
              {mode === "create" && (
                <label>
                  <span>{tr(language, "Name", "Nombre")}</span>
                  <span><UserRound size={17} /><input type="text" value={name} onChange={(event) => setName(event.target.value)} placeholder={tr(language, "Your name", "Tu nombre")} autoComplete="name" required /></span>
                </label>
              )}
              <label>
                <span>{tr(language, "Email address", "Correo electrónico")}</span>
                <span><Mail size={17} /><input ref={emailInput} type="text" inputMode="email" value={email} onChange={(event) => { setEmail(event.target.value.toLowerCase().trim()); setEmailInvalid(false); }} onInvalid={(event) => { event.preventDefault(); setEmailInvalid(true); emailInput.current?.focus(); }} autoCapitalize="none" autoCorrect="off" spellCheck={false} placeholder="you@example.com" autoComplete="email" required aria-invalid={emailInvalid} aria-describedby={emailInvalid ? "access-email-error" : undefined} /></span>
              </label>
              {emailInvalid && <small id="access-email-error" className="access-message is-error" role="alert">{tr(language, "Enter a complete public email address, such as you@example.com, without spaces.", "Ingresá un correo público completo, como vos@example.com, sin espacios.")}</small>}
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
                    <button type="button" onClick={() => onOpenLegal?.("privacy")}>{tr(language, "Privacy policy", "Política de privacidad")}</button>
                  </label>
                  <label className="optional-health-consent">
                    <input
                      type="checkbox"
                      checked={healthDataConsent}
                      onChange={(event) => setHealthDataConsent(event.target.checked)}
                      aria-label={tr(
                        language,
                        "I authorize Aunara to use sensitive health data for personalization",
                        "Autorizo a Aunara a usar datos sensibles de salud para personalizar mi experiencia",
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
              {mode === "sign-in" && <button className="verification-resend" type="button" onClick={() => requestRecovery()} disabled={cloud.status === "syncing"}>{tr(language, "Recover password", "Recuperar contraseña")}</button>}
              {mode === "sign-in" && cloud.status === "error" && cloud.authErrorKind === "user_not_found" ? (
                <small className="access-message is-error" role="alert">
                  {tr(language, "No account was found with this email. You can check the address or ", "No encontramos una cuenta con este correo. Podés revisar si está bien escrito o ")}
                  <button className="auth-recovery-action" type="button" onClick={() => changeMode("create")}>{tr(language, "create your account", "creá tu cuenta")}</button>
                </small>
              ) : mode === "sign-in" && cloud.status === "error" && cloud.authErrorKind === "invalid_password" ? (
                <small className="access-message is-error" role="alert">
                  {tr(language, "The password entered is incorrect. Try again or ", "La contraseña ingresada no es correcta. Intentá de nuevo o ")}
                  <button className="auth-recovery-action" type="button" onClick={() => requestRecovery()}>{tr(language, "recover your password", "recuperá tu contraseña")}</button>
                </small>
              ) : mode === "sign-in" && cloud.status === "error" && cloud.authErrorKind === "credentials" ? (
                <small className="access-message is-error" role="alert">
                  {tr(language, "Your email or password do not match the registered details. Try again or ", "Tu correo o contraseña no coinciden con los datos registrados. Intentá de nuevo o ")}
                  <button className="auth-recovery-action" type="button" onClick={() => requestRecovery()}>{tr(language, "recover your password", "recuperá tu contraseña")}</button>
                </small>
              ) : accessMessage && <small className={`access-message is-${cloud.status}`} role="status">{accessMessage}</small>}
              <small>{mode === "create" ? tr(language, "This account will include your profile, health context, tracks, routines, favorites, and weekly check-ins.", "Esta cuenta incluirá tu perfil, contexto de salud, rutas, rutinas, favoritos y registros semanales.") : tr(language, "Use the email and password from your Aunara account.", "Usá el correo y la contraseña de tu cuenta de Aunara.")}</small>
            </form>
          )}
        </section>

        {cloud.email && (
          <section className="access-section privacy-center" aria-labelledby="privacy-center-title">
            <p className="section-kicker">{tr(language, "Privacy center", "Centro de privacidad")}</p>
            <h3 id="privacy-center-title">{tr(language, "Your data. Your decisions.", "Tus datos. Tus decisiones.")}</h3>
            <div className="privacy-summary" aria-label={tr(language, "Stored data summary", "Resumen de datos guardados")}>
              <strong>{tr(language, "Stored in your own context", "Guardado en tu propio contexto")}</strong>
              <ul>
                {dataSummary?.profile && <li>{tr(language, "Profile and preferences", "Perfil y preferencias")}</li>}
                {Boolean(dataSummary?.routes) && <li>{tr(language, "Routes and prescriptions", "Rutas y prescripciones")}: {dataSummary?.routes}</li>}
                {Boolean(dataSummary?.favorites) && <li>{tr(language, "Favorites", "Favoritos")}: {dataSummary?.favorites}</li>}
                {Boolean(dataSummary?.checkIns) && <li>{tr(language, "Weekly check-ins", "Registros semanales")}: {dataSummary?.checkIns}</li>}
                {dataSummary?.health && cloud.healthDataConsent === "granted" && <li>{tr(language, "Authorized health context", "Contexto de salud autorizado")}</li>}
              </ul>
              <p>{cloud.syncDisabled ? tr(language, "Cloud sync is disabled on this device", "Sincronización en la nube desactivada en este dispositivo") : statusLabel(language, cloud.status)}. {tr(language, "This device stores your working copy; configured account synchronization can store it in the cloud.", "Este dispositivo guarda tu copia de trabajo; la sincronización de la cuenta configurada puede guardarla en la nube.")}</p>
              <p>{cloud.healthDataConsent === "granted" ? tr(language, "Health authorization: granted", "Autorización de salud: otorgada") : tr(language, "Health authorization: not granted", "Autorización de salud: no otorgada")}</p>
            </div>
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
              {cloud.syncDisabled ? (
                <button type="button" onClick={onResumeSync}><Cloud size={16} /> {tr(language, "Resume cloud sync", "Reanudar sincronización")}</button>
              ) : (
                <button className="is-danger" type="button" onClick={onDeleteData}><Trash2 size={16} /> {tr(language, "Delete my stored data", "Eliminar mis datos guardados")}</button>
              )}
            </div>
            <button ref={deletionTrigger} className="account-deletion-trigger" type="button" onClick={() => { setDeleteSubmitted(false); setDeleteOpen(true); }}>{tr(language, "Delete account permanently", "Eliminar cuenta permanentemente")}</button>
            {deleteOpen && <div className="account-deletion-backdrop">
            <div className="account-deletion" ref={deletionPanel} role="dialog" aria-modal="true" aria-label={tr(language, "Delete account permanently", "Eliminar cuenta permanentemente")}>
              <h3>{tr(language, "Delete account permanently", "Eliminar cuenta permanentemente")}</h3>
              <button type="button" onClick={closeDeletion} disabled={deleteSubmitted || cloud.status === "syncing"}>{tr(language, "Cancel", "Cancelar")}</button>
              <p>{tr(
                language,
                "This removes the account and its Aunara data. Type DELETE to confirm.",
                "Esto elimina la cuenta y sus datos de Aunara. Escribí ELIMINAR para confirmar.",
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
                disabled={deleteConfirmation !== tr(language, "DELETE", "ELIMINAR") || deleteSubmitted || cloud.status === "syncing"}
                onClick={() => {
                  if (deleteConfirmation !== tr(language, "DELETE", "ELIMINAR") || deleteSubmitted || cloud.status === "syncing") return;
                  setDeleteSubmitted(true);
                  onDeleteAccount?.();
                }}
              >
                <Trash2 size={16} /> {tr(language, "Delete my account permanently", "Eliminar mi cuenta permanentemente")}
              </button>
            </div></div>}
          </section>
        )}

        <p className="access-privacy">{tr(language, "Health information stays private to the signed-in account. Aunara never uses the public exercise library to expose personal data.", "Tu información de salud permanece privada en tu cuenta. Aunara nunca usa la biblioteca pública de ejercicios para exponer datos personales.")}</p>
        <div className="access-legal-links">
          <button type="button" onClick={() => onOpenLegal?.("privacy")}>{tr(language, "Privacy policy", "Política de privacidad")}</button>
          <button type="button" onClick={() => onOpenLegal?.("terms")}>{tr(language, "Terms of use", "Términos de uso")}</button>
        </div>
        </>
        )}
      </aside>
    </div>
  );
}
