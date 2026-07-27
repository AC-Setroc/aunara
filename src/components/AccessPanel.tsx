import {
  Apple,
  Bot,
  Check,
  Cloud,
  Download,
  LockKeyhole,
  LogOut,
  Mail,
  UserRound,
  X,
} from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";
import type { InstallGuide } from "../lib/install";

export interface CloudAccessState {
  configured: boolean;
  email: string | null;
  status: "local" | "syncing" | "synced" | "error";
  message?: string;
}

export interface CreateAccountInput {
  name: string;
  email: string;
  password: string;
}

export type PasswordSignInInput = Omit<CreateAccountInput, "name">;
export type AccessMode = "create" | "sign-in";

interface AccessPanelProps {
  cloud: CloudAccessState;
  profileName: string;
  installGuide: InstallGuide;
  onCreateAccount: (input: CreateAccountInput) => void;
  onSignIn: (input: PasswordSignInInput) => void;
  onSignOut: () => void;
  onInstall: (() => void) | null;
  onClose: () => void;
  initialMode?: AccessMode;
}

const STATUS_LABELS: Record<CloudAccessState["status"], string> = {
  local: "Saved on this device",
  syncing: "Saving changes…",
  synced: "Saved across devices",
  error: "Sync needs attention",
};

export function AccessPanel({
  cloud,
  profileName,
  installGuide,
  onCreateAccount,
  onSignIn,
  onSignOut,
  onInstall,
  onClose,
  initialMode = "create",
}: AccessPanelProps) {
  const [mode, setMode] = useState<AccessMode>(initialMode);
  const [name, setName] = useState(profileName);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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
      if (!normalizedName) return;
      onCreateAccount({
        name: normalizedName,
        email: normalizedEmail,
        password,
      });
      return;
    }
    onSignIn({ email: normalizedEmail, password });
  }

  return (
    <div className="access-backdrop" role="presentation" onMouseDown={onClose}>
      <aside
        className="access-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Access Repbook anywhere"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="access-heading">
          <div className="access-mark"><Cloud size={25} /></div>
          <div>
            <p className="eyebrow">Private account / any device</p>
            <h2>Use Repbook anywhere</h2>
          </div>
          <button className="close-button inline" type="button" onClick={onClose} aria-label="Close access panel"><X size={20} /></button>
        </div>

        <section className="access-section" aria-labelledby="cloud-access-title">
          <p className="section-kicker">01 / Cloud account</p>
          <h3 id="cloud-access-title">Your data follows your sign-in.</h3>
          {!cloud.configured ? (
            <div className="access-status is-local">
              <Cloud size={19} />
              <div><strong>Cloud setup is being prepared.</strong><span>Your current data remains safely on this device.</span></div>
            </div>
          ) : cloud.email ? (
            <div className={`access-account is-${cloud.status}`}>
              <div>
                <span>Signed in as</span>
                <strong>{cloud.email}</strong>
                <small>{cloud.message ?? STATUS_LABELS[cloud.status]}</small>
              </div>
              <button type="button" onClick={onSignOut}><LogOut size={15} /> Sign out</button>
            </div>
          ) : (
            <form className="access-login" onSubmit={submit}>
              <div className="access-mode" aria-label="Account access choice">
                <button className={mode === "create" ? "is-active" : ""} type="button" onClick={() => setMode("create")}>Create account</button>
                <button className={mode === "sign-in" ? "is-active" : ""} type="button" onClick={() => setMode("sign-in")}>I already have an account</button>
              </div>
              {mode === "create" && (
                <label>
                  <span>Name</span>
                  <span><UserRound size={17} /><input type="text" value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" required /></span>
                </label>
              )}
              <label>
                <span>Email address</span>
                <span><Mail size={17} /><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" autoComplete="email" required /></span>
              </label>
              <label>
                <span>Password</span>
                <span><LockKeyhole size={17} /><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={8} autoComplete={mode === "create" ? "new-password" : "current-password"} required /></span>
              </label>
              <button type="submit" disabled={cloud.status === "syncing"}>{mode === "create" ? "Create my account" : "Sign in"}</button>
              {cloud.message && <small className={`access-message is-${cloud.status}`}>{cloud.message}</small>}
              <small>{mode === "create" ? "This account will include your profile, health context, tracks, routines, favorites, and weekly check-ins." : "Use the email and password from your Repbook account."}</small>
            </form>
          )}
        </section>

        <section className="access-section" aria-labelledby="install-title">
          <p className="section-kicker">02 / Install</p>
          <h3 id="install-title">One app. Both phones.</h3>
          {installGuide === "installed" && (
            <div className="install-ready"><Check size={18} /> Installed on this device</div>
          )}
          {onInstall && installGuide !== "installed" && (
            <button className="install-action" type="button" onClick={onInstall}><Download size={17} /> Install Repbook now</button>
          )}
          <div className="install-guides">
            <article className={installGuide === "android" ? "is-current" : ""}>
              <Bot size={20} />
              <div><strong>Android</strong><p>Open Repbook in Chrome, tap the menu, then choose “Install app” or “Add to Home screen”.</p></div>
            </article>
            <article className={installGuide === "ios" ? "is-current" : ""}>
              <Apple size={20} />
              <div><strong>iPhone</strong><p>Open Repbook in Safari, tap Share, then choose “Add to Home Screen”.</p></div>
            </article>
          </div>
        </section>

        <p className="access-privacy">Health information stays private to the signed-in account. Repbook never uses the public exercise library to expose personal data.</p>
        <button className="profile-done" type="button" onClick={onClose}>Done</button>
      </aside>
    </div>
  );
}
