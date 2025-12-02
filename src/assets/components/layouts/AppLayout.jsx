// src/assets/components/layouts/AppLayout.jsx
import React from "react";
import { Outlet, NavLink } from "react-router-dom";

export default function AppLayout() {
  return (
    <div className="app-shell">
      {/* App Navbar */}
      <nav className="navbar">
        <div className="navbar-left">
          <div className="nav-logo-pill">3C</div>
          <div className="nav-brand">
            <span className="nav-brand-title">The 3C Mall</span>
            <span className="nav-brand-subtitle">
              Carnivore • Cost • Community
            </span>
          </div>
        </div>

        <div className="nav-links">

          <NavLink
            to="/app"
            end
            className={({ isActive }) =>
              "link-neon" + (isActive ? " link-active" : "")
            }
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/app/meal-plans"
            className={({ isActive }) =>
              "link-neon" + (isActive ? " link-active" : "")
            }
          >
            Meal Plans
          </NavLink>

          {/* ⭐ NEW — Grocery Lab */}
          <NavLink
            to="/app/grocery-lab"
            className={({ isActive }) =>
              "link-neon" + (isActive ? " link-active" : "")
            }
          >
            Grocery Lab
          </NavLink>

          <NavLink
            to="/app/coming-soon"
            className={({ isActive }) =>
              "link-neon" + (isActive ? " link-active" : "")
            }
          >
            Coming Soon
          </NavLink>

          <NavLink to="/login" className="link-neon">
            Logout
          </NavLink>
        </div>
      </nav>

      {/* Page Content */}
      <main className="app-shell-main">
        <Outlet />
      </main>
    </div>
  );
}
