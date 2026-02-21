import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import VideoIntro, { VIDEO_INTRO_SEEN_KEY } from "../assets/components/VideoIntro.jsx";
import { readJSON } from "../utils/Storage";

function Login() {
  const nav = useNavigate();
  const { signIn, signUp, error: authError, loading } = useAuth();

  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
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
                />
              </div>
            )}

            {(error || authError) && (
              <p className="error-message">
                ❌ {error || authError}
              </p>
            )}

            {success && (
              <p className="success-message">
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
                  : "Create Account"}
            </button>

            <div className="login-toggle">
              {mode === "login" ? (
                <p>
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setMode("signup")}
                    className="toggle-btn"
                  >
                    Sign up
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
            height: 100vh;
            overflow: hidden;
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
            height: 50%;
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
            background: linear-gradient(to bottom, transparent 20%, rgba(0, 0, 0, 0.85) 70%, rgba(0, 0, 0, 0.95) 100%);
            z-index: 2;
          }

          .login-form-container {
            position: relative;
            z-index: 3;
            width: 100%;
            max-width: 420px;
            padding: 1.5rem;
            padding-bottom: 2.5rem;
            text-align: center;
            margin-top: auto;
            margin-bottom: auto;
          }

          .login-branding h1 {
            font-size: 2.2rem;
            font-weight: 300;
            letter-spacing: 0.2em;
            color: #d4af37;
            margin: 0 0 0.25rem 0;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
          }

          .login-tagline {
            color: #d4af37;
            font-size: 0.75rem;
            letter-spacing: 0.15em;
            margin: 0 0 1.25rem 0;
            opacity: 0.9;
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

          .form-group input {
            width: 100%;
            padding: 0.7rem 0.85rem;
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(212, 175, 55, 0.3);
            border-radius: 4px;
            color: #fff;
            font-size: 0.95rem;
            backdrop-filter: blur(10px);
            transition: all 0.3s ease;
          }

          .form-group input:focus {
            outline: none;
            border-color: #d4af37;
            background: rgba(255, 255, 255, 0.15);
            box-shadow: 0 0 0 2px rgba(212, 175, 55, 0.1);
          }

          .form-group input::placeholder {
            color: rgba(255, 255, 255, 0.5);
          }

          .form-group input:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }

          .error-message {
            color: #ff6b6b;
            font-size: 0.8rem;
            margin: 0;
            padding: 0.4rem;
            background: rgba(255, 107, 107, 0.1);
            border-radius: 4px;
          }

          .success-message {
            color: #51cf66;
            font-size: 0.8rem;
            margin: 0;
            padding: 0.4rem;
            background: rgba(81, 207, 102, 0.1);
            border-radius: 4px;
          }

          .login-btn {
            width: 100%;
            padding: 0.85rem;
            background: linear-gradient(135deg, #d4af37, #c9a02c);
            border: none;
            border-radius: 4px;
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
              max-width: 90%;
              padding: 1.25rem;
              padding-bottom: 2rem;
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
