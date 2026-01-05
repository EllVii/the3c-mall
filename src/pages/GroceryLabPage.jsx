// src/pages/GroceryLabPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/GroceryLabPage.css";
import { readJSON, writeJSON, nowISO, safeId } from "../utils/Storage";

import {
  seedTestGroceries,
  calcPricingSummary,
  savePricingSummary,
  GROCERY_KEY,
  PRICING_SUMMARY_KEY,
} from "../utils/groceryPricingTest";

const STRATEGY_KEY = "grocery.strategy.v1";
const STORE_USAGE_KEY = "grocery.storeUsage.v1";
const HANDOFF_KEY = "handoff.mealToGrocery.v1";

// Locked items coming from meal/recipes (protected)
const MEAL_ITEMS_KEY = "cart.mealItems.v1";

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
    name: raw?.name || raw?.canonicalName || "",
    qty: Number(raw?.qty ?? raw?.quantity ?? 1),
    unit: raw?.unit || "each",
    substitute: raw?.substitute || "",
    substituteReason: raw?.substituteReason || "",
    pricesByStore: raw?.pricesByStore || raw?.prices || {},
  };
}

function toItemFromName(name) {
  return {
    id: safeId("itm"),
    name,
    qty: 1,
    unit: "each",
    substitute: "",
    substituteReason: "",
    pricesByStore: {},
  };
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

  const [lane, setLane] = useState(savedStrategy?.lane || "auto-multi");
  const [includedStoreIds, setIncludedStoreIds] = useState(
    Array.isArray(savedStrategy?.includedStoreIds) && savedStrategy.includedStoreIds.length
      ? savedStrategy.includedStoreIds
      : STORES.map((s) => s.id)
  );
  const [fulfillment, setFulfillment] = useState(savedStrategy?.fulfillment || "pickup");

  // Split cart into locked meal items + editable extra groceries
  const [mealItems, setMealItems] = useState(() => {
    const raw = readJSON(MEAL_ITEMS_KEY, []);
    return Array.isArray(raw) ? raw.map(normalizeCartItem) : [];
  });

  const [extraItems, setExtraItems] = useState(() => {
    const raw = readJSON(GROCERY_KEY, []);
    return Array.isArray(raw) ? raw.map(normalizeCartItem) : [];
  });

  const allItems = useMemo(() => [...mealItems, ...extraItems], [mealItems, extraItems]);
  const hasItems = allItems.length > 0;

  const [pricingSummary, setPricingSummary] = useState(() => readJSON(PRICING_SUMMARY_KEY, null));

  // Panel 4 (shopping) state
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
    window.setTimeout(() => setStepIndex((p) => Math.min(p + 1, stepCount - 1)), 160);
  }

  const shopIdx = useMemo(() => steps.findIndex((s) => s.id === "shop"), [steps]);
  const reviewIdx = useMemo(() => steps.findIndex((s) => s.id === "review"), [steps]);

  // show message once if handoff exists
  useEffect(() => {
    const handoff = readJSON(HANDOFF_KEY, null);
    if (handoff?.message || handoff?.at) {
      setAppMsg(handoff?.message || "Loaded from Meal Plan ✅");
      writeJSON(HANDOFF_KEY, null);
      window.setTimeout(() => setAppMsg(""), 2400);
    }
  }, []);

  // Start logic:
  // - if no items: never start at review
  // - if items: allow quickReview to jump to review
  useEffect(() => {
    if (!hasItems) {
      if (stepIndex !== 0) setStepIndex(0);
      return;
    }
    if (cameFromMeal && quickReview && savedStrategy && reviewIdx >= 0) {
      setStepIndex(reviewIdx);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasItems, cameFromMeal, quickReview, reviewIdx]);

  // never allow 0 stores
  useEffect(() => {
    if (!includedStoreIds.length) setIncludedStoreIds(STORES.map((s) => s.id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [includedStoreIds.length]);

  // persist strategy
  useEffect(() => {
    writeJSON(STRATEGY_KEY, { lane, includedStoreIds, fulfillment, updatedAt: nowISO() });
  }, [lane, includedStoreIds, fulfillment]);

  // persist carts
  useEffect(() => writeJSON(MEAL_ITEMS_KEY, mealItems), [mealItems]);
  useEffect(() => writeJSON(GROCERY_KEY, extraItems), [extraItems]);

  // if cart becomes empty, clear pricing (fixes “winner stays” bug)
  useEffect(() => {
    if (!hasItems && pricingSummary) {
      setPricingSummary(null);
      writeJSON(PRICING_SUMMARY_KEY, null);
      savePricingSummary(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasItems]);

  // store ordering logic
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

  // extra items editing
  function addExtraItem(name = "") {
    const n = (name || "").trim();
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

  // demo loading
  function loadDemoCart({ overwrite = false } = {}) {
    const items = seedTestGroceries({ overwrite });
    const normalized = (Array.isArray(items) ? items : []).map(normalizeCartItem);
    setExtraItems(normalized);
    setAppMsg("Demo groceries loaded into your cart ✅");
    window.setTimeout(() => setAppMsg(""), 1800);
  }

  // pricing
  function calculatePricing() {
    if (!hasItems) {
      setPricingSummary(null);
      writeJSON(PRICING_SUMMARY_KEY, null);
      savePricingSummary(null);
      setAppMsg("Cart is empty — add items before pricing.");
      window.setTimeout(() => setAppMsg(""), 2000);
      return;
    }

    const summary = calcPricingSummary({
      items: allItems,
      lane: lane === "single-store" ? "single-store" : "multi-store",
      includedStoreIds,
      stores: STORES,
    });

    savePricingSummary(summary);
    setPricingSummary(summary);

    setAppMsg("Cart pricing calculated ✅");
    window.setTimeout(() => setAppMsg(""), 2000);
  }

  function clearCartAll() {
    setMealItems([]);
    setExtraItems([]);

    setPricingSummary(null);
    writeJSON(PRICING_SUMMARY_KEY, null);
    savePricingSummary(null);

    setAppMsg("Cart cleared ✅");
    window.setTimeout(() => setAppMsg(""), 1600);

    setStepIndex(0);
  }

  const conciergeText = useMemo(() => {
    if (mealItems.length > 0) {
      return "I already pulled items from your Meal Plan. Want to add anything else before we route prices?";
    }
    return "Let’s build your cart. Type what you need or use categories to add the basics fast.";
  }, [mealItems.length]);

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

  // ✅ Missing-price notice (testing mode)
  const hasMissingPrices = useMemo(() => {
    const rows = pricingSummary?.perItemAllocations;
    if (!Array.isArray(rows) || rows.length === 0) return false;

    // consider missing if ext is null/undefined OR unitPrice is null/0 OR ext is 0 while qty>0
    return rows.some((x) => {
      const qty = Number(x?.qty || 0);
      const unitPrice = x?.unitPrice;
      const ext = x?.ext;
      return (
        qty > 0 &&
        (unitPrice == null || Number(unitPrice) === 0 || ext == null)
      );
    });
  }, [pricingSummary]);

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
              <span key={i} className={`gl-dot ${i === stepIndex ? "on" : ""}`} />
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
              transform: `translateX(-${stepIndex * (100 / stepCount)}%)`,
            }}
          >
            {/* PANEL 1 */}
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

            {/* PANEL 2 */}
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

            {/* PANEL 3 */}
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

            {/* PANEL 4 */}
            <div className="gl-panel">
              <h2 className="gl-h2">Grocery Shopping</h2>

              <div className="glass-inner" style={{ marginTop: ".75rem" }}>
                <div style={{ fontWeight: 900, color: "var(--gold)" }}>Concierge</div>
                <p className="small" style={{ marginTop: ".35rem" }}>{conciergeText}</p>

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
                    <div className="small" style={{ opacity: 0.9 }}>Suggestions</div>
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
                  <button className="btn btn-ghost" type="button" onClick={() => loadDemoCart({ overwrite: true })}>
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
                  <div className="small" style={{ opacity: 0.9 }}>{activeCat.title}</div>
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

            {/* PANEL 5 */}
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

              {/* Meal Plan Items */}
              <div className="glass-inner" style={{ marginTop: "1rem" }}>
                <div style={{ fontWeight: 900, color: "var(--gold)" }}>Meal Plan Items (Protected)</div>
                <p className="small" style={{ marginTop: ".35rem" }}>
                  These are tied to your meal/recipes so you don’t delete them by accident.
                </p>

                {mealItems.length === 0 ? (
                  <div className="small" style={{ opacity: 0.85, marginTop: ".6rem" }}>
                    None loaded from Meal Plan yet.
                  </div>
                ) : (
                  mealItems.map((it) => (
                    <div key={it.id} className="gl-summary-line" style={{ marginTop: ".6rem" }}>
                      <span>
                        {it.name} · {it.qty} {it.unit}
                      </span>
                      <button className="btn btn-ghost" type="button" onClick={() => removeMealItemSafe(it.id)}>
                        Remove
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Extra Items (STACKED so it never clips) */}
              <div className="glass-inner" style={{ marginTop: "1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: ".75rem", alignItems: "center" }}>
                  <div style={{ fontWeight: 900, color: "var(--gold)" }}>Extra Groceries (Editable)</div>
                  <button className="btn btn-primary" type="button" onClick={() => addExtraItem("")}>
                    + Add Item
                  </button>
                </div>

                {extraItems.length === 0 ? (
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
                        display: "flex",
                        flexDirection: "column",
                        gap: ".6rem",
                      }}
                    >
                      <div>
                        <label className="label">Item</label>
                        <input
                          className="input"
                          value={it.name}
                          onChange={(e) => updateExtraItem(it.id, { name: e.target.value })}
                        />
                      </div>

                      <div className="nav-row">
                        <div style={{ flex: 1 }}>
                          <label className="label">Qty</label>
                          <input
                            className="input"
                            type="number"
                            value={it.qty}
                            onChange={(e) => updateExtraItem(it.id, { qty: Number(e.target.value || 0) })}
                          />
                        </div>

                        <div style={{ flex: 1 }}>
                          <label className="label">Unit</label>
                          <input
                            className="input"
                            value={it.unit}
                            onChange={(e) => updateExtraItem(it.id, { unit: e.target.value })}
                          />
                        </div>
                      </div>

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

                      <div style={{ display: "flex", justifyContent: "flex-end" }}>
                        <button className="btn btn-ghost" type="button" onClick={() => removeExtraItem(it.id)}>
                          Remove Item
                        </button>
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

                {/* ✅ Missing pricing notice */}
                {pricingSummary && hasMissingPrices && (
                  <div
                    className="glass-inner"
                    style={{
                      marginTop: ".75rem",
                      borderLeft: "4px solid var(--gold)",
                      padding: ".75rem",
                    }}
                  >
                    <div style={{ fontWeight: 800, color: "var(--gold)" }}>Pricing Notice</div>
                    <p className="small" style={{ marginTop: ".35rem" }}>
                      We’re sorry — one or more of your items do not have a price loaded in our system.
                      <br />
                      <br />
                      You’re viewing the app in <strong>testing mode</strong>. Once live pricing is enabled,
                      accurate prices will automatically appear.
                      <br />
                      <br />
                      Sorry for the inconvenience, and thank you for helping us test 3C.
                    </p>
                  </div>
                )}

                <div style={{ marginTop: ".9rem" }}>
                  <div className="small">
                    Total items in cart: <strong>{allItems.length}</strong>
                  </div>

                  {pricingSummary && hasItems && (
                    <div style={{ marginTop: ".75rem" }}>
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

        {/* no extra bottom row */}
      </div>
    </div>
  );
}

