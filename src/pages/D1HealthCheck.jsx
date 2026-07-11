import React, { useState } from "react";
import { apiGet } from "../lib/apiClient.js";

export default function D1HealthCheck() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleTest = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      setResult(await apiGet("/api/health/d1"));
    } catch (testError) {
      setError(testError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "640px", margin: "0 auto" }}>
      <h2>Cloudflare D1 Connection Test</h2>
      <p>This checks the server-side <code>DB</code> binding. No database credentials are exposed to the browser.</p>

      <button
        type="button"
        onClick={handleTest}
        disabled={loading}
        style={{ padding: "0.75rem 1.5rem", cursor: loading ? "not-allowed" : "pointer" }}
      >
        {loading ? "Testing..." : "Test D1 Connection"}
      </button>

      {error && (
        <div style={{ marginTop: "1rem", padding: "1rem", background: "#ffe6e6", color: "#8a0000" }}>
          <strong>Connection failed:</strong> {error}
        </div>
      )}

      {result && (
        <div style={{ marginTop: "1rem", padding: "1rem", background: result.status === "success" ? "#e6ffe6" : "#ffe6e6" }}>
          <strong>{result.message}</strong>
          <pre style={{ overflow: "auto", marginTop: "1rem" }}>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
