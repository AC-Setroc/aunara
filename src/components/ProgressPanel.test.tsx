// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { ProgressPanel } from "./ProgressPanel";
import type { Exercise, TrainingTrack } from "../types";

afterEach(() => {
  cleanup();
});

describe("ProgressPanel Component", () => {
  const dummyInstructions = { en: "", es: "", it: "", tr: "", ru: "", zh: "", hi: "", pl: "", ko: "", fr: "" };
  const dummySteps = { en: [], es: [], it: [], tr: [], ru: [], zh: [], hi: [], pl: [], ko: [], fr: [] };

  const exerciseMap = new Map<string, Exercise>([
    [
      "0025",
      {
        id: "0025",
        name: "barbell bench press",
        category: "strength",
        body_part: "chest",
        muscle_group: "chest",
        equipment: "barbell",
        instructions: dummyInstructions,
        instruction_steps: dummySteps,
        secondary_muscles: ["triceps"],
        target: "pectorals",
        media_id: "0025",
        image: "",
        gif_url: "",
        attribution: "",
        created_at: "",
      },
    ],
    [
      "0047",
      {
        id: "0047",
        name: "incline bench press",
        category: "strength",
        body_part: "chest",
        muscle_group: "chest",
        equipment: "barbell",
        instructions: dummyInstructions,
        instruction_steps: dummySteps,
        secondary_muscles: ["shoulders"],
        target: "upper chest",
        media_id: "0047",
        image: "",
        gif_url: "",
        attribution: "",
        created_at: "",
      },
    ],
  ]);

  const mockTrack: TrainingTrack = {
    id: "track-1",
    name: "Ruta de Fuerza",
    kind: "goal",
    focus: "strength",
    equipment: "any",
    sessionMinutes: 60,
    daysPerWeek: 3,
    workout: [
      {
        id: "item-1",
        exerciseId: "0025",
        sets: 3,
        reps: 8,
        loadHistory: [
          {
            id: "h1",
            date: "2026-10-26",
            loadKg: 60,
            setPlan: "3 × 8",
            setsDetail: [
              { setNumber: 1, targetReps: 8, actualReps: 8, loadKg: 60, completed: true },
              { setNumber: 2, targetReps: 8, actualReps: 8, loadKg: 60, completed: true },
              { setNumber: 3, targetReps: 8, actualReps: 8, loadKg: 60, completed: true },
            ],
          },
        ],
      },
      {
        id: "item-2",
        exerciseId: "0047",
        sets: 3,
        reps: 8,
        loadHistory: [
          {
            id: "h2",
            date: "2026-10-26",
            loadKg: 50,
            setPlan: "3 × 8",
            setsDetail: [
              { setNumber: 1, targetReps: 8, actualReps: 8, loadKg: 50, completed: true },
              { setNumber: 2, targetReps: 8, actualReps: 8, loadKg: 50, completed: true },
              { setNumber: 3, targetReps: 8, actualReps: 7, loadKg: 50, completed: true, limiterTag: "muscular-failure" },
            ],
          },
        ],
      },
    ],
  };

  it("renders the BI panel with KPIs and track name", () => {
    render(
      <ProgressPanel
        language="es"
        tracks={[mockTrack]}
        activeTrack={mockTrack}
        exerciseMap={exerciseMap}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText("Progreso y Analítica BI")).toBeDefined();
    expect(screen.getByText(/Ruta de Fuerza/)).toBeDefined();

    // Check KPI cards
    expect(screen.getByText("Volumen acumulado")).toBeDefined();
    expect(screen.getByText(/2[.,]590\s*kg/)).toBeDefined();
    expect(screen.getByText("Adherencia al volumen")).toBeDefined();
  });

  it("switches tabs between Overview, Exercises, and Fatigue Audit", () => {
    render(
      <ProgressPanel
        language="es"
        tracks={[mockTrack]}
        activeTrack={mockTrack}
        exerciseMap={exerciseMap}
        onClose={vi.fn()}
      />
    );

    // Switch to Exercises tab
    const exercisesTab = screen.getByRole("tab", { name: /por ejercicio/i });
    fireEvent.click(exercisesTab);
    expect(screen.getByText(/seleccionar ejercicio/i)).toBeDefined();

    // Switch to Fatigue tab
    const fatigueTab = screen.getByRole("tab", { name: /fatiga/i });
    fireEvent.click(fatigueTab);
    expect(screen.getByText("Auditoría de Fatiga y Limitantes")).toBeDefined();
    expect(screen.getAllByText(/Fallo muscular/i).length).toBeGreaterThanOrEqual(1);
  });

  it("calls onClose when close button is clicked", () => {
    const onClose = vi.fn();
    render(
      <ProgressPanel
        language="es"
        tracks={[mockTrack]}
        activeTrack={mockTrack}
        exerciseMap={exerciseMap}
        onClose={onClose}
      />
    );

    const closeBtn = screen.getByRole("button", { name: /cerrar analítica bi/i });
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalled();
  });
});
