// Original starter recipes for the controlled 3C Mall pilot.
// Quantities and steps are recipe guidance, not verified nutritional or retailer data.
const entry = (id, title, description, imageUrl, servings, prepMinutes, cookMinutes, ingredients, steps, tags) => ({
  id, title, description, imageUrl,
  createdAt: "2026-11-17T00:00:00.000Z", updatedAt: "2026-11-17T00:00:00.000Z",
  schemaVersion: 1, visibility: "public", source: { type: "original", provider: "3C Mall" },
  servings: { defaultServings: servings, unit: "serving" },
  time: { prepMinutes, cookMinutes },
  ingredients: ingredients.map(([name, amount, unit, category], index) => ({
    id: id + "-ing-" + index, name, amount, unit, category,
    grocery: { canonicalName: name }, optional: false,
  })),
  steps: steps.map((text, index) => ({ n: index + 1, text })),
  lifestyle: { tags }, nutrition: { perServing: { calories: null, proteinG: null, carbsG: null, fatG: null } },
  favorites: false,
});
export const FEATURED_RECIPES = [
  entry("starter-chicken-rice", "Lemon Chicken & Rice", "A straightforward family dinner with vegetables.", "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=640&h=450&fit=crop", 4, 15, 30,
    [["boneless chicken breast", 1.5, "lb", "Meat"], ["uncooked rice", 1, "cup", "Pantry"], ["broccoli", 2, "cup", "Produce"], ["lemon", 1, "each", "Produce"], ["olive oil", 2, "tbsp", "Pantry"]],
    ["Cook rice according to package directions.", "Cook chicken thoroughly in a skillet with olive oil.", "Steam broccoli until tender.", "Finish chicken with lemon juice and serve with rice and broccoli."], ["dinner", "family"]),
  entry("starter-bean-tacos", "Black Bean Tacos", "An easy, affordable meatless dinner.", "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=640&h=450&fit=crop", 4, 10, 15,
    [["black beans", 2, "can", "Pantry"], ["small tortillas", 8, "each", "Bakery"], ["romaine lettuce", 2, "cup", "Produce"], ["tomato", 2, "each", "Produce"], ["shredded cheddar", 1, "cup", "Dairy"], ["taco seasoning", 2, "tbsp", "Pantry"]],
    ["Drain and rinse the beans.", "Warm beans with taco seasoning and a splash of water.", "Chop lettuce and tomatoes.", "Warm tortillas and fill with beans, vegetables and cheese."], ["dinner", "vegetarian", "budget"]),
  entry("starter-overnight-oats", "Berry Overnight Oats", "Breakfast ready when you are.", "https://images.unsplash.com/photo-1590301845551-faf91d16b84d?w=640&h=450&fit=crop", 2, 10, 0,
    [["rolled oats", 1, "cup", "Pantry"], ["milk", 1, "cup", "Dairy"], ["plain yogurt", 0.5, "cup", "Dairy"], ["mixed berries", 1, "cup", "Produce"], ["chia seeds", 2, "tbsp", "Pantry"]],
    ["Mix oats, milk, yogurt and chia seeds.", "Divide into covered containers.", "Refrigerate overnight.", "Top with berries before serving."], ["breakfast", "meal prep"]),
  entry("starter-tuna-wraps", "Tuna & Crunchy Veggie Wraps", "A quick lunch with no stove required.", "https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=640&h=450&fit=crop", 2, 10, 0,
    [["canned tuna", 2, "can", "Seafood"], ["large tortillas", 2, "each", "Bakery"], ["cucumber", 0.5, "each", "Produce"], ["romaine lettuce", 1, "cup", "Produce"], ["plain yogurt", 3, "tbsp", "Dairy"], ["lemon juice", 1, "tbsp", "Produce"]],
    ["Drain tuna.", "Mix tuna with yogurt and lemon juice.", "Slice cucumber and shred lettuce.", "Fill tortillas and roll tightly."], ["lunch", "quick"]),
  entry("starter-sheetpan-sausage", "Sheet-Pan Sausage & Vegetables", "One pan and a short shopping list.", "https://images.unsplash.com/photo-1547592180-85f173990554?w=640&h=450&fit=crop", 4, 10, 30,
    [["fully cooked chicken sausage", 1, "lb", "Meat"], ["potatoes", 1.5, "lb", "Produce"], ["bell pepper", 2, "each", "Produce"], ["red onion", 1, "each", "Produce"], ["olive oil", 2, "tbsp", "Pantry"]],
    ["Preheat oven to 425°F.", "Cut potatoes into small pieces and toss with oil.", "Roast potatoes for 15 minutes.", "Add sliced sausage, peppers and onion; roast until vegetables are tender and everything is heated through."], ["dinner", "one pan"]),
  entry("starter-yogurt-parfait", "Fruit & Yogurt Parfait", "A no-cook snack or light breakfast.", "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=640&h=450&fit=crop", 2, 5, 0,
    [["plain Greek yogurt", 2, "cup", "Dairy"], ["strawberries", 1, "cup", "Produce"], ["granola", 0.5, "cup", "Pantry"], ["banana", 1, "each", "Produce"]],
    ["Wash and slice fruit.", "Layer yogurt and fruit in two bowls.", "Sprinkle granola just before serving."], ["breakfast", "snack"]),
];
export function findFeaturedRecipe(id) {
  return FEATURED_RECIPES.find(recipe => recipe.id === id) || null;
}
