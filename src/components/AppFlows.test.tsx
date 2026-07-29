// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Exercise, HealthProfile, TrainingTrack } from "../types";
import { ProfilePanel } from "./ProfilePanel";
import { ExerciseAssignmentDialog } from "./ExerciseAssignmentDialog";
import { ExerciseDetail } from "./ExerciseDetail";
import { InitialRoutineProposal } from "./InitialRoutineProposal";
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

    fireEvent.click(screen.getByRole("button", { name: /Add another track/ }));
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
    fireEvent.click(screen.getByRole("button", { name: /Add another track/ }));
    fireEvent.click(screen.getByRole("button", { name: "Create track & suggest routine" }));

    expect(await screen.findByRole("dialog", { name: "Review suggested routine" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Accept routine" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Accept and edit" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Reject proposal" })).toBeTruthy();
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

    fireEvent.click(screen.getByRole("button", { name: /Add another track/ }));
    fireEvent.click(screen.getByRole("button", { name: "Sport" }));

    expect(screen.getByRole("option", { name: "Mountain biking (MTB)" })).toBeTruthy();
    expect(screen.getByRole("option", { name: "Swimming" })).toBeTruthy();
  });
});

describe("routine exercise controls", () => {
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
      onAddExercise={onAddExercise}
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
    fireEvent.change(screen.getByLabelText("Search exercises to add"), { target: { value: "quadriceps" } });
    fireEvent.click(screen.getByRole("button", { name: "Add Jump Squat to Wednesday" }));

    expect(onGenerate).not.toHaveBeenCalled();
    expect(onAddExercise).toHaveBeenCalledWith(exercise.id, "wednesday");
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
    fireEvent.change(screen.getByLabelText("Training day for Jump Squat"), { target: { value: "wednesday" } });
    fireEvent.change(screen.getByLabelText("Set plan for Jump Squat"), { target: { value: "3 × 8 + 2 to failure" } });

    expect(onUpdateItem).toHaveBeenCalledWith("monday-jump-squat", expect.objectContaining({ day: "wednesday" }));
    expect(onUpdateItem).toHaveBeenCalledWith("monday-jump-squat", expect.objectContaining({ setPlan: "3 × 8 + 2 to failure" }));
    expect(screen.queryByRole("button", { name: "Log today’s load for Jump Squat" })).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Back to routine" }));
    fireEvent.click(screen.getByRole("button", { name: "Start today’s workout" }));
    fireEvent.change(screen.getByLabelText("Load in kilograms for Jump Squat"), { target: { value: "95" } });
    fireEvent.click(screen.getByRole("button", { name: "Log today’s load for Jump Squat" }));

    expect(onUpdateItem).toHaveBeenCalledWith("monday-jump-squat", expect.objectContaining({ loadKg: 95 }));
    expect(onLogLoad).toHaveBeenCalledWith("monday-jump-squat");
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
    fireEvent.click(screen.getByRole("button", { name: "Accept routine" }));
    fireEvent.click(screen.getByRole("button", { name: "Accept and edit" }));
    fireEvent.click(screen.getByRole("button", { name: "Reject proposal" }));

    expect(onAccept).toHaveBeenCalledOnce();
    expect(onEdit).toHaveBeenCalledOnce();
    expect(onReject).toHaveBeenCalledOnce();
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

  it("shows only equipment matching the selected body part", async () => {
    const upperLegSmith = { ...exercise, id: "smith", equipment: "smith machine" };
    const chestBarbell = { ...exercise, id: "barbell", body_part: "chest", equipment: "barbell" };
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue([exercise, upperLegSmith, chestBarbell]),
    }));
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "Exercises" }));
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
