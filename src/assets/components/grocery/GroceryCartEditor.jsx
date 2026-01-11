import React, { useEffect, useMemo, useState } from "react";
import { readJSON, writeJSON, nowISO, safeId } from "../../../utils/Storage";

export const GROCERY_KEY = "grocery.items.v1";

const CATEGORIES = ["Meat", "Produce", "Pantry", "Dairy", "Frozen", "Other"];

function normalizeSub(raw) {
  return {
    id: raw?.id || safeId("sub"),
    name: String(raw?.name || "").trim(),
    reason: String(raw?.reason || "").trim(), // ✅ NEW
    notes: String(raw?.notes || "").trim(),
  };
}

function normalizeItem(raw) {
  const id = raw?.id || safeId("g");
  return {
    id,
    name: String(raw?.name || "").trim(),
    qty: Number(raw?.qty ?? raw?.quantity ?? 1),
    unit: String(raw?.unit || "each"),
    category: String(raw?.category || "Other"),
    notes: String(raw?.notes || ""),
    substitutions: Array.isArray(raw?.substitutions) ? raw.substitutions.map(normalizeSub) : [],
    chosenSubId: raw?.chosenSubId || null,
    updatedAt: raw?.updatedAt || nowISO(),
  };
}

function loadItems() {
  const list = readJSON(GROCERY_KEY, []);
  return Array.isArray(list) ? list.map(normalizeItem) : [];
}

function saveItems(next) {
  writeJSON(GROCERY_KEY, next.map(normalizeItem));
}

export default function GroceryCartEditor({
  title = "Cart Items",
  subtitle = "Add, edit, remove, and choose substitutions.",
  onChange,
}) {
  const [items, setItems] = useState(() => loadItems());
  const [toast, setToast] = useState("");

  useEffect(() => {
    saveItems(items);
    onChange?.(items);
  }, [items, onChange]);

  const sorted = useMemo(() => {
    return [...items].sort((a, b) => {
      const ca = (a.category || "Other").toLowerCase();
      const cb = (b.category || "Other").toLowerCase();
      if (ca !== cb) return ca.localeCompare(cb);
      return (a.name || "").localeCompare(b.name || "");
    });
  }, [items]);

  function flash(msg) {
    setToast(msg);
    window.setTimeout(() => setToast(""), 1800);
  }

  function addItem() {
    const next = [
      {
        id: safeId("g"),
        name: "",
        qty: 1,
        unit: "each",
        category: "Other",
        notes: "",
        substitutions: [],
        chosenSubId: null,
        updatedAt: nowISO(),
      },
      ...items,
    ];
    setItems(next);
    flash("Added item");
  }

  function updateItem(id, patch) {
    setItems((prev) =>
      prev.map((x) => (x.id === id ? { ...x, ...patch, updatedAt: nowISO() } : x))
    );
  }

  function removeItem(id) {
    setItems((prev) => prev.filter((x) => x.id !== id));
    flash("Removed item");
  }

  function addSubstitution(itemId) {
    const sub = { id: safeId("sub"), name: "", reason: "", notes: "" }; // ✅ NEW reason field
    setItems((prev) =>
      prev.map((x) =>
        x.id === itemId
          ? { ...x, substitutions: [...(x.substitutions || []), sub], updatedAt: nowISO() }
          : x
      )
    );
  }

  function updateSub(itemId, subId, patch) {
    setItems((prev) =>
      prev.map((x) => {
        if (x.id !== itemId) return x;
        const subs = (x.substitutions || []).map((s) => (s.id === subId ? { ...s, ...patch } : s));
        return { ...x, substitutions: subs, updatedAt: nowISO() };
      })
    );
  }

  function removeSub(itemId, subId) {
    setItems((prev) =>
      prev.map((x) => {
        if (x.id !== itemId) return x;
        const subs = (x.substitutions || []).filter((s) => s.id !== subId);
        const chosenSubId = x.chosenSubId === subId ? null : x.chosenSubId;
        return { ...x, substitutions: subs, chosenSubId, updatedAt: nowISO() };
      })
    );
  }

  function chooseSub(itemId, subId) {
    setItems((prev) => prev.map((x) => (x.id === itemId ? { ...x, chosenSubId: subId, updatedAt: nowISO() } : x)));
    flash("Substitution selected");
  }

  function clearCart() {
    setItems([]);
    flash("Cart cleared");
  }

  return (
    <div className="glass-inner" style={{ marginTop: "1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: ".75rem", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontWeight: 900, color: "var(--gold)" }}>{title}</div>
          <p className="small" style={{ marginTop: ".25rem" }}>{subtitle}</p>
          <div className="small" style={{ marginTop: ".35rem" }}>
            Items: <strong>{sorted.length}</strong>
          </div>
        </div>

        <div className="nav-row" style={{ marginTop: 0 }}>
          <button className="btn btn-primary" type="button" onClick={addItem}>+ Add Item</button>
          <button className="btn btn-ghost" type="button" onClick={clearCart} disabled={sorted.length === 0}>Clear</button>
        </div>
      </div>

      {toast ? (
        <div className="small" style={{ marginTop: ".65rem", opacity: 0.9 }}>✅ {toast}</div>
      ) : null}

      <div style={{ marginTop: ".9rem" }}>
        {sorted.map((it) => {
          const chosen = it.chosenSubId ? (it.substitutions || []).find((s) => s.id === it.chosenSubId) : null;

          return (
            <div
              key={it.id}
              style={{
                borderTop: "1px solid rgba(126,224,255,.12)",
                paddingTop: ".85rem",
                marginTop: ".85rem",
              }}
            >
              <div className="grid" style={{ gridTemplateColumns: "1.6fr .6fr .8fr", gap: ".6rem" }}>
                <div>
                  <label className="label">Item</label>
                  <input
                    className="input"
                    value={it.name}
                    onChange={(e) => updateItem(it.id, { name: e.target.value })}
                    placeholder="e.g., ground beef"
                  />
                  {chosen?.name ? (
                    <div className="small" style={{ marginTop: ".35rem", opacity: 0.85 }}>
                      Using substitution: <strong>{chosen.name}</strong>
                      {chosen.reason ? (
                        <>
                          {" "}· <span style={{ opacity: 0.85 }}>Reason:</span> <strong>{chosen.reason}</strong>
                        </>
                      ) : null}
                    </div>
                  ) : null}
                </div>

                <div>
                  <label className="label">Qty</label>
                  <input
                    className="input"
                    type="number"
                    value={Number.isFinite(it.qty) ? it.qty : 1}
                    onChange={(e) => updateItem(it.id, { qty: Number(e.target.value || 0) })}
                    min="0"
                    step="1"
                  />
                </div>

                <div>
                  <label className="label">Unit</label>
                  <input
                    className="input"
                    value={it.unit}
                    onChange={(e) => updateItem(it.id, { unit: e.target.value })}
                    placeholder="lb / oz / each"
                  />
                </div>
              </div>

              <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: ".6rem", marginTop: ".6rem" }}>
                <div>
                  <label className="label">Category</label>
                  <select
                    className="select"
                    value={it.category || "Other"}
                    onChange={(e) => updateItem(it.id, { category: e.target.value })}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label">Notes (optional)</label>
                  <input
                    className="input"
                    value={it.notes || ""}
                    onChange={(e) => updateItem(it.id, { notes: e.target.value })}
                    placeholder="e.g., organic, 90/10, brand..."
                  />
                </div>
              </div>

              {/* substitutions */}
              <div style={{ marginTop: ".7rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: ".75rem", alignItems: "center" }}>
                  <div style={{ fontWeight: 800, color: "var(--gold)" }}>Substitutions</div>
                  <div className="nav-row" style={{ marginTop: 0 }}>
                    <button className="btn btn-secondary" type="button" onClick={() => addSubstitution(it.id)}>
                      + Add Substitute
                    </button>
                    <button className="btn btn-ghost" type="button" onClick={() => removeItem(it.id)}>
                      Delete Item
                    </button>
                  </div>
                </div>

                {(it.substitutions || []).length === 0 ? (
                  <p className="small" style={{ marginTop: ".35rem", opacity: 0.75 }}>
                    No substitutes yet. Add one for allergies, dislikes, or lifestyle swaps.
                  </p>
                ) : (
                  <div style={{ marginTop: ".5rem" }}>
                    {(it.substitutions || []).map((s) => (
                      <div key={s.id} className="glass-inner" style={{ padding: ".7rem", marginTop: ".55rem" }}>
                        <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: ".6rem" }}>
                          <div>
                            <label className="label">Substitute item</label>
                            <input
                              className="input"
                              value={s.name || ""}
                              onChange={(e) => updateSub(it.id, s.id, { name: e.target.value })}
                              placeholder="e.g., turkey instead of beef"
                            />
                          </div>

                          <div>
                            <label className="label">Reason</label>
                            <input
                              className="input"
                              value={s.reason || ""}
                              onChange={(e) => updateSub(it.id, s.id, { reason: e.target.value })}
                              placeholder="Allergy / dislike / keto swap / budget swap..."
                            />
                          </div>
                        </div>

                        <div style={{ marginTop: ".6rem" }}>
                          <label className="label">Notes (optional)</label>
                          <input
                            className="input"
                            value={s.notes || ""}
                            onChange={(e) => updateSub(it.id, s.id, { notes: e.target.value })}
                            placeholder="Brand, texture, prep notes..."
                          />
                        </div>

                        <div className="nav-row" style={{ marginTop: ".55rem" }}>
                          <button
                            className={"btn " + (it.chosenSubId === s.id ? "btn-primary" : "btn-secondary")}
                            type="button"
                            onClick={() => chooseSub(it.id, s.id)}
                            disabled={!String(s.name || "").trim()}
                          >
                            {it.chosenSubId === s.id ? "Selected ✅" : "Select"}
                          </button>

                          <button className="btn btn-ghost" type="button" onClick={() => removeSub(it.id, s.id)}>
                            Remove Substitute
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <p className="small" style={{ marginTop: ".7rem", opacity: 0.65 }}>
                Updated: {it.updatedAt ? new Date(it.updatedAt).toLocaleString() : "—"}
              </p>
            </div>
          );
        })}

        {sorted.length === 0 ? (
          <div className="card" style={{ marginTop: "1rem" }}>
            <p className="sub">Cart is empty. Tap <strong>Add Item</strong> to start.</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}