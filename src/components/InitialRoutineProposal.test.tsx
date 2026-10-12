// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Exercise, TrainingTrack } from "../types";
import { InitialRoutineProposal } from "./InitialRoutineProposal";
import { createSpecialPrescription } from "../lib/workoutPrescription";
afterEach(cleanup);
const exercise = { id: "fixture", name: "fixture exercise" } as Exercise;
describe("proposal day agenda", () => {
  it.each(["en", "es"] as const)("shows per-side targets in both standard and special proposal members in %s", (language) => {
    const special = createSpecialPrescription("custom");
    special.blocks = [{ id: "synthetic-work", type: "work", target: "reps", value: 20, repetitionCount: "per-side", loadType: "same" }];
    const track: TrainingTrack = { id: "synthetic", name: "Synthetic", kind: "goal", focus: "strength", equipment: "mixed", daysPerWeek: 1, sessionMinutes: 45, trainingDays: ["monday"], workout: [{ exerciseId: exercise.id, sets: 1, reps: 20, repetitionCount: "per-side", day: "monday" }, { exerciseId: exercise.id, sets: 1, reps: 20, prescriptionMode: "special", specialPrescription: special, day: "monday" }] };
    render(<InitialRoutineProposal language={language} track={track} exerciseMap={new Map([[exercise.id, exercise]])} onOpenExercise={vi.fn()} onAccept={vi.fn()} onEdit={vi.fn()} onReject={vi.fn()} />);
    expect(screen.getByText(language === "en" ? "1 × 20 per side" : "1 × 20 por lado")).toBeTruthy();
    expect(screen.getAllByText(language === "en" ? /20 per side/ : /20 por lado/)).toHaveLength(2);
  });
  it("shows real per-day prescriptions, previews, empty days and explicit choices", () => {
    const track: TrainingTrack = { id: "route", name: "Fixture", kind: "goal", focus: "strength", equipment: "mixed", daysPerWeek: 3, sessionMinutes: 45, trainingDays: ["monday", "wednesday", "friday"], workout: [{ id: "one", exerciseId: exercise.id, day: "monday", sets: 4, reps: 12 }, { id: "two", exerciseId: exercise.id, day: "wednesday", sets: 3, reps: 8, prescriptionMode: "special", specialPrescription: createSpecialPrescription("rest-pause") }] };
    const open = vi.fn(), accept = vi.fn(), edit = vi.fn(), reject = vi.fn();
    render(<InitialRoutineProposal language="en" track={track} exerciseMap={new Map([[exercise.id, exercise]])} onOpenExercise={open} onAccept={accept} onEdit={edit} onReject={reject} />);
    const monday = screen.getByRole("region", { name: "Monday" });
    expect(within(monday).getByText("4 × 12")).toBeTruthy();
    expect(within(screen.getByRole("region", { name: "Wednesday" })).getByText(/rest-pause.*rest/i)).toBeTruthy();
    expect(within(screen.getByRole("region", { name: "Friday" })).getByText("No exercises assigned")).toBeTruthy();
    fireEvent.click(within(monday).getByRole("button"));
    expect(open).toHaveBeenCalledWith(exercise);
    fireEvent.click(screen.getByRole("button", { name: "Reject proposal" }));
    expect(reject).toHaveBeenCalledOnce();
    expect(accept).not.toHaveBeenCalled();
    expect(edit).not.toHaveBeenCalled();
  });
});
