import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import VideoIntro, { VIDEO_INTRO_SEEN_KEY } from "../assets/components/VideoIntro.jsx";
import { readJSON } from "../utils/Storage";

function Login() {
  const nav = useNavigate();
  const [searchParams] = useSearchParams();
  const { signIn, signUp, error: authError, loading } = useAuth();

  const [mode, setMode] = useState("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [requestReason, setRequestReason] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(() => (
    searchParams.get("verified") === "1"
      ? "Email confirmed. Your access request must still be approved before you can sign in."
      : ""
  ));
  
  // Show video intro on first visit (if not seen on landing page)
  const [showVideoIntro, setShowVideoIntro] = useState(() => {
    const hasSeenIntro = readJSON(VIDEO_INTRO_SEEN_KEY, null);
    return !hasSeenIntro;
  });

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

    if (!fullName.trim() || !email || !password || !confirmPassword) {
      setError("Please fill in all required fields");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 10) {
      setError("Password must be at least 10 characters");
      return;
    }

    const { data, error: signUpError } = await signUp(email, password, {
      fullName: fullName.trim(),
      reason: requestReason.trim(),
    });

    if (signUpError) {
      setError(signUpError);
      return;
    }

    setSuccess(
      data?.message ||
      "Access request received. Confirm your email, then wait for approval.",
    );
    setTimeout(() => {
      setMode("login");
      setFullName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setRequestReason("");
    }, 3500);
  };

  return (
    <>
      {/* VIDEO INTRO - Plays if user hasn't seen it yet */}
      <VideoIntro
        open={showVideoIntro}
        onComplete={() => {
          setShowVideoIntro(false);
        }}
      />
      
      <section className="login-page">
        {/* Background Image */}
        <div className="login-hero-image">
          <img 
            src="/brand/3c-mall-entrance.jpg" 
            alt="3C Mall Entrance" 
            className="hero-img"
          />
          <div className="login-overlay"></div>
        </div>

        {/* Login Form at Bottom Center */}
        <div className="login-form-container">
          <form
            className="login-form"
            onSubmit={mode === "login" ? handleLogin : handleSignUp}
          >
            <div className="login-form-heading">
              <span>PRIVATE BETA ACCESS</span>
              <h1>{mode === "login" ? "Welcome back" : "Request access"}</h1>
              <p>
                {mode === "login"
                  ? "Sign in with an approved 3C Mall account."
                  : "New requests are reviewed before an account can enter 3C Mall."}
              </p>
            </div>

            {mode === "signup" && (
              <div className="form-group">
                <label htmlFor="fullName">Full name</label>
                <input
                  id="fullName"
                  type="text"
                  placeholder="Your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={loading}
                  autoComplete="name"
                  maxLength={100}
                  required
                />
              </div>
            )}

            {/* Email - Above Password */}
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                autoComplete="email"
                required
              />
            </div>

            {/* Password - Below Username */}
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                minLength={mode === "signup" ? 10 : undefined}
                maxLength={128}
                required
              />
            </div>

            {mode === "signup" && (
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  autoComplete="new-password"
                  minLength={10}
                  maxLength={128}
                  required
                />
              </div>
            )}

            {mode === "signup" && (
              <div className="form-group">
                <label htmlFor="requestReason">
                  How would you use 3C Mall?{" "}
                  <span className="optional-label">(optional)</span>
                </label>
                <textarea
                  id="requestReason"
                  placeholder="Tell us a little about what you want help with."
                  value={requestReason}
                  onChange={(e) => setRequestReason(e.target.value)}
                  disabled={loading}
                  maxLength={500}
                  rows={3}
                />
              </div>
            )}

            {(error || authError) && (
              <p className="error-message" role="alert">
                {error || authError}
              </p>
            )}

            {success && (
              <p className="success-message" role="status">
                {success}
              </p>
            )}

            <button
              type="submit"
              className="login-btn"
              disabled={loading}
            >
              {loading
                ? "Loading..."
                : mode === "login"
                  ? "Log In"
                  : "Submit Access Request"}
            </button>

            <div className="login-toggle">
              {mode === "login" ? (
                <p>
                  Need a 3C Mall login?{" "}
                  <button
                    type="button"
                    onClick={() => setMode("signup")}
                    className="toggle-btn"
                  >
                    Request access
                  </button>
                </p>
              ) : (
                <p>
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setMode("login")}
                    className="toggle-btn"
                  >
                    Log in
                  </button>
                </p>
              )}
            </div>
          </form>
        </div>

        <style>{`
          .login-page {
            position: relative;
            width: 100vw;
            min-height: calc(100dvh - 88px);
            overflow: clip;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: flex-start;
            background: #000;
          }

          .login-hero-image {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: min(54vh, 520px);
            z-index: 1;
          }

          .hero-img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            object-position: center;
          }

          .login-overlay {
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(to bottom, rgba(0, 0, 0, 0.02) 10%, rgba(0, 0, 0, 0.78) 72%, #000 100%);
            z-index: 2;
          }

          .login-form-container {
            position: relative;
            z-index: 3;
            width: min(100% - 2rem, 470px);
            padding: clamp(1.25rem, 3vw, 2rem);
            text-align: center;
            margin: clamp(11rem, 31vh, 20rem) auto 3rem;
            border: 1px solid rgba(212, 175, 55, 0.28);
            border-radius: 20px;
            background: rgba(5, 6, 9, 0.88);
            box-shadow: 0 24px 70px rgba(0, 0, 0, 0.58);
          }

          .login-form-heading {
            display: grid;
            gap: 0.38rem;
            margin-bottom: 0.45rem;
            text-align: left;
          }

          .login-form-heading span {
            color: #d4af37;
            font-size: 0.68rem;
            font-weight: 800;
            letter-spacing: 0.18em;
          }

          .login-form-heading h1 {
            margin: 0;
            color: #fff;
            font-size: clamp(1.55rem, 4vw, 2rem);
            line-height: 1.1;
          }

          .login-form-heading p {
            margin: 0;
            color: rgba(255, 255, 255, 0.66);
            font-size: 0.82rem;
            line-height: 1.5;
          }

          .login-form {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
          }

          .form-group {
            text-align: left;
          }

          .form-group label {
            display: block;
            color: #fff;
            font-size: 0.8rem;
            margin-bottom: 0.35rem;
            font-weight: 500;
            letter-spacing: 0.05em;
          }

          .optional-label {
            color: rgba(255, 255, 255, 0.52);
            font-weight: 400;
            letter-spacing: 0;
          }

          .form-group input,
          .form-group textarea {
            width: 100%;
            padding: 0.7rem 0.85rem;
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(212, 175, 55, 0.3);
            border-radius: 9px;
            color: #fff;
            font-family: inherit;
            font-size: 0.95rem;
            backdrop-filter: blur(10px);
            transition: all 0.3s ease;
          }

          .form-group textarea {
            min-height: 78px;
            resize: vertical;
          }

          .form-group input:focus,
          .form-group textarea:focus {
            outline: none;
            border-color: #d4af37;
            background: rgba(255, 255, 255, 0.15);
            box-shadow: 0 0 0 2px rgba(212, 175, 55, 0.1);
          }

          .form-group input::placeholder,
          .form-group textarea::placeholder {
            color: rgba(255, 255, 255, 0.5);
          }

          .form-group input:disabled,
          .form-group textarea:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }

          .error-message {
            color: #ff6b6b;
            font-size: 0.8rem;
            line-height: 1.45;
            margin: 0;
            padding: 0.65rem 0.75rem;
            background: rgba(255, 107, 107, 0.1);
            border: 1px solid rgba(255, 107, 107, 0.24);
            border-radius: 9px;
          }

          .success-message {
            color: #51cf66;
            font-size: 0.8rem;
            line-height: 1.45;
            margin: 0;
            padding: 0.65rem 0.75rem;
            background: rgba(81, 207, 102, 0.1);
            border: 1px solid rgba(81, 207, 102, 0.24);
            border-radius: 9px;
          }

          .login-btn {
            width: 100%;
            padding: 0.85rem;
            background: linear-gradient(135deg, #d4af37, #c9a02c);
            border: none;
            border-radius: 9px;
            color: #000;
            font-size: 0.95rem;
            font-weight: 600;
            letter-spacing: 0.1em;
            cursor: pointer;
            transition: all 0.3s ease;
            margin-top: 0.3rem;
          }

          .login-btn:hover:not(:disabled) {
            background: linear-gradient(135deg, #e0bf47, #d4af37);
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(212, 175, 55, 0.4);
          }

          .login-btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }

          .login-toggle {
            margin-top: 0.75rem;
            color: rgba(255, 255, 255, 0.7);
            font-size: 0.8rem;
          }

          .login-toggle p {
            margin: 0;
          }

          .toggle-btn {
            background: none;
            border: none;
            color: #d4af37;
            cursor: pointer;
            text-decoration: underline;
            font-size: inherit;
            padding: 0;
            font-weight: 500;
          }

          .toggle-btn:hover {
            color: #e0bf47;
          }

          /* Mobile Responsive */
          @media (max-width: 768px) {
            .login-branding h1 {
              font-size: 1.8rem;
            }

            .login-form-container {
              width: min(100% - 1.25rem, 470px);
              padding: 1.25rem;
              margin-top: clamp(9rem, 27vh, 15rem);
            }
          }

          @media (max-height: 700px) {
            .login-branding h1 {
              font-size: 1.5rem;
              margin-bottom: 0.15rem;
            }

            .login-tagline {
              font-size: 0.7rem;
              margin-bottom: 0.8rem;
            }

            .login-form {
              gap: 0.65rem;
            }

            .form-group input {
              padding: 0.65rem 0.75rem;
              font-size: 0.9rem;
            }

            .login-btn {
              padding: 0.75rem;
              font-size: 0.9rem;
            }
          }

          @media (max-height: 600px) {
            .login-branding h1 {
              font-size: 1.25rem;
              margin-bottom: 0.1rem;
            }

            .login-tagline {
              font-size: 0.65rem;
              margin-bottom: 0.6rem;
            }

            .form-group label {
              font-size: 0.75rem;
              margin-bottom: 0.25rem;
            }

            .login-form {
              gap: 0.55rem;
            }

            .form-group input {
              padding: 0.6rem 0.75rem;
              font-size: 0.85rem;
            }
          }
        `}</style>
      </section>
    </>
  );
}

export default Login;
