// src/App.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Alpha helper (safe)
import AlphaRouteChip from "./assets/components/AlphaRouteChip.jsx";

// Layouts
import SiteLayout from "./assets/components/layouts/SiteLayout.jsx";
import AppLayout from "./assets/components/layouts/AppLayout.jsx";

// Public pages
import LandingPage from "./pages/LandingPage.jsx";
import Features from "./pages/Features.jsx";
import Pricing from "./pages/Pricing.jsx";
import Login from "./pages/Login.jsx";
import Cancel from "./pages/Cancel.jsx";
import CommentLimitModal from "./pages/CommentLimitModal.jsx";

// App pages
import DashboardPage from "./pages/DashboardPage.jsx";
import MealPlannerPage from "./pages/MealPlannerPage.jsx";
import GroceryLabPage from "./pages/GroceryLabPage.jsx";
import ComingSoon from "./pages/ComingSoon.jsx";
import PTModePage from "./pages/PTModePage.jsx";
import SettingsPage from "./pages/SettingsPage.jsx";

// Recipe Center Pages
import RecipesPage from "./pages/RecipesPage.jsx";
import RecipeDetailPage from "./pages/RecipeDetailPage.jsx";

export default function App() {
  // Optional “bypass” toggle:
  // - set VITE_ALPHA_CHIP=0 to hide it (production / demos)
  // - set VITE_ALPHA_CHIP=1 to show it (alpha)
  const showAlphaChip = import.meta.env.VITE_ALPHA_CHIP !== "0";

  return (
    <div className="app-shell">
      {showAlphaChip && <AlphaRouteChip />}

      <Routes>
        {/* PUBLIC SITE */}
        <Route element={<SiteLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/features" element={<Features />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cancel" element={<Cancel />} />
          <Route path="/comment-limit" element={<CommentLimitModal />} />
        </Route>

        {/* PRIVATE APP AREA */}
        <Route path="/app" element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="meal-plans" element={<MealPlannerPage />} />
          <Route path="grocery-lab" element={<GroceryLabPage />} />
          <Route path="pt" element={<PTModePage />} />
          <Route path="settings" element={<SettingsPage />} />

          {/* Recipes */}
          <Route path="recipes" element={<RecipesPage />} />
          <Route path="recipes/:id" element={<RecipeDetailPage />} />

          <Route path="coming-soon" element={<ComingSoon />} />

          {/* keep broken /app links inside app */}
          <Route path="*" element={<Navigate to="/app" replace />} />
        </Route>

        {/* GLOBAL CATCH-ALL */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
