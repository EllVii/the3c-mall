import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import { betaMessaging } from "../../../utils/betaMessaging.js";

const linkStyle = ({ isActive }) => ({
  color: isActive ? "var(--gold)" : "var(--blue)",
  textDecoration: "none",
  fontWeight: 900,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  fontSize: "0.78rem",
  padding: "0.35rem 0.6rem",
  borderRadius: "999px",
  border: isActive
    ? "1px solid rgba(246,220,138,0.65)"
    : "1px solid rgba(126,224,255,0.22)",
  background: isActive ? "rgba(20,14,5,0.55)" : "rgba(4,8,18,0.35)",
});

export default function SiteLayout() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg0)", display: "flex", flexDirection: "column" }}>
      <header style={{ padding: "1rem 1.25rem", borderBottom: "1px solid var(--line)" }}>
        <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap", alignItems: "center" }}>
            <NavLink to="/" style={linkStyle} end>Home</NavLink>
            <NavLink to="/features" style={linkStyle}>Features</NavLink>
            <NavLink to="/pricing" style={linkStyle}>Pricing</NavLink>
            <a href="https://the3cmall.app/app" style={linkStyle({ isActive: false })}>
              Beta Access
            </a>
          </div>
          <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "rgba(246,220,138,0.9)", padding: "0.25rem 0.5rem", borderRadius: "0.35rem", background: "rgba(20,14,5,0.35)", border: "1px solid rgba(246,220,138,0.3)", whiteSpace: "nowrap" }} title={betaMessaging.appBadge.tooltip}>
            {betaMessaging.appBadge.label}
          </div>
        </div>
      </header>

      <main style={{ padding: "0.25rem 0", flex: 1 }}>
        <Outlet />
      </main>

      <footer style={{ padding: "2rem 1.25rem", borderTop: "1px solid var(--line)", textAlign: "center", fontSize: "0.8rem", color: "rgba(255,255,255,0.6)" }}>
        <div>{betaMessaging.website.footer}</div>
      </footer>
    </div>
  );
}
