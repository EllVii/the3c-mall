import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
// New Import
import FeedbackPanel from "../FeedbackPanel.jsx"; 

export default function AppLayout() {
  const navigate = useNavigate();

  // Signature 3C Mall Navigation Style
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
    transition: "all 0.15s ease"
  });

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--ink)" }}>
      <header style={{ padding: "1rem 1.25rem", borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap", alignItems: "center" }}>
          
          <NavLink to="/app" style={linkStyle} end>Dashboard</NavLink>
          <NavLink to="/app/meal-plans" style={linkStyle}>Meal Plans</NavLink>
          <NavLink to="/app/grocery-lab" style={linkStyle}>Grocery Lab</NavLink>
          <NavLink to="/app/pt" style={linkStyle}>PT Mode</NavLink>
          <NavLink to="/app/settings" style={linkStyle}>Settings</NavLink>
          <NavLink to="/app/coming-soon" style={linkStyle}>Coming Soon</NavLink>

          <button
            className="btn btn-ghost"
            style={{ 
              marginLeft: "auto", 
              fontSize: "0.72rem", 
              padding: "0.35rem 0.8rem", 
              color: "#ffb4b4", 
              borderColor: "rgba(255,180,180,0.2)",
              background: "rgba(255,0,0,0.05)"
            }}
            onClick={() => navigate("/", { replace: true })}
          >
            Logout
          </button>
        </div>
      </header>

      <main style={{ padding: "1.25rem" }}>
        {/* Renders DashboardPage, MealPlannerPage, etc. */}
        <Outlet />
        
        {/* Persistent Feedback Tool for Metabolic Echo™ Calibration */}
        <FeedbackPanel />
      </main>
    </div>
  );
}