import { createClient } from "@supabase/supabase-js";

const projectUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();

export const cloudConfigured = Boolean(projectUrl && publishableKey);

export const supabaseClient = projectUrl && publishableKey
  ? createClient(projectUrl, publishableKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

type RecoveryIdentity = { id: string; email?: string };

// Retain only the verified event's identity, never a session or callback URL.
const recoverySignals = new WeakMap<NonNullable<typeof supabaseClient>, ReturnType<typeof createRecoverySignal>>();

function createRecoverySignal(client: NonNullable<typeof supabaseClient>) {
  let pending: RecoveryIdentity | null = null;
  let consumedUserId: string | null = null;
  const clear = () => { pending = null; consumedUserId = null; };
  const observe = (event: string, user: RecoveryIdentity | null) => {
    if (event === "SIGNED_OUT" || typeof user?.id !== "string" || !user.id.trim()) {
      clear();
      return;
    }
    if ((pending && pending.id !== user.id) || (consumedUserId && consumedUserId !== user.id)) clear();
    if (event === "PASSWORD_RECOVERY" && consumedUserId !== user.id) {
      pending = { id: user.id, ...(typeof user.email === "string" ? { email: user.email } : {}) };
    }
  };
  const consume = (user: RecoveryIdentity | null): RecoveryIdentity | null => {
    if (!pending) return null;
    if (pending.id !== user?.id) { clear(); return null; }
    const identity = pending;
    pending = null;
    consumedUserId = identity.id;
    return identity;
  };
  client.auth.onAuthStateChange((event, session) => observe(event, session?.user ?? null));
  return { observe, consume, clear };
}

export function passwordRecoverySignalFor(client: NonNullable<typeof supabaseClient>) {
  let signal = recoverySignals.get(client);
  if (!signal) {
    signal = createRecoverySignal(client);
    recoverySignals.set(client, signal);
  }
  return signal;
}

// Auth initialization can finish before React's first effect (notably in WebKit).
if (supabaseClient) passwordRecoverySignalFor(supabaseClient);
