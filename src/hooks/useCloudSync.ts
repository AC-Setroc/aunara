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
import { cloudConfigured, supabaseClient } from "../lib/supabaseClient";

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
  }: CreateAccountInput) => {
    const language = latestSnapshot.current.language;
    if (!client) {
      setStatus("error");
      setMessage(tr(language, "Cloud setup is not connected yet.", "La conexión en la nube todavía no está disponible."));
      return;
    }
    setStatus("syncing");
    setMessage(undefined);
    const { data, error } = await client.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: name, language },
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

  return {
    configured: cloudConfigured,
    email: user?.email ?? null,
    status,
    message,
    pendingVerification,
    createAccount,
    verifyAccount,
    resendVerification,
    signIn,
    signOut,
  };
}
