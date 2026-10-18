import { describe, expect, it } from "vitest";
import { isValidManualPrescription } from "./workoutPrescription";
import type { WorkoutItem } from "../types";

describe("workout prescription helpers", () => {
  it("rejects unknown count units in manual items and blocks, while accepting absent legacy units", () => {
    const item = { sets: 3, reps: 20 };
    expect(isValidManualPrescription(item)).toBe(true);
    expect(isValidManualPrescription({ ...item, repetitionCount: "unknown" } as unknown as WorkoutItem)).toBe(false);
    expect(isValidManualPrescription({ ...item, prescriptionMode: "special", specialPrescription: { technique: "custom", rounds: 3, restBetweenRoundsSeconds: 0, blocks: [{ id: "synthetic", type: "work", target: "reps", value: 20, repetitionCount: "unknown", loadType: "same" }] } } as unknown as WorkoutItem)).toBe(false);
  });
  it("defines the required number of exercise slots for grouped structures", async () => {
    const helpers = await import("./workoutPrescription").catch(() => ({}));
    const slotCount = (helpers as { workoutStructureSlotCount?: (type: string) => number }).workoutStructureSlotCount;

    expect(slotCount).toBeTypeOf("function");
    expect(slotCount?.("single")).toBe(1);
    expect(slotCount?.("biset")).toBe(2);
    expect(slotCount?.("triset")).toBe(3);
    expect(slotCount?.("giant-set")).toBe(4);
  });

  it("creates an editable rest-pause sequence with work and rest blocks", async () => {
    const helpers = await import("./workoutPrescription").catch(() => ({}));
    const createPrescription = (helpers as {
      createSpecialPrescription?: (type: string) => {
        technique: string;
        rounds: number;
        blocks: Array<{ type: string; target?: string; seconds?: number }>;
      };
    }).createSpecialPrescription;

    expect(createPrescription).toBeTypeOf("function");
    const prescription = createPrescription?.("rest-pause");
    expect(prescription?.technique).toBe("rest-pause");
    expect(prescription?.blocks.map((block) => block.type)).toEqual(["work", "rest", "work"]);
    expect(prescription?.blocks[2]).toMatchObject({ target: "technical-failure" });
  });
});
