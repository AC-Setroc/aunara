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
    expect(result.current.message).toContain("recuperar");
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
