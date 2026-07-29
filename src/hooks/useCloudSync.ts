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
import { LEGAL_VERSION } from "../lib/privacy";
import { cloudConfigured, supabaseClient } from "../lib/supabaseClient";
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

    client.auth.getSession().then(({ data }) => {
      if (active) setUser(data.session?.user ?? null);
    });
    const { data: listener } = client.auth.onAuthStateChange((_event, session) => {
      if (active) setUser(session?.user ?? null);
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
        emailRedirectTo: window.location.origin,
      },
    });
    if (error) {
      setStatus("error");
      setMessage(error.message);
      return;
    }
    if (data.session) {
      setPendingVerification(null);
      setStatus("syncing");
      setMessage(tr(language, "Account created. Saving all your Repbook data…", "Cuenta creada. Estamos guardando tus datos de Repbook…"));
      return;
    }
    setPendingVerification({ name, email });
    setStatus("local");
    setMessage(tr(
      language,
      "Account created. Open the confirmation email to activate it.",
      "Cuenta creada. Abrí el correo de confirmación para activarla.",
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
    setMessage(tr(language, "Account confirmed. Saving your Repbook data…", "Cuenta confirmada. Estamos guardando tus datos de Repbook…"));
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
      options: { emailRedirectTo: window.location.origin },
    });
    if (error) {
      setStatus("error");
      setMessage(error.message);
      return;
    }
    setStatus("local");
    setMessage(tr(
      language,
      "We sent you a new confirmation email.",
      "Te enviamos un nuevo correo de confirmación.",
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
    setMessage(tr(language, "Signed in. Loading your Repbook data…", "Sesión iniciada. Estamos cargando tus datos de Repbook…"));
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
    onSignedOutRef.current?.();
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
      setMessage(tr(language, "Your stored Repbook data was deleted. The account remains active.", "Tus datos guardados de Repbook fueron eliminados. La cuenta sigue activa."));
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
    onSignedOutRef.current?.();
    setStatus("local");
    setMessage(tr(language, "The account and its Repbook data were deleted.", "La cuenta y sus datos de Repbook fueron eliminados."));
  }, [client, user]);

  return {
    configured: cloudConfigured,
    email: user?.email ?? null,
    status,
    message,
    pendingVerification,
    healthDataConsent: consentStatusFromUser(user),
    createAccount,
    verifyAccount,
    resendVerification,
    signIn,
    signOut,
    recordHealthConsent,
    deleteStoredData,
    deleteAccount,
  };
}
