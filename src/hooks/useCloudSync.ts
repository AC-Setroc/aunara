import type { User } from "@supabase/supabase-js";
import { useCallback, useEffect, useRef, useState } from "react";
import type {
  CloudAccessState,
  CreateAccountInput,
  PendingVerification,
  PasswordSignInInput,
  VerifyAccountInput,
} from "../components/AccessPanel";
import {
  createEmptyUserSnapshot,
  normalizeRepbookSnapshot,
  outboundSnapshot,
  reconcileRemoteSnapshot,
  selectBootstrapSnapshot,
  snapshotsEqual,
  type RepbookCloudSnapshot,
  type SensitiveDataPolicy,
} from "../lib/cloudSnapshot";
import { createCloudStore, type CloudStoreClient } from "../lib/cloudStore";
import { tr } from "../lib/i18n";
import { publicBaseUrl } from "../lib/publicBase";
import { LEGAL_VERSION } from "../lib/privacy";
import { cloudConfigured, passwordRecoverySignalFor, supabaseClient } from "../lib/supabaseClient";
import type { HealthDataConsentStatus } from "../types";

interface UseCloudSyncOptions {
  snapshot: RepbookCloudSnapshot;
  onRemoteSnapshot: (snapshot: RepbookCloudSnapshot) => void;
  onSignedOut?: () => void;
  client?: typeof supabaseClient;
}

interface CloudSyncController extends CloudAccessState {
  createAccount: (input: CreateAccountInput) => Promise<void>;
  verifyAccount: (input: VerifyAccountInput) => Promise<void>;
  resendVerification: (email: string) => Promise<void>;
  clearExistingAccount: () => void;
  clearPendingVerification: () => void;
  clearAuthError: () => void;
  requestPasswordReset: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  signIn: (input: PasswordSignInInput) => Promise<void>;
  signOut: () => Promise<void>;
  recordHealthConsent: (status: HealthDataConsentStatus, source?: "privacy-center" | "migration-gate") => Promise<void>;
  deleteStoredData: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  resumeSync: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
}

function isOnboardingCompleted(user: User | null): boolean {
  return user?.user_metadata?.onboarding_completed === true;
}

function createEventId(): string {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (character) => {
    const random = Math.floor(Math.random() * 16);
    const value = character === "x" ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}

function consentStatusFromUser(user: User | null): HealthDataConsentStatus | null {
  const value = user?.user_metadata?.health_data_consent;
  return value === "granted" || value === "declined" || value === "revoked"
    ? value
    : null;
}

function sensitiveDataPolicy(user: User | null): SensitiveDataPolicy {
  // SDD-011 H-02: sensitive health data leaves the device only while the authorization is "granted";
  // "declined", "revoked" and an unanswered (null) authorization all withhold it.
  return { consentGranted: consentStatusFromUser(user) === "granted" };
}

type AuthFailure = "credentials" | "confirmation" | "email" | "password" | "rate" | "expired" | "unavailable" | "legal" | "unknown";

function classifyAuthError(error: { code?: string; status?: number; name?: string }): AuthFailure {
  switch (error.code) {
    case "invalid_credentials": return "credentials";
    case "email_not_confirmed": return "confirmation";
    case "email_address_invalid": return "email";
    case "weak_password": case "same_password": return "password";
    case "over_request_rate_limit": case "over_email_send_rate_limit": return "rate";
    case "otp_expired": case "otp_disabled": return "expired";
    default:
      if (error.status === 429) return "rate";
      if (error.name === "AuthRetryableFetchError" || (error.status ?? 0) >= 500) return "unavailable";
      return "unknown";
  }
}

function authErrorCopy(language: RepbookCloudSnapshot["language"], failure: AuthFailure): string {
  const copy: Record<AuthFailure, [string, string]> = {
    credentials: ["Your email or password do not match the registered details. Try again or recover your password", "Tu correo o contraseña no coinciden con los datos registrados. Intentá de nuevo o recuperá tu contraseña"],
    confirmation: ["Confirm your email before signing in.", "Confirmá tu correo antes de ingresar."],
    email: ["Check your email address and try again.", "Revisá tu correo electrónico y volvé a intentar."],
    password: ["Choose a different password with at least eight characters.", "Elegí una contraseña diferente de al menos ocho caracteres."],
    rate: ["Too many attempts. Wait a moment before trying again.", "Hubo demasiados intentos. Esperá un momento antes de volver a intentar."],
    expired: ["The confirmation code is invalid or expired. Request a new one.", "El código de confirmación no es válido o venció. Solicitá uno nuevo."],
    unavailable: ["Account access is temporarily unavailable. Try again later.", "El acceso a la cuenta no está disponible por ahora. Intentá más tarde."],
    legal: ["Accept the Terms of use and Privacy policy to create the account.", "Aceptá los Términos de uso y la Política de privacidad para crear la cuenta."],
    unknown: ["We could not complete this account action. Try again.", "No pudimos completar esta acción de la cuenta. Volvé a intentar."],
  };
  return tr(language, ...copy[failure]);
}

function passwordRecoveryCopy(language: RepbookCloudSnapshot["language"]): string {
  return tr(language,
    "Recovery request processed. This does not confirm that an email was sent or delivered. If you receive the instructions, check your inbox and spam folder. If they do not arrive, you can try again later.",
    "Solicitud de recuperación procesada. Esto no confirma que el correo se haya enviado o entregado. Si recibís las instrucciones, revisá tu bandeja de entrada y spam. Si no llegan, podés intentar nuevamente más tarde.");
}

export function useCloudSync({
  snapshot,
  onRemoteSnapshot,
  onSignedOut,
  client = supabaseClient,
}: UseCloudSyncOptions): CloudSyncController {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatusValue] = useState<CloudAccessState["status"]>("local");
  const [message, setMessageValue] = useState<string>();
  const [recoveryFeedback, setRecoveryFeedback] = useState(false);
  const [authFailure, setAuthFailure] = useState<AuthFailure | null>(null);
  const authFailureRef = useRef<AuthFailure | null>(null);
  const [authErrorKind, setAuthErrorKind] = useState<CloudAccessState["authErrorKind"]>();
  const [syncDisabled, setSyncDisabled] = useState(() =>
    typeof localStorage !== "undefined" && localStorage.getItem("aunara-sync-disabled") === "true"
  );
  const statusRef = useRef(status);
  const authGeneration = useRef(0);
  const pendingAuth = useRef<object | null>(null);
  const resetPending = useRef(false);

  const updateSyncDisabled = useCallback((disabled: boolean) => {
    try {
      if (disabled) {
        localStorage.setItem("aunara-sync-disabled", "true");
      } else {
        localStorage.removeItem("aunara-sync-disabled");
      }
    } catch {
      // Ignore
    }
    setSyncDisabled(disabled);
  }, []);
  // General status/message writes retain their existing behavior and provenance.
  const setStatus = useCallback((value: CloudAccessState["status"]) => {
    pendingAuth.current = null;
    statusRef.current = value;
    setStatusValue(value);
  }, []);
  const setMessage = useCallback((value: string | undefined, isRecoveryFeedback = false) => {
    authFailureRef.current = null;
    setAuthFailure(null);
    setAuthErrorKind(undefined);
    setMessageValue(value);
    setRecoveryFeedback(isRecoveryFeedback);
  }, []);
  const beginAuth = useCallback(() => {
    const operation = { generation: authGeneration.current, previousStatus: statusRef.current };
    setStatus("syncing");
    setMessage(undefined);
    pendingAuth.current = operation;
    return operation;
  }, [setStatus, setMessage]);
  const failAuth = useCallback((operation: ReturnType<typeof beginAuth>, failure: AuthFailure, authErrorKindOverride?: CloudAccessState["authErrorKind"]) => {
    if (operation.generation !== authGeneration.current) {
      // Release only this operation's pending state; never overwrite a newer sync/action.
      if (pendingAuth.current === operation) setStatus(operation.previousStatus === "syncing" ? "local" : operation.previousStatus);
      return;
    }
    if (pendingAuth.current !== operation) return;
    setStatus("error");
    setMessage(undefined);
    authFailureRef.current = failure;
    setAuthFailure(failure);
    setAuthErrorKind(authErrorKindOverride);
  }, [setStatus, setMessage]);
  const clearAuthError = useCallback(() => {
    authGeneration.current += 1;
    if (authFailureRef.current) {
      setMessage(undefined);
      if (statusRef.current === "error") setStatus("local");
    }
  }, [setStatus, setMessage]);
  const PENDING_VERIFICATION_KEY = "aunara-pending-verification";
  const [pendingVerification, setPendingVerificationState] = useState<PendingVerification | null>(() => {
    try {
      const stored = localStorage.getItem(PENDING_VERIFICATION_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const setPendingVerification = useCallback((value: PendingVerification | null) => {
    setPendingVerificationState(value);
    try {
      if (value) {
        localStorage.setItem(PENDING_VERIFICATION_KEY, JSON.stringify(value));
      } else {
        localStorage.removeItem(PENDING_VERIFICATION_KEY);
      }
    } catch {
      // Ignore storage errors
    }
  }, []);
  const [existingAccountEmail, setExistingAccountEmail] = useState<string | null>(null);
  const [passwordRecoveryState, setPasswordRecoveryState] = useState<"requested" | "ready" | null>(null);
  const recoveryUserId = useRef<string | null>(null);
  const latestSnapshot = useRef(snapshot);
  const onRemoteSnapshotRef = useRef(onRemoteSnapshot);
  const onSignedOutRef = useRef(onSignedOut);
  const bootstrappedUserId = useRef<string | null>(null);
  const lastSavedSnapshot = useRef("");
  // True while the debounced save below owns the "syncing" status: set when it schedules a save, cleared when the
  // save settles or when the change is reverted before the timer fires (SDD-011 H-01).
  const debouncedSavePending = useRef(false);
  const recordedConsentIds = useRef(new Set<string>());

  latestSnapshot.current = snapshot;
  onRemoteSnapshotRef.current = onRemoteSnapshot;
  onSignedOutRef.current = onSignedOut;

  useEffect(() => {
    if (!client) return;
    let active = true;
    let authEventSeen = false;
    const recoverySignal = passwordRecoverySignalFor(client);
    const acceptRecovery = (nextUser: User | null) => {
      const identity = recoverySignal.consume(nextUser);
      if (!identity) return;
      recoveryUserId.current = identity.id;
      setExistingAccountEmail(identity.email ?? null);
      setPasswordRecoveryState("ready");
      setMessage(undefined);
    };

    client.auth.getSession().then(({ data, error }) => {
      // A slower bootstrap must not overwrite a newer verified auth event.
      if (!active || authEventSeen) return;
      if (error) recoverySignal.clear();
      const nextUser = data.session?.user ?? null;
      setUser(nextUser);
      acceptRecovery(nextUser);
    });
    const { data: listener } = client.auth.onAuthStateChange((event, session) => {
      if (!active) return;
      authEventSeen = true;
      const nextUser = session?.user ?? null;
      recoverySignal.observe(event, nextUser);
      setUser(nextUser);
      if (nextUser || event === "SIGNED_IN") {
        setPendingVerification(null);
        if (event === "SIGNED_IN") {
          updateSyncDisabled(false);
        }
      }
      if (event === "SIGNED_OUT" || (recoveryUserId.current && recoveryUserId.current !== nextUser?.id)) {
        recoveryUserId.current = null;
        setExistingAccountEmail(null);
        setPasswordRecoveryState(null);
      }
      acceptRecovery(nextUser);
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [client]);

  useEffect(() => {
    if (!client || !user) return;
    const metadata = user.user_metadata ?? {};
    const store = createCloudStore(client as unknown as CloudStoreClient);
    const events = [
      metadata.accepted_legal_event_id && {
        id: String(metadata.accepted_legal_event_id),
        userId: user.id,
        consentType: "legal" as const,
        action: "granted" as const,
        policyVersion: String(metadata.accepted_legal_version ?? LEGAL_VERSION),
        locale: String(metadata.language ?? latestSnapshot.current.language),
        source: "account" as const,
      },
      metadata.health_data_consent_event_id && {
        id: String(metadata.health_data_consent_event_id),
        userId: user.id,
        consentType: "health_data" as const,
        action: consentStatusFromUser(user) ?? "declined",
        policyVersion: String(metadata.health_data_consent_version ?? LEGAL_VERSION),
        locale: String(metadata.language ?? latestSnapshot.current.language),
        source: "account" as const,
      },
    ].filter(Boolean);

    for (const event of events) {
      if (!event || recordedConsentIds.current.has(event.id)) continue;
      recordedConsentIds.current.add(event.id);
      void store.recordConsent(event).catch(() => {
        recordedConsentIds.current.delete(event.id);
      });
    }
  }, [client, user]);

  useEffect(() => {
    if (!client || !user) {
      bootstrappedUserId.current = null;
      lastSavedSnapshot.current = "";
      setStatus("local");
      return;
    }

    let active = true;
    const store = createCloudStore(client as unknown as CloudStoreClient);
    setStatus("syncing");
    setMessage(undefined);

    store.load(user.id)
      .then(async (remoteValue) => {
        if (!active) return;
        const remoteHasData = Boolean(
          remoteValue && (
            (Array.isArray(remoteValue.tracks) && remoteValue.tracks.length > 0)
            || remoteValue.healthProfile?.onboardingCompleted === true
            || Boolean(remoteValue.healthProfile?.initialRoutineDecision)
          ),
        );

        const isFirstLogin = !remoteHasData && (
          (typeof localStorage !== "undefined" && localStorage.getItem("aunara-is-first-login") === "true")
          || user.user_metadata?.onboarding_completed === false
        );

        let local = latestSnapshot.current;
        if (isFirstLogin) {
          try {
            localStorage.removeItem("aunara-is-first-login");
          } catch {
            // Ignore
          }
          updateSyncDisabled(false);
          local = createEmptyUserSnapshot(latestSnapshot.current.language, user.user_metadata?.display_name ?? user.user_metadata?.name ?? latestSnapshot.current.profileName);
          local.healthProfile.onboardingCompleted = false;
        } else if (typeof localStorage !== "undefined") {
          try {
            localStorage.removeItem("aunara-is-first-login");
          } catch {
            // Ignore
          }
        }
        const policy = sensitiveDataPolicy(user);
        const remote = remoteValue && !isFirstLogin
          ? normalizeRepbookSnapshot(remoteValue, local)
          : null;
        const bootstrap = selectBootstrapSnapshot(local, remote && reconcileRemoteSnapshot(local, remote, policy));

        if (bootstrap.action === "use-remote" && remote) {
          onRemoteSnapshotRef.current(bootstrap.snapshot);
          const payload = outboundSnapshot(bootstrap.snapshot, policy);
          const serialized = JSON.stringify(payload);
          if (!snapshotsEqual(payload, remote)) await store.save(user.id, payload);
          lastSavedSnapshot.current = serialized;
        } else {
          onRemoteSnapshotRef.current(bootstrap.snapshot);
          const payload = outboundSnapshot(bootstrap.snapshot, policy);
          lastSavedSnapshot.current = JSON.stringify(payload);
          await store.save(user.id, payload);
        }
        if (!active) return;
        bootstrappedUserId.current = user.id;
        if (typeof localStorage !== "undefined" && localStorage.getItem("aunara-sync-disabled") === "true") {
          setStatus("local");
        } else {
          setStatus("synced");
        }
      })
      .catch((error: unknown) => {
        if (!active) return;
        setStatus("error");
        setMessage(error instanceof Error ? error.message : "Cloud sync is unavailable.");
      });

    return () => {
      active = false;
    };
  }, [client, user]);

  useEffect(() => {
    if (!client || !user || bootstrappedUserId.current !== user.id) return;
    if (typeof localStorage !== "undefined" && localStorage.getItem("aunara-sync-disabled") === "true") {
      setStatus("local");
      return;
    }

    const payload = outboundSnapshot(snapshot, sensitiveDataPolicy(user));
    const serialized = JSON.stringify(payload);
    if (serialized === lastSavedSnapshot.current) {
      // The snapshot went back to what is already saved before the pending save fired: nothing to upload, and the
      // "syncing" this effect announced must not outlive the change that caused it.
      if (debouncedSavePending.current) {
        debouncedSavePending.current = false;
        setStatus("synced");
      }
      return;
    }

    debouncedSavePending.current = true;
    setStatus("syncing");
    const timer = window.setTimeout(() => {
      const store = createCloudStore(client as unknown as CloudStoreClient);
      store.save(user.id, payload)
        .then(() => {
          lastSavedSnapshot.current = serialized;
          debouncedSavePending.current = false;
          setStatus("synced");
          setMessage(undefined);
        })
        .catch((error: unknown) => {
          debouncedSavePending.current = false;
          setStatus("error");
          setMessage(error instanceof Error ? error.message : "Cloud sync is unavailable.");
        });
    }, 800);

    return () => window.clearTimeout(timer);
  }, [client, snapshot, user, setStatus, setMessage]);

  useEffect(() => {
    const flushSave = () => {
      if (!client || !user || bootstrappedUserId.current !== user.id) return;
      if (typeof localStorage !== "undefined" && localStorage.getItem("aunara-sync-disabled") === "true") return;
      const payload = outboundSnapshot(latestSnapshot.current, sensitiveDataPolicy(user));
      const serialized = JSON.stringify(payload);
      if (serialized !== lastSavedSnapshot.current) {
        const store = createCloudStore(client as unknown as CloudStoreClient);
        store.save(user.id, payload)
          .then(() => {
            lastSavedSnapshot.current = serialized;
            debouncedSavePending.current = false;
          })
          .catch(() => {});
      }
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") flushSave();
    };
    window.addEventListener("pagehide", flushSave);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      window.removeEventListener("pagehide", flushSave);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [client, user]);

  const createAccount = useCallback(async ({
    name,
    email,
    password,
    acceptedLegal,
    healthDataConsent,
  }: CreateAccountInput) => {
    const language = latestSnapshot.current.language;
    if (!client) {
      failAuth(beginAuth(), "unavailable");
      return;
    }
    if (!acceptedLegal) {
      failAuth(beginAuth(), "legal");
      return;
    }
    try {
      localStorage.setItem("aunara-is-first-login", "true");
    } catch {
      // Ignore
    }
    updateSyncDisabled(false);
    onSignedOutRef.current?.();
    const operation = beginAuth();
    const acceptedAt = new Date().toISOString();
    const healthConsentStatus = healthDataConsent ? "granted" : "declined";
    const { data, error } = await client.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: name,
          language,
          onboarding_completed: false,
          accepted_legal_version: LEGAL_VERSION,
          accepted_legal_at: acceptedAt,
          accepted_legal_event_id: createEventId(),
          health_data_consent: healthConsentStatus,
          health_data_consent_version: LEGAL_VERSION,
          health_data_consent_at: acceptedAt,
          health_data_consent_event_id: createEventId(),
        },
        emailRedirectTo: publicBaseUrl(import.meta.env.BASE_URL, window.location.origin),
      },
    });
    if (error) {
      failAuth(operation, classifyAuthError(error));
      return;
    }
    if (data.session) {
      setPendingVerification(null);
      setExistingAccountEmail(null);
      setPasswordRecoveryState(null);
      setStatus("syncing");
      setMessage(tr(language, "Account created. Saving all your Aunara data…", "Cuenta creada. Estamos guardando tus datos de Aunara…"));
      return;
    }
    if (data.user?.identities?.length === 0) {
      setPendingVerification(null);
      setExistingAccountEmail(email);
      setPasswordRecoveryState(null);
      setStatus("local");
      setMessage(undefined);
      return;
    }
    setExistingAccountEmail(null);
    setPasswordRecoveryState(null);
    setPendingVerification({ name, email });
    setStatus("local");
    setMessage(tr(
      language,
      "Check your email to confirm the new account.",
      "Revisá tu correo para confirmar la cuenta nueva.",
    ));
  }, [client, beginAuth, failAuth, setStatus, setMessage]);

  const verifyAccount = useCallback(async ({ email, token }: VerifyAccountInput) => {
    const language = latestSnapshot.current.language;
    if (!client) {
      failAuth(beginAuth(), "unavailable");
      return;
    }
    const operation = beginAuth();
    const { data, error } = await client.auth.verifyOtp({
      email,
      token,
      type: "signup",
    });
    if (error) {
      failAuth(operation, classifyAuthError(error));
      return;
    }
    setPendingVerification(null);
    setUser(data.user ?? data.session?.user ?? null);
    setStatus("syncing");
    setMessage(tr(language, "Account confirmed. Saving your Aunara data…", "Cuenta confirmada. Estamos guardando tus datos de Aunara…"));
  }, [client, beginAuth, failAuth, setStatus, setMessage]);

  const resendVerification = useCallback(async (email: string) => {
    const language = latestSnapshot.current.language;
    if (!client) {
      failAuth(beginAuth(), "unavailable");
      return;
    }
    const operation = beginAuth();
    const { error } = await client.auth.resend({
      type: "signup",
      email,
      options: { emailRedirectTo: publicBaseUrl(import.meta.env.BASE_URL, window.location.origin) },
    });
    if (error) {
      failAuth(operation, classifyAuthError(error));
      return;
    }
    setStatus("local");
    setMessage(tr(
      language,
      "If the account is pending confirmation, a new email was requested. If it is already active, sign in instead.",
      "Si la cuenta está pendiente de confirmación, solicitamos un nuevo correo. Si ya está activa, ingresá directamente.",
    ));
  }, [client, beginAuth, failAuth, setStatus, setMessage]);

  const clearExistingAccount = useCallback(() => {
    setExistingAccountEmail(null);
    setMessage(undefined);
  }, []);

  const clearPendingVerification = useCallback(() => {
    setPendingVerification(null);
    setMessage(undefined);
  }, [setPendingVerification]);

  const requestPasswordReset = useCallback(async (email: string) => {
    const language = latestSnapshot.current.language;
    if (resetPending.current) return;
    if (!client) {
      failAuth(beginAuth(), "unavailable");
      return;
    }
    resetPending.current = true;
    const operation = beginAuth();
    let error;
    try {
      ({ error } = await client.auth.resetPasswordForEmail(email, {
        redirectTo: publicBaseUrl(import.meta.env.BASE_URL, window.location.origin),
      }));
    } catch {
      failAuth(operation, "unavailable");
      return;
    } finally {
      resetPending.current = false;
    }
    if (error) {
      failAuth(operation, classifyAuthError(error));
      return;
    }
    setPasswordRecoveryState("requested");
    setStatus("local");
    setMessage(passwordRecoveryCopy(language), true);
  }, [client, beginAuth, failAuth, setStatus, setMessage]);

  const updatePassword = useCallback(async (password: string) => {
    const language = latestSnapshot.current.language;
    if (!client) {
      failAuth(beginAuth(), "unavailable");
      return;
    }
    const operation = beginAuth();
    const { error } = await client.auth.updateUser({ password });
    if (error) {
      failAuth(operation, classifyAuthError(error));
      return;
    }
    setExistingAccountEmail(null);
    setPasswordRecoveryState(null);
    setStatus("synced");
    recoveryUserId.current = null;
    passwordRecoverySignalFor(client).clear();
    setMessage(tr(
      language,
      "Password updated. Your session is now active.",
      "Contraseña actualizada. Tu sesión ya está activa.",
    ));
  }, [client, beginAuth, failAuth, setStatus, setMessage]);

  const signIn = useCallback(async ({ email, password }: PasswordSignInInput) => {
    const language = latestSnapshot.current.language;
    if (!client) {
      failAuth(beginAuth(), "unavailable");
      return;
    }
    const operation = beginAuth();
    const { error } = await client.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      let kind: "credentials" | "user_not_found" | "invalid_password" = "credentials";
      const msg = (error.message || "").toLowerCase();
      if (error.code === "email_not_confirmed" || msg.includes("email not confirmed")) {
        setPendingVerification({ email });
      }
      if (error.code === "user_not_found" || msg.includes("user not found") || msg.includes("no user")) {
        kind = "user_not_found";
      } else if (error.code === "invalid_password" || msg.includes("wrong password")) {
        kind = "invalid_password";
      } else if (error.code === "invalid_credentials") {
        try {
          const probe = await client.auth.signInWithOtp({
            email,
            options: { shouldCreateUser: false },
          });
          if (probe.error?.code === "otp_disabled" || probe.error?.message?.toLowerCase().includes("signups not allowed")) {
            kind = "user_not_found";
            setPendingVerification(null);
          } else {
            kind = "invalid_password";
          }
        } catch {
          kind = "credentials";
        }
      } else {
        kind = "credentials";
      }
      failAuth(operation, classifyAuthError(error), kind);
      return;
    }
    setPendingVerification(null);
    setExistingAccountEmail(null);
    setPasswordRecoveryState(null);
    updateSyncDisabled(false);
    setMessage(tr(language, "Signed in. Loading your Aunara data…", "Sesión iniciada. Estamos cargando tus datos de Aunara…"));
    recoveryUserId.current = null;
    passwordRecoverySignalFor(client).clear();
  }, [client, beginAuth, failAuth, setStatus, setMessage, updateSyncDisabled]);

  const signOut = useCallback(async () => {
    if (!client) return;
    if (user && bootstrappedUserId.current === user.id) {
      try {
        const payload = outboundSnapshot(latestSnapshot.current, sensitiveDataPolicy(user));
        const serialized = JSON.stringify(payload);
        if (serialized !== lastSavedSnapshot.current) {
          const store = createCloudStore(client as unknown as CloudStoreClient);
          await store.save(user.id, payload);
          lastSavedSnapshot.current = serialized;
        }
      } catch {
        // Ignore save errors during sign out
      }
    }
    const { error } = await client.auth.signOut();
    if (error) {
      setStatus("error");
      setMessage(error.message);
      return;
    }
    setPendingVerification(null);
    setExistingAccountEmail(null);
    setPasswordRecoveryState(null);
    onSignedOutRef.current?.();
    recoveryUserId.current = null;
    passwordRecoverySignalFor(client).clear();
  }, [client, user]);

  const recordHealthConsent = useCallback(async (
    nextStatus: HealthDataConsentStatus,
    source: "privacy-center" | "migration-gate" = "privacy-center",
  ) => {
    const language = latestSnapshot.current.language;
    if (!client || !user) return;
    setStatus("syncing");
    setMessage(undefined);
    const eventId = createEventId();
    const store = createCloudStore(client as unknown as CloudStoreClient);
    try {
      await store.recordConsent({
        id: eventId,
        userId: user.id,
        consentType: "health_data",
        action: nextStatus,
        policyVersion: LEGAL_VERSION,
        locale: language,
        source,
      });
      const { data, error } = await client.auth.updateUser({
        data: {
          health_data_consent: nextStatus,
          health_data_consent_version: LEGAL_VERSION,
          health_data_consent_at: new Date().toISOString(),
          health_data_consent_event_id: eventId,
        },
      });
      if (error) throw error;
      setUser(data.user ?? {
        ...user,
        user_metadata: {
          ...user.user_metadata,
          health_data_consent: nextStatus,
          health_data_consent_version: LEGAL_VERSION,
          health_data_consent_event_id: eventId,
        },
      });
      if (nextStatus === "granted") {
        updateSyncDisabled(false);
      }
      setStatus("synced");
      setMessage(nextStatus === "granted"
        ? tr(language, "Health personalization authorized.", "Personalización con datos de salud autorizada.")
        : tr(language, "Health authorization removed.", "Autorización de datos de salud retirada."));
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : tr(language, "Consent could not be updated.", "No se pudo actualizar la autorización."));
    }
  }, [client, user]);

  const deleteStoredData = useCallback(async () => {
    const language = latestSnapshot.current.language;
    if (!client || !user) return;
    setStatus("syncing");
    setMessage(undefined);
    try {
      await createCloudStore(client as unknown as CloudStoreClient).remove(user.id);
      try {
        await client.auth.updateUser({
          data: { onboarding_completed: false },
        });
      } catch {
        // Ignore metadata update error
      }
      onSignedOutRef.current?.();
      lastSavedSnapshot.current = "";
      updateSyncDisabled(true);
      setStatus("local");
      setMessage(tr(language, "Your stored Aunara data was deleted. Cloud sync is disconnected.", "Tus datos guardados de Aunara fueron eliminados. La sincronización en la nube quedó desconectada."));
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : tr(language, "Stored data could not be deleted.", "No se pudieron eliminar los datos guardados."));
    }
  }, [client, user, updateSyncDisabled]);

  const resumeSync = useCallback(async () => {
    const language = latestSnapshot.current.language;
    if (!client || !user) return;
    updateSyncDisabled(false);
    setStatus("syncing");
    setMessage(undefined);
    try {
      const payload = outboundSnapshot(latestSnapshot.current, sensitiveDataPolicy(user));
      await createCloudStore(client as unknown as CloudStoreClient).save(user.id, payload);
      lastSavedSnapshot.current = JSON.stringify(payload);
      setStatus("synced");
      setMessage(tr(language, "Cloud synchronization resumed.", "Sincronización en la nube reanudada."));
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Cloud sync is unavailable.");
    }
  }, [client, user, updateSyncDisabled]);

  const deleteAccount = useCallback(async () => {
    const language = latestSnapshot.current.language;
    if (!client || !user) return;
    setStatus("syncing");
    setMessage(undefined);
    try {
      await createCloudStore(client as unknown as CloudStoreClient).remove(user.id);
    } catch {
      // Ignore if record already absent
    }
    try {
      await client.auth.updateUser({
        data: { onboarding_completed: false },
      });
    } catch {
      // Ignore
    }
    try {
      await client.functions.invoke("delete-my-account");
    } catch {
      // Edge function may fail if secrets are missing
    }
    await client.auth.signOut();
    setUser(null);
    setPendingVerification(null);
    setExistingAccountEmail(null);
    setPasswordRecoveryState(null);
    try {
      localStorage.removeItem("aunara-is-first-login");
    } catch {
      // Ignore
    }
    updateSyncDisabled(false);
    onSignedOutRef.current?.();
    setStatus("local");
    setMessage(tr(language, "The account and its Aunara data were deleted.", "La cuenta y sus datos de Aunara fueron eliminados."));
  }, [client, user, updateSyncDisabled]);

  const completeOnboarding = useCallback(async () => {
    if (!client || !user) return;
    try {
      localStorage.removeItem("aunara-is-first-login");
    } catch {
      // Ignore
    }
    updateSyncDisabled(false);
    try {
      const { data, error } = await client.auth.updateUser({
        data: {
          onboarding_completed: true,
          onboarding_completed_at: new Date().toISOString(),
        },
      });
      if (!error && data.user) {
        setUser(data.user);
      }
    } catch {
      // Ignore
    }
  }, [client, user, updateSyncDisabled]);

  return {
    configured: cloudConfigured,
    email: user?.email ?? null,
    status,
    message: authFailure ? authErrorCopy(snapshot.language, authFailure) : recoveryFeedback ? passwordRecoveryCopy(snapshot.language) : message,
    authErrorKind,
    pendingVerification,
    existingAccountEmail,
    passwordRecoveryState,
    healthDataConsent: consentStatusFromUser(user),
    syncDisabled,
    onboardingCompleted: isOnboardingCompleted(user),
    deleteStoredData,
    deleteAccount,
    resumeSync,
    completeOnboarding,
    createAccount,
    verifyAccount,
    resendVerification,
    clearExistingAccount,
    clearPendingVerification,
    clearAuthError,
    requestPasswordReset,
    updatePassword,
    signIn,
    signOut,
    recordHealthConsent,
  };
}
