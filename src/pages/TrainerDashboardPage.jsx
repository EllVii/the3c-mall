// src/pages/TrainerDashboardPage.jsx
import React, { useState } from "react";
import "../styles/TrainerDashboardPage.css";

export default function TrainerDashboardPage() {
  const [selectedClient, setSelectedClient] = useState("Ava V.");

  return (
    <section className="pt-page">
      <header className="pt-header">
        <h1 className="pt-title">PT Dashboard</h1>
        <div className="pt-meta-pill"><span>Plan</span><strong>PT SOLO (1-10 Clients)</strong></div>
      </header>
      <div className="pt-grid">
        <aside className="pt-card">
          <h2 className="pt-card-title">Your Roster</h2>
          <button className="pt-client-row selected">Ava V. (Echo: On Fire)</button>
          <button className="pt-client-row">Jordan S. (Echo: Depleted)</button>
        </aside>
      </div>
    </section>
  );
}