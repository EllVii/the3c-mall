// src/utils/groceryStrategy.js
/**
 * Legal Compliance Note:
 * This module calculates pricing estimates to help users make informed shopping decisions.
 * It does NOT guarantee prices, control routing, or process transactions.
 * 
 * All pricing is framed as "estimated" and subject to retailer variation.
 * User always retains final choice of store.
 * 
 * See GROCERY_ROUTING_LEGAL_COMPLIANCE.md for complete legal positioning.
 */
import { readJSON, writeJSON, nowISO, safeId } from "./Storage";

export const CART_KEY = "grocery.cart.v1";
export const PRICING_SUMMARY_KEY = "grocery.pricingSummary.v1";

/* ===============================
   CART INITIALIZATION (LOCAL)
   - Creates a starter cart ONLY if empty
   - Treated as real cart data
================================ */

export function initCartIfEmpty({ overwrite = false } = {}) {
  const existing = readJSON(CART_KEY, []);
  if (!overwrite && Array.isArray(existing) && existing.length) {
    return existing;
  }

  const t = nowISO();

  const cart = [
    {
      id: safeId("cart"),
      name: "Ground Beef (90/10)",
      qty: 5,
      unit: "lb",
      category: "Meat",
      prices: {
        costco: 4.19,
        walmart: 4.79,
        aldi: 4.29,
        target: 5.49,
        kroger: 5.29,
      },
      addedAt: t,
    },
    {
      id: safeId("cart"),
      name: "Chicken Thighs",
      qty: 6,
      unit: "lb",
      category: "Meat",
      prices: {
        costco: 1.89,
        walmart: 1.97,
        aldi: 1.99,
        target: 2.49,
        kroger: 2.29,
      },
      addedAt: t,
    },
    {
      id: safeId("cart"),
      name: "Eggs",
      qty: 2,
      unit: "dozen",
      category: "Dairy",
      prices: {
        costco: 3.29,
        walmart: 2.98,
        aldi: 2.59,
        target: 3.39,
        kroger: 3.49,
      },
      addedAt: t,
    },
    {
      id: safeId("cart"),
      name: "Milk",
      qty: 2,
      unit: "gallon",
      category: "Dairy",
      prices: {
        costco: 3.39,
        walmart: 3.18,
        aldi: 2.99,
        target: 3.49,
        kroger: 3.79,
      },
      addedAt: t,
    },
    {
      id: safeId("cart"),
      name: "Rice",
      qty: 10,
      unit: "lb",
      category: "Pantry",
      prices: {
        costco: 0.92,
        walmart: 1.05,
        aldi: 1.12,
        target: 1.29,
        kroger: 1.19,
      },
      addedAt: t,
    },
  ];

  writeJSON(CART_KEY, cart);
  return cart;
}

/* ===============================
   PRICING ENGINE
================================ */

function round(n) {
  return Math.round((Number(n) || 0) * 100) / 100;
}

function extendedPrice(item, storeId) {
  const unitPrice = item.prices?.[storeId];
  if (unitPrice == null) return null;
  return round(item.qty * unitPrice);
}

export function calculateCartPricing({
  cartItems,
  lane = "auto-multi", // auto-multi | single-store
  includedStoreIds = [],
  stores = [],
}) {
  const storeIds = includedStoreIds.length
    ? includedStoreIds
    : stores.map((s) => s.id);

  const storeTotals = {};
  storeIds.forEach((id) => (storeTotals[id] = 0));

  const allocations = [];

  // SINGLE STORE MODE
  if (lane === "single-store") {
    const totals = storeIds.map((sid) => ({
      sid,
      total: cartItems.reduce(
        (sum, item) => sum + (extendedPrice(item, sid) ?? 99999),
        0
      ),
    }));

    totals.sort((a, b) => a.total - b.total);
    const winner = totals[0].sid;

    cartItems.forEach((item) => {
      const total = extendedPrice(item, winner);
      storeTotals[winner] += total;
      allocations.push({
        item: item.name,
        storeId: winner,
        total,
      });
    });

    return finalizePricing({
      mode: "single-store",
      chosenStoreId: winner,
      storeTotals,
      allocations,
    });
  }

  // MULTI STORE MODE
  cartItems.forEach((item) => {
    const best = storeIds
      .map((sid) => ({ sid, total: extendedPrice(item, sid) }))
      .filter((x) => x.total != null)
      .sort((a, b) => a.total - b.total)[0];

    if (!best) return;

    storeTotals[best.sid] += best.total;
    allocations.push({
      item: item.name,
      storeId: best.sid,
      total: best.total,
    });
  });

  return finalizePricing({
    mode: "multi-store",
    storeTotals,
    allocations,
  });
}

function finalizePricing({ mode, chosenStoreId = null, storeTotals, allocations }) {
  const grandTotal = round(
    Object.values(storeTotals).reduce((a, b) => a + b, 0)
  );

  const summary = {
    mode,
    chosenStoreId,
    storeTotals,
    allocations,
    grandTotal,
    calculatedAt: nowISO(),
  };

  writeJSON(PRICING_SUMMARY_KEY, summary);
  return summary;
}