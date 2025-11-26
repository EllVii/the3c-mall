import { Outlet, Link, useLocation } from "react-router-dom";

function SiteLayout() {
  const location = useLocation();

  return (
    <div className="site-root">
      <header className="site-header">
        <Link to="/" className="logo">
          <span className="logo-mark">3C</span>
          <span className="logo-text">The 3C Lifestyle Mall</span>
        </Link>

        <nav className="nav-links">
          <Link
            to="/features"
            className={location.pathname === "/features" ? "active" : ""}
          >
            Features
          </Link>
          <Link
            to="/pricing"
            className={location.pathname === "/pricing" ? "active" : ""}
          >
            Pricing
          </Link>
          <Link to="/login">Login</Link>
          <a href="/app" className="primary-btn">
            Open the App
          </a>
        </nav>
      </header>

      <main className="site-main">
        <Outlet />
      </main>

      <footer className="site-footer">
        <p>
          © {new Date().getFullYear()} The 3C Mall – Carnivore • Cost •
          Community.
        </p>
      </footer>
    </div>
  );
}

export default SiteLayout;
