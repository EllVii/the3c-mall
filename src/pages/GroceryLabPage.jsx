// src/pages/GroceryLabPage.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/GroceryLabPage.css";
import { readJSON, writeJSON, nowISO, safeId } from "../utils/Storage";
import ConciergeIntro from "../assets/components/ConciergeIntro";

// Date/Time formatting helper
function formatDateTime() {
  const now = new Date();
  const dateFormat = localStorage.getItem("3c.dateFormat") || "MM/DD/YYYY";
  const timeFormat = localStorage.getItem("3c.timeFormat") || "12";

  let dateStr = "";
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const year = now.getFullYear();

  switch (dateFormat) {
    case "DD/MM/YYYY":
      dateStr = `${day}/${month}/${year}`;
      break;
    case "YYYY/MM/DD":
      dateStr = `${year}/${month}/${day}`;
      break;
    default:
      dateStr = `${month}/${day}/${year}`;
  }

  let hours = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, "0");
  let timeStr = "";

  if (timeFormat === "24") {
    timeStr = `${String(hours).padStart(2, "0")}:${minutes}`;
  } else {
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    timeStr = `${hours}:${minutes} ${ampm}`;
  }

  return { date: dateStr, time: timeStr };
}

/**
 * GroceryLabPage (Phase 1)
 * - 5-panel locked carousel
 * - Each panel scrolls vertically inside itself
 * - Protected Meal Plan items + Editable Extras
 * - Deterministic daily demo pricing (rotates at 00:00 local)
 */

const STRATEGY_KEY = "grocery.strategy.v1";
const STORE_USAGE_KEY = "grocery.storeUsage.v1";
const HANDOFF_KEY = "handoff.mealToGrocery.v1";
const PROFILE_KEY = "concierge.profile.v1";

const MEAL_ITEMS_KEY = "cart.mealItems.v1";
const GROCERY_KEY = "grocery.items.v1";
const PRICING_SUMMARY_KEY = "grocery.pricingSummary.v1";
const SAVINGS_HISTORY_KEY = "grocery.savingsHistory.v1";

const STORES = [
  { id: "costco", name: "Costco" },
  { id: "walmart", name: "Walmart" },
  { id: "aldi", name: "ALDI" },
  { id: "target", name: "Target" },
  { id: "sprouts", name: "Sprouts" },
];

const AISLE_ORDER = [
  "Produce",
  "Bakery",
  "Deli",
  "Meat",
  "Seafood",
  "Dairy",
  "Frozen",
  "Beverages",
  "Snacks",
  "Pantry",
  "Household",
  "Personal Care",
  "Pharmacy",
  "Baby",
  "Other",
];

function aisleForItem(name) {
  const n = (name || "").toLowerCase();
  if (/apple|banana|lettuce|spinach|tomato|onion|garlic|pepper|berry|cucumber|carrot/.test(n)) return "Produce";
  if (/bread|bagel|tortilla|bun|bakery|croissant|pita|loaf/.test(n)) return "Bakery";
  if (/ham|turkey|salami|deli|prosciutto/.test(n)) return "Deli";
  if (/beef|chicken|pork|steak|sausage|lamb|ground/.test(n)) return "Meat";
  if (/salmon|shrimp|tuna|cod|seafood|fish/.test(n)) return "Seafood";
  if (/milk|cheese|yogurt|butter|cream|egg/.test(n)) return "Dairy";
  if (/frozen|ice cream|pizza|veggies|waffles|fries/.test(n)) return "Frozen";
  if (/water|juice|soda|coffee|tea|kombucha|beer|wine/.test(n)) return "Beverages";
  if (/chips|cookie|cracker|snack|candy|popcorn|nuts/.test(n)) return "Snacks";
  if (/rice|pasta|flour|sugar|oil|spice|sauce|cereal|oats|vinegar|can|jar/.test(n)) return "Pantry";
  if (/paper|towel|toilet|trash|cleaner|detergent|soap|foil|wrap/.test(n)) return "Household";
  if (/shampoo|conditioner|lotion|toothpaste|toothbrush|deodorant|razor|body wash/.test(n)) return "Personal Care";
  if (/vitamin|medicine|aspirin|pain|cough|pharmacy/.test(n)) return "Pharmacy";
  if (/diaper|wipes|formula|baby/.test(n)) return "Baby";
  return "Other";
}

function groupItemsByAisle(items) {
  const groups = new Map();
  for (const it of items) {
    const aisle = aisleForItem(it.name);
    if (!groups.has(aisle)) groups.set(aisle, []);
    groups.get(aisle).push(it);
  }
  const ordered = AISLE_ORDER.filter((a) => groups.has(a)).map((a) => ({ aisle: a, items: groups.get(a) }));
  return ordered;
}

function num(n, fallback = 0) {
  const v = Number(n);
  return Number.isFinite(v) ? v : fallback;
}

function money2(n) {
  return num(n, 0).toFixed(2);
}

// Accept older/localStorage shapes safely.
// If it doesn't contain required numbers, return null.
function normalizePricingSummary(p) {
  if (!p || typeof p !== "object") return null;

  // support both old + new keys
  const total = num(p.total ?? p.grandTotal ?? null, NaN);
  const subtotal = num(p.subtotal ?? null, NaN);
  const tax = num(p.tax ?? null, NaN);

  // If at least total is valid, we can display it (subtotal/tax optional).
  if (!Number.isFinite(total)) return null;

  return {
    ...p,
    total,
    subtotal: Number.isFinite(subtotal) ? subtotal : Math.max(0, total - num(tax, 0)),
    tax: Number.isFinite(tax) ? tax : 0,
    dailyMult: num(p.dailyMult ?? 1, 1),
    itemCount: num(p.itemCount ?? p.itemsCount ?? 0, 0),
    winnerStoreName: String(p.winnerStoreName ?? p.winner ?? p.chosenStoreName ?? "—"),
    dayKey: String(p.dayKey ?? p.dateKey ?? dayKeyLocal()),
    note: String(p.note ?? "Demo pricing rotates daily at local midnight."),
  };
}

const PANELS = [
  { id: "items", title: "Items" },
  { id: "strategy", title: "Strategy" },
  { id: "pricing", title: "Pricing" },
  { id: "review", title: "Confirm & Route" },
  { id: "receipt", title: "Receipt" },
];

const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

function dayKeyLocal(d = new Date()) {
  const yr = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, "0");
  const da = String(d.getDate()).padStart(2, "0");
  return `${yr}-${mo}-${da}`;
}

function monthKeyLocal(d = new Date()) {
  const yr = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, "0");
  return `${yr}-${mo}`;
}

function seededInt(seedStr) {
  // deterministic hash -> 32-bit int
  let h = 2166136261;
  for (let i = 0; i < seedStr.length; i++) {
    h ^= seedStr.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) | 0;
}

function defaultStrategy() {
  return {
    storeRules: {
      costco: "Bulk meats & pantry staples",
      walmart: "Everyday basics",
      aldi: "Produce & value picks",
      target: "Convenience add-ons",
      sprouts: "Specialty / fresh",
    },
    priorityOrder: ["aldi", "walmart", "costco", "target", "sprouts"],
    // Quick Mode: how to shop today
    shoppingMode: "multi", // "multi" | "single"
    // Allowed stores (used by pricing + routing). In single mode, first entry is chosen store.
    selectedStores: ["aldi", "walmart", "costco", "target", "sprouts"],
    lastUpdated: nowISO(),
  };
}

function normalizeItem(raw, { locked = false } = {}) {
  return {
    id: raw?.id || safeId("itm"),
    name: String(raw?.name || "").trim(),
    qty: Number.isFinite(Number(raw?.qty)) ? Number(raw.qty) : 1,
    unit: String(raw?.unit || "each"),
    locked: !!(raw?.locked ?? locked),
    substitute: String(raw?.substitute || ""),
    substituteReason: String(raw?.substituteReason || ""),
  };
}

function isValidName(name) {
  return String(name || "").trim().length >= 2;
}

// fallback only
function itemsFromMealPlanFallback() {
  const names = ["Milk", "Eggs", "Ground beef", "Bananas", "Olive oil", "Pasta", "Orange juice"];
  return names.map((n) =>
    normalizeItem(
      { id: safeId("itm"), name: n, qty: n.toLowerCase() === "eggs" ? 2 : 1, unit: "each" },
      { locked: true }
    )
  );
}

// -------------------------------
// Daily Price Rotation (00:00 local time) — SAFE
// -------------------------------
function getDailyMultiplier(date = new Date()) {
  const seed = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    hash |= 0;
  }
  return 0.96 + (Math.abs(hash) % 9) / 100; // 0.96..1.04
}

function msUntilNextMidnightLocal() {
  const now = new Date();
  const next = new Date(now);
  next.setHours(24, 0, 0, 0);
  return Math.max(250, next.getTime() - now.getTime());
}

export default function GroceryLabPage() {
  const nav = useNavigate();
  const location = useLocation();

  const cameFromMeal = location.state?.from === "meal";
  const quickReview = location.state?.quickReview === true;

  // persisted (read once)
  const savedStrategy = useMemo(() => readJSON(STRATEGY_KEY, null), []);
  const savedUsage = useMemo(() => readJSON(STORE_USAGE_KEY, null), []);
  const savedMealItems = useMemo(() => readJSON(MEAL_ITEMS_KEY, null), []);
  const savedGroceries = useMemo(() => readJSON(GROCERY_KEY, null), []);
  const savedPricing = useMemo(() => readJSON(PRICING_SUMMARY_KEY, null), []);
  const savedHandoff = useMemo(() => readJSON(HANDOFF_KEY, null), []);
  const savedProfile = useMemo(() => readJSON(PROFILE_KEY, null), []);
  const savedSavingsHistory = useMemo(() => readJSON(SAVINGS_HISTORY_KEY, []), []);

  const [profile, setProfile] = useState(savedProfile || null);
  const [introOpen, setIntroOpen] = useState(false);
  const [pricingItemsOpen, setPricingItemsOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [sortDesc, setSortDesc] = useState(() => {
    const saved = readJSON("groceryLabSortDesc", true);
    return saved;
  });
  const [expOpen, setExpOpen] = useState(false);
  const [aisleOpen, setAisleOpen] = useState(false);
  const [showRecipeDetail, setShowRecipeDetail] = useState(null);

  // Extract meal info from handoff if available
  const [rotationTick, setRotationTick] = useState(0);

  const dailyMult = useMemo(() => {
    const v = getDailyMultiplier(new Date());
    return Number.isFinite(v) ? v : 1;
  }, [rotationTick]);

  const safeDailyMult = Number.isFinite(dailyMult) ? dailyMult : 1;

  // midnight tick
  useEffect(() => {
    let t = null;

    const schedule = () => {
      const ms = msUntilNextMidnightLocal();
      t = window.setTimeout(() => {
        setRotationTick((x) => x + 1);
        schedule();
      }, ms);
    };

    schedule();

    return () => {
      if (t) window.clearTimeout(t);
    };
  }, []);

  // initial items
  const initialMealItems = useMemo(() => {
    const handoffItems = Array.isArray(savedHandoff?.items) ? savedHandoff.items : null;
    const base = handoffItems || savedMealItems || null;
    const src = Array.isArray(base) && base.length ? base : itemsFromMealPlanFallback();
    return src.map((it) => normalizeItem(it, { locked: true })).filter((it) => isValidName(it.name));
  }, [savedHandoff, savedMealItems]);

  const mealContext = useMemo(() => {
    return savedHandoff?.mealContext || null;
  }, [savedHandoff]);

  const initialExtraItems = useMemo(() => {
    const src = Array.isArray(savedGroceries) ? savedGroceries : [];
    return src.map((it) => normalizeItem(it, { locked: false })).filter((it) => isValidName(it.name));
  }, [savedGroceries]);

  const [strategy, setStrategy] = useState(() => {
    const base = defaultStrategy();
    const s = savedStrategy && typeof savedStrategy === "object" ? savedStrategy : {};
    const validStoreIds = new Set(STORES.map((x) => x.id));
    const selectedStores = Array.isArray(s.selectedStores) && s.selectedStores.length
      ? s.selectedStores.filter((id) => validStoreIds.has(id))
      : base.selectedStores;
    const mode = s.shoppingMode === "single" ? "single" : "multi";
    return {
      ...base,
      ...s,
      shoppingMode: mode,
      selectedStores,
      lastUpdated: s.lastUpdated || base.lastUpdated,
    };
  });
  const [storeUsage, setStoreUsage] = useState(() => savedUsage || {});
  const [mealItems, setMealItems] = useState(initialMealItems);
  const [extraItems, setExtraItems] = useState(initialExtraItems);
  const [stepIndex, setStepIndex] = useState(0);
const [pricingSummary, setPricingSummary] = useState(() => normalizePricingSummary(savedPricing));
  const [savingsHistory, setSavingsHistory] = useState(() => (Array.isArray(savedSavingsHistory) ? savedSavingsHistory : []));

  // focus heading when step changes
  const panelHeadingRef = useRef(null);
  useEffect(() => {
    panelHeadingRef.current?.focus?.();
  }, [stepIndex]);

  const allItems = useMemo(() => {
    const merged = [...mealItems, ...extraItems].filter((it) => isValidName(it.name));
    const seen = new Set();
    const out = [];
    for (const it of merged) {
      const k = it.name.trim().toLowerCase();
      if (seen.has(k)) continue;
      seen.add(k);
      out.push(it);
    }
    return out;
  }, [mealItems, extraItems]);

  const cartIsEmpty = allItems.length === 0;

  const monthlySavings = useMemo(() => {
    const mk = monthKeyLocal();
    const entries = Array.isArray(savingsHistory) ? savingsHistory.filter((e) => e.monthKey === mk) : [];
    const preferredTotal = entries.reduce((acc, e) => acc + num(e.preferredTotal, 0), 0);
    const actualTotal = entries.reduce((acc, e) => acc + num(e.actualTotal, 0), 0);
    const savings = entries.reduce((acc, e) => acc + num(e.savings, 0), 0);
    return {
      entries,
      trips: entries.length,
      preferredTotal,
      actualTotal,
      savings,
      preferredStoreName: entries[entries.length - 1]?.preferredStoreName || "—",
    };
  }, [savingsHistory]);

  const recentSavings = useMemo(() => {
    const list = Array.isArray(savingsHistory) ? savingsHistory.slice(-8).reverse() : [];
    return list;
  }, [savingsHistory]);

  const headerBadge = useMemo(() => {
    const storeId = profile?.defaultStoreId || strategy?.selectedStores?.[0] || null;
    const storeName = storeId ? (STORES.find((s) => s.id === storeId)?.name || "Store") : null;
    const modeKey = profile?.shoppingMode || (strategy?.shoppingMode === "single" ? "fastest" : "best_price");
    const modeLabel = modeKey === "fastest" ? "Fastest" : modeKey === "balanced" ? "Balanced" : "Best price";
    const firstName = (profile?.firstName || "").trim();
    const birthMonth = (profile?.birthMonth || "").trim();
    return { storeName, modeLabel, firstName, birthMonth };
  }, [profile, strategy]);

  useEffect(() => {
    if (profile) writeJSON(PROFILE_KEY, profile);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  const handleIntroClose = () => {
    setIntroOpen(false);
    const latestProfile = readJSON(PROFILE_KEY, null);
    if (latestProfile) setProfile(latestProfile);
    const latestStrategy = readJSON(STRATEGY_KEY, null);
    if (latestStrategy && typeof latestStrategy === "object") {
      const validStoreIds = new Set(STORES.map((x) => x.id));
      const selectedStores = Array.isArray(latestStrategy.selectedStores)
        ? latestStrategy.selectedStores.filter((id) => validStoreIds.has(id))
        : strategy.selectedStores;
      const mode = latestStrategy.shoppingMode === "single" ? "single" : "multi";
      setStrategy((prev) => ({
        ...prev,
        ...latestStrategy,
        shoppingMode: mode,
        selectedStores,
        lastUpdated: latestStrategy.lastUpdated || prev.lastUpdated,
      }));
    }
  };

  // guard rails
  useEffect(() => {
    // if empty, never allow review/receipt
    if (cartIsEmpty && stepIndex >= 3) setStepIndex(0);

    // clear pricing if cart emptied
    if (cartIsEmpty && pricingSummary) setPricingSummary(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartIsEmpty]);

  // quick review only if not empty
  useEffect(() => {
    if (quickReview && !cartIsEmpty) setStepIndex(3);
    if (quickReview && cartIsEmpty) setStepIndex(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quickReview, cartIsEmpty]);

  // persist state
  useEffect(() => { writeJSON(STRATEGY_KEY, strategy); }, [strategy]);
  useEffect(() => { writeJSON(STORE_USAGE_KEY, storeUsage); }, [storeUsage]);
  useEffect(() => { writeJSON(MEAL_ITEMS_KEY, mealItems); }, [mealItems]);
  useEffect(() => { writeJSON(GROCERY_KEY, extraItems); }, [extraItems]);
  useEffect(() => { writeJSON(PRICING_SUMMARY_KEY, pricingSummary); }, [pricingSummary]);
  useEffect(() => { writeJSON(SAVINGS_HISTORY_KEY, savingsHistory); }, [savingsHistory]);
  useEffect(() => { writeJSON(SAVINGS_HISTORY_KEY, savingsHistory); }, [savingsHistory]);

  // step helpers
  const goStep = (idx) => setStepIndex(clamp(idx, 0, PANELS.length - 1));
  const next = () => goStep(stepIndex + 1);
  const prev = () => goStep(stepIndex - 1);

  // extras
  const addExtraItem = () => {
    setExtraItems((prev) => [
      ...prev,
      normalizeItem({ id: safeId("itm"), name: "", qty: 1, unit: "each" }, { locked: false }),
    ]);
  };

  const updateItem = (setFn, id, patch) => {
    setFn((prev) =>
      prev.map((it) => (it.id === id ? normalizeItem({ ...it, ...patch }, { locked: it.locked }) : it))
    );
  };

  const removeItem = (setFn, id) => {
    setFn((prev) => prev.filter((it) => it.id !== id));
  };

  // demo pricing
  const runPricing = () => {
    if (cartIsEmpty) {
      setPricingSummary(null);
      return;
    }

    const seed = `${dayKeyLocal()}|${safeDailyMult.toFixed(2)}|${strategy?.priorityOrder?.join(",") || ""}|${allItems
      .map((i) => i.name.toLowerCase())
      .sort()
      .join("|")}`;

    const h = seededInt(seed);
    const allowedStores = (Array.isArray(strategy?.selectedStores) && strategy.selectedStores.length
      ? STORES.filter((s) => strategy.selectedStores.includes(s.id))
      : STORES) || STORES;

    const itemCount = allItems.reduce((acc, it) => acc + (Number(it.qty) || 1), 0);

    const computeTotalsForStore = (store) => {
      const sh = seededInt(`${seed}|${store.id}`);
      const base = 2.5 + ((Math.abs(sh) % 250) / 100); // 2.50–4.99 per store
      const rotatedBase = base * safeDailyMult;
      const subtotal = Number((rotatedBase * itemCount).toFixed(2));
      const tax = Number((subtotal * 0.082).toFixed(2));
      const total = Number((subtotal + tax).toFixed(2));
      return {
        storeId: store.id,
        storeName: store.name,
        subtotal,
        tax,
        total,
      };
    };

    let storeBreakdown = [];
    let winnerRow;
    if (strategy?.shoppingMode === "single") {
      const chosenId = allowedStores[0]?.id || strategy?.selectedStores?.[0];
      const chosenStore = allowedStores.find((s) => s.id === chosenId) || allowedStores[0] || STORES[0];
      const row = computeTotalsForStore(chosenStore);
      storeBreakdown = [row];
      winnerRow = row;
    } else {
      storeBreakdown = allowedStores.map((s) => computeTotalsForStore(s));
      winnerRow = storeBreakdown.reduce((min, r) => (r.total < min.total ? r : min), storeBreakdown[0]);
    }

    // Savings vs next-best (only meaningful in multi-store with 2+ stores)
    let savingsVsNext = 0;
    let nextBestStoreName = null;
    let nextBestTotal = null;
    if (strategy?.shoppingMode === "multi" && storeBreakdown.length > 1) {
      const sorted = [...storeBreakdown].sort((a, b) => a.total - b.total);
      const nextBest = sorted.find((r) => r.storeId !== winnerRow.storeId) || sorted[1] || null;
      if (nextBest) {
        savingsVsNext = Number((nextBest.total - winnerRow.total).toFixed(2));
        nextBestStoreName = nextBest.storeName;
        nextBestTotal = nextBest.total;
      }
    }

    const preferredStoreId = strategy?.selectedStores?.[0] || strategy?.priorityOrder?.[0] || STORES[0].id;
    const preferredStore = STORES.find((s) => s.id === preferredStoreId) || STORES[0];
    const preferredRow = computeTotalsForStore(preferredStore);

    const storeBreakdownSorted = [...storeBreakdown].sort((a, b) => b.total - a.total);
    const summary = {
      computedAt: nowISO(),
      dayKey: dayKeyLocal(),
      dailyMult: safeDailyMult,
      winnerStoreId: winnerRow.storeId,
      winnerStoreName: winnerRow.storeName,
      itemCount,
      subtotal: winnerRow.subtotal,
      tax: winnerRow.tax,
      total: winnerRow.total,
      note: "Static demo pricing rotates daily at local midnight.",
      mode: strategy?.shoppingMode || "multi",
      allowedStores: allowedStores.map((s) => s.id),
      storeBreakdown: storeBreakdownSorted,
      savingsVsNext,
      nextBestStoreName,
      nextBestTotal,
      preferredStoreName: preferredStore?.name,
      preferredTotal: preferredRow?.total,
      actualTotal: winnerRow.total,
    };

setPricingSummary(normalizePricingSummary(summary));

    // Persist savings entry for monthly rollups (demo only)
    const savingsEntry = {
      id: safeId("sav"),
      dayKey: dayKeyLocal(),
      monthKey: monthKeyLocal(),
      preferredStoreId: preferredStore.id,
      preferredStoreName: preferredStore.name,
      preferredTotal: preferredRow.total,
      actualStoreId: winnerRow.storeId,
      actualStoreName: winnerRow.storeName,
      actualTotal: winnerRow.total,
      savings: Number((preferredRow.total - winnerRow.total).toFixed(2)),
      mode: strategy?.shoppingMode || "multi",
      fulfillmentMode: strategy.fulfillmentMode || "walkthrough",
      shopByAisle: Boolean(strategy.shopByAisle),
      missingPriceCount: 0,
      note: "",
    };
    setSavingsHistory((prev) => {
      const next = [...(Array.isArray(prev) ? prev : []), savingsEntry];
      return next.slice(-120);
    });

    setStoreUsage((prev) => ({
      ...prev,
      [winnerRow.storeId]: {
        count: (prev?.[winnerRow.storeId]?.count || 0) + 1,
        lastUsedAt: nowISO(),
      },
    }));
  };

  const trackStyle = useMemo(
    () => ({
      transform: `translateX(-${stepIndex * 20}%)`,
    }),
    [stepIndex]
  );

  return (
    <div className="gl-shell">
      <header className="gl-header">
        <div className="gl-header-left">
          <h1 className="gl-title">Grocery Lab</h1>
          <p className="gl-subtitle">Route your cart like a logistics pro.</p>
          {headerBadge.storeName || headerBadge.modeLabel ? (
            <div className="gl-inline-summary" style={{ marginTop: 6 }}>
              {headerBadge.storeName ? <span className="gl-pill">{headerBadge.storeName}</span> : null}
              {headerBadge.modeLabel ? <span className="gl-pill">{headerBadge.modeLabel}</span> : null}
              {headerBadge.firstName ? <span className="gl-pill">Hi, {headerBadge.firstName}</span> : null}
              {headerBadge.birthMonth ? <span className="gl-pill">Perks: {headerBadge.birthMonth}</span> : null}
              <button className="gl-link-edit" type="button" onClick={() => setIntroOpen(true)}>Edit</button>
            </div>
          ) : null}
        </div>

        <div className="gl-header-right">
          {cameFromMeal && (
            <button className="gl-btn gl-btn-ghost" onClick={() => nav(-1)} type="button">
              ← Back
            </button>
          )}

          <button className="gl-btn gl-btn-primary" onClick={() => nav("/app")} type="button">
            Dashboard
          </button>
        </div>
      </header>

      <nav className="gl-steps" aria-label="Grocery Lab steps">
        {PANELS.map((p, idx) => {
          const disabled = cartIsEmpty && idx >= 3;
          const active = idx === stepIndex;
          return (
            <button
              key={p.id}
              type="button"
              className={`gl-step ${active ? "is-active" : ""}`}
              onClick={() => !disabled && goStep(idx)}
              disabled={disabled}
              aria-current={active ? "step" : undefined}
              title={disabled ? "Add items to continue" : p.title}
            >
              <span className="gl-step-index">{idx + 1}</span>
              <span className="gl-step-label">{p.title}</span>
            </button>
          );
        })}
      </nav>

      <section className="gl-carousel" aria-live="polite">
        <div className="gl-track" style={trackStyle}>
          {/* Panel 1: Items */}
          <div className="gl-panel" role="group" aria-label="Items panel">
            <h2 className="gl-panel-title" tabIndex={-1} ref={panelHeadingRef}>
              Items
            </h2>

            {Boolean(strategy.shopByAisle || strategy.fulfillmentMode === "walkthrough") ? (
              <div className="gl-card">
                <div className="gl-card-head">
                  <h3 className="gl-card-title">Aisle View</h3>
                  <span className="gl-muted">Guided in-store</span>
                </div>
                <div className="gl-summary">
                  {groupItemsByAisle([...mealItems, ...extraItems]).map((grp) => (
                    <div key={grp.aisle} className="gl-card" style={{ padding: 10 }}>
                      <div className="gl-card-head">
                        <h4 className="gl-card-title">{grp.aisle}</h4>
                        <span className="gl-muted">{grp.items.length} {grp.items.length === 1 ? "item" : "items"}</span>
                      </div>
                      <ul className="gl-list">
                        {grp.items.map((it) => (
                          <li key={it.id} className="gl-row">
                            <div className="gl-row-main">
                              <div className="gl-row-name">{it.name}</div>
                              <div className="gl-row-meta">Qty: {it.qty} {it.unit}{it.locked ? " • Meal Plan" : " • Extra"}</div>
                            </div>
                            <div className="gl-row-actions">{it.locked ? <span className="gl-pill">Locked</span> : null}</div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <>
                <div className="gl-card">
                  <h3 className="gl-card-title">Meal Plan (Locked)</h3>
                  {mealItems.length === 0 ? (
                    <p className="gl-muted">No meal plan items yet.</p>
                  ) : (
                    <ul className="gl-list">
                      {mealItems.map((it) => (
                        <li key={it.id} className="gl-row">
                          <div className="gl-row-main">
                            <div className="gl-row-name">{it.name}</div>
                            <div className="gl-row-meta">
                              Qty: {it.qty} {it.unit}
                            </div>
                          </div>
                          <div className="gl-row-actions">
                            <span className="gl-pill">Locked</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="gl-card">
                  <div className="gl-card-head">
                    <h3 className="gl-card-title">Extras (Editable)</h3>
                    <button className="gl-btn gl-btn-ghost" type="button" onClick={addExtraItem}>
                      + Add
                    </button>
                  </div>

                  {extraItems.length === 0 ? (
                    <p className="gl-muted">Add anything else you need (snacks, toiletries, etc.).</p>
                  ) : (
                    <ul className="gl-list">
                      {extraItems.map((it) => (
                        <li key={it.id} className="gl-row gl-row-edit">
                          <div className="gl-row-fields">
                            <label className="gl-field">
                              <span className="gl-label">Item</span>
                              <input
                                className="gl-input"
                                value={it.name}
                                onChange={(e) => updateItem(setExtraItems, it.id, { name: e.target.value })}
                                placeholder="e.g., Coffee"
                              />
                            </label>

                            <label className="gl-field gl-field-qty">
                              <span className="gl-label">Qty</span>
                              <input
                                className="gl-input"
                                inputMode="numeric"
                                value={String(it.qty ?? 1)}
                                onChange={(e) =>
                                  updateItem(setExtraItems, it.id, { qty: Math.max(1, Number(e.target.value || 1)) })
                                }
                              />
                            </label>

                            <label className="gl-field gl-field-unit">
                              <span className="gl-label">Unit</span>
                              <select
                                className="gl-input"
                                value={it.unit}
                                onChange={(e) => updateItem(setExtraItems, it.id, { unit: e.target.value })}
                              >
                                <option value="each">each</option>
                                <option value="lb">lb</option>
                                <option value="oz">oz</option>
                                <option value="gal">gal</option>
                                <option value="box">box</option>
                              </select>
                            </label>
                          </div>

                          <div className="gl-row-actions">
                            <button className="gl-btn gl-btn-danger" type="button" onClick={() => removeItem(setExtraItems, it.id)}>
                              Remove
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </>
            )}

            <div className="gl-panel-footer">
              <button className="gl-btn gl-btn-primary" type="button" onClick={next} disabled={cartIsEmpty}>
                Next →
              </button>
              {cartIsEmpty && <span className="gl-hint">Add at least one item to continue.</span>}
            </div>
          </div>

          {/* Panel 2: Strategy */}
          <div className="gl-panel" role="group" aria-label="Strategy panel">
            <h2 className="gl-panel-title" tabIndex={-1}>Strategy</h2>

            <div className="gl-card">
              <h3 className="gl-card-title">Shopping Mode</h3>
              <p className="gl-muted">How do you want to shop today?</p>
              <div className="gl-list">
                <label className="gl-row">
                  <div className="gl-row-main">
                    <div className="gl-row-name">Multi-Store Optimization</div>
                    <div className="gl-row-meta">Find the best price across allowed stores.</div>
                  </div>
                  <div className="gl-row-actions">
                    <input
                      type="radio"
                      name="shopping-mode"
                      checked={strategy.shoppingMode === "multi"}
                      onChange={() =>
                        setStrategy((prev) => ({
                          ...prev,
                          shoppingMode: "multi",
                          lastUpdated: nowISO(),
                        }))
                      }
                    />
                  </div>
                </label>

                <label className="gl-row">
                  <div className="gl-row-main">
                    <div className="gl-row-name">Single-Store Shopping</div>
                    <div className="gl-row-meta">Lock pricing to one chosen store.</div>
                  </div>
                  <div className="gl-row-actions">
                    <input
                      type="radio"
                      name="shopping-mode"
                      checked={strategy.shoppingMode === "single"}
                      onChange={() =>
                        setStrategy((prev) => ({
                          ...prev,
                          shoppingMode: "single",
                          // ensure one store remains selected
                          selectedStores:
                            Array.isArray(prev.selectedStores) && prev.selectedStores.length
                              ? [prev.selectedStores[0]]
                              : [STORES[0].id],
                          lastUpdated: nowISO(),
                        }))
                      }
                    />
                  </div>
                </label>
              </div>
            </div>

            <div className="gl-card">
              <h3 className="gl-card-title">Store Selector</h3>
              <p className="gl-muted">Choose which stores to include.</p>
              <label className="gl-row">
                <div className="gl-row-main">
                  <div className="gl-row-name">Select all stores</div>
                  <div className="gl-row-meta">Quick toggle</div>
                </div>
                <div className="gl-row-actions">
                  <input
                    type="checkbox"
                    checked={Array.isArray(strategy.selectedStores) && strategy.selectedStores.length === STORES.length}
                    onChange={(e) => {
                      const allIds = STORES.map((x) => x.id);
                      setStrategy((prev) => ({
                        ...prev,
                        selectedStores: e.target.checked ? allIds : allIds.slice(0, 1),
                        shoppingMode: e.target.checked ? "multi" : "single",
                        lastUpdated: nowISO(),
                      }));
                    }}
                  />
                </div>
              </label>
              <div className="gl-list">
                {STORES.map((s) => {
                  const isSelected = Array.isArray(strategy.selectedStores)
                    ? strategy.selectedStores.includes(s.id)
                    : false;
                  const toggle = () => {
                    setStrategy((prev) => {
                      const cur = Array.isArray(prev.selectedStores) ? prev.selectedStores : [];
                      if (prev.shoppingMode === "single") {
                        // single mode: only one store at a time
                        return {
                          ...prev,
                          selectedStores: [s.id],
                          lastUpdated: nowISO(),
                        };
                      }
                      // multi mode: toggle checkbox
                      const next = isSelected ? cur.filter((id) => id !== s.id) : [...cur, s.id];
                      // never allow empty selection; fallback to all
                      const valid = next.length ? next : STORES.map((x) => x.id);
                      return {
                        ...prev,
                        selectedStores: valid,
                        lastUpdated: nowISO(),
                      };
                    });
                  };
                  return (
                    <label key={s.id} className="gl-row">
                      <div className="gl-row-main">
                        <div className="gl-row-name">{s.name}</div>
                        <div className="gl-row-meta">
                          {strategy.shoppingMode === "single" ? "Pick one store" : "Allow in optimization"}
                        </div>
                      </div>
                      <div className="gl-row-actions">
                        {strategy.shoppingMode === "single" ? (
                          <input type="radio" name="single-store" checked={isSelected} onChange={toggle} />
                        ) : (
                          <input type="checkbox" checked={isSelected} onChange={toggle} />
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="gl-card">
              <h3 className="gl-card-title">Shopping Options</h3>
              <p className="gl-muted">Choose how you plan to shop today.</p>
              <div className="gl-list">
                {[
                  { id: "pickup", name: "Pickup" },
                  { id: "delivery", name: "Delivery" },
                  { id: "walkthrough", name: "Walk-through in store" },
                ].map((opt) => (
                  <label key={opt.id} className="gl-row">
                    <div className="gl-row-main">
                      <div className="gl-row-name">{opt.name}</div>
                      <div className="gl-row-meta">{opt.id === "walkthrough" ? "Be guided aisle by aisle" : ""}</div>
                    </div>
                    <div className="gl-row-actions">
                      <input
                        type="radio"
                        name="fulfillment-mode"
                        checked={(strategy.fulfillmentMode || "walkthrough") === opt.id}
                        onChange={() =>
                          setStrategy((prev) => ({ ...prev, fulfillmentMode: opt.id, lastUpdated: nowISO() }))
                        }
                      />
                    </div>
                  </label>
                ))}
                <label className="gl-row">
                  <div className="gl-row-main">
                    <div className="gl-row-name">Shop by Aisle</div>
                    <div className="gl-row-meta">Group list by in-store aisles</div>
                  </div>
                  <div className="gl-row-actions">
                    <input
                      type="checkbox"
                      checked={Boolean(strategy.shopByAisle)}
                      onChange={(e) =>
                        setStrategy((prev) => ({ ...prev, shopByAisle: e.target.checked, lastUpdated: nowISO() }))
                      }
                    />
                  </div>
                </label>
              </div>
            </div>

            <div className="gl-card">
              <h3 className="gl-card-title">Store Rules</h3>
              <p className="gl-muted">Write one sentence per store (used later for smart routing).</p>

              <div className="gl-grid">
                {STORES.map((s) => (
                  <label key={s.id} className="gl-field gl-field-wide">
                    <span className="gl-label">{s.name}</span>
                    <input
                      className="gl-input"
                      value={strategy?.storeRules?.[s.id] || ""}
                      onChange={(e) =>
                        setStrategy((prev) => ({
                          ...prev,
                          storeRules: { ...(prev.storeRules || {}), [s.id]: e.target.value },
                          lastUpdated: nowISO(),
                        }))
                      }
                      placeholder={`What do you usually buy at ${s.name}?`}
                    />
                  </label>
                ))}
              </div>
            </div>

            <div className="gl-panel-footer">
              <button className="gl-btn gl-btn-ghost" type="button" onClick={prev}>← Back</button>
              <button className="gl-btn gl-btn-primary" type="button" onClick={next} disabled={cartIsEmpty}>Next →</button>
            </div>
          </div>

          {/* Panel 3: Pricing */}
          <div className="gl-panel" role="group" aria-label="Pricing panel">
            <h2 className="gl-panel-title" tabIndex={-1}>Pricing</h2>

            <div className="gl-card">
              <div className="gl-card-head">
                <h3 className="gl-card-title">Daily Best Store (Demo)</h3>
                <button className="gl-btn gl-btn-primary" type="button" onClick={runPricing} disabled={cartIsEmpty}>
                  Run Pricing
                </button>
              </div>

              {!pricingSummary ? (
                <p className="gl-muted">Run pricing to see today’s best store + totals.</p>
              ) : (
                <div className="gl-summary">
                  <div className="gl-summary-row"><span className="gl-muted">Winner</span><span className="gl-strong">{pricingSummary.winnerStoreName}</span></div>
                  <div className="gl-summary-row"><span className="gl-muted">Items</span><span>{pricingSummary.itemCount}</span></div>
                  <div className="gl-summary-row"><span className="gl-muted">Daily rotation</span><span>{Number(num(pricingSummary?.dailyMult,1).toFixed(2))}×</span></div>
                  <div className="gl-summary-row"><span className="gl-muted">Subtotal</span><span>${money2(pricingSummary?.subtotal)}</span></div>
                  <div className="gl-summary-row"><span className="gl-muted">Subtotal</span><span>${money2(pricingSummary?.subtotal)}</span></div>
                  <div className="gl-summary-row"><span className="gl-muted">Tax</span><span>${money2(pricingSummary?.tax)}</span></div>
                  <div className="gl-summary-row gl-summary-total"><span>Total</span><span>${money2(pricingSummary?.total)}</span></div>
                  {pricingSummary?.mode === "multi" && Array.isArray(pricingSummary?.storeBreakdown) && pricingSummary.storeBreakdown.length > 1 ? (
                    <div className="gl-summary" style={{ marginTop: 10 }}>
                      <div className="gl-summary-row"><span className="gl-muted">Per-Store Totals</span><span /></div>
                      <div className="gl-summary-row">
                        <span className="gl-muted">Sort</span>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button
                            className={sortDesc ? "gl-pill" : "gl-pill-active"}
                            type="button"
                            onClick={() => {
                              setSortDesc(false);
                              writeJSON("groceryLabSortDesc", false);
                            }}
                          >
                            Best Savings
                          </button>
                          <button
                            className={sortDesc ? "gl-pill-active" : "gl-pill"}
                            type="button"
                            onClick={() => {
                              setSortDesc(true);
                              writeJSON("groceryLabSortDesc", true);
                            }}
                          >
                            Most expensive
                          </button>
                        </div>
                      </div>
                      {[...pricingSummary.storeBreakdown].sort((a,b)=> sortDesc ? b.total - a.total : a.total - b.total).map((row) => (
                        <div key={row.storeId} className="gl-summary-row">
                          <span className={row.storeId === pricingSummary.winnerStoreId ? "gl-strong" : undefined}>{row.storeName}</span>
                          <span>
                            <span className="gl-muted" style={{ marginRight: 6 }}>Sub:</span>${money2(row.subtotal)}
                            <span className="gl-muted" style={{ margin: "0 6px 0 10px" }}>Total:</span>${money2(row.total)}
                          </span>
                        </div>
                      ))}
                      {Number(pricingSummary.savingsVsNext || 0) > 0 ? (
                        <p className="gl-note">
                          Saves ${money2(pricingSummary.savingsVsNext)} vs {pricingSummary.nextBestStoreName}
                        </p>
                      ) : (
                        <p className="gl-note">Reason: Best total among allowed stores today.</p>
                      )}
                      <div className="gl-summary-row">
                        <button className="gl-btn" type="button" onClick={() => setPricingItemsOpen((v) => !v)}>
                          {pricingItemsOpen ? "Hide items" : "Show items"}
                        </button>
                        <span />
                      </div>
                      {pricingItemsOpen ? (
                        <div className="gl-list" style={{ marginTop: 8 }}>
                          {allItems.map((it) => (
                            <div key={it.id} className="gl-row">
                              <div className="gl-row-main">
                                <div className="gl-row-name">{it.name}</div>
                                <div className="gl-row-meta">Qty: {it.qty} {it.unit}</div>
                              </div>
                              <div className="gl-row-actions">{it.locked ? <span className="gl-pill">Meal Plan</span> : <span className="gl-pill">Extra</span>}</div>
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              )}
            </div>

            <div className="gl-panel-footer">
              <button className="gl-btn gl-btn-ghost" type="button" onClick={prev}>← Back</button>
              <button className="gl-btn gl-btn-primary" type="button" onClick={next} disabled={cartIsEmpty}>Next →</button>
            </div>
          </div>

          {/* Panel 4: Review */}
          <div className="gl-panel" role="group" aria-label="Review panel">
            <h2 className="gl-panel-title" tabIndex={-1}>Confirm & Route</h2>

            {/* Meal Plan Summary */}
            {mealContext && (
              <div className="gl-card" style={{ marginBottom: 12, backgroundColor: "rgba(246,220,138,.08)", borderLeft: "3px solid var(--gold)" }}>
                <h3 className="gl-card-title" style={{ color: "var(--gold)" }}>📅 Meal Plan</h3>
                <div style={{ display: "grid", gap: 10 }}>
                  <div style={{ padding: "8px 12px", backgroundColor: "rgba(246,220,138,.12)", borderRadius: 6 }}>
                    <div style={{ fontSize: 12, color: "var(--muted)" }}>Meal Type</div>
                    <div style={{ fontSize: 14, fontWeight: 700, marginTop: 2 }}>{mealContext.mealLabel || "Select a meal"}</div>
                  </div>
                  <div style={{ padding: "8px 12px", backgroundColor: "rgba(246,220,138,.12)", borderRadius: 6 }}>
                    <div style={{ fontSize: 12, color: "var(--muted)" }}>Time</div>
                    <div style={{ fontSize: 14, fontWeight: 700, marginTop: 2 }}>{mealContext.time24 || "TBD"}</div>
                  </div>
                  <div style={{ padding: "8px 12px", backgroundColor: "rgba(246,220,138,.12)", borderRadius: 6 }}>
                    <div style={{ fontSize: 12, color: "var(--muted)" }}>Date</div>
                    <div style={{ fontSize: 14, fontWeight: 700, marginTop: 2 }}>{mealContext.dateISO || "Today"}</div>
                  </div>
                </div>
              </div>
            )}

            <div className="gl-card">
              <h3 className="gl-card-title">Your Cart</h3>
              {Boolean(strategy.shopByAisle || (strategy.fulfillmentMode === "walkthrough")) ? (
                <div className="gl-summary">
                  {groupItemsByAisle(allItems).map((grp) => (
                    <div key={grp.aisle} className="gl-card" style={{ padding: 10 }}>
                      <div className="gl-card-head">
                        <h4 className="gl-card-title">{grp.aisle}</h4>
                        <span className="gl-muted">{grp.items.length} {grp.items.length === 1 ? "item" : "items"}</span>
                      </div>
                      <ul className="gl-list">
                        {grp.items.map((it) => (
                          <li key={it.id} className="gl-row">
                            <div className="gl-row-main">
                              <div className="gl-row-name">{it.name}</div>
                              <div className="gl-row-meta">Qty: {it.qty} {it.unit}{it.locked ? " • Meal Plan" : " • Extra"}</div>
                            </div>
                            <div className="gl-row-actions">{it.locked ? <span className="gl-pill">Locked</span> : null}</div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              ) : (
                <ul className="gl-list">
                  {allItems.map((it) => (
                    <li key={it.id} className="gl-row">
                      <div className="gl-row-main">
                        <div className="gl-row-name">{it.name}</div>
                        <div className="gl-row-meta">Qty: {it.qty} {it.unit}{it.locked ? " • Meal Plan" : " • Extra"}</div>
                      </div>
                      <div className="gl-row-actions">{it.locked ? <span className="gl-pill">Locked</span> : null}</div>
                    </li>
                  ))}
                </ul>
              )}

              {!pricingSummary ? (
                <p className="gl-muted">Tip: Run pricing first to generate totals.</p>
              ) : (
                <div className="gl-inline-summary">
                  <span className="gl-pill">{pricingSummary.winnerStoreName}</span>
                  <span className="gl-strong">${money2(pricingSummary?.total)}</span>
                </div>
              )}
            </div>

            <div className="gl-panel-footer">
              <button className="gl-btn gl-btn-ghost" type="button" onClick={prev}>← Back</button>
              <button className="gl-btn gl-btn-primary" type="button" onClick={next} disabled={cartIsEmpty}>Next →</button>
            </div>
          </div>

          {/* Panel 5: Receipt */}
          <div className="gl-panel" role="group" aria-label="Receipt panel">
            <h2 className="gl-panel-title" tabIndex={-1}>Receipt</h2>

            <div className="gl-card">
              <h3 className="gl-card-title">Today’s Summary</h3>

              {!pricingSummary ? (
                <p className="gl-muted">No pricing summary yet. Go back and run pricing.</p>
              ) : (
                <div className="gl-receipt">
                  <div className="gl-receipt-row"><span>Date</span><span>{formatDateTime().date}</span></div>
                  <div className="gl-receipt-row"><span>Time</span><span>{formatDateTime().time}</span></div>
                  <div className="gl-receipt-row"><span>Store</span><span>{pricingSummary.winnerStoreName}</span></div>
                  <div className="gl-receipt-row"><span>Items</span><span>{pricingSummary.itemCount}</span></div>
                  <div className="gl-receipt-row"><span>Rotation</span><span>{Number(num(pricingSummary?.dailyMult, 1).toFixed(2))}×</span></div>
                  <div className="gl-receipt-row"><span>Total</span><span className="gl-strong">${money2(pricingSummary?.total)}</span></div>
                  {pricingSummary?.mode === "multi" && Number(pricingSummary?.savingsVsNext || 0) > 0 ? (
                    <div className="gl-receipt-row"><span>Saves vs next best</span><span>${money2(pricingSummary.savingsVsNext)} vs {pricingSummary.nextBestStoreName}</span></div>
                  ) : null}
                  {pricingSummary?.savings !== undefined ? null : null}
                  {Number(pricingSummary?.savingsVsNext || 0) === 0 && pricingSummary?.nextBestStoreName ? (
                    <div className="gl-receipt-row"><span>Reason</span><span>Best total among allowed stores</span></div>
                  ) : null}
                  {pricingSummary?.preferredStoreName && pricingSummary?.preferredTotal !== undefined && pricingSummary?.actualTotal !== undefined ? (
                    <>
                      <div className="gl-divider" />
                      <div className="gl-receipt-row"><span>Preferred store baseline</span><span>${money2(pricingSummary.preferredTotal)}</span></div>
                      <div className="gl-receipt-row"><span>App choice</span><span>${money2(pricingSummary.actualTotal)}</span></div>
                      <div className="gl-receipt-row gl-summary-total"><span>Trip savings</span><span>${money2(pricingSummary.preferredTotal - pricingSummary.actualTotal)}</span></div>
                    </>
                  ) : null}
                  <div className="gl-divider" />
                  <div className="gl-summary-row" style={{ justifyContent: "space-between" }}>
                    <span className="gl-muted">Monthly + History</span>
                    <button className="gl-btn" type="button" onClick={() => setShowHistory((v) => !v)}>{showHistory ? "Hide" : "Show"}</button>
                  </div>
                  {showHistory ? (
                    <div className="gl-summary" style={{ marginTop: 10 }}>
                      <div className="gl-card-head">
                        <h3 className="gl-card-title">Month-to-Date Savings (Demo)</h3>
                        <span className="gl-pill">{monthKeyLocal()}</span>
                      </div>
                      {monthlySavings.trips === 0 ? (
                        <p className="gl-muted">No runs yet this month. Run pricing to start tracking savings.</p>
                      ) : (
                        <div className="gl-summary">
                          <div className="gl-summary-row"><span className="gl-muted">Trips</span><span>{monthlySavings.trips}</span></div>
                          <div className="gl-summary-row"><span className="gl-muted">Preferred store</span><span>{monthlySavings.preferredStoreName}</span></div>
                          <div className="gl-summary-row"><span className="gl-muted">If always preferred</span><span>${money2(monthlySavings.preferredTotal)}</span></div>
                          <div className="gl-summary-row"><span className="gl-muted">With app choices</span><span>${money2(monthlySavings.actualTotal)}</span></div>
                          <div className="gl-summary-row gl-summary-total"><span>Savings</span><span>${money2(monthlySavings.savings)}</span></div>
                          <p className="gl-note">Demo math: compares your preferred store to the best store per run.</p>
                        </div>
                      )}
                      <div className="gl-divider" />
                      <div className="gl-card-head">
                        <h3 className="gl-card-title">Savings History</h3>
                        <span className="gl-muted">Last {recentSavings.length || 0} runs</span>
                      </div>
                      {recentSavings.length === 0 ? (
                        <p className="gl-muted">No history yet. Run pricing to see history here.</p>
                      ) : (
                        <div className="gl-list">
                          {recentSavings.map((e) => (
                            <div key={e.id} className="gl-row">
                              <div className="gl-row-main">
                                <div className="gl-row-name">{e.dayKey}</div>
                                <div className="gl-row-meta">Preferred: {e.preferredStoreName} • Actual: {e.actualStoreName}</div>
                              </div>
                              <div className="gl-row-actions">
                                <span className="gl-pill">Save ${money2(e.savings)}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : null}
                  <p className="gl-muted">Next phase: connect real store pricing APIs + routing rules.</p>
                </div>
              )}
            </div>

            <div className="gl-card">
              <h3 className="gl-card-title">Payment (Optional)</h3>
              <p className="gl-muted">Connect payment later to speed up checkout.</p>
              <div className="gl-list">
                <label className="gl-row">
                  <div className="gl-row-main">
                    <div className="gl-row-name">Save card securely</div>
                    <div className="gl-row-meta">Encrypted • PCI compliant</div>
                  </div>
                  <div className="gl-row-actions">
                    <button className="gl-btn" type="button" disabled>Coming soon</button>
                  </div>
                </label>
              </div>
            </div>

            <div className="gl-panel-footer">
              <button className="gl-btn gl-btn-ghost" type="button" onClick={prev}>← Back</button>
              <button className="gl-btn gl-btn-primary" type="button" onClick={() => nav("/app")}>Done</button>
            </div>
          </div>
        </div>
      </section>

      <footer className="gl-footer">
        <span className="gl-muted">Saved automatically • {allItems.length} unique items</span>
      </footer>

      <ConciergeIntro open={introOpen} onClose={handleIntroClose} />
    </div>
  );
}
