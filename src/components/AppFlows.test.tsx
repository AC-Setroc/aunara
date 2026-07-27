// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Exercise, HealthProfile, TrainingTrack } from "../types";
import { ProfilePanel } from "./ProfilePanel";
import { TrainingTracks } from "./TrainingTracks";
import { WorkoutPanel } from "./WorkoutPanel";

vi.mock("../hooks/useCloudSync", () => ({
  useCloudSync: () => ({
    configured: true,
    email: "athlete@example.com",
    status: "synced",
    createAccount: vi.fn(),
    signIn: vi.fn(),
    signOut: vi.fn(),
  }),
}));

import App from "../App";

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

afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.unstubAllGlobals();
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

    fireEvent.click(screen.getByRole("button", { name: /Add another track/ }));

    expect(screen.getByRole("option", { name: "Mixed" })).toBeTruthy();
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

    fireEvent.click(screen.getByRole("button", { name: /Add another track/ }));
    fireEvent.click(screen.getByRole("button", { name: "Sport" }));

    expect(screen.getByRole("option", { name: "Mountain biking (MTB)" })).toBeTruthy();
    expect(screen.getByRole("option", { name: "Swimming" })).toBeTruthy();
  });
});

describe("routine exercise controls", () => {
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
});

describe("profile access", () => {
  it("opens account and phone installation guidance from the header", () => {
    vi.stubGlobal("fetch", vi.fn(() => new Promise(() => undefined)));
    render(<App />);

    expect(screen.queryByRole("button", { name: "Android installation instructions" })).toBeNull();
    expect(screen.queryByRole("button", { name: "iPhone installation instructions" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Open account and synchronization" }));

    expect(screen.getByRole("dialog", { name: "Access Repbook anywhere" })).toBeTruthy();
    expect(screen.getByText("Android")).toBeTruthy();
    expect(screen.getByText("iPhone")).toBeTruthy();
  });

  it("opens a visible profile summary from the header", () => {
    vi.stubGlobal("fetch", vi.fn(() => new Promise(() => undefined)));
    render(<App />);

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
    fireEvent.change(screen.getByLabelText("Current weight in kilograms"), { target: { value: "81.5" } });

    expect(onHealthProfileChange).toHaveBeenCalledWith({
      ...healthProfile,
      currentWeightKg: 81.5,
    });
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

    fireEvent.click(screen.getByRole("button", { name: "Nutrition" }));
    expect(screen.getByText("98–131 g")).toBeTruthy();
    fireEvent.change(screen.getByLabelText("Search USDA foods"), { target: { value: "banana" } });
    fireEvent.click(screen.getByRole("button", { name: "Search foods" }));

    expect(await screen.findByText("Bananas, raw")).toBeTruthy();
  });
});
