import React, { useEffect, useState } from "react";
import { apiRequest } from "../lib/apiClient.js";

export default function D1HealthCheck() {
  const [status, setStatus] = useState({ state: "loading", data: null, message: "Checking Cloudflare D1…" });

  async function runCheck() {
    setStatus({ state: "loading", data: null, message: "Checking Cloudflare D1…" });
    try {
      const data = await apiRequest("/api/health/d1");
      setStatus({ state: data?.ok ? "ok" : "error", data, message: data?.ok ? "D1 is reachable." : "D1 returned an unhealthy result." });
    } catch (error) {
      setStatus({ state: "error", data: null, message: error.message || "D1 health check failed." });
    }
  }

  useEffect(() => {
    runCheck();
  }, []);

  return (
    <main style={{ minHeight: "100vh", padding: "2rem", background: "#f5f1e8", color: "#1a1a1a" }}>
      <section style={{ maxWidth: 760, margin: "0 auto", background: "white", borderRadius: 16, padding: "2rem", boxShadow: "0 12px 40px rgba(0,0,0,.1)" }}>
        <p style={{ margin: 0, color: "#7b651e", fontWeight: 700, letterSpacing: ".08em" }}>3C MALL DIAGNOSTIC</p>
        <h1 style={{ marginTop: ".5rem" }}>Cloudflare D1 Health</h1>
        <p>{status.message}</p>

        <div style={{ padding: "1rem", borderRadius: 12, background: status.state === "ok" ? "#edf8ef" : status.state === "error" ? "#fff0f0" : "#f3f3f3" }}>
          <strong>Status:</strong> {status.state.toUpperCase()}
        </div>

        {status.data && (
          <dl style={{ display: "grid", gridTemplateColumns: "max-content 1fr", gap: ".6rem 1rem", marginTop: "1.5rem" }}>
            <dt>Service</dt><dd>{status.data.service}</dd>
            <dt>Database</dt><dd>{status.data.database}</dd>
            <dt>Latency</dt><dd>{status.data.latencyMs} ms</dd>
            <dt>Receipt storage</dt><dd>{status.data.receiptStorageConfigured ? "Configured" : "Not configured"}</dd>
            <dt>Email</dt><dd>{status.data.emailConfigured ? "Configured" : "Not configured"}</dd>
            <dt>Checked</dt><dd>{status.data.timestamp}</dd>
          </dl>
        )}

        <button type="button" onClick={runCheck} style={{ marginTop: "1.5rem", padding: ".8rem 1.2rem", borderRadius: 10, border: 0, background: "#1a1a1a", color: "white", cursor: "pointer" }}>
          Run check again
        </button>

        <p style={{ marginTop: "1.5rem", fontSize: ".9rem", color: "#555" }}>
          This screen confirms configuration and reachability only. It does not replace authentication, authorization, privacy, backup, recovery, or penetration testing.
        </p>
      </section>
    </main>
  );
}
