// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useState } from "react";
import { WorkoutPanel } from "./WorkoutPanel";
import type { Exercise, TrainingTrack, WorkoutItem } from "../types";

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-10-19T12:00:00Z")); // Monday
});

afterEach(() => {
  vi.useRealTimers();
  cleanup();
});
const exercises = ["synthetic press", "synthetic push-up", "synthetic climber"].map((name, index) => ({
  id: `synthetic-${index}`, name, body_part: "chest", category: "chest", equipment: "body weight", target: "pectorals", muscle_group: "chest", secondary_muscles: [], instructions: { en: "Synthetic instruction" }, instruction_steps: { en: [] }, image: "synthetic.jpg", gif_url: "synthetic.gif", media_id: "synthetic", attribution: "Synthetic fixture", created_at: "2026-10-10",
} as unknown as Exercise));
function setup() {
  const onAddStructure = vi.fn();
  const track: TrainingTrack = { id: "synthetic-route", name: "Synthetic route", kind: "goal", focus: "strength", equipment: "mixed", sessionMinutes: 45, daysPerWeek: 2, trainingDays: ["monday", "wednesday"], creationMode: "manual", workout: [] };
  render(<WorkoutPanel language="en" initialMode="edit" items={[]} exercises={exercises} exerciseMap={new Map(exercises.map((exercise) => [exercise.id, exercise]))} track={track} onClose={vi.fn()} onUpdate={vi.fn()} onRemove={vi.fn()} onSwap={vi.fn()} onClear={vi.fn()} onGenerate={vi.fn()} onOpenExercise={vi.fn()} onOpenProfile={vi.fn()} onAddStructure={onAddStructure} analysis={{ tone: "ready", headline: "Synthetic", points: [] }} />);
  return { onAddStructure, adder: within(screen.getByRole("region", { name: "Add exercises" })) };
}
describe("independent manual prescriptions", () => {
  it.each([2, 3])("creates a %i-exercise structure without discarding targets", (count) => {
    const { adder, onAddStructure } = setup();
    fireEvent.click(adder.getByRole("button", { name: count === 2 ? "Bi-set" : "Tri-set" }));
    fireEvent.click(adder.getByRole("button", { name: "Select Synthetic Press as exercise 1" }));
    fireEvent.click(adder.getByRole("button", { name: "Select Synthetic Push-Up as exercise 2" }));
    if (count === 3) {
      fireEvent.click(adder.getByRole("button", { name: "Select Synthetic Climber as exercise 3" }));
    }
    fireEvent.click(adder.getByRole("button", { name: "Configure sets and repetitions" }));
    fireEvent.change(adder.getByLabelText("Repetitions for Synthetic Press"), { target: { value: "8" } });
    if (count === 3) {
      fireEvent.change(adder.getByLabelText("Repetitions for Synthetic Climber"), { target: { value: "20" } });
      fireEvent.change(adder.getByLabelText("Repetition count for Synthetic Climber"), { target: { value: "per-side" } });
    }
    fireEvent.click(adder.getByRole("button", { name: "Back" }));
    expect((adder.getByLabelText("Search exercise 1") as HTMLInputElement).value).toBe("Synthetic Press");
    expect((adder.getByLabelText("Search exercise 2") as HTMLInputElement).value).toBe("Synthetic Push-Up");
    if (count === 3) {
      expect((adder.getByLabelText("Search exercise 3") as HTMLInputElement).value).toBe("Synthetic Climber");
    }
    fireEvent.click(adder.getByRole("button", { name: "Configure sets and repetitions" }));
    expect((adder.getByLabelText("Repetitions for Synthetic Press") as HTMLInputElement).value).toBe("8");
    if (count === 3) {
      expect((adder.getByLabelText("Repetitions for Synthetic Climber") as HTMLInputElement).value).toBe("20");
      expect((adder.getByLabelText("Repetition count for Synthetic Climber") as HTMLSelectElement).value).toBe("per-side");
    }
    fireEvent.click(adder.getByRole("button", { name: "Save and continue" }));
    expect(onAddStructure).toHaveBeenCalledWith(
      count === 2 ? "biset" : "triset",
      count === 2 ? [exercises[0].id, exercises[1].id] : [exercises[0].id, exercises[1].id, exercises[2].id],
      "monday",
      count === 2
        ? [expect.objectContaining({ reps: 8 }), expect.objectContaining({ reps: 10 })]
        : [expect.objectContaining({ reps: 8 }), expect.objectContaining({ reps: 10 }), expect.objectContaining({ reps: 20 })],
    );
  });
  it("selects structure first, chooses exercises and custom targets", () => {
    const { adder, onAddStructure } = setup();
    fireEvent.click(adder.getByRole("button", { name: "Tri-set" }));
    fireEvent.click(adder.getByRole("button", { name: "Select Synthetic Press as exercise 1" }));
    fireEvent.click(adder.getByRole("button", { name: "Select Synthetic Push-Up as exercise 2" }));
    fireEvent.click(adder.getByRole("button", { name: "Select Synthetic Climber as exercise 3" }));
    fireEvent.click(adder.getByRole("button", { name: "Configure sets and repetitions" }));
    fireEvent.change(adder.getByLabelText("Repetitions for Synthetic Press"), { target: { value: "8" } });
    fireEvent.change(adder.getByLabelText("Target for Synthetic Push-Up"), { target: { value: "technical-failure" } });
    fireEvent.change(adder.getByLabelText("Repetitions for Synthetic Climber"), { target: { value: "20" } });
    fireEvent.change(adder.getByLabelText("Repetition count for Synthetic Climber"), { target: { value: "per-side" } });
    fireEvent.click(adder.getByRole("button", { name: "Save and continue" }));
    expect(onAddStructure).toHaveBeenCalledWith("triset", exercises.map((exercise) => exercise.id), "monday", [
      expect.objectContaining({ reps: 8, prescriptionMode: "standard" }),
      expect.objectContaining({ prescriptionMode: "special", specialPrescription: expect.objectContaining({ blocks: [expect.objectContaining({ target: "technical-failure" })] }) }),
      expect.objectContaining({ reps: 20, repetitionCount: "per-side", prescriptionMode: "standard" }),
    ]);
  });
  it("does not advance with invalid individual prescription", () => {
    const { adder, onAddStructure } = setup();
    fireEvent.click(adder.getByRole("button", { name: "Single set" }));
    fireEvent.click(adder.getByRole("button", { name: "Select Synthetic Press as exercise 1" }));
    fireEvent.click(adder.getByRole("button", { name: "Configure sets and repetitions" }));
    fireEvent.change(adder.getByLabelText("Sets"), { target: { value: "0" } });
    expect((adder.getByRole("button", { name: "Save and continue" }) as HTMLButtonElement).disabled).toBe(true);
    expect(onAddStructure).not.toHaveBeenCalled();
  });
  it.each(["en", "es"] as const)("retains per-side count across standard/special editing and displays it in %s summaries", (language) => {
    function Harness() {
      const [items, setItems] = useState<WorkoutItem[]>([{ id: "synthetic-item", exerciseId: exercises[2].id, sets: 1, reps: 20, repetitionCount: "per-side", day: "monday" }]);
      const track: TrainingTrack = { id: "synthetic", name: "Synthetic", kind: "goal", focus: "strength", equipment: "mixed", sessionMinutes: 45, daysPerWeek: 1, trainingDays: ["monday"], creationMode: "manual", workout: items };
      return <WorkoutPanel language={language} initialMode="edit" items={items} exercises={exercises} exerciseMap={new Map(exercises.map((exercise) => [exercise.id, exercise]))} track={track} onClose={vi.fn()} onUpdate={vi.fn()} onUpdateItem={(_id, changes) => setItems((current) => current.map((item) => ({ ...item, ...changes })))} onRemove={vi.fn()} onSwap={vi.fn()} onClear={vi.fn()} onGenerate={vi.fn()} onOpenExercise={vi.fn()} onOpenProfile={vi.fn()} analysis={{ tone: "ready", headline: "Synthetic", points: [] }} />;
    }
    render(<Harness />);
    fireEvent.click(screen.getByRole("button", { name: language === "en" ? "Special configuration" : "Configuración especial" }));
    expect((screen.getByLabelText(language === "en" ? "Repetition count for block 1" : "Conteo de repeticiones del bloque 1") as HTMLSelectElement).value).toBe("per-side");
    fireEvent.click(screen.getByRole("button", { name: language === "en" ? "Standard sets" : "Reps. por serie" }));
    expect((screen.getByLabelText(language === "en" ? "Repetition count for Synthetic Climber" : "Conteo de repeticiones para Synthetic Climber") as HTMLSelectElement).value).toBe("per-side");
    fireEvent.click(screen.getByRole("button", { name: language === "en" ? "Back to routine" : "Volver a la rutina" }));
    expect(screen.getAllByText(language === "en" ? "1 × 20 per side" : "1 × 20 por lado").length).toBeGreaterThan(0);
  });

  it("handles day and block accordion collapsing and switching cleanly in edit mode", () => {
    const mondayItem1: WorkoutItem = { id: "m1", exerciseId: exercises[0].id, sets: 3, reps: 10, day: "monday", prescriptionMode: "standard" };
    const mondayItem2: WorkoutItem = { id: "m2", exerciseId: exercises[1].id, sets: 4, reps: 8, day: "monday", prescriptionMode: "standard" };
    const wednesdayItem1: WorkoutItem = { id: "w1", exerciseId: exercises[2].id, sets: 3, reps: 12, day: "wednesday", prescriptionMode: "standard" };
    const items = [mondayItem1, mondayItem2, wednesdayItem1];
    const track: TrainingTrack = {
      id: "track-multi",
      name: "Multi Day Track",
      kind: "goal",
      focus: "strength",
      equipment: "mixed",
      sessionMinutes: 45,
      daysPerWeek: 2,
      trainingDays: ["monday", "wednesday"],
      creationMode: "suggested",
      workout: items,
    };

    render(
      <WorkoutPanel
        language="es"
        initialMode="edit"
        items={items}
        exercises={exercises}
        exerciseMap={new Map(exercises.map((ex) => [ex.id, ex]))}
        track={track}
        onClose={vi.fn()}
        onUpdate={vi.fn()}
        onUpdateItem={vi.fn()}
        onRemove={vi.fn()}
        onSwap={vi.fn()}
        onClear={vi.fn()}
        onGenerate={vi.fn()}
        onAddStructure={vi.fn()}
        onOpenExercise={vi.fn()}
        onOpenProfile={vi.fn()}
        analysis={{ tone: "ready", headline: "Headline", points: [] }}
      />
    );

    // Verify day accordions: Monday is open by default, Wednesday is closed
    const dayTitles = screen.getAllByRole("heading", { level: 2 });
    const mondaySummary = screen.getAllByText("Lunes").find((el) => el.classList.contains("routine-day-title"))?.closest("summary");
    const wednesdaySummary = screen.getAllByText("Miércoles").find((el) => el.classList.contains("routine-day-title"))?.closest("summary");
    expect(mondaySummary).toBeTruthy();
    expect(wednesdaySummary).toBeTruthy();

    const mondayDetails = mondaySummary!.closest("details");
    const wednesdayDetails = wednesdaySummary!.closest("details");
    expect(mondayDetails?.hasAttribute("open")).toBe(true);
    expect(wednesdayDetails?.hasAttribute("open")).toBe(false);

    // Inside Monday: Blocks are closed by default
    const blockA = within(mondayDetails!).getByText("Bloque A").closest("details");
    const blockB = within(mondayDetails!).getByText("Bloque B").closest("details");
    expect(blockA?.hasAttribute("open")).toBe(false);
    expect(blockB?.hasAttribute("open")).toBe(false);

    // Expanding Bloque A opens only Bloque A
    const blockASummary = within(mondayDetails!).getByText("Bloque A").closest("summary");
    fireEvent.click(blockASummary!);
    expect(blockA?.hasAttribute("open")).toBe(true);
    expect(blockB?.hasAttribute("open")).toBe(false);

    // Clicking "Listo con este bloque" collapses Bloque A
    const doneBlockButton = within(blockA!).getByRole("button", { name: "Listo con este bloque" });
    fireEvent.click(doneBlockButton);
    expect(blockA?.hasAttribute("open")).toBe(false);

    // Switching to Wednesday closes Monday and opens Wednesday
    fireEvent.click(wednesdaySummary!);
    expect(mondayDetails?.hasAttribute("open")).toBe(false);
    expect(wednesdayDetails?.hasAttribute("open")).toBe(true);

    // Check that "+ Agregar ejercicio o bloque" is available in the open day
    expect(within(wednesdayDetails!).getByRole("button", { name: "Agregar ejercicio o bloque" })).toBeTruthy();

    // Check footer buttons
    expect(screen.getByRole("button", { name: "Finalizar edición" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Vaciar entrenamiento" })).toBeTruthy();
  });

  it("does not display redundant day header or day picker buttons inside exercise adder when editing a day", () => {
    const track: TrainingTrack = {
      id: "track-test",
      name: "Ruta",
      kind: "goal",
      focus: "strength",
      equipment: "mixed",
      sessionMinutes: 45,
      daysPerWeek: 2,
      trainingDays: ["monday", "tuesday"],
      workout: [
        { id: "item-1", exerciseId: exercises[0].id, day: "monday", sets: 3, reps: 10, prescriptionMode: "standard" },
      ],
    };

    render(
      <WorkoutPanel
        language="es"
        initialMode="edit"
        items={track.workout}
        exercises={exercises}
        exerciseMap={new Map(exercises.map((ex) => [ex.id, ex]))}
        track={track}
        onClose={vi.fn()}
        onUpdate={vi.fn()}
        onUpdateItem={vi.fn()}
        onRemove={vi.fn()}
        onSwap={vi.fn()}
        onClear={vi.fn()}
        onGenerate={vi.fn()}
        onAddStructure={vi.fn()}
        onOpenExercise={vi.fn()}
        onOpenProfile={vi.fn()}
        analysis={{ tone: "ready", headline: "Headline", points: [] }}
      />
    );

    // Open adder in Monday accordion
    const addBtn = screen.getAllByRole("button", { name: "Agregar ejercicio o bloque" })[0];
    fireEvent.click(addBtn);

    const adder = screen.getByRole("region", { name: "Agregar ejercicios" });
    expect(adder).toBeTruthy();

    // Verify there is NO compact-day-picker inside the adder when editing a day
    expect(adder.querySelector(".compact-day-picker")).toBeNull();
    // Verify there is NO redundant day title inside the adder heading
    const adderHeading = adder.querySelector(".manual-adder-heading");
    expect(adderHeading?.querySelector("strong")).toBeNull();
  });

  it("strips leading zeroes in exercise adder prescription numeric inputs", () => {
    render(
      <WorkoutPanel
        language="es"
        initialMode="edit"
        items={[]}
        exercises={exercises}
        exerciseMap={new Map(exercises.map((ex) => [ex.id, ex]))}
        track={{
          id: "track-test",
          name: "Ruta",
          kind: "goal",
          focus: "strength",
          equipment: "mixed",
          sessionMinutes: 45,
          daysPerWeek: 1,
          trainingDays: ["monday"],
          creationMode: "manual",
          workout: [],
        }}
        onClose={vi.fn()}
        onUpdate={vi.fn()}
        onUpdateItem={vi.fn()}
        onRemove={vi.fn()}
        onSwap={vi.fn()}
        onClear={vi.fn()}
        onGenerate={vi.fn()}
        onAddStructure={vi.fn()}
        onOpenExercise={vi.fn()}
        onOpenProfile={vi.fn()}
        analysis={{ tone: "ready", headline: "Headline", points: [] }}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Monoserie" }));
    fireEvent.click(screen.getByRole("button", { name: "Seleccionar Synthetic Press como ejercicio 1" }));
    fireEvent.click(screen.getByRole("button", { name: "Configurar series y repeticiones" }));

    const repsInput = screen.getByLabelText("Repeticiones") as HTMLInputElement;
    fireEvent.change(repsInput, { target: { value: "030" } });
    expect(repsInput.value).toBe("30");

    const setsInput = screen.getByLabelText("Series") as HTMLInputElement;
    fireEvent.change(setsInput, { target: { value: "04" } });
    expect(setsInput.value).toBe("4");
  });
});
