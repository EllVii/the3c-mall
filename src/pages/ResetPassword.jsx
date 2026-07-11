import React, { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const { resetPasswordWithToken, loading } = useAuth();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!token) {
      setError("This password reset link is missing its token.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const result = await resetPasswordWithToken(token, password);
    if (result.error) {
      setError(result.error);
      return;
    }

    setMessage(result.message || "Password updated. You can now log in.");
    setPassword("");
    setConfirmPassword("");
  };

  return (
    <section style={{ maxWidth: "460px", margin: "3rem auto", padding: "1.5rem" }}>
      <h1>Reset your password</h1>
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: "1rem" }}>
        <label>
          New password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="new-password"
            disabled={loading}
            style={{ display: "block", width: "100%", padding: "0.75rem", marginTop: "0.35rem" }}
          />
        </label>
        <label>
          Confirm new password
          <input
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            autoComplete="new-password"
            disabled={loading}
            style={{ display: "block", width: "100%", padding: "0.75rem", marginTop: "0.35rem" }}
          />
        </label>
        {error && <p style={{ color: "#a00000" }}>{error}</p>}
        {message && <p style={{ color: "#086b21" }}>{message}</p>}
        <button type="submit" disabled={loading}>{loading ? "Updating..." : "Update password"}</button>
      </form>
      <p style={{ marginTop: "1rem" }}><Link to="/login">Return to login</Link></p>
    </section>
  );
}
