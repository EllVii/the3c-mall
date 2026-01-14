import React from "react";
import { NavLink, Outlet } from "react-router-dom";

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
    <div style={{ minHeight: "100vh", background: "var(--bg0)" }}>
      <header style={{ padding: "1rem 1.25rem", borderBottom: "1px solid var(--line)" }}>
        <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap", alignItems: "center" }}>
          <NavLink to="/" style={linkStyle} end>Home</NavLink>
          <NavLink to="/features" style={linkStyle}>Features</NavLink>
          <NavLink to="/pricing" style={linkStyle}>Pricing</NavLink>
          <NavLink to="/login" style={linkStyle}>Tester Login</NavLink>
          <a href="https://the3cmall.app" style={linkStyle({ isActive: false })}>
            Beta Access
          </a>
        </div>
      </header>

      <main style={{ padding: "0.25rem 0" }}>
        <Outlet />
      </main>
    </div>
  );
}
