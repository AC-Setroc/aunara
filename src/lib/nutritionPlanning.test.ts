import { describe, expect, it } from "vitest";
import {
  createRecipeIdeas,
  FOOD_GROUPS,
  FOOD_ITEMS,
  normalizePreferredIngredients,
} from "./nutritionPlanning";

describe("food preference planning", () => {
  it("includes every food and group from the supplied exchange list", () => {
    expect(FOOD_GROUPS).toHaveLength(11);
    expect(FOOD_ITEMS).toHaveLength(95);
    expect(new Set(FOOD_ITEMS.map((food) => food.id)).size).toBe(95);
    expect(FOOD_ITEMS.some((food) => food.name.es === "Arepa de maíz delgada")).toBe(true);
    expect(FOOD_ITEMS.some((food) => food.name.es === "Espinaca cruda")).toBe(true);
    expect(FOOD_ITEMS.some((food) => food.name.es === "Leche condensada")).toBe(true);
  });

  it("builds meal ideas only from the ingredients selected by the user", () => {
    const ideas = createRecipeIdeas([
      "egg",
      "white-rice-cooked",
      "spinach-raw",
      "olive-oil",
    ], "en");

    expect(ideas).toHaveLength(1);
    expect(ideas[0].name).toMatch(/Egg.*cooked white rice.*raw spinach/i);
    expect(ideas[0].description).toMatch(/olive oil/i);
    expect(ideas[0].description).not.toMatch(/chicken|avocado|tomato/i);
  });

  it("keeps earlier saved preferences compatible with the expanded list", () => {
    expect(normalizePreferredIngredients(["eggs", "rice", "vegetables"]))
      .toEqual(["egg", "white-rice-cooked", "spinach-raw"]);
  });
});
