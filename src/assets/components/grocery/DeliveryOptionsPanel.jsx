// src/components/grocery/DeliveryOptionsPanel.jsx
import React from "react";

export default function DeliveryOptionsPanel({ plan, setPlan }) {
  return (
    <div className="card">
      <h3>Delivery Options</h3>
      <div className="nav-row">
        <button
          className={"btn " + (plan === "credit" ? "btn-primary" : "btn-secondary")}
          onClick={() => setPlan("credit")}
        >
          3C Delivery Credit ($24.99)
        </button>
        <button
          className={"btn " + (plan === "self" ? "btn-primary" : "btn-secondary")}
          onClick={() => setPlan("self")}
        >
          Pay Delivery Yourself
        </button>
      </div>

      <p className="small" style={{ marginTop: ".6rem" }}>
        Delivery is always optional. You can switch anytime.
      </p>
    </div>
  );
}
