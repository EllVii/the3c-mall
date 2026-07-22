import React, { lazy, Suspense, useMemo, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { getPrefsSafe } from "../../../utils/prefs.js";
import "./AppLayout.css";

const ConciergeHub = lazy(() => import("../ConciergeHub.jsx"));

const NAV_ITEMS = [
  { label: "Home", shortLabel: "Home", route: "/app", icon: "home", end: true },
  { label: "Meal planning", shortLabel: "Meals", route: "/app/meal-planner", icon: "meals" },
  { label: "Grocery Lab", shortLabel: "Grocery", route: "/app/grocery-lab", icon: "grocery" },
  { label: "Community", shortLabel: "Community", route: "/app/community", icon: "community" },
  { label: "Profile", shortLabel: "Profile", route: "/app/profile", icon: "profile" },
];

function NavigationIcon({ name }) {
  const commonProps = {
    width: 22,
    height: 22,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };

  if (name === "home") {
    return (
      <svg {...commonProps}>
        <path d="m3 10 9-7 9 7" />
        <path d="M5 9v11h14V9" />
        <path d="M9 20v-6h6v6" />
      </svg>
    );
  }

  if (name === "meals") {
    return (
      <svg {...commonProps}>
        <path d="M7 3v8" />
        <path d="M4.5 3v5A2.5 2.5 0 0 0 7 10.5 2.5 2.5 0 0 0 9.5 8V3" />
        <path d="M7 10.5V21" />
        <path d="M16 3v18" />
        <path d="M16 3c3 2 4 5 4 8h-4" />
      </svg>
    );
  }

  if (name === "grocery") {
    return (
      <svg {...commonProps}>
        <path d="M3 4h2l2.1 10.1a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.6L20 8H6" />
        <circle cx="9" cy="20" r="1" />
        <circle cx="17" cy="20" r="1" />
      </svg>
    );
  }

  if (name === "community") {
    return (
      <svg {...commonProps}>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.9" />
        <path d="M16 3.1a4 4 0 0 1 0 7.8" />
      </svg>
    );
  }

  if (name === "sparkle") {
    return (
      <svg {...commonProps}>
        <path d="m12 3 1.1 3.4a5 5 0 0 0 3.2 3.2l3.4 1.1-3.4 1.1a5 5 0 0 0-3.2 3.2L12 18.5 10.9 15a5 5 0 0 0-3.2-3.2l-3.4-1.1 3.4-1.1a5 5 0 0 0 3.2-3.2L12 3Z" />
        <path d="m19 17 .5 1.5L21 19l-1.5.5L19 21l-.5-1.5L17 19l1.5-.5L19 17Z" />
      </svg>
    );
  }

  return (
    <svg {...commonProps}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </svg>
  );
}

function AppNavLink({ item, mobile = false }) {
  return (
    <NavLink
      to={item.route}
      end={item.end}
      className={({ isActive }) =>
        `${mobile ? "mall-bottom-link" : "mall-side-link"}${isActive ? " is-active" : ""}`
      }
    >
      <span className="mall-nav-icon">
        <NavigationIcon name={item.icon} />
      </span>
      <span>{mobile ? item.shortLabel : item.label}</span>
    </NavLink>
  );
}

function getPageLabel(pathname) {
  if (pathname.includes("meal-planner")) return "Meal planning";
  if (pathname.includes("grocery-lab")) return "Grocery Lab";
  if (pathname.includes("community")) return "Community";
  if (pathname.includes("profile")) return "Profile";
  if (pathname.includes("fitness")) return "Fitness";
  if (pathname.includes("recipes")) return "Recipes";
  if (pathname.includes("stores")) return "Stores";
  return "Home";
}

export default function AppLayout() {
  const [conciergeOpen, setConciergeOpen] = useState(false);
  const [conciergeMin, setConciergeMin] = useState(false);
  const prefs = useMemo(() => getPrefsSafe(), []);
  const { pathname } = useLocation();
  const pageLabel = getPageLabel(pathname);

  const toggleConcierge = () => {
    setConciergeOpen((isOpen) => !isOpen);
    setConciergeMin(false);
  };

  return (
    <div className="mall-app-shell">
      <aside className="mall-sidebar" aria-label="Main navigation">
        <NavLink className="mall-side-brand" to="/app" aria-label="3C Mall home">
          <img src="/icons/3c-mall.png" alt="" />
          <span>
            <strong>3C Mall</strong>
            <small>Concierge · Cost · Community</small>
          </span>
        </NavLink>

        <nav className="mall-side-nav">
          <p className="mall-side-nav-label">Your mall</p>
          {NAV_ITEMS.map((item) => (
            <AppNavLink key={item.route} item={item} />
          ))}
        </nav>

        <div className="mall-side-support">
          <div className="mall-side-support-icon">
            <NavigationIcon name="sparkle" />
          </div>
          <strong>Need a little help?</strong>
          <p>Your concierge can guide you to the right next step.</p>
          <button type="button" onClick={toggleConcierge}>
            Ask the Concierge
          </button>
        </div>

        <p className="mall-developed-by">
          Developed by<br />
          <strong>Ell Vii’s Automations</strong>
        </p>
      </aside>

      <div className="mall-app-main">
        <header className="mall-mobile-header">
          <NavLink className="mall-mobile-brand" to="/app" aria-label="3C Mall home">
            <img src="/icons/3c-mall.png" alt="" />
            <span>
              <strong>3C Mall</strong>
              <small>{pageLabel}</small>
            </span>
          </NavLink>
          <button
            className="mall-mobile-concierge"
            type="button"
            onClick={toggleConcierge}
            aria-label="Open 3C Concierge"
          >
            <NavigationIcon name="sparkle" />
          </button>
        </header>

        <main className="mall-app-stage">
          <Outlet context={{ openConcierge: () => {
            setConciergeOpen(true);
            setConciergeMin(false);
          } }} />
        </main>
      </div>

      <nav className="mall-bottom-nav" aria-label="Main navigation">
        {NAV_ITEMS.map((item) => (
          <AppNavLink key={item.route} item={item} mobile />
        ))}
      </nav>

      {conciergeOpen && (
        <Suspense
          fallback={
            <button className="concierge-min" type="button" disabled>
              Loading concierge...
            </button>
          }
        >
          <ConciergeHub
            minimized={conciergeMin}
            onMinimize={() => setConciergeMin(true)}
            onExpand={() => setConciergeMin(false)}
            onClose={() => {
              setConciergeOpen(false);
              setConciergeMin(false);
            }}
            prefs={prefs}
          />
        </Suspense>
      )}
    </div>
  );
}
