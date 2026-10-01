// @vitest-environment jsdom

import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createRepbookSnapshot } from "../lib/cloudSnapshot";
import type { supabaseClient } from "../lib/supabaseClient";

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

beforeEach(() => {
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
