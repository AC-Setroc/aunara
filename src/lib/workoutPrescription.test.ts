import { describe, expect, it } from "vitest";

describe("workout prescription helpers", () => {
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
