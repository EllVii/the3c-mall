import React from "react";
import { NavLink } from "react-router-dom";

const linkStyle = ({ isActive }) => ({
  color: isActive ? "#f6dc8a" : "#7ee0ff",
  textDecoration: "none",
  fontWeight: 800,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  fontSize: "0.78rem",
  padding: "0.35rem 0.55rem",
  borderRadius: "999px",
  border: isActive ? "1px solid rgba(246,220,138,0.75)" : "1px solid rgba(126,224,255,0.25)",
  background: isActive ? "rgba(20,14,5,0.55)" : "rgba(4,8,18,0.35)",
});

export default function SiteNav() {
  return (
    <header style={{ padding: "1rem 1.25rem", borderBottom: "1px solid rgba(126,224,255,0.15)" }}>
      <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap", alignItems: "center" }}>
        <NavLink to="/" style={linkStyle} end>
          Home
        </NavLink>
        <NavLink to="/pricing" style={linkStyle}>
          Pricing
        </NavLink>
        <NavLink to="/app" style={linkStyle}>
          Dashboard
        </NavLink>
      </div>
    </header>
  );
}
