// @vitest-environment jsdom

import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createRepbookSnapshot } from "../lib/cloudSnapshot";
import type { supabaseClient } from "../lib/supabaseClient";

const { signUp, signInWithPassword, signOut, verifyOtp, resend } = vi.hoisted(() => ({
  signUp: vi.fn(),
  signInWithPassword: vi.fn(),
  signOut: vi.fn(),
  verifyOtp: vi.fn(),
  resend: vi.fn(),
}));

import { useCloudSync } from "./useCloudSync";

const testClient = {
  auth: {
    getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
    onAuthStateChange: vi.fn().mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    }),
    signUp,
    signInWithPassword,
    signOut,
    verifyOtp,
    resend,
  },
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
  signUp.mockResolvedValue({ data: { session: null }, error: null });
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
    }));

    expect(signUp).toHaveBeenCalledWith({
      email: "alejandro@example.com",
      password: "strong-pass-123",
      options: {
        data: { display_name: "Alejandro", language: "es" },
        emailRedirectTo: window.location.origin,
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

  it("resends the signup confirmation code", async () => {
    const { result } = renderHook(() => useCloudSync({
      snapshot,
      onRemoteSnapshot: vi.fn(),
      client: testClient,
    }));

    await act(() => (result.current as any).resendVerification("alejandro@example.com"));

    expect(resend).toHaveBeenCalledWith({
      type: "signup",
      email: "alejandro@example.com",
      options: { emailRedirectTo: window.location.origin },
    });
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
});
