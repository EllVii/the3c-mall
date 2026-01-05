// src/pages/GroceryLabPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/GroceryLabPage.css";
import { readJSON, writeJSON, nowISO, safeId } from "../utils/Storage";

/**
 * Goals for this page:
 * - 5-panel wizard: Lane → Stores → Fulfillment → Grocery Shopping → Final Review
 * - Cart split: protected Meal items + editable Extra items
 * - Static/demo pricing (no utils dependency that can break imports)
 * - If cart is empty, never start at Final Review; force Step 1
 * - If cart becomes empty, clear pricing summary so "winner" doesn't linger
 */

const STRATEGY_KEY = "grocery.strategy.v1";
const STORE_USAGE_KEY = "grocery.storeUsage.v1";
const HANDOFF_KEY = "handoff.mealToGrocery.v1";

// Protected items coming from meal/recipes
const MEAL_ITEMS_KEY = "cart.mealItems.v1";

// Editable grocery cart items (extras)
const GROCERY_KEY = "grocery.items.v1";

// Pricing summary persisted
const PRICING_SUMMARY_KEY = "grocery.pricingSummary.v1";

const STORES = [
  { id: "costco", name: "Costco" },
  { id: "walmart", name: "Walmart" },
  { id: "aldi", name: "ALDI" },
  { id: "target", name: "Target" },
  {
    id: "kroger",
    name: "Kroger",
    brands: "Fry’s • Ralphs • Smith’s • King Soopers • Harris Teeter • Fred Meyer",
  },
  {
    id: "safeway_albertsons",
    name: "Safeway / Albertsons",
    brands: "Safeway • Albertsons • Vons • Pavilions • Tom Thumb • Randall’s • Carrs",
  },
];

const CATALOG = [
  {
    id: "dairy",
    title: "Dairy",
    items: ["Milk", "Eggs", "Butter", "Yogurt", "Sour cream", "Cottage cheese", "Cheddar cheese", "Mozzarella"],
  },
  {
    id: "produce",
    title: "Produce",
    items: ["Bananas", "Apples", "Oranges", "Spinach", "Romaine", "Avocado", "Tomatoes", "Onions"],
  },
  {
    id: "beverages",
    title: "Beverages",
    items: ["Orange juice", "Coffee", "Tea", "Sparkling water", "Soda", "Protein shake"],
  },
  {
    id: "meat",
    title: "Meat / Protein",
    items: ["Ground beef", "Chicken breast", "Salmon", "Turkey", "Bacon", "Egg whites", "Steak"],
  },
  {
    id: "pantry",
    title: "Pantry",
    items: ["Rice", "Pasta", "Olive oil", "Salt", "Pepper", "Hot sauce", "Cereal", "Bread"],
  },
  {
    id: "frozen",
    title: "Frozen",
    items: ["Frozen vegetables", "Ice cream", "Frozen fruit", "Pizza", "Chicken nuggets"],
  },
];

function money(n) {
  const v = Number(n || 0);
  return v.toLocaleString(undefined, { style: "currency", currency: "USD" });
}

function normalizeCartItem(raw) {
  return {
    id: raw?.id || safeId("itm"),
    name: String(raw?.name || raw?.canonicalName || "").trim(),
    qty: Number(raw?.qty ?? raw?.quantity ?? 1),
    unit: raw?.unit || "each",
    substitute: raw?.substitute || "",
    substituteReason: raw?.substituteReason || "",
    // optional if you later store per-store prices on the item itself
    pricesByStore: raw?.pricesByStore || raw?.prices || {},
  };
}

function toItemFromName(name) {
  return {
    id: safeId("itm"),
    name: String(name || "").trim(),
    qty: 1,
    unit: "each",
    substitute: "",
    substituteReason: "",
    pricesByStore: {},
  };
}

/**
 * Static demo pricing table (for Alpha/Beta UX).
 * This is intentionally simple and resilient.
 * Any item not found returns null price => shows the "testing mode" notice.
 */
const STATIC_PRICE_TABLE = {
  // Dairy
  milk: { walmart: 3.48, costco: 3.2, aldi: 3.19, target: 3.69, kroger: 3.79, safeway_albertsons: 3.99 },
  eggs: { walmart: 3.12, costco: 3.0, aldi: 2.98, target: 3.39, kroger: 3.49, safeway_albertsons: 3.79 },
  butter: { walmart: 4.68, costco: 4.4, aldi: 4.25, target: 4.89, kroger: 4.99, safeway_albertsons: 5.29 },
  yogurt: { walmart: 1.08, costco: 1.0, aldi: 0.98, target: 1.19, kroger: 1.15, safeway_albertsons: 1.29 },

  // Produce
  bananas: { walmart: 0.62, costco: 0.59, aldi: 0.55, target: 0.69, kroger: 0.65, safeway_albertsons: 0.75 },
  apples: { walmart: 1.48, costco: 1.35, aldi: 1.29, target: 1.65, kroger: 1.59, safeway_albertsons: 1.79 },
  avocado: { walmart: 0.98, costco: 0.89, aldi: 0.85, target: 1.09, kroger: 1.05, safeway_albertsons: 1.25 },

  // Meat
  "ground beef": { walmart: 4.98, costco: 4.65, aldi: 4.75, target: 5.19, kroger: 5.29, safeway_albertsons: 5.49 },
  "chicken breast": { walmart: 3.28, costco: 3.05, aldi: 3.19, target: 3.49, kroger: 3.59, safeway_albertsons: 3.79 },
  steak: { walmart: 9.98, costco: 9.25, aldi: 9.75, target: 10.49, kroger: 10.29, safeway_albertsons: 10.99 },
  salmon: { walmart: 9.48, costco: 8.95, aldi: 9.25, target: 9.99, kroger: 10.49, safeway_albertsons: 10.99 },

  // Pantry
  rice: { walmart: 2.98, costco: 2.75, aldi: 2.69, target: 3.19, kroger: 3.09, safeway_albertsons: 3.39 },
  pasta: { walmart: 1.28, costco: 1.15, aldi: 1.09, target: 1.39, kroger: 1.49, safeway_albertsons: 1.59 },
  "olive oil": { walmart: 8.98, costco: 8.25, aldi: 7.99, target: 9.49, kroger: 9.29, safeway_albertsons: 9.99 },
  cereal: { walmart: 3.98, costco: 3.75, aldi: 3.59, target: 4.29, kroger: 4.49, safeway_albertsons: 4.79 },
};

function keyifyItemName(name) {
  return String(name || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function getStaticUnitPrice(itemName, storeId) {
  const key = keyifyItemName(itemName);
  const row = STATIC_PRICE_TABLE[key];
  if (!row) return null;
  const p = row[storeId];
  return typeof p === "number" ? p : null;
}

function computePricingSummary({ items, lane, includedStoreIds, stores }) {
  const safeItems = (Array.isArray(items) ? items : [])
    .map(normalizeCartItem)
    .filter((x) => x.name);

  const included = (Array.isArray(includedStoreIds) && includedStoreIds.length
    ? includedStoreIds
    : stores.map((s) => s.id)
  ).filter(Boolean);

  // build per-item price list
  const perItem = safeItems.map((it) => {
    const storePrices = {};
    for (const sid of included) {
      const unit = getStaticUnitPrice(it.name, sid);
      storePrices[sid] = unit; // can be null
    }
    return { ...it, storePrices };
  });

  // helper: ext for item at store (or null)
  const extAt = (it, sid) => {
    const unit = it.storePrices?.[sid];
    if (typeof unit !== "number") return null;
    const qty = Number(it.qty || 0);
    return qty > 0 ? unit * qty : 0;
  };

  // SINGLE STORE: pick store with lowest total (ignoring null items => penalize)
  if (lane === "single-store") {
    const storeTotals = {};
    for (const sid of included) {
      let total = 0;
      let missing = 0;
      for (const it of perItem) {
        const ext = extAt(it, sid);
        if (ext == null) {
          missing += 1;
          continue;
        }
        total += ext;
      }
      // penalty for missing to avoid "winner" being a store with no prices
      if (missing > 0) total += missing * 9999;
      storeTotals[sid] = total;
    }

    let chosenStoreId = included[0] || null;
    for (const sid of included) {
      if (storeTotals[sid] < storeTotals[chosenStoreId]) chosenStoreId = sid;
    }

    const perItemAllocations = perItem.map((it) => {
      const unit = it.storePrices?.[chosenStoreId];
      const ext = extAt(it, chosenStoreId);
      return {
        itemId: it.id,
        name: it.name,
        qty: it.qty,
        unit: it.unit,
        chosenStoreId,
        unitPrice: typeof unit === "number" ? unit : null,
        ext: typeof ext === "number" ? ext : null,
        hasPrice: typeof unit === "number",
      };
    });

    // compute grand total WITHOUT penalties
    const cleanGrand = perItemAllocations.reduce((sum, x) => sum + (typeof x.ext === "number" ? x.ext : 0), 0);

    return {
      mode: "single-store",
      chosenStoreId,
      storeTotals: Object.fromEntries(
        included.map((sid) => [
          sid,
          perItem.reduce((sum, it) => sum + (extAt(it, sid) ?? 0), 0),
        ])
      ),
      perItemAllocations,
      grandTotal: cleanGrand,
      missingCount: perItemAllocations.filter((x) => !x.hasPrice).length,
      updatedAt: nowISO(),
    };
  }

  // MULTI STORE: choose cheapest available per item among included stores
  const perItemAllocations = perItem.map((it) => {
    let bestSid = null;
    let bestExt = null;
    let bestUnit = null;

    for (const sid of included) {
      const unit = it.storePrices?.[sid];
      const ext = extAt(it, sid);
      if (typeof unit !== "number" || typeof ext !== "number") continue;

      if (bestExt == null || ext < bestExt) {
        bestExt = ext;
        bestSid = sid;
        bestUnit = unit;
      }
    }

    return {
      itemId: it.id,
      name: it.name,
      qty: it.qty,
      unit: it.unit,
      chosenStoreId: bestSid,
      unitPrice: bestUnit,
      ext: bestExt,
      hasPrice: typeof bestUnit === "number",
    };
  });

  const storeTotals = {};
  for (const sid of included) storeTotals[sid] = 0;

  for (const x of perItemAllocations) {
    if (!x.chosenStoreId || typeof x.ext !== "number") continue;
    storeTotals[x.chosenStoreId] += x.ext;
  }

  const grandTotal = Object.values(storeTotals).reduce((a, b) => a + (Number(b) || 0), 0);

  return {
    mode: "multi-store",
    chosenStoreId: null,
    storeTotals,
    perItemAllocations,
    grandTotal,
    missingCount: perItemAllocations.filter((x) => !x.hasPrice).length,
    updatedAt: nowISO(),
  };
}

// Small demo cart loader (no external utils)
function demoCartItems() {
  const names = ["Milk", "Eggs", "Ground beef", "Bananas", "Olive oil", "Pasta", "Orange juice"];
  return names.map((n) => ({
    id: safeId("itm"),
    name: n,
    qty: n.toLowerCase() === "eggs" ? 2 : 1,
    unit: "each",
    substitute: "",
    substituteReason: "",
    pricesByStore: {},
  }));
}

export default function GroceryLabPage() {
  const nav = useNavigate();
  const location = useLocation();

  const cameFromMeal = location.state?.from === "meal";
  const quickReview = location.state?.quickReview === true;

  const savedStrategy = useMemo(() => readJSON(STRATEGY_KEY, null), []);
  const savedUsage = useMemo(() => readJSON(STORE_USAGE_KEY, null), []);

  const [appMsg, setAppMsg] = useState("");
  const [stepIndex, setStepIndex] = useState(0);

  const [lane, setLane] = useState(savedStrategy?.lane || "auto-multi"); // auto-multi | single-store
  const [includedStoreIds, setIncludedStoreIds] = useState(() => {
    const arr = savedStrategy?.includedStoreIds;
    return Array.isArray(arr) && arr.length ? arr : STORES.map((s) => s.id);
  });
  const [fulfillment, setFulfillment] = useState(savedStrategy?.fulfillment || "pickup"); // in-store | pickup | delivery

  const [mealItems, setMealItems] = useState(() => {
    const raw = readJSON(MEAL_ITEMS_KEY, []);
    return Array.isArray(raw) ? raw.map(normalizeCartItem) : [];
  });

  const [extraItems, setExtraItems] = useState(() => {
    const raw = readJSON(GROCERY_KEY, []);
    return Array.isArray(raw) ? raw.map(normalizeCartItem) : [];
  });

  const allItems = useMemo(() => [...mealItems, ...extraItems], [mealItems, extraItems]);
  const hasItems = allItems.some((x) => String(x?.name || "").trim().length);

  const [pricingSummary, setPricingSummary] = useState(() => readJSON(PRICING_SUMMARY_KEY, null));

  // Panel 4
  const [shopQuery, setShopQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("dairy");

  const steps = useMemo(
    () => [
      { id: "lane", title: "Strategy Type" },
      { id: "stores", title: "Select Stores" },
      { id: "fulfillment", title: "Fulfillment Mode" },
      { id: "shop", title: "Grocery Shopping" },
      { id: "review", title: "Final Review" },
    ],
    []
  );

  const stepCount = steps.length;
  const goNext = () => setStepIndex((p) => Math.min(p + 1, stepCount - 1));
  const goPrev = () => setStepIndex((p) => Math.max(p - 1, 0));

  function pickAndAdvance(setter, value) {
    setter(value);
    window.setTimeout(() => setStepIndex((p) => Math.min(p + 1, stepCount - 1)), 140);
  }

  const shopIdx = useMemo(() => steps.findIndex((s) => s.id === "shop"), [steps]);
  const reviewIdx = useMemo(() => steps.findIndex((s) => s.id === "review"), [steps]);

  // One-time handoff message
  useEffect(() => {
    const handoff = readJSON(HANDOFF_KEY, null);
    if (handoff?.message || handoff?.at) {
      setAppMsg(handoff?.message || "Loaded from Meal Plan ✅");
      writeJSON(HANDOFF_KEY, null);
      window.setTimeout(() => setAppMsg(""), 2200);
    }
  }, []);

  // Start logic:
  // - if no items: force step 0
  // - if items + quickReview: jump to review
  useEffect(() => {
    if (!hasItems) {
      if (stepIndex !== 0) setStepIndex(0);
      return;
    }
    if (cameFromMeal && quickReview && reviewIdx >= 0) {
      setStepIndex(reviewIdx);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasItems, cameFromMeal, quickReview, reviewIdx]);

  // Never allow 0 stores
  useEffect(() => {
    if (!includedStoreIds.length) setIncludedStoreIds(STORES.map((s) => s.id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [includedStoreIds.length]);

  // Persist strategy
  useEffect(() => {
    writeJSON(STRATEGY_KEY, { lane, includedStoreIds, fulfillment, updatedAt: nowISO() });
  }, [lane, includedStoreIds, fulfillment]);

  // Persist carts
  useEffect(() => writeJSON(MEAL_ITEMS_KEY, mealItems), [mealItems]);
  useEffect(() => writeJSON(GROCERY_KEY, extraItems), [extraItems]);

  // Clear pricing if cart empties (fix lingering "winner")
  useEffect(() => {
    if (!hasItems && pricingSummary) {
      setPricingSummary(null);
      writeJSON(PRICING_SUMMARY_KEY, null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasItems]);

  // Store ordering logic
  const usageTotals =
    savedUsage?.total && typeof savedUsage.total === "object" ? savedUsage.total : {};

  const mostUsedStoreId = useMemo(() => {
    const entries = Object.entries(usageTotals);
    if (!entries.length) return null;
    entries.sort((a, b) => (b[1] || 0) - (a[1] || 0));
    return entries[0]?.[0] || null;
  }, [usageTotals]);

  const recommendedStoreId = useMemo(() => {
    if (lane === "single-store") return mostUsedStoreId || "walmart";
    return mostUsedStoreId || "costco";
  }, [lane, mostUsedStoreId]);

  const orderedStores = useMemo(() => {
    const rec = STORES.some((s) => s.id === recommendedStoreId) ? recommendedStoreId : null;
    const score = (id) => {
      const isRec = rec && id === rec ? 100000 : 0;
      const isIncluded = includedStoreIds.includes(id) ? 10000 : 0;
      const use = Number(usageTotals?.[id] || 0);
      return isRec + isIncluded + use;
    };
    return [...STORES].sort((a, b) => score(b.id) - score(a.id));
  }, [includedStoreIds, usageTotals, recommendedStoreId]);

  const statusLabel = `${lane === "auto-multi" ? "Multi-Store" : "Single Store"} · ${fulfillment}`;

  function toggleStore(id) {
    setIncludedStoreIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  // Cart editing
  function addExtraItem(name = "") {
    const n = String(name || "").trim();
    setExtraItems((prev) => [...prev, toItemFromName(n)]);
    if (n) setShopQuery("");
  }

  function updateExtraItem(id, patch) {
    setExtraItems((prev) => prev.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  }

  function removeExtraItem(id) {
    setExtraItems((prev) => prev.filter((x) => x.id !== id));
  }

  function removeMealItemSafe(id) {
    const ok = window.confirm("Remove this Meal Plan item from the protected list?");
    if (!ok) return;
    setMealItems((prev) => prev.filter((x) => x.id !== id));
  }

  function loadDemoCart() {
    setExtraItems(demoCartItems().map(normalizeCartItem));
    setAppMsg("Demo groceries loaded into your cart ✅");
    window.setTimeout(() => setAppMsg(""), 1700);
    if (shopIdx >= 0) setStepIndex(shopIdx); // put them in the shopping experience
  }

  function calculatePricing() {
    if (!hasItems) {
      setPricingSummary(null);
      writeJSON(PRICING_SUMMARY_KEY, null);
      setAppMsg("Cart is empty — add items before pricing.");
      window.setTimeout(() => setAppMsg(""), 1900);
      return;
    }

    const summary = computePricingSummary({
      items: allItems,
      lane: lane === "single-store" ? "single-store" : "multi-store",
      includedStoreIds,
      stores: STORES,
    });

    setPricingSummary(summary);
    writeJSON(PRICING_SUMMARY_KEY, summary);

    setAppMsg("Cart pricing calculated ✅");
    window.setTimeout(() => setAppMsg(""), 1900);
  }

  function clearCartAll() {
    setMealItems([]);
    setExtraItems([]);
    setPricingSummary(null);
    writeJSON(PRICING_SUMMARY_KEY, null);

    setAppMsg("Cart cleared ✅");
    window.setTimeout(() => setAppMsg(""), 1600);

    setStepIndex(0);
  }

  const conciergeText = useMemo(() => {
    if (mealItems.filter((x) => x.name).length > 0) {
      return "I already pulled items from your Meal Plan. Want to add anything else before we route prices?";
    }
    return "Let’s build your cart. Type what you need or use categories to add basics fast.";
  }, [mealItems]);

  const activeCat = useMemo(
    () => CATALOG.find((c) => c.id === activeCategory) || CATALOG[0],
    [activeCategory]
  );

  const searchMatches = useMemo(() => {
    const q = shopQuery.trim().toLowerCase();
    if (!q) return [];
    const flat = CATALOG.flatMap((c) => c.items.map((name) => ({ category: c.id, name })));
    return flat.filter((x) => x.name.toLowerCase().includes(q)).slice(0, 12);
  }, [shopQuery]);

  // “missing price” notice requirement
  const missingPriceNotice =
    pricingSummary && hasItems && Number(pricingSummary.missingCount || 0) > 0;

  return (
    <div className="gl-shell page gl-page">
      <section className="gl-top">
        <div>
          <p className="kicker">Lab · Grocery Routing</p>
          <h1 className="h1">Grocery Lab</h1>
          <p className="sub">Set how you shop, build your cart, then let 3C route pricing.</p>
        </div>

        <div className="gl-pill glass" aria-label="grocery lab status">
          <span className="gl-tag">Status</span>
          <div className="gl-pill-text">{statusLabel}</div>
        </div>
      </section>

      <div className="gl-wizard glass">
        <header className="gl-wiz-head">
          <div className="gl-dots" aria-label="wizard progress">
            {steps.map((_, i) => (
              <span
                key={i}
                className={`gl-dot ${i === stepIndex ? "on" : ""}`}
                role="button"
                tabIndex={0}
                onClick={() => setStepIndex(i)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") setStepIndex(i);
                }}
                aria-label={`Go to step ${i + 1}`}
              />
            ))}
          </div>
          <span className="gl-tag">{steps[stepIndex]?.title}</span>
        </header>

        {appMsg && (
          <div className="gl-appmsg glass-inner" role="status" aria-live="polite">
            {appMsg}
          </div>
        )}

        <div className="gl-stage">
          <div
            className="gl-track"
            style={{
              width: `${stepCount * 100}%`,
              transform: `translateX(-${stepIndex * 100}%)`,
            }}
          >
            {/* PANEL 1: Lane */}
            <div className="gl-panel">
              <h2 className="gl-h2">Choose your lane</h2>
              <p className="small">Multi-store routes items; single-store picks one winner total.</p>

              <div className="gl-choice-grid">
                <button
                  type="button"
                  className={`gl-choice glass-inner ${lane === "auto-multi" ? "on" : ""}`}
                  onClick={() => pickAndAdvance(setLane, "auto-multi")}
                >
                  <div className="gl-choice-title">Multiple Stores</div>
                  <div className="gl-choice-desc">Best overall value. Routes each item to the best store.</div>
                </button>

                <button
                  type="button"
                  className={`gl-choice glass-inner ${lane === "single-store" ? "on" : ""}`}
                  onClick={() => pickAndAdvance(setLane, "single-store")}
                >
                  <div className="gl-choice-title">Single Store</div>
                  <div className="gl-choice-desc">Simplest trip. Picks the best one-store total.</div>
                </button>
              </div>

              <div className="gl-nav">
                <button className="btn btn-ghost" type="button" disabled>
                  Back
                </button>
                <button className="btn btn-secondary" type="button" onClick={goNext}>
                  Next
                </button>
              </div>
            </div>

            {/* PANEL 2: Stores */}
            <div className="gl-panel">
              <h2 className="gl-h2">Which stores are in play?</h2>
              <p className="small">Tap to include/exclude. Recommended is highlighted.</p>

              <div className="gl-store-row">
                {orderedStores.map((s) => {
                  const on = includedStoreIds.includes(s.id);
                  const isRec = s.id === recommendedStoreId;

                  return (
                    <button
                      key={s.id}
                      type="button"
                      className={["gl-store-btn", "glass-inner", on ? "is-on" : "", isRec ? "is-rec" : ""].join(" ")}
                      onClick={() => toggleStore(s.id)}
                    >
                      <span className="gl-store-mark" aria-hidden="true">
                        {s.name.slice(0, 1).toUpperCase()}
                      </span>

                      <span className="gl-store-meta">
                        <span className="gl-store-name">{s.name}</span>

                        {s.brands ? (
                          <span className="gl-store-badge ghost">{s.brands}</span>
                        ) : isRec ? (
                          <span className="gl-store-badge">Recommended</span>
                        ) : (
                          <span className="gl-store-badge ghost">{on ? "Included" : "Tap to include"}</span>
                        )}
                      </span>

                      <span className={"gl-store-check " + (on ? "on" : "")} aria-hidden="true">
                        ✓
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="gl-nav">
                <button className="btn btn-ghost" type="button" onClick={goPrev}>
                  Back
                </button>
                <button className="btn btn-secondary gl-wide" type="button" onClick={goNext}>
                  Confirm Stores →
                </button>
              </div>
            </div>

            {/* PANEL 3: Fulfillment */}
            <div className="gl-panel">
              <h2 className="gl-h2">How do you want to get groceries?</h2>
              <p className="small">Delivery is optional — you’re never forced into it.</p>

              <div className="gl-choice-grid">
                {[
                  { id: "in-store", title: "In-Store", desc: "You shop. 3C does the math." },
                  { id: "pickup", title: "Pickup", desc: "Fast and controlled." },
                  { id: "delivery", title: "Delivery", desc: "Convenience day." },
                ].map((x) => (
                  <button
                    key={x.id}
                    type="button"
                    className={`gl-choice glass-inner ${fulfillment === x.id ? "on" : ""}`}
                    onClick={() => pickAndAdvance(setFulfillment, x.id)}
                  >
                    <div className="gl-choice-title">{x.title}</div>
                    <div className="gl-choice-desc">{x.desc}</div>
                  </button>
                ))}
              </div>

              <div className="gl-nav">
                <button className="btn btn-ghost" type="button" onClick={goPrev}>
                  Back
                </button>
                <button className="btn btn-secondary" type="button" onClick={goNext}>
                  Next
                </button>
              </div>
            </div>

            {/* PANEL 4: Grocery Shopping */}
            <div className="gl-panel">
              <h2 className="gl-h2">Grocery Shopping</h2>

              <div className="glass-inner" style={{ marginTop: ".75rem" }}>
                <div style={{ fontWeight: 900, color: "var(--gold)" }}>Concierge</div>
                <p className="small" style={{ marginTop: ".35rem" }}>
                  {conciergeText}
                </p>

                <div className="nav-row" style={{ marginTop: ".75rem" }}>
                  <input
                    className="input"
                    value={shopQuery}
                    onChange={(e) => setShopQuery(e.target.value)}
                    placeholder='Type what you want (ex: "milk", "eggs", "orange juice")'
                  />
                  <button
                    className="btn btn-secondary"
                    type="button"
                    onClick={() => addExtraItem(shopQuery)}
                    disabled={!shopQuery.trim()}
                  >
                    Add typed item
                  </button>
                </div>

                {shopQuery.trim() && searchMatches.length > 0 && (
                  <div style={{ marginTop: ".75rem" }}>
                    <div className="small" style={{ opacity: 0.9 }}>
                      Suggestions
                    </div>
                    <div className="nav-row" style={{ flexWrap: "wrap", marginTop: ".45rem" }}>
                      {searchMatches.map((x) => (
                        <button
                          key={`${x.category}:${x.name}`}
                          className="btn btn-ghost"
                          type="button"
                          onClick={() => addExtraItem(x.name)}
                        >
                          + {x.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="glass-inner" style={{ marginTop: ".9rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: ".75rem", alignItems: "center" }}>
                  <div style={{ fontWeight: 900, color: "var(--gold)" }}>Categories</div>
                  <button className="btn btn-ghost" type="button" onClick={loadDemoCart}>
                    Load Demo Groceries
                  </button>
                </div>

                <div className="nav-row" style={{ flexWrap: "wrap", marginTop: ".75rem" }}>
                  {CATALOG.map((c) => (
                    <button
                      key={c.id}
                      className={"btn " + (activeCategory === c.id ? "btn-primary" : "btn-secondary")}
                      type="button"
                      onClick={() => setActiveCategory(c.id)}
                    >
                      {c.title}
                    </button>
                  ))}
                </div>

                <div style={{ marginTop: ".9rem" }}>
                  <div className="small" style={{ opacity: 0.9 }}>
                    {activeCat.title}
                  </div>
                  <div className="nav-row" style={{ flexWrap: "wrap", marginTop: ".45rem" }}>
                    {activeCat.items.map((name) => (
                      <button key={name} className="btn btn-ghost" type="button" onClick={() => addExtraItem(name)}>
                        + {name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="gl-nav">
                <button className="btn btn-ghost" type="button" onClick={goPrev}>
                  Back
                </button>
                <button className="btn btn-secondary" type="button" onClick={goNext}>
                  Next
                </button>
              </div>
            </div>

            {/* PANEL 5: Final Review */}
            <div className="gl-panel">
              <h2 className="gl-h2">Final Review</h2>

              <div className="glass-inner gl-review">
                <div className="gl-summary-line">
                  <span>Lane</span>
                  <strong>{lane === "auto-multi" ? "Multi-store optimized" : "Single-store total"}</strong>
                </div>
                <div className="gl-summary-line">
                  <span>Fulfillment</span>
                  <strong style={{ textTransform: "capitalize" }}>{fulfillment}</strong>
                </div>
                <div className="gl-summary-line">
                  <span>Stores included</span>
                  <strong>{includedStoreIds.length}</strong>
                </div>
              </div>

              {/* Start guard */}
              {!hasItems && (
                <div className="glass-inner" style={{ marginTop: "1rem" }}>
                  <div className="small">
                    Your cart is empty. Start from the beginning or add items in Grocery Shopping.
                  </div>
                  <div className="nav-row" style={{ marginTop: ".75rem" }}>
                    <button className="btn btn-primary" type="button" onClick={() => setStepIndex(0)}>
                      Start at Step 1 →
                    </button>
                    <button
                      className="btn btn-secondary"
                      type="button"
                      onClick={() => setStepIndex(shopIdx >= 0 ? shopIdx : 0)}
                    >
                      Go to Grocery Shopping →
                    </button>
                  </div>
                </div>
              )}

              {/* Meal Plan Items (Protected) */}
              <div className="glass-inner" style={{ marginTop: "1rem" }}>
                <div style={{ fontWeight: 900, color: "var(--gold)" }}>Meal Plan Items (Protected)</div>
                <p className="small" style={{ marginTop: ".35rem" }}>
                  These are tied to your meal/recipes so you don’t delete them by accident.
                </p>

                {mealItems.filter((x) => x.name).length === 0 ? (
                  <div className="small" style={{ opacity: 0.85, marginTop: ".6rem" }}>
                    None loaded from Meal Plan yet.
                  </div>
                ) : (
                  mealItems
                    .filter((x) => x.name)
                    .map((it) => (
                      <div
                        key={it.id}
                        style={{
                          borderTop: "1px solid rgba(126,224,255,.12)",
                          paddingTop: ".75rem",
                          marginTop: ".75rem",
                        }}
                      >
                        <div className="small" style={{ fontWeight: 800 }}>
                          {it.name}
                        </div>
                        <div className="small" style={{ opacity: 0.9, marginTop: ".25rem" }}>
                          Qty: <strong>{it.qty}</strong> · Unit: <strong>{it.unit}</strong>
                        </div>
                        <div className="nav-row" style={{ marginTop: ".5rem" }}>
                          <button className="btn btn-ghost" type="button" onClick={() => removeMealItemSafe(it.id)}>
                            Remove
                          </button>
                        </div>
                      </div>
                    ))
                )}
              </div>

              {/* Extra Groceries (Editable) */}
              <div className="glass-inner" style={{ marginTop: "1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: ".75rem", alignItems: "center" }}>
                  <div style={{ fontWeight: 900, color: "var(--gold)" }}>Extra Groceries (Editable)</div>
                  <button className="btn btn-primary" type="button" onClick={() => addExtraItem("")}>
                    + Add Item
                  </button>
                </div>

                {extraItems.filter((x) => x.name).length === 0 ? (
                  <div className="small" style={{ opacity: 0.85, marginTop: ".6rem" }}>
                    No extra items yet. Add some in Grocery Shopping.
                  </div>
                ) : (
                  extraItems.map((it) => (
                    <div
                      key={it.id}
                      style={{
                        borderTop: "1px solid rgba(126,224,255,.12)",
                        paddingTop: ".75rem",
                        marginTop: ".75rem",
                      }}
                    >
                      <div className="grid" style={{ gridTemplateColumns: "1fr", gap: ".6rem" }}>
                        <div>
                          <label className="label">Item</label>
                          <input
                            className="input"
                            value={it.name}
                            onChange={(e) => updateExtraItem(it.id, { name: e.target.value })}
                          />
                        </div>

                        <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: ".6rem" }}>
                          <div>
                            <label className="label">Qty</label>
                            <input
                              className="input"
                              type="number"
                              value={it.qty}
                              onChange={(e) => updateExtraItem(it.id, { qty: Number(e.target.value || 0) })}
                            />
                          </div>
                          <div>
                            <label className="label">Unit</label>
                            <input
                              className="input"
                              value={it.unit}
                              onChange={(e) => updateExtraItem(it.id, { unit: e.target.value })}
                            />
                          </div>
                        </div>

                        <div className="grid" style={{ gridTemplateColumns: "1fr", gap: ".6rem" }}>
                          <div>
                            <label className="label">Substitute (optional)</label>
                            <input
                              className="input"
                              value={it.substitute}
                              onChange={(e) => updateExtraItem(it.id, { substitute: e.target.value })}
                              placeholder="e.g., lactose-free milk"
                            />
                          </div>
                          <div>
                            <label className="label">Reason (optional)</label>
                            <input
                              className="input"
                              value={it.substituteReason}
                              onChange={(e) => updateExtraItem(it.id, { substituteReason: e.target.value })}
                              placeholder="allergy / brand dislike / diet"
                            />
                          </div>
                        </div>

                        <div className="nav-row" style={{ justifyContent: "flex-end" }}>
                          <button className="btn btn-ghost" type="button" onClick={() => removeExtraItem(it.id)}>
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Pricing */}
              <div className="glass-inner" style={{ marginTop: "1rem" }}>
                <div style={{ fontWeight: 900, color: "var(--gold)" }}>Cart Pricing (Static / Demo)</div>
                <p className="small" style={{ marginTop: ".35rem" }}>
                  Alpha-safe pricing engine. Live prices later via approved APIs + backend.
                </p>

                <div className="nav-row" style={{ marginTop: ".75rem" }}>
                  <button className="btn btn-primary" type="button" onClick={calculatePricing} disabled={!hasItems}>
                    Calculate Pricing
                  </button>
                  <button className="btn btn-ghost" type="button" onClick={clearCartAll}>
                    Clear Cart
                  </button>
                </div>

                <div style={{ marginTop: ".9rem" }}>
                  <div className="small">
                    Total items in cart: <strong>{allItems.filter((x) => x.name).length}</strong>
                  </div>

                  {pricingSummary && hasItems && (
                    <div style={{ marginTop: ".75rem" }}>
                      {missingPriceNotice && (
                        <div className="glass-inner" style={{ marginBottom: ".8rem" }}>
                          <div className="small" style={{ fontWeight: 900 }}>
                            Pricing Notice
                          </div>
                          <div className="small" style={{ marginTop: ".35rem", opacity: 0.9 }}>
                            We are sorry — one or more of your items do not have a price loaded in our system.
                            We are in testing mode. Once we are live, pricing should be available.
                            Sorry for the inconvenience.
                          </div>
                        </div>
                      )}

                      <div className="small">
                        Mode:{" "}
                        <strong>{pricingSummary.mode === "single-store" ? "Single-store" : "Multi-store"}</strong>
                        {pricingSummary.chosenStoreId ? (
                          <>
                            {" "}
                            · Winner:{" "}
                            <strong>
                              {STORES.find((s) => s.id === pricingSummary.chosenStoreId)?.name ||
                                pricingSummary.chosenStoreId}
                            </strong>
                          </>
                        ) : null}
                      </div>

                      <div className="small" style={{ marginTop: ".5rem" }}>
                        Grand total:{" "}
                        <strong style={{ color: "var(--gold)" }}>{money(pricingSummary.grandTotal)}</strong>
                      </div>

                      <div style={{ marginTop: ".75rem" }}>
                        {Object.entries(pricingSummary.storeTotals || {}).map(([sid, total]) => (
                          <div key={sid} className="gl-summary-line">
                            <span>{STORES.find((s) => s.id === sid)?.name || sid}</span>
                            <strong>{money(total)}</strong>
                          </div>
                        ))}
                      </div>

                      <details style={{ marginTop: ".9rem" }}>
                        <summary className="small" style={{ cursor: "pointer" }}>
                          View item-by-item routing
                        </summary>

                        <div style={{ marginTop: ".6rem" }}>
                          {(pricingSummary.perItemAllocations || []).map((x) => (
                            <div
                              key={x.itemId}
                              style={{
                                borderTop: "1px solid rgba(126,224,255,.12)",
                                paddingTop: ".6rem",
                                marginTop: ".6rem",
                              }}
                            >
                              <div className="small" style={{ fontWeight: 800 }}>
                                {x.name}
                              </div>
                              <div className="small" style={{ opacity: 0.9, marginTop: ".2rem" }}>
                                Qty: <strong>{x.qty}</strong> · Unit: <strong>{x.unit}</strong>
                              </div>
                              <div className="small" style={{ opacity: 0.85, marginTop: ".2rem" }}>
                                Store:{" "}
                                <strong>
                                  {x.chosenStoreId
                                    ? STORES.find((s) => s.id === x.chosenStoreId)?.name || x.chosenStoreId
                                    : "—"}
                                </strong>{" "}
                                · Unit:{" "}
                                <strong>{typeof x.unitPrice === "number" ? money(x.unitPrice) : "—"}</strong>{" "}
                                · Ext: <strong>{typeof x.ext === "number" ? money(x.ext) : "—"}</strong>
                              </div>
                            </div>
                          ))}
                        </div>
                      </details>
                    </div>
                  )}
                </div>
              </div>

              <div className="gl-nav" style={{ marginTop: "1rem" }}>
                <button className="btn btn-ghost" type="button" onClick={goPrev}>
                  Back
                </button>
                <button className="btn btn-primary" type="button" onClick={() => nav("/app")}>
                  Save & Return to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
        {/* end wizard */}
      </div>
    </div>
  );
}
