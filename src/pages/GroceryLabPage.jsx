import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { readJSON, writeJSON, nowISO } from "../utils/Storage";
import "../styles/GroceryLabPage.css";

const STRATEGY_KEY = "grocery.strategy.v1";

const STORES = [
  { id: "costco", name: "Costco" },
  { id: "walmart", name: "Walmart" },
  { id: "aldi", name: "ALDI" },
  { id: "target", name: "Target" },
  { id: "kroger", name: "Kroger" },
];

export default function GroceryLabPage() {
  const nav = useNavigate();

  const saved = useMemo(() => readJSON(STRATEGY_KEY, null), []);

  const [stepIndex, setStepIndex] = useState(0);
  const [lane, setLane] = useState(saved?.lane || "auto-multi");
  const [includedStoreIds, setIncludedStoreIds] = useState(
    Array.isArray(saved?.includedStoreIds) && saved.includedStoreIds.length
      ? saved.includedStoreIds
      : STORES.map((s) => s.id)
  );
  const [fulfillment, setFulfillment] = useState(saved?.fulfillment || "pickup");
  const [deliveryPlan, setDeliveryPlan] = useState(saved?.deliveryPlan || "self");

  // Steps MUST match rendered panels (no phantom steps)
  const steps = [
    { id: "lane", title: "Strategy Type" },
    { id: "stores", title: "Select Stores" },
    { id: "fulfillment", title: "Fulfillment Mode" },
    { id: "review", title: "Final Review" },
  ];
  const stepCount = steps.length;

  const goNext = () => setStepIndex((p) => Math.min(p + 1, stepCount - 1));
  const goPrev = () => setStepIndex((p) => Math.max(p - 1, 0));

  function pickAndAdvance(setter, value) {
    setter(value);
    window.setTimeout(() => {
      setStepIndex((p) => Math.min(p + 1, stepCount - 1));
    }, 150);
  }

  // Never allow "0 stores" (fallback to all)
  useEffect(() => {
    if (!includedStoreIds.length) {
      setIncludedStoreIds(STORES.map((s) => s.id));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [includedStoreIds.length]);

  // Persist strategy
  useEffect(() => {
    writeJSON(STRATEGY_KEY, {
      lane,
      includedStoreIds,
      fulfillment,
      deliveryPlan,
      updatedAt: nowISO(),
    });
  }, [lane, includedStoreIds, fulfillment, deliveryPlan]);

  // Toggle store include/exclude
  function toggleStore(id) {
    setIncludedStoreIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  const statusLabel = `${lane === "auto-multi" ? "Multi-Store" : "Single Store"} · ${fulfillment}`;

  return (
    <div className="gl-shell gl-page">
      <section className="gl-top">
        <div>
          <p className="kicker">Lab · Grocery Routing</p>
          <h1 className="h1">Grocery Lab</h1>
          <p className="sub">Answer a few quick questions — 3C locks your cart strategy.</p>
        </div>

        <div className="gl-pill glass">
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

        <div className="gl-stage">
<div
  className="gl-track"
  style={{
    width: `${stepCount * 100}%`,
    transform: `translateX(-${stepIndex * 100}%)`,
  }}
>
          >
            {/* PANEL 1: LANE */}
            <div className="gl-panel">
              <h2 className="gl-h2">Choose your lane</h2>
              <p className="small">This controls whether 3C splits items across stores or keeps you at one store.</p>

              <div className="gl-choice-grid">
                <button
                  type="button"
                  className={`gl-choice glass-inner ${lane === "auto-multi" ? "on" : ""}`}
                  onClick={() => pickAndAdvance(setLane, "auto-multi")}
                >
                  <div className="gl-choice-title">Multiple Stores</div>
                  <div className="gl-choice-desc">
                    Best overall value. 3C routes each item to the best store.
                  </div>
                </button>

                <button
                  type="button"
                  className={`gl-choice glass-inner ${lane === "single-store" ? "on" : ""}`}
                  onClick={() => pickAndAdvance(setLane, "single-store")}
                >
                  <div className="gl-choice-title">Single Store</div>
                  <div className="gl-choice-desc">
                    Simplest trip. 3C selects the best one-store total.
                  </div>
                </button>
              </div>

              <div className="gl-nav">
                <button className="btn btn-ghost" disabled>
                  Back
                </button>
                <button className="btn btn-secondary" onClick={goNext}>
                  Next
                </button>
              </div>
            </div>

            {/* PANEL 2: STORES */}
            <div className="gl-panel">
              <h2 className="gl-h2">Which stores are in play?</h2>
              <p className="small">Tap to include/exclude. If you exclude everything, 3C auto-restores all stores.</p>

              <div className="gl-store-row">
                {STORES.map((s) => {
                  const on = includedStoreIds.includes(s.id);
                  return (
                    <button
                      key={s.id}
                      type="button"
                      className={`btn ${on ? "btn-primary" : "btn-ghost"} gl-store-btn`}
                      onClick={() => toggleStore(s.id)}
                    >
                      {on ? s.name : `Excluded: ${s.name}`}
                    </button>
                  );
                })}
              </div>

              <div className="gl-nav">
                <button className="btn btn-ghost" onClick={goPrev}>
                  Back
                </button>
                <button className="btn btn-secondary" onClick={goNext}>
                  Next
                </button>
              </div>
            </div>

            {/* PANEL 3: FULFILLMENT */}
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
                <button className="btn btn-ghost" onClick={goPrev}>
                  Back
                </button>
                <button className="btn btn-secondary" onClick={goNext}>
                  Next
                </button>
              </div>
            </div>

            {/* PANEL 4: REVIEW */}
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

              <div className="gl-nav">
                <button className="btn btn-ghost" onClick={goPrev}>
                  Back
                </button>
                <button className="btn btn-primary" onClick={() => nav("/app")}>
                  Save & Return to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="gl-bottom">
          <button className="btn btn-secondary" onClick={() => setStepIndex(0)}>
            Change Strategy
          </button>
          <button className="btn btn-secondary" onClick={() => nav("/app/settings")}>
            Settings
          </button>
        </div>
      </div>
    </div>
  );
}
