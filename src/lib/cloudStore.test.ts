import { describe, expect, it, vi } from "vitest";
import { createRepbookSnapshot } from "./cloudSnapshot";
import { createCloudStore } from "./cloudStore";

const snapshot = createRepbookSnapshot({
  profileName: "Alejandro",
  language: "es",
  favoriteIds: [],
  tracks: [],
  activeTrackId: "",
  healthProfile: {
    ageYears: null,
    metabolicSex: "unspecified",
    heightCm: null,
    currentWeightKg: null,
    targetWeightKg: null,
    waistCm: null,
    activityLevel: "moderate",
    experience: "beginner",
    dietaryPattern: "omnivore",
    allergies: "",
    healthNotes: "",
  },
  checkIns: [],
});

describe("cloud data store", () => {
  it("loads the current user's snapshot without requesting another user's row", async () => {
    const maybeSingle = vi.fn().mockResolvedValue({ data: { payload: snapshot }, error: null });
    const eq = vi.fn().mockReturnValue({ maybeSingle });
    const select = vi.fn().mockReturnValue({ eq });
    const from = vi.fn().mockReturnValue({ select });

    const store = createCloudStore({ from });

    await expect(store.load("user-123")).resolves.toEqual(snapshot);
    expect(from).toHaveBeenCalledWith("repbook_user_data");
    expect(eq).toHaveBeenCalledWith("user_id", "user-123");
  });

  it("returns no snapshot for a new account", async () => {
    const client = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
          }),
        }),
      }),
    };

    await expect(createCloudStore(client).load("new-user")).resolves.toBeNull();
  });

  it("upserts only the signed-in user's versioned snapshot", async () => {
    const upsert = vi.fn().mockResolvedValue({ error: null });
    const from = vi.fn().mockReturnValue({ upsert });

    await createCloudStore({ from }).save("user-123", snapshot);

    expect(upsert).toHaveBeenCalledWith({
      user_id: "user-123",
      payload: snapshot,
    }, {
      onConflict: "user_id",
    });
  });

  it("surfaces database errors instead of reporting a false successful sync", async () => {
    const client = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({
              data: null,
              error: new Error("database unavailable"),
            }),
          }),
        }),
      }),
    };

    await expect(createCloudStore(client).load("user-123")).rejects.toThrow("database unavailable");
  });

  it("records a versioned consent event for the signed-in user", async () => {
    const insert = vi.fn().mockResolvedValue({ error: null });
    const from = vi.fn().mockReturnValue({ insert });

    await createCloudStore({ from }).recordConsent({
      id: "11111111-1111-4111-8111-111111111111",
      userId: "user-123",
      consentType: "health_data",
      action: "granted",
      policyVersion: "1.0",
      locale: "es",
      source: "account",
    });

    expect(from).toHaveBeenCalledWith("repbook_consent_events");
    expect(insert).toHaveBeenCalledWith({
      id: "11111111-1111-4111-8111-111111111111",
      user_id: "user-123",
      consent_type: "health_data",
      action: "granted",
      policy_version: "1.0",
      locale: "es",
      source: "account",
    });
  });

  it("deletes only the signed-in user's stored snapshot", async () => {
    const eq = vi.fn().mockResolvedValue({ error: null });
    const deleteRows = vi.fn().mockReturnValue({ eq });
    const from = vi.fn().mockReturnValue({ delete: deleteRows });

    await createCloudStore({ from }).remove("user-123");

    expect(from).toHaveBeenCalledWith("repbook_user_data");
    expect(eq).toHaveBeenCalledWith("user_id", "user-123");
  });
});
