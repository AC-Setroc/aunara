import { tr } from "./i18n";
import { createWellnessSummary } from "./wellness";
import type { HealthProfile, LanguageCode } from "../types";

export interface MealOption {
  key: string;
  name: string;
  proteinTarget: string;
  vegetables: string;
  carbohydrates: string;
}

export interface RecipeIdea {
  name: string;
  description: string;
}

export const FOOD_GROUPS = [
  {
    key: "protein",
    label: ["Protein foods", "Alimentos proteicos"],
    options: [
      ["eggs", "Eggs", "Huevos"],
      ["chicken", "Chicken", "Pollo"],
      ["fish", "Fish", "Pescado"],
      ["beef", "Beef", "Carne de res"],
      ["pork", "Pork", "Cerdo"],
      ["legumes", "Legumes", "Legumbres"],
      ["tofu", "Tofu", "Tofu"],
      ["yogurt", "Yogurt", "Yogur"],
    ],
  },
  {
    key: "vegetables",
    label: ["Vegetables", "Vegetales"],
    options: [
      ["leafy-greens", "Leafy greens", "Hojas verdes"],
      ["broccoli", "Broccoli / cauliflower", "Brócoli / coliflor"],
      ["tomato", "Tomato", "Tomate"],
      ["carrot", "Carrot", "Zanahoria"],
      ["pepper", "Peppers", "Pimentón"],
      ["vegetables", "Mixed vegetables", "Vegetales variados"],
    ],
  },
  {
    key: "carbohydrates",
    label: ["Carbohydrate foods", "Alimentos con carbohidratos"],
    options: [
      ["rice", "Rice", "Arroz"],
      ["potato", "Potato", "Papa"],
      ["oats", "Oats", "Avena"],
      ["pasta", "Pasta", "Pasta"],
      ["arepa", "Arepa", "Arepa"],
      ["plantain", "Plantain", "Plátano"],
    ],
  },
  {
    key: "fats",
    label: ["Fats", "Grasas"],
    options: [
      ["avocado", "Avocado", "Aguacate"],
      ["olive-oil", "Olive oil", "Aceite de oliva"],
      ["nuts", "Nuts", "Frutos secos"],
      ["seeds", "Seeds", "Semillas"],
    ],
  },
  {
    key: "fruits",
    label: ["Fruits", "Frutas"],
    options: [
      ["banana", "Banana", "Banano"],
      ["berries", "Berries", "Frutos rojos"],
      ["citrus", "Citrus", "Cítricos"],
      ["mango", "Mango", "Mango"],
      ["apple", "Apple / pear", "Manzana / pera"],
    ],
  },
] as const;

export function createDailyFoodOptions(
  profile: HealthProfile,
  language: LanguageCode,
): MealOption[] {
  const proteinRange = createWellnessSummary(profile, language).proteinGrams;
  const mealProtein = proteinRange
    ? `${Math.round(proteinRange.min / 4)}–${Math.round(proteinRange.max / 4)} g`
    : tr(language, "Add body weight", "Agregá el peso corporal");
  const meals = [
    ["breakfast", "Breakfast", "Desayuno"],
    ["lunch", "Lunch", "Almuerzo"],
    ["snack", "Snack", "Merienda"],
    ["dinner", "Dinner", "Cena"],
  ] as const;

  return meals.map(([key, english, spanish]) => ({
    key,
    name: tr(language, english, spanish),
    proteinTarget: mealProtein,
    vegetables: key === "snack"
      ? tr(language, "Fruit or vegetables as preferred", "Fruta o vegetales según preferencia")
      : tr(language, "1–2 handfuls of varied vegetables", "1–2 puñados de vegetales variados"),
    carbohydrates: key === "snack"
      ? tr(language, "Optional according to hunger and training", "Opcional según hambre y entrenamiento")
      : tr(language, "1 cupped-hand portion; adjust around training", "1 porción del tamaño de la mano; ajustá alrededor del entrenamiento"),
  }));
}

export function createRecipeIdeas(
  ingredients: string[],
  language: LanguageCode,
): RecipeIdea[] {
  const selected = new Set(ingredients);
  const ideas: RecipeIdea[] = [];

  if (selected.has("eggs") && selected.has("rice") && selected.has("vegetables")) {
    ideas.push({
      name: tr(language, "Egg and vegetable rice bowl", "Bowl de arroz, huevo y vegetales"),
      description: tr(language, "Combine cooked rice, sautéed vegetables and eggs; season to taste.", "Combiná arroz cocido, vegetales salteados y huevo; sazoná al gusto."),
    });
  }
  if (selected.has("chicken") && selected.has("vegetables")) {
    ideas.push({
      name: tr(language, "Chicken and vegetable plate", "Plato de pollo y vegetales"),
      description: tr(language, "Pair grilled chicken with varied vegetables and your chosen carbohydrate.", "Acompañá pollo a la plancha con vegetales variados y el carbohidrato que elijás."),
    });
  }
  if (selected.has("legumes") && selected.has("rice")) {
    ideas.push({
      name: tr(language, "Legume and rice bowl", "Bowl de legumbres y arroz"),
      description: tr(language, "Combine beans or lentils with rice, vegetables and a fresh topping.", "Combiná fríjoles o lentejas con arroz, vegetales y un acompañamiento fresco."),
    });
  }

  return ideas.length ? ideas : [{
    name: tr(language, "Build-your-own balanced plate", "Plato balanceado a tu gusto"),
    description: tr(language, "Choose one preferred protein, vegetables and a carbohydrate source from your selections.", "Elegí una proteína, vegetales y una fuente de carbohidratos de tus selecciones."),
  }];
}
