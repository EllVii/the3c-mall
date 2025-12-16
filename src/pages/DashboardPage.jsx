// src/pages/DashboardPage.jsx
import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { readJSON } from "../utils/Storage";
import "../styles/DashboardPage.css";

const GL_KEY = "gl.strategy.v1";

export default function DashboardPage() {
  const nav = useNavigate();

  const gl = readJSON(GL_KEY, null);

  const glSummary = useMemo(() => {
    if (!gl) return "No strategy set yet";
    const lane = gl.lane === "auto-multi" ? "Multi-store optimized" : "Single-store total";
    const fulfillment =
      gl.fulfillment === "in-store" ? "In-store" : gl.fulfillment === "pickup" ? "Pickup" : "Delivery";
    const deliveryPlan =
      gl.fulfillment === "delivery" ? (gl.deliveryPlan === "credit" ? "3C Credit" : "Self-pay") : null;

    return `${lane} • ${fulfillment}${deliveryPlan ? ` • ${deliveryPlan}` : ""}`;
  }, [gl]);

  return (
    <section className="dash-page">
      <header className="dash-header">
        <div>
          <p className="kicker">The 3C Mall • Beta</p>
          <h1 className="h1">Dashboard</h1>
          <p className="sub">Your command center. The app does the work — you make the call.</p>
        </div>

        <div className="pill">
          <span>Grocery Strategy</span>
          <strong>{gl ? "Saved" : "Not set"}</strong>
        </div>
      </header>

      <div className="dash-grid">
        <div className="dash-card">
          <div className="dash-card-top">
            <div className="dash-tag">Meal Plans</div>
            <div className="dash-mini">Build your schedule in under a minute.</div>
          </div>
          <button className="btn btn-primary" onClick={() => nav("/app/meal-plans")}>
            Open Meal Planner →
          </button>
        </div>

        <div className="dash-card">
          <div className="dash-card-top">
            <div className="dash-tag">Grocery Lab</div>
            <div className="dash-mini">{glSummary}</div>
          </div>
          <div className="dash-row">
            <button className="btn btn-primary" onClick={() => nav("/app/grocery-lab")}>
              Open Grocery Lab →
            </button>
          </div>
        </div>

        <div className="dash-card">
          <div className="dash-card-top">
            <div className="dash-tag">PT Mode</div>
            <div className="dash-mini">Trainer dashboard skeleton (beta).</div>
          </div>
          <button className="btn btn-secondary" onClick={() => nav("/app/pt")}>
            Open PT Mode →
          </button>
        </div>

        <div className="dash-card">
          <div className="dash-card-top">
            <div className="dash-tag">Settings</div>
            <div className="dash-mini">Themes • date format • time format.</div>
          </div>
          <button className="btn btn-secondary" onClick={() => nav("/app/settings")}>
            Open Settings →
          </button>
        </div>
      </div>

      <div className="dash-card" style={{ marginTop: "1rem" }}>
        <div className="dash-tag">Concierge</div>
        <p className="dash-mini" style={{ marginTop: ".35rem" }}>
          “Help me choose” will live here. In beta we wire it to a simple helper (then to real AI later).
        </p>
        <div className="nav-row">
          <button className="btn btn-primary" onClick={() => alert("MVP: Concierge hook — coming next")}>
            Help me choose →
          </button>
          <button className="btn btn-ghost" onClick={() => alert("MVP: Feedback panel — coming next")}>
            Report a bug
          </button>
        </div>
      </div>
    </section>
  );
}
