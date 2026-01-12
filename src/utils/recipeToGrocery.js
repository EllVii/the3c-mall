// src/utils/recipeToGrocery.js
// Recipe -> Grocery conversion + merging logic (Beta-safe)
// Exports: recipeToGroceryItems, mergeGroceryItems

import { safeId, nowISO } from "./Storage";

function norm(s) {
  return (s || "").toLowerCase().trim();
}

function canonicalizeIngredient(ing) {
  const c = norm(ing?.grocery?.canonicalName || ing?.name || "");
  return c.replace(/\s+/g, " ").trim();
}

function keyForItem(item) {
  // merge key: canonical + unit
  return `${norm(item.canonicalName)}|${norm(item.unit)}`;
}

/**
 * Convert recipe ingredients to grocery items.
 * servingsUsed is just metadata right now (no complex scaling in beta).
 */
export function recipeToGroceryItems(recipe, servingsUsed = 1) {
  const items = [];

  for (const ing of recipe?.ingredients || []) {
    const canonicalName = canonicalizeIngredient(ing) || norm(ing.name);

    if (!canonicalName) continue;

    items.push({
      id: safeId("gri"),
      canonicalName,
      displayName: ing.name || canonicalName,
      category: ing.category || "Other",
      amount: Number(ing.amount || 1),
      unit: ing.unit || "each",
      optional: !!ing.optional,

      // provenance
      source: {
        type: "recipe",
        recipeId: recipe.id,
        recipeTitle: recipe.title,
        servingsUsed,
      },

      // pricing placeholders (Beta demo)
      pricing: {
        estimatedLow: null,
        estimatedHigh: null,
        currency: "USD",
      },

      // audit
      createdAt: nowISO(),
      updatedAt: nowISO(),
    });
  }

  return items;
}

/**
 * Merge grocery items (existing + add) by canonicalName + unit.
 * Sums amounts when same key.
 */
export function mergeGroceryItems(existing = [], add = []) {
  const map = new Map();

  for (const it of existing) {
    const k = keyForItem(it);
    map.set(k, { ...it });
  }

  for (const it of add) {
    const k = keyForItem(it);
    const prev = map.get(k);

    if (!prev) {
      map.set(k, { ...it });
      continue;
    }

    const merged = {
      ...prev,
      amount: Math.round((Number(prev.amount || 0) + Number(it.amount || 0)) * 100) / 100,
      updatedAt: nowISO(),
      // keep category if it already exists; otherwise use new
      category: prev.category || it.category || "Other",
      // keep optional only if both are optional
      optional: !!prev.optional && !!it.optional,
      // keep provenance list (simple)
      sources: [
        ...(prev.sources || [prev.source].filter(Boolean)),
        ...(it.sources || [it.source].filter(Boolean)),
      ].filter(Boolean),
    };

    delete merged.source; // normalize to "sources"
    map.set(k, merged);
  }

  return Array.from(map.values());
}
