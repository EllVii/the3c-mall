// src/pages/GroceryLabPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { readJSON, writeJSON, safeId } from "../utils/Storage";
import "../styles/GroceryLabPage.css";

const STORAGE_KEY = "gl.strategy.v1";

const STORES = ["Costco", "Walmart", "ALDI", "Target", "Kroger"];

/** Demo items until real product/catalog APIs exist */
const DEMO_ITEMS = [
  { id: "i1", name: "Chicken thighs", category: "Meat", qty: 2, unit: "lb" },
  { id: "i2", name: "Ground beef 90/10", category: "Meat", qty: 3, unit: "lb" },
  { id: "i3", name: "Eggs", category: "Protein", qty: 2, unit: "dozen" },
  { id: "i4", name: "Greek yogurt", category: "Dairy", qty: 1, unit: "tub" },
  { id: "i5", name: "Rice", category: "Pantry", qty: 1, unit: "bag" },
  { id: "i6", name: "Broccoli", category: "Produce", qty: 2, unit: "head" },
];

/** Fake prices. Real pricing comes from store APIs (not AI alone). */
const DEMO_PRICES = {
  Costco: { i1: 8.5, i2: 14.2, i3: 6.4, i4: 7.5, i5: 9.0, i6: 5.2 },
  Walmart: { i1: 9.2, i2: 12.8, i3: 6.0, i4: 5.9, i5: 6.7, i6: 4.8 },
  ALDI: { i1: 8.9, i2: 13.1, i3: 5.7, i4: 5.4, i5: 6.2, i6: 4.2 },
  Target: { i1: 10.2, i2: 14.8, i3: 6.9, i4: 6.6, i5: 7.9, i6: 5.1 },
  Kroger: { i1: 9.7, i2: 13.9, i3: 6.2, i4: 6.1, i5: 7.1, i6: 4.9 },
};

const DEFAULT_STRATEGY = {
  fulfillment: "in-store", // in-store | pickup | delivery
  lane: "auto-multi", // auto-multi | single-store
  blockedStores: [],
  deliveryPlan: "self", // self | credit
  createdAt: null,
};

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

export default function GroceryLabPage() {
  const nav = useNavigate();

  // Strategy state (what we save)
  const [strategy, setStrategy] = useState(() => {
    const saved = readJSON(STORAGE_KEY, null);
    return saved ? saved : { ...DEFAULT_STRATEGY, createdAt: new Date().toISOString() };
  });

  // Wizard state (UI flow)
  const [step, setStep] = useState(0); // 0..3
  const [direction, setDirection] = useState("next"); // for slide animation
  const [showCompare, setShowCompare] = useState(false);

  const items = DEMO_ITEMS;

  // Persist strategy
  useEffect(() => {
    writeJSON(STORAGE_KEY, strategy);
  }, [strategy]);

  // Derived store list
  const activeStores = useMemo(() => {
    const filtered = STORES.filter((s) => !strategy.blockedStores.includes(s));
    return filtered.length ? filtered : STORES;
  }, [strategy.blockedStores]);

  // Single-store ranking
  const singleStoreRanking = useMemo(() => {
    const totals = activeStores.map((store) => {
      const total = items.reduce((sum, it) => sum + (DEMO_PRICES[store]?.[it.id] || 0), 0);
      return { store, total };
    });
    totals.sort((a, b) => a.total - b.total);
    return totals;
  }, [activeStores, items]);

  const bestSingle = singleStoreRanking[0]?.store || "Walmart";

  // Multi-store auto allocation
  const autoAllocation = useMemo(() => {
    const perItem = items.map((it) => {
      let best = { store: activeStores[0], price: Infinity };
      for (const s of activeStores) {
        const p = DEMO_PRICES[s]?.[it.id] ?? Infinity;
        if (p < best.price) best = { store: s, price: p };
      }
      return { ...it, chosenStore: best.store, price: best.price };
    });

    const grouped = {};
    perItem.forEach((x) => {
      grouped[x.chosenStore] = grouped[x.chosenStore] || [];
      grouped[x.chosenStore].push(x);
    });

    const total = perItem.reduce((sum, x) => sum + (Number.isFinite(x.price) ? x.price : 0), 0);
    return { perItem, grouped, total };
  }, [activeStores, items]);

  // Wizard steps definition
  const steps = useMemo(() => {
    return [
      {
        id: "lane-first",
        title: "How would you like to shop today?",
        subtitle: "We’ll keep it simple. Pick your lane first—then we’ll show store options that fit.",
        render: () => (
          <div className="gl-options">
            <button
              className="btn btn-primary"
              onClick={() => chooseAndAdvance({ lane: "auto-multi" })}
            >
              Multi-store (best overall cart)
            </button>

            <button
              className="btn btn-secondary"
              onClick={() => chooseAndAdvance({ lane: "single-store" })}
            >
              One store (lowest total)
            </button>

            <div className="gl-hint">
              Recommended for most people: <strong>Multi-store</strong> (we do the work, you save time + money).
            </div>
          </div>
        ),
      },
      {
        id: "stores",
        title: strategy.lane === "single-store" ? "Choose your store" : "Stores we can use",
        subtitle:
          strategy.lane === "single-store"
            ? "Pick one store you like. We’ll still show the best total by store so you can decide fast."
            : "You don’t have to pick stores. But if you *want* control, choose allowed stores or exclude ones you hate.",
        render: () => (
          <div className="gl-options">
            {strategy.lane === "single-store" ? (
              <div className="gl-store-grid">
                {STORES.map((s) => (
                  <button
                    key={s}
                    className={"gl-chip " + (activeStores.includes(s) ? "is-on" : "is-off")}
                    onClick={() => {
                      // In single-store mode, “choosing store” means “block all others”
                      const blocked = STORES.filter((x) => x !== s);
                      chooseAndAdvance({ blockedStores: blocked });
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            ) : (
              <>
                <div className="gl-store-grid">
                  {STORES.map((s) => {
                    const excluded = strategy.blockedStores.includes(s);
                    return (
                      <button
                        key={s}
                        className={"gl-chip " + (excluded ? "is-off" : "is-on")}
                        onClick={() => {
                          setStrategy((prev) => ({
                            ...prev,
                            blockedStores: excluded
                              ? prev.blockedStores.filter((x) => x !== s)
                              : [...prev.blockedStores, s],
                          }));
                        }}
                      >
                        {excluded ? `Excluded: ${s}` : s}
                      </button>
                    );
                  })}
                </div>

                <div className="gl-mini">
                  Don’t see a store you use? You’ll be able to request it after the wizard.
                </div>

                <div className="gl-row">
                  <button className="btn btn-secondary" onClick={() => goNext()}>
                    Continue →
                  </button>
                </div>
              </>
            )}
          </div>
        ),
      },
      {
        id: "fulfillment",
        title: "How do you want to receive groceries?",
        subtitle: "Delivery is optional. Pick what matches your life today.",
        render: () => (
          <div className="gl-options">
            {[
              { id: "in-store", label: "In-Store (self shopper)" },
              { id: "pickup", label: "Pickup" },
              { id: "delivery", label: "Delivery" },
            ].map((x) => (
              <button
                key={x.id}
                className={"btn " + (strategy.fulfillment === x.id ? "btn-primary" : "btn-secondary")}
                onClick={() => chooseAndAdvance({ fulfillment: x.id })}
              >
                {x.label}
              </button>
            ))}

            <div className="gl-hint">
              Tip: If you’re rushed, start with <strong>Pickup</strong>—it’s usually the least chaos.
            </div>
          </div>
        ),
      },
      {
        id: "delivery-plan",
        title: "Delivery options",
        subtitle: "Only applies if you picked Delivery. Otherwise you’re done.",
        render: () => {
          if (strategy.fulfillment !== "delivery") {
            return (
              <div className="gl-options">
                <div className="gl-done">
                  ✅ You’re set. We’ll build your cart with this strategy.
                </div>
                <button className="btn btn-primary" onClick={() => setShowCompare((p) => !p)}>
                  {showCompare ? "Hide Compare" : "Compare (optional)"}
                </button>
              </div>
            );
          }

          return (
            <div className="gl-options">
              <div className="gl-row">
                <button
                  className={"btn " + (strategy.deliveryPlan === "credit" ? "btn-primary" : "btn-secondary")}
                  onClick={() => setStrategy((p) => ({ ...p, deliveryPlan: "credit" }))}
                >
                  3C Delivery Credit (monthly)
                </button>

                <button
                  className={"btn " + (strategy.deliveryPlan === "self" ? "btn-primary" : "btn-secondary")}
                  onClick={() => setStrategy((p) => ({ ...p, deliveryPlan: "self" }))}
                >
                  Pay delivery yourself
                </button>
              </div>

              <div className="gl-delivery-box">
                {strategy.deliveryPlan === "credit" ? (
                  <>
                    <div className="gl-delivery-title">Credit Plan (MVP)</div>
                    <div className="gl-mini">
                      • Monthly credit: <strong>$24.99</strong> (demo) <br />
                      • Covers delivery fees automatically <br />
                      • If fees exceed the credit, you pay only the difference <br />
                      • Multi-store supported
                    </div>
                  </>
                ) : (
                  <>
                    <div className="gl-delivery-title">Self-Pay (MVP)</div>
                    <div className="gl-mini">
                      • No monthly delivery credit <br />
                      • Delivery fees are paid to the store/service <br />
                      • Best for occasional delivery users
                    </div>
                  </>
                )}
              </div>

              <button className="btn btn-primary" onClick={() => setShowCompare((p) => !p)}>
                {showCompare ? "Hide Compare" : "Compare (optional)"}
              </button>
            </div>
          );
        },
      },
    ];
  }, [strategy.lane, strategy.fulfillment, strategy.deliveryPlan, strategy.blockedStores, activeStores]);

  const current = steps[clamp(step, 0, steps.length - 1)];

  function goPrev() {
    setDirection("prev");
    setStep((s) => clamp(s - 1, 0, steps.length - 1));
  }

  function goNext() {
    setDirection("next");
    setStep((s) => clamp(s + 1, 0, steps.length - 1));
  }

  function chooseAndAdvance(partial) {
    setStrategy((prev) => ({ ...prev, ...partial }));
    // auto-advance (v1.1)
    setTimeout(() => {
      setDirection("next");
      setStep((s) => clamp(s + 1, 0, steps.length - 1));
    }, 0);
  }

  function startOver() {
    setStrategy({ ...DEFAULT_STRATEGY, createdAt: new Date().toISOString() });
    setDirection("prev");
    setStep(0);
    setShowCompare(false);
  }

  function recommendedDefaultOneTap() {
    // One tap finishes wizard with “recommended default”
    setStrategy({
      fulfillment: "pickup",
      lane: "auto-multi",
      blockedStores: [],
      deliveryPlan: "self",
      createdAt: new Date().toISOString(),
    });
    setDirection("next");
    setStep(steps.length - 1);
  }

  const summary = useMemo(() => {
    const laneLabel = strategy.lane === "auto-multi" ? "Multi-store optimized" : "Single-store lowest total";
    const fulfillmentLabel =
      strategy.fulfillment === "in-store"
        ? "In-store"
        : strategy.fulfillment === "pickup"
        ? "Pickup"
        : "Delivery";
    const allowed = STORES.filter((s) => !strategy.blockedStores.includes(s));
    return {
      laneLabel,
      fulfillmentLabel,
      allowedStores: allowed.length ? allowed : STORES,
    };
  }, [strategy]);

  function buildOrderCTA() {
    // MVP action stub – later this triggers cart build + API calls
    alert(
      `MVP: Build order\n\nLane: ${summary.laneLabel}\nFulfillment: ${summary.fulfillmentLabel}\nStores: ${summary.allowedStores.join(
        ", "
      )}`
    );
  }

  const laneIsSingle = strategy.lane === "single-store";
  const computedTotal = laneIsSingle
    ? singleStoreRanking.find((x) => x.store === (activeStores[0] || bestSingle))?.total ?? singleStoreRanking[0]?.total ?? 0
    : autoAllocation.total;

  return (
    <section className="gl-page">
      <header className="gl-header">
        <div>
          <p className="kicker">Lab • Grocery</p>
          <h1 className="h1">Grocery Lab</h1>
          <p className="sub">
            Customer-service first: you answer a couple questions, then the app does the work.
            <br />
            <strong>Thoughtless by design.</strong>
          </p>

          <div className="nav-row">
            <button className="btn btn-secondary" onClick={() => nav("/app")}>
              ← Dashboard
            </button>
            <button className="btn btn-secondary" onClick={() => nav("/app/meal-plans")}>
              Meal Plans →
            </button>

            <button className="btn btn-primary" onClick={recommendedDefaultOneTap}>
              Recommended Default (1 tap)
            </button>

            <button className="btn btn-ghost" onClick={startOver}>
              Start Over
            </button>
          </div>
        </div>

        <div className="pill">
          <span>Strategy</span>
          <strong>{summary.laneLabel}</strong>
        </div>
      </header>

      {/* Wizard card */}
      <div className="gl-wizard">
        <div className={"gl-slide gl-" + direction} key={safeId(current.id + ":" + step)}>
          <div className="gl-card">
            <div className="gl-card-top">
              <div>
                <div className="gl-title">{current.title}</div>
                <div className="gl-subtitle">{current.subtitle}</div>
              </div>
              <div className="gl-step">
                Step <strong>{step + 1}</strong> / {steps.length}
              </div>
            </div>

            <div className="gl-body">{current.render()}</div>

            <div className="gl-footer">
              <button className="btn btn-secondary" onClick={goPrev} disabled={step === 0}>
                ← Previous
              </button>

              <div className="gl-footer-mid">
                <span className="gl-link" onClick={() => setShowCompare((p) => !p)}>
                  {showCompare ? "Hide compare" : "Compare prices"}
                </span>
              </div>

              <button className="btn btn-secondary" onClick={goNext} disabled={step === steps.length - 1}>
                Next →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results block (always visible, calm + reassuring) */}
      <div className="gl-results">
        <div className="gl-card">
          <div className="gl-results-grid">
            <div>
              <div className="gl-results-title">Your strategy (saved)</div>
              <div className="gl-mini">
                Lane: <strong>{summary.laneLabel}</strong> <br />
                Fulfillment: <strong>{summary.fulfillmentLabel}</strong>
                {strategy.fulfillment === "delivery" ? (
                  <>
                    <br />
                    Delivery plan:{" "}
                    <strong>{strategy.deliveryPlan === "credit" ? "3C Credit" : "Self-pay"}</strong>
                  </>
                ) : null}
              </div>

              <div className="gl-mini" style={{ marginTop: ".55rem" }}>
                Allowed stores: <strong>{summary.allowedStores.join(", ")}</strong>
              </div>

              <div className="nav-row" style={{ marginTop: ".85rem" }}>
                <button className="btn btn-primary" onClick={buildOrderCTA}>
                  Build Order →
                </button>
              </div>
            </div>

            <div>
              <div className="gl-results-title">Demo cart totals</div>

              {strategy.lane === "single-store" ? (
                <div className="gl-mini">
                  Best single-store: <strong>{bestSingle}</strong>
                  <div className="gl-rank">
                    {singleStoreRanking.slice(0, 5).map((x) => (
                      <div className="gl-rank-row" key={x.store}>
                        <span>{x.store}</span>
                        <strong>${x.total.toFixed(2)}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="gl-mini">
                  Multi-store total: <strong>${autoAllocation.total.toFixed(2)}</strong>
                  <div className="gl-mini" style={{ marginTop: ".5rem" }}>
                    (Demo) The app assigns each item to the lowest-price store automatically.
                  </div>
                </div>
              )}

              <div className="pill" style={{ marginTop: ".85rem" }}>
                <span>Estimated Total</span>
                <strong>${Number(computedTotal || 0).toFixed(2)}</strong>
              </div>
            </div>
          </div>
        </div>

        {showCompare && (
          <div className="gl-card" style={{ marginTop: "1rem" }}>
            <div className="gl-results-title">Compare (optional)</div>
            <div className="gl-mini">This is for “I want to see it” users. Everyone else can ignore it.</div>

            <div className="gl-table-wrap">
              <table className="gl-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    {activeStores.map((s) => (
                      <th key={s}>{s}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {items.map((it) => (
                    <tr key={it.id}>
                      <td className="gl-td-strong">{it.name}</td>
                      {activeStores.map((s) => (
                        <td key={s} className="gl-td-gold">
                          ${(DEMO_PRICES[s]?.[it.id] ?? 0).toFixed(2)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="gl-mini" style={{ marginTop: ".75rem" }}>
              Beta note: These are demo values. Real pricing requires store catalog/pricing APIs.
            </div>
          </div>
        )}

        {/* Store request panel (customer-service first) */}
        <div className="gl-card" style={{ marginTop: "1rem" }}>
          <div className="gl-results-title">Request a store</div>
          <div className="gl-mini">
            Don’t see your store? Submit it. When enough users request the same store, it becomes a priority for API support.
          </div>

          <div className="gl-request">
            <input className="input" placeholder="Type store name (ex: WinCo, H-E-B, Meijer…)" />
            <button className="btn btn-secondary" onClick={() => alert("MVP: Store request captured (wire to backend later)")}>
              Submit Request
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
