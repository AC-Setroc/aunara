import { FOOD_EXCHANGE_ITEMS, type FoodExchangeItem, type FoodGroupKey, type ServingMeasure } from "../data/foodExchange";
import type { HealthProfile, LanguageCode } from "../types";
import { tr } from "./i18n";
import { createWellnessSummary } from "./wellness";

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

export interface MacroTarget {
  grams: number;
  calories: number;
  energyPercent: number;
}

export interface MacroPlan {
  energyKcal: number;
  maintenanceRange: { min: number; max: number };
  protein: MacroTarget & { referenceRange: { min: number; max: number } };
  carbohydrates: MacroTarget;
  fat: MacroTarget;
  mealsPerDay: 3 | 4 | 5;
  perMeal: {
    proteinGrams: number;
    carbohydrateGrams: number;
    fatGrams: number;
  };
}

export interface FoodGroupDefinition {
  key: FoodGroupKey;
  label: { en: string; es: string };
}

export const FOOD_GROUPS: readonly FoodGroupDefinition[] = [
  { key: "grains", label: { en: "Grains", es: "Harinas" } },
  { key: "roots", label: { en: "Roots, tubers and plantains", es: "Raíces, tubérculos y plátanos" } },
  { key: "legumes", label: { en: "Legumes", es: "Leguminosas" } },
  { key: "meats", label: { en: "Meat and fish", es: "Carnes y pescados" } },
  { key: "dairy", label: { en: "Dairy products", es: "Lácteos y derivados" } },
  { key: "cheeses", label: { en: "Cheese and substitutes", es: "Quesos y sustitutos" } },
  { key: "fats", label: { en: "Fats", es: "Grasas" } },
  { key: "nuts", label: { en: "Nuts and dried fruit", es: "Nueces y frutos secos" } },
  { key: "fruits", label: { en: "Fruits", es: "Frutas" } },
  { key: "vegetables", label: { en: "Vegetables", es: "Verduras" } },
  { key: "sweets", label: { en: "Sugars and desserts", es: "Azúcares y postres" } },
] as const;

export const FOOD_ITEMS = FOOD_EXCHANGE_ITEMS;

const LEGACY_INGREDIENT_IDS: Record<string, string> = {
  eggs: "egg",
  chicken: "chicken-breast",
  fish: "fish",
  beef: "lean-beef",
  pork: "pork-cutlet",
  legumes: "lentils",
  yogurt: "yogurt",
  "leafy-greens": "spinach-raw",
  broccoli: "cauliflower",
  tomato: "tomato",
  carrot: "carrot",
  pepper: "red-bell-pepper",
  vegetables: "spinach-raw",
  rice: "white-rice-cooked",
  potato: "potato-cooked",
  oats: "rolled-oats",
  pasta: "pasta-cooked",
  arepa: "thin-corn-arepa",
  plantain: "ripe-plantain",
  avocado: "avocado",
  "olive-oil": "olive-oil",
  nuts: "mixed-nuts",
  banana: "banana",
  berries: "strawberries",
  citrus: "orange",
  mango: "mango",
  apple: "apple",
};

export function normalizePreferredIngredients(ingredients: string[]): string[] {
  const knownIds = new Set(FOOD_ITEMS.map((food) => food.id));
  return [...new Set(ingredients
    .map((ingredient) => LEGACY_INGREDIENT_IDS[ingredient] ?? ingredient)
    .filter((ingredient) => knownIds.has(ingredient)))];
}

export function foodName(food: FoodExchangeItem, language: LanguageCode): string {
  return language === "es" ? food.name.es : food.name.en;
}

const MEASURE_LABELS: Record<ServingMeasure, { en: [string, string]; es: [string, string] }> = {
  unit: { en: ["unit", "units"], es: ["unidad", "unidades"] },
  tablespoon: { en: ["tbsp", "tbsp"], es: ["cda.", "cdas."] },
  cup: { en: ["cup", "cups"], es: ["taza", "tazas"] },
  slice: { en: ["slice", "slices"], es: ["tajada", "tajadas"] },
  portion: { en: ["portion", "portions"], es: ["porción", "porciones"] },
  glass: { en: ["glass", "glasses"], es: ["vaso", "vasos"] },
  teaspoon: { en: ["tsp", "tsp"], es: ["cdita.", "cditas."] },
};

export function formatFoodServing(food: FoodExchangeItem, language: LanguageCode): string {
  const locale = language === "es" ? "es-CO" : "en-US";
  const quantity = new Intl.NumberFormat(locale, { maximumFractionDigits: 2 })
    .format(food.serving.quantity);
  const labels = MEASURE_LABELS[food.serving.measure][language === "es" ? "es" : "en"];
  const measure = labels[food.serving.quantity === 1 ? 0 : 1];
  return `${quantity} ${measure} · ${food.serving.mass} ${food.serving.massUnit}`;
}

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

function macroTarget(grams: number, caloriesPerGram: number, totalCalories: number): MacroTarget {
  const calories = Math.round(grams * caloriesPerGram);
  return {
    grams,
    calories,
    energyPercent: Math.round((calories / totalCalories) * 100),
  };
}

/**
 * Builds one coherent maintenance-based starting point. It deliberately does
 * not create an automatic calorie deficit or surplus from a goal label.
 */
export function createMacroPlan(profile: HealthProfile): MacroPlan | null {
  const wellness = createWellnessSummary(profile);
  const maintenance = wellness.maintenanceCalories;
  const proteinRange = wellness.proteinGrams;
  if (!maintenance || !proteinRange) return null;

  const energyKcal = Math.round(((maintenance.min + maintenance.max) / 2) / 50) * 50;
  const proteinGrams = Math.round((proteinRange.min + proteinRange.max) / 2);
  const fatGrams = Math.round((energyKcal * 0.3) / 9);
  const carbohydrateGrams = Math.round((energyKcal - (proteinGrams * 4) - (fatGrams * 9)) / 4);
  if (carbohydrateGrams <= 0) return null;

  const requestedMeals = profile.macroMealsPerDay;
  const mealsPerDay: 3 | 4 | 5 = requestedMeals === 3 || requestedMeals === 4 || requestedMeals === 5
    ? requestedMeals
    : 4;
  return {
    energyKcal,
    maintenanceRange: maintenance,
    protein: {
      ...macroTarget(proteinGrams, 4, energyKcal),
      referenceRange: proteinRange,
    },
    carbohydrates: macroTarget(carbohydrateGrams, 4, energyKcal),
    fat: macroTarget(fatGrams, 9, energyKcal),
    mealsPerDay,
    perMeal: {
      proteinGrams: Math.round(proteinGrams / mealsPerDay),
      carbohydrateGrams: Math.round(carbohydrateGrams / mealsPerDay),
      fatGrams: Math.round(fatGrams / mealsPerDay),
    },
  };
}

function selectedByGroup(selected: Set<string>, groups: FoodGroupKey[]): FoodExchangeItem[] {
  return FOOD_ITEMS.filter((food) => selected.has(food.id) && groups.includes(food.group));
}

function naturalList(values: string[], language: LanguageCode): string {
  if (values.length < 2) return values[0] ?? "";
  if (values.length === 2) return values.join(language === "es" ? " y " : " and ");
  return `${values.slice(0, -1).join(", ")}${language === "es" ? " y " : " and "}${values.at(-1)}`;
}

function servingList(foods: FoodExchangeItem[], language: LanguageCode): string {
  return foods
    .map((food) => `${formatFoodServing(food, language)} ${foodName(food, language).toLocaleLowerCase()}`)
    .join("; ");
}

export function createRecipeIdeas(
  ingredients: string[],
  language: LanguageCode,
): RecipeIdea[] {
  const selected = new Set(normalizePreferredIngredients(ingredients));
  const proteins = selectedByGroup(selected, ["meats", "legumes", "cheeses", "dairy"]);
  const carbohydrates = selectedByGroup(selected, ["grains", "roots"]);
  const vegetables = selectedByGroup(selected, ["vegetables"]);
  const fats = selectedByGroup(selected, ["fats"]);
  const fruits = selectedByGroup(selected, ["fruits"]);
  const nuts = selectedByGroup(selected, ["nuts"]);
  const ideas: RecipeIdea[] = [];

  if (proteins[0] && carbohydrates[0] && vegetables[0]) {
    const core = [proteins[0], carbohydrates[0], vegetables[0]];
    const optional = fats[0] ? [fats[0]] : [];
    ideas.push({
      name: tr(
        language,
        `${naturalList(core.map((food) => foodName(food, language)), language)} plate`,
        `Plato de ${naturalList(core.map((food) => foodName(food, language).toLocaleLowerCase()), language)}`,
      ),
      description: tr(
        language,
        `Combine the reference servings: ${servingList([...core, ...optional], language)}. Adjust the total amount to your appetite, training and professional guidance.`,
        `Combiná las porciones de referencia: ${servingList([...core, ...optional], language)}. Ajustá la cantidad total según tu apetito, entrenamiento y orientación profesional.`,
      ),
    });
  }

  const breakfastBase = [...selectedByGroup(selected, ["dairy"]), ...selectedByGroup(selected, ["cheeses"])];
  if (carbohydrates[0] && breakfastBase[0] && fruits[0]) {
    const foods = [carbohydrates[0], breakfastBase[0], fruits[0], nuts[0]].filter(Boolean) as FoodExchangeItem[];
    ideas.push({
      name: tr(
        language,
        `${naturalList(foods.slice(0, 3).map((food) => foodName(food, language)), language)} breakfast`,
        `Desayuno de ${naturalList(foods.slice(0, 3).map((food) => foodName(food, language).toLocaleLowerCase()), language)}`,
      ),
      description: tr(
        language,
        `Use only your selected foods: ${servingList(foods, language)}. Combine or serve separately according to preference.`,
        `Usá únicamente los alimentos que elegiste: ${servingList(foods, language)}. Combinalos o servilos por separado según tu preferencia.`,
      ),
    });
  }

  if (fruits[0] && (selectedByGroup(selected, ["dairy"])[0] || nuts[0])) {
    const companion = selectedByGroup(selected, ["dairy"])[0] ?? nuts[0];
    const foods = [fruits[0], companion];
    ideas.push({
      name: tr(
        language,
        `${naturalList(foods.map((food) => foodName(food, language)), language)} snack`,
        `Merienda de ${naturalList(foods.map((food) => foodName(food, language).toLocaleLowerCase()), language)}`,
      ),
      description: tr(
        language,
        `A simple option using the reference servings: ${servingList(foods, language)}.`,
        `Una opción sencilla usando las porciones de referencia: ${servingList(foods, language)}.`,
      ),
    });
  }

  if (!ideas.length) {
    const selectedFoods = FOOD_ITEMS.filter((food) => selected.has(food.id)).slice(0, 3);
    if (selectedFoods.length >= 2) {
      ideas.push({
        name: tr(
          language,
          `${naturalList(selectedFoods.map((food) => foodName(food, language)), language)} combination`,
          `Combinación de ${naturalList(selectedFoods.map((food) => foodName(food, language).toLocaleLowerCase()), language)}`,
        ),
        description: tr(
          language,
          `Start with the reference servings: ${servingList(selectedFoods, language)}. Add more selected groups to build a fuller meal.`,
          `Empezá con las porciones de referencia: ${servingList(selectedFoods, language)}. Elegí más grupos para armar una comida más completa.`,
        ),
      });
    }
  }

  return ideas.slice(0, 4);
}
