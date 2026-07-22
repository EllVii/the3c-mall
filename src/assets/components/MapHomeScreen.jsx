import React, { useMemo, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { readJSON, writeJSON } from "../../utils/Storage";
import VideoIntro, { VIDEO_INTRO_SEEN_KEY } from "./VideoIntro.jsx";
import "./MapHomeScreen.css";

const PROFILE_KEY = "concierge.profile.v1";
const LAST_DESTINATION_KEY = "lastDestination.v1";
const WEEKLY_BUDGET_KEY = "grocery.weeklyBudget.v1";
const SAVINGS_HISTORY_KEY = "grocery.savingsHistory.v1";
const MEAL_HISTORY_KEY = "mp.history.v1";
const GROCERY_ITEMS_KEY = "grocery.items.v1";
const MEAL_ITEMS_KEY = "cart.mealItems.v1";
const PRICING_SUMMARY_KEY = "grocery.pricingSummary.v1";

const QUICK_ACTIONS = [
  {
    id: "meals",
    title: "Plan my meals",
    description: "Build meals and snacks around your schedule and preferences.",
    buttonLabel: "Start planning",
    route: "/app/meal-planner",
    icon: "meals",
    tone: "teal",
  },
  {
    id: "compare",
    title: "Compare grocery prices",
    description: "See store estimates together and understand the real value.",
    buttonLabel: "Compare stores",
    route: "/app/grocery-lab",
    icon: "compare",
    tone: "blue",
  },
  {
    id: "list",
    title: "Build my shopping list",
    description: "Organize meal items and everyday extras in one clear list.",
    buttonLabel: "Build my list",
    route: "/app/grocery-lab",
    icon: "list",
    tone: "gold",
  },
  {
    id: "concierge",
    title: "Ask the 3C Concierge",
    description: "Tell us what you need and get help choosing the next step.",
    buttonLabel: "Ask for help",
    icon: "sparkle",
    tone: "coral",
  },
];

function HomeIcon({ name }) {
  const props = {
    width: 28,
    height: 28,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.75,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };

  if (name === "meals") {
    return (
      <svg {...props}>
        <path d="M5 3v7a3 3 0 0 0 6 0V3" />
        <path d="M8 3v18" />
        <path d="M17 3v18" />
        <path d="M17 3c2.7 2.1 3.5 5.2 3.5 8H17" />
      </svg>
    );
  }

  if (name === "compare") {
    return (
      <svg {...props}>
        <path d="M7 3v18" />
        <path d="M17 3v18" />
        <path d="m3 7 4-4 4 4" />
        <path d="m13 17 4 4 4-4" />
      </svg>
    );
  }

  if (name === "list") {
    return (
      <svg {...props}>
        <path d="M9 6h11" />
        <path d="M9 12h11" />
        <path d="M9 18h11" />
        <path d="m3 6 1 1 2-2" />
        <path d="m3 12 1 1 2-2" />
        <path d="m3 18 1 1 2-2" />
      </svg>
    );
  }

  if (name === "wallet") {
    return (
      <svg {...props}>
        <path d="M4 6h14a2 2 0 0 1 2 2v10H4a2 2 0 0 1-2-2V6a3 3 0 0 1 3-3h12" />
        <path d="M20 11h-5a2 2 0 0 0 0 4h5" />
      </svg>
    );
  }

  if (name === "trend") {
    return (
      <svg {...props}>
        <path d="m3 17 6-6 4 4 8-8" />
        <path d="M15 7h6v6" />
      </svg>
    );
  }

  if (name === "arrow") {
    return (
      <svg {...props} width="20" height="20">
        <path d="M5 12h14" />
        <path d="m13 6 6 6-6 6" />
      </svg>
    );
  }

  if (name === "calendar") {
    return (
      <svg {...props}>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M16 3v4M8 3v4M3 10h18" />
      </svg>
    );
  }

  if (name === "bag") {
    return (
      <svg {...props}>
        <path d="M6 8h12l1 13H5L6 8Z" />
        <path d="M9 8a3 3 0 0 1 6 0" />
      </svg>
    );
  }

  return (
    <svg {...props}>
      <path d="m12 3 1.1 3.4a5 5 0 0 0 3.2 3.2l3.4 1.1-3.4 1.1a5 5 0 0 0-3.2 3.2L12 18.5 10.9 15a5 5 0 0 0-3.2-3.2l-3.4-1.1 3.4-1.1a5 5 0 0 0 3.2-3.2L12 3Z" />
      <path d="m19 17 .5 1.5L21 19l-1.5.5L19 21l-.5-1.5L17 19l1.5-.5L19 17Z" />
    </svg>
  );
}

function getTimeBasedGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function toMoney(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "$0.00";
  return amount.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });
}

function currentMonthKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function formatPlanDate(value) {
  if (!value) return "Date not selected";
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(date);
}

function latestByDate(items) {
  return [...items].sort((a, b) => {
    const aTime = new Date(a?.createdAt || a?.visitedAt || 0).getTime();
    const bTime = new Date(b?.createdAt || b?.visitedAt || 0).getTime();
    return bTime - aTime;
  })[0];
}

export default function MapHomeScreen() {
  const nav = useNavigate();
  const { openConcierge } = useOutletContext() || {};
  const [showVideoIntro, setShowVideoIntro] = useState(
    () => !readJSON(VIDEO_INTRO_SEEN_KEY, null),
  );
  const [budget, setBudget] = useState(() => {
    const saved = Number(readJSON(WEEKLY_BUDGET_KEY, 0));
    return Number.isFinite(saved) && saved > 0 ? saved : 0;
  });
  const [budgetDraft, setBudgetDraft] = useState(() => (budget ? String(budget) : ""));
  const [editingBudget, setEditingBudget] = useState(false);

  const snapshot = useMemo(() => {
    const profile = readJSON(PROFILE_KEY, null) || {};
    const savingsHistory = readJSON(SAVINGS_HISTORY_KEY, []);
    const mealHistory = readJSON(MEAL_HISTORY_KEY, []);
    const everydayItems = readJSON(GROCERY_ITEMS_KEY, []);
    const mealItems = readJSON(MEAL_ITEMS_KEY, []);
    const pricingSummary = readJSON(PRICING_SUMMARY_KEY, null);
    const lastDestination = readJSON(LAST_DESTINATION_KEY, null);
    const safeSavings = Array.isArray(savingsHistory) ? savingsHistory : [];
    const safeMeals = Array.isArray(mealHistory) ? mealHistory.filter((meal) => !meal?.hidden) : [];
    const itemCount = [everydayItems, mealItems].reduce(
      (total, list) => total + (Array.isArray(list) ? list.filter((item) => item?.name).length : 0),
      0,
    );
    const monthSavings = safeSavings
      .filter((entry) => entry?.monthKey === currentMonthKey())
      .reduce((total, entry) => total + Number(entry?.savings || 0), 0);

    return {
      firstName: String(profile?.firstName || "").trim(),
      mealHistory: safeMeals,
      latestMeal: latestByDate(safeMeals),
      itemCount,
      monthSavings,
      pricingSummary,
      lastDestination,
    };
  }, []);

  const recommendation = useMemo(() => {
    if (!snapshot.mealHistory.length) {
      return {
        eyebrow: "A simple place to begin",
        title: "Plan one meal for this week",
        text: "Choose a date, meal, and preferences. 3C Mall can carry the ingredients into your grocery list.",
        label: "Plan my first meal",
        route: "/app/meal-planner",
        icon: "calendar",
      };
    }

    if (!snapshot.itemCount) {
      return {
        eyebrow: "Your next step",
        title: "Turn your meal into a shopping list",
        text: "Your meal plan is ready. Add its ingredients and any household extras before comparing stores.",
        label: "Build my list",
        route: "/app/grocery-lab",
        icon: "list",
      };
    }

    if (!snapshot.pricingSummary) {
      return {
        eyebrow: "Your list is ready",
        title: "Compare your store options",
        text: `You have ${snapshot.itemCount} ${snapshot.itemCount === 1 ? "item" : "items"} ready to review in Grocery Lab.`,
        label: "Compare stores",
        route: "/app/grocery-lab",
        icon: "compare",
      };
    }

    return {
      eyebrow: "Ready when you are",
      title: `Review ${snapshot.pricingSummary.winnerStoreName || "your store plan"}`,
      text: "Your latest grocery comparison is saved. Check the details before you decide where to shop.",
      label: "Review comparison",
      route: "/app/grocery-lab",
      icon: "bag",
    };
  }, [snapshot]);

  function goTo(route, label) {
    writeJSON(LAST_DESTINATION_KEY, {
      label,
      route,
      visitedAt: new Date().toISOString(),
    });
    nav(route);
  }

  function handleQuickAction(action) {
    if (action.id === "concierge") {
      openConcierge?.();
      return;
    }
    goTo(action.route, action.title);
  }

  function saveBudget(event) {
    event.preventDefault();
    const nextBudget = Number(budgetDraft);
    if (!Number.isFinite(nextBudget) || nextBudget <= 0) return;
    setBudget(nextBudget);
    writeJSON(WEEKLY_BUDGET_KEY, nextBudget);
    setEditingBudget(false);
  }

  return (
    <>
      <VideoIntro
        open={showVideoIntro}
        onComplete={() => {
          writeJSON(VIDEO_INTRO_SEEN_KEY, true);
          setShowVideoIntro(false);
        }}
      />

      <div className="mall-home">
        <div className="mall-home-inner">
          <header className="mall-home-heading">
            <div>
              <p className="mall-home-overline">Your 3C Mall home</p>
              <h1>
                {getTimeBasedGreeting()}
                {snapshot.firstName ? `, ${snapshot.firstName}` : ""}.
              </h1>
              <p>What would you like help with today?</p>
            </div>
            <button
              className="mall-home-profile-button"
              type="button"
              onClick={() => nav("/app/profile")}
              aria-label="Open profile"
            >
              <span aria-hidden="true">
                {snapshot.firstName ? snapshot.firstName.charAt(0).toUpperCase() : "3C"}
              </span>
            </button>
          </header>

          <section className="mall-home-summary" aria-labelledby="week-summary-title">
            <div className="mall-home-summary-copy">
              <span className="mall-home-summary-badge">This week</span>
              <h2 id="week-summary-title">A clearer way to plan, compare, and shop.</h2>
              <p>
                Keep your meals, grocery list, and store choices connected—without jumping between different tools.
              </p>
            </div>

            <div className="mall-home-stats">
              <article className="mall-home-stat">
                <span className="mall-home-stat-icon is-gold"><HomeIcon name="wallet" /></span>
                <div>
                  <p>Weekly grocery budget</p>
                  {editingBudget ? (
                    <form className="mall-budget-form" onSubmit={saveBudget}>
                      <span>$</span>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={budgetDraft}
                        onChange={(event) => setBudgetDraft(event.target.value)}
                        aria-label="Weekly grocery budget"
                        autoFocus
                      />
                      <button type="submit">Save</button>
                    </form>
                  ) : (
                    <>
                      <strong>{budget ? toMoney(budget) : "Not set yet"}</strong>
                      <button className="mall-stat-link" type="button" onClick={() => setEditingBudget(true)}>
                        {budget ? "Update budget" : "Add budget"}
                      </button>
                    </>
                  )}
                </div>
              </article>

              <article className="mall-home-stat">
                <span className="mall-home-stat-icon is-teal"><HomeIcon name="trend" /></span>
                <div>
                  <p>Savings tracked this month</p>
                  <strong>{toMoney(snapshot.monthSavings)}</strong>
                  <span className="mall-stat-note">
                    {snapshot.monthSavings > 0 ? "From completed comparisons" : "Complete a comparison to begin"}
                  </span>
                </div>
              </article>
            </div>
          </section>

          <section className="mall-home-section" aria-labelledby="quick-actions-title">
            <div className="mall-section-heading">
              <div>
                <p>Choose a destination</p>
                <h2 id="quick-actions-title">How can 3C Mall help?</h2>
              </div>
              <span>One clear step at a time</span>
            </div>

            <div className="mall-action-grid">
              {QUICK_ACTIONS.map((action) => (
                <article className="mall-action-card" key={action.id}>
                  <span className={`mall-action-icon is-${action.tone}`}>
                    <HomeIcon name={action.icon} />
                  </span>
                  <div>
                    <h3>{action.title}</h3>
                    <p>{action.description}</p>
                  </div>
                  <button type="button" onClick={() => handleQuickAction(action)}>
                    <span>{action.buttonLabel}</span>
                    <HomeIcon name="arrow" />
                  </button>
                </article>
              ))}
            </div>
          </section>

          <div className="mall-home-lower-grid">
            <section className="mall-next-card" aria-labelledby="next-step-title">
              <div className="mall-next-icon">
                <HomeIcon name={recommendation.icon} />
              </div>
              <div className="mall-next-copy">
                <p>{recommendation.eyebrow}</p>
                <h2 id="next-step-title">{recommendation.title}</h2>
                <span>{recommendation.text}</span>
              </div>
              <button
                type="button"
                onClick={() => goTo(recommendation.route, recommendation.title)}
              >
                {recommendation.label}
                <HomeIcon name="arrow" />
              </button>
            </section>

            <section className="mall-recent-card" aria-labelledby="recent-title">
              <div className="mall-recent-heading">
                <div>
                  <p>Your activity</p>
                  <h2 id="recent-title">Saved for you</h2>
                </div>
                {snapshot.lastDestination?.route && (
                  <button
                    type="button"
                    onClick={() => nav(snapshot.lastDestination.route)}
                  >
                    Continue
                  </button>
                )}
              </div>

              <div className="mall-recent-list">
                <button type="button" onClick={() => nav("/app/meal-planner")}>
                  <span className="mall-recent-icon"><HomeIcon name="calendar" /></span>
                  <span>
                    <strong>{snapshot.latestMeal?.mealLabel || "Meal plans"}</strong>
                    <small>
                      {snapshot.latestMeal
                        ? `${formatPlanDate(snapshot.latestMeal.dateISO)} · ${snapshot.latestMeal.recipe?.name || "Saved meal"}`
                        : "Your saved meals will appear here"}
                    </small>
                  </span>
                  <HomeIcon name="arrow" />
                </button>

                <button type="button" onClick={() => nav("/app/grocery-lab")}>
                  <span className="mall-recent-icon"><HomeIcon name="bag" /></span>
                  <span>
                    <strong>Shopping list</strong>
                    <small>
                      {snapshot.itemCount
                        ? `${snapshot.itemCount} ${snapshot.itemCount === 1 ? "item" : "items"} ready`
                        : "Add items when you are ready"}
                    </small>
                  </span>
                  <HomeIcon name="arrow" />
                </button>
              </div>
            </section>
          </div>

          <footer className="mall-home-footer">
            <span>3C Mall · Concierge · Cost · Community</span>
            <span>Developed by Ell Vii’s Automations</span>
          </footer>
        </div>
      </div>
    </>
  );
}
