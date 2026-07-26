export interface FoodSearchResult {
  id: number;
  name: string;
  dataType: string;
  serving: string;
  calories: number | null;
  proteinGrams: number | null;
  carbohydrateGrams: number | null;
  fatGrams: number | null;
}

interface FoodSearchOptions {
  fetcher?: typeof fetch;
  apiKey?: string;
}

interface FoodDataNutrient {
  nutrientName?: string;
  unitName?: string;
  value?: number;
}

interface FoodDataResult {
  fdcId: number;
  description?: string;
  dataType?: string;
  servingSize?: number;
  servingSizeUnit?: string;
  foodNutrients?: FoodDataNutrient[];
}

interface FoodDataResponse {
  foods?: FoodDataResult[];
}

function nutrientValue(nutrients: FoodDataNutrient[], name: string, unit: string): number | null {
  const nutrient = nutrients.find((item) => (
    item.nutrientName?.toLocaleLowerCase() === name
    && item.unitName?.toLocaleLowerCase() === unit
  ));
  return typeof nutrient?.value === "number" ? Math.round(nutrient.value * 10) / 10 : null;
}

export async function searchFoodData(
  query: string,
  options: FoodSearchOptions = {},
): Promise<FoodSearchResult[]> {
  const normalizedQuery = query.trim();
  if (!normalizedQuery) return [];

  const fetcher = options.fetcher ?? fetch;
  const searchUrl = new URL("https://api.nal.usda.gov/fdc/v1/foods/search");
  searchUrl.searchParams.set("api_key", options.apiKey ?? "DEMO_KEY");
  searchUrl.searchParams.set("query", normalizedQuery);
  searchUrl.searchParams.set("pageSize", "8");
  searchUrl.searchParams.set("dataType", "Foundation,SR Legacy");

  const response = await fetcher(searchUrl);
  if (!response.ok) {
    throw new Error(`FoodData Central is unavailable (${response.status}).`);
  }

  const payload = await response.json() as FoodDataResponse;
  return (payload.foods ?? []).map((food) => {
    const nutrients = food.foodNutrients ?? [];
    const serving = food.servingSize && food.servingSizeUnit
      ? `${food.servingSize} ${food.servingSizeUnit.toLocaleLowerCase()}`
      : "100 g";

    return {
      id: food.fdcId,
      name: food.description ?? "Unnamed food",
      dataType: food.dataType ?? "USDA",
      serving,
      calories: nutrientValue(nutrients, "energy", "kcal"),
      proteinGrams: nutrientValue(nutrients, "protein", "g"),
      carbohydrateGrams: nutrientValue(nutrients, "carbohydrate, by difference", "g"),
      fatGrams: nutrientValue(nutrients, "total lipid (fat)", "g"),
    };
  });
}
