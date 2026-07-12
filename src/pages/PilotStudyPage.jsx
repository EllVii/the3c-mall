import React, { useEffect, useState } from "react";
import {
  acceptPilotConsent,
  getPilotConsent,
  submitPilotFeedback,
  withdrawPilotConsent,
} from "../lib/apiClient.js";

const initialFeedback = {
  weekNumber: "",
  planningMinutesBefore: "",
  planningMinutesAfter: "",
  planningStressBefore: "",
  planningStressAfter: "",
  confidenceScore: "",
  timeSavedMinutes: "",
  estimatedSavingsDollars: "",
  mealCompletion: "",
  notes: "",
  technicalError: "",
};

function numberOrNull(value) {
  return value === "" ? null : Number(value);
}

export default function PilotStudyPage() {
  const [consent, setConsent] = useState(null);
  const [familyCode, setFamilyCode] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [feedback, setFeedback] = useState(initialFeedback);
  const [receipt, setReceipt] = useState({ file: null, retailer: "", receiptDate: "", requestedDollars: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function refreshConsent() {
    try {
      const result = await getPilotConsent();
      setConsent(result?.consent || null);
      setFamilyCode(result?.consent?.family_code || "");
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  useEffect(() => {
    refreshConsent();
  }, []);

  async function handleConsent(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    if (!accepted) {
      setError("Read the pilot notice and confirm voluntary participation before continuing.");
      return;
    }
    setBusy(true);
    try {
      await acceptPilotConsent(familyCode.trim(), "phase-i-v1");
      setMessage("Pilot consent recorded.");
      await refreshConsent();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleWithdraw() {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await withdrawPilotConsent();
      setMessage("Future pilot data collection has been withdrawn.");
      await refreshConsent();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleFeedback(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await submitPilotFeedback({
        weekNumber: numberOrNull(feedback.weekNumber),
        planningMinutesBefore: numberOrNull(feedback.planningMinutesBefore),
        planningMinutesAfter: numberOrNull(feedback.planningMinutesAfter),
        planningStressBefore: numberOrNull(feedback.planningStressBefore),
        planningStressAfter: numberOrNull(feedback.planningStressAfter),
        confidenceScore: numberOrNull(feedback.confidenceScore),
        timeSavedMinutes: numberOrNull(feedback.timeSavedMinutes),
        estimatedSavingsCents: feedback.estimatedSavingsDollars === "" ? null : Math.round(Number(feedback.estimatedSavingsDollars) * 100),
        mealCompletion: feedback.mealCompletion,
        notes: feedback.notes,
        technicalError: feedback.technicalError,
      });
      setFeedback(initialFeedback);
      setMessage("Weekly pilot check-in submitted.");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleReceipt(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const form = new FormData();
      form.append("receipt", receipt.file);
      form.append("retailer", receipt.retailer);
      form.append("receiptDate", receipt.receiptDate);
      form.append("requestedReimbursementCents", String(Math.round(Number(receipt.requestedDollars || 0) * 100)));
      const response = await fetch("/api/pilot/receipts", { method: "POST", credentials: "include", body: form });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || "Receipt submission failed");
      setReceipt({ file: null, retailer: "", receiptDate: "", requestedDollars: "" });
      event.currentTarget.reset();
      setMessage(`Receipt submitted for review. Reference: ${payload.receiptId}`);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  const activeConsent = consent && !consent.withdrawn_at;
  const inputStyle = { width: "100%", padding: ".75rem", border: "1px solid #cfc7b4", borderRadius: 8, boxSizing: "border-box" };
  const cardStyle = { background: "white", borderRadius: 16, padding: "1.5rem", boxShadow: "0 10px 30px rgba(0,0,0,.08)" };

  return (
    <main style={{ minHeight: "100vh", background: "#f5f1e8", padding: "2rem 1rem", color: "#1a1a1a", overflowY: "auto" }}>
      <div style={{ maxWidth: 900, margin: "0 auto", display: "grid", gap: "1.25rem" }}>
        <header>
          <p style={{ color: "#806a24", fontWeight: 800, letterSpacing: ".08em" }}>PHASE I RESEARCH PILOT</p>
          <h1>Household Grocery & Meal-Planning Feasibility Study</h1>
          <p>This page is for invited adult pilot participants. 3C Mall provides household decision support and estimates; it does not sell food, process grocery payments or SNAP benefits, provide medical care, or guarantee savings.</p>
        </header>

        {(message || error) && (
          <div role="status" style={{ ...cardStyle, background: error ? "#fff0f0" : "#edf8ef" }}>
            {error || message}
          </div>
        )}

        <section style={cardStyle}>
          <h2>1. Voluntary pilot consent</h2>
          <p>The pilot evaluates usability, planning time, planning stress, decision confidence, technical reliability, estimated-price accuracy, and receipt-supported outcomes. Participation is voluntary. You may withdraw from future collection at any time.</p>
          <p>Do not submit EBT card information, PINs, full payment-card information, bank information, unnecessary medical information, or unnecessary information identifying minors. Redact unnecessary sensitive information from receipts.</p>

          {activeConsent ? (
            <div>
              <p><strong>Consent active:</strong> {consent.consent_version} · recorded {consent.consented_at}</p>
              <p><strong>Family code:</strong> {consent.family_code || "Not assigned"}</p>
              <button type="button" onClick={handleWithdraw} disabled={busy} style={{ padding: ".75rem 1rem", borderRadius: 8, border: "1px solid #8d2525", background: "white", color: "#8d2525" }}>Withdraw from future collection</button>
            </div>
          ) : (
            <form onSubmit={handleConsent} style={{ display: "grid", gap: ".9rem" }}>
              <label>Family pilot code<input value={familyCode} onChange={(event) => setFamilyCode(event.target.value)} style={inputStyle} maxLength={40} /></label>
              <label style={{ display: "flex", gap: ".65rem", alignItems: "flex-start" }}>
                <input type="checkbox" checked={accepted} onChange={(event) => setAccepted(event.target.checked)} />
                <span>I am at least 18, understand the pilot description above, and voluntarily agree to the Phase I pilot terms provided to me.</span>
              </label>
              <button disabled={busy} style={{ padding: ".85rem 1rem", borderRadius: 8, border: 0, background: "#1a1a1a", color: "white" }}>Record consent</button>
            </form>
          )}
        </section>

        <section style={{ ...cardStyle, opacity: activeConsent ? 1 : .55 }}>
          <h2>2. Weekly check-in</h2>
          <form onSubmit={handleFeedback} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: ".9rem", pointerEvents: activeConsent ? "auto" : "none" }}>
            <label>Week number<input type="number" min="0" max="60" value={feedback.weekNumber} onChange={(event) => setFeedback({ ...feedback, weekNumber: event.target.value })} style={inputStyle} /></label>
            <label>Planning minutes before<input type="number" min="0" value={feedback.planningMinutesBefore} onChange={(event) => setFeedback({ ...feedback, planningMinutesBefore: event.target.value })} style={inputStyle} /></label>
            <label>Planning minutes after<input type="number" min="0" value={feedback.planningMinutesAfter} onChange={(event) => setFeedback({ ...feedback, planningMinutesAfter: event.target.value })} style={inputStyle} /></label>
            <label>Stress before (0–10)<input type="number" min="0" max="10" value={feedback.planningStressBefore} onChange={(event) => setFeedback({ ...feedback, planningStressBefore: event.target.value })} style={inputStyle} /></label>
            <label>Stress after (0–10)<input type="number" min="0" max="10" value={feedback.planningStressAfter} onChange={(event) => setFeedback({ ...feedback, planningStressAfter: event.target.value })} style={inputStyle} /></label>
            <label>Decision confidence (0–10)<input type="number" min="0" max="10" value={feedback.confidenceScore} onChange={(event) => setFeedback({ ...feedback, confidenceScore: event.target.value })} style={inputStyle} /></label>
            <label>Estimated minutes saved<input type="number" value={feedback.timeSavedMinutes} onChange={(event) => setFeedback({ ...feedback, timeSavedMinutes: event.target.value })} style={inputStyle} /></label>
            <label>Estimated difference ($)<input type="number" step="0.01" value={feedback.estimatedSavingsDollars} onChange={(event) => setFeedback({ ...feedback, estimatedSavingsDollars: event.target.value })} style={inputStyle} /></label>
            <label>Meal completion<select value={feedback.mealCompletion} onChange={(event) => setFeedback({ ...feedback, mealCompletion: event.target.value })} style={inputStyle}><option value="">Select</option><option>All</option><option>Most</option><option>Some</option><option>None</option></select></label>
            <label style={{ gridColumn: "1 / -1" }}>What helped or was confusing?<textarea rows="4" value={feedback.notes} onChange={(event) => setFeedback({ ...feedback, notes: event.target.value })} style={inputStyle} /></label>
            <label style={{ gridColumn: "1 / -1" }}>Technical error, if any<textarea rows="3" value={feedback.technicalError} onChange={(event) => setFeedback({ ...feedback, technicalError: event.target.value })} style={inputStyle} /></label>
            <button disabled={busy || !activeConsent} style={{ gridColumn: "1 / -1", padding: ".85rem 1rem", borderRadius: 8, border: 0, background: "#1a1a1a", color: "white" }}>Submit weekly check-in</button>
          </form>
        </section>

        <section style={{ ...cardStyle, opacity: activeConsent ? 1 : .55 }}>
          <h2>3. Optional receipt submission</h2>
          <p>A receipt is required for reimbursement review. The maximum is $500 per family and $2,500 for the entire five-family pilot. Submission does not guarantee approval.</p>
          <form onSubmit={handleReceipt} style={{ display: "grid", gap: ".9rem", pointerEvents: activeConsent ? "auto" : "none" }}>
            <label>Receipt image or PDF<input required type="file" accept="image/jpeg,image/png,image/webp,application/pdf" onChange={(event) => setReceipt({ ...receipt, file: event.target.files?.[0] || null })} style={inputStyle} /></label>
            <label>Retailer<input required value={receipt.retailer} onChange={(event) => setReceipt({ ...receipt, retailer: event.target.value })} style={inputStyle} /></label>
            <label>Receipt date<input required type="date" value={receipt.receiptDate} onChange={(event) => setReceipt({ ...receipt, receiptDate: event.target.value })} style={inputStyle} /></label>
            <label>Requested reimbursement ($)<input required type="number" min="0" max="500" step="0.01" value={receipt.requestedDollars} onChange={(event) => setReceipt({ ...receipt, requestedDollars: event.target.value })} style={inputStyle} /></label>
            <button disabled={busy || !activeConsent || !receipt.file} style={{ padding: ".85rem 1rem", borderRadius: 8, border: 0, background: "#1a1a1a", color: "white" }}>Submit receipt for review</button>
          </form>
        </section>
      </div>
    </main>
  );
}
