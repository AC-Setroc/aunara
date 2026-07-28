export type FoodGroupKey =
  | "grains"
  | "roots"
  | "legumes"
  | "meats"
  | "dairy"
  | "cheeses"
  | "fats"
  | "nuts"
  | "fruits"
  | "vegetables"
  | "sweets";

export type ServingMeasure =
  | "unit"
  | "tablespoon"
  | "cup"
  | "slice"
  | "portion"
  | "glass"
  | "teaspoon";

export interface FoodExchangeItem {
  id: string;
  group: FoodGroupKey;
  name: { en: string; es: string };
  serving: {
    quantity: number;
    measure: ServingMeasure;
    mass: number;
    massUnit: "g" | "ml";
  };
}

type FoodRow = readonly [
  id: string,
  group: FoodGroupKey,
  english: string,
  spanish: string,
  quantity: number,
  measure: ServingMeasure,
  mass: number,
  massUnit?: "g" | "ml",
];

// Source: "Intercambio" sheet in the food plan supplied by the user.
const FOOD_ROWS: readonly FoodRow[] = [
  ["thin-corn-arepa", "grains", "Thin corn arepa", "Arepa de maíz delgada", 1, "unit", 60],
  ["white-rice-cooked", "grains", "Cooked white rice", "Arroz blanco cocido", 6, "tablespoon", 80],
  ["brown-rice-cooked", "grains", "Cooked brown rice", "Arroz integral cocido", 6, "tablespoon", 80],
  ["rolled-oats", "grains", "Rolled oats", "Avena en hojuelas", 3, "tablespoon", 24],
  ["flake-cereal", "grains", "Flake cereal", "Cereal en hojuelas", 3, "tablespoon", 25],
  ["popcorn", "grains", "Popcorn", "Crispetas", 0.5, "cup", 27],
  ["saltine-crackers", "grains", "Saltine crackers", "Galletas Saltinas", 3, "unit", 24],
  ["unsweetened-granola", "grains", "Unsweetened granola", "Granola sin azúcar", 3, "tablespoon", 30],
  ["sweet-corn", "grains", "Sweet corn", "Maíz tierno", 2, "tablespoon", 50],
  ["pita-bread", "grains", "Pita bread", "Pan Pita - Árabe", 0.5, "unit", 25],
  ["white-bread", "grains", "White bread", "Pan blanco", 1, "slice", 22],
  ["whole-wheat-bread", "grains", "Whole-wheat bread", "Pan integral", 1, "slice", 32],
  ["cheese-bread", "grains", "Cheese bread", "Pan de queso", 1, "unit", 28],
  ["cassava-bread", "grains", "Cassava bread", "Pan de yuca", 1, "unit", 20],
  ["pasta-cooked", "grains", "Cooked pasta", "Pastas cocidas", 0.67, "cup", 65],
  ["toast-crackers", "grains", "Toast crackers", "Tostadas - Calados", 1, "unit", 32],
  ["corn-tortilla", "grains", "Corn tortilla", "Tortilla de maíz", 1, "unit", 30],
  ["quinoa", "grains", "Quinoa", "Quinoa", 7, "tablespoon", 80],

  ["arracacha", "roots", "Arracacha", "Arracacha", 1, "unit", 80],
  ["sweet-potato", "roots", "Sweet potato", "Batata", 0.25, "unit", 100],
  ["potato-cooked", "roots", "Cooked potato", "Papa cocida", 1, "unit", 83],
  ["creole-potato-cooked", "roots", "Cooked creole potato", "Papa criolla cocida", 3, "unit", 108],
  ["ripe-plantain", "roots", "Ripe plantain", "Plátano maduro", 0.25, "unit", 60],
  ["green-plantain", "roots", "Green plantain", "Plátano verde", 0.33, "unit", 80],
  ["cassava", "roots", "Cassava", "Yuca", 0.25, "unit", 60],
  ["soups-creams", "roots", "Soups / creams", "Sopas/Cremas", 10, "tablespoon", 100],

  ["red-beans", "legumes", "Red beans", "Fríjoles rojos", 10, "tablespoon", 100],
  ["black-beans", "legumes", "Black beans", "Fríjoles caraota", 10, "tablespoon", 100],
  ["peas", "legumes", "Peas", "Arveja", 10, "tablespoon", 150],
  ["chickpeas", "legumes", "Chickpeas", "Garbanzo", 10, "tablespoon", 100],
  ["lentils", "legumes", "Lentils", "Lentejas", 10, "tablespoon", 130],
  ["soybeans", "legumes", "Soybeans", "Soya", 10, "tablespoon", 90],

  ["lean-beef", "meats", "Lean beef", "Carne de res magra", 1, "portion", 250],
  ["tuna-water", "meats", "Tuna in water", "Atún en agua", 1, "portion", 250],
  ["chicken-breast", "meats", "Chicken breast", "Pechuga de pollo", 1, "portion", 250],
  ["pork-cutlet", "meats", "Pork cutlet", "Milanesa de cerdo", 1, "portion", 250],
  ["fish", "meats", "Fish", "Pescado", 1, "portion", 250],

  ["whole-milk", "dairy", "Whole milk", "Leche entera", 1, "glass", 250, "ml"],
  ["powdered-milk", "dairy", "Powdered milk", "Leche en polvo", 4, "tablespoon", 21],
  ["yogurt", "dairy", "Yogurt", "Yogurt", 1, "glass", 100],
  ["greek-yogurt", "dairy", "Greek yogurt", "Yogurt griego", 1, "portion", 100],
  ["frozen-yogurt", "dairy", "Frozen yogurt", "Helado de Yogurt", 1, "glass", 100],

  ["cuajada", "cheeses", "Fresh curd cheese", "Cuajada", 1, "slice", 30],
  ["pera-cheese", "cheeses", "Pera cheese", "Queso Pera", 1, "slice", 30],
  ["ricotta-cheese", "cheeses", "Ricotta cheese", "Queso Ricotta", 2, "tablespoon", 50],
  ["mozzarella-cheese", "cheeses", "Mozzarella cheese", "Queso Mozarella", 2, "slice", 30],
  ["parmesan-cheese", "cheeses", "Parmesan cheese", "Queso Parmesano", 2, "tablespoon", 14],
  ["egg", "cheeses", "Egg", "Huevo", 1, "unit", 60],
  ["quail-eggs", "cheeses", "Quail eggs", "Huevo de Codorniz", 4, "unit", 45],
  ["low-fat-ham", "cheeses", "Low-fat ham", "Jamón bajo en grasa", 2, "slice", 43],
  ["chicken-sausage", "cheeses", "Chicken sausage", "Salchicha de pollo", 1, "unit", 50],

  ["olive-oil", "fats", "Olive oil", "Aceite de Oliva", 1, "teaspoon", 5],
  ["avocado", "fats", "Avocado", "Aguacate", 0.5, "unit", 50],
  ["olives", "fats", "Olives", "Aceitunas", 4, "unit", 10],
  ["cream", "fats", "Cream", "Crema de leche", 1, "tablespoon", 15],
  ["butter", "fats", "Butter", "Mantequilla", 1, "teaspoon", 5],
  ["mayonnaise", "fats", "Mayonnaise", "Mayonesa", 1, "teaspoon", 10],
  ["cream-cheese", "fats", "Cream cheese", "Queso crema", 1, "teaspoon", 15],
  ["pesto", "fats", "Pesto sauce", "Salsa Pesto", 1, "tablespoon", 15],

  ["almonds", "nuts", "Almonds", "Almendras", 5, "unit", 10],
  ["unsalted-peanuts", "nuts", "Unsalted peanuts", "Maní sin sal", 1, "tablespoon", 10],
  ["hazelnuts", "nuts", "Hazelnuts", "Avellanas", 7, "unit", 10],
  ["shredded-coconut", "nuts", "Shredded coconut", "Coco rallado", 1, "tablespoon", 10],
  ["mixed-nuts", "nuts", "Mixed nuts", "Mezcla de nueces", 1, "tablespoon", 10],
  ["pistachios", "nuts", "Pistachios", "Pistachos", 7, "unit", 10],

  ["banana", "fruits", "Banana", "Banano", 1, "unit", 120],
  ["plum", "fruits", "Plum", "Ciruela", 2, "unit", 50],
  ["strawberries", "fruits", "Strawberries", "Fresas", 9, "unit", 161],
  ["granadilla", "fruits", "Granadilla", "Granadilla", 1, "unit", 100],
  ["melon", "fruits", "Melon", "Melón", 1, "slice", 120],
  ["kiwi", "fruits", "Kiwi", "Kiwi", 1, "unit", 82],
  ["mandarin", "fruits", "Mandarin", "Mandarina", 1, "unit", 105],
  ["mango", "fruits", "Mango", "Mango", 1, "unit", 112],
  ["apple", "fruits", "Apple", "Manzana", 1, "unit", 112],
  ["blackberries", "fruits", "Blackberries", "Moras", 12, "unit", 96],
  ["orange", "fruits", "Orange", "Naranja", 1, "unit", 147],
  ["cape-gooseberries", "fruits", "Cape gooseberries", "Uchuvas", 10, "unit", 68],
  ["pear", "fruits", "Pear", "Pera", 1, "unit", 115],
  ["pineapple", "fruits", "Pineapple", "Piña", 1, "slice", 115],
  ["grapes", "fruits", "Grapes", "Uvas", 10, "unit", 140],
  ["peach", "fruits", "Peach", "Durazno", 1, "unit", 100],

  ["white-onion-raw", "vegetables", "Raw white onion", "Cebolla blanca cruda", 0.5, "unit", 150],
  ["leek", "vegetables", "Leek", "Cebolla puerro", 1, "portion", 150],
  ["red-onion", "vegetables", "Red onion", "Cebolla roja", 0.5, "unit", 150],
  ["mushrooms", "vegetables", "Mushrooms", "Champiñones", 1, "portion", 150],
  ["cauliflower", "vegetables", "Cauliflower", "Coliflor", 1, "portion", 150],
  ["red-bell-pepper", "vegetables", "Red bell pepper", "Pimentón rojo", 0.5, "unit", 50],
  ["tomato", "vegetables", "Tomato", "Tomate", 0.5, "unit", 150],
  ["carrot", "vegetables", "Carrot", "Zanahoria", 0.5, "unit", 200],
  ["spinach-raw", "vegetables", "Raw spinach", "Espinaca cruda", 1, "portion", 100],

  ["dulce-de-leche", "sweets", "Dulce de leche", "Arequipe", 1, "teaspoon", 25],
  ["sugar", "sweets", "Sugar", "Azúcar", 1, "tablespoon", 25],
  ["guava-paste", "sweets", "Guava paste", "Bocadillo", 1, "unit", 30],
  ["honey", "sweets", "Honey", "Miel", 1, "tablespoon", 21],
  ["condensed-milk", "sweets", "Condensed milk", "Leche condensada", 1, "tablespoon", 28],
];

export const FOOD_EXCHANGE_ITEMS: readonly FoodExchangeItem[] = FOOD_ROWS.map(([
  id,
  group,
  english,
  spanish,
  quantity,
  measure,
  mass,
  massUnit = "g",
]) => ({
  id,
  group,
  name: { en: english, es: spanish },
  serving: { quantity, measure, mass, massUnit },
}));
