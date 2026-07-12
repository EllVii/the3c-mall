import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const MIN_PASSWORD_LENGTH = 8;

function Login() {
  const nav = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    signIn,
    signUp,
    resetPassword,
    resendVerification,
    loading,
  } = useAuth();

  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (searchParams.get("verified") === "1") {
      setSuccess("Your email is verified. You can log in now.");
      setMode("login");
    } else if (searchParams.get("verification") === "invalid") {
      setError("That verification link is invalid or has expired. Request a new one below.");
      setMode("login");
    }
  }, [searchParams]);

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  const switchMode = (nextMode) => {
    clearMessages();
    setMode(nextMode);
    setPassword("");
    setConfirmPassword("");
    setShowPassword(false);
  };

  const validateEmail = () => {
    if (!email.trim()) {
      setError("Enter your email address.");
      return false;
    }
    return true;
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    clearMessages();

    if (!validateEmail() || !password) {
      if (!password) setError("Enter your email address and password.");
      return;
    }

    const result = await signIn(email.trim(), password);
    if (result.error) {
      setError(result.error);
      return;
    }

    setSuccess("Logged in. Opening 3C Mall...");
    window.setTimeout(() => nav("/app"), 350);
  };

  const handleSignUp = async (event) => {
    event.preventDefault();
    clearMessages();

    if (!validateEmail() || !password || !confirmPassword) {
      if (!password || !confirmPassword) setError("Complete all account fields.");
      return;
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const result = await signUp(email.trim(), password, {
      firstName: "",
      household: "solo",
    });

    if (result.error) {
      setError(result.error);
      return;
    }

    setSuccess(result.message || "Account created. Check your email to verify your account.");
    setPassword("");
    setConfirmPassword("");
    setMode("login");
  };

  const handleForgotPassword = async (event) => {
    event.preventDefault();
    clearMessages();

    if (!validateEmail()) return;

    const result = await resetPassword(email.trim());
    if (result.error) {
      setError(result.error);
      return;
    }

    setSuccess(result.message || "Check your email for password-reset instructions.");
  };

  const handleResendVerification = async () => {
    clearMessages();
    if (!validateEmail()) return;

    const result = await resendVerification(email.trim());
    if (result.error) {
      setError(result.error);
      return;
    }

    setSuccess(result.message || "If the account is unverified, a new email has been sent.");
  };

  const isSignup = mode === "signup";
  const isForgot = mode === "forgot";

  return (
    <main className="auth-page">
      <div className="auth-background" aria-hidden="true">
        <img src="/brand/3c-mall-entrance.jpg" alt="" />
      </div>
      <div className="auth-shade" aria-hidden="true" />

      <section className="auth-card" aria-labelledby="auth-title">
        <div className="auth-brand">
          <p className="auth-eyebrow">CONCIERGE • COST • COMMUNITY</p>
          <h1 id="auth-title">
            {isSignup ? "Create your account" : isForgot ? "Reset your password" : "Welcome back"}
          </h1>
          <p className="auth-subtitle">
            {isSignup
              ? "Start your personalized 3C Mall experience."
              : isForgot
                ? "Enter your email and we will send a secure reset link."
                : "Log in to continue your journey."}
          </p>
        </div>

        {!isForgot && (
          <div className="auth-tabs" role="tablist" aria-label="Account options">
            <button
              type="button"
              role="tab"
              aria-selected={mode === "login"}
              className={mode === "login" ? "active" : ""}
              onClick={() => switchMode("login")}
              disabled={loading}
            >
              Log in
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={isSignup}
              className={isSignup ? "active" : ""}
              onClick={() => switchMode("signup")}
              disabled={loading}
            >
              Create account
            </button>
          </div>
        )}

        <form
          className="auth-form"
          onSubmit={isSignup ? handleSignUp : isForgot ? handleForgotPassword : handleLogin}
        >
          <label className="auth-field" htmlFor="auth-email">
            <span>Email</span>
            <input
              id="auth-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={loading}
              autoComplete="email"
              required
            />
          </label>

          {!isForgot && (
            <label className="auth-field" htmlFor="auth-password">
              <span>Password</span>
              <div className="password-input-wrap">
                <input
                  id="auth-password"
                  type={showPassword ? "text" : "password"}
                  placeholder={isSignup ? "At least 8 characters" : "Enter your password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  disabled={loading}
                  autoComplete={isSignup ? "new-password" : "current-password"}
                  minLength={isSignup ? MIN_PASSWORD_LENGTH : undefined}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((current) => !current)}
                  disabled={loading}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </label>
          )}

          {isSignup && (
            <label className="auth-field" htmlFor="auth-confirm-password">
              <span>Confirm password</span>
              <input
                id="auth-confirm-password"
                type={showPassword ? "text" : "password"}
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                disabled={loading}
                autoComplete="new-password"
                minLength={MIN_PASSWORD_LENGTH}
                required
              />
            </label>
          )}

          {error && (
            <div className="auth-message auth-error" role="alert">
              {error}
            </div>
          )}

          {success && (
            <div className="auth-message auth-success" role="status">
              {success}
            </div>
          )}

          <button type="submit" className="auth-primary" disabled={loading}>
            {loading
              ? "Please wait..."
              : isSignup
                ? "Create account"
                : isForgot
                  ? "Send reset link"
                  : "Log in"}
          </button>

          {mode === "login" && (
            <div className="auth-actions">
              <button type="button" onClick={() => switchMode("forgot")} disabled={loading}>
                Forgot password?
              </button>
              <button type="button" onClick={handleResendVerification} disabled={loading}>
                Resend verification email
              </button>
            </div>
          )}

          {isForgot && (
            <button
              type="button"
              className="auth-back"
              onClick={() => switchMode("login")}
              disabled={loading}
            >
              Back to login
            </button>
          )}
        </form>

        <p className="auth-security-note">
          Your password is encrypted and your session is stored in a secure HTTP-only cookie.
        </p>
      </section>

      <style>{`
        .auth-page {
          position: relative;
          min-height: 100svh;
          width: 100%;
          display: grid;
          place-items: center;
          overflow-x: hidden;
          padding: 2rem 1rem;
          background: #050505;
          color: #fff;
        }

        .auth-background,
        .auth-shade {
          position: fixed;
          inset: 0;
        }

        .auth-background img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
        }

        .auth-shade {
          background:
            radial-gradient(circle at 50% 22%, rgba(0, 0, 0, 0.12), rgba(0, 0, 0, 0.72) 65%),
            linear-gradient(180deg, rgba(0, 0, 0, 0.22), rgba(0, 0, 0, 0.9));
          backdrop-filter: blur(2px);
        }

        .auth-card {
          position: relative;
          z-index: 1;
          width: min(100%, 470px);
          padding: clamp(1.4rem, 4vw, 2.25rem);
          border: 1px solid rgba(212, 175, 55, 0.38);
          border-radius: 18px;
          background: rgba(7, 7, 7, 0.84);
          box-shadow: 0 24px 80px rgba(0, 0, 0, 0.55);
          backdrop-filter: blur(18px);
        }

        .auth-brand {
          text-align: center;
          margin-bottom: 1.25rem;
        }

        .auth-eyebrow {
          margin: 0 0 0.55rem;
          color: #d4af37;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.15em;
        }

        .auth-brand h1 {
          margin: 0;
          font-size: clamp(1.75rem, 5vw, 2.35rem);
          line-height: 1.08;
        }

        .auth-subtitle {
          margin: 0.7rem auto 0;
          max-width: 34ch;
          color: rgba(255, 255, 255, 0.72);
          font-size: 0.93rem;
          line-height: 1.5;
        }

        .auth-tabs {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.35rem;
          margin-bottom: 1.1rem;
          padding: 0.3rem;
          border-radius: 11px;
          background: rgba(255, 255, 255, 0.06);
        }

        .auth-tabs button {
          min-height: 42px;
          border: 0;
          border-radius: 8px;
          background: transparent;
          color: rgba(255, 255, 255, 0.7);
          font-weight: 700;
          cursor: pointer;
        }

        .auth-tabs button.active {
          background: #d4af37;
          color: #101010;
        }

        .auth-form {
          display: grid;
          gap: 0.95rem;
        }

        .auth-field {
          display: grid;
          gap: 0.42rem;
          text-align: left;
        }

        .auth-field > span {
          font-size: 0.82rem;
          font-weight: 700;
          color: rgba(255, 255, 255, 0.88);
        }

        .auth-field input {
          width: 100%;
          min-height: 48px;
          padding: 0.75rem 0.9rem;
          border: 1px solid rgba(255, 255, 255, 0.18);
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.08);
          color: #fff;
          font-size: 1rem;
          outline: none;
          box-sizing: border-box;
        }

        .auth-field input:focus {
          border-color: #d4af37;
          box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.15);
        }

        .auth-field input::placeholder {
          color: rgba(255, 255, 255, 0.42);
        }

        .password-input-wrap {
          position: relative;
        }

        .password-input-wrap input {
          padding-right: 4.25rem;
        }

        .password-toggle {
          position: absolute;
          top: 50%;
          right: 0.7rem;
          transform: translateY(-50%);
          border: 0;
          background: transparent;
          color: #d4af37;
          font-weight: 700;
          cursor: pointer;
        }

        .auth-message {
          padding: 0.75rem 0.85rem;
          border-radius: 10px;
          font-size: 0.86rem;
          line-height: 1.4;
        }

        .auth-error {
          border: 1px solid rgba(255, 107, 107, 0.35);
          background: rgba(255, 107, 107, 0.12);
          color: #ffb4b4;
        }

        .auth-success {
          border: 1px solid rgba(81, 207, 102, 0.35);
          background: rgba(81, 207, 102, 0.12);
          color: #a9efb5;
        }

        .auth-primary {
          min-height: 50px;
          border: 0;
          border-radius: 10px;
          background: linear-gradient(135deg, #e0bf47, #c99f24);
          color: #0a0a0a;
          font-size: 0.98rem;
          font-weight: 800;
          letter-spacing: 0.035em;
          cursor: pointer;
          box-shadow: 0 10px 24px rgba(212, 175, 55, 0.2);
        }

        .auth-primary:hover:not(:disabled) {
          transform: translateY(-1px);
          filter: brightness(1.06);
        }

        .auth-primary:disabled,
        .auth-tabs button:disabled,
        .auth-actions button:disabled,
        .auth-back:disabled,
        .password-toggle:disabled {
          cursor: not-allowed;
          opacity: 0.58;
        }

        .auth-actions {
          display: flex;
          justify-content: space-between;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .auth-actions button,
        .auth-back {
          border: 0;
          padding: 0.2rem 0;
          background: transparent;
          color: #d4af37;
          font-size: 0.82rem;
          font-weight: 700;
          cursor: pointer;
        }

        .auth-back {
          justify-self: center;
        }

        .auth-security-note {
          margin: 1.25rem 0 0;
          color: rgba(255, 255, 255, 0.46);
          text-align: center;
          font-size: 0.72rem;
          line-height: 1.45;
        }

        @media (max-width: 520px) {
          .auth-page {
            place-items: end center;
            padding: 1rem 0.8rem max(1rem, env(safe-area-inset-bottom));
          }

          .auth-card {
            width: 100%;
            border-radius: 16px;
            padding: 1.25rem;
          }

          .auth-actions {
            justify-content: center;
          }
        }

        @media (max-height: 720px) and (min-width: 521px) {
          .auth-page {
            place-items: start center;
          }
        }
      `}</style>
    </main>
  );
}

export default Login;
