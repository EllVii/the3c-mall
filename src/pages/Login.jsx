import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

function Login() {
  const nav = useNavigate();
  const { signIn, signUp, error: authError, loading } = useAuth();

  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    const { error: signInError } = await signIn(email, password);
    if (signInError) {
      setError(signInError);
      return;
    }

    setSuccess("✅ Logged in! Redirecting...");
    setTimeout(() => nav("/app"), 500);
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email || !password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    const { error: signUpError } = await signUp(email, password, {
      firstName: "",
      household: "solo",
    });

    if (signUpError) {
      setError(signUpError);
      return;
    }

    setSuccess("✅ Account created! Check your email for confirmation.");
    setTimeout(() => {
      setMode("login");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    }, 2000);
  };

  return (
    <section className="page center narrow">
      <h1>Welcome to 3C Mall</h1>
      <p className="page-subtitle">
        {mode === "login"
          ? "Log in to your account"
          : "Create a new account"}
      </p>

      <form
        className="card form"
        onSubmit={mode === "login" ? handleLogin : handleSignUp}
      >
        <label>
          Email
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
        </label>

        <label>
          Password
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
        </label>

        {mode === "signup" && (
          <label>
            Confirm Password
            <input
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
            />
          </label>
        )}

        {(error || authError) && (
          <p style={{ color: "#ff6b6b", fontSize: "0.9rem", margin: "0.5rem 0" }}>
            ❌ {error || authError}
          </p>
        )}

        {success && (
          <p style={{ color: "#51cf66", fontSize: "0.9rem", margin: "0.5rem 0" }}>
            {success}
          </p>
        )}

        <button
          type="submit"
          className="primary-btn full-width"
          disabled={loading}
          style={{ opacity: loading ? 0.6 : 1 }}
        >
          {loading
            ? "Loading..."
            : mode === "login"
              ? "Log In"
              : "Create Account"}
        </button>

        <div style={{ marginTop: "1rem", textAlign: "center" }}>
          {mode === "login" ? (
            <p className="muted small">
              Don&apos;t have an account?{" "}
              <button
                type="button"
                onClick={() => setMode("signup")}
                style={{
                  background: "none",
                  border: "none",
                  color: "#7ee0ff",
                  cursor: "pointer",
                  textDecoration: "underline",
                  fontSize: "inherit",
                }}
              >
                Sign up
              </button>
            </p>
          ) : (
            <p className="muted small">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => setMode("login")}
                style={{
                  background: "none",
                  border: "none",
                  color: "#7ee0ff",
                  cursor: "pointer",
                  textDecoration: "underline",
                  fontSize: "inherit",
                }}
              >
                Log in
              </button>
            </p>
          )}
        </div>
      </form>

      {mode === "login" && (
        <div style={{ marginTop: "2rem", textAlign: "center" }}>
          <p className="muted small">
            Need help? Check your email for password reset instructions.
          </p>
        </div>
      )}
    </section>
  );
}

export default Login;
