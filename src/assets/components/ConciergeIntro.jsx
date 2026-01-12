import React, { useMemo, useState } from "react";
import { nowISO, readJSON, writeJSON } from "../../utils/Storage";
import { useNavigate } from "react-router-dom";

const PROFILE_KEY = "concierge.profile.v1";
const STRATEGY_KEY = "grocery.strategy.v1";

const STORE_OPTIONS = [
  { id: "costco", name: "Costco" },
  { id: "walmart", name: "Walmart" },
  { id: "aldi", name: "ALDI" },
  { id: "target", name: "Target" },
  { id: "kroger", name: "Kroger" },
  { id: "safeway", name: "Safeway / Albertsons" },
  { id: "not_sure", name: "Not sure yet" },
];

const REASONS = [
  { id: "closest", label: "Closest" },
  { id: "quality", label: "Trust the quality" },
  { id: "rewards", label: "Rewards points" },
  { id: "consistency", label: "Consistency" },
  { id: "delivery", label: "Delivery / pickup" },
  { id: "other", label: "Other" },
];

const MODES = [
  { id: "best_price", label: "Best total price", desc: "Mix stores to save more" },
  { id: "fastest", label: "Fastest trip", desc: "One store only" },
  { id: "balanced", label: "Balanced", desc: "Mostly one store, split big saves" },
];

function loadProfile() {
  const p = readJSON(PROFILE_KEY, null);
  if (!p || typeof p !== "object") return null;
  return p;
}

function saveProfile(profile) {
  writeJSON(PROFILE_KEY, profile);
}

function updateStrategyFromProfile(profile) {
  // Map concierge answers onto grocery strategy so Grocery Lab lands in the right mode.
  const existing = readJSON(STRATEGY_KEY, null) || {};
  const shoppingMode = profile.shoppingMode === "fastest" ? "single" : "multi";
  const chosenStore = profile.defaultStoreId && profile.defaultStoreId !== "not_sure" ? profile.defaultStoreId : null;
  const allKnown = (existing.selectedStores && Array.isArray(existing.selectedStores)) ? existing.selectedStores : [];
  const baseMulti = chosenStore ? Array.from(new Set([chosenStore, ...allKnown])) : (allKnown.length ? allKnown : []);
  const selectedStores = shoppingMode === "single"
    ? (chosenStore ? [chosenStore] : (allKnown.length ? [allKnown[0]] : []))
    : (baseMulti.length ? baseMulti : []);

  writeJSON(STRATEGY_KEY, {
    ...existing,
    shoppingMode,
    selectedStores: Array.isArray(selectedStores) && selectedStores.length ? selectedStores : (existing.selectedStores || []),
    lastUpdated: nowISO(),
  });
}

export default function ConciergeIntro({ open, onClose }) {
  const nav = useNavigate();
  const prior = useMemo(() => loadProfile(), []);
  const [firstName, setFirstName] = useState(prior?.firstName || "");
  const [defaultStoreId, setDefaultStoreId] = useState(prior?.defaultStoreId || STORE_OPTIONS[0].id);
  const [shoppingMode, setShoppingMode] = useState(prior?.shoppingMode || "best_price");
  const [reasonId, setReasonId] = useState(prior?.reasonId || "closest");
  const [birthMonth, setBirthMonth] = useState(prior?.birthMonth || "");

  if (!open) return null;

  const save = () => {
    const name = firstName.trim();
    if (!name) {
      alert("Please enter your first name so we can personalize your experience.");
      return;
    }
    
    const profile = {
      firstName: name,
      defaultStoreId,
      shoppingMode,
      reasonId,
      birthMonth: birthMonth.trim(),
      createdAt: prior?.createdAt || nowISO(),
      updatedAt: nowISO(),
    };
    saveProfile(profile);
    updateStrategyFromProfile(profile);
    onClose?.();
    nav("/app/grocery-lab", { state: { from: "concierge" } });
  };

  return (
    <div className="cc-overlay" role="dialog" aria-modal="true">
      <div className="cc-backdrop" onClick={onClose} />
      <div className="cc-panel cc-panel-wide">
        <div className="cc-head">
          <div className="cc-head-left">
            <div className="cc-badge">3C</div>
            <div>
              <div className="cc-title">{firstName ? `Great to meet you, ${firstName}!` : "Let's set up your 3C"}</div>
              <div className="cc-sub">20–40 seconds · saved forever</div>
            </div>
          </div>
          <div className="cc-actions">
            <button className="btn btn-ghost cc-btn" onClick={onClose} type="button">Skip</button>
            <button className="btn btn-secondary cc-btn" onClick={onClose} type="button">Close</button>
          </div>
        </div>

        <div className="cc-body">
          {/* AI Concierge Intro */}
          <div className="cc-card" style={{ background: "rgba(126,224,255,.08)", borderColor: "rgba(126,224,255,.25)" }}>
            <div className="cc-card-title" style={{ color: "var(--blue)" }}>👋 Welcome to Your 3C Mall</div>
            <p className="small cc-copy">
              I'm your AI guide for <strong>saving money</strong>, <strong>planning meals</strong>, and <strong>staying consistent</strong>. 
              {firstName && ` Nice to meet you, ${firstName}!`}
              <br />
              Let me get to know you so I can help you best.
            </p>
          </div>

          {/* Step 1: Name (REQUIRED) */}
          <div className="cc-card">
            <div className="cc-card-title">What's your first name? <span style={{ color: "var(--gold)" }}>*</span></div>
            <input
              className="input"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="First name (required)"
              required
              autoFocus
            />
            <div className="small cc-copy">
              I'll speak to you by name and personalize every recommendation in 3C Mall.
            </div>
          </div>

          {/* Step 2: Store baseline */}
          <div className="cc-card">
            <div className="cc-card-title">Which store do you want as your default?</div>
            <div className="cc-grid cc-grid-choices">
              {STORE_OPTIONS.map((s) => (
                <button
                  key={s.id}
                  className={`cc-choice ${defaultStoreId === s.id ? "is-active" : ""}`}
                  onClick={() => setDefaultStoreId(s.id)}
                  type="button"
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <img
                      src={`/icons/stores/${s.id}.png`}
                      alt={`${s.name} logo`}
                      className="cc-choice-icon"
                      onError={(e) => { e.currentTarget.style.display = "none"; }}
                    />
                    <div className="cc-choice-title">{s.name}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Step 3: Shopping mindset */}
          <div className="cc-card">
            <div className="cc-card-title">What matters most today?</div>
            <div className="small cc-copy" style={{ marginBottom: ".7rem" }}>
              This helps me recommend the best strategy. (You can change this anytime.)
            </div>
            <div className="cc-grid cc-grid-choices">
              {MODES.map((m) => (
                <button
                  key={m.id}
                  className={`cc-choice ${shoppingMode === m.id ? "is-active" : ""}`}
                  onClick={() => setShoppingMode(m.id)}
                  type="button"
                >
                  <div className="cc-choice-title">{m.label}</div>
                  <div className="cc-choice-desc">{m.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Step 4: Reason */}
          <div className="cc-card">
            <div className="cc-card-title">
              {shoppingMode === "fastest" ? "Why this store?" : "How should I optimize?"}
            </div>
            <div className="cc-grid cc-grid-choices">
              {REASONS.map((r) => (
                <button
                  key={r.id}
                  className={`cc-choice ${reasonId === r.id ? "is-active" : ""}`}
                  onClick={() => setReasonId(r.id)}
                  type="button"
                >
                  <div className="cc-choice-title">{r.label}</div>
                </button>
              ))}
            </div>
            <div className="small cc-copy">This helps me tailor recommendations for you.</div>
          </div>

          {/* Step 4b: Optional birth month */}
          <div className="cc-card">
            <div className="cc-card-title">Birth month (optional)</div>
            <select
              className="input"
              value={birthMonth}
              onChange={(e) => setBirthMonth(e.target.value)}
            >
              <option value="">Select month...</option>
              <option value="January">January</option>
              <option value="February">February</option>
              <option value="March">March</option>
              <option value="April">April</option>
              <option value="May">May</option>
              <option value="June">June</option>
              <option value="July">July</option>
              <option value="August">August</option>
              <option value="September">September</option>
              <option value="October">October</option>
              <option value="November">November</option>
              <option value="December">December</option>
            </select>
            <div className="small cc-copy">For perks later. You can skip.</div>
          </div>

          <div className="cc-foot" style={{ justifyContent: "flex-end" }}>
            <button className="btn btn-primary" type="button" onClick={save}>
              Save & Start →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
