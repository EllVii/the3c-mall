// src/assets/components/layouts/SiteLayout.jsx
import { Link, Outlet } from "react-router-dom";

export default function SiteLayout() {
  return (
    <div className="app-shell">
      <header>
        <nav className="navbar">
          <div className="navbar-left">
            <div className="nav-logo-pill">3C</div>
            <div className="nav-brand">
              <span className="nav-brand-title">The 3C Lifestyle Mall</span>
              <span className="nav-brand-subtitle">
                Convert • Commit • Come Back
              </span>
            </div>
          </div>
          <div className="nav-links">
            <Link to="/" className="link-neon">
              Home
            </Link>
            <Link to="/features" className="link-neon">
              Features
            </Link>
            <Link to="/pricing" className="link-neon">
              Pricing
            </Link>
            <Link to="/login" className="link-neon">
              Login
            </Link>
            <Link to="/app" className="link-neon link-neon-ghost">
              Open the 3C App
            </Link>
          </div>
        </nav>
      </header>

      <main className="app-shell-main">
        <div className="page">
          <Outlet />
        </div>
      </main>

      <footer style={{ padding: "0 1.5rem 1.5rem" }}>
        <div
          style={{
            maxWidth: "1120px",
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            gap: "1rem",
            fontSize: "0.78rem",
            color: "#7c8595",
          }}
        >
          <span>© {new Date().getFullYear()} The 3C Lifestyle Mall.</span>
          <span>Engineered for precision. Crafted for effortless performance.</span>
        </div>
      </footer>
    </div>
  );
}
