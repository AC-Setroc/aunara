import { describe, expect, it, vi } from "vitest";
import { searchFoodData } from "./foodData";

describe("USDA food search", () => {
  it("maps FoodData Central results into compact nutrition cards", async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        foods: [{
          fdcId: 123,
          description: "Bananas, raw",
          dataType: "Foundation",
          servingSize: 100,
          servingSizeUnit: "g",
          foodNutrients: [
            { nutrientName: "Energy", unitName: "KJ", value: 371 },
            { nutrientName: "Energy", unitName: "KCAL", value: 89 },
            { nutrientName: "Protein", unitName: "G", value: 1.1 },
            { nutrientName: "Carbohydrate, by difference", unitName: "G", value: 22.8 },
            { nutrientName: "Total lipid (fat)", unitName: "G", value: 0.3 },
          ],
        }],
      }),
    });

    const results = await searchFoodData("banana", { fetcher });

    expect(fetcher).toHaveBeenCalledOnce();
    expect(results).toEqual([{
      id: 123,
      name: "Bananas, raw",
      dataType: "Foundation",
      serving: "100 g",
      calories: 89,
      proteinGrams: 1.1,
      carbohydrateGrams: 22.8,
      fatGrams: 0.3,
    }]);
  });

  it("does not call USDA for an empty search", async () => {
    const fetcher = vi.fn();

    await expect(searchFoodData(" ", { fetcher })).resolves.toEqual([]);
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("reports an unavailable USDA response", async () => {
    const fetcher = vi.fn().mockResolvedValue({ ok: false, status: 429 });

    await expect(searchFoodData("oats", { fetcher })).rejects.toThrow("FoodData Central");
  });
});
