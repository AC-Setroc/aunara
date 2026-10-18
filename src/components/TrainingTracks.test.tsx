// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TrainingTracks } from "./TrainingTracks";
import type { TrainingTrack } from "../types";
afterEach(cleanup);
const track: TrainingTrack = { id: "t1", name: "Synthetic route", kind: "goal", focus: "strength", equipment: "any", sessionMinutes: 60, daysPerWeek: 2, trainingDays: ["monday", "wednesday"], creationMode: "manual", workout: [] };
function setup(language: "en" | "es" = "en") {
  const onEditWorkout = vi.fn();
  const onEdit = vi.fn();
  render(<TrainingTracks language={language} tracks={[track]} activeTrackId="t1" onOpen={vi.fn()} onCreate={vi.fn()} onGenerate={vi.fn()} onDelete={vi.fn()} onEdit={onEdit} onEditWorkout={onEditWorkout} />);
  return { onEditWorkout, onEdit };
}
describe("editing a route", () => {
  it("offers to edit its exercises and opens them for that route", () => {
    const { onEditWorkout, onEdit } = setup();
    fireEvent.click(screen.getByRole("button", { name: "Edit Synthetic route" }));
    expect(screen.getByRole("heading", { name: "Edit route" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Edit exercises" }));
    expect(onEditWorkout).toHaveBeenCalledWith("t1");
    expect(onEdit).not.toHaveBeenCalled();
    expect(screen.queryByRole("button", { name: "Save track changes" })).toBeNull();
  });
  it("lets the minutes field be cleared and retyped without a leading zero", () => {
    const { onEdit } = setup();
    fireEvent.click(screen.getByRole("button", { name: "Edit Synthetic route" }));
    const minutes = screen.getByLabelText("Session minutes") as HTMLInputElement;
    fireEvent.change(minutes, { target: { value: "" } });
    expect(minutes.value).toBe("");
    fireEvent.change(minutes, { target: { value: "090" } });
    expect(minutes.value).toBe("90");
    fireEvent.click(screen.getByRole("button", { name: "Save track changes" }));
    expect(onEdit).toHaveBeenCalledWith("t1", expect.objectContaining({ sessionMinutes: 90 }));
  });
  it("restores the last valid minutes when the field is left empty", () => {
    const { onEdit } = setup();
    fireEvent.click(screen.getByRole("button", { name: "Edit Synthetic route" }));
    const minutes = screen.getByLabelText("Session minutes") as HTMLInputElement;
    fireEvent.change(minutes, { target: { value: "" } });
    fireEvent.blur(minutes);
    expect(minutes.value).toBe("60");
    fireEvent.click(screen.getByRole("button", { name: "Save track changes" }));
    expect(onEdit).toHaveBeenCalledWith("t1", expect.objectContaining({ sessionMinutes: 60 }));
  });
  it("does not show the exercise shortcut when creating a new route", () => {
    setup("es");
    fireEvent.click(screen.getByRole("button", { name: /Agregar ruta/ }));
    expect(screen.queryByRole("button", { name: "Editar ejercicios" })).toBeNull();
  });
});
