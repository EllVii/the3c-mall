import React, { useState } from "react";
import {
  getAccessRequests,
  reviewAccessRequest,
} from "../lib/apiClient.js";
import "../styles/AdminAccessRequests.css";

const FILTERS = ["pending", "approved", "rejected", "all"];

function formatDate(value) {
  if (!value) return "Not yet";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function AdminAccessRequests() {
  const [adminToken, setAdminToken] = useState("");
  const [authorized, setAuthorized] = useState(false);
  const [filter, setFilter] = useState("pending");
  const [requests, setRequests] = useState([]);
  const [counts, setCounts] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [notes, setNotes] = useState({});
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState("");
  const [message, setMessage] = useState(null);

  async function loadRequests(nextFilter = filter, preserveMessage = false) {
    if (!adminToken.trim()) {
      setMessage({ type: "error", text: "Enter the admin access token." });
      return false;
    }

    setLoading(true);
    if (!preserveMessage) setMessage(null);
    try {
      const data = await getAccessRequests(adminToken.trim(), nextFilter);
      setRequests(data?.requests || []);
      setCounts(data?.counts || { pending: 0, approved: 0, rejected: 0 });
      setAuthorized(true);
      return true;
    } catch (error) {
      setAuthorized(false);
      setRequests([]);
      setMessage({
        type: "error",
        text: error?.status === 401
          ? "That admin token was not accepted."
          : error?.message || "Access requests could not be loaded.",
      });
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function handleUnlock(event) {
    event.preventDefault();
    await loadRequests("pending");
  }

  async function changeFilter(nextFilter) {
    setFilter(nextFilter);
    await loadRequests(nextFilter);
  }

  async function review(item, decision) {
    if (
      decision === "rejected" &&
      !window.confirm(`Reject access for ${item.email}?`)
    ) {
      return;
    }

    setProcessingId(item.userId);
    setMessage(null);
    try {
      const result = await reviewAccessRequest(
        adminToken.trim(),
        item.userId,
        decision,
        notes[item.userId] || "",
      );
      setMessage({
        type: "success",
        text: `${item.email} was ${decision}.${result?.notificationSent ? " A notification email was sent." : ""}`,
      });
      setNotes((current) => ({ ...current, [item.userId]: "" }));
      await loadRequests(filter, true);
    } catch (error) {
      setMessage({
        type: "error",
        text: error?.message || "The access decision could not be saved.",
      });
    } finally {
      setProcessingId("");
    }
  }

  function lockReview() {
    setAdminToken("");
    setAuthorized(false);
    setRequests([]);
    setMessage(null);
  }

  return (
    <main className="access-admin-page">
      <div className="access-admin-shell">
        <header className="access-admin-header">
          <div>
            <p className="access-admin-eyebrow">3C MALL ADMINISTRATION</p>
            <h1>Access request review</h1>
            <p>
              New users remain locked out until an authorized administrator
              approves their request.
            </p>
          </div>
          <a href="/login">Return to sign in</a>
        </header>

        {!authorized ? (
          <form className="access-admin-unlock" onSubmit={handleUnlock}>
            <div>
              <label htmlFor="adminToken">Admin access token</label>
              <p>The token is checked by the server and is not saved by this page.</p>
            </div>
            <input
              id="adminToken"
              type="password"
              value={adminToken}
              onChange={(event) => setAdminToken(event.target.value)}
              autoComplete="off"
              spellCheck="false"
              disabled={loading}
              required
            />
            <button type="submit" disabled={loading}>
              {loading ? "Checking…" : "Open review queue"}
            </button>
          </form>
        ) : (
          <>
            <section className="access-admin-toolbar" aria-label="Access request filters">
              <div className="access-admin-filters">
                {FILTERS.map((item) => {
                  const count = item === "all"
                    ? counts.pending + counts.approved + counts.rejected
                    : counts[item];
                  return (
                    <button
                      key={item}
                      type="button"
                      className={filter === item ? "is-active" : undefined}
                      onClick={() => changeFilter(item)}
                      disabled={loading}
                    >
                      <span>{item}</span>
                      <strong>{count || 0}</strong>
                    </button>
                  );
                })}
              </div>
              <button type="button" className="access-admin-lock" onClick={lockReview}>
                Lock review
              </button>
            </section>

            {message && (
              <p
                className={`access-admin-message is-${message.type}`}
                role={message.type === "error" ? "alert" : "status"}
              >
                {message.text}
              </p>
            )}

            <section className="access-admin-list" aria-live="polite">
              {loading ? (
                <div className="access-admin-empty">Loading requests…</div>
              ) : requests.length === 0 ? (
                <div className="access-admin-empty">
                  No {filter === "all" ? "" : `${filter} `}access requests.
                </div>
              ) : (
                requests.map((item) => (
                  <article className="access-request-card" key={item.userId}>
                    <div className="access-request-topline">
                      <div>
                        <p className="access-request-name">
                          {item.fullName || "Name not provided"}
                        </p>
                        <a href={`mailto:${item.email}`}>{item.email}</a>
                      </div>
                      <span className={`access-status is-${item.approvalStatus}`}>
                        {item.approvalStatus}
                      </span>
                    </div>

                    <dl className="access-request-details">
                      <div>
                        <dt>Email</dt>
                        <dd>{item.emailVerified ? "Confirmed" : "Not confirmed"}</dd>
                      </div>
                      <div>
                        <dt>Requested</dt>
                        <dd>{formatDate(item.requestedAt)}</dd>
                      </div>
                      {item.decidedAt && (
                        <div>
                          <dt>Last decision</dt>
                          <dd>{formatDate(item.decidedAt)}</dd>
                        </div>
                      )}
                    </dl>

                    <div className="access-request-reason">
                      <strong>How they plan to use 3C Mall</strong>
                      <p>{item.reason || "No additional details were provided."}</p>
                    </div>

                    <label className="access-request-note">
                      Internal review note <span>(optional)</span>
                      <textarea
                        value={notes[item.userId] || ""}
                        onChange={(event) => setNotes((current) => ({
                          ...current,
                          [item.userId]: event.target.value,
                        }))}
                        maxLength={500}
                        rows={2}
                        disabled={processingId === item.userId}
                      />
                    </label>

                    <div className="access-request-actions">
                      {item.approvalStatus !== "approved" && (
                        <button
                          type="button"
                          className="approve"
                          onClick={() => review(item, "approved")}
                          disabled={Boolean(processingId)}
                        >
                          {processingId === item.userId ? "Saving…" : "Approve access"}
                        </button>
                      )}
                      {item.approvalStatus !== "rejected" && (
                        <button
                          type="button"
                          className="reject"
                          onClick={() => review(item, "rejected")}
                          disabled={Boolean(processingId)}
                        >
                          {processingId === item.userId ? "Saving…" : "Reject"}
                        </button>
                      )}
                    </div>
                  </article>
                ))
              )}
            </section>
          </>
        )}

        {!authorized && message && (
          <p
            className={`access-admin-message is-${message.type}`}
            role="alert"
          >
            {message.text}
          </p>
        )}
      </div>
    </main>
  );
}
