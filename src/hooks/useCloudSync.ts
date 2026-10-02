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
  normalizeRepbookSnapshot,
  selectBootstrapSnapshot,
  type RepbookCloudSnapshot,
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
  requestPasswordReset: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  signIn: (input: PasswordSignInInput) => Promise<void>;
  signOut: () => Promise<void>;
  recordHealthConsent: (status: HealthDataConsentStatus, source?: "privacy-center" | "migration-gate") => Promise<void>;
  deleteStoredData: () => Promise<void>;
  deleteAccount: () => Promise<void>;
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

export function useCloudSync({
  snapshot,
  onRemoteSnapshot,
  onSignedOut,
  client = supabaseClient,
}: UseCloudSyncOptions): CloudSyncController {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<CloudAccessState["status"]>("local");
  const [message, setMessage] = useState<string>();
  const [pendingVerification, setPendingVerification] = useState<PendingVerification | null>(null);
  const [existingAccountEmail, setExistingAccountEmail] = useState<string | null>(null);
  const [passwordRecoveryState, setPasswordRecoveryState] = useState<"requested" | "ready" | null>(null);
  const recoveryUserId = useRef<string | null>(null);
  const latestSnapshot = useRef(snapshot);
  const onRemoteSnapshotRef = useRef(onRemoteSnapshot);
  const onSignedOutRef = useRef(onSignedOut);
  const bootstrappedUserId = useRef<string | null>(null);
  const lastSavedSnapshot = useRef("");
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
        const local = latestSnapshot.current;
        const remote = remoteValue
          ? normalizeRepbookSnapshot(remoteValue, local)
          : null;
        const bootstrap = selectBootstrapSnapshot(local, remote);

        lastSavedSnapshot.current = JSON.stringify(bootstrap.snapshot);
        if (bootstrap.action === "use-remote") {
          onRemoteSnapshotRef.current(bootstrap.snapshot);
        } else {
          await store.save(user.id, bootstrap.snapshot);
        }
        if (!active) return;
        bootstrappedUserId.current = user.id;
        setStatus("synced");
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

    const serialized = JSON.stringify(snapshot);
    if (serialized === lastSavedSnapshot.current) return;

    setStatus("syncing");
    const timer = window.setTimeout(() => {
      const store = createCloudStore(client as unknown as CloudStoreClient);
      store.save(user.id, snapshot)
        .then(() => {
          lastSavedSnapshot.current = serialized;
          setStatus("synced");
          setMessage(undefined);
        })
        .catch((error: unknown) => {
          setStatus("error");
          setMessage(error instanceof Error ? error.message : "Cloud sync is unavailable.");
        });
    }, 800);

    return () => window.clearTimeout(timer);
  }, [client, snapshot, user]);

  const createAccount = useCallback(async ({
    name,
    email,
    password,
    acceptedLegal,
    healthDataConsent,
  }: CreateAccountInput) => {
    const language = latestSnapshot.current.language;
    if (!client) {
      setStatus("error");
      setMessage(tr(language, "Cloud setup is not connected yet.", "La conexión en la nube todavía no está disponible."));
      return;
    }
    if (!acceptedLegal) {
      setStatus("error");
      setMessage(tr(language, "Accept the Terms of use and Privacy policy to create the account.", "Aceptá los Términos de uso y la Política de privacidad para crear la cuenta."));
      return;
    }
    setStatus("syncing");
    setMessage(undefined);
    const acceptedAt = new Date().toISOString();
    const healthConsentStatus = healthDataConsent ? "granted" : "declined";
    const { data, error } = await client.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: name,
          language,
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
      setStatus("error");
      setMessage(error.message);
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
  }, [client]);

  const verifyAccount = useCallback(async ({ email, token }: VerifyAccountInput) => {
    const language = latestSnapshot.current.language;
    if (!client) {
      setStatus("error");
      setMessage(tr(language, "Cloud setup is not connected yet.", "La conexión en la nube todavía no está disponible."));
      return;
    }
    setStatus("syncing");
    setMessage(undefined);
    const { data, error } = await client.auth.verifyOtp({
      email,
      token,
      type: "signup",
    });
    if (error) {
      setStatus("error");
      setMessage(error.message);
      return;
    }
    setPendingVerification(null);
    setUser(data.user ?? data.session?.user ?? null);
    setStatus("syncing");
    setMessage(tr(language, "Account confirmed. Saving your Aunara data…", "Cuenta confirmada. Estamos guardando tus datos de Aunara…"));
  }, [client]);

  const resendVerification = useCallback(async (email: string) => {
    const language = latestSnapshot.current.language;
    if (!client) {
      setStatus("error");
      setMessage(tr(language, "Cloud setup is not connected yet.", "La conexión en la nube todavía no está disponible."));
      return;
    }
    setStatus("syncing");
    setMessage(undefined);
    const { error } = await client.auth.resend({
      type: "signup",
      email,
      options: { emailRedirectTo: publicBaseUrl(import.meta.env.BASE_URL, window.location.origin) },
    });
    if (error) {
      setStatus("error");
      setMessage(error.message);
      return;
    }
    setStatus("local");
    setMessage(tr(
      language,
      "If the account is pending confirmation, a new email was requested. If it is already active, sign in instead.",
      "Si la cuenta está pendiente de confirmación, solicitamos un nuevo correo. Si ya está activa, ingresá directamente.",
    ));
  }, [client]);

  const clearExistingAccount = useCallback(() => {
    setExistingAccountEmail(null);
    setMessage(undefined);
  }, []);

  const requestPasswordReset = useCallback(async (email: string) => {
    const language = latestSnapshot.current.language;
    if (!client) {
      setStatus("error");
      setMessage(tr(language, "Cloud setup is not connected yet.", "La conexión en la nube todavía no está disponible."));
      return;
    }
    setStatus("syncing");
    setMessage(undefined);
    const { error } = await client.auth.resetPasswordForEmail(email, {
      redirectTo: publicBaseUrl(import.meta.env.BASE_URL, window.location.origin),
    });
    if (error) {
      setStatus("error");
      setMessage(error.message);
      return;
    }
    setExistingAccountEmail(email);
    setPasswordRecoveryState("requested");
    setStatus("local");
    setMessage(tr(
      language,
      "We sent you an email to recover your password.",
      "Te enviamos un correo para recuperar tu contraseña.",
    ));
  }, [client]);

  const updatePassword = useCallback(async (password: string) => {
    const language = latestSnapshot.current.language;
    if (!client) return;
    setStatus("syncing");
    setMessage(undefined);
    const { error } = await client.auth.updateUser({ password });
    if (error) {
      setStatus("error");
      setMessage(error.message);
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
  }, [client]);

  const signIn = useCallback(async ({ email, password }: PasswordSignInInput) => {
    const language = latestSnapshot.current.language;
    if (!client) {
      setStatus("error");
      setMessage(tr(language, "Cloud setup is not connected yet.", "La conexión en la nube todavía no está disponible."));
      return;
    }
    setStatus("syncing");
    setMessage(undefined);
    const { error } = await client.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setStatus("error");
      setMessage(error.message);
      return;
    }
    setExistingAccountEmail(null);
    setPasswordRecoveryState(null);
    setMessage(tr(language, "Signed in. Loading your Aunara data…", "Sesión iniciada. Estamos cargando tus datos de Aunara…"));
    recoveryUserId.current = null;
    passwordRecoverySignalFor(client).clear();
  }, [client]);

  const signOut = useCallback(async () => {
    if (!client) return;
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
  }, [client]);

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
      onSignedOutRef.current?.();
      lastSavedSnapshot.current = "";
      setStatus("synced");
      setMessage(tr(language, "Your stored Aunara data was deleted. The account remains active.", "Tus datos guardados de Aunara fueron eliminados. La cuenta sigue activa."));
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : tr(language, "Stored data could not be deleted.", "No se pudieron eliminar los datos guardados."));
    }
  }, [client, user]);

  const deleteAccount = useCallback(async () => {
    const language = latestSnapshot.current.language;
    if (!client || !user) return;
    setStatus("syncing");
    setMessage(undefined);
    const { error } = await client.functions.invoke("delete-my-account");
    if (error) {
      setStatus("error");
      setMessage(error.message);
      return;
    }
    await client.auth.signOut();
    setUser(null);
    setPendingVerification(null);
    setExistingAccountEmail(null);
    setPasswordRecoveryState(null);
    onSignedOutRef.current?.();
    setStatus("local");
    setMessage(tr(language, "The account and its Aunara data were deleted.", "La cuenta y sus datos de Aunara fueron eliminados."));
  }, [client, user]);

  return {
    configured: cloudConfigured,
    email: user?.email ?? null,
    status,
    message,
    pendingVerification,
    existingAccountEmail,
    passwordRecoveryState,
    healthDataConsent: consentStatusFromUser(user),
    createAccount,
    verifyAccount,
    resendVerification,
    clearExistingAccount,
    requestPasswordReset,
    updatePassword,
    signIn,
    signOut,
    recordHealthConsent,
    deleteStoredData,
    deleteAccount,
  };
}
