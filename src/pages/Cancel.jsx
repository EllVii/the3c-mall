import "../styles/Cancel.css";
import React from "react";

function Cancel() {
  // Later you can wire these to real handlers (Stripe, Supabase, etc.)
  const handleDowngrade = () => {
    console.log("Downgrade to 3C Basic (Free) clicked");
    // TODO: call API to downgrade to Basic / Essential access
  };

  const handleFullCancel = () => {
    console.log("Continue with full cancellation clicked");
    // TODO: call API to fully cancel subscription
  };

  return (
    <section className="cancel-page page">
      <p className="lp-kicker">Convert • Commit • Come Back</p>

      <h1 className="cancel-title">Before you cancel, keep what you’ve built.</h1>

      <p className="cancel-subtitle">
        You’ve already invested time, energy, and intention. You don’t have to
        lose your data, your streaks, or your place in the 3C community to take
        a break from payments.
      </p>

      <div className="cancel-card">
        <h2 className="cancel-keep-title">
          Stay in the family with 3C Basic access.
        </h2>

        <p className="cancel-keep-subtitle">
          Downgrade instead of disappearing. Your account stays active, your
          history stays safe, and you can always upgrade again when life calms
          down.
        </p>

        <ul className="cancel-list">
          <li>Your grocery lists and preferences stay saved</li>
          <li>Your 80/20 streak history and progress are preserved</li>
          <li>Your community connections and DMs stay accessible</li>
          <li>Your meal history and insights remain in your dashboard</li>
          <li>Your account stays active with a lighter, Basic experience</li>
        </ul>

        {/* Primary: Downgrade to Basic (Free) */}
        <button
          type="button"
          className="cancel-btn-downgrade"
          onClick={handleDowngrade}
        >
          Downgrade to 3C Basic (Free)
        </button>

        {/* Secondary: continue with cancellation (low contrast) */}
        <button
          type="button"
          className="cancel-btn-light"
          onClick={handleFullCancel}
        >
          Continue with cancellation
        </button>

        <p className="cancel-footnote">
          You can come back to a full membership whenever you’re ready. Your
          data and journey are never used to shame you or pressure you.
        </p>
      </div>

      <p className="cancel-fineprint">
        Cancelling stops future billing. Downgrading to 3C Basic keeps your
        account, your data, and your emotional safety net — at no cost.
      </p>
    </section>
  );
}

export default Cancel;
