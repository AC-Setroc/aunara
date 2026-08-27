import { describe, expect, it } from "vitest";
import type { HealthProfile } from "../types";
import {
  createMacroPlan,
  createRecipeIdeas,
  FOOD_GROUPS,
  FOOD_ITEMS,
  normalizePreferredIngredients,
} from "./nutritionPlanning";

const completeProfile: HealthProfile = {
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
  nutritionPlanMode: "macros",
  macroMealsPerDay: 4,
};

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

  it("creates one coherent maintenance-based macro starting point", () => {
    expect(createMacroPlan(completeProfile)).toMatchObject({
      energyKcal: 2800,
      maintenanceRange: { min: 2500, max: 3050 },
      protein: { grams: 140, energyPercent: 20, referenceRange: { min: 115, max: 164 } },
      carbohydrates: { grams: 351, energyPercent: 50 },
      fat: { grams: 93, energyPercent: 30 },
      mealsPerDay: 4,
      perMeal: { proteinGrams: 35, carbohydrateGrams: 88, fatGrams: 23 },
    });
  });

  it("does not invent a macro plan when required body data is missing", () => {
    expect(createMacroPlan({ ...completeProfile, currentWeightKg: null })).toBeNull();
    expect(createMacroPlan({ ...completeProfile, metabolicSex: "unspecified" })).toBeNull();
  });
});
