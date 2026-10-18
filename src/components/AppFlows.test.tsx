// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Exercise, HealthProfile, TrainingTrack } from "../types";
import { ProfilePanel } from "./ProfilePanel";
import { ExerciseAssignmentDialog } from "./ExerciseAssignmentDialog";
import { ExerciseDetail } from "./ExerciseDetail";
import { InitialRoutineProposal } from "./InitialRoutineProposal";
import { TrainingTracks } from "./TrainingTracks";
import { WorkoutPanel } from "./WorkoutPanel";
import { createSpecialPrescription } from "../lib/workoutPrescription";
import { createRepbookSnapshot, normalizeRepbookSnapshot, type RepbookCloudSnapshot } from "../lib/cloudSnapshot";

const accessMock = vi.hoisted(() => ({ overrides: {} as Record<string, unknown>, clearAuthError: vi.fn(), requestPasswordReset: vi.fn(),
  options: null as { snapshot: RepbookCloudSnapshot; onRemoteSnapshot: (snapshot: RepbookCloudSnapshot) => void; onSignedOut: () => void } | null,
}));
vi.mock("../hooks/useCloudSync", () => ({
  useCloudSync: (options: NonNullable<typeof accessMock.options>) => (accessMock.options = options, {
    configured: true,
    email: "athlete@example.com",
    status: "synced",
    healthDataConsent: "granted",
    createAccount: vi.fn(),
    signIn: vi.fn(),
    signOut: vi.fn(),
    clearAuthError: accessMock.clearAuthError,
    requestPasswordReset: accessMock.requestPasswordReset,
    ...accessMock.overrides,
  }),
}));

import App from "../App";

function openLogin() {
  fireEvent.click(screen.getByRole("button", { name: /Open navigation|Abrir navegación/ }));
  fireEvent.click(screen.getByRole("button", { name: /^(Login \/ create account|Ingresar \/ crear cuenta|Log in|Ingresar)$/ }));
}

function openNavigation() {
  fireEvent.click(screen.getByRole("button", { name: /Open navigation|Abrir navegación/ }));
}

describe("stored profile summary", () => {
  // Valid legacy-compatible profile with omitted optional preferences/defaults.
  const emptyProfile: HealthProfile = {
    birthDate: "", ageYears: null, metabolicSex: "unspecified", heightCm: null,
    currentWeightKg: null, targetWeightKg: null, waistCm: null, activityLevel: "moderate",
    experience: "beginner", dietaryPattern: "omnivore", allergies: "", healthNotes: "",
  };
  function openSummary(profile: HealthProfile, name = "Mi perfil", language: "en" | "es" = "en") {
    const snapshot = createRepbookSnapshot({ profileName: name, language, healthProfile: profile,
      tracks: [], activeTrackId: "", favoriteIds: [], checkIns: [], tracksInitialized: false });
    expect(normalizeRepbookSnapshot(snapshot, { ...snapshot })).toBe(snapshot);
    localStorage.setItem("repbook-health-profile", JSON.stringify(profile));
    localStorage.setItem("repbook-profile-name", JSON.stringify(name));
    localStorage.setItem("repbook-language", JSON.stringify(language));
    vi.stubGlobal("fetch", vi.fn(() => new Promise(() => undefined)));
    const view = render(<App />);
    openNavigation();
    fireEvent.click(screen.getByRole("button", { name: language === "en"
      ? "Open account and synchronization" : "Abrir cuenta y sincronización" }));
    return { ...view, snapshot, summary: view.container.querySelector(".privacy-summary")! };
  }
  const preferences: { label: string; value: Partial<HealthProfile> }[] = [
    { label: "primaryGoal", value: { primaryGoal: "mobility" } },
    { label: "goals including initial goal", value: { goals: ["strength"] } },
    { label: "sport", value: { sport: "running" } },
    { label: "equipmentPreference", value: { equipmentPreference: "bodyweight" } },
    { label: "trainingDaysPerWeek", value: { trainingDaysPerWeek: 2 } },
    { label: "sessionMinutes", value: { sessionMinutes: 30 } },
    { label: "experience", value: { experience: "intermediate" } },
  ];
  it.each((["en", "es"] as const).flatMap(language => [false, undefined].map(onboardingCompleted => ({ language, onboardingCompleted }))))(
    "lists a valid partial name with onboarding $onboardingCompleted ($language)", ({ language, onboardingCompleted }) => {
      const { summary } = openSummary({ ...emptyProfile, onboardingCompleted }, "  Synthetic athlete  ", language);
      expect(summary.querySelectorAll("li")).toHaveLength(1);
      expect(summary.textContent).toContain(language === "en" ? "Profile and preferences" : "Perfil y preferencias");
      expect(summary.textContent).not.toContain("Synthetic athlete");
    });
  it.each(preferences.flatMap(preference => [false, undefined].map(onboardingCompleted => ({ ...preference, onboardingCompleted }))))(
    "lists $label alone with onboarding $onboardingCompleted", ({ value, onboardingCompleted }) => {
      const { summary } = openSummary({ ...emptyProfile, ...value, onboardingCompleted });
      expect(summary.querySelectorAll("li")).toHaveLength(1);
      expect(summary.textContent).toContain("Profile and preferences");
    });
  it.each(["", "   ", "Mi perfil", "  Mi perfil  "])("omits empty/default name '%s' and normalized initial preferences", name => {
    const { summary } = openSummary({ ...emptyProfile, onboardingCompleted: false, primaryGoal: "strength",
      sport: null, equipmentPreference: "mixed", trainingDaysPerWeek: 3, sessionMinutes: 45 }, name);
    expect(summary.querySelectorAll("li")).toHaveLength(0);
  });
  it("omits optional defaults, sensitive data and proposal markers as presence indicators", () => {
    const { summary } = openSummary({ ...emptyProfile, healthDataMode: "personalized", healthNotes: "PRIVATE sentinel",
      allergies: "PRIVATE allergy", initialRoutineDecision: "rejected", readinessScreen: {
        confirmed: true, chestPain: true, dizzinessOrFainting: false, medicallySupervisedOnly: false, musculoskeletalConcern: false,
      } });
    expect(summary.querySelectorAll("li")).toHaveLength(1);
    expect(summary.textContent).toContain("Authorized health context");
    expect(summary.textContent).not.toContain("Profile and preferences");
    expect(summary.textContent).not.toContain("PRIVATE");
  });
  it("treats a locally representable empty goals array as empty without changing the schema", () => {
    // The cloud validator rejects explicit goals: []; this is only a local-state control.
    localStorage.setItem("repbook-health-profile", JSON.stringify({ ...emptyProfile, goals: [] }));
    vi.stubGlobal("fetch", vi.fn(() => new Promise(() => undefined)));
    const { container } = render(<App />);
    openNavigation();
    fireEvent.click(screen.getByRole("button", { name: "Open account and synchronization" }));
    expect(container.querySelectorAll(".privacy-summary li")).toHaveLength(0);
  });
  it("preserves completed-profile recognition even without a meaningful name or preferences", () => {
    const { summary } = openSummary({ ...emptyProfile, onboardingCompleted: true });
    expect(summary.querySelectorAll("li")).toHaveLength(1);
    expect(summary.textContent).toContain("Profile and preferences");
  });
  it("does not attribute local legacy workout to the account summary", () => {
    localStorage.setItem("repbook-workout", JSON.stringify([{ exerciseId: "0514", sets: 3, reps: 8 }]));
    const { summary } = openSummary(emptyProfile);
    expect(summary.querySelectorAll("li")).toHaveLength(0);
  });
  it("keeps the guest privacy center hidden even with a meaningful profile", () => {
    accessMock.overrides = { email: null };
    localStorage.setItem("repbook-health-profile", JSON.stringify(emptyProfile));
    localStorage.setItem("repbook-profile-name", JSON.stringify("Synthetic athlete"));
    vi.stubGlobal("fetch", vi.fn(() => new Promise(() => undefined)));
    const { container } = render(<App />);
    openLogin();
    expect(container.querySelector(".privacy-summary")).toBeNull();
    expect(screen.queryByText("Export my data")).toBeNull();
  });
  it("keeps exported snapshot bytes and collection counts unchanged across summary open/close", () => {
    const exports: { data: RepbookCloudSnapshot; account: { email: string } }[] = [];
    const NativeBlob = Blob;
    vi.stubGlobal("Blob", class extends NativeBlob {
      constructor(parts: BlobPart[], options?: BlobPropertyBag) {
        super(parts, options);
        exports.push(JSON.parse(parts[0] as string));
      }
    });
    const NativeURL = URL;
    vi.stubGlobal("URL", class extends NativeURL {
      static createObjectURL() { return "blob:synthetic-export"; }
      static revokeObjectURL() {}
    });
    const anchorClick = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);
    localStorage.setItem("repbook-training-tracks", JSON.stringify([track]));
    localStorage.setItem("repbook-favorites", JSON.stringify(["0514"]));
    const { summary } = openSummary({ ...emptyProfile, onboardingCompleted: false, goals: ["strength"] }, " Synthetic athlete ");
    const original = structuredClone(accessMock.options!.snapshot);
    const write = vi.spyOn(Storage.prototype, "setItem");
    try {
      expect([...summary.querySelectorAll("li")].map(item => item.textContent)).toEqual([
        "Profile and preferences", "Routes and prescriptions: 1", "Favorites: 1",
      ]);
      fireEvent.click(screen.getByRole("button", { name: "Export my data" }));
      fireEvent.click(screen.getByRole("button", { name: "Close access panel" }));
      openNavigation();
      fireEvent.click(screen.getByRole("button", { name: "Open account and synchronization" }));
      fireEvent.click(screen.getByRole("button", { name: "Export my data" }));
      expect(exports).toHaveLength(2);
      expect(exports.map(item => item.data)).toEqual([original, original]);
      expect(exports.every(item => normalizeRepbookSnapshot(item.data, { ...item.data }) === item.data)).toBe(true);
      expect(exports.map(item => item.account.email)).toEqual(["athlete@example.com", "athlete@example.com"]);
      expect(accessMock.options!.snapshot).toEqual(original);
      expect(write).not.toHaveBeenCalled();
      expect(anchorClick).toHaveBeenCalledTimes(2);
    } finally {
      write.mockRestore(); anchorClick.mockRestore();
    }
  });
  it("clears A on the existing sign-out callback and derives the empty B snapshot on identity change", () => {
    const { rerender, container } = openSummary({ ...emptyProfile, goals: ["strength"] }, "Synthetic A");
    fireEvent.click(screen.getByRole("button", { name: "Close access panel" }));
    accessMock.overrides = { signOut: () => {
      accessMock.overrides = { email: null };
      accessMock.options!.onSignedOut();
    } };
    // Execute the existing hook callback contract; SDK identity isolation is checked in compiled UI separately.
    openNavigation();
    fireEvent.click(screen.getByRole("button", { name: "Open account and synchronization" }));
    fireEvent.click(screen.getByRole("button", { name: "Sign out" }));
    expect(container.querySelector(".privacy-summary")).toBeNull();
    accessMock.overrides = { email: "synthetic-b@example.invalid" };
    rerender(<App />);
    // Sign-out restores Spanish; B receives a valid empty current-context snapshot.
    const empty = createRepbookSnapshot({ profileName: "Mi perfil", language: "en", healthProfile: emptyProfile,
      tracks: [], activeTrackId: "", favoriteIds: [], checkIns: [], tracksInitialized: false });
    expect(normalizeRepbookSnapshot(empty, { ...empty })).toBe(empty);
    openNavigation();
    fireEvent.click(screen.getByRole("button", { name: "Abrir cuenta y sincronización" }));
    // Remote data is applied through the actual App callback, not by reseeding rendered local state.
    fireEvent.click(screen.getByRole("button", { name: "Cerrar acceso" }));
    act(() => accessMock.options!.onRemoteSnapshot(empty));
    openNavigation();
    fireEvent.click(screen.getByRole("button", { name: "Open account and synchronization" }));
    expect(container.querySelectorAll(".privacy-summary li")).toHaveLength(0);
    expect(container.querySelector(".privacy-summary")?.textContent).not.toContain("Synthetic A");
  });
});

const exercise: Exercise = {
  id: "0514",
  name: "jump squat",
  category: "upper legs",
  body_part: "upper legs",
  equipment: "body weight",
  target: "glutes",
  muscle_group: "lower body",
  secondary_muscles: ["quadriceps"],
  instructions: { en: "Jump with control.", es: "", it: "", tr: "", ru: "", zh: "", hi: "", pl: "", ko: "", fr: "" },
  instruction_steps: { en: ["Lower into a squat.", "Jump and land softly."], es: [], it: [], tr: [], ru: [], zh: [], hi: [], pl: [], ko: [], fr: [] },
  media_id: "media",
  image: "images/a.jpg",
  gif_url: "videos/a.gif",
  attribution: "© Gym visual — https://gymvisual.com/",
  created_at: "2026-01-01T00:00:00Z",
};

const pressExercise: Exercise = {
  ...exercise,
  id: "0405",
  name: "dumbbell seated shoulder press",
  category: "shoulders",
  body_part: "shoulders",
  equipment: "dumbbell",
  target: "delts",
  muscle_group: "deltoids",
  secondary_muscles: ["triceps"],
};

const track: TrainingTrack = {
  id: "goal-strength",
  name: "Strength base",
  kind: "goal",
  focus: "strength",
  equipment: "any",
  sessionMinutes: 45,
  daysPerWeek: 2,
  workout: [{ exerciseId: exercise.id, sets: 4, reps: 6 }],
};

const healthProfile: HealthProfile = {
  birthDate: "1992-01-01",
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
};

beforeEach(() => {
  accessMock.overrides = {};
  accessMock.clearAuthError.mockClear();
  accessMock.requestPasswordReset.mockClear();
  localStorage.setItem("repbook-language", JSON.stringify("en"));
  localStorage.setItem("repbook-health-profile", JSON.stringify({
    ...healthProfile,
    onboardingCompleted: true,
  }));
});

afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.unstubAllGlobals();
});

describe("storage notice and footer integration", () => {
  it("persists the header language toggle without closing the authenticated drawer or changing destinations", () => {
    vi.stubGlobal("fetch", vi.fn(() => new Promise(() => undefined)));
    const view = render(<App />);
    openNavigation();
    const toggle = screen.getByRole("button", { name: "Switch to Spanish" });
    toggle.focus();
    fireEvent.click(toggle);
    expect(document.activeElement).toBe(toggle);
    expect(screen.getByRole("dialog", { name: "Navegación" })).toBeTruthy();
    expect([...document.querySelectorAll(".navigation-row")].map(row => row.getAttribute("aria-label") ?? row.textContent)).toEqual([
      "Biblioteca de ejercicios", "Abrir perfil", "Entrenamiento de hoy0",
      "Abrir cuenta y sincronización", "Cuenta / privacidad", "Ayuda / instalación", "Salir",
    ]);
    expect(screen.queryByRole("combobox", { name: /Language|Idioma/ })).toBeNull();
    view.unmount();
    render(<App />);
    openNavigation();
    expect(screen.getByRole("button", { name: "Cambiar a inglés" }).textContent).toBe("ES");
    fireEvent.click(screen.getByRole("button", { name: "Cambiar a inglés" }));
    expect(screen.getByRole("button", { name: "Switch to Spanish" }).textContent).toBe("EN");
  });
  it("keeps immediate recovery visible when a new identity arrives, then allows normal completion", () => {
    accessMock.overrides = { email: null, passwordRecoveryState: null };
    vi.stubGlobal("fetch", vi.fn(() => new Promise(() => undefined)));
    const { rerender } = render(<App />);
    accessMock.overrides = { email: "synthetic-recovery@example.com", passwordRecoveryState: "ready" };
    rerender(<App />);
    expect(screen.getByRole("button", { name: "Save new password" })).toBeTruthy();
    expect(screen.queryByRole("dialog", { name: "My profile" })).toBeNull();
    accessMock.overrides = { email: "synthetic-recovery@example.com", passwordRecoveryState: null };
    rerender(<App />);
    expect(screen.queryByRole("button", { name: "Save new password" })).toBeNull();
    expect(screen.getByText("synthetic-recovery@example.com")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Done" }));
    expect(screen.queryByRole("dialog", { name: "Access Aunara anywhere" })).toBeNull();
    openNavigation();
    expect(screen.queryByRole("button", { name: "Home / routes" })).toBeNull();
    expect(screen.getByRole("button", { name: "Go to home" })).toBeTruthy();
  });
  it("returns a completed profile to home after a simulated sign-in without opening profile", () => {
    accessMock.overrides = { email: null };
    vi.stubGlobal("fetch", vi.fn(() => new Promise(() => undefined)));
    const { rerender } = render(<App />);
    openLogin();
    expect(screen.getByRole("dialog", { name: "Access Aunara anywhere" })).toBeTruthy();
    accessMock.overrides = { email: "synthetic@example.com" };
    rerender(<App />);
    expect(screen.queryByRole("dialog", { name: "Access Aunara anywhere" })).toBeNull();
    expect(screen.queryByRole("dialog", { name: "My profile" })).toBeNull();
    openNavigation();
    expect(screen.queryByRole("button", { name: "Home / routes" })).toBeNull();
    expect(screen.getByRole("button", { name: "Go to home" })).toBeTruthy();
  });
  it("connects auth-error cleanup and explicit recovery without disturbing the guest legal flow", async () => {
    accessMock.overrides = { email: null, status: "error", message: "Simulated auth error" };
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: vi.fn().mockResolvedValue([exercise]) }));
    render(<App />);
    openLogin();
    fireEvent.click(screen.getByRole("button", { name: "Create account" }));
    expect(accessMock.clearAuthError).toHaveBeenCalledOnce();
    const input = screen.getByLabelText("Email address");
    fireEvent.change(input, { target: { value: "  Guest+tag@sub.example.com  " } });
    expect(screen.queryByRole("button", { name: "Recover password" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "I already have an account" }));
    fireEvent.click(screen.getByRole("button", { name: "Recover password" }));
    expect(accessMock.requestPasswordReset).toHaveBeenCalledExactlyOnceWith("Guest+tag@sub.example.com");
    fireEvent.click(screen.getByRole("button", { name: "Create account" }));
    fireEvent.click(screen.getAllByRole("button", { name: "Terms of use" })[0]);
    expect(screen.getByRole("heading", { name: "Terms of use" })).toBeTruthy();
    fireEvent.keyDown(screen.getByRole("button", { name: "Close legal document" }), { key: "Escape" });
    expect((screen.getByLabelText("Email address") as HTMLInputElement).value).toBe("  Guest+tag@sub.example.com  ");
    expect((screen.getByRole("checkbox", { name: /I accept the Terms/ }) as HTMLInputElement).checked).toBe(false);
  });
  it("keeps the complete app and all nine stored states usable with global storage denied", async () => {
    const clear = vi.spyOn(Storage.prototype, "clear");
    const remove = vi.spyOn(Storage.prototype, "removeItem");
    const read = vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw new DOMException("Blocked", "SecurityError"); });
    const write = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new DOMException("Blocked", "SecurityError"); });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: vi.fn().mockResolvedValue([exercise]) }));
    try {
      const first = render(<App />);
      expect(screen.getByRole("button", { name: "Ir al inicio" })).toBeTruthy();
      for (const key of [
        "repbook-language", "repbook-profile-name", "repbook-favorites", "repbook-workout",
        "repbook-training-tracks", "repbook-active-track", "repbook-training-tracks-initialized",
        "repbook-health-profile", "repbook-weekly-checkins",
      ]) {
        expect(read).toHaveBeenCalledWith(key);
        expect(write.mock.calls.some(([writtenKey]) => writtenKey === key)).toBe(true);
      }
      fireEvent.click(screen.getByRole("button", { name: "Entendido" }));
      expect(screen.queryByRole("complementary", { name: /Aviso de almacenamiento/ })).toBeNull();
      const opener = screen.getByRole("button", { name: "Cookies y almacenamiento" });
      fireEvent.click(opener);
      expect(screen.getByRole("dialog", { name: "Cookies y almacenamiento" })).toBeTruthy();
      fireEvent.keyDown(window, { key: "Escape" });
      expect(window.document.activeElement).toBe(opener);
      fireEvent.click(screen.getByRole("button", { name: "Abrir navegación" }));
      fireEvent.click(screen.getByRole("button", { name: "Cambiar a inglés" }));
      expect(screen.getByRole("button", { name: "Switch to Spanish" }).textContent).toBe("EN");
      fireEvent.keyDown(window, { key: "Escape" });
      expect(screen.getByRole("button", { name: "Cookies and storage" })).toBeTruthy();
      expect(screen.getByAltText("AC Setroc")).toBeTruthy();
      expect(clear).not.toHaveBeenCalled();
      expect(remove).not.toHaveBeenCalled();
      first.unmount();
      render(<App />);
      expect(screen.getByRole("button", { name: "Entendido" })).toBeTruthy();
      fireEvent.click(screen.getByRole("button", { name: "Abrir navegación" }));
      expect(screen.getByRole("button", { name: "Cambiar a inglés" }).textContent).toBe("ES");
    } finally {
      cleanup();
      vi.restoreAllMocks();
    }
  });

  it.each(["es", "en"] as const)("reopens all documents and preserves credit and attributions (%s)", async (language) => {
    localStorage.setItem("repbook-language", JSON.stringify(language));
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: vi.fn().mockResolvedValue([exercise]) }));
    render(<App />);
    const credit = screen.getByAltText("AC Setroc") as HTMLImageElement;
    expect(credit.getAttribute("src")).toBe(`${import.meta.env.BASE_URL}brand/ac-setroc-wordmark.png`);
    expect(credit.closest("a")).toBeNull();
    expect(screen.getByText(language === "es" ? "Desarrollado por" : "Developed by")).toBeTruthy();
    const slogan = screen.getByText(language === "es" ? "Tu propósito marca el camino." : "Your purpose leads the way.");
    expect(slogan.closest(".footer-brand")?.querySelector("img")?.getAttribute("src")).toBe(`${import.meta.env.BASE_URL}brand/aunara-training-systems.svg`);
    expect(credit.closest(".footer-development-credit")?.querySelector("span")?.textContent).toBe(language === "es" ? "Desarrollado por" : "Developed by");
    expect(screen.getByRole("link", { name: "Gym visual" })).toBeTruthy();
    expect(screen.getByText(/Hasan Emir Yıldırım, MIT/)).toBeTruthy();
    expect(screen.queryByRole("dialog")).toBeNull();
    const more = screen.getByRole("button", { name: language === "es" ? "Más información" : "Learn more" });
    // Safari-like click: the trigger need not already own keyboard focus.
    expect(window.document.activeElement).not.toBe(more);
    fireEvent.click(more);
    expect(screen.getByRole("dialog", { name: language === "es" ? "Cookies y almacenamiento" : "Cookies and storage" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: language === "es" ? "Cerrar documento legal" : "Close legal document" }));
    expect(window.document.activeElement).toBe(more);
    fireEvent.click(screen.getByRole("button", { name: language === "es" ? "Entendido" : "Understood" }));
    expect(screen.queryByRole("complementary", { name: /storage notice|Aviso de almacenamiento/ })).toBeNull();
    const titles = language === "es"
      ? ["Política de privacidad", "Términos de uso", "Cookies y almacenamiento"]
      : ["Privacy policy", "Terms of use", "Cookies and storage"];
    for (const title of titles) {
      const opener = screen.getByRole("button", { name: title });
      opener.focus();
      fireEvent.click(opener);
      expect(screen.getByRole("dialog", { name: title })).toBeTruthy();
      fireEvent.keyDown(window, { key: "Escape" });
      expect(screen.queryByRole("dialog")).toBeNull();
      expect(window.document.activeElement).toBe(opener);
    }
    openNavigation();
    await screen.findByRole("button", { name: language === "es" ? "Biblioteca de ejercicios" : "Exercise library" });
  });
});

describe("training track controls", () => {
  it("opens the selected track routine from the track card", () => {
    const onOpen = vi.fn();
    render(<TrainingTracks
      tracks={[track]}
      activeTrackId={track.id}
      onOpen={onOpen}
      onCreate={vi.fn()}
      onGenerate={vi.fn()}
      onDelete={vi.fn()}
    />);

    fireEvent.click(screen.getByText("Strength base").closest("button")!);

    expect(onOpen).toHaveBeenCalledWith(track.id);
  });

  it("asks for confirmation before deleting a track", () => {
    const onDelete = vi.fn();
    render(<TrainingTracks
      tracks={[track]}
      activeTrackId={track.id}
      onOpen={vi.fn()}
      onCreate={vi.fn()}
      onGenerate={vi.fn()}
      onDelete={onDelete}
    />);

    const deleteButton = screen.queryByRole("button", { name: "Delete Strength base" });
    expect(deleteButton).not.toBeNull();
    if (!deleteButton) return;
    fireEvent.click(deleteButton);
    fireEvent.click(screen.getByRole("button", { name: "Delete track" }));

    expect(onDelete).toHaveBeenCalledWith(track.id);
  });

  it("keeps the track list empty after deleting the final saved track", async () => {
    localStorage.setItem("repbook-training-tracks", JSON.stringify([track]));
    localStorage.setItem("repbook-active-track", JSON.stringify(track.id));
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue([exercise]),
    }));
    render(<App />);

    await screen.findByRole("heading", { name: "Training tracks" });
    fireEvent.click(screen.getByRole("button", { name: "Delete Strength base" }));
    fireEvent.click(screen.getByRole("button", { name: "Delete track" }));

    await waitFor(() => {
      expect(screen.queryByRole("button", { name: "Delete Strength base" })).toBeNull();
      expect(JSON.parse(localStorage.getItem("repbook-training-tracks") ?? "null")).toEqual([]);
    });
  });

  it("offers a mixed equipment preference when creating a track", () => {
    render(<TrainingTracks
      tracks={[]}
      activeTrackId=""
      onOpen={vi.fn()}
      onCreate={vi.fn()}
      onGenerate={vi.fn()}
      onDelete={vi.fn()}
    />);

    fireEvent.click(screen.getByRole("button", { name: /Add route/ }));

    expect(screen.getByRole("option", { name: "Mixed" })).toBeTruthy();
  });

  it("creates a manual weight-loss track with free session minutes", () => {
    const onCreate = vi.fn();
    render(<TrainingTracks
      tracks={[]}
      activeTrackId=""
      onOpen={vi.fn()}
      onCreate={onCreate}
      onGenerate={vi.fn()}
      onDelete={vi.fn()}
      onEdit={vi.fn()}
    />);

    fireEvent.click(screen.getByRole("button", { name: /Add route/ }));
    fireEvent.change(screen.getByLabelText("Goal"), { target: { value: "weight-loss" } });
    fireEvent.click(screen.getByRole("button", { name: "Manual routine" }));
    fireEvent.change(screen.getByLabelText("Session minutes"), { target: { value: "75" } });
    fireEvent.click(screen.getByRole("button", { name: "Tuesday" }));
    fireEvent.click(screen.getByRole("button", { name: "Wednesday" }));
    fireEvent.click(screen.getByRole("button", { name: "Friday" }));
    fireEvent.click(screen.getByRole("button", { name: "Create manual track" }));

    expect(onCreate).toHaveBeenCalledWith(expect.objectContaining({
      focus: "weight-loss",
      sessionMinutes: 75,
      daysPerWeek: 3,
      trainingDays: ["monday", "wednesday", "friday"],
      creationMode: "manual",
    }));
  });

  it("reviews a newly suggested route before saving it", async () => {
    localStorage.setItem("repbook-health-profile", JSON.stringify({
      ...healthProfile,
      onboardingCompleted: true,
      initialRoutineDecision: "rejected",
    }));
    localStorage.setItem("repbook-training-tracks-initialized", JSON.stringify(true));
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue([exercise]),
    }));
    render(<App />);

    await screen.findByRole("heading", { name: "Training tracks" });
    fireEvent.click(screen.getByRole("button", { name: /Add route/ }));
    fireEvent.click(screen.getByRole("button", { name: "Create track & suggest routine" }));

    expect(await screen.findByRole("dialog", { name: "Review suggested routine" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Accept" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Edit" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Reject" })).toBeTruthy();
    expect(JSON.parse(localStorage.getItem("repbook-training-tracks") ?? "[]")).toEqual([]);
  });

  it("edits an existing track without deleting its routine", () => {
    const onEdit = vi.fn();
    render(<TrainingTracks
      tracks={[track]}
      activeTrackId={track.id}
      onOpen={vi.fn()}
      onCreate={vi.fn()}
      onGenerate={vi.fn()}
      onDelete={vi.fn()}
      onEdit={onEdit}
    />);

    fireEvent.click(screen.getByRole("button", { name: "Edit Strength base" }));
    fireEvent.change(screen.getByLabelText("Routine name"), { target: { value: "Lower / upper split" } });
    fireEvent.click(screen.getByRole("button", { name: "Save track changes" }));

    expect(onEdit).toHaveBeenCalledWith(track.id, expect.objectContaining({
      name: "Lower / upper split",
    }));
  });

  it("offers mountain biking and swimming as sport tracks", () => {
    render(<TrainingTracks
      tracks={[]}
      activeTrackId=""
      onOpen={vi.fn()}
      onCreate={vi.fn()}
      onGenerate={vi.fn()}
      onDelete={vi.fn()}
    />);

    fireEvent.click(screen.getByRole("button", { name: /Add route/ }));
    fireEvent.click(screen.getByRole("button", { name: "Sport" }));

    expect(screen.getByRole("option", { name: "Mountain biking (MTB)" })).toBeTruthy();
    expect(screen.getByRole("option", { name: "Swimming" })).toBeTruthy();
  });
});

describe("routine exercise controls", () => {
  it("persists manual prescription values without inventing a legacy note", async () => {
    localStorage.setItem("repbook-training-tracks", JSON.stringify([{ ...track, creationMode: "manual", trainingDays: ["monday"], workout: [] }]));
    localStorage.setItem("repbook-training-tracks-initialized", "true");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: vi.fn().mockResolvedValue([exercise]) }));
    render(<App />);
    await screen.findByRole("heading", { name: "Training tracks" });
    fireEvent.click(screen.getByRole("button", { name: /Open active routine/ }));
    fireEvent.click(screen.getByRole("button", { name: "Start creating" }));
    fireEvent.click(screen.getByRole("button", { name: "Choose exercises for this day" }));
    fireEvent.click(screen.getByRole("button", { name: "Select Jump Squat as exercise 1" }));
    fireEvent.click(screen.getByRole("button", { name: "Configure sets and repetitions" }));
    fireEvent.change(screen.getByLabelText("Sets"), { target: { value: "4" } });
    fireEvent.change(screen.getByLabelText("Repetitions"), { target: { value: "8" } });
    fireEvent.click(screen.getByRole("button", { name: "Choose local structure" }));
    fireEvent.click(screen.getByRole("button", { name: "Single set" }));
    fireEvent.click(screen.getByRole("button", { name: "Accept and add single set" }));
    const saved = JSON.parse(localStorage.getItem("repbook-training-tracks") ?? "[]")[0].workout[0];
    expect(saved).toMatchObject({ sets: 4, reps: 8, setPlan: "4 × 8", day: "monday" });
    expect(saved.originalSetPlan).toBeUndefined();
    expect(screen.queryByText(/Original plan note/)).toBeNull();
  });
  it("asks for a route and day before adding an exercise, and can remove an existing placement", () => {
    const onAdd = vi.fn();
    const onRemove = vi.fn();
    const assignedTrack: TrainingTrack = {
      ...track,
      trainingDays: ["monday", "wednesday"],
      workout: [{ id: "existing-jump", exerciseId: exercise.id, sets: 3, reps: 10, day: "monday" }],
    };
    render(<ExerciseAssignmentDialog
      language="es"
      exercise={exercise}
      tracks={[assignedTrack]}
      onClose={vi.fn()}
      onAdd={onAdd}
      onRemove={onRemove}
    />);

    expect(screen.getByRole("dialog", { name: "Gestionar Sentadilla con salto" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Miércoles" }));
    fireEvent.click(screen.getByRole("button", { name: "Agregar a Strength base" }));
    expect(onAdd).toHaveBeenCalledWith(track.id, "wednesday");

    fireEvent.click(screen.getByRole("button", { name: "Quitar de Strength base, Lunes" }));
    expect(onRemove).toHaveBeenCalledWith(track.id, "existing-jump");
  });

  it("opens the animated demo and instructions from a routine exercise", () => {
    const onOpenExercise = vi.fn();
    render(<WorkoutPanel
      items={track.workout}
      exerciseMap={new Map([[exercise.id, exercise]])}
      exercises={[exercise]}
      track={track}
      onClose={vi.fn()}
      onUpdate={vi.fn()}
      onRemove={vi.fn()}
      onSwap={vi.fn()}
      onClear={vi.fn()}
      onGenerate={vi.fn()}
      onOpenExercise={onOpenExercise}
      analysis={{ tone: "ready", headline: "Context supports this plan", points: ["Strength is the primary focus."] }}
      onOpenProfile={vi.fn()}
    />);

    const demoButton = screen.queryByRole("button", { name: "View Jump Squat demo and steps" });
    expect(demoButton).not.toBeNull();
    if (!demoButton) return;
    fireEvent.click(demoButton);

    expect(onOpenExercise).toHaveBeenCalledWith(exercise);
  });

  it("offers to suggest a routine when a track has no movements", () => {
    const onGenerate = vi.fn();
    render(<WorkoutPanel
      items={[]}
      exerciseMap={new Map()}
      exercises={[exercise]}
      track={{ ...track, workout: [] }}
      onClose={vi.fn()}
      onUpdate={vi.fn()}
      onRemove={vi.fn()}
      onSwap={vi.fn()}
      onClear={vi.fn()}
      onGenerate={onGenerate}
      onOpenExercise={vi.fn()}
      analysis={{ tone: "setup", headline: "Add context before personalizing", points: ["Complete your body profile."] }}
      onOpenProfile={vi.fn()}
    />);

    fireEvent.click(screen.getByRole("button", { name: "Suggest this routine" }));

    expect(onGenerate).toHaveBeenCalledOnce();
  });

  it("adds a searched exercise to the selected day in a manual routine", () => {
    const onGenerate = vi.fn();
    const onAddExercise = vi.fn();
    render(<WorkoutPanel
      items={[]}
      exerciseMap={new Map([[exercise.id, exercise]])}
      exercises={[exercise]}
      track={{
        ...track,
        workout: [],
        creationMode: "manual",
        daysPerWeek: 2,
        trainingDays: ["monday", "wednesday"],
      }}
      onClose={vi.fn()}
      onUpdate={vi.fn()}
      onAddStructure={onAddExercise}
      onRemove={vi.fn()}
      onSwap={vi.fn()}
      onClear={vi.fn()}
      onGenerate={onGenerate}
      onOpenExercise={vi.fn()}
      analysis={{ tone: "ready", headline: "Context supports this plan", points: ["Strength is the primary focus."] }}
      onOpenProfile={vi.fn()}
    />);

    expect(screen.queryByText("Why this routine")).toBeNull();
    expect(screen.queryByRole("button", { name: "Suggest this routine" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Start creating" }));
    fireEvent.click(screen.getByRole("button", { name: "Wednesday" }));
    fireEvent.click(screen.getByRole("button", { name: "Choose exercises for this day" }));
    fireEvent.change(screen.getByLabelText("Search exercise 1"), { target: { value: "quadriceps" } });
    fireEvent.click(screen.getByRole("button", { name: "Select Jump Squat as exercise 1" }));
    fireEvent.click(screen.getByRole("button", { name: "Configure sets and repetitions" }));
    fireEvent.click(screen.getByRole("button", { name: "Choose local structure" }));
    fireEvent.click(screen.getByRole("button", { name: "Single set" }));
    fireEvent.click(screen.getByRole("button", { name: "Accept and add single set" }));

    expect(onGenerate).not.toHaveBeenCalled();
    expect(onAddExercise).toHaveBeenCalledWith("single", [exercise.id], "wednesday", [expect.objectContaining({ sets: 3, reps: 10 })]);
  });

  it("starts manual building with the day and a free structure choice, with no exercise field yet", () => {
    render(<WorkoutPanel
      language="es"
      items={[]}
      exerciseMap={new Map([[exercise.id, exercise]])}
      exercises={[exercise]}
      track={{
        ...track,
        workout: [],
        creationMode: "manual",
        trainingDays: ["monday"],
      }}
      onClose={vi.fn()}
      onUpdate={vi.fn()}
      onAddExercise={vi.fn()}
      onRemove={vi.fn()}
      onSwap={vi.fn()}
      onClear={vi.fn()}
      onGenerate={vi.fn()}
      onOpenExercise={vi.fn()}
      analysis={{ tone: "ready", headline: "El contexto respalda este plan", points: [] }}
      onOpenProfile={vi.fn()}
    />);

    fireEvent.click(screen.getByRole("button", { name: "Empezar a crear" }));

    expect(screen.getByRole("button", { name: "Elegir ejercicios para este día" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Monoserie" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Biserie" })).toBeTruthy();
    expect(screen.queryByLabelText("Buscar ejercicio 1")).toBeNull();
  });

  it("collects two exercise fields before adding a biset", () => {
    const onAddStructure = vi.fn();
    const TestPanel = WorkoutPanel as unknown as React.ComponentType<Record<string, unknown>>;
    render(<TestPanel
      language="es"
      items={[]}
      exerciseMap={new Map([[exercise.id, exercise], [pressExercise.id, pressExercise]])}
      exercises={[exercise, pressExercise]}
      track={{ ...track, workout: [], creationMode: "manual", trainingDays: ["monday"] }}
      onClose={vi.fn()}
      onUpdate={vi.fn()}
      onAddStructure={onAddStructure}
      onRemove={vi.fn()}
      onSwap={vi.fn()}
      onClear={vi.fn()}
      onGenerate={vi.fn()}
      onOpenExercise={vi.fn()}
      analysis={{ tone: "ready", headline: "El contexto respalda este plan", points: [] }}
      onOpenProfile={vi.fn()}
    />);

    fireEvent.click(screen.getByRole("button", { name: "Empezar a crear" }));
    fireEvent.click(screen.getByRole("button", { name: "Elegir ejercicios para este día" }));
    fireEvent.change(screen.getByLabelText("Buscar ejercicio 1"), { target: { value: "jump" } });
    fireEvent.click(screen.getByRole("button", { name: "Seleccionar Sentadilla con salto como ejercicio 1" }));
    fireEvent.click(screen.getByRole("button", { name: "Agregar otro ejercicio" }));
    expect((screen.getByRole("button", { name: "Configurar series y repeticiones" }) as HTMLButtonElement).disabled).toBe(true);
    fireEvent.change(screen.getByLabelText("Buscar ejercicio 2"), { target: { value: "shoulder" } });
    fireEvent.click(screen.getByRole("button", { name: "Seleccionar Press de hombros sentado con mancuernas como ejercicio 2" }));
    fireEvent.click(screen.getByRole("button", { name: "Configurar series y repeticiones" }));
    fireEvent.change(screen.getByLabelText("Series para Sentadilla con salto"), { target: { value: "4" } });
    fireEvent.change(screen.getByLabelText("Repeticiones para Sentadilla con salto"), { target: { value: "12" } });
    fireEvent.click(screen.getByRole("button", { name: "Elegir estructura local" }));
    fireEvent.click(screen.getByRole("button", { name: "Biserie" }));
    fireEvent.click(screen.getByRole("button", { name: "Aceptar y agregar biserie" }));

    expect(onAddStructure).toHaveBeenCalledWith("biset", [exercise.id, pressExercise.id], "monday", [expect.objectContaining({ sets: 4, reps: 12, prescriptionMode: "standard" }), expect.objectContaining({ sets: 3, reps: 10, prescriptionMode: "standard" })]);
  });

  it("opens the exercise preview from a manual routine search result", () => {
    const onOpenExercise = vi.fn();
    const onAddExercise = vi.fn();
    render(<WorkoutPanel
      language="es"
      items={[]}
      exerciseMap={new Map([[exercise.id, exercise]])}
      exercises={[exercise]}
      track={{
        ...track,
        workout: [],
        creationMode: "manual",
        trainingDays: ["monday"],
      }}
      onClose={vi.fn()}
      onUpdate={vi.fn()}
      onAddExercise={onAddExercise}
      onRemove={vi.fn()}
      onSwap={vi.fn()}
      onClear={vi.fn()}
      onGenerate={vi.fn()}
      onOpenExercise={onOpenExercise}
      analysis={{ tone: "ready", headline: "El contexto respalda este plan", points: ["La fuerza es el foco principal."] }}
      onOpenProfile={vi.fn()}
    />);

    fireEvent.click(screen.getByRole("button", { name: "Empezar a crear" }));
    fireEvent.click(screen.getByRole("button", { name: "Elegir ejercicios para este día" }));
    fireEvent.click(screen.getByRole("button", { name: "Ver Sentadilla con salto demostración y pasos" }));

    expect(onOpenExercise).toHaveBeenCalledWith(exercise);
    expect(onAddExercise).not.toHaveBeenCalled();
  });

  it("shows why a routine fits the health context", () => {
    const onOpenProfile = vi.fn();
    render(<WorkoutPanel
      items={track.workout}
      exerciseMap={new Map([[exercise.id, exercise]])}
      exercises={[exercise]}
      track={track}
      onClose={vi.fn()}
      onUpdate={vi.fn()}
      onRemove={vi.fn()}
      onSwap={vi.fn()}
      onClear={vi.fn()}
      onGenerate={vi.fn()}
      onOpenExercise={vi.fn()}
      analysis={{
        tone: "watch",
        headline: "Recovery needs attention",
        points: ["Your latest check-in suggests limited recovery."],
      }}
      onOpenProfile={onOpenProfile}
    />);

    expect(screen.getByText("Recovery needs attention")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Review health profile" }));
    expect(onOpenProfile).toHaveBeenCalledOnce();
  });

  it("keeps routine editing separate from logging today’s workout", () => {
    const onUpdateItem = vi.fn();
    const onLogLoad = vi.fn();
    const scheduledTrack = {
      ...track,
      trainingDays: ["monday" as const, "wednesday" as const],
      dayLabels: { monday: "Lower body" },
      workout: [{
        ...track.workout[0],
        id: "monday-jump-squat",
        day: "monday" as const,
        setPlan: "3 × 8",
        loadKg: 90,
      }],
    };
    render(<WorkoutPanel
      items={scheduledTrack.workout}
      exerciseMap={new Map([[exercise.id, exercise]])}
      exercises={[exercise]}
      track={scheduledTrack}
      onClose={vi.fn()}
      onUpdate={vi.fn()}
      onUpdateItem={onUpdateItem}
      onSetDayLabel={vi.fn()}
      onAddExercise={vi.fn()}
      onLogLoad={onLogLoad}
      onRemove={vi.fn()}
      onSwap={vi.fn()}
      onClear={vi.fn()}
      onGenerate={vi.fn()}
      onOpenExercise={vi.fn()}
      analysis={{ tone: "ready", headline: "Context supports this plan", points: ["Strength is the primary focus."] }}
      onOpenProfile={vi.fn()}
    />);

    expect(screen.getByRole("button", { name: "Start today’s workout" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Log today’s load for Jump Squat" })).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Edit routine" }));
    fireEvent.click(screen.getByRole("button", { name: "Monday" }));
    fireEvent.change(screen.getByLabelText("Training day for Jump Squat"), { target: { value: "wednesday" } });

    expect(onUpdateItem).toHaveBeenCalledWith("monday-jump-squat", expect.objectContaining({ day: "wednesday" }));
    expect(screen.queryByRole("button", { name: "Log today’s load for Jump Squat" })).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Back to routine" }));
    fireEvent.click(screen.getByRole("button", { name: "Start today’s workout" }));
    fireEvent.click(screen.getByRole("button", { name: "Review my answer" }));
    fireEvent.click(screen.getByRole("button", { name: "Monday" }));
    fireEvent.change(screen.getByLabelText("Load in kilograms for Jump Squat"), { target: { value: "95" } });
    fireEvent.click(screen.getByRole("button", { name: "Log today’s load for Jump Squat" }));

    expect(onUpdateItem).toHaveBeenCalledWith("monday-jump-squat", expect.objectContaining({ loadKg: 95 }));
    expect(onLogLoad).toHaveBeenCalledWith("monday-jump-squat");
  });

  it("uses the lower controls as the only editable source for the set plan", () => {
    const onUpdate = vi.fn();
    const mismatchedItem = {
      ...track.workout[0],
      id: "monday-jump-squat",
      day: "monday" as const,
      sets: 3,
      reps: 10,
      setPlan: "3 × 8",
    };
    render(<WorkoutPanel
      items={[mismatchedItem]}
      exerciseMap={new Map([[exercise.id, exercise]])}
      exercises={[exercise]}
      track={{ ...track, workout: [mismatchedItem], creationMode: "manual", trainingDays: ["monday"] }}
      initialMode="edit"
      onClose={vi.fn()}
      onUpdate={onUpdate}
      onUpdateItem={vi.fn()}
      onRemove={vi.fn()}
      onSwap={vi.fn()}
      onClear={vi.fn()}
      onGenerate={vi.fn()}
      onOpenExercise={vi.fn()}
      analysis={{ tone: "ready", headline: "Context supports this plan", points: [] }}
      onOpenProfile={vi.fn()}
    />);

    expect(screen.queryByLabelText("Set plan for Jump Squat")).toBeNull();
    expect(screen.queryByText("Original plan note: 3 × 8")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Increase repetitions" }));
    expect(onUpdate).toHaveBeenCalledWith("monday-jump-squat", "reps", 1);
  });

  it("shows a brief explanation beside every advanced technique choice", () => {
    const onUpdateItem = vi.fn();
    const specialItem = {
      ...track.workout[0],
      prescriptionMode: "special" as const,
      specialPrescription: createSpecialPrescription("rest-pause"),
    };
    const { rerender } = render(<WorkoutPanel
      language="es"
      items={track.workout}
      exerciseMap={new Map([[exercise.id, exercise]])}
      exercises={[exercise]}
      track={{ ...track, creationMode: "manual", trainingDays: ["monday"] }}
      initialMode="edit"
      onClose={vi.fn()}
      onUpdate={vi.fn()}
      onUpdateItem={onUpdateItem}
      onRemove={vi.fn()}
      onSwap={vi.fn()}
      onClear={vi.fn()}
      onGenerate={vi.fn()}
      onOpenExercise={vi.fn()}
      analysis={{ tone: "ready", headline: "El contexto respalda este plan", points: [] }}
      onOpenProfile={vi.fn()}
    />);

    fireEvent.click(screen.getByRole("button", { name: "Configuración especial" }));
    expect(onUpdateItem).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
      prescriptionMode: "special",
      specialPrescription: expect.objectContaining({ technique: "rest-pause" }),
    }));

    rerender(<WorkoutPanel
      language="es"
      items={[specialItem]}
      exerciseMap={new Map([[exercise.id, exercise]])}
      exercises={[exercise]}
      track={{ ...track, workout: [specialItem], creationMode: "manual", trainingDays: ["monday"] }}
      initialMode="edit"
      onClose={vi.fn()}
      onUpdate={vi.fn()}
      onUpdateItem={onUpdateItem}
      onRemove={vi.fn()}
      onSwap={vi.fn()}
      onClear={vi.fn()}
      onGenerate={vi.fn()}
      onOpenExercise={vi.fn()}
      analysis={{ tone: "ready", headline: "El contexto respalda este plan", points: [] }}
      onOpenProfile={vi.fn()}
    />);

    expect(screen.getByText(/Divide una serie exigente en bloques de trabajo/)).toBeTruthy();
    expect(screen.getByText(/Continúa la serie reduciendo la carga/)).toBeTruthy();
    expect(screen.getByText(/Agrega descansos breves y planificados/)).toBeTruthy();
  });

  it("checks for new warning symptoms before starting today’s workout", () => {
    render(<WorkoutPanel
      items={track.workout}
      exerciseMap={new Map([[exercise.id, exercise]])}
      exercises={[exercise]}
      track={track}
      onClose={vi.fn()}
      onUpdate={vi.fn()}
      onUpdateItem={vi.fn()}
      onLogLoad={vi.fn()}
      onRemove={vi.fn()}
      onSwap={vi.fn()}
      onClear={vi.fn()}
      onGenerate={vi.fn()}
      onOpenExercise={vi.fn()}
      analysis={{ tone: "ready", headline: "Context supports this plan", points: ["Strength is the primary focus."] }}
      onOpenProfile={vi.fn()}
    />);

    fireEvent.click(screen.getByRole("button", { name: "Start today’s workout" }));

    expect(screen.getByRole("dialog", { name: "Check how you feel before starting" })).toBeTruthy();
    fireEvent.click(screen.getByRole("checkbox", { name: /new chest pain, pressure, dizziness or fainting/i }));
    fireEvent.click(screen.getByRole("button", { name: "Review my answer" }));

    expect(screen.getByText(/do not start this workout/i)).toBeTruthy();
    expect(screen.queryByLabelText("Load in kilograms for Jump Squat")).toBeNull();
  });

  it("shows accept, edit, and reject actions for a regular suggested route", () => {
    const onAccept = vi.fn();
    const onEdit = vi.fn();
    const onReject = vi.fn();
    render(<InitialRoutineProposal
      language="en"
      variant="track"
      track={track}
      exerciseMap={new Map([[exercise.id, exercise]])}
      onOpenExercise={vi.fn()}
      onAccept={onAccept}
      onEdit={onEdit}
      onReject={onReject}
    />);

    expect(screen.getByRole("dialog", { name: "Review suggested routine" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Accept" }));
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    fireEvent.click(screen.getByRole("button", { name: "Reject" }));

    expect(onAccept).toHaveBeenCalledOnce();
    expect(onEdit).toHaveBeenCalledOnce();
    expect(onReject).toHaveBeenCalledOnce();
  });

  it("keeps a suggested routine as a review-only draft when warning symptoms are reported", () => {
    const onAccept = vi.fn();
    const onEdit = vi.fn();
    const onReviewHealth = vi.fn();
    render(<InitialRoutineProposal
      language="en"
      track={track}
      exerciseMap={new Map([[exercise.id, exercise]])}
      readiness={{
        level: "professional-review",
        reasons: ["You reported chest pain or pressure."],
      }}
      onOpenExercise={vi.fn()}
      onAccept={onAccept}
      onEdit={onEdit}
      onReject={vi.fn()}
      onReviewHealth={onReviewHealth}
    />);

    expect(screen.getByRole("button", { name: "Accept" }).hasAttribute("disabled")).toBe(true);
    expect(screen.getByRole("button", { name: "Edit" }).hasAttribute("disabled")).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "Review health information" }));

    expect(onAccept).not.toHaveBeenCalled();
    expect(onEdit).not.toHaveBeenCalled();
    expect(onReviewHealth).toHaveBeenCalledOnce();
  });

  it("opens movement details from the suggested-routine review", () => {
    const onOpenExercise = vi.fn();
    render(<InitialRoutineProposal
      language="es"
      track={track}
      exerciseMap={new Map([[exercise.id, exercise]])}
      onOpenExercise={onOpenExercise}
      onAccept={vi.fn()}
      onEdit={vi.fn()}
      onReject={vi.fn()}
    />);

    fireEvent.click(screen.getByRole("button", { name: "Ver Sentadilla con salto" }));

    expect(onOpenExercise).toHaveBeenCalledWith(exercise);
  });

  it("makes the return path explicit when a movement was opened from routine editing", () => {
    const onClose = vi.fn();
    render(<ExerciseDetail
      language="es"
      origin="workout"
      exercise={exercise}
      isFavorite={false}
      inWorkout
      onClose={onClose}
      onToggleFavorite={vi.fn()}
      onAdd={vi.fn()}
    />);

    fireEvent.click(screen.getByRole("button", { name: "Conservar y volver a la rutina" }));

    expect(onClose).toHaveBeenCalledOnce();
  });

  it("labels the add action as the current route only when opened from a route", () => {
    const { rerender } = render(<ExerciseDetail
      language="es"
      origin="workout"
      exercise={exercise}
      isFavorite={false}
      inWorkout={false}
      onClose={vi.fn()}
      onToggleFavorite={vi.fn()}
      onAdd={vi.fn()}
    />);

    expect(screen.getByRole("button", { name: "Agregar a esta ruta" })).toBeTruthy();

    rerender(<ExerciseDetail
      language="es"
      origin="library"
      exercise={exercise}
      isFavorite={false}
      inWorkout={false}
      onClose={vi.fn()}
      onToggleFavorite={vi.fn()}
      onAdd={vi.fn()}
    />);

    expect(screen.getByRole("button", { name: "Agregar a una ruta" })).toBeTruthy();
  });

  it("explains how free-text health notes are handled before accepting a suggestion", () => {
    render(<InitialRoutineProposal
      language="es"
      track={track}
      exerciseMap={new Map([[exercise.id, exercise]])}
      healthNotes="Dolor de rodilla; seguir indicaciones del fisioterapeuta."
      onOpenExercise={vi.fn()}
      onAccept={vi.fn()}
      onEdit={vi.fn()}
      onReject={vi.fn()}
    />);

    expect(screen.getByText("Tu nota de salud guardada necesita tu revisión.")).toBeTruthy();
    expect(screen.getByText(/no interpreta médicamente el texto libre/i)).toBeTruthy();
  });
});

describe("profile access", () => {
  it("moves training/account access into the drawer and retains the header gates without health consent", () => {
    accessMock.overrides = { healthDataConsent: "declined" };
    vi.stubGlobal("fetch", vi.fn(() => new Promise(() => undefined)));
    render(<App />);
    expect(document.querySelector(".shared-navigation")!.children).toHaveLength(2);
    expect(screen.queryByRole("button", { name: "Open profile" })).toBeNull();
    openNavigation();
    expect(screen.getByRole("button", { name: "Open profile" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Exercise library" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Open account and synchronization" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Account / privacy" })).toBeTruthy();
    fireEvent.click(document.querySelector(".navigation-panel .workout-trigger")!);
    expect(screen.queryByRole("dialog", { name: "Navigation" })).toBeNull();
    // The existing consent gate still controls whether the destination can render.
    expect(screen.getByRole("button", { name: "Open navigation" }).getAttribute("aria-expanded")).toBe("false");
  });
  it("opens account and phone installation guidance from the shared header menu", () => {
    vi.stubGlobal("fetch", vi.fn(() => new Promise(() => undefined)));
    render(<App />);

    expect(screen.queryByRole("button", { name: "Android installation instructions" })).toBeNull();
    expect(screen.queryByRole("button", { name: "iPhone installation instructions" })).toBeNull();
    openNavigation();
    fireEvent.click(screen.getByRole("button", { name: "Open account and synchronization" }));

    expect(screen.getByRole("dialog", { name: "Access Aunara anywhere" })).toBeTruthy();
    expect(screen.getByText("Android")).toBeTruthy();
    expect(screen.getByText("iPhone")).toBeTruthy();
  });

  it("opens a visible profile summary from the shared header menu", () => {
    vi.stubGlobal("fetch", vi.fn(() => new Promise(() => undefined)));
    render(<App />);

    openNavigation();
    fireEvent.click(screen.getByRole("button", { name: "Open profile" }));

    expect(screen.getByRole("dialog", { name: "My profile" })).toBeTruthy();
  });

  it("edits body data from the health profile tab", () => {
    const onHealthProfileChange = vi.fn();
    render(<ProfilePanel
      name="My profile"
      tracks={[track]}
      activeTrackId={track.id}
      favoriteCount={0}
      healthProfile={healthProfile}
      checkIns={[]}
      onNameChange={vi.fn()}
      onHealthProfileChange={onHealthProfileChange}
      onAddCheckIn={vi.fn()}
      onOpenTrack={vi.fn()}
      onClose={vi.fn()}
    />);

    fireEvent.click(screen.getByRole("button", { name: "Body and health" }));
    const nextBirthDate = `${new Date().getFullYear() - 36}-01-01`;
    fireEvent.change(screen.getByLabelText("Date of birth"), { target: { value: nextBirthDate } });
    fireEvent.change(screen.getByLabelText("Current weight in kilograms"), { target: { value: "81.5" } });

    expect(onHealthProfileChange).toHaveBeenCalledWith({
      ...healthProfile,
      birthDate: nextBirthDate,
      ageYears: 36,
    });
    expect(onHealthProfileChange).toHaveBeenCalledWith({
      ...healthProfile,
      currentWeightKg: 81.5,
    });
  });

  it("keeps sensitive profile fields unavailable after health authorization is withdrawn", () => {
    const onRequestHealthConsent = vi.fn();
    render(<ProfilePanel
      name="My profile"
      tracks={[track]}
      activeTrackId={track.id}
      favoriteCount={0}
      healthProfile={healthProfile}
      checkIns={[]}
      healthDataConsent={false}
      onNameChange={vi.fn()}
      onHealthProfileChange={vi.fn()}
      onAddCheckIn={vi.fn()}
      onOpenTrack={vi.fn()}
      onRequestHealthConsent={onRequestHealthConsent}
      onClose={vi.fn()}
    />);

    fireEvent.click(screen.getByRole("button", { name: "Body and health" }));

    expect(screen.getByText(/remain unavailable in basic mode/i)).toBeTruthy();
    expect(screen.queryByLabelText("Current weight in kilograms")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Authorize health personalization" }));
    expect(onRequestHealthConsent).toHaveBeenCalledOnce();
  });

  it("uses neutral BMI context and optional body-composition fields", () => {
    const onHealthProfileChange = vi.fn();
    render(<ProfilePanel
      name="My profile"
      tracks={[track]}
      activeTrackId={track.id}
      favoriteCount={0}
      healthProfile={healthProfile}
      checkIns={[]}
      onNameChange={vi.fn()}
      onHealthProfileChange={onHealthProfileChange}
      onAddCheckIn={vi.fn()}
      onOpenTrack={vi.fn()}
      onClose={vi.fn()}
    />);

    fireEvent.click(screen.getByRole("button", { name: "Body and health" }));

    expect(screen.getByText(/BMI means Body Mass Index/)).toBeTruthy();
    expect(screen.getByText(/weight in kilograms divided by height in metres squared/)).toBeTruthy();
    expect(screen.getByText(/BMI does not distinguish bone, muscle, fat distribution/)).toBeTruthy();
    fireEvent.change(screen.getByLabelText("Body fat percentage"), { target: { value: "24.5" } });
    fireEvent.change(screen.getByLabelText("Muscle percentage"), { target: { value: "38" } });
    fireEvent.change(screen.getByLabelText("Visceral fat level"), { target: { value: "10" } });

    expect(onHealthProfileChange).toHaveBeenCalledWith({ ...healthProfile, bodyFatPercent: 24.5 });
    expect(onHealthProfileChange).toHaveBeenCalledWith({ ...healthProfile, musclePercent: 38 });
    expect(onHealthProfileChange).toHaveBeenCalledWith({ ...healthProfile, visceralFatLevel: 10 });
  });

  it("captures exercise-readiness warnings separately from free-form health notes", () => {
    const onHealthProfileChange = vi.fn();
    render(<ProfilePanel
      name="My profile"
      tracks={[track]}
      activeTrackId={track.id}
      favoriteCount={0}
      healthProfile={healthProfile}
      checkIns={[]}
      onNameChange={vi.fn()}
      onHealthProfileChange={onHealthProfileChange}
      onAddCheckIn={vi.fn()}
      onOpenTrack={vi.fn()}
      onClose={vi.fn()}
    />);

    fireEvent.click(screen.getByRole("button", { name: "Body and health" }));

    expect(screen.getByRole("heading", { name: "Exercise readiness" })).toBeTruthy();
    fireEvent.click(screen.getByRole("checkbox", { name: /chest pain or pressure/i }));
    expect(onHealthProfileChange).toHaveBeenCalledWith(expect.objectContaining({
      readinessScreen: expect.objectContaining({ chestPain: true }),
    }));
  });

  it("creates daily food options and recipe ideas from preferred ingredients", () => {
    render(<ProfilePanel
      name="My profile"
      tracks={[track]}
      activeTrackId={track.id}
      favoriteCount={0}
      healthProfile={{
        ...healthProfile,
        preferredIngredients: ["egg", "white-rice-cooked", "spinach-raw", "olive-oil"],
      }}
      checkIns={[]}
      onNameChange={vi.fn()}
      onHealthProfileChange={vi.fn()}
      onAddCheckIn={vi.fn()}
      onOpenTrack={vi.fn()}
      onClose={vi.fn()}
    />);

    fireEvent.click(screen.getByRole("button", { name: "Body and health" }));
    fireEvent.click(screen.getByRole("button", { name: "Create daily food options" }));

    expect(screen.getByRole("heading", { name: "Breakfast" })).toBeTruthy();
    expect(screen.getByText(/Protein target/)).toBeTruthy();
    expect(screen.getAllByText(/grams of the protein nutrient—not grams of food/)).toHaveLength(2);
    expect(screen.getByText(/180 g of cooked lean beef.*about 55 g of protein/i)).toBeTruthy();
    expect(screen.getByRole("link", { name: "USDA FoodData Central source" }).getAttribute("href"))
      .toBe("https://fdc.nal.usda.gov/food-details/170641/nutrients");
    expect(screen.getByText("11 food groups · 95 ingredients")).toBeTruthy();
    expect(screen.getByText(/Grains.*18/)).toBeTruthy();
    expect(screen.getByText(/Vegetables.*9/)).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Create recipe ideas" }));
    expect(screen.getByRole("heading", { name: /Egg.*cooked white rice.*raw spinach/i })).toBeTruthy();
  });

  it("shows a coherent macro plan separately from the simple plan", () => {
    render(<ProfilePanel
      name="My profile"
      tracks={[track]}
      activeTrackId={track.id}
      favoriteCount={0}
      healthProfile={{
        ...healthProfile,
        nutritionPlanMode: "macros",
        macroMealsPerDay: 4,
      }}
      checkIns={[]}
      onNameChange={vi.fn()}
      onHealthProfileChange={vi.fn()}
      onAddCheckIn={vi.fn()}
      onOpenTrack={vi.fn()}
      onClose={vi.fn()}
    />);

    fireEvent.click(screen.getByRole("button", { name: "Body and health" }));

    expect(screen.getByRole("button", { name: /Macro-based nutrition plan/ }).getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByText("2,800 kcal")).toBeTruthy();
    expect(screen.getByText(/35 g protein.*88 g carbs.*23 g fat/)).toBeTruthy();
    expect(screen.getByText(/does not silently add a calorie deficit or surplus/i)).toBeTruthy();
    expect(screen.getByRole("button", { name: "Choose foods for this plan" })).toBeTruthy();
  });

  it("shows only equipment matching the selected body part", async () => {
    const upperLegSmith = { ...exercise, id: "smith", equipment: "smith machine" };
    const chestBarbell = { ...exercise, id: "barbell", body_part: "chest", equipment: "barbell" };
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue([exercise, upperLegSmith, chestBarbell]),
    }));
    render(<App />);

    openNavigation();
    fireEvent.click(screen.getByRole("button", { name: "Exercise library" }));
    await screen.findByRole("heading", { name: "Exercise library" });
    fireEvent.change(screen.getByLabelText("Body part"), { target: { value: "upper legs" } });

    const equipmentSelect = screen.getByLabelText("Equipment");
    expect(equipmentSelect.querySelector('option[value="smith machine"]')).not.toBeNull();
    expect(equipmentSelect.querySelector('option[value="body weight"]')).not.toBeNull();
    expect(equipmentSelect.querySelector('option[value="barbell"]')).toBeNull();
  });

  it("saves a weekly recovery check-in", () => {
    const onAddCheckIn = vi.fn();
    render(<ProfilePanel
      name="My profile"
      tracks={[track]}
      activeTrackId={track.id}
      favoriteCount={0}
      healthProfile={healthProfile}
      checkIns={[]}
      onNameChange={vi.fn()}
      onHealthProfileChange={vi.fn()}
      onAddCheckIn={onAddCheckIn}
      onOpenTrack={vi.fn()}
      onClose={vi.fn()}
    />);

    fireEvent.click(screen.getByRole("button", { name: "Weekly check-in" }));
    fireEvent.change(screen.getByLabelText("Average sleep hours"), { target: { value: "7.5" } });
    fireEvent.click(screen.getByRole("button", { name: "Save weekly check-in" }));

    expect(onAddCheckIn).toHaveBeenCalledWith(expect.objectContaining({
      weightKg: 82,
      sleepHours: 7.5,
      energy: 3,
      stress: 3,
    }));
  });

  it("shows planning ranges and searches USDA foods", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        foods: [{
          fdcId: 123,
          description: "Bananas, raw",
          dataType: "Foundation",
          foodNutrients: [
            { nutrientName: "Energy", unitName: "KCAL", value: 89 },
            { nutrientName: "Protein", unitName: "G", value: 1.1 },
          ],
        }],
      }),
    }));
    render(<ProfilePanel
      name="My profile"
      tracks={[track]}
      activeTrackId={track.id}
      favoriteCount={0}
      healthProfile={healthProfile}
      checkIns={[]}
      onNameChange={vi.fn()}
      onHealthProfileChange={vi.fn()}
      onAddCheckIn={vi.fn()}
      onOpenTrack={vi.fn()}
      onClose={vi.fn()}
    />);

    expect(screen.queryByRole("button", { name: "Nutrition" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Body and health" }));
    expect(screen.getByText("115–164 g")).toBeTruthy();
    fireEvent.change(screen.getByLabelText("Search USDA foods"), { target: { value: "banana" } });
    fireEvent.click(screen.getByRole("button", { name: "Search foods" }));

    expect(await screen.findByText("Bananas, raw")).toBeTruthy();
  });

  it("keeps visible profile copy in Spanish when Spanish is selected", async () => {
    render(<ProfilePanel
      language="es"
      name="Mi perfil"
      tracks={[track]}
      activeTrackId={track.id}
      favoriteCount={0}
      healthProfile={healthProfile}
      checkIns={[]}
      onNameChange={vi.fn()}
      onHealthProfileChange={vi.fn()}
      onAddCheckIn={vi.fn()}
      onOpenTrack={vi.fn()}
      onClose={vi.fn()}
    />);

    expect(screen.getByRole("button", { name: "Listo" })).toBeTruthy();
    expect(screen.queryByText("Done")).toBeNull();
  });
});
