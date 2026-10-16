// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useState } from "react";
import { WorkoutPanel } from "./WorkoutPanel";
import type { Exercise, TrainingTrack, WorkoutItem } from "../types";
afterEach(cleanup);
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
  it.each([2, 3])("removes a member from %i slots without discarding surviving targets or searches", (count) => {
    const { adder, onAddStructure } = setup();
    fireEvent.click(screen.getByRole("button", { name: "Monday" }));
    fireEvent.click(adder.getByRole("button", { name: "Choose exercises for this day" }));
    for (let index = 0; index < count; index += 1) {
      if (index) fireEvent.click(adder.getByRole("button", { name: "Add another exercise" }));
      fireEvent.click(adder.getByRole("button", { name: `Select ${["Synthetic Press", "Synthetic Push-Up", "Synthetic Climber"][index]} as exercise ${index + 1}` }));
    }
    fireEvent.click(adder.getByRole("button", { name: "Configure sets and repetitions" }));
    fireEvent.change(adder.getByLabelText("Repetitions for Synthetic Press"), { target: { value: "8" } });
    if (count === 3) {
      fireEvent.change(adder.getByLabelText("Repetitions for Synthetic Climber"), { target: { value: "20" } });
      fireEvent.change(adder.getByLabelText("Repetition count for Synthetic Climber"), { target: { value: "per-side" } });
    }
    fireEvent.click(adder.getByRole("button", { name: "Choose local structure" }));
    fireEvent.click(adder.getByRole("button", { name: "Back" }));
    fireEvent.click(adder.getByRole("button", { name: "Back" }));
    fireEvent.change(adder.getByLabelText("Search exercise 2"), { target: { value: "" } });
    expect((adder.getByRole("button", { name: "Configure sets and repetitions" }) as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(adder.getByRole("button", { name: "Remove exercise 2" }));
    expect((adder.getByLabelText("Search exercise 1") as HTMLInputElement).value).toBe("Synthetic Press");
    if (count === 3) expect((adder.getByLabelText("Search exercise 2") as HTMLInputElement).value).toBe("Synthetic Climber");
    else expect(adder.queryByRole("button", { name: "Remove exercise 1" })).toBeNull();
    fireEvent.click(adder.getByRole("button", { name: "Configure sets and repetitions" }));
    expect((adder.getByLabelText(count === 2 ? "Repetitions" : "Repetitions for Synthetic Press") as HTMLInputElement).value).toBe("8");
    if (count === 3) {
      expect((adder.getByLabelText("Repetitions for Synthetic Climber") as HTMLInputElement).value).toBe("20");
      expect((adder.getByLabelText("Repetition count for Synthetic Climber") as HTMLSelectElement).value).toBe("per-side");
    }
    fireEvent.click(adder.getByRole("button", { name: "Choose local structure" }));
    const structure = count === 2 ? "Single set" : "Bi-set";
    expect((adder.getByRole("button", { name: structure }) as HTMLButtonElement).disabled).toBe(false);
    fireEvent.click(adder.getByRole("button", { name: structure }));
    fireEvent.click(adder.getByRole("button", { name: count === 2 ? "Add single set" : "Add bi-set" }));
    expect(onAddStructure).toHaveBeenCalledWith(count === 2 ? "single" : "biset", count === 2 ? [exercises[0].id] : [exercises[0].id, exercises[2].id], "monday", count === 2 ? [expect.objectContaining({ reps: 8 })] : [expect.objectContaining({ reps: 8 }), expect.objectContaining({ reps: 20 })]);
  });
  it("chooses exercises before structure and keeps each target independent when going back", () => {
    const { adder, onAddStructure } = setup();
    fireEvent.click(screen.getByRole("button", { name: "Monday" }));
    fireEvent.click(adder.getByRole("button", { name: "Choose exercises for this day" }));
    fireEvent.click(adder.getByRole("button", { name: "Select Synthetic Press as exercise 1" }));
    fireEvent.click(adder.getByRole("button", { name: "Add another exercise" }));
    fireEvent.click(adder.getByRole("button", { name: "Select Synthetic Push-Up as exercise 2" }));
    fireEvent.click(adder.getByRole("button", { name: "Add another exercise" }));
    fireEvent.click(adder.getByRole("button", { name: "Select Synthetic Climber as exercise 3" }));
    fireEvent.click(adder.getByRole("button", { name: "Configure sets and repetitions" }));
    fireEvent.change(adder.getByLabelText("Repetitions for Synthetic Press"), { target: { value: "8" } });
    fireEvent.change(adder.getByLabelText("Target for Synthetic Push-Up"), { target: { value: "technical-failure" } });
    fireEvent.change(adder.getByLabelText("Repetitions for Synthetic Climber"), { target: { value: "20" } });
    fireEvent.change(adder.getByLabelText("Repetition count for Synthetic Climber"), { target: { value: "per-side" } });
    fireEvent.click(adder.getByRole("button", { name: "Choose local structure" }));
    expect((adder.getByRole("button", { name: "Bi-set" }) as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(adder.getByRole("button", { name: "Tri-set" }));
    const climber = within(adder.getByRole("group", { name: "Synthetic Climber" }));
    fireEvent.click(climber.getByRole("checkbox"));
    expect((climber.getByLabelText("Repetition count for block 1") as HTMLSelectElement).value).toBe("per-side");
    fireEvent.click(climber.getByRole("checkbox"));
    fireEvent.click(adder.getByRole("button", { name: "Back" }));
    fireEvent.click(adder.getByRole("button", { name: "Tri-set" }));
    fireEvent.click(adder.getByRole("button", { name: "Add tri-set" }));
    expect(onAddStructure).toHaveBeenCalledWith("triset", exercises.map((exercise) => exercise.id), "monday", [
      expect.objectContaining({ reps: 8, prescriptionMode: "standard" }),
      expect.objectContaining({ prescriptionMode: "special", specialPrescription: expect.objectContaining({ blocks: [expect.objectContaining({ target: "technical-failure" })] }) }),
      expect.objectContaining({ reps: 20, repetitionCount: "per-side", prescriptionMode: "standard" }),
    ]);
  });
  it("does not advance with invalid individual prescription", () => {
    const { adder, onAddStructure } = setup();
    fireEvent.click(adder.getByRole("button", { name: "Choose exercises for this day" }));
    fireEvent.click(adder.getByRole("button", { name: "Select Synthetic Press as exercise 1" }));
    fireEvent.click(adder.getByRole("button", { name: "Configure sets and repetitions" }));
    fireEvent.change(adder.getByLabelText("Sets"), { target: { value: "0" } });
    expect((adder.getByRole("button", { name: "Choose local structure" }) as HTMLButtonElement).disabled).toBe(true);
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
    expect(screen.getByText(language === "en" ? "1 × 20 per side" : "1 × 20 por lado")).toBeTruthy();
  });
});
