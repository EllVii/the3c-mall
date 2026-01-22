import React, { useState } from "react";
import { testSupabaseConnection } from "../utils/supabaseTest.js";

export default function SupabaseHealthCheck() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleTest = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const testResult = await testSupabaseConnection();
      setResult(testResult);

      if (testResult.status === "success") {
        console.log("✅ Supabase connection verified!");
      } else {
        console.warn("⚠️ Supabase connection failed:", testResult);
      }
    } catch (err) {
      setError(err.message);
      console.error("❌ Test error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "600px", margin: "0 auto" }}>
      <h2>🔧 Supabase Connection Test</h2>

      <div
        style={{
          background: "#f5f5f5",
          padding: "1rem",
          borderRadius: "8px",
          marginBottom: "1rem",
        }}
      >
        <p>
          <strong>API Base:</strong>{" "}
          <code>{import.meta.env.VITE_API_BASE || "(not set)"}</code>
        </p>
        <p>
          <strong>Supabase URL:</strong>{" "}
          <code>{import.meta.env.VITE_SUPABASE_URL?.substring(0, 40) || "(not set)"}...</code>
        </p>
      </div>

      <button
        onClick={handleTest}
        disabled={loading}
        style={{
          padding: "0.75rem 1.5rem",
          fontSize: "1rem",
          cursor: loading ? "not-allowed" : "pointer",
          opacity: loading ? 0.6 : 1,
        }}
      >
        {loading ? "Testing..." : "Test Connection"}
      </button>

      {error && (
        <div
          style={{
            marginTop: "1rem",
            padding: "1rem",
            background: "#ffe6e6",
            borderRadius: "8px",
            color: "#cc0000",
          }}
        >
          <p>
            <strong>❌ Error:</strong> {error}
          </p>
        </div>
      )}

      {result && (
        <div
          style={{
            marginTop: "1rem",
            padding: "1rem",
            background:
              result.status === "success" ? "#e6ffe6" : "#ffe6e6",
            borderRadius: "8px",
            color: result.status === "success" ? "#006600" : "#cc0000",
            fontFamily: "monospace",
          }}
        >
          <p>
            <strong>{result.status === "success" ? "✅" : "❌"} Status:</strong>{" "}
            {result.message}
          </p>

          {result.supabase && (
            <div style={{ marginTop: "0.5rem" }}>
              <p>
                <strong>URL:</strong> {result.supabase.url}
              </p>
              <p>
                <strong>Connected:</strong> {result.supabase.connected ? "Yes" : "No"}
              </p>
              <p>
                <strong>Time:</strong> {result.supabase.timestamp}
              </p>
            </div>
          )}

          {result.error && (
            <p style={{ marginTop: "0.5rem" }}>
              <strong>Error Detail:</strong> {result.error}
            </p>
          )}

          <pre
            style={{
              marginTop: "1rem",
              padding: "0.5rem",
              background: "rgba(0, 0, 0, 0.1)",
              borderRadius: "4px",
              fontSize: "0.8rem",
              overflow: "auto",
            }}
          >
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
