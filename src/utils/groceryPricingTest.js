// src/utils/groceryPricingTest.js
/**
 * Legal Compliance Note:
 * This module calculates pricing estimates to help users compare store options.
 * It does NOT guarantee prices, make purchasing decisions, or process transactions.
 * 
 * Key Principles:
 * 1. All prices are estimates based on demo data (rotates daily)
 * 2. Actual retailer prices may vary by location, time, availability
 * 3. User explicitly chooses store; 3C does not auto-route
 * 4. User completes purchase on retailer's website, not through 3C
 * 
 * See GROCERY_ROUTING_LEGAL_COMPLIANCE.md for complete legal positioning.
 */
import { readJSON, writeJSON, safeId, nowISO } from "./Storage";

// Storage keys (keep consistent everywhere)
export const GROCERY_KEY = "grocery.items.v1";
export const PRICING_SUMMARY_KEY = "grocery.pricingSummary.v1";

// Internal helpers
const round2 = (n) => Math.round((Number(n || 0) + Number.EPSILON) * 100) / 100;

const STORE_IDS = ["costco", "walmart", "aldi", "target", "kroger", "safeway_albertsons"];

function ensurePricesByStore(pricesByStore = {}) {
  // guarantees every store has a numeric value (or null if unknown)
  const out = {};
  for (const sid of STORE_IDS) {
    const v = pricesByStore?.[sid];
    out[sid] = v == null ? null : Number(v);
  }
  return out;
}

function normalizeItem(raw) {
  return {
    id: raw?.id || safeId("itm"),
    name: (raw?.name || "").trim(),
    qty: Number(raw?.qty ?? raw?.quantity ?? 1) || 1,
    unit: raw?.unit || "each",
    substitute: raw?.substitute || "",
    substituteReason: raw?.substituteReason || "",
    pricesByStore: ensurePricesByStore(raw?.pricesByStore || raw?.prices || {}),
  };
}

// Demo pricing: base price -> each store gets a small multiplier
function mkDemoPrices(base) {
  const b = Number(base || 0);
  return ensurePricesByStore({
    costco: round2(b * 0.92),
    walmart: round2(b * 0.98),
    aldi: round2(b * 0.95),
    target: round2(b * 1.05),
    kroger: round2(b * 1.02),
    safeway_albertsons: round2(b * 1.08),
  });
}

// ✅ Exported: seeds demo groceries into cart (extra items)
export function seedTestGroceries({ overwrite = false } = {}) {
  const seeded = [
    { name: "Milk", qty: 1, unit: "gallon", base: 4.49 },
    { name: "Eggs", qty: 1, unit: "dozen", base: 3.29 },
    { name: "Ground beef", qty: 2, unit: "lb", base: 5.49 },
    { name: "Bananas", qty: 6, unit: "each", base: 0.29 },
    { name: "Orange juice", qty: 1, unit: "bottle", base: 4.99 },
  ].map((x) =>
    normalizeItem({
      id: safeId("seed"),
      name: x.name,
      qty: x.qty,
      unit: x.unit,
      pricesByStore: mkDemoPrices(x.base),
    })
  );

  const current = readJSON(GROCERY_KEY, []);
  const next = overwrite ? seeded : [...(Array.isArray(current) ? current : []).map(normalizeItem), ...seeded];

  writeJSON(GROCERY_KEY, next);
  return next;
}

// ✅ Exported: pricing calculator your page expects
export function calcPricingSummary({ items, lane, includedStoreIds, stores } = {}) {
  const list = Array.isArray(items) ? items.map(normalizeItem) : [];
  const included = Array.isArray(includedStoreIds) && includedStoreIds.length ? includedStoreIds : STORE_IDS;

  // If cart empty -> return a safe empty summary
  if (!list.length) {
    return {
      mode: lane === "single-store" ? "single-store" : "multi-store",
      chosenStoreId: null,
      grandTotal: 0,
      storeTotals: {},
      perItemAllocations: [],
      at: nowISO(),
    };
  }

  const storeTotals = {};
  for (const sid of included) storeTotals[sid] = 0;

  const perItemAllocations = [];

  const mode = lane === "single-store" ? "single-store" : "multi-store";

  if (mode === "single-store") {
    // sum totals per store, choose lowest price
    for (const sid of included) {
      let total = 0;
      for (const it of list) {
        const p = it.pricesByStore?.[sid];
        // If a price is missing, treat it as 0 for demo (or you can treat as invalid)
        total += (Number(p ?? 0) || 0) * (Number(it.qty) || 0);
      }
      storeTotals[sid] = round2(total);
    }

    let chosenStoreId = included[0] || null;
    for (const sid of included) {
      if (storeTotals[sid] < storeTotals[chosenStoreId]) chosenStoreId = sid;
    }

    // allocations: everything goes to chosen store
    for (const it of list) {
      const unit = Number(it.pricesByStore?.[chosenStoreId] ?? 0) || 0;
      const ext = round2(unit * (Number(it.qty) || 0));
      perItemAllocations.push({
        itemId: it.id,
        name: it.name,
        qty: it.qty,
        unit: it.unit,
        chosenStoreId,
        unitPrice: unit,
        ext,
      });
    }

    return {
      mode,
      chosenStoreId,
      grandTotal: storeTotals[chosenStoreId] ?? 0,
      storeTotals,
      perItemAllocations,
      at: nowISO(),
    };
  }

  // multi-store: allocate each item to the lowest-priced store for that item
  for (const it of list) {
    let bestStore = null;
    let bestUnit = null;

    for (const sid of included) {
      const p = it.pricesByStore?.[sid];
      const unit = p == null ? null : Number(p);

      if (unit == null || Number.isNaN(unit)) continue;
      if (bestUnit == null || unit < bestUnit) {
        bestUnit = unit;
        bestStore = sid;
      }
    }

    // If no prices exist, put it in the first included store at 0 (demo-safe)
    if (!bestStore) bestStore = included[0] || "costco";
    if (bestUnit == null) bestUnit = 0;

    const ext = round2(bestUnit * (Number(it.qty) || 0));
    storeTotals[bestStore] = round2((storeTotals[bestStore] || 0) + ext);

    perItemAllocations.push({
      itemId: it.id,
      name: it.name,
      qty: it.qty,
      unit: it.unit,
      chosenStoreId: bestStore,
      unitPrice: bestUnit,
      ext,
    });
  }

  const grandTotal = round2(Object.values(storeTotals).reduce((a, b) => a + Number(b || 0), 0));

  return {
    mode,
    chosenStoreId: null,
    grandTotal,
    storeTotals,
    perItemAllocations,
    at: nowISO(),
  };
}

// ✅ Exported: persist summary
export function savePricingSummary(summary) {
  writeJSON(PRICING_SUMMARY_KEY, summary);
  return summary;
}
