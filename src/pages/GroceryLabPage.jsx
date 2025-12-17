// src/pages/GroceryLabPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/GroceryLabPage.css";

const STRAT_KEY = "3c.grocery.strategy.v1";
const UI_KEY = "3c.grocery.ui.v1";

const STORES = ["Costco", "Walmart", "ALDI", "Target", "Kroger"];

const DEMO_ITEMS = [
  { id: "i1", name: "Chicken thighs", category: "Meat", qty: 2, unit: "lb" },
  { id: "i2", name: "Ground beef 90/10", category: "Meat", qty: 3, unit: "lb" },
  { id: "i3", name: "Eggs", category: "Protein", qty: 2, unit: "dozen" },
  { id: "i4", name: "Greek yogurt", category: "Dairy", qty: 1, unit: "tub" },
  { id: "i5", name: "Rice", category: "Pantry", qty: 1, unit: "bag" },
  { id: "i6", name: "Broccoli", category: "Produce", qty: 2, unit: "head" },
];

const DEMO_PRICES = {
  Costco: { i1: 8.5, i2: 14.2, i3: 6.4, i4: 7.5, i5: 9.0, i6: 5.2 },
  Walmart: { i1: 9.2, i2: 12.8, i3: 6.0, i4: 5.9, i5: 6.7, i6: 4.8 },
  ALDI: { i1: 8.9, i2: 13.1, i3: 5.7, i4: 5.4, i5: 6.2, i6: 4.2 },
  Target: { i1: 10.2, i2: 14.8, i3: 6.9, i4: 6.6, i5: 7.9, i6: 5.1 },
  Kroger: { i1: 9.7, i2: 13.9, i3: 6.2, i4: 6.1, i5: 7.1, i6: 4.9 },
};

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function GroceryLabPage() {
  const nav = useNavigate();

  // steps:
  // 0 welcome
  // 1 lane
  // 2 fulfillment (+ deliveryPlan)
  // 3 stores + request
  // 4 results
  const [step, setStep] = useState(0);

  const [lane, setLane] = useState("auto-multi"); // auto-multi | single-store
  const [fulfillment, setFulfillment] = useState("in-store"); // in-store | pickup | delivery
  const [deliveryPlan, setDeliveryPlan] = useState("credit"); // credit | self
  const [blockedStores, setBlockedStores] = useState([]);
  const [requestStore, setRequestStore] = useState("");

  const [dicePick, setDicePick] = useState(null);

  // Load persisted
  useEffect(() => {
    const saved = readJSON(STRAT_KEY, null);
    if (saved) {
      setLane(saved.lane ?? "auto-multi");
      setFulfillment(saved.fulfillment ?? "in-store");
      setDeliveryPlan(saved.deliveryPlan ?? "credit");
      setBlockedStores(Array.isArray(saved.blockedStores) ? saved.blockedStores : []);
    }
    const ui = readJSON(UI_KEY, null);
    if (ui && typeof ui.step === "number") setStep(clamp(ui.step, 0, 4));
  }, []);

  // Persist strategy
  useEffect(() => {
    writeJSON(STRAT_KEY, { lane, fulfillment, deliveryPlan, blockedStores });
  }, [lane, fulfillment, deliveryPlan, blockedStores]);

  // Persist UI step
  useEffect(() => {
    writeJSON(UI_KEY, { step });
  }, [step]);

  const items = DEMO_ITEMS;

  const activeStores = useMemo(() => {
    const list = STORES.filter((s) => !blockedStores.includes(s));
    return list.length ? list : STORES;
  }, [blockedStores]);

  const singleStoreRanking = useMemo(() => {
    const totals = activeStores.map((s) => {
      const total = items.reduce((sum, it) => sum + (DEMO_PRICES[s]?.[it.id] || 0), 0);
      return { store: s, total };
    });
    totals.sort((a, b) => a.total - b.total);
    return totals;
  }, [activeStores, items]);

  const bestSingle = singleStoreRanking[0]?.store || "Walmart";

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

  const todaysPlan = useMemo(() => {
    if (lane === "single-store") {
      const total = singleStoreRanking[0]?.total ?? 0;
      return {
        type: "single",
        store: bestSingle,
        total,
        items: items.map((it) => ({
          ...it,
          chosenStore: bestSingle,
          price: DEMO_PRICES[bestSingle]?.[it.id] ?? 0,
        })),
      };
    }
    return {
      type: "multi",
      grouped: autoAllocation.grouped,
      total: autoAllocation.total,
    };
  }, [lane, bestSingle, singleStoreRanking, autoAllocation, items]);

  function toggleBlock(store) {
    setBlockedStores((prev) =>
      prev.includes(store) ? prev.filter((s) => s !== store) : [...prev, store]
    );
  }

  function startOver() {
    setLane("auto-multi");
    setFulfillment("in-store");
    setDeliveryPlan("credit");
    setBlockedStores([]);
    setRequestStore("");
    setDicePick(null);
    setStep(0);
    writeJSON(UI_KEY, { step: 0 });
  }

  function recommendedDefault() {
    setLane("auto-multi");
    setFulfillment("in-store");
    setDeliveryPlan("credit");
    setBlockedStores([]);
    setRequestStore("");
    setDicePick(null);
    setStep(4);
  }

  function next() {
    setStep((s) => clamp(s + 1, 0, 4));
  }
  function prev() {
    setStep((s) => clamp(s - 1, 0, 4));
  }

  // Auto-advance picks (NO blank card)
  function pickLane(v) {
    setLane(v);
    setStep(2);
  }

  function pickFulfillment(v) {
    setFulfillment(v);
    setStep(3);
  }

  function rollDice() {
    const lanePick = pickRandom(["auto-multi", "single-store"]);
    const fulfillPick = pickRandom(["in-store", "pickup", "delivery"]);
    const planPick = fulfillPick === "delivery" ? pickRandom(["credit", "self"]) : "credit";

    const suggestion = {
      lane: lanePick,
      fulfillment: fulfillPick,
      deliveryPlan: planPick,
      why:
        fulfillPick === "delivery"
          ? "Convenience day. Let the app route the cart and keep it simple."
          : fulfillPick === "pickup"
          ? "Fast day. Pickup keeps it efficient."
          : "Control day. In-store with the app doing the math.",
    };

    setDicePick(suggestion);
    setLane(suggestion.lane);
    setFulfillment(suggestion.fulfillment);
    setDeliveryPlan(suggestion.deliveryPlan);
    setStep(4);
  }

  const laneLabel =
    lane === "auto-multi"
      ? "Multi-store optimized (3C splits items automatically)"
      : "One-store lowest total (3C picks best single store)";

  const fulfillLabel =
    fulfillment === "delivery" ? "Delivery" : fulfillment === "pickup" ? "Pickup" : "In-Store";

  return (
    <section className="page gl-shell">
      {/* Keep header CLEAN: no buttons row */}
      <header className="gl-top">
        <div>
          <p className="kicker">LAB · GROCERY</p>
          <h1 className="h1">Grocery Lab</h1>
          <p className="sub">
            Answer a few quick prompts — 3C builds the shopping strategy and saves it to your device.
          </p>
        </div>

        <div className="pill gl-pill">
          <span>Strategy</span>
          <strong>
            {lane === "auto-multi" ? "Multi-store" : "Single-store"} · {fulfillLabel}
          </strong>
        </div>
      </header>

      {/* Wizard Card */}
      <div className="card glass gl-wizard">
        <div className="gl-wiz-head">
          <div className="gl-dots">
            {[0, 1, 2, 3, 4].map((n) => (
              <span key={n} className={"gl-dot " + (step === n ? "on" : "")} />
            ))}
          </div>

          <div className="nav-row" style={{ gap: ".5rem", margin: 0 }}>
            <button className="btn btn-secondary" onClick={startOver}>
              Start Over
            </button>
            <button className="btn btn-primary" onClick={recommendedDefault}>
              Recommended Default
            </button>
          </div>
        </div>

        <div className="gl-stage glass-inner">
          <div className="gl-track" style={{ transform: `translateX(-${step * 100}%)` }}>
            {/* STEP 0 */}
            <div className="gl-panel">
              <div className="gl-tag">STEP 0</div>
              <h2 className="gl-h2">Welcome</h2>
              <p className="small">Pick the vibe today — fast, simple, and no confusion.</p>

              <div className="grid">
                <div className="card glass-inner" style={{ padding: "1rem" }}>
                  <div className="gl-mini-title">Today’s Planned</div>
                  <p className="small" style={{ marginTop: ".35rem" }}>
                    Quick recommendation. Applies in one tap.
                  </p>
                  <div className="nav-row">
                    <button className="btn btn-primary" onClick={rollDice}>
                      Roll the Dice
                    </button>
                  </div>

                  {dicePick && (
                    <div className="small" style={{ marginTop: ".75rem" }}>
                      Suggestion:{" "}
                      <strong style={{ color: "var(--gold)" }}>
                        {dicePick.lane === "auto-multi" ? "Multi-store" : "Single-store"}
                      </strong>{" "}
                      · <strong style={{ color: "var(--blue)" }}>{dicePick.fulfillment}</strong>
                      <div className="small" style={{ marginTop: ".35rem", color: "var(--muted)" }}>
                        {dicePick.why}
                      </div>
                    </div>
                  )}
                </div>

                <div className="card glass-inner" style={{ padding: "1rem" }}>
                  <div className="gl-mini-title">Manual (still easy)</div>
                  <p className="small" style={{ marginTop: ".35rem" }}>
                    Step-by-step control.
                  </p>
                  <div className="nav-row">
                    <button className="btn btn-secondary" onClick={() => setStep(1)}>
                      Start Wizard
                    </button>
                  </div>
                </div>
              </div>

              <div className="gl-nav">
                <button className="btn btn-secondary" disabled>
                  Previous
                </button>
                <button className="btn btn-primary" onClick={() => setStep(1)}>
                  Next
                </button>
              </div>
            </div>

            {/* STEP 1 */}
            <div className="gl-panel">
              <div className="gl-tag">STEP 1</div>
              <h2 className="gl-h2">How would you like to shop today?</h2>
              <p className="small">One store, or let 3C optimize across stores.</p>

              <div className="gl-choice-grid">
                <button
                  className={"gl-choice glass-inner " + (lane === "auto-multi" ? "on" : "")}
                  onClick={() => pickLane("auto-multi")}
                >
                  <div className="gl-choice-title">Multiple stores</div>
                  <div className="gl-choice-desc">3C splits items automatically for best value.</div>
                </button>

                <button
                  className={"gl-choice glass-inner " + (lane === "single-store" ? "on" : "")}
                  onClick={() => pickLane("single-store")}
                >
                  <div className="gl-choice-title">One single store</div>
                  <div className="gl-choice-desc">3C picks the lowest total store.</div>
                </button>
              </div>

              <div className="gl-nav">
                <button className="btn btn-secondary" onClick={prev}>
                  Previous
                </button>
                <button className="btn btn-primary" onClick={next}>
                  Next
                </button>
              </div>
            </div>

            {/* STEP 2 */}
            <div className="gl-panel">
              <div className="gl-tag">STEP 2</div>
              <h2 className="gl-h2">How do you want to get groceries?</h2>
              <p className="small">Delivery is optional — you’re never forced into it.</p>

              <div className="gl-choice-grid">
                {[
                  { id: "in-store", title: "In-Store", desc: "You shop. 3C does the math." },
                  { id: "pickup", title: "Pickup", desc: "Same strategy with pickup." },
                  { id: "delivery", title: "Delivery", desc: "Choose credit plan or self-pay." },
                ].map((x) => (
                  <button
                    key={x.id}
                    className={"gl-choice glass-inner " + (fulfillment === x.id ? "on" : "")}
                    onClick={() => pickFulfillment(x.id)}
                  >
                    <div className="gl-choice-title">{x.title}</div>
                    <div className="gl-choice-desc">{x.desc}</div>
                  </button>
                ))}
              </div>

              {fulfillment === "delivery" && (
                <div className="card glass-inner" style={{ marginTop: "1rem", padding: "1rem" }}>
                  <div className="gl-mini-title">Delivery Options</div>
                  <p className="small" style={{ marginTop: ".35rem" }}>
                    Alpha demo: choose how delivery fees are handled.
                  </p>

                  <div className="nav-row">
                    <button
                      className={"btn " + (deliveryPlan === "credit" ? "btn-primary" : "btn-secondary")}
                      onClick={() => setDeliveryPlan("credit")}
                    >
                      3C Delivery Credit
                    </button>
                    <button
                      className={"btn " + (deliveryPlan === "self" ? "btn-primary" : "btn-secondary")}
                      onClick={() => setDeliveryPlan("self")}
                    >
                      Pay Delivery Yourself
                    </button>
                  </div>

                  <div className="small" style={{ marginTop: ".65rem" }}>
                    {deliveryPlan === "credit"
                      ? "Credit plan: monthly amount; if fees exceed credit, you pay the difference."
                      : "Self-pay: you pay delivery fees per store directly (no monthly credit)."}
                  </div>
                </div>
              )}

              <div className="gl-nav">
                <button className="btn btn-secondary" onClick={prev}>
                  Previous
                </button>
                <button className="btn btn-primary" onClick={next}>
                  Next
                </button>
              </div>
            </div>

            {/* STEP 3 */}
            <div className="gl-panel">
              <div className="gl-tag">STEP 3</div>
              <h2 className="gl-h2">Stores</h2>
              <p className="small">Optional: exclude stores you won’t use.</p>

              <div className="gl-store-row">
                {STORES.map((s) => (
                  <button
                    key={s}
                    className={"btn " + (blockedStores.includes(s) ? "btn-ghost" : "btn-secondary")}
                    onClick={() => toggleBlock(s)}
                  >
                    {blockedStores.includes(s) ? `Excluded: ${s}` : s}
                  </button>
                ))}
              </div>

              <div className="card glass-inner" style={{ marginTop: "1rem", padding: "1rem" }}>
                <div className="gl-mini-title">Don’t see your store?</div>
                <p className="small" style={{ marginTop: ".35rem" }}>
                  Request it — we capture it for Beta.
                </p>

                <label className="label">Store name</label>
                <input
                  className="input"
                  value={requestStore}
                  onChange={(e) => setRequestStore(e.target.value)}
                  placeholder="Example: WinCo, Safeway, H-E-B..."
                />

                <div className="nav-row">
                  <button
                    className="btn btn-primary"
                    onClick={() =>
                      alert(requestStore ? `Request saved (demo): ${requestStore}` : "Type a store name first.")
                    }
                  >
                    Submit Request
                  </button>
                </div>
              </div>

              <div className="gl-nav">
                <button className="btn btn-secondary" onClick={prev}>
                  Previous
                </button>
                <button className="btn btn-primary" onClick={() => setStep(4)}>
                  Finish
                </button>
              </div>
            </div>

            {/* STEP 4 */}
            <div className="gl-panel">
              <div className="gl-tag">RESULT</div>
              <h2 className="gl-h2">Your Cart Strategy</h2>
              <p className="small">
                Lane: <strong style={{ color: "var(--gold)" }}>{laneLabel}</strong> · Fulfillment:{" "}
                <strong style={{ color: "var(--blue)" }}>{fulfillLabel}</strong>
              </p>

              <div className="grid" style={{ marginTop: "1rem" }}>
                {/* LEFT: Plan */}
                <div className="card glass-inner" style={{ padding: "1rem" }}>
                  <div className="gl-mini-title">Today’s Plan</div>
                  <p className="small" style={{ marginTop: ".35rem" }}>
                    Demo prices for Alpha testing.
                  </p>

                  {todaysPlan.type === "single" ? (
                    <>
                      <div className="gl-summary-line">
                        <span>Store</span>
                        <strong style={{ color: "var(--blue)" }}>{todaysPlan.store}</strong>
                      </div>
                      <div className="gl-summary-line">
                        <span>Total</span>
                        <strong style={{ color: "var(--gold)" }}>${Number(todaysPlan.total).toFixed(2)}</strong>
                      </div>

                      <div className="gl-list">
                        {todaysPlan.items.map((it) => (
                          <div key={it.id} className="gl-row">
                            <span>{it.name}</span>
                            <strong style={{ color: "var(--gold)" }}>
                              ${(DEMO_PRICES[todaysPlan.store]?.[it.id] ?? 0).toFixed(2)}
                            </strong>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="gl-summary-line">
                        <span>Total</span>
                        <strong style={{ color: "var(--gold)" }}>${todaysPlan.total.toFixed(2)}</strong>
                      </div>

                      <div className="gl-list">
                        {Object.keys(todaysPlan.grouped).map((store) => (
                          <div key={store} style={{ marginBottom: ".7rem" }}>
                            <div className="gl-store-title">{store}</div>
                            {todaysPlan.grouped[store].map((x) => (
                              <div key={x.id} className="gl-row">
                                <span>{x.name}</span>
                                <strong style={{ color: "var(--gold)" }}>
                                  {Number.isFinite(x.price) ? `$${x.price.toFixed(2)}` : "—"}
                                </strong>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  <div className="nav-row" style={{ marginTop: ".9rem" }}>
                    <button
                      className="btn btn-primary"
                      onClick={() => alert(`Alpha demo: Build ${fulfillLabel} order(s) with this plan`)}
                    >
                      Build {fulfillLabel} Order
                    </button>
                  </div>
                </div>

                {/* RIGHT: Dice */}
                <div className="card glass-inner" style={{ padding: "1rem" }}>
                  <div className="gl-mini-title">Try a different vibe</div>
                  <p className="small" style={{ marginTop: ".35rem" }}>
                    One tap suggests + applies a new strategy.
                  </p>

                  <div className="nav-row">
                    <button className="btn btn-primary" onClick={rollDice}>
                      Roll Again
                    </button>
                    <button className="btn btn-secondary" onClick={() => setStep(1)}>
                      Change Manually
                    </button>
                  </div>

                  {dicePick ? (
                    <div className="card glass-inner" style={{ marginTop: "1rem", padding: "1rem" }}>
                      <div className="small">
                        Suggestion:
                        <div style={{ marginTop: ".35rem" }}>
                          <strong style={{ color: "var(--gold)" }}>
                            {dicePick.lane === "auto-multi" ? "Multi-store" : "Single-store"}
                          </strong>{" "}
                          · <strong style={{ color: "var(--blue)" }}>{dicePick.fulfillment}</strong>
                        </div>
                        <div className="small" style={{ marginTop: ".55rem", color: "var(--muted)" }}>
                          {dicePick.why}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="small" style={{ marginTop: "1rem", color: "var(--muted2)" }}>
                      Roll once to generate a suggestion.
                    </div>
                  )}

                  <div className="small" style={{ marginTop: "1rem" }}>
                    Active stores: <strong style={{ color: "var(--blue)" }}>{activeStores.join(", ")}</strong>
                  </div>
                </div>
              </div>

              <div className="gl-nav">
                <button className="btn btn-secondary" onClick={() => setStep(3)}>
                  Previous
                </button>
                <button className="btn btn-primary" onClick={() => alert("Alpha demo: Strategy saved to device")}>
                  Save Strategy
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar = app-like navigation */}
      <div className="gl-bottom">
        <button className="btn btn-secondary" onClick={() => nav("/app")}>
          Dashboard
        </button>
        <button className="btn btn-secondary" onClick={() => setStep(1)}>
          Change Strategy
        </button>
        <button className="btn btn-secondary" onClick={() => nav("/app/settings")}>
          Settings
        </button>
      </div>
    </section>
  );
}
