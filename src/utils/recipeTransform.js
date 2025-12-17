// src/utils/recipeTransform.js
// Alpha-safe preset transformations (no AI).
// Export: applyRecipePreset(recipe, presetId)

import { nowISO, safeId } from "./Storage";

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function norm(s) {
  return (s || "").toLowerCase().trim();
}

function hasWord(hay, word) {
  return norm(hay).includes(word);
}

function mkSwap(oldIng, replacement, reason, ruleId) {
  return {
    old: { id: oldIng.id, name: oldIng.name, amount: oldIng.amount, unit: oldIng.unit },
    next: replacement,
    reason,
    ruleId,
  };
}

function swapIngredient(ing, nextName, nextAmount = ing.amount, nextUnit = ing.unit, reason = "", ruleId = "SWAP") {
  const replacement = {
    ...ing,
    id: safeId("ing"),
    name: nextName,
    amount: nextAmount,
    unit: nextUnit,
    grocery: { ...(ing.grocery || {}), canonicalName: nextName },
  };
  return { replacement, swap: mkSwap(ing, { name: nextName, amount: nextAmount, unit: nextUnit }, reason, ruleId) };
}

function removeIngredient(ing, reason = "", ruleId = "REMOVE") {
  return {
    removed: { id: ing.id, name: ing.name, amount: ing.amount, unit: ing.unit },
    reason,
    ruleId,
  };
}

function reduceIngredient(ing, percent, reason = "", ruleId = "REDUCE") {
  const nextAmount = Number(ing.amount) * (1 - percent);
  const replacement = { ...ing, amount: Math.max(0, Math.round(nextAmount * 100) / 100) };
  return {
    replacement,
    reduce: {
      old: { id: ing.id, name: ing.name, amount: ing.amount, unit: ing.unit },
      next: { id: ing.id, name: ing.name, amount: replacement.amount, unit: replacement.unit },
      reason,
      ruleId,
    },
  };
}

function applyLowerCarb(recipe) {
  const r = clone(recipe);
  const delta = { removed: [], added: [], swapped: [] };

  const nextIngredients = [];
  for (const ing of r.ingredients || []) {
    const name = norm(ing.name);

    // pasta/noodles/rice swaps
    if (hasWord(name, "pasta") || hasWord(name, "noodle") || hasWord(name, "spaghetti") || hasWord(name, "lasagna")) {
      const { replacement, swap } = swapIngredient(
        ing,
        "zucchini noodles",
        ing.amount,
        "medium",
        "Lower carb swap for pasta/noodles",
        "LOWER_CARB_PASTA_SWAP"
      );
      nextIngredients.push(replacement);
      delta.swapped.push(swap);
      continue;
    }

    if (hasWord(name, "rice")) {
      const { replacement, swap } = swapIngredient(
        ing,
        "cauliflower rice",
        ing.amount,
        "bag",
        "Lower carb swap for rice",
        "LOWER_CARB_RICE_SWAP"
      );
      nextIngredients.push(replacement);
      delta.swapped.push(swap);
      continue;
    }

    // sugar swaps
    if (hasWord(name, "sugar") || hasWord(name, "brown sugar") || hasWord(name, "honey") || hasWord(name, "syrup")) {
      const { replacement, swap } = swapIngredient(
        ing,
        "monk fruit sweetener",
        ing.amount,
        ing.unit,
        "Lower sugar swap",
        "LOWER_CARB_SWEETENER_SWAP"
      );
      nextIngredients.push(replacement);
      delta.swapped.push(swap);
      continue;
    }

    // flour/breadcrumb swaps
    if (hasWord(name, "flour") || hasWord(name, "breadcrumbs") || hasWord(name, "bread crumbs")) {
      const { replacement, swap } = swapIngredient(
        ing,
        "almond flour",
        ing.amount,
        ing.unit,
        "Lower carb swap for flour/breadcrumbs",
        "LOWER_CARB_FLOUR_SWAP"
      );
      nextIngredients.push(replacement);
      delta.swapped.push(swap);
      continue;
    }

    nextIngredients.push(ing);
  }

  r.ingredients = nextIngredients;
  r.transform = r.transform || {};
  r.transform.lastAppliedPreset = "LOWER_CARB";
  r.transform.delta = delta;
  r.updatedAt = nowISO();
  return r;
}

function applyKeto(recipe) {
  // Keto = LowerCarb + a few extra guardrails
  const r = applyLowerCarb(recipe);
  const delta = r.transform?.delta || { removed: [], added: [], swapped: [] };

  const nextIngredients = [];
  for (const ing of r.ingredients || []) {
    const name = norm(ing.name);

    // remove beans/legumes
    if (hasWord(name, "beans") || hasWord(name, "lentil") || hasWord(name, "chickpea")) {
      delta.removed.push(removeIngredient(ing, "Keto removes most legumes", "KETO_REMOVE_LEGUMES"));
      continue;
    }

    // remove high-sugar sauces
    if (hasWord(name, "bbq") || hasWord(name, "teriyaki") || hasWord(name, "sweet")) {
      const { replacement, swap } = swapIngredient(
        ing,
        "no-sugar sauce",
        ing.amount,
        ing.unit,
        "Keto-friendly sauce swap",
        "KETO_SAUCE_SWAP"
      );
      nextIngredients.push(replacement);
      delta.swapped.push(swap);
      continue;
    }

    nextIngredients.push(ing);
  }

  r.ingredients = nextIngredients;
  r.transform.lastAppliedPreset = "KETO";
  r.transform.delta = delta;
  r.updatedAt = nowISO();
  return r;
}

function applyPaleo(recipe) {
  const r = clone(recipe);
  const delta = { removed: [], added: [], swapped: [] };

  const nextIngredients = [];
  for (const ing of r.ingredients || []) {
    const name = norm(ing.name);

    // remove grains
    if (hasWord(name, "pasta") || hasWord(name, "noodle") || hasWord(name, "rice") || hasWord(name, "bread") || hasWord(name, "flour")) {
      delta.removed.push(removeIngredient(ing, "Paleo removes grains", "PALEO_REMOVE_GRAINS"));
      continue;
    }

    // dairy swaps (simple)
    if (hasWord(name, "cheese") || hasWord(name, "milk") || hasWord(name, "cream") || hasWord(name, "yogurt")) {
      delta.removed.push(removeIngredient(ing, "Paleo often reduces dairy", "PALEO_REMOVE_DAIRY"));
      continue;
    }

    // sugar swaps
    if (hasWord(name, "sugar") || hasWord(name, "syrup")) {
      delta.removed.push(removeIngredient(ing, "Paleo avoids refined sugar", "PALEO_REMOVE_SUGAR"));
      continue;
    }

    nextIngredients.push(ing);
  }

  r.ingredients = nextIngredients;

  // Add “extra veg” as a helpful filler (optional)
  const addVeg = {
    id: safeId("ing"),
    name: "extra vegetables (seasonal)",
    amount: 1,
    unit: "mix",
    form: null,
    category: "Produce",
    tags: ["produce"],
    optional: true,
    grocery: { canonicalName: "vegetables", storeSku: null, brand: null },
    substitutions: [],
  };
  nextIngredients.push(addVeg);
  delta.added.push({ id: addVeg.id, name: addVeg.name, amount: addVeg.amount, unit: addVeg.unit, reason: "Paleo-friendly volume" });

  r.transform = r.transform || {};
  r.transform.lastAppliedPreset = "PALEO";
  r.transform.delta = delta;
  r.updatedAt = nowISO();
  return r;
}

function applyLowerCalorie(recipe) {
  const r = clone(recipe);
  const delta = { removed: [], added: [], swapped: [] };

  const nextIngredients = [];
  for (const ing of r.ingredients || []) {
    const name = norm(ing.name);

    // reduce oils/butter by 25%
    if (hasWord(name, "oil") || hasWord(name, "butter")) {
      const { replacement, reduce } = reduceIngredient(ing, 0.25, "Reduce added fats slightly", "LOWER_CAL_REDUCE_FAT");
      nextIngredients.push(replacement);
      delta.swapped.push({ ...reduce, kind: "reduce" });
      continue;
    }

    // swap mayo/sour cream to greek yogurt
    if (hasWord(name, "mayo") || hasWord(name, "mayonnaise") || hasWord(name, "sour cream")) {
      const { replacement, swap } = swapIngredient(
        ing,
        "greek yogurt",
        ing.amount,
        ing.unit,
        "Lower calorie swap for creamy base",
        "LOWER_CAL_CREAMY_SWAP"
      );
      nextIngredients.push(replacement);
      delta.swapped.push(swap);
      continue;
    }

    // swap fatty ground beef -> leaner
    if (hasWord(name, "ground beef") && (hasWord(name, "80/20") || hasWord(name, "73/27"))) {
      const { replacement, swap } = swapIngredient(
        ing,
        "ground beef 90/10",
        ing.amount,
        ing.unit,
        "Lean protein swap",
        "LOWER_CAL_LEAN_SWAP"
      );
      nextIngredients.push(replacement);
      delta.swapped.push(swap);
      continue;
    }

    nextIngredients.push(ing);
  }

  // Add “extra veg” optional
  const veg = {
    id: safeId("ing"),
    name: "extra vegetables (volume add)",
    amount: 1,
    unit: "mix",
    form: null,
    category: "Produce",
    tags: ["produce"],
    optional: true,
    grocery: { canonicalName: "vegetables", storeSku: null, brand: null },
    substitutions: [],
  };
  nextIngredients.push(veg);
  delta.added.push({ id: veg.id, name: veg.name, amount: veg.amount, unit: veg.unit, reason: "Volume with fewer calories" });

  r.ingredients = nextIngredients;
  r.transform = r.transform || {};
  r.transform.lastAppliedPreset = "LOWER_CALORIE";
  r.transform.delta = delta;
  r.updatedAt = nowISO();
  return r;
}

export function applyRecipePreset(recipe, presetId) {
  const base = recipe || {};
  let nextRecipe = clone(base);

  if (!nextRecipe.transform) nextRecipe.transform = { lastAppliedPreset: null, delta: { removed: [], added: [], swapped: [] } };

  switch (presetId) {
    case "LOWER_CARB":
      nextRecipe = applyLowerCarb(nextRecipe);
      break;
    case "KETO":
      nextRecipe = applyKeto(nextRecipe);
      break;
    case "PALEO":
      nextRecipe = applyPaleo(nextRecipe);
      break;
    case "LOWER_CALORIE":
      nextRecipe = applyLowerCalorie(nextRecipe);
      break;
    default:
      nextRecipe.updatedAt = nowISO();
      break;
  }

  return { nextRecipe };
}
