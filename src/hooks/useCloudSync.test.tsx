// @vitest-environment jsdom

import { act, renderHook, waitFor } from "@testing-library/react";
import { StrictMode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createRepbookSnapshot } from "../lib/cloudSnapshot";
import { passwordRecoverySignalFor, type supabaseClient } from "../lib/supabaseClient";

const { signUp, signInWithPassword, signOut, verifyOtp, resend, resetPasswordForEmail, updateUser, invoke } = vi.hoisted(() => ({
  signUp: vi.fn(),
  signInWithPassword: vi.fn(),
  signOut: vi.fn(),
  verifyOtp: vi.fn(),
  resend: vi.fn(),
  resetPasswordForEmail: vi.fn(),
  updateUser: vi.fn(),
  invoke: vi.fn(),
}));

const { load, save } = vi.hoisted(() => ({ load: vi.fn(), save: vi.fn() }));
vi.mock("../lib/cloudStore", () => ({
  createCloudStore: () => ({ load, save, recordConsent: vi.fn().mockResolvedValue(undefined) }),
}));

let authStateHandler: ((event: string, session: any) => void) | undefined;

import { useCloudSync } from "./useCloudSync";

const testClient = {
  auth: {
    getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
    onAuthStateChange: vi.fn((handler) => {
      authStateHandler = handler;
      return { data: { subscription: { unsubscribe: vi.fn() } } };
    }),
    signUp,
    signInWithPassword,
    signOut,
    verifyOtp,
    resend,
    resetPasswordForEmail,
    updateUser,
  },
  functions: { invoke },
} as unknown as NonNullable<typeof supabaseClient>;

const snapshot = createRepbookSnapshot({
  profileName: "Alejandro",
  language: "es",
  favoriteIds: ["0514"],
  tracks: [],
  activeTrackId: "",
  healthProfile: {
    ageYears: 34,
    metabolicSex: "male",
    heightCm: 180,
    currentWeightKg: 82,
    targetWeightKg: 78,
    waistCm: 86,
    activityLevel: "moderate",
    experience: "intermediate",
    dietaryPattern: "omnivore",
    allergies: "",
    healthNotes: "",
  },
  checkIns: [],
});

describe("verified recovery around mount", () => {
  function fixture() {
    const listeners = new Set<(event: any, session: any) => void>();
    const user = { id: "recovery-fixture", email: "recovery@example.invalid", user_metadata: {} };
    const client = {
      ...testClient,
      auth: {
        ...testClient.auth,
        getSession: vi.fn().mockResolvedValue({ data: { session: { user } }, error: null }),
        onAuthStateChange: vi.fn((callback) => {
          listeners.add(callback);
          return { data: { subscription: { unsubscribe: () => listeners.delete(callback) } } };
        }),
      },
    } as unknown as NonNullable<typeof supabaseClient>;
    const signal = passwordRecoverySignalFor(client);
    const emit = (event: string, session: any = { user }) => {
      for (const listener of listeners) listener(event, session);
    };
    const mount = (strict = false) => renderHook(() => useCloudSync({
      snapshot, onRemoteSnapshot: vi.fn(), client,
    }), strict ? { wrapper: StrictMode } : undefined);
    return { client, user, signal, emit, mount };
  }

  it.each([0, 200])("consumes pre-mount recovery with %sms bootstrap, including StrictMode", async (latency) => {
    const f = fixture();
    f.client.auth.getSession = vi.fn().mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ data: { session: { user: f.user } }, error: null }), latency)));
    f.emit("PASSWORD_RECOVERY");
    const hook = f.mount(true);
    await waitFor(() => expect(hook.result.current.passwordRecoveryState).toBe("ready"));
    expect(hook.result.current.existingAccountEmail).toBe(f.user.email);
    hook.unmount();
    const remount = f.mount();
    await waitFor(() => expect(f.client.auth.getSession).toHaveBeenCalled());
    expect(remount.result.current.passwordRecoveryState).toBeNull();
  });

  it.each([0, 200])("accepts post-mount recovery at %sms, not ordinary initialization", async (latency) => {
    const f = fixture(), hook = f.mount(true);
    await waitFor(() => expect(f.client.auth.getSession).toHaveBeenCalled());
    expect(hook.result.current.passwordRecoveryState).toBeNull();
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, latency));
      f.emit("PASSWORD_RECOVERY");
    });
    expect(hook.result.current.passwordRecoveryState).toBe("ready");
    act(() => f.emit("PASSWORD_RECOVERY"));
    expect(f.signal.consume(f.user)).toBeNull();
    await act(async () => { await hook.result.current.updatePassword("synthetic-password-123"); });
    expect(hook.result.current.passwordRecoveryState).toBeNull();
    // A completed flow must not suppress a later legitimate recovery for this user.
    act(() => f.emit("PASSWORD_RECOVERY"));
    expect(hook.result.current.passwordRecoveryState).toBe("ready");
  });

  it("does not let a stale null bootstrap overwrite a newer verified event", async () => {
    const f = fixture();
    let release!: (value: any) => void;
    f.client.auth.getSession = vi.fn().mockReturnValue(new Promise(resolve => { release = resolve; }));
    const hook = f.mount();
    act(() => f.emit("PASSWORD_RECOVERY"));
    await act(async () => release({ data: { session: null }, error: null }));
    expect(hook.result.current.passwordRecoveryState).toBe("ready");
    expect(hook.result.current.email).toBe(f.user.email);
    act(() => f.emit("SIGNED_IN", { user: { ...f.user, id: "different-user" } }));
    expect(hook.result.current.passwordRecoveryState).toBeNull();
    expect(hook.result.current.existingAccountEmail).toBeNull();
  });

  it.each(["INITIAL_SESSION", "SIGNED_IN", "TOKEN_REFRESHED", "USER_UPDATED"])("ordinary %s never activates recovery", async (event) => {
    const f = fixture();
    f.emit(event);
    const hook = f.mount();
    await act(async () => {});
    act(() => f.emit(event));
    expect(hook.result.current.passwordRecoveryState).toBeNull();
  });

  it("rejects invalid, expired, changed-user and signed-out returns", async () => {
    const f = fixture();
    f.emit("PASSWORD_RECOVERY");
    f.client.auth.getSession = vi.fn().mockResolvedValue({ data: { session: null }, error: { code: "otp_expired" } });
    const hook = f.mount();
    await act(async () => {});
    expect(hook.result.current.passwordRecoveryState).toBeNull();
    act(() => f.emit("PASSWORD_RECOVERY", null));
    expect(hook.result.current.passwordRecoveryState).toBeNull();
    act(() => f.emit("PASSWORD_RECOVERY"));
    expect(hook.result.current.passwordRecoveryState).toBe("ready");
    act(() => f.emit("SIGNED_OUT", null));
    expect(hook.result.current.passwordRecoveryState).toBeNull();
  });
});

beforeEach(() => {
  passwordRecoverySignalFor(testClient).clear();
  vi.clearAllMocks();
  authStateHandler = undefined;
  load.mockResolvedValue(null);
  save.mockResolvedValue(undefined);
  signUp.mockResolvedValue({
    data: {
      session: null,
      user: { identities: [{ id: "identity-1", provider: "email" }] },
    },
    error: null,
  });
  signInWithPassword.mockResolvedValue({ data: {}, error: null });
  signOut.mockResolvedValue({ error: null });
  verifyOtp.mockResolvedValue({
    data: {
      session: { user: { id: "user-1", email: "alejandro@example.com" } },
      user: { id: "user-1", email: "alejandro@example.com" },
    },
    error: null,
  });
  resend.mockResolvedValue({ data: {}, error: null });
  resetPasswordForEmail.mockResolvedValue({ data: {}, error: null });
  updateUser.mockResolvedValue({ data: { user: null }, error: null });
  invoke.mockResolvedValue({ data: {}, error: null });
});

describe("password account access", () => {
  const account = { name: "Test guest", email: "Guest+tag@sub.example.com", password: "MiXeD-Password", acceptedLegal: true, healthDataConsent: false };
  function hook(language: "es" | "en" = "es") {
    return renderHook(({ locale }) => useCloudSync({ snapshot: { ...snapshot, language: locale }, onRemoteSnapshot: vi.fn(), client: testClient }), { initialProps: { locale: language } });
  }
  function deferred<T>() {
    let resolve!: (value: T) => void;
    const promise = new Promise<T>((done) => { resolve = done; });
    return { promise, resolve };
  }

  it("clears only auth errors and translates visible errors when language changes", async () => {
    signInWithPassword.mockResolvedValueOnce({ error: { code: "invalid_credentials", message: "Raw server error" } });
    const { result, rerender } = hook();
    await act(() => result.current.signIn(account));
    expect(result.current.message).toBe("Tu correo o contraseña no coinciden con los datos registrados. Intentá de nuevo o recuperá tu contraseña");
    expect(result.current.authErrorKind).toBe("credentials");
    rerender({ locale: "en" });
    expect(result.current.message).toBe("Your email or password do not match the registered details. Try again or recover your password");
    expect(result.current.authErrorKind).toBe("credentials");
    act(() => result.current.clearAuthError());
    expect(result.current.message).toBeUndefined();
    expect(result.current.authErrorKind).toBeUndefined();
    expect(result.current.status).toBe("local");
  });

  it.each(["createAccount", "signIn"] as const)("does not revive a late %s error or strand pending state", async (action) => {
    const request = deferred<any>();
    (action === "createAccount" ? signUp : signInWithPassword).mockReturnValueOnce(request.promise);
    const { result } = hook();
    let pending!: Promise<void>;
    act(() => { pending = result.current[action](account); });
    expect(result.current.status).toBe("syncing");
    act(() => result.current.clearAuthError());
    expect(result.current.status).toBe("syncing");
    await act(async () => { request.resolve({ error: { code: "invalid_credentials", message: "old" }, data: {} }); await pending; });
    expect(result.current.message).toBeUndefined();
    expect(result.current.status).toBe("local");
  });

  it.each(["createAccount", "verifyAccount", "resendVerification", "requestPasswordReset", "updatePassword"] as const)("does not expose a login action for credentials from %s", async (action) => {
    const fn = { createAccount: signUp, verifyAccount: verifyOtp, resendVerification: resend, requestPasswordReset: resetPasswordForEmail, updatePassword: updateUser }[action];
    fn.mockResolvedValueOnce({ data: {}, error: { code: "invalid_credentials" } });
    const { result } = hook();
    await act(async () => {
      if (action === "createAccount") await result.current.createAccount(account);
      else if (action === "verifyAccount") await result.current.verifyAccount({ email: account.email, token: "123456" });
      else await result.current[action](action === "updatePassword" ? account.password : account.email);
    });
    expect(result.current.status).toBe("error");
    expect(result.current.authErrorKind).toBeUndefined();
  });

  it.each(["es", "en"] as const)("keeps a legitimate signup conflict after neutral recovery (%s)", async (language) => {
    signUp.mockResolvedValueOnce({ data: { session: null, user: { identities: [] } }, error: null });
    const { result } = hook(language);
    await act(() => result.current.createAccount(account));
    expect(result.current.existingAccountEmail).toBe(account.email);
    expect(resetPasswordForEmail).not.toHaveBeenCalled();
    await act(() => result.current.requestPasswordReset(account.email));
    expect(result.current.existingAccountEmail).toBe(account.email);
    expect(result.current.message).toBe(language === "es"
      ? "Solicitud de recuperación procesada. Esto no confirma que el correo se haya enviado o entregado. Si recibís las instrucciones, revisá tu bandeja de entrada y spam. Si no llegan, podés intentar nuevamente más tarde."
      : "Recovery request processed. This does not confirm that an email was sent or delivered. If you receive the instructions, check your inbox and spam folder. If they do not arrive, you can try again later.");
    expect(signInWithPassword).not.toHaveBeenCalled();
    expect(signUp).toHaveBeenCalledOnce();
  });

  it("translates only recovery feedback and preserves a subsequent legitimate local success", async () => {
    const { result, rerender } = hook("es");
    await act(() => result.current.requestPasswordReset(account.email));
    expect(result.current.message).toContain("Solicitud de recuperación procesada.");
    rerender({ locale: "en" });
    expect(result.current.message).toContain("Recovery request processed.");
    rerender({ locale: "es" });
    expect(result.current.message).toContain("Solicitud de recuperación procesada.");
    await act(() => result.current.resendVerification(account.email));
    const success = result.current.message;
    expect(success).toContain("Si la cuenta está pendiente");
    expect(result.current.passwordRecoveryState).toBe("requested");
    rerender({ locale: "en" });
    expect(result.current.message).toBe(success);
  });

  it("does not let an older error replace a newer auth success", async () => {
    const request = deferred<any>();
    signInWithPassword.mockReturnValueOnce(request.promise);
    const { result } = hook();
    let pending!: Promise<void>;
    act(() => { pending = result.current.signIn(account); });
    act(() => result.current.clearAuthError());
    await act(() => result.current.requestPasswordReset(account.email));
    const current = result.current.message;
    await act(async () => { request.resolve({ error: { code: "invalid_credentials" } }); await pending; });
    expect(result.current.message).toBe(current);
    expect(result.current.passwordRecoveryState).toBe("requested");
    expect(result.current.status).toBe("local");
  });

  it("preserves an old legitimate success, pending verification and recovery", async () => {
    const request = deferred<any>();
    signUp.mockReturnValueOnce(request.promise);
    const { result } = hook();
    let pending!: Promise<void>;
    act(() => { pending = result.current.createAccount(account); });
    act(() => result.current.clearAuthError());
    await act(async () => { request.resolve({ data: { session: null, user: { identities: [{}] } }, error: null }); await pending; });
    const message = result.current.message;
    act(() => result.current.clearAuthError());
    expect(result.current.pendingVerification).toEqual({ name: account.name, email: account.email });
    expect(result.current.message).toBe(message);
    await act(() => result.current.requestPasswordReset(account.email));
    const recovery = result.current.message;
    act(() => result.current.clearAuthError());
    expect(result.current.message).toBe(recovery);
    expect(result.current.passwordRecoveryState).toBe("requested");
    expect(result.current.message).not.toMatch(/sent you|Te enviamos/);
  });

  it("preserves sync errors, sync pending state, session and remote data", async () => {
    const remote = vi.fn();
    const request = deferred<any>();
    load.mockReturnValueOnce(request.promise);
    const { result } = renderHook(() => useCloudSync({ snapshot, onRemoteSnapshot: remote, client: testClient }));
    await waitFor(() => expect(authStateHandler).toBeDefined());
    act(() => authStateHandler?.("SIGNED_IN", { user: { id: "test-user", email: account.email } }));
    act(() => result.current.clearAuthError());
    expect(result.current.status).toBe("syncing");
    await act(async () => { request.resolve(snapshot); });
    await waitFor(() => expect(result.current.status).toBe("synced"));
    const calls = remote.mock.calls.length;
    act(() => result.current.clearAuthError());
    expect(result.current.email).toBe(account.email);
    expect(remote.mock.calls.length).toBe(calls);
    load.mockRejectedValueOnce(new Error("sync-original-error"));
    act(() => authStateHandler?.("SIGNED_IN", { user: { id: "other-user", email: account.email } }));
    await waitFor(() => expect(result.current.message).toBe("sync-original-error"));
    act(() => result.current.clearAuthError());
    expect(result.current.message).toBe("sync-original-error");
    expect(result.current.status).toBe("error");
  });

  it("blocks duplicate pending recovery requests without cancelling the first", async () => {
    const request = deferred<any>();
    resetPasswordForEmail.mockReturnValueOnce(request.promise);
    const { result } = hook();
    let pending!: Promise<void>;
    act(() => { pending = result.current.requestPasswordReset(account.email); });
    await act(() => result.current.requestPasswordReset(account.email));
    act(() => result.current.clearAuthError());
    expect(resetPasswordForEmail).toHaveBeenCalledOnce();
    await act(async () => { request.resolve({ error: null }); await pending; });
    expect(result.current.passwordRecoveryState).toBe("requested");
  });

  it("releases recovery pending after a rejected transport promise with safe feedback", async () => {
    resetPasswordForEmail.mockRejectedValueOnce(new Error("RAW TRANSPORT DETAILS"));
    const { result } = hook();
    await act(() => result.current.requestPasswordReset(account.email));
    expect(result.current.status).toBe("error");
    expect(result.current.message).not.toContain("RAW");
    await act(() => result.current.requestPasswordReset(account.email));
    expect(resetPasswordForEmail).toHaveBeenCalledTimes(2);
    expect(result.current.passwordRecoveryState).toBe("requested");
  });

  it("does not discard a legitimate old sign-in session after clearing an auth generation", async () => {
    const request = deferred<any>();
    signInWithPassword.mockReturnValueOnce(request.promise);
    const { result } = hook();
    await act(async () => { await Promise.resolve(); });
    let pending!: Promise<void>;
    act(() => { pending = result.current.signIn(account); });
    act(() => result.current.clearAuthError());
    await act(async () => {
      authStateHandler?.("SIGNED_IN", { user: { id: "legitimate-user", email: account.email } });
      request.resolve({ error: null });
      await pending;
    });
    await waitFor(() => expect(result.current.status).toBe("synced"));
    expect(result.current.email).toBe(account.email);
    expect(signOut).not.toHaveBeenCalled();
  });

  const actions = ["createAccount", "signIn", "verifyAccount", "resendVerification", "requestPasswordReset", "updatePassword"] as const;
  it.each(actions.flatMap((action) => (["es", "en"] as const).flatMap((language) => [true, false].map((known) => ({ action, language, known })))))("uses safe $language copy for $action (known=$known)", async ({ action, language, known }) => {
    const fn = { createAccount: signUp, signIn: signInWithPassword, verifyAccount: verifyOtp, resendVerification: resend, requestPasswordReset: resetPasswordForEmail, updatePassword: updateUser }[action];
    fn.mockResolvedValueOnce({ data: {}, error: { code: known ? "over_email_send_rate_limit" : "internal_weird", message: "SENSITIVE RAW ERROR" } });
    const { result } = hook(language);
    await act(async () => {
      if (action === "createAccount" || action === "signIn") await result.current[action](account);
      else if (action === "verifyAccount") await result.current.verifyAccount({ email: account.email, token: "123456" });
      else await result.current[action](action === "updatePassword" ? account.password : account.email);
    });
    expect(result.current.status).toBe("error");
    expect(result.current.message).not.toContain("SENSITIVE RAW");
    expect(result.current.message).toContain(known ? (language === "es" ? "demasiados intentos" : "Too many attempts") : (language === "es" ? "No pudimos" : "We could not"));
  });

  it("uses the current language for an error that completes after a language change", async () => {
    const request = deferred<any>();
    signInWithPassword.mockReturnValueOnce(request.promise);
    const { result, rerender } = hook("en");
    let pending!: Promise<void>;
    act(() => { pending = result.current.signIn(account); });
    rerender({ locale: "es" });
    await act(async () => { request.resolve({ error: { code: "email_not_confirmed" } }); await pending; });
    expect(result.current.message).toBe("Confirmá tu correo antes de ingresar.");
  });
  it("creates an account with password and profile name metadata", async () => {
    const { result } = renderHook(() => useCloudSync({
      snapshot,
      onRemoteSnapshot: vi.fn(),
      client: testClient,
    }));

    await act(() => result.current.createAccount({
      name: "Alejandro",
      email: "alejandro@example.com",
      password: "strong-pass-123",
      acceptedLegal: true,
      healthDataConsent: false,
    }));

    expect(signUp).toHaveBeenCalledWith({
      email: "alejandro@example.com",
      password: "strong-pass-123",
      options: {
        data: expect.objectContaining({
          display_name: "Alejandro",
          language: "es",
          accepted_legal_version: "1.0",
          health_data_consent: "declined",
        }),
        emailRedirectTo: new URL(import.meta.env.BASE_URL, window.location.origin).href,
      },
    });
    await waitFor(() => {
      expect(result.current.message).toContain("correo");
    });
    expect((result.current as any).pendingVerification).toEqual({
      name: "Alejandro",
      email: "alejandro@example.com",
    });
  });

  it("verifies the six-digit signup code and clears the pending account", async () => {
    const { result } = renderHook(() => useCloudSync({
      snapshot,
      onRemoteSnapshot: vi.fn(),
      client: testClient,
    }));

    await act(() => result.current.createAccount({
      name: "Alejandro",
      email: "alejandro@example.com",
      password: "strong-pass-123",
      acceptedLegal: true,
      healthDataConsent: false,
    }));
    await act(() => (result.current as any).verifyAccount({
      email: "alejandro@example.com",
      token: "123456",
    }));

    expect(verifyOtp).toHaveBeenCalledWith({
      email: "alejandro@example.com",
      token: "123456",
      type: "signup",
    });
    expect((result.current as any).pendingVerification).toBeNull();
  });

  it("resends the signup confirmation email", async () => {
    const { result } = renderHook(() => useCloudSync({
      snapshot,
      onRemoteSnapshot: vi.fn(),
      client: testClient,
    }));

    await act(() => (result.current as any).resendVerification("alejandro@example.com"));

    expect(resend).toHaveBeenCalledWith({
      type: "signup",
      email: "alejandro@example.com",
      options: { emailRedirectTo: new URL(import.meta.env.BASE_URL, window.location.origin).href },
    });
  });

  it("detects an existing account from Supabase's empty identities response", async () => {
    signUp.mockResolvedValueOnce({
      data: { session: null, user: { identities: [] } },
      error: null,
    });
    const { result } = renderHook(() => useCloudSync({
      snapshot,
      onRemoteSnapshot: vi.fn(),
      client: testClient,
    }));

    await act(() => result.current.createAccount({
      name: "Alejandro",
      email: "alejandro@example.com",
      password: "strong-pass-123",
      acceptedLegal: true,
      healthDataConsent: false,
    }));
    expect(result.current.pendingVerification).toBeNull();
    expect((result.current as any).existingAccountEmail).toBe("alejandro@example.com");
  });

  it("requests a password recovery email for an existing account", async () => {
    const { result } = renderHook(() => useCloudSync({
      snapshot,
      onRemoteSnapshot: vi.fn(),
      client: testClient,
    }));

    await act(() => (result.current as any).requestPasswordReset("alejandro@example.com"));

    expect(resetPasswordForEmail).toHaveBeenCalledWith(
      "alejandro@example.com",
      { redirectTo: new URL(import.meta.env.BASE_URL, window.location.origin).href },
    );
    expect((result.current as any).passwordRecoveryState).toBe("requested");
    expect(result.current.existingAccountEmail).toBeNull();
    expect(result.current.message).toBe("Solicitud de recuperación procesada. Esto no confirma que el correo se haya enviado o entregado. Si recibís las instrucciones, revisá tu bandeja de entrada y spam. Si no llegan, podés intentar nuevamente más tarde.");
  });

  it("accepts a new password after returning from the recovery email", async () => {
    const { result } = renderHook(() => useCloudSync({
      snapshot,
      onRemoteSnapshot: vi.fn(),
      client: testClient,
    }));

    await waitFor(() => expect(authStateHandler).toEqual(expect.any(Function)));
    act(() => authStateHandler?.("PASSWORD_RECOVERY", {
      user: { id: "user-1", email: "alejandro@example.com", user_metadata: {} },
    }));

    expect((result.current as any).passwordRecoveryState).toBe("ready");
    await act(() => (result.current as any).updatePassword("new-strong-pass-123"));

    expect(updateUser).toHaveBeenCalledWith({ password: "new-strong-pass-123" });
    expect((result.current as any).passwordRecoveryState).toBeNull();
  });

  it("signs in with an existing email and password", async () => {
    const { result } = renderHook(() => useCloudSync({
      snapshot,
      onRemoteSnapshot: vi.fn(),
      client: testClient,
    }));

    await act(() => result.current.signIn({
      email: "alejandro@example.com",
      password: "strong-pass-123",
    }));

    expect(signInWithPassword).toHaveBeenCalledWith({
      email: "alejandro@example.com",
      password: "strong-pass-123",
    });
  });

  it("clears personal data from the shared device after signing out", async () => {
    const onSignedOut = vi.fn();
    const { result } = renderHook(() => useCloudSync({
      snapshot,
      onRemoteSnapshot: vi.fn(),
      onSignedOut,
      client: testClient,
    }));

    await act(() => result.current.signOut());

    expect(signOut).toHaveBeenCalledOnce();
    expect(onSignedOut).toHaveBeenCalledOnce();
  });

  it("deletes the authenticated account through the protected server function", async () => {
    const onSignedOut = vi.fn();
    const authenticatedClient = {
      ...testClient,
      auth: {
        ...testClient.auth,
        getSession: vi.fn().mockResolvedValue({
          data: { session: { user: { id: "user-1", email: "alejandro@example.com", user_metadata: {} } } },
        }),
      },
    } as unknown as NonNullable<typeof supabaseClient>;
    const { result } = renderHook(() => useCloudSync({
      snapshot,
      onRemoteSnapshot: vi.fn(),
      onSignedOut,
      client: authenticatedClient,
    }));

    await waitFor(() => expect(result.current.email).toBe("alejandro@example.com"));
    await act(() => result.current.deleteAccount());

    expect(invoke).toHaveBeenCalledWith("delete-my-account");
    expect(onSignedOut).toHaveBeenCalledOnce();
  });
});
